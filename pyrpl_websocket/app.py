"""FastAPI application for the PyRPL websocket prototype."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from dataclasses import asdict
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .assets import WEB_DIST_ASSETS_DIR, WEB_DIST_DIR, asset_info
from .events import (
    EventBroker,
    module_action_event,
    module_attribute_event,
    module_state_event,
    module_states_event,
)
from .scope import SCOPE_DATA_LENGTH, clamp_sample_count
from .session import WebSession
from .settings import ServerSettings


class RegisterReadRequest(BaseModel):
    addr: int = Field(ge=0)
    length: int = Field(ge=1, le=65535)


class RegisterWriteRequest(BaseModel):
    addr: int = Field(ge=0)
    values: list[int]


class ModuleAttributeWriteRequest(BaseModel):
    value: Any


def _message_id(message: dict[str, Any]) -> Any:
    return message.get("id")


def _control_error(message: dict[str, Any], code: str, detail: str) -> dict[str, Any]:
    return {"id": _message_id(message), "ok": False, "error": {"code": code, "detail": detail}}


async def handle_control_message(
    session: WebSession,
    message: dict[str, Any],
    events: EventBroker | None = None,
) -> dict[str, Any]:
    """Handle one JSON control message from the browser."""

    command = message.get("type")
    if command == "ping":
        return {"id": _message_id(message), "ok": True, "type": "pong"}

    if command == "session.get":
        return {"id": _message_id(message), "ok": True, "type": "session", "session": session.info()}

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
        try:
            module_name = str(message["module"])
            action = str(message["action"])
            state = session.call_module_action(module_name, action)
        except KeyError as exc:
            return _control_error(message, "not_found", f"Unknown module or action {exc}")
        if events is not None:
            await events.publish(module_action_event(module_name, action, state))
            await events.publish(module_state_event(module_name, state))
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


async def control_socket(websocket: WebSocket, session: WebSession, events: EventBroker | None = None) -> None:
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
            await websocket.send_json(await handle_control_message(session, message, events))
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


def create_app(settings: ServerSettings | None = None) -> FastAPI:
    settings = settings or ServerSettings()
    static_dir = Path(__file__).resolve().parent / "static"
    vite_index = WEB_DIST_DIR / "index.html"
    use_vite_frontend = vite_index.exists() and WEB_DIST_ASSETS_DIR.exists()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.session = WebSession(settings)
        app.state.events = EventBroker()
        try:
            yield
        finally:
            app.state.session.close()

    app = FastAPI(title="PyRPL WebSocket Prototype", version="0.1.0", lifespan=lifespan)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    if use_vite_frontend:
        app.mount("/assets", StaticFiles(directory=WEB_DIST_ASSETS_DIR), name="frontend-assets")

    @app.get("/")
    async def index():
        return FileResponse(vite_index if use_vite_frontend else static_dir / "index.html")

    @app.get("/api/health")
    async def health():
        return {"ok": True, "settings": asdict(settings)}

    @app.get("/api/session")
    async def session_info():
        return app.state.session.info()

    @app.get("/api/assets")
    async def assets():
        return asset_info()

    @app.get("/api/modules")
    async def modules():
        return {"modules": app.state.session.modules()}

    @app.get("/api/modules/{module_name}")
    async def module_state(module_name: str):
        try:
            state = app.state.session.module_state(module_name)
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
        return {"module": module_name, "attribute": attribute, "value": value}

    @app.post("/api/modules/{module_name}/actions/{action}")
    async def call_module_action(module_name: str, action: str):
        try:
            state = app.state.session.call_module_action(module_name, action)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Unknown module or action") from exc
        await app.state.events.publish(module_action_event(module_name, action, state))
        await app.state.events.publish(module_state_event(module_name, state))
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

    @app.get("/api/scope/frame")
    async def scope_frame(samples: int = SCOPE_DATA_LENGTH):
        sample_count = clamp_sample_count(samples)
        acquisition = await asyncio.to_thread(
            app.state.session.acquire_scope_frame,
            0,
            sample_count,
        )
        if acquisition.state_changed:
            await app.state.events.publish(module_state_event("scope", app.state.session.module_state("scope")))
        if acquisition.frame is None:
            return Response(status_code=204)
        return Response(acquisition.frame.to_bytes(), media_type="application/octet-stream")

    @app.websocket("/ws/control")
    async def control(websocket: WebSocket):
        await control_socket(websocket, app.state.session, app.state.events)

    @app.websocket("/ws/events")
    async def events(websocket: WebSocket):
        await event_socket(websocket, app.state.events)

    @app.websocket("/ws/scope")
    async def scope_stream(websocket: WebSocket):
        await websocket.accept()
        sequence = 0
        sample_count = SCOPE_DATA_LENGTH
        try:
            query_count = websocket.query_params.get("samples")
            if query_count is not None:
                sample_count = clamp_sample_count(int(query_count))
            while True:
                acquisition = await asyncio.to_thread(
                    app.state.session.acquire_scope_frame,
                    sequence,
                    sample_count,
                )
                if acquisition.state_changed:
                    await app.state.events.publish(module_state_event("scope", app.state.session.module_state("scope")))
                if acquisition.frame is not None:
                    await websocket.send_bytes(acquisition.frame.to_bytes())
                    sequence += 1
                await asyncio.sleep(settings.scope_interval)
        except WebSocketDisconnect:
            return

    return app


app = create_app()
