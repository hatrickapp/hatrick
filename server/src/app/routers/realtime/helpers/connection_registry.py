import asyncio
from datetime import datetime, timezone
from uuid import UUID

from fastapi import WebSocket

REFRESH_INTERVAL_SECONDS = 60
CONNECTIONS: dict[UUID, set[WebSocket]] = {}
CONNECTIONS_LOCK = asyncio.Lock()

async def connect_user(user_id: UUID, websocket: WebSocket) -> None:
    async with CONNECTIONS_LOCK:
        CONNECTIONS.setdefault(user_id, set()).add(websocket)


async def disconnect_user(user_id: UUID, websocket: WebSocket) -> None:
    async with CONNECTIONS_LOCK:
        sockets = CONNECTIONS.get(user_id)
        if sockets is None:
            return
        sockets.discard(websocket)
        if not sockets:
            CONNECTIONS.pop(user_id, None)


async def notify_refresh_users(user_ids: list[UUID], scope: str) -> None:
    unique_user_ids = set(user_ids)
    if not unique_user_ids:
        return
    async with CONNECTIONS_LOCK:
        sockets = [socket for user_id in unique_user_ids for socket in CONNECTIONS.get(user_id, set())]
    if not sockets:
        return

    payload = {
        "type": "refresh",
        "scope": scope,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }
    dead_sockets: list[WebSocket] = []
    for socket in sockets:
        try:
            await socket.send_json(payload)
        except Exception:
            dead_sockets.append(socket)

    if dead_sockets:
        async with CONNECTIONS_LOCK:
            for user_id, user_sockets in list(CONNECTIONS.items()):
                user_sockets.difference_update(dead_sockets)
                if not user_sockets:
                    CONNECTIONS.pop(user_id, None)
