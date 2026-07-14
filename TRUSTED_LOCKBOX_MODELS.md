# Trusted Lockbox Models

The web server can execute server-local custom Lockbox models discovered in
`PYRPL_USER_DIR/lockbox`, matching PyRPL's model discovery location. These files
are trusted plugins: they run on the Red Pitaya with the web server process's
permissions. Models cannot be uploaded or edited from the browser.

## Supported Contract

- Legacy `pyrpl.software_modules.lockbox`, loop, module-manager, model, input,
  and output imports are replaced with a Qt-free compatibility API.
- Custom class inheritance, descriptor values, zero-argument `super()`, sibling
  helper modules, dynamic inputs/outputs, and methods listed in
  `_gui_attributes` are supported.
- Custom `expected_signal`, `expected_slope`, `is_locked`, `calibrate`, root
  actions, and stage `function_call` methods execute on the server.
- `self.inputs`, `self.outputs`, `self.sequence`, calibration data, sampler,
  `self.pyrpl.rp`, and ASG/PID/IQ/PWM/Scope/IIR/Trigger proxies are connected to
  the live `WebSession`. Hardware attribute assignments use the migrated
  register writers and therefore reach `monitor_server` and the FPGA.
- `asgs`, `pids`, `iqs`, and `scopes` provide `pop()` ownership. The Scope proxy
  supports setup, context management, saved states, `times`, and `single()`.
- Explicit `LockboxLoop`/`LockboxPlotLoop` objects and `ModuleProperty` loops run
  as server-owned daemon threads. They continue while browsers are disconnected
  and stop when the model changes or the server session closes. Plot-loop
  appends are retained in a headless in-memory buffer; they do not create a Qt
  window.

## Deliberate Boundaries

- Constructing another `Pyrpl(...)` instance from a plugin is rejected. A
  second Red Pitaya needs an explicit server-side service/configuration instead
  of an implicit desktop application inside the web server.
- Qt widgets, Qt signals, and pyqtgraph windows are not available. Browser UI
  comes from descriptor/schema metadata and `_gui_attributes`.
- The compatibility layer covers the migrated hardware and Lockbox object
  graph, not every private desktop-only `Module` implementation detail. An
  unsupported access raises an error rather than silently inventing behavior.

Plugin load failures return HTTP 400 and leave the previous Lockbox model
active. Because plugin code is trusted and unrestricted Python, review it like
any other code installed on the instrument.
