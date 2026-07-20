"""Opt-in live Red Pitaya checks for the web migration.

The command is intentionally read-only unless ``--allow-write`` is supplied.
Acquisition checks reconfigure FPGA modules and therefore belong only on a
dedicated validation board, never on a live experiment.
"""

from __future__ import annotations

import argparse
import json
from typing import Any, Sequence

import numpy as np

from .monitor_client import MonitorClient
from .scope import SCOPE_ADDR_BASE, ScopeFrame
from .session import WebSession
from .settings import ServerSettings


class HardwareValidationError(RuntimeError):
    """A live hardware check could not establish the expected invariant."""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate PyRPL web hardware behavior on a dedicated Red Pitaya.")
    parser.add_argument("--hostname", required=True, help="Red Pitaya hostname or IP address")
    parser.add_argument("--port", type=int, default=2222, help="monitor_server TCP port (default: 2222)")
    parser.add_argument("--allow-write", action="store_true", help="Allow FPGA reconfiguration for selected checks")
    parser.add_argument("--scope", action="store_true", help="Capture two immediate Scope frames")
    parser.add_argument("--asg-loopback", action="store_true", help="Check internal ASG0-to-Scope routing")
    parser.add_argument("--spectrum", action="store_true", help="Check Spectrum Analyzer's hardware Scope capture path")
    parser.add_argument("--network", action="store_true", help="Check Network Analyzer's internal IQ self-loop")
    parser.add_argument("--network-unity-tolerance", type=float, default=0.2, help="Allowed relative unity error")
    parser.add_argument("--json", action="store_true", help="Emit the result as JSON")
    return parser


def selected_checks(options: argparse.Namespace) -> tuple[str, ...]:
    return tuple(name for name in ("scope", "asg_loopback", "spectrum", "network") if getattr(options, name))


def validate_options(options: argparse.Namespace) -> None:
    if selected_checks(options) and not options.allow_write:
        raise HardwareValidationError("hardware acquisition checks require --allow-write")
    if options.network_unity_tolerance <= 0:
        raise HardwareValidationError("--network-unity-tolerance must be positive")


def frame_summary(frame: ScopeFrame) -> dict[str, Any]:
    samples = frame.samples()
    if samples.shape[0] == 0 or samples.shape[1] != 2:
        raise HardwareValidationError("Scope did not return two nonempty channels")
    if not np.isfinite(samples).all():
        raise HardwareValidationError("Scope frame contains non-finite samples")
    channels = []
    for channel in range(2):
        values = samples[:, channel].astype(np.float64, copy=False)
        channels.append(
            {
                "min": float(np.min(values)),
                "max": float(np.max(values)),
                "peak_to_peak": float(np.ptp(values)),
                "rms": float(np.sqrt(np.mean(values**2))),
            }
        )
    return {"samples": int(samples.shape[0]), "channels": channels}


def probe_monitor(hostname: str, port: int) -> dict[str, Any]:
    client = MonitorClient(hostname, port)
    try:
        control = int(client.reads(SCOPE_ADDR_BASE, 1)[0])
        return {"scope_control": control, "reads": client.stats.reads, "writes": client.stats.writes}
    finally:
        client.close()


def _capture_scope(session: WebSession, sequence: int) -> ScopeFrame:
    session.set_module_attribute("scope", "input1", "in1")
    session.set_module_attribute("scope", "input2", "in2")
    session.set_module_attribute("scope", "duration", 8e-9 * (2**14) * 8)
    session.set_module_attribute("scope", "rolling_mode", False)
    session.set_module_attribute("scope", "trigger_source", "immediately")
    session.set_module_attribute("scope", "trace_average", 1)
    session.call_module_action("scope", "single")
    acquisition = session.acquire_scope_frame(sequence, 2**14)
    if acquisition.frame is None:
        raise HardwareValidationError("Scope acquisition produced no frame")
    return acquisition.frame


def validate_scope(session: WebSession) -> dict[str, Any]:
    first = _capture_scope(session, 0)
    second = _capture_scope(session, 1)
    first_summary = frame_summary(first)
    second_summary = frame_summary(second)
    return {"first": first_summary, "second": second_summary}


def _configure_asg0_test_tone(session: WebSession) -> None:
    session.set_module_attribute("asg0", "waveform", "sin")
    session.set_module_attribute("asg0", "frequency", 100_000.0)
    session.set_module_attribute("asg0", "amplitude", 0.5)
    session.set_module_attribute("asg0", "offset", 0.0)
    session.set_module_attribute("asg0", "trigger_source", "high")
    session.call_module_action("asg0", "setup")


