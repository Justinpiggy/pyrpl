"""Connection/session management for the web server."""

from __future__ import annotations

import json
import logging
import struct
import time
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from threading import Event, Lock, Thread, current_thread
from typing import Callable

import numpy as np

from .asg_registers import AsgSetupCancelled, disable_asg, sync_asg_setting, sync_asg_settings, trigger_asg
from .config import WebConfig
from .curve_store import configured_curve_store
from .dsp_registers import (
    dsp_addr_base,
    make_hardware_iir_filter,
    read_iir_overflow,
    sync_iir_setting,
    sync_iir_settings,
    sync_iq_phases,
    sync_iq_setting,
    sync_iq_settings,
    sync_pid_setting,
    sync_pid_settings,
    sync_pwm_setting,
    sync_pwm_settings,
    sync_trig_setting,
    sync_trig_settings,
)
from .hk_registers import read_hk_expansion, sync_hk_setting, sync_hk_settings
from .iir_plot import iir_plot, transfer_function_by_kind
from .lockbox import LockboxState, lockbox_actions
from .lockbox_runtime import TrustedLockboxRuntime
from .module_manager import ModuleManager
from .monitor_client import DummyClient, MonitorClient
from .modules import (
    ASG_SETUP_ATTRIBUTES,
    HK_SETUP_ATTRIBUTES,
    IQ_SETUP_ATTRIBUTES,
    IIR_SETUP_ATTRIBUTES,
    NETWORK_ANALYZER_SETUP_ATTRIBUTES,
    PID_SETUP_ATTRIBUTES,
    PWM_SETUP_ATTRIBUTES,
    SCOPE_SETUP_ATTRIBUTES,
    SPECTRUM_SETUP_ATTRIBUTES,
    TRIG_SETUP_ATTRIBUTES,
    AsgSettings,
    AmsSettings,
    HkSettings,
    IirSettings,
    IqSettings,
    NetworkAnalyzerSettings,
    PidSettings,
    PwmSettings,
    ScopeSettings,
    SpectrumAnalyzerSettings,
    TrigSettings,
    asg_actions,
    asg_attribute_schema,
    ams_attribute_schema,
    hk_actions,
    hk_attribute_schema,
    iir_actions,
    iir_attribute_schema,
    iq_actions,
    iq_attribute_schema,
    module_list,
    network_analyzer_actions,
    network_analyzer_attribute_schema,
    pid_actions,
    pid_attribute_schema,
    pwm_actions,
    pwm_attribute_schema,
    scope_actions,
    scope_attribute_schema,
    sampler_attribute_schema,
    set_iq_attribute,
    set_pid_attribute,
    set_pwm_attribute,
    set_spectrum_attribute,
    set_asg_attribute,
    set_ams_attribute,
    set_hk_attribute,
    set_iir_attribute,
    set_network_analyzer_attribute,
    set_scope_attribute,
    set_trig_attribute,
    spectrum_actions,
    spectrum_attribute_schema,
    spectrum_rbw,
    trig_actions,
    trig_attribute_schema,
)
from .network_analyzer import NetworkAnalyzerRun, acquire_point, configure_iq, stop_iq
from .scope import SCOPE_DATA_LENGTH, ScopeFrame, read_rolling_scope_frame, read_scope_frame, read_trigger_aligned_scope_frame
from .scope_registers import (
    DSP_INPUT_VALUES,
    scope_curve_ready,
    scope_trigger_roll_offset,
    start_scope_rolling_acquisition,
    start_scope_trace_acquisition,
    sync_scope_setting,
    sync_scope_settings,
    wait_scope_curve_ready,
)
from .settings import ServerSettings
from .telemetry import read_ams, read_sampler, read_sampler_signal, sampler_stats, write_ams_dac


LOGGER = logging.getLogger(__name__)


@dataclass
class ScopeAcquisition:
    frame: ScopeFrame | None
    state_changed: bool = False


