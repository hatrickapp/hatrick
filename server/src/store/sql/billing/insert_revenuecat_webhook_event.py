from datetime import datetime
import json
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def insert_revenuecat_webhook_event(
    conn: Connection,
    *,
    event_id: str,
    user_id: UUID | None,
    app_user_id: str | None,
    event_type: str,
    environment: str | None,
    store: str | None,
    product_id: str | None,
    entitlement_ids: list[str] | None,
    transaction_id: str | None,
    original_transaction_id: str | None,
    event_timestamp: datetime | None,
    purchased_at: datetime | None,
    expiration_at: datetime | None,
    cancellation_reason: str | None,
    expiration_reason: str | None,
    ignored_reason: str | None,
    raw_payload: dict,
) -> bool:
    query = """
    INSERT INTO revenuecat_webhook_events (
      event_id,
      user_id,
      app_user_id,
      event_type,
      environment,
      store,
      product_id,
      entitlement_ids,
      transaction_id,
      original_transaction_id,
      event_timestamp,
      purchased_at,
      expiration_at,
      cancellation_reason,
      expiration_reason,
      ignored_reason,
      raw_payload,
      processed_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8::text[], $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb, NOW()
    )
    ON CONFLICT (event_id) DO NOTHING
    """
    result = await conn.execute(
        query,
        event_id,
        user_id,
        app_user_id,
        event_type,
        environment,
        store,
        product_id,
        entitlement_ids,
        transaction_id,
        original_transaction_id,
        event_timestamp,
        purchased_at,
        expiration_at,
        cancellation_reason,
        expiration_reason,
        ignored_reason,
        json.dumps(raw_payload),
    )
    return result == "INSERT 0 1"
