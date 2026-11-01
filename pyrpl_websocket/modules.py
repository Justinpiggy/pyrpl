"""Qt-free module metadata for the web migration."""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from functools import lru_cache
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
    "duration",
    "average",
    "trigger_source",
    "trigger_delay",
    "threshold",
    "hysteresis",
    "ch1_active",
    "ch2_active",
    "ch_math_active",
    "math_formula",
    "xy_mode",
    "rolling_mode",
    "trace_average",
    "curve_name",
    "run_continuous",
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
        "name": "resume_single",
        "label": "Resume Single",
        "description": "Resume the existing average in single mode.",
    },
    {
        "name": "resume_continuous",
        "label": "Resume Continuous",
        "description": "Resume the existing average in continuous mode.",
    },
    {
        "name": "stop",
        "label": "Stop",
        "description": "Stop acquisition.",
    },
    {
        "name": "save_curve",
        "label": "Save Curve",
        "description": "Save the currently displayed curve to CurveDB.",
    },
]

ASG_WAVEFORMS = ["sin", "cos", "ramp", "halframp", "square", "dc", "noise"]
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
    "inputfilter",
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
    "acbandwidth",
    "output_direct",
    "output_signal",
    "frequency",
    "bandwidth",
    "phase",
    "gain",
    "amplitude",
    "quadrature_factor",
    "modulation_at_2f",
    "demodulation_at_2f",
]
IQ_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Synchronize IQ settings and phase-align IQ modules."},
    {"name": "sync", "label": "Sync", "description": "Synchronize the IQ module phases."},
]

IIR_SETUP_ATTRIBUTES = [
    "input",
    "loops",
    "real_zeros",
    "real_poles",
    "complex_zeros",
    "complex_poles",
    "output_direct",
    "inputfilter",
    "gain",
    "on",
    "bypass",
    "data_curve",
    "plot_data",
    "plot_data_times_filter",
]
IIR_TF_TYPES = ["continuous", "discrete", "coefficients", "rounded", "final"]
IIR_ACTIONS = [
    {"name": "setup", "label": "Setup", "description": "Synchronize IIR routing, filter, and coefficients."},
    {
        "name": "measure_transfer_function",
        "label": "Measure Transfer Function",
        "description": "Measure the implemented IIR response with the Network Analyzer.",
    },
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
]

PWM_SETUP_ATTRIBUTES = ["input"]
PWM_ACTIONS = [{"name": "setup", "label": "Setup", "description": "Synchronize PWM input routing."}]

SAMPLER_SIGNALS = [
    "in1", "in2", "out1", "out2", "iq0", "iq1", "iq2", "iq2_2",
    "pid0", "pid1", "pid2", "asg0", "asg1", "trig", "iir", "off",
]
AMS_DACS = ["dac0", "dac1", "dac2", "dac3"]

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
    "curve_name",
    "curve_unit",
    "run_continuous",
]
SPECTRUM_ACTIONS = [
    {"name": "single", "label": "Run single", "description": "Acquire trace_average spectrum frames."},
    {"name": "continuous", "label": "Run continuous", "description": "Start continuous spectrum acquisition."},
    {"name": "pause", "label": "Pause", "description": "Pause the active spectrum acquisition."},
    {"name": "resume_single", "label": "Resume single", "description": "Resume averaging in single mode."},
    {"name": "resume_continuous", "label": "Resume continuous", "description": "Resume averaging in continuous mode."},
    {"name": "stop", "label": "Stop", "description": "Stop spectrum acquisition and release resources."},
]

