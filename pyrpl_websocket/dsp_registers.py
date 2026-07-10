"""Register helpers for DSP-backed PyRPL modules."""

from __future__ import annotations

import math

from .modules import IirSettings, IqSettings, PidSettings, PwmSettings, TrigSettings
from .monitor_client import DummyClient, MonitorClient
from .scope_registers import DSP_ADDR_BASE, DSP_INPUT_VALUES


DSP_OUTPUT_DIRECT_VALUES = {"off": 0, "out1": 1, "out2": 2, "both": 3}
PID_PAUSE_GAIN_VALUES = {"off": 0, "i": 1, "p": 2, "pi": 3, "d": 4, "id": 5, "pd": 6, "pid": 7}
IQ_OUTPUT_SIGNAL_VALUES = {"quadrature": 0, "output_direct": 1, "pfd": 2, "off": 3, "quadrature_hf": 4}
TRIG_TRIGGER_SOURCE_VALUES = {"off": 0, "pos_edge": 1, "neg_edge": 2, "both_edge": 3}
TRIG_OUTPUT_SIGNAL_VALUES = {"TTL": 0, "asg0_phase": 1}
FILTER_CORRECTION_FACTORS = {
    0.5: 0.7,
    0.25: 1.65,
    0.125: 1.17,
    0.0625: 1.08,
    0.03125: 1.04,
    0.015625: 1.02,
    0.0078125: 1.01,
    0.001953125: 1.0,
    0.00390625: 1.0,
}

PID_SETUP_ATTRIBUTES = (
    "input",
    "output_direct",
    "setpoint",
    "p",
    "i",
    "inputfilter",
    "ival",
    "max_voltage",
    "min_voltage",
    "pause_gains",
    "paused",
    "differential_mode_enabled",
)
IQ_SETUP_ATTRIBUTES = (
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
    "on",
    "pfd_on",
)
TRIG_SETUP_ATTRIBUTES = (
    "input",
    "output_direct",
    "output_signal",
    "trigger_source",
    "threshold",
    "hysteresis",
    "phase_offset",
    "auto_rearm",
    "phase_abs",
)
PWM_SETUP_ATTRIBUTES = ("input",)
IIR_SETUP_ATTRIBUTES = (
    "input",
    "loops",
    "output_direct",
    "inputfilter",
    "on",
    "bypass",
)


def sync_pid_setting(client: MonitorClient | DummyClient, module_name: str, settings: PidSettings, attribute: str) -> None:
    base = dsp_addr_base(module_name)
    if attribute == "input":
        _write_word(client, base + 0x0, DSP_INPUT_VALUES[settings.input])
    elif attribute == "output_direct":
        _write_word(client, base + 0x4, DSP_OUTPUT_DIRECT_VALUES[settings.output_direct])
    elif attribute == "setpoint":
        _write_word(client, base + 0x104, float_to_register(settings.setpoint, bits=14, norm=2**13))
    elif attribute == "p":
        _write_word(client, base + 0x108, float_to_register(settings.p, bits=24, norm=2**12))
    elif attribute == "i":
        _write_word(client, base + 0x10C, float_to_register(settings.i, bits=24, norm=2**32 * 2.0 * 3.141592653589793 * 8e-9))
    elif attribute == "inputfilter":
        sync_filter_register(client, base, 0x120, 0x220, 0x224, 0x228, settings.inputfilter)
    elif attribute == "ival":
        _write_word(client, base + 0x100, float_to_register(settings.ival, bits=16, norm=2**13))
    elif attribute == "min_voltage":
        _write_word(client, base + 0x124, float_to_register(settings.min_voltage, bits=14, norm=2**13))
    elif attribute == "max_voltage":
        _write_word(client, base + 0x128, float_to_register(settings.max_voltage, bits=14, norm=2**13))
    elif attribute == "pause_gains":
        _write_masked(client, base + 0x12C, 0b111, PID_PAUSE_GAIN_VALUES[settings.pause_gains])
    elif attribute == "differential_mode_enabled":
        _write_bool_bit(client, base + 0x12C, 3, settings.differential_mode_enabled)
    elif attribute == "paused":
        _write_bool_bit(client, base + 0xC, DSP_INPUT_VALUES[module_name], settings.paused, invert=True)


def sync_pid_settings(client: MonitorClient | DummyClient, module_name: str, settings: PidSettings) -> None:
    for attribute in PID_SETUP_ATTRIBUTES:
        sync_pid_setting(client, module_name, settings, attribute)


