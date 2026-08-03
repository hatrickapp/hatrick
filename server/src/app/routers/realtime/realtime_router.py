import asyncio
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, WebSocket, status
from starlette.websockets import WebSocketDisconnect

from src.app.logging.logger_setup import get_logger
from src.app.routers.realtime.helpers.connection_registry import REFRESH_INTERVAL_SECONDS, connect_user, disconnect_user, notify_refresh_users
from src.store.sql.authentication.sessions.select_session_by_token_hash import select_session_by_token_hash

logger = get_logger(__name__)
router = APIRouter(prefix="/v1/realtime")


async def notify_dashboard_refresh_users(user_ids: list[UUID]) -> None:
    await notify_refresh_users(user_ids, "dashboard")


async def notify_profile_refresh_users(user_ids: list[UUID]) -> None:
    await notify_refresh_users(user_ids, "profile")


@router.websocket("/refresh")
async def refresh_socket(websocket: WebSocket):
    session_token = websocket.cookies.get("X-Session-Token")
    if not session_token and websocket.query_params.get("client_type") == "mobile":
        session_token = websocket.query_params.get("session_token")
    if not session_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    async with websocket.app.state.psql_pool.acquire() as conn:
        session = await select_session_by_token_hash(conn, session_token)

    if session is None or session.account_status != "active":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await connect_user(session.user_id, websocket)
    try:
        while True:
            await asyncio.sleep(REFRESH_INTERVAL_SECONDS)
            await websocket.send_json(
                {
                    "type": "refresh",
                    "scope": "dashboard",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                }
            )
    except WebSocketDisconnect:
        return
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception("realtime_refresh_socket_failed")
    finally:
        await disconnect_user(session.user_id, websocket)
