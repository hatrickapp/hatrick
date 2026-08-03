from uuid import UUID

from asyncpg import Pool

from server.src.store.sql.authentication.users.update_public_name_visibility import update_public_name_visibility

async def update_public_name_visibility_logic(pool: Pool, user_id: UUID, show_name_publicly: bool) -> bool:
    async with pool.acquire() as conn:
        result = await update_public_name_visibility(conn, user_id, show_name_publicly)
    if result is None:
        raise ValueError("user_not_found")
    return result
