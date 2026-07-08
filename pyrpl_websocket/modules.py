"""Qt-free module metadata for the web migration."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


SCOPE_INPUTS = [
    "in1",
    "in2",
    "out1",
    "out2",
    "asg0",
    "asg1",
    "trig",
    "iir",
    "pid0",
    "pid1",
    "pid2",
    "iq0",
    "iq1",
    "iq2",
    "iq2_2",
    "off",
]

SCOPE_TRIGGER_SOURCES = [
    "off",
    "immediately",
    "ch1_positive_edge",
    "ch1_negative_edge",
    "ch2_positive_edge",
    "ch2_negative_edge",
    "ext_positive_edge",
    "ext_negative_edge",
    "asg0",
    "asg1",
    "dsp",
]

SCOPE_DURATIONS = [8e-9 * (2**14) * (2**n) for n in range(17)]
SCOPE_RUN_MODES = ["single", "continuous", "rolling"]
SCOPE_RUNNING_STATES = [
    "stopped",
    "running_single",
    "running_continuous",
    "paused_single",
    "paused_continuous",
]
SCOPE_SETUP_ATTRIBUTES = [
    "input1",
    "input2",
    "trigger_source",
    "duration",
    "trigger_delay",
    "threshold",
    "hysteresis",
    "average",
    "trace_average",
    "run_mode",
]
SCOPE_ACTIONS = [
    {
        "name": "setup",
        "label": "Setup",
        "description": "Synchronize the current scope settings to hardware.",
    },
    {
        "name": "single",
        "label": "Single",
        "description": "Acquire one scope frame using the current settings.",
    },
    {
        "name": "continuous",
        "label": "Continuous",
        "description": "Start continuous acquisition streaming.",
    },
    {
        "name": "pause",
        "label": "Pause",
        "description": "Pause the current acquisition without clearing state.",
    },
    {
        "name": "resume",
        "label": "Resume",
        "description": "Resume a paused acquisition.",
    },
    {
        "name": "stop",
        "label": "Stop",
        "description": "Stop acquisition.",
    },
    {
        "name": "save_curve",
        "label": "Save Curve",
        "description": "Placeholder for saving the currently displayed browser curve.",
    },
    {
        "name": "trigger_test",
        "label": "Test Trigger",
        "description": "Evaluate the current trigger settings against one acquired frame.",
    },
]

ASG_WAVEFORMS = ["sin", "cos", "ramp", "halframp", "square", "dc"]
ASG_TRIGGER_SOURCES = ["off", "immediately", "ext_positive_edge", "ext_negative_edge", "ext_raw", "high"]
ASG_OUTPUT_DIRECTS = ["off", "out1", "out2", "both"]
ASG_SETUP_ATTRIBUTES = [
    "waveform",
    "amplitude",
    "offset",
    "frequency",
    "trigger_source",
    "output_direct",
    "start_phase",
    "cycles_per_burst",
]
ASG_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Synchronize ASG settings to hardware."},
    {"name": "trigger", "label": "Trigger", "description": "Send an immediate ASG trigger pulse."},
    {"name": "off", "label": "Off", "description": "Disable ASG output."},
]

HK_SETUP_ATTRIBUTES = (
    ["led"]
    + [f"expansion_P{index}" for index in range(8)]
    + [f"expansion_P{index}_output" for index in range(8)]
    + [f"expansion_N{index}" for index in range(8)]
    + [f"expansion_N{index}_output" for index in range(8)]
)


@dataclass
class ScopeSettings:
    """User-facing scope controls exposed by the web prototype."""

    input1: str = "in1"
    input2: str = "in2"
    trigger_source: str = "immediately"
    duration: float = 8e-9 * (2**14) * 2**13
    trigger_delay: float = 0.0
    threshold: float = 0.0
    hysteresis: float = 0.01
    average: bool = False
    trace_average: int = 1
    run_mode: str = "rolling"
    running_state: str = "stopped"
    last_action: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class AsgSettings:
    """User-facing ASG controls mirroring PyRPL's core ASG widget."""

    waveform: str = "sin"
    amplitude: float = 0.0
    offset: float = 0.0
    frequency: float = 1000.0
    trigger_source: str = "off"
    output_direct: str = "off"
    start_phase: float = 0.0
    cycles_per_burst: int = 0

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class HkSettings:
    """Housekeeping LED and expansion connector state."""

    led: int = 0
    expansion_P0: bool = False
    expansion_P1: bool = False
    expansion_P2: bool = False
    expansion_P3: bool = False
    expansion_P4: bool = False
    expansion_P5: bool = False
    expansion_P6: bool = False
    expansion_P7: bool = False
    expansion_P0_output: bool = True
    expansion_P1_output: bool = True
    expansion_P2_output: bool = True
    expansion_P3_output: bool = True
    expansion_P4_output: bool = True
    expansion_P5_output: bool = True
    expansion_P6_output: bool = True
    expansion_P7_output: bool = True
    expansion_N0: bool = False
    expansion_N1: bool = False
    expansion_N2: bool = False
    expansion_N3: bool = False
    expansion_N4: bool = False
    expansion_N5: bool = False
    expansion_N6: bool = False
    expansion_N7: bool = False
    expansion_N0_output: bool = True
    expansion_N1_output: bool = True
    expansion_N2_output: bool = True
    expansion_N3_output: bool = True
    expansion_N4_output: bool = True
    expansion_N5_output: bool = True
    expansion_N6_output: bool = True
    expansion_N7_output: bool = True

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def module_list() -> list[dict[str, Any]]:
    """Return the first module inventory for the web UI."""

    return [
        {
            "name": "scope",
            "kind": "hardware",
            "label": "Scope",
            "description": "Two-channel Red Pitaya oscilloscope controls and streaming data.",
        },
        {
            "name": "asg0",
            "kind": "hardware",
            "label": "ASG 0",
            "description": "Arbitrary signal generator channel 0.",
        },
        {
            "name": "asg1",
            "kind": "hardware",
            "label": "ASG 1",
            "description": "Arbitrary signal generator channel 1.",
        },
        {
            "name": "hk",
            "kind": "hardware",
            "label": "Housekeeping",
            "description": "LED and expansion connector digital I/O.",
        },
    ]


