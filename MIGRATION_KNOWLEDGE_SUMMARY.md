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
- In Split.js workspaces, use `contain: size layout` on every live-plot host,
  keep the split workspace at `height: 100%`, and allow panels to shrink with
  `min-width: 0`; this stops a canvas measurement feeding back into the next
  side-by-side layout pass.
- For a plot initially created in a hidden panel, observe the bounded visible
  host and resize only after it has nonzero geometry. For titled/legend uPlots,
  subtract the measured root chrome from the host height before `setSize`, or
  the plot frame will clip its own axes and legend.

## Module/Resource Rules

- PyRPL ownership is `Module.owner` plus `ModuleManager.pop(owner)` /
  `free(module)`. Releasing ownership reloads setup attributes from config.
- The web server uses a Qt-free `ModuleManager` for reservations: it allocates
  the last free compatible module, runs ownership hooks, and reloads persisted
  setup on release. `module_owners` is now a read-only-by-convention API view,
  not the allocation mechanism.
- Scope ownership stops normal user acquisition before an analyzer repurposes
  capture settings. Lockbox calibration is the required exception: it locks
  Scope controls, forwards the temporary capture to the stream, and restores
  the prior Scope setup without stopping the visible stream.
- Preserve PyRPL special cases such as spectrum analyzer directly owning `iq2`.
- Lockbox should not unnecessarily stop scope or spectrum analyzer except when
  the original routine temporarily owns scope for calibration/acquisition.
- `Lockbox.unlock()` disables each output PID but does not free Lockbox-owned
  PID, ASG, PWM, or IQ modules. Retain them until a Lockbox model is cleared or
  replaced; freeing them restores persisted setups and creates incorrect,
  disruptive hardware traffic.
- A Lockbox sweep still writes PyRPL's complete ASG waveform table. On the
  shared monitor-server connection, chunk that table into contiguous writes
  and release the session lock between chunks so Scope continues streaming;
  serialize each individual monitor request in the client.
- Lockbox calibration configures a one-period Scope capture from the selected
  sweep output, subtracts the stored analog offset, and computes standard
  deviation plus midpoint/amplitude from the extrema. Forward that capture to
  the Scope stream while its controls are owned, then restore the prior setup.
- Lockbox auto relock is a persistent server responsibility, not a browser
  timer. While a configured stage is active, sample the selected error signal
  for 10 ms at `lockstatus_interval`, apply PyRPL's expected-signal/slope
  interval test, and check PID saturation from both live `ival` and sampler
  output. A loss in final `lock_on` reruns the complete stage sequence when
  `auto_lock` is enabled, even with no WebSocket clients connected.
- Preserve model lock-check overrides such as Fabry-Perot's inherited
  `_default_is_locked_input = "reflection"`; the current stage input is not
  always the lock-health signal.
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
- Persist the selected Lockbox model in the root `lockbox.classname` branch,
  matching PyRPL's `Lockbox._make_Lockbox()` lookup; restore it before the web
  session exposes Lockbox controls.

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
- The original Scope math formula is Python `eval` over full NumPy arrays. The
  browser must use its restricted per-sample engine instead: support explicit
  element-wise NumPy aliases and comparisons/conditionals, never arbitrary
  Python or JavaScript access. Scalar reductions over complete vectors are
  allowed and broadcast into a formula; arbitrary NumPy array expressions are
  still a documented compatibility boundary.
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
- Scope hardware capture must sleep the configured acquisition duration before
  its first ready-register poll, matching original
  `AcquisitionModule._data_ready_async`; polling immediately can accept stale
  idle bits and stream the previous buffer.
- Web Scope channel-edge traces use the threshold crossing as time zero, as
  requested by the user, rather than the legacy delayed trigger-pointer origin.
  `scope-frame.ts` compensates `1 + floor(2 / decimation)` samples of pointer/
  buffer alignment delay for real CH1/CH2 edge triggers, then interpolates only
  the identified crossing's adjacent samples when they bracket the effective
  threshold. Both channels receive the same time shift; voltages and relative
  delays are unchanged. Display, math, CSV and saved curves share these times.
  Raw PWS1 samples keep their legacy order. Fake, rolling, immediate, external,
  ASG and DSP triggers do not receive this channel-comparator correction.
  Rising/falling edges, FPGA averaging on/off, and decimations 1, 2, 4, 8, 64
  matched the predicted crossing indices in 20 board captures on 2026-11-01.
