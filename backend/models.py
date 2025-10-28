"""データモデル定義。"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ContactInfo:
    """連絡先情報。"""

    phone: str | None = None
    email: str | None = None
    note: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any] | ContactInfo | None) -> ContactInfo:
        """辞書から `ContactInfo` を生成する。"""

        if data is None:
            return cls()
        if isinstance(data, ContactInfo):
            return data
        return cls(
            phone=data.get("phone"),
            email=data.get("email"),
            note=data.get("note"),
        )

    def to_dict(self) -> dict[str, Any]:
        """辞書形式へ変換する。"""

        return {"phone": self.phone, "email": self.email, "note": self.note}


@dataclass(slots=True)
class Member:
    """メンバー情報。"""

    id: int
    name: str
    part: str
    position: str
    contact: ContactInfo = field(default_factory=ContactInfo)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "part": self.part,
            "position": self.position,
            "contact": self.contact.to_dict(),
        }


@dataclass(slots=True)
class MemberCreate:
    """メンバー作成時の入力。"""

    name: str
    part: str
    position: str
    contact: ContactInfo = field(default_factory=ContactInfo)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MemberCreate:
        contact = ContactInfo.from_dict(data.get("contact"))
        return cls(
            name=data["name"],
            part=data["part"],
            position=data["position"],
            contact=contact,
        )


@dataclass(slots=True)
class MemberUpdate:
    """メンバー更新時の入力。"""

    name: str | None = None
    part: str | None = None
    position: str | None = None
    contact: ContactInfo | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MemberUpdate:
        contact = data.get("contact")
        return cls(
            name=data.get("name"),
            part=data.get("part"),
            position=data.get("position"),
            contact=ContactInfo.from_dict(contact) if contact is not None else None,
        )

    def to_update_dict(self) -> dict[str, Any]:
        update: dict[str, Any] = {}
        if self.name is not None:
            update["name"] = self.name
        if self.part is not None:
            update["part"] = self.part
        if self.position is not None:
            update["position"] = self.position
        if self.contact is not None:
            update["contact"] = self.contact
        return update


@dataclass(slots=True)
class Material:
    """資材情報。"""

    id: int
    name: str
    part: str
    quantity: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "part": self.part,
            "quantity": self.quantity,
        }


@dataclass(slots=True)
class MaterialCreate:
    """資材作成時の入力。"""

    name: str
    part: str
    quantity: int

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MaterialCreate:
        return cls(name=data["name"], part=data["part"], quantity=int(data["quantity"]))


@dataclass(slots=True)
class MaterialUpdate:
    """資材更新時の入力。"""

    name: str | None = None
    part: str | None = None
    quantity: int | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MaterialUpdate:
        quantity = data.get("quantity")
        return cls(
            name=data.get("name"),
            part=data.get("part"),
            quantity=int(quantity) if quantity is not None else None,
        )

    def to_update_dict(self) -> dict[str, Any]:
        update: dict[str, Any] = {}
        if self.name is not None:
            update["name"] = self.name
        if self.part is not None:
            update["part"] = self.part
        if self.quantity is not None:
            update["quantity"] = self.quantity
        return update
