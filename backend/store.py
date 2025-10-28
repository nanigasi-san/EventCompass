"""SQLite ベースの永続化レイヤー。"""

from __future__ import annotations

import sqlite3
from collections.abc import Iterable
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
)


class SQLiteStore:
    """SQLite3 を利用したデータストア。"""

    def __init__(self, database: str | Path) -> None:
        self._database = str(database)
        self._lock = Lock()
        self._conn: sqlite3.Connection | None = sqlite3.connect(
            self._database, check_same_thread=False
        )
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

    # -- 初期化 -----------------------------------------------------------
    def _connection(self) -> sqlite3.Connection:
        conn = self._conn
        if conn is None:  # pragma: no cover - defensive
            raise RuntimeError("ストアは既にクローズされています")
        return conn

    def _init_schema(self) -> None:
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
                """
            )
            conn.commit()

    # -- Member operations -------------------------------------------------
    def list_members(self, part: str | None = None) -> list[Member]:
        query = (
            "SELECT id, name, part, position, contact_phone, contact_email, contact_note"
            " FROM members"
        )
        params: Iterable[object] = ()
        if part is not None:
            query += " WHERE lower(part) = lower(?)"
            params = (part,)
        query += " ORDER BY id"
        with self._lock:
            rows = self._connection().execute(query, params).fetchall()
        return [self._row_to_member(row) for row in rows]

    def get_member(self, member_id: int) -> Member:
        with self._lock:
            row = self._connection().execute(
                "SELECT id, name, part, position, contact_phone, contact_email, contact_note"
                " FROM members WHERE id = ?",
                (member_id,),
            ).fetchone()
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
        return Member(
            id=member_id,
            name=payload.name,
            part=payload.part,
            position=payload.position,
            contact=contact,
        )

    def update_member(self, member_id: int, payload: MemberUpdate) -> Member:
        update_data = payload.to_update_dict()
        if not update_data:
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
        contact_update = update_data.get("contact")
        if contact_update is not None:
            if not isinstance(contact_update, ContactInfo):
                contact_update = ContactInfo.from_dict(contact_update)
            columns.extend(
                [
                    "contact_phone = ?",
                    "contact_email = ?",
                    "contact_note = ?",
                ]
            )
            params.extend([contact_update.phone, contact_update.email, contact_update.note])
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
            row = self._connection().execute(
                "SELECT id, name, part, quantity FROM materials WHERE id = ?",
                (material_id,),
            ).fetchone()
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
        return Material(
            id=material_id,
            name=payload.name,
            part=payload.part,
            quantity=payload.quantity,
        )

    def update_material(self, material_id: int, payload: MaterialUpdate) -> Material:
        update_data = payload.to_update_dict()
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
        return Material(
            id=row["id"],
            name=row["name"],
            part=row["part"],
            quantity=row["quantity"],
        )

    # -- Utilities ---------------------------------------------------------
    def reset(self) -> None:
        """テスト用にデータを初期化する。"""

        with self._lock:
            conn = self._connection()
            conn.execute("DELETE FROM members")
            conn.execute("DELETE FROM materials")
            conn.execute(
                "DELETE FROM sqlite_sequence WHERE name IN ('members', 'materials')"
            )
            conn.commit()

    def close(self) -> None:
        """接続をクローズする。"""

        with self._lock:
            if self._conn is not None:
                self._conn.close()
                self._conn = None
