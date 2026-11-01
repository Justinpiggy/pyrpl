"""Trusted, Qt-free execution runtime for local Lockbox model classes."""

from __future__ import annotations

from .lockbox import UnitConversion

import builtins
import inspect
import logging
import threading
import time as time_module
import types
from collections.abc import Iterator, Mapping
from copy import deepcopy
from pathlib import Path
from typing import Any, TYPE_CHECKING

import numpy as np

from .dsp_registers import sync_iq_phases
from .telemetry import read_sampler_signal, sampler_stats

if TYPE_CHECKING:
    from .lockbox import LockboxInput, LockboxOutput, LockboxSchemaLibrary, LockboxStage, LockboxState
    from .session import WebSession


LOGGER = logging.getLogger(__name__)


class TrustedModelError(RuntimeError):
    """Raised when a trusted local model cannot be loaded or executed."""


class _RuntimeDescriptor:
    def __init__(self, *args, default=None, **kwargs):
        if default is None and args and not isinstance(args[0], type):
            default = args[0]
        self.default = default
        self.name = ""
        self.options = kwargs.get("options")
        self.module_cls = args[0] if args and isinstance(args[0], type) else kwargs.get("module_cls")
        self.module_kwargs = dict(kwargs)

    def __set_name__(self, owner, name: str) -> None:
        self.name = name

    def __get__(self, instance, owner=None):
        if instance is None:
            return self
        adapter = object.__getattribute__(instance, "_runtime_adapter")
        return adapter.get(self.name, deepcopy(self.default), descriptor=self)

    def __set__(self, instance, value) -> None:
        adapter = object.__getattribute__(instance, "_runtime_adapter")
        adapter.set(self.name, value)


class _ModuleDictDescriptor(_RuntimeDescriptor):
    def __init__(self, *args, **modules):
        super().__init__(default=None)
        self.modules = dict(modules)


