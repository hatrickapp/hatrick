from datetime import datetime, timezone

from asyncpg import Pool
import httpx
from redis.asyncio import Redis

from src.app.config.email_templates import OAuthWelcomeTemplate
from src.app.config.google_http import verify_google_id_token
from src.app.config.lua_manager import LuaScriptManager
from src.app.errors.domains.authentication_errors import OAuthEmailNotVerifiedError, OAuthProviderError
from src.app.events.event_emitter import event_emitter
from src.app.events.pubsub.event_publisher import RedisEventPublisher
from src.app.logging.logger_setup import get_logger
from src.app.validation.validate_email import validate_email
from src.logic.authentication.login.oauth.complete_oauth import OAuthCompleteResult, complete_oauth_session

logger = get_logger(__name__)


async def complete_native_google_oauth(
    pool: Pool,
    cache: Redis,
    lua_manager: LuaScriptManager,
    http: httpx.AsyncClient,
    id_token: str,
    country: str,
    publisher: RedisEventPublisher,
) -> OAuthCompleteResult:
    try:
        claims = await verify_google_id_token(http, id_token)
    except httpx.HTTPStatusError as exc:
        logger.warning("Google native OAuth provider error: status=%s", exc.response.status_code)
        raise OAuthProviderError() from exc
    except Exception as exc:
        logger.warning("Google native OAuth unexpected error: %s", type(exc).__name__)
        raise OAuthProviderError() from exc

    raw_email = claims.get("email")
    if not isinstance(raw_email, str) or claims.get("email_verified") is not True:
        raise OAuthEmailNotVerifiedError()

    is_valid_email, email_result = validate_email(raw_email)
    if not is_valid_email:
        raise OAuthProviderError()
    normalized_email: str = email_result

    provider_subject = claims.get("sub") if isinstance(claims.get("sub"), str) else None
    if not provider_subject:
        raise OAuthProviderError()

    name = claims.get("name") if isinstance(claims.get("name"), str) else None
    avatar_url = claims.get("picture") if isinstance(claims.get("picture"), str) else None

    result = await complete_oauth_session(
        pool,
        cache,
        lua_manager,
        publisher,
        provider="google",
        provider_subject=provider_subject,
        email=normalized_email,
        country=country,
        name=name,
        avatar_url=avatar_url,
    )

    timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    template = OAuthWelcomeTemplate(
        provider="Google",
        country=country,
        timestamp=timestamp,
    )
    await event_emitter(cache, "SEND_EMAIL_MESSAGE", {
        "email": normalized_email,
        "subject": template.subject,
        "message": template.html,
    })

    return result
