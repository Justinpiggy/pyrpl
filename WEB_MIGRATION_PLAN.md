# PyRPL Web Interface Migration Plan

Date: 2026-07-08

## Objective

Migrate PyRPL from a PyQt desktop GUI to a browser-based control and
visualization interface while preserving the existing Python control logic and
the existing Red Pitaya `monitor_server` protocol.

The new system should:

- provide a Python web server
- expose all Red Pitaya and PyRPL controls through a web page
- render oscilloscope and acquisition data with high performance in the browser
- keep compatibility with the existing C `monitor_server` running on the
  Red Pitaya
- preserve the existing Python hardware/software module model wherever possible

## Hard Boundaries

Do not modify:

- `pyrpl/fpga/`
- FPGA bitstreams, RTL, constraints, Vivado/Vitis scripts, or device-tree files
- `pyrpl/monitor_server/monitor_server.c`
- the wire protocol implemented by `monitor_server.c`

Allowed migration surface:

- Python application/server code
- Python client-side abstractions around `MonitorClient`
- module/attribute introspection
- configuration serialization
- browser UI code
- tests and documentation
- packaging/dependency configuration

## Current Architecture Summary

Current startup path:

1. `python -m pyrpl` enters through `pyrpl/__main__.py`.
2. `pyrpl/__init__.py` creates or reuses a Qt application.
3. `Pyrpl` in `pyrpl/pyrpl.py` loads YAML-backed configuration with
   `MemoryTree`.
4. `RedPitaya` in `pyrpl/redpitaya.py` starts SSH/client setup and creates
   hardware modules.
5. Hardware modules use `HardwareModule._reads()` and `_writes()`.
6. Those methods call `pyrpl/redpitaya_client.py::MonitorClient`.
7. Qt widgets in `pyrpl/widgets/` render controls and plots.

Current monitor-server protocol:

- `MonitorClient` opens a TCP socket to the Red Pitaya, default port `2222`.
- Reads send an 8-byte header beginning with `b"r"`.
- Writes send an 8-byte header beginning with `b"w"` plus `uint32` payload.
- Close sends an 8-byte header beginning with `b"c"`.
- The C server echoes the request header as an acknowledgement.
- Read payloads are returned as `uint32` values and converted by Python module
  descriptors into user-facing values.

This is already a useful seam: the migration should keep `MonitorClient` or a
compatible adapter as the only direct transport to the Red Pitaya.

## Target Architecture

```text
Browser UI
  |
  | HTTP: static assets, configuration, module metadata
  | WebSocket: control events, status updates, acquisition streams
  v
Python web server
  |
  | Web API layer
  | Module registry and schema layer
  | Acquisition stream manager
  | Existing PyRPL module/attribute layer
  v
RedPitaya Python object
  |
  | Existing MonitorClient protocol
  v
Red Pitaya monitor_server
  |
  v
FPGA registers and acquisition buffers
```

Recommended backend stack:

- FastAPI for HTTP and WebSocket routes, with Starlette underneath
- Uvicorn for ASGI serving, installed without the `standard` extra on Red
  Pitaya
- `wsproto` as the preferred first WebSocket protocol backend on Red Pitaya
- Pydantic models for API contracts, provided installation is verified on the
  target board
- existing `MonitorClient` for Red Pitaya transport compatibility
- optional worker thread or async executor for synchronous register I/O

Recommended frontend stack:

- TypeScript
- Vite
- a small state store for module state
- a workspace model for instrument panels, combined with Split.js-style
  splitter mechanics for resizable panes
- WebSocket client for live updates
- WebGL or OffscreenCanvas rendering for oscilloscope/acquisition traces
- binary WebSocket frames for high-rate numeric data

The frontend stack can be chosen later, but the API design should assume typed
browser clients and binary acquisition streams.

### Workspace and Multi-Instrument Layout

The web UI should support multiple instruments in one page without becoming a
desktop-style floating window manager. The preferred approach is:

- define a PyRPL-specific workspace model in TypeScript
- use tabsets for instrument panels
- use split nodes for horizontal/vertical panel stacking
- use Split.js, or the same focused splitter pattern, for drag-resizable pane
  handles and persisted split ratios
