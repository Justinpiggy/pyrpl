# Migration Knowledge Log

This file records project knowledge and migration lessons learned while planning
and implementing the PyRPL web-interface migration. Future work should update
this file whenever new architecture, protocol, performance, or tooling knowledge
is discovered.

## 2026-07-13 Spectrum Acquisition And RBW Parity

### PyRPL Reference

- `SpectrumAnalyzer` inherits the full `AcquisitionModule` state machine. Run
  single collects `trace_average` frames, Run continuous performs a moving
  average, either run can be paused, paused data can resume into either mode,
  and Stop remains a separate button.
- `rbw` and `span` are two views of the same Scope decimation. PyRPL computes
  RBW as `span * sum(window**2) / sum(window)**2` for the 16,384-point Scope
  buffer and refreshes it when the window changes.
- Baseband mode routes two selected signals directly through Scope and does not
  access IQ2. Non-baseband mode configures and owns the customized IQ2 path.
- FFT, trace averaging, and display-unit conversion happen on the desktop side
  in original PyRPL. In the web migration they belong in the browser, not on
  the Red Pitaya ARM server.

### Migration

- Replaced the 300 ms single-shot timer and Run/Stop toggle with the original
  acquisition states and button transitions. Single completion now occurs only
  after the requested number of frames, then releases resources after sending
  the final capture.
- Added linked RBW/span selectors, exact window ENBW calculations, a visible
  current-average counter, full 16,384-sample Scope frames, and exact PyRPL unit
  conversions.
- Baseband now owns only Scope; IQ mode additionally owns IQ2. Pause sends no
  data and releases Scope while preserving the accumulated average.
- Added client socket identity checks and a server stream generation so closed
  idle WebSockets cannot consume acquisitions from a later run.

### Mistake Prevention

- Never implement an acquisition-module single action as an already-paused
  state plus a timeout. Completion is determined by the original averaging
  loop, not wall-clock guesswork.
- Closing a browser WebSocket does not guarantee an idle FastAPI loop observes
  the close before the hardware starts again. Invalidate old generations at
  the action boundary and check generation before and after each blocking
  acquisition.
- Event and binary WebSockets have no cross-socket ordering guarantee. A
  terminal state event must not reset or close a data stream before queued
  final frames have been processed.

### Remaining Gap

Original PyRPL zero-pads Spectrum FFTs by `PADDING_FACTOR = 16`. Applying that
to every 16,384-point browser frame would transform and plot 262,144 points on
the UI thread. Preserve responsiveness first: migrate the padding into a
browser Web Worker and validate its normalization on hardware rather than
silently adding a large synchronous workload.

## 2026-07-13 Lockbox Calibration And Output-Design Parity

### PyRPL Reference

- `LockboxWidget` exposes only `is_locked?`, Lock, Unlock, Sweep, and Calibrate
  all inputs at the top level. Each input adds Calibrate, and each stage adds
  Go to this stage. `get_analog_offsets()` remains a programmatic method rather
  than a normal GUI button.
- `InputSignal.sweep_acquire()` temporarily takes Scope, configures one sweep
  period with the logical input on channel 1 and sweep output on channel 2,
  enables FPGA averaging, captures a full Scope buffer, subtracts the existing
  analog offset, and restores Scope.
- Calibration records min, max, mean, standard deviation, midpoint offset, and
  half peak-to-peak amplitude. RMS in the original field is computed with
  `np.std`, not root-mean-square.
- `OutputSignal._setup()` synchronizes assisted/manual design exactly. The
  complete output plot combines the selected analog plant, PID input filters
  and delays, and optional IIR transfer response.

### Migration

- Added the original per-input and stage actions, stage duration handling, and
  removed Get Offsets from the normal web action row.
- Added exact assisted/manual calculations and reapply the active output state
  after an output edit so changes reach its PID/ASG routing immediately.
- Added selectable input plots and separate output magnitude/phase plots. The
  output model supports flat, PID-filter, and CurveDB analog plants plus IIR.
- Calibration now performs a full sweep capture in fake and hardware paths,
  forwards that binary capture to the Scope stream while controls are locked,
  and restores the prior Scope setup and running state afterward.

### Mistake Prevention

- Do not treat setup-only attributes such as `assisted_design`, `tf_type`, and
  `tf_curve` as invisible: the original custom output widget exposes them with
  dedicated controls even though they are not all in `_gui_attributes`.
- Do not synthesize placeholder transfer curves or calibration samples when
  the original routines define exact calculations and hardware acquisition.
- A static uPlot canvas can intercept clicks after a responsive scroll even
  when its parent looks visually separate. Disable pointer events for the full
  static plot subtree. Rebuild `web/dist` before Playwright because the FastAPI
  e2e server serves compiled assets, not TypeScript/CSS source.
- A terminal Scope acquisition event must be published after its binary frame.
  Publishing `paused_single` first lets the browser close the WebSocket before
  the final frame arrives, producing a completed backend average but a stale
  browser trace and counter.

### Remaining Gap

Arbitrary executable methods in third-party Lockbox Python classes are not yet
loaded and run by the Qt-free source schema. Descriptor-declared attributes are
dynamic, but custom method execution requires an explicit trusted plugin model
and remains documented rather than being guessed from method names.

## 2026-07-09 Lockbox Dynamic Schema Requirement

### Correction

- Lockbox inputs, outputs, stages, and custom user modules must be described
  from the original PyRPL class/property metadata instead of handwritten web
  schemas.
- PDH inputs such as `FPPdh` and `PdhInterferometerPort1` inherit `InputIq`,
  whose GUI/setup controls are `mod_freq`, `mod_amp`, `mod_phase`,
  `mod_output`, `bandwidth`, and `quadrature_factor`. A generic `input_signal`
  row is not sufficient.
- User-provided lockbox models can define new input/output classes with their
  own `_gui_attributes`, `_setup_attributes`, and descriptor properties. The
  web UI must render those dynamically.

### PyRPL Reference

Original PyRPL uses `ModuleMetaClass` to merge inherited `_gui_attributes` and
`_setup_attributes` across base classes, including multiple-inheritance classes
like `FPPdh(InputIq, FPAnalogPdh)`.

The Qt lockbox widget renders controls by iterating each module instance's
`_gui_attributes` and creating widgets from the matching descriptor on the
module class. Dynamic dictionaries such as `inputs`, `outputs`, and `sequence`
are created by `LockboxModuleDictProperty` and `ModuleListProperty`.

### Mistake Prevention

Do not flatten a lockbox input to a fixed `{name, kind, input_signal}` shape.
The frontend schema must preserve the concrete module class and its resolved
property list so custom lockbox models and PDH/IQ inputs show the correct
controls.

## 2026-07-09 Lockbox InputIq Setup Is Hardware Behavior

### Correction

- Lockbox inputs that inherit PyRPL `InputIq` are now bound to an IQ module in
  the web backend.
- Changing PDH/IQ input controls such as `input_signal`, `mod_freq`,
  `mod_amp`, `mod_phase`, `mod_output`, and `quadrature_factor` immediately
  configures the assigned IQ module, matching original PyRPL
  `InputIq._setup()`.
- Lock stages and calibration now use the logical input's `signal()` behavior:
  IQ-backed inputs feed downstream hardware from the assigned IQ module rather
  than from the raw `input_signal`.
- IQ module ownership/state events are published when Lockbox input setup
  changes so the IQ panel reflects that Lockbox is using the module.

### PyRPL Reference

Original PyRPL `InputIq._setup()` calls:

```text
iq.setup(frequency=mod_freq, amplitude=mod_amp, phase=mod_phase,
         input=_input_signal_dsp_module(), gain=0, bandwidth=bandwidth,
         acbandwidth=mod_freq / 128, quadrature_factor=quadrature_factor,
         output_signal="quadrature", output_direct=mod_output)
```

Original PyRPL `InputIq.signal()` returns the allocated IQ module name. Any PID
or scope acquisition using that logical input must use the IQ module signal, not
the raw analog input.

### Mistake Prevention

When migrating descriptor-driven PyRPL controls, `_gui_attributes` only tells
the web UI what to draw. `_setup_attributes` and `call_setup=True` tell the
backend what hardware side effects must happen when the value changes. Do not
stop at schema rendering; trace the original `_setup()` method and signal
routing for every dynamic module class.

## 2026-07-09 Stale Spectrum WebSocket Ownership

### Correction

- Stopped Spectrum Analyzer streams must not reacquire the shared scope
  resource from a late WebSocket polling iteration.
- `acquire_spectrum_scope_frame()` now returns no data while Spectrum Analyzer
  is in the stopped state instead of calling the spectrum setup routine.

### Mistake Prevention

For streaming panels, stopping the frontend stream and releasing backend
resources is not enough if an in-flight WebSocket loop can still make one more
backend acquisition call. Backend acquisition functions must check the module's
running state before configuring or reserving shared hardware.

## 2026-07-09 Lockbox Calibration Scope Ownership

### Correction

- Lockbox calibration and analog-offset measurement now temporarily own the
  scope resource instead of refusing to run while the Scope panel is streaming.
- Scope WebSocket acquisition/plotting remains active while Lockbox owns the
  scope. The frontend disables only scope parameter controls while
  `scope.owner == "lockbox"`, then re-enables them when ownership is released.
- The FastAPI Lockbox action endpoint now runs Lockbox actions in a worker
  thread so ownership events can reach the browser during a longer calibration
  call instead of only after it completes.
- Added missing `pdh` inputs to the web Lockbox schemas for `FabryPerot` and
  `HighFinesseFabryPerot`, matching the original PyRPL model definitions.

### PyRPL Reference

Original PyRPL Lockbox calibration uses the scope resource for sweep acquisition
and temporarily changes scope setup during calibration. The user should still
be able to watch what is happening; the important restriction is preventing
simultaneous parameter edits that fight the calibration routine.

Original PyRPL `FabryPerot.inputs` is:

```text
transmission, reflection, pdh
```

Original PyRPL `HighFinesseFabryPerot.inputs` is also:

```text
transmission, reflection, pdh
```

### Mistake Prevention

Do not equate "Lockbox calibration owns scope" with "stop the Scope panel".
Ownership should disable conflicting scope parameter controls, but the browser
plot can keep receiving scope frames.

When adding model schemas by hand, verify each model's
`LockboxModuleDictProperty` definitions in the original PyRPL code. Missing
dynamic inputs like `pdh` makes the web panel structurally wrong even if the
generic controls render correctly.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 40 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
5 Chromium tests - OK
```

## 2026-07-09 Lockbox Must Not Auto-Stop Scope/Spectrum

### Correction

- Removed invented auto-stop behavior from Lockbox `lock` and `sweep`.
- Lockbox `lock` now changes only the resources that PyRPL's output/stage
  routine actually controls: PID/PWM routing, PID setpoint, PID gains, and
  stage output offsets.
- Lockbox `sweep` now configures the selected output PID and the Lockbox ASG
  path without stopping the user Scope or Spectrum Analyzer.
- Lockbox calibration/offset sampling no longer silently steals a running
  hardware scope. In fake mode it samples independently; on hardware it now
  requires a free scope and raises an error if Scope/Spectrum is actively using
  the shared scope path.

### PyRPL Reference

PyRPL `OutputSignal.lock()`, `OutputSignal.sweep()`, and `OutputSignal.unlock()`
operate on the output's PID and, for sweep, the lockbox ASG. They do not stop
the user scope or spectrum analyzer as a general side effect.

PyRPL input calibration uses `sweep_acquire()`, which asks
`self.pyrpl.scopes.pop(self.name)` for a scope resource. If no free scope is
available, it catches `InsufficientResourceError`, logs a warning, and aborts
calibration. It does not forcibly stop another user-visible scope.

### Mistake Prevention

For every migrated Lockbox control, trace the original PyRPL control routine
before writing backend behavior. Do not add broad resource restrictions just
because a resource might be convenient to reuse. This is a migration, not a new
control policy.

Users commonly adjust Lockbox values while watching Scope or Spectrum Analyzer.
Do not stop those panels when changing Lockbox values, executing lock stages,
or sweeping an output unless the original PyRPL routine truly takes that
resource and no free compatible resource is available.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 40 tests - OK
```

## 2026-07-09 Lockbox Hardware Actions and Compact UI

### Change

- Implemented real Lockbox action behavior in the web backend using the
  existing register-sync helpers:
  - `unlock` zeros PID gains, optionally resets PID integrator offsets, and
    releases Lockbox-owned resources.
  - `sweep` reserves the selected output PID plus `asg0`, configures the ASG
    waveform/amplitude/offset/frequency, routes the PID input to `asg0`, and
    drives the selected output through the PID path.
  - `lock` executes the configured stage sequence, applies per-stage output
    `lock_on`/`reset_offset`/`offset`, computes PID setpoint from the selected
    input model, and scales PID gains by input slope, output `dc_gain`, and
    stage `gain_factor`.
  - `calibrate_all` and `get_analog_offsets` sample each input through the
    scope path, update calibration statistics/analog offsets, then restore the
    previous scope settings.
- Added output controls needed by PyRPL Lockbox behavior: `unit`, `dc_gain`,
  `p`, `i`, voltage limits, sweep offset, sweep waveform, and PWM output
  channels.
- Lockbox now publishes resource-state events for PID/ASG/PWM/scope modules so
  other panels can gray out occupied resources.
- Reduced frontend control/button/input sizing and made Lockbox action buttons
  a horizontal row.

### PyRPL Reference

PyRPL `OutputSignal.unlock()` sets PID `p` and `i` to zero and initializes the
PID output path. `OutputSignal.sweep()` unlocks the output, routes the PID
input to a lockbox-owned ASG, configures that ASG, sets `pid.setpoint = 0`, and
sets `pid.p = 1`. `OutputSignal.lock()` computes PID gains from the model input
slope and output gain, writes PID input/setpoint/offset, then applies the
scaled gains.

