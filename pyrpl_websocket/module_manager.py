"""Qt-free ownership manager matching PyRPL's hardware ModuleManager."""

from __future__ import annotations

from collections.abc import Callable, Iterable


class InsufficientResourceError(ValueError):
    """Raised when no unowned resource is available from a manager."""


OwnershipChanged = Callable[[str, str | None, str | None], None]


class ModuleManager:
    """Reserve named hardware resources using PyRPL's reverse allocation order."""

    def __init__(self, resource_names: Iterable[str], on_change: OwnershipChanged | None = None):
        self.resource_names = tuple(resource_names)
        self.owners = {name: None for name in self.resource_names}
        self._on_change = on_change

    def reserve(self, module_name: str, owner: str) -> None:
        self._require_module(module_name)
        current = self.owners[module_name]
        if current not in {None, owner}:
            raise ValueError(f"{module_name} is occupied by {current}")
        self._set_owner(module_name, owner)

    def pop(self, owner: str | None = None, resource_names: Iterable[str] | None = None) -> str:
        names = self.resource_names if resource_names is None else tuple(resource_names)
        for module_name in reversed(names):
            self._require_module(module_name)
            if self.owners[module_name] is None:
                if owner is not None:
                    self._set_owner(module_name, owner)
                return module_name
        raise InsufficientResourceError("No more matching modules left.")

    def free(self, module_name: str, owner: str | None = None) -> None:
        self._require_module(module_name)
        current = self.owners[module_name]
        if current is not None and (owner is None or current == owner):
            self._set_owner(module_name, None)

    def resources_owned_by(self, owner: str) -> list[str]:
        return [name for name in sorted(self.owners) if self.owners[name] == owner]

    def _set_owner(self, module_name: str, owner: str | None) -> None:
        previous = self.owners[module_name]
        if previous == owner:
            return
        self.owners[module_name] = owner
        if self._on_change is not None:
            self._on_change(module_name, previous, owner)

    def _require_module(self, module_name: str) -> None:
        if module_name not in self.owners:
            raise KeyError(module_name)
