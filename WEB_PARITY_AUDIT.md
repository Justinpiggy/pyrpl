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
| Scope | `pyrpl/hardware_modules/scope.py`, `pyrpl/widgets/module_widgets/scope_widget.py`, `acquisition_module_widget.py` | Core inputs, duration/decimation, trigger, averaging, rolling capture, run/single/stop, CSV export, zoom/pan are migrated. `ch1_active` and `ch2_active` are now backend attributes instead of browser-only toggles. Remaining gaps: full PyRPL `xy_mode`, `ch_math_active`, `math_formula` display behavior, and replacing the web-only `run_mode` selector with PyRPL's acquisition buttons plus `rolling_mode` trigger-mode control. |
| ASG | `pyrpl/hardware_modules/asg.py`, `asg_widget.py` | GUI/setup attributes are migrated: waveform, amplitude, offset, frequency, trigger source, output direct, start phase, cycles per burst, setup/trigger/off. |
| Housekeeping | `pyrpl/hardware_modules/hk.py`, `hk_widget.py` | LED and expansion P/N value/direction attributes are migrated. |
| PID | `pyrpl/hardware_modules/pid.py`, `pid_widget.py` | GUI attributes are migrated, including `ival`. PyRPL setup attributes do not include `ival`; web setup/save now follows that. `ival` remains directly writable for lockbox/manual offset routines. |
| IQ | `pyrpl/hardware_modules/iq.py`, `iq_widget.py` | PyRPL GUI/setup attributes are migrated. Internal `on` and `pfd_on` registers are no longer exposed as normal user controls or setup-state fields, but remain backend-writeable for routines such as lockbox PDH and spectrum setup. |
| IIR | `pyrpl/hardware_modules/iir/iir.py`, `iir_widget.py` | Routing, loops, pole/zero lists, output, input filter, gain, on/bypass, and plot editor are partially migrated. Removed web Unity/Zero actions because PyRPL comments them out as debug-only GUI methods. Remaining gaps: real coefficient design/write path from PyRPL's `IirFilter`, overflow display, data curve controls, plot-data/product toggles, measurement plot, `measure_transfer_function`, and `tf_type`. |
| Trigger | `pyrpl/hardware_modules/trig.py` | Setup attributes are migrated and setup arms the trigger like PyRPL. The web-only separate Arm action was removed. |
| PWM | `pyrpl/hardware_modules/pwm.py`, `pwm_widget.py` | Input routing is migrated. |
| Spectrum Analyzer | `pyrpl/software_modules/spectrum_analyzer.py`, `spec_an_widget.py`, `acquisition_module_widget.py` | WebSocket plot streaming, baseband/IQ resource ownership, span/window/display controls, trace averaging, zoom/pan, and CSV export are migrated. Remaining gaps: explicit `rbw` GUI readout/control parity, `curve_unit` saved-curve metadata, and closer matching of PyRPL's acquisition button state machine. |
| Lockbox | `pyrpl/software_modules/lockbox/*`, `lockbox_widget.py`, model classes in `pyrpl/software_modules/lockbox/models` and user lockbox dirs | Dynamic model/schema discovery, inputs/outputs/stages, static plots, PDH IQ setup, lock/unlock/sweep/calibration basics are migrated. Remaining gaps: full dynamic method/action exposure for custom classes, complete calibration sweep behavior, complete assisted-design/output transfer-function controls, and tighter parity for every model-specific control routine. |

## Immediate Parity Fixes Applied

- Removed IIR Unity/Zero from the web action list and backend action handler.
  These map to PyRPL `_setup_unity()` and `_setup_zero()`, but those methods are
  explicitly commented out of the original IIR GUI attributes as debug helpers.
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
