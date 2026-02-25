import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.chore import Chore
from app.models.user import User
from app.schemas.schemas import ChoreLogRequest
from app.api.deps import require_room_member

router = APIRouter(tags=["Chores"])


@router.post("/rooms/{room_id}/chores", status_code=status.HTTP_201_CREATED)
async def log_chore(
    room_id: uuid.UUID,
    payload: ChoreLogRequest,
    current_user: User = Depends(require_room_member),
    db: AsyncSession = Depends(get_db),
):
    chore = Chore(
        room_id=room_id,
        user_id=current_user.id,
        chore_type=payload.chore_type
    )
    db.add(chore)
    await db.commit()
    return {"message": "Chore logged successfully"}
