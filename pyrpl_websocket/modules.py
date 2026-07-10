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

DSP_OUTPUT_DIRECTS = ["off", "out1", "out2", "both"]
PID_PAUSE_GAINS = ["off", "i", "p", "pi", "d", "id", "pd", "pid"]
PID_SETUP_ATTRIBUTES = [
    "input",
    "output_direct",
    "setpoint",
    "p",
    "i",
    "ival",
    "max_voltage",
    "min_voltage",
    "pause_gains",
    "paused",
    "differential_mode_enabled",
]
PID_ACTIONS = [{"name": "setup", "label": "Setup", "description": "Synchronize PID settings to hardware."}]

IQ_OUTPUT_SIGNALS = ["quadrature", "output_direct", "pfd", "off", "quadrature_hf"]
IQ_TOGGLE_OPTIONS = ["off", "on"]
IQ_SETUP_ATTRIBUTES = [
    "input",
    "output_direct",
    "output_signal",
    "frequency",
    "phase",
    "gain",
    "amplitude",
    "quadrature_factor",
    "modulation_at_2f",
    "demodulation_at_2f",
    "on",
    "pfd_on",
]
IQ_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Synchronize IQ settings and phase-align IQ modules."},
    {"name": "sync", "label": "Sync", "description": "Synchronize the IQ module phases."},
]

TRIG_TRIGGER_SOURCES = ["off", "pos_edge", "neg_edge", "both_edge"]
TRIG_OUTPUT_SIGNALS = ["TTL", "asg0_phase"]
TRIG_SETUP_ATTRIBUTES = [
    "input",
    "output_direct",
    "output_signal",
    "trigger_source",
    "threshold",
    "hysteresis",
    "phase_offset",
    "auto_rearm",
    "phase_abs",
]
TRIG_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Synchronize trigger settings and arm it."},
    {"name": "arm", "label": "Arm", "description": "Arm the trigger module."},
]

PWM_SETUP_ATTRIBUTES = ["input"]
PWM_ACTIONS = [{"name": "setup", "label": "Setup", "description": "Synchronize PWM input routing."}]

SPECTRUM_WINDOWS = ["blackman", "flattop", "boxcar", "hamming", "gaussian"]
SPECTRUM_DISPLAY_UNITS = [
    "Vpk^2",
    "dB(Vpk^2)",
    "Vpk",
    "Vrms^2",
    "dB(Vrms^2)",
    "Vrms",
    "Vrms^2/Hz",
    "dB(Vrms^2/Hz)",
    "Vrms/sqrt(Hz)",
]
SPECTRUM_SPANS = [1.0 / (8e-9 * (2**index)) for index in range(17)]
SPECTRUM_SETUP_ATTRIBUTES = [
    "input",
    "center",
    "baseband",
    "span",
    "window",
    "acbandwidth",
    "display_unit",
    "input1_baseband",
    "input2_baseband",
    "display_input1_baseband",
    "display_input2_baseband",
    "display_cross_amplitude",
    "trace_average",
]
SPECTRUM_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Reserve resources and configure spectrum acquisition."},
    {"name": "single", "label": "Single", "description": "Acquire one spectrum frame."},
    {"name": "continuous", "label": "Continuous", "description": "Start continuous spectrum polling."},
    {"name": "pause", "label": "Pause", "description": "Pause continuous spectrum polling."},
    {"name": "resume", "label": "Resume", "description": "Resume continuous spectrum polling."},
    {"name": "stop", "label": "Stop", "description": "Stop spectrum acquisition and release resources."},
    {"name": "release", "label": "Release", "description": "Release spectrum analyzer resources."},
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


