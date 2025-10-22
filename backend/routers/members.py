"""メンバーAPIルーター。"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status

from controllers import MemberController
from .. import schemas

router = APIRouter(prefix="/members", tags=["members"])


def get_controller(request: Request) -> MemberController:
    controller: MemberController = request.app.state.member_controller
    return controller


@router.get("", response_model=List[schemas.Member])
def list_members(controller: MemberController = Depends(get_controller)) -> List[schemas.Member]:
    return [schemas.Member(**member) for member in controller.list()]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.MemberCreated)
def create_member(
    payload: schemas.MemberCreate,
    controller: MemberController = Depends(get_controller),
) -> schemas.MemberCreated:
    new_id = controller.add(payload.dict())
    return schemas.MemberCreated(id=new_id)


@router.patch("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_member(
    member_id: int,
    patch: schemas.MemberUpdate,
    controller: MemberController = Depends(get_controller),
) -> None:
    try:
        controller.update(member_id, patch.dict(exclude_unset=True))
    except KeyError as exc:  # メンバー未検出
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, controller: MemberController = Depends(get_controller)) -> None:
    try:
        controller.remove(member_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
