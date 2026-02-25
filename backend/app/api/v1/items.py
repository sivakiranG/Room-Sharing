import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.item import Item
from app.models.consumption import Consumption
from app.models.user import User
from app.schemas.schemas import ItemCreate, ItemOut, ConsumeRequest
from app.api.deps import get_current_user, require_room_member

router = APIRouter(tags=["Items"])


@router.get("/rooms/{room_id}/items", response_model=list[ItemOut])
async def list_items(
    room_id: uuid.UUID,
    current_user: User = Depends(require_room_member),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Item)
        .options(selectinload(Item.creator))
        .where(Item.room_id == room_id)
        .order_by(Item.created_at.desc())
    )
    return result.scalars().all()


@router.post("/rooms/{room_id}/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    room_id: uuid.UUID,
    payload: ItemCreate,
    current_user: User = Depends(require_room_member),
    db: AsyncSession = Depends(get_db),
):
    item = Item(
        room_id=room_id,
        name=payload.name,
        total_quantity=payload.total_quantity,
        remaining_quantity=payload.total_quantity,
        unit=payload.unit,
        created_by=current_user.id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    # Reload with creator
    result = await db.execute(
        select(Item).options(selectinload(Item.creator)).where(Item.id == item.id)
    )
    item = result.scalar_one()

    return item


@router.post("/items/{item_id}/consume", response_model=ItemOut)
async def consume_item(
    item_id: uuid.UUID,
    payload: ConsumeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lock the item row to prevent race conditions
    result = await db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Verify user is a room member
    from app.models.room_member import RoomMember
    membership = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == item.room_id,
            RoomMember.user_id == current_user.id,
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this room")

    # Validate stock
    if payload.quantity > item.remaining_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough stock. Only {item.remaining_quantity} {item.unit} remaining",
        )

    # Deduct and log in a transaction
    item.remaining_quantity -= payload.quantity
    
    # Log for the specified user or the current user
    target_user_id = payload.user_id or current_user.id
    
    consumption = Consumption(
        item_id=item.id,
        user_id=target_user_id,
        recorded_by_id=current_user.id,
        quantity_consumed=payload.quantity,
    )
    db.add(consumption)
    await db.commit()

    # Reload with creator
    result = await db.execute(
        select(Item).options(selectinload(Item.creator)).where(Item.id == item.id)
    )
    item = result.scalar_one()

    return item
