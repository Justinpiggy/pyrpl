"""PyRPL-compatible YAML configuration support for the web server."""

from __future__ import annotations

import os
from copy import deepcopy
from pathlib import Path
from typing import Any

import yaml


DEFAULT_CONFIG_NAME = "pyrpl-websocket"
DEFAULT_PYRPL_CONFIG = {
    "name": DEFAULT_CONFIG_NAME,
    "loglevel": "info",
    "background_color": "",
    "modules": [
        "NetworkAnalyzer",
        "SpectrumAnalyzer",
        "CurveViewer",
        "PyrplConfig",
        "Lockbox",
    ],
}


def user_dir() -> Path:
    return Path(os.environ.get("PYRPL_USER_DIR", Path.home() / "pyrpl_user_dir")).expanduser()


def user_config_dir() -> Path:
    return user_dir() / "config"


def resolve_config_file(config: str | None = None, source: str | None = None) -> Path | None:
    """Resolve a PyRPL-style config name to a local user config YAML path."""

    if config is None or config == "":
        config = DEFAULT_CONFIG_NAME
    path = _candidate_config_path(config)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
    except OSError:
        return None
    if path.exists():
        return path
    if source:
        source_path = _candidate_config_path(source)
        if source_path.exists():
            try:
                path.write_text(source_path.read_text(encoding="utf-8"), encoding="utf-8")
            except OSError:
                return None
            return path
    try:
        path.write_text("", encoding="utf-8")
    except OSError:
        return None
    return path


class WebConfig:
    """Small YAML config wrapper following PyRPL's root-branch layout."""

    def __init__(self, config: str | None = None, source: str | None = None):
        self.path = resolve_config_file(config, source)
        self.data = self._load()
        self._ensure_defaults()
        self.save()

    def module_setup(self, module_name: str) -> dict[str, Any]:
        branch = self.data.get(module_name, {})
        return dict(branch) if isinstance(branch, dict) else {}

    def set_module_setup(self, module_name: str, state: dict[str, Any]) -> None:
        self.data[module_name] = _jsonable(state)
        self.save()

    def module_states(self, module_name: str) -> dict[str, dict[str, Any]]:
        branch = self.data.get(_states_branch(module_name), {})
        if not isinstance(branch, dict):
            return {}
        return {
            str(name): dict(state)
            for name, state in branch.items()
            if isinstance(state, dict)
        }

    def set_module_states(self, module_name: str, states: dict[str, dict[str, Any]]) -> None:
        self.data[_states_branch(module_name)] = _jsonable(states)
        self.save()

    def workspace(self) -> dict[str, Any] | None:
        web_branch = self.data.get("pyrpl_websocket", {})
        if not isinstance(web_branch, dict):
            return None
        workspace = web_branch.get("workspace")
        return dict(workspace) if isinstance(workspace, dict) else None

    def set_workspace(self, workspace: dict[str, Any]) -> dict[str, Any]:
        web_branch = self.data.setdefault("pyrpl_websocket", {})
        if not isinstance(web_branch, dict):
            web_branch = {}
            self.data["pyrpl_websocket"] = web_branch
        web_branch["workspace"] = _jsonable(workspace)
        self.save()
        return dict(web_branch["workspace"])

    def _load(self) -> dict[str, Any]:
        if self.path is None or not self.path.exists():
            return {}
        try:
            loaded = yaml.safe_load(self.path.read_text(encoding="utf-8"))
        except yaml.YAMLError:
            return {}
        return loaded if isinstance(loaded, dict) else {}

    def _ensure_defaults(self) -> None:
        pyrpl_branch = self.data.setdefault("pyrpl", {})
        if not isinstance(pyrpl_branch, dict):
            pyrpl_branch = {}
            self.data["pyrpl"] = pyrpl_branch
        for key, value in DEFAULT_PYRPL_CONFIG.items():
            if key == "name" and self.path is not None:
                pyrpl_branch.setdefault(key, self.path.stem)
            else:
                pyrpl_branch.setdefault(key, deepcopy(value))
        self.data.setdefault("redpitaya", {})

    def save(self) -> None:
        if self.path is None:
            return
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp_path = self.path.with_suffix(self.path.suffix + ".tmp")
            text = yaml.safe_dump(self.data, sort_keys=False, default_flow_style=False)
            tmp_path.write_text(text, encoding="utf-8")
            tmp_path.replace(self.path)
        except OSError:
            self.path = None


def _candidate_config_path(config: str) -> Path:
    path = Path(config).expanduser()
    if path.suffix != ".yml":
        path = path.with_suffix(".yml")
    if path.parent != Path("."):
        return path
    return user_config_dir() / path.name


def _states_branch(module_name: str) -> str:
    return f"{module_name}_states"


def _jsonable(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _jsonable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(item) for item in value]
    if hasattr(value, "item"):
        return value.item()
    return value
