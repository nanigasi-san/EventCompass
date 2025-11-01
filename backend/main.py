"""EventCompass バックエンドの FastAPI アプリケーション。"""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    Material,
    MaterialCreate,
    MaterialUpdate,
    Member,
    MemberCreate,
    MemberUpdate,
    Schedule,
    ScheduleCreate,
    ScheduleUpdate,
    Task,
    TaskCreate,
    TaskStatus,
    TaskStatusUpdate,
    TaskUpdate,
    Todo,
    TodoCreate,
    TodoUpdate,
)
from .store import SQLiteStore

app = FastAPI(title="EventCompass Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
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
TaskStageFilter = Annotated[str | None, Query(description="タスクのステージによるフィルタ")]
TaskStatusFilter = Annotated[
    TaskStatus | None,
    Query(description="タスクの状態によるフィルタ"),
]


def _not_found(detail: str) -> HTTPException:
    """404 応答を組み立てるヘルパー。"""

    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


MEMBER_NOT_FOUND_DETAIL = "メンバーが見つかりません"
MATERIAL_NOT_FOUND_DETAIL = "資材が見つかりません"
SCHEDULE_NOT_FOUND_DETAIL = "スケジュールが見つかりません"
TASK_NOT_FOUND_DETAIL = "タスクが見つかりません"
TODO_NOT_FOUND_DETAIL = "ToDo が見つかりません"


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


# -- Schedule endpoints ----------------------------------------------------
@app.get("/schedules", response_model=list[Schedule])
def list_schedules(store: StoreDep) -> list[Schedule]:
    """スケジュール一覧を取得する。"""

    return store.list_schedules()


@app.get("/schedules/{schedule_id}", response_model=Schedule)
def get_schedule(schedule_id: int, store: StoreDep) -> Schedule:
    """スケジュールの詳細を取得する。"""

    try:
        return store.get_schedule(schedule_id)
    except KeyError as exc:  # pragma: no cover - defensive
        raise _not_found(SCHEDULE_NOT_FOUND_DETAIL) from exc


@app.post("/schedules", response_model=Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule(payload: ScheduleCreate, store: StoreDep) -> Schedule:
    """スケジュールを新規登録する。"""

    try:
        return store.create_schedule(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@app.put("/schedules/{schedule_id}", response_model=Schedule)
def update_schedule(
    schedule_id: int, payload: ScheduleUpdate, store: StoreDep
) -> Schedule:
    """スケジュール情報を更新する。"""

    try:
        return store.update_schedule(schedule_id, payload)
    except KeyError as exc:
        raise _not_found(SCHEDULE_NOT_FOUND_DETAIL) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@app.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, store: StoreDep) -> None:
    """スケジュールを削除する。"""

    try:
        store.delete_schedule(schedule_id)
    except KeyError as exc:
        raise _not_found(SCHEDULE_NOT_FOUND_DETAIL) from exc


@app.get("/schedules/{schedule_id}/tasks", response_model=list[Task])
def list_tasks(
    schedule_id: int,
    store: StoreDep,
    stage: TaskStageFilter = None,
    status: TaskStatusFilter = None,
) -> list[Task]:
    """スケジュールに紐づくタスク一覧を取得する。"""

    try:
        return store.list_tasks(schedule_id, stage=stage, status=status)
    except KeyError as exc:
        raise _not_found(SCHEDULE_NOT_FOUND_DETAIL) from exc


@app.post(
    "/schedules/{schedule_id}/tasks",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
)
def create_task(schedule_id: int, payload: TaskCreate, store: StoreDep) -> Task:
    """指定したスケジュールにタスクを追加する。"""

    try:
        return store.create_task(schedule_id, payload)
    except KeyError as exc:
        raise _not_found(SCHEDULE_NOT_FOUND_DETAIL) from exc


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int, store: StoreDep) -> Task:
    """タスク詳細を取得する。"""

    try:
        return store.get_task(task_id)
    except KeyError as exc:  # pragma: no cover - defensive
        raise _not_found(TASK_NOT_FOUND_DETAIL) from exc


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, payload: TaskUpdate, store: StoreDep) -> Task:
    """タスク情報を更新する。"""

    try:
        return store.update_task(task_id, payload)
    except KeyError as exc:
        raise _not_found(TASK_NOT_FOUND_DETAIL) from exc


@app.patch("/tasks/{task_id}/status", response_model=Task)
def update_task_status(
    task_id: int, payload: TaskStatusUpdate, store: StoreDep
) -> Task:
    """タスクの状態のみを更新する。"""

    try:
        return store.update_task_status(task_id, payload.status)
    except KeyError as exc:
        raise _not_found(TASK_NOT_FOUND_DETAIL) from exc


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, store: StoreDep) -> None:
    """タスクを削除する。"""

    try:
        store.delete_task(task_id)
    except KeyError as exc:
        raise _not_found(TASK_NOT_FOUND_DETAIL) from exc




# -- Todo endpoints -------------------------------------------------------
@app.get("/todos", response_model=list[Todo])
def list_todos_endpoint(store: StoreDep) -> list[Todo]:
    """ToDo リストを取得する。"""

    return store.list_todos()


@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo_endpoint(todo_id: int, store: StoreDep) -> Todo:
    """単一の ToDo を取得する。"""

    try:
        return store.get_todo(todo_id)
    except KeyError as exc:  # pragma: no cover - defensive
        raise _not_found(TODO_NOT_FOUND_DETAIL) from exc


@app.post("/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
def create_todo_endpoint(payload: TodoCreate, store: StoreDep) -> Todo:
    """ToDo を新規登録する。"""

    try:
        return store.create_todo(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo_endpoint(todo_id: int, payload: TodoUpdate, store: StoreDep) -> Todo:
    """既存の ToDo を更新する。"""

    try:
        return store.update_todo(todo_id, payload)
    except KeyError as exc:
        raise _not_found(TODO_NOT_FOUND_DETAIL) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_endpoint(todo_id: int, store: StoreDep) -> None:
    """ToDo を削除する。"""

    try:
        store.delete_todo(todo_id)
    except KeyError as exc:
        raise _not_found(TODO_NOT_FOUND_DETAIL) from exc


@app.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
def reset_database(store: StoreDep) -> None:
    """Reset every table (testing & maintenance)."""

    store.reset()

