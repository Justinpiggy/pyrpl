"""Dependency-free PC client for the PyRPL HTTP API (Python 3.8+).

This module also works when copied onto a PC as a standalone ``http_client.py``.
It does not import PyRPL's desktop GUI, NumPy, or the web server.
"""

from __future__ import annotations

from contextlib import contextmanager
from dataclasses import dataclass
import json
import math
import struct
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
from uuid import uuid4


class APIError(RuntimeError):
    """HTTP failure; inspect status, detail, payload, method, and url."""

    def __init__(self, status, payload, method, url):
        self.status, self.payload, self.method, self.url = status, payload, method, url
        self.detail = payload.get("detail", payload) if isinstance(payload, dict) else payload
        super().__init__(f"{method} {url}: HTTP {status}: {self.detail}")


class TransportError(RuntimeError):
    """Connection/timeout failure. A timed-out write may already have executed."""


class ProtocolError(RuntimeError):
    """The server response is not valid JSON or a supported Scope frame."""


class ControlLostError(RuntimeError):
    """The control context could not renew its controller lease."""


@dataclass(frozen=True)
class ScopeFrame:
    """Latest shared trace. channels[channel][sample] contains volts.

    timestamp_ns is the server's Unix frame timestamp (zero on fake hardware),
    not a hardware trigger timestamp. PWS1 carries no time axis/settings.
    """

    sequence: int
    timestamp_ns: int
    sample_count: int
    channel_count: int
    channels: tuple

    @classmethod
    def from_bytes(cls, data):
        header = struct.Struct("<4sHHIQI")
        if len(data) < header.size:
            raise ProtocolError("Scope frame is shorter than its 24-byte header")
        magic, version, channels, samples, timestamp, sequence = header.unpack_from(data)
        if magic != b"PWS1" or version != 1:
            raise ProtocolError("Unsupported Scope frame magic/version")
        if channels < 1 or samples < 1 or len(data) != header.size + 4 * channels * samples:
            raise ProtocolError("Scope frame dimensions do not match its payload")
        values = struct.unpack_from(f"<{channels * samples}f", data, header.size)
        return cls(sequence, timestamp, samples, channels,
                   tuple(values[channel::channels] for channel in range(channels)))


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Do not forward authentication or change a POST into a redirected GET.
        return None


def _segment(value):
    text = str(value)
    if not text or text in {".", ".."}:
        raise ValueError("API path segments must be nonempty names")
    return quote(text, safe="")


