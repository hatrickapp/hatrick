import asyncio

import httpx
import resend

from src.app.config.settings import settings
from src.app.crypto.encryption.hash_blake2s import hash_blake2s
from src.app.logging.logger_setup import get_logger

logger = get_logger(__name__)

async def send_email(http: httpx.AsyncClient, email: str, subject: str, message: str) -> None:
    del http

    resend.api_key = settings.resend.api_key
    params: resend.Emails.SendParams = {
        "from": settings.resend.sender_email,
        "to": [email],
        "subject": subject,
        "html": message,
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception:
        logger.exception("email_send_failed", extra={"email_hash": hash_blake2s(email)})
