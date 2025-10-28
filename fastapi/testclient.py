"""FastAPI TestClient の最小互換実装。"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from . import Response

if TYPE_CHECKING:
    from . import FastAPI


class TestClient:
    """テスト実行用のシンプルなクライアント。"""

    def __init__(self, app: FastAPI) -> None:
        self._app = app

    def __enter__(self) -> TestClient:
        return self

    def __exit__(self, exc_type, exc, tb) -> None:  # noqa: D401
        return None

    def request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
    ) -> Response:
        return self._app._handle_request(method.upper(), url, params=params, json=json)

    def get(self, url: str, *, params: dict[str, Any] | None = None) -> Response:
        return self.request("GET", url, params=params)

    def post(self, url: str, *, json: Any = None) -> Response:
        return self.request("POST", url, json=json)

    def put(self, url: str, *, json: Any = None) -> Response:
        return self.request("PUT", url, json=json)

    def delete(self, url: str) -> Response:
        return self.request("DELETE", url)
