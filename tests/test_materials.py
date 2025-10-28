"""資材 API の振る舞いを検証するテスト。"""

from __future__ import annotations

from http import HTTPStatus

import pytest
from starlette.testclient import TestClient

from backend.store import SQLiteStore


def test_list_materials_returns_seed_data(client: TestClient) -> None:
    response = client.get("/materials")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert [item["id"] for item in payload] == [1, 2, 3]
    assert payload[0]["name"] == "Tent"
    assert payload[1]["quantity"] == 20


def test_list_materials_filters_part_case_insensitively(client: TestClient) -> None:
    response = client.get("/materials", params={"part": "Reception"})
    assert response.status_code == HTTPStatus.OK
    names = {item["name"] for item in response.json()}
    assert names == {"Tent", "Transceiver"}

    # 追加登録した資材がフィルタ結果へ反映されることをチェックする
    create_response = client.post(
        "/materials",
        json={"name": "Stage Light", "part": "Lighting", "quantity": 6},
    )
    assert create_response.status_code == HTTPStatus.CREATED

    case_response = client.get("/materials", params={"part": "lighting"})
    assert case_response.status_code == HTTPStatus.OK
    payload = case_response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "Stage Light"
    assert payload[0]["part"] == "Lighting"


def test_get_material_returns_single_record(client: TestClient) -> None:
    response = client.get("/materials/1")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["name"] == "Tent"
    assert payload["quantity"] == 2


def test_create_material_assigns_new_id(client: TestClient) -> None:
    response = client.post(
        "/materials",
        json={"name": "Battery Pack", "part": "Course", "quantity": 3},
    )
    assert response.status_code == HTTPStatus.CREATED
    payload = response.json()
    assert payload["id"] == 4
    assert payload["quantity"] == 3

    list_response = client.get("/materials")
    assert any(item["id"] == 4 for item in list_response.json())


def test_update_material_changes_selected_fields(
    client: TestClient, seeded_store: SQLiteStore
) -> None:
    response = client.put("/materials/1", json={"quantity": 4})
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["quantity"] == 4
    stored = seeded_store.get_material(1)
    assert stored.quantity == 4


def test_update_material_with_empty_body_returns_current_state(
    client: TestClient,
) -> None:
    response = client.put("/materials/2", json={})
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["id"] == 2
    assert payload["name"] == "Traffic Cone"


def test_delete_material_removes_record(client: TestClient) -> None:
    delete_response = client.delete("/materials/3")
    assert delete_response.status_code == HTTPStatus.NO_CONTENT
    follow_up = client.get("/materials/3")
    assert follow_up.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.parametrize("endpoint", ["/materials/999", "/materials/-1"])
def test_update_material_not_found(client: TestClient, endpoint: str) -> None:
    response = client.put(endpoint, json={"quantity": 1})
    assert response.status_code == HTTPStatus.NOT_FOUND