def sync_iq_setting(client: MonitorClient | DummyClient, module_name: str, settings: IqSettings, attribute: str) -> None:
    base = dsp_addr_base(module_name)
    if attribute == "input":
        _write_word(client, base + 0x0, DSP_INPUT_VALUES[settings.input])
    elif attribute == "output_direct":
        _write_word(client, base + 0x4, DSP_OUTPUT_DIRECT_VALUES[settings.output_direct])
    elif attribute == "output_signal":
        _write_word(client, base + 0x10C, IQ_OUTPUT_SIGNAL_VALUES[settings.output_signal])
    elif attribute == "frequency":
        _write_word(client, base + 0x108, frequency_to_register(settings.frequency, bits=32))
    elif attribute == "bandwidth":
        sync_filter_register(client, base, 0x124, 0x230, 0x234, 0x238, settings.bandwidth)
    elif attribute == "acbandwidth":
        sync_filter_register(client, base, 0x120, 0x220, 0x224, 0x228, [-abs(float(settings.acbandwidth))])
    elif attribute == "phase":
        _write_word(client, base + 0x104, phase_to_register(settings.phase, bits=32, invert=True))
    elif attribute == "gain":
        word = float_to_register(settings.gain * 8.0, bits=18, norm=2**8)
        _write_word(client, base + 0x110, word)
        _write_word(client, base + 0x11C, word)
    elif attribute == "amplitude":
        _write_word(client, base + 0x114, float_to_register(settings.amplitude, bits=18, norm=2**17))
    elif attribute == "quadrature_factor":
        _write_word(client, base + 0x118, float_to_register(settings.quadrature_factor, bits=18, norm=1.0))
    elif attribute == "modulation_at_2f":
        _write_masked(client, base + 0x100, 3 << 2, (3 << 2) if settings.modulation_at_2f == "on" else 0)
    elif attribute == "demodulation_at_2f":
        _write_masked(client, base + 0x100, 3 << 4, (3 << 4) if settings.demodulation_at_2f == "on" else 0)
    elif attribute == "on":
        _write_bool_bit(client, base + 0x100, 0, settings.on)
    elif attribute == "pfd_on":
        _write_bool_bit(client, base + 0x100, 1, settings.pfd_on)


def sync_iq_settings(client: MonitorClient | DummyClient, module_name: str, settings: IqSettings) -> None:
    for attribute in IQ_SETUP_ATTRIBUTES:
        sync_iq_setting(client, module_name, settings, attribute)
    sync_iq_phases(client)


def sync_iq_phases(client: MonitorClient | DummyClient) -> None:
    base = dsp_addr_base("iq0")
    current = int(client.reads(base + 0xC, 1)[0])
    mask = (1 << DSP_INPUT_VALUES["iq0"]) | (1 << DSP_INPUT_VALUES["iq1"]) | (1 << DSP_INPUT_VALUES["iq2"])
    _write_word(client, base + 0xC, current & ~mask)
    _write_word(client, base + 0xC, current)


def sync_trig_setting(client: MonitorClient | DummyClient, settings: TrigSettings, attribute: str) -> None:
    base = dsp_addr_base("trig")
    if attribute == "input":
        _write_word(client, base + 0x0, DSP_INPUT_VALUES[settings.input])
    elif attribute == "output_direct":
        _write_word(client, base + 0x4, DSP_OUTPUT_DIRECT_VALUES[settings.output_direct])
    elif attribute == "output_signal":
        _write_word(client, base + 0x10C, TRIG_OUTPUT_SIGNAL_VALUES[settings.output_signal])
    elif attribute == "trigger_source":
        _write_word(client, base + 0x108, TRIG_TRIGGER_SOURCE_VALUES[settings.trigger_source])
    elif attribute == "threshold":
        _write_word(client, base + 0x118, float_to_register(settings.threshold, bits=14, norm=2**13))
    elif attribute == "hysteresis":
        _write_word(client, base + 0x11C, float_to_register(settings.hysteresis, bits=14, norm=2**13))
    elif attribute == "phase_offset":
        _write_word(client, base + 0x110, phase_to_register(settings.phase_offset, bits=14))
    elif attribute == "auto_rearm":
        _write_bool_bit(client, base + 0x104, 0, settings.auto_rearm)
    elif attribute == "phase_abs":
        _write_bool_bit(client, base + 0x104, 1, settings.phase_abs)
    elif attribute == "armed":
        _write_bool_bit(client, base + 0x100, 0, settings.armed)


def sync_trig_settings(client: MonitorClient | DummyClient, settings: TrigSettings) -> None:
    for attribute in TRIG_SETUP_ATTRIBUTES:
        sync_trig_setting(client, settings, attribute)
    arm_trig(client, settings)


def arm_trig(client: MonitorClient | DummyClient, settings: TrigSettings) -> None:
    settings.armed = True
    sync_trig_setting(client, settings, "armed")


