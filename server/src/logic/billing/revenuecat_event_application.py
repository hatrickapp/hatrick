from datetime import UTC, datetime
from uuid import UUID

from asyncpg import Connection, Pool
import httpx

from src.app.config.settings import settings
from src.logic.billing.revenuecat_models import ACTIVE_EVENT_TYPES, ALLOWED_STORES, DEMOTE_EVENT_TYPES, PASSIVE_EVENT_TYPES, RevenueCatEvent
from src.logic.billing.revenuecat_provider import sync_revenuecat_customer
from src.logic.billing.revenuecat_values import event_string, uuid_from_app_user_id
from src.store.sql.billing.insert_revenuecat_webhook_event import insert_revenuecat_webhook_event
from src.store.sql.billing.select_revenuecat_customer import select_revenuecat_customer
from src.store.sql.billing.select_user_exists import select_user_exists
from src.store.sql.billing.update_user_plan import update_user_plan
from src.store.sql.billing.upsert_revenuecat_customer import upsert_revenuecat_customer
from src.store.sql.billing.upsert_revenuecat_subscription import upsert_revenuecat_subscription

async def handle_revenuecat_webhook(pool: Pool, http: httpx.AsyncClient, event: RevenueCatEvent) -> None:
    user_id = None
    ignored = None
    affected_user_ids = []

    async with pool.acquire() as conn:
        async with conn.transaction():
            candidates = event_user_ids(event)
            for candidate in candidates:
                if await select_user_exists(conn, candidate):
                    user_id = candidate
                    break

            ignored = ignored_reason(event, user_id)
            if user_id is None and candidates:
                ignored = "UNKNOWN_USER"

            inserted = await insert_revenuecat_webhook_event(
                conn,
                event_id=event.event_id,
                user_id=user_id,
                app_user_id=event.app_user_id,
                event_type=event.event_type,
                environment=event.environment,
                store=event.store,
                product_id=event.product_id,
                entitlement_ids=event.entitlement_ids,
                transaction_id=event.transaction_id,
                original_transaction_id=event.original_transaction_id,
                event_timestamp=event.event_timestamp,
                purchased_at=event.purchased_at,
                expiration_at=event.expiration_at,
                cancellation_reason=event.cancellation_reason,
                expiration_reason=event.expiration_reason,
                ignored_reason=ignored,
                raw_payload=event.raw_payload,
            )
            if inserted and ignored is None and user_id is not None:
                affected_user_ids = [user_id, *await apply_event(conn, user_id, event)]
            elif ignored is None and user_id is not None:
                affected_user_ids = [user_id]

    for affected_user_id in affected_user_ids:
        await sync_revenuecat_customer(pool, http, affected_user_id)


async def apply_event(conn: Connection, user_id: UUID, event: RevenueCatEvent) -> list[UUID]:
    existing = await select_revenuecat_customer(conn, user_id)
    transferred_from_user_ids = []
    is_active = event.event_type in ACTIVE_EVENT_TYPES
    subscription_status = "active" if is_active else "unknown"
    unsubscribe_detected_at = None
    billing_issue_detected_at = None

    if event.event_type == "CANCELLATION":
        subscription_status = "canceled"
        unsubscribe_detected_at = event.event_timestamp or datetime.now(UTC)
        if event.cancellation_reason == "CUSTOMER_SUPPORT":
            is_active = False
        elif event.expiration_at and event.expiration_at > datetime.now(UTC):
            is_active = True
        else:
            is_active = bool(existing and existing["is_active"])
    elif event.event_type == "EXPIRATION":
        is_active = False
        subscription_status = "expired"
    elif event.event_type == "BILLING_ISSUE":
        subscription_status = "billing_issue"
        billing_issue_detected_at = event.event_timestamp or datetime.now(UTC)
        is_active = bool(existing and existing["is_active"])
    elif event.event_type == "SUBSCRIPTION_PAUSED":
        subscription_status = "paused"
        is_active = bool(existing and existing["is_active"])
    elif event.event_type == "TRANSFER":
        subscription_status = "transferred"
        is_active = settings.revenuecat.entitlement_id in event.entitlement_ids
        transferred_from_user_ids = await demote_transferred_from_users(conn, event)

    if event.event_type == "UNCANCELLATION":
        unsubscribe_detected_at = None

    customer_event_is_current = not (
        existing
        and existing["last_event_at"]
        and event.event_timestamp
        and event.event_timestamp < existing["last_event_at"]
    )
    if customer_event_is_current:
        await upsert_revenuecat_customer(
            conn,
            user_id=user_id,
            app_user_id=str(user_id),
            entitlement_id=settings.revenuecat.entitlement_id,
            is_active=is_active,
            has_purchase_history=event.store in ALLOWED_STORES,
            store=event.store if event.store in ALLOWED_STORES else None,
            product_id=event.product_id,
            original_transaction_id=event.original_transaction_id,
            transaction_id=event.transaction_id,
            environment=event.environment,
            purchased_at=event.purchased_at,
            expiration_at=event.expiration_at,
            unsubscribe_detected_at=unsubscribe_detected_at,
            billing_issue_detected_at=billing_issue_detected_at,
            event_id=event.event_id,
            event_type=event.event_type,
            event_at=event.event_timestamp,
        )

    if event.store in ALLOWED_STORES and event.environment in {"SANDBOX", "PRODUCTION"} and event.product_id and event.original_transaction_id:
        await upsert_revenuecat_subscription(
            conn,
            user_id=user_id,
            app_user_id=str(user_id),
            store=event.store,
            environment=event.environment,
            product_id=event.product_id,
            original_transaction_id=event.original_transaction_id,
            transaction_id=event.transaction_id,
            status=subscription_status,
            purchased_at=event.purchased_at,
            expiration_at=event.expiration_at,
            unsubscribe_detected_at=unsubscribe_detected_at,
            billing_issue_detected_at=billing_issue_detected_at,
            cancellation_reason=event.cancellation_reason,
            expiration_reason=event.expiration_reason,
            event_id=event.event_id,
            event_type=event.event_type,
            event_at=event.event_timestamp,
        )

    if customer_event_is_current and (event.event_type in ACTIVE_EVENT_TYPES or event.event_type in {"CANCELLATION", "TRANSFER"}):
        await update_user_plan(conn, user_id, "plus" if is_active else "free")
    elif customer_event_is_current and event.event_type in DEMOTE_EVENT_TYPES:
        await update_user_plan(conn, user_id, "free")

    return transferred_from_user_ids


