"""PC deployment checks; no board connection or application startup required."""

import argparse
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[2] / "scripts/deploy_redpitaya.py"
SPEC = importlib.util.spec_from_file_location("deploy_redpitaya", SCRIPT)
deploy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(deploy)


class DeploymentTest(unittest.TestCase):
    def test_bundle_includes_matching_native_wheel(self):
        target = {"machine": "armv7l", "libc": ["glibc", "2.23"],
                  "os_id": "ubuntu", "os_version": "16.04"}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            work, cache = root / "work", root / "cache"
            work.mkdir()
            cache.mkdir()
            app = root / "pyrpl-test.whl"
            native = root / "numpy-test.whl"
            app.write_bytes(b"application")
            native.write_bytes(b"native compiled dependency")
            with patch.object(deploy, "build_application", return_value=app), \
                    patch.object(deploy, "download", return_value=app), \
                    patch.object(deploy, "run"), \
                    patch.object(deploy, "cached_wheels", return_value=[native]) as wheels:
                archive = deploy.prepare_bundle(work, cache, target)
            wheels.assert_called_once_with(target)
            with deploy.tarfile.open(archive) as bundle:
                self.assertEqual(bundle.extractfile("./native-wheels/numpy-test.whl").read(),
                                 b"native compiled dependency")

    def test_native_cache_rejects_incompatible_or_modified_wheels(self):
        target = {"machine": "armv7l", "libc": ["glibc", "2.23"],
                  "os_id": "ubuntu", "os_version": "16.04"}
        with tempfile.TemporaryDirectory() as directory, patch.object(deploy, "REPO", Path(directory)):
            cache = deploy.artifact_directory(target)
            cache.mkdir(parents=True)
            wheel = cache / "numpy-1.24.4-cp311-cp311-linux_armv7l.whl"
            wheel.write_bytes(b"compiled ARM wheel")
            manifest = {"machine": "armv7l", "libc": ["glibc", "2.23"], "python": "3.11.17",
                        "os_id": "ubuntu", "os_version": "16.04",
                        "numpy_source_sha256": deploy.DOWNLOADS["numpy-1.24.4.tar.gz"][1],
                        "files": {wheel.name: deploy.digest(wheel)}}
            (cache / "manifest.json").write_text(deploy.json.dumps(manifest))
            self.assertEqual(deploy.cached_wheels(target), [wheel])
            wheel.write_bytes(b"corrupt wheel")
            with self.assertRaisesRegex(RuntimeError, "checksum"):
                deploy.cached_wheels(target)
            manifest["python"] = "3.10.20"
            (cache / "manifest.json").write_text(deploy.json.dumps(manifest))
            with self.assertRaisesRegex(RuntimeError, "Incompatible"):
                deploy.cached_wheels(target)

    def test_build_uses_current_source_and_replaces_stale_frontend(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo, work = root / "repo", root / "work"
            work.mkdir()
            for name in ("pyrpl", "pyrpl_websocket/frontend", "web/node_modules/.bin"):
                (repo / name).mkdir(parents=True)
            (repo / "pyrpl_websocket/app.py").write_text("# uncommitted local change\n")
            (repo / "pyrpl_websocket/frontend/obsolete.js").write_text("old bundle")
            (repo / "web/node_modules/.bin/vite").touch()
            for name in ("pyproject.toml", "setup.py", "setup.cfg", "README.md", "LICENSE"):
                (repo / name).touch()

            def fake_run(args, **kwargs):
                if args[:3] == ["npm", "run", "build"]:
                    frontend = Path(args[-1])
                    frontend.mkdir(parents=True)
                    (frontend / "index.html").write_text("new frontend")
                if "--wheel-dir" in args:
                    output = Path(args[args.index("--wheel-dir") + 1])
                    output.mkdir()
                    (output / "pyrpl-test-none-any.whl").touch()

            with patch.object(deploy, "REPO", repo), patch.object(deploy, "run", side_effect=fake_run):
                deploy.build_application(work)
            self.assertEqual((work / "source/pyrpl_websocket/app.py").read_text(), "# uncommitted local change\n")
            self.assertFalse((work / "source/pyrpl_websocket/frontend/obsolete.js").exists())
            self.assertTrue((repo / "pyrpl_websocket/frontend/obsolete.js").exists())

    def test_cached_download_is_verified_before_reuse(self):
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            payload = cache / "runtime.tar.gz"
            payload.write_bytes(b"verified runtime")
            with patch.dict(deploy.DOWNLOADS, {payload.name: ("https://example.invalid/runtime", deploy.digest(payload))}):
                with patch.object(deploy.urllib.request, "urlopen") as fetch:
                    self.assertEqual(deploy.download(payload.name, cache), payload)
                    fetch.assert_not_called()

    def test_corrupt_cache_is_replaced_only_with_verified_download(self):
        with tempfile.TemporaryDirectory() as directory:
            cache = Path(directory)
            payload = cache / "runtime.tar.gz"
            payload.write_bytes(b"correct runtime")
            expected = deploy.digest(payload)
            payload.write_bytes(b"corrupt cache")
            with patch.dict(deploy.DOWNLOADS, {payload.name: ("https://example.invalid/runtime", expected)}):
                with patch.object(deploy.urllib.request, "urlopen", return_value=io.BytesIO(b"wrong download")):
                    with self.assertRaisesRegex(RuntimeError, "Checksum mismatch"):
                        deploy.download(payload.name, cache)
                self.assertEqual(payload.read_bytes(), b"corrupt cache")
                self.assertFalse(payload.with_suffix(".partial").exists())
                with patch.object(deploy.urllib.request, "urlopen", return_value=io.BytesIO(b"correct runtime")):
                    deploy.download(payload.name, cache)
                self.assertEqual(payload.read_bytes(), b"correct runtime")

    def test_unsafe_host_is_rejected_before_ssh(self):
        with patch.object(deploy.sys, "argv", [str(SCRIPT), "--host", "host; touch /tmp/unwanted"]):
            with patch.object(deploy, "run") as run:
                with self.assertRaises(SystemExit):
                    deploy.main()
                run.assert_not_called()

    def test_check_only_performs_remote_preflight(self):
        with patch.object(deploy.sys, "argv", [str(SCRIPT), "--check"]):
            with patch.object(deploy, "run") as run, patch.object(deploy, "prepare_bundle") as prepare:
                deploy.main()
                self.assertEqual(run.call_count, 1)
                self.assertEqual(run.call_args.args[0][0], "ssh")
                prepare.assert_not_called()

    def test_port_bounds(self):
        self.assertEqual(deploy.port("8801"), 8801)
        for value in ("0", "80", "65536"):
            with self.assertRaises(argparse.ArgumentTypeError):
                deploy.port(value)


if __name__ == "__main__":
    unittest.main()
