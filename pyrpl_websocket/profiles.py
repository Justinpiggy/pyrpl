"""Named, explicit settings snapshots, separate from the autosaved working config."""
from copy import deepcopy
from datetime import datetime, timezone
import json
import re
import tempfile
from uuid import uuid4

from .config import _jsonable
from .modules import set_ams_attribute
from .telemetry import write_ams_dac


class ProfileConflict(ValueError):
    pass


def profile_name(value):
    name = str(value).strip()
    if not name or len(name) > 80 or not name.isprintable():
        raise ValueError("Profile names must contain 1-80 characters without control characters")
    return name


class ProfileManager:
    def __init__(self, session):
        self.session = session

    def _directory(self):
        config = self.session.config
        if config is None or config.path is None:
            raise ProfileConflict("Profiles require a writable YAML configuration")
        return config.path.parent / (config.path.stem + ".profiles")

    def _path(self, profile_id):
        if not re.fullmatch(r"[a-f0-9]{32}", str(profile_id)):
            raise KeyError("Unknown profile")
        return self._directory() / (profile_id + ".json")

    def _read(self, profile_id):
        path = self._path(profile_id)
        if not path.is_file():
            raise KeyError("Unknown profile")
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
            if value["version"] != 1 or value["id"] != profile_id or not isinstance(value["settings"], dict):
                raise ValueError("Invalid profile format")
            profile_name(value["name"])
            return value
        except (KeyError, TypeError, json.JSONDecodeError) as exc:
            raise ValueError("Invalid profile file") from exc

    def _records(self):
        directory = self._directory()
        records = []
        for path in sorted(directory.glob("*.json")):
            records.append(self._read(path.stem))
        return records

    def _unique(self, name, except_id=None):
        if any(record["id"] != except_id and record["name"].casefold() == name.casefold()
               for record in self._records()):
            raise ProfileConflict("A profile with this name already exists")

    def _write(self, record):
        path = self._path(record["id"])
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(".tmp")
        temporary.write_text(json.dumps(_jsonable(record), ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
        temporary.replace(path)

    def _active(self):
        config = self.session.config
        self._directory()
        return {"id": config.data.get("pyrpl_websocket", {}).get("active_profile"),
                "name": config.data.get("pyrpl", {}).get("name", config.path.stem)}

    def _result(self):
        active = self._active()
        web = self.session.config.data.get("pyrpl_websocket", {})
        return {"active": active, "load_revision": web.get("profile_load_revision"),
                "workspace": deepcopy(web.get("workspace")), "plot_views": deepcopy(web.get("plot_views", {})), "profiles": [
            {key: record[key] for key in ("id", "name", "updated_at")} for record in self._records()
        ]}

    def list(self):
        with self.session._lock:
            return self._result()

    def _snapshot(self, workspace=None, plot_views=None):
        session = self.session
        data = deepcopy(session.config.data)
        # Transport identity and clock calibration belong to the board, not profiles.
        data.pop("redpitaya", None)
        for module in session._module_states:
            saved = session.config.module_setup(module)
            data[module] = deepcopy(saved if session.module_owners.get(module) and saved
                                    else session._module_setup_dict(module))
            data[module + "_states"] = deepcopy(session._module_states[module])
            if module in {"scope", "spectrumanalyzer", "networkanalyzer"}:
                data[module]["run_continuous"] = False
        data["ams"] = {key: value for key, value in session._read_ams_no_lock().items() if key in {"dac2", "dac3"}}
        web = data.setdefault("pyrpl_websocket", {})
        web.pop("active_profile", None)
        web.pop("profile_load_revision", None)
        if workspace is not None:
            if not isinstance(workspace, dict):
                raise ValueError("workspace must be an object")
            web["workspace"] = deepcopy(workspace)
        if plot_views is not None:
            if not isinstance(plot_views, dict):
                raise ValueError("plot_views must be an object")
            web["plot_views"] = deepcopy(plot_views)
        return _jsonable(data)

    def save(self, name=None, profile_id=None, workspace=None, plot_views=None):
        with self.session._lock:
            if profile_id is None:
                name = profile_name(name)
                self._unique(name)
                profile_id = uuid4().hex
            else:
                name = self._read(profile_id)["name"]
            record = {"version": 1, "id": profile_id, "name": name,
                      "updated_at": datetime.now(timezone.utc).isoformat(),
                      "settings": self._snapshot(workspace, plot_views)}
            record["settings"].setdefault("pyrpl", {})["name"] = name
            self._write(record)
            data = deepcopy(self.session.config.data)
            data.setdefault("pyrpl", {})["name"] = name
            data.setdefault("pyrpl_websocket", {})["active_profile"] = profile_id
            self.session.config.replace_data(data)
            return self._result()

    def rename(self, profile_id, name):
        with self.session._lock:
            name = profile_name(name)
            self._unique(name, profile_id)
            record = self._read(profile_id)
            record["name"] = name
            record["settings"].setdefault("pyrpl", {})["name"] = name
            record["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._write(record)
            if self._active()["id"] == profile_id:
                data = deepcopy(self.session.config.data)
                data.setdefault("pyrpl", {})["name"] = name
                self.session.config.replace_data(data)
            return self._result()

    def export(self, profile_id):
        with self.session._lock:
            return deepcopy(self._read(profile_id))

    def import_profile(self, profile, name=None):
        with self.session._lock:
            if not isinstance(profile, dict) or profile.get("version") != 1:
                raise ValueError("Expected a version 1 PyRPL profile JSON file")
            name = profile_name(name if name is not None else profile.get("name", ""))
            self._unique(name)
            data = deepcopy(profile.get("settings"))
            self._validate(data)
            # Only settings travel between instruments, never connection identity.
            allowed = {"pyrpl", "pyrpl_websocket", "ams"}
            allowed.update(self.session._module_states)
            allowed.update(module + "_states" for module in self.session._module_states)
            data = {key: value for key, value in data.items() if key in allowed}
            data.setdefault("pyrpl", {})["name"] = name
            web = data.setdefault("pyrpl_websocket", {})
            web.pop("active_profile", None)
            web.pop("profile_load_revision", None)
            for module in ("scope", "spectrumanalyzer", "networkanalyzer"):
                data[module]["run_continuous"] = False
            record = {"version": 1, "id": uuid4().hex, "name": name,
                      "updated_at": datetime.now(timezone.utc).isoformat(), "settings": data}
            self._write(record)
            return {**self._result(), "imported_id": record["id"]}

    def _validate(self, data):
        from .session import WebSession
        from .settings import ServerSettings
        if not isinstance(data, dict):
            raise ValueError("Profile settings must be an object")
        for module in self.session._module_states:
            if not isinstance(data.get(module), dict):
                raise ValueError("Missing or invalid settings for " + module)
            states = data.get(module + "_states", {})
            if not isinstance(states, dict) or any(not isinstance(value, dict) for value in states.values()):
                raise ValueError("Invalid saved setups for " + module)
        for key in ("pyrpl", "pyrpl_websocket", "ams"):
            if not isinstance(data.get(key, {}), dict):
                raise ValueError("Invalid settings for " + key)
        web = data.get("pyrpl_websocket", {})
        for key in ("workspace", "plot_views"):
            if web.get(key) is not None and not isinstance(web[key], dict):
                raise ValueError(key + " must be an object")
        json.dumps(data, allow_nan=False)
        # Exercise the real setters against a fake FPGA, never the live board.
        with tempfile.TemporaryDirectory(prefix="pyrpl-profile-check-") as directory:
            candidate = WebSession(ServerSettings(hostname="_FAKE_", curve_dir=directory))
            try:
                candidate.curves = self.session.curves
                with candidate._lock:
                    self._apply(candidate, data)
            except (KeyError, AttributeError) as exc:
                raise ValueError("Invalid or unsupported profile settings: " + str(exc)) from exc
            finally:
                candidate.close()

    def _apply(self, session, data):
        # Caller holds the session lock. Disable restoring old reservations while
        # releasing them, then apply one coherent set of settings.
        config = session.config
        session.config = None
        try:
            session._call_lockbox_action_no_lock("unlock")
            session._call_spectrum_action_no_lock("stop")
            session._call_network_analyzer_action_no_lock("stop")
            session._release_lockbox_resources_no_lock()
            session._restore_lockbox_setup_no_lock(deepcopy(data["lockbox"]))
            # Custom runtimes may reserve resources during initialization.
            session._release_lockbox_resources_no_lock()
            for module in session._module_states:
                if module == "lockbox":
                    continue
                setup = deepcopy(data[module])
                if module in {"scope", "spectrumanalyzer", "networkanalyzer"}:
                    setup["run_continuous"] = False
                session._apply_module_setup_no_lock(module, setup)
            for attribute, value in data.get("ams", {}).items():
                normalized = set_ams_attribute(session.ams_settings, attribute, value)
                write_ams_dac(session.client, attribute, normalized)
            session._module_states = {module: deepcopy(data.get(module + "_states", {}))
                                      for module in session._module_states}
        finally:
            session.config = config

    def load(self, profile_id):
        with self.session._lock:
            record = self._read(profile_id)
            data = deepcopy(record["settings"])
            self._validate(data)
            previous = self._snapshot()
            old_config = deepcopy(self.session.config.data)
            try:
                self._apply(self.session, data)
                data["redpitaya"] = old_config.get("redpitaya", {})
                data.setdefault("pyrpl", {})["name"] = record["name"]
                data.setdefault("pyrpl_websocket", {})["active_profile"] = profile_id
                data["pyrpl_websocket"]["profile_load_revision"] = uuid4().hex
                self.session.config.replace_data(data)
            except Exception:
                self._apply(self.session, previous)
                self.session.config.replace_data(old_config)
                raise
            result = self._result()
            result["workspace"] = deepcopy(data.get("pyrpl_websocket", {}).get("workspace"))
            result["plot_views"] = deepcopy(data.get("pyrpl_websocket", {}).get("plot_views", {}))
            return result
