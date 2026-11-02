"""FastAPI application for the PyRPL websocket prototype."""

from __future__ import annotations

import asyncio
import json
import secrets
import struct
from contextlib import asynccontextmanager
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

import numpy as np
import yaml
from fastapi import Depends, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ValidationError

from .assets import WEB_DIST_ASSETS_DIR, WEB_DIST_DIR, asset_info
from .control import ControlConflict, ControlCoordinator, normalize_client_id
from .events import (
    EventBroker,
    module_action_event,
    module_attribute_event,
    module_state_event,
    module_states_event,
)
from .lockbox_runtime import TrustedModelError
from .scope import SCOPE_DATA_LENGTH, clamp_sample_count
from .session import WebSession
from .settings import ServerSettings
from .profiles import ProfileConflict
from .streams import StreamFailure, StreamFanout
from .measurements import ScopeAverage, SpectrumAverage, resize_scope_frame, spectrum_average_bytes, spectrum_snapshot_arrays
from .modules import SPECTRUM_WINDOWS


class RegisterReadRequest(BaseModel):
    addr: int = Field(ge=0)
    length: int = Field(ge=1, le=65535)


class RegisterWriteRequest(BaseModel):
    addr: int = Field(ge=0)
    values: list[int]


class ModuleAttributeWriteRequest(BaseModel):
    value: Any


class SamplerStatsRequest(BaseModel):
    signal: str = "in1"
    duration: float = Field(default=1e-2, ge=0.0, le=10.0)


class WorkspaceWriteRequest(BaseModel):
    workspace: dict[str, Any]


class LockboxClassRequest(BaseModel):
    classname: str


class CurveCreateRequest(BaseModel):
    x: list[float]
    y: list[float]
    y_imag: list[float] | None = None
    params: dict[str, Any] = Field(default_factory=dict)


class CurveCreateEnvelope(CurveCreateRequest):
    # Keep the documented numeric-array schema above, but validate samples in
    # NumPy below. Pydantic 1's list[float] visits every point in Python on ARM.
    x: list
    y: list
    y_imag: list | None = None


@dataclass
class CurvePayload:
    x: np.ndarray
    y: np.ndarray
    y_imag: np.ndarray | None
    params: dict[str, Any]


class CurveBinaryHeader(BaseModel):
    points: int = Field(gt=0)
    complex: bool = False
    params: dict[str, Any] = Field(default_factory=dict)


def _parse_curve_payload(body: bytes, binary: bool = False) -> CurvePayload:
    parser = getattr(CurveCreateEnvelope, "model_validate_json", None) or CurveCreateEnvelope.parse_raw
    try:
        if binary:
            # PYC1, uint32 LE JSON-header length, UTF-8 header, then contiguous
            # float64 LE x/y[/imag] arrays. No decimal sample conversion needed.
            if len(body) < 8 or body[:4] != b"PYC1":
                raise ValueError("invalid binary curve header")
            header_size = struct.unpack_from("<I", body, 4)[0]
            offset = 8 + header_size
            header = CurveBinaryHeader(**json.loads(body[8:offset]))
            columns = 3 if header.complex else 2
            if len(body) != offset + header.points * columns * 8:
                raise ValueError("binary curve length does not match header")
            arrays = np.frombuffer(body, dtype="<f8", count=header.points * columns, offset=offset)
            arrays = arrays.reshape(columns, header.points).copy()
            payload = CurvePayload(arrays[0], arrays[1], arrays[2] if header.complex else None, header.params)
        else:
            payload = parser(body)
    except ValidationError as exc:
        errors = [{**error, "loc": ("body", *error["loc"])} for error in exc.errors()]
        raise RequestValidationError(errors) from exc
    except (TypeError, ValueError, UnicodeError) as exc:
        raise RequestValidationError([{"loc": ("body",), "msg": str(exc), "type": "value_error"}]) from exc
    converted = {}
    for name in ("x", "y", "y_imag"):
        values = getattr(payload, name)
        if values is None:
            continue
        try:
            array = np.asarray(values, dtype=np.float64)
            if array.ndim != 1 or not np.isfinite(array).all():
                raise ValueError("samples must be finite numbers in a one-dimensional array")
            converted[name] = array
        except (TypeError, ValueError, OverflowError) as exc:
            raise RequestValidationError([{
                "loc": ("body", name), "msg": str(exc), "type": "value_error",
            }]) from exc
    return CurvePayload(converted["x"], converted["y"], converted.get("y_imag"), payload.params)


async def parse_curve_request(request: Request) -> CurvePayload:
    # ARM uses pure-Python Pydantic: validating hundreds of thousands of samples
    # on the event loop freezes every HTTP and WebSocket client during a save.
    body = await request.body()
    binary = request.headers.get("content-type", "").split(";", 1)[0].strip() == "application/octet-stream"
    return await asyncio.to_thread(_parse_curve_payload, body, binary)


class CurveParamsRequest(BaseModel):
    params_yaml: str


class ConfigBranchWriteRequest(BaseModel):
    text: str


class ControlClaimRequest(BaseModel):
    label: str | None = None
    force: bool = False


class ProfileSaveRequest(BaseModel):
    name: str | None = None
    workspace: dict[str, Any] | None = None
    plot_views: dict[str, Any] | None = None


class ProfileRenameRequest(BaseModel):
    name: str


_CONTROL_WRITE_MESSAGES = {
    "workspace.set",
    "module.set",
    "module.action",
    "module.state.save",
    "module.state.load",
    "module.state.delete",
    "register.write",
}


def _request_client_identity(request: Request) -> tuple[str, str | None]:
    host = request.client.host if request.client is not None else "unknown"
    client_id = request.headers.get("x-pyrpl-client-id") or request.cookies.get("pyrpl_control_client")
    return normalize_client_id(client_id or f"legacy:{host}"), request.headers.get("x-pyrpl-client-label")


