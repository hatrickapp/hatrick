from datetime import datetime, timedelta, timezone
from uuid import UUID

from asyncpg import Pool

from server.src.app.crypto.encryption.hash_blake2s import hash_blake2s
from server.src.app.errors.domains.authentication_errors import InvalidUsernameError, UserNotFoundError, UsernameChangeRequiresPlusError, UsernameChangeTooSoonError, UsernameUnavailableError
from server.src.app.validation.validate_username import validate_username
from server.src.store.sql.authentication.users.complete_username_setup import complete_username_setup
from server.src.store.sql.authentication.users.reserve_username import reserve_username
from server.src.store.sql.authentication.users.select_username_mutation_state import select_username_mutation_state
from server.src.store.sql.authentication.users.update_username import update_username
from server.src.store.sql.authentication.users.username_is_available import username_is_available

USERNAME_CHANGE_INTERVAL = timedelta(days=30)


def username_hash(username: str) -> str:
    return hash_blake2s(username)


async def update_profile_username_logic(pool: Pool, user_id: UUID, username: str) -> str:
    is_valid, result = validate_username(username)
    if not is_valid:
        raise InvalidUsernameError(result)

    normalized_username = result
    normalized_hash = username_hash(normalized_username)

    async with pool.acquire() as conn:
        async with conn.transaction():
            state = await select_username_mutation_state(conn, user_id)
            if state is None:
                raise UserNotFoundError()

            if state.username == normalized_username:
                completed = await complete_username_setup(conn, user_id)
                if completed is None:
                    raise UserNotFoundError()
                return completed

            if state.username_setup_completed and not state.can_change_username:
                raise UsernameChangeRequiresPlusError()

            now = datetime.now(timezone.utc)
            if state.username_setup_completed and state.username_changed_at is not None:
                next_change_at = state.username_changed_at + USERNAME_CHANGE_INTERVAL
                if now < next_change_at:
                    raise UsernameChangeTooSoonError()

            if not await username_is_available(conn, normalized_username, normalized_hash, user_id):
                raise UsernameUnavailableError()

            await reserve_username(conn, user_id, state.username, state.username_hash)
            updated = await update_username(conn, user_id, normalized_username, normalized_hash)
            if updated is None:
                raise UsernameUnavailableError()
            return updated
