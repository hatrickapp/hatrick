from datetime import datetime
import json
from uuid import UUID, uuid7

from asyncpg import Connection

async def upsert_revenuecat_customer(
    conn: Connection,
    *,
    user_id: UUID,
    app_user_id: str,
    entitlement_id: str,
    is_active: bool,
    has_purchase_history: bool,
    store: str | None,
    product_id: str | None,
    original_transaction_id: str | None,
    transaction_id: str | None,
    environment: str | None,
    purchased_at: datetime | None,
    expiration_at: datetime | None,
    unsubscribe_detected_at: datetime | None,
    billing_issue_detected_at: datetime | None,
    event_id: str | None,
    event_type: str | None,
    event_at: datetime | None,
) -> None:
    query = """
    INSERT INTO revenuecat_customers (
      user_id,
      app_user_id,
      entitlement_id,
      is_active,
      has_purchase_history,
      active_store,
      active_product_id,
      active_original_transaction_id,
      active_transaction_id,
      environment,
      current_period_starts_at,
      current_period_ends_at,
      unsubscribe_detected_at,
      billing_issue_detected_at,
      last_event_id,
      last_event_type,
      last_event_at,
      last_synced_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      app_user_id = EXCLUDED.app_user_id,
      entitlement_id = EXCLUDED.entitlement_id,
      is_active = EXCLUDED.is_active,
      has_purchase_history = revenuecat_customers.has_purchase_history OR EXCLUDED.has_purchase_history,
      active_store = COALESCE(EXCLUDED.active_store, revenuecat_customers.active_store),
      active_product_id = COALESCE(EXCLUDED.active_product_id, revenuecat_customers.active_product_id),
      active_original_transaction_id = COALESCE(EXCLUDED.active_original_transaction_id, revenuecat_customers.active_original_transaction_id),
      active_transaction_id = COALESCE(EXCLUDED.active_transaction_id, revenuecat_customers.active_transaction_id),
      environment = COALESCE(EXCLUDED.environment, revenuecat_customers.environment),
      current_period_starts_at = COALESCE(EXCLUDED.current_period_starts_at, revenuecat_customers.current_period_starts_at),
      current_period_ends_at = EXCLUDED.current_period_ends_at,
      unsubscribe_detected_at = EXCLUDED.unsubscribe_detected_at,
      billing_issue_detected_at = EXCLUDED.billing_issue_detected_at,
      last_event_id = COALESCE(EXCLUDED.last_event_id, revenuecat_customers.last_event_id),
      last_event_type = COALESCE(EXCLUDED.last_event_type, revenuecat_customers.last_event_type),
      last_event_at = COALESCE(EXCLUDED.last_event_at, revenuecat_customers.last_event_at),
      last_synced_at = NOW(),
      updated_at = NOW()
    """
    await conn.execute(
        query,
        user_id,
        app_user_id,
        entitlement_id,
        is_active,
        has_purchase_history,
        store,
        product_id,
        original_transaction_id,
        transaction_id,
        environment,
        purchased_at,
        expiration_at,
        unsubscribe_detected_at,
        billing_issue_detected_at,
        event_id,
        event_type,
        event_at,
    )
