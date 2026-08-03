from uuid import UUID

from asyncpg import Pool
import httpx

from src.logic.billing.revenuecat_models import RevenueCatBillingStatus
from src.logic.billing.revenuecat_provider import sync_revenuecat_customer_if_ready
from src.store.sql.billing.select_revenuecat_billing_status import select_revenuecat_billing_status

async def get_revenuecat_billing_status(pool: Pool, http: httpx.AsyncClient, user_id: UUID) -> RevenueCatBillingStatus:
    await sync_revenuecat_customer_if_ready(pool, http, user_id)

    async with pool.acquire() as conn:
        row = await select_revenuecat_billing_status(conn, user_id)

    if row is None:
        return RevenueCatBillingStatus(
            plan="free",
            active=False,
            has_restorable_purchase=False,
            expires_at=None,
            unsubscribe_detected_at=None,
        )

    active = row["plan"] == "plus" or bool(row["revenuecat_active"])
    has_purchase_history = bool(row["has_purchase_history"] or row["has_store_subscription"] or row["has_store_customer"])
    has_restorable_purchase = not active and has_purchase_history

    return RevenueCatBillingStatus(
        plan="plus" if active else "free",
        active=active,
        has_restorable_purchase=has_restorable_purchase,
        expires_at=row["current_period_ends_at"],
        unsubscribe_detected_at=row["unsubscribe_detected_at"],
    )
