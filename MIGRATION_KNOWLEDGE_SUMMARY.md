# Migration Knowledge Summary

Read this before changing migrated PyRPL behavior. The full details remain in
`MIGRATION_KNOWLEDGE_LOG.md`.

## Migration Rules

- Read the original PyRPL code first. Match `_gui_attributes`,
  `_setup_attributes`, widget layout, and control routines before inventing web
  behavior.
- Do not add controls just because a register or helper method exists. Expose
  what the original GUI exposes unless there is a deliberate documented web-only
  reason.
- Do not omit original controls. If a function cannot be migrated yet, record
  it as a parity gap.
- Keep FPGA firmware and `monitor_server.c` untouched.
- If something is needed, ask the user rather than assuming it is unavailable.

## Plot/Layout Rules

- Never resize a canvas or uPlot from a container whose size is determined by
  that same canvas or plot. This causes uncontrolled growth and
  `ResizeObserver` loops.
- Use `web/src/plot-theme.ts` and the CSS plot variables for all uPlot
  backgrounds, axes, grid lines, cursor lines, labels, legends, and common
  trace colors.
- Give graph panels stable dimensions with CSS first, then resize the plot to
  those fixed frame boxes.
- Browser tests for graph-heavy panels must assert nonblank rendering,
  interaction behavior, and stable dimensions over time.
- For uPlot inside split panels, observe the bounded panel/frame, not a
  self-expanding plot container.

## Module/Resource Rules

- PyRPL ownership is `Module.owner` plus `ModuleManager.pop(owner)` /
  `free(module)`. Releasing ownership reloads setup attributes from config.
- Current web `module_owners` is only an approximation. Replace it with a
  Qt-free manager abstraction before relying on complex resource arbitration.
- Preserve PyRPL special cases such as spectrum analyzer directly owning `iq2`.
- Lockbox should not unnecessarily stop scope or spectrum analyzer except when
  the original routine temporarily owns scope for calibration/acquisition.
- Sampler and AMS are programmatic services with no original GUI/setup
  attributes. Do not add setup actions, saved states, or ownership for them.
- Sampler reads signed 14-bit DSP values normalized by 8191. AMS DAC2/DAC3 use
  PyRPL's 24-bit PWM conversion; DAC0/DAC1 are read-only in the web UI because
  original PyRPL says writes to them have no effect.

## Config Rules

- Default config directory is `PYRPL_USER_DIR/config` or
  `~/pyrpl_user_dir/config`.
- Store module setup attributes in root module branches like `scope`, `asg0`,
  and `iq1`.
- Store saved states in `<module>_states`.
- Store web-only layout under `pyrpl_websocket.workspace`.

## IIR Rules

- IIR is a graph-centered editor. Magnitude and phase plots are primary UI.
- `complex_poles`, `complex_zeros`, `real_poles`, and `real_zeros` are the
  source of truth.
- Plot clicks/drags must edit those lists; list edits must update the plot.
- Keep count/add/remove/selection/per-element controls for pole and zero lists.
- Original click model: plain click selects nearest marker, CTRL-click adds a
  real pole, SHIFT-click adds a real zero, CTRL double-click adds a complex
  pole, SHIFT double-click adds a complex zero.
- Pole/zero/gain/loops edits must run PyRPL's IIR design routine and write the
  FPGA coefficient RAM at IIR base `+ 0x8000`; updating only the browser plot is
  not a hardware migration.
- IIR `tf_type` must call the matching original `IirFilter` transfer stage.
  Selected CurveDB data supplies the plot x-axis and the data/product traces.
- Apply `inputfilter` to the plot model after coefficient design and use the
  loaded FPGA's IIR bit/stage constants; these are part of original `_setup()`.
- IIR transfer measurement uses the Network Analyzer's saved `iir_measurement`
  state and routes IIR input through the IQ temporarily owned by that analyzer.
  Always restore the prior input and release/restore the IQ afterward.
- Send missing graph values as JSON `null`; convert them to `NaN` only at the
  TypeScript/uPlot boundary so hidden traces remain gaps rather than zero lines.

## Acquisition/UI Event Rules

- Scope has no original `run_mode` GUI attribute. Use `rolling_mode` for the
  Normal/Untriggered (rolling) choice and preserve the acquisition widget's
  Run single, Run continuous, Pause, Resume, and Stop button states.
- Scope setup changes restart acquisition and browser trace averaging. Reopen
  the Scope WebSocket and ignore handlers from retired sockets so an in-flight
  old frame cannot seed the new average.
- Display-only Scope changes such as XY mode, math visibility, or formula edits
  redraw `displayedData`; they must not run the last frame through averaging
  again.
- Original rolling Scope data uses `[-duration, 0]`, bypasses trace averaging,
  disables trigger/threshold/hysteresis and Run single, but leaves the FPGA
  high-resolution `average` control editable.
- Scope runtime events may update running state, current average, and ownership.
  Do not apply their full setup snapshot over controls; explicit attribute
  events and state-load responses own setup values.
- Releasing temporary Scope ownership must restore intrinsic disabled states
  such as rolling-mode restrictions instead of blindly enabling every input.
- Network analyzer is an IQ accumulator sweep, not a scope capture or CPU FFT.
  It owns one IQ selected in reverse manager order and does not own Scope.
- Incremental uPlot data must contain a finite, monotonic x-array. Do not pad
  the x-array with trailing NaN values; render only the acquired prefix.
- Create Split.js gutters lazily when a panel becomes visible. Hidden-panel
  gutters interfere with workspace selectors and are sized from zero geometry.
- Do not overwrite a focused form input with an older asynchronous state event.
  Apply remote values after the user's edit has committed.

## Curve Rules

- Default curve storage is `PYRPL_USER_DIR/curve`, matching original PyRPL.
- Preserve the standalone CurveDB pickle structure exactly as
  `[pk, params, [x_values, y_values]]` in `<pk>.dat` files.
- Save acquisition setup attributes with curve data. Spectrum curves are stored
  in `curve_unit` (`Vpk^2`), independent of the selected display unit.
- Spectrum trace averaging must happen on linear `Vpk^2` values before
  converting to dB, RMS, or density units for display.
- Curve Viewer selects the newest curve explicitly after refreshing a dynamic
  multi-row selector; browsers do not reliably auto-select its first option.
- Complex curves display magnitude in dB and phase in degrees; real curves
  display their untransformed y-values and hide the phase plot.
