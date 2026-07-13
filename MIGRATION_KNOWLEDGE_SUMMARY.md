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
- Lockbox calibration configures a one-period Scope capture from the selected
  sweep output, subtracts the stored analog offset, and computes standard
  deviation plus midpoint/amplitude from the extrema. Forward that capture to
  the Scope stream while its controls are owned, then restore the prior setup.
- Output assisted design uses `i = desired_unity_gain_frequency` and
  `p = i / analog_filter_cutoff` (or zero at zero cutoff); manual mode derives
  the two assisted values from `p` and `i`. Reapply edits according to the
  output's current lock/sweep/unlock state.
- Original Lockbox output plots show the complete open-loop magnitude and
  phase: analog flat/filter/CurveDB plant, PID/filter/delay response, and the
  optional IIR response divided by IIR gain.
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
- On the last single-shot average, send the binary Scope frame before
  publishing the terminal `paused_single` event. The terminal event closes the
  browser stream; sending it first can discard the final capture and leave the
  browser average counter one frame behind.
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
- Spectrum Analyzer follows the shared AcquisitionModule state machine: Run
  single collects `trace_average` frames, continuous uses a capped moving
  average, Pause preserves the accumulated data, Resume can choose either
  mode, and Stop is separate. Do not replace this with a timer or Run/Stop
  toggle.
- Spectrum RBW is `span * sum(window^2) / sum(window)^2` for the 16,384-point
  Scope buffer. Span and RBW select the same decimation; changing the window
  refreshes RBW. Baseband uses Scope only, while IQ mode also owns IQ2.
- A browser WebSocket close may leave an idle server loop alive until its next
  send. Give every shared acquisition stream, including Scope and Spectrum, a
  server-side generation and check it before and after hardware acquisition so
  retired loops cannot consume frames from a later run. Invalidate generations
  for acquisition start/resume actions over REST and control WebSocket alike,
  and explicitly reconnect the active client afterward. Client handlers must
  likewise ignore non-current socket objects.
- Static uPlot canvases must not intercept clicks intended for controls that
  become adjacent after responsive scrolling. Disable pointer events on the
  entire static plot subtree, and rebuild `web/dist` before Playwright tests
  because the FastAPI test server serves compiled assets.

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