def validate_asg_loopback(session: WebSession) -> dict[str, Any]:
    _configure_asg0_test_tone(session)
    session.set_module_attribute("scope", "input1", "asg0")
    session.set_module_attribute("scope", "input2", "asg0")
    session.set_module_attribute("scope", "duration", 8e-9 * (2**14) * 8)
    session.set_module_attribute("scope", "rolling_mode", False)
    session.set_module_attribute("scope", "trigger_source", "immediately")
    session.call_module_action("scope", "single")
    acquisition = session.acquire_scope_frame(0, 2**14)
    if acquisition.frame is None:
        raise HardwareValidationError("ASG loopback produced no Scope frame")
    summary = frame_summary(acquisition.frame)
    if summary["channels"][0]["peak_to_peak"] < 0.1:
        raise HardwareValidationError("ASG loopback peak-to-peak amplitude is below 0.1 V")
    return summary


def validate_spectrum_capture(session: WebSession) -> dict[str, Any]:
    _configure_asg0_test_tone(session)
    session.set_module_attribute("spectrumanalyzer", "baseband", True)
    session.set_module_attribute("spectrumanalyzer", "span", 1e6)
    session.set_module_attribute("spectrumanalyzer", "input1_baseband", "asg0")
    session.set_module_attribute("spectrumanalyzer", "input2_baseband", "asg0")
    session.set_module_attribute("spectrumanalyzer", "trace_average", 1)
    session.call_module_action("spectrumanalyzer", "single")
    frame = session.acquire_spectrum_scope_frame(0, 2**14)
    if frame is None:
        raise HardwareValidationError("Spectrum Analyzer hardware capture produced no Scope frame")
    return frame_summary(frame)


def validate_network_self_loop(session: WebSession, tolerance: float) -> dict[str, Any]:
    session.set_module_attribute("networkanalyzer", "input", "networkanalyzer")
    session.set_module_attribute("networkanalyzer", "start_freq", 10_000.0)
    session.set_module_attribute("networkanalyzer", "stop_freq", 100_000.0)
    session.set_module_attribute("networkanalyzer", "points", 9)
    session.set_module_attribute("networkanalyzer", "rbw", 10_000.0)
    session.set_module_attribute("networkanalyzer", "average_per_point", 1)
    session.set_module_attribute("networkanalyzer", "trace_average", 1)
    session.set_module_attribute("networkanalyzer", "amplitude", 0.1)
    session.set_module_attribute("networkanalyzer", "auto_bandwidth", False)
    session.set_module_attribute("networkanalyzer", "auto_amplitude", False)
    session.call_module_action("networkanalyzer", "single")
    points = [session.acquire_network_analyzer_point() for _ in range(9)]
    values = np.asarray([complex(point["real"], point["imag"]) for point in points], dtype=np.complex128)
    if not np.isfinite(values.real).all() or not np.isfinite(values.imag).all():
        raise HardwareValidationError("Network Analyzer returned non-finite points")
    magnitude = np.abs(values)
    relative_error = float(np.max(np.abs(magnitude - 1.0)))
    if relative_error > tolerance:
        raise HardwareValidationError(
            f"Network Analyzer self-loop unity error {relative_error:.3g} exceeds {tolerance:.3g}"
        )
    return {
        "points": len(points),
        "magnitude_min": float(np.min(magnitude)),
        "magnitude_max": float(np.max(magnitude)),
        "max_unity_error": relative_error,
    }


def run_validation(options: argparse.Namespace) -> dict[str, Any]:
    validate_options(options)
    report: dict[str, Any] = {"hostname": options.hostname, "port": options.port, "monitor": probe_monitor(options.hostname, options.port)}
    checks = selected_checks(options)
    if not checks:
        return report

    session = WebSession(ServerSettings(hostname=options.hostname, port=options.port))
    try:
        if options.scope:
            report["scope"] = validate_scope(session)
        if options.asg_loopback:
            report["asg_loopback"] = validate_asg_loopback(session)
        if options.spectrum:
            report["spectrum_capture"] = validate_spectrum_capture(session)
        if options.network:
            report["network_self_loop"] = validate_network_self_loop(session, options.network_unity_tolerance)
        return report
    finally:
        # Leave a dedicated validation board in an inert state.
        try:
            session.call_module_action("spectrumanalyzer", "stop")
            session.call_module_action("networkanalyzer", "stop")
            session.call_module_action("scope", "stop")
            session.call_module_action("asg0", "off")
        finally:
            session.close()


def main(argv: Sequence[str] | None = None) -> int:
    options = build_parser().parse_args(argv)
    try:
        report = run_validation(options)
    except (ConnectionError, HardwareValidationError, RuntimeError, ValueError) as exc:
        print(f"hardware validation failed: {exc}")
        return 1
    print(json.dumps(report, indent=2, sort_keys=True) if options.json else report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
