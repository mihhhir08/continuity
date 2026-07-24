-- Run platform/schema.sql first, then run this file in the Supabase SQL editor.
-- This adds Supabase Auth ownership and least-privilege Data API access.

CREATE OR REPLACE FUNCTION public.is_org_member(target_organization text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id::text = target_organization
      AND user_id = auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(target_organization text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id::text = target_organization
      AND user_id = auth.uid()::text
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_org_write(target_organization text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id::text = target_organization
      AND user_id = auth.uid()::text
      AND role IN ('owner', 'admin', 'member')
  );
$$;

CREATE OR REPLACE FUNCTION public.create_organization(org_name text, org_slug text)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created public.organizations;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF length(trim(org_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'invalid organization name';
  END IF;
  IF org_slug !~ '^[a-z0-9][a-z0-9-]{2,47}$' THEN
    RAISE EXCEPTION 'invalid organization slug';
  END IF;

  INSERT INTO public.organizations(name, slug)
  VALUES (trim(org_name), org_slug)
  RETURNING * INTO created;

  INSERT INTO public.organization_members(organization_id, user_id, role)
  VALUES (created.id, auth.uid()::text, 'owner');

  RETURN created;
END;
$$;

CREATE OR REPLACE FUNCTION public.queue_simulation(target_project uuid, target_change uuid)
RETURNS public.records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_record public.records;
  change_record public.records;
  created public.records;
BEGIN
  SELECT * INTO project_record FROM public.records
  WHERE id = target_project AND kind = 'projects';
  SELECT * INTO change_record FROM public.records
  WHERE id = target_change AND kind = 'change-sets';

  IF project_record.id IS NULL OR change_record.id IS NULL
    OR project_record.organization_id <> change_record.organization_id
    OR NOT public.can_org_write(project_record.organization_id) THEN
    RAISE EXCEPTION 'project or change is unavailable';
  END IF;
  IF NOT public.within_plan_limit(project_record.organization_id, 'simulations') THEN
    RAISE EXCEPTION 'monthly simulation limit reached';
  END IF;

  INSERT INTO public.records(organization_id, kind, state, body)
  VALUES (
    project_record.organization_id,
    'simulations',
    'queued',
    jsonb_build_object(
      'project_id', target_project,
      'change_id', target_change,
      'change', change_record.body
    )
  )
  RETURNING * INTO created;

  INSERT INTO public.durable_jobs(organization_id, project_id, record_id, kind, state, input)
  VALUES (
    project_record.organization_id,
    target_project,
    created.id,
    'simulations',
    'queued',
    created.body
  );

  INSERT INTO public.usage_events(organization_id, metric, quantity, record_id)
  VALUES (project_record.organization_id, 'simulations.queued', 1, created.id);

  RETURN created;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_migration(target_simulation uuid)
RETURNS public.records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  simulation_record public.records;
  created public.records;
BEGIN
  SELECT * INTO simulation_record FROM public.records
  WHERE id = target_simulation AND kind = 'simulations';

  IF simulation_record.id IS NULL
    OR simulation_record.state NOT IN ('completed', 'awaiting_approval')
    OR NOT public.is_org_admin(simulation_record.organization_id) THEN
    RAISE EXCEPTION 'simulation is unavailable or approval is not permitted';
  END IF;
  IF NOT public.within_plan_limit(simulation_record.organization_id, 'migrations') THEN
    RAISE EXCEPTION 'monthly verified-repair limit reached';
  END IF;

  INSERT INTO public.records(organization_id, kind, state, body)
  VALUES (
    simulation_record.organization_id,
    'migrations',
    'queued',
    simulation_record.body || jsonb_build_object(
      'simulation_id', simulation_record.id,
      'authorized', true,
      'dry_run_reviewed', true
    )
  )
  RETURNING * INTO created;

  INSERT INTO public.durable_jobs(organization_id, project_id, record_id, kind, state, input)
  VALUES (
    simulation_record.organization_id,
    (simulation_record.body->>'project_id')::uuid,
    created.id,
    'migrations',
    'queued',
    created.body
  );

  INSERT INTO public.usage_events(organization_id, metric, quantity, record_id)
  VALUES (simulation_record.organization_id, 'migrations.approved', 1, created.id);

  RETURN created;
END;
$$;

DROP POLICY IF EXISTS organizations_select ON public.organizations;
CREATE POLICY organizations_select ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id::text));

DROP POLICY IF EXISTS memberships_select ON public.organization_members;
CREATE POLICY memberships_select ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR public.is_org_member(organization_id::text));

DROP POLICY IF EXISTS records_select ON public.records;
CREATE POLICY records_select ON public.records
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
DROP POLICY IF EXISTS records_insert ON public.records;
CREATE POLICY records_insert ON public.records
  FOR INSERT TO authenticated
  WITH CHECK (
    public.can_org_write(organization_id)
    AND public.within_plan_limit(organization_id, kind)
    AND (
      kind IN ('projects', 'change-sets')
      OR (kind = 'policies' AND public.is_org_admin(organization_id))
      OR (kind = 'capsules' AND state = 'draft' AND public.is_org_admin(organization_id))
    )
  );
DROP POLICY IF EXISTS records_update ON public.records;
CREATE POLICY records_update ON public.records
  FOR UPDATE TO authenticated
  USING (
    public.can_org_write(organization_id)
    AND (
      kind IN ('projects', 'change-sets')
      OR (kind IN ('policies', 'capsules') AND public.is_org_admin(organization_id))
    )
  )
  WITH CHECK (
    public.can_org_write(organization_id)
    AND (
      kind IN ('projects', 'change-sets')
      OR (kind = 'policies' AND public.is_org_admin(organization_id))
      OR (kind = 'capsules' AND state = 'draft' AND public.is_org_admin(organization_id))
    )
  );

DROP POLICY IF EXISTS api_keys_select ON public.api_keys;
CREATE POLICY api_keys_select ON public.api_keys
  FOR SELECT TO authenticated
  USING (public.is_org_admin(organization_id::text));
DROP POLICY IF EXISTS api_keys_insert ON public.api_keys;
CREATE POLICY api_keys_insert ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(organization_id::text));
DROP POLICY IF EXISTS api_keys_update ON public.api_keys;
CREATE POLICY api_keys_update ON public.api_keys
  FOR UPDATE TO authenticated
  USING (public.is_org_admin(organization_id::text))
  WITH CHECK (public.is_org_admin(organization_id::text));

DROP POLICY IF EXISTS usage_select ON public.usage_events;
CREATE POLICY usage_select ON public.usage_events
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.organizations, public.organization_members, public.usage_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.records, public.api_keys TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.queue_simulation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_migration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(text), public.is_org_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_org_write(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.within_plan_limit(text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.create_organization(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.queue_simulation(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_migration(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_member(text), public.is_org_admin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_org_write(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.within_plan_limit(text, text) FROM PUBLIC;