- keep instrument state separate from workspace layout state
- persist the workspace layout in browser local storage first, then add backend
  persistence once multi-client behavior is clear

Initial workspace shape:

```text
workspace
  tabset
    scope panel
```

Current implemented workspace behavior:

- Panels are defined through a TypeScript panel registry.
- The browser persists enabled panels, active panel, workspace layout mode, and
  split ratios in local storage.
- Supported layout modes are:
  - Tabs
  - Side by Side
  - Stacked
- Split.js handles both workspace-level panel resizing and the Scope panel's
  internal controls/plot split.
- Implemented panels are now Scope, ASG, Housekeeping, and Register Debug.
  Register Debug is for raw monitor-server-compatible register reads/writes and
  is disabled by default.
- ASG is backed by compatible ASG0/ASG1 FPGA register writes for waveform RAM,
  amplitude, offset, frequency, trigger source, direct output, start phase, and
  cycles per burst.
- Housekeeping is backed by compatible LED and expansion P/N direction/value
  registers.
- Workspace split persistence supports N visible panels, not just two, so ASG
  and Housekeeping can be shown alongside Scope/Register Debug.

Future target shape:

```text
workspace
  split row
    tabset
      scope panel
      spectrum analyzer panel
    split column
      tabset
        asg panel
        pid panel
      tabset
        register/debug panel
```

Panel enable/disable should be exposed through a compact menu/dropdown similar
in spirit to PyRPL's menu bar. Disabling a panel removes it from the visible
workspace and should stop panel-local streams when appropriate. Re-enabling a
panel restores its saved panel state.

### Remaining Hardware Module Batches

Recommended migration order after Scope, ASG, and Housekeeping:

1. PID and PWM: both share the `DspModule` input/output-direct register model,
   and PID adds fixed-point gain/setpoint/limit registers.
2. IQ and Trig: both inherit the filter/DSP module structure and need careful
   migration of frequency/phase/gain and input filter controls.
3. IIR: migrate after PID/IQ because its coefficient/filter design surface is
   larger and should likely get a dedicated browser editor.
4. Sampler/AMS/status views: expose read-oriented telemetry and ADC/DAC status
   once the main control modules are stable.
5. Software modules such as spectrum analyzer, network analyzer, and lockbox:
   build as panels on top of the hardware module/event/acquisition APIs rather
   than as raw register panels.

## Red Pitaya ARM Deployment Constraints

The web stack must be able to run on the Red Pitaya's ARM CPU with Python 3.10.
For dependency choices, assume the common Zynq-7000 target is 32-bit ARMv7
unless the actual device reports otherwise.

Before adding a runtime dependency, verify:

- Python 3.10 support
- Linux ARMv7/`armv7l` wheel availability, or pure-Python `py3-none-any` wheel
- no Rust/C/C++ build requirement on the Red Pitaya during normal install
- no dependency on `uvloop`, `httptools`, `watchfiles`, or other optional
  compiled accelerators unless explicitly marked as optional
- acceptable memory and CPU overhead on the board

Recommended Red Pitaya runtime dependency policy:

- Use plain `uvicorn`, not `uvicorn[standard]`.
- Use `uvicorn --ws wsproto` for the first on-board implementation.
- Add `wsproto` explicitly because it publishes a pure-Python wheel.
- Allow `websockets` as an alternative because it publishes a pure-Python
  `py3-none-any` wheel.
- Treat `picows`, `uvloop`, `httptools`, `watchfiles`, and `aiofastnet` as
  optional accelerators only.
- Prefer installing and testing on the real Red Pitaya before committing any
  package to the default `web` extra.

Suggested initial package set for on-board testing:

```text
fastapi
uvicorn
wsproto
```

If FastAPI/Pydantic creates install or runtime pressure on the board, the
fallback is Starlette plus handwritten lightweight validation. Starlette keeps
the same ASGI/WebSocket shape while reducing dependency weight.

### WebSocket Backend Choice

Decision: start with FastAPI/Starlette WebSocket endpoints served by Uvicorn
with `--ws wsproto`.

