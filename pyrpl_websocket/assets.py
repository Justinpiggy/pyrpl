"""Paths to copied PyRPL assets used by the web migration."""

from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
PYRPL_DIR = REPO_ROOT / "pyrpl"
FPGA_DIR = PYRPL_DIR / "fpga"
MONITOR_SERVER_DIR = PYRPL_DIR / "monitor_server"
MONITOR_SERVER_C = MONITOR_SERVER_DIR / "monitor_server.c"
WEB_DIST_DIR = REPO_ROOT / "web" / "dist"
WEB_DIST_ASSETS_DIR = WEB_DIST_DIR / "assets"


def asset_info() -> dict:
    """Return paths and existence checks for copied legacy assets."""

    return {
        "repo_root": str(REPO_ROOT),
        "pyrpl_dir": str(PYRPL_DIR),
        "fpga_dir": str(FPGA_DIR),
        "monitor_server_dir": str(MONITOR_SERVER_DIR),
        "monitor_server_c": str(MONITOR_SERVER_C),
        "web_dist_dir": str(WEB_DIST_DIR),
        "exists": {
            "pyrpl": PYRPL_DIR.exists(),
            "fpga": FPGA_DIR.exists(),
            "monitor_server": MONITOR_SERVER_DIR.exists(),
            "monitor_server_c": MONITOR_SERVER_C.exists(),
            "web_dist": (WEB_DIST_DIR / "index.html").exists(),
        },
        "note": "These assets are reused from the copied PyRPL tree and are not modified.",
    }
