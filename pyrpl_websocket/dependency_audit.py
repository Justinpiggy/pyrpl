"""Print dependency and platform details for Red Pitaya deployment checks."""

from __future__ import annotations

import importlib.metadata
import platform
import sys


PACKAGES = ["fastapi", "uvicorn", "wsproto", "pydantic", "pydantic_core"]


def main() -> None:
    print("python:", sys.version.replace("\n", " "))
    print("platform:", platform.platform())
    print("machine:", platform.machine())
    print("processor:", platform.processor())
    libc = platform.libc_ver()
    print("libc:", " ".join(part for part in libc if part) or "unknown")
    for package in PACKAGES:
        try:
            version = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            version = "not installed"
        print(f"{package}: {version}")


if __name__ == "__main__":
    main()
