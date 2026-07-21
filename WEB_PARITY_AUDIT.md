# Web Migration Parity Audit

This file records the migration rule for every web panel: read the original
PyRPL module and widget code first, then expose the same user-facing controls
and actions in the web version. Internal registers may still exist in backend
helpers, but they should not become web controls unless they are part of the
original GUI or are required by an original control routine.

## Audit Rule

For each module, check these original PyRPL surfaces before changing the web
panel:

- `_gui_attributes`: controls visible in the PyQt GUI.
- `_setup_attributes`: values saved/loaded by setup state.
- Widget subclasses in `pyrpl/widgets/module_widgets`: layout and action
  buttons.
- Control routines such as `_setup()`, `_start_trace_acquisition()`,
  `save_curve()`, `lock()`, `sweep()`, and calibration helpers.

Do not add debug helpers or convenience actions as normal web UI controls
unless they appear in the original user workflow. Do not omit original controls;
if a control cannot be completed immediately, record it here as an explicit
gap.

## Ownership Parity

Hardware resource allocation follows PyRPL's `ModuleManager`: compatible
resources are selected in reverse order, acquiring a resource applies its
ownership hook, and releasing it restores its persisted setup. The browser
continues to receive `owner` state for disabled controls, but it does not own
the resource policy. Scope follows its normal stop-on-ownership hook except for
the required Lockbox calibration path, which locks controls while forwarding
the temporary calibration capture through the live Scope stream.

## Current Panels

| Web panel | Original PyRPL source | Current parity status |
| --- | --- | --- |
| Scope | `pyrpl/hardware_modules/scope.py`, `pyrpl/widgets/module_widgets/scope_widget.py`, `acquisition_module_widget.py` | Inputs, duration/decimation, trigger, FPGA and trace averaging, rolling capture, original acquisition button states, channel/math visibility, XY display, per-channel CurveDB persistence, CSV export, and plot navigation are migrated. Rolling uses the original negative time axis and bypasses trace averaging. Per the user's required oscilloscope workflow, a completed single capture remains `paused_single` for explicit rearm instead of changing to PyRPL's final `stopped` state. Browser math safely supports scalar numeric expressions and element-wise NumPy spellings over `ch1`, `ch2`, and `times`, including `np.square`, `np.clip`, `np.where`, extrema, inverse trig aliases, `np.heaviside`, and angle constants/conversions. Arbitrary NumPy whole-array APIs accepted by the original Python `eval` remain a documented compatibility gap. Dedicated-board acquisition and browser WebSocket updates are now validated; trigger, rearm, rolling, and duration/decimation need their own hardware matrix. |
| ASG | `pyrpl/hardware_modules/asg.py`, `asg_widget.py` | GUI/setup attributes are migrated: waveform, amplitude, offset, frequency, trigger source, output direct, start phase, cycles per burst, setup/trigger/off. |
| Housekeeping | `pyrpl/hardware_modules/hk.py`, `hk_widget.py` | LED and expansion P/N value/direction attributes are migrated. |
| Sampler / AMS | `pyrpl/hardware_modules/sampler.py`, `ams.py`, `attributes.py::PWMRegister` | Both original modules have empty GUI/setup attribute lists. The web telemetry panel deliberately adds no setup actions, ownership, or saved state. It exposes all DSP signal readbacks and `Sampler.stats()`, all four AMS readbacks, and effective writes to DAC2/DAC3 using the original PWM conversion; DAC0/DAC1 are read-only because original PyRPL documents their writes as ineffective. |
| PID | `pyrpl/hardware_modules/pid.py`, `pid_widget.py` | GUI attributes are migrated, including `ival`. PyRPL setup attributes do not include `ival`; web setup/save now follows that. `ival` remains directly writable for lockbox/manual offset routines. |
| IQ | `pyrpl/hardware_modules/iq.py`, `iq_widget.py` | PyRPL GUI/setup attributes are migrated. Internal `on` and `pfd_on` registers are no longer exposed as normal user controls or setup-state fields, but remain backend-writeable for routines such as lockbox PDH and spectrum setup. |
| IIR | `pyrpl/hardware_modules/iir/iir.py`, `iir_widget.py`, `iir_theory.py`, `network_analyzer.py` | GUI/setup controls, routing, pole/zero editor, all original transfer-function stages, CurveDB data/product traces, overflow status, coefficient RAM writes, and Network Analyzer-backed transfer measurement are migrated. Measurement temporarily routes through the analyzer-owned IQ and restores/releases it. Web Unity/Zero remain excluded because PyRPL comments them out as debug-only GUI methods. |
| Trigger | `pyrpl/hardware_modules/trig.py` | Setup attributes are migrated and setup arms the trigger like PyRPL. The web-only separate Arm action was removed. |
| PWM | `pyrpl/hardware_modules/pwm.py`, `pwm_widget.py` | Input routing is migrated. |
| Spectrum Analyzer | `pyrpl/software_modules/spectrum_analyzer.py`, `spec_an_widget.py`, `acquisition_module_widget.py` | Full 16,384-point Scope streaming, the original 16x zero-padded FFT in a browser Web Worker, normalized windows, scope/IQ transfer correction, linear trace averaging, complex cross-spectrum averaging/persistence, baseband/IQ routing, IQ2-only ownership in IQ mode, linked span/RBW/window controls, original acquisition states, unit conversions, CurveDB persistence, zoom/pan, and CSV export are migrated. Worker generations reject results from superseded setup state, while stream generations prevent retired sockets from consuming later acquisitions. Dedicated-board capture and browser rendering of three live 131,073-bin series are validated. Remaining gap: compare final normalization and transfer correction against legacy PyRPL. |
| Network Analyzer | `pyrpl/software_modules/network_analyzer.py`, `na_widget.py`, `acquisition_module_widget.py`, `hardware_modules/iq.py` | Original GUI/setup attributes, IQ manager selection, register-level point stepping, FPGA IQ accumulation, magnitude/phase plots, Single/Continuous/Stop, trace averaging, zero-span data, auto-bandwidth, auto-amplitude ramping, CurveDB persistence, WebSocket updates, and CSV export are migrated. The dedicated-board nine-point internal self-loop passed with maximum unity error `0.0059`. Remaining gap: hardware validation of normalization and transfer-function correction. |
| Curve Viewer | `pyrpl/software_modules/curve_viewer.py`, `curve_viewer_widget.py`, `curvedb.py`, `CurveAttributeWidget` | Newest-100 curve selection, real/complex plotting, YAML parameter display/edit/save, delete, refresh, and PyRPL `.dat` compatibility are migrated. Trusted local `global_config.general.curvedb` modules are loaded through the original `CurveDB` class contract, with the standalone store as fallback. |
| Configuration | `pyrpl/software_modules/pyrpl_config.py`, `pyrpl_config_widget.py`, `memory.py` | The active local config path, top-level branch selector, YAML refresh, validated atomic save, and immediate known-module setup reload are migrated. The browser cannot redirect `configfile` to an arbitrary server path; selecting a different file remains a startup/CLI operation. |
| Lockbox | `pyrpl/software_modules/lockbox/*`, `lockbox_widget.py`, model classes in `pyrpl/software_modules/lockbox/models` and user lockbox dirs | Dynamic model/schema discovery, inputs/outputs/stages, PDH IQ setup, original fixed Lockbox actions, per-input and all-input sweep calibration, stage execution/duration, assisted/manual PID design, live output reconfiguration, selectable expected-signal plots, and complete open-loop magnitude/phase plots with flat/filter/CurveDB analog plants and optional IIR are migrated. Calibration temporarily locks Scope controls, forwards its capture to the Scope stream, and restores the prior Scope setup. Lock status and auto relock run in a persistent server thread using the original 10 ms sampler statistics, expected-signal/slope interval, dual PID saturation criterion, model default lock input, configured interval, and full stage sequence; browser disconnection has no effect. Trusted server-local custom classes execute through a Qt-free runtime with inheritance, descriptors, dynamic GUI actions, formulas, calibration, stage callbacks, hardware/sampler/module-manager proxies, Scope capture/state, sibling imports, and persistent loops. Deliberate boundary: nested `Pyrpl(...)`, Qt widgets/signals, and desktop plot windows are not emulated. |

