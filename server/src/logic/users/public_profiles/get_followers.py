from uuid import UUID

from asyncpg import Pool

from src.logic.users.public_profiles.normalize_user_search_query import normalize_user_search_query
from src.store.sql.users.list_followers import FollowUserItem, list_followers

async def get_followers(
    pool: Pool,
    username: str,
    viewer_user_id: UUID,
    query: str,
    cursor: UUID | None,
    limit: int,
) -> list[FollowUserItem]:
    normalized_username = username.strip().lower()
    normalized_query = normalize_user_search_query(query)
    if normalized_query and (len(normalized_query) < 2 or not normalized_query.replace("_", "").isalnum()):
        return []
    async with pool.acquire() as conn:
        return await list_followers(conn, normalized_username, viewer_user_id, normalized_query, cursor, limit)
