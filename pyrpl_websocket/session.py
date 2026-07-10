"""Connection/session management for the web server."""

from __future__ import annotations

import json
import struct
from copy import deepcopy
from dataclasses import asdict, dataclass
from pathlib import Path
from threading import Lock

import numpy as np

from .asg_registers import disable_asg, sync_asg_setting, sync_asg_settings, trigger_asg
from .dsp_registers import (
    arm_trig,
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
from .lockbox import LockboxState, lockbox_actions
from .monitor_client import DummyClient, MonitorClient
from .modules import (
    ASG_SETUP_ATTRIBUTES,
    HK_SETUP_ATTRIBUTES,
    IQ_SETUP_ATTRIBUTES,
    PID_SETUP_ATTRIBUTES,
    PWM_SETUP_ATTRIBUTES,
    SCOPE_SETUP_ATTRIBUTES,
    SPECTRUM_SETUP_ATTRIBUTES,
    TRIG_SETUP_ATTRIBUTES,
    AsgSettings,
    HkSettings,
    IqSettings,
    PidSettings,
    PwmSettings,
    ScopeSettings,
    SpectrumAnalyzerSettings,
    TrigSettings,
    asg_actions,
    asg_attribute_schema,
    hk_actions,
    hk_attribute_schema,
    iq_actions,
    iq_attribute_schema,
    module_list,
    pid_actions,
    pid_attribute_schema,
    pwm_actions,
    pwm_attribute_schema,
    scope_actions,
    scope_attribute_schema,
    set_iq_attribute,
    set_pid_attribute,
    set_pwm_attribute,
    set_spectrum_attribute,
    set_asg_attribute,
    set_hk_attribute,
    set_scope_attribute,
    set_trig_attribute,
    spectrum_actions,
    spectrum_attribute_schema,
    trig_actions,
    trig_attribute_schema,
)
from .scope import SCOPE_DATA_LENGTH, ScopeFrame, read_rolling_scope_frame, read_scope_frame, read_trigger_aligned_scope_frame
from .scope_registers import (
    DSP_INPUT_VALUES,
    scope_trigger_roll_offset,
    start_scope_rolling_acquisition,
    start_scope_trace_acquisition,
    sync_scope_setting,
    sync_scope_settings,
    wait_scope_curve_ready,
)
from .settings import ServerSettings


@dataclass
class ScopeAcquisition:
    frame: ScopeFrame | None
    state_changed: bool = False


class WebSession:
    """Owns the active monitor-server client."""

    def __init__(self, settings: ServerSettings):
        self.settings = settings
        self._lock = Lock()
        self.client = DummyClient() if settings.fake else MonitorClient(settings.hostname, settings.port)
        self.scope_settings = ScopeSettings()
        self.asg_settings = {"asg0": AsgSettings(), "asg1": AsgSettings()}
        self.hk_settings = HkSettings()
        self.pid_settings = {f"pid{index}": PidSettings() for index in range(3)}
        self.iq_settings = {f"iq{index}": IqSettings() for index in range(3)}
        self.trig_settings = TrigSettings()
        self.pwm_settings = {f"pwm{index}": PwmSettings() for index in range(2)}
        self.spectrum_settings = SpectrumAnalyzerSettings()
        self.lockbox = LockboxState()
        self.module_owners: dict[str, str | None] = {
            "scope": None,
            "asg0": None,
            "asg1": None,
            "trig": None,
            **{f"pid{index}": None for index in range(3)},
            **{f"iq{index}": None for index in range(3)},
            **{f"pwm{index}": None for index in range(2)},
        }
        self._module_states: dict[str, dict[str, dict]] = self._load_saved_states()
        self._fake_scope_clock = 0
        self._hardware_rolling_started = False

    def info(self) -> dict:
        return {
            "settings": asdict(self.settings),
            "fake": self.settings.fake,
            "reads": self.client.stats.reads,
            "writes": self.client.stats.writes,
            "scope": self.scope_settings.as_dict(),
            "asg0": self.asg_settings["asg0"].as_dict(),
            "asg1": self.asg_settings["asg1"].as_dict(),
            "hk": self.hk_settings.as_dict(),
            "pid0": self.pid_settings["pid0"].as_dict(),
            "pid1": self.pid_settings["pid1"].as_dict(),
            "pid2": self.pid_settings["pid2"].as_dict(),
            "iq0": self.iq_settings["iq0"].as_dict(),
            "iq1": self.iq_settings["iq1"].as_dict(),
            "iq2": self.iq_settings["iq2"].as_dict(),
            "trig": self.trig_settings.as_dict(),
            "pwm0": self.pwm_settings["pwm0"].as_dict(),
            "pwm1": self.pwm_settings["pwm1"].as_dict(),
            "spectrumanalyzer": self.spectrum_settings.as_dict(),
            "lockbox": self.lockbox.schema(),
            "owners": dict(self.module_owners),
        }

    def modules(self) -> list[dict]:
        return module_list()

    def lockbox_classes(self) -> list[dict]:
        return self.lockbox.class_list()

    def lockbox_schema(self) -> dict:
        return self.lockbox.schema()

    def set_lockbox_class(self, classname: str) -> dict:
        with self._lock:
            self._release_lockbox_iq_inputs_no_lock()
            return self.lockbox.set_class(classname)

    def set_lockbox_attribute(self, attribute: str, value) -> dict:
        with self._lock:
            return self.lockbox.set_attribute(attribute, value)

    def set_lockbox_input_attribute(self, input_name: str, attribute: str, value) -> dict:
        with self._lock:
            schema = self.lockbox.set_input_attribute(input_name, attribute, value)
            self._configure_lockbox_input_no_lock(input_name)
            return schema

    def set_lockbox_output_attribute(self, output_name: str, attribute: str, value) -> dict:
        with self._lock:
            return self.lockbox.set_output_attribute(output_name, attribute, value)

    def append_lockbox_stage(self) -> dict:
        with self._lock:
            return self.lockbox.append_stage()

    def delete_lockbox_stage(self, index: int) -> dict:
        with self._lock:
            return self.lockbox.delete_stage(index)

    def set_lockbox_stage_attribute(self, index: int, attribute: str, value) -> dict:
        with self._lock:
            return self.lockbox.set_stage_attribute(index, attribute, value)

    def set_lockbox_stage_output_attribute(self, index: int, output_name: str, attribute: str, value) -> dict:
        with self._lock:
            return self.lockbox.set_stage_output_attribute(index, output_name, attribute, value)

    def call_lockbox_action(self, action: str) -> dict:
        with self._lock:
            return self._call_lockbox_action_no_lock(action)

    def lockbox_actions(self) -> list[dict]:
        return lockbox_actions()

    def lockbox_input_plot(self, input_name: str, points: int = 200) -> dict:
        with self._lock:
            return self.lockbox.input_plot(input_name, points)

    def lockbox_output_transfer_function(self, output_name: str, points: int = 200) -> dict:
        with self._lock:
            return self.lockbox.output_transfer_function(output_name, points)

    def module_attributes(self, module_name: str) -> list[dict]:
        if module_name == "scope":
            return scope_attribute_schema(self.scope_settings)
        if module_name in self.asg_settings:
            return asg_attribute_schema(self.asg_settings[module_name])
        if module_name == "hk":
            return hk_attribute_schema(self.hk_settings)
        if module_name in self.pid_settings:
            return pid_attribute_schema(self.pid_settings[module_name])
        if module_name in self.iq_settings:
            return iq_attribute_schema(self.iq_settings[module_name])
        if module_name == "trig":
            return trig_attribute_schema(self.trig_settings)
        if module_name in self.pwm_settings:
            return pwm_attribute_schema(self.pwm_settings[module_name])
        if module_name == "spectrumanalyzer":
            return spectrum_attribute_schema(self.spectrum_settings)
        raise KeyError(module_name)

    def module_state(self, module_name: str) -> dict:
        if module_name == "scope":
            return self._with_owner(module_name, self.scope_settings.as_dict())
        if module_name in self.asg_settings:
            return self._with_owner(module_name, self.asg_settings[module_name].as_dict())
        if module_name == "hk":
            read_hk_expansion(self.client, self.hk_settings)
            return self.hk_settings.as_dict()
        if module_name in self.pid_settings:
            return self._with_owner(module_name, self.pid_settings[module_name].as_dict())
        if module_name in self.iq_settings:
            return self._with_owner(module_name, self.iq_settings[module_name].as_dict())
        if module_name == "trig":
            return self._with_owner(module_name, self.trig_settings.as_dict())
        if module_name in self.pwm_settings:
            return self._with_owner(module_name, self.pwm_settings[module_name].as_dict())
        if module_name == "spectrumanalyzer":
            state = self.spectrum_settings.as_dict()
            state["resources"] = self._resources_owned_by("spectrumanalyzer")
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
        if module_name in self.pid_settings:
            return pid_actions()
        if module_name in self.iq_settings:
            return iq_actions()
        if module_name == "trig":
            return trig_actions()
        if module_name in self.pwm_settings:
            return pwm_actions()
        if module_name == "spectrumanalyzer":
            return spectrum_actions()
        if module_name == "lockbox":
            return lockbox_actions()
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
                normalized = set_scope_attribute(self.scope_settings, attribute, value)
                sync_scope_setting(self.client, self.scope_settings, attribute)
                self._hardware_rolling_started = False
                return normalized
            if module_name in self.asg_settings:
                settings = self.asg_settings[module_name]
                normalized = set_asg_attribute(settings, attribute, value)
                sync_asg_setting(self.client, _asg_channel(module_name), settings, attribute)
                return normalized
            if module_name == "hk":
                normalized = set_hk_attribute(self.hk_settings, attribute, value)
                sync_hk_setting(self.client, self.hk_settings, attribute)
                return normalized
            if module_name in self.pid_settings:
                settings = self.pid_settings[module_name]
                normalized = set_pid_attribute(settings, attribute, value)
                sync_pid_setting(self.client, module_name, settings, attribute)
                return normalized
            if module_name in self.iq_settings:
                settings = self.iq_settings[module_name]
                normalized = set_iq_attribute(settings, attribute, value)
                sync_iq_setting(self.client, module_name, settings, attribute)
                return normalized
            if module_name == "trig":
                normalized = set_trig_attribute(self.trig_settings, attribute, value)
                sync_trig_setting(self.client, self.trig_settings, attribute)
                return normalized
            if module_name in self.pwm_settings:
                settings = self.pwm_settings[module_name]
                normalized = set_pwm_attribute(settings, attribute, value)
                sync_pwm_setting(self.client, module_name, settings, attribute)
                return normalized
            if module_name == "spectrumanalyzer":
                normalized = set_spectrum_attribute(self.spectrum_settings, attribute, value)
                if attribute != "trace_average" and self.spectrum_settings.running_state == "running_continuous":
                    self._configure_spectrum_no_lock()
                return normalized
            raise KeyError(module_name)

    def call_module_action(self, module_name: str, action: str) -> dict:
        with self._lock:
            self._ensure_manual_control_allowed(module_name)
            if module_name == "lockbox":
                return self._call_lockbox_action_no_lock(action)
            if module_name == "spectrumanalyzer":
                return self._call_spectrum_action_no_lock(action)
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
                    sync_iq_phases(self.client)
                else:
                    raise KeyError(action)
                return settings.as_dict()
            if module_name == "trig":
                if action == "setup":
                    sync_trig_settings(self.client, self.trig_settings)
                elif action == "arm":
                    arm_trig(self.client, self.trig_settings)
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
            if module_name != "scope":
                raise KeyError(module_name)
            if action == "setup":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
            elif action == "single":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
                self.scope_settings.running_state = "running_single"
            elif action == "continuous":
                sync_scope_settings(self.client, self.scope_settings)
                self._hardware_rolling_started = False
                self.scope_settings.running_state = "running_continuous"
            elif action == "pause":
                if self.scope_settings.running_state == "running_single":
                    self.scope_settings.running_state = "paused_single"
                elif self.scope_settings.running_state == "running_continuous":
                    self.scope_settings.running_state = "paused_continuous"
            elif action == "resume":
                if self.scope_settings.running_state == "paused_single":
                    self.scope_settings.running_state = "running_single"
                elif self.scope_settings.running_state == "paused_continuous":
                    self.scope_settings.running_state = "running_continuous"
            elif action == "stop":
                self._hardware_rolling_started = False
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
            state = {
                attribute: self._module_setting_value(module_name, attribute)
                for attribute in _setup_attributes(module_name)
            }
            self._module_states[module_name][state_name] = dict(state)
            self._persist_saved_states()
            return {"name": state_name, "state": state}

    def load_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = self._module_states[module_name][state_name]
            for attribute, value in state.items():
                self._set_module_attribute_no_lock(module_name, attribute, value)
            return self.module_state(module_name)

    def delete_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name not in self._module_states:
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = self._module_states[module_name].pop(state_name)
            self._persist_saved_states()
            return {"name": state_name, "state": state}

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
            return _spectrum_arrays_to_jsonable(self._acquire_spectrum_arrays_no_lock(sequence, sample_count))

    def acquire_spectrum_frame_bytes(self, sequence: int, sample_count: int = 4096) -> bytes:
        with self._lock:
            return _spectrum_arrays_to_bytes(self._acquire_spectrum_arrays_no_lock(sequence, sample_count))

    def acquire_spectrum_scope_frame(self, sequence: int, sample_count: int = 4096) -> ScopeFrame | None:
        with self._lock:
            sample_count = max(256, min(SCOPE_DATA_LENGTH, int(sample_count)))
            if self.spectrum_settings.running_state == "stopped":
                return None
            self._configure_spectrum_no_lock()
            if isinstance(self.client, DummyClient):
                frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
                self._fake_scope_clock += sample_count
                return frame
            previous_state = self.scope_settings.running_state
            self.scope_settings.running_state = "running_continuous"
            acquisition = self._acquire_hardware_scope_frame(sequence, sample_count)
            self.scope_settings.running_state = previous_state
            return acquisition.frame

    def acquire_scope_frame(self, sequence: int, sample_count: int) -> ScopeAcquisition:
        """Acquire one display frame according to current run/trigger state."""

        with self._lock:
            sample_count = max(1, min(SCOPE_DATA_LENGTH, int(sample_count)))
            if not isinstance(self.client, DummyClient):
                return self._acquire_hardware_scope_frame(sequence, sample_count)
            frame = self._acquire_fake_scope_frame(sequence, sample_count)
            return frame

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
        self.client.close()

    def _load_saved_states(self) -> dict[str, dict[str, dict]]:
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
        if not self.settings.state_file:
            return
        path = Path(self.settings.state_file)
        if path.parent != Path("."):
            path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self._module_states, indent=2, sort_keys=True), encoding="utf-8")

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
        if module_name == "trig":
            return getattr(self.trig_settings, attribute)
        if module_name in self.pwm_settings:
            return getattr(self.pwm_settings[module_name], attribute)
        if module_name == "spectrumanalyzer":
            return getattr(self.spectrum_settings, attribute)
        raise KeyError(module_name)

    def _set_module_attribute_no_lock(self, module_name: str, attribute: str, value) -> None:
        if module_name == "scope":
            set_scope_attribute(self.scope_settings, attribute, value)
            sync_scope_setting(self.client, self.scope_settings, attribute)
            self._hardware_rolling_started = False
        elif module_name in self.asg_settings:
            settings = self.asg_settings[module_name]
            set_asg_attribute(settings, attribute, value)
            sync_asg_setting(self.client, _asg_channel(module_name), settings, attribute)
        elif module_name == "hk":
            set_hk_attribute(self.hk_settings, attribute, value)
            sync_hk_setting(self.client, self.hk_settings, attribute)
        elif module_name in self.pid_settings:
            settings = self.pid_settings[module_name]
            set_pid_attribute(settings, attribute, value)
            sync_pid_setting(self.client, module_name, settings, attribute)
        elif module_name in self.iq_settings:
            settings = self.iq_settings[module_name]
            set_iq_attribute(settings, attribute, value)
            sync_iq_setting(self.client, module_name, settings, attribute)
        elif module_name == "trig":
            set_trig_attribute(self.trig_settings, attribute, value)
            sync_trig_setting(self.client, self.trig_settings, attribute)
        elif module_name in self.pwm_settings:
            settings = self.pwm_settings[module_name]
            set_pwm_attribute(settings, attribute, value)
            sync_pwm_setting(self.client, module_name, settings, attribute)
        elif module_name == "spectrumanalyzer":
            set_spectrum_attribute(self.spectrum_settings, attribute, value)
            self._configure_spectrum_no_lock()
        else:
            raise KeyError(module_name)

    def _ensure_manual_control_allowed(self, module_name: str) -> None:
        owner = self.module_owners.get(module_name)
        if owner is not None:
            raise ValueError(f"{module_name} is occupied by {owner}")

    def _reserve_module_no_lock(self, module_name: str, owner: str) -> None:
        if module_name not in self.module_owners:
            raise KeyError(module_name)
        current = self.module_owners[module_name]
        if current not in {None, owner}:
            raise ValueError(f"{module_name} is occupied by {current}")
        self.module_owners[module_name] = owner

    def _release_module_no_lock(self, module_name: str, owner: str | None = None) -> None:
        if module_name not in self.module_owners:
            raise KeyError(module_name)
        current = self.module_owners[module_name]
        if owner is None or current == owner:
            self.module_owners[module_name] = None

    def _resources_owned_by(self, owner: str) -> list[str]:
        return [module_name for module_name, current in sorted(self.module_owners.items()) if current == owner]

    def _with_owner(self, module_name: str, state: dict) -> dict:
        state["owner"] = self.module_owners.get(module_name)
        return state

    def _call_lockbox_action_no_lock(self, action: str) -> dict:
        if action == "unlock":
            self._unlock_lockbox_outputs_no_lock(reset_offset=True)
            self.lockbox.current_state = "unlock"
            self._release_lockbox_resources_no_lock()
        elif action == "sweep":
            self._configure_lockbox_sweep_no_lock()
            self.lockbox.current_state = "sweep"
        elif action == "lock":
            self._configure_lockbox_lock_no_lock()
            self.lockbox.current_state = "lock_on"
        elif action == "calibrate_all":
            self._calibrate_lockbox_inputs_no_lock()
        elif action == "get_analog_offsets":
            self._measure_lockbox_offsets_no_lock()
        else:
            raise KeyError(action)
        return self.lockbox.schema()

    def _configure_lockbox_sweep_no_lock(self) -> None:
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
        sync_asg_settings(self.client, 0, asg)

        pid = self.pid_settings[output.pid]
        pid.input = "asg0"
        pid.setpoint = 0.0
        pid.p = 1.0 if output.sweep_amplitude >= 0 else -1.0
        pid.i = 0.0
        sync_pid_settings(self.client, output.pid, pid)
        output.current_state = "sweep"

    def _configure_lockbox_lock_no_lock(self) -> None:
        for output_name in self.lockbox.outputs:
            self._reserve_lockbox_output_no_lock(output_name)

        for stage in self.lockbox.sequence:
            for output_name, stage_output in stage.outputs.items():
                if stage_output.lock_on == "ignore":
                    continue
                if not bool(stage_output.lock_on):
                    self._unlock_one_lockbox_output_no_lock(output_name, reset_offset=False)
                if stage_output.reset_offset:
                    self._set_lockbox_output_offset_no_lock(output_name, stage_output.offset)

            for output_name, stage_output in stage.outputs.items():
                if stage_output.lock_on is True:
                    self._lock_one_lockbox_output_no_lock(output_name, stage.input, stage.setpoint, stage_output.offset, stage.gain_factor)

            self._call_lockbox_stage_function_no_lock(stage.function_call)
            self.lockbox.current_state = stage.name

    def _call_lockbox_stage_function_no_lock(self, function_call: str) -> None:
        if not function_call:
            return
        if function_call == "custom_function":
            self._calibrate_lockbox_inputs_no_lock()
            self._unlock_lockbox_outputs_no_lock(reset_offset=True)
        elif function_call == "increment":
            current = float(self.lockbox.attributes.get("first_stage_counter", 0.0))
            self.lockbox.attributes["first_stage_counter"] = current + 1.0

    def _unlock_lockbox_outputs_no_lock(self, reset_offset: bool = False) -> None:
        for output_name in self.lockbox.outputs:
            self._unlock_one_lockbox_output_no_lock(output_name, reset_offset=reset_offset)

    def _unlock_one_lockbox_output_no_lock(self, output_name: str, reset_offset: bool = False) -> None:
        output = self.lockbox.outputs[output_name]
        self._configure_pid_output_no_lock(output_name, reset_offset=reset_offset)
        pid = self.pid_settings[output.pid]
        pid.p = 0.0
        pid.i = 0.0
        if reset_offset:
            pid.ival = 0.0
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
        external_gain = output.dc_gain * self.lockbox.expected_slope(input_name, setpoint)
        if abs(external_gain) < 1e-15:
            p_gain = 0.0
            i_gain = 0.0
        else:
            p_gain = output.p / external_gain * gain_factor
            i_gain = output.i / external_gain * gain_factor
        pid = self.pid_settings[output.pid]
        pid.p = 0.0
        pid.i = 0.0
        pid.input = self._lockbox_input_signal_no_lock(input_model)
        pid.setpoint = self.lockbox.expected_signal(input_name, setpoint) + input_model.calibration.analog_offset
        if offset is not None:
            pid.ival = offset
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
            pid.ival = 0.0
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
        iq.amplitude = float(getattr(input_model, "mod_amp", 0.0))
        iq.phase = float(getattr(input_model, "mod_phase", 0.0))
        iq.output_direct = str(getattr(input_model, "mod_output", "out1") or "off")
        iq.output_signal = "quadrature"
        iq.gain = 0.0
        iq.quadrature_factor = float(getattr(input_model, "quadrature_factor", 1.0))
        iq.on = True
        sync_iq_settings(self.client, iq_module, iq)
        return iq_module

    def _resolve_lockbox_dsp_signal_no_lock(self, signal: str) -> str:
        if signal.startswith("lockbox.outputs."):
            output_name = signal.split(".")[-1]
            output = self.lockbox.outputs.get(output_name)
            if output is not None:
                return output.pid
            return "off"
        return signal if signal in DSP_INPUT_VALUES else "off"

    def _lockbox_input_signal_no_lock(self, input_model) -> str:
        if getattr(input_model, "is_iq", False):
            return self._configure_lockbox_iq_input_no_lock(input_model)
        return self._resolve_lockbox_dsp_signal_no_lock(input_model.input_signal)

    def _calibrate_lockbox_inputs_no_lock(self) -> None:
        if isinstance(self.client, DummyClient):
            self._reserve_module_no_lock("scope", "lockbox")
            try:
                for input_model in self.lockbox.inputs.values():
                    samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                    self._update_lockbox_calibration_from_samples(input_model, samples)
            finally:
                self._release_module_no_lock("scope", "lockbox")
            return
        self._reserve_module_no_lock("scope", "lockbox")
        saved_scope = deepcopy(self.scope_settings)
        try:
            for input_model in self.lockbox.inputs.values():
                samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                self._update_lockbox_calibration_from_samples(input_model, samples)
        finally:
            self.scope_settings = saved_scope
            sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self._release_module_no_lock("scope", "lockbox")

    def _measure_lockbox_offsets_no_lock(self) -> None:
        if isinstance(self.client, DummyClient):
            self._reserve_module_no_lock("scope", "lockbox")
            try:
                for input_model in self.lockbox.inputs.values():
                    samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                    if samples.size:
                        input_model.calibration.analog_offset = -float(np.mean(samples))
            finally:
                self._release_module_no_lock("scope", "lockbox")
            return
        self._reserve_module_no_lock("scope", "lockbox")
        saved_scope = deepcopy(self.scope_settings)
        try:
            for input_model in self.lockbox.inputs.values():
                samples = self._sample_lockbox_input_no_lock(self._lockbox_input_signal_no_lock(input_model))
                if samples.size:
                    input_model.calibration.analog_offset = -float(np.mean(samples))
        finally:
            self.scope_settings = saved_scope
            sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self._release_module_no_lock("scope", "lockbox")

    def _update_lockbox_calibration_from_samples(self, input_model, samples: np.ndarray) -> None:
        if samples.size == 0:
            return
        calibration = input_model.calibration
        calibration.min = float(np.min(samples))
        calibration.max = float(np.max(samples))
        calibration.mean = float(np.mean(samples))
        calibration.rms = float(np.sqrt(np.mean(np.square(samples))))
        calibration.offset = calibration.mean
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
        acquisition = self._acquire_hardware_scope_frame(0, sample_count)
        if acquisition.frame is None:
            return np.asarray([], dtype=np.float64)
        return acquisition.frame.samples()[:, 0].astype(np.float64, copy=False)

    def _call_spectrum_action_no_lock(self, action: str) -> dict:
        settings = self.spectrum_settings
        if action == "setup":
            self._configure_spectrum_no_lock()
            settings.running_state = "stopped"
        elif action == "single":
            self._configure_spectrum_no_lock()
            settings.running_state = "paused_single"
        elif action == "continuous":
            self._configure_spectrum_no_lock()
            settings.running_state = "running_continuous"
        elif action == "pause":
            if settings.running_state == "running_continuous":
                settings.running_state = "paused_continuous"
        elif action == "resume":
            if settings.running_state == "paused_continuous":
                settings.running_state = "running_continuous"
        elif action in {"stop", "release"}:
            settings.running_state = "stopped"
            self._release_module_no_lock(settings.iq_module, "spectrumanalyzer")
            self._release_module_no_lock("scope", "spectrumanalyzer")
        else:
            raise KeyError(action)
        settings.last_action = action
        return self.module_state("spectrumanalyzer")

    def _acquire_spectrum_arrays_no_lock(self, sequence: int, sample_count: int) -> dict:
        sample_count = max(256, min(SCOPE_DATA_LENGTH, int(sample_count)))
        self._configure_spectrum_no_lock()
        if isinstance(self.client, DummyClient):
            frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += sample_count
        else:
            previous_state = self.scope_settings.running_state
            self.scope_settings.running_state = "running_continuous"
            acquisition = self._acquire_hardware_scope_frame(sequence, sample_count)
            self.scope_settings.running_state = previous_state
            if acquisition.frame is None:
                return self._empty_spectrum_arrays(sequence)
            frame = acquisition.frame
        return self._spectrum_arrays_from_scope_no_lock(sequence, frame)

    def _configure_spectrum_no_lock(self) -> None:
        settings = self.spectrum_settings
        self._reserve_module_no_lock(settings.iq_module, "spectrumanalyzer")
        self._reserve_module_no_lock("scope", "spectrumanalyzer")
        self.scope_settings.running_state = "stopped"
        self._hardware_rolling_started = False
        if settings.baseband:
            self.scope_settings.input1 = settings.input1_baseband
            self.scope_settings.input2 = settings.input2_baseband
        else:
            iq_settings = self.iq_settings[settings.iq_module]
            iq_settings.input = settings.input
            iq_settings.output_direct = "off"
            iq_settings.output_signal = "quadrature"
            iq_settings.frequency = settings.center
            iq_settings.phase = 0.0
            iq_settings.gain = 0.0
            iq_settings.amplitude = 0.0
            iq_settings.quadrature_factor = 1.0
            iq_settings.on = True
            sync_iq_settings(self.client, settings.iq_module, iq_settings)
            self.scope_settings.input1 = settings.iq_module
            self.scope_settings.input2 = "iq2_2"
        self.scope_settings.trigger_source = "immediately"
        self.scope_settings.average = True
        self.scope_settings.duration = max(8e-9 * (2**14), SCOPE_DATA_LENGTH / settings.span)
        sync_scope_settings(self.client, self.scope_settings)
        self._hardware_rolling_started = False

    def _spectrum_arrays_from_scope_no_lock(self, sequence: int, frame: ScopeFrame) -> dict:
        settings = self.spectrum_settings
        samples = frame.samples()
        if samples.size == 0:
            return self._empty_spectrum_arrays(sequence)
        sample_rate = max(settings.span, 1.0)
        window = _spectrum_window(settings.window, samples.shape[0])
        norm = max(float(np.sum(window * window)), 1e-12)
        if settings.baseband:
            ch1_fft = np.fft.rfft(samples[:, 0] * window)
            ch2_fft = np.fft.rfft(samples[:, 1] * window)
            freqs = np.fft.rfftfreq(samples.shape[0], d=1.0 / sample_rate)
            series = []
            if settings.display_input1_baseband:
                series.append({"label": "Input 1", "values": _convert_spectrum_power(np.abs(ch1_fft) ** 2 / norm, settings.display_unit)})
            if settings.display_input2_baseband:
                series.append({"label": "Input 2", "values": _convert_spectrum_power(np.abs(ch2_fft) ** 2 / norm, settings.display_unit)})
            if settings.display_cross_amplitude:
                cross = np.abs(np.conjugate(ch1_fft) * ch2_fft) / norm
                series.append({"label": "Cross", "values": _convert_spectrum_power(cross, settings.display_unit)})
        else:
            complex_data = samples[:, 0] + 1j * samples[:, 1]
            spectrum = np.fft.fftshift(np.fft.fft(complex_data * window))
            freqs = np.fft.fftshift(np.fft.fftfreq(samples.shape[0], d=1.0 / sample_rate)) + settings.center
            series = [{"label": settings.input, "values": _convert_spectrum_power(np.abs(spectrum) ** 2 / norm, settings.display_unit)}]
        return {
            "sequence": sequence,
            "x": freqs.astype(np.float64, copy=False),
            "series": series,
            "span": settings.span,
            "center": settings.center,
            "rbw": _spectrum_enbw(settings.window) * sample_rate / max(1, samples.shape[0]),
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

    def _acquire_hardware_scope_frame(self, sequence: int, sample_count: int) -> ScopeAcquisition:
        state = self.scope_settings.running_state
        if state in {"stopped", "paused_single", "paused_continuous"}:
            return ScopeAcquisition(None)
        if self._hardware_rolling_mode_active(state):
            return self._acquire_hardware_rolling_scope_frame(sequence, sample_count)
        if self.scope_settings.trigger_source == "off":
            return ScopeAcquisition(None)
        if not start_scope_trace_acquisition(self.client, self.scope_settings):
            return ScopeAcquisition(None)
        if not wait_scope_curve_ready(self.client, self.scope_settings):
            return ScopeAcquisition(None)
        roll_offset = scope_trigger_roll_offset(self.client)
        frame = read_trigger_aligned_scope_frame(self.client, sequence, roll_offset, sample_count)
        state_changed = False
        if state == "running_single":
            self.scope_settings.running_state = "paused_single"
            state_changed = True
        return ScopeAcquisition(frame, state_changed=state_changed)

    def _hardware_rolling_mode_active(self, state: str) -> bool:
        return state == "running_continuous" and self.scope_settings.run_mode == "rolling" and self.scope_settings.duration > 0.1

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

        if source == "immediately" or (state == "running_continuous" and self.scope_settings.run_mode == "rolling"):
            frame = self._fake_scope_frame(sequence, self._fake_scope_clock, sample_count)
            self._fake_scope_clock += max(1, sample_count)
            if state == "running_single":
                self.scope_settings.running_state = "paused_single"
                return ScopeAcquisition(frame, state_changed=True)
            return ScopeAcquisition(frame)

        trigger_index = self._find_next_fake_trigger(sample_count)
        if trigger_index is None:
            return ScopeAcquisition(None)

        trigger_slot = _trigger_slot(self.scope_settings, sample_count)
        capture_start = trigger_index - trigger_slot
        frame = self._fake_scope_frame(sequence, capture_start, sample_count)
        self._fake_scope_clock = trigger_index + 1
        if state == "running_single":
            self.scope_settings.running_state = "paused_single"
            return ScopeAcquisition(frame, state_changed=True)
        return ScopeAcquisition(frame)

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
        signal = DSP_INPUT_VALUES[name]
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
        ["scope", "asg0", "asg1", "hk", "trig", "spectrumanalyzer"]
        + [f"pid{index}" for index in range(3)]
        + [f"iq{index}" for index in range(3)]
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
    if module_name == "trig":
        return list(TRIG_SETUP_ATTRIBUTES)
    if module_name in {"pwm0", "pwm1"}:
        return list(PWM_SETUP_ATTRIBUTES)
    if module_name == "spectrumanalyzer":
        return list(SPECTRUM_SETUP_ATTRIBUTES)
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
        return np.ones(count, dtype=np.float32)
    if name == "hamming":
        return np.hamming(count).astype(np.float32)
    if name == "blackman":
        return np.blackman(count).astype(np.float32)
    if name == "flattop":
        index = np.arange(count, dtype=np.float64)
        phase = 2.0 * np.pi * index / max(1, count - 1)
        window = (
            0.21557895
            - 0.41663158 * np.cos(phase)
            + 0.277263158 * np.cos(2.0 * phase)
            - 0.083578947 * np.cos(3.0 * phase)
            + 0.006947368 * np.cos(4.0 * phase)
        )
        return window.astype(np.float32)
    if name == "gaussian":
        index = np.arange(count, dtype=np.float64)
        center = (count - 1) / 2.0
        sigma = 0.4 * center if center else 1.0
        return np.exp(-0.5 * ((index - center) / sigma) ** 2).astype(np.float32)
    return np.blackman(count).astype(np.float32)


def _spectrum_enbw(name: str) -> float:
    # Equivalent noise bandwidth in bins, matching the browser-visible RBW scale.
    windows = {
        "boxcar": 1.0,
        "hamming": 1.36,
        "blackman": 1.73,
        "flattop": 3.77,
        "gaussian": 1.45,
    }
    return windows.get(name, windows["blackman"])


def _convert_spectrum_power(power: np.ndarray, unit: str) -> np.ndarray:
    safe_power = np.maximum(power.astype(np.float64), 1e-30)
    if unit.startswith("dB("):
        values = 10.0 * np.log10(safe_power)
    elif unit in {"Vpk", "Vrms", "Vrms/sqrt(Hz)"}:
        values = np.sqrt(safe_power)
        if unit.startswith("Vrms"):
            values = values / np.sqrt(2.0)
    elif unit in {"Vrms^2", "Vrms^2/Hz"}:
        values = safe_power / 2.0
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
