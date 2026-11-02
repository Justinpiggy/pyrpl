[<img src="https://pyrpl-fpga.github.io/pyrpl/_static/logo.png" width="250" alt="PyRPL">](https://www.pyrpl.org/)
[![GitHub Actions CI](https://github.com/pyrpl-fpga/pyrpl/actions/workflows/ci.yml/badge.svg)](https://github.com/pyrpl-fpga/pyrpl/actions)
[![code coverage](https://codecov.io/github/pyrpl-fpga/pyrpl/coverage.svg?branch=master "Code coverage")](https://codecov.io/gh/pyrpl-fpga/pyrpl)
[![Python versions](https://img.shields.io/badge/python-3.8%20|%203.9%20|%203.10%20|%203.11%20|%203.12%20|%203.13-blue.svg)](https://github.com/pyrpl-fpga/pyrpl)
[![Documentation Status](https://img.shields.io/badge/docs-github%20pages-blue)](https://pyrpl-fpga.github.io/pyrpl/)
[![join chat on gitter](https://badges.gitter.im/JoinChat.svg "Join chat on gitter")](https://gitter.im/lneuhaus/pyrpl)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pyrpl-fpga/pyrpl/blob/master/LICENSE)
[![GitHub downloads](https://img.shields.io/github/downloads/pyrpl-fpga/pyrpl/total)](https://github.com/pyrpl-fpga/pyrpl/releases/latest)
[![GitHub release](https://img.shields.io/github/v/release/pyrpl-fpga/pyrpl)](https://github.com/pyrpl-fpga/pyrpl/releases/latest)

PyRPL (Python RedPitaya Lockbox) turns your RedPitaya into a powerful DSP device, especially suitable as a digital lockbox and measurement device in quantum optics experiments. A detailed scientific article describing PyRPL's architecture and functions can be found here:

[Python Red Pitaya Lockbox (PyRPL): An open source software package for digital feedback control in quantum optics experiments](https://pubs.aip.org/aip/rsi/article-abstract/95/3/033003/3269904/Python-Red-Pitaya-Lockbox-PyRPL-An-open-source?redirectedFrom=fulltext)

## Website
The official PyRPL website address is [http://pyrpl.readthedocs.io/](http://pyrpl.readthedocs.io).

## Installation
The easiest and fastest way to get PyRPL is to download and execute the [precompiled executable for windows, mac and linux](https://github.com/pyrpl-fpga/pyrpl/releases). This option requires no extra programs to be installed on the computer.

If instead you would like to use and/or modify the source code, make sure you have an
installation of Python (3.7 to 3.13). The easiest way to install the PyRPL python module cleanly is to run 
```
pip install "git+https://github.com/pyrpl-fpga/pyrpl.git#egg=pyrpl[qt-pyqt5]"
```
This will pull the most recent code from Github and install the needed module. It is recommended to use a new environment. DO NOT USE `pip install pyrpl` ! The code hosted on pypi is outdated.

If you are new to Python or unexperienced with fighting installation issues, it is recommended to install the [Anaconda](https://www.continuum.io/downloads) Python distribution, which allows to install all PyRPL dependencies via
```
conda install numpy paramiko nose pip pyqt qtpy pyqtgraph pyyaml scp qasync
```
Check [this documentation section](http://pyrpl-fpga.github.io/pyrpl//en/latest/user_guide/installation/common_problems.html#anaconda-problems) for hints if you are unable to execute conda in a terminal. Alternatively, if you prefer creating a virtual environment for pyrpl, do so with the following two commands
```
conda create -y -n pyrpl-env numpy paramiko nose pip pyqt qtpy pyqtgraph pyyaml scp qasync
conda activate pyrpl-env
```

Next, clone (if you have a [git client](https://git-scm.com/downloads) installed - recommended option) the pyrpl repository to your computer with 
```
git clone https://github.com/pyrpl-fpga/pyrpl.git
```
or [download and extract](https://github.com/pyrpl-fpga/pyrpl/archive/master.zip) (if you do not want to install git on your computer) the repository. 

If you are using pip, you can just navigate to the pyrpl directory and run 

```
pip install -e .[qt-pyqt5]
```
if you want an editable installation of pyrpl or 

```
pip install .[qt-pyqt5]
```
for a regular installation (if you have no instention of modifying the code). I recommend using pip as conda tends to become very slow at solving environments. Note that pyrpl requires a Qt binding but it is compatible with PyQt5, PyQt6, PySide2 and PySide6 so you can also run :

```
pip install -e .[qt-pyqt6]
pip install -e .[qt-pyside2]  
pip install -e .[qt-pyside6]
```


If you want to use conda, you can run :

```
conda create -y -n pyrpl-env numpy paramiko pip pyqt qtpy pyqtgraph pyyaml scp qasync
conda activate pyrpl-env
```
This will create an new conda environment named "pyrpl-env" and install all the needed modules inside. 

You can also use the environment config file "environment_pyrpl.yml"
```
conda env create -f environment_pyrpl.yml
conda activate pyrpl-env
```

## Installation with Optional Dependencies

### For Testing

```bash
pip install -e .[test]
```

### For IPython/Jupyter Support

```bash
pip install -e .[ipython]
```

### For Development (all dependencies)

```bash
pip install -e .[dev]
```


## Quick start
First, hook up your Red Pitaya / STEMlab to a LAN accessible from your computer (follow the instructions for this on redpitya.com and make sure you can access your Red Pitaya with a web browser by typing its ip-address /  hostname into the address bar).
In a command line terminal, type
```
python -m pyrpl your_configuration_name
```
A GUI should open, let you configure the RedPitaya device you would like to use, and you can start playing around with pyrpl. Different strings for 'your_configuration_name' create different configurations that will be automatically remembered by PyRPL, for example if you have several different redpitayas. Different RedPitayas with different configuration names can be run simultaneously in separate terminals.

## Web Interface

The headless FastAPI/TypeScript interface can be installed without Qt or the
desktop SSH stack:

```bash
pip install -e ".[web]"
npm --prefix web ci
npm --prefix web run build
pyrpl-web --hostname _FAKE_
```

See [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md) for Red Pitaya ARMv7 installation,
the dependency audit, `monitor_server` startup expectations, authentication,
single-writer browser control, SSH tunneling, and systemd deployment.
To build locally, overwrite the deployed application, and run the complete web
backend on the board, use `bash deploy_redpitaya.sh` from `pyrpl-env`. The UI is
then available directly at `http://10.0.5.118:8801`; see the deployment guide for
first-run dependencies and the read-only code policy.

Browser diagnostics are off by default. Open `http://10.0.5.118:8801/?debug=1`
to show session counters, acquisition progress, routine status messages, and
interaction hints in the bottom status bar. This flag applies only to that
page; removing it (or using `?debug=0`) restores the normal view. Operation
errors remain visible in the bottom bar in either mode. Reload the page after
deploying frontend changes so an already-open tab loads the new code.

PC scripts can read status and Scope traces or control instruments through the
existing HTTP API. See [the full HTTP API and Python client guide](docs/source/http_api.rst)
and [the generated instrument catalog](docs/source/http_api_catalog.rst).
The dependency-free client is `pyrpl_websocket.http_client.RedPitayaClient`;
[a read-only example](examples/http_client_status.py) retrieves lock status and
optionally saves Scope channels to CSV. No browser or desktop Qt runtime is needed.
The [Jupyter demo](examples/http_control_demo.ipynb) shows how to arm and capture
Scope and Spectrum traces, plot/export data, inspect Lockbox status, and set
parameters/start/stop a lock. It includes Anaconda setup instructions; the
Lockbox control example is opt-in.

The web header's **Profiles** button saves named snapshots, loads them, and renames
them. The active profile appears in the top-left heading and browser tab title.
Profiles include instrument and Lockbox settings, saved module setups, layout,
and local display options. Loading stops acquisition and unlocks Lockbox; saved
curves and board connection/calibration settings remain separate. Working settings
still autosave, while named snapshots are overwritten only by **Save current**.
Use **Download selected** to export a saved profile as JSON. Choose a file and
click **Upload file** to save an independent copy; change **Profile name** if a
duplicate already exists. Uploading does not apply settings until **Load selected**.

Web layouts are defined in `web/src/app.css`. Instrument panels use container
queries so controls reflow within split panes as well as narrow browser windows.
Related actions stay grouped; constrained forms scroll and card rows size to their
contents. Keep these rules when adding controls instead of hiding form overflow.
Splitters support arrow keys, Shift for larger steps, and Home/End for limits.

Run `npm --prefix web test` for type checking and unit tests. After building,
`npm --prefix web run test:e2e` also checks all panels at narrow/short viewports,
three-pane layouts, minimum-width panes, keyboard resizing, and chart resizing
using fake hardware. `web/test/responsive-ui.spec.ts` checks actual control
reachability and clipping, not just whether elements exist.

A GUI should open, let you configure the RedPitaya device you would like to use, and you can start playing around with pyrpl. Different strings for 'your_configuration_name' create different configurations that will be automatically remembered by PyRPL, for example if you have several different redpitayas. Different RedPitayas with different configuration names can be run simultaneously in separate terminals.

## Issues
We collect a list of common problems on the [documentation website](http://pyrpl-fpga.github.io/pyrpl//en/latest/user_guide/installation/common_problems.html). If you do not find your problem listed there, please report all problems or wishes as new issues on [this page](https://github.com/pyrpl-fpga/pyrpl/issues), so we can fix it and improve the future user experience.

## Unit test
If you want to check whether PyRPL works correctly on your machine, navigate with a command line terminal into the pyrpl root directory and type the  following commands (by substituting the ip-address / hostname of your Red Pitaya, of course)
```
pip install pytest pytest-cov matplotlib nbconvert
set REDPITAYA_HOSTNAME=your_redpitaya_ip_address
pytest
```
All tests should take about 3 minutes and finish without failures or errors. If there are errors, please report the console output as an issue (see the section "Issues" below for detailed explanations).

## Next steps / documentation
The full html documentation is hosted at [http://pyrpl-fpga.github.io/pyrpl/](http://pyrpl-fpga.github.io/pyrpl/). Alternatively, you can download a .pdf version at [https://media.readthedocs.org/pdf/pyrpl/latest/pyrpl.pdf](https://media.readthedocs.org/pdf/pyrpl/latest/pyrpl.pdf). We are still in the process of creating an fully up-to-date version of the documentation of the current code. If the current documentation is wrong or insufficient, please post an [issue](https://github.com/pyrpl-fpga/pyrpl/issues/new) and we will prioritize documenting the part of code you need.

## Updates
Since PyRPL is continuously improved, you should install upgrades if you expect bugfixes. 
If you have cloned the GitHub repository (recommended for bleeding-edge updates), navigate into the pyrpl root directory on your local harddisk computer and type
```
git pull
```

## FPGA bitfile generation (only for developers)
In case you would like to modify the logic running on the FPGA, you should make sure that you are able to [generate a working bitfile on your machine](http://pyrpl-fpga.github.io/pyrpl//en/latest/developer_guide/fpga_compilation.html). In short, to do so, you must install Vivado 2024.2 [(64-bit windows](windows web-installer](https://www.xilinx.com/member/forms/download/xef.html?filename=Xilinx_Vivado_SDK_2024.2_1118_2_Win64.exe&akdm=1) or [Linux)](https://www.xilinx.com/member/forms/download/xef.html?filename=Xilinx_Vivado_SDK_2024.2_1118_2_Lin64.bin&akdm=1) [together with a working license](http://pyrpl-fpga.github.io/pyrpl//en/latest/developer_guide/fpga_compilation.html#fpga-license). Next, with a terminal in the pyrpl root directory, type
```
cd pyrpl/fpga
make
```
Compilation should take between 10 and 30 minutes, depending on your machine. If there are no errors during compilation, the new bitfile will be in the (pyrpl/fpga/out) repository. If you replace the (pyrpl/fpga/red_pitaya.bin), it will be automatically used at the next restart of PyRPL. The best way to getting started is to skim through the very short Makefile in the fpga directory and to continue by reading the files mentioned in the makefile and the refences therein. All verilog source code is located in the subdirectory pyrpl/fpga/rtl/. 

## License
Please read our license file [LICENSE](https://github.com/pyrpl-fpga/pyrpl/blob/master/LICENSE) for more information. 
