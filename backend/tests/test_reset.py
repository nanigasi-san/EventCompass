from __future__ import annotations

from datetime import date, datetime, timedelta

from fastapi.testclient import TestClient

from backend.models import ScheduleCreate, TaskCreate, TaskStatus, TodoCreate, TodoStatus
from backend.store import SQLiteStore


def _create_sample_schedule(store: SQLiteStore) -> int:
    schedule = store.create_schedule(
        ScheduleCreate(
            name='Autumn Festival Day 1',
            event_date=date(2025, 10, 29),
            start_time=datetime(2025, 10, 29, 8, 0, 0),
            end_time=datetime(2025, 10, 29, 18, 0, 0),
        )
    )
    store.create_task(
        schedule.id,
        TaskCreate(
            name='Check-in',
            stage='General',
            start_time=schedule.start_time,
            end_time=schedule.start_time + timedelta(minutes=30),
            location='Main gate',
            status=TaskStatus.PLANNED,
            note=None,
        ),
    )
    return schedule.id


def test_reset_endpoint_clears_all_tables(
    client: TestClient, seeded_store: SQLiteStore
) -> None:
    schedule_id = _create_sample_schedule(seeded_store)
    seeded_store.create_todo(
        TodoCreate(
            title='Prep meeting',
            description=None,
            due_date=date(2025, 10, 28),
            status=TodoStatus.PENDING,
            assignee_id=1,
        )
    )

    response = client.post('/reset')

    assert response.status_code == 204
    assert seeded_store.list_members() == []
    assert seeded_store.list_materials() == []
    assert seeded_store.list_schedules() == []
    assert seeded_store.list_todos() == []
    try:
        seeded_store.list_tasks(schedule_id)
    except KeyError:
        # expected because the schedule was removed
        pass
    else:  # pragma: no cover - defensive
        raise AssertionError('tasks should be cleared alongside schedules')