- An open browser retains its loaded frontend across a board redeploy and
  WebSocket reconnect. Reload the page to activate a new frontend build;
  live acquisition alone does not prove the tab is using the deployed code.
- uPlot mode 2 `setSeries({show})` resets both facet scales even with
  `auto: false`. Scope visibility updates must preserve the X/Y ranges in
  the same batch. Regression checks must count waveform-colored pixels;
  grid pixels or correct CSV data can coexist with a blank plot.
- UI diagnostics and inline hints are off by default. `?debug=1` (or
  `?debug=true`) enables one bottom status bar for session information and
  visible-panel diagnostics. Diagnostic source elements remain hidden in
  panels in both modes, including dynamically created modules. Errors use
  `reportError` and remain visible in the footer without the debug flag.
  Hiding plot toolbars requires a single plot grid row to avoid collapsing
  the canvas host. Keep measured values and editable controls visible.
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
- Spectrum uses PyRPL's `PADDING_FACTOR = 16`: transform 16,384 windowed samples
  into 262,144 FFT points in a browser Web Worker. Baseband returns 131,073
  bins; IQ returns the full shifted 262,144 bins. Transfer `ArrayBuffer`s to
  and from the worker and discard results from superseded setup generations.
- The physical Red Pitaya OUT0/IN0 connector pair maps to legacy PyRPL
  `out1`/`in1`. Hardware Spectrum parity checks must use that external cable,
  then compare original `SpectrumAnalyzer.single()` and the packaged browser
  WebSocket/Worker result sequentially with identical tone, span, window, and
  averaging settings.
- Average baseband cross spectra as separate real and imaginary arrays, then
  take magnitude only for display. Save both components to CurveDB. Display
  unit and show/hide changes must not reset the linear `Vpk^2` average.
- A browser WebSocket close may leave its handler alive briefly. Do not give
  each browser its own singleton-instrument acquisition loop: use one server
  producer per instrument/sample size and fan out each result to bounded client
  queues. Stop naturally after the last subscriber leaves so an in-flight
  blocking read finishes before a later producer starts. Client handlers must
  still ignore non-current socket objects.
- Static uPlot canvases must not intercept clicks intended for controls that
  become adjacent after responsive scrolling. Disable pointer events on the
  entire static plot subtree, and rebuild `pyrpl_websocket/frontend` before
  Playwright tests because the FastAPI test server serves compiled assets.

## Curve Rules

- Default curve storage is `PYRPL_USER_DIR/curve`, matching original PyRPL.
- Preserve the standalone CurveDB pickle structure exactly as
  `[pk, params, [x_values, y_values]]` in `<pk>.dat` files.
- Save acquisition setup attributes with curve data. Spectrum curves are stored
  in `curve_unit` (`Vpk^2`), independent of the selected display unit.
- Spectrum trace averaging must happen on linear `Vpk^2` values before
  converting to dB, RMS, or density units for display.
- Baseband Spectrum preserves physical ADC DC offset, as original PyRPL does.
  Hardware tone comparisons must select a local peak near the known injected
  frequency, not assume it is the globally largest bin.
- Hardware reference on 2026-07-21: with OUT0 connected to IN0, a 100 kHz,
  0.2 V ASG0 sine measured `0.04663032 Vpk^2` in original PyRPL and
  `0.04662919 Vpk^2` through the packaged browser WebSocket/Worker path.
- Curve Viewer selects the newest curve explicitly after refreshing a dynamic
  multi-row selector; browsers do not reliably auto-select its first option.
- Complex curves display magnitude in dB and phase in degrees; real curves
  display their untransformed y-values and hide the phase plot.
- Match PyRPL's custom backend selection at startup: read
  `PYRPL_USER_DIR/config/global_config.yml`, treat `general.curvedb: pyrpl` as
  the standalone backend, and otherwise import the trusted local module's
  `CurveDB` class. Adapt `create`, `get`, `all_pks`, `save`, and `delete` while
  preserving the web curve JSON shape. An explicit `--curve-dir` always selects
  standalone file storage.

## Configuration Rules

