from datetime import datetime
import json
from uuid import UUID, uuid7

from asyncpg import Connection

async def upsert_revenuecat_subscription(
    conn: Connection,
    *,
    user_id: UUID,
    app_user_id: str,
    store: str,
    environment: str,
    product_id: str,
    original_transaction_id: str,
    transaction_id: str | None,
    status: str,
    purchased_at: datetime | None,
    expiration_at: datetime | None,
    unsubscribe_detected_at: datetime | None,
    billing_issue_detected_at: datetime | None,
    cancellation_reason: str | None,
    expiration_reason: str | None,
    event_id: str | None,
    event_type: str | None,
    event_at: datetime | None,
) -> None:
    query = """
    INSERT INTO revenuecat_subscriptions (
      subscription_id,
      user_id,
      app_user_id,
      store,
      environment,
      product_id,
      original_transaction_id,
      latest_transaction_id,
      status,
      purchased_at,
      expires_at,
      unsubscribe_detected_at,
      billing_issue_detected_at,
      cancellation_reason,
      expiration_reason,
      last_event_id,
      last_event_type,
      last_event_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
    ON CONFLICT (store, original_transaction_id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      app_user_id = EXCLUDED.app_user_id,
      environment = EXCLUDED.environment,
      product_id = EXCLUDED.product_id,
      latest_transaction_id = EXCLUDED.latest_transaction_id,
      status = EXCLUDED.status,
      purchased_at = COALESCE(EXCLUDED.purchased_at, revenuecat_subscriptions.purchased_at),
      expires_at = EXCLUDED.expires_at,
      unsubscribe_detected_at = EXCLUDED.unsubscribe_detected_at,
      billing_issue_detected_at = EXCLUDED.billing_issue_detected_at,
      cancellation_reason = EXCLUDED.cancellation_reason,
      expiration_reason = EXCLUDED.expiration_reason,
      last_event_id = COALESCE(EXCLUDED.last_event_id, revenuecat_subscriptions.last_event_id),
      last_event_type = COALESCE(EXCLUDED.last_event_type, revenuecat_subscriptions.last_event_type),
      last_event_at = COALESCE(EXCLUDED.last_event_at, revenuecat_subscriptions.last_event_at),
      updated_at = NOW()
    """
    await conn.execute(
        query,
        uuid7(),
        user_id,
        app_user_id,
        store,
        environment,
        product_id,
        original_transaction_id,
        transaction_id,
        status,
        purchased_at,
        expiration_at,
        unsubscribe_detected_at,
        billing_issue_detected_at,
        cancellation_reason,
        expiration_reason,
        event_id,
        event_type,
        event_at,
    )
