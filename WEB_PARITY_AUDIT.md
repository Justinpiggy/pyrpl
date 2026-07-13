# Web Migration Parity Audit

This file records the migration rule for every web panel: read the original
PyRPL module and widget code first, then expose the same user-facing controls
and actions in the web version. Internal registers may still exist in backend
helpers, but they should not become web controls unless they are part of the
original GUI or are required by an original control routine.

## Audit Rule

For each module, check these original PyRPL surfaces before changing the web
panel:

- `_gui_attributes`: controls visible in the PyQt GUI.
- `_setup_attributes`: values saved/loaded by setup state.
- Widget subclasses in `pyrpl/widgets/module_widgets`: layout and action
  buttons.
- Control routines such as `_setup()`, `_start_trace_acquisition()`,
  `save_curve()`, `lock()`, `sweep()`, and calibration helpers.

Do not add debug helpers or convenience actions as normal web UI controls
unless they appear in the original user workflow. Do not omit original controls;
if a control cannot be completed immediately, record it here as an explicit
gap.

## Current Panels

| Web panel | Original PyRPL source | Current parity status |
| --- | --- | --- |
| Scope | `pyrpl/hardware_modules/scope.py`, `pyrpl/widgets/module_widgets/scope_widget.py`, `acquisition_module_widget.py` | Core inputs, duration/decimation, trigger, averaging, rolling capture, run/single/stop, PyRPL-compatible per-channel curve persistence, CSV export, zoom/pan are migrated. `ch1_active` and `ch2_active` are backend attributes instead of browser-only toggles. Remaining gaps: full PyRPL `xy_mode`, `ch_math_active`, `math_formula` display behavior, and replacing the web-only `run_mode` selector with PyRPL's acquisition buttons plus `rolling_mode` trigger-mode control. |
| ASG | `pyrpl/hardware_modules/asg.py`, `asg_widget.py` | GUI/setup attributes are migrated: waveform, amplitude, offset, frequency, trigger source, output direct, start phase, cycles per burst, setup/trigger/off. |
| Housekeeping | `pyrpl/hardware_modules/hk.py`, `hk_widget.py` | LED and expansion P/N value/direction attributes are migrated. |
| Sampler / AMS | `pyrpl/hardware_modules/sampler.py`, `ams.py`, `attributes.py::PWMRegister` | Both original modules have empty GUI/setup attribute lists. The web telemetry panel deliberately adds no setup actions, ownership, or saved state. It exposes all DSP signal readbacks and `Sampler.stats()`, all four AMS readbacks, and effective writes to DAC2/DAC3 using the original PWM conversion; DAC0/DAC1 are read-only because original PyRPL documents their writes as ineffective. |
| PID | `pyrpl/hardware_modules/pid.py`, `pid_widget.py` | GUI attributes are migrated, including `ival`. PyRPL setup attributes do not include `ival`; web setup/save now follows that. `ival` remains directly writable for lockbox/manual offset routines. |
| IQ | `pyrpl/hardware_modules/iq.py`, `iq_widget.py` | PyRPL GUI/setup attributes are migrated. Internal `on` and `pfd_on` registers are no longer exposed as normal user controls or setup-state fields, but remain backend-writeable for routines such as lockbox PDH and spectrum setup. |
| IIR | `pyrpl/hardware_modules/iir/iir.py`, `iir_widget.py`, `iir_theory.py`, `network_analyzer.py` | GUI/setup controls, routing, pole/zero editor, all original transfer-function stages, CurveDB data/product traces, overflow status, coefficient RAM writes, and Network Analyzer-backed transfer measurement are migrated. Measurement temporarily routes through the analyzer-owned IQ and restores/releases it. Web Unity/Zero remain excluded because PyRPL comments them out as debug-only GUI methods. |
| Trigger | `pyrpl/hardware_modules/trig.py` | Setup attributes are migrated and setup arms the trigger like PyRPL. The web-only separate Arm action was removed. |
| PWM | `pyrpl/hardware_modules/pwm.py`, `pwm_widget.py` | Input routing is migrated. |
| Spectrum Analyzer | `pyrpl/software_modules/spectrum_analyzer.py`, `spec_an_widget.py`, `acquisition_module_widget.py` | WebSocket plot streaming, baseband/IQ resource ownership, span/window/display controls, trace averaging, PyRPL-compatible `curve_unit` persistence, zoom/pan, and CSV export are migrated. Remaining gaps: explicit `rbw` GUI readout/control parity and closer matching of PyRPL's acquisition button state machine. |
| Network Analyzer | `pyrpl/software_modules/network_analyzer.py`, `na_widget.py`, `acquisition_module_widget.py`, `hardware_modules/iq.py` | Original GUI/setup attributes, IQ manager selection, register-level point stepping, FPGA IQ accumulation, magnitude/phase plots, Single/Continuous/Stop, trace averaging, zero-span data, auto-bandwidth, auto-amplitude ramping, CurveDB persistence, WebSocket updates, and CSV export are migrated. Remaining gap: hardware validation of normalization and transfer-function correction. |
| Curve Viewer | `pyrpl/software_modules/curve_viewer.py`, `curve_viewer_widget.py`, `curvedb.py`, `CurveAttributeWidget` | Newest-100 curve selection, real/complex plotting, YAML parameter display/edit/save, delete, refresh, and PyRPL `.dat` compatibility are migrated. Custom `global_config.general.curvedb` backend overrides are not yet supported by the web server. |
| Lockbox | `pyrpl/software_modules/lockbox/*`, `lockbox_widget.py`, model classes in `pyrpl/software_modules/lockbox/models` and user lockbox dirs | Dynamic model/schema discovery, inputs/outputs/stages, static plots, PDH IQ setup, lock/unlock/sweep/calibration basics are migrated. Remaining gaps: full dynamic method/action exposure for custom classes, complete calibration sweep behavior, complete assisted-design/output transfer-function controls, and tighter parity for every model-specific control routine. |

## Immediate Parity Fixes Applied

- Removed IIR Unity/Zero from the web action list and backend action handler.
  These map to PyRPL `_setup_unity()` and `_setup_zero()`, but those methods are
  explicitly commented out of the original IIR GUI attributes as debug helpers.
- Added IIR CurveDB selection, data/data-times-filter visibility, measurement
  visibility, transfer-function stage selection, overflow readback, and the
  original Network Analyzer measurement routine with temporary IQ ownership.
- Removed PID `ival` from web setup/save attributes while keeping it visible and
  directly writable, matching PyRPL where `_gui_attributes` includes `ival` but
  `_setup_attributes` does not.
- Removed IQ `on` and `pfd_on` from web setup/save attributes and visible
  schema, matching PyRPL where they are internal registers rather than GUI/setup
  attributes.
- Added scope `ch1_active` and `ch2_active` as backend state so the existing
  channel checkboxes behave like PyRPL scope channel controls.
- Removed Trigger's separate web Arm action; PyRPL's trigger module arms during
  `_setup()`, so the web panel now uses Setup for that path.
