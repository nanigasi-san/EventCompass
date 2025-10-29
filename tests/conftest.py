"""ストア操作を対象にした pytest フィクスチャ。"""

# ruff: noqa: I001

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path
import sys

# ルートディレクトリを import パスへ追加し、テストから backend パッケージを参照できるようにする
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from backend.models import ContactInfo, MaterialCreate, MemberCreate
from backend.store import SQLiteStore


def _seed_members(store: SQLiteStore) -> None:
    """テスト用にメンバーの初期データを投入する。"""

    members = [
        MemberCreate(
            name="Kento Tanaka",
            part="Reception",
            position="Leader",
            contact=ContactInfo(phone="090-0000-0001", email="tanaka@example.com"),
        ),
        MemberCreate(
            name="Haruka Sato",
            part="Course",
            position="Support",
            contact=ContactInfo(phone="090-0000-0002", email="sato@example.com"),
        ),
        MemberCreate(
            name="Sora Suzuki",
            part="Reception",
            position="Support",
            contact=ContactInfo(phone="090-0000-0003", email="suzuki@example.com"),
        ),
    ]
    for member in members:
        store.create_member(member)


def _seed_materials(store: SQLiteStore) -> None:
    """テスト用に資材の初期データを投入する。"""

    materials = [
        MaterialCreate(name="Tent", part="Reception", quantity=2),
        MaterialCreate(name="Traffic Cone", part="Course", quantity=20),
        MaterialCreate(name="Transceiver", part="Reception", quantity=5),
    ]
    for material in materials:
        store.create_material(material)


@pytest.fixture()
def seeded_store(tmp_path: Path) -> Iterator[SQLiteStore]:
    """毎回クリアな SQLiteStore を生成し、サンプルデータ入りで提供する。"""

    store = SQLiteStore(tmp_path / "eventcompass.db")
    _seed_members(store)
    _seed_materials(store)
    try:
        yield store
    finally:
        store.close()