def scope_attribute_schema(settings: ScopeSettings) -> list[dict[str, Any]]:
    """Return schema for currently implemented scope controls."""

    return [
        _select("input1", "Input 1", settings.input1, SCOPE_INPUTS),
        _select("input2", "Input 2", settings.input2, SCOPE_INPUTS),
        _select("trigger_source", "Trigger", settings.trigger_source, SCOPE_TRIGGER_SOURCES),
        _select("run_mode", "Run Mode", settings.run_mode, SCOPE_RUN_MODES),
        _select("duration", "Duration", settings.duration, SCOPE_DURATIONS),
        _boolean("average", "FPGA Average", settings.average),
        _number("trace_average", "Trace Average", settings.trace_average, 1, 1024, step=1),
        _number("trigger_delay", "Trigger Delay", settings.trigger_delay, -10.0, 8e-9 * 2**30),
        _number("threshold", "Threshold", settings.threshold, -1.0, 1.0),
        _number("hysteresis", "Hysteresis", settings.hysteresis, 0.0, 1.0),
    ]


def scope_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in SCOPE_ACTIONS]


def asg_attribute_schema(settings: AsgSettings) -> list[dict[str, Any]]:
    return [
        _select("waveform", "Waveform", settings.waveform, ASG_WAVEFORMS),
        _number("amplitude", "Amplitude", settings.amplitude, 0.0, 1.0),
        _number("offset", "Offset", settings.offset, -1.0, 1.0),
        _number("frequency", "Frequency", settings.frequency, 0.0, 62.5e6),
        _select("trigger_source", "Trigger", settings.trigger_source, ASG_TRIGGER_SOURCES),
        _select("output_direct", "Output", settings.output_direct, ASG_OUTPUT_DIRECTS),
        _number("start_phase", "Start Phase", settings.start_phase, 0.0, 360.0),
        _number("cycles_per_burst", "Cycles/Burst", settings.cycles_per_burst, 0, 2**32 - 1, step=1),
    ]


