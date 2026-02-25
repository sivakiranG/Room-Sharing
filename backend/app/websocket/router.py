import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.manager import manager
from app.core.security import decode_access_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/room/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: uuid.UUID,
    token: str = Query(...),
):
    # Validate JWT before accepting connection
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token payload")
        return

    # Verify membership
    from app.db.session import AsyncSessionLocal
    from app.models.room_member import RoomMember
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(RoomMember).where(
                RoomMember.room_id == room_id,
                RoomMember.user_id == uuid.UUID(user_id)
            )
        )
        if not result.scalar_one_or_none():
            await websocket.close(code=4003, reason="Not a member of this room")
            return

    room_id_str = str(room_id)
    await manager.connect(room_id_str, websocket)
    try:
        # Send a welcome ping
        await websocket.send_text('{"type":"connected","message":"Real-time connected"}')
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        await manager.disconnect(room_id_str, websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(room_id_str, websocket)
