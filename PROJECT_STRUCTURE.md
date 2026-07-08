# Project Structure

This repository contains PyRPL, a Python/Qt application and library for controlling
Red Pitaya FPGA boards as DSP instruments for feedback control, lockboxes, signal
generation, acquisition, and analysis.

At a high level, the project is split into:

- a Python package in `pyrpl/`
- Red Pitaya FPGA and embedded-server assets in `pyrpl/fpga/` and
  `pyrpl/monitor_server/`
- Qt GUI widgets in `pyrpl/widgets/`
- Sphinx documentation and example notebooks in `docs/`
- tests in `pyrpl/test/`
- packaging, CI, and developer tooling at the repository root

## Top-Level Files

| Path | Purpose |
| --- | --- |
| `README.md` | User-facing overview, installation instructions, quick start, tests, and FPGA build notes. |
| `pyproject.toml` | Main Python package metadata, dependencies, optional dependency groups, pytest configuration, coverage configuration, and Ruff configuration. |
| `setup.py` | Minimal compatibility shim that delegates packaging to `pyproject.toml`. |
| `setup.cfg` | Legacy nose/pytest-related configuration and wheel metadata. |
| `requirements.txt` | Compatibility note pointing users to `pyproject.toml` for actual dependencies. |
| `environment_pyrpl.yml` | Conda environment definition for users who install with Conda. |
| `pyrpl.spec` | PyInstaller specification used to build standalone binaries. |
| `uv.lock` | Lock file for Python dependency resolution with `uv`. |
| `CHANGELOG.md` | Project changelog. |
| `LICENSE` | MIT license file. |
| `CODE_OF_CONDUCT.md` | Community conduct policy. |
| `remote_global_config.yml` | Test configuration used by CI when running against remote Red Pitaya hardware. |
| `summurize_import_time.py` | Utility script for investigating import time. |
| `Untitled.ipynb` | Loose notebook at the repository root; likely exploratory or legacy material. |

## Runtime Entry Points

| Path | Purpose |
| --- | --- |
| `pyrpl/__main__.py` | Command-line entry point for `python -m pyrpl`. It parses simple `key=value` arguments, creates a `Pyrpl` instance, and starts the Qt event loop. |
| `pyrpl/__init__.py` | Package initialization. It sets warning filters, creates or reuses the Qt application, locates user configuration, loads global config, and exposes the main public classes and modules. |
| `pyrpl/pyrpl.py` | Defines the high-level `Pyrpl` class. This class loads configuration, creates a `RedPitaya`, loads software modules, restores module setup attributes, and creates the top-level GUI. |
| `pyrpl/redpitaya.py` | Defines the `RedPitaya` connection object. It handles configuration precedence, SSH setup, FPGA/server reloads, client startup, fake/no-hardware modes, and hardware-module registration. |

The typical startup flow is:

1. `python -m pyrpl config=my_config hostname=...` enters through
   `pyrpl/__main__.py`.
2. `pyrpl/__init__.py` prepares Qt, logging, user directories, and global
   configuration.
3. `Pyrpl` in `pyrpl/pyrpl.py` loads a YAML-backed `MemoryTree`
   configuration.
4. `RedPitaya` in `pyrpl/redpitaya.py` connects to the board, starts the
   monitor server/client, and creates hardware module objects.
5. `Pyrpl.load_software_modules()` creates module managers and higher-level
   instruments such as the network analyzer, spectrum analyzer, curve viewer,
   config editor, and lockbox.
6. If GUI mode is enabled, `PyrplWidget` is shown.

## Python Package Layout

```text
pyrpl/
  __init__.py
  __main__.py
  pyrpl.py
  redpitaya.py
  redpitaya_client.py
  sshshell.py
  modules.py
  attributes.py
  module_attributes.py
  acquisition_module.py
  async_utils.py
  async_utils_old.py
  memory.py
  curvedb.py
  directories.py
  errors.py
  pyrpl_utils.py
  _version.py
  config/
  fpga/
  hardware_modules/
  monitor_server/
  software_modules/
  test/
  widgets/
```

### Core Framework Files

| Path | Purpose |
| --- | --- |
| `pyrpl/modules.py` | Defines the common `Module` framework used by both hardware and software modules. It includes module metadata handling, setup behavior, ownership, state loading/saving, and Qt signal launchers. |
| `pyrpl/attributes.py` | Descriptor system for module attributes. Attributes synchronize programmatic values, GUI widgets, configuration persistence, validation, and hardware register reads/writes. |
| `pyrpl/module_attributes.py` | Additional module and attribute helpers used across hardware and software modules. |
| `pyrpl/acquisition_module.py` | Base class for asynchronous acquisition instruments. It provides `single`, `single_async`, `continuous`, pause/stop/resume behavior, averaging, and curve-saving support. |
| `pyrpl/async_utils.py` | Async/event-loop helpers used by acquisition and GUI-aware workflows. |
| `pyrpl/memory.py` | YAML-backed hierarchical configuration system. It implements `MemoryTree` and `MemoryBranch`, preserving module state in user config files. |
| `pyrpl/curvedb.py` | Curve/data persistence layer used by acquisition modules and the curve viewer. |
| `pyrpl/directories.py` | Resolves package, default config, and user data/config/curve/lockbox directories. |
| `pyrpl/pyrpl_utils.py` | Shared utilities for logging, naming, type conversion, timing, subclass discovery, and helper behavior. |
| `pyrpl/errors.py` | Project-specific exception types. |

