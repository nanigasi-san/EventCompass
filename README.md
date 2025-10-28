# EventCompass

オリエンテーリング大会運営用のオフライン動作管理アプリ。

## セットアップ

Python 3.12 以上を用意し、以下のコマンドで依存関係をインストールしてください。

```bash
pip install -e .[dev]
```

## サーバーの起動方法

開発用サーバーは `uvicorn` を利用して起動します。リポジトリルートで次のコマンドを実行してください。

```bash
uvicorn backend.main:app --reload
```

デフォルトでは `http://127.0.0.1:8000` で待ち受けます。SQLite データベースファイルは初回起動時に `backend/eventcompass.db` として自動生成されます。

## API ドキュメント

サーバー起動後、ブラウザで以下にアクセスすると API ドキュメントを確認できます。

- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

## テストと静的解析

開発用依存関係をインストール済みであれば、以下のコマンドで品質チェックを実行できます。

```bash
pytest
ruff check .
```
