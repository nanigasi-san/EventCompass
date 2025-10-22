# EventCompass 仕様書（FastAPI バックエンド版）

> 本書は EventCompass を Electron + FastAPI ハイブリッド構成へ移行するための仕様書である。現段階では **Python / FastAPI ベースのローカルデータサーバー** を完成させ、後続で Electron フロントエンドを実装する。

---

## 1. プロダクト概要

* **名称:** EventCompass
* **目的:** イベント運営チーム向けに、メンバー配置・イベント進行・資材管理を一元化する。
* **対象:** オリエンテーリング／ロゲイニング等の屋外イベント運営チーム。
* **運用形態:** Windows デスクトップ（将来 Electron パッケージ化）。
* **ネットワーク:** 完全オフラインで動作。サーバー／フロントともにローカル配備。
* **UI 方針:** Electron + React（今後実装）。
* **ロジック:** 既存 Python コントローラを FastAPI から公開。

---

## 2. システム構成（将来像と現状）

```
┌──────────────────────────┐
│         Electron App       │   ※未実装（後続タスク）
│  ┌───────────────┐       │
│  │  Renderer (React)│  UI │
│  └───────────────┘       │
│  ┌───────────────┐       │
│  │ Preload (IPC) │  安全 │
│  └───────────────┘       │
│  ┌───────────────┐       │  spawn/monitor
│  │ Main process  │───────┼────────┐
│  └───────────────┘       │        │
└──────────────────────────┘        ▼
                                 ┌──────────────────────┐
                                 │ FastAPI (Python)     │   ◀ 今回実装
                                 │ controllers/*        │
                                 │ io_manager (JSON/DB) │
                                 └──────────────────────┘
```

* **通信:** `http://127.0.0.1:<port>` の HTTP。CORS は Electron Renderer のみ許可予定。
* **起動:** Electron Main が FastAPI を子プロセス起動し、`/healthz` で監視する想定。
* **停止:** Electron 終了時に `/shutdown` を叩き、FastAPI が安全に停止。

---

## 3. ディレクトリ構成（2024-XX 時点）

```
EventCompass/
 ├ controllers/                # 既存 Python ドメインロジック
 │   ├ __init__.py
 │   ├ member_controller.py
 │   ├ event_controller.py
 │   └ item_controller.py
 ├ backend/                    # ★新規 FastAPI バックエンド
 │   ├ __init__.py             # create_app() を公開
 │   ├ app.py                  # FastAPI アプリ本体
 │   ├ main.py                 # uvicorn 起動スクリプト
 │   ├ schemas.py              # Pydantic スキーマ
 │   └ routers/
 │       ├ members.py          # /members CRUD
 │       ├ events.py           # /events CRUD + current
 │       ├ items.py            # /items CRUD + filter
 │       └ system.py           # /healthz, /storage/save, /shutdown
 ├ io_manager.py               # JSON 読み書き・バックアップ
 └ data/
     ├ members.json
     ├ events.json
     └ items.json
```

> Electron 側（`app/` 等）は後続で追加する。現段階では FastAPI を単体起動し、ブラウザや HTTP クライアントから API を叩いて挙動を確認する。

---

## 4. データモデル（JSON ベース）

### 4.1 members.json

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

* `schedule` は `HH:MM` 形式で `start < end`。

### 4.2 events.json

```json
{
  "events": [
    {
      "id": 1,
      "title": "受付設営",
      "start": "08:00",
      "end": "09:00",
      "members": [1, 2],
      "note": ""
    }
  ]
}
```

* `start < end`。`members` は `members.json` の ID を参照。

### 4.3 items.json

```json
{
  "items": [
    {
      "id": 1,
      "name": "テント",
      "quantity": 2,
      "tags": ["設営", "屋外"],
      "manager": "佐藤",
      "note": ""
    }
  ]
}
```

* `quantity >= 0`。タグは任意文字列。

---

## 5. FastAPI エンドポイント仕様

### 5.1 共通