PyRPL `Stage._enable()` first unlocks or offsets outputs according to each
stage-output setting, then locks outputs whose `lock_on` is true. The web
migration should preserve this two-pass stage behavior.

### Boundary

This still does not instantiate arbitrary third-party Python Lockbox classes
inside the web backend. The implemented behavior is register-level compatible
for the schema-backed lockbox model and uses existing monitor-server protocol
paths. FPGA firmware and `monitor_server.c` remain untouched.

### Mistake Prevention

Lockbox actions must be implemented in `WebSession`, not only in the pure
schema model, because they need access to PID/ASG/PWM/scope settings, resource
ownership, and monitor-server register sync helpers.

When an action changes ownership, publish state events for the affected
hardware modules. Otherwise the backend may correctly reject manual writes
while the frontend still looks editable.

Do not leave Lockbox output schema too small. Real PyRPL lock behavior depends
on output `p`, `i`, `dc_gain`, `unit`, voltage limits, sweep settings, and
whether the output channel is an analog output or PWM.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 38 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
5 Chromium tests - OK
```

## 2026-07-09 Initial Lockbox Migration

### Change

- Added an initial Qt-free Lockbox backend model in `pyrpl_websocket.lockbox`.
- Exposed REST endpoints for Lockbox class discovery, schema loading, class
  switching, top-level attributes, input/output attributes, dynamic stage
  append/delete, nested stage-output attributes, actions, and static plot data.
- Added Lockbox to the workspace panel menu as a disabled-by-default software
  panel.
- Added a schema-driven TypeScript Lockbox panel that renders lockbox
  attributes, inputs, outputs, dynamic sequence stages, per-stage output
  settings, and static uPlot charts.
- Added regression tests for Lockbox class switching, dynamic stages, and
  nonblank static plots.

### PyRPL Reference

PyRPL Lockbox is a nested, model-driven software module. A lockbox class owns
dynamic `inputs`, `outputs`, and `sequence` stages. Changing `classname` in the
original PyRPL GUI replaces the whole lockbox object, so the web migration
should treat a class switch as a structure rebuild and redraw the panel from
the backend's canonical schema.

Lockbox plots are not scope-like high-rate streams. Input expected-signal plots
and output transfer-function plots should be recomputed on load or after
relevant user edits, then drawn in the browser. Do not create a high-rate
WebSocket stream for these static plots.

### Boundary

This first slice intentionally uses a PyRPL-shaped lightweight backend model
instead of instantiating the original Qt-era Lockbox object. It does not yet
execute real hardware lock/sweep/calibration behavior, reserve PID/ASG/scope
resources, or import third-party user lockbox modules dynamically. Those need
to be added after the schema-driven panel is stable.

### Mistake Prevention

Do not render Lockbox as a flat generic module card. The original GUI has
multiple subpanels, dynamic stages, nested per-output stage settings, and
class-specific input/output sets. The frontend should render the backend's
canonical schema.

Do not allow the browser to invent stage names or assume stage identity after
append/delete. The backend owns the canonical sequence; the frontend should
reload and rerender the returned schema after each structural mutation.

Browser tests that wait for streaming scope status should not require an exact
first frame number such as `Frame 0`. The stream may advance before the
assertion, especially as startup work grows. Assert the frame pattern or the
functional state instead.

Generic module action status can be overwritten by later `module.state.changed`
events. Tests should allow either the immediate action status or the resulting
state-update status unless the exact status text is the feature under test.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 36 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
5 Chromium tests - OK
```

## 2026-07-09 Acquisition Run/Stop and Spectrum Scope Ownership

### Change

- Removed standalone Scope and Spectrum Analyzer Pause buttons from the web UI.
  The main user-facing controls are now `Single` and `Run`/`Stop`.
- Replaced the custom Scope/Spectrum auto-pause and auto-resume behavior with
  explicit stop-on-takeover behavior.
- Spectrum Analyzer now owns both `iq2` and `scope` while configured/running,
  and releases both on Stop/Release.
- Spectrum setup attribute changes no longer reserve hardware while the
  Spectrum Analyzer is stopped. Resources are reserved when acquisition
  actions/configuration actually need them.
- Fixed the Spectrum-then-Scope takeover path: Scope Run now always asks
  Spectrum Analyzer to Stop/Release before starting, rather than relying on
  the Spectrum Run button's connected state.
- Scope tab activation no longer secretly starts Scope in fake/demo mode. Only
  explicit Run/Stop should change acquisition ownership once the page is open.

### PyRPL Reference

PyRPL's `AcquisitionModule` has `pause()`/`resume()` as internal acquisition
state transitions, but `stop()` is the user-facing action that cancels the
current run and resets averaging for the next run. PyRPL's `Scope` also stops
itself when ownership changes (`_ownership_changed`), and
`SpectrumAnalyzer` takes scope ownership before configuring scope inputs.

For this web migration, do not invent independent "auto-pause/resume" logic
between Scope and Spectrum Analyzer. Treat Spectrum as an owner of the shared
scope resource; starting Spectrum stops Scope, and starting Scope stops
Spectrum.

### Mistake Prevention

Do not configure/reserve Spectrum Analyzer resources on every stopped-state
settings edit. In PyRPL, acquisition-module setup collapses stopped/paused
states back to stopped unless continuous running is active. Eager resource
reservation before Run can make the later Run action fail because the resource
is already owned by the same software module and the frontend may still try to
stop the user Scope panel first.

When removing a user-visible control such as Pause, remove the complete UI
path: DOM button, element lookup, event handler, e2e selector, and any auto
resume helper names. Leaving old helper names behind makes future behavior
look intentional even when it is just stale code.

Never use a frontend button label, `data-connected` flag, or WebSocket state
as the source of truth for hardware ownership. A stream can be disconnected
while the backend still owns `scope`/`iq2`, especially after single-shot or
failed/interrupted acquisitions. Before starting Scope, send Spectrum Stop so
the backend releases resources; before starting Spectrum, stop Scope only when
the Scope stream is actually running.

Changing tabs must not start or stop acquisitions. It creates races with the
explicit Run/Stop controls and differs from PyRPL's instrument model. Tab
activation may refresh layout, but acquisition state changes must come from
the acquisition controls.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 34 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
4 Chromium tests - OK
```

## 2026-07-09 Spectrum Layout and Scope Axis Precision

### Change

- Added a Spectrum Analyzer internal Split.js handle between the control pane
  and plot pane. The control pane can now scroll and be resized vertically, so
  additional controls/buttons remain reachable on shorter browser windows.
- Kept the Spectrum Analyzer status/RBW text inside the panel plot toolbar,
  matching the Scope panel's local frame counter placement.
- Updated Scope x-axis formatting to use the full captured duration for unit
  selection and the current visible tick spacing for decimal precision. This
  prevents deeply zoomed views from showing repeated `0` labels while keeping
  the unit tied to the acquisition duration.
- Added browser regression coverage for the Spectrum Analyzer split handle and
  deeply zoomed Scope time-label formatting.

### Mistake Prevention

uPlot leaves axis tick-label DOM nodes empty in this configuration and paints
axis labels on the canvas. Playwright tests should not look for `.u-value`
inside `.u-axis`; instead, expose a narrow debug hook or verify the rendered
canvas behavior another way.

Instrument-local controls that can grow, such as Spectrum Analyzer settings,
need their own split/scroll area inside the panel. Do not rely only on the
workspace split between instruments; users also need to resize control-vs-plot
space within a single instrument.

When formatting Scope time labels, choose display units from the full capture
duration, but choose decimal precision from the visible tick spacing. Choosing
precision only from the unit or default formatter can collapse deep-zoom labels
to visually identical zeros.

### Verification

```text
conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
4 Chromium tests - OK
```

## 2026-07-08 Spectrum Analyzer and Resource Ownership

### Change

- Added a Spectrum Analyzer software panel to the workspace menu.
- The panel exposes controls for input, center frequency, baseband mode, span,
  window, AC bandwidth, display unit, baseband inputs, visible baseband traces,
  cross amplitude, and trace averaging.
- Added a uPlot-based TypeScript `SpectrumPlot` renderer. This keeps spectrum
  drawing on the same high-performance plotting path as the scope prototype.
- Changed the live Spectrum Analyzer path to use `/ws/spectrumanalyzer`, which
  streams time-domain scope frames. The browser computes the FFT locally.
- Added backend resource ownership tracking for hardware modules. Spectrum
  Analyzer reserves `iq2`, blocks manual writes to `iq2` while owned, and
  releases it on Stop/Release.
- Generic hardware module cards now disable controls and action buttons when a
  module state reports an owner. This mirrors PyRPL's gray-out behavior for
  modules occupied by software modules.
- Spectrum setup follows PyRPL's composition model: baseband mode routes scope
  inputs directly; IQ mode configures `iq2` and routes scope inputs through
  `iq2`/`iq2_2`.
- Added spectrum Run/Stop, Single, Pause, Save Curve, X/Y zoom, X/Y pan, reset,
  left-drag pan, and right-drag zoom controls. Removed visible Setup/Release
  buttons from the Spectrum Analyzer panel because they are not user-facing
  controls in the original GUI.

### Boundary

This is the first usable spectrum analyzer panel and ownership model. It does
not yet implement exact PyRPL parity for padded FFT length, transfer-function
correction, or browser-side spectrum averaging. The implementation
intentionally leaves FPGA firmware and `monitor_server.c` untouched.

### Mistake Prevention

Resource ownership must be enforced in the backend, not only by disabling UI
controls. UI gray-out is helpful feedback, but server-side `set`/`action`
paths must reject writes to occupied hardware modules.

When adding a second uPlot instance, do not keep broad Playwright selectors
such as `.uplot` or `.u-over`; scope them to `#scope-plot` or
`#spectrum-plot` or strict-mode tests will become ambiguous.

Action status text can be overwritten by subsequent `module.state.changed`
events. Tests should prefer functional assertions for stateful behavior
such as disabled controls and plotted data unless the status text itself is
the behavior being tested.

When a software module releases a resource, publish the owned module state
even if the software module's `resources` list is now empty. Otherwise other
browser clients may not learn that the hardware module is editable again.

PyRPL's original `SpectrumAnalyzer._get_trace()` does use `np.fft.rfft` /
`np.fft.fft`, but that happens in the desktop Python GUI process after the
scope returns time-domain data. For the web migration, do not move live FFT
work onto the Red Pitaya ARM Python server. Stream time-domain scope frames
and do FFT in the browser, or later in a browser Web Worker for large padded
FFTs.

Spectrum Analyzer `input` is only meaningful for non-baseband/IQ mode. In
baseband mode the useful source controls are `input1_baseband` and
`input2_baseband`, shown in the web UI as `BB Input 1` and `BB Input 2`.
Hide IQ-only controls (`input`, `center`, `acbandwidth`) while baseband is
active so users do not think they affect the baseband trace.

Spectrum Analyzer `trace_average` belongs on the browser/client side in the
web migration. After each time-domain scope frame is transformed into spectra,
average the displayed spectral traces in TypeScript; do not add Red Pitaya ARM
server-side FFT/averaging load for this control.

Scope and Spectrum Analyzer both use the same scope hardware path. The web UI
must not let both streams run at once. If starting Scope auto-pauses Spectrum,
then manually pausing/stopping Scope should resume Spectrum. If starting
Spectrum auto-pauses Scope, then manually pausing/stopping Spectrum should
resume Scope. Track this as explicit auto-pause state rather than inferring it
from button labels alone.

Global frame counters/status lines should live inside the instrument panel that
owns the stream. Scope frame status belongs in the Scope panel, and Spectrum
frame/RBW status belongs in the Spectrum panel. Avoid page-global footer status
for instrument-local stream data.