def sync_pwm_setting(client: MonitorClient | DummyClient, module_name: str, settings: PwmSettings, attribute: str) -> None:
    if attribute == "input":
        _write_word(client, pwm_addr_base(module_name) + 0x0, DSP_INPUT_VALUES[settings.input])


def sync_pwm_settings(client: MonitorClient | DummyClient, module_name: str, settings: PwmSettings) -> None:
    for attribute in PWM_SETUP_ATTRIBUTES:
        sync_pwm_setting(client, module_name, settings, attribute)


def sync_iir_setting(client: MonitorClient | DummyClient, settings: IirSettings, attribute: str) -> None:
    base = dsp_addr_base("iir")
    if attribute == "input":
        _write_word(client, base + 0x0, DSP_INPUT_VALUES[settings.input])
    elif attribute == "output_direct":
        _write_word(client, base + 0x4, DSP_OUTPUT_DIRECT_VALUES[settings.output_direct])
    elif attribute == "loops":
        _write_word(client, base + 0x100, max(3, min(1023, int(settings.loops))))
    elif attribute == "on":
        _write_bool_bit(client, base + 0x104, 0, settings.on)
    elif attribute == "bypass":
        _write_bool_bit(client, base + 0x104, 1, settings.bypass)
    elif attribute == "inputfilter":
        sync_filter_register(client, base, 0x120, 0x220, 0x224, 0x228, settings.inputfilter)


def sync_iir_settings(client: MonitorClient | DummyClient, settings: IirSettings) -> None:
    for attribute in IIR_SETUP_ATTRIBUTES:
        sync_iir_setting(client, settings, attribute)


def load_iir_unity_coefficients(client: MonitorClient | DummyClient) -> None:
    base = dsp_addr_base("iir")
    stages = _read_constant(client, base + 0x208, 16)
    coefficients = [[0.0, 0.0, 0.0, 1.0, 0.0, 0.0] for _ in range(stages)]
    coefficients[0][0] = 1.0
    _write_iir_coefficients(client, coefficients)
    _write_word(client, base + 0x100, 1)


def load_iir_zero_coefficients(client: MonitorClient | DummyClient) -> None:
    base = dsp_addr_base("iir")
    stages = _read_constant(client, base + 0x208, 16)
    coefficients = [[0.0, 0.0, 0.0, 1.0, 0.0, 0.0] for _ in range(stages)]
    _write_iir_coefficients(client, coefficients)
    _write_word(client, base + 0x100, 1)


def dsp_addr_base(module_name: str) -> int:
    return DSP_ADDR_BASE + DSP_INPUT_VALUES[module_name] * 0x10000


def pwm_addr_base(module_name: str) -> int:
    if module_name == "pwm0":
        return dsp_addr_base("in1")
    if module_name == "pwm1":
        return dsp_addr_base("in2")
    raise KeyError(module_name)


def sync_filter_register(
    client: MonitorClient | DummyClient,
    base: int,
    value_offset: int,
    stages_offset: int,
    shiftbits_offset: int,
    minbw_offset: int,
    value,
) -> None:
    stages, shiftbits, minbw = _filter_config(client, base, stages_offset, shiftbits_offset, minbw_offset)
    word = filter_register_from_python(value, stages=stages, shiftbits=shiftbits, minbw=minbw)
    _write_word(client, base + value_offset, word)


def filter_register_from_python(value, stages: int = 4, shiftbits: int = 6, minbw: int = 1) -> int:
    try:
        values = list(value)[:stages]
    except TypeError:
        values = [value]
    maxshift = _filter_maxshift(minbw)
    filter_shifts = 0
    for index in range(stages):
        bandwidth = float(values[index]) if index < len(values) else 0.0
        if bandwidth == 0.0:
            continue
        alpha = 1.0 - math.exp(-abs(bandwidth) * 2.0 * math.pi / 125e6)
        if alpha in FILTER_CORRECTION_FACTORS:
            bandwidth /= FILTER_CORRECTION_FACTORS[alpha]
            alpha = 1.0 - math.exp(-abs(bandwidth) * 2.0 * math.pi / 125e6)
        shift = int(round(math.log2(alpha * (2**maxshift)))) if alpha > 0 else 0
        shift = max(0, min(2**shiftbits - 1, shift))
        stage_word = shift + 2**7
        if bandwidth < 0:
            stage_word += 2**6
        filter_shifts += stage_word * 2 ** (8 * index)
    return filter_shifts


