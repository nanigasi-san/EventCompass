# EventCompass 仕様書／コード・クラス設計書（最終案 v1）

> 本書は Codex 等での実装を前提に、**要件 → 仕様 → 設計**を一気通貫で示す。冗長表現を避け、実装に直結する語彙と構造で記述。

---

## 1. プロダクト概要（Specification）

* **名称:** EventCompass
* **目的:** イベント当日の運営（メンバー・スケジュール・資材）の一元管理。
* **対象:** オリエンテーリング／ロゲイニング等の屋外イベント運営チーム。
* **プラットフォーム:** Windows 10/11 デスクトップ
* **動作:** 完全オフライン（初期実装）
* **UI:** PyQt6ベース、タブ構成、Google カレンダー風ガントビュー
* **データ永続化:** JSON（将来SQLiteへ移行可能な抽象化）
* **保存:** 手動保存（明示ボタン）＋保存前バックアップ

### 1.1 成果物の最低要件（MVP）

1. **運営管理タブ**: メンバー一覧、役割、時間帯割当／イベントのガント表示・編集（移動・リサイズ）。
2. **資材管理タブ**: 資材一覧、追加・編集・削除、タグ／担当者フィルタ。
3. **共通**: JSON 読み書き、保存ボタン、現在時刻ライン、ウィンドウ状態保持（前回ファイルパス）。

### 1.2 非機能要件

* **可読性:** データは人が読めるJSON。差分管理しやすいキー設計。
* **拡張性:** I/O 抽象化によりSQLite等へ差し替え可能。
* **信頼性:** 保存前に自動バックアップ（`*.json.bak`）。
* **操作性:** 主要操作は2クリック以内。右クリックコンテキストメニュー。
* **パッケージ:** PyInstaller で単一実行形式（後続）。

---

## 2. データ仕様（JSON Schema 準拠風）

### 2.1 members.json

```json
{
  "members": [
    {
      "id": 1,
      "name": "山田海音",
      "role": "総合",
      "status": "active",
      "schedule": [
        {"start": "08:00", "end": "09:00", "task": "受付設営"}
      ],
      "contacts": {"phone": "", "note": ""}
    }
  ]
}
```

**制約:** `id` は一意整数。`start < end`。時刻は`HH:MM`24h。

### 2.2 events.json

```json
{
  "events": [
    {"id": 1, "title": "受付設営", "start": "08:00", "end": "09:00", "members": [1, 2], "note": ""}
  ]
}
```

**制約:** イベントはガント表示の基本単位。`members`は参照整合性を保つ。

### 2.3 items.json

```json
{
  "items": [
    {"id": 1, "name": "テント", "quantity": 2, "tags": ["設営", "屋外"], "manager": "佐藤", "note": ""}
  ]
}
```

**制約:** `quantity >= 0`。`tags`は文字列配列（小文字推奨）。

---

## 3. システム構成（モジュール）

```
EventCompass/
 ├ main.py                    # エントリポイント
 ├ ui_main.py                 # UI総括（ウィンドウ/タブ/メニュー）
 ├ io_manager.py              # ファイルI/O（JSON 読み書き/バックアップ）
 ├ controllers/
 │   ├ member_controller.py   # メンバー管理ロジック
 │   ├ event_controller.py    # イベント管理ロジック
 │   └ item_controller.py     # 資材管理ロジック
 ├ widgets/
 │   ├ gantt_view.py          # ガントチャート（QGraphicsView）
 │   └ tag_filter.py          # タグフィルタUI（複数選択）
 └ data/
     ├ members.json
     ├ events.json
     └ items.json
```

### 3.1 依存関係（簡易図）

```
 ui_main ──uses──▶ controllers ──uses──▶ io_manager
     │                        │
     └──uses widgets──────────┘
```

**方針:** UIはコントローラの公開APIのみ呼ぶ。I/Oはコントローラからのみ利用。

---

## 4. 画面仕様（UI Behavior）

