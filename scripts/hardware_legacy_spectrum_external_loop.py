#!/usr/bin/env python3
"""Measure the OUT0-to-IN0 cable with the unmodified legacy Spectrum Analyzer.

This script deliberately uses the original PyRPL Python modules and their
MonitorClient, including its normal monitor-server lifecycle, so its result is
a regression reference for the browser WebSocket/FFT path.
"""

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
    result.add_argument("--tone-hz", type=float, default=100_000.0)
    result.add_argument("--amplitude-v", type=float, default=0.2)
    result.add_argument("--span-hz", type=float, default=976_562.5)
    return result


def run(options: argparse.Namespace) -> dict[str, object]:
    # An existing temporary config avoids legacy Pyrpl's interactive config-name
    # prompt and leaves the user's saved configurations untouched. Passing a
    # nonexistent path would make MemoryTree create it under PYRPL_USER_DIR.
    # Legacy Pyrpl must start normally so it builds its hardware module
    # inventory before the Spectrum Analyzer reserves Scope/IQ resources.
    # reloadfpga=False keeps the loaded FPGA firmware untouched.
    with tempfile.TemporaryDirectory(prefix="pyrpl-legacy-spectrum-") as directory:
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
            asg = pyrpl.rp.asg0
            asg.setup(
                waveform="sin",
                frequency=options.tone_hz,
                amplitude=options.amplitude_v,
                offset=0.0,
                trigger_source="high",
                output_direct="out1",
            )
            analyzer = pyrpl.spectrumanalyzer
            analyzer.setup(
                baseband=True,
                span=options.span_hz,
                window="blackman",
                input1_baseband="in1",
                input2_baseband="in2",
                trace_average=1,
            )
            input1, *_ = analyzer.single()
            frequencies = np.asarray(analyzer.frequencies)
            peak_tolerance = max(float(analyzer.rbw) * 3.0, options.tone_hz * 0.03)
            candidates = np.flatnonzero(np.abs(frequencies - options.tone_hz) <= peak_tolerance)
            if not len(candidates):
                raise RuntimeError(f"No legacy spectrum bins near {options.tone_hz} Hz")
            peak_index = int(candidates[np.argmax(input1[candidates])])
            global_peak_index = int(np.argmax(input1))
            peak = {
                "frequency": float(frequencies[peak_index]),
                "value": float(input1[peak_index]),
                "index": peak_index,
            }
            global_peak = {
                "frequency": float(frequencies[global_peak_index]),
                "value": float(input1[global_peak_index]),
                "index": global_peak_index,
            }
            bin_width = float(frequencies[1] - frequencies[0]) if len(frequencies) > 1 else 0.0
            if not np.isfinite(peak["value"]) or peak["value"] <= 0:
                raise RuntimeError(f"External IN0 loop produced no positive legacy peak: {peak['value']}")
            if abs(peak["frequency"] - options.tone_hz) > peak_tolerance:
                raise RuntimeError(
                    f"Legacy peak {peak['frequency']} Hz is not near {options.tone_hz} Hz "
                    f"(bin width {bin_width} Hz)"
                )
            return {
                "path": "legacy-pyrpl-spectrumanalyzer",
                "physical_loop": "OUT0->IN0 (PyRPL out1->in1)",
                "tone": {"frequency": options.tone_hz, "amplitude": options.amplitude_v},
                "span": options.span_hz,
                "bins": int(len(frequencies)),
                "rbw": float(analyzer.rbw),
                "bin_width": bin_width,
                "dc_value": float(input1[0]),
                "peak": peak,
                "global_peak": global_peak,
            }
        finally:
            try:
                pyrpl.spectrumanalyzer.stop()
                pyrpl.rp.asg0.output_direct = "off"
                pyrpl.rp.asg0.amplitude = 0.0
            finally:
                pyrpl.rp.end_all()


if __name__ == "__main__":
    print(json.dumps(run(parser().parse_args()), sort_keys=True))
