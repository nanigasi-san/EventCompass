"""資材APIルーター。"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from controllers import ItemController
from .. import schemas

router = APIRouter(prefix="/items", tags=["items"])


def get_controller(request: Request) -> ItemController:
    controller: ItemController = request.app.state.item_controller
    return controller


@router.get("", response_model=List[schemas.Item])
def list_items(controller: ItemController = Depends(get_controller)) -> List[schemas.Item]:
    return [schemas.Item(**item) for item in controller.list()]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.ItemCreated)
def create_item(
    payload: schemas.ItemCreate,
    controller: ItemController = Depends(get_controller),
) -> schemas.ItemCreated:
    try:
        new_id = controller.add(payload.dict())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return schemas.ItemCreated(id=new_id)


@router.patch("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_item(
    item_id: int,
    patch: schemas.ItemUpdate,
    controller: ItemController = Depends(get_controller),
) -> None:
    try:
        controller.update(item_id, patch.dict(exclude_unset=True))
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, controller: ItemController = Depends(get_controller)) -> None:
    try:
        controller.remove(item_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/filter", response_model=List[schemas.Item])
def filter_items(
    tags: Optional[str] = Query(
        default=None,
        description="カンマ区切りのタグ一覧。全指定一致。",
    ),
    manager: str = Query("", description="担当者名でのフィルタ"),
    match: str = Query("all", regex="^(all|any)$", description="タグ条件。all=全含有/any=部分一致"),
    controller: ItemController = Depends(get_controller),
) -> List[schemas.Item]:
    base: List[dict] = controller.list()
    results = base
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        match_all = match == "all"
        results = controller.filter_by_tags(tag_list, match_all=match_all)
    if manager:
        manager_results = controller.filter_by_manager(manager)
        if tags:
            # 両方指定時は積集合
            ids = {item["id"] for item in results}
            results = [item for item in manager_results if item["id"] in ids]
        else:
            results = manager_results
    return [schemas.Item(**item) for item in results]
