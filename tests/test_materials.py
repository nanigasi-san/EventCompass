"""����API�̃e�X�g�B"""

from __future__ import annotations

from http import HTTPStatus

import pytest


def test_list_materials_returns_seed_data(client) -> None:
    response = client.get("/materials")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert [item["id"] for item in payload] == [1, 2, 3]
    assert payload[0]["name"] == "テント"
    assert payload[1]["quantity"] == 20


def test_list_materials_filters_part_case_insensitively(client) -> None:
    response = client.get("/materials", params={"part": "受付"})
    assert response.status_code == HTTPStatus.OK
    names = {item["name"] for item in response.json()}
    assert names == {"テント", "トランシーバー"}

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


def test_get_material_returns_single_record(client) -> None:
    response = client.get("/materials/1")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["name"] == "テント"
    assert payload["quantity"] == 2


def test_create_material_assigns_new_id(client) -> None:
    response = client.post(
        "/materials",
        json={"name": "バッテリー", "part": "コース", "quantity": 3},
    )
    assert response.status_code == HTTPStatus.CREATED
    payload = response.json()
    assert payload["id"] == 4
    assert payload["quantity"] == 3

    list_response = client.get("/materials")
    assert any(item["id"] == 4 for item in list_response.json())


def test_update_material_changes_selected_fields(client) -> None:
    response = client.put("/materials/1", json={"quantity": 4})
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["quantity"] == 4


def test_update_material_with_empty_body_returns_current_state(client) -> None:
    response = client.put("/materials/2", json={})
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["id"] == 2
    assert payload["name"] == "コーン"


def test_delete_material_removes_record(client) -> None:
    delete_response = client.delete("/materials/3")
    assert delete_response.status_code == HTTPStatus.NO_CONTENT
    follow_up = client.get("/materials/3")
    assert follow_up.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.parametrize("endpoint", ["/materials/999", "/materials/-1"])
def test_update_material_not_found(client, endpoint: str) -> None:
    response = client.put(endpoint, json={"quantity": 1})
    assert response.status_code == HTTPStatus.NOT_FOUND
