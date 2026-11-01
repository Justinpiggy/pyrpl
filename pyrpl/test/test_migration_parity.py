"""Regression coverage for the 2026-11-01 migration parity review."""
import asyncio
import json
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
import yaml

from pyrpl_websocket.app import create_app
from pyrpl_websocket.asg_registers import ASG_ADDR_BASE
from pyrpl_websocket.config import WebConfig
from pyrpl_websocket.dsp_registers import dsp_addr_base, filter_register_to_python, sync_iir_settings
from pyrpl_websocket.measurements import ScopeAverage, SpectrumAverage, resize_scope_frame, spectrum_average_bytes
from pyrpl_websocket.modules import SPECTRUM_WINDOWS, SpectrumAnalyzerSettings
from pyrpl_websocket.network_analyzer import select_rbw
from pyrpl_websocket.scope import ScopeFrame, make_scope_frame
from pyrpl_websocket.session import WebSession, _spectrum_window
from pyrpl_websocket.settings import ServerSettings
from test_pyrpl_websocket_app import SimulatedHardwareScopeClient


class MigrationParityTest(unittest.TestCase):
    def session(self, **kwargs):
        session = WebSession(ServerSettings(hostname="_FAKE_", **kwargs))
        self.addCleanup(session.close)
        return session

    def test_setup_preserves_legacy_keys_and_iir_master_lists(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.yml"
            path.write_text(yaml.safe_dump({"asg0": {"bursts": 7}, "iir": {"zeros": [-100], "poles": [-1000], "gain": 0.5}}))
            session = self.session(config=str(path))
            self.assertEqual(session.iir_settings.real_poles, [-1000])
            session.set_module_attribute("asg0", "amplitude", 0.25)
            session.set_module_attribute("iir", "real_poles", [-2000])
            saved = yaml.safe_load(path.read_text())
            self.assertEqual(saved["asg0"]["bursts"], 7)
            self.assertEqual(saved["iir"]["poles"], ["-2000.0"])
            second = self.session(config=str(path))
            self.assertEqual(second.iir_settings.real_poles, [-2000])

    def test_restore_runs_trigger_and_iq_setup_once_and_respects_owner(self):
        session = self.session()
        session.save_module_state("trig", "armed")
        session.trig_settings.armed = False
        session.load_module_state("trig", "armed")
        self.assertTrue(session.module_state("trig")["armed"])
        session.save_module_state("iq0", "phase")
        with mock.patch("pyrpl_websocket.dsp_registers.sync_iq_phases") as sync:
            session.load_module_state("iq0", "phase")
            sync.assert_called_once_with(session.client, "iq0")
        session._reserve_module_no_lock("iq0", "networkanalyzer")
        with self.assertRaisesRegex(ValueError, "occupied"):
            session.load_module_state("iq0", "phase")

    def test_owned_yaml_branch_cannot_write_hardware_or_disk(self):
        with tempfile.TemporaryDirectory() as directory:
            session = self.session(config=str(Path(directory) / "config.yml"))
            session._reserve_module_no_lock("scope", "spectrumanalyzer")
            before = session.config.path.read_text()
            with self.assertRaisesRegex(ValueError, "occupied"):
                session.save_config_branch("scope", "input1: out1")
            self.assertEqual(session.config.path.read_text(), before)

    def test_lockbox_persists_setup_calibration_sequence_and_saved_state(self):
        with tempfile.TemporaryDirectory() as directory:
            path = str(Path(directory) / "config.yml")
            session = self.session(config=path)
            session.set_lockbox_attribute("is_locked_threshold", 3.5)
            input_name = next(iter(session.lockbox.inputs))
            output_name = next(iter(session.lockbox.outputs))
            session.lockbox.inputs[input_name].calibration.analog_offset = 0.125
            session.append_lockbox_stage()
            session.set_lockbox_stage_attribute(1, "duration", 0.75)
            session.set_lockbox_stage_output_attribute(1, output_name, "offset", 0.25)
            session.save_module_state("lockbox", "calibrated")
            second = self.session(config=path)
            self.assertEqual(second.lockbox.is_locked_threshold, 3.5)
            self.assertEqual(second.lockbox.inputs[input_name].calibration.analog_offset, 0.125)
            self.assertEqual(second.lockbox.sequence[1].duration, 0.75)
            self.assertEqual(second.lockbox.sequence[1].outputs[output_name].offset, 0.25)
            second.set_lockbox_attribute("is_locked_threshold", 1)
            second.load_module_state("lockbox", "calibrated")
            self.assertEqual(second.lockbox.is_locked_threshold, 3.5)

    def test_filter_chooses_nearest_and_reports_actual_cutoff(self):
        session = self.session()
        cutoff = session.set_module_attribute("pid0", "inputfilter", [1e6])
        self.assertAlmostEqual(cutoff[0], 656885.0955548416)
        word = session.client.fpgamemory[dsp_addr_base("pid0") + 0x120]
        self.assertEqual(cutoff, filter_register_to_python(word, stages=4, shiftbits=5, minbw=10))

    def test_lockbox_offset_filter_iir_and_units_reach_registers(self):
        session = self.session()
        output_name = next(iter(session.lockbox.outputs))
        input_name = next(iter(session.lockbox.inputs))
        output = session.lockbox.outputs[output_name]
        base = dsp_addr_base(output.pid)
        session.client.fpgamemory[base + 0x100] = 6144
        session.call_lockbox_action("unlock")
        self.assertEqual(session.client.fpgamemory[base + 0x100], 0)
        session.set_lockbox_output_attribute(output_name, "additional_filter", [1e6])
        self.assertAlmostEqual(output.additional_filter[0], 656885.0955548416)
        output.unit = "mV/V"
        output.dc_gain = 1.0
        output.p = 0.1
        output.i = 0.0
        output.extra_module = "iir"
        session.iir_settings.gain = 2.0
        with mock.patch.object(session, "_lockbox_expected_slope_no_lock", return_value=1):
            session._lock_one_lockbox_output_no_lock(output_name, input_name, 0, 0.25, 1)
        self.assertEqual(session.pid_settings[output.pid].input, "iir")
        self.assertAlmostEqual(session.pid_settings[output.pid].p, 50.0)
        self.assertEqual(session.client.fpgamemory[base + 0x100], 2048)
        self.assertEqual(session.module_owners["iir"], "lockbox")

    def test_long_trigger_is_polled_without_rearming(self):
        session = self.session()
        client = SimulatedHardwareScopeClient()
        session.client = client
        session.scope_settings.duration = 0.001
        session.scope_settings.rolling_mode = False
        session.call_module_action("scope", "single")
        with mock.patch("pyrpl_websocket.session.time.monotonic", return_value=0):
            self.assertIsNone(session.acquire_scope_frame(0, 8).frame)
        client.fpgamemory[0x40100000] = 4  # post-trigger delay still running
        with mock.patch("pyrpl_websocket.session.time.monotonic", return_value=10):
            for _ in range(4):
                self.assertIsNone(session.acquire_scope_frame(0, 8).frame)
            self.assertEqual(client.capture_id, 1)
            client.fpgamemory[0x40100000] = 0
            self.assertIsNotNone(session.acquire_scope_frame(0, 8).frame)
        self.assertEqual(session.scope_settings.running_state, "paused_single")

    def test_spectrum_disables_rolling(self):
        session = self.session()
        session.scope_settings.rolling_mode = True
        session.set_module_attribute("spectrumanalyzer", "span", 1000)
        session.call_module_action("spectrumanalyzer", "continuous")
        self.assertFalse(session.scope_settings.rolling_mode)

    def test_network_bandwidth_restart_and_pause_resume(self):
        session = self.session()
        for name, value in {"start_freq": 1e3, "stop_freq": 1e6, "rbw": 10000, "q_factor_min": 10, "auto_bandwidth": True}.items():
            session.set_module_attribute("networkanalyzer", name, value)
        session.set_module_attribute("networkanalyzer", "run_continuous", True)
        run = session.network_analyzer_run
        settings = session.network_analyzer_settings
        self.assertGreater(select_rbw(settings, 1e6, run.bandwidth_options), select_rbw(settings, 1e3, run.bandwidth_options))
        run_id = run.run_id
        session.set_module_attribute("networkanalyzer", "stop_freq", 2e6)
        self.assertGreater(run.run_id, run_id)
        self.assertEqual(settings.running_state, "running_continuous")
        session.acquire_network_analyzer_point()
        point = run.current_point
        session.call_module_action("networkanalyzer", "pause")
        self.assertIsNone(session.acquire_network_analyzer_point())
        self.assertEqual(session.iq_settings[settings.iq_module].amplitude, 0)
        session.call_module_action("networkanalyzer", "resume")
        self.assertEqual(run.current_point, point)
        self.assertGreater(session.iq_settings[settings.iq_module].amplitude, 0)

    def test_asg_off_trigger_noise_and_periodic_phase(self):
        session = self.session()
        session.set_module_attribute("asg0", "waveform", "noise")
        self.assertTrue(session.client.fpgamemory[ASG_ADDR_BASE] & (1 << 12))
        session.set_module_attribute("asg0", "waveform", "sin")
        self.assertFalse(session.client.fpgamemory[ASG_ADDR_BASE] & (1 << 12))
        session.call_module_action("asg0", "off")
        session.call_module_action("asg0", "trigger")
        self.assertFalse(session.client.fpgamemory[ASG_ADDR_BASE] & (1 << 7))
        self.assertTrue(any(session.client.fpgamemory.get(ASG_ADDR_BASE + 0x10000 + i * 4) for i in range(32)))

    def test_live_status_and_absent_iir_capability(self):
        session = self.session()
        session.client.fpgamemory[dsp_addr_base("pid0") + 0x100] = 2048
        session.client.fpgamemory[dsp_addr_base("trig") + 0x100] = 0
        session.trig_settings.armed = True
        self.assertEqual(session.module_state("pid0")["ival"], 0.25)
        self.assertFalse(session.module_state("trig")["armed"])
        session.client.fpgamemory[dsp_addr_base("iir") + 0x208] = 0
        with mock.patch.object(session.client, "writes", wraps=session.client.writes) as writes:
            with self.assertRaisesRegex(RuntimeError, "IIR coefficient stages"):
                sync_iir_settings(session.client, session.iir_settings)
            self.assertFalse(any(call.args[0] >= dsp_addr_base("iir") + 0x8000 for call in writes.call_args_list))

    def test_frequency_calibration_and_logical_inputs(self):
        session = self.session(frequency_correction=1.0001)
        session.set_module_attribute("asg0", "frequency", 2e6)
        self.assertEqual(session.client.fpgamemory[ASG_ADDR_BASE + 0x10], round(2e6 / 1.0001 / 125e6 * 2**30))
        session.set_module_attribute("iq0", "frequency", 2e6)
        self.assertEqual(session.client.fpgamemory[dsp_addr_base("iq0") + 0x108], round(2e6 / 1.0001 / 125e6 * 2**32))
        name = next(iter(session.lockbox.inputs))
        session.lockbox.inputs[name].input_signal = "in2"
        signal = f"lockbox.inputs.{name}"
        session.set_module_attribute("scope", "input1", signal)
        self.assertEqual(session.scope_settings.input1, signal)
        self.assertEqual(session.client.fpgamemory[0x40380000], 11)
        options = next(a["options"] for a in session.module_attributes("scope") if a["name"] == "input1")
        self.assertIn(signal, options)

    def test_acquisition_without_viewers_and_replay(self):
        async def scenario():
            app = create_app(ServerSettings(hostname="_FAKE_", scope_interval=0.001))
            async with app.router.lifespan_context(app):
                session = app.state.session
                session.set_module_attribute("scope", "rolling_mode", False)
                session.set_module_attribute("scope", "trace_average", 2)
                session.call_module_action("scope", "single")
                for _ in range(200):
                    if session.scope_settings.running_state == "paused_single":
                        break
                    await asyncio.sleep(0.01)
                self.assertEqual(session.scope_settings.current_avg, 2)
                self.assertEqual(len(app.state.scope_streams), 1)
                fanout = next(iter(app.state.scope_streams.values()))
                left, right = fanout.subscribe(), fanout.subscribe()
                first, second = left.get_nowait(), right.get_nowait()
                self.assertEqual(first.payload, second.payload)
                small = ScopeFrame.from_bytes(resize_scope_frame(first, 256))
                np.testing.assert_array_equal(small.samples(), first.samples()[np.arange(256) * 64])
                session.set_module_attribute("networkanalyzer", "points", 3)
                session.call_module_action("networkanalyzer", "single")
                for _ in range(200):
                    if len(app.state.network_points) == 3:
                        break
                    await asyncio.sleep(0.01)
                queue = app.state.network_analyzer_stream.subscribe()
                self.assertEqual(len(queue.get_nowait()["snapshot"]), 3)
        asyncio.run(scenario())

    def test_shared_correlations_equal_average_padded_fft_for_every_window(self):
        rng = np.random.default_rng(123)
        samples = [rng.normal(size=(64, 2)) for _ in range(3)]
        frames = [make_scope_frame(i, x[:, 0], x[:, 1]) for i, x in enumerate(samples)]
        for baseband in (True, False):
            settings = SpectrumAnalyzerSettings(baseband=baseband, trace_average=3)
            average = SpectrumAverage()
            for frame in frames:
                snapshot = average.add(frame, 1, settings)
            self.assertTrue(spectrum_average_bytes(snapshot, "blackman").startswith(b"PWA1"))
            for window in SPECTRUM_WINDOWS:
                corr = average.correlations[window]
                padded = np.zeros((len(corr), 1024))
                padded[:, :64], padded[:, -64:] = corr[:, :64], corr[:, 64:]
                weights = _spectrum_window(window, 64)
                if baseband:
                    fft = [np.fft.rfft(f.samples().astype(np.float64) * weights[:, None], n=1024, axis=0) for f in frames]
                    expected = np.mean([abs(f[:, 0]) ** 2 for f in fft], axis=0)
                    np.testing.assert_allclose(np.fft.rfft(padded[0]).real, expected, atol=1e-12)
                    cross = np.mean([f[:, 0].conj() * f[:, 1] for f in fft], axis=0)
                    np.testing.assert_allclose(np.fft.rfft(padded[2]).real, cross.real, atol=1e-12)
                    np.testing.assert_allclose(np.fft.rfft(padded[3]).imag, cross.imag, atol=1e-12)
                else:
                    expected = np.mean([abs(np.fft.fft((f.samples()[:, 0].astype(np.float64) + 1j*f.samples()[:, 1].astype(np.float64))*weights, n=1024))**2 for f in frames], axis=0)
                    np.testing.assert_allclose(np.fft.fft(padded[0] + 1j*padded[1]).real, expected, atol=1e-7)


if __name__ == "__main__":
    unittest.main()
