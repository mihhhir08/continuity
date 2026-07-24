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
  WITH CHECK (public.is_org_member(organization_id));
DROP POLICY IF EXISTS records_update ON public.records;
CREATE POLICY records_update ON public.records
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

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
GRANT EXECUTE ON FUNCTION public.is_org_member(text), public.is_org_admin(text) TO authenticated;

REVOKE ALL ON FUNCTION public.create_organization(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_member(text), public.is_org_admin(text) FROM PUBLIC;
