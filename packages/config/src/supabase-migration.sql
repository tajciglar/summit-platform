-- ============================================================
-- Summit Platform — Supabase Initial Migration
-- Run this SQL in your Supabase project's SQL editor or via
-- the Supabase CLI: supabase db push
-- ============================================================

-- ─── Orders ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number            TEXT UNIQUE NOT NULL,
  summit_slug             TEXT NOT NULL,
  customer_name           TEXT NOT NULL,
  customer_email          TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_intent_id TEXT,
  stripe_session_id        TEXT,
  amount_total            INTEGER NOT NULL,  -- in cents
  currency                TEXT NOT NULL DEFAULT 'eur',
  bump_accepted           BOOLEAN DEFAULT false,
  upsell_accepted         BOOLEAN DEFAULT false,
  utm_source              TEXT,
  utm_medium              TEXT,
  utm_campaign            TEXT,
  utm_content             TEXT,
  utm_term                TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_summit_slug_idx ON orders (summit_slug);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- ─── Order Items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_slug  TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  price         INTEGER NOT NULL,  -- in cents
  quantity      INTEGER NOT NULL DEFAULT 1,
  type          TEXT NOT NULL
                  CHECK (type IN ('one_time', 'subscription', 'bump', 'upsell', 'downsell'))
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

-- ─── Funnel Events ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS funnel_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summit_slug    TEXT NOT NULL,
  funnel_slug    TEXT NOT NULL,
  step_slug      TEXT NOT NULL,
  step_type      TEXT NOT NULL,
  event_type     TEXT NOT NULL
                   CHECK (event_type IN (
                     'view', 'optin', 'purchase',
                     'bump_accept', 'upsell_accept', 'upsell_decline',
                     'downsell_accept', 'downsell_decline'
                   )),
  session_id     TEXT,
  customer_email TEXT,
  order_id       UUID REFERENCES orders (id) ON DELETE SET NULL,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  utm_content    TEXT,
  utm_term       TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS funnel_events_summit_slug_idx ON funnel_events (summit_slug);
CREATE INDEX IF NOT EXISTS funnel_events_funnel_slug_idx ON funnel_events (funnel_slug);
CREATE INDEX IF NOT EXISTS funnel_events_event_type_idx ON funnel_events (event_type);
CREATE INDEX IF NOT EXISTS funnel_events_session_id_idx ON funnel_events (session_id);
CREATE INDEX IF NOT EXISTS funnel_events_created_at_idx ON funnel_events (created_at DESC);

-- ─── Email Log ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID REFERENCES orders (id) ON DELETE SET NULL,
  customer_email     TEXT NOT NULL,
  template_name      TEXT NOT NULL,
  brevo_message_id   TEXT,
  status             TEXT NOT NULL DEFAULT 'sent'
                       CHECK (status IN ('sent', 'delivered', 'opened', 'bounced', 'failed')),
  sent_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_log_order_id_idx ON email_log (order_id);
CREATE INDEX IF NOT EXISTS email_log_customer_email_idx ON email_log (customer_email);

-- ─── Processed Webhook Events (idempotency) ───────────────────────────────

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  stripe_event_id  TEXT PRIMARY KEY,
  processed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────────────
-- All tables are private by default. Only the service role key
-- (used server-side) can read/write. Never expose service_role to clients.

ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role bypass (automatically applied — no policy needed).
-- anon / authenticated roles have NO access by default.
-- Add policies below if you ever need authenticated client access.

-- ─── Updated-at trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Order number generator ───────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                        LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