Reasons:

- It stays inside the ASGI model used by FastAPI.
- It avoids `uvicorn[standard]` compiled extras.
- `wsproto` is pure Python and architecture-independent.
- It is good enough for the control/status WebSocket path.
- High-rate scope payload efficiency should mainly come from binary frames,
  batching, frame dropping, and browser-side WebGL rendering, not from choosing
  the most optimized Python WebSocket parser first.

`picows` is worth tracking, but should not be the primary on-board backend yet:

- It is a fast asyncio WebSocket library with a C/Cython implementation.
- Current PyPI metadata shows Python 3.10 support and ARM64 Linux wheels.
- The Red Pitaya Zynq-7000 target is commonly 32-bit ARMv7, and the currently
  visible wheel list does not show CPython 3.10 ARMv7 Linux wheels.
- Building C/Cython extensions on the board is exactly the kind of deployment
  risk this migration should avoid.
- It is not the normal Uvicorn ASGI WebSocket backend, so using it would likely
  mean a separate custom WebSocket server path or deeper integration work.

Recommended use of `picows`:

- optional benchmark dependency on developer machines
- optional accelerator when running the web server on x86_64 or ARM64 systems
- possible future dedicated high-throughput waveform stream server if
  Uvicorn/ASGI becomes the measured bottleneck

Do not add `picows` to the default Red Pitaya install path until it is tested
on the actual board architecture.

## Migration Strategy

Do not attempt a one-shot rewrite. Build a parallel web interface beside the
existing Qt GUI, then retire Qt widgets gradually once web parity is proven.

### Phase 1: Establish a Headless PyRPL Runtime

Goal: instantiate and control PyRPL modules without showing Qt widgets.

Tasks:

- Add a web entry point, for example `python -m pyrpl.web`.
- Ensure the server can create `Pyrpl(config=..., hostname=..., gui=False)`.
- Audit imports that currently force Qt initialization.
- Keep Qt imports available for the existing GUI, but isolate web runtime from
  widget creation.
- Confirm fake hardware mode works through the web runtime with
  `hostname=_FAKE_`.
- Confirm real hardware still uses `MonitorClient` unchanged.

Expected output:

- A Python server process can create a `Pyrpl` instance without opening a PyQt
  window.
- Existing command-line/Qt behavior still works.

Primary files to study or change:

- `pyrpl/__init__.py`
- `pyrpl/pyrpl.py`
- `pyrpl/redpitaya.py`
- new `pyrpl/web/` package

Risk:

- `pyrpl/__init__.py` currently creates a `QApplication` during package import.
  Web mode may need a cleaner import path or lazy Qt initialization.

### Phase 2: Build a Module Metadata and Control API

Goal: expose existing modules and attributes as web-controllable resources.

Use the existing descriptor system instead of manually duplicating every Qt
control. The descriptors in `pyrpl/attributes.py` already know how to:

- validate and normalize values
- set values on modules
- read values back
- save setup attributes to YAML config
- expose possible option lists for select/filter-style controls

Initial REST API:

- `GET /api/session`
- `GET /api/modules`
- `GET /api/modules/{module_name}`
- `GET /api/modules/{module_name}/attributes`
- `GET /api/modules/{module_name}/attributes/{attribute_name}`
- `PUT /api/modules/{module_name}/attributes/{attribute_name}`
- `POST /api/modules/{module_name}/setup`
- `POST /api/modules/{module_name}/actions/{action_name}`
- `GET /api/modules/{module_name}/states`
- `POST /api/modules/{module_name}/states/{state_name}/load`
- `POST /api/modules/{module_name}/states/{state_name}/save`
- `DELETE /api/modules/{module_name}/states/{state_name}`

Initial WebSocket API:

- `/ws/events` for attribute updates, ownership changes, log messages, and
  errors
- `/ws/acquisition/{module_name}` for live acquisition data

Expected output:

- Browser can list available modules.
- Browser can list controls for a module.
- Browser can read and set simple attributes.
- Browser can call `setup`, `single_async`, `continuous`, `pause`, `stop`, and
  `save_curve` on acquisition modules.

