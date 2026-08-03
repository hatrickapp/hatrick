from datetime import datetime
import json
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def select_revenuecat_billing_status(conn: Connection, user_id: UUID):
    query = """
    SELECT
      u.plan,
      rc.is_active AS revenuecat_active,
      rc.has_purchase_history,
      rc.current_period_ends_at,
      rc.unsubscribe_detected_at,
      EXISTS (
        SELECT 1
        FROM revenuecat_subscriptions rs
        WHERE rs.user_id = $1
          AND rs.store IN ('APP_STORE', 'PLAY_STORE')
      ) AS has_store_subscription,
      EXISTS (
        SELECT 1
        FROM revenuecat_customers rcc
        WHERE rcc.user_id = $1
          AND (
            rcc.active_store IN ('APP_STORE', 'PLAY_STORE')
            OR rcc.active_original_transaction_id IS NOT NULL
          )
      ) AS has_store_customer
    FROM users u
    LEFT JOIN revenuecat_customers rc ON rc.user_id = u.user_id
    WHERE u.user_id = $1
      AND u.is_deleted = FALSE
    """
    return await conn.fetchrow(query, user_id)
