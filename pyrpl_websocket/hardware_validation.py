"""Opt-in live Red Pitaya checks for the web migration.

The command is intentionally read-only unless ``--allow-write`` is supplied.
Acquisition checks reconfigure FPGA modules and therefore belong only on a
dedicated validation board, never on a live experiment.
"""

from __future__ import annotations

import argparse
import json
import time
from typing import Any, Sequence

import numpy as np

from .monitor_client import MonitorClient
from .scope import SCOPE_ADDR_BASE, SCOPE_DATA_LENGTH, ScopeFrame
from .scope_registers import SCOPE_DECIMATION_ADDR
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
    parser.add_argument("--scope-behavior", action="store_true", help="Check Scope trigger, rearm, rolling, and decimation behavior")
    parser.add_argument("--asg-loopback", action="store_true", help="Check internal ASG0-to-Scope routing")
    parser.add_argument("--spectrum", action="store_true", help="Check Spectrum Analyzer's hardware Scope capture path")
    parser.add_argument("--network", action="store_true", help="Check Network Analyzer's internal IQ self-loop")
    parser.add_argument(
        "--network-external-loop",
        action="store_true",
        help="Check Network Analyzer through physical OUT0->IN0 (PyRPL out1->in1)",
    )
    parser.add_argument("--network-unity-tolerance", type=float, default=0.2, help="Allowed relative unity error")
    parser.add_argument("--json", action="store_true", help="Emit the result as JSON")
    return parser


def selected_checks(options: argparse.Namespace) -> tuple[str, ...]:
    return tuple(
        name
        for name in ("scope", "scope_behavior", "asg_loopback", "spectrum", "network", "network_external_loop")
        if getattr(options, name)
    )


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
        return probe_client(client)
    finally:
        client.close()


def probe_client(client: MonitorClient) -> dict[str, Any]:
    """Probe an already-open compatible monitor-server client."""

    control = int(client.reads(SCOPE_ADDR_BASE, 1)[0])
    return {"scope_control": control, "reads": client.stats.reads, "writes": client.stats.writes}


def _capture_scope(session: WebSession, sequence: int) -> ScopeFrame:
    session.set_module_attribute("scope", "input1", "in1")
    session.set_module_attribute("scope", "input2", "in2")
    session.set_module_attribute("scope", "duration", 8e-9 * (2**14) * 8)
    session.set_module_attribute("scope", "rolling_mode", False)
    session.set_module_attribute("scope", "trigger_source", "immediately")
    session.set_module_attribute("scope", "trace_average", 1)
    session.call_module_action("scope", "single")
    acquisition = session.acquire_scope_frame(sequence, 2**14, wait=True)
    if acquisition.frame is None:
        raise HardwareValidationError("Scope acquisition produced no frame")
    return acquisition.frame


def validate_scope(session: WebSession) -> dict[str, Any]:
    first = _capture_scope(session, 0)
    second = _capture_scope(session, 1)
    first_summary = frame_summary(first)
    second_summary = frame_summary(second)
    return {"first": first_summary, "second": second_summary}


def _scope_decimation(session: WebSession) -> int:
    return int(session.client.reads(SCOPE_DECIMATION_ADDR, 1)[0])


def _require_frame(acquisition, check: str) -> ScopeFrame:
    if acquisition.frame is None:
        raise HardwareValidationError(f"{check} produced no Scope frame")
    return acquisition.frame