class WebSession:
    """Owns the active monitor-server client."""

    def __init__(
        self,
        settings: ServerSettings,
        lockbox_state_callback: Callable[[dict], None] | None = None,
    ):
        self.settings = settings
        self._lock = Lock()
        self._scope_calibration_lock = Lock()
        self._scope_calibration_active = False
        self._scope_calibration_frame: ScopeFrame | None = None
        self._scope_calibration_frame_pending = False
        self.client = DummyClient() if settings.fake else MonitorClient(settings.hostname, settings.port)
        self.acquisition_revision = {"scope": 0, "spectrumanalyzer": 0}
        self.scope_settings = ScopeSettings()
        self.asg_settings = {"asg0": AsgSettings(), "asg1": AsgSettings()}
        self.hk_settings = HkSettings()
        self.ams_settings = AmsSettings()
        self.pid_settings = {f"pid{index}": PidSettings() for index in range(3)}
        self.iq_settings = {f"iq{index}": IqSettings() for index in range(3)}
        self.iir_settings = IirSettings()
        self.iir_measurement: tuple[np.ndarray, np.ndarray] | None = None
        self.trig_settings = TrigSettings()
        self.pwm_settings = {f"pwm{index}": PwmSettings() for index in range(2)}
        self.spectrum_settings = SpectrumAnalyzerSettings()
        self.network_analyzer_settings = NetworkAnalyzerSettings()
        self.network_analyzer_run = NetworkAnalyzerRun()
        self.curves = configured_curve_store(settings.curve_dir)
        self.lockbox = LockboxState()
        self.lockbox_runtime = TrustedLockboxRuntime(self, self.lockbox)
        self.client.resolve_input = self._resolve_lockbox_dsp_signal_no_lock
        config_enabled = settings.config is not None or settings.source is not None
        self.config = None if settings.state_file or not config_enabled else WebConfig(settings.config, settings.source)
        correction = settings.frequency_correction
        if correction is None:
            correction = self.config.module_setup("redpitaya").get("frequency_correction", 1.0) if self.config else 1.0
        self.client.frequency_correction = float(correction)
        if self.client.frequency_correction <= 0:
            raise ValueError("frequency_correction must be positive")
        settings.frequency_correction = self.client.frequency_correction
        self.module_manager = ModuleManager(
            [
                "scope",
                "asg0",
                "asg1",
                "trig",
                *[f"pid{index}" for index in range(3)],
                *[f"iq{index}" for index in range(3)],
                "iir",
                *[f"pwm{index}" for index in range(2)],
            ],
            self._module_ownership_changed_no_lock,
        )
        # Keep this read-only-by-convention alias for API payloads and trusted
        # compatibility proxies. Reservations must use ``module_manager``.
        self.module_owners = self.module_manager.owners
        self._fake_scope_clock = 0
        self._hardware_rolling_started = False
        self._hardware_trace_started: float | None = None
        self._restore_lockbox_class_from_config()
        self._load_config_setup_attributes()
        self._module_states: dict[str, dict[str, dict]] = self._load_saved_states()
        self._lockbox_state_callback = lockbox_state_callback
        self._lockbox_sequence_stop = Event()
        self._lockbox_sequence_thread: Thread | None = None
        self._lockbox_sweep_generation = 0
        self._lockbox_monitor_stop = Event()
        self._lockbox_monitor_wakeup = Event()
        self._lockbox_monitor_thread = Thread(
            target=self._lockbox_monitor_loop,
            name="pyrpl-lockbox-monitor",
            daemon=True,
        )
        self._lockbox_monitor_thread.start()

    def info(self) -> dict:
        return {
            "settings": self.settings.public_dict(),
            "fake": self.settings.fake,
            "reads": self.client.stats.reads,
            "writes": self.client.stats.writes,
            "scope": self.scope_settings.as_dict(),
            "asg0": self.asg_settings["asg0"].as_dict(),
            "asg1": self.asg_settings["asg1"].as_dict(),
            "hk": self.hk_settings.as_dict(),
            "sampler": self._read_sampler_no_lock(),
            "ams": self._read_ams_no_lock(),
            "pid0": self.pid_settings["pid0"].as_dict(),
            "pid1": self.pid_settings["pid1"].as_dict(),
            "pid2": self.pid_settings["pid2"].as_dict(),
            "iq0": self.iq_settings["iq0"].as_dict(),
            "iq1": self.iq_settings["iq1"].as_dict(),
            "iq2": self.iq_settings["iq2"].as_dict(),
            "iir": self.iir_settings.as_dict(),
            "trig": self.trig_settings.as_dict(),
            "pwm0": self.pwm_settings["pwm0"].as_dict(),
            "pwm1": self.pwm_settings["pwm1"].as_dict(),
            "spectrumanalyzer": self.spectrum_settings.as_dict(),
            "networkanalyzer": self.network_analyzer_settings.as_dict(),
            "lockbox": self.lockbox.schema(),
            "owners": dict(self.module_owners),
            "config_file": str(self.config.path) if self.config and self.config.path else self.settings.state_file,
            "curve_backend": self.curves.backend_name,
        }

    def modules(self) -> list[dict]:
        return module_list()

    def lockbox_classes(self) -> list[dict]:
        return self.lockbox.class_list()

    def curve_list(self, limit: int = 100) -> list[dict]:
        return self.curves.list(limit)

    def curve(self, pk: int) -> dict:
        return self.curves.get(pk)

    def create_curve(
        self,
        x: list[float],
        y: list[float],
        y_imag: list[float] | None,
        params: dict,
    ) -> dict:
        return self.curves.create(x, y, y_imag, params)

    def update_curve_params(self, pk: int, params_yaml: str) -> dict:
        return self.curves.update_params(pk, params_yaml)

    def delete_curve(self, pk: int) -> None:
        self.curves.delete(pk)

    def lockbox_schema(self) -> dict:
        with self._lock:
            return self.lockbox.schema()

    def set_lockbox_class(self, classname: str) -> dict:
        with self._lock:
            self._cancel_lockbox_sequence_no_lock()
            candidate = LockboxState(classname, library=self.lockbox.library)
            runtime = TrustedLockboxRuntime(self, candidate, autoload=False)
            previous_state = self.lockbox
            previous_runtime = self.lockbox_runtime
            # PyRPL frees output, ASG, and IQ resources when the Lockbox
            # object is destroyed, not when it is merely unlocked.
            self._release_lockbox_resources_no_lock()
            self.lockbox = candidate
            self.lockbox_runtime = runtime
            try:
                runtime.activate()
            except Exception:
                runtime.close()
                self.lockbox = previous_state
                self.lockbox_runtime = previous_runtime
                raise
            previous_runtime.close()
            self._persist_lockbox_class_no_lock()
            schema = self.lockbox.schema()
        self._wake_lockbox_monitor()
        return schema

    def set_lockbox_attribute(self, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_attribute(attribute, value)
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def set_lockbox_input_attribute(self, input_name: str, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_input_attribute(input_name, attribute, value)
            self._configure_lockbox_input_no_lock(input_name)
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def call_lockbox_input_action(self, input_name: str, action: str) -> dict:
        with self._lock:
            if input_name not in self.lockbox.inputs:
                raise KeyError(input_name)
            if action != "calibrate":
                raise KeyError(action)
            self._calibrate_lockbox_inputs_no_lock([input_name])
            self._persist_lockbox_class_no_lock()
            return self.lockbox.schema()

    def set_lockbox_output_attribute(self, output_name: str, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_output_attribute(output_name, attribute, value)
            self._reapply_lockbox_output_no_lock(output_name)
            if attribute == "extra_module" and not any(output.extra_module == "iir" for output in self.lockbox.outputs.values()):
                self._release_module_no_lock("iir", "lockbox")
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def append_lockbox_stage(self) -> dict:
        with self._lock:
            schema = self.lockbox.append_stage()
            self.lockbox_runtime.refresh_stages()
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def delete_lockbox_stage(self, index: int) -> dict:
        with self._lock:
            schema = self.lockbox.delete_stage(index)
            self.lockbox_runtime.refresh_stages()
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def set_lockbox_stage_attribute(self, index: int, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_stage_attribute(index, attribute, value)
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def set_lockbox_stage_output_attribute(self, index: int, output_name: str, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_stage_output_attribute(index, output_name, attribute, value)
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def call_lockbox_stage_action(self, index: int, action: str) -> dict:
        with self._lock:
            if not 0 <= index < len(self.lockbox.sequence):
                raise IndexError(index)
            if action != "execute":
                raise KeyError(action)
            self._start_lockbox_sequence_no_lock((self.lockbox.sequence[index],))
            schema = self.lockbox.schema()
        self._wake_lockbox_monitor()
        return schema

    def call_lockbox_action(self, action: str) -> dict:
        if action == "sweep":
            schema = self._call_lockbox_sweep()
            self._wake_lockbox_monitor()
            return schema
        with self._lock:
            schema = self._call_lockbox_action_no_lock(action)
            self._persist_lockbox_class_no_lock()
        self._wake_lockbox_monitor()
        return schema

    def lockbox_actions(self) -> list[dict]:
        return lockbox_actions(self.lockbox)

    def lockbox_input_plot(self, input_name: str, points: int = 200) -> dict:
        with self._lock:
            if self.lockbox_runtime.has_input_method(input_name, "expected_signal"):
                point_count = max(8, min(2000, int(points)))
                x = np.linspace(-1.0, 1.0, point_count)
                values = self.lockbox_runtime.expected_signal(input_name, x)
                y = np.broadcast_to(np.asarray(values, dtype=np.float64), x.shape)
                return {
                    "input": input_name,
                    "x": x.tolist(),
                    "series": [{"label": input_name, "values": y.tolist()}],
                    "x_label": f"setpoint ({self.lockbox.setpoint_unit})",
                    "y_label": "signal (V)",
                }
            return self.lockbox.input_plot(input_name, points)

    def lockbox_output_transfer_function(self, output_name: str, points: int = 200) -> dict:
        with self._lock:
            return self.lockbox.output_transfer_function(
                output_name,
                points,
                curve_loader=self.curves.get,
                iir_transfer=lambda frequencies: transfer_function_by_kind(
                    self.iir_settings,
                    frequencies,
                    "final",
                ) / max(abs(self.iir_settings.gain), 1e-30),
            )

    def module_attributes(self, module_name: str) -> list[dict]:
        attributes = self._module_attributes(module_name)
        for attribute in attributes:
            if attribute["name"] in {"input", "input1", "input2", "input1_baseband", "input2_baseband"}:
                attribute["options"] = list(dict.fromkeys([*attribute.get("options", []), *self._signal_options_no_lock()]))
        return attributes

    def _module_attributes(self, module_name: str) -> list[dict]:
        if module_name == "scope":
            return scope_attribute_schema(self.scope_settings)
        if module_name in self.asg_settings:
            return asg_attribute_schema(self.asg_settings[module_name])
        if module_name == "hk":
            return hk_attribute_schema(self.hk_settings)
        if module_name == "sampler":
            return sampler_attribute_schema(self._read_sampler_no_lock())
        if module_name == "ams":
            return ams_attribute_schema(self.ams_settings)
        if module_name in self.pid_settings:
            return pid_attribute_schema(self.pid_settings[module_name])
        if module_name in self.iq_settings:
            return iq_attribute_schema(self.iq_settings[module_name])
        if module_name == "iir":
            return iir_attribute_schema(self.iir_settings, self.curves.list(1_000_000))
        if module_name == "trig":
            return trig_attribute_schema(self.trig_settings)
        if module_name in self.pwm_settings:
            return pwm_attribute_schema(self.pwm_settings[module_name])
        if module_name == "spectrumanalyzer":
            return spectrum_attribute_schema(self.spectrum_settings)
        if module_name == "networkanalyzer":
            return network_analyzer_attribute_schema(self.network_analyzer_settings)
        raise KeyError(module_name)

    def module_state(self, module_name: str) -> dict:
        if module_name == "scope":
            return self._with_owner(module_name, self.scope_settings.as_dict())
        if module_name in self.asg_settings:
            return self._with_owner(module_name, self.asg_settings[module_name].as_dict())
        if module_name == "hk":
            read_hk_expansion(self.client, self.hk_settings)
            return self.hk_settings.as_dict()
        if module_name == "sampler":
            return self._read_sampler_no_lock()
        if module_name == "ams":
            return self._read_ams_no_lock()
        if module_name in self.pid_settings:
            word = int(self.client.reads(dsp_addr_base(module_name) + 0x100, 1)[0]) & 0xFFFF
            self.pid_settings[module_name].ival = (word - 0x10000 if word & 0x8000 else word) / 8192.0
            return self._with_owner(module_name, self.pid_settings[module_name].as_dict())
        if module_name in self.iq_settings:
            return self._with_owner(module_name, self.iq_settings[module_name].as_dict())
        if module_name == "iir":
            _, self.iir_settings.overflow = read_iir_overflow(self.client)
            return self._with_owner(module_name, self.iir_settings.as_dict())
        if module_name == "trig":
            self.trig_settings.armed = bool(int(self.client.reads(dsp_addr_base("trig") + 0x100, 1)[0]) & 1)
            return self._with_owner(module_name, self.trig_settings.as_dict())
        if module_name in self.pwm_settings:
            return self._with_owner(module_name, self.pwm_settings[module_name].as_dict())
        if module_name == "spectrumanalyzer":
            state = self.spectrum_settings.as_dict()
            state["resources"] = self._resources_owned_by("spectrumanalyzer")
            return state
        if module_name == "networkanalyzer":
            state = self.network_analyzer_settings.as_dict()
            state["resources"] = self._resources_owned_by("networkanalyzer")
            return state
        if module_name == "lockbox":
            state = self.lockbox.schema()
            state["state"]["resources"] = self._resources_owned_by("lockbox")
            return state
        raise KeyError(module_name)

    def module_actions(self, module_name: str) -> list[dict]:
        if module_name == "scope":
            return scope_actions()
        if module_name in self.asg_settings:
            return asg_actions()
        if module_name == "hk":
            return hk_actions()
        if module_name in {"sampler", "ams"}:
            return []
        if module_name in self.pid_settings:
            return pid_actions()
        if module_name in self.iq_settings:
            return iq_actions()
        if module_name == "iir":
            return iir_actions()
        if module_name == "trig":
            return trig_actions()
        if module_name in self.pwm_settings:
            return pwm_actions()
        if module_name == "spectrumanalyzer":
            return spectrum_actions()
        if module_name == "networkanalyzer":
            return network_analyzer_actions()
        if module_name == "lockbox":
            return lockbox_actions(self.lockbox)
        raise KeyError(module_name)

    def get_module_attribute(self, module_name: str, attribute: str):
        state = self.module_state(module_name)
        if attribute not in state:
            raise KeyError(attribute)
        return state[attribute]

    def set_module_attribute(self, module_name: str, attribute: str, value):
        with self._lock:
            self._ensure_manual_control_allowed(module_name)
            if module_name == "scope":
                normalized = set_scope_attribute(self.scope_settings, attribute, value, inputs=self._signal_options_no_lock())
                if attribute in {"input1", "input2", "duration", "average", "trigger_source", "trigger_delay", "threshold", "hysteresis", "rolling_mode", "run_continuous", "trace_average"}:
                    self.scope_settings.current_avg = 0
                    self.acquisition_revision["scope"] += 1
                if attribute == "run_continuous":
                    self.scope_settings.running_state = "running_continuous" if normalized else "stopped"
                sync_scope_setting(self.client, self.scope_settings, attribute)
                self._hardware_rolling_started = False
                self._hardware_trace_started = None
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            if module_name in self.asg_settings:
                settings = self.asg_settings[module_name]
                normalized = set_asg_attribute(settings, attribute, value)
                sync_asg_setting(self.client, _asg_channel(module_name), settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return getattr(settings, attribute)
            if module_name == "hk":
                normalized = set_hk_attribute(self.hk_settings, attribute, value)
                sync_hk_setting(self.client, self.hk_settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            if module_name == "sampler":
                raise ValueError("Sampler signals are read-only")
            if module_name == "ams":
                normalized = set_ams_attribute(self.ams_settings, attribute, value)
                write_ams_dac(self.client, attribute, normalized)
                return normalized
            if module_name in self.pid_settings:
                settings = self.pid_settings[module_name]
                normalized = set_pid_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
                sync_pid_setting(self.client, module_name, settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return getattr(settings, attribute)
            if module_name in self.iq_settings:
                settings = self.iq_settings[module_name]
                normalized = set_iq_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
                sync_iq_setting(self.client, module_name, settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return getattr(settings, attribute)
            if module_name == "iir":
                normalized = set_iir_attribute(self.iir_settings, attribute, value, inputs=self._signal_options_no_lock())
                if attribute == "data_curve":
                    self._select_iir_data_curve_no_lock(normalized)
                sync_iir_setting(self.client, self.iir_settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return getattr(self.iir_settings, attribute)
            if module_name == "trig":
                normalized = set_trig_attribute(self.trig_settings, attribute, value, inputs=self._signal_options_no_lock())
                sync_trig_setting(self.client, self.trig_settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            if module_name in self.pwm_settings:
                settings = self.pwm_settings[module_name]
                normalized = set_pwm_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
                sync_pwm_setting(self.client, module_name, settings, attribute)
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            if module_name == "spectrumanalyzer":
                normalized = set_spectrum_attribute(self.spectrum_settings, attribute, value, inputs=self._signal_options_no_lock())
                if attribute == "trace_average":
                    self.spectrum_settings.current_avg = 0
                    self.acquisition_revision["spectrumanalyzer"] += 1
                call_setup = attribute in {
                    "input",
                    "center",
                    "baseband",
                    "span",
                    "rbw",
                    "window",
                    "acbandwidth",
                    "input1_baseband",
                    "input2_baseband",
                    "run_continuous",
                }
                if call_setup:
                    should_continue = self.spectrum_settings.run_continuous
                    self._stop_spectrum_no_lock(reset_average=True)
                    if should_continue:
                        self._configure_spectrum_no_lock()
                        self.spectrum_settings.run_continuous = True
                        self.spectrum_settings.running_state = "running_continuous"
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            if module_name == "networkanalyzer":
                normalized = set_network_analyzer_attribute(self.network_analyzer_settings, attribute, value, inputs=self._signal_options_no_lock())
                if attribute not in {"trace_average", "curve_name"}:
                    action = "continuous" if self.network_analyzer_settings.run_continuous else "stop"
                    self._call_network_analyzer_action_no_lock(action)
                self._persist_module_setup_if_needed(module_name, attribute)
                return normalized
            raise KeyError(module_name)

    def call_module_action(self, module_name: str, action: str) -> dict:
        if module_name == "lockbox":
            with self._lock:
                self._ensure_manual_control_allowed(module_name)
            return self.call_lockbox_action(action)
        with self._lock:
            self._ensure_manual_control_allowed(module_name)
            if module_name == "spectrumanalyzer":
                return self._call_spectrum_action_no_lock(action)
            if module_name == "networkanalyzer":
                return self._call_network_analyzer_action_no_lock(action)
            if module_name in self.pid_settings:
                if action != "setup":
                    raise KeyError(action)
                settings = self.pid_settings[module_name]
                sync_pid_settings(self.client, module_name, settings)
                return settings.as_dict()
            if module_name in self.iq_settings:
                settings = self.iq_settings[module_name]
                if action == "setup":
                    sync_iq_settings(self.client, module_name, settings)
                elif action == "sync":
                    sync_iq_phases(self.client, module_name)
                else:
                    raise KeyError(action)
                return settings.as_dict()
            if module_name == "iir":
                if action == "setup":
                    sync_iir_settings(self.client, self.iir_settings)
                elif action == "measure_transfer_function":
                    self._measure_iir_transfer_function_no_lock()
                else:
                    raise KeyError(action)
                return self.iir_settings.as_dict()
            if module_name == "trig":
                if action == "setup":
                    sync_trig_settings(self.client, self.trig_settings)
                else:
                    raise KeyError(action)
                return self.trig_settings.as_dict()
            if module_name in self.pwm_settings:
                if action != "setup":
                    raise KeyError(action)
                settings = self.pwm_settings[module_name]
                sync_pwm_settings(self.client, module_name, settings)
                return settings.as_dict()
            if module_name in self.asg_settings:
                settings = self.asg_settings[module_name]
                channel = _asg_channel(module_name)
                if action == "setup":
                    sync_asg_settings(self.client, channel, settings)
                elif action == "trigger":
                    sync_asg_settings(self.client, channel, settings)
                    trigger_asg(self.client, channel)
                    settings.trigger_source = "off"
                elif action == "off":
                    disable_asg(self.client, channel)
                    settings.output_direct = "off"
                    settings.trigger_source = "off"
                    sync_asg_setting(self.client, channel, settings, "output_direct")
                else:
                    raise KeyError(action)
                return settings.as_dict()
            if module_name == "hk":
                if action:
                    raise KeyError(action)
                return self.hk_settings.as_dict()
            if module_name in {"sampler", "ams"}:
                if action:
                    raise KeyError(action)
                return self.module_state(module_name)
            if module_name != "scope":
                raise KeyError(module_name)
            if action == "setup":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
                self._hardware_trace_started = None
                self.scope_settings.current_avg = 0
                self.acquisition_revision["scope"] += 1
                self.scope_settings.running_state = (
                    "running_continuous" if self.scope_settings.run_continuous else "stopped"
                )
            elif action == "single":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
                self._hardware_trace_started = None
                self.scope_settings.run_continuous = False
                self.scope_settings.current_avg = 0
                self.acquisition_revision["scope"] += 1
                self.scope_settings.running_state = "running_single"
            elif action == "continuous":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
                self._hardware_trace_started = None
                self.scope_settings.run_continuous = True
                self.scope_settings.current_avg = 0
                self.acquisition_revision["scope"] += 1
                self.scope_settings.running_state = "running_continuous"
            elif action == "pause":
                if self.scope_settings.running_state == "running_single":
                    self.scope_settings.running_state = "paused_single"
                elif self.scope_settings.running_state == "running_continuous":
                    self.scope_settings.running_state = "paused_continuous"
                self.scope_settings.run_continuous = False
            elif action == "resume":
                if self.scope_settings.running_state == "paused_single":
                    self.scope_settings.running_state = "running_single"
                elif self.scope_settings.running_state == "paused_continuous":
                    self.scope_settings.running_state = "running_continuous"
                    self.scope_settings.run_continuous = True
            elif action == "resume_single":
                if self.scope_settings.running_state not in {"paused_single", "paused_continuous"}:
                    raise ValueError("resume_single can only be called in a paused state")
                self.scope_settings.run_continuous = False
                self.scope_settings.running_state = "running_single"
            elif action == "resume_continuous":
                if self.scope_settings.running_state not in {"paused_single", "paused_continuous"}:
                    raise ValueError("resume_continuous can only be called in a paused state")
                self.scope_settings.run_continuous = True
                self.scope_settings.running_state = "running_continuous"
            elif action == "stop":
                self._hardware_rolling_started = False
                self._hardware_trace_started = None
                self.scope_settings.run_continuous = False
                self.scope_settings.current_avg = 0
                self.acquisition_revision["scope"] += 1
                self.scope_settings.running_state = "stopped"
            elif action == "save_curve":
                self.scope_settings.last_action = action
                return {
                    **self.scope_settings.as_dict(),
                    "save_curve": {
                        "ok": True,
                        "detail": "The browser should export the currently displayed curve.",
                    },
                }
            elif action == "trigger_test":
                self.scope_settings.last_action = action
                return {
                    **self.scope_settings.as_dict(),
                    "trigger_test": self.test_scope_trigger(),
                }
            else:
                raise KeyError(action)

            self.scope_settings.last_action = action
            return self.scope_settings.as_dict()

    def module_states(self, module_name: str) -> list[dict]:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        with self._lock:
            return [
                {"name": name, "state": dict(state)}
                for name, state in sorted(self._module_states[module_name].items())
            ]

    def save_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = self._module_setup_dict(module_name)
            self._module_states[module_name][state_name] = dict(state)
            self._persist_saved_states()
            return {"name": state_name, "state": state}

    def load_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            self._ensure_manual_control_allowed(module_name)
            state = self._module_states[module_name][state_name]
            self._apply_module_setup_no_lock(module_name, state)
            if self.config is not None:
                self.config.set_module_setup(module_name, self._module_setup_dict(module_name))
            return self.module_state(module_name)

    def delete_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = self._module_states[module_name].pop(state_name)
            self._persist_saved_states()
            return {"name": state_name, "state": state}

    def workspace_state(self) -> dict | None:
        with self._lock:
            return self.config.workspace() if self.config else None

    def config_editor(self, module_name: str | None = None) -> dict:
        with self._lock:
            if self.config is None or self.config.path is None:
                raise ValueError("PyRPL YAML configuration is disabled for this session")
            modules = self.config.branch_names(list(_empty_saved_states()))
            selected = str(module_name or "pyrpl")
            if selected not in modules:
                modules.append(selected)
            return {
                "configfile": str(self.config.path),
                "config_file": str(self.config.path),
                "module": selected,
                "modules": modules,
                "text": self.config.branch_yaml(selected),
            }

    def save_config_branch(self, module_name: str, text: str) -> dict:
        with self._lock:
            if self.config is None or self.config.path is None:
                raise ValueError("PyRPL YAML configuration is disabled for this session")
            self._ensure_manual_control_allowed(module_name)
            branch = self.config.set_branch_yaml(module_name, text)
            if module_name in _empty_saved_states():
                self._apply_module_setup_no_lock(module_name, branch)
            modules = self.config.branch_names(list(_empty_saved_states()))
            if module_name not in modules:
                modules.append(module_name)
            return {
                "configfile": str(self.config.path),
                "config_file": str(self.config.path),
                "module": module_name,
                "modules": modules,
                "text": self.config.branch_yaml(module_name),
            }

    def save_workspace_state(self, workspace: dict) -> dict:
        with self._lock:
            if not isinstance(workspace, dict):
                raise ValueError("workspace must be an object")
            if self.config is None:
                return dict(workspace)
            return self.config.set_workspace(workspace)

    def read_registers(self, addr: int, length: int) -> list[int]:
        with self._lock:
            return [int(value) for value in self.client.reads(addr, length)]

    def write_registers(self, addr: int, values: list[int]) -> bool:
        with self._lock:
            return bool(self.client.writes(addr, values))

    def read_scope_frame(self, sequence: int, sample_count: int) -> ScopeFrame:
        with self._lock:
            return read_scope_frame(self.client, sequence, sample_count)

    def acquire_spectrum_frame(self, sequence: int, sample_count: int = 4096) -> dict:
        with self._lock:
            temporary = self.spectrum_settings.running_state == "stopped"
            try:
                return _spectrum_arrays_to_jsonable(self._acquire_spectrum_arrays_no_lock(sequence, sample_count))
            finally:
                if temporary:
                    self._stop_spectrum_no_lock(reset_average=False)

    def acquire_spectrum_frame_bytes(self, sequence: int, sample_count: int = 4096) -> bytes:
        with self._lock:
            temporary = self.spectrum_settings.running_state == "stopped"
            try:
                return _spectrum_arrays_to_bytes(self._acquire_spectrum_arrays_no_lock(sequence, sample_count))
            finally:
                if temporary:
                    self._stop_spectrum_no_lock(reset_average=False)

    def iir_plot(self, points: int = 1000, view: dict | None = None) -> dict:
        with self._lock:
            settings = deepcopy(self.iir_settings)
            for name, value in (view or {}).items():
                if name not in {"tf_type", "data_curve", "plot_data", "plot_data_times_filter", "plot_measurement"}:
                    raise ValueError("Only IIR display settings may be overridden")
                set_iir_attribute(settings, name, value)
            curve = None
            if settings.data_curve >= 0:
                try:
                    curve = self.curves.get(settings.data_curve)
                except (OSError, EOFError, TypeError, ValueError):
                    pass
            settings.data_curve_name = str(curve.get("name", "")) if curve else ""
            iir_filter = make_hardware_iir_filter(self.client, settings)
            return iir_plot(settings, points, curve, self.iir_measurement, iir_filter)

    def _select_iir_data_curve_no_lock(self, pk: int) -> None:
        if pk < 0:
            self.iir_settings.data_curve_name = ""
            return
        try:
            curve = self.curves.get(pk)
        except (OSError, EOFError, TypeError, ValueError):
            self.iir_settings.data_curve_name = ""
        else:
            self.iir_settings.data_curve_name = str(curve.get("name", ""))

    def _iir_data_curve_no_lock(self) -> dict | None:
        if self.iir_settings.data_curve < 0:
            return None
        try:
            curve = self.curves.get(self.iir_settings.data_curve)
        except (OSError, EOFError, TypeError, ValueError):
            return None
        self.iir_settings.data_curve_name = str(curve.get("name", ""))
        return curve

    def _measure_iir_transfer_function_no_lock(self) -> None:
        """Follow PyRPL's IIR measurement routine using the IQ-backed NA."""

        saved_iir_input = self.iir_settings.input
        saved_network_settings = deepcopy(self.network_analyzer_settings)
        saved_network_run = deepcopy(self.network_analyzer_run)
        saved_iq_settings = deepcopy(self.iq_settings)
        measurement_state = self._module_states["networkanalyzer"].get("iir_measurement")
        if measurement_state is None:
            curve = self._iir_data_curve_no_lock()
            if curve and curve.get("x"):
                frequencies = [float(value) for value in curve["x"] if float(value) > 0]
                start_freq = min(frequencies) if frequencies else 100.0
                stop_freq = max(frequencies) if frequencies else 5e6
            else:
                start_freq, stop_freq = 100.0, 5e6
            measurement_state = {
                "start_freq": start_freq,
                "stop_freq": stop_freq,
                "points": 501,
                "rbw": 500.0,
                "average_per_point": 1,
                "trace_average": 1,
                "amplitude": 1.0,
                "input": "iir",
                "output_direct": "off",
                "acbandwidth": 100.0,
                "logscale": True,
                "run_continuous": False,
            }
            self._module_states["networkanalyzer"]["iir_measurement"] = dict(measurement_state)
            self._persist_saved_states()

        selected_iq: str | None = None
        try:
            self._stop_network_analyzer_no_lock()
            for attribute, value in measurement_state.items():
                if attribute in NETWORK_ANALYZER_SETUP_ATTRIBUTES:
                    set_network_analyzer_attribute(self.network_analyzer_settings, attribute, value, inputs=self._signal_options_no_lock())
            self._call_network_analyzer_action_no_lock("single")
            selected_iq = self.network_analyzer_settings.iq_module
            if selected_iq is None:
                raise ValueError("Network Analyzer did not acquire an IQ for IIR measurement")
            self.iir_settings.input = selected_iq
            sync_iir_setting(self.client, self.iir_settings, "input")
            while self.network_analyzer_settings.running_state != "stopped":
                self._acquire_network_analyzer_point_no_lock()
            frequencies = self.network_analyzer_run.frequencies.copy()
            values = self.network_analyzer_run.data.copy()
            if isinstance(self.client, DummyClient):
                values = transfer_function_by_kind(self.iir_settings, frequencies, "final")
            self.iir_measurement = frequencies, values
        finally:
            self._stop_network_analyzer_no_lock()
            self.iir_settings.input = saved_iir_input
            sync_iir_setting(self.client, self.iir_settings, "input")
            self.network_analyzer_settings = saved_network_settings
            self.network_analyzer_settings.running_state = "stopped"
            self.network_analyzer_settings.iq_module = None
            self.network_analyzer_settings.run_continuous = False
            self.network_analyzer_run = saved_network_run
            if selected_iq is not None:
                self.iq_settings[selected_iq] = saved_iq_settings[selected_iq]
                sync_iq_settings(self.client, selected_iq, self.iq_settings[selected_iq])

    def sampler_stats(self, signal: str = "in1", duration: float = 1e-2) -> dict:
        with self._lock:
            result = sampler_stats(self.client, signal, duration, self._fake_scope_clock)
            self._fake_scope_clock += int(result["count"])
            return result

    def _read_sampler_no_lock(self) -> dict[str, float]:
        values = read_sampler(self.client, self._fake_scope_clock)
        self._fake_scope_clock += 1
        return values

    def _read_ams_no_lock(self) -> dict[str, float]:
        values = read_ams(self.client)
        for name, value in values.items():
            setattr(self.ams_settings, name, value)
        return self.ams_settings.as_dict()

    def acquire_spectrum_scope_frame(self, sequence: int, sample_count: int = 4096, *, wait: bool = False) -> ScopeFrame | None:
        with self._lock:
            sample_count = max(256, min(SCOPE_DATA_LENGTH, int(sample_count)))
            settings = self.spectrum_settings
            if settings.running_state in {"stopped", "paused_single", "paused_continuous"}:
                return None
            if self._hardware_trace_started is None:
                self._configure_spectrum_no_lock()
            if isinstance(self.client, DummyClient):
                frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
                self._fake_scope_clock += sample_count
            else:
                previous_state = self.scope_settings.running_state
                self.scope_settings.running_state = "running_continuous"
                acquisition = self._acquire_hardware_scope_frame(sequence, sample_count, wait=wait)
                self.scope_settings.running_state = previous_state
                frame = acquisition.frame
            if frame is None:
                return None
            settings.current_avg = min(settings.current_avg + 1, settings.trace_average)
            if settings.running_state == "running_single" and settings.current_avg >= settings.trace_average:
                self._stop_spectrum_no_lock(reset_average=False)
            return frame

    def acquire_scope_frame(self, sequence: int, sample_count: int, *, wait: bool = False) -> ScopeAcquisition:
        """Acquire one display frame according to current run/trigger state."""

        while True:
            calibration = self._take_scope_calibration_frame(sequence, sample_count)
            if calibration is not None:
                return calibration
            if self._scope_calibration_is_active():
                return ScopeAcquisition(None)
            if self._lock.acquire(timeout=0.05):
                break
        try:
            calibration = self._take_scope_calibration_frame(sequence, sample_count)
            if calibration is not None:
                return calibration
            sample_count = max(1, min(SCOPE_DATA_LENGTH, int(sample_count)))
            if not isinstance(self.client, DummyClient):
                return self._acquire_hardware_scope_frame(sequence, sample_count, wait=wait)
            frame = self._acquire_fake_scope_frame(sequence, sample_count)
            return frame
        finally:
            self._lock.release()

    def test_scope_trigger(self, sample_count: int = SCOPE_DATA_LENGTH) -> dict:
        frame = read_scope_frame(self.client, sequence=0, sample_count=sample_count)
        samples = frame.samples()
        source = self.scope_settings.trigger_source
        threshold = self.scope_settings.threshold
        hysteresis = self.scope_settings.hysteresis
        if source == "immediately":
            return _trigger_result(True, 0, source, threshold, hysteresis, "software trigger")
        if source == "off":
            return _trigger_result(False, None, source, threshold, hysteresis, "trigger disabled")
        if source.startswith("ch1_"):
            data = samples[:, 0]
        elif source.startswith("ch2_"):
            data = samples[:, 1]
        else:
            return _trigger_result(
                False,
                None,
                source,
                threshold,
                hysteresis,
                "trigger source is not present in the downloaded scope frame",
            )

        if source.endswith("positive_edge"):
            index = _find_positive_edge(data, threshold, hysteresis)
            condition = "positive edge"
        elif source.endswith("negative_edge"):
            index = _find_negative_edge(data, threshold, hysteresis)
            condition = "negative edge"
        else:
            index = None
            condition = "unsupported edge"
        return _trigger_result(index is not None, index, source, threshold, hysteresis, condition)

    def close(self) -> None:
        self._lockbox_sequence_stop.set()
        self._lockbox_monitor_stop.set()
        self._lockbox_monitor_wakeup.set()
        if self._lockbox_sequence_thread is not None and self._lockbox_sequence_thread is not current_thread():
            self._lockbox_sequence_thread.join(timeout=2.0)
        if self._lockbox_monitor_thread is not current_thread():
            self._lockbox_monitor_thread.join(timeout=2.0)
        self.lockbox_runtime.close()
        self.client.close()

    def _wake_lockbox_monitor(self) -> None:
        self._lockbox_monitor_wakeup.set()

    def _lockbox_monitor_loop(self) -> None:
        """Run PyRPL's lock-status monitor independently of browser sessions."""

        while not self._lockbox_monitor_stop.is_set():
            schema = None
            active = False
            interval = 1.0
            try:
                with self._lock:
                    active = self.lockbox.current_stage() is not None
                    interval = max(0.001, float(self.lockbox.lockstatus_interval))
                    if active and self._monitor_lockbox_once_no_lock():
                        schema = self.lockbox.schema()
            except Exception:
                LOGGER.exception("Lockbox status monitor failed; retrying at the configured interval")

            if schema is not None and self._lockbox_state_callback is not None:
                try:
                    self._lockbox_state_callback(schema)
                except Exception:
                    LOGGER.exception("Lockbox status callback failed")

            self._lockbox_monitor_wakeup.wait(interval if active else None)
            self._lockbox_monitor_wakeup.clear()

    def _monitor_lockbox_once_no_lock(self) -> bool:
        previous_status = self.lockbox.lock_status
        new_status = self._lockbox_is_locked_no_lock()
        should_relock = (
            self.lockbox.current_state == "lock_on"
            and not new_status
            and bool(self.lockbox.auto_lock)
        )
        self.lockbox.lock_status = new_status
        if should_relock:
            self._configure_lockbox_lock_no_lock()
        return previous_status != new_status

    def _lockbox_is_locked_no_lock(self, allow_custom: bool = True) -> bool:
        stage = self.lockbox.current_stage()
        if stage is None:
            return False
        if allow_custom and self.lockbox_runtime.has_lockbox_method("is_locked"):
            return bool(self.lockbox_runtime.call_lockbox("is_locked"))
        if any(self._lockbox_output_is_saturated_no_lock(output) for output in self.lockbox.outputs.values()):
            return False

        input_name = self.lockbox.spec.default_is_locked_input
        if input_name not in self.lockbox.inputs:
            input_name = stage.input
        input_model = self.lockbox.inputs[input_name]
        return self._lockbox_input_is_locked_no_lock(input_model, stage)

    def _lockbox_output_is_saturated_no_lock(self, output) -> bool:
        pid = self.pid_settings[output.pid]
        raw_ival = int(self.client.reads(dsp_addr_base(output.pid) + 0x100, 1)[0]) & 0xFFFF
        if raw_ival & 0x8000:
            raw_ival -= 0x10000
        pid.ival = raw_ival / float(2**13)
        sample = read_sampler_signal(self.client, output.pid, self._fake_scope_clock)
        self._fake_scope_clock += 1
        return (
            (pid.ival > output.max_voltage or pid.ival < output.min_voltage)
            and (sample > output.max_voltage or sample < output.min_voltage)
        )

    def _lockbox_input_is_locked_no_lock(self, input_model, stage, allow_custom: bool = True) -> bool:
        if stage is None:
            return False
        if allow_custom and self.lockbox_runtime.has_input_method(input_model.name, "is_locked"):
            return bool(self.lockbox_runtime.call_input(input_model.name, "is_locked"))
        if "InputFromOutput" in self.lockbox.library.resolve_mro(input_model.class_name):
            forwarded = self._forwarded_lockbox_input_no_lock(input_model)
            if forwarded is None:
                return True
            input_model = forwarded

        signal = self._lockbox_monitor_input_signal_no_lock(input_model)
        stats = sampler_stats(self.client, signal, 0.01, self._fake_scope_clock)
        self._fake_scope_clock += int(stats["count"])
        actual_mean = float(stats["mean"]) - float(input_model.calibration.analog_offset)
        threshold = float(self.lockbox.is_locked_threshold)
        lower_setpoint = float(stage.setpoint) - threshold
        upper_setpoint = float(stage.setpoint) + threshold
        minimum = self._lockbox_expected_signal_no_lock(input_model.name, lower_setpoint)
        maximum = self._lockbox_expected_signal_no_lock(input_model.name, upper_setpoint)
        start_slope = self._lockbox_expected_slope_no_lock(input_model.name, lower_setpoint)
        stop_slope = self._lockbox_expected_slope_no_lock(input_model.name, upper_setpoint)
        if maximum < minimum:
            minimum, maximum = maximum, minimum
        if start_slope * stop_slope <= 0:
            if start_slope > stop_slope:
                maximum = float("inf")
            elif start_slope < stop_slope:
                minimum = -float("inf")
        return minimum <= actual_mean <= maximum

    def _lockbox_expected_signal_no_lock(self, input_name: str, setpoint):
        if self.lockbox_runtime.has_input_method(input_name, "expected_signal"):
            return self.lockbox_runtime.expected_signal(input_name, setpoint)
        return self.lockbox.expected_signal(input_name, setpoint)

    def _lockbox_expected_slope_no_lock(self, input_name: str, setpoint: float) -> float:
        if self.lockbox_runtime.has_input_method(input_name, "expected_signal"):
            return self.lockbox_runtime.expected_slope(input_name, setpoint)
        return self.lockbox.expected_slope(input_name, setpoint)

    def _forwarded_lockbox_input_no_lock(self, input_model):
        output_name = str(input_model.input_signal).split(".")[-1]
        output = self.lockbox.outputs.get(output_name)
        if output is None:
            return None
        pid_input = self.pid_settings[output.pid].input
        for candidate in self.lockbox.inputs.values():
            if candidate is input_model:
                continue
            if self._lockbox_monitor_input_signal_no_lock(candidate) == pid_input:
                return candidate
        return None

    def _lockbox_monitor_input_signal_no_lock(self, input_model) -> str:
        if getattr(input_model, "is_iq", False):
            iq_module = getattr(input_model, "iq_module", None)
            return iq_module if iq_module in self.iq_settings else "off"
        return self._resolve_lockbox_dsp_signal_no_lock(input_model.input_signal)

    def _load_config_setup_attributes(self) -> None:
        if self.config is None:
            return
        for module_name in _empty_saved_states():
            self._restore_module_setup_no_lock(module_name)

    def _restore_lockbox_class_from_config(self) -> None:
        """Restore PyRPL's persisted Lockbox classname before UI use."""

        if self.config is None:
            return
        classname = self.config.module_setup("lockbox").get("classname")
        if not isinstance(classname, str) or classname == self.lockbox.classname:
            return
        try:
            replacement = LockboxState(classname, library=self.lockbox.library)
        except (KeyError, ValueError):
            LOGGER.warning("Ignoring unavailable persisted Lockbox class %r", classname)
            return
        previous_runtime = self.lockbox_runtime
        self.lockbox = replacement
        self.lockbox_runtime = TrustedLockboxRuntime(self, replacement)
        previous_runtime.close()

    def _persist_lockbox_class_no_lock(self) -> None:
        if self.config is not None:
            self.config.set_module_setup("lockbox", self.lockbox.setup_dict())

    def _restore_lockbox_setup_no_lock(self, state: dict) -> None:
        classname = state.get("classname", self.lockbox.classname)
        if classname != self.lockbox.classname:
            self._release_lockbox_resources_no_lock()
            self.lockbox_runtime.close()
            self.lockbox = LockboxState(classname, library=self.lockbox.library)
            self.lockbox_runtime = TrustedLockboxRuntime(self, self.lockbox)
        self.lockbox.restore_setup(state)
        self.lockbox_runtime.refresh_stages()

    def _load_saved_states(self) -> dict[str, dict[str, dict]]:
        if self.config is not None:
            loaded = _empty_saved_states()
            for module_name in loaded:
                loaded[module_name] = self.config.module_states(module_name)
            return loaded
        if not self.settings.state_file:
            return _empty_saved_states()
        path = Path(self.settings.state_file)
        if not path.exists():
            return _empty_saved_states()
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return _empty_saved_states()
        loaded = _empty_saved_states()
        if not isinstance(payload, dict):
            return loaded
        for module_name in loaded:
            module_states = payload.get(module_name, {})
            if isinstance(module_states, dict):
                loaded[module_name] = {
                    str(name): dict(state)
                    for name, state in module_states.items()
                    if isinstance(state, dict)
                }
        return loaded

    def _persist_saved_states(self) -> None:
        if self.config is not None:
            for module_name, states in self._module_states.items():
                self.config.set_module_states(module_name, states)
            return
        if not self.settings.state_file:
            return
        path = Path(self.settings.state_file)
        if path.parent != Path("."):
            path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self._module_states, indent=2, sort_keys=True), encoding="utf-8")

    def _persist_module_setup_if_needed(self, module_name: str, attribute: str) -> None:
        if self.config is None or attribute not in _setup_attributes(module_name):
            return
        self.config.set_module_setup(module_name, self._module_setup_dict(module_name))

    def _module_setup_dict(self, module_name: str) -> dict:
        if module_name == "lockbox":
            return self.lockbox.setup_dict()
        if module_name == "iir":
            state = self.iir_settings.as_dict()
            for name in ("zeros", "poles"):
                state[name] = [str(v) for v in getattr(self.iir_settings, "real_" + name)] + list(getattr(self.iir_settings, "complex_" + name))
            return {key: value for key, value in state.items() if key in IIR_SETUP_ATTRIBUTES or key in {"zeros", "poles"}}
        return {
            attribute: self._module_setting_value(module_name, attribute)
            for attribute in _setup_attributes(module_name)
        }

    def _module_setting_value(self, module_name: str, attribute: str):
        if module_name == "scope":
            return getattr(self.scope_settings, attribute)
        if module_name in self.asg_settings:
            return getattr(self.asg_settings[module_name], attribute)
        if module_name == "hk":
            return getattr(self.hk_settings, attribute)
        if module_name in self.pid_settings:
            return getattr(self.pid_settings[module_name], attribute)
        if module_name in self.iq_settings:
            return getattr(self.iq_settings[module_name], attribute)
        if module_name == "iir":
            return getattr(self.iir_settings, attribute)
        if module_name == "trig":
            return getattr(self.trig_settings, attribute)
        if module_name in self.pwm_settings:
            return getattr(self.pwm_settings[module_name], attribute)
        if module_name == "spectrumanalyzer":
            return getattr(self.spectrum_settings, attribute)
        if module_name == "networkanalyzer":
            return getattr(self.network_analyzer_settings, attribute)
        raise KeyError(module_name)

    def _set_module_attribute_no_lock(self, module_name: str, attribute: str, value) -> None:
        if module_name == "scope":
            set_scope_attribute(self.scope_settings, attribute, value, inputs=self._signal_options_no_lock())
            if attribute == "run_continuous":
                self.scope_settings.running_state = "running_continuous" if self.scope_settings.run_continuous else "stopped"
            sync_scope_setting(self.client, self.scope_settings, attribute)
            self._hardware_rolling_started = False
            self._hardware_trace_started = None
        elif module_name in self.asg_settings:
            settings = self.asg_settings[module_name]
            set_asg_attribute(settings, attribute, value)
            sync_asg_setting(self.client, _asg_channel(module_name), settings, attribute)
        elif module_name == "hk":
            set_hk_attribute(self.hk_settings, attribute, value)
            sync_hk_setting(self.client, self.hk_settings, attribute)
        elif module_name in self.pid_settings:
            settings = self.pid_settings[module_name]
            set_pid_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
            sync_pid_setting(self.client, module_name, settings, attribute)
        elif module_name in self.iq_settings:
            settings = self.iq_settings[module_name]
            set_iq_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
            sync_iq_setting(self.client, module_name, settings, attribute)
        elif module_name == "iir":
            set_iir_attribute(self.iir_settings, attribute, value, inputs=self._signal_options_no_lock())
            if attribute == "data_curve":
                self._select_iir_data_curve_no_lock(self.iir_settings.data_curve)
            sync_iir_setting(self.client, self.iir_settings, attribute)
        elif module_name == "trig":
            set_trig_attribute(self.trig_settings, attribute, value, inputs=self._signal_options_no_lock())
            sync_trig_setting(self.client, self.trig_settings, attribute)
        elif module_name in self.pwm_settings:
            settings = self.pwm_settings[module_name]
            set_pwm_attribute(settings, attribute, value, inputs=self._signal_options_no_lock())
            sync_pwm_setting(self.client, module_name, settings, attribute)
        elif module_name == "spectrumanalyzer":
            set_spectrum_attribute(self.spectrum_settings, attribute, value, inputs=self._signal_options_no_lock())
            if self.spectrum_settings.run_continuous:
                self._call_spectrum_action_no_lock("continuous")
            else:
                self._stop_spectrum_no_lock(reset_average=False)
        elif module_name == "networkanalyzer":
            set_network_analyzer_attribute(self.network_analyzer_settings, attribute, value, inputs=self._signal_options_no_lock())
            if attribute not in {"trace_average", "curve_name"}:
                self._call_network_analyzer_action_no_lock("continuous" if self.network_analyzer_settings.run_continuous else "stop")
        else:
            raise KeyError(module_name)

    def _ensure_manual_control_allowed(self, module_name: str) -> None:
        owner = self.module_owners.get(module_name)
        if owner is not None:
            raise ValueError(f"{module_name} is occupied by {owner}")

    def _reserve_module_no_lock(self, module_name: str, owner: str) -> None:
        self.module_manager.reserve(module_name, owner)

    def _release_module_no_lock(self, module_name: str, owner: str | None = None) -> None:
        self.module_manager.free(module_name, owner)

    def _pop_module_no_lock(self, module_names: tuple[str, ...] | list[str], owner: str) -> str:
        return self.module_manager.pop(owner, module_names)

    def _resources_owned_by(self, owner: str) -> list[str]:
        return self.module_manager.resources_owned_by(owner)

    def _module_ownership_changed_no_lock(
        self,
        module_name: str,
        old_owner: str | None,
        new_owner: str | None,
    ) -> None:
        """Apply the ownership hooks performed by PyRPL's Module.owner setter."""

        if module_name == "scope" and new_owner not in {None, "lockbox"}:
            # Scope._ownership_changed() stops any user acquisition before an
            # analyzer repurposes its capture settings. Lockbox calibration is
            # the deliberate web exception: it forwards its temporary frame to
            # the live Scope stream while the controls are locked.
            self.scope_settings.run_continuous = False
            self.scope_settings.current_avg = 0
            self.acquisition_revision["scope"] += 1
            self.scope_settings.running_state = "stopped"
            self._hardware_rolling_started = False
            self._hardware_trace_started = None
        if new_owner is None:
            self._restore_module_setup_no_lock(module_name)

    def _restore_module_setup_no_lock(self, module_name: str) -> None:
        """Reload persisted setup attributes after a PyRPL-style release."""

        if self.config is None:
            return
        self._apply_module_setup_no_lock(module_name, self.config.module_setup(module_name))

    def _apply_module_setup_no_lock(self, module_name: str, state: dict) -> None:
        if not state:
            return
        if module_name == "lockbox":
            self._restore_lockbox_setup_no_lock(state)
            return
        settings, setter, sync = self._setup_handlers(module_name)
        for attribute, value in state.items():
            if attribute not in _setup_attributes(module_name) and not (module_name == "iir" and attribute in {"zeros", "poles"}):
                continue
            if setter is set_asg_attribute or setter is set_hk_attribute:
                setter(settings, attribute, value)
            else:
                setter(settings, attribute, value, inputs=self._signal_options_no_lock())
        if module_name == "iir":
            # Original master lists are authoritative when both formats exist.
            for name in ("zeros", "poles"):
                if name in state:
                    setter(settings, name, state[name])
        sync()

    def _setup_handlers(self, name: str):
        if name in self.asg_settings:
            s = self.asg_settings[name]
            return s, set_asg_attribute, lambda: sync_asg_settings(self.client, _asg_channel(name), s)
        for group, setter, sync in (
            (self.pid_settings, set_pid_attribute, sync_pid_settings),
            (self.iq_settings, set_iq_attribute, sync_iq_settings),
            (self.pwm_settings, set_pwm_attribute, sync_pwm_settings),
        ):
            if name in group:
                s = group[name]
                return s, setter, lambda: sync(self.client, name, s)
        if name == "iir":
            return self.iir_settings, set_iir_attribute, lambda: sync_iir_settings(self.client, self.iir_settings)
        if name == "trig":
            return self.trig_settings, set_trig_attribute, lambda: sync_trig_settings(self.client, self.trig_settings)
        if name == "hk":
            return self.hk_settings, set_hk_attribute, lambda: sync_hk_settings(self.client, self.hk_settings)
        if name == "scope":
            def setup_scope():
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_trace_started = None
                self._hardware_rolling_started = False
                self.scope_settings.current_avg = 0
                self.acquisition_revision["scope"] += 1
                self.scope_settings.running_state = "running_continuous" if self.scope_settings.run_continuous else "stopped"
            return self.scope_settings, set_scope_attribute, setup_scope
        if name in {"spectrumanalyzer", "networkanalyzer"}:
            s = self.spectrum_settings if name == "spectrumanalyzer" else self.network_analyzer_settings
            setter = set_spectrum_attribute if name == "spectrumanalyzer" else set_network_analyzer_attribute
            action = self._call_spectrum_action_no_lock if name == "spectrumanalyzer" else self._call_network_analyzer_action_no_lock
            return s, setter, lambda: action("continuous" if s.run_continuous else "stop")
        raise KeyError(name)

    def _with_owner(self, module_name: str, state: dict) -> dict:
        state["owner"] = self.module_owners.get(module_name)
        return state

    def _call_lockbox_action_no_lock(self, action: str) -> dict:
        if action == "is_locked":
            self.lockbox.lock_status = self._lockbox_is_locked_no_lock()
        elif action == "unlock":
            self._cancel_lockbox_sequence_no_lock()
            self._lockbox_sweep_generation += 1
            self._unlock_lockbox_outputs_no_lock(reset_offset=True)
            self.lockbox.current_state = "unlock"
            self.lockbox.lock_status = False
        elif action == "sweep":
            # Trusted custom Lockbox methods call this internal path while
            # already holding the session lock. Public web actions take the
            # cooperative path in ``call_lockbox_action`` above.
            self._configure_lockbox_sweep_no_lock()
            self.lockbox.current_state = "sweep"
            self.lockbox.lock_status = False
        elif action == "lock":
            self._configure_lockbox_lock_no_lock()
        elif action == "calibrate_all":
            self._calibrate_lockbox_inputs_no_lock()
            self.lockbox.lock_status = False
        elif action == "get_analog_offsets":
            self._measure_lockbox_offsets_no_lock()
        elif self.lockbox_runtime.has_lockbox_method(action):
            self.lockbox_runtime.call_lockbox(action)
        else:
            raise KeyError(action)
        return self.lockbox.schema()

    def _call_lockbox_sweep(self) -> dict:
        """Configure a legacy Lockbox sweep without starving Scope reads.

        The ASG RAM upload is the only long monitor-server request sequence.
        PyRPL writes the same waveform table before enabling the generator; we
        send that table in contiguous protocol-compatible chunks so a live
        Scope acquisition can use the shared client between chunks.
        """

        with self._lock:
            self._cancel_lockbox_sequence_no_lock()
            self._lockbox_sweep_generation += 1
            generation = self._lockbox_sweep_generation
            self._unlock_lockbox_outputs_no_lock(reset_offset=True)
            output_name, asg = self._prepare_lockbox_sweep_no_lock()

        try:
            sync_asg_settings(
                self.client,
                0,
                asg,
                waveform_chunk_words=1024,
                after_waveform_chunk=lambda: self._lockbox_sweep_is_current(generation),
            )
        except AsgSetupCancelled:
            with self._lock:
                return self.lockbox.schema()

        with self._lock:
            if generation != self._lockbox_sweep_generation:
                return self.lockbox.schema()
            self._finish_lockbox_sweep_no_lock(output_name)
            self.lockbox.current_state = "sweep"
            self.lockbox.lock_status = False
            return self.lockbox.schema()

    def _lockbox_sweep_is_current(self, generation: int) -> bool:
        with self._lock:
            return generation == self._lockbox_sweep_generation

    def _reapply_lockbox_output_no_lock(self, output_name: str) -> None:
        output = self.lockbox.outputs[output_name]
        if output.current_state == "sweep" and output_name == self.lockbox.default_sweep_output:
            self._configure_lockbox_sweep_no_lock()
        elif output.current_state == "lock":
            for stage in reversed(self.lockbox.sequence):
                stage_output = stage.outputs.get(output_name)
                if stage_output is not None and stage_output.lock_on is True:
                    self._lock_one_lockbox_output_no_lock(
                        output_name,
                        stage.input,
                        stage.setpoint,
                        stage_output.offset if stage_output.reset_offset else None,
                        stage.gain_factor,
                    )
                    return
        else:
            self._unlock_one_lockbox_output_no_lock(output_name, reset_offset=False)

    def _configure_lockbox_sweep_no_lock(self) -> None:
        output_name, asg = self._prepare_lockbox_sweep_no_lock()
        sync_asg_settings(self.client, 0, asg)
        self._finish_lockbox_sweep_no_lock(output_name)

    def _prepare_lockbox_sweep_no_lock(self) -> tuple[str, AsgSettings]:
        output = self.lockbox.outputs[self.lockbox.default_sweep_output]
        self._reserve_lockbox_output_no_lock(output.name)
        self._reserve_module_no_lock("asg0", "lockbox")

        self._configure_pid_output_no_lock(output.name, reset_offset=True)
        asg = self.asg_settings["asg0"]
        asg.waveform = output.sweep_waveform
        asg.amplitude = abs(output.sweep_amplitude)
        asg.offset = output.sweep_offset
        asg.frequency = output.sweep_frequency
        asg.trigger_source = "immediately"
        asg.output_direct = "off"
        asg.start_phase = 0.0
        asg.cycles_per_burst = 0
        return output.name, deepcopy(asg)

    def _finish_lockbox_sweep_no_lock(self, output_name: str) -> None:
        output = self.lockbox.outputs[output_name]
        pid = self.pid_settings[output.pid]
        pid.input = "asg0"
        pid.setpoint = 0.0
        pid.p = 1.0 if output.sweep_amplitude >= 0 else -1.0
        pid.i = 0.0
        sync_pid_settings(self.client, output.pid, pid)
        output.current_state = "sweep"

    def _configure_lockbox_lock_no_lock(self) -> None:
        self._start_lockbox_sequence_no_lock(tuple(self.lockbox.sequence))

    def _cancel_lockbox_sequence_no_lock(self) -> None:
        self._lockbox_sequence_stop.set()

    def _start_lockbox_sequence_no_lock(self, stages) -> None:
        self._cancel_lockbox_sequence_no_lock()
        stop = Event()
        stage_sequence = tuple(stages)
        self._lockbox_sequence_stop = stop
        thread = Thread(
            target=self._run_lockbox_sequence,
            args=(stop, stage_sequence),
            name="pyrpl-lockbox-sequence",
            daemon=True,
        )
        self._lockbox_sequence_thread = thread
        thread.start()

    def _run_lockbox_sequence(self, stop: Event, stages: tuple) -> None:
        try:
            for stage in stages:
                if stop.is_set() or self._lockbox_monitor_stop.is_set():
                    return
                with self._lock:
                    if stop.is_set() or self._lockbox_monitor_stop.is_set():
                        return
                    self._execute_lockbox_stage_no_lock(stage)
                    schema = self.lockbox.schema()
                self._publish_lockbox_sequence_state(schema)
                if stop.wait(max(0.0, float(stage.duration))):
                    return

            with self._lock:
                if stop.is_set() or self._lockbox_monitor_stop.is_set():
                    return
                if stages and stages[-1] is self.lockbox.sequence[-1]:
                    self.lockbox.current_state = "lock_on"
                self.lockbox.lock_status = self._lockbox_is_locked_no_lock()
                schema = self.lockbox.schema()
            self._publish_lockbox_sequence_state(schema)
        finally:
            with self._lock:
                if self._lockbox_sequence_stop is stop:
                    self._lockbox_sequence_thread = None

    def _publish_lockbox_sequence_state(self, schema: dict) -> None:
        self._wake_lockbox_monitor()
        if self._lockbox_state_callback is not None:
            try:
                self._lockbox_state_callback(schema)
            except Exception:
                LOGGER.exception("Lockbox sequence status callback failed")

    def _apply_lockbox_stage_no_lock(self, stage) -> None:
        for output_name in self.lockbox.outputs:
            self._reserve_lockbox_output_no_lock(output_name)

    def _execute_lockbox_stage_no_lock(self, stage) -> None:
        self._apply_lockbox_stage_no_lock(stage)
        for output_name, stage_output in stage.outputs.items():
            if stage_output.lock_on == "ignore":
                continue
            if not bool(stage_output.lock_on):
                self._unlock_one_lockbox_output_no_lock(output_name, reset_offset=False)
            if stage_output.reset_offset:
                self._set_lockbox_output_offset_no_lock(output_name, stage_output.offset)

        for output_name, stage_output in stage.outputs.items():
            if stage_output.lock_on is True:
                self._lock_one_lockbox_output_no_lock(
                    output_name,
                    stage.input,
                    stage.setpoint,
                    stage_output.offset if stage_output.reset_offset else None,
                    stage.gain_factor,
                )

        self._call_lockbox_stage_function_no_lock(stage.function_call, stage)
        self.lockbox.current_state = stage.name

    def _call_lockbox_stage_function_no_lock(self, function_call: str, stage=None) -> None:
        if not function_call:
            return
        if self.lockbox_runtime.has_lockbox_method(function_call):
            try:
                self.lockbox_runtime.call_lockbox(function_call)
            except TypeError:
                self.lockbox_runtime.call_lockbox(
                    function_call,
                    self.lockbox_runtime.stage_for(stage) if stage is not None else None,
                )
        elif function_call == "increment":
            current = float(self.lockbox.values.get("first_stage_counter", 0.0))
            self.lockbox.values["first_stage_counter"] = current + 1.0

    def _unlock_lockbox_outputs_no_lock(self, reset_offset: bool = False) -> None:
        for output_name in self.lockbox.outputs:
            self._unlock_one_lockbox_output_no_lock(output_name, reset_offset=reset_offset)

    def _unlock_one_lockbox_output_no_lock(self, output_name: str, reset_offset: bool = False) -> None:
        output = self.lockbox.outputs[output_name]
        self._configure_pid_output_no_lock(output_name, reset_offset=reset_offset)
        pid = self.pid_settings[output.pid]
        pid.p = 0.0
        pid.i = 0.0
        sync_pid_settings(self.client, output.pid, pid)
        output.current_state = "unlock"

    def _lock_one_lockbox_output_no_lock(
        self,
        output_name: str,
        input_name: str,
        setpoint: float,
        offset: float | None,
        gain_factor: float,
    ) -> None:
        output = self.lockbox.outputs[output_name]
        input_model = self.lockbox.inputs[input_name]
        self._configure_pid_output_no_lock(output_name, reset_offset=False)
        external_gain = output.dc_gain * self._lockbox_expected_slope_no_lock(input_name, setpoint)
        external_gain *= (self.lockbox_runtime.root or self.lockbox)._unit_in_setpoint_unit(output.unit.split("/")[0])
        signal = self._lockbox_input_signal_no_lock(input_model)
        if output.extra_module == "iir":
            self._reserve_module_no_lock("iir", "lockbox")
            self.iir_settings.input = signal
            self.iir_settings.output_direct = "off"
            sync_iir_setting(self.client, self.iir_settings, "input")
            sync_iir_setting(self.client, self.iir_settings, "output_direct")
            signal = "iir"
            external_gain *= self.iir_settings.gain
        if abs(external_gain) < 1e-15:
            p_gain = 0.0
            i_gain = 0.0
        else:
            p_gain = output.p / external_gain * gain_factor
            i_gain = output.i / external_gain * gain_factor
        pid = self.pid_settings[output.pid]
        pid.p = 0.0
        pid.i = 0.0
        pid.input = signal
        pid.setpoint = self._lockbox_expected_signal_no_lock(input_name, setpoint) + input_model.calibration.analog_offset
        if offset is not None:
            self._set_lockbox_output_offset_no_lock(output_name, offset)
        sync_pid_settings(self.client, output.pid, pid)
        pid.p = p_gain
        pid.i = i_gain
        sync_pid_setting(self.client, output.pid, pid, "p")
        sync_pid_setting(self.client, output.pid, pid, "i")
        output.current_state = "lock"

    def _configure_pid_output_no_lock(self, output_name: str, reset_offset: bool) -> None:
        output = self.lockbox.outputs[output_name]
        pid = self.pid_settings[output.pid]
        pid.max_voltage = output.max_voltage
        pid.min_voltage = output.min_voltage
        pid.output_direct = output.output_channel if output.output_channel in {"out1", "out2"} else "off"
        if reset_offset:
            self._set_lockbox_output_offset_no_lock(output_name, 0.0)
        set_pid_attribute(pid, "inputfilter", output.additional_filter)
        sync_pid_setting(self.client, output.pid, pid, "inputfilter")
        output.additional_filter = list(pid.inputfilter)
        sync_pid_setting(self.client, output.pid, pid, "max_voltage")
        sync_pid_setting(self.client, output.pid, pid, "min_voltage")
        sync_pid_setting(self.client, output.pid, pid, "output_direct")
        if output.output_channel in self.pwm_settings:
            self.pwm_settings[output.output_channel].input = output.pid
            sync_pwm_settings(self.client, output.output_channel, self.pwm_settings[output.output_channel])
        else:
            for module_name, pwm in self.pwm_settings.items():
                if pwm.input == output.pid:
                    pwm.input = "off"
                    sync_pwm_settings(self.client, module_name, pwm)

    def _set_lockbox_output_offset_no_lock(self, output_name: str, offset: float) -> None:
        output = self.lockbox.outputs[output_name]
        pid = self.pid_settings[output.pid]
        pid.ival = float(offset)
        sync_pid_setting(self.client, output.pid, pid, "ival")

    def _reserve_lockbox_output_no_lock(self, output_name: str) -> None:
        output = self.lockbox.outputs[output_name]
        self._reserve_module_no_lock(output.pid, "lockbox")
        if output.output_channel in self.pwm_settings:
            self._reserve_module_no_lock(output.output_channel, "lockbox")

    def _release_lockbox_resources_no_lock(self) -> None:
        for module_name in list(self.module_owners):
            self._release_module_no_lock(module_name, "lockbox")

    def _release_lockbox_iq_inputs_no_lock(self) -> None:
        for module_name in self.iq_settings:
            self._release_module_no_lock(module_name, "lockbox")

    def _configure_lockbox_input_no_lock(self, input_name: str) -> None:
        input_model = self.lockbox.inputs[input_name]
        if getattr(input_model, "is_iq", False):
            self._configure_lockbox_iq_input_no_lock(input_model)

    def _configure_lockbox_iq_input_no_lock(self, input_model) -> str:
        iq_module = getattr(input_model, "iq_module", None)
        if iq_module not in self.iq_settings:
            raise ValueError(f"No IQ module is assigned to lockbox input {input_model.name}")
        self._reserve_module_no_lock(iq_module, "lockbox")
        iq = self.iq_settings[iq_module]
        iq.input = self._resolve_lockbox_dsp_signal_no_lock(input_model.input_signal)
        iq.frequency = float(getattr(input_model, "mod_freq", 0.0))
        iq.acbandwidth = abs(iq.frequency) / 128.0
        iq.amplitude = float(getattr(input_model, "mod_amp", 0.0))
        iq.phase = float(getattr(input_model, "mod_phase", 0.0))
        iq.output_direct = str(getattr(input_model, "mod_output", "out1") or "off")
        iq.output_signal = "quadrature"
        iq.gain = 0.0
        set_iq_attribute(iq, "bandwidth", getattr(input_model, "bandwidth", [0.0, 0.0]))
        iq.quadrature_factor = float(getattr(input_model, "quadrature_factor", 1.0))
        iq.on = True
        sync_iq_settings(self.client, iq_module, iq)
        sync_iq_setting(self.client, iq_module, iq, "on")
        return iq_module

    def _signal_options_no_lock(self) -> list[str]:
        return [*DSP_INPUT_VALUES, *[f"lockbox.inputs.{name}" for name in self.lockbox.inputs],
                *[f"lockbox.outputs.{name}" for name in self.lockbox.outputs]]

    def _resolve_lockbox_dsp_signal_no_lock(self, signal: str) -> str:
        for _ in range(5):
            if signal in DSP_INPUT_VALUES:
                return signal
            name = signal.split(".")[-1]
            if signal.startswith("lockbox.outputs.") and name in self.lockbox.outputs:
                return self.lockbox.outputs[name].pid
            if signal.startswith("lockbox.inputs.") and name in self.lockbox.inputs:
                model = self.lockbox.inputs[name]
                if model.is_iq:
                    return self._configure_lockbox_iq_input_no_lock(model)
                signal = model.input_signal
            else:
                break
        return "off"

    def _lockbox_input_signal_no_lock(self, input_model) -> str:
        if getattr(input_model, "is_iq", False):
            return self._configure_lockbox_iq_input_no_lock(input_model)
        return self._resolve_lockbox_dsp_signal_no_lock(input_model.input_signal)

    def _calibrate_lockbox_inputs_no_lock(
        self,
        input_names: list[str] | None = None,
        *,
        allow_custom: bool = True,
    ) -> None:
        names = input_names if input_names is not None else list(self.lockbox.inputs)
        generic_names = []
        for input_name in names:
            if allow_custom and self.lockbox_runtime.has_input_method(input_name, "calibrate"):
                self._run_custom_lockbox_calibration_no_lock(input_name)
            else:
                generic_names.append(input_name)
        if not generic_names:
            return
        self._reserve_module_no_lock("scope", "lockbox")
        saved_scope = deepcopy(self.scope_settings)
        self._begin_scope_calibration()
        try:
            for input_name in generic_names:
                input_model = self.lockbox.inputs[input_name]
                self._configure_lockbox_sweep_no_lock()
                self.lockbox.current_state = "sweep"
                samples = self._acquire_lockbox_sweep_no_lock(input_model)
                self._update_lockbox_calibration_from_samples(input_model, samples)
        finally:
            self.scope_settings = saved_scope
            if not isinstance(self.client, DummyClient):
                sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self._hardware_trace_started = None
            self._end_scope_calibration()
            self._release_module_no_lock("scope", "lockbox")

    def _run_custom_lockbox_calibration_no_lock(self, input_name: str) -> None:
        self._reserve_module_no_lock("scope", "lockbox")
        saved_scope = deepcopy(self.scope_settings)
        self._begin_scope_calibration()
        try:
            self.lockbox_runtime.call_input(input_name, "calibrate")
        finally:
            self.scope_settings = saved_scope
            if not isinstance(self.client, DummyClient):
                sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self._hardware_trace_started = None
            self._end_scope_calibration()
            self._release_module_no_lock("scope", "lockbox")

    def _acquire_lockbox_sweep_no_lock(self, input_model) -> np.ndarray:
        output = self.lockbox.outputs[self.lockbox.default_sweep_output]
        input_signal = self._lockbox_input_signal_no_lock(input_model)
        self.scope_settings.input1 = input_signal
        self.scope_settings.input2 = self.pid_settings[output.pid].output_direct
        self.scope_settings.trigger_source = "asg0"
        self.scope_settings.trigger_delay = 0.0
        set_scope_attribute(
            self.scope_settings,
            "duration",
            1.0 / max(float(output.sweep_frequency), 1e-12),
        )
        self.scope_settings.ch1_active = True
        self.scope_settings.ch2_active = True
        self.scope_settings.average = True
        self.scope_settings.trace_average = 1
        self.scope_settings.run_continuous = False
        self.scope_settings.rolling_mode = False
        self.scope_settings.current_avg = 0
        self.acquisition_revision["scope"] += 1
        self.scope_settings.running_state = "running_single"

        if isinstance(self.client, DummyClient):
            frame = self._fake_scope_frame(0, self._fake_scope_clock, SCOPE_DATA_LENGTH)
            self._fake_scope_clock += SCOPE_DATA_LENGTH
        else:
            sync_scope_settings(self.client, self.scope_settings)
            start_scope_trace_acquisition(self.client, self.scope_settings)
            if not wait_scope_curve_ready(self.client, self.scope_settings):
                raise TimeoutError("Lockbox calibration sweep did not trigger")
            frame = read_trigger_aligned_scope_frame(self.client, 0, scope_trigger_roll_offset(self.client), SCOPE_DATA_LENGTH)
        self._publish_scope_calibration_frame(frame)
        return (
            frame.samples()[:, 0].astype(np.float64, copy=False)
            - float(input_model.calibration.analog_offset)
        )

    def _begin_scope_calibration(self) -> None:
        with self._scope_calibration_lock:
            self._scope_calibration_active = True
            self._scope_calibration_frame = None
            self._scope_calibration_frame_pending = False

    def _publish_scope_calibration_frame(self, frame: ScopeFrame) -> None:
        with self._scope_calibration_lock:
            self._scope_calibration_frame = frame
            self._scope_calibration_frame_pending = True

    def _end_scope_calibration(self) -> None:
        with self._scope_calibration_lock:
            self._scope_calibration_active = False

    def _scope_calibration_is_active(self) -> bool:
        with self._scope_calibration_lock:
            return self._scope_calibration_active

    def _take_scope_calibration_frame(self, sequence: int, sample_count: int) -> ScopeAcquisition | None:
        with self._scope_calibration_lock:
            if not self._scope_calibration_frame_pending or self._scope_calibration_frame is None:
                return None
            source = self._scope_calibration_frame
            self._scope_calibration_frame_pending = False
        count = max(1, min(source.sample_count, int(sample_count)))
        payload_bytes = count * source.channel_count * np.dtype(np.float32).itemsize
        return ScopeAcquisition(
            ScopeFrame(
                sequence=sequence,
                timestamp_ns=source.timestamp_ns,
                sample_count=count,
                channel_count=source.channel_count,
                payload=source.payload[:payload_bytes],
            )
        )

    def _measure_lockbox_offsets_no_lock(self) -> None:
        if isinstance(self.client, DummyClient):
            self._reserve_module_no_lock("scope", "lockbox")
            try:
                for input_model in self.lockbox.inputs.values():
                    samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                    if samples.size:
                        input_model.calibration.analog_offset = float(np.mean(samples))
            finally:
                self._release_module_no_lock("scope", "lockbox")
            return
        self._reserve_module_no_lock("scope", "lockbox")
        saved_scope = deepcopy(self.scope_settings)
        try:
            for input_model in self.lockbox.inputs.values():
                samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                if samples.size:
                    input_model.calibration.analog_offset = float(np.mean(samples))
        finally:
            self.scope_settings = saved_scope
            sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self._hardware_trace_started = None
            self._release_module_no_lock("scope", "lockbox")

    def _update_lockbox_calibration_from_samples(self, input_model, samples: np.ndarray) -> None:
        if samples.size == 0:
            return
        calibration = input_model.calibration
        calibration.min = float(np.min(samples))
        calibration.max = float(np.max(samples))
        calibration.mean = float(np.mean(samples))
        calibration.rms = float(np.std(samples))
        calibration.offset = (calibration.max + calibration.min) / 2.0
        amplitude = (calibration.max - calibration.min) / 2.0
        calibration.amplitude = amplitude if amplitude > 1e-12 else 1.0

    def _sample_lockbox_input_no_lock(self, input_signal: str, sample_count: int = 2048) -> np.ndarray:
        sample_count = max(8, min(SCOPE_DATA_LENGTH, int(sample_count)))
        if isinstance(self.client, DummyClient):
            data = self._fake_signal_data(input_signal, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += sample_count
            return data.astype(np.float64, copy=False)
        self.scope_settings.input1 = input_signal
        self.scope_settings.input2 = "off"
        self.scope_settings.trigger_source = "immediately"
        self.scope_settings.duration = 8e-9 * (2**14) * 2**7
        self.scope_settings.average = True
        self.scope_settings.running_state = "running_single"
        sync_scope_settings(self.client, self.scope_settings)
        acquisition = self._acquire_hardware_scope_frame(0, sample_count, wait=True)
        if acquisition.frame is None:
            return np.asarray([], dtype=np.float64)
        return acquisition.frame.samples()[:, 0].astype(np.float64, copy=False)

    def _call_spectrum_action_no_lock(self, action: str) -> dict:
        settings = self.spectrum_settings
        if action == "single":
            self._stop_spectrum_no_lock(reset_average=True)
            self._configure_spectrum_no_lock()
            settings.run_continuous = False
            settings.running_state = "running_single"
        elif action == "continuous":
            self._stop_spectrum_no_lock(reset_average=True)
            self._configure_spectrum_no_lock()
            settings.run_continuous = True
            settings.running_state = "running_continuous"
        elif action == "pause":
            if settings.running_state == "running_single":
                settings.running_state = "paused_single"
            elif settings.running_state == "running_continuous":
                settings.running_state = "paused_continuous"
            settings.run_continuous = False
            self._release_module_no_lock("scope", "spectrumanalyzer")
        elif action == "resume_single":
            if settings.running_state not in {"paused_single", "paused_continuous"}:
                raise ValueError("resume_single can only be called in a paused state")
            self._configure_spectrum_no_lock()
            settings.run_continuous = False
            settings.running_state = "running_single"
        elif action == "resume_continuous":
            if settings.running_state not in {"paused_single", "paused_continuous"}:
                raise ValueError("resume_continuous can only be called in a paused state")
            self._configure_spectrum_no_lock()
            settings.run_continuous = True
            settings.running_state = "running_continuous"
        elif action == "stop":
            self._stop_spectrum_no_lock(reset_average=False)
        else:
            raise KeyError(action)
        settings.last_action = action
        return self.module_state("spectrumanalyzer")

    def _stop_spectrum_no_lock(self, reset_average: bool) -> None:
        settings = self.spectrum_settings
        settings.running_state = "stopped"
        settings.run_continuous = False
        if reset_average:
            settings.current_avg = 0
            self.acquisition_revision["spectrumanalyzer"] += 1
        self._release_module_no_lock(settings.iq_module, "spectrumanalyzer")
        self._release_module_no_lock("scope", "spectrumanalyzer")

    def _call_network_analyzer_action_no_lock(self, action: str) -> dict:
        settings = self.network_analyzer_settings
        if action in {"single", "continuous"}:
            self._stop_network_analyzer_no_lock()
            iq_module = self._reserve_available_iq_no_lock("networkanalyzer")
            settings.iq_module = iq_module
            settings.run_continuous = action == "continuous"
            settings.running_state = "running_continuous" if settings.run_continuous else "running_single"
            self.network_analyzer_run.prepare(settings, self.client.frequency_correction)
            configure_iq(
                self.client,
                iq_module,
                self.iq_settings[iq_module],
                settings,
                self.network_analyzer_run,
            )
        elif action == "pause":
            if settings.running_state.startswith("running_"):
                settings.running_state = settings.running_state.replace("running_", "paused_")
                settings.run_continuous = False
                stop_iq(self.client, settings.iq_module, self.iq_settings[settings.iq_module])
        elif action in {"resume", "resume_single", "resume_continuous"}:
            if settings.running_state.startswith("paused_"):
                mode = settings.running_state[len("paused_"):] if action == "resume" else action[len("resume_"):]
                settings.running_state = "running_" + mode
                settings.run_continuous = mode == "continuous"
                iq = self.iq_settings[settings.iq_module]
                iq.amplitude = float(self.network_analyzer_run.amplitudes[self.network_analyzer_run.current_point])
                sync_iq_setting(self.client, settings.iq_module, iq, "amplitude")
        elif action == "stop":
            self._stop_network_analyzer_no_lock()
        else:
            raise KeyError(action)
        settings.last_action = action
        return self.module_state("networkanalyzer")

    def acquire_network_analyzer_point(self) -> dict | None:
        with self._lock:
            return self._acquire_network_analyzer_point_no_lock()

    def _acquire_network_analyzer_point_no_lock(self) -> dict | None:
        settings = self.network_analyzer_settings
        run = self.network_analyzer_run
        if not settings.running_state.startswith("running_") or settings.iq_module is None:
            return None
        index = run.current_point
        frequency, value, amplitude = acquire_point(
            self.client,
            settings.iq_module,
            self.iq_settings[settings.iq_module],
            settings,
            run,
        )
        if settings.start_freq == settings.stop_freq:
            now = time.monotonic()
            if run.time_first_point is None:
                run.time_first_point = now
            x_value = now - run.time_first_point
        else:
            x_value = frequency
        run.data[index] = (run.data[index] * run.current_avg + value) / (run.current_avg + 1)
        run.amplitudes[index] = amplitude
        run.current_point += 1
        scan_complete = run.current_point >= settings.points
        if scan_complete:
            run.current_avg = min(run.current_avg + 1, settings.trace_average)
            run.current_point = 0
            if settings.running_state == "running_single" and run.current_avg >= settings.trace_average:
                self._stop_network_analyzer_no_lock()
        settings.current_point = run.current_point
        settings.current_avg = run.current_avg
        return {
            "run_id": run.run_id,
            "index": index,
            "x": x_value,
            "real": float(run.data[index].real),
            "imag": float(run.data[index].imag),
            "points": settings.points,
            "current_avg": run.current_avg,
            "scan_complete": scan_complete,
            "logscale": settings.logscale and settings.start_freq != settings.stop_freq,
            "zero_span": settings.start_freq == settings.stop_freq,
            "running_state": settings.running_state,
            "time_per_point": settings.measured_time_per_point,
        }

    def _reserve_available_iq_no_lock(self, owner: str) -> str:
        return self._pop_module_no_lock(("iq0", "iq1", "iq2"), owner)

    def _stop_network_analyzer_no_lock(self) -> None:
        settings = self.network_analyzer_settings
        if settings.iq_module is not None:
            stop_iq(self.client, settings.iq_module, self.iq_settings[settings.iq_module])
            self._release_module_no_lock(settings.iq_module, "networkanalyzer")
        settings.iq_module = None
        settings.running_state = "stopped"
        settings.run_continuous = False

    def _acquire_spectrum_arrays_no_lock(self, sequence: int, sample_count: int) -> dict:
        sample_count = max(256, min(SCOPE_DATA_LENGTH, int(sample_count)))
        self._configure_spectrum_no_lock()
        if isinstance(self.client, DummyClient):
            frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += sample_count
        else:
            previous_state = self.scope_settings.running_state
            self.scope_settings.running_state = "running_continuous"
            acquisition = self._acquire_hardware_scope_frame(sequence, sample_count, wait=True)
            self.scope_settings.running_state = previous_state
            if acquisition.frame is None:
                return self._empty_spectrum_arrays(sequence)
            frame = acquisition.frame
        return self._spectrum_arrays_from_scope_no_lock(sequence, frame)

    def _configure_spectrum_no_lock(self) -> None:
        settings = self.spectrum_settings
        self._reserve_module_no_lock("scope", "spectrumanalyzer")
        self.scope_settings.running_state = "stopped"
        self._hardware_rolling_started = False
        self._hardware_trace_started = None
        if settings.baseband:
            self._release_module_no_lock(settings.iq_module, "spectrumanalyzer")
            self.scope_settings.input1 = settings.input1_baseband
            self.scope_settings.input2 = settings.input2_baseband
        else:
            self._reserve_module_no_lock(settings.iq_module, "spectrumanalyzer")
            iq_settings = self.iq_settings[settings.iq_module]
            iq_settings.input = settings.input
            iq_settings.output_direct = "off"
            iq_settings.output_signal = "quadrature"
            iq_settings.frequency = settings.center
            iq_settings.acbandwidth = settings.acbandwidth
            iq_settings.bandwidth = list(settings.iq_bandwidth)
            iq_settings.phase = 0.0
            iq_settings.gain = 0.0
            iq_settings.amplitude = 0.0
            iq_settings.quadrature_factor = 1.0
            iq_settings.on = True
            sync_iq_settings(self.client, settings.iq_module, iq_settings)
            settings.iq_bandwidth = list(iq_settings.bandwidth)
            sync_iq_setting(self.client, settings.iq_module, iq_settings, "on")
            self.scope_settings.input1 = settings.iq_module
            self.scope_settings.input2 = "iq2_2"
        self.scope_settings.trigger_source = "immediately"
        self.scope_settings.average = True
        self.scope_settings.rolling_mode = False
        self.scope_settings.duration = max(8e-9 * (2**14), SCOPE_DATA_LENGTH / settings.span)
        sync_scope_settings(self.client, self.scope_settings)
        self._hardware_rolling_started = False
        self._hardware_trace_started = None

    def _spectrum_arrays_from_scope_no_lock(self, sequence: int, frame: ScopeFrame) -> dict:
        settings = self.spectrum_settings
        samples = frame.samples()
        if samples.size == 0:
            return self._empty_spectrum_arrays(sequence)
        sample_rate = max(settings.span, 1.0)
        window = _spectrum_window(settings.window, samples.shape[0])
        rbw = spectrum_rbw(settings.window, sample_rate, samples.shape[0])
        if settings.baseband:
            ch1_fft = np.fft.rfft(samples[:, 0] * window)
            ch2_fft = np.fft.rfft(samples[:, 1] * window)
            freqs = np.fft.rfftfreq(samples.shape[0], d=1.0 / sample_rate)
            series = []
            if settings.display_input1_baseband:
                series.append({"label": "Input 1", "values": _convert_spectrum_power(np.abs(ch1_fft) ** 2, settings.display_unit, rbw)})
            if settings.display_input2_baseband:
                series.append({"label": "Input 2", "values": _convert_spectrum_power(np.abs(ch2_fft) ** 2, settings.display_unit, rbw)})
            if settings.display_cross_amplitude:
                cross = np.abs(np.conjugate(ch1_fft) * ch2_fft)
                series.append({"label": "Cross", "values": _convert_spectrum_power(cross, settings.display_unit, rbw)})
        else:
            complex_data = samples[:, 0] + 1j * samples[:, 1]
            spectrum = np.fft.fftshift(np.fft.fft(complex_data * window))
            freqs = np.fft.fftshift(np.fft.fftfreq(samples.shape[0], d=1.0 / sample_rate)) + settings.center
            series = [{"label": settings.input, "values": _convert_spectrum_power(np.abs(spectrum) ** 2, settings.display_unit, rbw)}]
        return {
            "sequence": sequence,
            "x": freqs.astype(np.float64, copy=False),
            "series": series,
            "span": settings.span,
            "center": settings.center,
            "rbw": rbw,
            "unit": settings.display_unit,
            "running_state": settings.running_state,
        }

    def _empty_spectrum_arrays(self, sequence: int) -> dict:
        return {
            "sequence": sequence,
            "x": np.asarray([], dtype=np.float64),
            "series": [],
            "span": self.spectrum_settings.span,
            "center": self.spectrum_settings.center,
            "rbw": 0.0,
            "unit": self.spectrum_settings.display_unit,
            "running_state": self.spectrum_settings.running_state,
        }

    def _acquire_hardware_scope_frame(self, sequence: int, sample_count: int, *, wait: bool = False) -> ScopeAcquisition:
        state = self.scope_settings.running_state
        if state in {"stopped", "paused_single", "paused_continuous"}:
            return ScopeAcquisition(None)
        if self._hardware_rolling_mode_active(state):
            return self._acquire_hardware_rolling_scope_frame(sequence, sample_count)
        if self.scope_settings.trigger_source == "off":
            return ScopeAcquisition(None)
        if self._hardware_trace_started is None:
            if not start_scope_trace_acquisition(self.client, self.scope_settings):
                return ScopeAcquisition(None)
            self._hardware_trace_started = time.monotonic()
        if wait:
            if not wait_scope_curve_ready(self.client, self.scope_settings):
                return ScopeAcquisition(None)
        elif time.monotonic() - self._hardware_trace_started < self.scope_settings.duration:
            return ScopeAcquisition(None)
        if not scope_curve_ready(self.client):
            return ScopeAcquisition(None)
        self._hardware_trace_started = None
        roll_offset = scope_trigger_roll_offset(self.client)
        frame = read_trigger_aligned_scope_frame(self.client, sequence, roll_offset, sample_count)
        return ScopeAcquisition(frame, state_changed=self._record_scope_average_no_lock(state))

    def _hardware_rolling_mode_active(self, state: str) -> bool:
        return state == "running_continuous" and self.scope_settings.rolling_mode and self.scope_settings.duration > 0.1

    def _acquire_hardware_rolling_scope_frame(self, sequence: int, sample_count: int) -> ScopeAcquisition:
        if not self._hardware_rolling_started:
            start_scope_rolling_acquisition(self.client, self.scope_settings)
            self._hardware_rolling_started = True
        frame = read_rolling_scope_frame(self.client, sequence, sample_count)
        return ScopeAcquisition(frame)

    def _acquire_fake_scope_frame(self, sequence: int, sample_count: int) -> ScopeAcquisition:
        state = self.scope_settings.running_state
        source = self.scope_settings.trigger_source

        if state in {"paused_single", "paused_continuous"}:
            return ScopeAcquisition(None)

        if state == "stopped":
            frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += max(1, sample_count)
            return ScopeAcquisition(frame)

        if source == "off":
            self._fake_scope_clock += max(1, sample_count)
            return ScopeAcquisition(None)

        rolling = self._hardware_rolling_mode_active(state)
        if source == "immediately" or rolling:
            frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += max(1, sample_count)
            if rolling:
                return ScopeAcquisition(frame)
            return ScopeAcquisition(frame, state_changed=self._record_scope_average_no_lock(state))

        trigger_index = self._find_next_fake_trigger(sample_count)
        if trigger_index is None:
            return ScopeAcquisition(None)

        trigger_slot = _trigger_slot(self.scope_settings, sample_count)
        capture_start = trigger_index - trigger_slot
        frame = self._fake_scope_frame(sequence, capture_start, sample_count)
        self._fake_scope_clock = trigger_index + 1
        return ScopeAcquisition(frame, state_changed=self._record_scope_average_no_lock(state))

    def _record_scope_average_no_lock(self, state: str) -> bool:
        if state == "running_single":
            self.scope_settings.current_avg += 1
            if self.scope_settings.current_avg >= self.scope_settings.trace_average:
                self.scope_settings.current_avg = self.scope_settings.trace_average
                self.scope_settings.running_state = "paused_single"
                return True
        elif state == "running_continuous":
            self.scope_settings.current_avg = min(
                self.scope_settings.current_avg + 1,
                self.scope_settings.trace_average,
            )
        return False

    def _find_next_fake_trigger(self, sample_count: int) -> int | None:
        search_count = max(4096, sample_count * 2)
        source = self.scope_settings.trigger_source
        trigger_data = self._fake_trigger_data(source, self._fake_scope_clock, search_count)
        if trigger_data is None:
            self._fake_scope_clock += search_count
            return None
        data, edge = trigger_data
        if edge == "positive":
            relative = _find_positive_edge(data, self.scope_settings.threshold, self.scope_settings.hysteresis)
        else:
            relative = _find_negative_edge(data, self.scope_settings.threshold, self.scope_settings.hysteresis)
        if relative is None:
            self._fake_scope_clock += search_count
            return None
        return self._fake_scope_clock + relative

    def _fake_trigger_data(self, source: str, start: int, count: int) -> tuple[np.ndarray, str] | None:
        if source.startswith("ch1_"):
            edge = "positive" if source.endswith("positive_edge") else "negative"
            return self._fake_signal_data(self.scope_settings.input1, start, count), edge
        if source.startswith("ch2_"):
            edge = "positive" if source.endswith("positive_edge") else "negative"
            return self._fake_signal_data(self.scope_settings.input2, start, count), edge
        if source in {"asg0", "asg1"}:
            return self._fake_signal_data(source, start, count), "positive"
        return None

    def _fake_scope_frame(self, sequence: int, start: int, sample_count: int) -> ScopeFrame:
        ch1 = self._fake_signal_data(self.scope_settings.input1, start, sample_count)
        ch2 = self._fake_signal_data(self.scope_settings.input2, start, sample_count)
        interleaved = np.empty(sample_count * 2, dtype=np.float32)
        interleaved[0::2] = ch1
        interleaved[1::2] = ch2
        return ScopeFrame(
            sequence=sequence,
            timestamp_ns=0,
            sample_count=sample_count,
            channel_count=2,
            payload=interleaved.tobytes(),
        )

    def _fake_signal_data(self, name: str, start: int, count: int) -> np.ndarray:
        signal = DSP_INPUT_VALUES[self._resolve_lockbox_dsp_signal_no_lock(name)]
        values = [
            self.client.fake_signal_value(signal, start + index) / np.float32(2**13)
            for index in range(count)
        ]
        return np.asarray(values, dtype=np.float32)


def _normalize_state_name(state_name: str) -> str:
    normalized = str(state_name).strip()
    if not normalized:
        raise KeyError("state_name")
    return normalized


def _empty_saved_states() -> dict[str, dict[str, dict]]:
    module_names = (
        ["scope", "asg0", "asg1", "hk", "trig", "spectrumanalyzer", "networkanalyzer", "lockbox"]
        + [f"pid{index}" for index in range(3)]
        + [f"iq{index}" for index in range(3)]
        + ["iir"]
        + [f"pwm{index}" for index in range(2)]
    )
    return {module_name: {} for module_name in module_names}


def _asg_channel(module_name: str) -> int:
    if module_name == "asg0":
        return 0
    if module_name == "asg1":
        return 1
    raise KeyError(module_name)


def _setup_attributes(module_name: str) -> list[str]:
    if module_name == "scope":
        return list(SCOPE_SETUP_ATTRIBUTES)
    if module_name in {"asg0", "asg1"}:
        return list(ASG_SETUP_ATTRIBUTES)
    if module_name == "hk":
        return list(HK_SETUP_ATTRIBUTES)
    if module_name in {"pid0", "pid1", "pid2"}:
        return list(PID_SETUP_ATTRIBUTES)
    if module_name in {"iq0", "iq1", "iq2"}:
        return list(IQ_SETUP_ATTRIBUTES)
    if module_name == "iir":
        return list(IIR_SETUP_ATTRIBUTES)
    if module_name == "trig":
        return list(TRIG_SETUP_ATTRIBUTES)
    if module_name in {"pwm0", "pwm1"}:
        return list(PWM_SETUP_ATTRIBUTES)
    if module_name == "spectrumanalyzer":
        return list(SPECTRUM_SETUP_ATTRIBUTES)
    if module_name == "networkanalyzer":
        return list(NETWORK_ANALYZER_SETUP_ATTRIBUTES)
    raise KeyError(module_name)


def _find_positive_edge(data, threshold: float, hysteresis: float) -> int | None:
    low = threshold - hysteresis
    high = threshold + hysteresis
    armed = False
    for index, value in enumerate(data):
        if value <= low:
            armed = True
        elif armed and value >= high:
            return index
    return None


def _find_negative_edge(data, threshold: float, hysteresis: float) -> int | None:
    low = threshold - hysteresis
    high = threshold + hysteresis
    armed = False
    for index, value in enumerate(data):
        if value >= high:
            armed = True
        elif armed and value <= low:
            return index
    return None


def _trigger_slot(settings: ScopeSettings, sample_count: int) -> int:
    if sample_count <= 1 or settings.trigger_source == "immediately":
        return 0
    sample_time = settings.duration / max(1, sample_count)
    x_min = settings.trigger_delay - settings.duration / 2
    return max(0, min(sample_count - 1, int(round(-x_min / sample_time))))


def _trigger_result(
    triggered: bool,
    index: int | None,
    source: str,
    threshold: float,
    hysteresis: float,
    condition: str,
) -> dict:
    return {
        "triggered": triggered,
        "index": index,
        "source": source,
        "threshold": threshold,
        "hysteresis": hysteresis,
        "condition": condition,
    }


def _spectrum_window(name: str, count: int) -> np.ndarray:
    if count <= 0:
        return np.asarray([], dtype=np.float32)
    if name == "boxcar":
        window = np.ones(count, dtype=np.float64)
    elif name == "hamming":
        window = np.hamming(count)
    elif name == "blackman":
        window = np.blackman(count)
    elif name == "flattop":
        index = np.arange(count, dtype=np.float64)
        phase = 2.0 * np.pi * index / max(1, count - 1)
        window = (
            1.0
            - 1.93 * np.cos(phase)
            + 1.29 * np.cos(2.0 * phase)
            - 0.388 * np.cos(3.0 * phase)
            + 0.032 * np.cos(4.0 * phase)
        )
    elif name == "gaussian":
        index = np.arange(count, dtype=np.float64)
        center = (count - 1) / 2.0
        sigma = count / 10.0
        window = np.exp(-0.5 * ((index - center) / sigma) ** 2)
    else:
        window = np.blackman(count)
    total = float(np.sum(window))
    if total != 0.0:
        window = window / (total / 2.0)
    return window.astype(np.float32)


def _convert_spectrum_power(power: np.ndarray, unit: str, rbw: float) -> np.ndarray:
    safe_power = np.maximum(power.astype(np.float64), 1e-30)
    if unit == "dB(Vpk^2)":
        values = 10.0 * np.log10(safe_power)
    elif unit == "Vpk":
        values = np.sqrt(safe_power)
    elif unit == "Vrms^2":
        values = safe_power / 2.0
    elif unit == "dB(Vrms^2)":
        values = 10.0 * np.log10(safe_power / 2.0 + np.finfo(float).eps)
    elif unit == "Vrms":
        values = np.sqrt(safe_power) / np.sqrt(2.0)
    elif unit == "Vrms^2/Hz":
        values = safe_power / 2.0 / max(rbw, np.finfo(float).eps)
    elif unit == "dB(Vrms^2/Hz)":
        values = 10.0 * np.log10(safe_power / 2.0 / max(rbw, np.finfo(float).eps) + np.finfo(float).eps)
    elif unit == "Vrms/sqrt(Hz)":
        values = np.sqrt(safe_power) / np.sqrt(2.0) / max(rbw, np.finfo(float).eps)
    else:
        values = safe_power
    return values.astype(np.float32, copy=False)


def _spectrum_arrays_to_jsonable(frame: dict) -> dict:
    return {
        **frame,
        "x": frame["x"].astype(float).tolist(),
        "series": [
            {"label": series["label"], "values": series["values"].astype(float).tolist()}
            for series in frame["series"]
        ],
    }


def _spectrum_arrays_to_bytes(frame: dict) -> bytes:
    x = np.asarray(frame["x"], dtype="<f8")
    series = [
        {"label": str(item["label"]), "values": np.asarray(item["values"], dtype="<f4")}
        for item in frame["series"]
    ]
    point_count = len(x)
    if any(len(item["values"]) != point_count for item in series):
        raise ValueError("spectrum series lengths do not match frequency axis")
    metadata = {
        "labels": [item["label"] for item in series],
        "span": frame["span"],
        "center": frame["center"],
        "rbw": frame["rbw"],
        "unit": frame["unit"],
        "running_state": frame["running_state"],
    }
    metadata_bytes = json.dumps(metadata, separators=(",", ":")).encode("utf-8")
    header = struct.pack(
        "<4sIIIII",
        b"PYSP",
        1,
        int(frame["sequence"]),
        point_count,
        len(series),
        len(metadata_bytes),
    )
    return b"".join(
        [
            header,
            metadata_bytes,
            x.tobytes(),
            *(item["values"].tobytes() for item in series),
        ]
    )
