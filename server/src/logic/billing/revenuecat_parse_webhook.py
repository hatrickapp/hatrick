import time
from typing import Any

from server.src.logic.billing.revenuecat_models import RevenueCatEvent
from server.src.logic.billing.revenuecat_values import datetime_from_ms, event_string

def parse_revenuecat_webhook(payload: dict[str, Any]) -> RevenueCatEvent:
    event = payload.get("event")
    if not isinstance(event, dict):
        raise ValueError("Missing RevenueCat event object.")

    event_type = event_string(event.get("type")) or "UNKNOWN"
    event_id = event_string(event.get("id")) or f"{event_type}:{event_string(event.get('event_timestamp_ms')) or time.time_ns()}"
    entitlement_ids_raw = event.get("entitlement_ids")
    entitlement_ids = [str(value) for value in entitlement_ids_raw] if isinstance(entitlement_ids_raw, list) else []
    entitlement_id = event_string(event.get("entitlement_id"))
    if entitlement_id and entitlement_id not in entitlement_ids:
        entitlement_ids.append(entitlement_id)

    return RevenueCatEvent(
        event_id=event_id,
        app_user_id=event_string(event.get("app_user_id")),
        event_type=event_type,
        environment=event_string(event.get("environment")),
        store=event_string(event.get("store")),
        product_id=event_string(event.get("product_id")),
        entitlement_ids=entitlement_ids,
        transaction_id=event_string(event.get("transaction_id")),
        original_transaction_id=event_string(event.get("original_transaction_id")),
        event_timestamp=datetime_from_ms(event.get("event_timestamp_ms")),
        purchased_at=datetime_from_ms(event.get("purchased_at_ms")),
        expiration_at=datetime_from_ms(event.get("expiration_at_ms")),
        cancellation_reason=event_string(event.get("cancel_reason")),
        expiration_reason=event_string(event.get("expiration_reason")),
        raw_payload=payload,
    )