NETWORK_ANALYZER_SETUP_ATTRIBUTES = [
    "input",
    "output_direct",
    "acbandwidth",
    "start_freq",
    "stop_freq",
    "rbw",
    "average_per_point",
    "points",
    "amplitude",
    "logscale",
    "auto_bandwidth",
    "q_factor_min",
    "auto_amplitude",
    "target_dbv",
    "auto_amp_min",
    "auto_amp_max",
    "trace_average",
    "curve_name",
    "run_continuous",
]
NETWORK_ANALYZER_ACTIONS = [
    {"name": "pause", "label": "Pause", "description": "Pause the sweep and mute the drive."},
    {"name": "resume", "label": "Resume", "description": "Resume the existing sweep and averages."},
    {"name": "single", "label": "Single", "description": "Acquire trace_average complete sweeps."},
    {"name": "continuous", "label": "Continuous", "description": "Continuously acquire network analyzer sweeps."},
    {"name": "stop", "label": "Stop", "description": "Stop acquisition and release the assigned IQ."},
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
    ch1_active: bool = True
    ch2_active: bool = True
    ch_math_active: bool = False
    math_formula: str = "ch1 * ch2"
    xy_mode: bool = False
    rolling_mode: bool = True
    trace_average: int = 1
    run_continuous: bool = False
    current_avg: int = 0
    # Kept as a compatibility mirror for configs made by early web builds.
    run_mode: str = "rolling"
    running_state: str = "stopped"
    last_action: str | None = None
    curve_name: str = "scope curve"

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
    inputfilter: list[float] = field(default_factory=lambda: [0.0, 0.0, 0.0, 0.0])
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
    acbandwidth: float = 0.0
    output_direct: str = "off"
    output_signal: str = "quadrature"
    frequency: float = 0.0
    bandwidth: list[float] = field(default_factory=lambda: [0.0, 0.0])
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
class IirSettings:
    """Core IIR controls following PyRPL's IIR hardware module register surface."""

    input: str = "off"
    loops: int = 3
    real_zeros: list[float] = field(default_factory=list)
    real_poles: list[float] = field(default_factory=list)
    complex_zeros: list[str] = field(default_factory=list)
    complex_poles: list[str] = field(default_factory=list)
    output_direct: str = "off"
    inputfilter: list[float] = field(default_factory=lambda: [0.0, 0.0, 0.0, 0.0])
    gain: float = 1.0
    on: bool = False
    bypass: bool = False
    overflow: str = "no overflow"
    data_curve: int = -1
    data_curve_name: str = ""
    plot_data: bool = True
    plot_data_times_filter: bool = True
    plot_measurement: bool = True
    tf_type: str = "final"

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
class AmsSettings:
    """AMS DAC readback; only dac2 and dac3 are effective writable outputs."""

    dac0: float = 0.0
    dac1: float = 0.0
    dac2: float = 0.0
    dac3: float = 0.0

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
    rbw: float = 0.0
    trace_average: int = 1
    curve_name: str = "pyrpl spectrum"
    curve_unit: str = "Vpk^2"
    run_continuous: bool = False
    running_state: str = "stopped"
    current_avg: int = 0
    last_action: str | None = None
    iq_module: str = "iq2"
    iq_bandwidth: list[float] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.rbw = spectrum_rbw(self.window, self.span)
        if not self.iq_bandwidth:
            self.iq_bandwidth = [self.span] * 4

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class NetworkAnalyzerSettings:
    """PyRPL network analyzer controls and acquisition state."""

    input: str = "networkanalyzer"
    output_direct: str = "off"
    acbandwidth: float = 50.0
    start_freq: float = 1e3
    stop_freq: float = 1e6
    rbw: float = 500.0
    average_per_point: int = 1
    points: int = 1001
    amplitude: float = 0.1
    logscale: bool = True
    auto_bandwidth: bool = False
    q_factor_min: float = 10.0
    auto_amplitude: bool = False
    target_dbv: float = -80.0
    auto_amp_min: float = 0.0001
    auto_amp_max: float = 1.0
    trace_average: int = 10
    curve_name: str = "networkanalyzer curve"
    run_continuous: bool = False
    running_state: str = "stopped"
    iq_module: str | None = None
    current_point: int = 0
    current_avg: int = 0
    measured_time_per_point: float = 0.0
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
            "name": "sampler",
            "kind": "hardware",
            "label": "Sampler",
            "description": "Momentary readback and statistics for every FPGA DSP signal.",
        },
        {
            "name": "ams",
            "kind": "hardware",
            "label": "AMS",
            "description": "AMS PWM DAC readback and DAC2/DAC3 voltage control.",
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
        {
            "name": "iir",
            "kind": "hardware",
            "label": "IIR",
            "description": "Infinite impulse response filter module.",
        },
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
            "name": "networkanalyzer",
            "kind": "software",
            "label": "Network Analyzer",
            "description": "Coherent swept-frequency transfer-function measurement using an IQ module.",
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
        _select("duration", "Duration", settings.duration, SCOPE_DURATIONS),
        _boolean("average", "FPGA Average", settings.average),
        _boolean("ch1_active", "CH1", settings.ch1_active),
        _boolean("ch2_active", "CH2", settings.ch2_active),
        _boolean("ch_math_active", "Math", settings.ch_math_active),
        _text("math_formula", "Math Formula", settings.math_formula),
        _boolean("xy_mode", "XY", settings.xy_mode),
        _boolean("rolling_mode", "Rolling", settings.rolling_mode),
        _number("trace_average", "Trace Average", settings.trace_average, 1, 1024, step=1),
        _number("trigger_delay", "Trigger Delay", settings.trigger_delay, -10.0, 8e-9 * 2**30),
        _number("threshold", "Threshold", settings.threshold, -1.0, 1.0),
        _number("hysteresis", "Hysteresis", settings.hysteresis, 0.0, 1.0),
        _text("curve_name", "Curve Name", settings.curve_name),
    ]


