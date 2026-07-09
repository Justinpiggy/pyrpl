# Migration Knowledge Log

This file records project knowledge and migration lessons learned while planning
and implementing the PyRPL web-interface migration. Future work should update
this file whenever new architecture, protocol, performance, or tooling knowledge
is discovered.

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
