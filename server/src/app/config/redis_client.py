import redis.asyncio as redis_module

from src.app.config.settings import settings

async def create_redis_client() -> redis_module.Redis:
    client = redis_module.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,
        socket_timeout=30,
        socket_connect_timeout=10
    )
    return client