def sampler_attribute_schema(values: dict[str, float]) -> list[dict[str, Any]]:
    attributes = []
    for signal in SAMPLER_SIGNALS:
        attribute = _number(signal, signal, values.get(signal, 0.0), -1.000122085, 1.0)
        attribute["readonly"] = True
        attributes.append(attribute)
    return attributes


def ams_attribute_schema(settings: AmsSettings) -> list[dict[str, Any]]:
    attributes = []
    for name in AMS_DACS:
        attribute = _number(name, name.upper(), getattr(settings, name), 0.0, 1.8, step=1.8 / 2**13)
        attribute["readonly"] = name in {"dac0", "dac1"}
        attributes.append(attribute)
    return attributes


def set_ams_attribute(settings: AmsSettings, name: str, value: Any) -> float:
    if name not in {"dac2", "dac3"}:
        raise ValueError(f"{name} is read-only; PyRPL only writes AMS dac2 and dac3")
    normalized = _clamp(float(value), 0.0, 1.8)
    setattr(settings, name, normalized)
    return normalized


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
        _text("inputfilter", "Input Filter", _format_list(settings.inputfilter or [0.0, 0.0, 0.0, 0.0])),
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
        _number("acbandwidth", "AC BW", settings.acbandwidth, 0.0, 62.5e6),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _select("output_signal", "Signal", settings.output_signal, IQ_OUTPUT_SIGNALS),
        _number("frequency", "Frequency", settings.frequency, 0.0, 62.5e6),
        _text("bandwidth", "Bandwidth", _format_list(settings.bandwidth or [0.0, 0.0])),
        _number("phase", "Phase", settings.phase, 0.0, 360.0),
        _number("gain", "Gain", settings.gain, -64.0, 64.0),
        _number("amplitude", "Amplitude", settings.amplitude, -1.0, 1.0),
        _number("quadrature_factor", "Quadrature", settings.quadrature_factor, -131071.0, 131071.0),
        _select("modulation_at_2f", "Mod 2f", settings.modulation_at_2f, IQ_TOGGLE_OPTIONS),
        _select("demodulation_at_2f", "Demod 2f", settings.demodulation_at_2f, IQ_TOGGLE_OPTIONS),
    ]


def iq_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in IQ_ACTIONS]


