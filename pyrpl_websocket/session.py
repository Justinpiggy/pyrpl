"""Connection/session management for the web server."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from threading import Lock

import numpy as np

from .monitor_client import DummyClient, MonitorClient
from .modules import (
    SCOPE_SETUP_ATTRIBUTES,
    ScopeSettings,
    module_list,
    scope_actions,
    scope_attribute_schema,
    set_scope_attribute,
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
        }

    def modules(self) -> list[dict]:
        return module_list()

    def module_attributes(self, module_name: str) -> list[dict]:
        if module_name != "scope":
            raise KeyError(module_name)
        return scope_attribute_schema(self.scope_settings)

    def module_state(self, module_name: str) -> dict:
        if module_name != "scope":
            raise KeyError(module_name)
        return self.scope_settings.as_dict()

    def module_actions(self, module_name: str) -> list[dict]:
        if module_name != "scope":
            raise KeyError(module_name)
        return scope_actions()

    def get_module_attribute(self, module_name: str, attribute: str):
        state = self.module_state(module_name)
        if attribute not in state:
            raise KeyError(attribute)
        return state[attribute]

    def set_module_attribute(self, module_name: str, attribute: str, value):
        if module_name != "scope":
            raise KeyError(module_name)
        with self._lock:
            normalized = set_scope_attribute(self.scope_settings, attribute, value)
            sync_scope_setting(self.client, self.scope_settings, attribute)
            self._hardware_rolling_started = False
            return normalized

    def call_module_action(self, module_name: str, action: str) -> dict:
        if module_name != "scope":
            raise KeyError(module_name)
        with self._lock:
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
        if module_name != "scope":
            raise KeyError(module_name)
        with self._lock:
            return [
                {"name": name, "state": dict(state)}
                for name, state in sorted(self._module_states[module_name].items())
            ]

    def save_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name != "scope":
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = {
                attribute: getattr(self.scope_settings, attribute)
                for attribute in SCOPE_SETUP_ATTRIBUTES
            }
            self._module_states[module_name][state_name] = dict(state)
            self._persist_saved_states()
            return {"name": state_name, "state": state}

    def load_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name != "scope":
            raise KeyError(module_name)
        state_name = _normalize_state_name(state_name)
        with self._lock:
            state = self._module_states[module_name][state_name]
            for attribute, value in state.items():
                set_scope_attribute(self.scope_settings, attribute, value)
            sync_scope_settings(self.client, self.scope_settings)
            self._hardware_rolling_started = False
            self.scope_settings.last_action = f"load_state:{state_name}"
            return self.scope_settings.as_dict()

    def delete_module_state(self, module_name: str, state_name: str) -> dict:
        if module_name != "scope":
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
            return {"scope": {}}
        path = Path(self.settings.state_file)
        if not path.exists():
            return {"scope": {}}
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {"scope": {}}
        scope_states = payload.get("scope", {}) if isinstance(payload, dict) else {}
        if not isinstance(scope_states, dict):
            return {"scope": {}}
        return {
            "scope": {
                str(name): dict(state)
                for name, state in scope_states.items()
                if isinstance(state, dict)
            }
        }

    def _persist_saved_states(self) -> None:
        if not self.settings.state_file:
            return
        path = Path(self.settings.state_file)
        if path.parent != Path("."):
            path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self._module_states, indent=2, sort_keys=True), encoding="utf-8")

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
