# Hardware Validation

This is the opt-in validation procedure for a dedicated Red Pitaya board. It
uses the existing monitor-server protocol only. It does not modify FPGA
firmware or `monitor_server.c`.

Start `monitor_server` and the web server with the existing helper:

```bash
PYRPL_REDPITAYA_HOST=10.0.5.118 ./test_redpitaya.sh
```

In a second terminal, first verify monitor-server connectivity without writes:

```bash
conda run -n pyrpl-env pyrpl-web-validate-hardware \
  --hostname 10.0.5.118 --json
```

The acquisition checks deliberately reconfigure Scope, ASG0, Spectrum
Analyzer, and Network Analyzer, and finish by stopping them and disabling
ASG0. Run them only on a dedicated validation board:

```bash
conda run -n pyrpl-env pyrpl-web-validate-hardware \
  --hostname 10.0.5.118 --allow-write \
  --scope --asg-loopback --spectrum --network --json
```

The internal ASG0-to-Scope check is based on the legacy
`test_scope_asg_ams.py` routing test. The Network Analyzer check uses its
legacy internal IQ self-loop and reports the largest deviation from unity.
External wiring, detector gains, and a browser WebSocket session are still
required to validate lab-specific transfer correction and frontend display
normalization.
