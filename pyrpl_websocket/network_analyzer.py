"""Qt-free implementation of PyRPL's IQ-backed network analyzer sweep."""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field

import numpy as np

from .dsp_registers import (
    dsp_addr_base,
    filter_bandwidth_options,
    frequency_to_register,
    sync_iq_setting,
    sync_iq_settings,
)
from .modules import IqSettings, NetworkAnalyzerSettings
from .monitor_client import DummyClient, MonitorClient


IQ_LPF_BITS = 24
FPGA_CLOCK = 125e6
SLEEP_TIMES = 0.5
VALID_RBWS = np.asarray([2.371593461809983 * 2**power for power in range(1, 27)], dtype=float)


@dataclass
class NetworkAnalyzerRun:
    run_id: int = 0
    frequencies: np.ndarray = field(default_factory=lambda: np.asarray([], dtype=np.float64))
    data: np.ndarray = field(default_factory=lambda: np.asarray([], dtype=np.complex128))
    amplitudes: np.ndarray = field(default_factory=lambda: np.asarray([], dtype=np.float64))
    current_point: int = 0
    current_avg: int = 0
    bandwidth: float = 0.0
    averages: int = 1
    sleep_cycles: int = 1
    bandwidth_options: np.ndarray = field(default_factory=lambda: VALID_RBWS.copy())
    time_first_point: float | None = None

    def prepare(self, settings: NetworkAnalyzerSettings) -> None:
        self.run_id += 1
        self.frequencies = sweep_frequencies(settings)
        self.data = np.zeros(settings.points, dtype=np.complex128)
        self.amplitudes = np.full(settings.points, settings.amplitude, dtype=np.float64)
        self.current_point = 0
        self.current_avg = 0
        self.time_first_point = None


def sweep_frequencies(settings: NetworkAnalyzerSettings) -> np.ndarray:
    if settings.start_freq == settings.stop_freq:
        raw = np.full(settings.points, settings.start_freq, dtype=np.float64)
    elif settings.logscale:
        raw = np.logspace(
            math.log10(settings.start_freq),
            math.log10(settings.stop_freq),
            settings.points,
            endpoint=True,
            dtype=np.float64,
        )
    else:
        raw = np.linspace(settings.start_freq, settings.stop_freq, settings.points, endpoint=True, dtype=np.float64)
    return np.asarray([normalize_frequency(frequency) for frequency in raw], dtype=np.float64)


def normalize_frequency(frequency: float) -> float:
    """Return the real FPGA IQ frequency, matching PyRPL FrequencyRegister."""

    return 125e6 / 2**32 * frequency_to_register(frequency, bits=32)


def select_rbw(
    settings: NetworkAnalyzerSettings,
    frequency: float,
    bandwidth_options: np.ndarray | None = None,
) -> float:
    options = VALID_RBWS if bandwidth_options is None or not len(bandwidth_options) else bandwidth_options
    desired = settings.rbw
    if settings.auto_bandwidth:
        desired = min(max(frequency / settings.q_factor_min, options[0]), settings.rbw)
    return float(options[np.argmin(np.abs(options - desired))])


def configure_iq(
    client: MonitorClient | DummyClient,
    module_name: str,
    iq: IqSettings,
    settings: NetworkAnalyzerSettings,
    run: NetworkAnalyzerRun,
) -> None:
    frequency = float(run.frequencies[0])
    base = dsp_addr_base(module_name)
    options = filter_bandwidth_options(client, base, 0x230, 0x234, 0x238)
    run.bandwidth_options = np.asarray(options or VALID_RBWS, dtype=np.float64)
    run.bandwidth = select_rbw(settings, frequency, run.bandwidth_options)
    settings.rbw = run.bandwidth
    iq.amplitude = 0.0
    iq.frequency = frequency
    iq.bandwidth = [run.bandwidth, run.bandwidth]
    iq.gain = 0.0
    iq.phase = 0.0
    iq.acbandwidth = settings.acbandwidth
    iq.input = module_name if settings.input == "networkanalyzer" else settings.input
    iq.output_direct = settings.output_direct
    iq.output_signal = "output_direct"
    iq.quadrature_factor = 1.0
    iq.on = True
    sync_iq_settings(client, module_name, iq)
    run.averages = max(1, int(round(FPGA_CLOCK / run.bandwidth * settings.average_per_point)))
    run.sleep_cycles = max(1, int(round(FPGA_CLOCK / run.bandwidth * SLEEP_TIMES)))
    client.writes(base + 0x130, [run.averages])
    client.writes(base + 0x134, [run.sleep_cycles])
    # Match NetworkAnalyzer._start_trace_acquisition: frequency, amplitude,
    # then the IQ on-bit synchronization transition start the first NA trace.
    sync_iq_setting(client, module_name, iq, "frequency")
    iq.amplitude = settings.amplitude
    sync_iq_setting(client, module_name, iq, "amplitude")
    sync_iq_setting(client, module_name, iq, "on")


