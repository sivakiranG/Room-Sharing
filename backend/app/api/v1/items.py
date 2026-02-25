import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.item import Item
from app.models.consumption import Consumption
from app.models.user import User
from app.schemas.schemas import ItemCreate, ItemOut, ConsumeRequest, UsageSummaryEntry
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


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch item
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Check if user is member of the room the item belongs to
    await require_room_member(item.room_id, current_user, db)
    
    await db.delete(item)
    await db.commit()
    return None


@router.get("/items/{item_id}/usage-summary", response_model=list[UsageSummaryEntry])
async def get_item_usage_summary(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch item to check room membership
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await require_room_member(item.room_id, current_user, db)

    # Group consumptions by user
    summary_query = (
        select(
            User.id.label("user_id"),
            User.name.label("user_name"),
            func.sum(Consumption.quantity_consumed).label("total_consumed")
        )
        .join(Consumption, User.id == Consumption.user_id)
        .where(Consumption.item_id == item_id)
        .group_by(User.id, User.name)
        .order_by(func.sum(Consumption.quantity_consumed).desc())
    )
    
    summary_result = await db.execute(summary_query)
    summary = []
    for row in summary_result.all():
        summary.append(UsageSummaryEntry(
            user_id=row.user_id,
            user_name=row.user_name,
            item_name=item.name,
            unit=item.unit,
            total_consumed=row.total_consumed
        ))
    
    return summary
