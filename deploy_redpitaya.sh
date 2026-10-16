#!/usr/bin/env bash
# Build and deploy the local checkout; all application services run on the board.
set -euo pipefail
REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec "${PYRPL_PYTHON_CMD:-python3}" "$REPO_DIR/scripts/deploy_redpitaya.py" "$@"
