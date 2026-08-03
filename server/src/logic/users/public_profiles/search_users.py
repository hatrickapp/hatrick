from uuid import UUID

from asyncpg import Pool

from src.logic.users.public_profiles.normalize_user_search_query import normalize_user_search_query
from src.store.sql.users.search_public_users import PublicUserSearchItem, search_public_users

async def search_users(pool: Pool, query: str, cursor: UUID | None, limit: int) -> list[PublicUserSearchItem]:
    normalized = normalize_user_search_query(query)
    if len(normalized) < 2 or not normalized.replace("_", "").isalnum():
        return []

    async with pool.acquire() as conn:
        return await search_public_users(conn, normalized, cursor, limit)
