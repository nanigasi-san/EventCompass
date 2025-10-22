"""FastAPI アプリケーションファクトリ。"""
from __future__ import annotations

from fastapi import FastAPI

from controllers import EventController, ItemController, MemberController
from .routers import events, items, members, system


def create_app() -> FastAPI:
    """FastAPI アプリケーションを生成する。"""
    app = FastAPI(
        title="EventCompass Backend",
        version="0.1.0",
        description="EventCompass データアクセス用 FastAPI サーバー",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.state.member_controller = MemberController()
    app.state.event_controller = EventController()
    app.state.item_controller = ItemController()
    app.state.uvicorn_server = None

    app.include_router(system.router)
    app.include_router(members.router)
    app.include_router(events.router)
    app.include_router(items.router)

    return app