def _websocket_client_identity(websocket: WebSocket) -> tuple[str, str | None]:
    host = websocket.client.host if websocket.client is not None else "unknown"
    client_id = (
        websocket.headers.get("x-pyrpl-client-id")
        or websocket.cookies.get("pyrpl_control_client")
        or websocket.query_params.get("client_id")
    )
    label = websocket.headers.get("x-pyrpl-client-label") or websocket.query_params.get("client_label")
    return normalize_client_id(client_id or f"legacy:{host}"), label


def _request_requires_control(request: Request) -> bool:
    if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return False
    path = request.url.path
    if path.startswith("/api/control"):
        return False
    return path not in {"/api/sampler/stats", "/api/register/read"}


def _message_id(message: dict[str, Any]) -> Any:
    return message.get("id")


def _control_error(message: dict[str, Any], code: str, detail: str) -> dict[str, Any]:
    return {"id": _message_id(message), "ok": False, "error": {"code": code, "detail": detail}}


async def handle_control_message(
    session: WebSession,
    message: dict[str, Any],
    events: EventBroker | None = None,
    on_module_action: Callable[[str, str], Callable[[], None] | None] | None = None,
) -> dict[str, Any]:
    """Handle one JSON control message from the browser."""

    command = message.get("type")
    if command == "ping":
        return {"id": _message_id(message), "ok": True, "type": "pong"}

    if command == "session.get":
        return {"id": _message_id(message), "ok": True, "type": "session", "session": session.info()}

    if command == "workspace.get":
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "workspace",
            "workspace": session.workspace_state(),
        }

    if command == "workspace.set":
        try:
            workspace = session.save_workspace_state(message.get("workspace", {}))
        except (TypeError, ValueError) as exc:
            return _control_error(message, "bad_request", str(exc))
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "workspace",
            "workspace": workspace,
        }

    if command == "module.list":
        return {"id": _message_id(message), "ok": True, "type": "module.list", "modules": session.modules()}

    if command == "module.attributes":
        try:
            module_name = str(message["module"])
            attributes = session.module_attributes(module_name)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or attribute {exc}")
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.attributes",
            "module": module_name,
            "attributes": attributes,
        }

    if command == "module.get":
        try:
            module_name = str(message["module"])
            attribute = str(message["attribute"])
            value = session.get_module_attribute(module_name, attribute)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or attribute {exc}")
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.value",
            "module": module_name,
            "attribute": attribute,
            "value": value,
        }

    if command == "module.set":
        try:
            module_name = str(message["module"])
            attribute = str(message["attribute"])
            value = session.set_module_attribute(module_name, attribute, message.get("value"))
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or attribute {exc}")
        except (TypeError, ValueError) as exc:
            return _control_error(message, "bad_request", str(exc))
        if events is not None:
            await events.publish(module_attribute_event(module_name, attribute, value))
            if module_name in {"spectrumanalyzer", "networkanalyzer"}:
                state = await asyncio.to_thread(session.module_state, module_name)
                await events.publish(module_state_event(module_name, state))
                for resource_module in _resource_event_modules(module_name, state):
                    await events.publish(module_state_event(resource_module, await asyncio.to_thread(session.module_state, resource_module)))
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.value",
            "module": module_name,
            "attribute": attribute,
            "value": value,
        }

    if command == "module.actions":
        try:
            module_name = str(message["module"])
            actions = session.module_actions(module_name)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module {exc}")
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.actions",
            "module": module_name,
            "actions": actions,
        }

    if command == "module.action":
        complete_action = None
        try:
            module_name = str(message["module"])
            action = str(message["action"])
            if on_module_action is not None:
                complete_action = on_module_action(module_name, action)
            state = await asyncio.to_thread(session.call_module_action, module_name, action)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or action {exc}")
        except (TypeError, ValueError) as exc:
            return _control_error(message, "bad_request", str(exc))
        finally:
            if complete_action is not None:
                complete_action()
        if events is not None:
            await events.publish(module_action_event(module_name, action, state))
            await events.publish(module_state_event(module_name, state))
            for resource_module in _resource_event_modules(module_name, state):
                await events.publish(module_state_event(resource_module, await asyncio.to_thread(session.module_state, resource_module)))
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.action",
            "module": module_name,
            "action": action,
            "state": state,
        }

    if command == "module.states":
        try:
            module_name = str(message["module"])
            states = session.module_states(module_name)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module {exc}")
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "module.states",
            "module": module_name,
            "states": states,
        }

    if command in {"module.state.save", "module.state.load", "module.state.delete"}:
        try:
            module_name = str(message["module"])
            state_name = str(message["state"])
            if command == "module.state.save":
                state_record = session.save_module_state(module_name, state_name)
                response_type = "module.state.saved"
            elif command == "module.state.load":
                state = session.load_module_state(module_name, state_name)
                state_record = {"name": state_name, "state": state}
                response_type = "module.state.loaded"
            else:
                state_record = session.delete_module_state(module_name, state_name)
                response_type = "module.state.deleted"
            states = session.module_states(module_name)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or state {exc}")
        if events is not None:
            await events.publish(module_states_event(module_name, states))
            if command == "module.state.load":
                await events.publish(module_state_event(module_name, state_record["state"]))
        return {
            "id": _message_id(message),
            "ok": True,
            "type": response_type,
            "module": module_name,
            "state": state_record,
            "states": states,
        }

    if command == "register.read":
        try:
            addr = int(message["addr"])
            length = int(message["length"])
        except (KeyError, TypeError, ValueError):
            return _control_error(message, "bad_request", "register.read requires integer addr and length")
        if addr < 0 or not 1 <= length <= 65535:
            return _control_error(message, "bad_request", "addr must be >= 0 and length must be 1..65535")
        values = await asyncio.to_thread(session.read_registers, addr, length)
        return {
            "id": _message_id(message),
            "ok": True,
            "type": "register.values",
            "addr": addr,
            "length": length,
            "values": values,
        }

    if command == "register.write":
        try:
            addr = int(message["addr"])
            values = [int(value) for value in message["values"]]
        except (KeyError, TypeError, ValueError):
            return _control_error(message, "bad_request", "register.write requires integer addr and values")
        if addr < 0:
            return _control_error(message, "bad_request", "addr must be >= 0")
        ok = await asyncio.to_thread(session.write_registers, addr, values)
        return {
            "id": _message_id(message),
            "ok": ok,
            "type": "register.written",
            "addr": addr,
            "count": len(values),
        }

    return _control_error(message, "unknown_type", f"Unknown control message type {command!r}")