class _RuntimeObject:
    def __init__(self, *args, **kwargs):
        pass

    def __getattr__(self, name: str) -> Any:
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.get(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name.startswith("_runtime_"):
            object.__setattr__(self, name, value)
            return
        static = inspect.getattr_static(type(self), name, None)
        if isinstance(static, property) and static.fset is not None:
            object.__setattr__(self, name, value)
            return
        adapter = object.__getattribute__(self, "_runtime_adapter")
        adapter.set(name, value)


class _HeadlessLockbox(UnitConversion, _RuntimeObject):
    def calibrate_all(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.calibrate_all(*args, **kwargs)

    def get_analog_offsets(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._measure_lockbox_offsets_no_lock()

    def unlock(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._call_lockbox_action_no_lock("unlock")

    def sweep(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._call_lockbox_action_no_lock("sweep")

    def lock(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._call_lockbox_action_no_lock("lock")

    def is_locked(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._lockbox_is_locked_no_lock(allow_custom=False)


class _HeadlessInputSignal(_RuntimeObject):
    def expected_signal(self, variable):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.state.expected_signal(adapter.model.name, variable)

    def expected_slope(self, variable):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.state.expected_slope(adapter.model.name, variable)

    def is_locked(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._lockbox_input_is_locked_no_lock(
            adapter.model,
            adapter.runtime.state.current_stage(),
            allow_custom=False,
        )

    def calibrate(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._calibrate_lockbox_inputs_no_lock(
            [adapter.model.name],
            allow_custom=False,
        )

    def sweep_acquire(self, *args, **kwargs):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.input_sweep(adapter.model)

    acquire = sweep_acquire


class _HeadlessOutputSignal(_RuntimeObject):
    @property
    def pid(self):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.hardware(adapter.model.pid)

    @property
    def is_saturated(self):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._lockbox_output_is_saturated_no_lock(adapter.model)

    def signal(self):
        return object.__getattribute__(self, "_runtime_adapter").model.pid

    def unlock(self, reset_offset=True):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._unlock_one_lockbox_output_no_lock(
            adapter.model.name,
            reset_offset=reset_offset,
        )

    def sweep(self):
        adapter = object.__getattribute__(self, "_runtime_adapter")
        return adapter.runtime.session._configure_lockbox_sweep_no_lock()


class _PlotBuffer:
    """Qt-free target for legacy PlotLoop.append calls."""

    def __init__(self):
        self.plot_start_time = time_module.time()
        self.curves: dict[str, list[tuple[float, Any]]] = {}

    def append(self, *values, **named_values) -> None:
        names = ["green", "red", "blue", "yellow", "cyan", "magenta", "orange", "white"]
        for index, value in enumerate(values):
            named_values.setdefault(names[index], value)
        elapsed = time_module.time() - self.plot_start_time
        for name, value in named_values.items():
            if value is not None:
                self.curves.setdefault(name, []).append((elapsed, value))

    def close(self) -> None:
        pass


class _LoopAdapter:
    def __init__(self, runtime: "TrustedLockboxRuntime", parent: Any, name: str):
        self.runtime = runtime
        self.parent = parent
        self.values: dict[str, Any] = {"name": name}

    def get(self, name: str, default: Any = None, descriptor=None) -> Any:
        if name in {"parent", "lockbox"}:
            return self.parent
        if name in {"pyrpl", "_pyrpl"}:
            return self.runtime.pyrpl
        if name in {"_logger", "logger"}:
            return LOGGER
        if name == "c":
            return self.values.setdefault("c", types.SimpleNamespace())
        if name in self.values:
            return self.values[name]
        if default is not None:
            self.values[name] = deepcopy(default)
            return self.values[name]
        raise AttributeError(name)

    def set(self, name: str, value: Any) -> None:
        self.values[name] = value


class _RuntimeLoop(_RuntimeObject):
    """Server-owned replacement for PyRPL's Qt timer based Loop."""

    def __init__(
        self,
        parent=None,
        name=None,
        interval=0.1,
        loop_function=None,
        setup_function=None,
        teardown_function=None,
        autostart=True,
        plot=True,
        plotter=None,
        **kwargs,
    ):
        parent_adapter = object.__getattribute__(parent, "_runtime_adapter")
        runtime = parent_adapter.runtime
        object.__setattr__(self, "_runtime_adapter", _LoopAdapter(runtime, parent, name or type(self).__name__))
        object.__setattr__(self, "_stop_event", threading.Event())
        object.__setattr__(self, "_thread", None)
        object.__setattr__(self, "_teardown_done", False)
        object.__setattr__(self, "_loop_start_time", time_module.time())
        self.interval = interval
        self.n = 0
        self.kwargs = kwargs
        self.plotter = plotter
        self.plot = _PlotBuffer() if plot and plotter is None else plot
        if setup_function is not None:
            object.__setattr__(self, "setup_loop", setup_function)
        if loop_function is not None:
            object.__setattr__(self, "loop", loop_function)
        if teardown_function is not None:
            object.__setattr__(self, "teardown_loop", teardown_function)
        runtime.register_loop(self)
        self._invoke("setup_loop")
        if autostart:
            self.start_loop()

    @property
    def time(self) -> float:
        return time_module.time() - object.__getattribute__(self, "_loop_start_time")

    @property
    def interval(self) -> float:
        return float(object.__getattribute__(self, "_runtime_adapter").values.get("interval", 0.1))

    @interval.setter
    def interval(self, value: float) -> None:
        object.__getattribute__(self, "_runtime_adapter").values["interval"] = max(0.001, float(value))

    @property
    def running(self) -> bool:
        thread = object.__getattribute__(self, "_thread")
        return thread is not None and thread.is_alive() and not object.__getattribute__(self, "_stop_event").is_set()

    def setup_loop(self):
        pass

    def loop(self):
        pass

    def teardown_loop(self):
        pass

    def plotappend(self, *args, **kwargs) -> None:
        if self.plotter is not None:
            setattr(self.parent, self.plotter, (args, kwargs))
        elif hasattr(self.plot, "append"):
            self.plot.append(*args, **kwargs)

    def _invoke(self, method_name: str) -> None:
        method = getattr(self, method_name)
        try:
            method()
        except TypeError:
            try:
                method(self.parent, self)
            except TypeError:
                method(self.parent)

    def _run(self) -> None:
        stop_event = object.__getattribute__(self, "_stop_event")
        runtime = object.__getattribute__(self, "_runtime_adapter").runtime
        while not stop_event.is_set():
            started = time_module.monotonic()
            try:
                with runtime.session._lock:
                    if stop_event.is_set():
                        break
                    self._invoke("loop")
                    self.n += 1
            except Exception:
                LOGGER.exception("Error in trusted Lockbox loop %s", self.name)
            delay = max(0.0, self.interval - (time_module.monotonic() - started))
            stop_event.wait(delay)

    def start_loop(self) -> None:
        if self.running:
            return
        object.__getattribute__(self, "_stop_event").clear()
        thread = threading.Thread(target=self._run, name=f"lockbox-{self.name}", daemon=True)
        object.__setattr__(self, "_thread", thread)
        thread.start()

    def pause_loop(self) -> None:
        object.__getattribute__(self, "_stop_event").set()

    def _clear(self) -> None:
        self.pause_loop()
        thread = object.__getattribute__(self, "_thread")
        if thread is not None and thread is not threading.current_thread():
            thread.join(timeout=max(1.0, self.interval * 2.0))
        if not object.__getattribute__(self, "_teardown_done"):
            object.__setattr__(self, "_teardown_done", True)
            try:
                self._invoke("teardown_loop")
            except Exception:
                LOGGER.exception("Error tearing down trusted Lockbox loop %s", self.name)
        if hasattr(self.plot, "close"):
            self.plot.close()


class _NamedObjects(Mapping[str, Any]):
    def __init__(self, values: dict[str, Any]):
        self._values = values

    def __getitem__(self, name: str) -> Any:
        return self._values[name]

    def __iter__(self) -> Iterator[Any]:
        return iter(self._values.values())

    def __len__(self) -> int:
        return len(self._values)

    def __contains__(self, name: object) -> bool:
        return name in self._values

    def __getattr__(self, name: str) -> Any:
        try:
            return self._values[name]
        except KeyError as exc:
            raise AttributeError(name) from exc

    def keys(self):
        return self._values.keys()

    def values(self):
        return self._values.values()

    def items(self):
        return self._values.items()


class _CalibrationProxy:
    _ALIASES = {
        "_analog_offset": "analog_offset",
        "_asg_phase": "asg_phase",
        "_analog_offset_rms": "rms",
        "peak_to_peak": "peak_to_peak",
    }

    def __init__(self, calibration):
        object.__setattr__(self, "_calibration", calibration)

    def __getattr__(self, name: str) -> Any:
        calibration = object.__getattribute__(self, "_calibration")
        if name == "setup_attributes":
            return calibration.as_dict()
        if name == "peak_to_peak":
            return calibration.max - calibration.min
        return getattr(calibration, self._ALIASES.get(name, name))

    def __setattr__(self, name: str, value: Any) -> None:
        calibration = object.__getattribute__(self, "_calibration")
        setattr(calibration, self._ALIASES.get(name, name), value)

    def get_stats_from_curve(self, curve) -> None:
        values = np.asarray(curve, dtype=np.float64)
        if not values.size:
            return
        calibration = object.__getattribute__(self, "_calibration")
        calibration.mean = float(np.mean(values))
        calibration.rms = float(np.std(values))
        calibration.min = float(np.min(values))
        calibration.max = float(np.max(values))
        calibration.offset = (calibration.min + calibration.max) / 2.0
        amplitude = (calibration.max - calibration.min) / 2.0
        calibration.amplitude = amplitude if amplitude > 1e-12 else 1.0


class _HardwareModuleProxy:
    def __init__(self, runtime: "TrustedLockboxRuntime", module_name: str):
        object.__setattr__(self, "_runtime", runtime)
        object.__setattr__(self, "name", module_name)

    @property
    def _settings(self):
        session = object.__getattribute__(self, "_runtime").session
        name = object.__getattribute__(self, "name")
        if name in session.asg_settings:
            return session.asg_settings[name]
        if name in session.pid_settings:
            return session.pid_settings[name]
        if name in session.iq_settings:
            return session.iq_settings[name]
        if name in session.pwm_settings:
            return session.pwm_settings[name]
        if name == "scope":
            return session.scope_settings
        if name == "iir":
            return session.iir_settings
        if name == "trig":
            return session.trig_settings
        raise AttributeError(name)

    def __getattr__(self, attribute: str) -> Any:
        if object.__getattribute__(self, "name") == "scope":
            if attribute == "times":
                settings = self._settings
                if settings.trigger_source == "immediately":
                    return np.linspace(0.0, settings.duration, 2**14, endpoint=False)
                return np.linspace(
                    settings.trigger_delay - settings.duration / 2.0,
                    settings.trigger_delay + settings.duration / 2.0,
                    2**14,
                    endpoint=False,
                )
            if attribute == "states":
                runtime = object.__getattribute__(self, "_runtime")
                return runtime.session._module_states["scope"]
        if attribute == "current_output_signal":
            runtime = object.__getattribute__(self, "_runtime")
            return runtime.read_sampler(object.__getattribute__(self, "name"))
        return getattr(self._settings, attribute)

    def __setattr__(self, attribute: str, value: Any) -> None:
        if attribute.startswith("_") or attribute == "name":
            object.__setattr__(self, attribute, value)
            return
        runtime = object.__getattribute__(self, "_runtime")
        if isinstance(value, _HardwareModuleProxy):
            value = value.name
        runtime.session._set_module_attribute_no_lock(object.__getattribute__(self, "name"), attribute, value)

    def setup(self, **attributes):
        for name, value in attributes.items():
            setattr(self, name, value)
        return self

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        runtime = object.__getattribute__(self, "_runtime")
        name = object.__getattribute__(self, "name")
        if name in runtime.session.module_owners:
            runtime.session._release_module_no_lock(name, "lockbox")
        return False

    def save_state(self, state_name: str) -> None:
        runtime = object.__getattribute__(self, "_runtime")
        name = object.__getattribute__(self, "name")
        runtime.session._module_states[name][str(state_name)] = {
            attribute: runtime.session._module_setting_value(name, attribute)
            for attribute in runtime.session._module_setup_dict(name)
        }

    def load_state(self, state_name: str) -> None:
        runtime = object.__getattribute__(self, "_runtime")
        name = object.__getattribute__(self, "name")
        runtime.session._apply_module_setup_no_lock(name, runtime.session._module_states[name][str(state_name)])

    def single(self, timeout=None):
        runtime = object.__getattribute__(self, "_runtime")
        if object.__getattribute__(self, "name") != "scope":
            raise TrustedModelError("single() is only available on the Scope proxy")
        session = runtime.session
        session.scope_settings.running_state = "running_single"
        if hasattr(session.client, "fake_signal_value"):
            frame = session._fake_scope_frame(0, session._fake_scope_clock, 2**14)
            session._fake_scope_clock += 2**14
        else:
            acquisition = session._acquire_hardware_scope_frame(0, 2**14, wait=True)
            if acquisition.frame is None:
                return tuple()
            frame = acquisition.frame
        samples = frame.samples()
        curves = []
        if session.scope_settings.ch1_active:
            curves.append(samples[:, 0])
        if session.scope_settings.ch2_active:
            curves.append(samples[:, 1])
        return tuple(curves)

    def synchronize_iqs(self) -> None:
        sync_iq_phases(object.__getattribute__(self, "_runtime").session.client)


class _SamplerProxy:
    def __init__(self, runtime: "TrustedLockboxRuntime"):
        object.__setattr__(self, "_runtime", runtime)

    def __getattr__(self, signal: str) -> float:
        return object.__getattribute__(self, "_runtime").read_sampler(signal)

    def stats(self, signal, t=0.01):
        name = signal.name if isinstance(signal, _HardwareModuleProxy) else str(signal)
        result = object.__getattribute__(self, "_runtime").sample_stats(name, float(t))
        return result["mean"], result["stddev"], result["max"], result["min"]


class _ModuleManagerProxy:
    def __init__(self, runtime: "TrustedLockboxRuntime", names: list[str]):
        self.runtime = runtime
        self.names = names

    def pop(self, owner=None):
        try:
            name = self.runtime.session._pop_module_no_lock(self.names, "lockbox")
        except ValueError as exc:
            raise TrustedModelError(f"No free module among {self.names}") from exc
        return self.runtime.hardware(name)


class _RedPitayaProxy:
    def __init__(self, runtime: "TrustedLockboxRuntime"):
        self._runtime = runtime
        self.sampler = _SamplerProxy(runtime)

    def __getattr__(self, name: str) -> Any:
        if name in {
            "asg0", "asg1", "pid0", "pid1", "pid2", "iq0", "iq1", "iq2",
            "pwm0", "pwm1", "scope", "iir", "trig",
        }:
            return self._runtime.hardware(name)
        raise AttributeError(name)


class _PyrplProxy:
    def __init__(self, runtime: "TrustedLockboxRuntime"):
        self.rp = _RedPitayaProxy(runtime)
        self.asgs = _ModuleManagerProxy(runtime, ["asg0", "asg1"])
        self.pids = _ModuleManagerProxy(runtime, ["pid0", "pid1", "pid2"])
        self.iqs = _ModuleManagerProxy(runtime, ["iq0", "iq1", "iq2"])
        self.scopes = _ModuleManagerProxy(runtime, ["scope"])
        self.pwms = _ModuleManagerProxy(runtime, ["pwm0", "pwm1"])
        self.iirs = _ModuleManagerProxy(runtime, ["iir"])
        self.trigs = _ModuleManagerProxy(runtime, ["trig"])


class _ObjectAdapter:
    def __init__(self, runtime: "TrustedLockboxRuntime", kind: str, model: Any):
        self.runtime = runtime
        self.kind = kind
        self.model = model

    def get(self, name: str, default: Any = None, descriptor: _RuntimeDescriptor | None = None) -> Any:
        state = self.runtime.state
        if name in {"pyrpl", "_pyrpl"}:
            return self.runtime.pyrpl
        if name in {"_logger", "logger"}:
            return LOGGER
        if name == "name":
            return getattr(self.model, "name", state.classname)
        if name == "parent":
            return self.runtime.root
        if name == "lockbox":
            return self.runtime.root
        if self.kind == "lockbox":
            return self._get_lockbox(name, default, descriptor)
        if self.kind == "input":
            return self._get_input(name, default)
        if self.kind == "output":
            return self._get_output(name, default)
        if self.kind == "stage":
            return self._get_stage(name, default)
        raise AttributeError(name)

    def set(self, name: str, value: Any) -> None:
        state = self.runtime.state
        if self.kind == "lockbox":
            if name in {"current_state", "lock_status"}:
                setattr(state, name, value)
            else:
                state.values[name] = value
            return
        if self.kind in {"input", "output"}:
            if name == "current_state" and self.kind == "output":
                self.model.current_state = value
            else:
                self.model.values[name] = value
            return
        if self.kind == "stage":
            setattr(self.model, name, value)
            return
        raise AttributeError(name)

    def _get_lockbox(self, name: str, default: Any, descriptor: _RuntimeDescriptor | None) -> Any:
        state = self.runtime.state
        if name == "inputs":
            return self.runtime.inputs
        if name == "outputs":
            return self.runtime.outputs
        if name == "sequence":
            return self.runtime.stages
        if name in {"classname", "current_state", "lock_status", "current_stage"}:
            value = state.current_stage() if name == "current_stage" else getattr(state, name)
            return self.runtime.stage_for(value) if name == "current_stage" and value is not None else value
        actions = {
            "calibrate_all": self.runtime.calibrate_all,
            "get_analog_offsets": lambda *args, **kwargs: self.runtime.session._measure_lockbox_offsets_no_lock(),
            "unlock": lambda *args, **kwargs: self.runtime.session._call_lockbox_action_no_lock("unlock"),
            "sweep": lambda *args, **kwargs: self.runtime.session._call_lockbox_action_no_lock("sweep"),
            "lock": lambda *args, **kwargs: self.runtime.session._call_lockbox_action_no_lock("lock"),
            "is_locked": lambda *args, **kwargs: self.runtime.session._lockbox_is_locked_no_lock(),
        }
        if name in actions:
            return actions[name]
        if descriptor is not None and descriptor.module_cls is not None:
            return self.runtime.descriptor_module(self.runtime.root, name, descriptor)
        if name in state.values:
            return state.values[name]
        if default is not None:
            state.values[name] = deepcopy(default)
            return state.values[name]
        raise AttributeError(name)

    def _get_input(self, name: str, default: Any) -> Any:
        model = self.model
        if name == "calibration_data":
            return _CalibrationProxy(model.calibration)
        if name == "iq":
            return self.runtime.hardware(model.iq_module) if model.iq_module else None
        if name == "signal":
            return lambda: self.runtime.session._lockbox_monitor_input_signal_no_lock(model)
        if name == "stats":
            return lambda t=None: self.runtime.input_stats(model, t)
        if name in {"mean", "rms", "max", "min"}:
            values = self.runtime.input_stats(model, None)
            return values[{"mean": 0, "rms": 1, "max": 2, "min": 3}[name]]
        if name in {"sweep_acquire", "acquire"}:
            return lambda *args, **kwargs: self.runtime.input_sweep(model)
        if name == "calibrate":
            return lambda *args, **kwargs: self.runtime.calibrate_input(model.name)
        if name == "is_locked":
            return lambda *args, **kwargs: self.runtime.session._lockbox_input_is_locked_no_lock(
                model,
                self.runtime.state.current_stage(),
                allow_custom=False,
            )
        if name in model.values:
            return model.values[name]
        if default is not None:
            model.values[name] = deepcopy(default)
            return model.values[name]
        raise AttributeError(name)

    def _get_output(self, name: str, default: Any) -> Any:
        model = self.model
        if name == "pid":
            return self.runtime.hardware(model.pid)
        if name == "signal":
            return lambda: model.pid
        if name == "unlock":
            return lambda reset_offset=True: self.runtime.session._unlock_one_lockbox_output_no_lock(
                model.name, reset_offset=reset_offset
            )
        if name == "sweep":
            return lambda: self.runtime.session._configure_lockbox_sweep_no_lock()
        if name == "is_saturated":
            return self.runtime.session._lockbox_output_is_saturated_no_lock(model)
        if name == "current_state":
            return model.current_state
        if name in model.values:
            return model.values[name]
        if default is not None:
            model.values[name] = deepcopy(default)
            return model.values[name]
        raise AttributeError(name)

    def _get_stage(self, name: str, default: Any) -> Any:
        if name == "outputs":
            return _NamedObjects(self.model.outputs)
        if hasattr(self.model, name):
            return getattr(self.model, name)
        if default is not None:
            setattr(self.model, name, deepcopy(default))
            return getattr(self.model, name)
        raise AttributeError(name)


class TrustedLockboxRuntime:
    """Execute server-local Lockbox classes against the live web session."""

    def __init__(self, session: "WebSession", state: "LockboxState", *, autoload: bool = True):
        self.session = session
        self.state = state
        self._hardware: dict[str, _HardwareModuleProxy] = {}
        self._namespace: dict[str, Any] = {}
        self._classes: dict[str, type] = {}
        self._descriptor_modules: dict[tuple[int, str], Any] = {}
        self._loops: list[_RuntimeLoop] = []
        self.pyrpl = _PyrplProxy(self)
        self.root = None
        self.inputs = _NamedObjects({})
        self.outputs = _NamedObjects({})
        self.stages: list[Any] = []
        if autoload:
            self.activate()

    @property
    def active(self) -> bool:
        return self.root is not None

    def close(self) -> None:
        for loop in tuple(self._loops):
            loop._clear()
        self._loops.clear()

    def register_loop(self, loop: _RuntimeLoop) -> None:
        self._loops.append(loop)

    def activate(self) -> None:
        if not self.active:
            self._load()

    def descriptor_module(self, parent: Any, name: str, descriptor: _RuntimeDescriptor) -> Any:
        key = (id(parent), name)
        if key not in self._descriptor_modules:
            kwargs = {
                key: value
                for key, value in descriptor.module_kwargs.items()
                if key not in {"default", "module_cls"}
            }
            self._descriptor_modules[key] = descriptor.module_cls(parent=parent, name=name, **kwargs)
        return self._descriptor_modules[key]

    def hardware(self, name: str | None) -> _HardwareModuleProxy | None:
        if not name:
            return None
        if name not in self._hardware:
            self._hardware[name] = _HardwareModuleProxy(self, name)
        return self._hardware[name]

    def has_lockbox_method(self, name: str) -> bool:
        return self.root is not None and _class_defines_method(type(self.root), name)

    def has_input_method(self, input_name: str, name: str) -> bool:
        try:
            instance = self.inputs[input_name]
        except KeyError:
            return False
        return _class_defines_method(type(instance), name)

    def call_lockbox(self, name: str, *args, **kwargs):
        if not self.has_lockbox_method(name):
            raise AttributeError(name)
        return getattr(self.root, name)(*args, **kwargs)

    def call_input(self, input_name: str, name: str, *args, **kwargs):
        if not self.has_input_method(input_name, name):
            raise AttributeError(name)
        return getattr(self.inputs[input_name], name)(*args, **kwargs)

    def expected_signal(self, input_name: str, value):
        return self.call_input(input_name, "expected_signal", value)

    def expected_slope(self, input_name: str, value: float) -> float:
        if self.has_input_method(input_name, "expected_slope"):
            return float(self.call_input(input_name, "expected_slope", value))
        dx = 1e-9
        return float(
            (self.expected_signal(input_name, value + dx) - self.expected_signal(input_name, value - dx))
            / (2.0 * dx)
        )

    def calibrate_input(self, input_name: str) -> None:
        if self.has_input_method(input_name, "calibrate"):
            self.session._run_custom_lockbox_calibration_no_lock(input_name)
        else:
            self.session._calibrate_lockbox_inputs_no_lock([input_name], allow_custom=False)

    def calibrate_all(self, *args, **kwargs) -> None:
        for input_name in self.state.inputs:
            self.calibrate_input(input_name)

    def input_sweep(self, model: "LockboxInput"):
        self.session._configure_lockbox_sweep_no_lock()
        self.state.current_state = "sweep"
        samples = self.session._acquire_lockbox_sweep_no_lock(model)
        duration = 1.0 / max(float(self.state.outputs[self.state.default_sweep_output].sweep_frequency), 1e-12)
        times = np.linspace(-duration / 2.0, duration / 2.0, samples.size, endpoint=False)
        return samples, times

    def input_stats(self, model: "LockboxInput", duration: float | None):
        signal = self.session._lockbox_monitor_input_signal_no_lock(model)
        result = self.sample_stats(signal, 0.01 if duration is None else duration)
        offset = float(model.calibration.analog_offset)
        return (
            float(result["mean"]) - offset,
            float(result["stddev"]),
            float(result["max"]) - offset,
            float(result["min"]) - offset,
        )

    def read_sampler(self, signal: str) -> float:
        value = read_sampler_signal(self.session.client, signal, self.session._fake_scope_clock)
        self.session._fake_scope_clock += 1
        return value

    def sample_stats(self, signal: str, duration: float) -> dict[str, Any]:
        result = sampler_stats(self.session.client, signal, duration, self.session._fake_scope_clock)
        self.session._fake_scope_clock += int(result["count"])
        return result

    def stage_for(self, stage: "LockboxStage"):
        for index, candidate in enumerate(self.state.sequence):
            if candidate is stage:
                return self.stages[index]
        return None

    def refresh_stages(self) -> None:
        if not self.active:
            return
        stage_class = self._namespace.get("Stage", _RuntimeObject)
        self.stages = [
            _make_instance(stage_class, _ObjectAdapter(self, "stage", stage))
            for stage in self.state.sequence
        ]

    def _load(self) -> None:
        source = Path(self.state.spec.source)
        builtin_root = self.state.library.root / "pyrpl" / "software_modules" / "lockbox"
        try:
            is_builtin = source.resolve().is_relative_to(builtin_root.resolve())
        except (OSError, ValueError):
            is_builtin = True
        if is_builtin and source.name != "custom_lockbox_example.py":
            return

        namespace = _runtime_namespace(self.state.library, source.parent)
        namespace["__file__"] = str(source)
        namespace["__name__"] = f"pyrpl_websocket.trusted_lockbox.{source.stem}"
        try:
            code = compile(source.read_text(encoding="utf-8"), str(source), "exec")
            exec(code, namespace)
        except Exception as exc:
            raise TrustedModelError(f"Could not load trusted Lockbox model {source}: {exc}") from exc
        self._namespace = namespace
        self._classes = {
            name: value
            for name, value in namespace.items()
            if isinstance(value, type) and value.__module__ == namespace["__name__"]
        }
        root_class = self._classes.get(self.state.classname)
        if root_class is None:
            raise TrustedModelError(f"Trusted model class {self.state.classname} is missing from {source}")
        self.root = _make_instance(root_class, _ObjectAdapter(self, "lockbox", self.state))
        input_objects = {
            name: _make_instance(
                self._classes.get(model.class_name, namespace.get(model.class_name, _RuntimeObject)),
                _ObjectAdapter(self, "input", model),
            )
            for name, model in self.state.inputs.items()
        }
        output_objects = {
            name: _make_instance(
                self._classes.get(model.class_name, namespace.get(model.class_name, _RuntimeObject)),
                _ObjectAdapter(self, "output", model),
            )
            for name, model in self.state.outputs.items()
        }
        self.inputs = _NamedObjects(input_objects)
        self.outputs = _NamedObjects(output_objects)
        stage_class = namespace.get("Stage", _RuntimeObject)
        self.stages = [
            _make_instance(stage_class, _ObjectAdapter(self, "stage", stage))
            for stage in self.state.sequence
        ]


def _make_instance(cls: type, adapter: _ObjectAdapter):
    instance = object.__new__(cls)
    object.__setattr__(instance, "_runtime_adapter", adapter)
    cls.__init__(instance, parent=None, name=getattr(adapter.model, "name", None))
    return instance


def _class_defines_method(cls: type, name: str) -> bool:
    for candidate in cls.__mro__:
        if candidate in {_RuntimeObject, object}:
            break
        if not candidate.__module__.startswith("pyrpl_websocket.trusted_lockbox."):
            continue
        value = candidate.__dict__.get(name)
        if callable(value) or isinstance(value, (staticmethod, classmethod)):
            return True
    return False


def _runtime_namespace(library: "LockboxSchemaLibrary", source_dir: Path) -> dict[str, Any]:
    api = _headless_api(library)
    original_import = builtins.__import__
    local_modules: dict[str, types.ModuleType] = {}

    def runtime_import(name, globals=None, locals=None, fromlist=(), level=0):
        if name.startswith("pyrpl.software_modules.lockbox"):
            return api
        if name == "pyrpl.software_modules.loop":
            return api
        if name == "pyrpl.software_modules.module_managers":
            return api
        if name == "pyrpl":
            return api
        if level == 0 and "." not in name:
            local_source = source_dir / f"{name}.py"
            if local_source.is_file():
                if name not in local_modules:
                    module = types.ModuleType(name)
                    local_modules[name] = module
                    module_namespace = dict(vars(api))
                    module_namespace.update(
                        {
                            "__builtins__": runtime_builtins,
                            "__file__": str(local_source),
                            "__name__": name,
                            "__package__": "",
                        }
                    )
                    module.__dict__.update(module_namespace)
                    code = compile(local_source.read_text(encoding="utf-8"), str(local_source), "exec")
                    exec(code, module.__dict__)
                return local_modules[name]
        return original_import(name, globals, locals, fromlist, level)

    runtime_builtins = dict(vars(builtins))
    runtime_builtins["__import__"] = runtime_import
    namespace = dict(vars(api))
    namespace["__builtins__"] = runtime_builtins
    return namespace


def _headless_api(library: "LockboxSchemaLibrary") -> types.ModuleType:
    api = types.ModuleType("pyrpl_websocket.lockbox_plugin_api")
    api.__all__ = []
    api.np = np
    api.logging = logging
    api.time = time_module.time
    api.sleep = time_module.sleep

    property_names = {
        "FloatProperty", "IntProperty", "BoolProperty", "StringProperty",
        "SelectProperty", "FrequencyProperty", "PhaseProperty", "FilterProperty",
        "AdditionalFilterAttribute", "IqQuadratureFactorProperty", "SlowOutputProperty",
        "InputSelectProperty", "StageInputSelectProperty", "BoolIgnoreProperty",
        "ModuleProperty", "ModuleListProperty", "ModuleDictProperty",
    }
    for name in property_names:
        setattr(api, name, _RuntimeDescriptor)
    api.LockboxModuleDictProperty = _ModuleDictDescriptor

    core = {
        "LockboxModule": type("LockboxModule", (_RuntimeObject,), {}),
        "Lockbox": _HeadlessLockbox,
        "InputSignal": _HeadlessInputSignal,
        "OutputSignal": _HeadlessOutputSignal,
        "LockboxLoop": _RuntimeLoop,
        "LockboxPlotLoop": _RuntimeLoop,
        "Loop": _RuntimeLoop,
        "PlotLoop": _RuntimeLoop,
        "InsufficientResourceError": TrustedModelError,
    }
    for name, value in core.items():
        setattr(api, name, value)

    unresolved = dict(library.classes)
    for _ in range(len(unresolved) + 1):
        progressed = False
        for name, info in list(unresolved.items()):
            if hasattr(api, name):
                unresolved.pop(name)
                progressed = True
                continue
            bases = [getattr(api, base) for base in info.bases if hasattr(api, base)]
            if info.bases and not bases:
                continue
            setattr(api, name, type(name, tuple(bases or [_RuntimeObject]), {}))
            unresolved.pop(name)
            progressed = True
        if not progressed:
            break
    for name in unresolved:
        setattr(api, name, type(name, (_RuntimeObject,), {}))

    def unsupported_pyrpl(*args, **kwargs):
        raise TrustedModelError(
            "Creating another Pyrpl instance inside a headless Lockbox plugin is unsupported; "
            "configure external hardware as a server service instead."
        )

    api.Pyrpl = unsupported_pyrpl
    api.__all__ = [name for name in vars(api) if not name.startswith("_")]
    return api