Primary files to study or change:

- `pyrpl/modules.py`
- `pyrpl/attributes.py`
- `pyrpl/module_attributes.py`
- `pyrpl/acquisition_module.py`
- `pyrpl/software_modules/module_managers.py`
- new `pyrpl/web/api.py`
- new `pyrpl/web/schema.py`

Risk:

- Some attributes are Python properties rather than `BaseAttribute`
  descriptors. The API should support both descriptor-backed controls and
  explicit module methods.

### Phase 3: Replace Qt Signals With Web Events

Goal: mirror the current Qt signal behavior over WebSocket.

Current modules use `SignalLauncher`, a Qt `QObject`, to notify widgets about:

- attribute updates
- option changes
- filter option refreshes
- ownership changes
- acquisition data display
- acquisition scan progress
- unit changes

Migration options:

1. Keep Qt signal launchers internally and attach bridge subscribers.
2. Add a framework-neutral event bus and adapt Qt widgets plus web clients to
   it.

Recommended path:

- Start with a bridge layer that subscribes to existing module signal launchers.
- Once behavior is proven, introduce a framework-neutral event bus under the
  module layer.
- Keep Qt compatibility during migration.

Expected output:

- Changing an attribute in Python broadcasts a web event.
- Changing an attribute in the browser updates Python, persists through the
  existing config logic, and broadcasts the result.
- Ownership changes and module running states appear live in the browser.

Primary files to study or change:

- `pyrpl/modules.py`
- `pyrpl/acquisition_module.py`
- `pyrpl/widgets/module_widgets/base_module_widget.py`
- new `pyrpl/web/events.py`

Risk:

- Qt signal classes currently come from `qtpy`. A truly headless server may
  eventually need these signals replaced, but this can be staged after a bridge
  works.

### Phase 4: High-Performance Oscilloscope and Acquisition Streaming

Goal: make browser plotting at least as responsive as the PyQt/pyqtgraph scope
for the real acquisition sizes and update rates.

Current scope facts:

- Scope has two hardware channels.
- Each channel has `2**14` samples.
- Raw channel buffers are read from FPGA memory through `MonitorClient`.
- The module normalizes data to Python floats and computes a matching time
  axis.
- Existing GUI receives arrays through acquisition module display signals.

Recommended streaming design:

- Use WebSocket binary frames for numeric trace data.
- Avoid JSON for full waveform payloads.
- Use a compact frame envelope:
  - stream id
  - module name
  - sequence number
  - timestamp
  - sample count
  - channel mask
  - dtype
  - x-axis mode
  - binary payload
- Start with `float32` payloads for simplicity.
- Later optimize to `int16` raw ADC-like payloads plus scale/offset metadata
  when bandwidth or latency requires it.
- Keep control messages as JSON.

Frontend rendering design:

- Use WebGL for line rendering.
- Move parsing and buffer management into a Web Worker.
- Use OffscreenCanvas where browser support is acceptable.
- Use GPU buffers that are updated in place rather than rebuilding DOM/SVG
  paths.
- Decouple acquisition rate from render rate. The browser should render at
  display refresh rate or lower, dropping stale frames when needed.
- Support both time-series mode and XY mode.
- Support channel visibility and math traces. For safety, migrate channel math
  from Python `eval`/Qt behavior into a controlled expression engine later.

Performance targets:

- 16k samples per channel at interactive frame rates
- stable continuous acquisition without UI blocking
- bounded memory use when a browser tab is left open
- graceful degradation over slower networks

Expected output:

- Browser scope displays live traces.
- Continuous mode can stream without accumulating unbounded frames.
- Single acquisitions return complete data and metadata.
- Network analyzer and spectrum analyzer can reuse the same acquisition stream
  plumbing.

Primary files to study or change:

- `pyrpl/hardware_modules/scope.py`
- `pyrpl/acquisition_module.py`
- `pyrpl/software_modules/network_analyzer.py`
- `pyrpl/software_modules/spectrum_analyzer.py`
- new `pyrpl/web/streams.py`
- frontend plot renderer

Risk:

