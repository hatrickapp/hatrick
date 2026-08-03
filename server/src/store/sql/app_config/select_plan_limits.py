from asyncpg import Connection

async def select_plan_limits(conn: Connection, plan: str):
    query = """
    SELECT
      plan,
      active_league_limit,
      can_customize_competitions,
      can_customize_scoring,
      can_count_existing_points,
      can_change_username,
      priority_support
    FROM app_plan_limits
    WHERE plan = $1
    """
    return await conn.fetchrow(query, plan)
