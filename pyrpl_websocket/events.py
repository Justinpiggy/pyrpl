"""Small asyncio event broker for browser-facing status updates."""

from __future__ import annotations

import asyncio
from typing import Any


class EventBroker:
    """Fan out JSON-serializable events to connected websocket clients."""

    def __init__(self, queue_size: int = 100):
        self._queue_size = queue_size
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=self._queue_size)
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(queue)

    async def publish(self, event: dict[str, Any]) -> None:
        for queue in tuple(self._subscribers):
            if queue.full():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass


def module_attribute_event(module: str, attribute: str, value: Any) -> dict[str, Any]:
    return {
        "type": "module.attribute.changed",
        "module": module,
        "attribute": attribute,
        "value": value,
    }


def module_state_event(module: str, state: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "module.state.changed",
        "module": module,
        "state": state,
    }


def module_action_event(module: str, action: str, state: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "module.action",
        "module": module,
        "action": action,
        "state": state,
    }


def module_states_event(module: str, states: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "type": "module.states.changed",
        "module": module,
        "states": states,
    }
