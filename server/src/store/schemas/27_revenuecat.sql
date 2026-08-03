CREATE TABLE revenuecat_customers (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  app_user_id TEXT NOT NULL UNIQUE,
  entitlement_id TEXT NOT NULL DEFAULT 'plus',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  has_purchase_history BOOLEAN NOT NULL DEFAULT FALSE,
  active_store TEXT,
  active_product_id TEXT,
  active_original_transaction_id TEXT,
  active_transaction_id TEXT,
  environment TEXT,
  current_period_starts_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  unsubscribe_detected_at TIMESTAMPTZ,
  billing_issue_detected_at TIMESTAMPTZ,
  last_event_id TEXT,
  last_event_type TEXT,
  last_event_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_revenuecat_customers_app_user_id CHECK (char_length(app_user_id) BETWEEN 1 AND 1500),
  CONSTRAINT chk_revenuecat_customers_entitlement CHECK (char_length(entitlement_id) BETWEEN 1 AND 255),
  CONSTRAINT chk_revenuecat_customers_store CHECK (active_store IS NULL OR active_store IN ('APP_STORE', 'PLAY_STORE')),
  CONSTRAINT chk_revenuecat_customers_environment CHECK (environment IS NULL OR environment IN ('SANDBOX', 'PRODUCTION'))
);

CREATE TABLE revenuecat_subscriptions (
  subscription_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  app_user_id TEXT NOT NULL,
  store TEXT NOT NULL,
  environment TEXT NOT NULL,
  product_id TEXT NOT NULL,
  original_transaction_id TEXT NOT NULL,
  latest_transaction_id TEXT,
  status TEXT NOT NULL,
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  unsubscribe_detected_at TIMESTAMPTZ,
  billing_issue_detected_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  expiration_reason TEXT,
  last_event_id TEXT,
  last_event_type TEXT,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_revenuecat_subscriptions_app_user_id CHECK (char_length(app_user_id) BETWEEN 1 AND 1500),
  CONSTRAINT chk_revenuecat_subscriptions_store CHECK (store IN ('APP_STORE', 'PLAY_STORE')),
  CONSTRAINT chk_revenuecat_subscriptions_environment CHECK (environment IN ('SANDBOX', 'PRODUCTION')),
  CONSTRAINT chk_revenuecat_subscriptions_status CHECK (status IN ('active', 'canceled', 'expired', 'billing_issue', 'paused', 'transferred', 'unknown')),
  CONSTRAINT chk_revenuecat_subscriptions_product_id CHECK (char_length(product_id) BETWEEN 1 AND 512),
  CONSTRAINT chk_revenuecat_subscriptions_original_tx CHECK (char_length(original_transaction_id) BETWEEN 1 AND 512)
);

CREATE UNIQUE INDEX idx_revenuecat_subscriptions_store_original_tx
ON revenuecat_subscriptions (store, original_transaction_id);

CREATE INDEX idx_revenuecat_subscriptions_user
ON revenuecat_subscriptions (user_id, status, expires_at);

CREATE TABLE revenuecat_webhook_events (
  event_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  app_user_id TEXT,
  event_type TEXT NOT NULL,
  environment TEXT,
  store TEXT,
  product_id TEXT,
  entitlement_ids TEXT[],
  transaction_id TEXT,
  original_transaction_id TEXT,
  event_timestamp TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  expiration_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  expiration_reason TEXT,
  ignored_reason TEXT,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  CONSTRAINT chk_revenuecat_webhook_events_event_id CHECK (char_length(event_id) BETWEEN 1 AND 512),
  CONSTRAINT chk_revenuecat_webhook_events_type CHECK (char_length(event_type) BETWEEN 1 AND 128),
  CONSTRAINT chk_revenuecat_webhook_events_environment CHECK (environment IS NULL OR environment IN ('SANDBOX', 'PRODUCTION')),
  CONSTRAINT chk_revenuecat_webhook_events_store CHECK (
    store IS NULL
    OR store IN ('APP_STORE', 'PLAY_STORE', 'MAC_APP_STORE', 'AMAZON', 'STRIPE', 'PROMOTIONAL', 'RC_BILLING', 'ROKU', 'PADDLE', 'EXTERNAL', 'TEST_STORE', 'GALAXY', 'UNKNOWN_STORE')
  )
);

CREATE INDEX idx_revenuecat_webhook_events_user
ON revenuecat_webhook_events (user_id, received_at DESC);

CREATE INDEX idx_revenuecat_webhook_events_app_user
ON revenuecat_webhook_events (app_user_id, received_at DESC);
