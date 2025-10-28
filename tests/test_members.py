"""�����o�[API�̃e�X�g�B"""

from __future__ import annotations

from http import HTTPStatus

import pytest

from backend.models import ContactInfo


def test_list_members_returns_seed_data_in_id_order(client) -> None:
    response = client.get("/members")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert [member["id"] for member in payload] == [1, 2, 3]
    assert payload[0]["name"] == "山田海音"
    assert payload[1]["part"] == "コース"


def test_list_members_filters_part_case_insensitively(client) -> None:
    response = client.get("/members", params={"part": "受付"})
    assert response.status_code == HTTPStatus.OK
    names = {item["name"] for item in response.json()}
    assert names == {"山田海音", "鈴木紗良"}

    create_response = client.post(
        "/members",
        json={
            "name": "Percussion Tester",
            "part": "Percussion",
            "position": "Support",
        },
    )
    assert create_response.status_code == HTTPStatus.CREATED

    case_response = client.get("/members", params={"part": "percussion"})
    assert case_response.status_code == HTTPStatus.OK
    payload = case_response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "Percussion Tester"
    assert payload[0]["part"] == "Percussion"


def test_get_member_returns_single_record(client) -> None:
    response = client.get("/members/1")
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["name"] == "山田海音"
    assert payload["contact"]["email"] == "yamada@example.com"


def test_create_member_assigns_new_id(client) -> None:
    response = client.post(
        "/members",
        json={
            "name": "高橋光",
            "part": "舞台",
            "position": "サポート",
            "contact": {
                "phone": "090-0000-0004",
                "email": "takahashi@example.com",
                "note": "MC",
            },
        },
    )
    assert response.status_code == HTTPStatus.CREATED
    payload = response.json()
    assert payload["id"] == 4
    assert payload["contact"]["note"] == "MC"

    list_response = client.get("/members")
    assert any(member["id"] == 4 for member in list_response.json())


def test_update_member_merges_partial_payload(client) -> None:
    response = client.put(
        "/members/1",
        json={
            "position": "ディレクター",
            "contact": {"phone": "080-1111-2222"},
        },
    )
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["position"] == "ディレクター"
    assert payload["contact"]["phone"] == "080-1111-2222"
    assert payload["contact"]["email"] is None


def test_update_member_with_empty_body_returns_current_state(client) -> None:
    response = client.put("/members/2", json={})
    assert response.status_code == HTTPStatus.OK
    payload = response.json()
    assert payload["id"] == 2
    assert payload["name"] == "佐藤陽向"


def test_delete_member_removes_record(client) -> None:
    delete_response = client.delete("/members/3")
    assert delete_response.status_code == HTTPStatus.NO_CONTENT
    follow_up = client.get("/members/3")
    assert follow_up.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.parametrize("endpoint", ["/members/999", "/members/-1"])
def test_update_member_not_found(client, endpoint: str) -> None:
    response = client.put(endpoint, json={"position": "リーダー"})
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_member_contact_defaults() -> None:
    contact = ContactInfo()
    assert contact.phone is None
    assert contact.email is None
    assert contact.note is None
