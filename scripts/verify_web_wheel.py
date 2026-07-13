"""Verify that a built wheel contains the headless web runtime and frontend."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: verify_web_wheel.py path/to/pyrpl.whl")
    wheel = Path(sys.argv[1])
    with zipfile.ZipFile(wheel) as archive:
        names = set(archive.namelist())
        required = {
            "pyrpl_websocket/frontend/index.html",
            "pyrpl_websocket/__main__.py",
            "pyrpl_websocket/dependency_audit.py",
        }
        missing = sorted(required - names)
        if missing:
            raise SystemExit(f"wheel is missing required files: {missing}")
        if not any(name.startswith("pyrpl_websocket/frontend/assets/") for name in names):
            raise SystemExit("wheel is missing compiled frontend assets")
        entry_points_name = next(name for name in names if name.endswith(".dist-info/entry_points.txt"))
        entry_points = archive.read(entry_points_name).decode("utf-8")
        for command in ["pyrpl-web =", "pyrpl-web-audit ="]:
            if command not in entry_points:
                raise SystemExit(f"wheel is missing console command: {command[:-2]}")
    print(f"verified web wheel: {wheel}")


if __name__ == "__main__":
    main()
