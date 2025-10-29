# APIテストケースガイド

`backend/tests/` 配下に存在する各テストが、どの観点を検証しているかを一覧化しています。

## 共通フィクスチャ
- `seeded_store`: 一時的な SQLite データベースを構築し、サンプルのメンバー・資材データを投入した `SQLiteStore` を返します。
- `client`: FastAPI アプリ用の `TestClient` を作成し、依存解決を上記 `seeded_store` に置き換えた状態で各テストに提供します。

## メンバー API テスト (`backend/tests/test_members.py`)
- `test_list_members_returns_seed_data_in_id_order`: `/members` のレスポンスが ID 順の初期データになることを確認します。
- `test_list_members_filters_part_case_insensitively`: `part` クエリによるフィルタが大文字小文字を区別せずに動作し、新規追加したデータも反映されることを検証します。
- `test_get_member_returns_single_record`: 指定 ID のメンバー詳細が取得でき、連絡先が含まれることを確認します。
- `test_create_member_assigns_new_id`: 新規登録で ID が採番され、一覧で参照できることを検証します。
- `test_update_member_merges_partial_payload`: 一部項目だけを更新した際に差分が反映され、未指定項目は保持されることを確認します。
- `test_update_member_with_empty_body_returns_current_state`: 空の JSON を送ると現状が返されることを検証します。
- `test_delete_member_removes_record`: 削除後に同じ ID を取得しようとすると 404 になることを確認します。
- `test_update_member_not_found`: 存在しない ID の更新リクエストで 404 が返ることを検証します。
- `test_member_contact_defaults`: `ContactInfo` の各フィールドがデフォルトで `None` になることを確認します。

## 資材 API テスト (`backend/tests/test_materials.py`)
- `test_list_materials_returns_seed_data`: `/materials` が初期データを ID 順で返すことを確認します。
- `test_list_materials_filters_part_case_insensitively`: `part` クエリによるフィルタが大文字小文字を無視して働き、新規登録分も反映されることを検証します。
- `test_get_material_returns_single_record`: 指定 ID の資材詳細を取得できることを確認します。
- `test_create_material_assigns_new_id`: 新規資材登録で ID が採番され、取得できることを検証します。
- `test_update_material_changes_selected_fields`: 更新リクエストで指定した項目だけが変更されることを確認します。
- `test_update_material_with_empty_body_returns_current_state`: 空 JSON を送ると現状が返ることを検証します。
- `test_delete_material_removes_record`: 削除後の取得で 404 が返ることを確認します。
- `test_update_material_not_found`: 存在しない ID の更新で 404 が返ることを検証します。

## スケジュール・タスク API テスト (`backend/tests/test_schedules.py`)
- `test_schedule_crud`: スケジュールの作成・取得・更新・削除が期待通り動作することを通しで確認します。
- `test_task_crud_flow`: タスクの作成から削除までを API 経由で実行し、ステータス更新も含めて検証します。
- `test_task_filters_and_schedule_removal`: スケジュール配下のタスク一覧がフィルタリングできること、スケジュール削除時に 404 が返ることを確認します。
