"""Register helpers for DSP-backed PyRPL modules."""

from __future__ import annotations

import math
import types
from pathlib import Path
from functools import lru_cache

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
)
IIR_COEFFICIENT_ATTRIBUTES = {
    "loops",
    "real_zeros",
    "real_poles",
    "complex_zeros",
    "complex_poles",
    "gain",
    "data_curve",
    "plot_data",
    "plot_data_times_filter",
    "plot_measurement",
}


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
    sync_iq_phases(client, module_name)


def sync_iq_phases(client: MonitorClient | DummyClient, module_name: str = "iq0") -> None:
    """Mirror ``Iq.synchronize_iqs`` at the calling IQ module's base."""

    base = dsp_addr_base(module_name)
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
    elif attribute in IIR_COEFFICIENT_ATTRIBUTES:
        sync_iir_design(client, settings)
    elif attribute == "on":
        _write_bool_bit(client, base + 0x104, 0, settings.on)
    elif attribute == "bypass":
        _write_bool_bit(client, base + 0x104, 1, settings.bypass)
    elif attribute == "inputfilter":
        sync_filter_register(client, base, 0x120, 0x220, 0x224, 0x228, settings.inputfilter)


def sync_iir_settings(client: MonitorClient | DummyClient, settings: IirSettings) -> None:
    for attribute in ("input", "output_direct", "inputfilter", "bypass"):
        sync_iir_setting(client, settings, attribute)
    sync_iir_design(client, settings)
    sync_iir_setting(client, settings, "on")


def read_iir_overflow(client: MonitorClient | DummyClient) -> tuple[int, str]:
    """Read the original IIR overflow bitfield and preserve its GUI text."""

    value = int(client.reads(dsp_addr_base("iir") + 0x108, 1)[0]) & 0x7F
    if not value:
        text = "no overflow"
    elif value & 0x7F:
        text = "sum and internal saturation"
    elif value & 0x40:
        text = "sum saturation"
    elif value & 0x3F:
        text = "internal saturation"
    else:
        text = f"unknown overflow {value}"
    return value, text


def sync_iir_design(client: MonitorClient | DummyClient, settings: IirSettings) -> None:
    """Run PyRPL's IIR design step and write loops plus coefficient RAM."""

    base = dsp_addr_base("iir")
    bitlength = _read_constant(client, base + 0x200, 32)
    shift = _read_constant(client, base + 0x204, 29)
    stages = _read_constant(client, base + 0x208, 14)
    if stages <= 0:
        raise RuntimeError("This FPGA bitfile does not report IIR coefficient stages.")

    _write_bool_bit(client, base + 0x104, 0, False)
    iir_filter = make_iir_filter(
        settings,
        totalbits=bitlength,
        shiftbits=shift,
        iirstages=stages,
    )
    settings.loops = int(iir_filter.loops)
    _write_word(client, base + 0x100, settings.loops)
    _write_iir_coefficients(client, base, iir_filter.coefficients, stages, bitlength, shift)
    settings.on = True
    _write_bool_bit(client, base + 0x104, 0, True)


def make_iir_filter(
    settings: IirSettings,
    totalbits: int = 32,
    shiftbits: int = 29,
    iirstages: int = 14,
):
    """Build the same PyRPL IirFilter used for coefficient writes and plots."""

    iir_theory = _load_iir_theory()
    iir_filter = iir_theory.IirFilter(
        zeros=_iir_values(settings.real_zeros, settings.complex_zeros),
        poles=_iir_values(settings.real_poles, settings.complex_poles),
        gain=settings.gain,
        loops=max(3, min(1023, int(settings.loops))),
        dt=8e-9,
        minloops=3,
        maxloops=1023,
        iirstages=iirstages,
        totalbits=totalbits,
        shiftbits=shiftbits,
        inputfilter=0,
        moduledelay=5,
    )
    # PyRPL designs coefficients without this analog model, then applies it to plots.
    iir_filter.inputfilter = settings.inputfilter
    return iir_filter


def make_hardware_iir_filter(client: MonitorClient | DummyClient, settings: IirSettings):
    """Build PyRPL's plot model with constants reported by the loaded FPGA."""

    base = dsp_addr_base("iir")
    return make_iir_filter(
        settings,
        totalbits=_read_constant(client, base + 0x200, 32),
        shiftbits=_read_constant(client, base + 0x204, 29),
        iirstages=_read_constant(client, base + 0x208, 14),
    )


def _iir_values(real_values: list[float], complex_values: list[str]) -> list[complex]:
    values = [complex(float(value), 0.0) for value in real_values]
    for value in complex_values:
        values.append(complex(str(value).strip().replace("i", "j")))
    return values


def _write_iir_coefficients(
    client: MonitorClient | DummyClient,
    base: int,
    coefficients,
    stages: int,
    bitlength: int,
    shift: int,
) -> None:
    np = _np()
    values = np.array([section for section in coefficients], dtype=np.float64)
    if len(values) > stages:
        raise RuntimeError("Filter contains too many IIR sections to be implemented.")
    data = np.zeros(stages * 8, dtype=np.uint32)
    for section_index in range(len(values)):
        for coefficient_index in range(6):
            if coefficient_index in {2, 3}:
                continue
            packed_index = coefficient_index - 2 if coefficient_index > 3 else coefficient_index
            value = float(values[section_index, coefficient_index])
            if coefficient_index > 3:
                value *= -1.0
            hi, lo = _from_double(value, bitlength=bitlength, shift=shift)
            data[section_index * 8 + packed_index * 2 + 1] = hi
            data[section_index * 8 + packed_index * 2] = lo
    client.writes(base + 0x8000, [int(value) for value in data])


def _from_double(value: float, bitlength: int = 32, shift: int = 29) -> tuple[int, int]:
    raw = int(round(float(value) * 2**shift))
    raw &= 2**bitlength - 1
    hi = (raw >> 32) & ((1 << 32) - 1)
    lo = raw & ((1 << 32) - 1)
    return hi, lo


def _np():
    import numpy as np

    return np


@lru_cache(maxsize=1)
def _load_iir_theory():
    """Load original PyRPL IIR math without importing the Qt-backed package."""

    source_path = Path(__file__).resolve().parents[1] / "pyrpl" / "hardware_modules" / "iir" / "iir_theory.py"
    source = source_path.read_text(encoding="utf-8")
    source = source.replace(
        "from ...errors import ExpectedPyrplError",
        "class ExpectedPyrplError(Exception):\n    pass",
    )
    module = types.ModuleType("pyrpl_websocket._pyrpl_iir_theory")
    module.__file__ = str(source_path)
    exec(compile(source, str(source_path), "exec"), module.__dict__)
    return module


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


def filter_bandwidth_options(
    client: MonitorClient | DummyClient,
    base: int,
    stages_offset: int,
    shiftbits_offset: int,
    minbw_offset: int,
) -> list[float]:
    """Return the positive FilterProperty choices from loaded FPGA constants."""

    stages, shiftbits, minbw = _filter_config(client, base, stages_offset, shiftbits_offset, minbw_offset)
    maxshift = _filter_maxshift(minbw)
    values = []
    for shift in range(max(0, maxshift - 2)):
        bandwidth = filter_register_to_python(shift + 2**7, stages=stages, shiftbits=shiftbits, minbw=minbw)[0]
        if bandwidth > 0:
            values.append(float(bandwidth))
    return values


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
