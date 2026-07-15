-- GLITCH database schema.
-- Run this once against your Postgres instance before starting the server
-- (see README.md for how to run it on Render).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR UNIQUE NOT NULL,
  password_hash  VARCHAR NOT NULL,
  display_name   VARCHAR NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gems        INTEGER NOT NULL DEFAULT 0 CHECK (gems >= 0),
  coins       INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposit_transactions (
  id               VARCHAR PRIMARY KEY,          -- also used as the Paystack `reference`
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id          VARCHAR NOT NULL,
  gems_amount      INTEGER NOT NULL,
  fiat_amount      DECIMAL(10, 2) NOT NULL,
  currency         VARCHAR(3) NOT NULL,
  provider         VARCHAR NOT NULL,              -- 'mobilemoney' | 'card'
  provider_ref     VARCHAR,
  status           VARCHAR NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  idempotency_key  VARCHAR UNIQUE NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shop_purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id          VARCHAR NOT NULL,
  gems_spent       INTEGER NOT NULL,
  idempotency_key  VARCHAR UNIQUE NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gift_transfers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       VARCHAR NOT NULL,
  from_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposits_user   ON deposit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user  ON shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_to_user   ON gift_transfers(to_user_id);
