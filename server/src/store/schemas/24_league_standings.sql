CREATE TABLE league_standings (
  league_id UUID NOT NULL REFERENCES leagues(league_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id),
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  predictions_count INTEGER NOT NULL DEFAULT 0,
  correct_outcomes INTEGER NOT NULL DEFAULT 0,
  correct_btts INTEGER NOT NULL DEFAULT 0,
  correct_scorers INTEGER NOT NULL DEFAULT 0,
  hatricks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (league_id, user_id),
  CONSTRAINT chk_league_standings_rank CHECK (rank >= 1),
  CONSTRAINT chk_league_standings_counts CHECK (
    points >= 0
    AND predictions_count >= 0
    AND correct_outcomes >= 0
    AND correct_btts >= 0
    AND correct_scorers >= 0
    AND hatricks >= 0
  )
);

CREATE INDEX idx_league_standings_rank
ON league_standings (league_id, rank, user_id);

CREATE INDEX idx_league_standings_user
ON league_standings (user_id, league_id);
