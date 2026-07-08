"""Command-line entry point for the PyRPL websocket prototype."""

from __future__ import annotations

import argparse

import uvicorn

from .app import create_app
from .settings import ServerSettings


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
        help="Optional JSON file for persisted web module states.",
    )
    args = parser.parse_args()
    settings = ServerSettings(
        hostname=args.hostname,
        port=args.port,
        bind_host=args.bind_host,
        bind_port=args.bind_port,
        scope_interval=args.scope_interval,
        state_file=args.state_file,
    )
    uvicorn.run(
        create_app(settings),
        host=settings.bind_host,
        port=settings.bind_port,
        ws="wsproto",
    )


if __name__ == "__main__":
    main()
