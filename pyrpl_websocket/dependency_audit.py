"""Audit the headless web runtime for Red Pitaya deployment."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import platform
import re
import sys
import zipfile
from pathlib import Path
from typing import Any


REQUIRED_PACKAGES = ["numpy", "PyYAML", "fastapi", "starlette", "pydantic", "uvicorn", "wsproto", "h11"]
FORBIDDEN_ARM_ACCELERATORS = ["pydantic_core", "uvloop", "httptools", "watchfiles"]
REDPITAYA_VERSION_CONSTRAINTS = {
    "fastapi": ("0.115", "0.116"),
    "pydantic": ("1.10.24", "2"),
    "uvicorn": ("0.30", "0.31"),
    "wsproto": ("1.2.0", "1.2.0"),
}
_NATIVE_SUFFIXES = (".so", ".pyd", ".dylib")


def audit_report(
    machine: str | None = None,
    assume_armv7: bool = False,
    wheel: Path | None = None,
) -> dict[str, Any]:
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
        for package, (minimum, maximum) in REDPITAYA_VERSION_CONSTRAINTS.items():
            installed = packages[package]
            if installed and not _in_version_range(installed, minimum, maximum):
                errors.append(
                    f"web-redpitaya requires {package}>={minimum}, "
                    f"{'==' if minimum == maximum else '<'}{maximum}; found {installed}"
                )
    elif packages["pydantic_core"] is not None:
        warnings.append("pydantic-core is installed; use the web-redpitaya extra for ARMv7 deployment")

    frontend = Path(__file__).resolve().parent / "frontend" / "index.html"
    if not frontend.exists():
        errors.append("packaged frontend is missing; run npm run build before packaging")

    libc = platform.libc_ver()
    report = {
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
    if wheel is not None:
        wheel_report = _audit_wheel(wheel)
        report["wheel"] = wheel_report
        errors.extend(wheel_report["errors"])
        report["ok"] = not errors
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit PyRPL web dependencies for Red Pitaya ARMv7.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    parser.add_argument(
        "--strict-armv7",
        action="store_true",
        help="Apply ARMv7 restrictions even when auditing on another architecture.",
    )
    parser.add_argument(
        "--wheel",
        type=Path,
        help="Also inspect a built wheel for portable packaged frontend assets.",
    )
    args = parser.parse_args()
    report = audit_report(assume_armv7=args.strict_armv7, wheel=args.wheel)
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        for key in ["python", "platform", "machine", "processor", "libc", "frontend"]:
            print(f"{key}: {report[key]}")
        if "wheel" in report:
            print(f"wheel: {report['wheel']['path']}")
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


def _in_version_range(version: str, minimum: str, maximum: str) -> bool:
    parsed = _version_tuple(version)
    minimum_version = _version_tuple(minimum)
    maximum_version = _version_tuple(maximum)
    if minimum == maximum:
        return parsed == maximum_version
    return parsed >= minimum_version and parsed < maximum_version


def _version_tuple(version: str) -> tuple[int, ...]:
    match = re.match(r"(\d+(?:\.\d+)*)", version)
    if match is None:
        return ()
    return tuple(int(part) for part in match.group(1).split("."))


def _audit_wheel(wheel: Path) -> dict[str, Any]:
    errors: list[str] = []
    result: dict[str, Any] = {"path": str(wheel), "errors": errors}
    if not wheel.is_file():
        errors.append(f"wheel does not exist: {wheel}")
        return result
    if not wheel.name.endswith("none-any.whl"):
        errors.append("web deployment wheel must be a universal *-none-any wheel")
    try:
        with zipfile.ZipFile(wheel) as archive:
            names = archive.namelist()
    except zipfile.BadZipFile:
        errors.append(f"not a readable wheel archive: {wheel}")
        return result

    required = {"pyrpl_websocket/frontend/index.html", "pyrpl_websocket/__main__.py"}
    missing = sorted(required - set(names))
    if missing:
        errors.append(f"wheel is missing required web runtime files: {missing}")
    frontend_assets = [name for name in names if name.startswith("pyrpl_websocket/frontend/assets/")]
    main_scripts = [name for name in frontend_assets if name.rsplit("/", 1)[-1].startswith("index-") and name.endswith(".js")]
    workers = [name for name in frontend_assets if "/spectrum-worker-" in name and name.endswith(".js")]
    if len(main_scripts) != 1 or len(workers) != 1:
        errors.append("wheel must contain exactly one main frontend bundle and one Spectrum worker")
    native_runtime = [
        name
        for name in names
        if name.startswith("pyrpl_websocket/") and name.endswith(_NATIVE_SUFFIXES)
    ]
    if native_runtime:
        errors.append(f"web runtime wheel must not bundle native extensions: {native_runtime}")
    result["frontend_scripts"] = len(main_scripts)
    result["spectrum_workers"] = len(workers)
    result["native_runtime_extensions"] = native_runtime
    return result


if __name__ == "__main__":
    main()