def acquire_point(
    client: MonitorClient | DummyClient,
    module_name: str,
    iq: IqSettings,
    settings: NetworkAnalyzerSettings,
    run: NetworkAnalyzerRun,
) -> tuple[float, complex, float]:
    index = run.current_point
    frequency = float(run.frequencies[index])
    if settings.auto_amplitude:
        desired_amplitude = auto_amplitude_for_point(settings, run, index)
        if abs(desired_amplitude - iq.amplitude) > 1e-6:
            ramp_iq_amplitude(client, module_name, iq, desired_amplitude)
        run.amplitudes[index] = iq.amplitude
    bandwidth = select_rbw(settings, frequency, run.bandwidth_options)
    if bandwidth != run.bandwidth:
        run.bandwidth = bandwidth
        iq.bandwidth = [bandwidth, bandwidth]
        sync_iq_setting(client, module_name, iq, "bandwidth")
        run.averages = max(1, int(round(FPGA_CLOCK / bandwidth * settings.average_per_point)))
        run.sleep_cycles = max(1, int(round(FPGA_CLOCK / bandwidth * SLEEP_TIMES)))
        base = dsp_addr_base(module_name)
        client.writes(base + 0x130, [run.averages])
        client.writes(base + 0x134, [run.sleep_cycles])

    iq.frequency = frequency
    sync_iq_setting(client, module_name, iq, "frequency")
    started = time.monotonic()
    if not isinstance(client, DummyClient):
        time.sleep((run.sleep_cycles + run.averages) / FPGA_CLOCK * (3.0 if index == 0 else 1.0))
    raw = (
        fake_response(settings, frequency, run.current_avg, iq.amplitude)
        if isinstance(client, DummyClient)
        else read_iq_accumulator(client, module_name)
    )
    amplitude = max(abs(iq.amplitude), np.finfo(float).eps)
    value = raw * (2.0 ** (-IQ_LPF_BITS) * 4.0) / run.averages / amplitude
    value /= iq_transfer_function(frequency, settings.acbandwidth)
    settings.measured_time_per_point = time.monotonic() - started
    return frequency, value, iq.amplitude


def auto_amplitude_for_point(settings: NetworkAnalyzerSettings, run: NetworkAnalyzerRun, index: int) -> float:
    if run.current_avg > 0:
        return float(run.amplitudes[index])
    if index <= 20:
        return settings.amplitude
    last_ratio = float(np.abs(np.mean(run.data[index - 20:index])))
    if last_ratio <= np.finfo(float).eps:
        return float(run.amplitudes[index - 1])
    next_amplitude = 10 ** (settings.target_dbv / 20.0) / last_ratio
    last_amplitude = float(run.amplitudes[index - 1])
    if last_amplitude <= np.finfo(float).eps:
        return min(settings.auto_amp_max, max(settings.auto_amp_min, settings.amplitude))
    if next_amplitude / last_amplitude > 2.0 and last_amplitude * 2.0 <= settings.auto_amp_max:
        return last_amplitude * 2.0
    if next_amplitude / last_amplitude < 0.5 and last_amplitude / 2.0 >= settings.auto_amp_min:
        return last_amplitude / 2.0
    return last_amplitude


def ramp_iq_amplitude(
    client: MonitorClient | DummyClient,
    module_name: str,
    iq: IqSettings,
    target: float,
) -> None:
    start = iq.amplitude
    steps = [target] if isinstance(client, DummyClient) else np.linspace(start, target, 30)
    for amplitude in steps:
        iq.amplitude = float(amplitude)
        sync_iq_setting(client, module_name, iq, "amplitude")
        if not isinstance(client, DummyClient):
            time.sleep(0.01)


def read_iq_accumulator(client: MonitorClient, module_name: str) -> complex:
    base = dsp_addr_base(module_name)
    for _ in range(11):
        a, b, c, d = (int(word) for word in client.reads(base + 0x140, 4))
        if not any(word >> 31 for word in (a, b, c, d)):
            real = _signed(a + (b << 31), 62)
            imag = _signed(c + (d << 31), 62)
            return complex(real, imag)
    raise RuntimeError("Network analyzer IQ accumulator did not become ready")


def iq_transfer_function(frequency: float, acbandwidth: float) -> complex:
    if frequency <= 0:
        return 1.0 + 0.0j
    transfer = 1.0 + 0.0j
    delay_cycles = 3.0
    if acbandwidth > 0:
        transfer /= 1.0 - 1j * acbandwidth / frequency
        delay_cycles += 1.0
    transfer *= np.exp(-1j * delay_cycles * 8e-9 * frequency * 2.0 * np.pi)
    return complex(transfer)


def fake_response(settings: NetworkAnalyzerSettings, frequency: float, average: int, amplitude: float) -> complex:
    corner = 1.8e5
    resonance = 7.5e5
    response = 1.0 / (1.0 + 1j * frequency / corner)
    response *= 1.0 + 0.35 / (1.0 + 1j * (frequency - resonance) / 8e4)
    response *= np.exp(-1j * 2.0 * np.pi * frequency * 140e-9)
    ripple = 1.0 + 0.004 * math.sin(frequency * 1e-4 + average)
    normalized = response * ripple * iq_transfer_function(frequency, settings.acbandwidth)
    scale = amplitude * (2**IQ_LPF_BITS) / 4.0
    averages = max(1, int(round(FPGA_CLOCK / select_rbw(settings, frequency) * settings.average_per_point)))
    return normalized * scale * averages


def stop_iq(client: MonitorClient | DummyClient, module_name: str, iq: IqSettings) -> None:
    iq.amplitude = 0.0
    sync_iq_setting(client, module_name, iq, "amplitude")


def _signed(value: int, bits: int) -> int:
    return value - (1 << bits) if value & (1 << (bits - 1)) else value
