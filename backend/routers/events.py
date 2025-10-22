"""イベントAPIルーター。"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from controllers import EventController
from .. import schemas

router = APIRouter(prefix="/events", tags=["events"])


def get_controller(request: Request) -> EventController:
    controller: EventController = request.app.state.event_controller
    return controller


@router.get("", response_model=List[schemas.Event])
def list_events(controller: EventController = Depends(get_controller)) -> List[schemas.Event]:
    return [schemas.Event(**event) for event in controller.list()]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.EventCreated)
def create_event(
    payload: schemas.EventCreate,
    controller: EventController = Depends(get_controller),
) -> schemas.EventCreated:
    try:
        new_id = controller.add(payload.dict())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return schemas.EventCreated(id=new_id)


@router.patch("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_event(
    event_id: int,
    patch: schemas.EventUpdate,
    controller: EventController = Depends(get_controller),
) -> None:
    try:
        controller.update(event_id, patch.dict(exclude_unset=True))
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, controller: EventController = Depends(get_controller)) -> None:
    try:
        controller.remove(event_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/current", response_model=List[schemas.Event])
def current_events(
    time: str = Query(..., description="HH:MM 形式の判定時刻"),
    controller: EventController = Depends(get_controller),
) -> List[schemas.Event]:
    try:
        results = controller.current_at(time)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return [schemas.Event(**event) for event in results]