- `PyrplConfig` edits one top-level YAML branch at a time: active config path,
  module selector, Refresh, Save, and text. Save must require a YAML mapping,
  use the existing atomic temporary-file replacement, and reload recognized
  setup attributes immediately.
- Keep browser writes scoped to the config selected when the server starts.
  Original desktop `configfile` can create another `MemoryTree`, but accepting
  arbitrary browser paths would expose server filesystem writes; alternate
  files remain a CLI/startup choice.
- Custom Lockbox methods are unrestricted trusted Python, not metadata. Execute
  server-local models through `TrustedLockboxRuntime`, whose Qt-free proxies
  connect formulas, calibration, stages, sampler, hardware, module managers,
  Scope capture/state, and server-owned loops to the live session. Never use an
  AST behavior subset or permit browser-uploaded plugin code. Reject a nested
  `Pyrpl(...)` explicitly; external devices need configured server services.
- Legacy loop callback arguments must become real instance attributes. Storing
  `loop_function` only in a fallback adapter leaves the class's default
  `loop()` method ahead of it in Python attribute resolution and silently runs
  the wrong callback.

## ARM Packaging And Security Rules

- Keep the base package headless: NumPy and PyYAML are shared dependencies;
  Qt, pyqtgraph, Paramiko, SCP, and qasync belong in desktop extras.
- Red Pitaya ARMv7 uses `.[web-redpitaya]`: FastAPI 0.115, Pydantic 1,
  minimal Uvicorn 0.30, and wsproto 1.2. Do not install
  `uvicorn[standard]`, Pydantic 2/pydantic-core, uvloop, httptools, or
  watchfiles on this path.
- Build Vite assets into `pyrpl_websocket/frontend` and include that directory
  as wheel package data. A production wheel must never silently serve the old
  prototype in `pyrpl_websocket/static`.
- Clean setuptools' generated `build/` directory before a release wheel build.
  Vite removes stale source assets, but setuptools can reuse stale files from
  `build/lib` and package multiple obsolete hashed bundles. Wheel verification
  must require exactly one main script and one Spectrum worker chunk.
- Run `pyrpl-web-audit --strict-armv7` after installation. The audit checks
  Python, package versions, forbidden accelerators, and packaged frontend
  presence.
- Keep loopback binding as the default. Direct LAN binding should use
  `PYRPL_WEB_TOKEN`; authentication must protect REST and every WebSocket route
  and must never expose the token in health/session payloads.
- UI tests must wait for the observable completion of asynchronous control
  writes before directly querying backend state. Browser input helpers complete
  DOM interaction, not the application's subsequent fetch and plot refresh.
- Never spread acquisition-sized arrays into `Math.min`, `Math.max`, or another
  variadic function; a 131,073-bin spectrum exceeds the JavaScript argument
  stack. Iterate, reduce, or use `every` instead.
- Run frontend npm commands with `web/` as the working directory; the repository
  root intentionally has no `package.json`.
- Playwright serves `pyrpl_websocket/frontend`, not TypeScript source. Run the
  production frontend build before browser tests whenever frontend code changes,
  or Playwright will correctly test stale packaged assets.
- Use the requested `pyrpl-env` for Python verification. The host system Python
  may use cache paths outside the writable workspace and is not the deployment
  interpreter.
- Multi-client acquisition must use one producer with fan-out queues. Per-socket
  Scope/Spectrum loops let observers consume extra hardware frames, while a
  second Network Analyzer loop divides one sweep between browsers. Stream
  ownership is separate from write-lease ownership. Suspend and restart the
  shared producer at acquisition start/resume boundaries so sequence counters
  and finite averaging runs begin fresh.
- The production control policy is one renewable writer lease. Enforce REST and
  JSON control-WebSocket mutations centrally, keep observer telemetry readable,
  expose explicit takeover, and audit both accepted and denied writes. A shared
  policy must be an explicit startup choice.
- Long-lived browser sockets need one shared bounded reconnect policy. Track
  whether each connection is still desired, retry only unexpected closure, and
  cancel pending retries on Stop, completed single acquisitions, and teardown.
  Verify this with a real browser offline/online transition, not only a timer
  unit test.
- Keep binary frame parsing independent of the FPGA's current 16k capture size.
  Synthetic frontend tests should include 65,536 samples so future streamed or
  composed traces cannot reintroduce argument-stack or allocation assumptions.
