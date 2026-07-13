"""Audit the headless web runtime for Red Pitaya deployment."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import platform
import sys
from pathlib import Path
from typing import Any


REQUIRED_PACKAGES = ["numpy", "PyYAML", "fastapi", "starlette", "pydantic", "uvicorn", "wsproto", "h11"]
FORBIDDEN_ARM_ACCELERATORS = ["pydantic_core", "uvloop", "httptools", "watchfiles"]


def audit_report(machine: str | None = None, assume_armv7: bool = False) -> dict[str, Any]:
    detected_machine = machine or platform.machine()
    armv7 = assume_armv7 or detected_machine.lower() in {"armv6l", "armv7l", "armhf"}
    packages = {name: _version(name) for name in [*REQUIRED_PACKAGES, *FORBIDDEN_ARM_ACCELERATORS]}
    errors: list[str] = []
    warnings: list[str] = []

    for package in REQUIRED_PACKAGES:
        if packages[package] is None:
            errors.append(f"required package is not installed: {package}")
    if sys.version_info < (3, 10):
        errors.append("Python 3.10 or newer is required")
    if armv7:
        pydantic = packages["pydantic"]
        if pydantic and int(pydantic.split(".", 1)[0]) >= 2:
            errors.append("ARMv7 requires Pydantic 1; Pydantic 2 depends on Rust pydantic-core")
        for package in FORBIDDEN_ARM_ACCELERATORS:
            if packages[package] is not None:
                errors.append(f"compiled accelerator must not be installed on ARMv7: {package}")
    elif packages["pydantic_core"] is not None:
        warnings.append("pydantic-core is installed; use the web-redpitaya extra for ARMv7 deployment")

    frontend = Path(__file__).resolve().parent / "frontend" / "index.html"
    if not frontend.exists():
        errors.append("packaged frontend is missing; run npm run build before packaging")

    libc = platform.libc_ver()
    return {
        "ok": not errors,
        "target_armv7": armv7,
        "python": sys.version.replace("\n", " "),
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "machine": detected_machine,
        "processor": platform.processor(),
        "libc": " ".join(part for part in libc if part) or "unknown",
        "frontend": str(frontend),
        "packages": packages,
        "errors": errors,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit PyRPL web dependencies for Red Pitaya ARMv7.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    parser.add_argument(
        "--strict-armv7",
        action="store_true",
        help="Apply ARMv7 restrictions even when auditing on another architecture.",
    )
    args = parser.parse_args()
    report = audit_report(assume_armv7=args.strict_armv7)
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        for key in ["python", "platform", "machine", "processor", "libc", "frontend"]:
            print(f"{key}: {report[key]}")
        for package, version in report["packages"].items():
            print(f"{package}: {version or 'not installed'}")
        for warning in report["warnings"]:
            print(f"warning: {warning}")
        for error in report["errors"]:
            print(f"error: {error}")
        print("result:", "PASS" if report["ok"] else "FAIL")
    if not report["ok"]:
        raise SystemExit(1)


def _version(package: str) -> str | None:
    try:
        return importlib.metadata.version(package)
    except importlib.metadata.PackageNotFoundError:
        return None


if __name__ == "__main__":
    main()
