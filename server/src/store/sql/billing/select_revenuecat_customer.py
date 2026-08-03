from datetime import datetime
import json
from uuid import UUID, uuid7

from asyncpg import Connection

async def select_revenuecat_customer(conn: Connection, user_id: UUID):
    query = """
    SELECT
      user_id,
      app_user_id,
      entitlement_id,
      is_active,
      has_purchase_history,
      current_period_ends_at,
      unsubscribe_detected_at,
      billing_issue_detected_at
    FROM revenuecat_customers
    WHERE user_id = $1
    """
    return await conn.fetchrow(query, user_id)
