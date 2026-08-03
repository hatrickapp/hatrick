from dataclasses import dataclass
from datetime import datetime
from typing import Any

ACTIVE_EVENT_TYPES = {"INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION"}
DEMOTE_EVENT_TYPES = {"EXPIRATION"}
PASSIVE_EVENT_TYPES = {"BILLING_ISSUE", "SUBSCRIPTION_PAUSED"}
ALLOWED_STORES = {"APP_STORE", "PLAY_STORE"}


@dataclass
class RevenueCatSyncResult:
    plan: str
    entitlement_id: str
    active: bool
    expires_at: datetime | None


@dataclass
class RevenueCatBillingStatus:
    plan: str
    active: bool
    has_restorable_purchase: bool
    expires_at: datetime | None
    unsubscribe_detected_at: datetime | None


@dataclass
class RevenueCatEvent:
    event_id: str
    app_user_id: str | None
    event_type: str
    environment: str | None
    store: str | None
    product_id: str | None
    entitlement_ids: list[str]
    transaction_id: str | None
    original_transaction_id: str | None
    event_timestamp: datetime | None
    purchased_at: datetime | None
    expiration_at: datetime | None
    cancellation_reason: str | None
    expiration_reason: str | None
    raw_payload: dict[str, Any]
