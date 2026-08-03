from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

def parse_provider_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