* **ベース URL:** `http://127.0.0.1:<port>`
* **認証:** なし（ローカル利用前提）。
* **エラーレスポンス:** `{"detail": "..."}` を基本。
* **保存方針:** CRUD 操作はメモリ上の状態を更新するのみ。`/storage/save` を呼ぶと JSON に書き出し、直前に `.bak` を作成する。

### 5.2 `/healthz`

* **GET /healthz** → `{ "status": "ok" }`

### 5.3 `/members`

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
|----------|------|------|------------------|-------------|
| GET | `/members` | メンバー一覧取得 | - | `[Member]` |
| POST | `/members` | メンバー追加 | `MemberCreate` | `{ "id": number }` |
| PATCH | `/members/{id}` | メンバー更新（部分更新可） | `MemberUpdate` | `204 No Content` |
| DELETE | `/members/{id}` | メンバー削除 | - | `204 No Content` |

`Member` スキーマは JSON ファイルと同一。

### 5.4 `/events`

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
|----------|------|------|------------------|-------------|
| GET | `/events` | イベント一覧 | - | `[Event]` |
| POST | `/events` | イベント追加 | `EventCreate` | `{ "id": number }` |
| PATCH | `/events/{id}` | イベント更新 | `EventUpdate` | `204 No Content` |
| DELETE | `/events/{id}` | イベント削除 | - | `204 No Content` |
| GET | `/events/current?time=HH:MM` | 指定時刻に進行中のイベントを返す | - | `[Event]` |

時刻形式が不正な場合は `400` を返す。

### 5.5 `/items`

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
|----------|------|------|------------------|-------------|
| GET | `/items` | 資材一覧 | - | `[Item]` |
| POST | `/items` | 資材追加 | `ItemCreate` | `{ "id": number }` |
| PATCH | `/items/{id}` | 資材更新 | `ItemUpdate` | `204 No Content` |
| DELETE | `/items/{id}` | 資材削除 | - | `204 No Content` |
| GET | `/items/filter?tags=a,b&manager=x&match=all|any` | タグ／担当者フィルタ | - | `[Item]` |

* `tags` はカンマ区切り。`match=all` で全タグを含む資材、`match=any` で少なくとも1タグ一致。
* `manager` 併用時は交差集合を返す。

### 5.6 `/storage/save`

* **POST /storage/save** → `204 No Content`
  * body: `{ "targets": ["members", "events", "items"] }`（省略時は全保存）
  * 保存直前に各 JSON の `.bak` を作成する。

### 5.7 `/shutdown`

* **POST /shutdown** → `{ "status": "shutting_down" }`
  * 非同期で uvicorn を停止させる。Electron からアプリ終了時に呼ぶ想定。

---

## 6. 実装メモ

1. `backend/app.py` が `FastAPI` アプリケーションを生成し、各コントローラを `app.state` に保持する。
2. ルーター層 (`backend/routers/*.py`) が Pydantic スキーマで入出力を定義し、例外を HTTP ステータスへマッピングする。
3. `/storage/save` では `io_manager.backup_json()` で `.bak` を作成し、各コントローラの `save()` を実行する。
4. `backend/main.py` は `python -m backend.main --port 9000` のように実行し、uvicorn サーバーを起動する。
5. Electron 実装時は Main プロセスから FastAPI を子プロセスとして起動し、`/healthz` で起動待ち、`/shutdown` で停止する。

---

## 7. 今後のタスク（抜粋）

1. Electron プロジェクト（TypeScript + Vite + React + Tailwind + shadcn/ui）を `app/` 配下に構築する。
2. Preload スクリプトで `/members` 等の API をラップし、Renderer から安全に呼び出す。
3. Renderer 側でメンバー／イベントのガント表示、資材テーブル、保存ボタン等を実装する。
4. electron-builder を用いた Windows インストーラ化と Python 同梱戦略の策定。

---

### 付録: 起動コマンド例

```bash
python -m backend.main --port 8765
# 別ターミナルで疎通確認
curl http://127.0.0.1:8765/healthz
```

本仕様書に従い FastAPI バックエンドを実装済み。Electron 側は後続対応とする。
