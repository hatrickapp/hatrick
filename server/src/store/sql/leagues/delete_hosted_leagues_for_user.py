from uuid import UUID

from asyncpg import Connection

async def delete_hosted_leagues_for_user(conn: Connection, user_id: UUID) -> None:
    await conn.execute(
        """
        UPDATE leagues
        SET status = 'deleted',
            deleted_at = NOW(),
            updated_at = NOW()
        WHERE host_user_id = $1
          AND status IN ('active', 'paused', 'closed')
        """,
        user_id,
    )