- Do not retain percentage-height split panes on phone-width auto-height pages.
  Stack controls and stable-height plots, hide only the inactive gutters, and
  let the document scroll. Long nowrap status outputs can impose a hidden
  min-content width on every ancestor grid; wrap them at the narrow breakpoint
  and assert `documentElement.scrollWidth <= innerWidth` in Playwright.
- A scaled full-page screenshot is not proof of responsive containment. Pair
  visual inspection with CSS-pixel bounds for headers, menus, action rows,
  plots, and sequential panel columns.
- CSS source order can silently override a specialized layout when two
  single-class selectors have equal specificity. Use a scoped selector such as
  `.panel-content.curve-viewer-content` when a panel intentionally differs from
  the shared container direction, and verify the actual computed geometry.
- Segmented controls need reserved legend space with an explicit top/left
  anchor and line height. Cross-panel browser tests should compare visible
  label/legend rectangles against visible controls at both wide and compact PC
  sizes; visual checks of Scope alone will miss failures in dynamic panels.
- Lockbox stages are dynamic widgets in the original GUI. Keep each web stage
  card content-sized, let the sequence viewport fill the available Lockbox
  panel height, and scroll that list only after many stages exceed it. Make all
  stages in a schema match the tallest required card, recalculating on width
  changes so controls never clip.
- The workspace tab strip is for Tabs layout only. In Side by Side and Stacked
  layouts, persist a distinct ordered set of visible pane modules and provide
  a selector in each pane plus a pane-count selector. Enabled modules are
  available choices, not an instruction to display every module at once.
- For split layouts, pin the tab strip and pane host to their CSS grid rows.
  Hiding the tab strip must not auto-place panes into its `auto` row. Keep DOM
  order equal to selected pane order before creating Split.js, use flex-basis
  styles for the flex container, and test real drags in two- and three-pane
  horizontal and vertical layouts.
- A deployed Red Pitaya `monitor_server` is a one-client process and exits
  after disconnect. For write-enabled validation, the monitor probe must use
  the already-open `WebSession` client, never a separate probe connection.
  On `10.0.5.118`, original and web clients both passed the Scope selector
  write/readback, and the corrected Scope, ASG loopback, Spectrum, and Network
  Analyzer hardware suite passed. Verify the server is stopped after tests;
  never change FPGA firmware or `monitor_server.c` as a workaround.
- Real browser validation must activate a persisted Scope workspace explicitly,
  then require changing Scope frame sequences and multiple Spectrum WebSocket
  frames. On `10.0.5.118`, the rendered Scope accepted CH1-to-ASG0 and the
  rendered Spectrum displayed three live 131,073-bin series. Stop both
  acquisitions with the browser lease before shutting down monitor_server.
- Scope hardware validation must check the FPGA decimation register, not just
  the frontend axis. On `10.0.5.118`, the ASG0-fed CH1 rising edge aligned at
  sample 8190, Single required explicit rearm and returned to `paused_single`,
  rolling frames updated above 0.1 s, and duration writes set decimation 8 and
  64 as expected.
- Network Analyzer hardware parity must use the original FPGA-quantized
  frequency grid and IQ filter-derived RBW options, and synchronize at the
  reserved IQ module base rather than always IQ0. With the 100 kHz ASG0 route
  disabled, the OUT0-to-IN0 browser comparison passed legacy parity at all
  points, including 100 kHz (maximum 2.18% magnitude and 2.79 degree phase).
- `output_direct` routes are intentionally additive at each DAC. Original
  PyRPL reserves an IQ for Network Analyzer but not DAC routes, so an
  ASG/PID/IQ left on the analyzer's output contaminates that measurement. Keep
  this original feature; validation procedures must establish known routes
  rather than auto-muting user signals.
- Hardware browser tests must use the page's control identity to restore a
  temporary workspace after acquiring the writer lease. Every acquisition
  WebSocket stream must also await disconnects while idle so its fan-out
  subscription is released and shutdown remains graceful.
- Lockbox Lock and stage execution are asynchronous in original PyRPL. Keep
  stage duration waits outside the serialized monitor-server/session lock in a
  cancellable server-owned sequence; otherwise Scope freezes and Lock requests
  block for the sequence duration. Publish each sequence transition and cancel
  it on Unlock, Sweep, model replacement, or session close.
