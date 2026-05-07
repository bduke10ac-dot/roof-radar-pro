
-- 1. user_subscriptions: lock writes to service role
DROP POLICY IF EXISTS "Users update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users delete own subscription" ON public.user_subscriptions;

CREATE POLICY "Service role manages user_subscriptions"
ON public.user_subscriptions
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. guest_leads: explicit service-role-only SELECT
CREATE POLICY "Service role reads guest leads"
ON public.guest_leads
FOR SELECT
TO public
USING (auth.role() = 'service_role');

-- 3. job_zones: add owner scoping
ALTER TABLE public.job_zones ADD COLUMN IF NOT EXISTS owner_id uuid;

DROP POLICY IF EXISTS "Authenticated can select job_zones" ON public.job_zones;

CREATE POLICY "Owners view job zones"
ON public.job_zones FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners insert job zones"
ON public.job_zones FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update job zones"
ON public.job_zones FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete job zones"
ON public.job_zones FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- 4. storage: remove broad listing SELECT on company-logos
DROP POLICY IF EXISTS "Company logos are publicly viewable" ON storage.objects;
-- bucket remains public:true so direct file URLs continue to work; listing is now blocked

-- 5. Revoke direct EXECUTE from anon/authenticated on definer helpers
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
-- has_role must remain callable by authenticated for RLS evaluation
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