- Python register I/O is synchronous. The web server must isolate blocking
  hardware reads from the ASGI event loop with a worker thread, executor, or
  dedicated acquisition task.

### Phase 5: Implement Web Controls Module by Module

Goal: migrate GUI control coverage in practical slices.

Suggested order:

1. Connection/session status
2. Housekeeping and sampler
3. Scope
4. ASG
5. PID
6. IQ
7. PWM and trigger
8. IIR
9. Network analyzer
10. Spectrum analyzer
11. Curve viewer
12. Pyrpl config editor
13. Lockbox

Reasoning:

- Scope validates the hardest rendering path early.
- ASG/PID/IQ validate control workflows and signal routing.
- Network/spectrum analyzer reuse acquisition stream infrastructure.
- Lockbox should come after the module/event/control foundation is stable.

Expected output:

- A usable web page replaces common PyQt workflows incrementally.
- Existing PyQt GUI can remain available until web parity is sufficient.

### Phase 6: Configuration, State, and Multi-Client Behavior

Goal: make browser control safe and predictable.

Tasks:

- Preserve `MemoryTree` YAML persistence.
- Expose module state load/save/erase operations.
- Add API-level validation errors with clear messages.
- Decide session semantics:
  - single active controlling browser, with read-only observers; or
  - multiple writers with last-write-wins; or
  - per-module locks matching existing ownership semantics
- Surface module ownership in the UI.
- Add audit/log stream for control changes.

Recommended initial policy:

- one write-capable session per PyRPL server
- optional read-only observers
- preserve existing module ownership rules underneath

Risk:

- Browser multi-client behavior can create surprising hardware state changes.
  Make write ownership explicit before allowing multiple write clients.

### Phase 7: Testing

Goal: prove protocol compatibility and UI/backend behavior without requiring
hardware for every test.

Backend tests:

- API schema generation using fake Red Pitaya mode
- attribute read/write round trips
- setup/action endpoints
- state save/load endpoints
- WebSocket event broadcasts
- acquisition stream framing
- binary frame decoding
- monitor protocol compatibility tests using `DummyClient`

Hardware tests:

- smoke test connection to real Red Pitaya
- read/write selected registers
- scope single acquisition
- scope continuous acquisition
- ASG-to-scope loopback if hardware setup supports it
- network analyzer smoke test if hardware setup supports it

Frontend tests:

- module panel renders from schema
- attribute widgets send correct API messages
- WebSocket reconnect behavior
- plot renderer handles 16k, 64k, and dropped-frame scenarios
- mobile/tablet layout if needed

Recommended tools:

- pytest for backend
- pytest-asyncio or anyio for WebSocket tests
- Playwright for browser integration
- synthetic binary trace generator for renderer performance tests

### Phase 8: Packaging and Deployment

Goal: make the web interface easy to run locally and on lab machines.

Tasks:

- Add web optional dependency group, for example `.[web]`.
- Add a separate on-board optional dependency group, for example
  `.[web-redpitaya]`, that avoids compiled accelerators.
- Add a server command:
  - `python -m pyrpl.web config=my_config hostname=...`
  - or console script `pyrpl-web`
- Serve built static frontend assets from the Python server.
- Support development mode with Vite dev server proxying API/WebSocket routes.
- Support production mode with packaged static assets.
- Add docs for LAN security and browser access.
- Add an ARM dependency audit script that prints Python version, platform,
  machine, libc info if available, and installed web package versions.
- Test install on the actual Red Pitaya before making any package part of the
  default on-board path.

Security baseline:

- Bind to `127.0.0.1` by default.
- Require explicit `--host 0.0.0.0` for LAN access.
- Add optional token/password authentication before recommending LAN use.
- Warn that hardware control endpoints can change physical outputs.

## Proposed Repository Additions

```text
pyrpl/web/
  __init__.py
  __main__.py
  app.py
  api.py
  events.py
  schema.py
  streams.py
  session.py
  serialization.py
  dependency_audit.py

web/
  package.json
  vite.config.ts
  src/
    main.ts
    api/
    components/
    modules/
    renderers/
    workers/
```

