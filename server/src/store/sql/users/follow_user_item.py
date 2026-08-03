from dataclasses import dataclass
from uuid import UUID, uuid7

from asyncpg import Connection

@dataclass
class FollowCounts:
    followers_count: int
    following_count: int
    is_following: bool
@dataclass
class FollowUserItem:
    cursor_id: UUID
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    is_following: bool

def follow_user_item(row) -> FollowUserItem:
    return FollowUserItem(
        cursor_id=row["cursor_id"],
        user_id=row["user_id"],
        username=row["username"],
        name=row["name"],
        avatar_url=row["avatar_url"],
        is_following=row["is_following"],
    )
