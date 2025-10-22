"""資材情報を扱うコントローラ。"""
from __future__ import annotations

from typing import Any, Dict, List

from io_manager import load_json, save_json


class ItemController:
    """資材情報の CRUD とフィルタリングを提供する。"""

    def __init__(self, filepath: str = "data/items.json") -> None:
        self.filepath = filepath
        self.data: Dict[str, Any] = load_json(filepath) or {"items": []}

    # Query ---------------------------------------------------------------
    def list(self) -> List[Dict[str, Any]]:
        return [item.copy() for item in self.data.get("items", [])]

    # Command -------------------------------------------------------------
    def add(self, payload: Dict[str, Any]) -> int:
        new_id = self.next_id()
        item = {"id": new_id, **payload}
        if item.get("quantity", 0) < 0:
            raise ValueError("quantity must be >= 0")
        self.data.setdefault("items", []).append(item)
        return new_id

    def update(self, item_id: int, patch: Dict[str, Any]) -> None:
        items = self.data.get("items", [])
        for item in items:
            if item.get("id") == item_id:
                updated = {**item, **patch}
                if updated.get("quantity", 0) < 0:
                    raise ValueError("quantity must be >= 0")
                item.update(patch)
                return
        raise KeyError(f"Item with id {item_id} not found")

    def remove(self, item_id: int) -> None:
        items = self.data.get("items", [])
        for index, item in enumerate(items):
            if item.get("id") == item_id:
                del items[index]
                return
        raise KeyError(f"Item with id {item_id} not found")

    # Filters -------------------------------------------------------------
    def all_tags(self) -> List[str]:
        tags: set[str] = set()
        for item in self.data.get("items", []):
            for tag in item.get("tags", []):
                tags.add(str(tag))
        return sorted(tags)

    def filter_by_tags(self, tags: List[str], match_all: bool = True) -> List[Dict[str, Any]]:
        """タグ条件で資材をフィルタする。"""
        if not tags:
            return self.list()
        normalized = {tag.lower() for tag in tags}
        results: List[Dict[str, Any]] = []
        for item in self.data.get("items", []):
            item_tags = {str(tag).lower() for tag in item.get("tags", [])}
            if match_all:
                if normalized.issubset(item_tags):
                    results.append(item.copy())
            else:
                if item_tags & normalized:
                    results.append(item.copy())
        return results

    def filter_by_manager(self, manager: str) -> List[Dict[str, Any]]:
        if not manager:
            return self.list()
        results: List[Dict[str, Any]] = []
        for item in self.data.get("items", []):
            if item.get("manager") == manager:
                results.append(item.copy())
        return results

    # Utility -------------------------------------------------------------
    def next_id(self) -> int:
        items = self.data.get("items", [])
        if not items:
            return 1
        return max(item.get("id", 0) for item in items) + 1

    def save(self) -> None:
        save_json(self.filepath, self.data)
