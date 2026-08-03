CREATE TABLE competition_seasons (
  competition_season_id UUID PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES competitions(competition_id),
  season_year INTEGER NOT NULL,
  provider_season INTEGER NOT NULL,
  starts_on DATE,
  ends_on DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_competition_seasons_unique
ON competition_seasons (competition_id, season_year);

CREATE INDEX idx_competition_seasons_current
ON competition_seasons (competition_id, is_current)
WHERE is_current = TRUE;
