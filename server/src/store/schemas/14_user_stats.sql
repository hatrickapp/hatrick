CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(user_id),
  total_points INTEGER NOT NULL DEFAULT 0,
  predictions_count INTEGER NOT NULL DEFAULT 0,
  settled_predictions INTEGER NOT NULL DEFAULT 0,
  correct_outcomes INTEGER NOT NULL DEFAULT 0,
  correct_btts INTEGER NOT NULL DEFAULT 0,
  correct_scorers INTEGER NOT NULL DEFAULT 0,
  hatricks INTEGER NOT NULL DEFAULT 0,
  best_global_rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_user_stats_best_global_rank CHECK (best_global_rank IS NULL OR best_global_rank >= 1)
);
