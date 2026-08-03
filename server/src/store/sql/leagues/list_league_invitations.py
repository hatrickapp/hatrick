from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.cleanup_league_invitations_for_user import cleanup_league_invitations_for_user
from server.src.store.sql.leagues.map_invitation import map_invitation
from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.leagues.select_league_competitions import select_league_competitions
from server.src.store.sql.sports.read_models import CompetitionRow

async def list_league_invitations(conn: Connection, invited_user_id: UUID) -> list[LeagueInvitationRow]:
    await cleanup_league_invitations_for_user(conn, invited_user_id)
    rows = await conn.fetch(
        """
        SELECT
            li.league_invitation_id,
            li.invited_by_user_id,
            inviter.username AS invited_by_username,
            CASE WHEN inviter.show_name_publicly THEN inviter.name ELSE NULL END AS invited_by_name,
            inviter.avatar_url AS invited_by_avatar_url,
            inviter.plan AS invited_by_plan,
            li.status AS invitation_status,
            li.created_at AS invitation_created_at,
            li.responded_at,
            li.expires_at,
            l.league_id,
            l.host_user_id,
            host.username AS host_username,
            CASE WHEN host.show_name_publicly THEN host.name ELSE NULL END AS host_name,
            l.name,
            l.status,
            l.starts_at,
            l.ends_at,
            l.include_existing_points,
            l.max_members,
            l.include_outcome_points,
            l.include_btts_points,
            l.include_scorer_points,
            l.include_hatrick_bonus,
            l.only_hatricks,
            l.winner_user_id,
            l.finished_at,
            l.created_at AS league_created_at,
            l.updated_at AS league_updated_at,
            COUNT(lm.user_id) FILTER (WHERE lm.status = 'active')::int AS member_count
        FROM league_invitations li
        JOIN leagues l ON l.league_id = li.league_id
        JOIN users host ON host.user_id = l.host_user_id
        JOIN users inviter ON inviter.user_id = li.invited_by_user_id
        LEFT JOIN league_members lm ON lm.league_id = l.league_id
        WHERE li.invited_user_id = $1
          AND l.status NOT IN ('deleted', 'finished')
        GROUP BY li.league_invitation_id, inviter.user_id, host.user_id, l.league_id
        ORDER BY COALESCE(li.responded_at, li.created_at) DESC
        """,
        invited_user_id,
    )
    invitations: list[LeagueInvitationRow] = []
    for row in rows:
        competitions = await select_league_competitions(conn, row["league_id"])
        invitations.append(map_invitation(row, competitions))
    return invitations
