"""メンバーストア操作のテスト。"""

from __future__ import annotations

import pytest

from backend.models import ContactInfo, MemberCreate, MemberUpdate
from backend.store import SQLiteStore


def test_list_members_returns_seed_data_in_id_order(seeded_store: SQLiteStore) -> None:
    members = seeded_store.list_members()
    assert [member.id for member in members] == [1, 2, 3]
    assert members[0].name == "Kento Tanaka"
    assert members[1].part == "Course"


def test_list_members_filters_part_case_insensitively(seeded_store: SQLiteStore) -> None:
    filtered = seeded_store.list_members(part="Reception")
    assert {member.name for member in filtered} == {"Kento Tanaka", "Sora Suzuki"}

    created = seeded_store.create_member(
        MemberCreate(
            name="Percussion Tester", part="Percussion", position="Support", contact=ContactInfo()
        )
    )
    assert created.id == 4

    filtered_lower = seeded_store.list_members(part="percussion")
    assert len(filtered_lower) == 1
    assert filtered_lower[0].name == "Percussion Tester"


def test_get_member_returns_single_record(seeded_store: SQLiteStore) -> None:
    member = seeded_store.get_member(1)
    assert member.name == "Kento Tanaka"
    assert member.contact.email == "tanaka@example.com"


def test_create_member_assigns_new_id(seeded_store: SQLiteStore) -> None:
    created = seeded_store.create_member(
        MemberCreate(
            name="Hikari Takahashi",
            part="Stage",
            position="Support",
            contact=ContactInfo(phone="090-0000-0004", email="takahashi@example.com", note="MC"),
        )
    )
    assert created.id == 4
    assert created.contact.note == "MC"

    members = seeded_store.list_members()
    assert any(member.id == 4 for member in members)


def test_update_member_merges_partial_payload(seeded_store: SQLiteStore) -> None:
    updated = seeded_store.update_member(
        1,
        MemberUpdate(position="Director", contact=ContactInfo(phone="080-1111-2222")),
    )
    assert updated.position == "Director"
    assert updated.contact.phone == "080-1111-2222"
    stored = seeded_store.get_member(1)
    assert stored.contact.phone == "080-1111-2222"
    assert stored.contact.email is None


def test_update_member_with_empty_body_returns_current_state(seeded_store: SQLiteStore) -> None:
    updated = seeded_store.update_member(2, MemberUpdate())
    assert updated.id == 2
    assert updated.name == "Haruka Sato"


def test_delete_member_removes_record(seeded_store: SQLiteStore) -> None:
    seeded_store.delete_member(3)
    with pytest.raises(KeyError):
        seeded_store.get_member(3)


@pytest.mark.parametrize("member_id", [999, -1])
def test_update_member_not_found(seeded_store: SQLiteStore, member_id: int) -> None:
    with pytest.raises(KeyError):
        seeded_store.update_member(member_id, MemberUpdate(position="Leader"))


def test_member_contact_defaults() -> None:
    contact = ContactInfo()
    assert contact.phone is None
    assert contact.email is None
    assert contact.note is None
