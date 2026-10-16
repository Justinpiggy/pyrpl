"""PyRPL-compatible local curve persistence without importing Qt modules."""

from __future__ import annotations

import os
import pickle
import importlib
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
import yaml

from .config import user_dir


class CurveStore:
    """Read and write the standalone PyRPL CurveDB ``.dat`` format."""

    def __init__(self, directory: str | Path | None = None):
        self.directory = Path(directory).expanduser() if directory else user_dir() / "curve"
        self.directory.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        self.backend_name = "pyrpl"

    def list(self, limit: int = 100) -> list[dict[str, Any]]:
        curves = []
        with self._lock:
            for pk in self._all_pks_no_lock()[: max(0, int(limit))]:
                try:
                    record = self._load_no_lock(pk)
                except (OSError, EOFError, pickle.UnpicklingError, TypeError, ValueError):
                    continue
                curves.append(self._summary(record))
        return curves

    def get(self, pk: int) -> dict[str, Any]:
        with self._lock:
            return self._json_record(self._load_no_lock(int(pk)))

    def create(
        self,
        x: list[float],
        y: list[float],
        y_imag: list[float] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        x_values = np.asarray(x, dtype=np.float64)
        y_values = np.asarray(y, dtype=np.float64)
        if y_imag is not None:
            imag_values = np.asarray(y_imag, dtype=np.float64)
            if imag_values.shape != y_values.shape:
                raise ValueError("y and y_imag must have the same length")
            y_values = y_values.astype(np.complex128) + 1j * imag_values
        if x_values.ndim != 1 or y_values.ndim != 1 or x_values.shape != y_values.shape:
            raise ValueError("curve x and y must be one-dimensional arrays with equal length")
        if x_values.size == 0:
            raise ValueError("curve data cannot be empty")
        curve_params = _normalize_params(params or {})
        curve_params.setdefault("name", "new_curve")
        curve_params.setdefault("childs", None)
        with self._lock:
            pks = self._all_pks_no_lock()
            pk = max(pks) + 1 if pks else 1
            record = {"pk": pk, "params": curve_params, "x": x_values, "y": y_values}
            self._save_no_lock(record)
            return self._json_record(record)

    def update_params(self, pk: int, params_yaml: str) -> dict[str, Any]:
        loaded = yaml.safe_load(params_yaml)
        if loaded is None:
            loaded = {}
        if not isinstance(loaded, dict):
            raise ValueError("curve parameters must be a YAML mapping")
        with self._lock:
            record = self._load_no_lock(int(pk))
            record["params"] = _normalize_params(loaded)
            record["params"].setdefault("name", "new_curve")
            record["params"].setdefault("childs", None)
            self._save_no_lock(record)
            return self._json_record(record)

    def delete(self, pk: int) -> None:
        with self._lock:
            self._delete_no_lock(int(pk), set())

    def _delete_no_lock(self, pk: int, visited: set[int]) -> None:
        if pk in visited:
            return
        visited.add(pk)
        record = self._load_no_lock(pk)
        childs = record["params"].get("childs")
        if isinstance(childs, list):
            for child_pk in childs:
                try:
                    self._delete_no_lock(int(child_pk), visited)
                except (OSError, EOFError, pickle.UnpicklingError, TypeError, ValueError):
                    continue
        self._path(pk).unlink(missing_ok=True)
        parent = record["params"].get("parent")
        if parent is not None:
            try:
                parent_record = self._load_no_lock(int(parent))
                parent_childs = parent_record["params"].get("childs") or []
                parent_record["params"]["childs"] = [value for value in parent_childs if int(value) != pk]
                self._save_no_lock(parent_record)
            except (OSError, EOFError, pickle.UnpicklingError, TypeError, ValueError):
                pass

    def _load_no_lock(self, pk: int) -> dict[str, Any]:
        with self._path(pk).open("rb") as handle:
            loaded_pk, params, data = pickle.load(handle)
        if int(loaded_pk) != pk or not isinstance(params, dict) or not isinstance(data, (list, tuple)) or len(data) != 2:
            raise ValueError(f"invalid curve record {pk}")
        x_values = np.asarray(data[0], dtype=np.float64)
        y_values = np.asarray(data[1])
        if x_values.ndim != 1 or y_values.ndim != 1 or x_values.shape != y_values.shape:
            raise ValueError(f"invalid curve data {pk}")
        return {"pk": pk, "params": _normalize_params(params), "x": x_values, "y": y_values}

    def _save_no_lock(self, record: dict[str, Any]) -> None:
        path = self._path(record["pk"])
        temporary = path.with_suffix(path.suffix + ".tmp")
        # CurveDB.get accepts arrays as well as legacy lists. Pickle array buffers
        # directly instead of reducing every complex sample as a Python object.
        payload = [record["pk"], record["params"], [record["x"], record["y"]]]
        with temporary.open("wb") as handle:
            pickle.dump(payload, handle, protocol=pickle.HIGHEST_PROTOCOL)
            handle.flush()
            os.fsync(handle.fileno())
        temporary.replace(path)

    def _all_pks_no_lock(self) -> list[int]:
        pks = []
        for path in self.directory.glob("*.dat"):
            try:
                pks.append(int(path.stem))
            except ValueError:
                continue
        return sorted(pks, reverse=True)

    def _path(self, pk: int) -> Path:
        return self.directory / f"{int(pk)}.dat"

    def _summary(self, record: dict[str, Any]) -> dict[str, Any]:
        return {
            "pk": record["pk"],
            "name": str(record["params"].get("name", "new_curve")),
            "points": int(record["x"].size),
            "complex": bool(np.iscomplexobj(record["y"])),
        }

    def _json_record(self, record: dict[str, Any]) -> dict[str, Any]:
        y_values = np.asarray(record["y"])
        result = {
            **self._summary(record),
            "params": _jsonable(record["params"]),
            "params_yaml": yaml.safe_dump(record["params"], sort_keys=False, default_flow_style=False),
            "x": np.asarray(record["x"], dtype=np.float64).tolist(),
            "y": np.real(y_values).astype(np.float64).tolist(),
        }
        if np.iscomplexobj(y_values):
            result["y_imag"] = np.imag(y_values).astype(np.float64).tolist()
        return result


def _normalize_params(params: dict[str, Any]) -> dict[str, Any]:
    return {str(key): _jsonable(value) for key, value in params.items()}


def _jsonable(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _jsonable(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(item) for item in value]
    if isinstance(value, complex):
        return {"real": value.real, "imag": value.imag}
    if hasattr(value, "item"):
        return _jsonable(value.item())
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


class CustomCurveStore:
    """Adapter for PyRPL's configured third-party ``CurveDB`` class API."""

    def __init__(self, backend: type, module_name: str):
        self.backend = backend
        self.backend_name = module_name
        self._lock = Lock()

    def list(self, limit: int = 100) -> list[dict[str, Any]]:
        with self._lock:
            pks = list(self.backend.all_pks())[: max(0, int(limit))]
            return [_curve_summary(self.backend.get(int(pk))) for pk in pks]

    def get(self, pk: int) -> dict[str, Any]:
        with self._lock:
            return _curve_json_record(self.backend.get(int(pk)))

    def create(
        self,
        x: list[float],
        y: list[float],
        y_imag: list[float] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        x_values, y_values = _curve_arrays(x, y, y_imag)
        curve_params = _normalize_params(params or {})
        curve_params.setdefault("name", "new_curve")
        curve_params.setdefault("childs", None)
        with self._lock:
            curve = self.backend.create(x_values, y_values, **curve_params)
            return _curve_json_record(curve)

    def update_params(self, pk: int, params_yaml: str) -> dict[str, Any]:
        loaded = yaml.safe_load(params_yaml)
        if loaded is None:
            loaded = {}
        if not isinstance(loaded, dict):
            raise ValueError("curve parameters must be a YAML mapping")
        params = _normalize_params(loaded)
        params.setdefault("name", "new_curve")
        params.setdefault("childs", None)
        with self._lock:
            curve = self.backend.get(int(pk))
            curve.params = params
            curve.save()
            return _curve_json_record(curve)

    def delete(self, pk: int) -> None:
        with self._lock:
            self.backend.get(int(pk)).delete()


def configured_curve_store(directory: str | Path | None = None) -> CurveStore | CustomCurveStore:
    """Load the original ``global_config.general.curvedb`` override contract."""

    if directory is not None:
        return CurveStore(directory)
    module_name = _configured_curvedb_module()
    if not module_name or module_name == "pyrpl":
        return CurveStore()
    try:
        module = importlib.import_module(module_name)
        backend = getattr(module, "CurveDB")
    except (ImportError, AttributeError, TypeError):
        return CurveStore()
    return CustomCurveStore(backend, module_name)


def _configured_curvedb_module() -> str | None:
    path = user_dir() / "config" / "global_config.yml"
    if not path.exists():
        return None
    try:
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError):
        return None
    if not isinstance(payload, dict):
        return None
    general = payload.get("general")
    if not isinstance(general, dict):
        return None
    value = general.get("curvedb")
    return str(value).strip() if value else None


def _curve_arrays(
    x: list[float] | np.ndarray,
    y: list[float] | np.ndarray,
    y_imag: list[float] | np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    x_values = np.asarray(x, dtype=np.float64)
    y_values = np.asarray(y, dtype=np.float64)
    if y_imag is not None:
        imag_values = np.asarray(y_imag, dtype=np.float64)
        if imag_values.shape != y_values.shape:
            raise ValueError("y and y_imag must have the same length")
        y_values = y_values.astype(np.complex128) + 1j * imag_values
    if x_values.ndim != 1 or y_values.ndim != 1 or x_values.shape != y_values.shape:
        raise ValueError("curve x and y must be one-dimensional arrays with equal length")
    if x_values.size == 0:
        raise ValueError("curve data cannot be empty")
    return x_values, y_values


def _curve_data(curve: Any) -> tuple[np.ndarray, np.ndarray]:
    data = curve.data
    if isinstance(data, (list, tuple)) and len(data) == 2:
        return np.asarray(data[0], dtype=np.float64), np.asarray(data[1])
    index = getattr(data, "index", None)
    values = getattr(data, "values", None)
    if index is None or values is None:
        raise ValueError("custom CurveDB data must provide (x, y) or index/values")
    return np.asarray(getattr(index, "values", index), dtype=np.float64), np.asarray(values)


def _curve_summary(curve: Any) -> dict[str, Any]:
    x_values, y_values = _curve_data(curve)
    params = getattr(curve, "params", {})
    return {
        "pk": int(curve.pk),
        "name": str(params.get("name", "new_curve")),
        "points": int(x_values.size),
        "complex": bool(np.iscomplexobj(y_values)),
    }


def _curve_json_record(curve: Any) -> dict[str, Any]:
    x_values, y_values = _curve_data(curve)
    params = _normalize_params(dict(getattr(curve, "params", {})))
    result = {
        **_curve_summary(curve),
        "params": _jsonable(params),
        "params_yaml": yaml.safe_dump(params, sort_keys=False, default_flow_style=False),
        "x": np.asarray(x_values, dtype=np.float64).tolist(),
        "y": np.real(y_values).astype(np.float64).tolist(),
    }
    if np.iscomplexobj(y_values):
        result["y_imag"] = np.imag(y_values).astype(np.float64).tolist()
    return result