def _resource_event_modules(module_name: str, state: dict[str, Any]) -> list[str]:
    if module_name not in {"spectrumanalyzer", "networkanalyzer"}:
        return []
    resource_modules = {"iq2", "scope"} if module_name == "spectrumanalyzer" else {"iq0", "iq1", "iq2"}
    resources = state.get("resources")
    if isinstance(resources, list):
        resource_modules.update(str(resource) for resource in resources)
    iq_module = state.get("iq_module")
    if isinstance(iq_module, str):
        resource_modules.add(iq_module)
    return sorted(resource_modules)


def _lockbox_resource_event_modules() -> list[str]:
    return ["asg0", "asg1", "scope", "pid0", "pid1", "pid2", "iq0", "iq1", "iq2", "iir", "pwm0", "pwm1"]


async def control_socket(
    websocket: WebSocket,
    session: WebSession,
    events: EventBroker | None = None,
    on_module_action: Callable[[str, str], Callable[[], None] | None] | None = None,
    coordinator: ControlCoordinator | None = None,
    client_id: str = "legacy:websocket",
    client_label: str | None = None,
) -> None:
    await websocket.accept()
    try:
        while True:
            try:
                message = await websocket.receive_json()
            except ValueError:
                await websocket.send_json(
                    {"id": None, "ok": False, "error": {"code": "bad_json", "detail": "Expected JSON object"}}
                )
                continue
            if not isinstance(message, dict):
                await websocket.send_json(
                    {"id": None, "ok": False, "error": {"code": "bad_json", "detail": "Expected JSON object"}}
                )
                continue
            command = message.get("type")
            if coordinator is not None and command in _CONTROL_WRITE_MESSAGES:
                try:
                    coordinator.require(client_id, client_label)
                except ControlConflict as exc:
                    record = coordinator.record(
                        client_id,
                        "websocket.control",
                        str(command),
                        {"error": str(exc)},
                        False,
                    )
                    if events is not None:
                        await events.publish({"type": "control.audit", "record": record})
                    await websocket.send_json(_control_error(message, "control_conflict", str(exc)))
                    continue
            response = await handle_control_message(session, message, events, on_module_action)
            if coordinator is not None and command in _CONTROL_WRITE_MESSAGES:
                record = coordinator.record(
                    client_id,
                    "websocket.control",
                    str(command),
                    {"response_type": response.get("type")},
                    bool(response.get("ok")),
                )
                if events is not None:
                    await events.publish({"type": "control.audit", "record": record})
                    await events.publish({"type": "control.changed", "control": coordinator.status(client_id)})
            await websocket.send_json(response)
    except WebSocketDisconnect:
        return


