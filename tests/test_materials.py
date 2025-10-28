"""資材APIのテスト。"""

from __future__ import annotations


def test_list_materials_filter_by_part(client) -> None:
    response = client.get("/materials", params={"part": "受付"})
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    assert {item["name"] for item in payload} == {"テント", "トランシーバー"}


def test_create_material(client) -> None:
    response = client.post(
        "/materials",
        json={"name": "給水タンク", "part": "コース", "quantity": 3},
    )
    assert response.status_code == 201
    created = response.json()
    assert created["quantity"] == 3
    list_response = client.get("/materials")
    assert any(item["name"] == "給水タンク" for item in list_response.json())


def test_update_material(client) -> None:
    response = client.put("/materials/1", json={"quantity": 4})
    assert response.status_code == 200
    assert response.json()["quantity"] == 4


def test_delete_material(client) -> None:
    response = client.delete("/materials/2")
    assert response.status_code == 204
    follow_up = client.get("/materials/2")
    assert follow_up.status_code == 404


def test_update_material_not_found(client) -> None:
    response = client.put("/materials/999", json={"quantity": 1})
    assert response.status_code == 404