def iir_attribute_schema(
    settings: IirSettings,
    curves: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    curve_records = curves or []
    curve_options = [-1] + [int(curve["pk"]) for curve in curve_records]
    curve_labels = {"-1": "No curve"}
    curve_labels.update({str(curve["pk"]): f'{curve["pk"]}: {curve["name"]}' for curve in curve_records})
    overflow = _text("overflow", "Overflow", settings.overflow)
    overflow["readonly"] = True
    data_curve = _select("data_curve", "Data Curve", settings.data_curve, curve_options)
    data_curve["option_labels"] = curve_labels
    data_curve_name = _text("data_curve_name", "Curve Name", settings.data_curve_name)
    data_curve_name["readonly"] = True
    return [
        _select("input", "Input", settings.input, SCOPE_INPUTS),
        _number("loops", "Loops", settings.loops, 3, 1023, step=1),
        _text("real_zeros", "Real Zeros", _format_list(settings.real_zeros or [])),
        _text("real_poles", "Real Poles", _format_list(settings.real_poles or [])),
        _text("complex_zeros", "Complex Zeros", _format_list(settings.complex_zeros or [])),
        _text("complex_poles", "Complex Poles", _format_list(settings.complex_poles or [])),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _text("inputfilter", "Input Filter", _format_list(settings.inputfilter or [0.0, 0.0, 0.0, 0.0])),
        _number("gain", "Gain", settings.gain, -1e20, 1e20),
        _boolean("on", "On", settings.on),
        _boolean("bypass", "Bypass", settings.bypass),
        overflow,
        data_curve,
        data_curve_name,
        _boolean("plot_data", "Plot Data", settings.plot_data),
        _boolean("plot_data_times_filter", "Plot Data x Filter", settings.plot_data_times_filter),
        _boolean("plot_measurement", "Plot Measurement", settings.plot_measurement),
        _select("tf_type", "Transfer Function", settings.tf_type, IIR_TF_TYPES),
    ]


def iir_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in IIR_ACTIONS]


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
        _select("rbw", "RBW", settings.rbw, spectrum_rbw_options(settings.window)),
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


def network_analyzer_attribute_schema(settings: NetworkAnalyzerSettings) -> list[dict[str, Any]]:
    return [
        _select("input", "Input", settings.input, ["networkanalyzer", *SCOPE_INPUTS]),
        _select("output_direct", "Output", settings.output_direct, DSP_OUTPUT_DIRECTS),
        _number("acbandwidth", "AC BW", settings.acbandwidth, 0.0, 62.5e6),
        _number("start_freq", "Start Frequency", settings.start_freq, 0.03, 62.5e6),
        _number("stop_freq", "Stop Frequency", settings.stop_freq, 0.03, 62.5e6),
        _number("rbw", "RBW", settings.rbw, 1.0, 62.5e6),
        _number("average_per_point", "Average / Point", settings.average_per_point, 1, 2**31 - 1, step=1),
        _number("points", "Points", settings.points, 1, 100000000, step=1),
        _number("amplitude", "Amplitude", settings.amplitude, 0.0, 1.0),
        _boolean("logscale", "Log Scale", settings.logscale),
        _boolean("auto_bandwidth", "Auto Bandwidth", settings.auto_bandwidth),
        _number("q_factor_min", "Minimum Q", settings.q_factor_min, 0.001, 1e9),
        _boolean("auto_amplitude", "Auto Amplitude", settings.auto_amplitude),
        _number("target_dbv", "Target dBV", settings.target_dbv, -200.0, 20.0),
        _number("auto_amp_min", "Auto Amp Min", settings.auto_amp_min, 0.0, 1.0),
        _number("auto_amp_max", "Auto Amp Max", settings.auto_amp_max, 0.0, 1.0),
        _number("trace_average", "Trace Average", settings.trace_average, 1, 1000000, step=1),
        _text("curve_name", "Curve Name", settings.curve_name),
    ]


def network_analyzer_actions() -> list[dict[str, Any]]:
    return [dict(action) for action in NETWORK_ANALYZER_ACTIONS]


