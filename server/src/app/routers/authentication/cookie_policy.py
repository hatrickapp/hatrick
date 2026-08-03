from fastapi import Response

from src.app.config.settings import settings

COOKIE_OPTS = dict(
    httponly=True,
    secure=settings.session.cookie_secure,
    samesite=settings.session.cookie_samesite,
    path="/",
)
LEGACY_AUTH_COOKIES = ("X-" + "Device" + "-Token",)

def set_session_cookie(response: Response, token: str, expires_at) -> None:
    response.set_cookie(
        key="X-Session-Token",
        value=token,
        expires=expires_at,
        max_age=settings.session.expire_days * 24 * 60 * 60,
        **COOKIE_OPTS,
    )
def remove_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key="X-Session-Token",
        path="/",
        secure=settings.session.cookie_secure,
        samesite=settings.session.cookie_samesite,
    )
    for key in LEGACY_AUTH_COOKIES:
        response.delete_cookie(
            key=key,
            path="/",
            secure=settings.session.cookie_secure,
            samesite=settings.session.cookie_samesite,
        )
