from fastapi import APIRouter, HTTPException, Request
import orjson

from src.app.routers.classes.base import BaseResponse
from src.app.routers.classes.billing_classes import BillingStatusResponse, BillingSyncResponse
from src.app.routers.dependencies.router_dependencies import HTTPDep, PoolDep, UserDep
from src.logic.billing.revenuecat import get_revenuecat_billing_status, handle_revenuecat_webhook, parse_revenuecat_webhook, sync_revenuecat_customer, verify_revenuecat_webhook

router = APIRouter(prefix="/v1")


@router.get("/billing/revenuecat/status", response_model=BillingStatusResponse)
async def revenuecat_billing_status_endpoint(pool: PoolDep, http: HTTPDep, user_id: UserDep):
    result = await get_revenuecat_billing_status(pool, http, user_id)
    return BillingStatusResponse(
        plan=result.plan,
        active=result.active,
        has_restorable_purchase=result.has_restorable_purchase,
        expires_at=result.expires_at,
        unsubscribe_detected_at=result.unsubscribe_detected_at,
    )


@router.post("/billing/revenuecat/sync", response_model=BillingSyncResponse)
async def sync_revenuecat_billing_endpoint(pool: PoolDep, http: HTTPDep, user_id: UserDep):
    result = await sync_revenuecat_customer(pool, http, user_id)
    return BillingSyncResponse(
        plan=result.plan,
        entitlement_id=result.entitlement_id,
        active=result.active,
        expires_at=result.expires_at,
    )


@router.post("/billing/revenuecat/webhook", response_model=BaseResponse)
async def revenuecat_webhook_endpoint(request: Request, pool: PoolDep, http: HTTPDep):
    raw_body = await request.body()
    verify_revenuecat_webhook(
        raw_body,
        request.headers.get("Authorization"),
        request.headers.get("X-RevenueCat-Webhook-Signature"),
    )

    try:
        payload = orjson.loads(raw_body)
        if not isinstance(payload, dict):
            raise ValueError("RevenueCat webhook payload must be an object.")
        event = parse_revenuecat_webhook(payload)
    except (orjson.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="INVALID_REVENUECAT_WEBHOOK") from exc

    await handle_revenuecat_webhook(pool, http, event)
    return BaseResponse()
