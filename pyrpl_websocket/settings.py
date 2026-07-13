"""Runtime settings for the PyRPL websocket server."""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass
class ServerSettings:
    """Configuration for a single web-server process."""

    hostname: str = "_FAKE_"
    port: int = 2222
    bind_host: str = "127.0.0.1"
    bind_port: int = 8000
    scope_interval: float = 0.05
    state_file: str | None = None
    config: str | None = None
    source: str | None = None
    curve_dir: str | None = None
    auth_token: str | None = None

    @property
    def fake(self) -> bool:
        return self.hostname in {"_FAKE_", "_FAKE_REDPITAYA_"}

    def public_dict(self) -> dict:
        values = asdict(self)
        values.pop("auth_token", None)
        values["auth_enabled"] = bool(self.auth_token)
        return values