def set_scope_attribute(settings: ScopeSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    """Validate and update a scope setting."""

    if name in {"input1", "input2"}:
        normalized = _require_option(name, str(value), inputs)
    elif name == "trigger_source":
        normalized = _require_option(name, str(value), SCOPE_TRIGGER_SOURCES)
    elif name == "run_mode":
        normalized = _require_option(name, str(value), ["single", "continuous", "rolling"])
        settings.rolling_mode = normalized == "rolling"
    elif name == "running_state":
        normalized = _require_option(name, str(value), SCOPE_RUNNING_STATES)
    elif name == "duration":
        normalized = _nearest_duration(float(value))
    elif name in {
        "average",
        "ch1_active",
        "ch2_active",
        "ch_math_active",
        "xy_mode",
        "rolling_mode",
        "run_continuous",
    }:
        normalized = bool(value)
        if name == "rolling_mode":
            settings.run_mode = "rolling" if normalized else "continuous"
    elif name == "trace_average":
        normalized = int(round(_clamp(float(value), 1, 1024)))
    elif name == "math_formula":
        normalized = str(value)
    elif name == "curve_name":
        normalized = str(value)
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


def set_pid_attribute(settings: PidSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), inputs)
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
    elif name == "inputfilter":
        normalized = _normalize_filter_list(value, max_length=4)
    elif name == "ival":
        normalized = _clamp(float(value), -4.0, 4.0)
    elif name in {"min_voltage", "max_voltage"}:
        normalized = _clamp(float(value), -1.0, 1.0)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_iq_attribute(settings: IqSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), inputs)
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
    elif name == "acbandwidth":
        normalized = _clamp(float(value), 0.0, 62.5e6)
    elif name == "bandwidth":
        normalized = _normalize_filter_list(value, max_length=4)
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


def set_iir_attribute(settings: IirSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name in {"zeros", "poles"}:
        values = [complex(str(v).replace("i", "j")) for v in value]
        setattr(settings, "real_" + name, [v.real for v in values if v.imag == 0])
        setattr(settings, "complex_" + name, [str(v) for v in values if v.imag != 0])
        return [str(v) for v in values]
    if name == "input":
        normalized = _require_option(name, str(value), inputs)
    elif name == "output_direct":
        normalized = _require_option(name, str(value), DSP_OUTPUT_DIRECTS)
    elif name in {"on", "bypass", "plot_data", "plot_data_times_filter", "plot_measurement"}:
        normalized = bool(value)
    elif name == "data_curve":
        normalized = int(value)
    elif name == "tf_type":
        normalized = _require_option(name, str(value), IIR_TF_TYPES)
    elif name == "loops":
        normalized = int(round(_clamp(float(value), 3, 1023)))
    elif name in {"real_zeros", "real_poles"}:
        normalized = _normalize_float_list(value)
    elif name in {"complex_zeros", "complex_poles"}:
        normalized = _normalize_complex_text_list(value)
    elif name == "inputfilter":
        normalized = _normalize_filter_list(value, max_length=4)
    elif name == "gain":
        normalized = _clamp(float(value), -1e20, 1e20)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_trig_attribute(settings: TrigSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), inputs)
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


