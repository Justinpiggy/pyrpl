"""Multi-client write ownership and bounded control audit records."""

from __future__ import annotations

import time
from collections import deque
from datetime import datetime, timezone
from threading import Lock
from typing import Any


class ControlConflict(RuntimeError):
    """Raised when an observer attempts to mutate server state."""


class ControlCoordinator:
    """Own a renewable single-writer lease while preserving a shared mode."""

    def __init__(self, policy: str = "single-writer", lease_seconds: float = 30.0, audit_size: int = 500):
        if policy not in {"single-writer", "shared"}:
            raise ValueError(f"Unknown control policy {policy!r}")
        self.policy = policy
        self.lease_seconds = max(5.0, float(lease_seconds))
        self._lock = Lock()
        self._controller_id: str | None = None
        self._controller_label: str | None = None
        self._last_seen = 0.0
        self._sequence = 0
        self._audit: deque[dict[str, Any]] = deque(maxlen=max(10, int(audit_size)))

    def status(self, client_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            self._expire_no_lock(time.monotonic())
            return self._status_no_lock(client_id)

    def claim(self, client_id: str, label: str | None = None, *, force: bool = False) -> dict[str, Any]:
        client_id = normalize_client_id(client_id)
        label = normalize_client_label(label)
        with self._lock:
            now = time.monotonic()
            self._expire_no_lock(now)
            if self.policy == "shared":
                return self._status_no_lock(client_id)
            if self._controller_id not in {None, client_id} and not force:
                raise ControlConflict(self._conflict_detail_no_lock())
            previous = self._controller_id
            self._controller_id = client_id
            self._controller_label = label or self._controller_label or "Browser"
            self._last_seen = now
            operation = "control.takeover" if previous not in {None, client_id} else "control.claim"
            self._append_no_lock(client_id, operation, "/api/control", {"previous": previous}, True)
            return self._status_no_lock(client_id)

    def require(self, client_id: str, label: str | None = None) -> dict[str, Any]:
        client_id = normalize_client_id(client_id)
        label = normalize_client_label(label)
        with self._lock:
            now = time.monotonic()
            self._expire_no_lock(now)
            if self.policy == "shared":
                return self._status_no_lock(client_id)
            if self._controller_id is None:
                self._controller_id = client_id
                self._controller_label = label or "API client"
                self._last_seen = now
                self._append_no_lock(client_id, "control.claim", "implicit", {}, True)
            elif self._controller_id != client_id:
                raise ControlConflict(self._conflict_detail_no_lock())
            else:
                self._last_seen = now
                if label:
                    self._controller_label = label
            return self._status_no_lock(client_id)

    def heartbeat(self, client_id: str) -> dict[str, Any]:
        client_id = normalize_client_id(client_id)
        with self._lock:
            now = time.monotonic()
            self._expire_no_lock(now)
            if self.policy == "single-writer" and self._controller_id == client_id:
                self._last_seen = now
            return self._status_no_lock(client_id)

    def release(self, client_id: str) -> dict[str, Any]:
        client_id = normalize_client_id(client_id)
        with self._lock:
            self._expire_no_lock(time.monotonic())
            if self.policy == "single-writer" and self._controller_id == client_id:
                self._append_no_lock(client_id, "control.release", "/api/control", {}, True)
                self._controller_id = None
                self._controller_label = None
                self._last_seen = 0.0
            return self._status_no_lock(client_id)

    def record(
        self,
        client_id: str,
        operation: str,
        target: str,
        detail: dict[str, Any] | None = None,
        ok: bool = True,
    ) -> dict[str, Any]:
        with self._lock:
            return self._append_no_lock(
                normalize_client_id(client_id),
                str(operation),
                str(target),
                dict(detail or {}),
                bool(ok),
            )

    def audit(self, limit: int = 100) -> list[dict[str, Any]]:
        with self._lock:
            count = max(1, min(int(limit), len(self._audit) or 1, 500))
            return list(self._audit)[-count:]

    def _expire_no_lock(self, now: float) -> None:
        if (
            self.policy == "single-writer"
            and self._controller_id is not None
            and now - self._last_seen >= self.lease_seconds
        ):
            expired = self._controller_id
            self._append_no_lock(expired, "control.expired", "/api/control", {}, True)
            self._controller_id = None
            self._controller_label = None
            self._last_seen = 0.0

    def _status_no_lock(self, client_id: str | None) -> dict[str, Any]:
        if self.policy == "shared":
            role = "shared"
            remaining = None
        else:
            role = "controller" if client_id is not None and client_id == self._controller_id else "observer"
            remaining = (
                max(0.0, self.lease_seconds - (time.monotonic() - self._last_seen))
                if self._controller_id is not None
                else 0.0
            )
        return {
            "policy": self.policy,
            "role": role,
            "controller": (
                {"id": self._controller_id, "label": self._controller_label}
                if self._controller_id is not None
                else None
            ),
            "lease_seconds": self.lease_seconds,
            "lease_remaining": remaining,
        }

    def _conflict_detail_no_lock(self) -> str:
        label = self._controller_label or "another client"
        return f"Hardware control is currently owned by {label}. Use Take Control to transfer the lease."

    def _append_no_lock(
        self,
        client_id: str,
        operation: str,
        target: str,
        detail: dict[str, Any],
        ok: bool,
    ) -> dict[str, Any]:
        self._sequence += 1
        record = {
            "sequence": self._sequence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "client_id": client_id,
            "operation": operation,
            "target": target,
            "detail": detail,
            "ok": ok,
        }
        self._audit.append(record)
        return dict(record)


def normalize_client_id(value: str | None) -> str:
    normalized = str(value or "").strip()
    if not normalized:
        raise ValueError("A control client id is required")
    if len(normalized) > 128:
        raise ValueError("Control client id must be at most 128 characters")
    return normalized


def normalize_client_label(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized[:80] or None