When hiding Spectrum Analyzer controls for baseband/IQ mode, reserve grid space
for hidden fields to avoid large layout jumps. The baseband trace show
checkboxes should be immediately before their corresponding `BB Input` selectors
just like Scope's channel show/input pairs.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 34 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
4 Chromium tests - OK
```

## 2026-07-08

### User Goal

The goal is to migrate the PyQt GUI to a web interface with high-performance
rendering for oscilloscope data. The Python application must still control the
Red Pitaya by talking to the existing C `monitor_server` using a compatible
protocol.

### Hard Constraints Learned

- Do not touch FPGA firmware.
- Do not modify files under `pyrpl/fpga/` for this migration unless the user
  explicitly changes that constraint.
- Do not touch `pyrpl/monitor_server/monitor_server.c`.
- Preserve compatibility with the existing Red Pitaya monitor-server protocol.
- The web server should be written in Python.
- Control should move into the browser UI.

### Repository Knowledge Learned

- `pyrpl/__main__.py` is the command-line entry point for `python -m pyrpl`.
- `pyrpl/__init__.py` currently initializes Qt application state during import.
  This is a likely headless-web migration issue.
- `pyrpl/pyrpl.py` defines `Pyrpl`, the high-level object that loads config,
  creates `RedPitaya`, loads software modules, restores setup attributes, and
  optionally opens the GUI.
- `pyrpl/redpitaya.py` defines `RedPitaya`, which handles configuration,
  SSH/server startup, monitor-client startup, fake/no-hardware modes, and
  hardware module creation.
- `pyrpl/redpitaya_client.py` defines `MonitorClient`, the Python TCP client
  that communicates with the Red Pitaya `monitor_server`.
- Hardware modules inherit from `HardwareModule` in `pyrpl/modules.py`.
- `HardwareModule._reads()` and `_writes()` call the active client, which means
  the monitor-server transport is already isolated behind a Python abstraction.
- Module attributes are descriptor based and live mainly in `pyrpl/attributes.py`
  and `pyrpl/module_attributes.py`.
- The descriptor system already handles validation, normalization, GUI widget
  creation, hardware register conversion, signal emission, and config
  persistence.
- Acquisition behavior is centralized in `pyrpl/acquisition_module.py`.
- Scope hardware logic is in `pyrpl/hardware_modules/scope.py`.
- Scope GUI rendering is currently in `pyrpl/widgets/module_widgets/scope_widget.py`
  using pyqtgraph.
- Generic module widget generation is in
  `pyrpl/widgets/module_widgets/base_module_widget.py`.

### Monitor Protocol Knowledge Learned

- `MonitorClient` opens a TCP socket to the Red Pitaya, using port `2222` by
  default.
- Read commands send an 8-byte header beginning with `b"r"`.
- Write commands send an 8-byte header beginning with `b"w"` followed by a
  `uint32` payload.
- Close commands send an 8-byte header beginning with `b"c"`.
- The server echoes the header for synchronization/acknowledgement.
- Read responses contain the echoed 8-byte header followed by `uint32` data.
- `MonitorClient` caps read length at `65535`.
- `MonitorClient` retries failed read/write operations and can restart the
  server through a callback.
- `DummyClient` exists for fake/no-hardware operation and tests.

### Oscilloscope Knowledge Learned

- Scope data length is `2**14` samples.
- The scope has two hardware data buffers, one per channel.
- Raw channel reads come from offsets `0x10000` and `0x20000`.
- Raw samples are converted from packed integer representation to normalized
  voltage-like float arrays.
- The scope computes a time axis from `duration`, `trigger_delay`, and trigger
  mode.
- Existing scope GUI supports normal triggered mode, untriggered rolling mode,
  channel visibility, XY mode, and channel math.
- Existing docs mention a full trace download around 10 ms over standard
  Ethernet.

### Migration Skills and Design Lessons

- Use existing module descriptors as a web-control schema source rather than
  manually rebuilding every control.
- Keep existing Python register conversion logic authoritative; avoid
  duplicating it in TypeScript.
- Use WebSocket binary frames for waveform data; JSON is appropriate for
  control messages but not for full high-rate traces.
- Decouple acquisition rate from browser render rate. The browser should be
  allowed to drop stale frames.
- Use WebGL or OffscreenCanvas/Web Worker rendering for oscilloscope traces.
- Keep blocking monitor-server socket I/O off the ASGI event loop.
- Build the web interface in parallel with the Qt GUI until parity is proven.
- Treat multi-browser write access as a hardware safety concern.

### Web Backend Dependency Knowledge Learned

- TypeScript is the preferred frontend language.
- WebSocket transport is mandatory.
- FastAPI remains a good API choice, but Red Pitaya deployment must be tested
  against the actual ARM architecture and Python 3.10.
- Uvicorn should be installed plain on Red Pitaya, not as `uvicorn[standard]`,
  because the standard extra pulls in optional compiled accelerators such as
  `uvloop`, `httptools`, and `watchfiles`.
- Uvicorn can use `websockets` by default when installed, or `wsproto` when
  configured with `--ws wsproto`.
- `wsproto` publishes a pure-Python `py3-none-any` wheel and is a conservative
  first WebSocket backend for Red Pitaya.
- `websockets` also publishes a pure-Python `py3-none-any` wheel and supports
  Python 3.10.
- FastAPI currently requires Python 3.10+, which matches the user's Red Pitaya
  Python version.
- FastAPI depends on Pydantic. Pydantic-core publishes CPython 3.10 ARMv7
  Linux wheels, which reduces but does not eliminate the need for real-device
  installation testing.
- `picows` is attractive for performance and supports Python 3.10, but it is a
  C/Cython package. Its current PyPI wheel list includes CPython 3.10 ARM64
  Linux wheels, but not a visible CPython 3.10 ARMv7 Linux wheel.
- Since Zynq-7000 Red Pitaya boards are commonly 32-bit ARMv7, `picows` should
  be treated as an optional accelerator, not the default on-board WebSocket
  backend.
- If the actual Red Pitaya OS reports `aarch64`, `picows` becomes more plausible
  for on-board use, but should still be benchmarked and kept optional.

### Current Backend Recommendation

User decision: start with `wsproto` for the WebSocket backend.

For the first on-board web server:

```text
fastapi
uvicorn
wsproto
```

Run with a Uvicorn configuration equivalent to:

```text
uvicorn pyrpl.web.app:app --host 127.0.0.1 --port 8000 --ws wsproto
```

Avoid the following in the Red Pitaya default install path until tested:

- `uvicorn[standard]`
- `picows`
- `uvloop`
- `httptools`
- `watchfiles`
- `aiofastnet`

### Sources Checked

- FastAPI PyPI page: Python 3.10+ and Starlette/Pydantic basis.
- Uvicorn installation docs: minimal install uses pure-Python `h11` plus
  `click`; `standard` extra adds optional accelerators; WebSocket handling can
  use `websockets` or `wsproto`.
- `picows` PyPI page: Python 3.9+, Cython implementation, Python 3.10 ARM64
  wheels, no visible Python 3.10 ARMv7 Linux wheel.
- `wsproto` PyPI page: Python 3.10+ and `py3-none-any` wheel.
- `websockets` PyPI page: Python 3.10+ and `py3-none-any` wheel.
- `pydantic-core` PyPI page: CPython 3.10 ARMv7 Linux wheels are published.

### Planning Artifacts Created

- `PROJECT_STRUCTURE.md`: repository structure overview.
- `WEB_MIGRATION_PLAN.md`: phased plan for the PyQt-to-web migration.
- `MIGRATION_KNOWLEDGE_LOG.md`: this knowledge log.

## 2026-07-08 Implementation Start

### User Direction

- Start implementation in the `pyrpl-websocket` folder.
- Copy or isolate the files needed from the original PyRPL codebase rather
  than modifying FPGA firmware or `monitor_server.c`.

### Implementation Decisions

- The current working repository is already named `pyrpl-websocket`, so this
  repo is the migration workspace.
- A new Python package named `pyrpl_websocket` is used for the web server code.
- The original `pyrpl/fpga/` and `pyrpl/monitor_server/monitor_server.c` files
  remain untouched.
- The monitor-server wire protocol was copied into
  `pyrpl_websocket/monitor_client.py` so the web server can talk directly to
  `monitor_server` without importing the Qt-heavy legacy PyRPL package.
- `pyrpl_websocket/assets.py` records where the copied PyRPL FPGA and
  monitor-server assets live in this migration repository without modifying
  those files.
- The first server slice uses FastAPI plus Uvicorn with `wsproto`.
- A `DummyClient` is included for local browser and API development without
  Red Pitaya hardware.

### Files Added

- `pyrpl_websocket/__init__.py`
- `pyrpl_websocket/__main__.py`
- `pyrpl_websocket/app.py`
- `pyrpl_websocket/assets.py`
- `pyrpl_websocket/dependency_audit.py`
- `pyrpl_websocket/monitor_client.py`
- `pyrpl_websocket/scope.py`
- `pyrpl_websocket/session.py`
- `pyrpl_websocket/settings.py`
- `web/package.json`
- `web/tsconfig.json`
- `web/index.html`
- `web/src/main.ts`
- `web/src/scope-stream.ts`
- `pyrpl/test/test_pyrpl_websocket_protocol.py`

### Current Prototype Capabilities

- `python -m pyrpl_websocket --hostname _FAKE_` starts the web prototype if
  FastAPI/Uvicorn/wsproto are installed.
- `GET /api/health` reports server settings.
- `GET /api/session` reports fake/real session state and read/write counters.
- `GET /api/assets` reports the copied PyRPL FPGA and monitor-server asset
  paths used by this migration workspace.
- `POST /api/register/read` performs monitor-compatible register reads.
- `POST /api/register/write` performs monitor-compatible register writes.
- `WS /ws/events` is a simple echo/event-channel placeholder.
- `WS /ws/scope` streams binary frames containing interleaved `float32` scope
  channel data.
- The TypeScript frontend skeleton connects to `/ws/scope` and draws received
  traces on a canvas.

### Conda Environment Verification

The user asked to use the Anaconda environment named `pyrpl-env`.

Verified environment:

```text
/opt/anaconda3/envs/pyrpl-env/bin/python
Python 3.10.20
```

Installed into that exact interpreter:

```text
fastapi 0.139.0
uvicorn 0.50.2
wsproto 1.3.2
pydantic 2.13.4
pydantic_core 2.46.4
numpy 2.2.5
```

Verification run in `pyrpl-env`:

- `python -m compileall pyrpl_websocket`: passed.
- `PYTHONPATH=. python pyrpl/test/test_pyrpl_websocket_protocol.py`: passed.
- `python -m pyrpl_websocket.dependency_audit`: passed and reported the
  versions above.
- Fake-hardware server started with:
  `python -m pyrpl_websocket --hostname _FAKE_ --bind-host 127.0.0.1 --bind-port 8765 --scope-interval 0.2`.
- `GET /api/health`: returned OK.
- `GET /api/session`: returned fake session state.
- `GET /api/assets`: confirmed `pyrpl/fpga`,
  `pyrpl/monitor_server`, and `pyrpl/monitor_server/monitor_server.c` exist.
- `POST /api/register/read`: returned fake register values.

Local port binding was blocked by the sandbox until approved, but the server
then started and responded correctly.

### Standing Local Port Permission

The user explicitly granted ongoing permission to bind local ports for this
prototype and asked not to request port-binding permission again. Future web
server checks may bind local development ports, such as `127.0.0.1:8765`,
without asking again.

## 2026-07-08 Continued Implementation

### Static UI Served by FastAPI

- Added `pyrpl_websocket/static/index.html`.
- Added `pyrpl_websocket/static/style.css`.
- Added `pyrpl_websocket/static/scope.js`.
- FastAPI now serves `/` from the static UI and mounts static assets under
  `/static`.
- This lets the prototype run without a separate frontend dev server.

### Scope Frame Format

- Added constants for scope frame header size and version in
  `pyrpl_websocket/scope.py`.
- Added `ScopeFrame.from_bytes()` for validation and tests.
- Added `ScopeFrame.samples()` to decode interleaved `float32` payloads into a
  two-dimensional array.
- Added `/api/scope/frame?samples=N` to fetch one binary scope frame over HTTP.
- Kept `/ws/scope?samples=N` as the streaming path.

### Tests Added

- `pyrpl/test/test_pyrpl_websocket_scope.py`
  validates signed 14-bit conversion and binary frame round trip.
- `pyrpl/test/test_pyrpl_websocket_app.py`
  validates route registration, copied asset discovery, fake register
  write/read, fake scope frames, and the JSON control-message handler without
  adding a high-level HTTP/WebSocket test client dependency.

### Control WebSocket

- Added `/ws/control` as the browser control channel.
- Kept `/ws/events` as an alias for the same control handler while the
  prototype settles.
- The first JSON control message types are:
  - `ping`: returns `pong`.
  - `session.get`: returns current session/settings/read/write counters.
  - `register.read`: reads monitor-server registers with `addr` and `length`.
  - `register.write`: writes monitor-server registers with `addr` and
    `values`.
- Responses include the request `id`, `ok`, and either a typed payload or an
  error object.
- Added backend unit tests for register write/read over the control-message
  handler and unknown message rejection.

### Browser Controls

- The built-in static UI now opens `/ws/control`.
- Session refresh now uses `session.get` over WebSocket.
- Added a compact register panel for address, length, values, read, and write.
- Scope data remains high-throughput binary data over `/ws/scope`; control
  messages remain JSON over `/ws/control`.

### Verification

Verification run in the `pyrpl-env` conda environment:

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests in 0.008s - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 2 tests in 0.018s - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests in 0.000s - OK

conda run -n pyrpl-env python -m compileall pyrpl_websocket
OK
```

Live fake-hardware server verification:

- Server command:
  `conda run -n pyrpl-env python -m pyrpl_websocket --hostname _FAKE_ --bind-host 127.0.0.1 --bind-port 8765 --scope-interval 0.2`.
- `GET /api/session` returned fake session settings.
- `GET /api/scope/frame?samples=4` returned a 56-byte binary frame that
  decoded to shape `(4, 2)`.
- A raw `wsproto` client connected to `/ws/control`, wrote fake registers
  `[11, 12]` at address `64`, then read them back successfully.

## 2026-07-08 User Collaboration Preference

The user explicitly said: if something is needed, ask for it instead of
assuming it cannot be available.

Practical meaning for this project:

- If browser/TypeScript tooling is missing, ask for Node/npm or permission to
  install/use the appropriate toolchain instead of silently avoiding it.
- If a plotting library is the better path, ask before falling back to a larger
  hand-built plotting implementation.
- If Red Pitaya hardware access, package installation, network access, or test
  equipment is needed, ask clearly and continue only with an explicit fallback
  when that fallback is genuinely useful.

## 2026-07-08 TypeScript Plotting Implementation

### Node/npm Availability

- `node` and `npm` are available inside the `pyrpl-env` conda environment:
  - `conda run -n pyrpl-env node -v`: `v26.3.1`
  - `conda run -n pyrpl-env npm -v`: `11.16.0`
- They are not currently on the plain shell `PATH`, so frontend commands should
  be run through `conda run -n pyrpl-env ...` unless the environment is
  activated.

### Plotting Library

- Installed `uplot` in `web/package.json`.
- Installed version resolved by npm: `^1.6.32`.
- npm audit reported `0 vulnerabilities`.
- `uPlot` is canvas-based, small, and designed for high-performance
  time-series rendering. This matches the oscilloscope requirement better than
  continuing to expand a handwritten canvas renderer.

### Frontend Changes

- Replaced the TypeScript canvas-only `ScopeStream` with a `uPlot`-backed
  renderer in `web/src/scope-stream.ts`.
- The TypeScript frontend still decodes the PyRPL WebSocket binary frame format
  locally:
  - magic: `PWS1`
  - header bytes: `24`
  - payload: interleaved `float32` channel samples
- Added user zoom behavior:
  - drag selection zooms through `uPlot`'s built-in cursor scaling
  - wheel zooms around the pointer
  - toolbar buttons zoom in/out/reset
  - double-click resets
  - middle/right drag pans horizontally
