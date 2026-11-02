"""Qt-free lockbox metadata and state for the web migration.

The original PyRPL lockbox GUI is dynamic: model classes define inputs,
outputs, stages, and controls through Python class attributes and descriptor
objects. This module reads those declarations from source files and turns them
into a JSON-friendly schema without importing Qt/PyQt.
"""

from __future__ import annotations

import ast
import os
from itertools import count
from uuid import uuid4
from collections import OrderedDict
from dataclasses import asdict, dataclass, field
from math import pi
from pathlib import Path
from typing import Any, Callable

import numpy as np

from .modules import SCOPE_INPUTS

# HTTP responses and worker-thread events can arrive out of order. The epoch
# also lets an already-open browser accept snapshots after a server restart.
_SCHEMA_EPOCH = uuid4().hex
_SCHEMA_REVISIONS = count(1)


ASG_WAVEFORMS = ["sin", "cos", "ramp", "halframp", "square", "dc", "noise"]
DSP_OUTPUTS = ["off", "out1", "out2", "pwm0", "pwm1"]
PID_NAMES = ["pid0", "pid1", "pid2"]


@dataclass
class PropertySpec:
    name: str
    kind: str
    default: Any = None
    options: list[Any] | None = None
    minimum: float | None = None
    maximum: float | None = None
    step: float | None = None
    doc: str = ""
    source_type: str = ""

    def control(self, value: Any, context: "LockboxState | None" = None) -> dict[str, Any]:
        options = self.dynamic_options(context)
        control_type = self.kind
        if control_type == "filter":
            control_type = "text"
        result: dict[str, Any] = {
            "name": self.name,
            "label": _label_from_name(self.name),
            "type": control_type,
            "value": _json_value(value),
        }
        if options is not None:
            result["options"] = options
        if self.minimum is not None:
            result["min"] = self.minimum
        if self.maximum is not None:
            result["max"] = self.maximum
        if self.step is not None:
            result["step"] = self.step
        if self.source_type:
            result["source_type"] = self.source_type
        if self.doc:
            result["description"] = self.doc
        return result

    def dynamic_options(self, context: "LockboxState | None" = None) -> list[Any] | None:
        if self.name == "classname" and context is not None:
            return list(context.library.lockbox_specs)
        if self.name == "default_sweep_output" and context is not None:
            return list(context.outputs)
        if self.name == "unit" and context is not None:
            return [f"{unit}/V" for unit in context.output_units]
        if self.name == "input" and context is not None:
            return list(context.inputs)
        if self.name == "function_call" and context is not None:
            return ["", *context.function_calls]
        if self.name == "input_signal" and context is not None:
            logical_outputs = [f"lockbox.outputs.{name}" for name in context.outputs]
            return [*SCOPE_INPUTS, *logical_outputs]
        if self.name == "output_channel":
            return DSP_OUTPUTS
        if self.name == "pid":
            return PID_NAMES
        if self.name == "mod_output":
            return ["out1", "out2"]
        if self.name == "sweep_waveform":
            return ASG_WAVEFORMS
        return self.options


@dataclass
class ClassInfo:
    name: str
    bases: list[str]
    source: str
    lineno: int
    raw_gui_attributes: ast.AST | None = None
    raw_setup_attributes: ast.AST | None = None
    module_dicts: dict[str, dict[str, str]] = field(default_factory=dict)
    properties: dict[str, PropertySpec] = field(default_factory=dict)
    class_values: dict[str, Any] = field(default_factory=dict)
    functions: list[str] = field(default_factory=list)


@dataclass
class LockboxClassSpec:
    name: str
    source: str
    gui_attributes: list[str]
    properties: dict[str, PropertySpec]
    inputs: OrderedDict[str, str]
    outputs: OrderedDict[str, str]
    setpoint_units: list[str]
    output_units: list[str]
    function_calls: list[str]
    action_methods: list[str]
    default_is_locked_input: str | None = None
    description: str = ""


