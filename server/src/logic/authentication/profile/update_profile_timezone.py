from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from asyncpg import Pool

from src.app.errors.domains.authentication_errors import InvalidTimezoneError
from src.store.sql.authentication.users.update_timezone import update_user_timezone

SUPPORTED_TIMEZONES = {
    "UTC",
    "Asia/Amman",
    "Asia/Riyadh",
    "Asia/Dubai",
    "Africa/Cairo",
    "Asia/Beirut",
    "Europe/Istanbul",
    "Europe/London",
    "Europe/Paris",
    "Europe/Athens",
    "Europe/Moscow",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Pacific/Auckland",
}

def validate_timezone(timezone: str) -> str:
    cleaned = timezone.strip()
    if cleaned not in SUPPORTED_TIMEZONES:
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