def validate_scope_behavior(session: WebSession) -> dict[str, Any]:
    """Check the original Scope trigger and rolling acquisition paths on one board."""

    _configure_asg0_test_tone(session)
    base_duration = 8e-9 * SCOPE_DATA_LENGTH
    edge_duration = base_duration * 8
    session.set_module_attribute("scope", "input1", "asg0")
    session.set_module_attribute("scope", "input2", "asg0")
    session.set_module_attribute("scope", "duration", edge_duration)
    session.set_module_attribute("scope", "rolling_mode", False)
    session.set_module_attribute("scope", "trigger_source", "ch1_positive_edge")
    session.set_module_attribute("scope", "threshold", 0.0)
    session.set_module_attribute("scope", "hysteresis", 0.01)
    session.set_module_attribute("scope", "trigger_delay", 0.0)
    session.set_module_attribute("scope", "trace_average", 1)
    session.call_module_action("scope", "single")
    edge_frame = _require_frame(session.acquire_scope_frame(0, SCOPE_DATA_LENGTH, wait=True), "edge-triggered Scope acquisition")
    if session.scope_settings.running_state != "paused_single":
        raise HardwareValidationError("single Scope capture did not enter paused_single")
    if session.acquire_scope_frame(1, SCOPE_DATA_LENGTH, wait=True).frame is not None:
        raise HardwareValidationError("paused single Scope capture accepted another frame before rearm")
    session.call_module_action("scope", "resume_single")
    rearmed_frame = _require_frame(session.acquire_scope_frame(2, SCOPE_DATA_LENGTH, wait=True), "rearmed single Scope acquisition")
    if session.scope_settings.running_state != "paused_single":
        raise HardwareValidationError("rearmed single Scope capture did not return to paused_single")
    single_rearm_state = session.scope_settings.running_state

    samples = edge_frame.samples()[:, 0].astype(np.float64, copy=False)
    trigger_slot = edge_frame.sample_count // 2
    radius = 32
    region = samples[trigger_slot - radius : trigger_slot + radius + 1]
    local_index = int(np.argmin(np.abs(region)))
    trigger_index = trigger_slot - radius + local_index
    if abs(float(samples[trigger_index])) > 0.08:
        raise HardwareValidationError("edge-triggered Scope frame has no near-zero crossing at trigger time")
    if trigger_index < 2 or trigger_index >= edge_frame.sample_count - 2 or samples[trigger_index + 2] <= samples[trigger_index - 2]:
        raise HardwareValidationError("edge-triggered Scope frame is not rising at trigger time")

    short_decimation = _scope_decimation(session)
    long_duration = base_duration * 64
    session.set_module_attribute("scope", "duration", long_duration)
    session.call_module_action("scope", "setup")
    long_decimation = _scope_decimation(session)
    if short_decimation != 8 or long_decimation != 64:
        raise HardwareValidationError(
            f"Scope decimation registers were {short_decimation} and {long_decimation}, expected 8 and 64"
        )

    rolling_duration = base_duration * 1024
    session.set_module_attribute("asg0", "frequency", 25_000.0)
    session.call_module_action("asg0", "setup")
    session.set_module_attribute("scope", "duration", rolling_duration)
    session.set_module_attribute("scope", "rolling_mode", True)
    session.set_module_attribute("scope", "trigger_source", "immediately")
    session.call_module_action("scope", "continuous")
    first_rolling = _require_frame(session.acquire_scope_frame(3, SCOPE_DATA_LENGTH, wait=True), "first rolling Scope acquisition")
    time.sleep(min(0.3, rolling_duration * 1.25))
    second_rolling = _require_frame(session.acquire_scope_frame(4, SCOPE_DATA_LENGTH, wait=True), "second rolling Scope acquisition")
    first_samples = first_rolling.samples()[:, 0]
    second_samples = second_rolling.samples()[:, 0]
    finite = np.isfinite(first_samples) & np.isfinite(second_samples)
    if int(np.count_nonzero(finite)) < SCOPE_DATA_LENGTH // 2:
        raise HardwareValidationError("rolling Scope frames contain too few finite samples")
    if float(np.max(np.abs(first_samples[finite] - second_samples[finite]))) < 1e-3:
        raise HardwareValidationError("rolling Scope frames did not update")

    return {
        "edge_trigger": {
            "trigger_index": trigger_index,
            "trigger_voltage": float(samples[trigger_index]),
            "samples": edge_frame.sample_count,
        },
        "single_rearm": {"samples": rearmed_frame.sample_count, "state": single_rearm_state},
        "decimation": {
            "short_duration": edge_duration,
            "short_register": short_decimation,
            "long_duration": long_duration,
            "long_register": long_decimation,
        },
        "rolling": {"duration": rolling_duration, "finite_samples": int(np.count_nonzero(finite))},
    }


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
    acquisition = session.acquire_scope_frame(0, 2**14, wait=True)
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
    frame = session.acquire_spectrum_scope_frame(0, 2**14, wait=True)
    if frame is None:
        raise HardwareValidationError("Spectrum Analyzer hardware capture produced no Scope frame")
    return frame_summary(frame)


