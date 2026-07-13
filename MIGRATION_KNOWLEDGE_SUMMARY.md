# Migration Knowledge Summary

Read this before changing migrated PyRPL behavior. The full details remain in
`MIGRATION_KNOWLEDGE_LOG.md`.

## Migration Rules

- Read the original PyRPL code first. Match `_gui_attributes`,
  `_setup_attributes`, widget layout, and control routines before inventing web
  behavior.
- Do not add controls just because a register or helper method exists. Expose
  what the original GUI exposes unless there is a deliberate documented web-only
  reason.
- Do not omit original controls. If a function cannot be migrated yet, record
  it as a parity gap.
- Keep FPGA firmware and `monitor_server.c` untouched.
- If something is needed, ask the user rather than assuming it is unavailable.

## Plot/Layout Rules

- Never resize a canvas or uPlot from a container whose size is determined by
  that same canvas or plot. This causes uncontrolled growth and
  `ResizeObserver` loops.
- Use `web/src/plot-theme.ts` and the CSS plot variables for all uPlot
  backgrounds, axes, grid lines, cursor lines, labels, legends, and common
  trace colors.
- Give graph panels stable dimensions with CSS first, then resize the plot to
  those fixed frame boxes.
- Browser tests for graph-heavy panels must assert nonblank rendering,
  interaction behavior, and stable dimensions over time.
- For uPlot inside split panels, observe the bounded panel/frame, not a
  self-expanding plot container.

## Module/Resource Rules

- PyRPL ownership is `Module.owner` plus `ModuleManager.pop(owner)` /
  `free(module)`. Releasing ownership reloads setup attributes from config.
- Current web `module_owners` is only an approximation. Replace it with a
  Qt-free manager abstraction before relying on complex resource arbitration.
- Preserve PyRPL special cases such as spectrum analyzer directly owning `iq2`.
- Lockbox should not unnecessarily stop scope or spectrum analyzer except when
  the original routine temporarily owns scope for calibration/acquisition.

## Config Rules

- Default config directory is `PYRPL_USER_DIR/config` or
  `~/pyrpl_user_dir/config`.
- Store module setup attributes in root module branches like `scope`, `asg0`,
  and `iq1`.
- Store saved states in `<module>_states`.
- Store web-only layout under `pyrpl_websocket.workspace`.

## IIR Rules

- IIR is a graph-centered editor. Magnitude and phase plots are primary UI.
- `complex_poles`, `complex_zeros`, `real_poles`, and `real_zeros` are the
  source of truth.
- Plot clicks/drags must edit those lists; list edits must update the plot.
- Keep count/add/remove/selection/per-element controls for pole and zero lists.
- Original click model: plain click selects nearest marker, CTRL-click adds a
  real pole, SHIFT-click adds a real zero, CTRL double-click adds a complex
  pole, SHIFT double-click adds a complex zero.
- Pole/zero/gain/loops edits must run PyRPL's IIR design routine and write the
  FPGA coefficient RAM at IIR base `+ 0x8000`; updating only the browser plot is
  not a hardware migration.
