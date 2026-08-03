CREATE TABLE league_invitations (
  league_invitation_id UUID PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES leagues(league_id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES users(user_id),
  invited_by_user_id UUID NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_league_invitations_not_self CHECK (invited_user_id != invited_by_user_id),
  CONSTRAINT chk_league_invitations_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

CREATE UNIQUE INDEX uq_league_invitations_pending_user
ON league_invitations (league_id, invited_user_id)
WHERE status = 'pending';

CREATE INDEX idx_league_invitations_invited_user
ON league_invitations (invited_user_id, status, created_at DESC);

CREATE INDEX idx_league_invitations_league
ON league_invitations (league_id, created_at DESC);
