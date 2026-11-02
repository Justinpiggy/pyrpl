"""PC HTTP client integration tests against a real local HTTP server, fake FPGA."""
import json
import math
import os
from pathlib import Path
import socket
import struct
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from unittest import mock

import uvicorn

from pyrpl_websocket.app import create_app
from pyrpl_websocket.http_client import (
    APIError, ControlLostError, ProtocolError, RedPitayaClient, ScopeFrame, TransportError,
)
from pyrpl_websocket.settings import ServerSettings

REPO = Path(__file__).resolve().parents[2]


class HttpClientTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.environment = mock.patch.dict(os.environ, {"PYRPL_USER_DIR": cls.directory.name})
        cls.environment.start()
        cls.app = create_app(ServerSettings(hostname="_FAKE_", config="client-test",
                                            auth_token="test-token", scope_interval=0.01))
        sock = socket.socket()
        sock.bind(("127.0.0.1", 0))
        cls.address = "http://127.0.0.1:" + str(sock.getsockname()[1])
        cls.server = uvicorn.Server(uvicorn.Config(cls.app, log_level="error", lifespan="on"))
        cls.thread = threading.Thread(target=cls.server.run, kwargs={"sockets": [sock]}, daemon=True)
        cls.thread.start()
        deadline = time.monotonic() + 5
        while not cls.server.started and cls.thread.is_alive() and time.monotonic() < deadline:
            time.sleep(0.01)
        if not cls.server.started:
            raise RuntimeError("Test HTTP server failed to start")

    @classmethod
    def tearDownClass(cls):
        cls.server.should_exit = True
        cls.thread.join(timeout=8)
        cls.environment.stop()
        cls.directory.cleanup()

    def setUp(self):
        self.rp = RedPitayaClient(self.address, token="test-token", timeout=2)

    def tearDown(self):
        self.rp.release_control()

    def test_status_discovery_and_all_http_routes_are_documented(self):
        self.assertTrue(self.rp.health()["ok"])
        self.assertTrue(self.rp.session()["fake"])
        self.assertIn("scope", [module["name"] for module in self.rp.modules()["modules"]])
        self.assertIn("threshold", [attribute["name"] for attribute in self.rp.attributes("scope")["attributes"]])
        self.assertIn("stop", [action["name"] for action in self.rp.actions("scope")["actions"]])
        self.assertIn("paths", self.rp.openapi())
        self.assertIn("exists", self.rp.assets())
        guide = (REPO / "docs/source/http_api.rst").read_text(encoding="utf-8")
        for route in self.app.routes:
            if route.path.startswith("/api/"):
                for method in route.methods:
                    with self.subTest(method=method, path=route.path):
                        self.assertIn(method + " " + route.path, guide)

    def test_authentication_and_http_error_details(self):
        with self.assertRaises(APIError) as caught:
            RedPitayaClient(self.address).health()
        self.assertEqual(caught.exception.status, 401)
        self.assertEqual(caught.exception.detail, "Authentication required")
        with self.assertRaises(APIError) as caught:
            self.rp.get("scope", "does_not_exist")
        self.assertEqual(caught.exception.status, 404)
        with self.assertRaises(APIError) as caught:
            self.rp.read_registers(0, length=0)
        self.assertEqual(caught.exception.status, 422)
        self.assertIsInstance(caught.exception.detail, list)

    def test_ownership_conflict_explicit_takeover_and_release(self):
        other = RedPitayaClient(self.address, token="test-token", label="another script")
        with self.rp.control(keep_alive=False):
            self.assertEqual(self.rp.control_status()["role"], "controller")
            self.assertTrue(other.health()["ok"])
            with self.assertRaises(APIError) as caught:
                other.set("scope", "threshold", 0.25)
            self.assertEqual(caught.exception.status, 409)
            self.assertIn("control", caught.exception.payload)
            self.assertEqual(other.claim_control(force=True)["role"], "controller")
            self.assertEqual(self.rp.heartbeat()["role"], "observer")
            other.release_control()
        self.assertIsNone(self.rp.control_status()["controller"])
        self.assertTrue(self.rp.control_audit()["records"])

    def test_control_context_releases_on_exception_without_stopping_acquisition(self):
        with self.assertRaisesRegex(ValueError, "user script"):
            with self.rp.control():
                self.rp.action("scope", "continuous")
                raise ValueError("user script")
        self.assertIsNone(self.rp.control_status()["controller"])
        self.assertEqual(self.rp.module_state("scope")["state"]["running_state"], "running_continuous")
        self.rp.action("scope", "stop")

    def test_background_lease_loss_blocks_writes(self):
        original = self.rp.claim_control
        def short_claim(**kwargs):
            status = original(**kwargs)
            return dict(status, lease_seconds=0.3)
        with mock.patch.object(self.rp, "claim_control", side_effect=short_claim):
            with mock.patch.object(self.rp, "heartbeat", return_value={"role": "observer"}):
                with self.assertRaises(ControlLostError):
                    with self.rp.control():
                        deadline = time.monotonic() + 1
                        while self.rp._control_error is None and time.monotonic() < deadline:
                            time.sleep(0.01)
                        with self.assertRaises(ControlLostError):
                            self.rp.set("scope", "threshold", 0.0)
        self.assertIsNone(self.rp.control_status()["controller"])
        self.assertTrue(self.rp.health()["ok"])
        self.rp.claim_control()
        self.rp.set("scope", "threshold", 0.0)

    def test_heartbeat_renews_and_nested_context_is_rejected(self):
        original = self.rp.claim_control
        def short_claim(**kwargs):
            return dict(original(**kwargs), lease_seconds=0.3)
        with mock.patch.object(self.rp, "claim_control", side_effect=short_claim):
            with mock.patch.object(self.rp, "heartbeat", wraps=self.rp.heartbeat) as heartbeat:
                with self.rp.control():
                    with self.assertRaises(RuntimeError):
                        with self.rp.control():
                            pass
                    deadline = time.monotonic() + 1
                    while heartbeat.call_count < 2 and time.monotonic() < deadline:
                        time.sleep(0.01)
                    self.assertGreaterEqual(heartbeat.call_count, 2)
                    self.assertEqual(self.rp.control_status()["role"], "controller")

    def test_scope_frame_decode_polling_freshness_and_timeout(self):
        with self.rp.control():
            self.rp.action("scope", "stop")
            self.app.state.scope_streams[16384]._latest = None
            self.assertIsNone(self.rp.scope_frame())
            self.rp.set("scope", "trigger_source", "immediately")
            self.rp.set("scope", "duration", 0.001)
            self.rp.action("scope", "continuous")
            frame = self.rp.wait_scope_frame(samples=64, timeout=2)
            self.assertEqual(frame.sample_count, 64)
            self.assertEqual(len(frame.channels), 2)
            self.assertEqual(len(frame.channels[0]), 64)
            fresh = self.rp.wait_scope_frame(after=frame, samples=64, timeout=2)
            self.assertNotEqual(frame.sequence, fresh.sequence)
            self.rp.action("scope", "stop")
            stopped = self.rp.scope_frame()
            with self.assertRaises(TimeoutError):
                self.rp.wait_scope_frame(after=stopped, timeout=0.06, poll_interval=0.01)

    def test_settings_actions_setups_and_storage(self):
        with self.rp.control():
            self.assertEqual(self.rp.set("scope", "threshold", 0.125)["value"], 0.125)
            self.assertEqual(self.rp.get("scope", "threshold")["value"], 0.125)
            self.rp.save_state("scope", "PC setup")
            self.rp.set("scope", "threshold", 0.0)
            self.rp.load_state("scope", "PC setup")
            self.assertEqual(self.rp.get("scope", "threshold")["value"], 0.125)
            self.assertIn("PC setup", [item["name"] for item in self.rp.states("scope")["states"]])
            removed = self.rp.delete_state("scope", "PC setup")
            self.assertEqual(removed["state"]["name"], "PC setup")
            curve = self.rp.create_curve([0, 1], [1, 2], y_imag=[3, 4], params={"name": "PC curve"})["curve"]
            pk = curve["pk"]
            self.assertEqual(self.rp.curve(pk)["curve"]["y_imag"], [3, 4])
            self.assertIn(pk, [item["pk"] for item in self.rp.curves()["curves"]])
            self.rp.update_curve_params(pk, "name: renamed\n")
            self.assertEqual(self.rp.curve(pk)["curve"]["name"], "renamed")
            self.assertTrue(self.rp.delete_curve(pk)["deleted"])
            self.assertEqual(self.rp.curves(limit=0), {"curves": []})
            current = self.rp.config("scope")
            self.assertEqual(self.rp.save_config("scope", current["text"])["module"], "scope")
            workspace = self.rp.workspace()["workspace"] or {}
            self.assertIn("workspace", self.rp.save_workspace(workspace))

    def test_lockbox_status_configuration_actions_and_plots(self):
        with self.rp.control():
            self.rp.lockbox_action("unlock")
            self.rp.set_lockbox_class("Linear")
            self.assertIn("Linear", [item["name"] for item in self.rp.lockbox_classes()["classes"]])
            self.assertIn("lock", [item["name"] for item in self.rp.lockbox_actions()["actions"]])
            self.rp.set_lockbox("auto_lock", False)
            self.rp.set_lockbox_input("input_from_output", "input_signal", "in1")
            self.rp.set_lockbox_output("output1", "assisted_design", False)
            self.rp.set_stage(0, "setpoint", 0.01)
            self.rp.set_stage_output(0, "output1", "lock_on", False)
            self.rp.add_stage()
            self.rp.delete_stage(1)
            self.rp.stage_action(0)
            self.rp.lockbox_action("unlock")
            self.assertEqual(self.rp.lock_status()["current_state"], "unlock")

    def test_profile_file_transfer_and_validation(self):
        with self.rp.control():
            saved = self.rp.create_profile("Transfer source")
            profile_id = saved["active"]["id"]
            observer = RedPitayaClient(self.address, token="test-token")
            exported = observer.export_profile(profile_id)
            self.assertEqual(exported["version"], 1)
            self.assertEqual(exported["name"], "Transfer source")
            with self.assertRaises(APIError) as caught:
                observer.import_profile(exported, name="Observer copy")
            self.assertEqual(caught.exception.status, 409)
            result = self.rp.import_profile(exported, name="Transfer copy")
            self.assertEqual(result["active"]["id"], profile_id)
            self.assertNotEqual(result["imported_id"], profile_id)
            self.assertEqual(self.rp.export_profile(result["imported_id"])["settings"]["scope"], exported["settings"]["scope"])
            for payload in [b"not-json", {"profile": {}}, {"profile": exported, "name": []}]:
                with self.subTest(payload=payload), self.assertRaises(APIError) as caught:
                    self.rp.request("POST", "/api/profiles/import", data=payload)
                self.assertEqual(caught.exception.status, 400)
            with self.assertRaises(APIError) as caught:
                self.rp.request("POST", "/api/profiles/import", data=b" " * (8 * 1024 * 1024 + 1))
            self.assertEqual(caught.exception.status, 413)
            self.assertIn("revision", self.rp.lockbox())
            self.assertIn("series", self.rp.lockbox_input_plot("input_from_output", 8))
            self.assertIn("series", self.rp.lockbox_output_plot("output1", 8))
            self.rp.lockbox_input_action("input_from_output")

    def test_sampler_spectrum_iir_and_binary_curve_upload(self):
        self.assertIn("mean", self.rp.sampler_stats(duration=0))
        self.assertIn("values", self.rp.read_registers(0x40100014))
        with self.rp.control():
            self.assertTrue(self.rp.write_registers(0x40300000, [123])["ok"])
            self.rp.action("spectrumanalyzer", "stop")
            self.app.state.spectrum_streams[16384]._latest = None
            self.assertIsNone(self.rp.spectrum_frame())
            with self.assertRaises(APIError) as caught:
                self.rp.spectrum_frame("invalid-window")
            self.assertEqual(caught.exception.status, 422)
            self.assertIn("magnitude", self.rp.iir_plot(points=8, plot_data=False))
            header = json.dumps({"points": 2, "complex": False, "params": {"name": "binary"}}).encode()
            binary = b"PYC1" + struct.pack("<I", len(header)) + header + struct.pack("<4d", 0, 1, 2, 3)
            created = self.rp.request("POST", "/api/curves", params={"include_data": False}, data=binary)["curve"]
            self.assertNotIn("x", created)
            self.rp.delete_curve(created["pk"])

    def test_profile_commands_and_observer_ownership(self):
        with self.rp.control():
            self.rp.set("scope", "threshold", 0.125)
            saved = self.rp.create_profile("HTTP profile")
            profile_id = saved["active"]["id"]
            self.assertIn(profile_id, [item["id"] for item in self.rp.profiles()["profiles"]])
            self.rp.rename_profile(profile_id, "Renamed HTTP profile")
            self.rp.save_profile(profile_id)
            self.rp.set("scope", "threshold", 0.5)
            observer = RedPitayaClient(self.address, token="test-token")
            self.assertTrue(observer.profiles()["profiles"])
            with self.assertRaises(APIError) as caught:
                observer.load_profile(profile_id)
            self.assertEqual(caught.exception.status, 409)
            loaded = self.rp.load_profile(profile_id)
            self.assertEqual(loaded["active"]["name"], "Renamed HTTP profile")
            self.assertEqual(self.rp.get("scope", "threshold")["value"], 0.125)
            self.assertIsNone(self.rp.scope_frame())
            self.assertEqual(self.rp.lock_status()["current_state"], "unlock")