## Hardware Modules

Hardware modules live under `pyrpl/hardware_modules/`. These classes model
FPGA-backed blocks and expose them as Python objects with synchronized
configuration, GUI widgets, and register access.

```text
pyrpl/hardware_modules/
  __init__.py
  dsp.py
  filter.py
  hk.py
  ams.py
  sampler.py
  scope.py
  asg.py
  iq.py
  pid.py
  pwm.py
  trig.py
  iir/
    __init__.py
    iir.py
    iir_theory.py
```

| Path | Purpose |
| --- | --- |
| `dsp.py` | Shared DSP-module base behavior, input/output routing, and DSP register helpers. |
| `filter.py` | Base class for modules with filter behavior. |
| `hk.py` | Housekeeping module, including LEDs and expansion connector behavior. |
| `ams.py` | Analog mixed-signal support. |
| `sampler.py` | Direct sampling/readout helper. |
| `scope.py` | Oscilloscope/acquisition hardware module. |
| `asg.py` | Arbitrary signal generator modules. |
| `iq.py` | IQ modulation/demodulation module. |
| `pid.py` | PID feedback controller module. |
| `pwm.py` | PWM output module. |
| `trig.py` | Trigger module. |
| `iir/iir.py` | IIR filter hardware module. |
| `iir/iir_theory.py` | Transfer-function and filter-design helpers for IIR behavior. |

`RedPitaya.cls_modules` in `pyrpl/redpitaya.py` defines which hardware modules
are instantiated for a board: housekeeping, AMS, scope, sampler, ASGs, PWMs,
IQs, PIDs, trigger, and IIR.

## Software Modules

Software modules live under `pyrpl/software_modules/`. They coordinate one or
more hardware modules to provide higher-level instruments and workflows.

```text
pyrpl/software_modules/
  __init__.py
  module_managers.py
  network_analyzer.py
  spectrum_analyzer.py
  curve_viewer.py
  pyrpl_config.py
  software_pid.py
  loop.py
  lockbox/
    __init__.py
    lockbox.py
    input.py
    output.py
    stage.py
    gainoptimizer.py
    models/
      __init__.py
      linear.py
      interferometer.py
      fabryperot.py
      pll.py
      custom_lockbox_example.py
```

| Path | Purpose |
| --- | --- |
| `__init__.py` | Imports software module classes and provides `get_module(name)`, which resolves a class by subclass discovery. |
| `module_managers.py` | Resource managers for hardware module pools: ASGs, IQs, PIDs, scopes, IIRs, triggers, PWMs, and housekeeping. |
| `network_analyzer.py` | Network analyzer software instrument. |
| `spectrum_analyzer.py` | Spectrum analyzer software instrument. |
| `curve_viewer.py` | Curve browser/viewer backed by saved acquisition data. |
| `pyrpl_config.py` | Module for editing/viewing PyRPL configuration. |
| `software_pid.py` | Software-side PID loop support. |
| `loop.py` | Generic loop and plotting-loop abstractions. |
| `lockbox/` | Higher-level feedback-control framework for lock acquisition, calibration, stages, input/output signals, and model-specific lock behavior. |
| `lockbox/models/` | Built-in lockbox models, including linear, interferometer, Fabry-Perot, PLL, and custom examples. |

By default, `Pyrpl` loads module managers plus:

- `NetworkAnalyzer`
- `SpectrumAnalyzer`
- `CurveViewer`
- `PyrplConfig`
- `Lockbox`

The default list is defined in `default_pyrpl_config` in `pyrpl/pyrpl.py`.

## GUI Layer

GUI code lives under `pyrpl/widgets/`. It is built with Qt through `qtpy` and
uses `pyqtgraph` for plotting-oriented widgets.

```text
pyrpl/widgets/
  __init__.py
  pyrpl_widget.py
  startup_widget.py
  yml_editor.py
  spinbox.py
  attribute_widgets.py
  images/
  module_widgets/
```