@dataclass
class PidSettings:
    """Core PID controls mirroring PyRPL's fixed-point PID registers."""

    input: str = "off"
    output_direct: str = "off"
    setpoint: float = 0.0
    p: float = 0.0
    i: float = 0.0
    ival: float = 0.0
    max_voltage: float = 1.0
    min_voltage: float = -1.0
    pause_gains: str = "off"
    paused: bool = False
    differential_mode_enabled: bool = False

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class IqSettings:
    """Core IQ controls for modulation/demodulation and DSP routing."""

    input: str = "off"
    output_direct: str = "off"
    output_signal: str = "quadrature"
    frequency: float = 0.0
    phase: float = 0.0
    gain: float = 0.0
    amplitude: float = 0.0
    quadrature_factor: float = 1.0
    modulation_at_2f: str = "off"
    demodulation_at_2f: str = "off"
    on: bool = True
    pfd_on: bool = False

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class TrigSettings:
    """Core trigger module controls."""

    input: str = "off"
    output_direct: str = "off"
    output_signal: str = "TTL"
    trigger_source: str = "off"
    threshold: float = 0.0
    hysteresis: float = 0.01
    phase_offset: float = 0.0
    auto_rearm: bool = False
    phase_abs: bool = False
    armed: bool = False

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class PwmSettings:
    """PWM input routing controls."""

    input: str = "off"

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class SpectrumAnalyzerSettings:
    """Spectrum analyzer settings following PyRPL's IQ-plus-scope composition."""

    input: str = "in1"
    center: float = 0.0
    baseband: bool = True
    span: float = SPECTRUM_SPANS[7]
    window: str = "blackman"
    acbandwidth: float = 0.0
    display_unit: str = "dB(Vpk^2)"
    input1_baseband: str = "in1"
    input2_baseband: str = "in2"
    display_input1_baseband: bool = True
    display_input2_baseband: bool = True
    display_cross_amplitude: bool = True
    trace_average: int = 1
    running_state: str = "stopped"
    last_action: str | None = None
    iq_module: str = "iq2"

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
        {
            "name": "trig",
            "kind": "hardware",
            "label": "Trigger",
            "description": "Full-rate DSP trigger module.",
        },
        *[
            {
                "name": f"pid{index}",
                "kind": "hardware",
                "label": f"PID {index}",
                "description": f"PID controller channel {index}.",
            }
            for index in range(3)
        ],
        *[
            {
                "name": f"iq{index}",
                "kind": "hardware",
                "label": f"IQ {index}",
                "description": f"IQ modulator/demodulator channel {index}.",
            }
            for index in range(3)
        ],
        *[
            {
                "name": f"pwm{index}",
                "kind": "hardware",
                "label": f"PWM {index}",
                "description": f"PWM auxiliary output routing channel {index}.",
            }
            for index in range(2)
        ],
        {
            "name": "spectrumanalyzer",
            "kind": "software",
            "label": "Spectrum Analyzer",
            "description": "FFT spectrum analyzer using the scope and IQ demodulator resources.",
        },
        {
            "name": "lockbox",
            "kind": "software",
            "label": "Lockbox",
            "description": "Model-based feedback lock sequence with dynamic inputs, outputs, and stages.",
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


def pid_attribute_schema(settings: PidSettings) -> list[dict[str, Any]]:
    return [
        _select("input", "Input", settings.input, SCOPE_INPUTS),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _number("setpoint", "Setpoint", settings.setpoint, -1.0, 1.0),
        _number("p", "P Gain", settings.p, -2048.0, 2047.999755859375),
        _number("i", "I Unity Hz", settings.i, -38836.0, 38836.0),
        _number("ival", "I Value", settings.ival, -4.0, 4.0),
        _number("min_voltage", "Min Voltage", settings.min_voltage, -1.0, 1.0),
        _number("max_voltage", "Max Voltage", settings.max_voltage, -1.0, 1.0),
        _select("pause_gains", "Pause Gains", settings.pause_gains, PID_PAUSE_GAINS),
        _boolean("paused", "Paused", settings.paused),
        _boolean("differential_mode_enabled", "Differential", settings.differential_mode_enabled),
    ]


def pid_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in PID_ACTIONS]


