"""Register helpers for the Red Pitaya scope block.

The constants here mirror the existing PyRPL scope descriptors without
importing the Qt-heavy package at runtime.
"""

from __future__ import annotations

import time

from .modules import ScopeSettings
from .monitor_client import DummyClient, MonitorClient


SCOPE_ADDR_BASE = 0x40100000
DSP_ADDR_BASE = 0x40300000
SCOPE_DATA_LENGTH = 2**14

DSP_INPUT_VALUES = {
    "pid0": 0,
    "pid1": 1,
    "pid2": 2,
    "trig": 3,
    "iir": 4,
    "iq0": 5,
    "iq1": 6,
    "iq2": 7,
    "asg0": 8,
    "asg1": 9,
    "in1": 10,
    "in2": 11,
    "out1": 12,
    "out2": 13,
    "iq2_2": 14,
    "off": 15,
}

SCOPE_TRIGGER_VALUES = {
    "off": 0,
    "immediately": 1,
    "ch1_positive_edge": 2,
    "ch1_negative_edge": 3,
    "ch2_positive_edge": 4,
    "ch2_negative_edge": 5,
    "ext_positive_edge": 6,
    "ext_negative_edge": 7,
    "asg0": 8,
    "asg1": 9,
    "dsp": 10,
}

SCOPE_CONTROL_ADDR = SCOPE_ADDR_BASE + 0x0
SCOPE_TRIGGER_SOURCE_ADDR = SCOPE_ADDR_BASE + 0x4
SCOPE_TRIGGER_DELAY_ADDR = SCOPE_ADDR_BASE + 0x10
SCOPE_DECIMATION_ADDR = SCOPE_ADDR_BASE + 0x14
SCOPE_WRITE_POINTER_CURRENT_ADDR = SCOPE_ADDR_BASE + 0x18
SCOPE_WRITE_POINTER_TRIGGER_ADDR = SCOPE_ADDR_BASE + 0x1C
SCOPE_AVERAGE_ADDR = SCOPE_ADDR_BASE + 0x28

SCOPE_CONTROL_TRIGGER_ARMED_BIT = 0
SCOPE_CONTROL_RESET_WRITE_STATE_BIT = 1
SCOPE_CONTROL_TRIGGER_DELAY_RUNNING_BIT = 2


def sync_scope_setting(client: MonitorClient | DummyClient, settings: ScopeSettings, attribute: str) -> None:
    """Write a changed scope setting to the same FPGA register PyRPL uses."""

    if attribute == "input1":
        _write_word(client, _dsp_addr_base("asg0"), DSP_INPUT_VALUES[settings.input1])
    elif attribute == "input2":
        _write_word(client, _dsp_addr_base("asg1"), DSP_INPUT_VALUES[settings.input2])
    elif attribute == "trigger_source":
        _write_word(client, SCOPE_TRIGGER_SOURCE_ADDR, SCOPE_TRIGGER_VALUES[settings.trigger_source])
    elif attribute == "duration":
        _write_word(client, SCOPE_DECIMATION_ADDR, _decimation_from_duration(settings.duration))
    elif attribute == "average":
        _write_bool_bit(client, SCOPE_AVERAGE_ADDR, 0, settings.average)
    elif attribute == "threshold":
        _write_word(client, SCOPE_ADDR_BASE + 0x8, _float_to_signed_register(settings.threshold))
    elif attribute == "hysteresis":
        _write_word(client, SCOPE_ADDR_BASE + 0x20, _float_to_signed_register(settings.hysteresis))
    elif attribute == "trigger_delay":
        _write_word(client, SCOPE_TRIGGER_DELAY_ADDR, _trigger_delay_samples(settings))


def sync_scope_settings(client: MonitorClient | DummyClient, settings: ScopeSettings) -> None:
    for attribute in (
        "input1",
        "input2",
        "trigger_source",
        "duration",
        "average",
        "threshold",
        "hysteresis",
        "trigger_delay",
    ):
        sync_scope_setting(client, settings, attribute)


def _dsp_addr_base(name: str) -> int:
    return DSP_ADDR_BASE + DSP_INPUT_VALUES[name] * 0x10000


def _write_word(client: MonitorClient | DummyClient, addr: int, value: int) -> None:
    client.writes(addr, [int(value) & 0xFFFFFFFF])


def _write_bool_bit(client: MonitorClient | DummyClient, addr: int, bit: int, value: bool) -> None:
    current = int(client.reads(addr, 1)[0])
    if value:
        current |= 1 << bit
    else:
        current &= ~(1 << bit)
    _write_word(client, addr, current)


