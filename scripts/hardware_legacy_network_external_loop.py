#!/usr/bin/env python3
"""Measure the OUT0-to-IN0 cable with unmodified legacy PyRPL Network Analyzer."""

from __future__ import annotations

import argparse
import json
import tempfile
from pathlib import Path

import numpy as np

from pyrpl import Pyrpl


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--hostname", required=True)
    result.add_argument("--port", type=int, default=2222)
    result.add_argument("--start-hz", type=float, default=10_000.0)
    result.add_argument("--stop-hz", type=float, default=100_000.0)
    result.add_argument("--points", type=int, default=9)
    result.add_argument("--rbw-hz", type=float, default=10_000.0)
    result.add_argument("--amplitude-v", type=float, default=0.1)
    return result


def run(options: argparse.Namespace) -> dict[str, object]:
    # This follows legacy Pyrpl's normal hardware initialization while using a
    # throwaway existing config, preserving both user state and FPGA firmware.
    with tempfile.TemporaryDirectory(prefix="pyrpl-legacy-network-") as directory:
        config = Path(directory) / "comparison.yml"
        config.touch()
        pyrpl = Pyrpl(
            config=str(config),
            hostname=options.hostname,
            port=options.port,
            gui=False,
            autostart=True,
            reloadfpga=False,
            reloadserver=False,
            leds_off=False,
        )
        try:
            analyzer = pyrpl.networkanalyzer
            analyzer.setup(
                input="in1",
                output_direct="out1",
                acbandwidth=0.0,
                start_freq=options.start_hz,
                stop_freq=options.stop_hz,
                rbw=options.rbw_hz,
                average_per_point=1,
                points=options.points,
                amplitude=options.amplitude_v,
                logscale=False,
                auto_bandwidth=False,
                auto_amplitude=False,
                trace_average=1,
            )
            values = np.asarray(analyzer.single(), dtype=np.complex128)
            frequencies = np.asarray(analyzer.frequencies, dtype=np.float64)
            if len(values) != options.points or not np.isfinite(values.real).all() or not np.isfinite(values.imag).all():
                raise RuntimeError("Legacy Network Analyzer returned an invalid external-loop curve")
            return {
                "path": "legacy-pyrpl-networkanalyzer",
                "physical_loop": "OUT0->IN0 (PyRPL out1->in1)",
                "settings": {
                    "start_hz": options.start_hz,
                    "stop_hz": options.stop_hz,
                    "points": options.points,
                    "rbw_hz": options.rbw_hz,
                    "amplitude_v": options.amplitude_v,
                },
                "x": frequencies.tolist(),
                "real": values.real.tolist(),
                "imaginary": values.imag.tolist(),
                "median_magnitude": float(np.median(np.abs(values))),
                "actual_rbw_hz": float(analyzer.rbw),
                "measured_time_per_point_s": float(analyzer.measured_time_per_point),
            }
        finally:
            try:
                pyrpl.networkanalyzer.stop()
            finally:
                pyrpl.rp.end_all()


if __name__ == "__main__":
    print(json.dumps(run(parser().parse_args()), sort_keys=True))
