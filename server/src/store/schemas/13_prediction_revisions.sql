CREATE TABLE prediction_revisions (
  revision_id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES predictions(prediction_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  match_id UUID NOT NULL REFERENCES matches(match_id),
  outcome_pick TEXT NOT NULL,
  btts_pick BOOLEAN NOT NULL,
  scorer_player_id UUID NOT NULL REFERENCES players(player_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_prediction_revisions_outcome CHECK (outcome_pick IN ('home', 'draw', 'away'))
);

CREATE INDEX idx_prediction_revisions_prediction
ON prediction_revisions (prediction_id, revision_id DESC);