def iq_attribute_schema(settings: IqSettings) -> list[dict[str, Any]]:
    return [
        _select("input", "Input", settings.input, SCOPE_INPUTS),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _select("output_signal", "Signal", settings.output_signal, IQ_OUTPUT_SIGNALS),
        _number("frequency", "Frequency", settings.frequency, 0.0, 62.5e6),
        _number("phase", "Phase", settings.phase, 0.0, 360.0),
        _number("gain", "Gain", settings.gain, -64.0, 64.0),
        _number("amplitude", "Amplitude", settings.amplitude, -1.0, 1.0),
        _number("quadrature_factor", "Quadrature", settings.quadrature_factor, -131071.0, 131071.0),
        _select("modulation_at_2f", "Mod 2f", settings.modulation_at_2f, IQ_TOGGLE_OPTIONS),
        _select("demodulation_at_2f", "Demod 2f", settings.demodulation_at_2f, IQ_TOGGLE_OPTIONS),
        _boolean("on", "On", settings.on),
        _boolean("pfd_on", "PFD", settings.pfd_on),
    ]


def iq_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in IQ_ACTIONS]


def trig_attribute_schema(settings: TrigSettings) -> list[dict[str, Any]]:
    return [
        _select("input", "Input", settings.input, SCOPE_INPUTS),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _select("output_signal", "Signal", settings.output_signal, TRIG_OUTPUT_SIGNALS),
        _select("trigger_source", "Trigger", settings.trigger_source, TRIG_TRIGGER_SOURCES),
        _number("threshold", "Threshold", settings.threshold, -1.0, 1.0),
        _number("hysteresis", "Hysteresis", settings.hysteresis, -1.0, 1.0),
        _number("phase_offset", "Phase Offset", settings.phase_offset, 0.0, 360.0),
        _boolean("auto_rearm", "Auto Rearm", settings.auto_rearm),
        _boolean("phase_abs", "Phase Abs", settings.phase_abs),
        _boolean("armed", "Armed", settings.armed),
    ]


def trig_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in TRIG_ACTIONS]


def pwm_attribute_schema(settings: PwmSettings) -> list[dict[str, Any]]:
    return [_select("input", "Input", settings.input, SCOPE_INPUTS)]


def pwm_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in PWM_ACTIONS]


def spectrum_attribute_schema(settings: SpectrumAnalyzerSettings) -> list[dict[str, Any]]:
    return [
        _select("input", "Input", settings.input, SCOPE_INPUTS),
        _number("center", "Center", settings.center, -62.5e6, 62.5e6),
        _boolean("baseband", "Baseband", settings.baseband),
        _select("span", "Span", settings.span, SPECTRUM_SPANS),
        _select("window", "Window", settings.window, SPECTRUM_WINDOWS),
        _number("acbandwidth", "AC BW", settings.acbandwidth, 0.0, 62.5e6),
        _select("display_unit", "Unit", settings.display_unit, SPECTRUM_DISPLAY_UNITS),
        _select("input1_baseband", "BB Input 1", settings.input1_baseband, SCOPE_INPUTS),
        _select("input2_baseband", "BB Input 2", settings.input2_baseband, SCOPE_INPUTS),
        _boolean("display_input1_baseband", "Show BB 1", settings.display_input1_baseband),
        _boolean("display_input2_baseband", "Show BB 2", settings.display_input2_baseband),
        _boolean("display_cross_amplitude", "Show Cross", settings.display_cross_amplitude),
        _number("trace_average", "Trace Avg", settings.trace_average, 1, 1024, step=1),
    ]


def spectrum_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in SPECTRUM_ACTIONS]


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


