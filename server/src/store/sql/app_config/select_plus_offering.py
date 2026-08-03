from asyncpg import Connection

async def select_plus_offering(conn: Connection):
    query = """
    SELECT
      price_label,
      cta_label,
      features
    FROM app_plus_offering
    WHERE config_key = 'plus'
    """
    return await conn.fetchrow(query)
