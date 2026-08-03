from datetime import datetime

from server.src.app.routers.classes.base import BaseResponse

class BillingSyncResponse(BaseResponse):
    plan: str
    entitlement_id: str
    active: bool
    expires_at: datetime | None = None


class BillingStatusResponse(BaseResponse):
    plan: str
    active: bool
    has_restorable_purchase: bool
    expires_at: datetime | None = None
    unsubscribe_detected_at: datetime | None = None