class LockboxSchemaLibrary:
    """Source-based schema mirror of PyRPL's lockbox class declarations."""

    def __init__(self, root: Path | None = None, user_lockbox_dir: Path | None = None):
        self.root = root or Path(__file__).resolve().parents[1]
        self.user_lockbox_dir = user_lockbox_dir or _default_user_lockbox_dir()
        self.classes: dict[str, ClassInfo] = {}
        self._gui_cache: dict[str, list[str]] = {}
        self._setup_cache: dict[str, list[str]] = {}
        self._mro_cache: dict[str, list[str]] = {}
        self._discover()
        self.lockbox_specs = self._build_lockbox_specs()

    def class_list(self) -> list[dict[str, str]]:
        return [
            {"name": name, "description": spec.description, "source": spec.source}
            for name, spec in self.lockbox_specs.items()
        ]

    def _discover(self) -> None:
        lockbox_dir = self.root / "pyrpl" / "software_modules" / "lockbox"
        files = [
            lockbox_dir / "input.py",
            lockbox_dir / "output.py",
            lockbox_dir / "stage.py",
            lockbox_dir / "lockbox.py",
            lockbox_dir / "models" / "interferometer.py",
            lockbox_dir / "models" / "fabryperot.py",
            lockbox_dir / "models" / "linear.py",
            lockbox_dir / "models" / "custom_lockbox_example.py",
            lockbox_dir / "models" / "pll.py",
        ]
        if self.user_lockbox_dir.is_dir():
            files.extend(
                path
                for path in sorted(self.user_lockbox_dir.iterdir())
                if path.suffix == ".py" and path.name != "__init__.py"
            )
        for path in files:
            if path.exists():
                self._parse_file(path)

    def _parse_file(self, path: Path) -> None:
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        except (OSError, SyntaxError):
            return
        for node in tree.body:
            if isinstance(node, ast.ClassDef):
                self.classes[node.name] = self._parse_class(node, path)

    def _parse_class(self, node: ast.ClassDef, path: Path) -> ClassInfo:
        info = ClassInfo(
            name=node.name,
            bases=[_name_from_expr(base) for base in node.bases if _name_from_expr(base)],
            source=str(path),
            lineno=node.lineno,
        )
        local_values: dict[str, Any] = {}
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                info.functions.append(item.name)
                continue
            if not isinstance(item, ast.Assign):
                continue
            targets = [target.id for target in item.targets if isinstance(target, ast.Name)]
            if not targets:
                continue
            target = targets[0]
            value = item.value
            if target == "_gui_attributes":
                info.raw_gui_attributes = value
                local_values[target] = self._eval_expr(value, info.name, local_values)
            elif target == "_setup_attributes":
                info.raw_setup_attributes = value
                local_values[target] = self._eval_expr(value, info.name, local_values)
            elif target in {"inputs", "outputs"} and _call_name(value) == "LockboxModuleDictProperty":
                info.module_dicts[target] = _module_dict_from_call(value)
            elif target in {"_output_units", "_units"}:
                resolved = self._eval_expr(value, info.name, local_values)
                if isinstance(resolved, list):
                    info.class_values[target] = resolved
                    local_values[target] = resolved
            elif target == "_default_is_locked_input":
                resolved = self._eval_expr(value, info.name, local_values)
                if resolved is None or isinstance(resolved, str):
                    info.class_values[target] = resolved
                    local_values[target] = resolved
            elif isinstance(value, ast.Call):
                prop = self._property_from_call(target, value)
                if prop is not None:
                    info.properties[target] = prop
        return info

    def _property_from_call(self, name: str, call: ast.Call) -> PropertySpec | None:
        source_type = _call_name(call)
        if not source_type or not (
            source_type.endswith("Property")
            or source_type.endswith("Attribute")
            or source_type in {"InputSelectProperty", "StageInputSelectProperty"}
        ):
            return None

        options = _call_options(call)
        default = _keyword_value(call, "default")
        minimum = _keyword_number(call, "min")
        maximum = _keyword_number(call, "max")
        step = _keyword_number(call, "increment")
        doc = _keyword_value(call, "doc")
        if source_type in {"SelectProperty", "InputSelectProperty", "StageInputSelectProperty"}:
            kind = "select"
        elif source_type == "BoolProperty":
            kind = "bool"
        elif source_type == "BoolIgnoreProperty":
            kind = "select"
            options = ["ignore", False, True]
            if default is None:
                default = False
        elif source_type in {"StringProperty"}:
            kind = "text"
        elif source_type.endswith("FilterProperty") or source_type in {"FilterProperty", "AdditionalFilterAttribute"}:
            kind = "filter"
            if default is None:
                default = "0, 0"
        elif source_type in {"IntProperty"}:
            kind = "number"
            if default is None:
                default = 0
        elif source_type in {
            "FloatProperty",
            "FrequencyProperty",
            "PhaseProperty",
            "IqQuadratureFactorProperty",
            "SlowOutputProperty",
        }:
            kind = "number"
        else:
            kind = "number" if isinstance(default, (int, float)) or _looks_numeric_property(source_type) else "text"

        if default is None:
            if options:
                default = options[0]
            elif kind == "bool":
                default = False
            elif kind == "number":
                default = 0.0
            else:
                default = ""
        return PropertySpec(
            name=name,
            kind=kind,
            default=default,
            options=options,
            minimum=minimum,
            maximum=maximum,
            step=step,
            doc=str(doc or ""),
            source_type=source_type,
        )

    def _build_lockbox_specs(self) -> OrderedDict[str, LockboxClassSpec]:
        specs: OrderedDict[str, LockboxClassSpec] = OrderedDict()
        for name in self.classes:
            if name == "Lockbox" or self.is_subclass(name, "Lockbox"):
                gui_attributes = self.resolve_gui_attributes(name)
                properties = self.resolve_properties(name)
                inputs = OrderedDict(self.resolve_module_dict(name, "inputs") or {})
                outputs = OrderedDict(self.resolve_module_dict(name, "outputs") or {})
                setpoint_spec = properties.get("setpoint_unit")
                setpoint_units = list(setpoint_spec.options or ["V"]) if setpoint_spec else ["V"]
                output_units = self.resolve_class_list(name, "_output_units")
                if not output_units:
                    output_units = self.resolve_class_list(name, "_units")
                if not output_units:
                    output_units = ["V", "mV"]
                functions = [
                    fn
                    for fn in self.resolve_functions(name)
                    if not fn.startswith("_") and fn not in _BASE_LOCKBOX_FUNCTIONS
                ]
                action_methods = [
                    function
                    for function in functions
                    if function in gui_attributes and function not in properties
                ]
                description = _first_doc_sentence(self.classes[name].source, name)
                specs[name] = LockboxClassSpec(
                    name=name,
                    source=self.classes[name].source,
                    gui_attributes=gui_attributes,
                    properties=properties,
                    inputs=inputs,
                    outputs=outputs,
                    setpoint_units=setpoint_units,
                    output_units=output_units,
                    function_calls=functions,
                    action_methods=action_methods,
                    default_is_locked_input=self.resolve_class_value(
                        name,
                        "_default_is_locked_input",
                    ),
                    description=description,
                )
        preferred = ["Lockbox", "Linear", "Interferometer", "PdhInterferometer", "FabryPerot", "HighFinesseFabryPerot", "Pll"]
        ordered: OrderedDict[str, LockboxClassSpec] = OrderedDict()
        for name in preferred:
            if name in specs:
                ordered[name] = specs.pop(name)
        for name in sorted(specs):
            ordered[name] = specs[name]
        return ordered

    def resolve_gui_attributes(self, class_name: str) -> list[str]:
        if class_name in self._gui_cache:
            return self._gui_cache[class_name]
        info = self.classes.get(class_name)
        if info is None:
            return []
        attrs: list[str] = []
        for base in reversed(info.bases):
            attrs.extend(self.resolve_gui_attributes(base))
        if info.raw_gui_attributes is not None:
            value = self._eval_expr(info.raw_gui_attributes, class_name, {})
            if isinstance(value, list):
                attrs.extend(str(item) for item in value)
        self._gui_cache[class_name] = _unique(attrs)
        return self._gui_cache[class_name]

    def resolve_setup_attributes(self, class_name: str) -> list[str]:
        if class_name in self._setup_cache:
            return self._setup_cache[class_name]
        info = self.classes.get(class_name)
        if info is None:
            return []
        attrs: list[str] = []
        for base in reversed(info.bases):
            attrs.extend(self.resolve_setup_attributes(base))
        if info.raw_setup_attributes is not None:
            value = self._eval_expr(info.raw_setup_attributes, class_name, {"_gui_attributes": self.resolve_gui_attributes(class_name)})
            if isinstance(value, list):
                attrs.extend(str(item) for item in value)
        self._setup_cache[class_name] = _unique(attrs)
        return self._setup_cache[class_name]

    def resolve_mro(self, class_name: str) -> list[str]:
        if class_name in self._mro_cache:
            return self._mro_cache[class_name]
        info = self.classes.get(class_name)
        if info is None:
            return []
        mro = [class_name]
        for base in info.bases:
            mro.extend(self.resolve_mro(base) or [base])
        self._mro_cache[class_name] = _unique(mro)
        return self._mro_cache[class_name]

    def resolve_properties(self, class_name: str) -> dict[str, PropertySpec]:
        properties: dict[str, PropertySpec] = {}
        for name in reversed(self.resolve_mro(class_name)):
            info = self.classes.get(name)
            if info is not None:
                properties.update(info.properties)
        return properties

    def resolve_module_dict(self, class_name: str, name: str) -> dict[str, str]:
        for candidate in self.resolve_mro(class_name):
            info = self.classes.get(candidate)
            if info is not None and name in info.module_dicts:
                return info.module_dicts[name]
        return {}

    def resolve_class_list(self, class_name: str, attr: str) -> list[str]:
        for candidate in self.resolve_mro(class_name):
            info = self.classes.get(candidate)
            if info is not None and attr in info.class_values:
                return [str(item) for item in info.class_values[attr]]
        return []

    def resolve_class_value(self, class_name: str, attr: str) -> Any:
        for candidate in self.resolve_mro(class_name):
            info = self.classes.get(candidate)
            if info is not None and attr in info.class_values:
                return info.class_values[attr]
        return None

    def resolve_functions(self, class_name: str) -> list[str]:
        functions: list[str] = []
        for candidate in reversed(self.resolve_mro(class_name)):
            info = self.classes.get(candidate)
            if info is not None:
                functions.extend(info.functions)
        return _unique(functions)

    def is_subclass(self, class_name: str, base_name: str) -> bool:
        info = self.classes.get(class_name)
        if info is None:
            return False
        if base_name in info.bases:
            return True
        return any(self.is_subclass(base, base_name) for base in info.bases)

    def _eval_expr(self, expr: ast.AST, class_name: str, local_values: dict[str, Any]) -> Any:
        if isinstance(expr, ast.List | ast.Tuple):
            return [self._eval_expr(item, class_name, local_values) for item in expr.elts]
        if isinstance(expr, ast.Constant):
            return expr.value
        if isinstance(expr, ast.Name):
            if expr.id in local_values:
                return local_values[expr.id]
            return None
        if isinstance(expr, ast.Attribute) and isinstance(expr.value, ast.Name):
            owner = expr.value.id
            if expr.attr == "_gui_attributes":
                return self.resolve_gui_attributes(owner)
            if expr.attr == "_setup_attributes":
                return self.resolve_setup_attributes(owner)
            return None
        if isinstance(expr, ast.BinOp) and isinstance(expr.op, ast.Add):
            left = self._eval_expr(expr.left, class_name, local_values) or []
            right = self._eval_expr(expr.right, class_name, local_values) or []
            if isinstance(left, list) and isinstance(right, list):
                return [*left, *right]
        return None