- Added `web/.gitignore` for `node_modules/` and `dist/`.

### FastAPI Frontend Serving

- FastAPI now serves `web/dist/index.html` when a Vite build exists.
- FastAPI mounts Vite's generated `/assets` directory when `web/dist/assets`
  exists.
- If the TypeScript build does not exist, the server still falls back to the
  built-in `pyrpl_websocket/static/index.html` page.
- `/api/assets` now reports whether `web_dist` exists.

### Verification

Frontend build:

```text
conda run -n pyrpl-env npm run build
tsc && vite build - OK
dist/assets/index-*.js: 62.62 kB, gzip 26.82 kB
```

Backend verification after the frontend changes:

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 2 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env python -m compileall pyrpl_websocket
OK
```

Live fake-hardware server verification:

- `/` served the Vite-built index from `web/dist`.
- `/assets/index-*.js` and `/assets/index-*.css` were reachable.
- `/api/assets` reported `"web_dist": true`.
- `/api/scope/frame?samples=8` returned a binary frame decoded to shape
  `(8, 2)`.

## 2026-07-08 Plot Regression and Testing Fix

### User-Reported Failure

The user reported that the TypeScript oscilloscope page did not show the sample
sine wave and that zoom kept running continuously.

Root causes and fixes:

- The TypeScript page only rendered after the user clicked `Single Frame` or
  connected the stream. It now automatically fetches and renders one
  `/api/scope/frame?samples=4096` frame on page load.
- Trackpad/mouse wheel zoom was too easy to trigger repeatedly and could feel
  like runaway zoom. Wheel zoom is disabled for now. Zoom is available through
  `uPlot` drag selection and explicit zoom/reset buttons; middle/right drag
  pans horizontally.
- The first browser test initially caught a blank-canvas condition. After
  rebuilding the Vite assets, Playwright inspection showed the rendered plot
  canvas had 57,071 painted pixels at 1280x720 viewport, with x-range
  `0..4095`.

### New Frontend Test Strategy

- Added `@playwright/test` and installed the Chromium browser for headless UI
  checks.
- Added `web/test/scope-ui.spec.ts`, which starts the fake FastAPI server and
  verifies:
  - the page auto-renders `Frame 0`
  - the `uPlot` canvas has nonblank pixels
  - initial x-range covers the full frame
  - drag zoom reduces the x-range
  - the x-range remains stable after waiting
  - wheel input does not change the x-range
- Added `web/test/scope-frame.test.mjs` for deterministic Node checks of the
  binary frame parser, channel deinterleaving, and x-range clamping.
- Added `web/src/scope-frame.ts` so binary frame parsing and zoom-range math
  can be tested without browser or `uPlot` dependencies.

Verification after the fix:

```text
conda run -n pyrpl-env npm test
3 Node tests - OK

