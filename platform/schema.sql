CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN (
    'projects','continuity-boms','change-sets','simulations','migrations',
    'capsules','attestations','events','policies'
  )),
  state text NOT NULL DEFAULT 'created',
  body jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_org_kind ON records (organization_id, kind, created_at DESC);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  organization_id text NOT NULL,
  key text NOT NULL,
  status integer NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, key)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id bigserial PRIMARY KEY,
  organization_id text NOT NULL,
  metric text NOT NULL,
  quantity bigint NOT NULL CHECK (quantity > 0),
  record_id uuid REFERENCES records(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS durable_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL,
  kind text NOT NULL,
  state text NOT NULL CHECK (state IN ('queued','running','awaiting_approval','verifying','verified','failed','partial','cancelled','rejected')),
  attempt integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  input jsonb NOT NULL,
  output jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS durable_jobs_poll ON durable_jobs (state, available_at) WHERE state = 'queued';

ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE durable_jobs ENABLE ROW LEVEL SECURITY;
