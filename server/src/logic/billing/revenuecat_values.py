from datetime import UTC, datetime
from typing import Any
from uuid import UUID

def datetime_from_ms(value: Any) -> datetime | None:
    if value is None:
        return None
    try:
        return datetime.fromtimestamp(int(value) / 1000, UTC)
    except (TypeError, ValueError, OSError):
        return None


def uuid_from_app_user_id(value: str | None) -> UUID | None:
    if not value:
        return None
    try:
        return UUID(value)
    except ValueError:
        return None


def event_string(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
