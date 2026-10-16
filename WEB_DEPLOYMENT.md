# PyRPL Web Deployment

The web runtime is headless and does not import Qt. It talks to the existing
`monitor_server` protocol and does not modify FPGA firmware or
`monitor_server.c`.

## Deploy And Run Everything On The Red Pitaya

Run from the PC checkout:

```bash
conda activate pyrpl-env
bash deploy_redpitaya.sh
```

Then open **http://10.0.5.118:8801**. HTTP, the WebSocket endpoints, instrument
control, and Lockbox execution all run on the board. The PC only builds,
transfers, and verifies the deployment; the browser renders the UI and computes
Spectrum FFTs. The launcher returns after verification, and the services remain
running. Port 8801 is exposed directly on the board's LAN interface, without a
tunnel or authentication in this development workflow.

```bash
# Different board or HTTP/WebSocket port:
bash deploy_redpitaya.sh --host 10.0.5.118 --port 8801

# Read-only hardware/toolchain preflight:
bash deploy_redpitaya.sh --check

# After a board reboot, if the PyRPL FPGA image needs loading:
bash deploy_redpitaya.sh --reload-fpga
```

`--reload-fpga` invokes the board's existing `/opt/pyrpl/update_fpga.sh`. The
deployment never uploads firmware or changes that script. Without this flag,
it starts the existing `/opt/pyrpl/monitor_server` against the loaded FPGA.
Stop any previous PC-hosted launcher or desktop PyRPL instance first. The
deployer refuses to kill an unrelated process occupying port 2222 or 8801.

The PC needs Python 3.10+, pip, setuptools, wheel, Node.js/npm, and SSH access as
root. Activating `pyrpl-env` supplies these on the development machine. An
explicit interpreter also works:

```bash
PYRPL_PYTHON_CMD=/opt/anaconda3/envs/pyrpl-env/bin/python bash deploy_redpitaya.sh
```