The exact frontend directory can change, but keeping browser code outside the
Python package during development is usually simpler. Built assets can later be
included as package data.

## API Design Principles

- Treat Python modules as the source of truth.
- Generate as much UI schema as possible from module descriptors.
- Keep high-rate waveform data out of JSON.
- Keep hardware I/O behind `MonitorClient` or a compatible adapter.
- Make state changes explicit and logged.
- Keep PyQt available during migration until web parity is proven.
- Do not duplicate FPGA register conversion logic in TypeScript; expose
  user-facing values from Python unless raw streaming is intentionally used.

## Milestones

### Milestone 1: Web Server Skeleton

- Web server starts in fake hardware mode.
- `GET /api/modules` returns hardware and software modules.
- `GET /api/modules/scope/attributes` returns generated controls.
- Simple attribute read/write works.
- The same server dependencies install on Python 3.10 ARMv7 Red Pitaya without
  compiling native extensions.

### Milestone 2: Scope Prototype

- Scope panel appears in browser.
- Scope plot supports easy user zoom, reset, and pan.
- User can configure inputs, trigger source, duration, average, and run mode.
- Single acquisition renders in browser.
- Continuous acquisition streams live data.

### Milestone 3: General Module Controls

- Generic controls work for Bool, Int, Float, Complex, String, Select, and
  Filter-style attributes.
- Module state load/save/erase works.
- ASG, PID, IQ, and Scope are usable from browser.

### Milestone 4: Acquisition Instruments

- Network analyzer works in browser.
- Spectrum analyzer works in browser.
- Curve saving and curve viewer are usable.

### Milestone 5: Lockbox Workflows

- Lockbox inputs, outputs, stages, calibration, sweep, lock, relock, and status
  workflows are available in the browser.
- Ownership and reserved hardware modules are clearly shown.

### Milestone 6: Web Interface Becomes Primary

- Documentation points users to the web interface.
- PyQt GUI remains available as legacy/developer fallback.
- CI covers backend API and frontend renderer smoke tests.

## Open Design Questions

- Should the first web backend still import `qtpy`, or should the module layer
  be refactored to make Qt completely optional?
- Which frontend framework, if any, should be used?
- Should Red Pitaya run the web server directly, or should the first production
  mode run the web server on a PC while keeping the Red Pitaya as
  `monitor_server` plus FPGA?
- Is LAN access required, or is localhost plus SSH tunneling sufficient for
  early versions?
- Is browser-side channel math required at parity, or can it be deferred?
- Should raw scope streaming use `float32` initially or optimized `int16` plus
  scale metadata from the start?
- What is the target continuous scope frame rate on real lab networks?
- Should multiple browser clients be supported in the first release?
- What architecture does the target Red Pitaya image report:
  `armv7l`, `aarch64`, or something else?

## Plotting Direction

The built-in static page has lightweight canvas zoom and pan so the prototype is
usable immediately without adding browser build requirements. This should be
treated as a bridge, not the final oscilloscope renderer.

For the TypeScript frontend, prefer an open-source plotting library with proven
large time-series performance and built-in scale management. `uPlot` is the
current leading candidate because it is small, canvas-based, and designed for
fast oscilloscope-like traces. The frontend should only keep custom code around
Red Pitaya-specific binary frame decoding, channel scaling, and transport.

## First Implementation Slice

The smallest valuable slice is:

1. Add `pyrpl/web/` with a server entry point.
2. Start `Pyrpl(..., gui=False)` in fake hardware mode.
3. Add module listing and generic attribute schema endpoints.
4. Add one control endpoint for setting an attribute.
5. Add one WebSocket stream for scope single acquisition.
6. Add a minimal browser page with scope controls and WebGL/canvas plotting.

This proves the full vertical path without touching FPGA firmware or
`monitor_server.c`.

## Non-Goals

- Rewriting FPGA firmware.
- Changing the Red Pitaya monitor server protocol.
- Changing `monitor_server.c`.
- Replacing all Python module logic with JavaScript.
- Reimplementing register conversion logic in the browser.
- Removing the PyQt GUI before web parity exists.
