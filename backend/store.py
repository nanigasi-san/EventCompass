"""SQLite バックエンド向けの永続化レイヤー。"""

from __future__ import annotations

import sqlite3
from collections.abc import Iterable
from datetime import date, datetime
from pathlib import Path
from threading import Lock

from .models import (
    ContactInfo,
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
    TaskUpdate,
)


class SQLiteStore:
    """SQLite3 を利用したシンプルなストア実装。"""

    def __init__(self, database: str | Path) -> None:
        self._database = str(database)
        # 複数スレッドから同時にアクセスされても整合性を保つためのロック
        self._lock = Lock()
        self._conn: sqlite3.Connection | None = sqlite3.connect(
            self._database, check_same_thread=False
        )
        # クエリ結果を辞書風に扱えるようにする
        self._conn.row_factory = sqlite3.Row
        # 外部キー制約を有効化する
        self._conn.execute("PRAGMA foreign_keys = ON")
        self._init_schema()

    # -- 内部ユーティリティ -------------------------------------------------
    def _connection(self) -> sqlite3.Connection:
        """閉じていない SQLite 接続を取得する。"""

        conn = self._conn
        if conn is None:  # pragma: no cover - defensive
            raise RuntimeError("ストアは既にクローズされています")
        return conn

    def _init_schema(self) -> None:
        """必要なテーブルが無ければ作成する。"""

        with self._lock:
            conn = self._connection()
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    part TEXT NOT NULL,
                    position TEXT NOT NULL,
                    contact_phone TEXT,
                    contact_email TEXT,
                    contact_note TEXT
                );

                CREATE TABLE IF NOT EXISTS materials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    part TEXT NOT NULL,
                    quantity INTEGER NOT NULL CHECK(quantity >= 0)
                );

                CREATE TABLE IF NOT EXISTS schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    event_date TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    schedule_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    location TEXT,
                    status TEXT NOT NULL,
                    note TEXT,
                    FOREIGN KEY(schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_tasks_schedule ON tasks(schedule_id);
                """
            )
            # SQLite の既存スキーマに start_time / end_time が無い場合は追加する
            self._ensure_schedule_columns(conn)
            conn.commit()

    def _ensure_schedule_columns(self, conn: sqlite3.Connection) -> None:
        """schedules テーブルに start_time / end_time 列が無ければ追加する。"""

        existing = {row["name"] for row in conn.execute("PRAGMA table_info(schedules)").fetchall()}
        for column in ("start_time", "end_time"):
            if column not in existing:
                conn.execute(f"ALTER TABLE schedules ADD COLUMN {column} TEXT")
                # 既存レコードには event_date を基にデフォルトを設定しておく
                if column == "start_time":
                    conn.execute(
                        "UPDATE schedules SET start_time = event_date || 'T00:00:00'"
                    )
                elif column == "end_time":
                    conn.execute(
                        "UPDATE schedules SET end_time = event_date || 'T23:59:59'"
                    )

    # -- Member operations -------------------------------------------------
    def list_members(self, part: str | None = None) -> list[Member]:
        query = (
            "SELECT id, name, part, position, contact_phone, contact_email, contact_note"
            " FROM members"
        )
        params: Iterable[object] = ()
        if part is not None:
            # LOWER 比較で大文字小文字を区別せずにフィルタする
            query += " WHERE lower(part) = lower(?)"
            params = (part,)
        query += " ORDER BY id"
        with self._lock:
            rows = self._connection().execute(query, params).fetchall()
        return [self._row_to_member(row) for row in rows]

    def get_member(self, member_id: int) -> Member:
        with self._lock:
            row = (
                self._connection()
                .execute(
                    "SELECT id, name, part, position, contact_phone, contact_email, contact_note"
                    " FROM members WHERE id = ?",
                    (member_id,),
                )
                .fetchone()
            )
        if row is None:
            raise KeyError(member_id)
        return self._row_to_member(row)

    def create_member(self, payload: MemberCreate) -> Member:
        contact = payload.contact
        with self._lock:
            cursor = self._connection().execute(
                (
                    "INSERT INTO members (name, part, position, contact_phone, contact_email, "
                    "contact_note) VALUES (?, ?, ?, ?, ?, ?)"
                ),
                (
                    payload.name,
                    payload.part,
                    payload.position,
                    contact.phone,
                    contact.email,
                    contact.note,
                ),
            )
            self._connection().commit()
            member_id = cursor.lastrowid
        data = payload.model_dump()
        data["id"] = member_id
        return Member(**data)

    def update_member(self, member_id: int, payload: MemberUpdate) -> Member:
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            # 変更が無ければ既存データをそのまま返す
            return self.get_member(member_id)

        columns: list[str] = []
        params: list[object] = []
        if "name" in update_data:
            columns.append("name = ?")
            params.append(update_data["name"])
        if "part" in update_data:
            columns.append("part = ?")
            params.append(update_data["part"])
        if "position" in update_data:
            columns.append("position = ?")
            params.append(update_data["position"])
        contact_update = update_data.pop("contact", None)
        if contact_update is not None:
            # dict が来ても ContactInfo が来ても扱えるように正規化する
            contact_model = (
                contact_update
                if isinstance(contact_update, ContactInfo)
                else ContactInfo.model_validate(contact_update)
            )
            columns.extend(
                [
                    "contact_phone = ?",
                    "contact_email = ?",
                    "contact_note = ?",
                ]
            )
            params.extend([contact_model.phone, contact_model.email, contact_model.note])
        with self._lock:
            cursor = self._connection().execute(
                f"UPDATE members SET {', '.join(columns)} WHERE id = ?",
                (*params, member_id),
            )
            if cursor.rowcount == 0:
                raise KeyError(member_id)
            self._connection().commit()
        return self.get_member(member_id)

    def delete_member(self, member_id: int) -> None:
        with self._lock:
            cursor = self._connection().execute(
                "DELETE FROM members WHERE id = ?",
                (member_id,),
            )
            if cursor.rowcount == 0:
                raise KeyError(member_id)
            self._connection().commit()

    def _row_to_member(self, row: sqlite3.Row) -> Member:
        """行データから Member モデルを構築する。"""

        contact = ContactInfo(
            phone=row["contact_phone"],
            email=row["contact_email"],
            note=row["contact_note"],
        )
        return Member(
            id=row["id"],
            name=row["name"],
            part=row["part"],
            position=row["position"],
            contact=contact,
        )

    # -- Material operations ----------------------------------------------
    def list_materials(self, part: str | None = None) -> list[Material]:
        query = "SELECT id, name, part, quantity FROM materials"
        params: Iterable[object] = ()
        if part is not None:
            query += " WHERE lower(part) = lower(?)"
            params = (part,)
        query += " ORDER BY id"
        with self._lock:
            rows = self._connection().execute(query, params).fetchall()
        return [self._row_to_material(row) for row in rows]

    def get_material(self, material_id: int) -> Material:
        with self._lock:
            row = (
                self._connection()
                .execute(
                    "SELECT id, name, part, quantity FROM materials WHERE id = ?",
                    (material_id,),
                )
                .fetchone()
            )
        if row is None:
            raise KeyError(material_id)
        return self._row_to_material(row)

    def create_material(self, payload: MaterialCreate) -> Material:
        with self._lock:
            cursor = self._connection().execute(
                "INSERT INTO materials (name, part, quantity) VALUES (?, ?, ?)",
                (payload.name, payload.part, payload.quantity),
            )
            self._connection().commit()
            material_id = cursor.lastrowid
        data = payload.model_dump()
        data["id"] = material_id
        return Material(**data)

    def update_material(self, material_id: int, payload: MaterialUpdate) -> Material:
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            return self.get_material(material_id)

        columns: list[str] = []
        params: list[object] = []
        if "name" in update_data:
            columns.append("name = ?")
            params.append(update_data["name"])
        if "part" in update_data:
            columns.append("part = ?")
            params.append(update_data["part"])
        if "quantity" in update_data:
            columns.append("quantity = ?")
            params.append(update_data["quantity"])

        with self._lock:
            cursor = self._connection().execute(
                f"UPDATE materials SET {', '.join(columns)} WHERE id = ?",
                (*params, material_id),
            )
            if cursor.rowcount == 0:
                raise KeyError(material_id)
            self._connection().commit()
        return self.get_material(material_id)

    def delete_material(self, material_id: int) -> None:
        with self._lock:
            cursor = self._connection().execute(
                "DELETE FROM materials WHERE id = ?",
                (material_id,),
            )
            if cursor.rowcount == 0:
                raise KeyError(material_id)
            self._connection().commit()

    def _row_to_material(self, row: sqlite3.Row) -> Material:
        """行データから Material モデルを構築する。"""

        return Material(
            id=row["id"],
            name=row["name"],
            part=row["part"],
            quantity=row["quantity"],
        )

    # -- Schedule operations ----------------------------------------------
    def list_schedules(self) -> list[Schedule]:
        query = (
            "SELECT id, name, event_date, start_time, end_time "
            "FROM schedules ORDER BY start_time, id"
        )
        with self._lock:
            rows = self._connection().execute(query).fetchall()
        return [self._row_to_schedule(row) for row in rows]

    def get_schedule(self, schedule_id: int) -> Schedule:
        with self._lock:
            row = (
                self._connection()
                .execute(
                    (
                        "SELECT id, name, event_date, start_time, end_time "
                        "FROM schedules WHERE id = ?"
                    ),
                    (schedule_id,),
                )
                .fetchone()
            )
        if row is None:
            raise KeyError(schedule_id)
        return self._row_to_schedule(row)

    def create_schedule(self, payload: ScheduleCreate) -> Schedule:
        if payload.start_time >= payload.end_time:
            raise ValueError("start_time must be before end_time")
        with self._lock:
            cursor = self._connection().execute(
                (
                    "INSERT INTO schedules (name, event_date, start_time, end_time) "
                    "VALUES (?, ?, ?, ?)"
                ),
                (
                    payload.name,
                    payload.event_date.isoformat(),
                    payload.start_time.isoformat(),
                    payload.end_time.isoformat(),
                ),
            )
            self._connection().commit()
            schedule_id = cursor.lastrowid
        data = payload.model_dump()
        data["id"] = schedule_id
        return Schedule(**data)

    def update_schedule(self, schedule_id: int, payload: ScheduleUpdate) -> Schedule:
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            return self.get_schedule(schedule_id)

        current = self.get_schedule(schedule_id)
        candidate_start = update_data.get("start_time", current.start_time)
        candidate_end = update_data.get("end_time", current.end_time)
        if candidate_start >= candidate_end:
            raise ValueError("start_time must be before end_time")

        columns: list[str] = []
        params: list[object] = []
        if "name" in update_data:
            columns.append("name = ?")
            params.append(update_data["name"])
        if "event_date" in update_data:
            columns.append("event_date = ?")
            event_date_val = update_data["event_date"]
            if isinstance(event_date_val, date):
                params.append(event_date_val.isoformat())
            else:  # pragma: no cover - defensive
                params.append(str(event_date_val))
        if "start_time" in update_data:
            columns.append("start_time = ?")
            start_val = update_data["start_time"]
            if isinstance(start_val, datetime):
                params.append(start_val.isoformat())
            else:  # pragma: no cover - defensive
                params.append(str(start_val))
        if "end_time" in update_data:
            columns.append("end_time = ?")
            end_val = update_data["end_time"]
            if isinstance(end_val, datetime):
                params.append(end_val.isoformat())
            else:  # pragma: no cover - defensive
                params.append(str(end_val))

        with self._lock:
            cursor = self._connection().execute(
                f"UPDATE schedules SET {', '.join(columns)} WHERE id = ?",
                (*params, schedule_id),
            )
            if cursor.rowcount == 0:
                raise KeyError(schedule_id)
            self._connection().commit()
        return self.get_schedule(schedule_id)

    def delete_schedule(self, schedule_id: int) -> None:
        with self._lock:
            cursor = self._connection().execute(
                "DELETE FROM schedules WHERE id = ?",
                (schedule_id,),
            )
            if cursor.rowcount == 0:
                raise KeyError(schedule_id)
            self._connection().commit()

    # -- Task operations ---------------------------------------------------
    def list_tasks(
        self,
        schedule_id: int,
        *,
        stage: str | None = None,
        status: TaskStatus | None = None,
    ) -> list[Task]:
        filters: list[str] = ["schedule_id = ?"]
        params: list[object] = [schedule_id]
        if stage is not None:
            filters.append("lower(stage) = lower(?)")
            params.append(stage)
        if status is not None:
            filters.append("status = ?")
            params.append(status.value)

        query = (
            "SELECT id, schedule_id, name, stage, start_time, end_time, location, "
            "status, note FROM tasks WHERE " + " AND ".join(filters) + " ORDER BY start_time, id"
        )
        with self._lock:
            if not self._schedule_exists(schedule_id):
                raise KeyError(schedule_id)
            rows = self._connection().execute(query, params).fetchall()
        return [self._row_to_task(row) for row in rows]

    def get_task(self, task_id: int) -> Task:
        with self._lock:
            row = (
                self._connection()
                .execute(
                    "SELECT id, schedule_id, name, stage, start_time, end_time, location, "
                    "status, note FROM tasks WHERE id = ?",
                    (task_id,),
                )
                .fetchone()
            )
        if row is None:
            raise KeyError(task_id)
        return self._row_to_task(row)

    def create_task(self, schedule_id: int, payload: TaskCreate) -> Task:
        with self._lock:
            if not self._schedule_exists(schedule_id):
                raise KeyError(schedule_id)
            cursor = self._connection().execute(
                (
                    "INSERT INTO tasks (schedule_id, name, stage, start_time, end_time, "
                    "location, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                ),
                (
                    schedule_id,
                    payload.name,
                    payload.stage,
                    payload.start_time.isoformat(),
                    payload.end_time.isoformat(),
                    payload.location,
                    payload.status.value,
                    payload.note,
                ),
            )
            self._connection().commit()
            task_id = cursor.lastrowid
        data = payload.model_dump()
        data.update({"id": task_id, "schedule_id": schedule_id})
        return Task(**data)

    def update_task(self, task_id: int, payload: TaskUpdate) -> Task:
        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            return self.get_task(task_id)

        columns: list[str] = []
        params: list[object] = []
        if "name" in update_data:
            columns.append("name = ?")
            params.append(update_data["name"])
        if "stage" in update_data:
            columns.append("stage = ?")
            params.append(update_data["stage"])
        if "start_time" in update_data:
            columns.append("start_time = ?")
            start_val = update_data["start_time"]
            if isinstance(start_val, datetime):
                params.append(start_val.isoformat())
            else:  # pragma: no cover - defensive
                params.append(str(start_val))
        if "end_time" in update_data:
            columns.append("end_time = ?")
            end_val = update_data["end_time"]
            if isinstance(end_val, datetime):
                params.append(end_val.isoformat())
            else:  # pragma: no cover - defensive
                params.append(str(end_val))
        if "location" in update_data:
            columns.append("location = ?")
            params.append(update_data["location"])
        if "status" in update_data:
            columns.append("status = ?")
            status_val = update_data["status"]
            if isinstance(status_val, TaskStatus):
                params.append(status_val.value)
            else:  # pragma: no cover - defensive
                params.append(str(status_val))
        if "note" in update_data:
            columns.append("note = ?")
            params.append(update_data["note"])

        with self._lock:
            cursor = self._connection().execute(
                f"UPDATE tasks SET {', '.join(columns)} WHERE id = ?",
                (*params, task_id),
            )
            if cursor.rowcount == 0:
                raise KeyError(task_id)
            self._connection().commit()
        return self.get_task(task_id)

    def update_task_status(self, task_id: int, status: TaskStatus) -> Task:
        with self._lock:
            cursor = self._connection().execute(
                "UPDATE tasks SET status = ? WHERE id = ?",
                (status.value, task_id),
            )
            if cursor.rowcount == 0:
                raise KeyError(task_id)
            self._connection().commit()
        return self.get_task(task_id)

    def delete_task(self, task_id: int) -> None:
        with self._lock:
            cursor = self._connection().execute(
                "DELETE FROM tasks WHERE id = ?",
                (task_id,),
            )
            if cursor.rowcount == 0:
                raise KeyError(task_id)
            self._connection().commit()

    # -- Internal helpers --------------------------------------------------
    def _row_to_schedule(self, row: sqlite3.Row) -> Schedule:
        return Schedule(
            id=row["id"],
            name=row["name"],
            event_date=date.fromisoformat(row["event_date"]),
            start_time=datetime.fromisoformat(row["start_time"]),
            end_time=datetime.fromisoformat(row["end_time"]),
        )

    def _row_to_task(self, row: sqlite3.Row) -> Task:
        return Task(
            id=row["id"],
            schedule_id=row["schedule_id"],
            name=row["name"],
            stage=row["stage"],
            start_time=datetime.fromisoformat(row["start_time"]),
            end_time=datetime.fromisoformat(row["end_time"]),
            location=row["location"],
            status=TaskStatus(row["status"]),
            note=row["note"],
        )

    def _schedule_exists(self, schedule_id: int) -> bool:
        row = (
            self._connection()
            .execute(
                "SELECT 1 FROM schedules WHERE id = ?",
                (schedule_id,),
            )
            .fetchone()
        )
        return row is not None

    # -- Utilities ---------------------------------------------------------
    def reset(self) -> None:
        """テスト用に全データとオートインクリメントを初期化する。"""

        with self._lock:
            conn = self._connection()
            conn.execute("DELETE FROM members")
            conn.execute("DELETE FROM materials")
            conn.execute("DELETE FROM tasks")
            conn.execute("DELETE FROM schedules")
            conn.execute(
                "DELETE FROM sqlite_sequence WHERE name IN "
                "('members', 'materials', 'schedules', 'tasks')"
            )
            conn.commit()

    def close(self) -> None:
        """接続をクローズする。"""

        with self._lock:
            if self._conn is not None:
                self._conn.close()
                self._conn = None
