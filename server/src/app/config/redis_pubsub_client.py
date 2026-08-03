import redis.asyncio as redis_module

from server.src.app.config.settings import settings

async def create_redis_pubsub_client() -> redis_module.Redis:
    client = redis_module.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=4,
        socket_timeout=None,
        socket_connect_timeout=10,
        health_check_interval=30,
    )
    return client
