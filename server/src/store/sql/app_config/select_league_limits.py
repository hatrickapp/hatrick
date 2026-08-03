from asyncpg import Connection

async def select_league_limits(conn: Connection):
    query = """
    SELECT
      default_max_members,
      max_members,
      max_period_days,
      max_start_days_ahead
    FROM app_league_limits
    WHERE config_key = 'default'
    """
    return await conn.fetchrow(query)
