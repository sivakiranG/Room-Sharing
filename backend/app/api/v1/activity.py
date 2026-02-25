import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.consumption import Consumption
from app.models.item import Item
from app.models.user import User
from app.models.chore import Chore
from app.models.room_member import RoomMember
from app.schemas.schemas import ActivityEntry, UsageSummaryEntry
from app.api.deps import require_room_member

router = APIRouter(tags=["Activity"])


@router.get("/rooms/{room_id}/activity", response_model=list[ActivityEntry])
async def get_activity(
    room_id: uuid.UUID,
    limit: int = 50,
    current_user: User = Depends(require_room_member),
    db: AsyncSession = Depends(get_db),
):
    # Fetch consumptions
    cons_result = await db.execute(
        select(Consumption)
        .options(
            selectinload(Consumption.user), 
            selectinload(Consumption.item),
            selectinload(Consumption.recorder)
        )
        .join(Item, Consumption.item_id == Item.id)
        .where(Item.room_id == room_id)
        .order_by(Consumption.created_at.desc())
        .limit(limit)
    )
    consumptions = cons_result.scalars().all()

    # Fetch item additions (refills)
    items_result = await db.execute(
        select(Item)
        .options(selectinload(Item.creator))
        .where(Item.room_id == room_id)
        .order_by(Item.created_at.desc())
        .limit(limit)
    )
    items = items_result.scalars().all()

    # Fetch chores
    chores_result = await db.execute(
        select(Chore)
        .options(selectinload(Chore.user))
        .where(Chore.room_id == room_id)
        .order_by(Chore.created_at.desc())
        .limit(limit)
    )
    chores = chores_result.scalars().all()

    # Map to ActivityEntry
    activities = []
    
    for c in consumptions:
        activities.append(ActivityEntry(
            id=c.id,
            activity_type="consumption",
            user_name=c.user.name,
            recorded_by_name=c.recorder.name if c.recorder else None,
            item_name=c.item.name,
            quantity=c.quantity_consumed,
            unit=c.item.unit,
            created_at=c.created_at,
        ))
        
    for i in items:
        activities.append(ActivityEntry(
            id=i.id,
            activity_type="refill",
            user_name=i.creator.name,
            recorded_by_name=i.creator.name,
            item_name=i.name,
            quantity=i.total_quantity,
            unit=i.unit,
            created_at=i.created_at,
        ))

    for ch in chores:
        activities.append(ActivityEntry(
            id=ch.id,
            activity_type="chore",
            user_name=ch.user.name,
            chore_type=ch.chore_type,
            created_at=ch.created_at,
        ))

    # Sort interleaved and limit
    activities.sort(key=lambda x: x.created_at, reverse=True)
    return activities[:limit]


@router.get("/rooms/{room_id}/summary", response_model=list[UsageSummaryEntry])
async def get_usage_summary(
    room_id: uuid.UUID,
    current_user: User = Depends(require_room_member),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            User.id.label("user_id"),
            User.name.label("user_name"),
            Item.name.label("item_name"),
            Item.unit.label("unit"),
            func.sum(Consumption.quantity_consumed).label("total_consumed"),
        )
        .join(Consumption, User.id == Consumption.user_id)
        .join(Item, Consumption.item_id == Item.id)
        .where(Item.room_id == room_id)
        .group_by(User.id, User.name, Item.name, Item.unit)
        .order_by(User.name, Item.name)
    )
    rows = result.all()
    return [
        UsageSummaryEntry(
            user_id=r.user_id,
            user_name=r.user_name,
            item_name=r.item_name,
            unit=r.unit,
            total_consumed=r.total_consumed,
        )
        for r in rows
    ]
