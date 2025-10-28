# APIテストケースガイド

`tests/` 配下の自動テストが何を検証しているかをまとめています。

## 共通フィクスチャ
- `seeded_store`: 一時的な SQLite データベースを作成し、サンプルのメンバーと資材データを投入してから `SQLiteStore` インスタンスを提供します。
- `client`: FastAPI アプリに対する `TestClient` を生成し、`seeded_store` を依存関係として差し込んだ状態で各テストに渡します。

## メンバー API テスト (`tests/test_members.py`)
- `test_list_members_returns_seed_data_in_id_order`: `/members` のレスポンスが ID 昇順で初期データを返すことを確認します。
- `test_list_members_filters_part_case_insensitively`: `part` クエリでのフィルタが大文字小文字を区別しないことと、新規追加したメンバーがフィルタ結果に含まれることを検証します。
- `test_get_member_returns_single_record`: 指定 ID のメンバー詳細が取得でき、連絡先情報が含まれることを確認します。
- `test_create_member_assigns_new_id`: POST が連番の ID を採番し、後続の一覧で新規メンバーが取得できることを検証します。
- `test_update_member_merges_partial_payload`: 部分更新で指定したフィールドだけが更新され、既存の値が維持されることを API レスポンスとストア双方で確認します。
- `test_update_member_with_empty_body_returns_current_state`: 空の JSON を送った場合にメンバー情報が変化しないことを確かめます。
- `test_delete_member_removes_record`: DELETE 後に同じ ID を取得すると 404 が返ることを確認します。
- `test_update_member_not_found`: 存在しない ID を更新しようとした際に 404 が返ることを検証します。
- `test_member_contact_defaults`: `ContactInfo` モデルのデフォルト値（すべて None）が期待通りであるかを確認します。

## 資材 API テスト (`tests/test_materials.py`)
- `test_list_materials_returns_seed_data`: `/materials` が初期データを ID 昇順で返すことを確認します。
- `test_list_materials_filters_part_case_insensitively`: `part` クエリでのフィルタが大文字小文字を区別せず、新規作成した資材がフィルタ結果へ反映されることを検証します。
- `test_get_material_returns_single_record`: 指定 ID の資材詳細が返ることを確認します。
- `test_create_material_assigns_new_id`: 資材の新規作成で ID が採番され、一覧からも確認できることを検証します。
- `test_update_material_changes_selected_fields`: 部分更新で指定したフィールドだけが変更され、ストアにも反映されることを確認します。
- `test_update_material_with_empty_body_returns_current_state`: 空の JSON を送った場合に資材情報が変化しないことを確かめます。
- `test_delete_material_removes_record`: 資材の削除後に同じ ID を取得すると 404 が返ることを確認します。
- `test_update_material_not_found`: 存在しない ID を更新しようとすると 404 が返ることを検証します。
