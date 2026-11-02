import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from pyrpl_websocket.profiles import ProfileConflict
from pyrpl_websocket.session import WebSession
from pyrpl_websocket.settings import ServerSettings


class ProfileTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.environment = mock.patch.dict(os.environ, {"PYRPL_USER_DIR": self.directory.name})
        self.environment.start()
        self.session = WebSession(ServerSettings(hostname="_FAKE_", config="profiles-test"))

    def tearDown(self):
        self.session.close()
        self.environment.stop()
        self.directory.cleanup()

    def test_save_load_preserves_settings_views_saved_setups_and_restart_name(self):
        s = self.session
        s.set_module_attribute("scope", "threshold", 0.25)
        s.set_module_attribute("asg0", "amplitude", 0.2)
        s.set_module_attribute("ams", "dac2", 0.4)
        s.set_lockbox_stage_attribute(0, "setpoint", 0.3)
        s.save_module_state("scope", "capture")
        s.call_module_action("scope", "continuous")
        workspace = {"activePanelId": "asg", "layoutMode": "tabs", "theme": "ocean"}
        views = {"scope": {"ch1_active": False}}
        a = s.profiles.save("Experiment A", workspace=workspace, plot_views=views)["active"]["id"]
        self.assertEqual(s.scope_settings.running_state, "running_continuous")
        s.set_module_attribute("scope", "threshold", 0.5)
        s.set_module_attribute("asg0", "amplitude", 0.7)
        s.set_module_attribute("ams", "dac2", 0.8)
        s.set_lockbox_stage_attribute(0, "setpoint", -0.2)
        s.delete_module_state("scope", "capture")
        s.profiles.save("Experiment B")
        loaded = s.profiles.load(a)
        self.assertEqual(loaded["workspace"], workspace)
        self.assertEqual(loaded["plot_views"], views)
        self.assertEqual(s.scope_settings.threshold, 0.25)
        self.assertEqual(s.asg_settings["asg0"].amplitude, 0.2)
        self.assertAlmostEqual(s.ams_settings.dac2, 0.4, places=2)
        self.assertEqual(s.lockbox.sequence[0].setpoint, 0.3)
        self.assertEqual(s.scope_settings.running_state, "stopped")
        self.assertEqual(s.lockbox.current_state, "unlock")
        self.assertEqual(s.module_states("scope")[0]["name"], "capture")
        s.profiles.rename(a, "Renamed λ")
        self.assertEqual(s.config.data["pyrpl"]["name"], "Renamed λ")
        s.close()
        self.session = WebSession(ServerSettings(hostname="_FAKE_", config="profiles-test"))
        self.assertEqual(self.session.profiles.list()["active"], {"id": a, "name": "Renamed λ"})
        self.assertEqual(self.session.scope_settings.threshold, 0.25)
        self.assertAlmostEqual(self.session.ams_settings.dac2, 0.4, places=2)

    def test_explicit_save_overwrites_snapshot_but_autosave_does_not(self):
        s = self.session
        a = s.profiles.save("A")["active"]["id"]
        s.set_module_attribute("scope", "threshold", 0.4)
        s.profiles.load(a)
        self.assertEqual(s.scope_settings.threshold, 0.0)
        s.set_module_attribute("scope", "threshold", 0.4)
        s.profiles.save(profile_id=a)
        s.set_module_attribute("scope", "threshold", 0.6)
        s.profiles.load(a)
        self.assertEqual(s.scope_settings.threshold, 0.4)

    def test_duplicate_names_validation_and_path_traversal(self):
        s = self.session
        a = s.profiles.save("A")["active"]["id"]
        b = s.profiles.save("B")["active"]["id"]
        with self.assertRaises(ProfileConflict):
            s.profiles.save(" a ")
        with self.assertRaises(ProfileConflict):
            s.profiles.rename(b, "A")
        for name in ["", "   ", "x" * 81, "a\nb"]:
            with self.subTest(name=name), self.assertRaises(ValueError):
                s.profiles.save(name)
        with self.assertRaises(KeyError):
            s.profiles.load("../outside")
        s.profiles.rename(a, "Other")
        self.assertEqual(s.profiles.list()["active"]["name"], "B")

    def test_invalid_snapshot_is_rejected_before_any_live_write(self):
        s = self.session
        a = s.profiles.save("A")["active"]["id"]
        s.set_module_attribute("scope", "threshold", 0.5)
        before = s.client.stats.writes
        path = s.profiles._path(a)
        data = json.loads(path.read_text())
        data["settings"]["scope"]["trigger_source"] = "not-a-trigger"
        path.write_text(json.dumps(data), encoding="utf-8")
        with self.assertRaises(ValueError):
            s.profiles.load(a)
        self.assertEqual(s.scope_settings.threshold, 0.5)
        self.assertEqual(s.client.stats.writes, before)

    def test_storage_failure_rolls_back_settings_and_active_name(self):
        s = self.session
        a = s.profiles.save("A")["active"]["id"]
        s.set_module_attribute("scope", "threshold", 0.5)
        s.profiles.save("B")
        original = s.config.replace_data
        failed = False
        def commit(data):
            nonlocal failed
            if not failed:
                failed = True
                raise OSError("disk full")
            original(data)
        with mock.patch.object(s.config, "replace_data", side_effect=commit):
            with self.assertRaises(OSError):
                s.profiles.load(a)
        self.assertEqual(s.scope_settings.threshold, 0.5)
        self.assertEqual(s.profiles.list()["active"]["name"], "B")

    def test_loading_stops_resource_owners_and_preserves_board_identity_and_curves(self):
        s = self.session
        curve = s.create_curve([0, 1], [1, 2], None, {"name": "measurement"})
        a = s.profiles.save("A")["active"]["id"]
        s.config.data["redpitaya"]["frequency_correction"] = 1.002
        s.config.save()
        s.call_module_action("spectrumanalyzer", "continuous")
        self.assertEqual(s.module_owners.get("scope"), "spectrumanalyzer")
        s.profiles.load(a)
        self.assertEqual(s.spectrum_settings.running_state, "stopped")
        self.assertFalse(any(s.module_owners.values()))
        self.assertEqual(s.config.data["redpitaya"]["frequency_correction"], 1.002)
        self.assertEqual(s.curve(curve["pk"])["name"], "measurement")

    def test_export_import_round_trip_does_not_change_live_settings(self):
        s = self.session
        s.set_module_attribute("scope", "threshold", 0.125)
        original = s.profiles.save("Original")["active"]["id"]
        exported = json.loads(json.dumps(s.profiles.export(original)))
        s.set_module_attribute("scope", "threshold", 0.5)
        s.call_module_action("scope", "continuous")
        before = s.client.stats.writes
        exported["id"] = "../../untrusted"
        exported["settings"]["redpitaya"] = {"hostname": "another-board"}
        result = s.profiles.import_profile(exported, name="Imported copy")
        imported = result["imported_id"]
        self.assertNotEqual(imported, original)
        self.assertEqual(result["active"]["id"], original)
        self.assertEqual(s.scope_settings.threshold, 0.5)
        self.assertEqual(s.scope_settings.running_state, "running_continuous")
        self.assertEqual(s.client.stats.writes, before)
        self.assertNotIn("redpitaya", s.profiles.export(imported)["settings"])
        s.profiles.load(imported)
        self.assertEqual(s.scope_settings.threshold, 0.125)
        self.assertEqual(s.profiles.list()["active"]["name"], "Imported copy")

    def test_invalid_import_never_writes_a_profile_or_live_hardware(self):
        s = self.session
        original = s.profiles.save("Original")["active"]["id"]
        exported = s.profiles.export(original)
        with self.assertRaises(ProfileConflict):
            s.profiles.import_profile(exported)
        invalid = [None, {}, {"version": 2}, {"version": 1, "settings": {}},
                   {**exported, "settings": {**exported["settings"], "pyrpl_websocket": []}}]
        broken = s.profiles.export(original)
        broken["settings"]["scope"]["trigger_source"] = "invalid"
        invalid.append(broken)
        before = s.client.stats.writes
        for profile in invalid:
            with self.subTest(profile=profile), self.assertRaises(ValueError):
                s.profiles.import_profile(profile, name="Rejected")
        self.assertEqual(s.client.stats.writes, before)
        self.assertEqual(len(s.profiles.list()["profiles"]), 1)


if __name__ == "__main__":
    unittest.main()
