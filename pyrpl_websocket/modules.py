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


def module_list() -> list[dict[str, Any]]:
    """Return the first module inventory for the web UI."""

    return [
        {
            "name": "scope",
            "kind": "hardware",
            "label": "Scope",
            "description": "Two-channel Red Pitaya oscilloscope controls and streaming data.",
        }
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
