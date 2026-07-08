import asyncio
import tempfile
import unittest
from pathlib import Path

import numpy as np

from pyrpl_websocket.app import create_app, handle_control_message
from pyrpl_websocket.assets import asset_info
from pyrpl_websocket.events import EventBroker
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
