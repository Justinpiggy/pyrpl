"""PC-owned, repeatable deployment to the stock ARMv7 Red Pitaya image."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
import uuid


REPO = Path(__file__).resolve().parents[1]
REMOTE_ROOT = "/opt/pyrpl-web"
# Pinned official python-build-standalone asset; includes its own modern OpenSSL.
DOWNLOADS = {
    "python.tar.gz": (
        "https://github.com/astral-sh/python-build-standalone/releases/download/20261013/"
        "cpython-3.11.17%2B20261013-armv7-unknown-linux-gnueabihf-install_only_stripped.tar.gz",
        "8914a6282b37b4a5dfe8f652b905d7dd9fd735cc6570de39859d7d0da734f69b",
    ),
    "numpy-1.24.4.tar.gz": (
        "https://files.pythonhosted.org/packages/a4/9b/027bec52c633f6556dba6b722d9a0befb40498b9ceddd29cbe67a45a127c/numpy-1.24.4.tar.gz",
        "80f5e3a4e498641401868df4208b74581206afbee7cf7b8329daae82676d9463",
    ),
    "pyyaml-6.0.3.tar.gz": (
        "https://files.pythonhosted.org/packages/05/8e/961c0007c59b8dd7729d542c61a4d537767a59645b82a0b521206e1e25c2/pyyaml-6.0.3.tar.gz",
        "d76623373421df22fb4cf8817020cbb7ef15c725b9d5e45f17e189bfc384190f",
    ),
}


def run(args, **kwargs):
    print("+", shlex.join(str(arg) for arg in args), flush=True)
    # Conda's interpreter can be selected explicitly without activating its PATH.
    env = dict(os.environ)
    env["PATH"] = str(Path(sys.executable).parent) + os.pathsep + env.get("PATH", "")
    return subprocess.run(args, check=True, env=env, **kwargs)


def digest(path):
    with Path(path).open("rb") as stream:
        result = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(chunk)
    return result.hexdigest()


def target_info(ssh):
    probe = "\n".join([
        "import json, platform, subprocess",
        "release = dict(line.strip().split('=', 1) for line in open('/etc/os-release') if '=' in line)",
        # Python 3.5's executable scanner misreports this board's libc as 2.9.
        "libc = subprocess.check_output(['getconf', 'GNU_LIBC_VERSION']).decode().strip().split()",
        "print(json.dumps({'machine': platform.machine(), 'libc': libc,",
        "'os_id': release['ID'].strip(chr(34)), 'os_version': release['VERSION_ID'].strip(chr(34))}))",
    ])
    result = run([*ssh, "python3 -c " + shlex.quote(probe)], capture_output=True, text=True)
    return json.loads(result.stdout)


def artifact_directory(target):
    libc, version = target["libc"]
    key = f"{target['machine']}-cp311-{libc}{version}-{target['os_id']}{target['os_version']}"
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", key):
        raise RuntimeError("Unsupported target identifier")
    return REPO / "artifacts/redpitaya" / key


def cached_wheels(target, directory=None):
    directory = directory or artifact_directory(target)
    manifest_path = directory / "manifest.json"
    if not manifest_path.exists():
        return []
    manifest = json.loads(manifest_path.read_text())
    if (manifest.get("machine") != target["machine"] or manifest.get("libc") != target["libc"]
            or manifest.get("os_id") != target["os_id"] or manifest.get("os_version") != target["os_version"]
            or not manifest.get("python", "").startswith("3.11.")
            or manifest.get("numpy_source_sha256") != DOWNLOADS["numpy-1.24.4.tar.gz"][1]):
        raise RuntimeError(f"Incompatible native wheel cache: {directory}")
    files = []
    for name, expected in manifest["files"].items():
        if Path(name).name != name or not name.endswith(".whl"):
            raise RuntimeError(f"Invalid wheel cache filename: {name}")
        path = directory / name
        if not path.is_file() or digest(path) != expected:
            raise RuntimeError(f"Cached wheel failed checksum verification: {path}")
        files.append(path)
    return files


def collect_artifacts(ssh, target, work):
    archive_path = work / "compiled-dependencies.tar.gz"
    with (REPO / "deploy/redpitaya-export-cache.py").open("rb") as source, archive_path.open("wb") as output:
        run([*ssh, f"{REMOTE_ROOT}/python/bin/python3 -"], stdin=source, stdout=output)
    unpacked = work / "compiled-dependencies"
    unpacked.mkdir()
    with tarfile.open(archive_path) as archive:
        for member in archive.getmembers():
            if not member.isfile() or Path(member.name).name != member.name:
                raise RuntimeError("Invalid filename in returned dependency archive")
            with archive.extractfile(member) as source, (unpacked / member.name).open("wb") as output:
                shutil.copyfileobj(source, output)
    manifest = json.loads((unpacked / "manifest.json").read_text())
    for name, expected in manifest["files"].items():
        if Path(name).name != name or digest(unpacked / name) != expected:
            raise RuntimeError("Checksum mismatch in returned compiled dependencies")
    cached_wheels(target, unpacked)
    destination = artifact_directory(target)
    destination.mkdir(parents=True, exist_ok=True)
    for source in unpacked.iterdir():
        if source.name != "manifest.json":
            if source.name == "runtime-install.log" and (destination / source.name).exists():
                continue
            shutil.copy2(source, destination / source.name)
    # Publish the manifest last; a partial transfer is never considered reusable.
    shutil.copy2(unpacked / "manifest.json", destination / "manifest.json")
    cached_wheels(target)
    print(f"Compiled dependency cache saved and verified: {destination}", flush=True)


def download(name, cache):
    url, expected = DOWNLOADS[name]
    target = cache / name
    if not target.exists() or digest(target) != expected:
        print(f"Downloading {name} on the PC...", flush=True)
        temporary = target.with_suffix(".partial")
        with urllib.request.urlopen(url, timeout=60) as response, temporary.open("wb") as output:
            shutil.copyfileobj(response, output)
        if digest(temporary) != expected:
            temporary.unlink()
            raise RuntimeError(f"Checksum mismatch: {name}")
        temporary.replace(target)
    return target


def build_application(work):
    """Package current disk contents, including local edits, in a clean build tree."""
    source = work / "source"
    source.mkdir()
    for package in ("pyrpl", "pyrpl_websocket"):
        shutil.copytree(REPO / package, source / package, ignore=shutil.ignore_patterns(
            "__pycache__", "*.pyc", ".DS_Store", "frontend", "out", ".Xil", "project", "sdk",
        ))
    for name in ("pyproject.toml", "setup.py", "setup.cfg", "README.md", "LICENSE"):
        shutil.copy2(REPO / name, source / name)
    web = REPO / "web"
    if not (web / "node_modules" / ".bin" / "vite").exists():
        run(["npm", "ci"], cwd=web)
    # Compile into the isolated package tree, leaving tracked frontend assets alone.
    run(["npm", "run", "build", "--", "--outDir", str(source / "pyrpl_websocket/frontend")], cwd=web)
    wheels = work / "application-wheel"
    run([sys.executable, "-m", "pip", "wheel", "--no-deps", "--no-build-isolation",
         "--wheel-dir", str(wheels), str(source)])
    wheel, = wheels.glob("*.whl")
    run([sys.executable, str(REPO / "scripts/verify_web_wheel.py"), str(wheel)])
    return wheel


def prepare_bundle(work, cache, target):
    bundle = work / "bundle"
    bundle.mkdir()
    wheel = build_application(work)
    shutil.copy2(wheel, bundle / wheel.name)
    for name in DOWNLOADS:
        shutil.copy2(download(name, cache), bundle / name)
    shutil.copy2(REPO / "deploy/redpitaya-dependencies.txt", bundle / "dependencies.txt")
    for source, destination in (("redpitaya-runtime.sh", "runtime.sh"),
                           ("redpitaya-install.sh", "install.sh"),
                           ("redpitaya-smoke.py", "smoke.py")):
        shutil.copy2(REPO / "deploy" / source, bundle / destination)
    pure_requirements = work / "pure-requirements.txt"
    pure_requirements.write_text("\n".join(
        line for line in (bundle / "dependencies.txt").read_text().splitlines()
        if not line.lower().startswith(("numpy==", "pyyaml=="))
    ) + "\nsetuptools==59.8.0\nwheel==0.45.1\nCython==0.29.37\n")
    wheels = cache / "wheels"
    wheels.mkdir(exist_ok=True)
    run([sys.executable, "-m", "pip", "download", "--only-binary=:all:",
         "--platform", "any", "--python-version", "311", "--implementation", "cp",
         "--abi", "none", "--dest", str(wheels), "-r", str(pure_requirements)])
    shutil.copytree(wheels, bundle / "wheels")
    native = cached_wheels(target)
    if native:
        print(f"Reusing PC-cached native wheels from {artifact_directory(target)}", flush=True)
        (bundle / "native-wheels").mkdir()
        for path in native:
            shutil.copy2(path, bundle / "native-wheels" / path.name)
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=REPO, text=True).strip()
    manifest = {"git_revision": revision, "application_sha256": digest(wheel),
                "source": "PC working tree (including uncommitted application changes)"}
    (bundle / "deployment.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (bundle / "SHA256SUMS").write_text("".join(
        f"{digest(file)}  {file.relative_to(bundle)}\n"
        for file in sorted(bundle.rglob("*")) if file.is_file()
    ))
    archive = work / "deployment.tar.gz"
    with tarfile.open(archive, "w:gz") as output:
        output.add(bundle, arcname=".")
    return archive


def port(value):
    number = int(value)
    if not 1024 <= number <= 65535:
        raise argparse.ArgumentTypeError("port must be between 1024 and 65535")
    return number


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default=os.environ.get("PYRPL_REDPITAYA_HOST", "10.0.5.118"))
    parser.add_argument("--port", type=port, default=8801, help="Board HTTP/WebSocket port (exposed on the LAN).")
    parser.add_argument("--scope-interval", type=float, default=0.05)
    parser.add_argument("--reload-fpga", action="store_true", help="Run the board's existing FPGA loader before monitor startup.")
    parser.add_argument("--check", action="store_true", help="Read-only board preflight; do not build or deploy.")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.-]*", args.host):
        parser.error("--host must be a hostname or IPv4 address")
    if not 0.001 <= args.scope_interval <= 60:
        parser.error("--scope-interval must be between 0.001 and 60 seconds")
    ssh = ["ssh", "-o", "ConnectTimeout=10", "-o", "ServerAliveInterval=15",
           "-o", "ServerAliveCountMax=3", f"root@{args.host}"]
    run([*ssh, "set -e; test \"$(uname -m)\" = armv7l; "
         "test -x /opt/pyrpl/monitor_server; command -v systemctl; command -v gcc; "
         "command -v make; command -v flock; command -v mountpoint; command -v ss; "
         "uname -a; python3 --version; df -h /opt; free -m"])
    if args.check:
        return
    target = target_info(ssh)
    cache = REPO / ".cache/redpitaya-deploy"
    cache.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="pyrpl-deploy-") as directory:
        archive = prepare_bundle(Path(directory), cache, target)
        remote = f"{REMOTE_ROOT}/incoming-{uuid.uuid4().hex}"
        with archive.open("rb") as stream:
            run([*ssh, f"mkdir -p {shlex.quote(remote)} && tar -xz -C {shlex.quote(remote)}"], stdin=stream)
        command = shlex.join(["bash", f"{remote}/install.sh", remote, str(args.port),
                              str(args.scope_interval), "1" if args.reload_fpga else "0"])
        try:
            run([*ssh, command])
        except subprocess.CalledProcessError:
            # A successful expensive build is useful even if app startup failed.
            try:
                collect_artifacts(ssh, target, Path(directory))
            except (subprocess.CalledProcessError, OSError, RuntimeError) as exc:
                print(f"Could not recover compiled dependencies: {exc}", file=sys.stderr)
            raise
        collect_artifacts(ssh, target, Path(directory))
    print("All application services are running on the Red Pitaya.", flush=True)
    print(f"Open http://{args.host}:{args.port}\nServices continue running after this command exits.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except (subprocess.CalledProcessError, OSError, RuntimeError) as exc:
        raise SystemExit(f"Deployment failed: {exc}") from exc
