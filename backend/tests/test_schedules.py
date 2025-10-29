"""スケジュールとタスク API のテスト。"""

from __future__ import annotations

from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from backend.main import SCHEDULE_NOT_FOUND_DETAIL, TASK_NOT_FOUND_DETAIL


def _create_schedule(client: TestClient, *, name: str = "秋祭り初日") -> dict:
    response = client.post("/schedules", json={"name": name, "event_date": "2023-10-01"})
    assert response.status_code == 201
    return response.json()


def _create_task(client: TestClient, schedule_id: int, **overrides: object) -> dict:
    base_payload = {
        "name": "ステージミーティング",
        "stage": "Preparation",
        "start_time": datetime(2023, 10, 1, 8, 0).isoformat(),
        "end_time": datetime(2023, 10, 1, 8, 30).isoformat(),
        "location": "HQ",
        "status": "planned",
        "note": "準備場所を再確認",
    }
    base_payload.update(overrides)
    response = client.post(f"/schedules/{schedule_id}/tasks", json=base_payload)
    assert response.status_code == 201
    return response.json()


def test_schedule_crud(client: TestClient) -> None:
    schedule = _create_schedule(client)
    schedule_id = schedule["id"]

    listing = client.get("/schedules")
    assert listing.status_code == 200
    assert any(item["id"] == schedule_id for item in listing.json())

    update_response = client.put(
        f"/schedules/{schedule_id}",
        json={"name": "打ち合わせ二日目", "event_date": "2023-10-02"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["event_date"] == "2023-10-02"

    delete_response = client.delete(f"/schedules/{schedule_id}")
    assert delete_response.status_code == 204

    follow_up = client.get(f"/schedules/{schedule_id}")
    assert follow_up.status_code == 404
    assert follow_up.json()["detail"] == SCHEDULE_NOT_FOUND_DETAIL


def test_task_crud_flow(client: TestClient) -> None:
    schedule = _create_schedule(client)
    task = _create_task(client, schedule["id"])
    task_id = task["id"]

    created = client.get(f"/tasks/{task_id}")
    assert created.status_code == 200
    assert created.json()["status"] == "planned"

    update_response = client.put(
        f"/tasks/{task_id}",
        json={
            "stage": "Logistics",
            "note": "全員が順番に確認する",
            "status": "in_progress",
        },
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["stage"] == "Logistics"
    assert updated["status"] == "in_progress"

    fetched = client.get(f"/tasks/{task_id}")
    assert fetched.status_code == 200
    assert fetched.json()["note"] == "全員が順番に確認する"

    status_update = client.patch(
        f"/tasks/{task_id}/status",
        json={"status": "completed"},
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "completed"

    delete_response = client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    follow_up = client.get(f"/tasks/{task_id}")
    assert follow_up.status_code == 404
    assert follow_up.json()["detail"] == TASK_NOT_FOUND_DETAIL


def test_task_filters_and_schedule_removal(client: TestClient) -> None:
    schedule = _create_schedule(client)
    schedule_id = schedule["id"]
    _create_task(
        client,
        schedule_id,
        name="搬入準備",
        stage="Preparation",
        start_time=datetime(2023, 10, 1, 6, 0).isoformat(),
        end_time=datetime(2023, 10, 1, 7, 0).isoformat(),
    )
    _create_task(
        client,
        schedule_id,
        name="コース設営",
        stage="Course",
        status="in_progress",
        start_time=datetime(2023, 10, 1, 7, 0).isoformat(),
        end_time=datetime(2023, 10, 1, 9, 0).isoformat(),
    )
    _create_task(
        client,
        schedule_id,
        name="撤収開始",
        stage="Preparation",
        status="completed",
        start_time=datetime(2023, 10, 1, 9, 0).isoformat(),
        end_time=datetime(2023, 10, 1, 10, 0).isoformat(),
    )

    prep_tasks = client.get(f"/schedules/{schedule_id}/tasks", params={"stage": "Preparation"})
    assert prep_tasks.status_code == 200
    assert len(prep_tasks.json()) == 2

    completed_tasks = client.get(
        f"/schedules/{schedule_id}/tasks",
        params={"status": "completed"},
    )
    assert completed_tasks.status_code == 200
    assert len(completed_tasks.json()) == 1

    combined = client.get(
        f"/schedules/{schedule_id}/tasks",
        params={"stage": "preparation", "status": "completed"},
    )
    assert combined.status_code == 200
    filtered = combined.json()
    assert len(filtered) == 1
    assert filtered[0]["name"] == "撤収開始"

    delete_response = client.delete(f"/schedules/{schedule_id}")
    assert delete_response.status_code == 204

    follow_up = client.get(f"/schedules/{schedule_id}/tasks")
    assert follow_up.status_code == 404
    assert follow_up.json()["detail"] == SCHEDULE_NOT_FOUND_DETAIL