def set_pid_attribute(settings: PidSettings, name: str, value: Any) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    elif name == "output_direct":
        normalized = _require_option(name, str(value), DSP_OUTPUT_DIRECTS)
    elif name == "pause_gains":
        normalized = _require_option(name, str(value), PID_PAUSE_GAINS)
    elif name in {"paused", "differential_mode_enabled"}:
        normalized = bool(value)
    elif name == "setpoint":
        normalized = _clamp(float(value), -1.0, 1.0)
    elif name == "p":
        normalized = _clamp(float(value), -2048.0, 2047.999755859375)
    elif name == "i":
        normalized = _clamp(float(value), -38836.0, 38836.0)
    elif name == "ival":
        normalized = _clamp(float(value), -4.0, 4.0)
    elif name in {"min_voltage", "max_voltage"}:
        normalized = _clamp(float(value), -1.0, 1.0)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_iq_attribute(settings: IqSettings, name: str, value: Any) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    elif name == "output_direct":
        normalized = _require_option(name, str(value), DSP_OUTPUT_DIRECTS)
    elif name == "output_signal":
        normalized = _require_option(name, str(value), IQ_OUTPUT_SIGNALS)
    elif name in {"modulation_at_2f", "demodulation_at_2f"}:
        normalized = _require_option(name, str(value), IQ_TOGGLE_OPTIONS)
    elif name in {"on", "pfd_on"}:
        normalized = bool(value)
    elif name == "frequency":
        normalized = _clamp(float(value), 0.0, 62.5e6)
    elif name == "phase":
        normalized = float(value) % 360.0
    elif name == "gain":
        normalized = _clamp(float(value), -64.0, 64.0)
    elif name == "amplitude":
        normalized = _clamp(float(value), -1.0, 1.0)
    elif name == "quadrature_factor":
        normalized = _clamp(float(value), -131071.0, 131071.0)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_trig_attribute(settings: TrigSettings, name: str, value: Any) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    elif name == "output_direct":
        normalized = _require_option(name, str(value), DSP_OUTPUT_DIRECTS)
    elif name == "output_signal":
        normalized = _require_option(name, str(value), TRIG_OUTPUT_SIGNALS)
    elif name == "trigger_source":
        normalized = _require_option(name, str(value), TRIG_TRIGGER_SOURCES)
    elif name in {"auto_rearm", "phase_abs", "armed"}:
        normalized = bool(value)
    elif name in {"threshold", "hysteresis"}:
        normalized = _clamp(float(value), -1.0, 1.0)
    elif name == "phase_offset":
        normalized = float(value) % 360.0
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_pwm_attribute(settings: PwmSettings, name: str, value: Any) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_spectrum_attribute(settings: SpectrumAnalyzerSettings, name: str, value: Any) -> Any:
    if name in {"input", "input1_baseband", "input2_baseband"}:
        normalized = _require_option(name, str(value), SCOPE_INPUTS)
    elif name == "window":
        normalized = _require_option(name, str(value), SPECTRUM_WINDOWS)
    elif name == "display_unit":
        normalized = _require_option(name, str(value), SPECTRUM_DISPLAY_UNITS)
    elif name in {"baseband", "display_input1_baseband", "display_input2_baseband", "display_cross_amplitude"}:
        normalized = bool(value)
    elif name == "span":
        normalized = _nearest_span(float(value))
    elif name == "center":
        normalized = _clamp(float(value), -62.5e6, 62.5e6)
    elif name == "acbandwidth":
        normalized = _clamp(float(value), 0.0, 62.5e6)
    elif name == "trace_average":
        normalized = int(round(_clamp(float(value), 1, 1024)))
    elif name in {"running_state", "last_action"}:
        normalized = str(value) if value is not None else None
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


def _nearest_span(value: float) -> float:
    if value <= min(SPECTRUM_SPANS):
        return min(SPECTRUM_SPANS)
    if value >= max(SPECTRUM_SPANS):
        return max(SPECTRUM_SPANS)
    return min(SPECTRUM_SPANS, key=lambda span: abs(span - value))


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))