### 4.1 共通

* メニューバー: [ファイルを開く][保存][終了]
* ステータスバー: 現在時刻、最終保存時刻、編集中フラグ
* ダーク/ライト切替は任意（QPalette）

### 4.2 運営管理タブ

* **左:** メンバーリスト（検索、役割フィルタ、右クリ: 編集/削除）
* **右:** ガントビュー（時間軸ズーム、ドラッグで移動、端ドラッグでリサイズ、ダブルクリックで編集ダイアログ）
* **現在時刻ライン:** 1分ごとに描画更新（UIタイマー）

### 4.3 資材管理タブ

* テーブル表示（ソート、インライン編集）
* 上部にタグフィルタ（トグル/複数選択）・担当者ドロップダウン
* 右クリ: 追加/複製/削除

---

## 5. 振る舞い仕様（主要フロー）

### 5.1 保存フロー

1. UIで[保存]クリック → 2) `io_manager.backup_json` → 3) `controllers.*` が持つ `data` を `io_manager.save_json` へ → 4) 成功でステータス更新

### 5.2 イベント編集フロー

* 追加: ガント空白ダブルクリック → 入力ダイアログ → `event_controller.add_event` → `gantt_view.draw_events`
* 移動/伸縮: マウス操作 → `event_controller.update_event` → 再描画
* 削除: 右クリ → `event_controller.delete_event`

### 5.3 タグフィルタ

* フィルタ更新 → `item_controller.filter_by_tag(list[str])` → テーブル再描画

---

## 6. コード／クラス設計（Design）

### 6.1 I/O 層（`io_manager.py`）

```python
from typing import Any, Dict

def load_json(filepath: str) -> Dict[str, Any]:
    """JSONを読み込む。無ければ既定構造で返す。"""


def save_json(filepath: str, data: Dict[str, Any]) -> None:
    """辞書をJSONに保存。UTF-8、インデント2、ensure_ascii=False。"""


def backup_json(filepath: str) -> None:
    """<filepath>.bak にバックアップを作成。失敗は本保存を阻害しない。"""
```

### 6.2 コントローラ層

共通規約: すべて `self.data: Dict[str, Any]` を保持し、`load()`/`save()` を内部で使用。公開APIは**純粋関数的**（副作用は内部で閉じる）。

#### 6.2.1 `member_controller.py`

```python
from typing import Dict, Any, List, Optional
from io_manager import load_json, save_json

class MemberController:
    def __init__(self, filepath: str = "data/members.json"):
        self.filepath = filepath
        self.data: Dict[str, Any] = load_json(filepath) or {"members": []}

    # Query
    def list(self) -> List[Dict[str, Any]]: ...
    def get(self, member_id: int) -> Optional[Dict[str, Any]]: ...

    # Command
    def add(self, payload: Dict[str, Any]) -> int: ...  # return new id
    def update(self, member_id: int, patch: Dict[str, Any]) -> None: ...
    def remove(self, member_id: int) -> None: ...

    # Utility
    def next_id(self) -> int: ...
    def save(self) -> None: save_json(self.filepath, self.data)
```

#### 6.2.2 `event_controller.py`

```python
class EventController:
    def __init__(self, filepath: str = "data/events.json"):
        self.filepath = filepath
        self.data = load_json(filepath) or {"events": []}

    def list(self): ...
    def get(self, event_id: int): ...
    def add(self, payload: dict) -> int: ...
    def update(self, event_id: int, patch: dict) -> None: ...
    def remove(self, event_id: int) -> None: ...

    # Time utils
    def overlapping(self, start: str, end: str) -> list[dict]: ...
    def current_at(self, time_str: str) -> list[dict]: ...
    def normalize_time(self, hhmm: str) -> int: ...  # minutes since 00:00

    def save(self) -> None: save_json(self.filepath, self.data)
```

#### 6.2.3 `item_controller.py`