@dataclass
class LockboxCalibration:
    min: float = -1.0
    max: float = 1.0
    mean: float = 0.0
    rms: float = 0.0
    analog_offset: float = 0.0
    asg_phase: float = 0.0
    amplitude: float = 1.0
    offset: float = 0.0

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


class DynamicModuleValues:
    def __init__(self, values: dict[str, Any]):
        object.__setattr__(self, "values", values)

    def __getattr__(self, name: str) -> Any:
        if name in self.values:
            return self.values[name]
        raise AttributeError(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name == "values":
            object.__setattr__(self, name, value)
        elif "values" in self.__dict__ and name in self.values:
            self.values[name] = value
        else:
            object.__setattr__(self, name, value)


class LockboxInput(DynamicModuleValues):
    def __init__(
        self,
        name: str,
        class_name: str,
        attr_specs: list[PropertySpec],
        *,
        is_iq: bool = False,
        iq_module: str | None = None,
    ):
        self.name = name
        self.class_name = class_name
        self.kind = _infer_input_kind(class_name)
        self.attr_specs = attr_specs
        self.is_iq = is_iq
        self.iq_module = iq_module
        self.calibration = LockboxCalibration()
        super().__init__({spec.name: _copy_default(spec.default) for spec in attr_specs})
        if not self.values.get("input_signal"):
            self.values["input_signal"] = "in1"
        if self.is_iq:
            self.values.setdefault("mod_freq", 0.0)
            self.values.setdefault("mod_amp", 0.0)
            self.values.setdefault("mod_phase", 0.0)
            self.values.setdefault("mod_output", "out1")
            self.values.setdefault("quadrature_factor", 1.0)

    @property
    def input_signal(self) -> str:
        return str(self.values.get("input_signal", "in1"))

    @input_signal.setter
    def input_signal(self, value: str) -> None:
        self.values["input_signal"] = value

    def as_dict(self, context: "LockboxState") -> dict[str, Any]:
        return {
            "name": self.name,
            "kind": self.kind,
            "class_name": self.class_name,
            "iq_module": self.iq_module,
            "attributes": [spec.control(self.values.get(spec.name, spec.default), context) for spec in self.attr_specs],
            "calibration": self.calibration.as_dict(),
        }


class LockboxOutput(DynamicModuleValues):
    def __init__(self, name: str, class_name: str, attr_specs: list[PropertySpec], index: int):
        self.name = name
        self.class_name = class_name
        self.kind = _infer_output_kind(class_name)
        self.attr_specs = attr_specs
        self.current_state = "unlock"
        super().__init__({spec.name: _copy_default(spec.default) for spec in attr_specs})
        self.values.setdefault("output_channel", "out1" if index == 0 else "out2")
        self.values.setdefault("pid", f"pid{min(index, 2)}")
        self.values.setdefault("tf_type", "filter")
        self.values.setdefault("unit", "V/V")
        self.values.setdefault("dc_gain", 1.0)
        if not self.values.get("dc_gain"):
            self.values["dc_gain"] = 1.0
        self.values.setdefault("max_voltage", 1.0)
        self.values.setdefault("min_voltage", -1.0)
        self.values.setdefault("sweep_amplitude", 1.0)
        self.values.setdefault("sweep_offset", 0.0)
        self.values.setdefault("sweep_frequency", 50.0)
        self.values.setdefault("sweep_waveform", "ramp")

    def as_dict(self, context: "LockboxState") -> dict[str, Any]:
        return {
            "name": self.name,
            "kind": self.kind,
            "class_name": self.class_name,
            "state": {"current_state": self.current_state},
            "attributes": [spec.control(self.values.get(spec.name, spec.default), context) for spec in self.attr_specs],
        }


@dataclass
class LockboxStageOutput:
    lock_on: bool | str = False
    reset_offset: bool = False
    offset: float = 0.0

    def as_dict(self, output_name: str) -> dict[str, Any]:
        return {
            "output": output_name,
            "attributes": [
                _select("lock_on", "Lock", self.lock_on, ["ignore", False, True]),
                _boolean("reset_offset", "Reset Offset", self.reset_offset),
                _number("offset", "Offset", self.offset, -1.0, 1.0, 0.0001),
            ],
        }


@dataclass
class LockboxStage:
    name: str
    input: str
    setpoint: float = 0.0
    duration: float = 0.0
    gain_factor: float = 1.0
    function_call: str = ""
    outputs: dict[str, LockboxStageOutput] = field(default_factory=dict)

    def as_dict(self, context: "LockboxState") -> dict[str, Any]:
        return {
            "name": self.name,
            "attributes": [
                _select("input", "Input", self.input, list(context.inputs)),
                _number("setpoint", "Setpoint", self.setpoint, -1.0e6, 1.0e6, 0.1),
                _number("duration", "Duration", self.duration, 0.0, 1.0e6, 0.1),
                _number("gain_factor", "Gain Factor", self.gain_factor, -1.0e6, 1.0e6, 0.1),
                _select("function_call", "Function", self.function_call, ["", *context.function_calls]),
            ],
            "outputs": [output.as_dict(name) for name, output in self.outputs.items()],
        }


class UnitConversion:
    # Conversion factors used by the built-in interferometer/cavity models.
    _rad_in_deg = 180.0 / np.pi

    @property
    def _deg_in_m(self):
        return self.wavelength / 720.0

    @property
    def _rad_in_m(self):
        return self._rad_in_deg * self._deg_in_m

    @property
    def _linewidth_in_m(self):
        return self.wavelength / self.finesse / 2.0

    @property
    def _linewidth_in_Hz(self):
        return 2.998e8 / self.round_trip_length / self.finesse

    @property
    def _bandwidth_in_m(self):
        return self._linewidth_in_m / 2.0

    @property
    def _bandwidth_in_Hz(self):
        return self._linewidth_in_Hz / 2.0

    def _unit1_in_unit2(self, unit1, unit2, try_prefix=True):
        """helper function to convert unit2 to unit 1"""
        if unit1 == unit2:
            return 1.0
        try:
            return getattr(self, "_" + unit1 + "_in_" + unit2)
        except AttributeError:
            try:
                return 1.0 / getattr(self, "_" + unit2 + "_in_" + unit1)
            except AttributeError:
                if not try_prefix:
                    raise
        # did not find the unit. Try scaling of unit1
        _unit_prefixes = dict(
            [
                (
                    "",
                    1.0,
                ),
                ("m", 1e-3),
                ("u", 1e-6),
                ("n", 1e-9),
                ("p", 1e-12),
                ("k", 1e3),
                ("M", 1e6),
                ("G", 1e9),
                ("T", 1e12),
            ]
        )
        for prefix2 in _unit_prefixes:
            if unit2.startswith(prefix2) and len(unit2) > len(prefix2):
                for prefix1 in _unit_prefixes:
                    if unit1.startswith(prefix1) and len(unit1) > len(prefix1):
                        try:
                            return (
                                self._unit1_in_unit2(
                                    unit1[len(prefix1) :],
                                    unit2[len(prefix2) :],
                                    try_prefix=False,
                                )
                                * _unit_prefixes[prefix1]
                                / _unit_prefixes[prefix2]
                            )
                        except AttributeError:
                            pass
        raise AttributeError(
            "Could not find attribute %s in Lockbox class. " % (unit1 + "_in_" + unit2)
        )

    def _unit_in_setpoint_unit(self, unit):
        # helper function to convert unit into setpoint_unit
        return self._unit1_in_unit2(unit, self.setpoint_unit)

    def _setpoint_unit_in_unit(self, unit):
        # helper function to convert setpoint_unit into unit
        return self._unit1_in_unit2(self.setpoint_unit, unit)


class LockboxState(UnitConversion):
    """Minimal lockbox model generated from PyRPL lockbox class metadata."""

    def __init__(self, classname: str = "Linear", library: LockboxSchemaLibrary | None = None):
        self.library = library or DEFAULT_LIBRARY
        self.classname = ""
        self.values: dict[str, Any] = {}
        self.set_class(classname if classname in self.library.lockbox_specs else "Lockbox")

    def class_list(self) -> list[dict[str, str]]:
        return self.library.class_list()

    def set_class(self, classname: str) -> dict[str, Any]:
        if classname not in self.library.lockbox_specs:
            raise ValueError(f"classname must be one of {list(self.library.lockbox_specs)}")
        spec = self.library.lockbox_specs[classname]
        self.classname = classname
        self.spec = spec
        self.output_units = list(spec.output_units)
        self.function_calls = list(spec.function_calls)
        self.values = self._initial_lockbox_values(spec)
        self.inputs = self._new_inputs(spec)
        self.outputs = self._new_outputs(spec)
        self.current_state = "unlock"
        self.lock_status = False
        self.sequence = [self._new_stage("stage0")]
        return self.schema()

    def _initial_lockbox_values(self, spec: LockboxClassSpec) -> dict[str, Any]:
        values = {name: _copy_default(prop.default) for name, prop in spec.properties.items() if name in spec.gui_attributes}
        values["classname"] = spec.name
        values.setdefault("default_sweep_output", next(iter(spec.outputs), "output1"))
        if not values.get("default_sweep_output"):
            values["default_sweep_output"] = next(iter(spec.outputs), "output1")
        values.setdefault("auto_lock", False)
        values.setdefault("is_locked_threshold", 1.0)
        values.setdefault("setpoint_unit", spec.setpoint_units[0] if spec.setpoint_units else "V")
        values.setdefault("lockstatus_interval", 1.0)
        return values

    def _new_inputs(self, spec: LockboxClassSpec) -> OrderedDict[str, LockboxInput]:
        inputs: OrderedDict[str, LockboxInput] = OrderedDict()
        iq_index = 0
        for name, class_name in spec.inputs.items():
            input_specs = self._module_attr_specs(class_name)
            is_iq = "InputIq" in self.library.resolve_mro(class_name)
            iq_module = f"iq{min(iq_index, 2)}" if is_iq else None
            if is_iq:
                iq_index += 1
            inputs[name] = LockboxInput(
                name=name,
                class_name=class_name,
                attr_specs=input_specs,
                is_iq=is_iq,
                iq_module=iq_module,
            )
        if not inputs:
            inputs["input"] = LockboxInput("input", "InputDirect", self._module_attr_specs("InputDirect"))
        return inputs

    def _new_outputs(self, spec: LockboxClassSpec) -> OrderedDict[str, LockboxOutput]:
        outputs: OrderedDict[str, LockboxOutput] = OrderedDict()
        for index, (name, class_name) in enumerate(spec.outputs.items()):
            output_specs = self._module_attr_specs(class_name)
            output = LockboxOutput(name=name, class_name=class_name, attr_specs=output_specs, index=index)
            self._synchronize_output_design(output)
            outputs[name] = output
        if not outputs:
            output = LockboxOutput("output1", "OutputSignal", self._module_attr_specs("OutputSignal"), 0)
            self._synchronize_output_design(output)
            outputs["output1"] = output
        return outputs

    def _module_attr_specs(self, class_name: str) -> list[PropertySpec]:
        properties = self.library.resolve_properties(class_name)
        attrs = self.library.resolve_gui_attributes(class_name)
        if "OutputSignal" in self.library.resolve_mro(class_name):
            # These setup attributes are exposed by OutputSignalWidget's
            # assisted-design radios and analog transfer-function dialog.
            attrs = _unique([*attrs, "assisted_design", "tf_type", "tf_curve"])
        return [properties[name] for name in attrs if name in properties]

    def setup_dict(self) -> dict[str, Any]:
        attributes = self.library.resolve_setup_attributes(self.classname)
        result = {name: self.values[name] for name in attributes if name in self.values}
        result["classname"] = self.classname
        result["inputs"] = {}
        for name, model in self.inputs.items():
            keys = self.library.resolve_setup_attributes(model.class_name)
            values = {key: model.values[key] for key in keys if key in model.values}
            calibration = model.calibration.as_dict()
            calibration["_analog_offset"] = calibration.pop("analog_offset")
            calibration["_asg_phase"] = calibration.pop("asg_phase")
            values["calibration_data"] = calibration
            result["inputs"][name] = values
        result["outputs"] = {
            name: {key: model.values[key] for key in self.library.resolve_setup_attributes(model.class_name) if key in model.values}
            for name, model in self.outputs.items()
        }
        result["sequence"] = [{key: value for key, value in asdict(stage).items() if key != "name"} for stage in self.sequence]
        return result

    def restore_setup(self, state: dict) -> None:
        for key in self.library.resolve_setup_attributes(self.classname):
            if key in state and key != "classname":
                self.values[key] = _copy_default(state[key])
        for group in ("inputs", "outputs"):
            for name, values in state.get(group, {}).items():
                if name not in getattr(self, group):
                    continue
                model = getattr(self, group)[name]
                for key in self.library.resolve_setup_attributes(model.class_name):
                    if key in values:
                        model.values[key] = _copy_default(values[key])
                if group == "inputs":
                    calibration = values.get("calibration_data", {})
                    for key, value in calibration.items():
                        key = {"_analog_offset": "analog_offset", "_asg_phase": "asg_phase"}.get(key, key)
                        if key in model.calibration.__dataclass_fields__:
                            setattr(model.calibration, key, float(value))
                    model.calibration.amplitude = (model.calibration.max - model.calibration.min) / 2.0
                    model.calibration.offset = (model.calibration.max + model.calibration.min) / 2.0
                else:
                    self._synchronize_output_design(model)
        if "sequence" in state:
            self.sequence = []
            for index, values in enumerate(state["sequence"]):
                self.sequence.append(self._new_stage(f"stage{index}"))
                for key, value in values.items():
                    if key == "outputs":
                        for output, attrs in value.items():
                            for attribute, setting in attrs.items():
                                self.set_stage_output_attribute(index, output, attribute, setting)
                    elif key != "name":
                        self.set_stage_attribute(index, key, value)

    def schema(self) -> dict[str, Any]:
        return {
            "schema_epoch": _SCHEMA_EPOCH,
            "revision": next(_SCHEMA_REVISIONS),
            "classname": self.classname,
            "classes": self.class_list(),
            "state": {
                "current_state": self.current_state,
                "lock_status": self.lock_status,
            },
            "attributes": self._lockbox_attribute_controls(),
            "inputs": [input_model.as_dict(self) for input_model in self.inputs.values()],
            "outputs": [output.as_dict(self) for output in self.outputs.values()],
            "sequence": [stage.as_dict(self) for stage in self.sequence],
            "actions": lockbox_actions(self),
        }

    def _lockbox_attribute_controls(self) -> list[dict[str, Any]]:
        controls = [
            _select("classname", "Class", self.classname, list(self.library.lockbox_specs)),
            _select("default_sweep_output", "Sweep Output", self.default_sweep_output, list(self.outputs)),
            _boolean("auto_lock", "Auto Lock", self.auto_lock),
            _number("is_locked_threshold", "Locked Threshold", self.is_locked_threshold, 0.0, 1.0e10, 0.001),
            _select("setpoint_unit", "Setpoint Unit", self.setpoint_unit, self.spec.setpoint_units),
            _number("lockstatus_interval", "Status Interval", self.lockstatus_interval, 0.001, 1.0e10, 0.05),
        ]
        for name in self.spec.gui_attributes:
            if name in {"classname", "default_sweep_output", "auto_lock", "is_locked_threshold", "setpoint_unit", "lockstatus_interval"}:
                continue
            prop = self.spec.properties.get(name)
            if prop is not None:
                controls.append(prop.control(self.values.get(name, prop.default), self))
        return controls

    def __getattr__(self, name: str) -> Any:
        if name in self.values:
            return self.values[name]
        raise AttributeError(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name in {
            "library",
            "classname",
            "values",
            "spec",
            "output_units",
            "function_calls",
            "inputs",
            "outputs",
            "current_state",
            "lock_status",
            "sequence",
        }:
            object.__setattr__(self, name, value)
        elif "values" in self.__dict__ and name in self.values:
            self.values[name] = value
        else:
            object.__setattr__(self, name, value)

    def set_attribute(self, name: str, value: Any) -> dict[str, Any]:
        if name == "classname":
            return self.set_class(str(value))
        if name == "default_sweep_output":
            self.values[name] = _require_value(name, str(value), list(self.outputs))
        elif name == "setpoint_unit":
            self.values[name] = _require_value(name, str(value), self.spec.setpoint_units)
        elif name in self.values:
            prop = self.spec.properties.get(name)
            self.values[name] = _coerce_value(prop, value, self)
        else:
            raise KeyError(name)
        return self.schema()

    def set_input_attribute(self, input_name: str, attribute: str, value: Any) -> dict[str, Any]:
        input_model = self.inputs[input_name]
        prop = _find_spec(input_model.attr_specs, attribute)
        input_model.values[attribute] = _coerce_value(prop, value, self)
        return self.schema()

    def set_output_attribute(self, output_name: str, attribute: str, value: Any) -> dict[str, Any]:
        output = self.outputs[output_name]
        prop = _find_spec(output.attr_specs, attribute)
        output.values[attribute] = _coerce_value(prop, value, self)
        self._synchronize_output_design(output)
        return self.schema()

    def _synchronize_output_design(self, output: LockboxOutput) -> None:
        if bool(getattr(output, "assisted_design", True)):
            output.i = float(getattr(output, "desired_unity_gain_frequency", 0.0))
            cutoff = float(getattr(output, "analog_filter_cutoff", 0.0))
            output.p = 0.0 if cutoff == 0.0 else output.i / cutoff
        else:
            output.desired_unity_gain_frequency = float(getattr(output, "i", 0.0))
            output.analog_filter_cutoff = 0.0 if output.p == 0.0 else output.i / output.p

    def append_stage(self) -> dict[str, Any]:
        used = {stage.name for stage in self.sequence}
        index = 0
        while f"stage{index}" in used:
            index += 1
        self.sequence.append(self._new_stage(f"stage{index}"))
        return self.schema()

    def delete_stage(self, index: int) -> dict[str, Any]:
        if not 0 <= index < len(self.sequence):
            raise IndexError(index)
        self.sequence.pop(index)
        if not self.sequence:
            self.sequence.append(self._new_stage("stage0"))
        return self.schema()

    def set_stage_attribute(self, index: int, attribute: str, value: Any) -> dict[str, Any]:
        stage = self.sequence[index]
        if attribute == "input":
            stage.input = _require_value(attribute, str(value), list(self.inputs))
        elif attribute == "setpoint":
            stage.setpoint = float(value)
        elif attribute == "duration":
            stage.duration = max(0.0, float(value))
        elif attribute == "gain_factor":
            stage.gain_factor = float(value)
        elif attribute == "function_call":
            stage.function_call = _require_value(attribute, str(value), ["", *self.function_calls])
        else:
            raise KeyError(attribute)
        return self.schema()

    def set_stage_output_attribute(self, index: int, output_name: str, attribute: str, value: Any) -> dict[str, Any]:
        stage_output = self.sequence[index].outputs[output_name]
        if attribute == "lock_on":
            if value not in ["ignore", False, True, "false", "true"]:
                raise ValueError("lock_on must be ignore, false, or true")
            stage_output.lock_on = {"false": False, "true": True}.get(value, value)
        elif attribute == "reset_offset":
            stage_output.reset_offset = bool(value)
        elif attribute == "offset":
            stage_output.offset = _clamp(float(value), -1.0, 1.0)
        else:
            raise KeyError(attribute)
        return self.schema()

    def call_action(self, action: str) -> dict[str, Any]:
        if action == "unlock":
            self.current_state = "unlock"
        elif action == "sweep":
            self.current_state = "sweep"
        elif action == "lock":
            self.current_state = "lock_on"
        elif action == "calibrate_all":
            for input_model in self.inputs.values():
                input_model.calibration.mean = 0.0
                input_model.calibration.rms = 0.25
                input_model.calibration.min = -1.0
                input_model.calibration.max = 1.0
        elif action == "get_analog_offsets":
            for input_model in self.inputs.values():
                input_model.calibration.analog_offset = 0.0
        else:
            raise KeyError(action)
        return self.schema()

    def input_plot(self, input_name: str, points: int = 200) -> dict[str, Any]:
        input_model = self.inputs[input_name]
        x = np.linspace(-1.0, 1.0, max(8, min(2000, int(points))))
        y = _expected_signal(input_model.kind, x, input_model.calibration)
        return {
            "input": input_name,
            "x": x.astype(float).tolist(),
            "series": [{"label": input_name, "values": y.astype(float).tolist()}],
            "x_label": f"setpoint ({self.setpoint_unit})",
            "y_label": "signal (V)",
        }

    def output_transfer_function(
        self,
        output_name: str,
        points: int = 200,
        curve_loader: Callable[[int], dict[str, Any]] | None = None,
        iir_transfer: Callable[[np.ndarray], np.ndarray] | None = None,
    ) -> dict[str, Any]:
        output = self.outputs[output_name]
        point_count = max(8, min(2000, int(points)))
        curve = None
        if output.tf_type == "curve" and curve_loader is not None:
            try:
                curve = curve_loader(int(output.tf_curve))
            except (OSError, EOFError, TypeError, ValueError):
                curve = None
        if curve is not None:
            freqs = np.asarray(curve["x"], dtype=np.float64)
            positive = np.isfinite(freqs) & (freqs > 0)
            freqs = freqs[positive]
            if freqs.size < 2:
                curve = None
        if curve is None:
            freqs = np.geomspace(1.0, 1.0e6, point_count)

        analog_tf = np.ones(freqs.size, dtype=np.complex128)
        if output.tf_type == "filter":
            analog_tf = _pid_filter_transfer_function(freqs, [float(output.analog_filter_cutoff)])
        elif output.tf_type == "curve" and curve is not None:
            curve_x = np.asarray(curve["x"], dtype=np.float64)
            curve_y = np.asarray(curve["y"], dtype=np.float64).astype(np.complex128)
            if "y_imag" in curve:
                curve_y += 1j * np.asarray(curve["y_imag"], dtype=np.float64)
            finite = np.isfinite(curve_x) & np.isfinite(curve_y.real) & np.isfinite(curve_y.imag)
            curve_x = curve_x[finite]
            curve_y = curve_y[finite]
            order = np.argsort(curve_x)
            curve_x = curve_x[order]
            curve_y = curve_y[order]
            analog_tf = np.interp(freqs, curve_x, np.abs(curve_y)) * np.exp(
                1j * np.interp(freqs, curve_x, np.unwrap(np.angle(curve_y)))
            )

        result = analog_tf * _pid_transfer_function(
            freqs,
            float(output.p),
            float(output.i),
            _filter_values(getattr(output, "additional_filter", [])),
        )
        if output.extra_module == "iir" and iir_transfer is not None:
            result *= iir_transfer(freqs)
        magnitude = np.abs(result)
        phase = np.degrees(np.angle(result))
        return {
            "output": output_name,
            "x": freqs.astype(float).tolist(),
            "series": [
                {"label": "magnitude", "values": magnitude.astype(float).tolist()},
                {"label": "phase", "values": phase.astype(float).tolist()},
            ],
            "x_label": "frequency (Hz)",
        }

    def expected_signal(self, input_name: str, setpoint: float) -> float:
        input_model = self.inputs[input_name]
        values = _expected_signal(input_model.kind, np.asarray([float(setpoint)]), input_model.calibration)
        return float(values[0])

    def expected_slope(self, input_name: str, setpoint: float) -> float:
        input_model = self.inputs[input_name]
        step = max(1e-6, abs(float(setpoint)) * 1e-6)
        left = _expected_signal(input_model.kind, np.asarray([float(setpoint) - step]), input_model.calibration)[0]
        right = _expected_signal(input_model.kind, np.asarray([float(setpoint) + step]), input_model.calibration)[0]
        return float((right - left) / (2.0 * step))

    def mark_all_outputs(self, state: str) -> None:
        for output in self.outputs.values():
            output.current_state = state

    def current_stage(self):
        if not self.sequence:
            return None
        if self.current_state == "lock_on":
            return self.sequence[-1]
        return next(
            (stage for stage in self.sequence if stage.name == self.current_state),
            None,
        )

    def is_locked(self) -> bool:
        """Return the latest status measured by the server-side monitor."""

        return bool(self.lock_status)

    def _new_stage(self, name: str) -> LockboxStage:
        input_name = next(iter(self.inputs))
        return LockboxStage(
            name=name,
            input=input_name,
            outputs={output_name: LockboxStageOutput() for output_name in self.outputs},
        )


def lockbox_actions(state: LockboxState | None = None) -> list[dict[str, str]]:
    actions = [
        {"name": "is_locked", "label": "is_locked?", "description": "Evaluate the current lock status."},
        {"name": "unlock", "label": "Unlock", "description": "Unlock all lockbox outputs."},
        {"name": "sweep", "label": "Sweep", "description": "Sweep the default output."},
        {"name": "lock", "label": "Lock", "description": "Execute the configured stage sequence."},
        {"name": "calibrate_all", "label": "Calibrate All", "description": "Calibrate all lockbox inputs."},
    ]
    if state is not None:
        actions.extend(
            {
                "name": name,
                "label": _label_from_name(name),
                "description": f"Run trusted custom Lockbox method {name}.",
            }
            for name in state.spec.action_methods
        )
    return actions


def _filter_values(value: Any) -> list[float]:
    if isinstance(value, str):
        parts = value.replace("[", "").replace("]", "").split(",")
        return [float(part.strip()) for part in parts if part.strip()]
    if isinstance(value, (list, tuple, np.ndarray)):
        return [float(item) for item in value]
    if value in {None, ""}:
        return []
    return [float(value)]


def _pid_transfer_function(
    frequencies: np.ndarray,
    p: float,
    i: float,
    filter_values: list[float],
) -> np.ndarray:
    complex_frequencies = np.asarray(frequencies, dtype=np.complex128)
    result = i / (1j * complex_frequencies) * np.exp(-1j * 8e-9 * complex_frequencies * 2 * pi)
    result += p
    result *= _pid_filter_transfer_function(complex_frequencies, filter_values)
    result *= np.exp(-1j * 3 * 8e-9 * complex_frequencies * 2 * pi)
    return result


def _pid_filter_transfer_function(frequencies: np.ndarray, filter_values: list[float]) -> np.ndarray:
    complex_frequencies = np.asarray(frequencies, dtype=np.complex128)
    result = np.ones(complex_frequencies.size, dtype=np.complex128)
    module_delay = 0
    for cutoff in filter_values:
        if cutoff > 0:
            result /= 1.0 + 1j * complex_frequencies / cutoff
            module_delay += 2
        elif cutoff < 0:
            result /= 1.0 + 1j * cutoff / complex_frequencies
            module_delay += 1
    result *= np.exp(-1j * module_delay * 8e-9 * complex_frequencies * 2 * pi)
    return result


def _expected_signal(kind: str, x: np.ndarray, calibration: LockboxCalibration) -> np.ndarray:
    if kind == "sine":
        return calibration.offset + calibration.amplitude * np.sin(pi * x)
    if kind == "minus_sine":
        return calibration.offset - calibration.amplitude * np.sin(pi * x)
    if kind == "cosine":
        return calibration.amplitude * np.cos(pi * x)
    if kind == "pdh":
        return calibration.amplitude * (2.0 * x / (1.0 + 4.0 * x * x))
    if kind == "lorentzian":
        return calibration.offset + calibration.amplitude / (1.0 + (x / 0.12) ** 2)
    if kind == "quadratic":
        return calibration.offset + calibration.amplitude * x * x
    return calibration.offset + calibration.amplitude * x


def _select(name: str, label: str, value: Any, options: list[Any]) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "select", "value": _json_value(value), "options": options}


def _boolean(name: str, label: str, value: bool) -> dict[str, Any]:
    return {"name": name, "label": label, "type": "bool", "value": bool(value)}


def _number(
    name: str,
    label: str,
    value: float,
    minimum: float,
    maximum: float,
    step: float | None = None,
) -> dict[str, Any]:
    schema = {"name": name, "label": label, "type": "number", "value": value, "min": minimum, "max": maximum}
    if step is not None:
        schema["step"] = step
    return schema


def _find_spec(specs: list[PropertySpec], attribute: str) -> PropertySpec:
    for spec in specs:
        if spec.name == attribute:
            return spec
    raise KeyError(attribute)


def _coerce_value(prop: PropertySpec | None, value: Any, context: LockboxState) -> Any:
    if prop is None:
        return value
    if prop.kind == "bool":
        return bool(value)
    if prop.kind == "number":
        number = float(value)
        if prop.minimum is not None:
            number = max(prop.minimum, number)
        if prop.maximum is not None:
            number = min(prop.maximum, number)
        return number
    if prop.kind == "select":
        options = prop.dynamic_options(context)
        if options is not None:
            value = _coerce_select_value(value, options)
            if value not in options:
                raise ValueError(f"{prop.name} must be one of {options}")
        return value
    return value


def _coerce_select_value(value: Any, options: list[Any]) -> Any:
    for option in options:
        if str(option) == str(value):
            return option
    return value


def _require_value(name: str, value: str, options: list[str]) -> str:
    if value not in options:
        raise ValueError(f"{name} must be one of {options}")
    return value


def _label_from_name(name: str) -> str:
    return " ".join(part.capitalize() for part in name.split("_"))


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _unique(items: list[Any]) -> list[Any]:
    result = []
    for item in items:
        if item not in result:
            result.append(item)
    return result


def _copy_default(value: Any) -> Any:
    if isinstance(value, list):
        return list(value)
    if isinstance(value, dict):
        return dict(value)
    return value


def _json_value(value: Any) -> Any:
    if isinstance(value, tuple):
        return list(value)
    return value


def _name_from_expr(expr: ast.AST) -> str:
    if isinstance(expr, ast.Name):
        return expr.id
    if isinstance(expr, ast.Attribute):
        return expr.attr
    return ""


def _call_name(expr: ast.AST) -> str:
    if isinstance(expr, ast.Call):
        return _name_from_expr(expr.func)
    return ""


def _literal_value(expr: ast.AST) -> Any:
    try:
        return ast.literal_eval(expr)
    except (ValueError, TypeError, SyntaxError):
        return None


def _keyword_value(call: ast.Call, name: str) -> Any:
    for keyword in call.keywords:
        if keyword.arg == name:
            return _literal_value(keyword.value)
    return None


def _keyword_number(call: ast.Call, name: str) -> float | None:
    value = _keyword_value(call, name)
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _call_options(call: ast.Call) -> list[Any] | None:
    for keyword in call.keywords:
        if keyword.arg == "options":
            value = _literal_value(keyword.value)
            return list(value) if isinstance(value, (list, tuple)) else None
    if call.args:
        value = _literal_value(call.args[0])
        if isinstance(value, (list, tuple)):
            return list(value)
    return None


def _module_dict_from_call(call: ast.Call) -> dict[str, str]:
    result: dict[str, str] = OrderedDict()
    for keyword in call.keywords:
        if keyword.arg:
            class_name = _name_from_expr(keyword.value)
            if class_name:
                result[keyword.arg] = class_name
    return result


def _looks_numeric_property(source_type: str) -> bool:
    return any(fragment in source_type.lower() for fragment in ["float", "freq", "phase", "gain", "output"])


def _infer_input_kind(class_name: str) -> str:
    lowered = class_name.lower()
    if "pdh" in lowered:
        return "pdh"
    if "transmission" in lowered or "lorentz" in lowered:
        return "lorentzian"
    if "port2" in lowered:
        return "minus_sine"
    if "port1" in lowered or "reflection" in lowered:
        return "sine"
    if "custom" in lowered:
        return "quadratic"
    return "linear"


def _infer_output_kind(class_name: str) -> str:
    lowered = class_name.lower()
    if "piezo" in lowered:
        return "piezo"
    if "pwm" in lowered:
        return "pwm"
    return "standard"


def _default_user_lockbox_dir() -> Path:
    user_dir = os.environ.get("PYRPL_USER_DIR")
    if user_dir is None:
        user_dir = os.path.join(os.path.expanduser("~"), "pyrpl_user_dir")
    return Path(user_dir) / "lockbox"


def _first_doc_sentence(source: str, class_name: str) -> str:
    try:
        tree = ast.parse(Path(source).read_text(encoding="utf-8"), filename=source)
    except (OSError, SyntaxError):
        return ""
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name == class_name:
            doc = ast.get_docstring(node) or ""
            return " ".join(doc.strip().split())[:180]
    return ""


_BASE_LOCKBOX_FUNCTIONS = {
    "setup",
    "calibrate_all",
    "get_analog_offsets",
    "unlock",
    "sweep",
    "lock",
    "is_locked",
    "is_locked_and_final",
    "sleep",
    "time",
}


DEFAULT_LIBRARY = LockboxSchemaLibrary()