def asg_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in ASG_ACTIONS]


def hk_attribute_schema(settings: HkSettings) -> list[dict[str, Any]]:
    attributes: list[dict[str, Any]] = [_number("led", "LED", settings.led, 0, 255, step=1)]
    for sign in ("P", "N"):
        for index in range(8):
            name = f"expansion_{sign}{index}"
            attributes.append(_boolean(name, f"{sign}{index}", getattr(settings, name)))
            direction = f"{name}_output"
            attributes.append(_boolean(direction, f"{sign}{index} Output", getattr(settings, direction)))
    return attributes


def hk_actions() -> list[dict[str, Any]]:
    return []


def set_scope_attribute(settings: ScopeSettings, name: str, value: Any) -> Any:
    """Validate and update a scope setting."""

    if name in {"input1", "input2"}:
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    elif name == "trigger_source":
        normalized = _require_option(name, str(value), SCOPE_TRIGGER_SOURCES)
    elif name == "run_mode":
        normalized = _require_option(name, str(value), SCOPE_RUN_MODES)
    elif name == "running_state":
        normalized = _require_option(name, str(value), SCOPE_RUNNING_STATES)
    elif name == "duration":
        normalized = _nearest_duration(float(value))
    elif name == "average":
        normalized = bool(value)
    elif name == "trace_average":
        normalized = int(round(_clamp(float(value), 1, 1024)))
    elif name == "trigger_delay":
        normalized = _clamp(float(value), -10.0, 8e-9 * 2**30)
    elif name == "threshold":
        normalized = _clamp(float(value), -1.0, 1.0)
    elif name == "hysteresis":
        normalized = _clamp(float(value), 0.0, 1.0)
    else:
        raise KeyError(name)

    setattr(settings, name, normalized)
    return normalized


def set_asg_attribute(settings: AsgSettings, name: str, value: Any) -> Any:
    if name == "waveform":
        normalized = _require_option(name, str(value), ASG_WAVEFORMS)
    elif name == "trigger_source":
        normalized = _require_option(name, str(value), ASG_TRIGGER_SOURCES)
    elif name == "output_direct":
        normalized = _require_option(name, str(value), ASG_OUTPUT_DIRECTS)
    elif name == "amplitude":
        normalized = _clamp(float(value), 0.0, 1.0)
    elif name == "offset":
        normalized = _clamp(float(value), -1.0, 1.0)
    elif name == "frequency":
        normalized = _clamp(float(value), 0.0, 62.5e6)
    elif name == "start_phase":
        normalized = float(value) % 360.0
    elif name == "cycles_per_burst":
        normalized = int(round(_clamp(float(value), 0, 2**32 - 1)))
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_hk_attribute(settings: HkSettings, name: str, value: Any) -> Any:
    if name == "led":
        normalized = int(round(_clamp(float(value), 0, 255)))
    elif name in HK_SETUP_ATTRIBUTES and name != "led":
        normalized = bool(value)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def _select(name: str, label: str, value: Any, options: list[Any]) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "select", "value": value, "options": options}


def _boolean(name: str, label: str, value: bool) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "bool", "value": value}


def _number(
    name: str,
    label: str,
    value: float,
    minimum: float,
    maximum: float,
    step: float | None = None,
) -> dict[str, Any]:
    schema = {
        "name": name,
        "label": label,
        "type": "number",
        "value": value,
        "min": minimum,
        "max": maximum,
    }
    if step is not None:
        schema["step"] = step
    return schema


def _require_option(name: str, value: str, options: list[str]) -> str:
    if value not in options:
        raise ValueError(f"{name} must be one of {options}")
    return value


def _nearest_duration(value: float) -> float:
    if value <= min(SCOPE_DURATIONS):
        return min(SCOPE_DURATIONS)
    if value >= max(SCOPE_DURATIONS):
        return max(SCOPE_DURATIONS)
    return min(duration for duration in SCOPE_DURATIONS if duration >= value)


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))
