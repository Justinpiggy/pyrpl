# PyRPL Web Deployment

The web runtime is headless and does not import Qt. It talks to the existing
`monitor_server` protocol and does not modify FPGA firmware or
`monitor_server.c`.

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

The board needs Python 3.10 and a working NumPy installation. Build the
TypeScript frontend on a development machine before copying or installing the
repository; Node.js is not needed on the board because the wheel contains the
compiled assets.

```bash
python3 -m pip install --no-cache-dir ".[web-redpitaya]"
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

## Multi-Client Control

The production default is `--control-policy single-writer`. The first browser
or API client that writes receives a renewable 30-second controller lease.
Other browsers remain observers: they can read state and receive the same
Scope, Spectrum Analyzer, and Network Analyzer stream, but mutation requests
return HTTP 409 until the user presses **Take Control** or the old lease
expires. Browser heartbeats renew the lease; closing the page releases it when
the browser can deliver its final request.

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
