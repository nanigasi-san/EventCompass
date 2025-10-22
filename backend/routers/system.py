"""システム制御用ルーター。"""
from __future__ import annotations

import asyncio
from typing import Dict, Iterable

from fastapi import APIRouter, Depends, HTTPException, Request, status

from io_manager import backup_json
from .. import schemas

router = APIRouter(tags=["system"])


def _controller_map(request: Request) -> Dict[str, object]:
    return {
        "members": request.app.state.member_controller,
        "events": request.app.state.event_controller,
        "items": request.app.state.item_controller,
    }


@router.get("/healthz", status_code=status.HTTP_200_OK)
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@router.post("/storage/save", status_code=status.HTTP_204_NO_CONTENT)
def save_all(
    payload: schemas.SaveRequest,
    controllers: Dict[str, object] = Depends(_controller_map),
) -> None:
    targets: Iterable[str]
    if payload.targets:
        targets = payload.targets
    else:
        targets = controllers.keys()

    for name in targets:
        controller = controllers.get(name)
        if controller is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"未知の保存対象: {name}",
            )
        filepath = getattr(controller, "filepath", None)
        if isinstance(filepath, str):
            backup_json(filepath)
        save = getattr(controller, "save", None)
        if callable(save):
            save()


@router.post("/shutdown", status_code=status.HTTP_202_ACCEPTED)
async def shutdown(request: Request) -> Dict[str, str]:
    server = getattr(request.app.state, "uvicorn_server", None)
    if server is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="サーバーオブジェクトが初期化されていません",
        )

    async def _stop() -> None:
        await asyncio.sleep(0.1)
        server.should_exit = True

    asyncio.create_task(_stop())
    return {"status": "shutting_down"}
