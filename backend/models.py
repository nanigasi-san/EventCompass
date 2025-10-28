"""データモデル定義。"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """連絡先情報。"""

    phone: str | None = None
    email: str | None = None
    note: str | None = None


class MemberBase(BaseModel):
    """メンバーの共通属性。"""

    name: str
    part: str
    position: str
    contact: ContactInfo = Field(default_factory=ContactInfo)


class Member(MemberBase):
    """メンバー情報。"""

    id: int


class MemberCreate(MemberBase):
    """メンバー作成時の入力。"""

    pass


class MemberUpdate(BaseModel):
    """メンバー更新時の入力。"""

    name: str | None = None
    part: str | None = None
    position: str | None = None
    contact: ContactInfo | None = None


class MaterialBase(BaseModel):
    """資材の共通属性。"""

    name: str
    part: str
    quantity: int


class Material(MaterialBase):
    """資材情報。"""

    id: int


class MaterialCreate(MaterialBase):
    """資材作成時の入力。"""

    pass


class MaterialUpdate(BaseModel):
    """資材更新時の入力。"""

    name: str | None = None
    part: str | None = None
    quantity: int | None = None
