"""EventCompass バックエンドの FastAPI アプリケーション。"""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status

from .models import (
    Material,
    MaterialCreate,
    MaterialUpdate,
    Member,
    MemberCreate,
    MemberUpdate,
)
from .store import SQLiteStore

app = FastAPI(title="EventCompass Backend", version="1.0.0")
_default_db_path = Path(__file__).resolve().parent / "eventcompass.db"
# アプリ全体で再利用する単一のストアインスタンス
_store = SQLiteStore(_default_db_path)


def get_store() -> SQLiteStore:
    """依存解決用に共有しているストアを返す。"""

    return _store


# 依存性注入やクエリパラメータの型定義に使うエイリアス
StoreDep = Annotated[SQLiteStore, Depends(get_store)]
MemberPartFilter = Annotated[str | None, Query(description="担当パートによるフィルタ")]
MaterialPartFilter = Annotated[str | None, Query(description="担当パートによるフィルタ")]


def _not_found(detail: str) -> HTTPException:
    """404 応答を組み立てるヘルパー。"""

    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


MEMBER_NOT_FOUND_DETAIL = "メンバーが見つかりません"
MATERIAL_NOT_FOUND_DETAIL = "資材が見つかりません"


# -- Member endpoints ------------------------------------------------------
@app.get("/members", response_model=list[Member])
def list_members(store: StoreDep, part: MemberPartFilter = None) -> list[Member]:
    """メンバー一覧を取得する。"""

    return store.list_members(part=part)


@app.get("/members/{member_id}", response_model=Member)
def get_member(member_id: int, store: StoreDep) -> Member:
    """メンバー詳細を取得する。"""

    try:
        return store.get_member(member_id)
    except KeyError as exc:  # pragma: no cover - defensive
        raise _not_found(MEMBER_NOT_FOUND_DETAIL) from exc


@app.post("/members", response_model=Member, status_code=status.HTTP_201_CREATED)
def create_member(payload: MemberCreate, store: StoreDep) -> Member:
    """メンバーを新規登録する。"""

    return store.create_member(payload)


@app.put("/members/{member_id}", response_model=Member)
def update_member(
    member_id: int,
    payload: MemberUpdate,
    store: StoreDep,
) -> Member:
    """メンバー情報を更新する。"""

    try:
        return store.update_member(member_id, payload)
    except KeyError as exc:
        raise _not_found(MEMBER_NOT_FOUND_DETAIL) from exc


@app.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, store: StoreDep) -> None:
    """メンバーを削除する。"""

    try:
        store.delete_member(member_id)
    except KeyError as exc:
        raise _not_found(MEMBER_NOT_FOUND_DETAIL) from exc


# -- Material endpoints ----------------------------------------------------
@app.get("/materials", response_model=list[Material])
def list_materials(store: StoreDep, part: MaterialPartFilter = None) -> list[Material]:
    """資材一覧を取得する。"""

    return store.list_materials(part=part)


@app.get("/materials/{material_id}", response_model=Material)
def get_material(material_id: int, store: StoreDep) -> Material:
    """資材詳細を取得する。"""

    try:
        return store.get_material(material_id)
    except KeyError as exc:  # pragma: no cover - defensive
        raise _not_found(MATERIAL_NOT_FOUND_DETAIL) from exc


@app.post("/materials", response_model=Material, status_code=status.HTTP_201_CREATED)
def create_material(payload: MaterialCreate, store: StoreDep) -> Material:
    """資材を新規登録する。"""

    return store.create_material(payload)


@app.put("/materials/{material_id}", response_model=Material)
def update_material(
    material_id: int,
    payload: MaterialUpdate,
    store: StoreDep,
) -> Material:
    """資材情報を更新する。"""

    try:
        return store.update_material(material_id, payload)
    except KeyError as exc:
        raise _not_found(MATERIAL_NOT_FOUND_DETAIL) from exc


@app.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int, store: StoreDep) -> None:
    """資材を削除する。"""

    try:
        store.delete_material(material_id)
    except KeyError as exc:
        raise _not_found(MATERIAL_NOT_FOUND_DETAIL) from exc
