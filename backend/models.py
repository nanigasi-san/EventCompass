"""Pydantic models for the EventCompass backend."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """連絡先情報を表すモデル。"""

    phone: str | None = Field(default=None, description="電話番号")
    email: str | None = Field(default=None, description="メールアドレス")
    note: str | None = Field(default=None, description="備考")


class MemberBase(BaseModel):
    """メンバー情報の共通部分。"""

    name: str = Field(..., min_length=1, description="氏名")
    part: str = Field(..., min_length=1, description="担当パート")
    position: str = Field(..., min_length=1, description="役職")
    contact: ContactInfo = Field(default_factory=ContactInfo, description="連絡先")


class Member(MemberBase):
    """メンバーの完全情報。"""

    id: int = Field(..., ge=1, description="メンバーID")


class MemberCreate(MemberBase):
    """メンバー作成時に受け付ける情報。"""


class MemberUpdate(BaseModel):
    """メンバー更新時に受け付ける情報。"""

    name: str | None = Field(default=None, description="氏名")
    part: str | None = Field(default=None, description="担当パート")
    position: str | None = Field(default=None, description="役職")
    contact: ContactInfo | None = Field(default=None, description="連絡先")


class MaterialBase(BaseModel):
    """資材情報の共通部分。"""

    name: str = Field(..., min_length=1, description="資材名")
    part: str = Field(..., min_length=1, description="使用パート")
    quantity: int = Field(..., ge=0, description="数量")


class Material(MaterialBase):
    """資材の完全情報。"""

    id: int = Field(..., ge=1, description="資材ID")


class MaterialCreate(MaterialBase):
    """資材作成時に受け付ける情報。"""


class MaterialUpdate(BaseModel):
    """資材更新時に受け付ける情報。"""

    name: str | None = Field(default=None, description="資材名")
    part: str | None = Field(default=None, description="使用パート")
    quantity: int | None = Field(default=None, ge=0, description="数量")