def set_pwm_attribute(settings: PwmSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), inputs)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_network_analyzer_attribute(settings: NetworkAnalyzerSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name == "input":
        normalized = _require_option(name, str(value), ["networkanalyzer", *inputs])
    elif name == "output_direct":
        normalized = _require_option(name, str(value), DSP_OUTPUT_DIRECTS)
    elif name in {"logscale", "auto_bandwidth", "auto_amplitude", "run_continuous"}:
        normalized = bool(value)
    elif name in {"average_per_point", "points", "trace_average"}:
        maximum = 100000000 if name == "points" else 2**31 - 1
        normalized = int(round(_clamp(float(value), 1, maximum)))
    elif name in {"start_freq", "stop_freq"}:
        normalized = _clamp(float(value), 0.03, 62.5e6)
    elif name in {"rbw", "acbandwidth"}:
        normalized = _clamp(float(value), 0.0 if name == "acbandwidth" else 1.0, 62.5e6)
    elif name in {"amplitude", "auto_amp_min", "auto_amp_max"}:
        normalized = _clamp(float(value), 0.0, 1.0)
    elif name == "q_factor_min":
        normalized = max(0.001, float(value))
    elif name == "target_dbv":
        normalized = _clamp(float(value), -200.0, 20.0)
    elif name == "curve_name":
        normalized = str(value)
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    return normalized


def set_spectrum_attribute(settings: SpectrumAnalyzerSettings, name: str, value: Any, *, inputs: list[str] = SCOPE_INPUTS) -> Any:
    if name in {"input", "input1_baseband", "input2_baseband"}:
        normalized = _require_option(name, str(value), inputs)
    elif name == "window":
        normalized = _require_option(name, str(value), SPECTRUM_WINDOWS)
    elif name == "display_unit":
        normalized = _require_option(name, str(value), SPECTRUM_DISPLAY_UNITS)
    elif name in {"baseband", "display_input1_baseband", "display_input2_baseband", "display_cross_amplitude"}:
        normalized = bool(value)
    elif name == "span":
        normalized = _nearest_span(float(value))
    elif name == "rbw":
        options = spectrum_rbw_options(settings.window)
        index = min(range(len(options)), key=lambda option_index: abs(options[option_index] - float(value)))
        settings.span = SPECTRUM_SPANS[index]
        normalized = options[index]
    elif name == "center":
        normalized = _clamp(float(value), -62.5e6, 62.5e6)
        if normalized != 0.0 and settings.baseband:
            settings.baseband = False
    elif name == "acbandwidth":
        normalized = _clamp(float(value), 0.0, 62.5e6)
    elif name == "trace_average":
        normalized = int(round(_clamp(float(value), 1, 1024)))
    elif name == "curve_name":
        normalized = str(value)
    elif name == "curve_unit":
        normalized = _require_option(name, str(value), ["Vpk^2"])
    elif name == "run_continuous":
        normalized = bool(value)
    elif name in {"running_state", "last_action"}:
        normalized = str(value) if value is not None else None
    else:
        raise KeyError(name)
    setattr(settings, name, normalized)
    if name in {"span", "window"}:
        settings.rbw = spectrum_rbw(settings.window, settings.span)
    if name == "span":
        settings.iq_bandwidth = [settings.span] * 4
    return normalized


def spectrum_rbw_options(window: str) -> list[float]:
    return [spectrum_rbw(window, span) for span in SPECTRUM_SPANS]


def spectrum_rbw(window: str, span: float, count: int = 2**14) -> float:
    return float(span) * _spectrum_enbw(window, count)


@lru_cache(maxsize=None)
def _spectrum_enbw(window: str, count: int) -> float:
    values = _spectrum_window_values(window, count)
    total = sum(values)
    if total == 0.0:
        return 0.0
    return sum(value * value for value in values) / (total * total)


def _spectrum_window_values(window: str, count: int) -> list[float]:
    values: list[float] = []
    center = (count - 1) / 2.0
    for index in range(count):
        phase = 2.0 * math.pi * index / max(1, count - 1)
        if window == "boxcar":
            value = 1.0
        elif window == "hamming":
            value = 0.54 - 0.46 * math.cos(phase)
        elif window == "flattop":
            value = (
                1.0
                - 1.93 * math.cos(phase)
                + 1.29 * math.cos(2.0 * phase)
                - 0.388 * math.cos(3.0 * phase)
                + 0.032 * math.cos(4.0 * phase)
            )
        elif window == "gaussian":
            value = math.exp(-0.5 * ((index - center) / (count / 10.0)) ** 2)
        else:
            value = 0.42 - 0.5 * math.cos(phase) + 0.08 * math.cos(2.0 * phase)
        values.append(value)
    return values


def _select(name: str, label: str, value: Any, options: list[Any]) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "select", "value": value, "options": options}


def _boolean(name: str, label: str, value: bool) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "bool", "value": value}


def _text(name: str, label: str, value: str) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "text", "value": value}


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


def _normalize_filter_list(value: Any, max_length: int) -> list[float]:
    values = _normalize_float_list(value)
    if len(values) > max_length:
        raise ValueError(f"filter list accepts at most {max_length} stages")
    return values if values else [0.0]


def _normalize_float_list(value: Any) -> list[float]:
    if value is None:
        return []
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        parts = [part.strip() for part in text.replace(";", ",").split(",")]
        return [float(part) for part in parts if part]
    if isinstance(value, (list, tuple)):
        return [float(item) for item in value]
    return [float(value)]


def _normalize_complex_text_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        values = [part.strip() for part in text.replace(";", ",").split(",") if part.strip()]
    elif isinstance(value, (list, tuple)):
        values = [str(item).strip() for item in value if str(item).strip()]
    else:
        values = [str(value).strip()]
    for item in values:
        complex(item.replace("i", "j"))
    return values


def _format_list(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (list, tuple)):
        return ", ".join(str(item) for item in value)
    return str(value)