def _configure_network_validation(session: WebSession, *, input_signal: str, output_direct: str) -> None:
    session.set_module_attribute("networkanalyzer", "input", input_signal)
    session.set_module_attribute("networkanalyzer", "output_direct", output_direct)
    session.set_module_attribute("networkanalyzer", "start_freq", 10_000.0)
    session.set_module_attribute("networkanalyzer", "stop_freq", 100_000.0)
    session.set_module_attribute("networkanalyzer", "points", 9)
    session.set_module_attribute("networkanalyzer", "rbw", 10_000.0)
    session.set_module_attribute("networkanalyzer", "average_per_point", 1)
    session.set_module_attribute("networkanalyzer", "trace_average", 1)
    session.set_module_attribute("networkanalyzer", "amplitude", 0.1)
    session.set_module_attribute("networkanalyzer", "acbandwidth", 0.0)
    session.set_module_attribute("networkanalyzer", "logscale", False)
    session.set_module_attribute("networkanalyzer", "auto_bandwidth", False)
    session.set_module_attribute("networkanalyzer", "auto_amplitude", False)


def _run_network_validation(session: WebSession) -> np.ndarray:
    session.call_module_action("networkanalyzer", "single")
    points = [session.acquire_network_analyzer_point() for _ in range(9)]
    return np.asarray([complex(point["real"], point["imag"]) for point in points], dtype=np.complex128)


def validate_network_self_loop(session: WebSession, tolerance: float) -> dict[str, Any]:
    _configure_network_validation(session, input_signal="networkanalyzer", output_direct="off")
    values = _run_network_validation(session)
    if not np.isfinite(values.real).all() or not np.isfinite(values.imag).all():
        raise HardwareValidationError("Network Analyzer returned non-finite points")
    magnitude = np.abs(values)
    relative_error = float(np.max(np.abs(magnitude - 1.0)))
    if relative_error > tolerance:
        raise HardwareValidationError(
            f"Network Analyzer self-loop unity error {relative_error:.3g} exceeds {tolerance:.3g}"
        )
    return {
        "points": len(values),
        "magnitude_min": float(np.min(magnitude)),
        "magnitude_max": float(np.max(magnitude)),
        "max_unity_error": relative_error,
    }


def validate_network_external_loop(session: WebSession) -> dict[str, Any]:
    """Check the physical DAC/cable/ADC Network Analyzer path.

    Analog calibration determines the cable-path gain, so the legacy-reference
    comparison owns numerical parity instead of imposing an invented unity
    target here.
    """

    _configure_network_validation(session, input_signal="in1", output_direct="out1")
    values = _run_network_validation(session)
    if not np.isfinite(values.real).all() or not np.isfinite(values.imag).all():
        raise HardwareValidationError("External-loop Network Analyzer returned non-finite points")
    magnitude = np.abs(values)
    if float(np.median(magnitude)) < 0.02:
        raise HardwareValidationError("External OUT0->IN0 Network Analyzer response is too small")
    return {
        "physical_loop": "OUT0->IN0 (PyRPL out1->in1)",
        "points": int(len(values)),
        "magnitude_min": float(np.min(magnitude)),
        "magnitude_max": float(np.max(magnitude)),
        "median_magnitude": float(np.median(magnitude)),
    }


def run_validation(options: argparse.Namespace) -> dict[str, Any]:
    validate_options(options)
    checks = selected_checks(options)
    if not checks:
        return {"hostname": options.hostname, "port": options.port, "monitor": probe_monitor(options.hostname, options.port)}

    session = WebSession(ServerSettings(hostname=options.hostname, port=options.port))
    try:
        # monitor_server accepts one client and exits when that client closes.
        # Keep the probe on this session's connection before running writes.
        report: dict[str, Any] = {
            "hostname": options.hostname,
            "port": options.port,
            "monitor": probe_client(session.client),
        }
        if options.scope:
            report["scope"] = validate_scope(session)
        if options.scope_behavior:
            report["scope_behavior"] = validate_scope_behavior(session)
        if options.asg_loopback:
            report["asg_loopback"] = validate_asg_loopback(session)
        if options.spectrum:
            report["spectrum_capture"] = validate_spectrum_capture(session)
        if options.network:
            report["network_self_loop"] = validate_network_self_loop(session, options.network_unity_tolerance)
        if options.network_external_loop:
            report["network_external_loop"] = validate_network_external_loop(session)
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
