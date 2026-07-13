"""Qt-free IIR transfer-function plot helpers."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from .dsp_registers import make_iir_filter
from .modules import IirSettings


def iir_plot(
    settings: IirSettings,
    points: int = 1000,
    data_curve: dict[str, Any] | None = None,
    measurement: tuple[np.ndarray, np.ndarray] | None = None,
    iir_filter=None,
) -> dict[str, Any]:
    """Return the Bode data and pole/zero markers used by PyRPL's IIR editor."""

    count = max(64, min(4000, int(points)))
    frequencies, curve_values = _plot_frequencies_and_curve(data_curve, count)
    iir_filter = iir_filter or make_iir_filter(settings)
    transfer = _transfer_from_filter(iir_filter, frequencies, settings.tf_type)
    data_values = curve_values if settings.plot_data else None
    product_values = curve_values * transfer if curve_values is not None and settings.plot_data_times_filter else None
    measurement_values = _interpolate_measurement(frequencies, measurement) if settings.plot_measurement else None
    markers = _markers(settings)
    for marker in markers:
        marker_tf = _transfer_from_filter(
            iir_filter,
            np.asarray([marker["frequency"]], dtype=float),
            settings.tf_type,
        )
        marker["magnitude"] = float(_magnitude_db(marker_tf)[0])
        marker["phase"] = float(np.angle(marker_tf, deg=True)[0])
    return {
        "x": [float(value) for value in frequencies],
        "magnitude": [float(value) for value in _magnitude_db(transfer)],
        "phase": [float(value) for value in np.angle(transfer, deg=True)],
        "data_magnitude": _plot_values(data_values, _magnitude_db, len(frequencies)),
        "data_phase": _plot_values(data_values, lambda values: np.angle(values, deg=True), len(frequencies)),
        "product_magnitude": _plot_values(product_values, _magnitude_db, len(frequencies)),
        "product_phase": _plot_values(product_values, lambda values: np.angle(values, deg=True), len(frequencies)),
        "measurement_magnitude": _plot_values(measurement_values, _magnitude_db, len(frequencies)),
        "measurement_phase": _plot_values(
            measurement_values,
            lambda values: np.angle(values, deg=True),
            len(frequencies),
        ),
        "markers": markers,
        "tf_type": settings.tf_type,
        "data_curve_name": settings.data_curve_name,
        "state": {
            "real_poles": list(settings.real_poles),
            "real_zeros": list(settings.real_zeros),
            "complex_poles": list(settings.complex_poles),
            "complex_zeros": list(settings.complex_zeros),
        },
    }


def transfer_function_by_kind(
    settings: IirSettings,
    frequencies: np.ndarray,
    kind: str,
) -> np.ndarray:
    """Call the original IirFilter transfer-function stage selected by PyRPL."""

    iir_filter = make_iir_filter(settings)
    return _transfer_from_filter(iir_filter, frequencies, kind)


def _transfer_from_filter(iir_filter, frequencies: np.ndarray, kind: str) -> np.ndarray:
    method_name = "tf_coefficients_numpy" if kind == "coefficients" else f"tf_{kind}"
    method = getattr(iir_filter, method_name)
    return np.asarray(method(frequencies=np.asarray(frequencies, dtype=float)), dtype=np.complex128)


def _plot_frequencies_and_curve(
    data_curve: dict[str, Any] | None,
    count: int,
) -> tuple[np.ndarray, np.ndarray | None]:
    if data_curve:
        frequencies = np.asarray(data_curve.get("x", []), dtype=float)
        real = np.asarray(data_curve.get("y", []), dtype=float)
        imaginary = np.asarray(data_curve.get("y_imag", np.zeros(real.size)), dtype=float)
        if frequencies.ndim == real.ndim == imaginary.ndim == 1 and frequencies.size == real.size == imaginary.size:
            keep = np.isfinite(frequencies) & np.isfinite(real) & np.isfinite(imaginary)
            if np.any(keep):
                frequencies = frequencies[keep]
                frequencies[frequencies <= 0] = np.finfo(float).eps
                return frequencies, (real[keep] + 1j * imaginary[keep]).astype(np.complex128)
    return np.logspace(1, math.log10(5e6), count), None


def _interpolate_measurement(
    frequencies: np.ndarray,
    measurement: tuple[np.ndarray, np.ndarray] | None,
) -> np.ndarray | None:
    if measurement is None:
        return None
    measured_frequencies = np.asarray(measurement[0], dtype=float)
    measured_values = np.asarray(measurement[1], dtype=np.complex128)
    keep = np.isfinite(measured_frequencies) & (measured_frequencies > 0) & np.isfinite(measured_values)
    if not np.any(keep):
        return None
    measured_frequencies = measured_frequencies[keep]
    measured_values = measured_values[keep]
    order = np.argsort(measured_frequencies)
    source_x = np.log10(measured_frequencies[order])
    target_x = np.log10(frequencies)
    real = np.interp(target_x, source_x, measured_values[order].real, left=np.nan, right=np.nan)
    imaginary = np.interp(target_x, source_x, measured_values[order].imag, left=np.nan, right=np.nan)
    return real + 1j * imaginary


def _plot_values(values, transform, count: int) -> list[float | None]:
    if values is None:
        return [None] * count
    return [float(value) if np.isfinite(value) else None for value in transform(np.asarray(values, dtype=np.complex128))]


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
