"""メンバー情報を扱うコントローラ。"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from io_manager import load_json, save_json


class MemberController:
    """メンバー情報の CRUD およびユーティリティを提供する。"""

    def __init__(self, filepath: str = "data/members.json") -> None:
        self.filepath = filepath
        self.data: Dict[str, Any] = load_json(filepath) or {"members": []}

    # Query ---------------------------------------------------------------
    def list(self) -> List[Dict[str, Any]]:
        """メンバー一覧を取得する。"""
        return [member.copy() for member in self.data.get("members", [])]

    def get(self, member_id: int) -> Optional[Dict[str, Any]]:
        """指定 ID のメンバーを取得する。"""
        for member in self.data.get("members", []):
            if member.get("id") == member_id:
                return member.copy()
        return None

    # Command -------------------------------------------------------------
    def add(self, payload: Dict[str, Any]) -> int:
        """メンバーを追加し、新しい ID を返す。"""
        new_id = self.next_id()
        member = {"id": new_id, **payload}
        self.data.setdefault("members", []).append(member)
        return new_id

    def update(self, member_id: int, patch: Dict[str, Any]) -> None:
        """メンバー情報を更新する。"""
        for member in self.data.get("members", []):
            if member.get("id") == member_id:
                member.update(patch)
                return
        raise KeyError(f"Member with id {member_id} not found")

    def remove(self, member_id: int) -> None:
        """メンバーを削除する。"""
        members = self.data.get("members", [])
        for index, member in enumerate(members):
            if member.get("id") == member_id:
                del members[index]
                return
        raise KeyError(f"Member with id {member_id} not found")

    # Utility -------------------------------------------------------------
    def next_id(self) -> int:
        """次の採番 ID を返す。"""
        members = self.data.get("members", [])
        if not members:
            return 1
        return max(member.get("id", 0) for member in members) + 1

    def save(self) -> None:
        """現在のデータをファイルへ保存する。"""
        save_json(self.filepath, self.data)
