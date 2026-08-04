import asyncio

from fastapi import FastAPI
import httpx
from redis.asyncio import Redis

from src.app.config.settings import settings
from src.app.crons.refresh_cloudflare_ips import cloudflare_ip_refresh_cron
from src.logic.workers.handle_dummy_email import handle_dummy_email
from src.logic.workers.handle_email import handle_email_event
from src.logic.workers.redis.handle_session_expire import handle_session_expire
from src.logic.workers.redis.handle_session_hash_expire import handle_session_hash_expire
from src.logic.workers.redis.handle_user_sessions_expire import handle_user_sessions_expire
from src.logic.workers.redis.handle_user_sessions_expire_except import handle_user_sessions_expire_except
from src.logic.workers.session_memory_invalidation_listener import session_memory_invalidation_listener
from src.logic.workers.sports_sync_worker import sports_sync_cron
from src.logic.workers.worker_event_loop import run_worker_loop

def start_background_workers(
    app: FastAPI,
    redis: Redis,
    redis_pubsub: Redis,
    http: httpx.AsyncClient,
    concurrency: int = 1,
) -> list[asyncio.Task]:
    lua_manager = app.state.lua_manager
    handlers = {
        "SEND_EMAIL_MESSAGE": lambda payload: handle_email_event(http, payload),
        "DUMMY_EMAIL": lambda payload: handle_dummy_email(payload),
        "SESSION_EXPIRE_FAILED": lambda payload: handle_session_expire(redis, lua_manager, payload),
        "SESSION_HASH_EXPIRE_FAILED": lambda payload: handle_session_hash_expire(redis, lua_manager, payload),
        "USER_SESSIONS_EXPIRE_FAILED": lambda payload: handle_user_sessions_expire(redis, lua_manager, payload),
        "USER_SESSIONS_EXPIRE_EXCEPT_FAILED": lambda payload: handle_user_sessions_expire_except(redis, lua_manager, payload),
    }

    tasks: list[asyncio.Task] = []

    for _ in range(concurrency):
        tasks.append(asyncio.create_task(run_worker_loop(redis, handlers)))

    tasks.append(asyncio.create_task(cloudflare_ip_refresh_cron(app, http)))
    if settings.SPORTS_SYNC_ENABLED:
        tasks.append(asyncio.create_task(sports_sync_cron(app, http)))
    tasks.append(asyncio.create_task(session_memory_invalidation_listener(redis_pubsub, app.state.session_cache)))

    return tasks