| Path | Purpose |
| --- | --- |
| `pyrpl_widget.py` | Main application window, dock management, logging display, and exception handling integration. |
| `startup_widget.py` | Dialog for selecting Red Pitaya connection settings. |
| `yml_editor.py` | YAML/config editor widget. |
| `spinbox.py` | Numeric spinbox widgets for integers, floats, and complex values. |
| `attribute_widgets.py` | Widget implementations for the descriptor attributes in `attributes.py`. |
| `images/` | Small bitmap resources used by widgets. |
| `module_widgets/` | Per-module GUI panels for hardware and software modules. |

`pyrpl/widgets/module_widgets/` maps module types to specialized controls:

- `asg_widget.py`, `iq_widget.py`, `pid_widget.py`, `pwm_widget.py`,
  `scope_widget.py`, `iir_widget.py`, `hk_widget.py`
- `na_widget.py` and `spec_an_widget.py` for analysis instruments
- `curve_viewer_widget.py` and `pyrpl_config_widget.py`
- `lockbox_widget.py` for lockbox workflows
- `module_manager_widget.py` for pooled hardware modules
- `base_module_widget.py` and `acquisition_module_widget.py` for shared widget
  foundations
- `schematics.py` for visual signal-routing schematics

## FPGA and Red Pitaya Assets

FPGA and embedded-board assets live under `pyrpl/fpga/` and
`pyrpl/monitor_server/`.

```text
pyrpl/fpga/
  README.md
  Makefile
  settings.sh
  red_pitaya.bin
  red_pitaya.dtbo
  red_pitaya_withPRNG.bin
  red_pitaya_vivado.tcl
  red_pitaya_vivado_project.tcl
  ip/
  rtl/
  sdc/
  sdc_250/
  out/

pyrpl/monitor_server/
  Makefile
  monitor_server.c
  monitor_server
  monitor_server_0.95
```

| Path | Purpose |
| --- | --- |
| `pyrpl/fpga/README.md` | FPGA directory map, Vivado/Vitis build notes, device-tree notes, and Red Pitaya signal mapping. |
| `pyrpl/fpga/rtl/` | Verilog/SystemVerilog source for FPGA modules such as scope, ASG, IQ, PID, IIR, PWM, trigger, AXI, and top-level DSP blocks. |
| `pyrpl/fpga/ip/` | Vivado block design and IP-related files. |
| `pyrpl/fpga/sdc/`, `pyrpl/fpga/sdc_250/` | Xilinx constraints for supported board variants. |
| `pyrpl/fpga/out/` | Generated reports and hardware artifacts from FPGA builds. |
| `pyrpl/fpga/*.tcl` | Vivado/Vitis build and project-generation scripts. |
| `pyrpl/fpga/*.bat` | Windows-oriented helper scripts for FPGA/device-tree/build tasks. |
| `pyrpl/monitor_server/monitor_server.c` | C source for the Red Pitaya monitor server used by PyRPL communication. |
| `pyrpl/monitor_server/monitor_server*` | Built monitor server binaries. |

Most users do not need to rebuild the FPGA image because prebuilt `.bin` and
`.dtbo` files are included. Developers changing FPGA behavior should start with
`pyrpl/fpga/README.md`, `pyrpl/fpga/Makefile`, and `pyrpl/fpga/rtl/`.

## Configuration

```text
pyrpl/config/
  global_config.yml
  nosetests_source.yml
  nosetests_source_lockbox.yml
  nosetests_source_dummy_module.yml
```

| Path | Purpose |
| --- | --- |
| `pyrpl/config/global_config.yml` | Default global configuration, including curve database backend and log level. |
| `pyrpl/config/nosetests_source*.yml` | Legacy/default configuration sources for tests. |
| `remote_global_config.yml` | CI override for hardware-backed tests with slower remote communication expectations. |

The configuration system is implemented by `pyrpl/memory.py`. Runtime user
configuration is normally stored outside the repository in `PYRPL_USER_DIR` or
`~/pyrpl_user_dir`.

## Tests

Tests live under `pyrpl/test/`.

```text
pyrpl/test/
  conftest.py
  test_base.py
  test_redpitaya.py
  test_memory.py
  test_attribute.py
  test_load_save.py
  test_lockbox.py
  test_na.py
  test_spectrum_analyzer.py
  test_hardware_modules/
  test_widgets/
  test_ipython_notebook/
```

The test suite covers:

- configuration memory and save/load behavior
- descriptor attributes and proxy properties
- Red Pitaya connection/client behavior
- hardware modules such as scope, sampler, PID, IQ, IIR, ASG, AMS, trigger,
  and DSP input routing
- software modules such as network analyzer, spectrum analyzer, and lockbox
- Qt widgets and startup dialogs
- notebook execution

`pyproject.toml` configures pytest discovery with `testpaths = ["pyrpl/test"]`
and enables coverage reports for `pyrpl`.

Some tests expect real Red Pitaya hardware. The CI workflow injects hardware
connection values through secrets and uses `remote_global_config.yml`.

