"""イベント情報で扱うデータモデル。"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """連絡先情報。空の場合は None が入る。"""

    phone: str | None = None
    email: str | None = None
    note: str | None = None


class MemberBase(BaseModel):
    """メンバー共通のプロパティ。"""

    name: str
    part: str
    position: str
    contact: ContactInfo = Field(default_factory=ContactInfo)


class Member(MemberBase):
    """永続化済みメンバー。"""

    id: int


class MemberCreate(MemberBase):
    """メンバー作成用のリクエストボディ。"""

    pass


class MemberUpdate(BaseModel):
    """メンバー更新用のリクエストボディ。未指定項目は更新しない。"""

    name: str | None = None
    part: str | None = None
    position: str | None = None
    contact: ContactInfo | None = None


class MaterialBase(BaseModel):
    """資材共通のプロパティ。"""

    name: str
    part: str
    quantity: int


class Material(MaterialBase):
    """永続化済み資材。"""

    id: int


class MaterialCreate(MaterialBase):
    """資材作成用のリクエストボディ。"""

    pass


class MaterialUpdate(BaseModel):
    """資材更新用のリクエストボディ。未指定項目は更新しない。"""

    name: str | None = None
    part: str | None = None
    quantity: int | None = None