def start_scope_trace_acquisition(client: MonitorClient | DummyClient, settings: ScopeSettings) -> bool:
    """Start one hardware scope trace the same way PyRPL's Scope does."""

    if settings.trigger_source == "off":
        return False
    _write_bool_bit(client, SCOPE_CONTROL_ADDR, SCOPE_CONTROL_RESET_WRITE_STATE_BIT, True)
    _write_word(client, SCOPE_TRIGGER_DELAY_ADDR, _trigger_delay_samples(settings))
    _write_bool_bit(client, SCOPE_CONTROL_ADDR, SCOPE_CONTROL_TRIGGER_ARMED_BIT, True)
    _write_word(client, SCOPE_TRIGGER_SOURCE_ADDR, SCOPE_TRIGGER_VALUES[settings.trigger_source])
    return True


def start_scope_rolling_acquisition(client: MonitorClient | DummyClient, settings: ScopeSettings) -> None:
    """Start PyRPL's untriggered rolling scope acquisition mode."""

    _write_bool_bit(client, SCOPE_CONTROL_ADDR, SCOPE_CONTROL_RESET_WRITE_STATE_BIT, True)
    _write_word(client, SCOPE_TRIGGER_DELAY_ADDR, _trigger_delay_samples(settings))
    _write_bool_bit(client, SCOPE_CONTROL_ADDR, SCOPE_CONTROL_TRIGGER_ARMED_BIT, True)
    _write_word(client, SCOPE_TRIGGER_SOURCE_ADDR, SCOPE_TRIGGER_VALUES[settings.trigger_source])
    _write_word(client, SCOPE_TRIGGER_SOURCE_ADDR, SCOPE_TRIGGER_VALUES["off"])
    _write_bool_bit(client, SCOPE_CONTROL_ADDR, SCOPE_CONTROL_TRIGGER_ARMED_BIT, True)


def scope_curve_ready(client: MonitorClient | DummyClient) -> bool:
    control = int(client.reads(SCOPE_CONTROL_ADDR, 1)[0])
    trigger_armed = bool(control & (1 << SCOPE_CONTROL_TRIGGER_ARMED_BIT))
    trigger_delay_running = bool(control & (1 << SCOPE_CONTROL_TRIGGER_DELAY_RUNNING_BIT))
    return not trigger_armed and not trigger_delay_running


def wait_scope_curve_ready(
    client: MonitorClient | DummyClient,
    settings: ScopeSettings,
    timeout: float | None = None,
    poll_interval: float = 0.001,
) -> bool:
    """Wait until the FPGA says the just-started scope trace is ready."""

    timeout = max(0.25, float(settings.duration) + 0.25) if timeout is None else max(0.0, timeout)
    deadline = time.monotonic() + timeout
    while time.monotonic() <= deadline:
        if scope_curve_ready(client):
            return True
        time.sleep(poll_interval)
    return False


def scope_trigger_roll_offset(client: MonitorClient | DummyClient) -> int:
    """Return PyRPL's roll offset for trigger-aligned scope data."""

    write_pointer_trigger = int(client.reads(SCOPE_WRITE_POINTER_TRIGGER_ADDR, 1)[0])
    trigger_delay = int(client.reads(SCOPE_TRIGGER_DELAY_ADDR, 1)[0])
    return -((write_pointer_trigger + trigger_delay + 1) % SCOPE_DATA_LENGTH)


def _decimation_from_duration(duration: float) -> int:
    return max(1, min(2**16, int(round(float(duration) / (8e-9 * SCOPE_DATA_LENGTH)))))


def _trigger_delay_samples(settings: ScopeSettings) -> int:
    if settings.trigger_source == "immediately":
        return SCOPE_DATA_LENGTH
    sampling_time = settings.duration / SCOPE_DATA_LENGTH
    delay = int(round(settings.trigger_delay / sampling_time)) + SCOPE_DATA_LENGTH // 2
    return max(1, min(2**32 - 1, delay))


def _float_to_signed_register(value: float, bits: int = 14, norm: float = 2**13) -> int:
    raw = int(round(float(value) * norm))
    if raw == 0 and value > 0:
        raw = 1
    elif raw == 0 and value < 0:
        raw = -1
    raw = min(2 ** (bits - 1) - 1, max(-(2 ** (bits - 1)), raw))
    if raw < 0:
        raw += 2**bits
    return raw