The stock board inspected during development has Ubuntu 16.04, ARMv7, Python
3.5.2, and about 431 MB of RAM. The launcher therefore installs a separate,
checksum-pinned CPython 3.11 distribution under `/opt/pyrpl-web/python`; it
does not replace `/usr/bin/python3` or change the operating system. The runtime
comes from the official [python-build-standalone releases](https://github.com/astral-sh/python-build-standalone/releases/tag/20261013).

Dependencies are pinned in `deploy/redpitaya-dependencies.txt`. Downloads
happen on the PC and are cached in `.cache/redpitaya-deploy/`; the board does
not need Internet access. NumPy is built against the board's own libc with one
compiler job on the first deployment. The first NumPy build took about 42
minutes on the tested board; allow longer on other images or busy boards. This needs GCC,
make, the system development headers, and sufficient free disk space. PyYAML
and Pydantic use their pure-Python implementations. Subsequent deployments
reuse the verified dependency environment when the dependency/build manifest
matches. No Qt, browser, Node.js, or web accelerator build is needed on the board.
Dependency installation output is also saved to `/opt/pyrpl-web/runtime-install.log`.

The launcher also copies the compiled NumPy wheel back to the PC under
`artifacts/redpitaya/<architecture-python-libc-os>/`, together with SHA-256
checksums, NumPy build configuration, linked-library details, and the available
installation log. Future deployments upload a matching verified wheel from this
folder and install it without recompiling, including when creating a fresh
dependency environment. The wheel contains the reusable native modules;
intermediate `.o` files are not required. These cache directories persist in the
repository folder but are Git-ignored. See `artifacts/redpitaya/README.md`.

Every launch builds the frontend and a fresh wheel in a temporary PC directory,
including current uncommitted Python/TypeScript edits. It uploads the wheel,
checks transfer hashes, audits ARM dependencies, replaces the complete deployed
application, and starts managed monitor and web services. It verifies HTTP,
compiled browser assets, event/control WebSockets, and a real FPGA register
read. It does not configure signal outputs or perform an acquisition experiment.

The deployment layout is:

| Board path | Policy |
| --- | --- |
| `/opt/pyrpl-web/current` | Complete deployed Python packages and compiled frontend; replaced each launch, mounted read-only. Edit the PC checkout and redeploy. |
| `/opt/pyrpl-web/python`, `/opt/pyrpl-web/env-*` | Isolated Python and cached dependency environments. |
| `/opt/pyrpl-web/DEPLOYMENT.json` | Source Git revision and application wheel checksum. The wheel includes working-tree edits beyond that revision. |
| `/var/lib/pyrpl-web` | Persistent YAML configuration and saved curves; preserved on redeploy. |
| `/opt/pyrpl` | Existing board firmware/monitor installation; not overwritten. |

The web process runs as the unprivileged `pyrpl-web` user. Code changes fail on
the read-only mount, including ordinary root editor writes. A root administrator
can deliberately override the mount, so this is an enforced development
workflow, not a security boundary against the board administrator. Failed
replacements restore the previous application and service definitions where
available. Failure bundles remain in `incoming-*` for diagnosis.

These services are started by deployment, not enabled at boot. Redeploy after
reboot to refresh the code and reestablish the read-only mount. To inspect or
stop the deployment from the PC:

```bash
ssh root@10.0.5.118 'systemctl status pyrpl-web.service pyrpl-web-monitor.service'
ssh root@10.0.5.118 'journalctl -u pyrpl-web.service -u pyrpl-web-monitor.service -n 80 --no-pager'
ssh root@10.0.5.118 'systemctl stop pyrpl-web.service'
```

`test_redpitaya.sh` remains the older workflow with the web server on the PC.
Use `deploy_redpitaya.sh` for board-hosted operation.

Validated on the Ubuntu 16.04 ARMv7 board at `10.0.5.118`: a first native build
and a second deployment into a fresh dependency environment both passed the
HTTP/frontend, event/control WebSocket, and real FPGA register-read checks.
The second deployment installed the PC-cached NumPy wheel without compilation,
replaced the application directory, and preserved the configuration checksum.
Opening deployed application code for writing as root failed with `EROFS`.
These checks establish deployment and connectivity, not full instrument or
Lockbox functional coverage.

## Local Development

Use the existing Conda environment:

```bash
conda activate pyrpl-env
cd web
npm ci
npm run build
cd ..
pyrpl-web --hostname _FAKE_ --bind-host 127.0.0.1 --bind-port 8000
```

Open `http://127.0.0.1:8000`. For Vite development, run the Python server on
port 8000 and `npm run dev` in `web/`; Vite proxies `/api` and `/ws`.

## Red Pitaya ARMv7

For manual installation, the board needs Python 3.10 or newer and a working NumPy installation. Build the
TypeScript frontend on a development machine before copying or installing the
repository; Node.js is not needed on the board because the wheel contains the
compiled assets.

Build and inspect the wheel on the development machine first. This verifies
that the compiled TypeScript bundle is included, and that the Python payload is
a universal `*-none-any` wheel with no native extension in the web runtime:

```bash
cd web && npm ci && npm run build && cd ..
rm -rf build
python -m pip wheel . --no-deps --no-build-isolation --wheel-dir /tmp/pyrpl-web-wheel
python scripts/verify_web_wheel.py /tmp/pyrpl-web-wheel/*.whl
python -m pyrpl_websocket.dependency_audit \
  --strict-armv7 --wheel /tmp/pyrpl-web-wheel/*.whl
```

On the board, install the already-built wheel with the bounded runtime extra,
then run the same environment audit. The board-provided NumPy installation is
intentionally retained; it is the only compiled numerical dependency required
by the web runtime.

```bash
WHEEL="$(realpath /path/to/pyrpl-*.whl)"
python3 -m pip install --no-cache-dir \
  "pyrpl[web-redpitaya] @ file://${WHEEL}"
pyrpl-web-audit --strict-armv7
```

The bounded extra uses FastAPI 0.115, Pydantic 1, minimal Uvicorn, and wsproto.
It does not install `uvicorn[standard]`, `pydantic-core`, `uvloop`,
`httptools`, or `watchfiles`. NumPy is the only required compiled numerical
runtime. If the board image already supplies NumPy, keep that board-supported
build.

Start the existing monitor server in a persistent process, then run:

```bash
export PYRPL_WEB_TOKEN='replace-with-a-long-random-token'
pyrpl-web --hostname 127.0.0.1 --port 2222 --bind-host 0.0.0.0 --bind-port 8000
```

Open `http://REDPITAYA_HOST:8000/?token=YOUR_TOKEN` once. The server stores the
validated token in an HttpOnly, SameSite cookie for HTTP and WebSocket access.
Scripts may instead send `Authorization: Bearer YOUR_TOKEN`.

## Curve saving

Save Curve persists the displayed channels on the board, then downloads the CSV
in the browser. The browser uploads samples as binary float64 arrays to avoid
decimal JSON conversion on ARM; validation and file writes run in worker threads.
Saved `.dat` files contain NumPy arrays and remain readable by PyRPL's CurveDB.
Existing files containing Python lists remain supported.

`POST /api/curves` still accepts JSON (`x`, `y`, optional `y_imag`, and `params`)
and returns the full saved curve by default. `?include_data=false` returns only
`pk`, `name`, `points`, and `complex`. The binary alternative uses content type
`application/octet-stream`: four bytes `PYC1`, a little-endian uint32 UTF-8 JSON
header length, the header (`points`, `complex`, `params`), then contiguous
little-endian float64 arrays in order `x`, `y`, and optionally `y_imag`.

## Multi-Client Control

The production default is `--control-policy single-writer`. The first browser
or API client that writes receives a renewable 30-second controller lease.
Other browsers remain observers: they can read state and receive the same
Scope, Spectrum Analyzer, and Network Analyzer stream, but mutation requests
return HTTP 409 until the user presses **Take Control** or the old lease
expires. Browser heartbeats renew the lease; closing the page releases it when
the browser can deliver its final request.

Observers can select modules and arrange their own browser layout. Those choices
stay in local browser storage and do not alter the controller's workspace or
start/stop instruments. Hardware fields and action buttons are read-only;
their values and run status follow controller events. Enabled Scope, Spectrum
Analyzer, and Network Analyzer views subscribe to running acquisitions without
claiming control. Opening a page or reconnecting refreshes module state from the
server, including changes made while that browser was disconnected.

Plot choices are local for both controllers and observers, and are stored in
that browser. Controller events update acquisition settings without replacing
the observer's chosen display settings. The control-path audit is:

| Control path | Observer behavior |
| --- | --- |
| Module selection, tabs, split panes, gutters, sizes | Local and editable; no acquisition or shared-workspace writes. |
| Scope/Spectrum pan, zoom, axes, reset; Network Analyzer/IIR reset; plot mouse gestures | Local and editable. |
| Scope channel visibility, XY, math enable/expression | Local and editable. Inputs, trigger, duration, rolling mode, sample averaging and trace averaging remain shared acquisition settings. |
| Spectrum visibility, display units, FFT window | Local and editable; FFT/RBW display uses that browser's window. Span, inputs, baseband/IQ mode, center frequency, bandwidth and acquisition averaging remain controller-only. |
| IIR transfer-function view, reference curve, data/product/measurement overlays | Read-only plot requests with local overrides; no filter reconfiguration. |
| IIR poles/zeros, including marker drag and modifier-click gestures; gain, coefficients, input/output routing, measurement action | Controller-only; live state and plot refresh follow changes. |
| Network Analyzer sweep settings, frequency spacing, amplitude, IQ resource, run/stop | Controller-only; observers subscribe to acquisition data. |
| ASG, PID, IQ, trigger, PWM, GPIO/LED/DAC, Lockbox model/parameters/stages/calibration | Controller-only; attribute/state events and reconnect snapshots update observers. |
| Lockbox plot selection; Curve Viewer selection/refresh; configuration branch selection/refresh | Local selection and read-only requests. Shared save/delete/edit actions stay controller-only. |
| Telemetry refresh/statistics and register reads | Read-only requests are available; register writes and DAC edits stay controller-only. |
| Scope/Spectrum/Network Analyzer curve button | Observer downloads CSV locally; controller also persists the curve on the board. |

The frontend policy is in `web/src/view-controls.ts`; unclassified instrument
controls default to controller-only. Hardware write authorization is also
enforced by the server. Plot settings never change hardware ownership.

Automation clients should send stable `X-PyRPL-Client-ID` and optional
`X-PyRPL-Client-Label` headers. Legacy clients without those headers are
identified by remote address for compatibility. Use
`--control-lease-seconds SECONDS` to change the timeout. A deliberately shared
test or automation server can use `--control-policy shared`.

`GET /api/control` reports the caller's role, `GET /api/control/audit` returns
the newest bounded in-memory mutation records, and control/audit changes are
also published on `/ws/events`. The audit buffer resets when the server
restarts. Control ownership does not replace authentication: use both token
authentication and the single-writer policy on a LAN-facing instrument.

Scope, Spectrum Analyzer, Network Analyzer, and event WebSockets reconnect
automatically after transient network loss using bounded backoff. A user Stop,
completed single sweep, or panel teardown cancels reconnection, so transport
recovery cannot restart an instrument the user intentionally stopped.

The files in `deploy/` provide a systemd unit and environment-file template.
The environment file contains a hardware-control credential and must be mode
`0600`.

## Security

Every API endpoint can alter physical outputs. Keep the default loopback bind
unless remote access is required. The safest remote workflow is an SSH tunnel:

```bash
ssh -L 8000:127.0.0.1:8000 root@REDPITAYA_HOST
```

Then keep `pyrpl-web` bound to `127.0.0.1` and browse to
`http://127.0.0.1:8000`. For direct LAN binding, always set
`PYRPL_WEB_TOKEN`, restrict the port with a firewall, and use a trusted network.
The built-in token prevents unauthorized control but does not encrypt HTTP;
use an HTTPS reverse proxy when traffic can cross an untrusted network.

Do not place tokens directly in shell history, URLs shared with others, config
files served by the application, or service unit files. Health and session
responses expose only `auth_enabled`, never the token.

## Verification

```bash
conda run -n pyrpl-env python -m unittest pyrpl.test.test_pyrpl_websocket_app
cd web
conda run -n pyrpl-env npm test
conda run -n pyrpl-env npm run build
conda run -n pyrpl-env npm run test:e2e
```

Hardware normalization and final Scope/Network Analyzer behavior still require
the physical board and remain separate from this software-only deployment
check.
