CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','max','scale','enterprise')),
  subscription_status text NOT NULL DEFAULT 'inactive',
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  subscription_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_stripe_customer ON organizations (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_stripe_subscription ON organizations (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS plan_limits (
  plan text PRIMARY KEY,
  max_projects integer,
  monthly_simulations integer,
  monthly_migrations integer,
  evidence_retention_days integer NOT NULL
);
INSERT INTO plan_limits(plan, max_projects, monthly_simulations, monthly_migrations, evidence_retention_days)
VALUES
  ('free', 2, 10, 3, 30),
  ('pro', 10, 100, 30, 90),
  ('max', 50, 1000, 300, 365),
  ('scale', 500, 10000, 3000, 730),
  ('enterprise', NULL, NULL, NULL, 2555)
ON CONFLICT (plan) DO NOTHING;

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS organization_members_user ON organization_members (user_id);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  prefix text NOT NULL,
  key_hash char(64) NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['agent']::text[],
  project_id uuid,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes text[] NOT NULL DEFAULT ARRAY['agent']::text[];
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS project_id uuid;
CREATE INDEX IF NOT EXISTS api_keys_active_hash ON api_keys (key_hash) WHERE revoked_at IS NULL;

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

CREATE OR REPLACE FUNCTION within_plan_limit(target_organization text, target_kind text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan text;
  allowed integer;
  used integer;
BEGIN
  SELECT plan INTO current_plan FROM organizations WHERE id::text = target_organization;
  IF current_plan IS NULL THEN RETURN false; END IF;
  IF target_kind = 'projects' THEN
    SELECT max_projects INTO allowed FROM plan_limits WHERE plan = current_plan;
    SELECT count(*) INTO used FROM records WHERE organization_id = target_organization AND kind = target_kind;
  ELSIF target_kind IN ('simulations', 'migrations') THEN
    SELECT CASE WHEN target_kind = 'simulations' THEN monthly_simulations ELSE monthly_migrations END
    INTO allowed FROM plan_limits WHERE plan = current_plan;
    SELECT count(*) INTO used FROM records
      WHERE organization_id = target_organization
        AND kind = target_kind
        AND created_at >= date_trunc('month', now());
  ELSE
    RETURN true;
  END IF;
  RETURN allowed IS NULL OR used < allowed;
END;
$$;

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
  project_id uuid REFERENCES records(id) ON DELETE CASCADE,
  record_id uuid REFERENCES records(id) ON DELETE CASCADE,
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
ALTER TABLE durable_jobs ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES records(id) ON DELETE CASCADE;
ALTER TABLE durable_jobs ADD COLUMN IF NOT EXISTS record_id uuid REFERENCES records(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS durable_jobs_poll ON durable_jobs (state, available_at) WHERE state = 'queued';
CREATE INDEX IF NOT EXISTS durable_jobs_project_poll ON durable_jobs (organization_id, project_id, state, available_at);

CREATE TABLE IF NOT EXISTS billing_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE durable_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