class RedPitayaClient:
    """Connect to an existing PyRPL web service; construction performs no I/O.

    ``address`` is a host/IP (default port 8801), host:port, or HTTP(S) URL.
    ``token`` is the server's optional HTTP bearer token, not an SSH password.
    Calls return the server's complete JSON response unless documented otherwise.
    No requests are automatically retried. Environment HTTP proxies are bypassed.
    """

    def __init__(self, address, *, port=8801, token=None, timeout=10.0,
                 client_id=None, label="Python client"):
        if "://" not in address:
            address = "http://" + address
            parsed = urlsplit(address)
            if parsed.port is None:
                address = urlunsplit(parsed._replace(netloc=parsed.netloc + f":{port}"))
        parsed = urlsplit(address)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("address must be an HTTP(S) URL or hostname")
        if parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError("Pass authentication using token, not URL credentials/query parameters")
        self.base_url = address.rstrip("/")
        self.timeout = float(timeout)
        if not math.isfinite(self.timeout) or self.timeout <= 0:
            raise ValueError("timeout must be positive and finite")
        self.client_id = client_id or ("python-" + uuid4().hex)
        if not self.client_id.strip() or len(self.client_id) > 128:
            raise ValueError("client_id must contain 1 to 128 characters")
        self.headers = {"X-Pyrpl-Client-Id": self.client_id, "X-Pyrpl-Client-Label": label}
        if token is not None:
            self.headers["Authorization"] = "Bearer " + token
        for value in self.headers.values():
            if "\r" in value or "\n" in value:
                raise ValueError("HTTP header values cannot contain newlines")
        self._control_guard = threading.Lock()
        self._control_error = None

    def request(self, method, path, *, params=None, data=None, raw=False, timeout=None):
        """Generic same-server HTTP call. 204 returns None; raw=True returns bytes.

        JSON objects are encoded from data; bytes are sent as application/octet-stream.
        The generic method covers future endpoints without updating this client.
        """
        method = method.upper()
        if not path.startswith("/") or path.startswith("//") or "?" in path or "#" in path:
            raise ValueError("Use an absolute API path and pass query values through params")
        if method not in {"GET", "POST", "PUT", "DELETE", "PATCH"}:
            raise ValueError("Unsupported HTTP method")
        mutation = method != "GET" and not path.startswith("/api/control/") and path not in {
            "/api/register/read", "/api/sampler/stats",
        }
        if mutation and self._control_error:
            raise ControlLostError(str(self._control_error)) from self._control_error
        query = {key: str(value).lower() if isinstance(value, bool) else value
                 for key, value in (params or {}).items() if value is not None}
        url = self.base_url + path + (("?" + urlencode(query)) if query else "")
        headers = dict(self.headers)
        headers["Accept"] = "application/octet-stream" if raw else "application/json"
        body = None
        if data is not None:
            if isinstance(data, bytes):
                body = data
                headers["Content-Type"] = "application/octet-stream"
            else:
                body = json.dumps(data, allow_nan=False).encode("utf-8")
                headers["Content-Type"] = "application/json"
        request = Request(url, data=body, headers=headers, method=method)
        try:
            with build_opener(ProxyHandler({}), _NoRedirect()).open(
                request, timeout=self.timeout if timeout is None else timeout,
            ) as response:
                content = response.read()
                if response.status == 204:
                    return None
        except HTTPError as exc:
            content = exc.read()
            try:
                payload = json.loads(content)
            except (ValueError, UnicodeError):
                payload = content.decode("utf-8", errors="replace")
            raise APIError(exc.code, payload, method, url) from exc
        except (URLError, OSError) as exc:
            raise TransportError(f"{method} {url}: {exc}") from exc
        if raw:
            return content
        try:
            return json.loads(content)
        except (ValueError, UnicodeError) as exc:
            raise ProtocolError(f"{method} {url}: expected a JSON response") from exc

    def health(self):
        return self.request("GET", "/api/health")

    def session(self):
        """System-wide settings, module states, owners, counters, and Lockbox schema."""
        return self.request("GET", "/api/session")

    def control_status(self):
        return self.request("GET", "/api/control")

    def control_audit(self, limit=100):
        return self.request("GET", "/api/control/audit", params={"limit": limit})

    def claim_control(self, *, force=False):
        result = self.request("POST", "/api/control/claim", data={"label": self.headers["X-Pyrpl-Client-Label"], "force": force})
        self._control_error = None
        return result

    def heartbeat(self):
        return self.request("POST", "/api/control/heartbeat")

    def release_control(self):
        return self.request("POST", "/api/control/release")

    @contextmanager
    def control(self, *, force=False, keep_alive=True):
        """Claim, optionally renew, and release control. Does not unlock hardware.

        Nested/concurrent control contexts on the same client are rejected. A lost
        lease blocks subsequent mutations and raises ControlLostError on clean exit.
        Read-only calls never require this context. Force takeover is opt-in.
        """
        if not self._control_guard.acquire(blocking=False):
            raise RuntimeError("A control context is already active on this client")
        stop = threading.Event()
        worker = None
        claimed = False
        try:
            status = self.claim_control(force=force)
            claimed = True
            interval = max(0.1, float(status["lease_seconds"]) / 3)

            def renew():
                while not stop.wait(interval):
                    try:
                        renewed = self.heartbeat()
                        if renewed["role"] not in {"controller", "shared"}:
                            raise ControlLostError("Controller lease was transferred or expired")
                    except Exception as exc:
                        self._control_error = exc
                        return

            if keep_alive and status["policy"] != "shared":
                worker = threading.Thread(target=renew, name="pyrpl-http-heartbeat", daemon=True)
                worker.start()
            yield self
            if self._control_error:
                raise ControlLostError(str(self._control_error)) from self._control_error
        finally:
            # Preserve the user's original error if cleanup also fails.
            import sys
            unwinding = sys.exc_info()[0] is not None
            stop.set()
            if worker is not None:
                worker.join()
            try:
                if claimed:
                    self.release_control()
            except Exception:
                if not unwinding:
                    raise
            finally:
                self._control_guard.release()
            if not unwinding and self._control_error:
                raise ControlLostError(str(self._control_error)) from self._control_error

    def modules(self):
        return self.request("GET", "/api/modules")

    def module_state(self, module):
        return self.request("GET", f"/api/modules/{_segment(module)}")

    def attributes(self, module):
        return self.request("GET", f"/api/modules/{_segment(module)}/attributes")

    def actions(self, module):
        return self.request("GET", f"/api/modules/{_segment(module)}/actions")

    def get(self, module, attribute):
        return self.request("GET", f"/api/modules/{_segment(module)}/attributes/{_segment(attribute)}")

    def set(self, module, attribute, value):
        return self.request("POST", f"/api/modules/{_segment(module)}/attributes/{_segment(attribute)}", data={"value": value})

    def action(self, module, action):
        return self.request("POST", f"/api/modules/{_segment(module)}/actions/{_segment(action)}")

    def states(self, module):
        return self.request("GET", f"/api/modules/{_segment(module)}/states")

    def save_state(self, module, name):
        return self.request("POST", f"/api/modules/{_segment(module)}/states/{_segment(name)}/save")

    def load_state(self, module, name):
        return self.request("POST", f"/api/modules/{_segment(module)}/states/{_segment(name)}/load")

    def delete_state(self, module, name):
        return self.request("DELETE", f"/api/modules/{_segment(module)}/states/{_segment(name)}")

    def scope_frame(self, samples=16384, *, timeout=None):
        """Return ScopeFrame or None before any frame is available; never starts acquisition."""
        data = self.request("GET", "/api/scope/frame", params={"samples": samples}, raw=True, timeout=timeout)
        return None if data is None else ScopeFrame.from_bytes(data)

    def wait_scope_frame(self, *, after=None, timeout=10.0, poll_interval=0.05, samples=16384):
        """Poll for a frame different from after (a ScopeFrame), or raise TimeoutError.

        Compare both sequence and timestamp so a server restart is also detected.
        This only reads; start acquisition separately if needed.
        """
        if not math.isfinite(timeout) or timeout <= 0 or not math.isfinite(poll_interval) or poll_interval <= 0:
            raise ValueError("timeout and poll_interval must be positive and finite")
        deadline = time.monotonic() + timeout
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError("No new Scope frame before the deadline")
            frame = self.scope_frame(samples, timeout=min(self.timeout, remaining))
            if frame is not None and (after is None or
                    (frame.sequence, frame.timestamp_ns) != (after.sequence, after.timestamp_ns)):
                return frame
            time.sleep(min(poll_interval, max(0, deadline - time.monotonic())))

    def spectrum_frame(self, window="blackman"):
        return self.request("GET", "/api/spectrumanalyzer/frame", params={"window": window})

    def sampler_stats(self, signal="in1", duration=0.01):
        return self.request("POST", "/api/sampler/stats", data={"signal": signal, "duration": duration})

    def iir_plot(self, **options):
        return self.request("GET", "/api/modules/iir/plot", params=options)

    def lockbox(self):
        return self.request("GET", "/api/lockbox")

    def lock_status(self):
        """Return {current_state, lock_status}, without forcing a new hardware check."""
        return self.lockbox()["state"]

    def lockbox_classes(self):
        return self.request("GET", "/api/lockbox/classes")

    def set_lockbox_class(self, classname):
        return self.request("POST", "/api/lockbox/class", data={"classname": classname})

    def lockbox_actions(self):
        return self.request("GET", "/api/lockbox/actions")

    def lockbox_action(self, action):
        return self.request("POST", f"/api/lockbox/actions/{_segment(action)}")

    def set_lockbox(self, attribute, value):
        return self.request("POST", f"/api/lockbox/attributes/{_segment(attribute)}", data={"value": value})

    def set_lockbox_input(self, name, attribute, value):
        return self.request("POST", f"/api/lockbox/inputs/{_segment(name)}/attributes/{_segment(attribute)}", data={"value": value})

    def lockbox_input_action(self, name, action="calibrate"):
        return self.request("POST", f"/api/lockbox/inputs/{_segment(name)}/actions/{_segment(action)}")

    def set_lockbox_output(self, name, attribute, value):
        return self.request("POST", f"/api/lockbox/outputs/{_segment(name)}/attributes/{_segment(attribute)}", data={"value": value})

    def add_stage(self):
        return self.request("POST", "/api/lockbox/stages")

    def delete_stage(self, index):
        return self.request("DELETE", f"/api/lockbox/stages/{_segment(index)}")

    def set_stage(self, index, attribute, value):
        return self.request("POST", f"/api/lockbox/stages/{_segment(index)}/attributes/{_segment(attribute)}", data={"value": value})

    def set_stage_output(self, index, output, attribute, value):
        return self.request("POST", f"/api/lockbox/stages/{_segment(index)}/outputs/{_segment(output)}/attributes/{_segment(attribute)}", data={"value": value})

    def stage_action(self, index, action="execute"):
        return self.request("POST", f"/api/lockbox/stages/{_segment(index)}/actions/{_segment(action)}")

    def lockbox_input_plot(self, name, points=200):
        return self.request("GET", f"/api/lockbox/inputs/{_segment(name)}/plot", params={"points": points})

    def lockbox_output_plot(self, name, points=200):
        return self.request("GET", f"/api/lockbox/outputs/{_segment(name)}/transfer_function", params={"points": points})

    def read_registers(self, addr, length=1):
        return self.request("POST", "/api/register/read", data={"addr": addr, "length": length})

    def write_registers(self, addr, values):
        return self.request("POST", "/api/register/write", data={"addr": addr, "values": list(values)})

    def curves(self, limit=100):
        return self.request("GET", "/api/curves", params={"limit": limit})

    def curve(self, pk):
        return self.request("GET", f"/api/curves/{_segment(pk)}")

    def create_curve(self, x, y, *, y_imag=None, params=None, include_data=True):
        return self.request("POST", "/api/curves", params={"include_data": include_data},
                            data={"x": list(x), "y": list(y), "y_imag": None if y_imag is None else list(y_imag), "params": params or {}})

    def update_curve_params(self, pk, params_yaml):
        return self.request("PUT", f"/api/curves/{_segment(pk)}/params", data={"params_yaml": params_yaml})

    def delete_curve(self, pk):
        return self.request("DELETE", f"/api/curves/{_segment(pk)}")

    def config(self, module=None):
        return self.request("GET", "/api/config", params={"module": module})

    def save_config(self, module, text):
        return self.request("POST", f"/api/config/branches/{_segment(module)}", data={"text": text})

    def workspace(self):
        return self.request("GET", "/api/workspace")

    def save_workspace(self, workspace):
        return self.request("POST", "/api/workspace", data={"workspace": workspace})

    def assets(self):
        return self.request("GET", "/api/assets")

    def openapi(self):
        return self.request("GET", "/openapi.json")

    def profiles(self):
        return self.request("GET", "/api/profiles")

    def export_profile(self, profile_id):
        """Return a portable profile dictionary suitable for json.dump()."""
        return self.request("GET", f"/api/profiles/{_segment(profile_id)}/download")

    def import_profile(self, profile, *, name=None):
        """Save an exported profile as a new copy without applying it."""
        return self.request("POST", "/api/profiles/import", data={"profile": profile, "name": name})

    def create_profile(self, name, *, workspace=None, plot_views=None):
        return self.request("POST", "/api/profiles", data={"name": name, "workspace": workspace, "plot_views": plot_views})

    def save_profile(self, profile_id, *, workspace=None, plot_views=None):
        return self.request("PUT", f"/api/profiles/{_segment(profile_id)}", data={"workspace": workspace, "plot_views": plot_views})

    def rename_profile(self, profile_id, name):
        return self.request("PATCH", f"/api/profiles/{_segment(profile_id)}", data={"name": name})

    def load_profile(self, profile_id):
        """Apply saved settings; acquisition and Lockbox remain stopped."""
        return self.request("POST", f"/api/profiles/{_segment(profile_id)}/load")
