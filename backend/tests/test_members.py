"""メンバー API のテスト。"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.main import MEMBER_NOT_FOUND_DETAIL


def test_list_members_returns_seed_data_in_id_order(client: TestClient) -> None:
    response = client.get("/members")
    assert response.status_code == 200
    members = response.json()
    assert [member["id"] for member in members] == [1, 2, 3]
    assert members[0]["name"] == "Kento Tanaka"
    assert members[1]["part"] == "Course"


def test_list_members_filters_part_case_insensitively(client: TestClient) -> None:
    filtered = client.get("/members", params={"part": "Reception"})
    assert filtered.status_code == 200
    assert {item["name"] for item in filtered.json()} == {"Kento Tanaka", "Sora Suzuki"}

    create_payload = {
        "name": "Percussion Tester",
        "part": "Percussion",
        "position": "Support",
        "contact": {"note": "Lead"},
    }
    created = client.post("/members", json=create_payload)
    assert created.status_code == 201
    created_body = created.json()
    assert created_body["id"] == 4

    filtered_lower = client.get("/members", params={"part": "percussion"})
    assert filtered_lower.status_code == 200
    filtered_members = filtered_lower.json()
    assert len(filtered_members) == 1
    assert filtered_members[0]["name"] == "Percussion Tester"


def test_get_member_returns_single_record(client: TestClient) -> None:
    response = client.get("/members/1")
    assert response.status_code == 200
    member = response.json()
    assert member["name"] == "Kento Tanaka"
    assert member["contact"]["email"] == "tanaka@example.com"


def test_create_member_assigns_new_id(client: TestClient) -> None:
    payload = {
        "name": "Hikari Takahashi",
        "part": "Stage",
        "position": "Support",
        "contact": {
            "phone": "090-0000-0004",
            "email": "takahashi@example.com",
            "note": "MC",
        },
    }
    response = client.post("/members", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == 4
    assert created["contact"]["note"] == "MC"

    lookup = client.get("/members/4")
    assert lookup.status_code == 200
    assert lookup.json()["contact"]["note"] == "MC"


def test_update_member_merges_partial_payload(client: TestClient) -> None:
    response = client.put(
        "/members/1",
        json={"position": "Director", "contact": {"phone": "080-1111-2222"}},
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["position"] == "Director"
    assert updated["contact"]["phone"] == "080-1111-2222"

    stored = client.get("/members/1")
    assert stored.status_code == 200
    stored_body = stored.json()
    assert stored_body["contact"]["phone"] == "080-1111-2222"
    assert stored_body["contact"]["email"] is None


def test_update_member_with_empty_body_returns_current_state(client: TestClient) -> None:
    response = client.put("/members/2", json={})
    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == 2
    assert updated["name"] == "Haruka Sato"


def test_delete_member_removes_record(client: TestClient) -> None:
    delete_response = client.delete("/members/3")
    assert delete_response.status_code == 204
    follow_up = client.get("/members/3")
    assert follow_up.status_code == 404
    assert follow_up.json()["detail"] == MEMBER_NOT_FOUND_DETAIL


@pytest.mark.parametrize("member_id", [999, -1])
def test_update_member_not_found(client: TestClient, member_id: int) -> None:
    response = client.put(f"/members/{member_id}", json={"position": "Leader"})
    assert response.status_code == 404
    assert response.json()["detail"] == MEMBER_NOT_FOUND_DETAIL


def test_member_contact_defaults(client: TestClient) -> None:
    payload = {
        "name": "Default Contact User",
        "part": "Info",
        "position": "Support",
        "contact": {},
    }
    response = client.post("/members", json=payload)
    assert response.status_code == 201
    member = response.json()
    assert member["contact"]["phone"] is None
    assert member["contact"]["email"] is None
    assert member["contact"]["note"] is None
