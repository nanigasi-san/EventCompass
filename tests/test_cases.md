# APIテストケースガイド

`tests/` 配下にある自動テストが、それぞれどの観点を確認しているかをまとめています。

## 共通フィクスチャ
- `seeded_store`: 一時的な SQLite データベースを作成し、サンプルのメンバー／資材データを投入した状態の `SQLiteStore` を返します。
- `client`: FastAPI アプリに対する `TestClient` を生成し、上記 `seeded_store` を依存関係として差し込んだ状態で各テストへ渡します。

## メンバー API テスト (`tests/test_members.py`)
- `test_list_members_returns_seed_data_in_id_order`: `/members` が ID 順に初期データを返すことを確認します。
- `test_list_members_filters_part_case_insensitively`: `part` クエリで大文字小文字を区別しないフィルタが効き、新規追加したメンバーも反映されることを検証します。
- `test_get_member_returns_single_record`: 指定 ID のメンバー詳細が取得でき、連絡先情報が含まれるかを確認します。
- `test_create_member_assigns_new_id`: メンバー作成で ID が連番採番され、一覧にも現れることを確認します。
- `test_update_member_merges_partial_payload`: 部分更新で指定項目のみ書き換わり、未指定項目が維持されることを API とストアの両面で確認します。
- `test_update_member_with_empty_body_returns_current_state`: 空の JSON を送った場合にメンバー情報が変化しないことを確認します。
- `test_delete_member_removes_record`: 削除後に同じ ID を取得すると 404 になることを検証します。
- `test_update_member_not_found`: 存在しない ID を更新しようとすると 404 が返ることを確認します。
- `test_member_contact_defaults`: `ContactInfo` モデルのデフォルト値が `None` であることを確認します。

## 資材 API テスト (`tests/test_materials.py`)
- `test_list_materials_returns_seed_data`: `/materials` が初期データを ID 順に返すことを確認します。
- `test_list_materials_filters_part_case_insensitively`: `part` クエリでの大文字小文字を区別しないフィルタと、追加登録が反映されることを検証します。
- `test_get_material_returns_single_record`: 指定 ID の資材詳細が取得できるかを確認します。
- `test_create_material_assigns_new_id`: 資材作成で ID が採番され、一覧にも登場することを確認します。
- `test_update_material_changes_selected_fields`: 部分更新で対象フィールドのみ変更され、ストアに保存されることを確認します。
- `test_update_material_with_empty_body_returns_current_state`: 空の JSON で資材情報が変化しないことを確認します。
- `test_delete_material_removes_record`: 削除後に同じ ID を取得すると 404 になることを確認します。
- `test_update_material_not_found`: 存在しない ID を更新しようとすると 404 が返ることを確認します。
