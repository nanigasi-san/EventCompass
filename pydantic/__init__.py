"""テスト用の最小限な Pydantic 互換スタブ。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, ClassVar

__all__ = ["BaseModel", "Field"]


class _UnsetType:
    __slots__ = ()

    def __repr__(self) -> str:  # pragma: no cover - デバッグ用
        return "UNSET"


UNSET = _UnsetType()


@dataclass
class FieldInfo:
    default: Any = UNSET
    default_factory: Callable[[], Any] | None = None


def Field(*, default: Any = UNSET, default_factory: Callable[[], Any] | None = None) -> FieldInfo:
    """Pydantic 互換の Field。"""

    return FieldInfo(default=default, default_factory=default_factory)


class BaseModel:
    """最低限の BaseModel 実装。"""

    __fields__: ClassVar[dict[str, FieldInfo]]

    def __init_subclass__(cls) -> None:
        annotations = getattr(cls, "__annotations__", {})
        fields: dict[str, FieldInfo] = {}
        for base in reversed(cls.__mro__[1:]):
            base_fields = getattr(base, "__fields__", None)
            if base_fields:
                fields.update(base_fields)
        for name in annotations:
            default = getattr(cls, name, UNSET)
            if isinstance(default, FieldInfo):
                field_info = default
                try:
                    delattr(cls, name)
                except AttributeError:  # pragma: no cover - defensive
                    pass
            else:
                field_info = FieldInfo(default=default)
                try:
                    delattr(cls, name)
                except AttributeError:
                    pass
            fields[name] = field_info
        cls.__fields__ = fields

    def __init__(self, **data: Any) -> None:
        self.__dict__["_values"] = {}
        self.__dict__["_fields_set"] = set()
        for name, field in self.__class__.__fields__.items():
            if name in data:
                value = data.pop(name)
                self._fields_set.add(name)
            else:
                if field.default_factory is not None:
                    value = field.default_factory()
                elif field.default is not UNSET:
                    value = field.default
                else:
                    value = None
            self._values[name] = value
        if data:
            for key, value in data.items():  # 余分なフィールドも保持
                self._values[key] = value
                self._fields_set.add(key)

    def __getattr__(self, item: str) -> Any:
        try:
            return self._values[item]
        except KeyError:  # pragma: no cover - defensive
            raise AttributeError(item)

    def __setattr__(self, key: str, value: Any) -> None:
        if key.startswith("_"):
            super().__setattr__(key, value)
        else:
            self._values[key] = value
            self._fields_set.add(key)

    def model_dump(self, *, exclude_unset: bool = False) -> dict[str, Any]:
        if exclude_unset:
            return {k: v for k, v in self._values.items() if k in self._fields_set}
        return dict(self._values)

    @classmethod
    def model_validate(cls, value: Any) -> "BaseModel":
        if isinstance(value, cls):
            return value
        if isinstance(value, dict):
            return cls(**value)
        raise TypeError(f"Cannot validate value of type {type(value)!r}")

    def __repr__(self) -> str:  # pragma: no cover - デバッグ向け
        field_str = ", ".join(f"{k}={v!r}" for k, v in self._values.items())
        return f"{self.__class__.__name__}({field_str})"
