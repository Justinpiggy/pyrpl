HTTP API and PC Python client
=============================

.. toctree::
   :maxdepth: 1

   http_api_catalog

The deployed web server already exposes HTTP endpoints for measurement data,
status, and control. A browser is not required. This API talks to the same
hardware session as the web UI; it does not create a second instrument session.
The PC client in ``pyrpl_websocket/http_client.py`` uses these existing endpoints,
so it works with the current deployment without a server update.

Connection and installation
---------------------------

The deployment script serves HTTP at ``http://10.0.5.118:8801`` by default.
Use the web-server port, not SSH port 22 or FPGA monitor port 2222.
The standalone server CLI defaults to port 8000; check its startup command.

From a local checkout on a PC, install the Python package::

    python -m pip install .

The client itself needs only Python 3.8+ and the standard library. It does not
import Qt, NumPy, FastAPI, or the legacy desktop application. Alternatively,
copy just ``pyrpl_websocket/http_client.py`` to your PC and import from
``http_client`` instead of ``pyrpl_websocket.http_client``. Do not install a
desktop or web extra merely to use the client. With Anaconda, run these commands
inside your chosen environment (for this workspace, ``conda activate pyrpl-env``).

Read status and a trace::

    from pyrpl_websocket.http_client import RedPitayaClient

    rp = RedPitayaClient("10.0.5.118")
    print(rp.health()["ok"])
    print(rp.lock_status())   # {"current_state": "unlock", "lock_status": False}
    print(rp.module_state("scope")["state"])
    frame = rp.scope_frame()
    if frame is not None:
        print(frame.sequence, frame.sample_count)
        ch1, ch2 = frame.channels    # tuples of voltage samples
        print(ch1[:5], ch2[:5])

Equivalent simple HTTP requests (use ``curl.exe`` in Windows PowerShell)::

    curl http://10.0.5.118:8801/api/health
    curl http://10.0.5.118:8801/api/lockbox
    curl http://10.0.5.118:8801/api/modules/scope
    curl "http://10.0.5.118:8801/api/scope/frame?samples=1024" -o scope.bin

Interactive request schemas are also available at ``/docs`` and ``/redoc``;
``/openapi.json`` is the machine-readable request schema. Most response bodies
are dynamic dictionaries, so use this reference and :doc:`http_api_catalog`
for their shapes. The catalog lists every built-in module's attributes, allowed
values, actions, and an example state, plus each built-in Lockbox model.

Authentication and controller ownership
----------------------------------------

If the server was started with an authentication token, pass
``Authorization: Bearer TOKEN`` on every request. In Python use
``RedPitayaClient(url, token=token)``. This is separate from SSH credentials.
Authentication is disabled unless configured. The server also accepts its browser
cookie and ``?token=...``; the Python client uses the header only.

Use a stable ``X-Pyrpl-Client-Id`` header (1-128 characters) and optionally
``X-Pyrpl-Client-Label``. Each client instance generates its own ID, reused on
all its calls. Without an ID/cookie, the server identifies callers by source IP,
so independent scripts on the same PC would share ownership.

