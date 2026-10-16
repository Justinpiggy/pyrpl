"""Stream board-built wheels and provenance to the PC (stdout is a tarball)."""

import hashlib
import io
import json
from pathlib import Path
import platform
import subprocess
import sys
import tarfile

ROOT = Path("/opt/pyrpl-web")
patterns = ("numpy-1.24.4-cp311-cp311-linux_armv7l.whl", "[Pp]y[Yy][Aa][Mm][Ll]-6.0.3-*.whl")
files = {}
for pattern in patterns:
    candidates = [*ROOT.glob("native-wheels/" + pattern),
                  *Path("/root/.cache/pip/wheels").rglob(pattern)]
    if candidates:
        newest = max(candidates, key=lambda path: path.stat().st_mtime)
        files[newest.name] = newest
if not any(name.startswith("numpy-") for name in files):
    raise SystemExit("No completed NumPy wheel is available to export yet")

envs = sorted(ROOT.glob("env-*/.complete"), key=lambda path: path.stat().st_mtime)
venv = envs[-1].parent if envs else None
details = ""
if venv:
    details = subprocess.check_output([str(venv / "bin/python"), "-c",
        "import numpy; import numpy.core._multiarray_umath as core; "
        "import numpy.linalg.lapack_lite as lapack; import subprocess; "
        "print('NumPy:', numpy.__version__); numpy.show_config(); "
        "subprocess.run(['ldd', core.__file__], check=True); "
        "subprocess.run(['ldd', lapack.__file__], check=True)"], text=True)
release = dict(line.strip().split("=", 1) for line in Path("/etc/os-release").read_text().splitlines() if "=" in line)
manifest = {
    "python": platform.python_version(), "machine": platform.machine(),
    "libc": subprocess.check_output(["getconf", "GNU_LIBC_VERSION"], text=True).strip().split(),
    "os_release": Path("/etc/os-release").read_text(),
    "os_id": release["ID"].strip('"'), "os_version": release["VERSION_ID"].strip('"'),
    "compiler": subprocess.check_output(["gcc", "--version"], text=True).splitlines()[0],
    "files": {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in files.items()},
    "numpy_source_sha256": "80f5e3a4e498641401868df4208b74581206afbee7cf7b8329daae82676d9463",
    "note": "Compiled on the target board; reuse only with a matching ARM/Python/OS ABI and shared libraries.",
}
with tarfile.open(fileobj=sys.stdout.buffer, mode="w|gz") as archive:
    for name, path in files.items():
        archive.add(path, arcname=name)
    for name, content in (("manifest.json", json.dumps(manifest, indent=2) + "\n"),
                          ("numpy-build-info.txt", details)):
        payload = content.encode()
        info = tarfile.TarInfo(name)
        info.size = len(payload)
        archive.addfile(info, io.BytesIO(payload))
    log = ROOT / "runtime-install.log"
    if log.exists():
        archive.add(log, arcname="runtime-install.log")
