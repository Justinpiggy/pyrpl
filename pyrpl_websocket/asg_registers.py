"""Register helpers for the Red Pitaya ASG blocks."""

from __future__ import annotations

import numpy as np

from .modules import AsgSettings
from .monitor_client import DummyClient, MonitorClient
from .scope_registers import DSP_ADDR_BASE, DSP_INPUT_VALUES


ASG_ADDR_BASE = 0x40200000
ASG_DATA_LENGTH = 2**14
ASG_DEFAULT_COUNTER_WRAP = 2**16 * ASG_DATA_LENGTH - 1
ASG_CLOCK_FREQUENCY = 125e6

ASG_TRIGGER_VALUES = {
    "off": 0,
    "immediately": 1,
    "ext_positive_edge": 2,
    "ext_negative_edge": 3,
    "ext_raw": 4,
    "high": 5,
}
ASG_OUTPUT_DIRECT_VALUES = {"off": 0, "out1": 1, "out2": 2, "both": 3}


def sync_asg_setting(client: MonitorClient | DummyClient, channel: int, settings: AsgSettings, attribute: str) -> None:
    """Write one ASG setting using PyRPL-compatible registers."""

    layout = _layout(channel)
    if attribute == "waveform":
        _write_waveform(client, layout["data_offset"], settings.waveform)
    elif attribute == "amplitude":
        _write_masked(client, ASG_ADDR_BASE + 0x4 + layout["value_offset"], 0x3FFF, _float_to_register(settings.amplitude, signed=False))
    elif attribute == "offset":
        _write_masked(
            client,
            ASG_ADDR_BASE + 0x4 + layout["value_offset"],
            0x3FFF << 16,
            _float_to_register(settings.offset, bits=14, norm=2**13, signed=True) << 16,
        )
    elif attribute == "frequency":
        _write_word(client, ASG_ADDR_BASE + 0x10 + layout["value_offset"], _frequency_to_register(settings.frequency))
    elif attribute == "trigger_source":
        _write_trigger_source(client, layout["bit_offset"], settings.trigger_source)
    elif attribute == "output_direct":
        _write_word(client, DSP_ADDR_BASE + DSP_INPUT_VALUES[f"asg{channel}"] * 0x10000 + 0x4, ASG_OUTPUT_DIRECT_VALUES[settings.output_direct])
    elif attribute == "start_phase":
        _write_word(client, ASG_ADDR_BASE + 0xC + layout["value_offset"], _phase_to_register(settings.start_phase))
    elif attribute == "cycles_per_burst":
        _write_word(client, ASG_ADDR_BASE + 0x18 + layout["value_offset"], int(settings.cycles_per_burst))


def sync_asg_settings(client: MonitorClient | DummyClient, channel: int, settings: AsgSettings) -> None:
    setup_asg(client, channel, settings)


def setup_asg(client: MonitorClient | DummyClient, channel: int, settings: AsgSettings) -> None:
    """Apply PyRPL's ASG setup sequence for one channel."""

    layout = _layout(channel)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 7 + layout["bit_offset"], False, invert=True)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 6 + layout["bit_offset"], True)
    _write_word(client, ASG_ADDR_BASE + 0x8 + layout["value_offset"], ASG_DEFAULT_COUNTER_WRAP)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 4 + layout["bit_offset"], True)
    for attribute in ("waveform", "amplitude", "offset", "frequency", "output_direct", "start_phase", "cycles_per_burst"):
        sync_asg_setting(client, channel, settings, attribute)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 6 + layout["bit_offset"], False)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 7 + layout["bit_offset"], True, invert=True)
    sync_asg_setting(client, channel, settings, "trigger_source")


def trigger_asg(client: MonitorClient | DummyClient, channel: int) -> None:
    _write_word(client, ASG_ADDR_BASE + 0xC + _layout(channel)["value_offset"], 0)
    _write_trigger_source(client, _layout(channel)["bit_offset"], "immediately")
    _write_trigger_source(client, _layout(channel)["bit_offset"], "off")


def disable_asg(client: MonitorClient | DummyClient, channel: int) -> None:
    layout = _layout(channel)
    _write_bool_bit(client, ASG_ADDR_BASE + 0x0, 7 + layout["bit_offset"], False, invert=True)
    _write_trigger_source(client, layout["bit_offset"], "off")


def _layout(channel: int) -> dict[str, int]:
    if channel not in (0, 1):
        raise ValueError("ASG channel must be 0 or 1")
    return {
        "bit_offset": 0 if channel == 0 else 16,
        "value_offset": 0 if channel == 0 else 0x20,
        "data_offset": ASG_ADDR_BASE + (0x10000 if channel == 0 else 0x20000),
    }


def _write_waveform(client: MonitorClient | DummyClient, data_addr: int, waveform: str) -> None:
    x = np.linspace(0, 2 * np.pi, ASG_DATA_LENGTH, endpoint=False)
    if waveform == "sin":
        data = np.sin(x)
    elif waveform == "cos":
        data = np.cos(x)
    elif waveform == "ramp":
        data = np.linspace(-1.0, 3.0, ASG_DATA_LENGTH, endpoint=False)
        data[ASG_DATA_LENGTH // 2 :] = -1 * data[: ASG_DATA_LENGTH // 2]
    elif waveform == "halframp":
        data = np.linspace(-1.0, 1.0, ASG_DATA_LENGTH, endpoint=False)
    elif waveform == "square":
        data = np.ones(ASG_DATA_LENGTH)
        data[ASG_DATA_LENGTH // 2 :] = -1.0
    elif waveform == "dc":
        data = np.zeros(ASG_DATA_LENGTH)
    else:
        raise ValueError(f"Unsupported ASG waveform {waveform}")
    words = np.array(np.round((2**13 - 1) * data), dtype=np.int32)
    words[words >= 2**13] = 2**13 - 1
    words[words < 0] += 2**14
    words[words < 0] = -(2**13)
    client.writes(data_addr, np.asarray(words, dtype=np.uint32))


def _write_trigger_source(client: MonitorClient | DummyClient, bit_offset: int, trigger_source: str) -> None:
    mask = 0x0007 << bit_offset
    _write_masked(client, ASG_ADDR_BASE + 0x0, mask, ASG_TRIGGER_VALUES[trigger_source] << bit_offset)


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


def _float_to_register(value: float, bits: int = 14, norm: float = 2**13, signed: bool = True) -> int:
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


def _frequency_to_register(frequency: float) -> int:
    return max(0, min(2**30 - 1, int(round(abs(float(frequency)) / ASG_CLOCK_FREQUENCY * 2**30))))


def _phase_to_register(phase_degrees: float) -> int:
    return int(round((float(phase_degrees) % 360.0) / 360.0 * 2**30)) % 2**30
