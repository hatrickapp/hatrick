import asyncio
from typing import Any, AsyncGenerator

import orjson
from redis.asyncio import Redis
from redis.exceptions import ConnectionError as RedisConnectionError, TimeoutError as RedisTimeoutError

from server.src.app.logging.logger_setup import get_logger

logger = get_logger(__name__)

REQUIRED_FIELDS = {"event_id", "event_type", "timestamp", "version", "payload"}

class RedisEventSubscriber:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    def is_valid_envelope(self, data: dict[str, Any]) -> bool:
        return all(field in data for field in REQUIRED_FIELDS)

    async def listen(self, channel: str) -> AsyncGenerator[dict[str, Any], None]:
        while True:
            try:
                async with self.redis.pubsub() as pubsub:
                    await pubsub.subscribe(channel)
                    logger.info("redis_pubsub_subscribed", extra={"channel": channel})

                    async for message in pubsub.listen():
                        if message["type"] != "message":
                            continue

                        raw_data = message["data"]
                        if not isinstance(raw_data, (bytes, str)):
                            logger.warning(
                                "redis_pubsub_unexpected_data_type",
                                extra={"channel": channel, "type": type(raw_data)}
                            )
                            continue

                        try:
                            data = orjson.loads(raw_data)
                        except orjson.JSONDecodeError:
                            logger.error(
                                "redis_pubsub_json_decode_failed",
                                extra={"channel": channel, "raw_data": str(raw_data)[:200]}
                            )
                            continue

                        if not isinstance(data, dict) or not self.is_valid_envelope(data):
                            logger.warning(
                                "redis_pubsub_invalid_envelope_dropped",
                                extra={"channel": channel, "data": data}
                            )
                            continue

                        try:
                            yield data
                        except Exception:
                            logger.warning(
                                "redis_pubsub_consumption_failed_retrying",
                                extra={"channel": channel, "event_id": data.get("event_id")}
                            )
                            await asyncio.sleep(0.01)
                            try:
                                yield data
                            except Exception:
                                logger.exception(
                                    "redis_pubsub_consumption_failed_permanently",
                                    extra={"channel": channel, "event_id": data.get("event_id")}
                                )

            except asyncio.CancelledError:
                raise
            except (RedisConnectionError, RedisTimeoutError):
                logger.exception("redis_pubsub_connection_lost", extra={"channel": channel})
                await asyncio.sleep(2.0)
            except Exception:
                logger.exception("redis_pubsub_unexpected_error", extra={"channel": channel})
                await asyncio.sleep(2.0)
