CREATE TABLE matches (
  match_id UUID PRIMARY KEY,
  provider_fixture_id INTEGER UNIQUE NOT NULL,
  competition_id UUID NOT NULL REFERENCES competitions(competition_id),
  competition_season_id UUID REFERENCES competition_seasons(competition_season_id),
  home_team_id UUID NOT NULL REFERENCES teams(team_id),
  away_team_id UUID NOT NULL REFERENCES teams(team_id),
  kickoff_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'NS',
  status_long TEXT,
  elapsed INTEGER,
  home_score INTEGER,
  away_score INTEGER,
  final_home_score INTEGER,
  final_away_score INTEGER,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  is_void BOOLEAN NOT NULL DEFAULT FALSE,
  provider_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_matches_status CHECK (char_length(status) BETWEEN 1 AND 16)
);

CREATE INDEX idx_matches_kickoff
ON matches (kickoff_at);

CREATE INDEX idx_matches_competition_kickoff
ON matches (competition_id, kickoff_at);

CREATE INDEX idx_matches_unsettled
ON matches (kickoff_at, is_settled)
WHERE is_settled = FALSE;
