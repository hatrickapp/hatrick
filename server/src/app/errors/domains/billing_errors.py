from src.app.errors.base import AppError

class BillingConfigurationError(AppError):
    code = "BILLING_NOT_CONFIGURED"
    status_code = 503
    message = "Billing is not configured yet."


class BillingProviderError(AppError):
    code = "BILLING_PROVIDER_ERROR"
    status_code = 502
    message = "Could not reach the billing provider. Please try again."


class RevenueCatWebhookUnauthorizedError(AppError):
    code = "REVENUECAT_WEBHOOK_UNAUTHORIZED"
    status_code = 401
    message = "Webhook authorization failed."
