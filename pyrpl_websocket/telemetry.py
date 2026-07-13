"""Qt-free Sampler and AMS register behavior from PyRPL."""

from __future__ import annotations

import math
import time
from typing import Any

from .monitor_client import DummyClient, MonitorClient


SAMPLER_ADDR_BASE = 0x40300000
AMS_ADDR_BASE = 0x40400000
DSP_INPUTS = {
    "in1": 10,
    "in2": 11,
    "out1": 12,
    "out2": 13,
    "iq0": 5,
    "iq1": 6,
    "iq2": 7,
    "iq2_2": 14,
    "pid0": 0,
    "pid1": 1,
    "pid2": 2,
    "asg0": 8,
    "asg1": 9,
    "trig": 3,
    "iir": 4,
    "off": 15,
}
AMS_DAC_ADDRESSES = {f"dac{index}": AMS_ADDR_BASE + 0x20 + index * 4 for index in range(4)}


def read_sampler_signal(
    client: MonitorClient | DummyClient,
    signal: str,
    fake_index: int = 0,
) -> float:
    number = DSP_INPUTS[signal]
    if isinstance(client, DummyClient):
        raw = client.fake_signal_value(number, fake_index)
    else:
        raw = int(client.reads(SAMPLER_ADDR_BASE + 0x10 + number * 0x10000, 1)[0])
    raw &= 0x3FFF
    if raw & 0x2000:
        raw -= 0x4000
    return raw / float(2**13 - 1)


def read_sampler(client: MonitorClient | DummyClient, fake_index: int = 0) -> dict[str, float]:
    return {
        signal: read_sampler_signal(client, signal, fake_index + index)
        for index, signal in enumerate(DSP_INPUTS)
    }


def sampler_stats(
    client: MonitorClient | DummyClient,
    signal: str = "in1",
    duration: float = 1e-2,
    fake_index: int = 0,
) -> dict[str, Any]:
    if signal not in DSP_INPUTS:
        raise ValueError(f"Unknown sampler signal {signal}")
    duration = max(0.0, min(float(duration), 10.0))
    count = 0
    total = 0.0
    total_square = 0.0
    maximum = -math.inf
    minimum = math.inf
    started = time.monotonic()
    while count == 0 or time.monotonic() < started + duration:
        value = read_sampler_signal(client, signal, fake_index + count)
        count += 1
        total += value
        total_square += value * value
        maximum = max(maximum, value)
        minimum = min(minimum, value)
    mean = total / count
    variance = max(0.0, total_square / count - mean * mean)
    return {
        "signal": signal,
        "duration": duration,
        "count": count,
        "mean": mean,
        "stddev": math.sqrt(variance),
        "max": maximum,
        "min": minimum,
    }


def read_ams(client: MonitorClient | DummyClient) -> dict[str, float]:
    return {
        name: pwm_to_voltage(int(client.reads(address, 1)[0]))
        for name, address in AMS_DAC_ADDRESSES.items()
    }


def write_ams_dac(client: MonitorClient | DummyClient, name: str, voltage: float) -> float:
    if name not in {"dac2", "dac3"}:
        raise ValueError(f"{name} is read-only; PyRPL only writes AMS dac2 and dac3")
    normalized = max(0.0, min(float(voltage), 1.8))
    client.writes(AMS_DAC_ADDRESSES[name], [voltage_to_pwm(normalized)])
    return normalized


def pwm_to_voltage(value: int, cfg_bits: int = 24, pwm_bits: int = 8) -> float:
    pwm = float((value >> (cfg_bits - pwm_bits)) & (2**pwm_bits - 1))
    mod = value & (2 ** (cfg_bits - pwm_bits) - 1)
    postcomma = float(mod.bit_count()) / (cfg_bits - pwm_bits)
    return 1.8 * (pwm + postcomma) / 2**pwm_bits


def voltage_to_pwm(voltage: float, cfg_bits: int = 24, pwm_bits: int = 8) -> int:
    value = max(0.0, float(voltage)) / 1.8 * 2**pwm_bits
    high = min(math.floor(value), 2**pwm_bits - 1)
    low = int(round((value - high) * (cfg_bits - pwm_bits)))
    return (int(high) << (cfg_bits - pwm_bits)) + (((1 << low) - 1) & ((1 << cfg_bits) - 1))
