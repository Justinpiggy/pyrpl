"""Single-producer fan-out for acquisition WebSocket observers."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import Any


Producer = Callable[[Callable[[Any], None], Callable[[], bool]], Awaitable[None]]


class StreamFailure:
    def __init__(self, error: Exception):
        self.error = error


class StreamFanout:
    """Run one acquisition producer and deliver each item to all subscribers."""

    def __init__(self, producer: Producer, queue_size: int = 2):
        self._producer = producer
        self._queue_size = max(1, int(queue_size))
        self._subscribers: set[asyncio.Queue[Any]] = set()
        self._task: asyncio.Task[None] | None = None
        self._generation = 0
        self._suspended = False

    def subscribe(self) -> asyncio.Queue[Any]:
        queue: asyncio.Queue[Any] = asyncio.Queue(maxsize=self._queue_size)
        self._subscribers.add(queue)
        self._ensure_running()
        return queue

    def unsubscribe(self, queue: asyncio.Queue[Any]) -> None:
        self._subscribers.discard(queue)

    def has_subscribers(self) -> bool:
        return bool(self._subscribers)

    def suspend(self) -> None:
        self._generation += 1
        self._suspended = True

    def resume(self) -> None:
        self._suspended = False
        self._ensure_running()

    async def close(self) -> None:
        self._subscribers.clear()
        task = self._task
        if task is not None and not task.done():
            try:
                await asyncio.wait_for(asyncio.shield(task), timeout=2.0)
            except asyncio.TimeoutError:
                task.cancel()
        self._task = None

    def _ensure_running(self) -> None:
        if self._suspended or not self._subscribers:
            return
        if self._task is None or self._task.done():
            generation = self._generation
            self._task = asyncio.create_task(self._run(generation))

    async def _run(self, generation: int) -> None:
        failed = False
        try:
            await self._producer(
                self._publish,
                lambda: bool(self._subscribers) and generation == self._generation,
            )
        except Exception as exc:
            failed = True
            self._publish(StreamFailure(exc))
        finally:
            self._task = None
            if not failed:
                self._ensure_running()

    def _publish(self, item: Any) -> None:
        for queue in tuple(self._subscribers):
            if queue.full():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                queue.put_nowait(item)
            except asyncio.QueueFull:
                pass