```python
class ItemController:
    def __init__(self, filepath: str = "data/items.json"):
        self.filepath = filepath
        self.data = load_json(filepath) or {"items": []}

    def list(self): ...
    def add(self, payload: dict) -> int: ...
    def update(self, item_id: int, patch: dict) -> None: ...
    def remove(self, item_id: int) -> None: ...

    # Filters
    def all_tags(self) -> list[str]: ...
    def filter_by_tags(self, tags: list[str], match_all: bool = True) -> list[dict]: ...  # match_all=TrueでAND
    def filter_by_manager(self, manager: str) -> list[dict]: ...

    def save(self) -> None: save_json(self.filepath, self.data)
```

### 6.3 UI 層

#### 6.3.1 `ui_main.py`

```python
from PyQt6.QtWidgets import QMainWindow, QTabWidget, QAction
from controllers.member_controller import MemberController
from controllers.event_controller import EventController
from controllers.item_controller import ItemController
from widgets.gantt_view import GanttChartView
from widgets.tag_filter import TagFilter

class EventCompassApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.member_ctrl = MemberController()
        self.event_ctrl  = EventController()
        self.item_ctrl   = ItemController()
        self._build_ui()
        self._connect_signals()

    def _build_ui(self): ...  # タブ/メニュー/ステータス
    def _connect_signals(self): ...  # 保存・編集・フィルタ等

    # Actions
    def action_open(self): ...  # 選択された data ディレクトリから3JSONを読込
    def action_save(self):
        # 3コントローラを順に保存
        self.member_ctrl.save(); self.event_ctrl.save(); self.item_ctrl.save()
```

#### 6.3.2 `widgets/gantt_view.py`

```python
from PyQt6.QtWidgets import QGraphicsView, QGraphicsScene

class GanttChartView(QGraphicsView):
    def __init__(self, event_ctrl):
        super().__init__()
        self.ctrl = event_ctrl
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)

    def draw(self): ...           # events→rects 再生成
    def draw_now_line(self): ...  # 現在時刻ライン
    def on_drag_move(self, event_id: int, new_start: str, new_end: str): ...
```

#### 6.3.3 `widgets/tag_filter.py`

```python
from PyQt6.QtWidgets import QWidget

class TagFilter(QWidget):
    def __init__(self, item_ctrl):
        super().__init__()
        self.ctrl = item_ctrl
        self._build()

    def _build(self): ...
    def refresh(self) -> None: ...  # コントローラのタグ一覧を再読込
    def selected_tags(self) -> list[str]: ...
```

### 6.4 例外・バリデーション

* `normalize_time`で`HH:MM`形式を検証。不正なら`ValueError`。
* `start >= end` の場合は更新拒否（UIでトースト表示）。
* 参照整合性（event.members ⊆ members.id）を更新時にチェック。

---

## 7. テスト計画（最小）

* 単体: `controllers` の CRUD／時間正規化／フィルタ
* 结合: `ui_main.action_save` が 3ファイルへ保存すること
* 疎通: 起動→イベント追加→保存→再起動→反映確認

---

## 8. 将来拡張

* **SQLite移行:** `Repository` 抽象（`load/save`互換API）を作り、`JsonRepository`→`SqlRepository`を差し替え。
* **PDF出力:** 運営表・資材表の帳票化
* **クラウド同期:** オプション（オンライン時）

---

## 9. 実装ルール（Codex向けガイド）

* 型ヒント必須、PEP8順守、docstring は1行要約＋パラメタ／戻り値。
* UI とロジックの分離を厳守。UI から JSON へ直接アクセスしない。
* コントローラの公開APIは**同期的・例外送出**で統一。UI側で例外捕捉→通知。
* ファイルパスは定数化（`DATA_DIR`）。存在しなければ初期雛形を書き出す。

---

**以上。** 本設計に従えば、MVPが最短で実装可能で、将来のSQLite化・PDF出力・クラウド連携にも無改造で拡張できる。