async def event_socket(websocket: WebSocket, events: EventBroker) -> None:
    await websocket.accept()
    queue = events.subscribe()
    await websocket.send_json({"ok": True, "type": "events.ready"})

    async def send_events() -> None:
        while True:
            await websocket.send_json(await queue.get())

    async def wait_for_disconnect() -> None:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                return

    sender = asyncio.create_task(send_events())
    receiver = asyncio.create_task(wait_for_disconnect())
    try:
        done, pending = await asyncio.wait({sender, receiver}, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        for task in done:
            try:
                task.result()
            except WebSocketDisconnect:
                pass
    except WebSocketDisconnect:
        return
    finally:
        sender.cancel()
        receiver.cancel()
        events.unsubscribe(queue)


async def stream_fanout_socket(
    websocket: WebSocket,
    queue: asyncio.Queue[Any],
    send_item: Callable[[Any], Any],
    failure_reason: str,
) -> None:
    async def send_items() -> None:
        while True:
            item = await queue.get()
            if isinstance(item, StreamFailure):
                await websocket.close(code=1011, reason=failure_reason)
                return
            await send_item(item)

    async def wait_for_disconnect() -> None:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                return

    sender = asyncio.create_task(send_items())
    receiver = asyncio.create_task(wait_for_disconnect())
    try:
        done, pending = await asyncio.wait({sender, receiver}, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        for task in done:
            try:
                task.result()
            except WebSocketDisconnect:
                pass
    except (asyncio.CancelledError, WebSocketDisconnect):
        return
    finally:
        sender.cancel()
        receiver.cancel()
        await asyncio.gather(sender, receiver, return_exceptions=True)


def create_app(settings: ServerSettings | None = None) -> FastAPI:
    settings = settings or ServerSettings()
    static_dir = Path(__file__).resolve().parent / "static"
    vite_index = WEB_DIST_DIR / "index.html"
    use_vite_frontend = vite_index.exists() and WEB_DIST_ASSETS_DIR.exists()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.events = EventBroker()
        app.state.control = ControlCoordinator(
            settings.control_policy,
            settings.control_lease_seconds,
        )
        loop = asyncio.get_running_loop()
        lockbox_resource_states = {}

        async def publish_lockbox_state_events(schema: dict) -> None:
            await app.state.events.publish(module_state_event("lockbox", schema))
            for module_name in _lockbox_resource_event_modules():
                state = await asyncio.to_thread(app.state.session.module_state, module_name)
                if lockbox_resource_states.get(module_name) != state:
                    lockbox_resource_states[module_name] = state
                    await app.state.events.publish(module_state_event(module_name, state))

        def publish_lockbox_state(schema: dict) -> None:
            loop.call_soon_threadsafe(
                asyncio.create_task,
                publish_lockbox_state_events(schema),
            )

        app.state.session = WebSession(
            settings,
            lockbox_state_callback=publish_lockbox_state,
        )
        app.state.scope_average = ScopeAverage()
        app.state.spectrum_average = SpectrumAverage()
        app.state.acquisition_sequences = {"scope": 0, "spectrumanalyzer": 0}
        app.state.scope_streams = {SCOPE_DATA_LENGTH: StreamFanout(produce_scope, keep_alive=True)}
        app.state.spectrum_streams = {SCOPE_DATA_LENGTH: StreamFanout(produce_spectrum, keep_alive=True)}
        app.state.network_points = {}
        app.state.network_run_id = -1
        app.state.network_analyzer_stream = StreamFanout(produce_network_analyzer, queue_size=8, keep_alive=True, replay=network_snapshot)
        for stream in (*app.state.scope_streams.values(), *app.state.spectrum_streams.values(), app.state.network_analyzer_stream):
            stream.start()
        status_task = asyncio.create_task(publish_hardware_status())
        try:
            yield
        finally:
            streams = [
                *app.state.scope_streams.values(),
                *app.state.spectrum_streams.values(),
            ]
            if app.state.network_analyzer_stream is not None:
                streams.append(app.state.network_analyzer_stream)
            status_task.cancel()
            await asyncio.gather(status_task, return_exceptions=True)
            await asyncio.gather(*(stream.close() for stream in streams))
            app.state.session.close()

    app = FastAPI(title="PyRPL WebSocket Prototype", version="0.1.0", lifespan=lifespan)

    def valid_token(candidates: list[str | None]) -> bool:
        if not settings.auth_token:
            return True
        return any(
            candidate is not None and secrets.compare_digest(candidate, settings.auth_token)
            for candidate in candidates
        )

    @app.middleware("http")
    async def authenticate_http(request: Request, call_next):
        authorization = request.headers.get("authorization", "")
        bearer = authorization[7:] if authorization.lower().startswith("bearer ") else None
        query_token = request.query_params.get("token")
        if not valid_token([bearer, request.cookies.get("pyrpl_web_token"), query_token]):
            return JSONResponse(status_code=401, content={"detail": "Authentication required"})
        client_id, client_label = _request_client_identity(request)
        request.state.control_client_id = client_id
        if _request_requires_control(request):
            try:
                app.state.control.require(client_id, client_label)
            except ControlConflict as exc:
                record = app.state.control.record(
                    client_id,
                    f"http.{request.method.lower()}",
                    request.url.path,
                    {"error": str(exc)},
                    False,
                )
                await app.state.events.publish({"type": "control.audit", "record": record})
                return JSONResponse(
                    status_code=409,
                    content={"detail": str(exc), "control": app.state.control.status(client_id)},
                )
        response = await call_next(request)
        if _request_requires_control(request):
            record = app.state.control.record(
                client_id,
                f"http.{request.method.lower()}",
                request.url.path,
                {"status_code": response.status_code},
                response.status_code < 400,
            )
            await app.state.events.publish({"type": "control.audit", "record": record})
            await app.state.events.publish(
                {"type": "control.changed", "control": app.state.control.status(client_id)}
            )
        if settings.auth_token and query_token and secrets.compare_digest(query_token, settings.auth_token):
            response.set_cookie(
                "pyrpl_web_token",
                settings.auth_token,
                httponly=True,
                samesite="strict",
                secure=request.url.scheme == "https",
            )
        return response

    async def authenticate_websocket(websocket: WebSocket) -> bool:
        authorization = websocket.headers.get("authorization", "")
        bearer = authorization[7:] if authorization.lower().startswith("bearer ") else None
        candidates = [
            bearer,
            websocket.cookies.get("pyrpl_web_token"),
            websocket.query_params.get("token"),
        ]
        if valid_token(candidates):
            return True
        await websocket.close(code=1008, reason="Authentication required")
        return False

    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    if use_vite_frontend:
        app.mount("/assets", StaticFiles(directory=WEB_DIST_ASSETS_DIR), name="frontend-assets")

    acquisition_start_actions = {"single", "continuous", "resume_single", "resume_continuous"}

    def prepare_acquisition_restart(module_name: str, action: str) -> Callable[[], None] | None:
        if action not in acquisition_start_actions:
            return None
        if module_name == "scope":
            fanouts = list(app.state.scope_streams.values())
        elif module_name == "spectrumanalyzer":
            fanouts = list(app.state.spectrum_streams.values())
        else:
            return None
        for fanout in fanouts:
            fanout.suspend()

        def resume() -> None:
            for fanout in fanouts:
                fanout.resume()

        return resume

    @app.get("/")
    async def index():
        return FileResponse(vite_index if use_vite_frontend else static_dir / "index.html")

    @app.get("/api/health")
    async def health():
        return {"ok": True, "settings": settings.public_dict()}

    @app.get("/api/session")
    async def session_info(request: Request):
        info = app.state.session.info()
        info["control"] = app.state.control.status(request.state.control_client_id)
        return info

    @app.get("/api/control")
    async def control_status(request: Request):
        return app.state.control.status(request.state.control_client_id)

    @app.get("/api/control/audit")
    async def control_audit(limit: int = 100):
        return {"records": app.state.control.audit(limit)}

    @app.post("/api/control/claim")
    async def claim_control(request: Request, claim: ControlClaimRequest):
        try:
            control = app.state.control.claim(
                request.state.control_client_id,
                claim.label,
                force=claim.force,
            )
        except ControlConflict as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        await app.state.events.publish({"type": "control.changed", "control": control})
        return control

    @app.post("/api/control/heartbeat")
    async def heartbeat_control(request: Request):
        return app.state.control.heartbeat(request.state.control_client_id)

    @app.post("/api/control/release")
    async def release_control(request: Request):
        control = app.state.control.release(request.state.control_client_id)
        await app.state.events.publish({"type": "control.changed", "control": control})
        return control

    @app.get("/api/config")
    async def config_info(module: str | None = None):
        try:
            return app.state.session.config_editor(module)
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    async def profile_operation(operation, *args, reason=None, **kwargs):
        try:
            result = await asyncio.to_thread(operation, *args, **kwargs)
        except ProfileConflict as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown profile or setting") from exc
        except (ValueError, TypeError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except OSError as exc:
            raise HTTPException(status_code=503, detail="Profile storage is unavailable") from exc
        if reason:
            await app.state.events.publish({"type": "profiles.changed", "reason": reason, **result})
        return result

    @app.get("/api/profiles")
    async def profiles():
        return await profile_operation(app.state.session.profiles.list)

    @app.post("/api/profiles")
    async def create_profile(request: ProfileSaveRequest):
        if request.name is None:
            raise HTTPException(status_code=400, detail="A profile name is required")
        return await profile_operation(app.state.session.profiles.save, name=request.name,
                                       workspace=request.workspace, plot_views=request.plot_views, reason="saved")

    @app.put("/api/profiles/{profile_id}")
    async def save_profile(profile_id: str, request: ProfileSaveRequest):
        return await profile_operation(app.state.session.profiles.save, profile_id=profile_id,
                                       workspace=request.workspace, plot_views=request.plot_views, reason="saved")

    @app.get("/api/profiles/{profile_id}/download")
    async def download_profile(profile_id: str):
        record = await profile_operation(app.state.session.profiles.export, profile_id)
        return JSONResponse(record, headers={"Content-Disposition": f'attachment; filename="pyrpl-profile-{profile_id}.json"'})

    @app.post("/api/profiles/import")
    async def import_profile(request: Request):
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > 8 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Profile upload exceeds 8 MiB")
        try:
            payload = json.loads(body)
            if not isinstance(payload, dict) or not isinstance(payload.get("profile"), dict):
                raise ValueError("Expected an object containing profile and optional name")
            if payload.get("name") is not None and not isinstance(payload["name"], str):
                raise ValueError("Profile name must be a string")
        except (ValueError, UnicodeError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return await profile_operation(app.state.session.profiles.import_profile, payload["profile"],
                                       name=payload.get("name"), reason="imported")

    @app.patch("/api/profiles/{profile_id}")
    async def rename_profile(profile_id: str, request: ProfileRenameRequest):
        return await profile_operation(app.state.session.profiles.rename, profile_id, request.name, reason="renamed")

    @app.post("/api/profiles/{profile_id}/load")
    async def load_profile(profile_id: str):
        streams = [*app.state.scope_streams.values(), *app.state.spectrum_streams.values(), app.state.network_analyzer_stream]
        for stream in streams:
            stream.suspend()
        try:
            result = await profile_operation(app.state.session.profiles.load, profile_id)
            for stream in streams:
                stream.clear()
            app.state.network_points = {}
            app.state.network_run_id = -1
            await app.state.events.publish({"type": "profiles.changed", "reason": "loaded", **result})
            return result
        finally:
            for stream in streams:
                stream.resume()

    @app.post("/api/config/branches/{module_name}")
    async def save_config_branch(module_name: str, request: ConfigBranchWriteRequest):
        try:
            schema = app.state.session.save_config_branch(module_name, request.text)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if module_name in {item["name"] for item in app.state.session.modules()}:
            await app.state.events.publish(
                module_state_event(module_name, await asyncio.to_thread(app.state.session.module_state, module_name))
            )
        return schema

    @app.get("/api/workspace")
    async def get_workspace():
        return {"workspace": app.state.session.workspace_state()}

    @app.post("/api/workspace")
    async def save_workspace(request: WorkspaceWriteRequest):
        try:
            workspace = app.state.session.save_workspace_state(request.workspace)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"workspace": workspace}

    @app.get("/api/assets")
    async def assets():
        return asset_info()

    @app.get("/api/modules")
    async def modules():
        return {"modules": app.state.session.modules()}

    @app.post("/api/sampler/stats")
    async def sampler_stats_route(request: SamplerStatsRequest):
        try:
            result = await asyncio.to_thread(
                app.state.session.sampler_stats,
                request.signal,
                request.duration,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return result

    @app.get("/api/lockbox/classes")
    async def lockbox_classes():
        return {"classes": await asyncio.to_thread(app.state.session.lockbox_classes)}

    @app.get("/api/lockbox")
    async def lockbox_schema():
        return await asyncio.to_thread(app.state.session.lockbox_schema)

    @app.post("/api/lockbox/class")
    async def set_lockbox_class(request: LockboxClassRequest):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_class, request.classname)
        except (ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        for resource_module in _lockbox_resource_event_modules():
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return schema

    @app.post("/api/lockbox/attributes/{attribute}")
    async def set_lockbox_attribute(attribute: str, request: ModuleAttributeWriteRequest):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_attribute, attribute, request.value)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox attribute") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.post("/api/lockbox/inputs/{input_name}/attributes/{attribute}")
    async def set_lockbox_input_attribute(input_name: str, attribute: str, request: ModuleAttributeWriteRequest):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_input_attribute, input_name, attribute, request.value)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox input or attribute") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        for resource_module in _lockbox_resource_event_modules():
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return schema

    @app.post("/api/lockbox/inputs/{input_name}/actions/{action}")
    async def call_lockbox_input_action(input_name: str, action: str):
        state = await asyncio.to_thread(app.state.session.module_state, "scope")
        state["owner"] = "lockbox"
        await app.state.events.publish(module_state_event("scope", state))
        try:
            schema = await asyncio.to_thread(app.state.session.call_lockbox_input_action, input_name, action)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox input or action") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        finally:
            await app.state.events.publish(module_state_event("scope", await asyncio.to_thread(app.state.session.module_state, "scope")))
        await app.state.events.publish(module_state_event("lockbox", schema))
        for resource_module in _lockbox_resource_event_modules():
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return schema

    @app.post("/api/lockbox/outputs/{output_name}/attributes/{attribute}")
    async def set_lockbox_output_attribute(output_name: str, attribute: str, request: ModuleAttributeWriteRequest):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_output_attribute, output_name, attribute, request.value)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox output or attribute") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.post("/api/lockbox/stages")
    async def append_lockbox_stage():
        schema = await asyncio.to_thread(app.state.session.append_lockbox_stage)
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.delete("/api/lockbox/stages/{index}")
    async def delete_lockbox_stage(index: int):
        try:
            schema = await asyncio.to_thread(app.state.session.delete_lockbox_stage, index)
        except IndexError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox stage") from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.post("/api/lockbox/stages/{index}/attributes/{attribute}")
    async def set_lockbox_stage_attribute(index: int, attribute: str, request: ModuleAttributeWriteRequest):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_stage_attribute, index, attribute, request.value)
        except (IndexError, KeyError) as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox stage or attribute") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.post("/api/lockbox/stages/{index}/outputs/{output_name}/attributes/{attribute}")
    async def set_lockbox_stage_output_attribute(
        index: int,
        output_name: str,
        attribute: str,
        request: ModuleAttributeWriteRequest,
    ):
        try:
            schema = await asyncio.to_thread(app.state.session.set_lockbox_stage_output_attribute, index, output_name, attribute, request.value)
        except (IndexError, KeyError) as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox stage output or attribute") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        return schema

    @app.post("/api/lockbox/stages/{index}/actions/{action}")
    async def call_lockbox_stage_action(index: int, action: str):
        try:
            await asyncio.to_thread(app.state.session.call_lockbox_stage_action, index, action)
            schema = await asyncio.to_thread(app.state.session.lockbox_schema)
        except (IndexError, KeyError) as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox stage or action") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_state_event("lockbox", schema))
        for resource_module in _lockbox_resource_event_modules():
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return schema

    @app.get("/api/lockbox/actions")
    async def get_lockbox_actions():
        return {"actions": await asyncio.to_thread(app.state.session.lockbox_actions)}

    @app.post("/api/lockbox/actions/{action}")
    async def call_lockbox_action(action: str):
        lockbox_uses_scope = action in {"calibrate_all", "get_analog_offsets"}
        if lockbox_uses_scope:
            state = await asyncio.to_thread(app.state.session.module_state, "scope")
            state["owner"] = "lockbox"
            await app.state.events.publish(module_state_event("scope", state))
        try:
            schema = await asyncio.to_thread(app.state.session.call_lockbox_action, action)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox action") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        finally:
            if lockbox_uses_scope:
                await app.state.events.publish(module_state_event("scope", await asyncio.to_thread(app.state.session.module_state, "scope")))
        await app.state.events.publish(module_action_event("lockbox", action, schema))
        await app.state.events.publish(module_state_event("lockbox", schema))
        for resource_module in _lockbox_resource_event_modules():
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return schema

    @app.get("/api/lockbox/inputs/{input_name}/plot")
    async def lockbox_input_plot(input_name: str, points: int = 200):
        try:
            return await asyncio.to_thread(app.state.session.lockbox_input_plot, input_name, points)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox input") from exc
        except (TypeError, ValueError, TrustedModelError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/api/lockbox/outputs/{output_name}/transfer_function")
    async def lockbox_output_transfer_function(output_name: str, points: int = 200):
        try:
            return await asyncio.to_thread(app.state.session.lockbox_output_transfer_function, output_name, points)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown lockbox output") from exc

    @app.get("/api/modules/{module_name}")
    async def module_state(module_name: str):
        try:
            state = await asyncio.to_thread(app.state.session.module_state, module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"Unknown module {module_name}") from exc
        return {"module": module_name, "state": state}

    @app.get("/api/modules/{module_name}/attributes")
    async def module_attributes(module_name: str):
        try:
            attributes = app.state.session.module_attributes(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"Unknown module {module_name}") from exc
        return {"module": module_name, "attributes": attributes}

    @app.get("/api/modules/{module_name}/actions")
    async def module_actions(module_name: str):
        try:
            actions = app.state.session.module_actions(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"Unknown module {module_name}") from exc
        return {"module": module_name, "actions": actions}

    @app.get("/api/modules/{module_name}/states")
    async def module_states(module_name: str):
        try:
            states = app.state.session.module_states(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"Unknown module {module_name}") from exc
        return {"module": module_name, "states": states}

    @app.get("/api/modules/{module_name}/attributes/{attribute}")
    async def module_attribute(module_name: str, attribute: str):
        try:
            value = app.state.session.get_module_attribute(module_name, attribute)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or attribute") from exc
        return {"module": module_name, "attribute": attribute, "value": value}

    @app.post("/api/modules/{module_name}/attributes/{attribute}")
    async def write_module_attribute(module_name: str, attribute: str, request: ModuleAttributeWriteRequest):
        try:
            value = app.state.session.set_module_attribute(module_name, attribute, request.value)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or attribute") from exc
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await app.state.events.publish(module_attribute_event(module_name, attribute, value))
        if module_name in {"spectrumanalyzer", "networkanalyzer"}:
            state = await asyncio.to_thread(app.state.session.module_state, module_name)
            await app.state.events.publish(module_state_event(module_name, state))
            for resource_module in _resource_event_modules(module_name, state):
                await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return {"module": module_name, "attribute": attribute, "value": value}

    @app.post("/api/modules/{module_name}/actions/{action}")
    async def call_module_action(module_name: str, action: str):
        complete_action = prepare_acquisition_restart(module_name, action)
        try:
            state = await asyncio.to_thread(app.state.session.call_module_action, module_name, action)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or action") from exc
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        finally:
            if complete_action is not None:
                complete_action()
        await app.state.events.publish(module_action_event(module_name, action, state))
        await app.state.events.publish(module_state_event(module_name, state))
        for resource_module in _resource_event_modules(module_name, state):
            await app.state.events.publish(module_state_event(resource_module, await asyncio.to_thread(app.state.session.module_state, resource_module)))
        return {"module": module_name, "action": action, "state": state}

    @app.post("/api/modules/{module_name}/states/{state_name}/save")
    async def save_module_state(module_name: str, state_name: str):
        try:
            state = app.state.session.save_module_state(module_name, state_name)
            states = app.state.session.module_states(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or invalid state name") from exc
        await app.state.events.publish(module_states_event(module_name, states))
        return {"module": module_name, "state": state, "states": states}

    @app.post("/api/modules/{module_name}/states/{state_name}/load")
    async def load_module_state(module_name: str, state_name: str):
        try:
            state = app.state.session.load_module_state(module_name, state_name)
            states = app.state.session.module_states(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or state") from exc
        await app.state.events.publish(module_state_event(module_name, state))
        await app.state.events.publish(module_states_event(module_name, states))
        return {"module": module_name, "state": state, "states": states}

    @app.delete("/api/modules/{module_name}/states/{state_name}")
    async def delete_module_state(module_name: str, state_name: str):
        try:
            state = app.state.session.delete_module_state(module_name, state_name)
            states = app.state.session.module_states(module_name)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or state") from exc
        await app.state.events.publish(module_states_event(module_name, states))
        return {"module": module_name, "state": state, "states": states}

    @app.post("/api/register/read")
    async def read_registers(request: RegisterReadRequest):
        values = await asyncio.to_thread(
            app.state.session.read_registers,
            request.addr,
            request.length,
        )
        return {"addr": request.addr, "length": request.length, "values": values}

    @app.post("/api/register/write")
    async def write_registers(request: RegisterWriteRequest):
        ok = await asyncio.to_thread(
            app.state.session.write_registers,
            request.addr,
            request.values,
        )
        return {"addr": request.addr, "count": len(request.values), "ok": ok}

    @app.get("/api/curves")
    async def curves(limit: int = 100):
        return {"curves": await asyncio.to_thread(app.state.session.curve_list, max(0, min(limit, 100)))}

    @app.post("/api/curves", openapi_extra={
        "requestBody": {"required": True, "content": {
            "application/json": {"schema": (
                CurveCreateRequest.model_json_schema() if hasattr(CurveCreateRequest, "model_json_schema")
                else CurveCreateRequest.schema()
            )},
            "application/octet-stream": {"schema": {"type": "string", "format": "binary"}},
        }},
    })
    def create_curve(request: CurvePayload = Depends(parse_curve_request), include_data: bool = True):
        try:
            curve = app.state.session.create_curve(
                request.x,
                request.y,
                request.y_imag,
                request.params,
            )
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if not include_data:
            curve = {key: curve[key] for key in ("pk", "name", "points", "complex")}
        # CurveStore already returns JSON-compatible values. Returning a response
        # avoids FastAPI walking every sample again on the event-loop thread.
        # This synchronous endpoint also runs persistence/serialization in a worker.
        return JSONResponse({"curve": curve})

    @app.get("/api/curves/{pk}")
    def curve(pk: int):
        try:
            result = app.state.session.curve(pk)
        except (OSError, EOFError, TypeError, ValueError) as exc:
            raise HTTPException(status_code=404, detail=f"Unknown curve {pk}") from exc
        return JSONResponse({"curve": result})

    @app.put("/api/curves/{pk}/params")
    def update_curve_params(pk: int, request: CurveParamsRequest):
        try:
            result = app.state.session.update_curve_params(pk, request.params_yaml)
        except (OSError, EOFError) as exc:
            raise HTTPException(status_code=404, detail=f"Unknown curve {pk}") from exc
        except (TypeError, ValueError, yaml.YAMLError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return JSONResponse({"curve": result})

    @app.delete("/api/curves/{pk}")
    async def delete_curve(pk: int):
        try:
            await asyncio.to_thread(app.state.session.delete_curve, pk)
        except (OSError, EOFError, TypeError, ValueError) as exc:
            raise HTTPException(status_code=404, detail=f"Unknown curve {pk}") from exc
        return {"pk": pk, "deleted": True}

    @app.get("/api/scope/frame")
    async def scope_frame(samples: int = SCOPE_DATA_LENGTH):
        sample_count = clamp_sample_count(samples)
        frame = app.state.scope_streams[SCOPE_DATA_LENGTH].latest
        if frame is None:
            return Response(status_code=204)
        return Response(resize_scope_frame(frame, sample_count), media_type="application/octet-stream")

    @app.get("/api/spectrumanalyzer/frame")
    async def spectrum_frame(window: str = "blackman"):
        if window not in SPECTRUM_WINDOWS:
            raise HTTPException(status_code=422, detail="Invalid spectrum window")
        snapshot = app.state.spectrum_streams[SCOPE_DATA_LENGTH].latest
        if snapshot is None:
            return Response(status_code=204)
        return await asyncio.to_thread(spectrum_snapshot_arrays, snapshot, window)

    @app.get("/api/modules/iir/plot")
    async def iir_plot(points: int = 1000, tf_type: str | None = None, data_curve: int | None = None,
                       plot_data: bool | None = None, plot_data_times_filter: bool | None = None,
                       plot_measurement: bool | None = None):
        view = {name: value for name, value in {
            "tf_type": tf_type, "data_curve": data_curve, "plot_data": plot_data,
            "plot_data_times_filter": plot_data_times_filter, "plot_measurement": plot_measurement,
        }.items() if value is not None}
        try:
            return await asyncio.to_thread(app.state.session.iir_plot, points, view)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.websocket("/ws/control")
    async def control(websocket: WebSocket):
        if not await authenticate_websocket(websocket):
            return
        client_id, client_label = _websocket_client_identity(websocket)
        await control_socket(
            websocket,
            app.state.session,
            app.state.events,
            prepare_acquisition_restart,
            app.state.control,
            client_id,
            client_label,
        )

    @app.websocket("/ws/events")
    async def events(websocket: WebSocket):
        if not await authenticate_websocket(websocket):
            return
        await event_socket(websocket, app.state.events)

    async def produce_scope(publish, active) -> None:
        average = app.state.scope_average
        previous_state = None
        while active():
            session = app.state.session
            if session.scope_settings.running_state.startswith("running_") or session._scope_calibration_is_active() or session._scope_calibration_frame_pending:
                acquisition = await asyncio.to_thread(session.acquire_scope_frame, app.state.acquisition_sequences["scope"], SCOPE_DATA_LENGTH)
                if acquisition.frame is not None:
                    state = session.scope_settings
                    publish(average.add(acquisition.frame, session.acquisition_revision["scope"], state.trace_average, session._hardware_rolling_mode_active(state.running_state)))
                    app.state.acquisition_sequences["scope"] += 1
                    snapshot = await asyncio.to_thread(session.module_state, "scope")
                    if snapshot != previous_state:
                        await app.state.events.publish(module_state_event("scope", snapshot))
                        previous_state = snapshot
            await asyncio.sleep(settings.scope_interval)

    async def produce_spectrum(publish, active) -> None:
        average = app.state.spectrum_average
        previous_state = None
        while active():
            session = app.state.session
            # Capture metadata before completion releases Scope/IQ resources.
            state = deepcopy(session.spectrum_settings)
            revision = session.acquisition_revision["spectrumanalyzer"]
            frame = await asyncio.to_thread(session.acquire_spectrum_scope_frame, app.state.acquisition_sequences["spectrumanalyzer"], SCOPE_DATA_LENGTH)
            if frame is not None:
                state.iq_bandwidth = list(session.spectrum_settings.iq_bandwidth)
                snapshot = await asyncio.to_thread(average.add, frame, revision, state)
                publish(snapshot)
                app.state.acquisition_sequences["spectrumanalyzer"] += 1
                state = await asyncio.to_thread(session.module_state, "spectrumanalyzer")
                if state != previous_state:
                    await publish_acquisition_state("spectrumanalyzer")
                    previous_state = state
            await asyncio.sleep(settings.scope_interval)

    def network_snapshot():
        return {"snapshot": list(app.state.network_points.values())} if app.state.network_points else None

    async def produce_network_analyzer(publish, active) -> None:
        while active():
            point = await asyncio.to_thread(app.state.session.acquire_network_analyzer_point)
            if point is not None:
                if point["run_id"] != app.state.network_run_id:
                    app.state.network_points = {}
                    app.state.network_run_id = point["run_id"]
                app.state.network_points[point["index"]] = point
                publish(network_snapshot() if point["scan_complete"] else point)
                if point["scan_complete"]:
                    await publish_acquisition_state("networkanalyzer")
            else:
                await asyncio.sleep(0.05)

    async def publish_acquisition_state(module):
        state = await asyncio.to_thread(app.state.session.module_state, module)
        await app.state.events.publish(module_state_event(module, state))
        for resource in _resource_event_modules(module, state):
            await app.state.events.publish(module_state_event(resource, await asyncio.to_thread(app.state.session.module_state, resource)))

    async def publish_hardware_status():
        previous = {}
        while True:
            for module in ("pid0", "pid1", "pid2", "trig"):
                state = await asyncio.to_thread(app.state.session.module_state, module)
                attribute = "armed" if module == "trig" else "ival"
                value = state[attribute]
                if previous.get(module) != value:
                    await app.state.events.publish(module_attribute_event(module, attribute, value))
                    previous[module] = value
            await asyncio.sleep(0.25)

    @app.websocket("/ws/scope")
    async def scope_stream(websocket: WebSocket):
        if not await authenticate_websocket(websocket):
            return
        sample_count = SCOPE_DATA_LENGTH
        try:
            query_count = websocket.query_params.get("samples")
            if query_count is not None:
                sample_count = clamp_sample_count(int(query_count))
        except ValueError:
            await websocket.close(code=1008, reason="Invalid sample count")
            return

        fanout = app.state.scope_streams[SCOPE_DATA_LENGTH]
        queue = fanout.subscribe()
        await websocket.accept()
        try:
            await stream_fanout_socket(websocket, queue, lambda frame: websocket.send_bytes(resize_scope_frame(frame, sample_count)), "Scope acquisition failed")
        finally:
            fanout.unsubscribe(queue)

    @app.websocket("/ws/spectrumanalyzer")
    async def spectrum_stream(websocket: WebSocket):
        if not await authenticate_websocket(websocket):
            return
        sample_count = 4096
        try:
            query_count = websocket.query_params.get("samples")
            if query_count is not None:
                sample_count = clamp_sample_count(int(query_count))
        except ValueError:
            await websocket.close(code=1008, reason="Invalid sample count")
            return

        window = websocket.query_params.get("window", "blackman")
        if window not in SPECTRUM_WINDOWS:
            await websocket.close(code=1008, reason="Invalid spectrum window")
            return
        fanout = app.state.spectrum_streams[SCOPE_DATA_LENGTH]
        queue = fanout.subscribe()
        await websocket.accept()
        try:
            await stream_fanout_socket(websocket, queue, lambda snapshot: websocket.send_bytes(spectrum_average_bytes(snapshot, window)), "Spectrum acquisition failed")
        finally:
            fanout.unsubscribe(queue)

    @app.websocket("/ws/networkanalyzer")
    async def network_analyzer_stream(websocket: WebSocket):
        if not await authenticate_websocket(websocket):
            return
        fanout = app.state.network_analyzer_stream
        queue = fanout.subscribe()
        await websocket.accept()
        try:
            await stream_fanout_socket(websocket, queue, websocket.send_json, "Network Analyzer acquisition failed")
        finally:
            fanout.unsubscribe(queue)

    return app


app = create_app()
