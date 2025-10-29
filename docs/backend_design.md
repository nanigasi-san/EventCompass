# EventCompass バックエンド設計概要

## アーキテクチャ概要
- FastAPI で構築した RESTful API。タイトルは `EventCompass Backend`、バージョンは `1.0.0`。
- `backend/main.py` がエントリーポイント。アプリ初期化時に CORS（`http://127.0.0.1:5173` と `http://localhost:5173` を許可）を設定。
- 依存解決に FastAPI の `Depends` を利用し、アプリ全体で使い回す `SQLiteStore` インスタンスを注入。
- デフォルトの永続化先は `backend/eventcompass.db`。同パスが見つからない場合は自動で初期化。

## モジュール構成
- `backend/main.py`  
  FastAPI ルーターを定義。メンバー・資材・スケジュール・タスクのエンドポイントをまとめ、アプリ全体で共通メッセージや 404 例外ハンドリングを行う。
- `backend/models.py`  
  Pydantic v2 ベースのリクエスト・レスポンスモデル。ドメインごとに `Base`／`Create`／`Update`／`Read` モデルを切り分け、部分更新に対応。
- `backend/store.py`  
  SQLite を扱うリポジトリ。テーブル作成、CRUD 実装、Pydantic モデルとの相互変換、排他制御（`threading.Lock`）を担当。

## データモデルとテーブル
- 共通  
  - すべてのテーブルの主キーは `INTEGER PRIMARY KEY AUTOINCREMENT`。
  - 日付／日時は ISO 8601 文字列で保存し、取得時に `date`／`datetime` に戻す。

- メンバー（`members` テーブル / `Member` モデル）
  - `name`, `part`（担当パート）, `position`（役割）, `contact_*`（電話・メール・備考）。
  - `ContactInfo` サブモデルで連絡先をカプセル化。
  - 一覧取得時は `?part=` クエリで担当パートを大文字小文字を無視して絞り込み。

- 資材（`materials` テーブル / `Material` モデル）
  - `name`, `part`, `quantity`（0 以上を `CHECK` 制約）。
  - `?part=` クエリで担当パートごとにフィルタ可能。

- スケジュール（`schedules` テーブル / `Schedule` モデル）
  - `name`, `event_date`（イベント実施日）。

- タスク（`tasks` テーブル / `Task` モデル）
  - スケジュールに対する従属関係（`schedule_id` に `ON DELETE CASCADE`）。
  - `stage`（段階）, `start_time`, `end_time`, `location`, `status`, `note`。
  - `TaskStatus` は `planned / in_progress / completed / delayed` を列挙。
  - タスク一覧で `?stage=` と `?status=` のクエリフィルタに対応。

## 永続化レイヤーの振る舞い
- アプリ起動時に `SQLiteStore` が単一コネクションを生成し、行フォーマットは `sqlite3.Row` に設定。
- `threading.Lock` で全 CRUD 操作をシリアライズし、マルチスレッドアクセス時の整合性を確保。
- Pydantic モデル → DB の変換時に日付・日時は `isoformat()`、ステータスは `TaskStatus.value` を利用。
- `_init_schema()` が存在しないテーブルやインデックスを自動作成。
- テスト／リセット用途として全テーブル初期化用の `reset()`、接続後始末の `close()` を提供。

## API エンドポイント
**Members**
- `GET /members`（`?part=` 任意）: メンバー一覧。担当パートでフィルタ可能。
- `GET /members/{member_id}`: メンバー詳細。存在しなければ 404。
- `POST /members`（`MemberCreate`）: 新規登録。201 Created を返し、登録された `Member` を返却。
- `PUT /members/{member_id}`（`MemberUpdate`）: 全体更新（未指定項目は変更なし）。対象がなければ 404。
- `DELETE /members/{member_id}`: メンバー削除。対象がなければ 404、成功時は 204。

**Materials**
- `GET /materials`（`?part=` 任意）: 資材一覧。担当パートでフィルタ可能。
- `GET /materials/{material_id}`: 資材詳細。存在しなければ 404。
- `POST /materials`（`MaterialCreate`）: 新規登録。201 Created。
- `PUT /materials/{material_id}`（`MaterialUpdate`）: 更新。対象がなければ 404。
- `DELETE /materials/{material_id}`: 削除。対象がなければ 404、成功時は 204。

**Schedules**
- `GET /schedules`: スケジュール一覧。
- `GET /schedules/{schedule_id}`: スケジュール詳細。存在しなければ 404。
- `POST /schedules`（`ScheduleCreate`）: 新規登録。201 Created。
- `PUT /schedules/{schedule_id}`（`ScheduleUpdate`）: 更新。対象がなければ 404。
- `DELETE /schedules/{schedule_id}`: 削除。対象がなければ 404、成功時は 204。
- `GET /schedules/{schedule_id}/tasks`（`?stage=`, `?status=` 任意）: 指定スケジュール配下のタスク一覧。クエリで段階・状態をフィルタ。
- `POST /schedules/{schedule_id}/tasks`（`TaskCreate`）: スケジュール配下タスクの追加。スケジュール未存在時は 404。

**Tasks**
- `GET /tasks/{task_id}`: 単一タスク詳細。存在しなければ 404。
- `PUT /tasks/{task_id}`（`TaskUpdate`）: 任意項目の更新。対象がなければ 404。
- `PATCH /tasks/{task_id}/status`（`TaskStatusUpdate`）: ステータスのみ部分更新。
- `DELETE /tasks/{task_id}`: タスク削除。対象がなければ 404、成功時は 204。

## 補足
- バリデーションは Pydantic モデルで実施。未指定項目は `exclude_unset=True` を使い差分更新。
- `HTTPException` は `backend/main.py` で `_not_found()` を介して統一的に発生させる。
- 将来的にストア実装を差し替える場合も FastAPI 側は `Depends(get_store)` の差し替えで対応可能。
