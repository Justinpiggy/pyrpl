#!/usr/bin/env bash
# Invoked by the PC deployment tool. Never edit the deployed copy.
set -euo pipefail
ROOT=/opt/pyrpl-web
BUNDLE="$1"
PYTHON="$ROOT/python/bin/python3"
mkdir -p "$ROOT"
exec 9>"$ROOT/deploy.lock"
flock -n 9 || { echo 'Another deployment is running.' >&2; exit 1; }
cd "$BUNDLE"
sha256sum -c SHA256SUMS

if [[ ! -x "$PYTHON" ]]; then
    mkdir -p "$ROOT/python-stage"
    tar -xzf python.tar.gz -C "$ROOT/python-stage"
    "$ROOT/python-stage/python/bin/python3" -c 'import ssl, ctypes, sqlite3; print(ssl.OPENSSL_VERSION)'
    mv "$ROOT/python-stage/python" "$ROOT/python"
    rmdir "$ROOT/python-stage"
fi
"$PYTHON" -c 'import sys; assert sys.version_info[:2] == (3, 11), sys.version; print(sys.version)'

# Cache the expensive ARM build, but never reuse an environment for a different
# dependency manifest. Application code is replaced separately on every launch.
ENV_KEY=$(cat dependencies.txt runtime.sh | sha256sum | cut -c1-16)
VENV="$ROOT/env-$ENV_KEY"
mkdir -p "$ROOT/native-wheels"
if [[ -d native-wheels ]]; then cp native-wheels/*.whl "$ROOT/native-wheels/"; fi
if [[ ! -f "$VENV/.complete" ]]; then
    "$PYTHON" -m venv "$VENV"
    PIP=("$VENV/bin/python" -m pip --disable-pip-version-check)
    "${PIP[@]}" install --no-index --find-links wheels setuptools==59.8.0 wheel==0.45.1 Cython==0.29.37
    export NPY_NUM_BUILD_JOBS=1 OPENBLAS_NUM_THREADS=1 PYYAML_FORCE_LIBYAML=0
    export PIP_NO_INDEX=1 PIP_FIND_LINKS="$BUNDLE/wheels"
    # Build against this board's libc. Modern Raspberry Pi wheels need a newer
    # libc than the stock Ubuntu 16.04 Red Pitaya image supplies.
    if [[ ! -f "$ROOT/native-wheels/numpy-1.24.4-cp311-cp311-linux_armv7l.whl" ]]; then
        echo 'First NumPy build: about 42 minutes on the tested board; other boards may take longer.'
        echo 'Completed wheels are copied back to the PC for reuse on later deployments.'
        "${PIP[@]}" wheel --no-build-isolation --no-deps --wheel-dir "$ROOT/native-wheels" numpy-1.24.4.tar.gz
    fi
    if ! compgen -G "$ROOT/native-wheels/[Pp]y[Yy][Aa][Mm][Ll]-6.0.3-*.whl" >/dev/null; then
        "${PIP[@]}" wheel --no-build-isolation --no-deps --wheel-dir "$ROOT/native-wheels" pyyaml-6.0.3.tar.gz
    fi
    "${PIP[@]}" install --no-index --find-links "$ROOT/native-wheels" numpy==1.24.4 PyYAML==6.0.3
    "${PIP[@]}" install --no-index --find-links wheels -r dependencies.txt
    "$VENV/bin/python" -c 'import numpy, yaml, ssl; print("NumPy", numpy.__version__, "YAML", yaml.__version__)'
    "${PIP[@]}" check
    touch "$VENV/.complete"
fi
printf '%s\n' "$VENV" > "$BUNDLE/venv-path"
