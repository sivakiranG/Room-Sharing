import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.room import Room
from app.models.room_member import RoomMember
from app.models.user import User
from app.schemas.schemas import RoomCreate, RoomJoin, RoomOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.post("", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room = Room(name=payload.name)
    db.add(room)
    await db.flush()  # get room.id before committing

    member = RoomMember(user_id=current_user.id, room_id=room.id)
    db.add(member)
    await db.commit()

    # Reload with members
    result = await db.execute(
        select(Room)
        .options(selectinload(Room.members).selectinload(RoomMember.user))
        .where(Room.id == room.id)
    )
    return result.scalar_one()


@router.post("/join", response_model=RoomOut)
async def join_room(
    payload: RoomJoin,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Room).where(Room.invite_code == payload.invite_code))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found with that invite code")

    # Check already a member
    existing = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room.id, RoomMember.user_id == current_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already a member of this room")

    member = RoomMember(user_id=current_user.id, room_id=room.id)
    db.add(member)
    await db.commit()

    result = await db.execute(
        select(Room)
        .options(selectinload(Room.members).selectinload(RoomMember.user))
        .where(Room.id == room.id)
    )
    return result.scalar_one()


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(
    room_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify membership
    membership = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id, RoomMember.user_id == current_user.id
        )
    )
    if not membership.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this room")

    result = await db.execute(
        select(Room)
        .options(selectinload(Room.members).selectinload(RoomMember.user))
        .where(Room.id == room_id)
    )
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
