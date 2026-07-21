import unittest
from unittest.mock import patch

import numpy as np

from pyrpl_websocket.hardware_validation import (
    HardwareValidationError,
    build_parser,
    frame_summary,
    selected_checks,
    run_validation,
    validate_asg_loopback,
    validate_network_self_loop,
    validate_options,
    validate_scope,
    validate_spectrum_capture,
)
from pyrpl_websocket.scope import make_scope_frame
from pyrpl_websocket.session import WebSession
from pyrpl_websocket.settings import ServerSettings


class HardwareValidationTest(unittest.TestCase):
    def test_write_checks_require_explicit_opt_in(self):
        options = build_parser().parse_args(["--hostname", "rp", "--scope"])
        self.assertEqual(selected_checks(options), ("scope",))
        with self.assertRaises(HardwareValidationError):
            validate_options(options)

        allowed = build_parser().parse_args(["--hostname", "rp", "--scope", "--allow-write"])
        validate_options(allowed)

    def test_frame_summary_requires_finite_two_channel_scope_data(self):
        frame = make_scope_frame(0, np.asarray([-0.5, 0.5], dtype=np.float32), np.asarray([0.0, 0.25], dtype=np.float32))
        summary = frame_summary(frame)
        self.assertEqual(summary["samples"], 2)
        self.assertAlmostEqual(summary["channels"][0]["peak_to_peak"], 1.0)

        invalid = make_scope_frame(0, np.asarray([np.nan], dtype=np.float32), np.asarray([0.0], dtype=np.float32))
        with self.assertRaises(HardwareValidationError):
            frame_summary(invalid)

    def test_write_enabled_checks_are_exercised_with_fake_hardware(self):
        session = WebSession(ServerSettings(hostname="_FAKE_"))
        try:
            self.assertEqual(validate_scope(session)["first"]["samples"], 2**14)
            self.assertEqual(validate_asg_loopback(session)["samples"], 2**14)
            self.assertEqual(validate_spectrum_capture(session)["samples"], 2**14)
            self.assertEqual(validate_network_self_loop(session, 1.0)["points"], 9)
        finally:
            session.close()

    def test_write_validation_probes_the_existing_session_client(self):
        options = build_parser().parse_args(["--hostname", "_FAKE_", "--allow-write", "--scope"])
        with patch("pyrpl_websocket.hardware_validation.probe_monitor", side_effect=AssertionError("second client opened")):
            report = run_validation(options)
        self.assertEqual(report["monitor"]["reads"], 1)
        self.assertEqual(report["scope"]["first"]["samples"], 2**14)