## Deployment Parity

- The web wheel is self-contained for browser assets and does not require Qt,
  Paramiko, or Node.js at runtime.
- `.[web-redpitaya]` is the ARMv7/Python 3.10 installation contract. Its audit
  rejects Pydantic 2 and optional compiled Uvicorn accelerators.
- Optional bearer/cookie authentication protects both REST and WebSocket
  control paths. It is a LAN access guard, not transport encryption; SSH
  tunneling or an HTTPS reverse proxy remains required on untrusted networks.
- Production uses one renewable writer lease with visible observer/takeover
  state. REST and control-WebSocket mutations are centrally enforced and
  audited. Scope, Spectrum, and Network Analyzer streams use single-producer
  fan-out so additional observers cannot interrupt or divide an acquisition.
- Long-lived event and acquisition WebSockets retry unexpected network loss
  with bounded backoff. Explicit Stop/Close paths cancel retries, and browser
  coverage verifies Scope data resumes after an offline/online transition.
- Narrow screens use document scrolling and stacked instrument panes instead of
  percentage-height Split.js tracks. Automated phone/tablet checks cover Scope
  plot size, Lockbox ordering, menu containment, and horizontal overflow.
- Desktop checks activate every panel at wide and compact PC resolutions and
  reject label/control intersections. Scope trigger-mode legends have reserved
  vertical space, while Curve Viewer explicitly preserves its horizontal
  three-pane Split.js direction.
- Actual installation and acquisition validation on the Zynq-7000 board is
  deferred until hardware is available.

## Immediate Parity Fixes Applied

- Removed IIR Unity/Zero from the web action list and backend action handler.
  These map to PyRPL `_setup_unity()` and `_setup_zero()`, but those methods are
  explicitly commented out of the original IIR GUI attributes as debug helpers.
- Added IIR CurveDB selection, data/data-times-filter visibility, measurement
  visibility, transfer-function stage selection, overflow readback, and the
  original Network Analyzer measurement routine with temporary IQ ownership.
- Removed PID `ival` from web setup/save attributes while keeping it visible and
  directly writable, matching PyRPL where `_gui_attributes` includes `ival` but
  `_setup_attributes` does not.
- Removed IQ `on` and `pfd_on` from web setup/save attributes and visible
  schema, matching PyRPL where they are internal registers rather than GUI/setup
  attributes.
- Added scope `ch1_active` and `ch2_active` as backend state so the existing
  channel checkboxes behave like PyRPL scope channel controls.
- Removed the web-only Scope `run_mode` control. The web panel now uses the
  original Run single/Run continuous/Pause/Resume/Stop state machine and the
  separate Normal/Untriggered (rolling) trigger-mode control.
- Added Scope XY and math traces, original rolling restrictions and negative
  rolling time axis, and setup-change stream restarts so stale frames cannot
  contaminate a new browser average.
- Removed Trigger's separate web Arm action; PyRPL's trigger module arms during
  `_setup()`, so the web panel now uses Setup for that path.
