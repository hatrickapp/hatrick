CREATE TABLE competitions (
  competition_id UUID PRIMARY KEY,
  provider_league_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  type TEXT NOT NULL,
  logo_url TEXT,
  current_season INTEGER NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_competitions_type CHECK (type IN ('league', 'cup'))
);

CREATE INDEX idx_competitions_enabled_sort
ON competitions (is_enabled, sort_order, name);
