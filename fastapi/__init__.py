"""FastAPI 互換の最小実装。"""

from __future__ import annotations

import inspect
import types
from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated, Any, Union, get_args, get_origin, get_type_hints  # noqa: F401

__all__ = [
    "Depends",
    "FastAPI",
    "HTTPException",
    "Query",
    "status",
    "TestClient",
]


class HTTPException(Exception):  # noqa: N818 - FastAPI 名称に合わせる
    """HTTP エラーを表す例外。"""

    def __init__(self, status_code: int, detail: Any) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class Depends:
    """依存関数を表現するラッパー。"""

    def __init__(self, dependency: Callable[..., Any]) -> None:
        self.dependency = dependency


class Query:
    """クエリパラメータ情報。"""

    def __init__(self, default: Any = None, description: str | None = None) -> None:
        self.default = default
        self.description = description


class _Status:
    HTTP_200_OK = 200
    HTTP_201_CREATED = 201
    HTTP_204_NO_CONTENT = 204
    HTTP_404_NOT_FOUND = 404


status = _Status()


@dataclass
class _Route:
    method: str
    path: str
    endpoint: Callable[..., Any]
    status_code: int | None


class Response:
    """テスト向けのレスポンス表現。"""

    def __init__(self, status_code: int, body: Any) -> None:
        self.status_code = status_code
        self._body = body

    def json(self) -> Any:
        return self._body


class FastAPI:
    """FastAPI 互換の最小アプリケーション。"""

    def __init__(self, *, title: str | None = None, version: str | None = None) -> None:
        self.title = title
        self.version = version
        self._routes: list[_Route] = []
        self.dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {}

    # -- ルーティング ---------------------------------------------------
    def get(
        self,
        path: str,
        *,
        response_model: Any | None = None,
        status_code: int | None = None,
    ):
        return self._add_route("GET", path, status_code=status_code)

    def post(
        self,
        path: str,
        *,
        response_model: Any | None = None,
        status_code: int | None = None,
    ):
        return self._add_route("POST", path, status_code=status_code)

    def put(
        self,
        path: str,
        *,
        response_model: Any | None = None,
        status_code: int | None = None,
    ):
        return self._add_route("PUT", path, status_code=status_code)

    def delete(
        self,
        path: str,
        *,
        response_model: Any | None = None,
        status_code: int | None = None,
    ):
        return self._add_route("DELETE", path, status_code=status_code)

    def _add_route(self, method: str, path: str, *, status_code: int | None):
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            self._routes.append(
                _Route(method=method, path=path, endpoint=func, status_code=status_code)
            )
            return func

        return decorator

    # -- ハンドリング ---------------------------------------------------
    def _handle_request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
    ) -> Response:
        route, path_params = self._match_route(method, path)
        if route is None:
            return Response(status.HTTP_404_NOT_FOUND, {"detail": "Not Found"})
        try:
            result = self._call_endpoint(route.endpoint, path_params, params or {}, json)
            status_code = route.status_code or (
                status.HTTP_204_NO_CONTENT if result is None else status.HTTP_200_OK
            )
            body = _serialize(result)
            return Response(status_code, body)
        except HTTPException as exc:  # pragma: no cover - defensive
            return Response(exc.status_code, {"detail": exc.detail})

    def _match_route(self, method: str, path: str) -> tuple[_Route | None, dict[str, str]]:
        for route in self._routes:
            if route.method != method.upper():
                continue
            path_params = _match_path(route.path, path)
            if path_params is not None:
                return route, path_params
        return None, {}

    def _call_endpoint(
        self,
        endpoint: Callable[..., Any],
        path_params: dict[str, str],
        query_params: dict[str, Any],
        json_body: Any,
    ) -> Any:
        signature = inspect.signature(endpoint)
        annotations = get_type_hints(endpoint, include_extras=True)
        kwargs: dict[str, Any] = {}
        body_consumed = False

        for name, parameter in signature.parameters.items():
            annotation = annotations.get(name, parameter.annotation)
            base_type, metadata = _extract_metadata(annotation)
            depends = metadata.get("depends")
            query = metadata.get("query")

            if depends is not None:
                dependency = self.dependency_overrides.get(depends.dependency, depends.dependency)
                kwargs[name] = dependency()
                continue

            if name in path_params:
                kwargs[name] = _coerce_type(path_params[name], base_type)
                continue

            if name in query_params:
                kwargs[name] = _coerce_type(query_params[name], base_type)
                continue

            if query is not None:
                kwargs[name] = query.default
                continue

            if json_body is not None and not body_consumed:
                kwargs[name] = _build_body(base_type, json_body)
                body_consumed = True
                continue

            if parameter.default is not inspect._empty:
                kwargs[name] = parameter.default
                continue

            raise RuntimeError(f"パラメータ '{name}' を解決できません")

        return endpoint(**kwargs)


def _match_path(template: str, actual: str) -> dict[str, str] | None:
    template_parts = [part for part in template.strip("/").split("/") if part]
    actual_parts = [part for part in actual.strip("/").split("/") if part]
    if len(template_parts) != len(actual_parts):
        return None
    params: dict[str, str] = {}
    for template_part, actual_part in zip(template_parts, actual_parts, strict=True):
        if template_part.startswith("{") and template_part.endswith("}"):
            params[template_part[1:-1]] = actual_part
        elif template_part != actual_part:
            return None
    return params


def _extract_metadata(annotation: Any) -> tuple[Any, dict[str, Any]]:
    from typing import Annotated as TypingAnnotated

    metadata: dict[str, Any] = {}
    base_type = annotation
    if get_origin(annotation) is TypingAnnotated:
        args = get_args(annotation)
        base_type = args[0]
        for meta in args[1:]:
            if isinstance(meta, Depends):
                metadata["depends"] = meta
            elif isinstance(meta, Query):
                metadata["query"] = meta
    return base_type, metadata


def _coerce_type(value: Any, target: Any) -> Any:
    origin = get_origin(target)
    if origin is None:
        return _coerce_simple(value, target)
    if origin in {Union, types.UnionType}:
        args = [arg for arg in get_args(target) if arg is not type(None)]
        if value is None or value == "":
            return None
        for candidate in args:
            try:
                return _coerce_type(value, candidate)
            except Exception:  # noqa: BLE001 - best-effort coercion
                continue
        return value
    if origin is list:
        inner = get_args(target)[0]
        return [_coerce_type(v, inner) for v in value]
    if origin is tuple:
        inner = get_args(target)[0]
        return tuple(_coerce_type(v, inner) for v in value)
    return value


def _coerce_simple(value: Any, target: Any) -> Any:
    if target in {int, float, str}:
        if value is None:
            return None
        return target(value)
    return value


def _build_body(target: Any, json_body: Any) -> Any:
    if hasattr(target, "from_dict"):
        return target.from_dict(json_body)
    return json_body


def _serialize(result: Any) -> Any:
    if result is None:
        return None
    if isinstance(result, list):
        return [_serialize(item) for item in result]
    if hasattr(result, "to_dict"):
        return result.to_dict()
    return result


from .testclient import TestClient  # noqa: E402,F401  # isort:skip
