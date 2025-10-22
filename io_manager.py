"""JSON ファイルの読み書きとバックアップを扱うユーティリティ。"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict
import json
import shutil

_DEFAULT_STRUCTURES = {
    "members.json": {"members": []},
    "events.json": {"events": []},
    "items.json": {"items": []},
}


def _default_structure_for(path: Path) -> Dict[str, Any]:
    """ファイルパスに応じた既定構造を返す。"""
    return json.loads(json.dumps(_DEFAULT_STRUCTURES.get(path.name, {})))


def load_json(filepath: str) -> Dict[str, Any]:
    """JSON を読み込む。無い場合は既定構造を返す。"""
    path = Path(filepath)
    if not path.exists():
        return _default_structure_for(path)

    try:
        with path.open("r", encoding="utf-8") as fp:
            return json.load(fp)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON format in {filepath}: {exc}") from exc


def save_json(filepath: str, data: Dict[str, Any]) -> None:
    """辞書を JSON ファイルに保存する。"""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)


def backup_json(filepath: str) -> None:
    """元ファイルが存在する場合のみバックアップを作成する。"""
    path = Path(filepath)
    if not path.exists():
        return
    backup_path = path.with_suffix(path.suffix + ".bak")
    shutil.copy2(path, backup_path)
