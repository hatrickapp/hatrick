from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse

from src.app.errors.base import AppError

HTTP_ERROR_MESSAGES = {
    "ADMIN_REQUIRED": "You do not have permission to access this admin resource.",
    "BOT_NOT_ALLOWED": "Automated requests are not allowed.",
    "CONSUMER_REQUIRED": "This action is only available for consumer accounts.",
    "DIRECT_ACCESS_FORBIDDEN": "Direct access is not allowed.",
    "DUPLICATE_ACCEPTED_PROCESSING": "This request is already being processed.",
    "ENDPOINT_NOT_REGISTERED": "This endpoint is not available.",
    "IDEMPOTENCY_KEY_PAYLOAD_MISMATCH": "This request key was already used with different data. Please try again.",
    "INTERNAL_SERVER_ERROR": "An unexpected server error occurred. Please try again.",
    "INVALID_CONTENT_LENGTH": "The request size could not be validated. Please try again.",
    "INVALID_REVENUECAT_WEBHOOK": "The webhook payload is invalid.",
    "INVALID_SESSION": "Your session is invalid. Please sign in again.",
    "MISSING_CLIENT_INFO": "Missing client information. Please refresh and try again.",
    "MISSING_IDEMPOTENCY_KEY": "Missing request safety key. Please refresh and try again.",
    "NOT_FOUND": "The requested resource could not be found.",
    "RATE_LIMIT_EXCEEDED": "Too many requests. Please wait a moment and try again.",
    "REQUEST_BODY_TOO_LARGE": "The uploaded request is too large.",
    "UNAUTHORIZED": "Please sign in to continue.",
}

REQUEST_VALIDATION_FIELD_MESSAGES = {
    "name": "League name must be 3 to 60 characters.",
    "competition_ids": "Choose at least one competition.",
    "starts_at": "Start date must be a valid date and cannot be before today.",
    "ends_at": "End date must be valid, after today, and within one year of the start date.",
    "max_members": "Maximum players must be a whole number between 2 and 100,000.",
}


def build_error_content(code: str, message: str) -> dict:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }


def http_error_message(code: str) -> str:
    return HTTP_ERROR_MESSAGES.get(code, "The request could not be completed. Please try again.")


def http_error_response(exc: HTTPException) -> JSONResponse:
    code = exc.detail if isinstance(exc.detail, str) else "HTTP_ERROR"
    response = JSONResponse(
        status_code=exc.status_code,
        content=build_error_content(code, http_error_message(code)),
    )
    for key, value in (exc.headers or {}).items():
        response.headers[key] = value
    return response


async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_content(exc.code, exc.message)
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    return http_error_response(exc)


async def request_validation_error_handler(request: Request, exc: RequestValidationError):
    field_message = None
    for error in exc.errors():
        loc = error.get("loc", ())
        field = str(loc[-1]) if loc else ""
        field_message = REQUEST_VALIDATION_FIELD_MESSAGES.get(field)
        if field_message:
            break
    return JSONResponse(
        status_code=422,
        content=build_error_content(
            "REQUEST_VALIDATION_ERROR",
            field_message or "Some request details are invalid. Please check your input and try again.",
        ),
    )
