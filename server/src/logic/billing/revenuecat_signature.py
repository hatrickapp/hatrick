import hashlib
import hmac
import time

from src.app.config.settings import settings
from src.app.errors.domains.billing_errors import BillingConfigurationError, RevenueCatWebhookUnauthorizedError

def verify_revenuecat_webhook(raw_body: bytes, authorization: str | None, signature: str | None) -> None:
    rc_settings = settings.revenuecat
    if not rc_settings.webhook_authorization and not rc_settings.webhook_signing_secret:
        raise BillingConfigurationError()

    if rc_settings.webhook_authorization:
        if not authorization or not hmac.compare_digest(authorization, rc_settings.webhook_authorization):
            raise RevenueCatWebhookUnauthorizedError()

    if rc_settings.webhook_signing_secret:
        if not signature or not valid_webhook_signature(raw_body, signature, rc_settings.webhook_signing_secret):
            raise RevenueCatWebhookUnauthorizedError()


def valid_webhook_signature(raw_body: bytes, header: str, secret: str) -> bool:
    parts = {}
    for part in header.split(","):
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        parts[key.strip()] = value.strip()

    timestamp = parts.get("t")
    expected_signature = parts.get("v1")
    if not timestamp or not expected_signature:
        return False

    try:
        timestamp_int = int(timestamp)
    except ValueError:
        return False

    if abs(int(time.time()) - timestamp_int) > settings.revenuecat.webhook_signature_tolerance_seconds:
        return False

    signed_payload = f"{timestamp}.".encode("utf-8") + raw_body
    computed = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, expected_signature)
