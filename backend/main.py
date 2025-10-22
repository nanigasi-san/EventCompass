"""FastAPI サーバー起動スクリプト。"""
from __future__ import annotations

import argparse
import asyncio
from typing import Iterable, Optional

import uvicorn

from .app import create_app


async def _serve(server: uvicorn.Server) -> None:
    await server.serve()


def parse_args(argv: Optional[Iterable[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="EventCompass FastAPI サーバー")
    parser.add_argument("--host", default="127.0.0.1", help="バインドするホスト")
    parser.add_argument("--port", type=int, default=8000, help="待受ポート")
    parser.add_argument(
        "--log-level",
        default="info",
        choices=["critical", "error", "warning", "info", "debug", "trace"],
        help="ログレベル",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Iterable[str]] = None) -> None:
    args = parse_args(argv)
    app = create_app()
    config = uvicorn.Config(
        app,
        host=args.host,
        port=args.port,
        log_level=args.log_level,
        lifespan="auto",
    )
    server = uvicorn.Server(config)
    app.state.uvicorn_server = server

    try:
        asyncio.run(_serve(server))
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
