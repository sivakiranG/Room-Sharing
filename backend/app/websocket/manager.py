import asyncio
from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # room_id -> list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if room_id not in self.active_connections:
                self.active_connections[room_id] = []
            self.active_connections[room_id].append(websocket)
        logger.info(f"WebSocket connected to room {room_id}. Total: {len(self.active_connections[room_id])}")

    async def disconnect(self, room_id: str, websocket: WebSocket):
        async with self._lock:
            if room_id in self.active_connections:
                try:
                    self.active_connections[room_id].remove(websocket)
                except ValueError:
                    pass
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
        logger.info(f"WebSocket disconnected from room {room_id}")

    async def broadcast_to_room(self, room_id: str, message: str):
        connections = self.active_connections.get(room_id, [])
        dead = []
        for websocket in connections:
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send to websocket: {e}")
                dead.append(websocket)
        # Remove dead connections
        if dead:
            async with self._lock:
                for ws in dead:
                    try:
                        self.active_connections[room_id].remove(ws)
                    except (ValueError, KeyError):
                        pass


manager = ConnectionManager()
