from __future__ import annotations

from datetime import date

from fastapi.testclient import TestClient


def test_create_and_get_todo(client: TestClient) -> None:
    payload = {
        "title": "会場準備の最終チェック",
        "description": "ステージ周りの安全確認を実施する",
        "due_date": "2025-01-05",
        "status": "pending",
        "assignee_id": 1,
    }
    response = client.post("/todos", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]
    assert data["due_date"] == payload["due_date"]
    assert data["status"] == payload["status"]
    assert data["assignee_id"] == payload["assignee_id"]

    todo_id = data["id"]
    get_response = client.get(f"/todos/{todo_id}")
    assert get_response.status_code == 200
    assert get_response.json() == data


def test_create_todo_with_invalid_member(client: TestClient) -> None:
    payload = {
        "title": "案内板の差し替え",
        "description": None,
        "due_date": None,
        "status": "pending",
        "assignee_id": 999,
    }
    response = client.post("/todos", json=payload)
    assert response.status_code == 400


def test_list_and_update_todos(client: TestClient) -> None:
    first = client.post(
        "/todos",
        json={
            "title": "配布資料の最終印刷",
            "description": None,
            "due_date": "2025-01-02",
            "status": "pending",
            "assignee_id": 2,
        },
    ).json()
    second = client.post(
        "/todos",
        json={
            "title": "受付ブース設営",
            "description": "ポスター掲示まで実施する",
            "due_date": "2025-01-01",
            "status": "pending",
            "assignee_id": 1,
        },
    ).json()

    list_response = client.get("/todos")
    assert list_response.status_code == 200
    todos = list_response.json()
    assert [todo["id"] for todo in todos] == [second["id"], first["id"]]

    update_response = client.put(
        f"/todos/{first['id']}",
        json={
            "status": "completed",
            "due_date": "2025-01-03",
            "assignee_id": None,
        },
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["status"] == "completed"
    assert updated["due_date"] == "2025-01-03"
    assert updated["assignee_id"] is None


def test_delete_todo(client: TestClient) -> None:
    response = client.post(
        "/todos",
        json={
            "title": "当日スタッフの集合確認",
            "description": None,
            "due_date": date.today().isoformat(),
            "status": "pending",
            "assignee_id": 1,
        },
    )
    todo_id = response.json()["id"]

    delete_response = client.delete(f"/todos/{todo_id}")
    assert delete_response.status_code == 204

    not_found = client.get(f"/todos/{todo_id}")
    assert not_found.status_code == 404