def filter_register_to_python(value: int, stages: int = 4, shiftbits: int = 6, minbw: int = 1) -> list[float]:
    maxshift = _filter_maxshift(minbw)
    bandwidths: list[float] = []
    for index in range(stages):
        stage_word = (int(value) >> (index * 8)) & 0xFF
        shift = stage_word & (2**shiftbits - 1)
        filter_on = (stage_word >> 7) == 1
        highpass = ((stage_word >> 6) & 1) == 1
        if not filter_on:
            bandwidths.append(0.0)
            continue
        alpha = float(2**shift) / float(2**maxshift)
        bandwidth = -math.log(1.0 - alpha) / (2.0 * math.pi) * 125e6
        if alpha in FILTER_CORRECTION_FACTORS:
            bandwidth *= FILTER_CORRECTION_FACTORS[alpha]
        bandwidths.append(-bandwidth if highpass else bandwidth)
    return bandwidths


def _filter_config(
    client: MonitorClient | DummyClient,
    base: int,
    stages_offset: int,
    shiftbits_offset: int,
    minbw_offset: int,
) -> tuple[int, int, int]:
    stages = _read_constant(client, base + stages_offset, 4)
    shiftbits = _read_constant(client, base + shiftbits_offset, 6)
    minbw = _read_constant(client, base + minbw_offset, 1)
    return stages, shiftbits, minbw


def _filter_maxshift(minbw: int) -> int:
    value = 125000000.0 / max(1.0, float(minbw))
    if value < 2:
        return 1
    if value > 2**32:
        return -1
    if value > 2**31:
        return 32
    return int(math.floor(math.log2(value))) + 1


def _read_constant(client: MonitorClient | DummyClient, addr: int, fallback: int) -> int:
    try:
        value = int(client.reads(addr, 1)[0])
    except Exception:
        return fallback
    return value if value > 0 else fallback


def _write_iir_coefficients(client: MonitorClient | DummyClient, coefficients: list[list[float]]) -> None:
    base = dsp_addr_base("iir")
    bitlength = _read_constant(client, base + 0x200, 64)
    shift = _read_constant(client, base + 0x204, 32)
    stages = _read_constant(client, base + 0x208, 16)
    data = [0] * (stages * 8)
    for index, coefficient in enumerate(coefficients[:stages]):
        for j in range(6):
            if j == 2 or j == 3:
                continue
            value = float(coefficient[j])
            k = j - 2 if j > 3 else j
            if j > 3:
                value *= -1.0
            hi, lo = _fixed_double_words(value, bitlength=bitlength, shift=shift)
            data[index * 8 + k * 2 + 1] = hi
            data[index * 8 + k * 2] = lo
    _write_words(client, base + 0x8000, data)


def _fixed_double_words(value: float, bitlength: int, shift: int) -> tuple[int, int]:
    raw = int(round(value * 2**shift)) & (2**bitlength - 1)
    hi = (raw >> 32) & 0xFFFFFFFF
    lo = raw & 0xFFFFFFFF
    return hi, lo


def float_to_register(value: float, bits: int = 14, norm: float = 2**13, signed: bool = True) -> int:
    raw = int(round(float(value) * norm))
    if raw == 0 and value > 0:
        raw = 1
    elif raw == 0 and value < 0:
        raw = -1
    if signed:
        raw = min(2 ** (bits - 1) - 1, max(-(2 ** (bits - 1)), raw))
        if raw < 0:
            raw += 2**bits
    else:
        raw = min(2**bits - 1, abs(raw))
    return raw


def phase_to_register(phase_degrees: float, bits: int, invert: bool = False) -> int:
    phase = -float(phase_degrees) if invert else float(phase_degrees)
    return int(round((phase % 360.0) / 360.0 * 2**bits)) % 2**bits


def frequency_to_register(frequency: float, bits: int = 32) -> int:
    return max(0, min(2**bits - 1, int(round(abs(float(frequency)) / 125e6 * 2**bits))))


def _write_masked(client: MonitorClient | DummyClient, addr: int, mask: int, value: int) -> None:
    current = int(client.reads(addr, 1)[0])
    _write_word(client, addr, (current & ~mask) | (int(value) & mask))


def _write_bool_bit(
    client: MonitorClient | DummyClient,
    addr: int,
    bit: int,
    value: bool,
    invert: bool = False,
) -> None:
    if invert:
        value = not value
    current = int(client.reads(addr, 1)[0])
    if value:
        current |= 1 << bit
    else:
        current &= ~(1 << bit)
    _write_word(client, addr, current)


def _write_word(client: MonitorClient | DummyClient, addr: int, value: int) -> None:
    client.writes(addr, [int(value) & 0xFFFFFFFF])


def _write_words(client: MonitorClient | DummyClient, addr: int, values: list[int]) -> None:
    client.writes(addr, [int(value) & 0xFFFFFFFF for value in values])
