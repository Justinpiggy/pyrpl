#!/usr/bin/env bash
# This file is authored on the PC and transferred anew with each deployment.
set -euo pipefail
ROOT=/opt/pyrpl-web
BUNDLE="$1"
PORT="$2"
INTERVAL="$3"
RELOAD_FPGA="$4"
[[ "$BUNDLE" =~ ^/opt/pyrpl-web/incoming-[a-f0-9]+$ ]] || exit 2
[[ "$PORT" =~ ^[0-9]+$ && "$INTERVAL" =~ ^[0-9.eE+-]+$ ]] || exit 2
[[ "$RELOAD_FPGA" == 0 || "$RELOAD_FPGA" == 1 ]] || exit 2
[[ "$(id -u)" == 0 ]] || { echo 'Deployment needs root SSH access.' >&2; exit 1; }
cd "$BUNDLE"
bash runtime.sh "$BUNDLE" 2>&1 | tee "$ROOT/runtime-install.log"
exec 9>"$ROOT/deploy.lock"
flock -n 9 || { echo 'Another deployment is running.' >&2; exit 1; }
VENV=$(cat venv-path)
mkdir app
WHEELS=(pyrpl-*.whl)
[[ ${#WHEELS[@]} == 1 && -f "${WHEELS[0]}" ]] || exit 1
"$VENV/bin/python" -m zipfile -e "${WHEELS[0]}" app
cp deployment.json app/DEPLOYMENT.json
PYTHONPATH="$BUNDLE/app" "$VENV/bin/python" -m pyrpl_websocket.dependency_audit --strict-armv7

id pyrpl-web >/dev/null 2>&1 || useradd --system --home-dir /var/lib/pyrpl-web --shell /usr/sbin/nologin pyrpl-web
install -d -o pyrpl-web -g pyrpl-web -m 0750 /var/lib/pyrpl-web
# Never run arbitrary model code as root. Measurement data is separate from code.
chown -R root:root app
chmod -R a-w app

# Save the small service definitions so a failed replacement can restore the
# previously running application. Failed incoming bundles are retained for logs.
for unit in pyrpl-web.service pyrpl-web-monitor.service; do
    if [[ -f "/etc/systemd/system/$unit" ]]; then cp "/etc/systemd/system/$unit" "$BUNDLE/$unit.old"; fi
done
WAS_RUNNING=0
systemctl is-active --quiet pyrpl-web.service && WAS_RUNNING=1
STOPPED=0
SWITCHED=0
stop_managed_services() {
    for unit in pyrpl-web.service pyrpl-web-monitor.service; do
        if systemctl cat "$unit" >/dev/null 2>&1; then systemctl stop "$unit"; fi
    done
}
rollback() {
    result=$?
    trap - ERR
    set +e
    journalctl -u pyrpl-web.service -u pyrpl-web-monitor.service -n 40 --no-pager
    if [[ "$STOPPED" == 1 ]]; then
        stop_managed_services
        if [[ "$SWITCHED" == 1 ]]; then
            mountpoint -q "$ROOT/current" && umount "$ROOT/current"
            [[ -d "$ROOT/current" ]] && mv "$ROOT/current" "$BUNDLE/failed-app"
            if [[ -d "$ROOT/previous" ]]; then
                mv "$ROOT/previous" "$ROOT/current"
                mount --bind "$ROOT/current" "$ROOT/current"
                mount -o remount,bind,ro "$ROOT/current"
            fi
        fi
        for unit in pyrpl-web.service pyrpl-web-monitor.service; do
            if [[ -f "$BUNDLE/$unit.old" ]]; then
                cp "$BUNDLE/$unit.old" "/etc/systemd/system/$unit"
            else
                rm -f -- "/etc/systemd/system/$unit"
            fi
        done
        systemctl daemon-reload
        if [[ "$WAS_RUNNING" == 1 ]]; then systemctl start pyrpl-web.service; fi
    fi
    echo "Deployment failed; incoming files retained at $BUNDLE. Previous service restored when available." >&2
    exit "$result"
}
trap rollback ERR

# Only stop services owned by this deployer. Never kill another experiment's client.
if [[ -f "$ROOT/.pc-managed" ]]; then
    STOPPED=1
    stop_managed_services
elif systemctl cat pyrpl-web.service >/dev/null 2>&1 || systemctl cat pyrpl-web-monitor.service >/dev/null 2>&1; then
    echo 'An unmanaged PyRPL service exists; resolve it before deploying.' >&2
    exit 1
fi
if ss -ltn | awk '{print $4}' | grep -Eq ":(2222|$PORT)$"; then
    echo "Port 2222 or $PORT is occupied outside this deployment. Stop that launcher first." >&2
    false
fi
if [[ -e "$ROOT/current" && ! -f "$ROOT/.pc-managed" ]]; then
    echo 'Refusing to overwrite an unmanaged current directory.' >&2
    exit 1
fi
# Keep one previous application until the new service passes smoke checks.
if [[ -d "$ROOT/previous" ]]; then
    echo 'A previous failed deployment remains. Inspect /opt/pyrpl-web/previous before retrying.' >&2
    false
fi
touch "$ROOT/.pc-managed"
STOPPED=1
mountpoint -q "$ROOT/current" && umount "$ROOT/current"
if [[ -d "$ROOT/current" ]]; then mv "$ROOT/current" "$ROOT/previous"; fi
SWITCHED=1
mv app "$ROOT/current"
mount --bind "$ROOT/current" "$ROOT/current"
mount -o remount,bind,ro "$ROOT/current"

if [[ "$RELOAD_FPGA" == 1 ]]; then
    MONITOR_COMMAND='/bin/bash /opt/pyrpl/update_fpga.sh'
else
    MONITOR_COMMAND='/opt/pyrpl/monitor_server 2222'
fi
cat > /etc/systemd/system/pyrpl-web-monitor.service <<EOF
[Unit]
Description=PC-deployed PyRPL monitor server
PartOf=pyrpl-web.service

[Service]
Type=simple
ExecStart=$MONITOR_COMMAND
KillMode=control-group
TimeoutStopSec=15
Restart=no
EOF
cat > /etc/systemd/system/pyrpl-web.service <<EOF
[Unit]
Description=PC-deployed PyRPL HTTP and WebSocket server
Requires=pyrpl-web-monitor.service
After=network.target pyrpl-web-monitor.service

[Service]
Type=simple
User=pyrpl-web
Group=pyrpl-web
WorkingDirectory=$ROOT/current
Environment=PYTHONPATH=$ROOT/current
Environment=PYRPL_USER_DIR=/var/lib/pyrpl-web
Environment=PYTHONDONTWRITEBYTECODE=1
Environment=PYTHONUNBUFFERED=1
Environment=OPENBLAS_NUM_THREADS=1
ExecStartPre=/bin/sleep 3
ExecStart=$VENV/bin/python -m pyrpl_websocket --hostname 127.0.0.1 --port 2222 --bind-host 0.0.0.0 --bind-port $PORT --scope-interval $INTERVAL
KillMode=control-group
TimeoutStopSec=30
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
ReadOnlyDirectories=$ROOT
Restart=no
EOF
systemctl daemon-reload
systemctl start pyrpl-web.service
READY=0
for attempt in $(seq 1 60); do
    if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then READY=1; break; fi
    if ! systemctl is-active --quiet pyrpl-web.service; then break; fi
    sleep 1
done
if [[ "$READY" != 1 ]] || ! "$VENV/bin/python" smoke.py "$PORT"; then
    journalctl -u pyrpl-web.service -u pyrpl-web-monitor.service -n 60 --no-pager
    echo 'Startup failed; restoring the previous deployment.' >&2
    false
fi
cp deployment.json "$ROOT/DEPLOYMENT.json"
trap - ERR
if [[ -d "$ROOT/previous" ]]; then rm -rf -- "$ROOT/previous"; fi
echo "Deployment verified. Source is mounted read-only at $ROOT/current."
echo 'Configuration and curves persist in /var/lib/pyrpl-web.'
cd "$ROOT"
rm -rf -- "$BUNDLE"
