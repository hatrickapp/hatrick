from server.src.app.routers.classes.league_classes import LeagueInvitationItem
from server.src.app.routers.leagues.responses.league_item import league_item
from server.src.store.sql.leagues.read_models import LeagueInvitationRow

def invitation_item(invitation: LeagueInvitationRow) -> LeagueInvitationItem:
    return LeagueInvitationItem(
        league_invitation_id=invitation.league_invitation_id,
        league=league_item(invitation.league),
        invited_by_user_id=invitation.invited_by_user_id,
        invited_by_username=invitation.invited_by_username,
        invited_by_name=invitation.invited_by_name,
        invited_by_avatar_url=invitation.invited_by_avatar_url,
        invited_by_plan=invitation.invited_by_plan,
        status=invitation.status,
        created_at=invitation.created_at,
        responded_at=invitation.responded_at,
        expires_at=invitation.expires_at,
    )
