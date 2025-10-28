"""メンバーAPIのテスト。"""

from __future__ import annotations

from backend.models import ContactInfo


def test_list_members_filter_by_part(client) -> None:
    response = client.get("/members", params={"part": "受付"})
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 2
    assert {member["name"] for member in payload} == {"山田海音", "鈴木紗良"}


def test_create_member(client) -> None:
    response = client.post(
        "/members",
        json={
            "name": "高橋優",
            "part": "ゴール",
            "position": "サポート",
            "contact": {"phone": "090-0000-0004", "email": "takahashi@example.com"},
        },
    )
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "高橋優"
    # Ensure list includes new member
    list_response = client.get("/members")
    assert any(member["name"] == "高橋優" for member in list_response.json())


def test_update_member(client) -> None:
    response = client.put(
        "/members/1",
        json={"position": "ディレクター", "contact": {"phone": "080-1111-2222"}},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["position"] == "ディレクター"
    assert body["contact"]["phone"] == "080-1111-2222"


def test_delete_member(client) -> None:
    response = client.delete("/members/2")
    assert response.status_code == 204
    follow_up = client.get("/members/2")
    assert follow_up.status_code == 404


def test_update_member_not_found(client) -> None:
    response = client.put(
        "/members/999",
        json={"position": "リーダー"},
    )
    assert response.status_code == 404


def test_member_contact_defaults() -> None:
    contact = ContactInfo()
    assert contact.phone is None
    assert contact.email is None
    assert contact.note is None
