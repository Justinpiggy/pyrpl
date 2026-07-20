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
        asset_prefix = "pyrpl_websocket/frontend/assets/"
        assets = [name for name in names if name.startswith(asset_prefix)]
        if not assets:
            raise SystemExit("wheel is missing compiled frontend assets")
        main_scripts = [name for name in assets if name.rsplit("/", 1)[-1].startswith("index-") and name.endswith(".js")]
        workers = [name for name in assets if "/spectrum-worker-" in name and name.endswith(".js")]
        if len(main_scripts) != 1:
            raise SystemExit(f"wheel must contain exactly one compiled frontend script, found {main_scripts}")
        if len(workers) != 1:
            raise SystemExit(f"wheel must contain exactly one Spectrum FFT worker, found {workers}")
        entry_points_name = next(name for name in names if name.endswith(".dist-info/entry_points.txt"))
        entry_points = archive.read(entry_points_name).decode("utf-8")
        for command in ["pyrpl-web =", "pyrpl-web-audit =", "pyrpl-web-validate-hardware ="]:
            if command not in entry_points:
                raise SystemExit(f"wheel is missing console command: {command[:-2]}")
    print(f"verified web wheel: {wheel}")


if __name__ == "__main__":
    main()