class HttpClientProtocolTest(unittest.TestCase):
    def test_wire_format_and_malformed_frames(self):
        data = struct.pack("<4sHHIQI4f", b"PWS1", 1, 2, 2, 123456, 42, 1, 2, float("nan"), 4)
        frame = ScopeFrame.from_bytes(data)
        self.assertEqual((frame.timestamp_ns, frame.sequence), (123456, 42))
        self.assertEqual(frame.channels[1], (2, 4))
        self.assertTrue(math.isnan(frame.channels[0][1]))
        for invalid in [b"", data[:20], data[:-1], data + b"x", b"XXXX" + data[4:], data[:4] + b"\x02\x00" + data[6:]]:
            with self.subTest(invalid=invalid), self.assertRaises(ProtocolError):
                ScopeFrame.from_bytes(invalid)

    def test_constructor_and_request_validation(self):
        self.assertEqual(RedPitayaClient("10.0.5.118").base_url, "http://10.0.5.118:8801")
        self.assertEqual(RedPitayaClient("localhost:8765").base_url, "http://localhost:8765")
        self.assertEqual(RedPitayaClient("localhost/pyrpl").base_url, "http://localhost:8801/pyrpl")
        self.assertEqual(RedPitayaClient("https://lab.example/pyrpl/").base_url, "https://lab.example/pyrpl")
        for address in ["ftp://host", "http://user:password@host", "http://host?token=secret"]:
            with self.subTest(address=address), self.assertRaises(ValueError):
                RedPitayaClient(address)
        for timeout in [0, -1, float("inf"), float("nan")]:
            with self.assertRaises(ValueError):
                RedPitayaClient("localhost", timeout=timeout)
        client = RedPitayaClient("localhost")
        for path in ["http://other/", "//other/api", "/api/health?x=1"]:
            with self.assertRaises(ValueError):
                client.request("GET", path)
        with self.assertRaises(ValueError):
            client.set("scope", "threshold", float("nan"))

    def test_transport_errors_do_not_retry_writes(self):
        client = RedPitayaClient("localhost")
        opener = mock.Mock()
        opener.open.side_effect = OSError("connection lost")
        with mock.patch("pyrpl_websocket.http_client.build_opener", return_value=opener):
            with self.assertRaises(TransportError):
                client.action("scope", "single")
        self.assertEqual(opener.open.call_count, 1)

    def test_standalone_client_does_not_import_server_or_gui_dependencies(self):
        code = "import sys; sys.path.insert(0, sys.argv[1]); import http_client; assert not any(m in sys.modules for m in ['numpy', 'fastapi', 'pyrpl', 'qtpy'])"
        subprocess.run([sys.executable, "-I", "-c", code, str(REPO / "pyrpl_websocket")], check=True)


if __name__ == "__main__":
    unittest.main()
