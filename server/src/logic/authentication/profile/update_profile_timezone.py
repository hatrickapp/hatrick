from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from asyncpg import Pool

from server.src.app.errors.domains.authentication_errors import InvalidTimezoneError
from server.src.store.sql.authentication.users.update_timezone import update_user_timezone

def validate_timezone(timezone: str) -> str:
    cleaned = timezone.strip()
    if len(cleaned) > 64:
        raise InvalidTimezoneError()
    try:
        ZoneInfo(cleaned)
    except ZoneInfoNotFoundError as exc:
        raise InvalidTimezoneError() from exc
    return cleaned


async def update_profile_timezone_logic(pool: Pool, user_id: UUID, timezone: str) -> str:
    cleaned = validate_timezone(timezone)
    async with pool.acquire() as conn:
        return await update_user_timezone(conn, user_id, cleaned)
