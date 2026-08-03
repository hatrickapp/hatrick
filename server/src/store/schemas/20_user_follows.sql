CREATE TABLE user_follows (
  follow_id UUID PRIMARY KEY,
  follower_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_user_follows_not_self CHECK (follower_user_id <> followed_user_id),
  CONSTRAINT uq_user_follows_pair UNIQUE (follower_user_id, followed_user_id)
);

CREATE INDEX idx_user_follows_followed_created
ON user_follows (followed_user_id, created_at DESC, follow_id DESC);

CREATE INDEX idx_user_follows_follower_created
ON user_follows (follower_user_id, created_at DESC, follow_id DESC);

