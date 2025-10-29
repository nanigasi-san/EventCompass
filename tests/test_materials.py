"""資材ストア操作のテスト。"""

from __future__ import annotations

import pytest

from backend.models import MaterialCreate, MaterialUpdate
from backend.store import SQLiteStore


def test_list_materials_returns_seed_data(seeded_store: SQLiteStore) -> None:
    materials = seeded_store.list_materials()
    assert [item.id for item in materials] == [1, 2, 3]
    assert materials[0].name == "Tent"
    assert materials[1].quantity == 20


def test_list_materials_filters_part_case_insensitively(seeded_store: SQLiteStore) -> None:
    filtered = seeded_store.list_materials(part="Reception")
    assert {item.name for item in filtered} == {"Tent", "Transceiver"}

    created = seeded_store.create_material(
        MaterialCreate(name="Stage Light", part="Lighting", quantity=6)
    )
    assert created.id == 4

    filtered_lower = seeded_store.list_materials(part="lighting")
    assert len(filtered_lower) == 1
    assert filtered_lower[0].name == "Stage Light"


def test_get_material_returns_single_record(seeded_store: SQLiteStore) -> None:
    material = seeded_store.get_material(1)
    assert material.name == "Tent"
    assert material.quantity == 2


def test_create_material_assigns_new_id(seeded_store: SQLiteStore) -> None:
    created = seeded_store.create_material(
        MaterialCreate(name="Battery Pack", part="Course", quantity=3)
    )
    assert created.id == 4
    assert created.quantity == 3

    materials = seeded_store.list_materials()
    assert any(item.id == 4 for item in materials)


def test_update_material_changes_selected_fields(
    seeded_store: SQLiteStore,
) -> None:
    updated = seeded_store.update_material(1, MaterialUpdate(quantity=4))
    assert updated.quantity == 4
    stored = seeded_store.get_material(1)
    assert stored.quantity == 4


def test_update_material_with_empty_body_returns_current_state(
    seeded_store: SQLiteStore,
) -> None:
    updated = seeded_store.update_material(2, MaterialUpdate())
    assert updated.id == 2
    assert updated.name == "Traffic Cone"


def test_delete_material_removes_record(seeded_store: SQLiteStore) -> None:
    seeded_store.delete_material(3)
    with pytest.raises(KeyError):
        seeded_store.get_material(3)


@pytest.mark.parametrize("material_id", [999, -1])
def test_update_material_not_found(seeded_store: SQLiteStore, material_id: int) -> None:
    with pytest.raises(KeyError):
        seeded_store.update_material(material_id, MaterialUpdate(quantity=1))
