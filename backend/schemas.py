"""FastAPI 用の Pydantic スキーマ定義。"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, validator


def _parse_hhmm(value: str) -> tuple[int, int]:
    if len(value) != 5 or value[2] != ":":
        raise ValueError("HH:MM 形式で指定してください")
    hour_str, minute_str = value.split(":", 1)
    if not hour_str.isdigit() or not minute_str.isdigit():
        raise ValueError("時刻は数字のみで指定してください")
    hour = int(hour_str)
    minute = int(minute_str)
    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        raise ValueError("時刻の範囲が不正です")
    return hour, minute


class ScheduleEntry(BaseModel):
    start: str = Field(..., description="開始時刻 HH:MM")
    end: str = Field(..., description="終了時刻 HH:MM")
    task: str = Field("", description="担当作業メモ")

    @validator("start", "end")
    def _validate_format(cls, value: str) -> str:  # noqa: D401
        """HH:MM 形式と値域を検証する。"""
        _parse_hhmm(value)
        return value

    @validator("end")
    def _validate_range(cls, end: str, values: dict[str, str]) -> str:
        start = values.get("start")
        if start is None:
            return end
        start_hour, start_minute = _parse_hhmm(start)
        end_hour, end_minute = _parse_hhmm(end)
        if (end_hour, end_minute) <= (start_hour, start_minute):
            raise ValueError("終了時刻は開始時刻より後である必要があります")
        return end


class ContactInfo(BaseModel):
    phone: str = ""
    note: str = ""


class MemberBase(BaseModel):
    name: str = Field(..., description="氏名")
    role: str = Field("", description="役割")
    status: str = Field("active", description="稼働状況")
    schedule: List[ScheduleEntry] = Field(default_factory=list)
    contacts: ContactInfo = Field(default_factory=ContactInfo)


class Member(MemberBase):
    id: int


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    schedule: Optional[List[ScheduleEntry]] = None
    contacts: Optional[ContactInfo] = None


class MemberCreated(BaseModel):
    id: int


class EventBase(BaseModel):
    title: str = Field(..., description="イベント名")
    start: str = Field(..., description="開始時刻 HH:MM")
    end: str = Field(..., description="終了時刻 HH:MM")
    members: List[int] = Field(default_factory=list)
    note: str = ""

    @validator("start", "end")
    def _validate_time_format(cls, value: str) -> str:
        _parse_hhmm(value)
        return value

    @validator("end")
    def _validate_time_range(cls, end: str, values: dict[str, str]) -> str:
        start = values.get("start")
        if start is None:
            return end
        start_hour, start_minute = _parse_hhmm(start)
        end_hour, end_minute = _parse_hhmm(end)
        if (end_hour, end_minute) <= (start_hour, start_minute):
            raise ValueError("終了時刻は開始時刻より後である必要があります")
        return end


class Event(EventBase):
    id: int


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    members: Optional[List[int]] = None
    note: Optional[str] = None

    @validator("start", "end")
    def _validate_optional_time(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        _parse_hhmm(value)
        return value


class EventCreated(BaseModel):
    id: int


class ItemBase(BaseModel):
    name: str = Field(..., description="資材名")
    quantity: int = Field(0, ge=0, description="数量")
    tags: List[str] = Field(default_factory=list)
    manager: str = Field("", description="担当者")
    note: str = ""


class Item(ItemBase):
    id: int


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    tags: Optional[List[str]] = None
    manager: Optional[str] = None
    note: Optional[str] = None


class ItemCreated(BaseModel):
    id: int


class SaveRequest(BaseModel):
    targets: Optional[List[str]] = Field(
        default=None,
        description="保存対象。未指定時は全データを保存する。",
    )
