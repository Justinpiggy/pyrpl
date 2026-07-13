"""Command-line entry point for the PyRPL websocket prototype."""

from __future__ import annotations

import argparse
import logging
import os

import uvicorn

from .app import create_app
from .config import DEFAULT_CONFIG_NAME
from .settings import ServerSettings


LOGGER = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the PyRPL websocket server.")
    parser.add_argument("--hostname", default="_FAKE_", help="Red Pitaya hostname or _FAKE_.")
    parser.add_argument("--port", type=int, default=2222, help="monitor_server TCP port.")
    parser.add_argument("--bind-host", default="127.0.0.1", help="HTTP bind host.")
    parser.add_argument("--bind-port", type=int, default=8000, help="HTTP bind port.")
    parser.add_argument(
        "--scope-interval",
        type=float,
        default=0.05,
        help="Delay between scope WebSocket frames in seconds.",
    )
    parser.add_argument(
        "--state-file",
        default=None,
        help="Deprecated JSON state file. Use --config for PyRPL-compatible YAML.",
    )
    parser.add_argument(
        "--config",
        default=None,
        help="PyRPL-compatible YAML config name or path. Defaults to pyrpl-websocket.yml in PYRPL_USER_DIR/config.",
    )
    parser.add_argument(
        "--source",
        default=None,
        help="Optional PyRPL-compatible source config copied when --config does not exist.",
    )
    parser.add_argument(
        "--curve-dir",
        default=None,
        help="PyRPL-compatible curve directory. Defaults to PYRPL_USER_DIR/curve.",
    )
    parser.add_argument(
        "--auth-token",
        default=os.environ.get("PYRPL_WEB_TOKEN"),
        help="Optional HTTP/WebSocket token. Prefer PYRPL_WEB_TOKEN to avoid shell history.",
    )
    args = parser.parse_args()
    settings = ServerSettings(
        hostname=args.hostname,
        port=args.port,
        bind_host=args.bind_host,
        bind_port=args.bind_port,
        scope_interval=args.scope_interval,
        state_file=args.state_file,
        config=args.config if args.config is not None else DEFAULT_CONFIG_NAME,
        source=args.source,
        curve_dir=args.curve_dir,
        auth_token=args.auth_token,
    )
    if settings.bind_host not in {"127.0.0.1", "::1", "localhost"} and not settings.auth_token:
        LOGGER.warning(
            "PyRPL hardware control is exposed on %s without authentication. "
            "Use --auth-token/PYRPL_WEB_TOKEN or bind to loopback.",
            settings.bind_host,
        )
    uvicorn.run(
        create_app(settings),
        host=settings.bind_host,
        port=settings.bind_port,
        ws="wsproto",
    )


if __name__ == "__main__":
    main()
