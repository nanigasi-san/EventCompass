"""イベント情報で扱うデータモデル。"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel


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
    contact: ContactInfo


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


class ScheduleBase(BaseModel):
    """スケジュール共通のプロパティ。"""

    name: str
    event_date: date
    start_time: datetime
    end_time: datetime


class Schedule(ScheduleBase):
    """永続化済みスケジュール。"""

    id: int


class ScheduleCreate(ScheduleBase):
    """スケジュール作成用のリクエストボディ。"""

    pass


class ScheduleUpdate(BaseModel):
    """スケジュール更新用のリクエストボディ。未指定項目は更新しない。"""

    name: str | None = None
    event_date: date | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None


class TaskStatus(str, Enum):
    """タスクの状態を表す列挙。"""

    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"


class TaskBase(BaseModel):
    """タスク共通のプロパティ。"""

    name: str
    stage: str
    start_time: datetime
    end_time: datetime
    location: str | None = None
    status: TaskStatus = TaskStatus.PLANNED
    note: str | None = None


class Task(TaskBase):
    """永続化済みタスク。"""

    id: int
    schedule_id: int


class TaskCreate(TaskBase):
    """タスク作成用のリクエストボディ。"""

    pass


class TaskUpdate(BaseModel):
    """タスク更新用のリクエストボディ。未指定項目は更新しない。"""

    name: str | None = None
    stage: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    location: str | None = None
    status: TaskStatus | None = None
    note: str | None = None


class TaskStatusUpdate(BaseModel):
    """タスクの状態のみを更新するためのリクエストボディ。"""

    status: TaskStatus
