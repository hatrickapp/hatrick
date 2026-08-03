CREATE TABLE predictions (
  prediction_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  match_id UUID NOT NULL REFERENCES matches(match_id),
  outcome_pick TEXT NOT NULL,
  btts_pick BOOLEAN NOT NULL,
  scorer_player_id UUID NOT NULL REFERENCES players(player_id),
  status TEXT NOT NULL DEFAULT 'open',
  outcome_correct BOOLEAN,
  btts_correct BOOLEAN,
  scorer_correct BOOLEAN,
  hatrick_bonus_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,

  CONSTRAINT chk_predictions_outcome CHECK (outcome_pick IN ('home', 'draw', 'away')),
  CONSTRAINT chk_predictions_status CHECK (status IN ('open', 'locked', 'settled', 'void')),
  CONSTRAINT chk_predictions_points CHECK (points BETWEEN 0 AND 60)
);

CREATE UNIQUE INDEX idx_predictions_user_match
ON predictions (user_id, match_id);

CREATE INDEX idx_predictions_user_created
ON predictions (user_id, prediction_id DESC);

CREATE INDEX idx_predictions_match_status
ON predictions (match_id, status);

CREATE INDEX idx_predictions_settled_user_match
ON predictions (user_id, match_id)
WHERE status = 'settled';
