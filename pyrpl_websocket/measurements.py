"""Shared measurement averages, independent of browser render rate and layout."""

from __future__ import annotations

import json
import struct

import numpy as np

from .scope import ScopeFrame
from .session import _spectrum_window
from .modules import SPECTRUM_WINDOWS


class ScopeAverage:
    def __init__(self):
        self.revision = -1
        self.count = 0
        self.samples = None

    def add(self, frame: ScopeFrame, revision: int, target: int, rolling: bool) -> ScopeFrame:
        if revision != self.revision or rolling:
            self.count = 0
            self.revision = revision
        self.count = min(self.count + 1, target)
        samples = frame.samples()
        if self.count == 1:
            self.samples = samples.copy()
        else:
            self.samples += (samples - self.samples) / self.count
        return ScopeFrame(frame.sequence, frame.timestamp_ns, frame.sample_count, frame.channel_count, self.samples.tobytes())


class SpectrumAverage:
    """Average windowed correlations; browsers interpolate spectra with their FFT.

    A length-2N correlation contains the complete power spectrum of an N-sample
    record. This avoids storing raw trace history or doing the 16x display
    padding on the board. All supported windows share the same acquisitions.
    """

    def __init__(self):
        self.revision = -1
        self.count = 0
        self.correlations: dict[str, np.ndarray] = {}

    def add(self, frame: ScopeFrame, revision: int, settings) -> dict:
        if revision != self.revision:
            self.count = 0
            self.correlations = {}
            self.revision = revision
        metadata = {
            "sequence": frame.sequence, "samples": frame.sample_count,
            "span": settings.span, "center": settings.center, "baseband": settings.baseband,
            "iqBandwidth": list(settings.iq_bandwidth),
        }
        if settings.trace_average == 1:
            # No power average is needed: preserve the original small raw-frame
            # path and leave windowing/FFT entirely in the browser.
            self.count = 0
            self.correlations = {}
            return {**metadata, "count": 1, "raw": frame.to_bytes()}
        self.count = min(self.count + 1, settings.trace_average)
        samples = frame.samples().astype(np.float64)
        nfft = 2 * frame.sample_count
        for name in SPECTRUM_WINDOWS:
            window = _spectrum_window(name, frame.sample_count)
            if settings.baseband:
                fft = np.fft.rfft(samples * window[:, None], n=nfft, axis=0)
                cross = fft[:, 0].conj() * fft[:, 1]
                powers = np.stack((abs(fft[:, 0]) ** 2, abs(fft[:, 1]) ** 2, cross.real, cross.imag))
                # Cross imaginary spectrum is odd; store its real odd correlation.
                corr = np.fft.irfft(powers.astype(np.complex128), n=nfft, axis=1)
                corr[3] = np.fft.irfft(1j * cross.imag, n=nfft)
            else:
                fft = np.fft.fft((samples[:, 0] + 1j * samples[:, 1]) * window, n=nfft)
                corr_complex = np.fft.ifft(abs(fft) ** 2)
                corr = np.stack((corr_complex.real, corr_complex.imag))
            if self.count == 1:
                self.correlations[name] = corr
            else:
                self.correlations[name] += (corr - self.correlations[name]) / self.count
        return {
            **metadata, "count": self.count,
            "windows": {name: values.astype('<f8').tobytes() for name, values in self.correlations.items()},
        }


def spectrum_average_bytes(snapshot: dict, window: str) -> bytes:
    if "raw" in snapshot:
        return snapshot["raw"]
    metadata = {key: value for key, value in snapshot.items() if key != "windows"}
    metadata["window"] = window
    header = json.dumps(metadata).encode()
    header += b' ' * (-len(header) % 8)
    return b'PWA1' + struct.pack('<I', len(header)) + header + snapshot["windows"][window]


def resize_scope_frame(frame: ScopeFrame, samples: int) -> bytes:
    if samples >= frame.sample_count:
        return frame.to_bytes()
    # Sample the whole time interval; a smaller display must not recapture it.
    indices = np.arange(samples) * frame.sample_count // samples
    return ScopeFrame(frame.sequence, frame.timestamp_ns, samples, frame.channel_count, frame.samples()[indices].tobytes()).to_bytes()


def spectrum_snapshot_arrays(snapshot: dict, window: str) -> dict:
    """Read an existing spectrum for HTTP clients without touching the hardware."""
    if "raw" in snapshot:
        from .modules import SpectrumAnalyzerSettings
        settings = SpectrumAnalyzerSettings(baseband=snapshot["baseband"], span=snapshot["span"], center=snapshot["center"], trace_average=2)
        settings.iq_bandwidth = snapshot["iqBandwidth"]
        snapshot = SpectrumAverage().add(ScopeFrame.from_bytes(snapshot["raw"]), 0, settings)
    count = snapshot["samples"]
    rows = 4 if snapshot["baseband"] else 2
    correlations = np.frombuffer(snapshot["windows"][window], dtype='<f8').reshape(rows, 2 * count)
    padded = np.zeros((rows, count * 16))
    padded[:, :count], padded[:, -count:] = correlations[:, :count], correlations[:, count:]
    span = snapshot["span"]
    weights = _spectrum_window(window, count)
    rbw = float(span * np.sum(weights.astype(float)**2) / np.sum(weights.astype(float))**2)
    if snapshot["baseband"]:
        fft = np.fft.rfft(padded, axis=1)
        freqs = np.fft.rfftfreq(count * 16, 1 / span)
        correction = 1 / np.sinc(freqs / span)**2 if round(125e6 / span) > 1 else np.ones_like(freqs)
        values = [np.maximum(0, fft[0].real), np.maximum(0, fft[1].real), abs(fft[2].real + 1j * fft[3].imag)]
        labels = ["Input 1", "Input 2", "Cross"]
    else:
        freqs = np.fft.fftshift(np.fft.fftfreq(count * 16, 1 / span))
        correction = 1 / np.sinc(freqs / span)**2 if round(125e6 / span) > 1 else np.ones_like(freqs)
        for bandwidth in snapshot["iqBandwidth"]:
            if bandwidth > 0:
                correction *= 1 + (freqs / bandwidth)**2
            elif bandwidth < 0:
                correction *= 1 + np.divide(bandwidth, freqs, out=np.zeros_like(freqs), where=freqs != 0)**2
        values = [np.maximum(0, np.fft.fftshift(np.fft.fft(padded[0] + 1j * padded[1]).real))]
        freqs += snapshot["center"]
        labels = ["IQ"]
    return {"sequence": snapshot["sequence"], "x": freqs.tolist(),
            "series": [{"label": label, "values": (value * correction).tolist()} for label, value in zip(labels, values)],
            "span": span, "center": snapshot["center"], "rbw": rbw, "unit": "Vpk^2", "current_avg": snapshot["count"]}
