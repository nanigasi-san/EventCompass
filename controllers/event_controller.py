"""イベント情報を扱うコントローラ。"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from io_manager import load_json, save_json


class EventController:
    """イベントの CRUD と時間ユーティリティを提供する。"""

    def __init__(self, filepath: str = "data/events.json") -> None:
        self.filepath = filepath
        self.data: Dict[str, Any] = load_json(filepath) or {"events": []}

    # Query ---------------------------------------------------------------
    def list(self) -> List[Dict[str, Any]]:
        return [event.copy() for event in self.data.get("events", [])]

    def get(self, event_id: int) -> Optional[Dict[str, Any]]:
        for event in self.data.get("events", []):
            if event.get("id") == event_id:
                return event.copy()
        return None

    # Command -------------------------------------------------------------
    def add(self, payload: Dict[str, Any]) -> int:
        new_id = self.next_id()
        event = {"id": new_id, **payload}
        self._validate_times(event.get("start"), event.get("end"))
        self.data.setdefault("events", []).append(event)
        return new_id

    def update(self, event_id: int, patch: Dict[str, Any]) -> None:
        for event in self.data.get("events", []):
            if event.get("id") == event_id:
                updated = {**event, **patch}
                self._validate_times(updated.get("start"), updated.get("end"))
                event.update(patch)
                return
        raise KeyError(f"Event with id {event_id} not found")

    def remove(self, event_id: int) -> None:
        events = self.data.get("events", [])
        for index, event in enumerate(events):
            if event.get("id") == event_id:
                del events[index]
                return
        raise KeyError(f"Event with id {event_id} not found")

    # Utility -------------------------------------------------------------
    def next_id(self) -> int:
        events = self.data.get("events", [])
        if not events:
            return 1
        return max(event.get("id", 0) for event in events) + 1

    def overlapping(self, start: str, end: str) -> List[Dict[str, Any]]:
        """指定範囲と重なるイベントを返す。"""
        start_m = self.normalize_time(start)
        end_m = self.normalize_time(end)
        if start_m >= end_m:
            raise ValueError("start must be earlier than end")
        results: List[Dict[str, Any]] = []
        for event in self.data.get("events", []):
            ev_start = self.normalize_time(event.get("start", "00:00"))
            ev_end = self.normalize_time(event.get("end", "00:00"))
            if ev_start < end_m and start_m < ev_end:
                results.append(event.copy())
        return results

    def current_at(self, time_str: str) -> List[Dict[str, Any]]:
        """指定時刻に進行中のイベントを返す。"""
        point = self.normalize_time(time_str)
        results: List[Dict[str, Any]] = []
        for event in self.data.get("events", []):
            ev_start = self.normalize_time(event.get("start", "00:00"))
            ev_end = self.normalize_time(event.get("end", "00:00"))
            if ev_start <= point < ev_end:
                results.append(event.copy())
        return results

    @staticmethod
    def normalize_time(hhmm: str) -> int:
        """HH:MM 形式を 00:00 からの分数に変換する。"""
        if not isinstance(hhmm, str) or len(hhmm) != 5 or hhmm[2] != ":":
            raise ValueError(f"Invalid time format: {hhmm}")
        hour_part, minute_part = hhmm.split(":", 1)
        if not (hour_part.isdigit() and minute_part.isdigit()):
            raise ValueError(f"Invalid time format: {hhmm}")
        hour = int(hour_part)
        minute = int(minute_part)
        if hour < 0 or hour > 23 or minute < 0 or minute > 59:
            raise ValueError(f"Invalid time value: {hhmm}")
        return hour * 60 + minute

    def _validate_times(self, start: Optional[str], end: Optional[str]) -> None:
        if start is None or end is None:
            raise ValueError("start and end must be provided")
        start_m = self.normalize_time(start)
        end_m = self.normalize_time(end)
        if start_m >= end_m:
            raise ValueError("start must be earlier than end")

    def save(self) -> None:
        save_json(self.filepath, self.data)
