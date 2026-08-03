from dataclasses import dataclass
from secrets import token_hex
from uuid import UUID

from asyncpg import Connection, UniqueViolationError

from server.src.logic.authentication.profile.update_profile_username import username_hash
from server.src.logic.authentication.shared.issue_session_with_device import IssuedSessionWithDevice, issue_session_with_device
from server.src.store.sql.authentication.users.insert_user import Provider, insert_user

@dataclass
class BootstrappedUser:
    user_id: UUID
    email: str
    device_token: str
    session: IssuedSessionWithDevice


def generate_default_username() -> str:
    return f"hatrick_{token_hex(4)}"


async def bootstrap_new_user(
    conn: Connection,
    *,
    email: str,
    provider: Provider,
    country: str,
    device: str,
    name: str | None = None,
    avatar_url: str | None = None,
    oauth_subject: str | None = None,
) -> BootstrappedUser:
    user = None
    for _ in range(10):
        username = generate_default_username()
        try:
            user = await insert_user(
                conn,
                email,
                provider=provider,
                username=username,
                username_hash=username_hash(username),
                name=name,
                avatar_url=avatar_url,
                oauth_subject=oauth_subject,
            )
            break
        except UniqueViolationError:
            continue

    if user is None:
        raise RuntimeError("Could not generate a unique username.")

    session = await issue_session_with_device(conn, user.user_id, country, device)

    return BootstrappedUser(
        user_id=user.user_id,
        email=email,
        device_token=session.device_token,
        session=session,
    )
