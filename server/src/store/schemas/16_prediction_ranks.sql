CREATE TABLE IF NOT EXISTS prediction_ranks (
  rank_id UUID PRIMARY KEY,
  rank_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL UNIQUE,
  icon_key TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_prediction_ranks_min_points CHECK (min_points >= 0),
  CONSTRAINT chk_prediction_ranks_color_hex CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);
