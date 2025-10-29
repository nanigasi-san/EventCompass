"""資材 API エンドポイントのテスト。"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.main import MATERIAL_NOT_FOUND_DETAIL


def test_list_materials_returns_seed_data(client: TestClient) -> None:
    response = client.get("/materials")
    assert response.status_code == 200
    materials = response.json()
    assert [item["id"] for item in materials] == [1, 2, 3]
    assert materials[0]["name"] == "Tent"
    assert materials[1]["quantity"] == 20


def test_list_materials_filters_part_case_insensitively(client: TestClient) -> None:
    filtered = client.get("/materials", params={"part": "Reception"})
    assert filtered.status_code == 200
    assert {item["name"] for item in filtered.json()} == {"Tent", "Transceiver"}

    create_payload = {"name": "Stage Light", "part": "Lighting", "quantity": 6}
    created = client.post("/materials", json=create_payload)
    assert created.status_code == 201
    assert created.json()["id"] == 4

    filtered_lower = client.get("/materials", params={"part": "lighting"})
    assert filtered_lower.status_code == 200
    filtered_items = filtered_lower.json()
    assert len(filtered_items) == 1
    assert filtered_items[0]["name"] == "Stage Light"


def test_get_material_returns_single_record(client: TestClient) -> None:
    response = client.get("/materials/1")
    assert response.status_code == 200
    material = response.json()
    assert material["name"] == "Tent"
    assert material["quantity"] == 2


def test_create_material_assigns_new_id(client: TestClient) -> None:
    payload = {"name": "Battery Pack", "part": "Course", "quantity": 3}
    response = client.post("/materials", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == 4
    assert created["quantity"] == 3

    lookup = client.get("/materials/4")
    assert lookup.status_code == 200
    assert lookup.json()["quantity"] == 3


def test_update_material_changes_selected_fields(client: TestClient) -> None:
    response = client.put("/materials/1", json={"quantity": 4})
    assert response.status_code == 200
    updated = response.json()
    assert updated["quantity"] == 4

    stored = client.get("/materials/1")
    assert stored.status_code == 200
    assert stored.json()["quantity"] == 4


def test_update_material_with_empty_body_returns_current_state(client: TestClient) -> None:
    response = client.put("/materials/2", json={})
    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == 2
    assert updated["name"] == "Traffic Cone"


def test_delete_material_removes_record(client: TestClient) -> None:
    delete_response = client.delete("/materials/3")
    assert delete_response.status_code == 204

    follow_up = client.get("/materials/3")
    assert follow_up.status_code == 404
    assert follow_up.json()["detail"] == MATERIAL_NOT_FOUND_DETAIL


@pytest.mark.parametrize("material_id", [999, -1])
def test_update_material_not_found(client: TestClient, material_id: int) -> None:
    response = client.put(f"/materials/{material_id}", json={"quantity": 1})
    assert response.status_code == 404
    assert response.json()["detail"] == MATERIAL_NOT_FOUND_DETAIL
