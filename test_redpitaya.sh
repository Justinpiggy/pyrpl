#!/usr/bin/env bash
set -euo pipefail

REDPITAYA_HOST="${PYRPL_REDPITAYA_HOST:-10.0.5.118}"
BIND_HOST="${PYRPL_WEB_BIND_HOST:-127.0.0.1}"
BIND_PORT="${PYRPL_WEB_BIND_PORT:-8801}"
SCOPE_INTERVAL="${PYRPL_SCOPE_INTERVAL:-0.01}"
STARTUP_DELAY="${PYRPL_MONITOR_STARTUP_DELAY:-3}"
PYTHON_CMD="${PYRPL_PYTHON_CMD:-python}"
MONITOR_SSH_PID=""

cleanup() {
  if [[ -n "${MONITOR_SSH_PID}" ]]; then
    kill "${MONITOR_SSH_PID}" 2>/dev/null || true
    wait "${MONITOR_SSH_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting Red Pitaya monitor_server on ${REDPITAYA_HOST}..."
ssh "root@${REDPITAYA_HOST}" "/opt/pyrpl/update_fpga.sh" &
MONITOR_SSH_PID="$!"

sleep "${STARTUP_DELAY}"

echo "Starting pyrpl-websocket at http://${BIND_HOST}:${BIND_PORT}"
"${PYTHON_CMD}" -m pyrpl_websocket \
  --hostname "${REDPITAYA_HOST}" \
  --bind-host "${BIND_HOST}" \
  --bind-port "${BIND_PORT}" \
  --scope-interval "${SCOPE_INTERVAL}"
