import asyncio
import tempfile
import unittest
from pathlib import Path

import numpy as np

from pyrpl_websocket.app import create_app, handle_control_message
from pyrpl_websocket.asg_registers import ASG_ADDR_BASE, ASG_DATA_LENGTH
from pyrpl_websocket.assets import asset_info
from pyrpl_websocket.dsp_registers import dsp_addr_base, float_to_register, frequency_to_register, phase_to_register, pwm_addr_base
from pyrpl_websocket.events import EventBroker
from pyrpl_websocket.hk_registers import (
    HK_LED_ADDR,
    HK_N_DIRECTION_ADDR,
    HK_N_READ_ADDR,
    HK_N_WRITE_ADDR,
    HK_P_DIRECTION_ADDR,
    HK_P_READ_ADDR,
    HK_P_WRITE_ADDR,
)
from pyrpl_websocket.lockbox import LockboxSchemaLibrary, LockboxState
from pyrpl_websocket.monitor_client import MonitorStats
from pyrpl_websocket.scope import SCOPE_ADDR_BASE, SCOPE_CH1_OFFSET, SCOPE_CH2_OFFSET, SCOPE_DATA_LENGTH
from pyrpl_websocket.session import WebSession
from pyrpl_websocket.settings import ServerSettings


class SimulatedHardwareScopeClient:
    """Non-Dummy scope client that behaves like a fresh FPGA capture per arm."""

    def __init__(self):
        self.stats = MonitorStats()
        self.fpgamemory = {
            SCOPE_ADDR_BASE + 0x0: 0,
            SCOPE_ADDR_BASE + 0x10: SCOPE_DATA_LENGTH,
            SCOPE_ADDR_BASE + 0x18: 0,
            SCOPE_ADDR_BASE + 0x1C: 3,
        }
        self.capture_id = 0

    def reads(self, addr: int, length: int):
        self.stats.reads += 1
        if SCOPE_ADDR_BASE + SCOPE_CH1_OFFSET <= addr < SCOPE_ADDR_BASE + SCOPE_CH2_OFFSET:
            return self._scope_words(addr, length, channel=0)
        if SCOPE_ADDR_BASE + SCOPE_CH2_OFFSET <= addr < SCOPE_ADDR_BASE + 0x30000:
            return self._scope_words(addr, length, channel=1)
        return np.array([self.fpgamemory.get(addr + index * 4, 0) for index in range(length)], dtype=np.uint32)

    def writes(self, addr: int, values):
        self.stats.writes += 1
        for index, value in enumerate(values):
            word_addr = addr + index * 4
            self.fpgamemory[word_addr] = int(value) & 0xFFFFFFFF
            if word_addr == SCOPE_ADDR_BASE + 0x4 and self.fpgamemory.get(SCOPE_ADDR_BASE + 0x0, 0) & 1:
                self.capture_id += 1
                self.fpgamemory[SCOPE_ADDR_BASE + 0x0] = 0
                self.fpgamemory[SCOPE_ADDR_BASE + 0x1C] = 3
        return True

    def close(self):
        return None

    def _scope_words(self, addr: int, length: int, channel: int):
        start = ((addr & 0xFFFF) // 4) & 0x3FFF
        values = []
        for index in range(length):
            raw = (self.capture_id * 100 + channel * 10 + start + index) % 4096
            values.append(raw)
        return np.array(values, dtype=np.uint32)


class SimulatedRollingHardwareScopeClient(SimulatedHardwareScopeClient):
    """Hardware client with an advancing current write pointer."""

    def __init__(self):
        super().__init__()
        self.pointer_reads = [4, 7, 8, 10]
        self.rolling_starts = 0

    def reads(self, addr: int, length: int):
        if addr == SCOPE_ADDR_BASE + 0x18 and length == 1 and self.pointer_reads:
            self.stats.reads += 1
            return np.array([self.pointer_reads.pop(0)], dtype=np.uint32)
        return super().reads(addr, length)

    def writes(self, addr: int, values):
        if addr == SCOPE_ADDR_BASE + 0x4 and list(values) == [0]:
            self.rolling_starts += 1
        return super().writes(addr, values)


class WebAppTest(unittest.TestCase):
    def test_app_exposes_expected_routes(self):
        app = create_app(ServerSettings(hostname="_FAKE_"))
        paths = {route.path for route in app.routes}
        self.assertIn("/", paths)
        self.assertIn("/api/health", paths)
        self.assertIn("/api/session", paths)
        self.assertIn("/api/assets", paths)
        self.assertIn("/api/register/read", paths)
        self.assertIn("/api/register/write", paths)
        self.assertIn("/api/scope/frame", paths)
        self.assertIn("/api/modules", paths)
        self.assertIn("/api/modules/{module_name}", paths)
        self.assertIn("/api/modules/{module_name}/attributes", paths)
        self.assertIn("/api/modules/{module_name}/attributes/{attribute}", paths)
        self.assertIn("/api/modules/{module_name}/actions", paths)
        self.assertIn("/api/modules/{module_name}/actions/{action}", paths)
        self.assertIn("/api/modules/{module_name}/states", paths)
        self.assertIn("/api/modules/{module_name}/states/{state_name}/save", paths)
        self.assertIn("/api/modules/{module_name}/states/{state_name}/load", paths)
        self.assertIn("/api/modules/{module_name}/states/{state_name}", paths)
        self.assertIn("/api/lockbox", paths)
        self.assertIn("/api/lockbox/classes", paths)
        self.assertIn("/api/lockbox/class", paths)
        self.assertIn("/api/lockbox/stages", paths)
        self.assertIn("/api/lockbox/stages/{index}", paths)
        self.assertIn("/api/lockbox/inputs/{input_name}/plot", paths)
        self.assertIn("/api/lockbox/outputs/{output_name}/transfer_function", paths)
        self.assertIn("/ws/control", paths)
        self.assertIn("/ws/scope", paths)

    def test_asset_info_finds_copied_monitor_server_assets(self):
        assets = asset_info()
        self.assertTrue(assets["exists"]["fpga"])
        self.assertTrue(assets["exists"]["monitor_server"])
        self.assertTrue(assets["exists"]["monitor_server_c"])

    def test_session_register_write_then_read(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            self.assertTrue(session.write_registers(1234, [5, 6]))
            self.assertEqual(session.read_registers(1234, 2), [5, 6])
        finally:
            session.close()

    def test_session_lockbox_schema_class_switch_and_stages(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            classes = {entry["name"] for entry in session.lockbox_classes()}
            self.assertIn("Linear", classes)
            self.assertIn("FabryPerot", classes)

            schema = session.lockbox_schema()
            self.assertEqual(schema["classname"], "Linear")
            self.assertEqual(len(schema["sequence"]), 1)
            self.assertEqual([item["name"] for item in schema["inputs"]], ["input_from_output"])

            switched = session.set_lockbox_class("Interferometer")
            self.assertEqual(switched["classname"], "Interferometer")
            self.assertEqual([item["name"] for item in switched["inputs"]], ["port1", "port2"])
            self.assertEqual([item["name"] for item in switched["outputs"]], ["piezo"])

            fabry = session.set_lockbox_class("FabryPerot")
            self.assertEqual([item["name"] for item in fabry["inputs"]], ["transmission", "reflection", "pdh"])
            pdh_controls = {attribute["name"] for attribute in fabry["inputs"][2]["attributes"]}
            self.assertIn("mod_freq", pdh_controls)
            self.assertIn("mod_amp", pdh_controls)
            self.assertIn("mod_phase", pdh_controls)
            self.assertIn("mod_output", pdh_controls)
            self.assertIn("bandwidth", pdh_controls)
            self.assertIn("quadrature_factor", pdh_controls)
            high_finesse = session.set_lockbox_class("HighFinesseFabryPerot")
            self.assertEqual([item["name"] for item in high_finesse["inputs"]], ["transmission", "reflection", "pdh"])
            high_finesse_pdh_controls = {attribute["name"] for attribute in high_finesse["inputs"][2]["attributes"]}
            self.assertIn("mod_freq", high_finesse_pdh_controls)

            custom = session.set_lockbox_class("CustomLockbox")
            self.assertEqual([item["name"] for item in custom["inputs"]], ["custom_input_name1", "custom_input_name2"])
            custom_controls = {attribute["name"] for attribute in custom["inputs"][0]["attributes"]}
            self.assertIn("custom_gain_attribute", custom_controls)

            appended = session.append_lockbox_stage()
            self.assertEqual(len(appended["sequence"]), 2)
            edited = session.set_lockbox_stage_attribute(1, "setpoint", 0.25)
            setpoint = next(
                attribute["value"]
                for attribute in edited["sequence"][1]["attributes"]
                if attribute["name"] == "setpoint"
            )
            self.assertEqual(setpoint, 0.25)
            deleted = session.delete_lockbox_stage(0)
            self.assertEqual(len(deleted["sequence"]), 1)
        finally:
            session.close()

    def test_session_lockbox_static_plots_have_data(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_lockbox_class("Interferometer")
            input_plot = session.lockbox_input_plot("port1", points=64)
            self.assertEqual(len(input_plot["x"]), 64)
            self.assertEqual(len(input_plot["series"][0]["values"]), 64)
            self.assertGreater(max(input_plot["series"][0]["values"]), min(input_plot["series"][0]["values"]))

            transfer = session.lockbox_output_transfer_function("piezo", points=32)
            self.assertEqual(len(transfer["x"]), 32)
            self.assertEqual(len(transfer["series"]), 2)
            self.assertEqual(len(transfer["series"][0]["values"]), 32)
        finally:
            session.close()

    def test_session_lockbox_pdh_input_configures_iq_immediately(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            schema = session.set_lockbox_class("FabryPerot")
            pdh = next(item for item in schema["inputs"] if item["name"] == "pdh")
            self.assertEqual(pdh["iq_module"], "iq0")

            session.set_lockbox_input_attribute("pdh", "input_signal", "in2")
            session.set_lockbox_input_attribute("pdh", "mod_freq", 2.5e6)
            session.set_lockbox_input_attribute("pdh", "mod_amp", 0.2)
            session.set_lockbox_input_attribute("pdh", "mod_phase", 45.0)
            session.set_lockbox_input_attribute("pdh", "mod_output", "out2")
            session.set_lockbox_input_attribute("pdh", "quadrature_factor", 3.0)

            iq = session.iq_settings["iq0"]
            self.assertEqual(session.module_state("iq0")["owner"], "lockbox")
            self.assertEqual(iq.input, "in2")
            self.assertEqual(iq.frequency, 2.5e6)
            self.assertEqual(iq.amplitude, 0.2)
            self.assertEqual(iq.phase, 45.0)
            self.assertEqual(iq.output_direct, "out2")
            self.assertEqual(iq.output_signal, "quadrature")
            self.assertEqual(iq.gain, 0.0)
            self.assertEqual(iq.quadrature_factor, 3.0)
            self.assertTrue(iq.on)

            session.set_lockbox_stage_attribute(0, "input", "pdh")
            session.set_lockbox_stage_output_attribute(0, "piezo", "lock_on", True)
            session.call_lockbox_action("lock")
            self.assertEqual(session.pid_settings["pid0"].input, "iq0")
        finally:
            session.close()

    def test_lockbox_schema_discovers_user_model_controls(self):
        with tempfile.TemporaryDirectory() as dirname:
            user_lockbox_dir = Path(dirname) / "lockbox"
            user_lockbox_dir.mkdir()
            (user_lockbox_dir / "user_model.py").write_text(
                "\n".join(
                    [
                        "from pyrpl.software_modules.lockbox import *",
                        "",
                        "class UserDynamicInput(InputSignal):",
                        "    _gui_attributes = ['user_gain']",
                        "    _setup_attributes = _gui_attributes",
                        "    user_gain = FloatProperty(default=2.5, min=-10, max=10, increment=0.5)",
                        "    def expected_signal(self, variable):",
                        "        return self.user_gain * variable",
                        "",
                        "class UserDynamicLockbox(Lockbox):",
                        "    inputs = LockboxModuleDictProperty(sensor=UserDynamicInput)",
                        "    outputs = LockboxModuleDictProperty(actuator=OutputSignal)",
                        "    _gui_attributes = ['user_offset']",
                        "    _setup_attributes = _gui_attributes",
                        "    user_offset = FloatProperty(default=1.25, min=-5, max=5)",
                    ]
                ),
                encoding="utf-8",
            )
            library = LockboxSchemaLibrary(user_lockbox_dir=user_lockbox_dir)
            state = LockboxState("UserDynamicLockbox", library=library)
            schema = state.schema()
            self.assertEqual([item["name"] for item in schema["inputs"]], ["sensor"])
            self.assertEqual([item["name"] for item in schema["outputs"]], ["actuator"])
            self.assertIn("user_offset", {attribute["name"] for attribute in schema["attributes"]})
            self.assertIn("user_gain", {attribute["name"] for attribute in schema["inputs"][0]["attributes"]})

    def test_session_lockbox_actions_configure_resources_and_pid(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_lockbox_stage_output_attribute(0, "output1", "lock_on", True)
            locked = session.call_lockbox_action("lock")
            self.assertEqual(locked["state"]["current_state"], "lock_on")
            self.assertEqual(session.module_state("pid0")["owner"], "lockbox")
            self.assertEqual(session.pid_settings["pid0"].input, "in1")
            self.assertEqual(session.pid_settings["pid0"].setpoint, 0.0)
            self.assertNotEqual(session.pid_settings["pid0"].p, 0.0)
            self.assertNotEqual(session.pid_settings["pid0"].i, 0.0)

            unlocked = session.call_lockbox_action("unlock")
            self.assertEqual(unlocked["state"]["current_state"], "unlock")
            self.assertIsNone(session.module_state("pid0")["owner"])
            self.assertEqual(session.pid_settings["pid0"].p, 0.0)
            self.assertEqual(session.pid_settings["pid0"].i, 0.0)

            swept = session.call_lockbox_action("sweep")
            self.assertEqual(swept["state"]["current_state"], "sweep")
            self.assertEqual(session.module_state("pid0")["owner"], "lockbox")
            self.assertEqual(session.module_state("asg0")["owner"], "lockbox")
            self.assertEqual(session.pid_settings["pid0"].input, "asg0")
            self.assertEqual(session.asg_settings["asg0"].waveform, "ramp")
        finally:
            session.close()

    def test_session_lockbox_lock_and_sweep_do_not_stop_scope_or_spectrum(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.call_module_action("scope", "continuous")
            session.set_lockbox_stage_output_attribute(0, "output1", "lock_on", True)
            session.call_lockbox_action("lock")
            self.assertEqual(session.scope_settings.running_state, "running_continuous")

            session.call_lockbox_action("unlock")
            session.call_module_action("scope", "continuous")
            session.call_lockbox_action("sweep")
            self.assertEqual(session.scope_settings.running_state, "running_continuous")

            session.call_lockbox_action("unlock")
            session.call_module_action("spectrumanalyzer", "continuous")
            self.assertEqual(session.spectrum_settings.running_state, "running_continuous")
            session.call_lockbox_action("lock")
            self.assertEqual(session.spectrum_settings.running_state, "running_continuous")
            self.assertEqual(session.module_state("scope")["owner"], "spectrumanalyzer")
        finally:
            session.close()

    def test_hardware_lockbox_calibration_temporarily_uses_scope_without_stopping_stream_state(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.client = SimulatedHardwareScopeClient()
            session.call_module_action("scope", "continuous")
            input_name = next(iter(session.lockbox.inputs))
            before = session.lockbox.inputs[input_name].calibration.amplitude
            session.call_lockbox_action("calibrate_all")
            after = session.lockbox.inputs[input_name].calibration.amplitude
            self.assertNotEqual(after, before)
            self.assertEqual(session.scope_settings.running_state, "running_continuous")
            self.assertIsNone(session.module_state("scope")["owner"])
        finally:
            session.close()

    def test_session_lockbox_calibration_and_pwm_output(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            input_name = next(iter(session.lockbox.inputs))
            before = session.lockbox.inputs[input_name].calibration.amplitude
            session.call_lockbox_action("calibrate_all")
            after = session.lockbox.inputs[input_name].calibration.amplitude
            self.assertNotEqual(after, before)
            self.assertIsNone(session.module_state("scope")["owner"])

            session.set_lockbox_output_attribute("output1", "output_channel", "pwm0")
            session.set_lockbox_stage_output_attribute(0, "output1", "lock_on", True)
            session.call_lockbox_action("lock")
            self.assertEqual(session.module_state("pwm0")["owner"], "lockbox")
            self.assertEqual(session.pwm_settings["pwm0"].input, "pid0")
        finally:
            session.close()

    def test_session_scope_frame(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            frame = session.read_scope_frame(sequence=3, sample_count=8)
            self.assertEqual(frame.sequence, 3)
            self.assertEqual(frame.sample_count, 8)
            self.assertEqual(frame.channel_count, 2)
        finally:
            session.close()

    def test_session_scope_fake_same_input_has_no_channel_phase_shift(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "input1", "asg0")
            session.set_module_attribute("scope", "input2", "asg0")
            frame = session.read_scope_frame(sequence=4, sample_count=512)
            samples = frame.samples()
            np.testing.assert_allclose(samples[:, 0], samples[:, 1])
        finally:
            session.close()

    def test_session_scope_module_schema_and_settings(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            modules = session.modules()
            self.assertEqual(modules[0]["name"], "scope")
            attributes = {attribute["name"]: attribute for attribute in session.module_attributes("scope")}
            self.assertIn("trigger_source", attributes)
            self.assertIn("duration", attributes)
            self.assertEqual(session.get_module_attribute("scope", "input1"), "in1")
            self.assertEqual(session.set_module_attribute("scope", "input1", "asg0"), "asg0")
            self.assertEqual(session.get_module_attribute("scope", "input1"), "asg0")
            self.assertEqual(session.set_module_attribute("scope", "duration", 0.1), 0.134217728)
            with self.assertRaises(ValueError):
                session.set_module_attribute("scope", "trigger_source", "not_a_trigger")
        finally:
            session.close()

    def test_session_lists_asg_and_housekeeping_modules(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            module_names = [module["name"] for module in session.modules()]
            self.assertIn("asg0", module_names)
            self.assertIn("asg1", module_names)
            self.assertIn("hk", module_names)
            asg_attributes = {attribute["name"] for attribute in session.module_attributes("asg0")}
            self.assertIn("frequency", asg_attributes)
            self.assertIn("output_direct", asg_attributes)
            hk_attributes = {attribute["name"] for attribute in session.module_attributes("hk")}
            self.assertIn("led", hk_attributes)
            self.assertIn("expansion_P0_output", hk_attributes)
            self.assertEqual({action["name"] for action in session.module_actions("asg1")}, {"setup", "trigger", "off"})
            self.assertEqual(session.module_actions("hk"), [])
        finally:
            session.close()

    def test_session_asg_registers_follow_pyrpl_layout(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("asg0", "amplitude", 0.5)
            self.assertEqual(session.client.fpgamemory[ASG_ADDR_BASE + 0x4] & 0x3FFF, 4096)

            session.set_module_attribute("asg0", "offset", -0.25)
            self.assertEqual((session.client.fpgamemory[ASG_ADDR_BASE + 0x4] >> 16) & 0x3FFF, 14336)

            session.set_module_attribute("asg0", "frequency", 1e6)
            self.assertEqual(session.client.fpgamemory[ASG_ADDR_BASE + 0x10], round(1e6 / 125e6 * 2**30))

            session.set_module_attribute("asg0", "start_phase", 90)
            self.assertEqual(session.client.fpgamemory[ASG_ADDR_BASE + 0xC], 2**28)

            session.set_module_attribute("asg0", "cycles_per_burst", 3)
            self.assertEqual(session.client.fpgamemory[ASG_ADDR_BASE + 0x18], 3)

            session.set_module_attribute("asg0", "output_direct", "out1")
            self.assertEqual(session.client.fpgamemory[0x40380004], 1)

            session.set_module_attribute("asg1", "output_direct", "both")
            self.assertEqual(session.client.fpgamemory[0x40390004], 3)
            session.set_module_attribute("asg1", "trigger_source", "ext_positive_edge")
            self.assertEqual((session.client.fpgamemory[ASG_ADDR_BASE] >> 16) & 0x7, 2)

            session.call_module_action("asg0", "setup")
            self.assertIn(ASG_ADDR_BASE + 0x10000 + (ASG_DATA_LENGTH - 1) * 4, session.client.fpgamemory)

            session.call_module_action("asg1", "off")
            self.assertEqual(session.get_module_attribute("asg1", "output_direct"), "off")
            self.assertEqual(session.client.fpgamemory[0x40390004], 0)
        finally:
            session.close()

    def test_session_housekeeping_registers_follow_pyrpl_layout(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("hk", "led", 170)
            self.assertEqual(session.client.fpgamemory[HK_LED_ADDR], 170)

            session.set_module_attribute("hk", "expansion_P3_output", True)
            self.assertEqual(session.client.fpgamemory[HK_P_DIRECTION_ADDR] & (1 << 3), 1 << 3)
            session.set_module_attribute("hk", "expansion_P3", True)
            self.assertEqual(session.client.fpgamemory[HK_P_WRITE_ADDR] & (1 << 3), 1 << 3)
            session.set_module_attribute("hk", "expansion_P3_output", False)
            self.assertEqual(session.client.fpgamemory[HK_P_DIRECTION_ADDR] & (1 << 3), 0)

            session.set_module_attribute("hk", "expansion_N2_output", True)
            self.assertEqual(session.client.fpgamemory[HK_N_DIRECTION_ADDR] & (1 << 2), 1 << 2)
            session.set_module_attribute("hk", "expansion_N2", True)
            self.assertEqual(session.client.fpgamemory[HK_N_WRITE_ADDR] & (1 << 2), 1 << 2)

            session.client.fpgamemory[HK_P_READ_ADDR] = 1 << 4
            session.client.fpgamemory[HK_N_READ_ADDR] = 1 << 5
            state = session.module_state("hk")
            self.assertTrue(state["expansion_P4"])
            self.assertTrue(state["expansion_N5"])
        finally:
            session.close()

    def test_session_asg_settings_change_fake_scope_signal(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "input1", "asg0")
            session.set_module_attribute("asg0", "waveform", "sin")
            session.set_module_attribute("asg0", "amplitude", 0.1)
            low = session.read_scope_frame(sequence=1, sample_count=256).samples()[:, 0]
            session.set_module_attribute("asg0", "amplitude", 0.9)
            high = session.read_scope_frame(sequence=2, sample_count=256).samples()[:, 0]
            self.assertGreater(np.nanmax(np.abs(high)), np.nanmax(np.abs(low)) * 2)
        finally:
            session.close()

    def test_session_lists_pid_iq_trig_and_pwm_modules(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            module_names = [module["name"] for module in session.modules()]
            for module_name in [
                "pid0",
                "pid1",
                "pid2",
                "iq0",
                "iq1",
                "iq2",
                "trig",
                "pwm0",
                "pwm1",
                "spectrumanalyzer",
            ]:
                self.assertIn(module_name, module_names)
                self.assertTrue(session.module_attributes(module_name))
                self.assertTrue(session.module_actions(module_name))
        finally:
            session.close()

    def test_spectrum_analyzer_owns_and_releases_scope_and_iq2(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("spectrumanalyzer", "baseband", False)
            self.assertIsNone(session.module_state("scope")["owner"])
            self.assertIsNone(session.module_state("iq2")["owner"])

            state = session.call_module_action("spectrumanalyzer", "setup")
            self.assertEqual(state["resources"], ["iq2", "scope"])
            self.assertEqual(session.module_state("iq2")["owner"], "spectrumanalyzer")
            self.assertEqual(session.module_state("scope")["owner"], "spectrumanalyzer")
            with self.assertRaises(ValueError):
                session.set_module_attribute("iq2", "frequency", 1e6)
            with self.assertRaises(ValueError):
                session.call_module_action("scope", "continuous")

            released = session.call_module_action("spectrumanalyzer", "release")
            self.assertEqual(released["resources"], [])
            self.assertIsNone(session.module_state("iq2")["owner"])
            self.assertIsNone(session.module_state("scope")["owner"])
            session.set_module_attribute("iq2", "frequency", 1e6)
        finally:
            session.close()

    def test_spectrum_analyzer_frame_contains_fft_data(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("spectrumanalyzer", "baseband", True)
            frame = session.acquire_spectrum_frame(sequence=7, sample_count=1024)
            self.assertEqual(frame["sequence"], 7)
            self.assertGreater(len(frame["x"]), 1)
            self.assertGreaterEqual(len(frame["series"]), 1)
            self.assertEqual(len(frame["series"][0]["values"]), len(frame["x"]))
            self.assertGreater(frame["rbw"], 0.0)
        finally:
            session.close()

    def test_spectrum_analyzer_control_message_reports_resource_conflict(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            setup = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 1, "type": "module.action", "module": "spectrumanalyzer", "action": "setup"},
                )
            )
            self.assertTrue(setup["ok"])
            response = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 2, "type": "module.set", "module": "iq2", "attribute": "frequency", "value": 1e6},
                )
            )
            self.assertFalse(response["ok"])
            self.assertEqual(response["error"]["code"], "bad_request")
        finally:
            session.close()

    def test_session_pid_registers_follow_pyrpl_layout(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            base = dsp_addr_base("pid0")
            session.set_module_attribute("pid0", "input", "asg0")
            self.assertEqual(session.client.fpgamemory[base + 0x0], 8)
            session.set_module_attribute("pid0", "output_direct", "out1")
            self.assertEqual(session.client.fpgamemory[base + 0x4], 1)
            session.set_module_attribute("pid0", "setpoint", -0.25)
            self.assertEqual(session.client.fpgamemory[base + 0x104], float_to_register(-0.25))
            session.set_module_attribute("pid0", "p", 0.5)
            self.assertEqual(session.client.fpgamemory[base + 0x108], float_to_register(0.5, bits=24, norm=2**12))
            session.set_module_attribute("pid0", "i", 10.0)
            self.assertEqual(
                session.client.fpgamemory[base + 0x10C],
                float_to_register(10.0, bits=24, norm=2**32 * 2.0 * np.pi * 8e-9),
            )
            session.set_module_attribute("pid0", "ival", 0.125)
            self.assertEqual(session.client.fpgamemory[base + 0x100], float_to_register(0.125, bits=16))
            session.set_module_attribute("pid0", "pause_gains", "pi")
            self.assertEqual(session.client.fpgamemory[base + 0x12C] & 0x7, 3)
            session.set_module_attribute("pid0", "differential_mode_enabled", True)
            self.assertEqual(session.client.fpgamemory[base + 0x12C] & (1 << 3), 1 << 3)
            session.call_module_action("pid0", "setup")
            self.assertEqual(session.module_state("pid0")["input"], "asg0")
        finally:
            session.close()

    def test_session_iq_registers_follow_pyrpl_layout(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            base = dsp_addr_base("iq1")
            session.set_module_attribute("iq1", "input", "pid0")
            self.assertEqual(session.client.fpgamemory[base + 0x0], 0)
            session.set_module_attribute("iq1", "output_signal", "pfd")
            self.assertEqual(session.client.fpgamemory[base + 0x10C], 2)
            session.set_module_attribute("iq1", "frequency", 1e6)
            self.assertEqual(session.client.fpgamemory[base + 0x108], frequency_to_register(1e6, bits=32))
            session.set_module_attribute("iq1", "phase", 90.0)
            self.assertEqual(session.client.fpgamemory[base + 0x104], phase_to_register(90.0, bits=32, invert=True))
            session.set_module_attribute("iq1", "gain", 2.0)
            self.assertEqual(session.client.fpgamemory[base + 0x110], float_to_register(16.0, bits=18, norm=2**8))
            self.assertEqual(session.client.fpgamemory[base + 0x11C], float_to_register(16.0, bits=18, norm=2**8))
            session.set_module_attribute("iq1", "amplitude", 0.25)
            self.assertEqual(session.client.fpgamemory[base + 0x114], float_to_register(0.25, bits=18, norm=2**17))
            session.set_module_attribute("iq1", "quadrature_factor", 4)
            self.assertEqual(session.client.fpgamemory[base + 0x118], 4)
            session.set_module_attribute("iq1", "modulation_at_2f", "on")
            self.assertEqual(session.client.fpgamemory[base + 0x100] & (3 << 2), 3 << 2)
            session.set_module_attribute("iq1", "demodulation_at_2f", "on")
            self.assertEqual(session.client.fpgamemory[base + 0x100] & (3 << 4), 3 << 4)
            session.call_module_action("iq1", "sync")
            self.assertIn(dsp_addr_base("iq0") + 0xC, session.client.fpgamemory)
        finally:
            session.close()

    def test_session_trig_and_pwm_registers_follow_pyrpl_layout(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            trig_base = dsp_addr_base("trig")
            session.set_module_attribute("trig", "input", "in1")
            self.assertEqual(session.client.fpgamemory[trig_base + 0x0], 10)
            session.set_module_attribute("trig", "output_signal", "asg0_phase")
            self.assertEqual(session.client.fpgamemory[trig_base + 0x10C], 1)
            session.set_module_attribute("trig", "trigger_source", "pos_edge")
            self.assertEqual(session.client.fpgamemory[trig_base + 0x108], 1)
            session.set_module_attribute("trig", "threshold", 0.125)
            self.assertEqual(session.client.fpgamemory[trig_base + 0x118], float_to_register(0.125))
            session.set_module_attribute("trig", "hysteresis", 0.0625)
            self.assertEqual(session.client.fpgamemory[trig_base + 0x11C], float_to_register(0.0625))
            session.set_module_attribute("trig", "phase_offset", 180)
            self.assertEqual(session.client.fpgamemory[trig_base + 0x110], phase_to_register(180, bits=14))
            session.call_module_action("trig", "arm")
            self.assertTrue(session.module_state("trig")["armed"])
            self.assertEqual(session.client.fpgamemory[trig_base + 0x100] & 1, 1)

            session.set_module_attribute("pwm0", "input", "pid0")
            self.assertEqual(session.client.fpgamemory[pwm_addr_base("pwm0") + 0x0], 0)
            session.set_module_attribute("pwm1", "input", "iq0")
            self.assertEqual(session.client.fpgamemory[pwm_addr_base("pwm1") + 0x0], 5)
        finally:
            session.close()

    def test_scope_hardware_controls_sync_to_registers(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "input1", "asg0")
            self.assertEqual(session.client.fpgamemory[0x40380000], 8)

            duration = session.set_module_attribute("scope", "duration", 0.1)
            self.assertEqual(duration, 0.134217728)
            self.assertEqual(session.client.fpgamemory[0x40100014], 1024)

            writes_before_trace_average = session.client.stats.writes
            session.set_module_attribute("scope", "trace_average", 8)
            self.assertEqual(session.client.stats.writes, writes_before_trace_average)
            self.assertEqual(session.get_module_attribute("scope", "trace_average"), 8)
        finally:
            session.close()

    def test_session_scope_actions_update_running_state(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            actions = {action["name"] for action in session.module_actions("scope")}
            self.assertIn("single", actions)
            self.assertIn("continuous", actions)
            self.assertIn("stop", actions)
            self.assertIn("trigger_test", actions)

            continuous = session.call_module_action("scope", "continuous")
            self.assertEqual(continuous["running_state"], "running_continuous")

            paused = session.call_module_action("scope", "pause")
            self.assertEqual(paused["running_state"], "paused_continuous")

            stopped = session.call_module_action("scope", "stop")
            self.assertEqual(stopped["running_state"], "stopped")
        finally:
            session.close()

    def test_session_scope_trigger_test_uses_current_condition(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "input1", "asg0")
            session.set_module_attribute("scope", "trigger_source", "ch1_positive_edge")
            session.set_module_attribute("scope", "run_mode", "continuous")
            session.set_module_attribute("scope", "threshold", 0.0)
            session.set_module_attribute("scope", "hysteresis", 0.01)
            state = session.call_module_action("scope", "trigger_test")
            result = state["trigger_test"]
            self.assertEqual(result["source"], "ch1_positive_edge")
            self.assertEqual(result["threshold"], 0.0)
            self.assertEqual(result["hysteresis"], 0.01)
            self.assertTrue(result["triggered"])
            self.assertIsInstance(result["index"], int)
        finally:
            session.close()

    def test_session_continuous_trigger_captures_trigger_aligned_frame(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            sample_count = 512
            session.set_module_attribute("scope", "input1", "asg0")
            session.set_module_attribute("scope", "trigger_source", "ch1_positive_edge")
            session.set_module_attribute("scope", "run_mode", "continuous")
            session.set_module_attribute("scope", "threshold", 0.0)
            session.set_module_attribute("scope", "hysteresis", 0.01)
            session.call_module_action("scope", "continuous")

            acquisition = session.acquire_scope_frame(sequence=1, sample_count=sample_count)
            self.assertIsNotNone(acquisition.frame)
            self.assertFalse(acquisition.state_changed)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "running_continuous")

            samples = acquisition.frame.samples()[:, 0]
            trigger_slot = sample_count // 2
            self.assertLessEqual(np.min(samples[:trigger_slot]), -0.01)
            self.assertGreaterEqual(samples[trigger_slot], 0.01)
        finally:
            session.close()

    def test_session_trigger_off_does_not_upload_continuous_frames(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "trigger_source", "off")
            session.call_module_action("scope", "continuous")
            acquisition = session.acquire_scope_frame(sequence=1, sample_count=512)
            self.assertIsNone(acquisition.frame)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "running_continuous")
        finally:
            session.close()

    def test_session_single_trigger_pauses_until_rearmed(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "input1", "asg0")
            session.set_module_attribute("scope", "trigger_source", "ch1_positive_edge")
            session.set_module_attribute("scope", "threshold", 0.0)
            session.set_module_attribute("scope", "hysteresis", 0.01)

            session.call_module_action("scope", "single")
            first = session.acquire_scope_frame(sequence=1, sample_count=512)
            self.assertIsNotNone(first.frame)
            self.assertTrue(first.state_changed)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "paused_single")

            latched = session.acquire_scope_frame(sequence=2, sample_count=512)
            self.assertIsNone(latched.frame)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "paused_single")

            session.call_module_action("scope", "single")
            rearmed = session.acquire_scope_frame(sequence=3, sample_count=512)
            self.assertIsNotNone(rearmed.frame)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "paused_single")
        finally:
            session.close()

    def test_hardware_scope_acquisition_rearms_and_reads_fresh_trigger_aligned_frames(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        session.client = SimulatedHardwareScopeClient()
        try:
            session.call_module_action("scope", "continuous")
            session.set_module_attribute("scope", "run_mode", "continuous")
            first = session.acquire_scope_frame(sequence=1, sample_count=8)
            second = session.acquire_scope_frame(sequence=2, sample_count=8)

            self.assertIsNotNone(first.frame)
            self.assertIsNotNone(second.frame)
            self.assertEqual(session.client.capture_id, 2)
            first_samples = first.frame.samples()
            second_samples = second.frame.samples()
            self.assertFalse(np.array_equal(first_samples, second_samples))
            self.assertAlmostEqual(first_samples[0, 0], 104 / 8192)
            self.assertAlmostEqual(second_samples[0, 0], 204 / 8192)
        finally:
            session.close()

    def test_hardware_single_scope_acquisition_pauses_after_fresh_frame(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        session.client = SimulatedHardwareScopeClient()
        try:
            session.call_module_action("scope", "single")
            first = session.acquire_scope_frame(sequence=1, sample_count=8)
            second = session.acquire_scope_frame(sequence=2, sample_count=8)

            self.assertIsNotNone(first.frame)
            self.assertTrue(first.state_changed)
            self.assertIsNone(second.frame)
            self.assertEqual(session.get_module_attribute("scope", "running_state"), "paused_single")
            self.assertEqual(session.client.capture_id, 1)
        finally:
            session.close()

    def test_hardware_rolling_scope_uses_live_current_write_pointer(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        session.client = SimulatedRollingHardwareScopeClient()
        try:
            session.call_module_action("scope", "continuous")
            first = session.acquire_scope_frame(sequence=1, sample_count=SCOPE_DATA_LENGTH)
            second = session.acquire_scope_frame(sequence=2, sample_count=SCOPE_DATA_LENGTH)

            self.assertIsNotNone(first.frame)
            self.assertIsNotNone(second.frame)
            self.assertEqual(session.client.rolling_starts, 1)
            first_samples = first.frame.samples()
            second_samples = second.frame.samples()
            self.assertEqual(int(session.client.fpgamemory[SCOPE_ADDR_BASE + 0x4]), 0)
            self.assertTrue(np.isnan(first_samples[0, 0]))
            self.assertTrue(np.isnan(first_samples[1, 0]))
            self.assertTrue(np.isnan(first_samples[2, 0]))
            self.assertAlmostEqual(first_samples[3, 0], 107 / 8192)
            self.assertTrue(np.isnan(second_samples[0, 0]))
            self.assertTrue(np.isnan(second_samples[1, 0]))
            self.assertAlmostEqual(second_samples[2, 0], 110 / 8192)
        finally:
            session.close()

    def test_session_scope_state_save_load_delete(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            session.set_module_attribute("scope", "threshold", 0.25)
            saved = session.save_module_state("scope", "high")
            self.assertEqual(saved["name"], "high")
            self.assertEqual(saved["state"]["threshold"], 0.25)

            session.set_module_attribute("scope", "threshold", -0.25)
            loaded = session.load_module_state("scope", "high")
            self.assertEqual(loaded["threshold"], 0.25)

            states = session.module_states("scope")
            self.assertEqual([state["name"] for state in states], ["high"])

            deleted = session.delete_module_state("scope", "high")
            self.assertEqual(deleted["name"], "high")
            self.assertEqual(session.module_states("scope"), [])
        finally:
            session.close()

    def test_session_scope_states_can_persist_to_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            state_file = str(Path(tmpdir) / "states.json")
            first = WebSession(ServerSettings(hostname="_FAKE_", state_file=state_file))
            try:
                first.set_module_attribute("scope", "threshold", 0.375)
                first.save_module_state("scope", "persisted")
            finally:
                first.close()

            second = WebSession(ServerSettings(hostname="_FAKE_", state_file=state_file))
            try:
                second.set_module_attribute("scope", "threshold", -0.375)
                loaded = second.load_module_state("scope", "persisted")
                self.assertEqual(loaded["threshold"], 0.375)
            finally:
                second.close()

    def test_control_message_register_round_trip(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            written = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 1, "type": "register.write", "addr": 100, "values": [7, 8]},
                )
            )
            self.assertTrue(written["ok"])
            self.assertEqual(written["type"], "register.written")

            read = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 2, "type": "register.read", "addr": 100, "length": 2},
                )
            )
            self.assertTrue(read["ok"])
            self.assertEqual(read["type"], "register.values")
            self.assertEqual(read["values"], [7, 8])
        finally:
            session.close()

    def test_control_message_rejects_unknown_type(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            response = asyncio.run(handle_control_message(session, {"id": 3, "type": "missing"}))
            self.assertFalse(response["ok"])
            self.assertEqual(response["error"]["code"], "unknown_type")
        finally:
            session.close()

    def test_control_message_module_get_set(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            modules = asyncio.run(handle_control_message(session, {"id": 4, "type": "module.list"}))
            self.assertTrue(modules["ok"])
            self.assertEqual(modules["modules"][0]["name"], "scope")

            written = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 5, "type": "module.set", "module": "scope", "attribute": "run_mode", "value": "single"},
                )
            )
            self.assertTrue(written["ok"])
            self.assertEqual(written["value"], "single")

            read = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 6, "type": "module.get", "module": "scope", "attribute": "run_mode"},
                )
            )
            self.assertTrue(read["ok"])
            self.assertEqual(read["value"], "single")
        finally:
                session.close()

    def test_control_message_module_set_broadcasts_event(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        events = EventBroker()
        queue = events.subscribe()
        try:
            written = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 7, "type": "module.set", "module": "scope", "attribute": "input1", "value": "asg0"},
                    events,
                )
            )
            self.assertTrue(written["ok"])
            event = queue.get_nowait()
            self.assertEqual(event["type"], "module.attribute.changed")
            self.assertEqual(event["module"], "scope")
            self.assertEqual(event["attribute"], "input1")
            self.assertEqual(event["value"], "asg0")
        finally:
            events.unsubscribe(queue)
            session.close()

    def test_control_message_module_action_broadcasts_event(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        events = EventBroker()
        queue = events.subscribe()
        try:
            response = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 8, "type": "module.action", "module": "scope", "action": "continuous"},
                    events,
                )
            )
            self.assertTrue(response["ok"])
            self.assertEqual(response["state"]["running_state"], "running_continuous")

            action_event = queue.get_nowait()
            self.assertEqual(action_event["type"], "module.action")
            self.assertEqual(action_event["action"], "continuous")

            state_event = queue.get_nowait()
            self.assertEqual(state_event["type"], "module.state.changed")
            self.assertEqual(state_event["state"]["running_state"], "running_continuous")
        finally:
            events.unsubscribe(queue)
            session.close()

    def test_control_message_module_states(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        events = EventBroker()
        queue = events.subscribe()
        try:
            saved = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 9, "type": "module.state.save", "module": "scope", "state": "default"},
                    events,
                )
            )
            self.assertTrue(saved["ok"])
            self.assertEqual(saved["state"]["name"], "default")
            self.assertEqual(queue.get_nowait()["type"], "module.states.changed")

            listed = asyncio.run(
                handle_control_message(session, {"id": 10, "type": "module.states", "module": "scope"})
            )
            self.assertEqual([state["name"] for state in listed["states"]], ["default"])

            loaded = asyncio.run(
                handle_control_message(
                    session,
                    {"id": 11, "type": "module.state.load", "module": "scope", "state": "default"},
                    events,
                )
            )
            self.assertTrue(loaded["ok"])
            self.assertEqual(queue.get_nowait()["type"], "module.states.changed")
            self.assertEqual(queue.get_nowait()["type"], "module.state.changed")
        finally:
            events.unsubscribe(queue)
            session.close()


if __name__ == "__main__":
    unittest.main()
