CREATE TABLE league_members (
  league_member_id UUID PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES leagues(league_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL DEFAULT 'active',
  score_starts_at TIMESTAMPTZ NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  CONSTRAINT uq_league_members_user UNIQUE (league_id, user_id),
  CONSTRAINT chk_league_members_status CHECK (status IN ('active', 'left')),
  CONSTRAINT chk_league_members_left_state CHECK (
    (status = 'left' AND left_at IS NOT NULL)
    OR status != 'left'
  )
);

CREATE INDEX idx_league_members_user_status
ON league_members (user_id, status, league_id);

CREATE INDEX idx_league_members_league_status
ON league_members (league_id, status, joined_at);

CREATE INDEX idx_league_members_league_scoring
ON league_members (league_id, status, user_id, score_starts_at);
