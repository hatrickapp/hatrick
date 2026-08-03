from datetime import UTC, datetime
from typing import Any
from urllib.parse import quote
from uuid import UUID

from asyncpg import Pool
import httpx

from src.app.config.settings import settings
from src.app.errors.domains.billing_errors import BillingConfigurationError, BillingProviderError
from src.logic.billing.revenuecat_models import RevenueCatSyncResult
from src.logic.billing.revenuecat_values import datetime_from_ms
from src.store.sql.billing.select_revenuecat_customer import select_revenuecat_customer
from src.store.sql.billing.update_user_plan import update_user_plan
from src.store.sql.billing.upsert_revenuecat_customer import upsert_revenuecat_customer

async def sync_revenuecat_customer(pool: Pool, http: httpx.AsyncClient, user_id: UUID) -> RevenueCatSyncResult:
    rc_settings = settings.revenuecat
    if not rc_settings.project_id or not rc_settings.secret_api_key:
        raise BillingConfigurationError()

    entitlement = await fetch_active_entitlement(http, str(user_id), rc_settings.entitlement_id)

    async with pool.acquire() as conn:
        async with conn.transaction():
            existing = await select_revenuecat_customer(conn, user_id)
            is_active = bool(entitlement.get("active"))
            expires_at = entitlement.get("expires_at")

            await upsert_revenuecat_customer(
                conn,
                user_id=user_id,
                app_user_id=str(user_id),
                entitlement_id=rc_settings.entitlement_id,
                is_active=is_active,
                has_purchase_history=bool(is_active or (existing and existing["has_purchase_history"])),
                store=None,
                product_id=None,
                original_transaction_id=None,
                transaction_id=None,
                environment=None,
                purchased_at=None,
                expiration_at=expires_at,
                unsubscribe_detected_at=existing["unsubscribe_detected_at"] if existing else None,
                billing_issue_detected_at=existing["billing_issue_detected_at"] if existing else None,
                event_id=None,
                event_type="SERVER_SYNC",
                event_at=datetime.now(UTC),
            )
            await update_user_plan(conn, user_id, "plus" if is_active else "free")

    return RevenueCatSyncResult(
        plan="plus" if is_active else "free",
        entitlement_id=rc_settings.entitlement_id,
        active=is_active,
        expires_at=expires_at,
    )


async def sync_revenuecat_customer_if_ready(pool: Pool, http: httpx.AsyncClient, user_id: UUID) -> bool:
    rc_settings = settings.revenuecat
    if not rc_settings.project_id or not rc_settings.secret_api_key:
        return False

    try:
        await sync_revenuecat_customer(pool, http, user_id)
    except (BillingConfigurationError, BillingProviderError):
        return False
    return True


async def fetch_active_entitlement(http: httpx.AsyncClient, app_user_id: str, entitlement_id: str) -> dict[str, Any]:
    project_id = quote(settings.revenuecat.project_id, safe="")
    customer_id = quote(app_user_id, safe="")
    url = f"{settings.revenuecat.api_base_url}/projects/{project_id}/customers/{customer_id}/active_entitlements"

    try:
        response = await http.get(
            url,
            headers={
                "Authorization": f"Bearer {settings.revenuecat.secret_api_key}",
                "Accept": "application/json",
            },
            params={"limit": 100},
        )
    except httpx.HTTPError as exc:
        raise BillingProviderError() from exc

    if response.status_code == 404:
        return {"active": False, "expires_at": None}
    if response.status_code >= 400:
        raise BillingProviderError()

    try:
        payload = response.json()
    except ValueError as exc:
        raise BillingProviderError() from exc
    items = payload.get("items") if isinstance(payload, dict) else None
    if not isinstance(items, list):
        raise BillingProviderError()

    for item in items:
        if not isinstance(item, dict):
            continue
        if item.get("entitlement_id") != entitlement_id:
            continue
        return {
            "active": True,
            "expires_at": datetime_from_ms(item.get("expires_at")),
        }

    return {"active": False, "expires_at": None}