## Documentation and Examples

Documentation lives under `docs/`.

```text
docs/
  makefile
  make.bat
  source/
  example-notebooks/
  old_files/
```

| Path | Purpose |
| --- | --- |
| `docs/source/index.rst` | Main Sphinx documentation index. |
| `docs/source/conf.py` | Sphinx configuration. |
| `docs/source/installation.rst`, `gui.rst`, `api.rst`, `basics.rst` | Main user-facing manual pages. |
| `docs/source/developer_guide/` | Developer notes for coding workflow, style, tests, FPGA compilation, APIs, async behavior, and distribution. |
| `docs/source/user_guide/` | Legacy/user-guide material retained in the docs tree. |
| `docs/source/reference_guide/` and `indices_and_tables/` | Reference/autodoc index material. |
| `docs/source/gallery/` | Gallery documentation. |
| `docs/source/logos/`, images, GIFs, screenshots | Documentation visual assets. |
| `docs/example-notebooks/` | Runnable examples for ASG synchronization, PWM, IQ accumulator, async acquisition, tutorials, and article examples. |
| `docs/old_files/` | Historical design files, old notebooks, GUI images, and reference documents. |

## CI, Build, and Legacy Tooling

```text
.github/workflows/
  ci.yml
  docs.yml
  manual-build.yml

.docker/
  build.sh
  run*.sh
  all_python_build.sh
  setup_jenkins.sh
  test/Dockerfile

old_CI_config_files/
  Dockerfile
  Makefile
  Jenkinsfile
  appveyor.yml
  azure-pipelines.yml
  jenkins_global_config.yml
  autocorrectpep8_script.sh
  .travis.yml
```

| Path | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | Main CI/CD pipeline. It installs PyRPL, tests against configured Red Pitaya hardware, builds PyInstaller binaries, and uploads artifacts. |
| `.github/workflows/docs.yml` | Builds Sphinx documentation and deploys it to GitHub Pages. |
| `.github/workflows/manual-build.yml` | Manual build workflow. |
| `.docker/` | Older Docker/Jenkins helper scripts. |
| `old_CI_config_files/` | Historical CI configurations retained for reference. |

## Dependency Groups

Core runtime dependencies are declared in `pyproject.toml`:

- `scp`
- `pyyaml`
- `pyqtgraph`
- `numpy`
- `paramiko`
- `qtpy`
- `qasync`

Qt bindings are optional extras:

- `qt-pyqt5`
- `qt-pyqt6`
- `qt-pyside2`
- `qt-pyside6`

Other optional extras:

- `test` for pytest, coverage, notebook, plotting, and scientific test support
- `docs` for Sphinx documentation builds
- `ipython` for notebook/IPython support
- `dev` for development, testing, docs, PyInstaller, and SciPy

## Where to Start

| Task | Start Here |
| --- | --- |
| Run the application | `README.md`, then `pyrpl/__main__.py` and `pyrpl/pyrpl.py` |
| Understand startup and configuration | `pyrpl/pyrpl.py`, `pyrpl/redpitaya.py`, `pyrpl/memory.py`, `pyrpl/directories.py` |
| Add or change a hardware module | `pyrpl/hardware_modules/`, `pyrpl/modules.py`, `pyrpl/attributes.py`, and related FPGA RTL if needed |
| Add or change a software instrument | `pyrpl/software_modules/`, especially `module_managers.py`, `loop.py`, and `acquisition_module.py` |
| Change the GUI for a module | `pyrpl/widgets/module_widgets/` and `pyrpl/widgets/attribute_widgets.py` |
| Change lockbox behavior | `pyrpl/software_modules/lockbox/` and `pyrpl/software_modules/lockbox/models/` |
| Change FPGA behavior | `pyrpl/fpga/README.md`, `pyrpl/fpga/Makefile`, and `pyrpl/fpga/rtl/` |
| Update docs | `docs/source/` |
| Run or extend tests | `pyrpl/test/` and pytest settings in `pyproject.toml` |

## Architectural Summary

PyRPL is built around a layered model:

1. `RedPitaya` owns board communication and creates hardware module objects.
2. Hardware modules wrap FPGA registers and hardware blocks.
3. Software modules coordinate hardware modules into instruments and workflows.
4. The descriptor-based attribute system keeps Python state, hardware state,
   GUI widgets, and YAML configuration synchronized.
5. Qt widgets provide a GUI over the same modules exposed by the Python API.
6. Sphinx docs and notebooks demonstrate both high-level lockbox workflows and
   low-level direct instrument control.

The most important mental model is that modules are the central unit of the
application. A module has attributes, optional hardware register access,
optional GUI widgets, setup/load/save behavior, and ownership/resource semantics.
Hardware modules expose FPGA capabilities; software modules compose those
capabilities into user-facing instruments.
