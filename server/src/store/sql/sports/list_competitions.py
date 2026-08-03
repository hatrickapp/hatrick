from asyncpg import Connection

from src.store.sql.sports.read_models import CompetitionRow

async def list_competitions(conn: Connection) -> list[CompetitionRow]:
    query = """
    SELECT
        competition_id,
        name,
        country,
        type,
        logo_url,
        sort_order
    FROM competitions
    WHERE is_enabled = TRUE
    ORDER BY sort_order ASC, name ASC
    """

    rows = await conn.fetch(query)
    return [
        CompetitionRow(
            competition_id=row["competition_id"],
            name=row["name"],
            country=row["country"],
            type=row["type"],
            logo_url=row["logo_url"],
            sort_order=row["sort_order"],
        )
        for row in rows
    ]
