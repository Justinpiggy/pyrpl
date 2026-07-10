"""Qt-free IIR transfer-function plot helpers."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from .modules import IirSettings


def iir_plot(settings: IirSettings, points: int = 1000) -> dict[str, Any]:
    """Return the Bode data and pole/zero markers used by PyRPL's IIR editor."""

    count = max(64, min(4000, int(points)))
    frequencies = np.logspace(1, math.log10(5e6), count)
    transfer = _continuous_transfer(settings, frequencies)
    markers = _markers(settings)
    for marker in markers:
        marker_tf = _continuous_transfer(settings, np.asarray([marker["frequency"]], dtype=float))
        marker["magnitude"] = float(_magnitude_db(marker_tf)[0])
        marker["phase"] = float(np.angle(marker_tf, deg=True)[0])
    return {
        "x": [float(value) for value in frequencies],
        "magnitude": [float(value) for value in _magnitude_db(transfer)],
        "phase": [float(value) for value in np.angle(transfer, deg=True)],
        "markers": markers,
        "state": {
            "real_poles": list(settings.real_poles),
            "real_zeros": list(settings.real_zeros),
            "complex_poles": list(settings.complex_poles),
            "complex_zeros": list(settings.complex_zeros),
        },
    }


def _continuous_transfer(settings: IirSettings, frequencies: np.ndarray) -> np.ndarray:
    zeros = _expanded_complex_values(settings.complex_zeros) + [complex(value) for value in settings.real_zeros]
    poles = _expanded_complex_values(settings.complex_poles) + [complex(value) for value in settings.real_poles]
    if not zeros and not poles:
        return frequencies.astype(complex) * 0.0 + 1e-12
    zeros, poles = _make_proper(zeros, poles, max(3, int(settings.loops)))
    s = 1j * 2.0 * np.pi * frequencies.astype(complex)
    scaled_zeros = [zero * 2.0 * np.pi for zero in zeros]
    scaled_poles = [pole * 2.0 * np.pi for pole in poles]
    gain = float(settings.gain)
    for pole in scaled_poles:
        if pole != 0:
            gain *= abs(pole)
    for zero in scaled_zeros:
        if zero != 0:
            gain /= abs(zero)
    transfer = np.ones_like(s, dtype=complex) * gain
    for zero in scaled_zeros:
        transfer *= s - zero
    for pole in scaled_poles:
        transfer /= s - pole
    return transfer * _inputfilter_transfer(settings.inputfilter, frequencies, settings.loops)


def _inputfilter_transfer(inputfilter: list[float], frequencies: np.ndarray, loops: int) -> np.ndarray:
    transfer = np.ones_like(frequencies, dtype=complex)
    for bandwidth in inputfilter:
        cutoff = float(bandwidth)
        if cutoff > 0:
            transfer /= 1.0 + 1j * frequencies / cutoff
        elif cutoff < 0:
            transfer /= 1.0 + 1j * abs(cutoff) / frequencies
    delay = (5.0 + max(3, float(loops)) / 2.0) * 8e-9
    transfer *= np.exp(-1j * delay * frequencies * 2.0 * np.pi)
    return transfer


def _expanded_complex_values(values: list[str]) -> list[complex]:
    expanded: list[complex] = []
    for value in values:
        parsed = complex(str(value).replace("i", "j"))
        expanded.append(parsed)
        if parsed.imag != 0:
            expanded.append(parsed.conjugate())
    return expanded


def _make_proper(zeros: list[complex], poles: list[complex], loops: int) -> tuple[list[complex], list[complex]]:
    zeros = list(zeros)
    poles = list(poles)
    extrapole = -125e6 / loops / 2.0
    while len(zeros) >= len(poles):
        poles.append(complex(extrapole))
        extrapole /= 2.0
    return zeros, poles


def _markers(settings: IirSettings) -> list[dict[str, Any]]:
    markers: list[dict[str, Any]] = []
    for kind, values in (("pole", settings.real_poles), ("zero", settings.real_zeros)):
        for index, value in enumerate(values):
            frequency = abs(float(value))
            if frequency > 0:
                markers.append(
                    {
                        "list": f"real_{kind}s",
                        "kind": kind,
                        "shape": "real",
                        "index": index,
                        "value": float(value),
                        "frequency": frequency,
                    }
                )
    for kind, values in (("pole", settings.complex_poles), ("zero", settings.complex_zeros)):
        for index, value in enumerate(values):
            parsed = complex(str(value).replace("i", "j"))
            frequency = abs(parsed.imag)
            if frequency > 0:
                markers.append(
                    {
                        "list": f"complex_{kind}s",
                        "kind": kind,
                        "shape": "complex",
                        "index": index,
                        "value": str(value),
                        "frequency": frequency,
                    }
                )
    return markers


def _magnitude_db(values: np.ndarray) -> np.ndarray:
    return 20.0 * np.log10(np.abs(values.astype(complex)) + np.finfo(float).eps)