In the default ``single-writer`` policy, reads are available to observers.
All POST/PUT/PATCH/DELETE requests require control except ``/api/control/*``,
``/api/register/read``, and ``/api/sampler/stats``. An unowned lease is claimed
implicitly by the first write. Another controller causes HTTP 409; the Python
client never takes over automatically. Module ownership is separate: e.g. a PID
owned by Lockbox can reject manual changes even if you own the controller lease.

Claim explicitly for a sequence of operations::

    with rp.control():                 # claim, heartbeat, finally release
        result = rp.set("scope", "threshold", 0.0)
        print(result["value"])         # actual accepted/quantized value
        rp.action("scope", "continuous")
        previous = rp.scope_frame()
        fresh = rp.wait_scope_frame(after=previous, timeout=5)
        print(fresh.channels[0][:10])
        rp.action("scope", "stop")

``rp.control(force=True)`` explicitly transfers another client's lease.
The context renews at approximately one third of the reported lease duration
(default lease: 30 seconds). ``keep_alive=False`` disables renewal. Outside a
context, use ``claim_control()``, ``heartbeat()``, and ``release_control()``.
Writes renew ownership; reads do not. Release and lease expiry do **not** stop
acquisition, unlock Lockbox, reset outputs, or undo settings. Call the appropriate
instrument action explicitly. The context does not roll back partial operations.

Lockbox example::

    print(rp.lock_status())             # cached monitor result, read-only
    print(rp.lockbox_actions())         # discover supported model actions
    with rp.control():
        rp.set_stage(0, "setpoint", 0.0)
        rp.lockbox_action("lock")      # starts the configured stage sequence
        # Observe rp.lock_status(); action completion need not mean lock acquired.
        rp.lockbox_action("unlock")    # explicitly stop feedback

These control examples intentionally change hardware when run against a real
board. The supplied ``examples/http_client_status.py`` only reads by default.
For an interactive walkthrough, open ``examples/http_control_demo.ipynb`` in
Jupyter. It includes Anaconda setup, single-shot Scope and Spectrum acquisition,
plots and CSV export, parameter discovery, and an opt-in Lockbox configuration
and locking example that finishes by unlocking.

HTTP conventions and errors
----------------------------

Every success below is HTTP 200 except an unavailable measurement (204, empty
body). JSON uses UTF-8 and ``application/json``. POST/PUT JSON bodies need
``Content-Type: application/json``. Bodyless actions do not require a body.
Path placeholders are URL-encoded names; a stage index is zero-based and curve
``pk`` is an integer. Use names without slashes for saved setups.

.. list-table:: Common error responses
   :header-rows: 1
   :widths: 12 36 52

   * - Status
     - Meaning
     - Body
   * - 400
     - Invalid value, action parameters, or resource conflict
     - ``{"detail": "reason"}``
   * - 401
     - Missing/invalid HTTP token
     - ``{"detail": "Authentication required"}``
   * - 404
     - Unknown module, attribute, action, curve, or setup
     - ``{"detail": "reason"}``
   * - 409
     - Controller conflict, or configuration unavailable
     - ``{"detail": "reason"}``; middleware conflicts also include ``control``
   * - 422
     - Request/schema validation failed
     - ``{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}``; some endpoints use a detail string
   * - 500
     - Unhandled server/hardware failure
     - May be plain text; do not assume JSON

The client raises ``APIError`` for non-success HTTP responses. Inspect
``status``, ``detail``, ``payload``, ``method``, and ``url``. Connection failures
raise ``TransportError``; malformed responses raise ``ProtocolError``.
``wait_scope_frame`` raises ``TimeoutError`` when its polling deadline expires
(a per-request network timeout is ``TransportError``).
Losing a context's lease raises ``ControlLostError`` and blocks subsequent writes
until control is claimed again. Errors inside the context are preserved even if
release fails. The client follows no redirects and retries no requests; a write
that times out may already have taken effect. Re-read state before deciding to
repeat it. A class/model change can alter attribute names, options, and actions.

The complete constructor is ``RedPitayaClient(address, port=8801, token=None,
timeout=10.0, client_id=None, label="Python client")``; all arguments after
address are keyword-only. A full HTTP(S) URL retains its explicit port and optional
reverse-proxy path prefix. Bare hostnames use port 8801. Timeout is in seconds
for socket operations, not a guaranteed overall transaction deadline. Calls return
complete server envelopes, except ``lock_status()`` extracts ``state`` and
``scope_frame()``/``wait_scope_frame()`` return decoded ScopeFrame objects.
``request(method, path, params=None, data=None, raw=False, timeout=None)`` is the
generic escape hatch; arguments after path are keyword-only. It returns JSON,
bytes with raw=True, or None for HTTP 204. The client does not use environment
HTTP proxies, browser cookies, or automatic redirect handling.

System, control, and discovery endpoints
----------------------------------------

``Control`` below means this JSON object::

    {"policy": "single-writer", "role": "controller",
     "controller": {"id": "python-...", "label": "Python client"},
     "lease_seconds": 30.0, "lease_remaining": 29.9}

``role`` is ``controller``, ``observer``, or ``shared``. With no owner,
``controller`` is null and remaining is 0; shared mode has null remaining.

.. list-table:: Complete system and ownership commands
   :header-rows: 1

   * - Method and path
     - Input
     - Expected response / Python method
   * - GET /api/health
     - None
     - ``{"ok": true, "settings": {...}}``; ``health()``
   * - GET /api/session
     - None
     - System snapshot described below; ``session()``
   * - GET /api/control
     - Client ID header
     - Control; ``control_status()``
   * - GET /api/control/audit
     - ``limit=100`` query; bounded to 1-500 records
     - ``{"records": [...]}``; ``control_audit(limit=100)``
   * - POST /api/control/claim
     - ``{"label": "my script", "force": false}``
     - Control; ``claim_control(force=False)``
   * - POST /api/control/heartbeat
     - No body
     - Control (check role; this does not claim an unowned lease); ``heartbeat()``
   * - POST /api/control/release
     - No body
     - Control; only releases this client's lease; ``release_control()``
   * - GET /api/modules
     - None
     - ``{"modules": [{"name": "scope", ...}, ...]}``; ``modules()``
   * - GET /api/assets
     - None
     - Server paths, ``exists`` boolean map, and ``note``; ``assets()``

``settings`` includes ``hostname``, monitor ``port``, ``frequency_correction``,
``bind_host``, ``bind_port``, ``scope_interval``, ``state_file``, ``config``,
``source``, ``curve_dir``, ``control_policy``, ``control_lease_seconds``, and
``auth_enabled``. It never includes the token. ``ok`` is a service liveness flag,
not proof that a trigger occurred or a feedback loop is locked.

``session()`` returns ``settings``, ``fake``, ``reads``, ``writes``, module-state
objects named ``scope``, ``asg0``, ``asg1``, ``hk``, ``sampler``, ``ams``, ``pid0``
through ``pid2``, ``iq0`` through ``iq2``, ``iir``, ``trig``, ``pwm0``, ``pwm1``,
``spectrumanalyzer``, ``networkanalyzer``, the complete ``lockbox`` schema,
``owners`` (module-to-owner map), ``config_file``, ``curve_backend``, and
``control``. It contains settings/status, not waveform arrays. It is not an
atomic multi-instrument hardware measurement. Audit records contain ``sequence``,
UTC ``timestamp``, ``client_id``, ``operation``, ``target``, ``detail``, and ``ok``.

Instrument endpoints
--------------------

Use ``/api/modules`` and :doc:`http_api_catalog` for available module names.
Attributes/actions are discovered dynamically; do not assume every field in a
state is writable. ``attributes`` describes types, current ``value``, options,
and optional bounds/steps. ``actions`` contains ``name``, ``label``, and, where
provided, ``description``. Frequency, time, and voltage quantities use Hz, seconds,
and volts unless explicitly labeled otherwise. Numeric writes may be quantized;
the returned ``value`` is authoritative.

.. list-table:: Generic instrument commands
   :header-rows: 1

   * - Method and path
     - Body / query
     - Expected response / Python method
   * - GET /api/modules/{module_name}
     - None
     - ``{"module": "scope", "state": {...}}``; ``module_state(module)``
   * - GET /api/modules/{module_name}/attributes
     - None
     - ``{"module": "scope", "attributes": [...]}``; ``attributes(module)``
   * - GET /api/modules/{module_name}/actions
     - None
     - ``{"module": "scope", "actions": [...]}``; ``actions(module)``
   * - GET /api/modules/{module_name}/attributes/{attribute}
     - None
     - ``{"module": "scope", "attribute": "threshold", "value": 0.0}``; ``get(module, attribute)``
   * - POST /api/modules/{module_name}/attributes/{attribute}
     - ``{"value": 0.0}``
     - Same envelope with accepted value; ``set(module, attribute, value)``
   * - POST /api/modules/{module_name}/actions/{action}
     - No body
     - ``{"module": "scope", "action": "stop", "state": {...}}``; ``action(module, action)``
   * - GET /api/modules/{module_name}/states
     - None
     - ``{"module": "scope", "states": [{"name": "saved", "state": {...}}]}``; ``states(module)``
   * - POST /api/modules/{module_name}/states/{state_name}/save
     - No body
     - ``{"module": "scope", "state": {"name": "saved", "state": {...}}, "states": [...]}``; ``save_state(module, name)``
   * - POST /api/modules/{module_name}/states/{state_name}/load
     - No body
     - ``{"module": "scope", "state": {...}, "states": [...]}``; state is the resulting live module state; ``load_state(module, name)``
   * - DELETE /api/modules/{module_name}/states/{state_name}
     - No body
     - ``{"module": "scope", "state": {"name": "saved", "state": {...}}, "states": [...]}``; includes the removed setup; ``delete_state(module, name)``
   * - POST /api/sampler/stats
     - ``{"signal": "in1", "duration": 0.01}``; duration 0-10 s
     - Statistics object; ``sampler_stats(signal="in1", duration=0.01)``
   * - GET /api/modules/iir/plot
     - Query options below
     - IIR plot object; ``iir_plot(**options)``

Acquisition actions include ``single``, ``continuous``, ``pause``, ``stop``,
``resume_single``, and ``resume_continuous`` on the acquisition modules; check
their action lists for additional module-specific commands. ``running_state``
and ``current_avg`` describe progress. Starting is asynchronous: a successful
action response does not guarantee a new trace is ready. Acquisition is shared
with the browser and can continue without a connected browser.

Sampler statistics contain ``signal``, ``duration``, ``count``, ``mean``,
``stddev``, ``min``, and ``max``. This read-only POST can take the requested
sampling time; choose a longer client timeout for long durations.

IIR query options are ``points=1000``, optional ``tf_type``, ``data_curve``,
``plot_data``, ``plot_data_times_filter``, and ``plot_measurement``. Booleans are
``true``/``false``. Returned fields include frequency ``x``, ``magnitude`` (dB),
``phase`` (degrees), auxiliary plot arrays, coefficients, and view/settings
metadata. The complete example response is in :doc:`http_api_catalog`.

Scope and Spectrum data
-----------------------

.. list-table:: HTTP measurement snapshots
   :header-rows: 1

   * - Method and path
     - Query
     - Expected response / Python method
   * - GET /api/scope/frame
     - ``samples=16384``; clamped to 1-16384
     - PWS1 binary frame, or 204; ``scope_frame(samples=16384)`` decodes it
   * - GET /api/spectrumanalyzer/frame
     - ``window=blackman``; discover windows from Spectrum attributes
     - Spectrum JSON below, or 204; ``spectrum_frame(window="blackman")``

These endpoints return the latest **cached shared** frame. They do not arm the
Scope or start Spectrum. A stopped/paused instrument may return its last trace;
204 means no cached frame exists. Compare sequence and timestamp for freshness;
sequence numbers can restart with the service. Settings changes and cached data
are not an atomic pair. ``wait_scope_frame(after=frame, timeout=5)`` waits for a
different frame without starting acquisition. Shared trace averaging is already
applied. Reducing Scope samples downsamples the complete capture span rather
than shortening the hardware capture. Scope frame timing follows the server's
polling interval, trigger availability, capture duration, and processing load.

PWS1 binary layout (all multibyte fields little-endian):

.. list-table:: Scope header and payload
   :header-rows: 1

   * - Byte offset
     - Type
     - Meaning
   * - 0
     - 4 bytes
     - ASCII ``PWS1``
   * - 4
     - uint16
     - Version 1
   * - 6
     - uint16
     - Channel count (currently 2)
   * - 8
     - uint32
     - Samples per channel
   * - 12
     - uint64
     - Server frame timestamp, Unix nanoseconds (zero for fake hardware)
   * - 20
     - uint32
     - Sequence number
   * - 24
     - float32 array
     - Interleaved CH1[0], CH2[0], CH1[1], CH2[1], ... in volts

Total size is ``24 + 4 * samples * channels`` bytes. Rolling traces may contain
NaN for data overwritten during download. The timestamp is not the hardware
trigger time. This format contains neither a time axis nor capture settings.
The web UI additionally builds its time axis and applies display trigger-time
alignment; the client returns the sampled voltages without reproducing browser
zoom, math, XY, or time-axis corrections. Do not treat the Unix timestamp as
the time of an individual sample.

Python returns a frozen ``ScopeFrame`` with ``sequence``, ``timestamp_ns``,
``sample_count``, ``channel_count``, and ``channels`` (tuple of channel tuples).
``ScopeFrame.from_bytes(data)`` is also available independently. Optional NumPy
conversion: ``np.asarray(frame.channels).T`` gives samples-by-channels.

Spectrum JSON has this shape (arrays shortened)::

    {"sequence": 42, "x": [0.0, 1.0],
     "series": [{"label": "Input 1", "values": [0.001, 0.002]},
                {"label": "Input 2", "values": [0.003, 0.004]},
                {"label": "Cross", "values": [0.001, 0.001]}],
     "span": 244140.625, "center": 0.0, "rbw": 25.7,
     "unit": "Vpk^2", "current_avg": 1}

``x`` is Hz; baseband mode returns Input 1/Input 2/Cross, IQ mode returns IQ.
Values here are linear power in Vpk^2, regardless of the browser's display unit.
The GUI derives RBW from its local FFT window and the hardware span, so its RBW
can differ from the module state's RBW when the browser and server windows differ.
Selecting an RBW in the GUI writes the corresponding span. GUI amplitude spectral
density is ``sqrt(power_Vpk2 / (2 * rbw_Hz))``; power spectral density is
``power_Vpk2 / (2 * rbw_Hz)``. These display conversions do not change HTTP samples.
The Network Analyzer exposes status via its module endpoint and live data through
``/ws/networkanalyzer``; it has no HTTP live-sweep frame endpoint. Saved sweeps
can be retrieved through ``/api/curves``. The Python library is an HTTP client,
not a WebSocket streaming client.

Network Analyzer point messages use ``x`` in Hz, or elapsed seconds when
``zero_span`` is true. The point at ``index: 0`` includes a ``settings`` object
with the module setup used for that sweep. Completed sweeps and reconnects send
``{"snapshot": [...]}``; clients should replace their cached points with that
snapshot. GUI-saved curves carry the captured settings plus ``zero_span`` and
``x_unit`` (``Hz`` or ``s``) in ``params``.

Lockbox endpoints
-----------------

All Lockbox mutations below return the **complete Lockbox schema**, not just the
changed value. The schema includes ``schema_epoch`` (server-process identifier),
``revision`` (increasing snapshot number), ``classname``, ``classes``, ``state``,
``attributes``, ``inputs``, ``outputs``, ``sequence``, and ``actions``. Ignore a
lower revision within the same epoch when combining HTTP and event responses;
a changed epoch denotes a restarted server. Older deployments may omit these
two ordering fields.

``state`` contains ``current_state`` (e.g. unlock, sweep, stage0, lock_on) and
``lock_status`` (boolean). Being in ``lock_on`` does not imply ``lock_status`` is
true. Monitor updates use ``lockstatus_interval``. ``GET /api/lockbox`` does not
force a new lock measurement; the ``is_locked`` action does and requires control.
Actions and stage execution can return before the sequence completes.

Input/output entries contain ``name``, ``kind``, ``class_name``, and ``attributes``;
inputs include ``calibration`` and IQ resource metadata, outputs include their
``state``. Each sequence entry has ``name``, ``attributes``, and ``outputs``
containing output names and per-stage attributes. Names/options vary by model
and installed trusted custom classes. Use the schema, not hardcoded output names.

.. list-table:: Complete Lockbox HTTP commands
   :header-rows: 1

   * - Method and path
     - Input
     - Expected response / Python method
   * - GET /api/lockbox
     - None
     - Complete schema; ``lockbox()``; ``lock_status()`` extracts only state
   * - GET /api/lockbox/classes
     - None
     - ``{"classes": [{"name": "Linear", "description": "...", "source": "..."}, ...]}``; ``lockbox_classes()``
   * - POST /api/lockbox/class
     - ``{"classname": "Linear"}``
     - Schema; ``set_lockbox_class(classname)``
   * - GET /api/lockbox/actions
     - None
     - ``{"actions": [{"name": "unlock", "label": "Unlock", "description": "..."}, ...]}``; ``lockbox_actions()``
   * - POST /api/lockbox/actions/{action}
     - No body; standard actions include is_locked, unlock, sweep, lock, calibrate_all
     - Schema; ``lockbox_action(action)``
   * - POST /api/lockbox/attributes/{attribute}
     - ``{"value": ...}``
     - Schema; ``set_lockbox(attribute, value)``
   * - POST /api/lockbox/inputs/{input_name}/attributes/{attribute}
     - ``{"value": ...}``
     - Schema; ``set_lockbox_input(name, attribute, value)``
   * - POST /api/lockbox/inputs/{input_name}/actions/{action}
     - No body; action calibrate
     - Schema; ``lockbox_input_action(name, action="calibrate")``
   * - POST /api/lockbox/outputs/{output_name}/attributes/{attribute}
     - ``{"value": ...}``
     - Schema; ``set_lockbox_output(name, attribute, value)``
   * - POST /api/lockbox/stages
     - No body
     - Schema with appended stage; ``add_stage()``
   * - DELETE /api/lockbox/stages/{index}
     - No body
     - Schema with stage removed; ``delete_stage(index)``
   * - POST /api/lockbox/stages/{index}/attributes/{attribute}
     - ``{"value": ...}``
     - Schema; ``set_stage(index, attribute, value)``
   * - POST /api/lockbox/stages/{index}/outputs/{output_name}/attributes/{attribute}
     - ``{"value": ...}``
     - Schema; ``set_stage_output(index, output, attribute, value)``
   * - POST /api/lockbox/stages/{index}/actions/{action}
     - No body; action execute
     - Schema; ``stage_action(index, action="execute")``
   * - GET /api/lockbox/inputs/{input_name}/plot
     - ``points=200`` query
     - ``{input, x, series: [{label, values}], x_label, y_label}``; ``lockbox_input_plot(name, points=200)``
   * - GET /api/lockbox/outputs/{output_name}/transfer_function
     - ``points=200`` query
     - Output transfer-function object; ``lockbox_output_plot(name, points=200)``

Output transfer-function ``x`` is frequency in Hz; series labeled ``magnitude``
and ``phase`` are linear gain and degrees. Other returned metadata is illustrated
in the catalog. These are model predictions, not a measured sweep. Calibration
and custom actions can take longer than ordinary requests; increase timeout as
needed. Changing Lockbox class can release resources and disable feedback.

Curves, configuration, workspace, and registers
-----------------------------------------------

``CurveSummary`` is ``{pk, name, points, complex}``. ``Curve`` adds ``params``
(JSON object), ``params_yaml`` (string), ``x`` and ``y`` (numeric arrays), and
``y_imag`` for complex curves. ``y`` is always the real component.

.. list-table:: Complete storage and low-level commands
   :header-rows: 1

   * - Method and path
     - Input
     - Expected response / Python method
   * - GET /api/curves
     - ``limit=100`` query, clamped to 0-100
     - ``{"curves": [CurveSummary, ...]}``; ``curves(limit=100)``
   * - POST /api/curves
     - ``{x, y, y_imag: null, params: {}}``; query ``include_data=true``
     - ``{"curve": Curve}``, or CurveSummary when include_data=false; ``create_curve(x, y, y_imag=None, params=None, include_data=True)``
   * - GET /api/curves/{pk}
     - None
     - ``{"curve": Curve}``; ``curve(pk)``
   * - PUT /api/curves/{pk}/params
     - ``{"params_yaml": "name: example\n"}``
     - ``{"curve": Curve}``; ``update_curve_params(pk, params_yaml)``
   * - DELETE /api/curves/{pk}
     - No body
     - ``{"pk": 123, "deleted": true}``; ``delete_curve(pk)``
   * - GET /api/config
     - Optional query ``module``; default pyrpl
     - Configuration object below; ``config(module=None)``
   * - POST /api/config/branches/{module_name}
     - ``{"text": "threshold: 0.0\n"}`` (YAML branch)
     - Configuration object; ``save_config(module, text)``
   * - GET /api/workspace
     - None
     - ``{"workspace": {...}}``; ``workspace()``
   * - POST /api/workspace
     - ``{"workspace": {...}}``
     - ``{"workspace": {...}}`` (normalized); ``save_workspace(workspace)``
   * - POST /api/register/read
     - ``{"addr": 1074790420, "length": 1}``; nonnegative address, length 1-65535
     - ``{"addr": 1074790420, "length": 1, "values": [0]}``; ``read_registers(addr, length=1)``
   * - POST /api/register/write
     - ``{"addr": 1074790420, "values": [0]}``
     - ``{"addr": 1074790420, "count": 1, "ok": true}``; ``write_registers(addr, values)``

Register addresses are byte addresses; values are 32-bit words. JSON cannot use
hexadecimal literals; Python can use ``0x40100014``. Register writes bypass
high-level module settings/ownership safeguards and can make their cached state
inconsistent. Prefer module setters for normal instrument control.

Configuration objects contain ``configfile``, ``config_file`` (same path),
``module``, ``modules`` (branch names), and ``text`` (YAML). Saving a recognized
module branch also applies its setup; this is not just a text-editor operation.
Workspace may be null when none is configured. It stores browser panel enablement, layout, and split sizes rather than
instrument settings; retrieve the current object before editing it.

Curve creation requires nonempty finite one-dimensional arrays with matching
lengths. For large uploads, POST /api/curves also accepts application/octet-stream:
ASCII ``PYC1``, uint32 little-endian JSON-header length, UTF-8 header
``{"points": N, "complex": false, "params": {...}}``, then contiguous
little-endian float64 x, y, and optional imaginary-y arrays (not interleaved).
Use ``rp.request("POST", "/api/curves", data=binary_bytes,
params={"include_data": False})`` for this optional fast path.

Profiles and browser routes
---------------------------

Profiles
~~~~~~~~

The web header's **Profiles** dialog provides Save current, Save as new,
Load selected, Rename selected, Download selected, and Upload file.
Save current overwrites the active profile;
Save as new creates and selects a new snapshot. Rename changes the selected
profile's label without changing its identity or settings. Renaming the active
profile updates the top-left heading and browser title on connected pages.
The working configuration continues to autosave, but saved profiles change only
when explicitly saved. Loading replaces instrument settings, saved module setups,
Lockbox model/calibration/sequence settings, writable AMS DAC settings, workspace
layout, and saved browser display options. Transient zoom/pan positions and
waveform buffers are not part of a profile. Saved curves, connection settings,
authentication, and board clock calibration are kept separately.

**Profiles → Color theme** selects ``graphite`` (default dark), ``ocean`` (blue),
``forest`` (green), ``plum`` (purple), or ``paper`` (light). Colors apply to controls,
dialogs and plots without resetting zoom/pan or restarting acquisition. The theme
is stored in ``workspace.theme`` within ``settings.pyrpl_websocket`` in an exported
profile. Save current/Save as new captures the chosen theme; loading restores it
on connected pages, including when loading an uploaded file. Old profiles with
no theme (or unknown themes) display Graphite. A controller's choice also autosaves
in the working workspace. An observer can preview colors locally but must claim
control to save a profile. Theme changes do not overwrite a named snapshot until
it is explicitly saved.

Loading stops Scope/Spectrum/Network Analyzer acquisition and unlocks Lockbox;
it does not execute a saved locking sequence. Other instrument output settings
(including ASG/PID routing and gains) are applied. Connected pages reload after
a successful load to rebuild their controls; saving/renaming does not reload them.
Invalid settings are checked against a fake FPGA before live application. A
hardware or storage failure during application attempts to restore the previous
settings; acquisition remains stopped. The active name and loaded settings persist
through service restarts. Profiles are stored beside the working YAML file in
``<config-stem>.profiles/<id>.json``, with atomic file replacement.

All profile mutations require controller ownership. These endpoints require the
profile-enabled server build; earlier deployments return 404. A successful response
contains ``active: {id, name}``, ``profiles: [{id, name, updated_at}]``,
``load_revision`` (null or a load identifier), ``workspace``, and ``plot_views``.
The initial working configuration has a null active id until first saved.
Profile names contain 1-80 printable characters and must be unique (case-insensitive).
IDs are opaque, stable identifiers; renaming does not change an ID.

.. list-table:: Profile HTTP commands
   :header-rows: 1

   * - Method and path
     - Input
     - Python method
   * - GET /api/profiles
     - None
     - ``profiles()``
   * - POST /api/profiles
     - ``{"name": "Experiment A"}``; optional workspace and plot_views objects
     - ``create_profile(name, workspace=None, plot_views=None)``
   * - PUT /api/profiles/{profile_id}
     - ``{}``; optional workspace and plot_views objects; overwrites snapshot and selects it
     - ``save_profile(profile_id, workspace=None, plot_views=None)``
   * - PATCH /api/profiles/{profile_id}
     - ``{"name": "New name"}``
     - ``rename_profile(profile_id, name)``
   * - POST /api/profiles/{profile_id}/load
     - No body
     - ``load_profile(profile_id)``
   * - GET /api/profiles/{profile_id}/download
     - None; returns the JSON profile file with an attachment header
     - ``export_profile(profile_id)``
   * - POST /api/profiles/import
     - ``{"profile": <exported object>, "name": "Optional new name"}``
     - ``import_profile(profile, name=None)``

**Download selected** exports the saved snapshot, not unsaved live changes.
To upload, choose a JSON file, optionally edit **Profile name**, and click
**Upload file**. Upload validates settings against a simulated instrument and
creates a new saved profile with a new ID. It does not change the active profile
or hardware; use **Load selected** to apply it. Duplicate names are rejected,
so change the name to keep a separate copy. Downloads are available to observers;
uploads require controller ownership. The upload request limit is 8 MiB (413 if
exceeded). Only version 1 profile files are accepted, not arbitrary YAML files.

The portable JSON object contains ``version: 1``, ``id``, ``name``,
``updated_at`` (UTC ISO timestamp), and ``settings`` (module settings, named
module setups, and workspace/view settings). Imports ignore the file's ID and
timestamp and exclude connection identity and clock calibration. Referenced
curves and custom Lockbox models must already exist on the destination server;
they are not embedded in the file. Import returns the usual profile state plus
``imported_id``. Export returns the portable object itself.

.. code-block:: python

   import json
   from pathlib import Path

   profile = rp.export_profile(profile_id)
   Path("experiment.json").write_text(json.dumps(profile, indent=2), encoding="utf-8")
   with rp.control():
       uploaded = rp.import_profile(
           json.loads(Path("experiment.json").read_text(encoding="utf-8")),
           name="Experiment copy",
       )
       # Optional: replaces settings and stops acquisition/Lockbox.
       rp.load_profile(uploaded["imported_id"])

Profile errors use 400 for invalid names/settings, 404 for an unknown identifier,
409 for duplicate names, unavailable YAML configuration, or controller conflicts,
and 503 for storage failures. The event stream publishes ``profiles.changed``
with the response fields and reason ``saved``, ``renamed``, ``loaded``, or ``imported``.

Streaming routes
~~~~~~~~~~~~~~~~

GET / serves the UI; /assets/* and /static/* serve files. GET /docs, /redoc, and
/openapi.json are generated by FastAPI. ``rp.openapi()`` returns the last one.
They use the same authentication middleware. WebSocket routes /ws/control,
/ws/events, /ws/scope, /ws/spectrumanalyzer, and /ws/networkanalyzer provide
continuous control/event/data streams; they are not HTTP commands and are not
implemented by this HTTP client. For continuous Scope consumption over HTTP,
poll ``wait_scope_frame(after=previous)``; it returns latest frames, not a lossless
history of all acquisitions.

Maintaining this reference
--------------------------

``scripts/generate_http_api_reference.py`` regenerates the companion catalog
from a temporary fake session, without contacting hardware. Run it after
changing module schemas. The client tests check that all custom HTTP API routes
are listed here and exercise authentication, ownership, failures, binary traces,
and control against a fake backend. All JSON examples are illustrative; use
the connected server's discovery responses for actual current values.
