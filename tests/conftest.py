"""共通テストフィクスチャ。"""

# ruff: noqa: I001

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient

from backend.main import app, get_store
from backend.models import ContactInfo, MaterialCreate, MemberCreate
from backend.store import SQLiteStore


@pytest.fixture()
def store(tmp_path: Path) -> Iterator[SQLiteStore]:
    """サンプルデータを持つストアを返す。"""

    store = SQLiteStore(tmp_path / "eventcompass.db")
    store.create_member(
        MemberCreate(
            name="山田海音",
            part="受付",
            position="リーダー",
            contact=ContactInfo(phone="090-0000-0001", email="yamada@example.com"),
        )
    )
    store.create_member(
        MemberCreate(
            name="佐藤陽向",
            part="コース",
            position="サポート",
            contact=ContactInfo(phone="090-0000-0002", email="sato@example.com"),
        )
    )
    store.create_member(
        MemberCreate(
            name="鈴木紗良",
            part="受付",
            position="サポート",
            contact=ContactInfo(phone="090-0000-0003", email="suzuki@example.com"),
        )
    )

    store.create_material(MaterialCreate(name="テント", part="受付", quantity=2))
    store.create_material(MaterialCreate(name="コーン", part="コース", quantity=20))
    store.create_material(MaterialCreate(name="トランシーバー", part="受付", quantity=5))

    yield store
    store.close()


@pytest.fixture()
def client(store: SQLiteStore) -> Iterator[TestClient]:
    """依存関係を差し替えた `TestClient` を返す。"""

    app.dependency_overrides[get_store] = lambda: store
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