conda run -n pyrpl-env npm run build
tsc && vite build - OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium Playwright test - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 2 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK
```

Going forward, UI/plot changes should run the Playwright regression before
being shown to the user.

## 2026-07-08 Mistake Logging Rule

The user asked that mistakes be added to this knowledge log so they are not
repeated.

For future mistakes:

- Log the user-visible symptom.
- Log the root cause once known.
- Log the fix.
- Log the regression test or verification that prevents recurrence.
- Treat this as mandatory project memory, not optional narration.

## 2026-07-08 ResizeObserver Layout Loop Mistake

### User-Reported Failure

The user reported that the web page kept growing infinitely longer while idle
and later saw this browser error:

```text
ResizeObserver loop completed with undelivered notifications.
```

### Root Cause

The TypeScript plot used a `ResizeObserver` on the plot host. The plot host's
height could be influenced by the `uPlot` child. The observer resized `uPlot`,
which changed child layout, which notified the observer again. Combined with
viewport layout using `min-height`, this created a layout feedback loop and page
growth.

### Fix

- Removed the custom `ResizeObserver` from `ScopeStream`.
- Switched to explicit `window.resize` handling scheduled with
  `requestAnimationFrame`.
- Bounded the TypeScript app layout to the viewport:
  - `body` uses `height: 100vh` and `overflow: hidden`.
  - the shell uses fixed viewport height and `minmax(0, 1fr)` rows.
  - the plot panel and plot host use `overflow: hidden` and no content-driven
    `min-height`.
- Added a Playwright regression that checks:
  - no `ResizeObserver loop` browser message is emitted
  - document `scrollHeight` remains stable while idle

Rule learned: do not observe a container whose size is affected by the chart
being resized unless the resize is carefully debounced and the container has
stable, externally constrained dimensions.

## 2026-07-08 Dynamic Fake Scope

### Change

- The fake monitor client now advances its waveform phase after each complete
  scope frame.
- Phase advances only after both channels have been read, so CH1 and CH2 remain
  internally consistent within a single frame.
- The TypeScript frontend now auto-starts `/ws/scope` only when `/api/session`
  reports fake hardware. Real Red Pitaya sessions still show one startup frame
  and wait for explicit user connection.

### Why

The fake scope previously produced a sine wave, but every frame was identical.
That made the streaming path look broken or static. Fake mode should visibly
animate so rendering, websocket streaming, and browser performance can be
tested without real hardware.

### Verification

- Added `test_fake_scope_advances_between_frames` to confirm consecutive fake
  scope frames differ.
- Updated the Playwright browser regression to confirm fake mode auto-connects
  the scope stream and advances beyond `Frame 0`.
- Re-ran:

```text
conda run -n pyrpl-env npm test
OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK
```

## 2026-07-08 Streaming Redraw Mistake

### User-Reported Failure

The user reported that the plot did not visibly update/redraw unless the mouse
was moved across the canvas.

### Root Cause

Incoming WebSocket frames updated data, but rendering was coupled too loosely to
the browser paint cycle. Pointer movement caused `uPlot` cursor work and forced
the canvas to visibly repaint, which made it look like mouse movement was
required for updates. Continuous streaming also made `uPlot`'s built-in drag
selection unreliable because incoming redraws could interrupt the library's
internal drag state.

### Fix

- Scope frames are now queued and rendered on `requestAnimationFrame`.
- After setting new data, `uPlot.redraw(true, true)` is called explicitly.
- Left-drag zoom is now handled explicitly by `ScopeStream` using the current
  x-scale, instead of relying on `uPlot`'s built-in drag zoom during streaming.
- Middle/right-drag pan remains explicit and bounded.

### Regression Test

The Playwright test now:

- waits for fake streaming to advance beyond the startup frame
- records a canvas fingerprint
- waits several more streamed frames without moving the mouse
- verifies the canvas fingerprint changes
- verifies drag zoom still works while streaming
- verifies the document height remains stable and no `ResizeObserver loop`
  message appears

Verification after the fix:

```text
conda run -n pyrpl-env npm test
OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK
```

## 2026-07-08 Startup Autoscale Mistake

### User-Reported Failure

The user noticed that when the page first opened, something like autoscale was
causing problems.

### Root Cause

The TypeScript `uPlot` configuration still allowed automatic Y-scale scanning:

```text
y: { auto: true, range: ... }
```

The first frame was also passed to `setData(..., true)`, which let `uPlot`
reset scales during startup. That behavior is normal for generic plots, but it
is a bad default for an oscilloscope because the viewport and amplitude scale
should be stable unless the user explicitly changes them.

### Fix

- Disabled automatic scale scanning for the oscilloscope plot.
- Set explicit initial X range: full frame sample range.
- Set fixed normalized Y range: `-1.1..1.1`.
- Changed frame rendering to call `setData(..., false)` and then explicitly set
  scales.
- Reset now restores both full X range and fixed Y range.
- Exposed Y range in the browser debug hook so Playwright can verify it.

### Regression Test

The Playwright test now verifies:

- initial X range covers the full frame
- initial Y range is exactly `-1.1..1.1`
- X and Y ranges remain unchanged after streamed fake frames arrive during
  startup idle time
- streaming redraw, zoom, page-height stability, and no ResizeObserver-loop
  warning still pass

Verification after the fix:

```text
conda run -n pyrpl-env npm test
OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK
```

## 2026-07-08 Scope UI Controls

### Change

- Added a sample-count selector to the TypeScript oscilloscope UI:
  - `1024`
  - `2048`
  - `4096`
  - `8192`
  - `16384`
- Added CH1 and CH2 visibility toggles.
- `ScopeStream` now supports:
  - `setSampleCount`
  - `getSampleCount`
  - `setChannelVisible`
  - `getChannelVisible`
  - `isConnected`
- Changing sample count stops the current stream, fetches one frame at the new
  sample count, and restarts streaming only if streaming had already been
  active.
- When the incoming frame sample count changes, X range resets to the new full
  sample range while Y remains fixed at `-1.1..1.1`.

### Verification

- Playwright now changes the sample count to `1024`, verifies status reports
  `1024 samples`, and verifies the X range becomes `0..1023`.
- Playwright toggles CH2 off and on and verifies the plot series visibility
  state changes.
- Existing regression checks still cover:
  - fake mode auto-streaming
  - redraw without mouse movement
  - stable startup scales
  - stable page height
  - no `ResizeObserver loop` message

Verification run:

```text
conda run -n pyrpl-env npm test
OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 6 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK
```

## 2026-07-08 Scope Control Boundary and Browser Averaging

### PyRPL Scope Knowledge Learned

- `scope.input1` and `scope.input2` are FPGA/DSP input mux settings. PyRPL
  writes them through `InputSelectRegister` to the DSP register blocks for
  `asg0` and `asg1`, so the web backend must keep these as hardware writes.
- `scope.trigger_source`, `duration`/`decimation`, `threshold`, `hysteresis`,
  `trigger_delay`, and `scope.average` are also FPGA/register-backed controls.
- `scope.average` is the FPGA high-resolution decimation-average bit. It is
  not the same thing as averaging multiple acquired traces in the GUI.
- `trace_average` belongs to `AcquisitionModule` and was performed in Python
  on the PC. In continuous mode PyRPL updates the displayed curve with:
  `data_avg = (data_avg * (current_avg - 1) + next_trace) / current_avg`, with
  `current_avg` capped at `trace_average`.
- PyRPL computes the scope time axis on the PC/browser side from `duration`,
  `trigger_delay`, and `trigger_source`. The FPGA provides samples; the UI
  decides how to display their x coordinates.

### Implementation Notes

- Added `pyrpl_websocket/scope_registers.py` to mirror the existing PyRPL
  register addresses and conversions without importing Qt-heavy PyRPL runtime
  code.
- Hardware-backed scope controls now synchronize to the same FPGA registers
  PyRPL uses when changed through the web API.
- Added `trace_average` as a separate scope setting and UI control.
- The browser applies `trace_average` locally before rendering with `uPlot`.
- The plot x-axis now uses PyRPL-style seconds rather than raw sample index.
- The UI labels the FPGA bit as `FPGA Avg` to avoid confusing it with
  browser-side trace averaging.

### Mistake Logged

When changing the plot x-axis from sample indices to seconds, the old zoom
minimum span of `4` was accidentally kept. That meant `4 seconds`, which was
larger than the default trace span and prevented drag zoom from changing the
view. The fix was to make the minimum zoom span unit-aware, using a fraction
of the active time span when the plot is in seconds.

### Additional Dependency Lesson

Starlette/FastAPI `TestClient` in the current environment requires `httpx2`.
Do not add that dependency just to test the Red Pitaya web path. Prefer direct
unit tests of small framework-neutral pieces, or use the existing Playwright
server test for full HTTP/WebSocket behavior.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 10 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Panel Registry, Tabset, and Register Debug Panel

### Change

- Added `web/src/panel-registry.ts` for available instrument panels.
- Added `web/src/workspace.ts` for workspace state, local-storage persistence,
  active panel selection, and split-size normalization.
- Replaced the hard-coded Scope-only panel menu with a generated Panels menu.
- Added a workspace tab row for enabled panels.
- Added a Register Debug panel that uses existing REST endpoints:
  - `POST /api/register/read`
  - `POST /api/register/write`
- Added Register Debug controls for address, length, values, read, write, and
  output.
- Kept Scope-specific wiring in `main.ts` for now while extracting the reusable
  workspace model first.

### Mistake Prevention

- A textarea's displayed contents live in its `.value`, not its text content.
  Browser tests should use `toHaveValue()` for register output textareas.
- Panel registry and workspace state should be data-driven before adding more
  instruments; otherwise each new panel forces another bespoke menu/tab edit.
- Switching active tabs must not implicitly disable panels. Disable/enable and
  active tab selection are separate workspace concepts.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Split.js Scope Panel Split Implementation

### Change

- Added `split.js` as a frontend runtime dependency.
- Converted the Scope panel content into a vertical split:
  - top pane: Scope controls
  - bottom pane: uPlot scope display
- Stored Scope panel split ratios in the workspace state as
  `panels.scope.splitSizes`.
- Persisted split ratios through the existing workspace local-storage record.
- Added splitter gutter styling and plot-layout refresh during/after drags.
- Added a Playwright check that drags the splitter and verifies the persisted
  split sizes change while the scope plot remains functional.

### Mistake Prevention

- Split.js solves pane resizing, not panel identity or instrument lifecycle.
  Keep the PyRPL workspace model as the owner of panel state.
- When resizing a hidden or recently shown plot, explicitly refresh uPlot
  layout; window resize events do not fire for splitter drags.
- Backend action events can arrive after local button handlers. For actions with
  detailed UI output, such as `trigger_test`, event handling must preserve the
  detailed result instead of replacing it with a generic action status.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Register Panel Extraction and Focused Tests

### Change

- Extracted Register Debug behavior from `web/src/main.ts` into
  `web/src/register-panel.ts`.
- Kept Register Debug on the same monitor-compatible REST bridge:
  - `POST /api/register/read`
  - `POST /api/register/write`
- Added `web/test/register-panel.test.mjs` for direct module coverage of:
  - register read request formatting
  - register write request formatting
  - hex and decimal value parsing
  - UI status/output formatting
  - validation errors through click handlers
- Updated `npm test` to run all `web/test/*.test.mjs` files instead of one
  hard-coded test file.

### Mistake Prevention

- When a panel grows beyond simple DOM wiring, extract it before adding the next
  instrument. The workspace shell should own panel activation/layout, while the
  panel module owns its endpoint calls and local UI behavior.
- Do not rely only on Playwright for panel logic. Browser tests are valuable for
  integration, but focused module tests catch request formatting and validation
  mistakes faster.
- The Register Debug panel is intentionally raw and dangerous; keep it isolated
  from normal Scope controls so future UI work does not accidentally mix direct
  register writes with high-level instrument state.

### Verification

```text
conda run -n pyrpl-env npm test
8 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Workspace Layout Modes and Split Panels

### Change

- Extended `web/src/workspace.ts` with persisted workspace layout state:
  - `layoutMode`: `tabs`, `split-horizontal`, or `split-vertical`
  - `workspaceSplitSizes`: saved Split.js ratios for the workspace divider
- Added a `Layout` selector to the Panels dropdown.
- Kept `Tabs` as the default workspace mode.
- Added Side by Side and Stacked workspace modes using Split.js.
- Wrapped enabled panels in a `workspace-panels` container so multiple panels
  can be visible at once without introducing floating windows.
- Kept the Scope panel's internal controls/plot splitter independent from the
  workspace-level panel splitter.
- Added `web/test/workspace.test.mjs` to cover default state, invalid saved
  state recovery, layout mode persistence, split-size persistence, and disabled
  active-panel recovery.
- Extended Playwright coverage to enable Register Debug, switch to Side by
  Side layout, verify Scope and Register Debug are both visible, drag the
  workspace divider, and return to Tabs.

### Mistake Prevention

- Workspace layout state and instrument state must remain separate. A user can
  change panel arrangement without changing hardware settings.
- A Split.js instance must be destroyed before changing between tab and split
  modes, otherwise inline styles from the previous layout can keep panels sized
  incorrectly after they are hidden or shown again.
- Keep workspace-level split sizes separate from Scope panel split sizes. They
  control different containers and should not share persistence fields.
- Node `assert.deepEqual` can fail for arrays created inside a `vm` context
  because the array prototype belongs to a different realm. Convert VM arrays
  with `Array.from(...)` before comparing in host-side tests.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Split Gutter Marker Centering

### Change

- Changed Split.js gutter CSS to center handle markers with flexbox.
- Removed pseudo-element margin centering tricks from vertical and horizontal
  gutter markers.
- Added a Playwright guard around the side-by-side workspace gutter marker
  geometry.

### Mistake Prevention

- `margin: auto` does not vertically center a pseudo-element inside an ordinary
  block gutter. Make the gutter itself responsible for centering with
  `display: flex`, `align-items: center`, and `justify-content: center`.

### Verification

```text
conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Red Pitaya Hardware Test Startup

### Knowledge

- The available Red Pitaya test hostname is `10.0.5.118`.
- Starting the board-side monitor path for testing is done with:

```text
ssh root@10.0.5.118 "/opt/pyrpl/update_fpga.sh"
```

- That SSH command does not return while `monitor_server` is alive. It must be
  kept running in a separate/background process; otherwise the monitor server
  exits and the Python web server cannot talk to the board.
- The personal hardware test launcher is `test_redpitaya.sh`.

### Change

- Updated `test_redpitaya.sh` so it:
  - starts `/opt/pyrpl/update_fpga.sh` over SSH in the background
  - waits briefly for startup
  - starts `python -m pyrpl_websocket --hostname 10.0.5.118`
  - cleans up the background SSH process when the web server exits
- Kept environment variable overrides for host, bind address, port, scope
  interval, startup delay, and Python command.

### Verification

```text
bash -n test_redpitaya.sh
OK
```

## 2026-07-08 Hardware Scope Frames Must Rearm Acquisition

### Problem

On real Red Pitaya hardware, the browser was receiving binary scope frames, but
the plotted data did not update because every frame contained the same samples.

### Root Cause

The web prototype's non-fake path called `read_scope_frame()` directly for each
stream frame. That only reads the scope RAM buffer. It does not start a new FPGA
scope acquisition. On hardware, repeatedly reading the buffer can legitimately
return the same captured waveform forever.

Original PyRPL does more work before reading a curve:

- reset the scope write-state machine
- set the trigger-delay register
- arm the trigger
- write the trigger source, which also causes the software trigger for
  `trigger_source="immediately"`
- wait until `_trigger_armed` and `_trigger_delay_running` are both false
- read the full channel buffers
- roll the ring buffer by
  `-(_write_pointer_trigger + _trigger_delay_register + 1)`

### Change

- Added hardware scope acquisition helpers in `pyrpl_websocket/scope_registers.py`:
  - `start_scope_trace_acquisition`
  - `scope_curve_ready`
  - `wait_scope_curve_ready`
  - `scope_trigger_roll_offset`
- Added `read_trigger_aligned_scope_frame()` in `pyrpl_websocket/scope.py`.
- Changed `WebSession.acquire_scope_frame()` so non-Dummy clients use the
  PyRPL-style hardware acquisition path instead of raw repeated buffer reads.
- Preserved fake-hardware trigger simulation separately.
- Added simulated non-Dummy hardware tests that verify:
  - continuous mode rearms and returns different frames on successive calls
  - the returned data is trigger-ring-buffer aligned
  - single mode pauses after one hardware frame

### Mistake Prevention

- Do not treat Red Pitaya scope RAM reads as fresh acquisitions. A fresh
  hardware scope frame requires the trigger/writestate sequence from original
  PyRPL.
- Hardware frame alignment must use the FPGA write pointer and trigger-delay
  register. Reading from address `0x40110000` as sample zero is not equivalent
  to PyRPL's displayed curve.
- For real hardware tests, check that consecutive websocket payloads have
  changing sample values, not only that payloads arrive.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 22 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Scope UI Near-Ready Cleanup

### Change

- Removed the visible `Test Trigger` button from the Scope panel.
- Removed the frontend-only `testTrigger()` click helper and DOM lookup.
- Kept the backend `trigger_test` action and event formatting as a debug/API
  diagnostic path for now.

### Knowledge

- Hardware testing confirmed the Scope panel is close to ready after the
  PyRPL-style acquisition rearm fix.
- Trigger configuration should be tested through normal Run/Single behavior in
  the user-facing UI. A separate manual test-trigger button adds clutter at this
  stage.

### Verification

```text
conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Hardware Rolling Mode Uses Current Write Pointer

### Problem

Rolling mode was not implemented like original PyRPL. Treating it as a normal
triggered acquisition, or as `trigger_source="off"` with regular acquisition
readiness checks, does not match PyRPL's "untriggered (rolling)" scope mode.

### Original PyRPL Behavior

For rolling mode, PyRPL:

- starts trace acquisition once
- sets the trigger source register to `off`
- keeps the trigger armed
- repeatedly reads `_write_pointer_current` before and after reading the scope
  buffers
- rolls the channel buffers by `data_length - wp0`
- discards samples affected during the read with
  `to_discard = (wp1 - wp0) % data_length`
- fills the discarded leading region with `NaN`

This is implemented in original PyRPL's `_start_acquisition_rolling_mode()` and
`_get_rolling_curve()`.

### Change

- Added `start_scope_rolling_acquisition()` in
  `pyrpl_websocket/scope_registers.py`.
- Added `read_rolling_scope_frame()` in `pyrpl_websocket/scope.py`.
- Changed non-Dummy `WebSession.acquire_scope_frame()` so hardware rolling
  mode starts rolling acquisition once per run/settings change, then streams
  live current-write-pointer ring-buffer snapshots.
- Kept triggered continuous acquisition as a separate path for
  `run_mode="continuous"`.
- Added a simulated hardware test for rolling mode that verifies:
  - rolling starts only once
  - trigger source is forced to `off`
  - current write pointer alignment is used
  - samples changed during buffer read are represented as `NaN`

### Mistake Prevention

- Rolling mode is not a sequence of complete triggered acquisitions.
- Do not wait for `curve_ready()` in rolling mode; the acquisition is supposed
  to keep running.
- Do not use `_write_pointer_trigger` for rolling mode. Use
  `_write_pointer_current` before and after buffer reads.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 23 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Scope Panel Header Ownership

### Correction

Scope-specific controls belong inside the Scope panel, not in the global page
header. The global header should remain thin and workspace-level, containing
only application/session identity and panel/workspace menus.

### Change

- Moved Scope actions into the Scope panel header:
  - `Single`
  - `Run` / `Stop`
  - `Pause`
  - `Save Curve`
  - X/Y zoom buttons
  - X/Y offset buttons
  - `Reset`
- Reduced the global topbar padding, minimum height, and text sizes.
- Closed the `Panels` dropdown after a panel checkbox selection so the menu
  does not overlay and intercept clicks on instrument controls.

### Verification

```text
conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Scope Duration and Data Length Correction

### Correction

The scope `duration` must not be implemented as only an X-axis rescale. In the original PyRPL scope:

- `data_length = 2**14`
- `decimation` is the hardware register at scope offset `0x14`
- `sampling_time = 8e-9 * decimation`
- `duration = sampling_time * data_length`
- valid durations are therefore `8e-9 * 2**14 * 2**n`
- the time axis uses `endpoint=False`

### Implementation Notes

- Changed the frontend stream default from 4096 samples to `2**14 = 16384`.
- Changed `/api/scope/frame` default capture length to `SCOPE_DATA_LENGTH`.
- Kept low-level helpers able to read shorter lengths for focused tests, but the app path now uses the full PyRPL trace length.
- Kept duration normalization as next-higher legal PyRPL duration.
- Added a backend test that setting `duration = 0.1` normalizes to `0.134217728` and writes decimation `1024` to register `0x40100014`.
- Fixed frontend `frameToData()` to use PyRPL-style endpoint-false time samples.
- Updated browser tests and CSV checks to expect 16384 data rows.

### Mistake Prevention

- Do not treat duration as a plotting-only control. It selects hardware decimation and changes sample spacing for a full 16384-point captured waveform.
- Do not request partial 4096-point traces from the UI unless implementing a deliberate downsampling/decimation display layer separate from acquisition.
- Use original PyRPL `Scope.times` semantics for X data: `np.linspace(..., endpoint=False)`.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK, websocket used samples=16384
```

## 2026-07-08 Multi-Instrument Panel Layout Investigation

### Context

The web UI needs to support multiple instruments in one page, such as scope,
ASG, PID, IQ, sampler, spectrum analyzer, and future lockbox panels. The target
is not arbitrary desktop-style movable windows, but user-customizable tabs,
stacking, and split views.

### Options Reviewed

- Simple in-house layout shell using CSS Grid, tabs, and persisted split ratios.
- Lightweight splitter library such as Split.js for resizable rows/columns.
- Dockview for IDE-like tab groups, docking, serialization, and touch support.
- Golden Layout for drag/drop tabbed layout with save/restore, but its current
  documentation warns the npm package has not been updated in a long time.
- Lumino DockPanel, used in the Jupyter ecosystem, for a mature widget/dock
  system, at the cost of a larger framework-style abstraction.

### Current Recommendation

Use an in-house workspace model together with Split.js-style splitter mechanics:

- `workspace` contains one or more `split` nodes or `tabset` nodes
- `tabset` contains instrument panel instances
- each panel has `{id, instrument, title, state}`
- persist layout JSON in browser local storage first, then backend state later
- use Split.js or the same small splitter pattern for draggable pane handles,
  persisted split ratios, and touch/mouse resizing

This fits the current vanilla TypeScript/Vite frontend and avoids pulling in a
React or IDE-widget framework before the instrument abstraction is stable.
Split.js is not a replacement for the workspace model; it is the right-sized
implementation detail for resizable split panes inside that model.

### Mistake Prevention

- Do not make each instrument open its own websocket/control model independently
  without a workspace manager; that would make save/restore and resource
  ownership hard.
- Do not add full floating-window docking unless users really need it. For lab
  control, predictable tabs/splits are more useful and easier to test.
- Do not hand-roll splitter pointer behavior unless Split.js fails a concrete
  project need; splitter dragging has enough edge cases that a small focused
  library is reasonable.
- Any third-party layout dependency must be frontend-only or pure JavaScript;
  it should not add Red Pitaya ARM Python runtime risk.

## 2026-07-08 Scope Panel Workspace Shell

### Change

- Added the workspace + Split.js direction to `WEB_MIGRATION_PLAN.md`.
- Wrapped the current scope application in a `workspace-panel` with a panel
  header and retained the existing scope controls/plot as panel contents.
- Added a compact `Panels` dropdown with a `Scope` checkbox.
- Added persisted workspace state in browser local storage for the Scope panel
  enabled/disabled flag.
- Disabling the Scope panel hides the panel, shows an empty-workspace state,
  stops the scope stream, and sends a scope `stop` action.
- Re-enabling the Scope panel restores the panel, refreshes plot layout, fetches
  a frame, and restarts fake continuous streaming.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Trigger-Gated Fake Acquisition Semantics

### Correction

The earlier `trigger_test` action was only a diagnostic check. A working oscilloscope trigger must affect acquisition:

- signals continue evolving internally even when no frame is uploaded
- continuous triggered acquisition uploads a captured waveform only after the trigger condition is met
- the displayed frame is captured with trigger time at `t = 0`
- pre-trigger samples are included according to `trigger_delay` and duration settings
- single triggered acquisition pauses/latches after the first captured frame
- single acquisition must be rearmed before responding to another trigger

### Implementation Notes

- Added `WebSession.acquire_scope_frame()` as the trigger-aware frame path.
- Kept `read_scope_frame()` as a raw frame read helper for lower-level tests and hardware-buffer reads.
- Fake acquisition now searches continuously generated signal samples for the selected trigger condition before building a display frame.
- `trigger_source = off` in running continuous mode produces no uploaded frame.
- `trigger_source = immediately` still free-runs.
- `run_mode = rolling` free-runs only for continuous streaming; single acquisition still waits for its trigger.
- The REST and websocket frame endpoints now use trigger-aware acquisition and publish state changes when single mode pauses itself.
- The frontend Single button no longer sends `stop` after fetching a frame; the backend is left in `paused_single` until rearmed.

### Mistake Prevention

- Do not confuse a "trigger test" button with acquisition trigger behavior. Tests must cover upload gating and single-shot latch state.
- The websocket should not send a frame every timer tick in triggered mode. It should send only when acquisition returns a captured frame.
- Single trigger semantics belong in backend acquisition state, not only in the browser button flow.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 20 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Scope Interaction and Trigger Test Corrections

### Change

- Removed the fake scope channel-dependent phase term. When CH1 and CH2 select the same dummy input, the generated samples are now identical.
- Added a scope `trigger_test` action that evaluates the current trigger source, threshold, and hysteresis against one acquired frame.
- Added a browser `Test Trigger` button beside trigger controls.
- Fixed X zoom-in for time-based scope ranges by using a duration-aware minimum span instead of a hard-coded sample-count span.
- Added explicit Y zoom controls and X/Y offset controls in the second header row.
- Changed plot pointer behavior to match the requested oscilloscope workflow:
  - left/touch drag pans X and Y
  - right/middle drag zooms X and Y
  - double-click resets the view
- Preserved user Y zoom/pan during streaming instead of resetting the Y scale on every frame.
- Added displayed-data stats to the frontend debug hook so tests can verify that controls affect the plotted data, not only backend state.

### Mistake Prevention

- Fake hardware must preserve source identity. A per-channel phase offset is useful for making two default channels look different, but it is wrong when both channels select the same mux source.
- Do not reuse sample-index zoom constants after switching the X axis to seconds. The minimum span must be based on the current axis units.
- Do not reset plot scales on every streamed frame. Only initial fit, sample-count changes, explicit reset, or user setting changes should alter the view.
- Canvas pixel tests can be misleading when a chart has multiple layers or the current viewport clips the changed signal. Use a combination of painted-pixel checks, live-frame checks, interaction checks, and displayed-data statistics.
- When adding a trigger test to the UI, keep it tied to the actual current controls: trigger source, threshold, and hysteresis.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 17 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 CSV Export and State UI Correction

### User-Reported Failure

The user found that the saved CSV file could contain only the header and no
waveform rows. The state save/load/delete UI was also incomplete because it did
not provide an explicit way to choose among saved states. The controls had
become crowded in one long row.

### Root Cause

- CSV export read from the trace-averaging accumulator. Control changes such
  as duration/trigger updates reset that accumulator while the plot could
  still visibly show the last rendered frame. That made export return only:
  `time,ch1,ch2`.
- The previous browser regression only checked an internal CSV line count at
  one moment. It did not click the real download button or inspect the actual
  downloaded file.
- Saved states had only a text field, so users had to remember names manually.
- Controls were placed in a dense auto-fit grid instead of grouped by task.

### Fix

- `ScopeStream` now keeps `displayedData` separate from the averaging
  accumulator and exports the last displayed curve.
- Time-setting changes re-render the current frame into `displayedData`.
- CSV downloads append the temporary anchor to the document before clicking.
- Playwright now clicks `Save Curve`, waits for the browser download, reads
  the downloaded CSV file, and verifies it contains the header plus all sample
  rows.
- Added a saved-state dropdown. Save refreshes/selects the saved name; load
  and delete can operate on the selected saved state.
- Split the UI into grouped rows:
  - acquisition/sample/channel controls
  - signal routing and trigger mode
  - tuning controls
  - saved-state controls

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 15 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK, including actual CSV download content
```

## 2026-07-08 UI Grouping and Fake Input Behavior Correction

### User-Reported Failure

The user reported that the UI had become ugly and crowded:

- buttons were too large
- controls effectively spread into too many rows
- the sample-count selector should not exist because original PyRPL scope GUI
  does not expose sample-count selection
- CH1/CH2 visibility checkboxes should live with the corresponding input
  selectors
- changing fake `input1`/`input2` did not visibly affect plotted data

### Root Cause

- The header mixed acquisition commands with sample/channel controls. That
  invented a control surface that does not match the original scope GUI.
- The module controls were allowed to auto-fit into visually noisy groups
  rather than being deliberately grouped by workflow.
- `DummyClient` generated fake channel data only from channel number and phase,
  not from the FPGA input mux register values written by `input1`/`input2`.

### Fix

- Removed the sample-count selector from the UI. The stream still uses an
  internal sample count, but users no longer see it as a scope GUI control.
- Moved CH1/CH2 visibility checkboxes directly in front of their input
  selectors.
- Compressed command buttons and kept them in two compact header rows.
- Reworked the module panel into two control rows:
  - signal/routing row
  - tuning/state row
- Made selects and inputs stretch within their grid cells.
- Updated fake scope generation so `input1`/`input2` write FPGA mux registers
  and fake CH1/CH2 waveform generation depends on those mux values.
- Strengthened Playwright to verify `input1` changes alter the canvas
  fingerprint after fresh frames arrive.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 15 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 Module States, Full Scope Control Slice, and CSV Export

### Change

- Added the remaining Phase 2 module-state API shape:
  - `GET /api/modules/{module_name}/states`
  - `POST /api/modules/{module_name}/states/{state_name}/save`
  - `POST /api/modules/{module_name}/states/{state_name}/load`
  - `DELETE /api/modules/{module_name}/states/{state_name}`
- Added matching control-WebSocket messages:
  - `module.states`
  - `module.state.save`
  - `module.state.load`
  - `module.state.delete`
- Added `module.states.changed` browser event.
- Added optional JSON state persistence through `ServerSettings.state_file` and
  the CLI flag `--state-file`.
- Exposed the remaining implemented scope controls in the browser:
  - trigger delay
  - threshold
  - hysteresis
- Added browser UI to save/load/delete named scope setup states.
- Added browser-side CSV export for the currently displayed/averaged curve.

### Boundary

The saved states are web-side setup states for the current prototype. They are
not yet PyRPL `MemoryTree`/YAML states. This keeps the Red Pitaya deployment
lightweight and avoids importing the Qt-heavy PyRPL runtime while the web
runtime is still being built out.

CSV export is browser-side because the displayed curve can include browser-side
trace averaging and browser-computed time axes. The backend `save_curve` action
now acts as the event/state handshake, while the browser owns the actual file
generation.

### Mistake Prevention

Do not reuse one numeric formatter for all controls. A formatter that displays
`duration` as milliseconds is wrong for `threshold` and `hysteresis`. The
frontend now formats values by attribute so time controls use time units and
voltage-like controls remain plain numbers.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 15 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-08 PID, IQ, Trigger, and PWM Basic Controls

### Change

- Added basic DSP-backed module migration for:
  - `pid0`, `pid1`, `pid2`
  - `iq0`, `iq1`, `iq2`
  - `trig`
  - `pwm0`, `pwm1`
- Added shared DSP register helpers in `pyrpl_websocket/dsp_registers.py`.
- Added module schemas, validation, state save/load support, and actions for
  the new modules.
- Added browser panels for PID, IQ, Trigger, and PWM. These panels use a
  generic schema-driven renderer so future simple register modules can be
  exposed without hand-writing each control.

### Register Mapping

DSP module base address is:

```text
0x40300000 + dsp_number * 0x10000
```

The DSP numbers come from PyRPL's `DSP_INPUTS` mapping:

```text
pid0=0, pid1=1, pid2=2, trig=3, iir=4,
iq0=5, iq1=6, iq2=7, asg0=8, asg1=9,
in1=10, in2=11, out1=12, out2=13, iq2_2=14, off=15
```

Shared DSP registers:

- input select: `base + 0x0`
- direct output select: `base + 0x4`
- sync/pause bit register: `base + 0xC`

PID registers implemented:

- `ival`: `base + 0x100`, signed 16-bit, norm `2**13`
- `setpoint`: `base + 0x104`, signed 14-bit, norm `2**13`
- `p`: `base + 0x108`, signed 24-bit, norm `2**12`
- `i`: `base + 0x10C`, signed 24-bit, norm `2**32 * 2*pi*8e-9`
- `min_voltage`: `base + 0x124`, signed 14-bit, norm `2**13`
- `max_voltage`: `base + 0x128`, signed 14-bit, norm `2**13`
- `pause_gains`: `base + 0x12C`, mask `0b111`
- `differential_mode_enabled`: `base + 0x12C`, bit `3`
- `paused`: `base + 0xC`, DSP-number bit, inverted like PyRPL's
  `PauseRegister`

IQ registers implemented:

- `on` / `pfd_on`: `base + 0x100`, bits `0` and `1`
- `modulation_at_2f`: `base + 0x100`, mask `3 << 2`
- `demodulation_at_2f`: `base + 0x100`, mask `3 << 4`
- `phase`: `base + 0x104`, 32-bit phase register, inverted
- `frequency`: `base + 0x108`, 32-bit frequency register
- `output_signal`: `base + 0x10C`
- `gain`: writes `_g1` and `_g4` at `base + 0x110` and `base + 0x11C`
- `amplitude`: `base + 0x114`, signed 18-bit, norm `2**17`
- `quadrature_factor`: `base + 0x118`, signed 18-bit, norm `1`

Trigger registers implemented:

- `armed`: `base + 0x100`, bit `0`
- `auto_rearm`: `base + 0x104`, bit `0`
- `phase_abs`: `base + 0x104`, bit `1`
- `trigger_source`: `base + 0x108`
- `output_signal`: `base + 0x10C`
- `phase_offset`: `base + 0x110`, 14-bit phase register
- `threshold`: `base + 0x118`, signed 14-bit, norm `2**13`
- `hysteresis`: `base + 0x11C`, signed 14-bit, norm `2**13`

PWM input routing uses the ADC input DSP slots exactly as PyRPL's `Pwm`
module does:

- `pwm0` writes input select at the `in1` DSP base
- `pwm1` writes input select at the `in2` DSP base

### Boundary

This pass migrates the basic controls needed by higher-level modules such as
lockbox and spectrum/network analyzer orchestration. It does not yet expose
the list-valued filter controls:

- PID `inputfilter`
- IQ `bandwidth`
- IQ `acbandwidth`

Those need a list-aware browser control and valid-frequency presentation
rather than a single scalar input. Do not silently fake them as plain numbers;
that would hide important PyRPL behavior.

### Mistake Prevention

When multiple modules share the `DspModule` base pattern, keep routing and
fixed-point conversion in one helper module. Copying input/output/gain register
math into every module would make future hardware-reference corrections too
easy to miss.

For schema-driven panels, wait to connect the event WebSocket until after the
generic controls are rendered. Otherwise an early module event can arrive
before the control map exists and the UI will miss the update.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 31 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
3 Chromium tests - OK
```

## 2026-07-08 ASG and Housekeeping Web Migration

### Change

- Added Qt-free backend models and schemas for `asg0`, `asg1`, and `hk`.
- Added ASG register helpers using the original PyRPL/Zynq register layout:
  - ASG base: `0x40200000`
  - ASG0 waveform RAM: `0x40210000`
  - ASG1 waveform RAM: `0x40220000`
  - amplitude/offset packed at `0x40200004 + value_offset`
  - frequency at `0x40200010 + value_offset`
  - start phase at `0x4020000c + value_offset`
  - cycles per burst at `0x40200018 + value_offset`
  - trigger source bits in the shared control register
  - direct output registers through DSP output bases `0x40380004` and `0x40390004`
- Added housekeeping helpers using PyRPL's register layout:
  - base: `0x40000000`
  - LED: `0x40000030`
  - expansion P read/write/direction: `0x20`, `0x18`, `0x10`
  - expansion N read/write/direction: `0x24`, `0x1c`, `0x14`
- Extended generic module state save/load/delete to scope, ASG, and HK.
- Added ASG and Housekeeping panels to the TypeScript workspace model and
  browser UI. They can be enabled/disabled from the Panels menu like the
  original PyRPL menu-style instrument selection.
- Widened workspace split persistence from exactly two panes to N panes, so
  Split.js can support Scope, ASG, Housekeeping, and Register Debug together.
- Updated the fake monitor client so untouched `asg0`/`asg1` still provide
  useful demo signals, but once ASG registers are written the fake scope signal
  follows ASG waveform/amplitude/offset/frequency registers.

### Boundary

This migrates the first useful ASG/HK control surface and compatible register
writes. It does not yet expose every PyRPL ASG feature, such as custom user
waveform upload/noise/random phase controls, nor every future housekeeping
feature. FPGA firmware and `monitor_server.c` remain untouched.

### Mistake Prevention

Do not assume a checkbox change fires if the UI is already at the requested
value. In Playwright, `setChecked(true)` on an already-checked HK direction
checkbox did not emit a change event, so the test was not exercising the write
path. Toggle to a different value when the point is to test the event/write.

When adding more than two panels to Split.js, the saved size array must match
the active pane count. A two-element workspace split model works for two
panels only; use normalized N-pane workspace split sizes for the outer
workspace and keep two-element sizes only for fixed internal splits such as
Scope controls/plot.

For fake hardware, keep a useful default demo signal until the corresponding
registers are touched. After ASG registers are written, fake scope traces
should follow those registers so browser controls visibly affect the plot.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 27 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
2 Chromium tests - OK
```

## 2026-07-08 Module Action API and Running State

### Change

- Added module action metadata and action execution for the scope prototype.
- Added REST routes:
  - `GET /api/modules/{module_name}/actions`
  - `POST /api/modules/{module_name}/actions/{action}`
- Added control-WebSocket messages:
  - `module.actions`
  - `module.action`
- Added browser-facing events:
  - `module.action`
  - `module.state.changed`
- Added scope running state values:
  - `stopped`
  - `running_single`
  - `running_continuous`
  - `paused_single`
  - `paused_continuous`
- The browser now calls backend actions for:
  - single-frame acquisition
  - continuous streaming
  - pause
  - stop

### Boundary

This is the web action/state scaffold. It does not yet replace the full PyRPL
`AcquisitionModule` coroutine machinery. The browser still opens/closes its
own scope data WebSocket, while the backend records and broadcasts running
state. The next deeper integration should connect these actions to real PyRPL
scope acquisition setup/ready logic or a Qt-free equivalent.

### Mistake Prevention

When a UI action intentionally closes a WebSocket, the generic `onclose`
handler can overwrite the user-facing action status, such as replacing
`Paused` with `Scope stream closed`. The `ScopeStream` now suppresses the
generic close message for deliberate closes. Keep this pattern for future
control-driven stream stops.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 12 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_scope.py
Ran 3 tests - OK

PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_protocol.py
Ran 2 tests - OK

conda run -n pyrpl-env npm test
5 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
1 Chromium test - OK
```

## 2026-07-10 Filter Registers and Initial IIR Migration

### Learned

- PyRPL `FilterRegister` values are packed FPGA words, not plain floats. Each
  stage uses an enable bit, a highpass bit, and a shift value derived from the
  requested cutoff frequency. PID `inputfilter`, IQ `bandwidth`, IQ
  `acbandwidth`, and IIR `inputfilter` must all go through this conversion.
- IQ `acbandwidth` is a proxy for the inherited `inputfilter`: PyRPL writes the
  negative of the requested AC bandwidth so the input stage is highpass.
- Lockbox `InputIq`/PDH setup uses both filters: `bandwidth` configures IQ
  quadrature filtering and `acbandwidth` is derived from `mod_freq / 128`.
- The IIR hardware module is a DSP `FilterModule`: input at `0x0`,
  output_direct at `0x4`, loops at `0x100`, on/bypass bits at `0x104`,
  overflow at `0x108`, inherited `inputfilter` at `0x120`, and coefficient RAM
  beginning at `0x8000`.
- Importing the legacy `pyrpl` package or IIR hardware module directly is not
  acceptable for the web server path because it initializes Qt. Keep the
  FastAPI server's register and schema code Qt-free.

### Mistake Prevention

- Do not expose filter-style controls as single numeric fields. They are
  list-valued in PyRPL and users often enter cascaded lowpass/highpass stages
  such as `1000, -2000`.
- Do not let TypeScript ignore array-valued module state updates. Generic
  controls must render returned lists back into text fields.
- Avoid importing old PyRPL modules just to reuse descriptors if the import path
  reaches `pyrpl/__init__.py`; that path starts a QApplication.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 43 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
5 Chromium tests - OK
```

## 2026-07-10 IIR Plot Editor Surface

### Learned

- PyRPL's IIR GUI is a graphical filter editor, not just a set of register
  controls. Its layout is graph plus compact general controls on top, with
  pole/zero list editors below.
- The original plot shows magnitude and phase. Yellow is the filter design,
  green is an optional data curve, red is data times design, and pole/zero
  markers are drawn on both plots.
- Mouse behavior in the original editor is tied to pole/zero lists:
  plain click selects the nearest pole/zero, CTRL-click adds a real pole,
  SHIFT-click adds a real zero, CTRL double-click adds a complex pole, and
  SHIFT double-click adds a complex zero. The lists remain the source of truth.

### Mistake Prevention

- Do not migrate IIR as a generic register-only card. The plot is essential UI
  because users tune filter vertices visually and expect the Bode curve to
  update when either the plot or text/list inputs change.
- Keep the IIR plot backend Qt-free. Importing legacy `pyrpl.hardware_modules`
  reaches Qt initialization, so transfer-function plot helpers must live in the
  web package until the legacy math is separated from Qt imports.

### Verification

```text
PYTHONPATH=. conda run -n pyrpl-env python pyrpl/test/test_pyrpl_websocket_app.py
Ran 44 tests - OK

conda run -n pyrpl-env npm test
13 tests - OK

conda run -n pyrpl-env npm run build
OK

conda run -n pyrpl-env npm run test:e2e
5 Chromium tests - OK
```

## 2026-07-10 Web Parity Audit Rule

### Learned

- Migration work must start from the original PyRPL `_gui_attributes`,
  `_setup_attributes`, widget layout, and control routines. The web panel should
  then reproduce that surface, not a guessed replacement.
- A register being writable is not enough reason to expose it in the web GUI.
  For example, IQ `on` and `pfd_on` are real registers, but they are not in
  PyRPL's IQ GUI/setup attributes; they should be controlled by routines such as
  spectrum analyzer or lockbox PDH, not shown as normal IQ user controls.
- A method existing in PyRPL is not enough reason to add a button. IIR
  `_setup_unity()` and `_setup_zero()` exist, but the original GUI comments them
  out as debugging helpers, so the web UI should not advertise them.
- PyRPL's trigger module arms during `_setup()`. A separate web Arm button is
  unnecessary unless the original GUI exposes that workflow.
- GUI-only state and setup state are different. PID `ival` appears in the
  original GUI but is not in `_setup_attributes`, so it should be directly
  editable but not saved/restored as part of a setup state.

### Mistake Prevention

- Before adding a web control or action, record the original file and attribute
  list that justify it.
- Before declaring a panel migrated, compare it against `WEB_PARITY_AUDIT.md`
  and either implement missing original controls or leave a visible parity gap.
- Do not hide omissions in browser-only state. Scope channel visibility now
  maps to PyRPL `ch1_active`/`ch2_active`, so saved state and backend state
  match the original GUI better.

## 2026-07-10 PyRPL-Compatible Web Config Files

### Learned

- PyRPL's default user directory is `PYRPL_USER_DIR` when set, otherwise
  `~/pyrpl_user_dir`. Config files live in the `config` subdirectory and use
  `.yml` extension.
- PyRPL config files store module setup attributes directly under root module
  branches such as `scope`, `asg0`, and `iq1`.
- Saved states use separate root branches named `<module>_states`, for example
  `scope_states: high: ...`.
- The web UI layout has no PyRPL legacy equivalent, so it is stored in a
  namespaced branch: `pyrpl_websocket.workspace`. This keeps old PyRPL module
  branches readable by the legacy GUI while preserving web-only layout.

### Mistake Prevention

- Do not put web module state into a separate JSON file by default. That makes
  the web migration diverge from PyRPL's YAML config workflow.
- Do not import `pyrpl.memory.MemoryTree` into the FastAPI server path. It uses
  Qt timers, so the web config helper must remain Qt-free while matching the
  same path and branch conventions.
- Browser tests must reset server-side workspace/module config, not just
  `localStorage`, because layout and controls are now remembered in the YAML
  config file.

## 2026-07-10 Module Manager And Ownership Parity

### Learned

- Original PyRPL ownership is implemented by `Module.owner` plus
  `ModuleManager.pop(owner)` / `ModuleManager.free(module)`, not by a separate
  global ownership dictionary.
- `ModuleManager.pop(owner)` chooses the last currently free hardware module
  in that manager's list and sets the module's own `owner`.
- Releasing ownership in PyRPL is not just a visual unlock. Setting
  `owner = None` re-enables autosave and reloads the module setup attributes
  from the config file.
- Some modules override ownership behavior. In particular, `Scope` stops when
  it becomes owned by another module.
- Spectrum analyzer is special in original PyRPL: it directly takes `rp.iq2`
  and sets `iq2.owner = self.name` instead of using `pyrpl.iqs.pop()`, while
  it uses `pyrpl.scopes.pop(self.name)` for the scope.

### Current Web Difference

- The web server currently uses `WebSession.module_owners` as a separate
  ownership table. This is useful for UI locking, but it does not fully migrate
  PyRPL's ownership side effects.
- Web release currently clears an owner flag but does not reload that hardware
  module's setup attributes from the YAML config the way PyRPL does.
- Web reservation currently asks for a named module, rather than offering a
  manager-level `pop(owner)` that picks the last free module of a resource type.
- Spectrum analyzer and lockbox have custom reservations that approximate the
  original behavior, but they are not yet driven through a shared
  PyRPL-compatible manager abstraction.

### Mistake Prevention

- Do not invent new resource arbitration for each migrated module. Add a
  Qt-free web `ModuleManager` equivalent and route scope, ASG, PID, IQ, PWM,
  IIR, trig, and housekeeping reservations through it.
- On release, restore the module's persisted setup attributes unless the
  original PyRPL module intentionally behaves differently.
- Preserve documented PyRPL special cases such as spectrum analyzer's dedicated
  `iq2` ownership.

## 2026-07-10 IIR Plot/List Editing Parity

### Learned

- Original PyRPL IIR is a graph-centered editor. The magnitude and phase plots
  are the primary UI, with the general settings beside them and the four
  pole/zero list widgets below them.
- The four lists `complex_poles`, `complex_zeros`, `real_poles`, and
  `real_zeros` are the source of truth. Plot clicks and drags must update
  those lists, and list edits must update the plot.
- The original list widgets provide add/remove/selection behavior, so replacing
  them with a single raw text box omits important function.
- PyRPL click behavior is: plain click selects nearest pole/zero, CTRL-click
  adds a real pole, SHIFT-click adds a real zero, CTRL double-click adds a
  complex pole, and SHIFT double-click adds a complex zero.
- For uPlot inside split panels, resize must follow the panel/container, not
  only `window.resize`; otherwise cursor/crosshair overlays and marker layers
  can become geometrically stale.

### Mistake Prevention

- Do not treat IIR poles/zeros as generic text fields. Keep explicit count,
  add/remove, selection, and per-element editing controls.
- Browser tests for graph-heavy panels should assert real plot dimensions and
  at least one interaction that changes the underlying backend list.

## 2026-07-10 IIR Plot Growth Regression

### Mistake

- I repeated an earlier scope-layout mistake in the IIR plot: the resize code
  measured a container whose height was influenced by the uPlot size being
  written back into it. That creates a feedback loop where the page grows while
  idle.
- The full knowledge log has become long enough that important rules are easy
  to miss during implementation.

### Fix

- Added `MIGRATION_KNOWLEDGE_SUMMARY.md` as a short checklist to read before
  migration edits.
- Bounded the IIR card height in CSS and made the plot grid consume that fixed
  area.
- Changed the IIR resize path to measure fixed plot frame boxes and skip
  resizing while hidden, rather than using fallback dimensions that can push
  layout larger.
- Added a browser regression check that the IIR plot height remains stable
  after waiting while the page is idle.

### Mistake Prevention

- Before touching frontend plots, check the summary's Plot/Layout Rules.
- Any graph panel using `ResizeObserver` must have a test that waits and
  compares dimensions over time.

## 2026-07-10 Shared Plot Theme

### Learned

- Plot color drift happened because scope, spectrum analyzer, IIR, and lockbox
  each hard-coded their own uPlot axis, grid, background, and trace colors.
- Plot visual constants should be shared in TypeScript for uPlot options and in
  CSS variables for DOM-level title, legend, cursor, and background styling.

### Fix

- Added `web/src/plot-theme.ts` with shared axis/grid/text/background and trace
  colors.
- Updated scope, spectrum analyzer, IIR, and lockbox uPlot options to use the
  shared theme.
- Updated global uPlot CSS so plot title, legend, cursor lines, and plot
  backgrounds match across panels.

### Mistake Prevention

- New graph panels should import `plot-theme.ts` instead of introducing local
  plot color literals.

## 2026-07-10 IIR Coefficient Hardware Sync

### Mistake

- I migrated the IIR pole/zero controls and plot first, but the backend only
  wrote simple routing/control registers. It did not run the original PyRPL
  `IirFilter` design calculation or write the IIR coefficient RAM, so changing
  poles and zeros did not update the Red Pitaya board.

### Fix

- `sync_iir_setting` now treats `loops`, `gain`, `real_zeros`, `real_poles`,
  `complex_zeros`, and `complex_poles` as setup-driving attributes.
- The web backend loads the original PyRPL `iir_theory.py` math without
  importing the Qt-backed IIR package, computes coefficients with the FPGA
  constants, writes `loops`, and writes the coefficient words at IIR base
  `+ 0x8000`.
- Added a regression test that pole/zero changes produce nonzero coefficient
  RAM data and that a later pole/zero edit changes the coefficient image.

### Mistake Prevention

- For hardware modules, every control that changes a plot or browser model must
  be traced to its original PyRPL `call_setup`/register side effect.
- Do not call an IIR migration complete until the coefficient RAM write path is
  verified, not just the Bode plot.

## 2026-07-11 IIR Plot Navigation Parity

### Learned

- Original PyRPL IIR uses PyQtGraph plots, so users inherit free plot
  navigation from the graph widget while also using CTRL/SHIFT click shortcuts
  for pole/zero editing.
- The web IIR plot should preserve user-selected x/y scales across refreshes.
  Refreshing plot data must not always reset scales, otherwise zoom and pan feel
  broken.
- uPlot has several internal overlay layers. Mouse tests should recompute plot
  bounding boxes after scrolling/zooming and should verify the pointer really
  lands on the plot, not on a stale page coordinate.

### Fix

- Added an IIR plot reset button inside the IIR panel.
- Added mouse wheel zoom, left-drag pan, and right/middle-drag zoom for both
  magnitude and phase plots, with linked x-axis scaling.
- Added browser coverage for IIR wheel zoom, drag pan, reset zoom, stable plot
  height, and the existing pole/zero marker editing workflow.

### Mistake Prevention

- For plot interaction tests, prefer locator-relative actions or recompute the
  locator bounding box immediately before absolute `page.mouse` operations.
- When a graph has interactive overlays, attach navigation handling where all
  relevant plot layers can reach it, and explicitly skip marker/edit controls.

## 2026-07-12 Network Analyzer Migration And Browser Race Lessons

- Read the original `network_analyzer.py`, `na_widget.py`,
  `acquisition_module_widget.py`, `module_managers.py`, and IQ NA accumulator
  registers before implementation. The network analyzer sweeps an owned IQ,
  waits for its FPGA accumulator per point, reads `_nadata_total`, normalizes by
  averaging and drive amplitude, and corrects the IQ transfer function. It is
  not a scope/FFT workflow and must not reserve Scope.
- PyRPL managers choose the last free module first. Network analyzer therefore
  tries IQ2, IQ1, then IQ0 and releases only the IQ it acquired.
- A completed WebSocket scan initially produced a blank uPlot because its
  x-array had trailing NaN placeholders. uPlot requires finite monotonic x data;
  render only the contiguous acquired prefix.
- Initializing Split.js while a panel is hidden creates gutters with zero-based
  geometry and leaks hidden gutters into global selectors. Create the split
  lazily when the panel is visible, then measure plot frames.
- An old scope state event could overwrite a number input while the user was
  typing, causing blur to submit the stale value. Focused controls now retain
  the local edit until it commits.

## 2026-07-13 CurveDB And Curve Viewer Migration

- Original standalone PyRPL CurveDB stores each curve in
  `PYRPL_USER_DIR/curve/<pk>.dat` as a pickle containing
  `[pk, params, [x_values, y_values]]`. The web store reads and writes this
  exact structure, including complex y-values, instead of creating a web-only
  database format.
- Scope saves one record per active channel. Baseband Spectrum Analyzer saves
  active channel/cross records and stores values in `curve_unit` (`Vpk^2`), not
  whichever transformed display unit is visible. Network Analyzer saves its
  complex coherent response.
- Diff review found Spectrum trace averaging was applied after display-unit
  conversion. Original PyRPL averages linear spectrum values first. The browser
  now keeps a linear `Vpk^2` averaged frame, derives the displayed frame from
  it, and persists the linear frame directly.
- Curve Viewer parity includes the newest 100 primary keys, a selected curve
  plot, YAML parameter editing, Save Params, Delete Curve, and Refresh.
- A dynamically populated `<select size>` retained `selectedIndex = -1` even
  after options appeared. Explicitly select the newest primary key before
  loading the curve; do not assume the browser selects the first option.
- Browser coverage now verifies persistent Scope saving, complex magnitude and
  phase rendering, raw CurveDB compatibility, YAML edits, deletion, and stable
  three-pane Split.js layout.

## 2026-07-13 Sampler And AMS Migration

- Original `Sampler` and `AMS` have no `_gui_attributes`, `_setup_attributes`,
  or custom widgets. They are direct programmatic hardware services, so the web
  panel must not invent setup actions, ownership, or saved states for them.
- Sampler exposes one signed 14-bit read register for every `DSP_INPUTS` entry
  at `0x40300000 + 0x10 + signal_number * 0x10000`, normalized by `8191`.
  Preserve the original DSP input names and ordering.
- `Sampler.stats(signal, t)` repeatedly samples for a wall-clock duration and
  returns mean, standard deviation, maximum, and minimum. It is low-rate
  telemetry and belongs on an explicit refresh/statistics path, not a new
  continuous acquisition WebSocket.
- AMS uses PyRPL's non-linear 24-bit PWM encoding. Copy both the fractional
  bit-count conversion and saturation behavior exactly; a plain linear integer
  conversion is not compatible.
- Original PyRPL states that writes to AMS DAC0 and DAC1 have no effect. The web
  UI therefore shows DAC0/DAC1 as read-only and permits writes only to DAC2 and
  DAC3.
- Browser coverage verifies all 16 sampler signals, statistics, DAC read-only
  behavior, DAC2 write/readback, and bounded panel layout.

## 2026-07-13 IIR Plot And Measurement Parity

- Original IIR `tf_type` selects a specific `IirFilter` calculation stage:
  `continuous`, `discrete`, NumPy coefficients, rounded coefficients, or the
  final FPGA response. The web plot must use that stage, not a separate Bode
  approximation. PyRPL's stale `tf_coefficients` name maps to the implemented
  `tf_coefficients_numpy` method.
- `data_curve` is a CurveDB primary key. When selected, its frequencies become
  the plot x-axis and the UI can show the curve itself plus the curve multiplied
  by the selected IIR transfer stage. These are original IIR controls, not new
  acquisition features.
- `measure_transfer_function()` runs the Network Analyzer's saved
  `iir_measurement` state. The Network Analyzer's `signal()` is its temporarily
  owned IQ module, so the IIR input must be routed to that concrete IQ during
  the scan, then its prior input and the IQ setup/ownership must be restored.
- IIR measurement is a finite, potentially slow control action. FastAPI runs it
  in a worker thread so it does not block WebSocket and event processing.
- Hidden or unavailable graph traces cannot be returned as JSON `NaN`. Return
  `null` and convert it to `NaN` only in the TypeScript plotting boundary;
  converting `null` directly with `Float32Array.from` would draw a false zero
  line.
- IIR overflow is read-only FPGA status at DSP base `+ 0x108`. Preserve the
  original `OverflowProperty` branch behavior exactly, even though its first
  nonzero mask makes every nonzero value display `sum and internal saturation`.
- PyRPL designs IIR coefficients with `inputfilter=0`, then assigns the actual
  input filter to the model used for plotting. Omitting that second assignment
  makes the browser accept input-filter edits while drawing the wrong response.
- The plotted IIR stage must use `_IIRBITS`, `_IIRSHIFT`, and `_IIRSTAGES` read
  from the loaded FPGA, just like `_setup()`, rather than assuming bitfile
  defaults.
- Regression coverage now checks every transfer-stage option, CurveDB overlays,
  trace visibility, overflow decoding, finite measurement data, restored IIR
  routing, released IQ ownership, plot navigation, and bounded plot height.

## 2026-07-13 Scope Display And Acquisition-Control Parity

- Original Scope exposes `rolling_mode`, not a GUI `run_mode` selector. The
  web-only selector was removed and the PyRPL acquisition-widget state machine
  was restored: Run single/continuous, Pause, Resume single/continuous, Stop,
  `current_avg`, and saved `run_continuous` behavior.
- One intentional user-required difference is retained: after collecting
  `trace_average` frames, single mode enters `paused_single` and requires an
  explicit rearm. Original `AcquisitionModule._do_average_single_async()` ends
  in `stopped`; do not silently change the web latch behavior without revisiting
  that explicit oscilloscope requirement.
- Scope GUI/setup parity now includes `ch_math_active`, `math_formula`, and
  `xy_mode`. XY plots channel 2 against channel 1 and hides the normal time
  traces. Math is evaluated in the browser from `ch1`, `ch2`, and `times` so
  this PC-side PyRPL work does not move onto the Red Pitaya CPU.
- `expr-eval-fork` is pinned to `3.0.1`. It is browser-only JavaScript and adds
  no Python or native ARM runtime requirement. Member access, assignment,
  function definitions, comparisons, logical operators, and unknown variables
  are disabled. The compatibility layer accepts `np.` prefixes and Python
  exponent syntax for common scalar formulas. Arbitrary NumPy array operations
  remain an explicit parity gap.
- Original rolling mode is active only above 0.1 seconds, uses a
  `[-duration, 0]` x-axis, bypasses trace averaging, and disables trigger,
  threshold, hysteresis, and Run single. FPGA high-resolution `average` stays
  editable; it is a hardware decimation mode, not trace averaging.
- A setup change must restart the acquisition generation. Merely clearing a
  queued frame count allowed an in-flight frame from the old WebSocket to seed
  the new average and produced a false phase difference for identical inputs.
  Scope stream reconnects now use socket-identity checks so retired socket
  handlers cannot deliver data.
- Display-only XY/math changes initially called the averaging function again
  on the last frame. They now redraw the already averaged `displayedData`.
  Never let a visibility or presentation control mutate acquisition state.
- Scope frame runtime events initially reapplied full setup snapshots, and
  ownership release blindly enabled all inputs. Runtime events now update only
  running state/current average/owner, and ownership release reapplies rolling
  constraints. Keep setup events, runtime events, and temporary ownership
  enablement as separate concerns.
- Playwright's `toBeDisabled()` did not recognize a disabled `<fieldset>` even
  though its DOM property and descendant radio behavior were correct. Assert
  the fieldset's `disabled` attribute and use `toBeDisabled()` for its actual
  form controls.
- Regression coverage checks identical-input XY data, browser math formulas,
  single trace averaging and latch behavior, continuous pause/resume, original
  rolling restrictions/time axis, CSV data, plot interaction, and stable
  layout.

## 2026-07-13 Retired Scope Stream Consumer Regression

- The full browser suite found Scope single acquisition paused at backend
  average 3 while the active plot remained at average 2. A retired server-side
  Scope WebSocket loop had not yet observed the browser close and consumed the
  final frame, exactly like the earlier Spectrum failure.
- Socket identity checks in TypeScript protect the browser from stale incoming
  handlers, but cannot stop a stale server coroutine from reading shared
  hardware. Scope and Spectrum now both use server generation tokens checked
  before and after acquisition. REST or control-WebSocket start/resume actions
  invalidate old generations, and the active browser reconnects afterward.
- Invalidating on Pause or Stop was too broad: it retired the only active
  transport, while later setup edits expected that transport to continue.
  Generation changes belong to start/resume boundaries (and newly accepted
  sockets); pause and stop only change acquisition state.
- Apply this rule to every future stream that consumes a singleton instrument:
  browser close is advisory, while server-side generation or cancellation is
  the ownership boundary. Strategic multi-step browser tests must verify the
  active plot receives every frame in a finite averaged acquisition.

## 2026-07-13 Configuration Editor And CurveDB Backend Parity

- Original `PyrplConfig` is a branch-oriented YAML editor, not a generic JSON
  settings form. Its visible contract is `configfile`, module selection,
  Refresh, Save, and text. The web panel now follows that contract for the
  server-selected local file; known module branches reload setup attributes
  immediately after a validated save.
- Configuration branch input must parse to a YAML mapping. Invalid YAML and
  lists/scalars are rejected before touching memory or disk. Existing
  `WebConfig.save()` retains atomic temporary-file replacement.
- Desktop PyRPL allows editing `configfile` to instantiate a different
  `MemoryTree`. A remote browser must not choose arbitrary server paths, so the
  web panel displays the active path read-only; alternate config selection is
  done with `--config` when starting the server.
- Original CurveDB customization reads
  `global_config.general.curvedb`, imports that trusted local module, and uses
  its `CurveDB` class. The web server now adapts the same create/get/all-pks,
  save, and delete contract and keeps its existing JSON representation for real
  and complex curves. Missing or invalid custom modules fall back to the
  standalone PyRPL `.dat` backend, matching original behavior.
- CurveDB backend selection happens once when the session starts. Editing
  `global_config.yml` requires a server restart, just as original import-time
  selection does. Third-party backend ARM support remains the backend author's
  responsibility; the adapter itself adds only standard-library imports.
- The custom Lockbox audit found that arbitrary methods are not equivalent to
  descriptor metadata: examples access loops, samplers, `self.pyrpl.rp`, and a
  second Red Pitaya. A partial AST interpreter would invent semantics and hide
  failures. Keep this as an explicit trusted headless-plugin gap until a real
  runtime object contract is designed.
# 2026-07-13: ARM Packaging, Authentication, And CI

## Original problem found

- The nominal `web-redpitaya` extra still inherited Qt, pyqtgraph, Paramiko,
  SCP, and qasync from the project's base dependencies. It was therefore not a
  genuinely headless ARM installation.
- Vite built the current application into ignored `web/dist`, while wheel
  package data only contained the old `pyrpl_websocket/static` prototype. A
  source checkout worked, but an installed production wheel would serve stale
  frontend code.
- The old dependency audit only printed versions and could not reject an
  unsuitable ARMv7 stack.

## Implemented contract

- Base dependencies are now only NumPy and PyYAML. Desktop packages moved to
  `desktop` and the binding-specific Qt extras; existing `qt-*` installation
  commands still install the complete desktop stack.
- `web-redpitaya` pins FastAPI 0.115, Pydantic 1.10, minimal Uvicorn 0.30, and
  wsproto 1.2. This avoids Pydantic 2's Rust core and Uvicorn's optional native
  accelerators on 32-bit Zynq ARM.
- Vite now emits directly to `pyrpl_websocket/frontend`; package data and a
  wheel verification script ensure the built index, hashed assets, and console
  commands are present.
- `pyrpl-web-audit --strict-armv7` checks Python 3.10+, required packages,
  frontend assets, Pydantic major version, and forbidden accelerators.
- `PYRPL_WEB_TOKEN`/`--auth-token` enables constant-time bearer, query-token,
  and HttpOnly cookie authentication for all HTTP and WebSocket routes. Public
  settings redact the token. A non-loopback unauthenticated bind emits a clear
  warning.
- Added a systemd unit, environment template, ARM deployment/security guide,
  Vite development proxy, and CI jobs for frontend tests/build, backend tests,
  Playwright, wheel inspection, and ARMv7 dependency policy.

## Testing lesson

The full browser run initially failed after toggling IIR `plot_data` because the
test queried `/api/modules/iir/plot` immediately after `setChecked(false)`.
The DOM action had completed, but its asynchronous REST write and plot refresh
had not. This was a test race, not persisted CurveDB corruption. Wait for the
visible module status (`plot_data = false`) or another application-level
completion signal before asserting backend state after an asynchronous UI
control.

## Verification

- 64 backend tests pass through headless unittest discovery.
- 14 TypeScript/unit tests pass.
- The focused IIR Playwright workflow passes after synchronizing on status.
- A wheel built without build isolation contains the compiled frontend and
  both `pyrpl-web` and `pyrpl-web-audit` entry points.
