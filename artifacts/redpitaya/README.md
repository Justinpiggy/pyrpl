# Reusable board-built dependencies

`deploy_redpitaya.sh` copies the compiled NumPy wheel back here after deployment.
Each subdirectory identifies the board architecture, CPython ABI, libc, and OS
release, for example `armv7l-cp311-glibc2.23-ubuntu16.04`.

Each cache contains:

- The ARM NumPy wheel, including its compiled extension modules.
- The pure-Python PyYAML wheel when available.
- `manifest.json`: wheel SHA-256 checksums, Python/OS details, and NumPy source checksum.
- `numpy-build-info.txt`: NumPy's build configuration and linked shared libraries.
- `runtime-install.log` when recorded by the installer.

These are the reusable build outputs; temporary compiler objects are not needed
to install NumPy. Subsequent launches verify the manifest and send compatible
cached wheels to the board, avoiding compilation even when recreating the Python
environment. If no matching cache exists, the board builds once and returns it.

Cache directories are intentionally ignored by Git but persist inside this
repository on the PC. Back them up or copy the whole target directory to another
PC to reuse them there. They are tied to the target image and its native shared
libraries; they are not universal Linux wheels. Never rename a cache directory
to force a wheel onto an incompatible board.