async def demote_transferred_from_users(conn: Connection, event: RevenueCatEvent) -> list[UUID]:
    transferred_from = event.raw_payload.get("event", {}).get("transferred_from")
    if not isinstance(transferred_from, list):
        return []
    user_ids = []
    for app_user_id in transferred_from:
        source_user_id = uuid_from_app_user_id(event_string(app_user_id))
        if source_user_id is None or not await select_user_exists(conn, source_user_id):
            continue
        if source_user_id in user_ids:
            continue
        user_ids.append(source_user_id)
        existing = await select_revenuecat_customer(conn, source_user_id)
        if existing and existing["last_event_at"] and event.event_timestamp and event.event_timestamp < existing["last_event_at"]:
            continue
        await upsert_revenuecat_customer(
            conn,
            user_id=source_user_id,
            app_user_id=str(source_user_id),
            entitlement_id=settings.revenuecat.entitlement_id,
            is_active=False,
            has_purchase_history=True,
            store=event.store if event.store in ALLOWED_STORES else None,
            product_id=event.product_id,
            original_transaction_id=event.original_transaction_id,
            transaction_id=event.transaction_id,
            environment=event.environment,
            purchased_at=event.purchased_at,
            expiration_at=event.expiration_at,
            unsubscribe_detected_at=None,
            billing_issue_detected_at=None,
            event_id=event.event_id,
            event_type="TRANSFER_FROM",
            event_at=event.event_timestamp,
        )
        await update_user_plan(conn, source_user_id, "free")
    return user_ids


def ignored_reason(event: RevenueCatEvent, user_id: UUID | None) -> str | None:
    if event.event_type == "TEST":
        return "TEST_EVENT"
    if event.event_type == "TEMPORARY_ENTITLEMENT_GRANT":
        return "TEMPORARY_ENTITLEMENT_GRANT_NOT_GRANTED"
    if user_id is None:
        return "INVALID_APP_USER_ID"
    if settings.revenuecat.entitlement_id not in event.entitlement_ids and event.event_type != "TRANSFER":
        return "UNRELATED_ENTITLEMENT"
    if event.store and event.store not in ALLOWED_STORES:
        return "UNSUPPORTED_STORE"
    if event.event_type not in ACTIVE_EVENT_TYPES | DEMOTE_EVENT_TYPES | PASSIVE_EVENT_TYPES | {"CANCELLATION", "TRANSFER"}:
        return "UNHANDLED_EVENT_TYPE"
    return None


def event_user_ids(event: RevenueCatEvent) -> list[UUID]:
    transferred_to = event.raw_payload.get("event", {}).get("transferred_to")
    transfer_ids = transferred_to if isinstance(transferred_to, list) else []
    user_ids = []
    for app_user_id in [event.app_user_id, event.original_app_user_id, *event.aliases, *transfer_ids]:
        user_id = uuid_from_app_user_id(event_string(app_user_id))
        if user_id is not None and user_id not in user_ids:
            user_ids.append(user_id)
    return user_ids
