"""スケジュールおよびタスクのストア操作テスト。"""

from __future__ import annotations

from datetime import datetime

import pytest

from backend.models import (
    ScheduleCreate,
    ScheduleUpdate,
    TaskCreate,
    TaskStatus,
    TaskUpdate,
)
from backend.store import SQLiteStore


def _create_schedule(store: SQLiteStore) -> int:
    created = store.create_schedule(
        ScheduleCreate(name="本番1日目", event_date=datetime(2023, 10, 1).date())
    )
    return created.id


def _create_task(store: SQLiteStore, schedule_id: int, **overrides) -> int:
    payload = TaskCreate(
        name="準備ミーティング",
        stage="Preparation",
        start_time=datetime(2023, 10, 1, 8, 0),
        end_time=datetime(2023, 10, 1, 8, 30),
        location="HQ",
        note="集合場所で状況確認",
    )
    for key, value in overrides.items():
        setattr(payload, key, value)
    created = store.create_task(schedule_id, payload)
    return created.id


def test_schedule_crud(seeded_store: SQLiteStore) -> None:
    schedule_id = _create_schedule(seeded_store)

    schedules = seeded_store.list_schedules()
    assert any(item.id == schedule_id for item in schedules)

    updated = seeded_store.update_schedule(
        schedule_id, ScheduleUpdate(name="大会当日", event_date=datetime(2023, 10, 2).date())
    )
    assert updated.event_date.isoformat() == "2023-10-02"

    seeded_store.delete_schedule(schedule_id)
    try:
        seeded_store.get_schedule(schedule_id)
    except KeyError:
        pass
    else:  # pragma: no cover - defensive
        raise AssertionError("スケジュールが削除されていません")


def test_task_crud_flow(seeded_store: SQLiteStore) -> None:
    schedule_id = _create_schedule(seeded_store)
    task_id = _create_task(seeded_store, schedule_id)

    created = seeded_store.get_task(task_id)
    assert created.status == TaskStatus.PLANNED

    updated = seeded_store.update_task(
        task_id,
        TaskUpdate(stage="Logistics", note="担当者割り当て見直し", status=TaskStatus.IN_PROGRESS),
    )
    assert updated.stage == "Logistics"
    assert updated.status == TaskStatus.IN_PROGRESS

    fetched = seeded_store.get_task(task_id)
    assert fetched.note == "担当者割り当て見直し"

    status_updated = seeded_store.update_task_status(task_id, TaskStatus.COMPLETED)
    assert status_updated.status == TaskStatus.COMPLETED

    seeded_store.delete_task(task_id)
    try:
        seeded_store.get_task(task_id)
    except KeyError:
        pass
    else:  # pragma: no cover - defensive
        raise AssertionError("タスクが削除されていません")


def test_task_filters_and_schedule_removal(seeded_store: SQLiteStore) -> None:
    schedule_id = _create_schedule(seeded_store)
    _create_task(
        seeded_store,
        schedule_id,
        name="受付準備",
        stage="Preparation",
        start_time=datetime(2023, 10, 1, 6, 0),
        end_time=datetime(2023, 10, 1, 7, 0),
    )
    _create_task(
        seeded_store,
        schedule_id,
        name="コース設営",
        stage="Course",
        status=TaskStatus.IN_PROGRESS,
        start_time=datetime(2023, 10, 1, 7, 0),
        end_time=datetime(2023, 10, 1, 9, 0),
    )
    _create_task(
        seeded_store,
        schedule_id,
        name="受付オープン",
        stage="Preparation",
        status=TaskStatus.COMPLETED,
        start_time=datetime(2023, 10, 1, 9, 0),
        end_time=datetime(2023, 10, 1, 10, 0),
    )

    prep_tasks = seeded_store.list_tasks(schedule_id, stage="Preparation")
    assert len(prep_tasks) == 2

    completed_tasks = seeded_store.list_tasks(schedule_id, status=TaskStatus.COMPLETED)
    assert len(completed_tasks) == 1

    combined = seeded_store.list_tasks(
        schedule_id, stage="preparation", status=TaskStatus.COMPLETED
    )
    assert len(combined) == 1
    assert combined[0].name == "受付オープン"

    seeded_store.delete_schedule(schedule_id)
    with pytest.raises(KeyError):
        seeded_store.list_tasks(schedule_id)
