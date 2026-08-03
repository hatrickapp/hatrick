CREATE TABLE league_competitions (
  league_id UUID NOT NULL REFERENCES leagues(league_id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(competition_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (league_id, competition_id)
);

CREATE INDEX idx_league_competitions_competition
ON league_competitions (competition_id, league_id);
