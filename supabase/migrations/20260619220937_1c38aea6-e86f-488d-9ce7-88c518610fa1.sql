
-- campaign_targets write policies (owner via campaign or market)
CREATE POLICY "Owners insert campaign targets" ON public.campaign_targets
FOR INSERT TO authenticated WITH CHECK (
  (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_targets.campaign_id AND c.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = campaign_targets.market_id AND m.owner_id = auth.uid()))
);
CREATE POLICY "Owners update campaign targets" ON public.campaign_targets
FOR UPDATE TO authenticated USING (
  (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_targets.campaign_id AND c.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = campaign_targets.market_id AND m.owner_id = auth.uid()))
) WITH CHECK (
  (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_targets.campaign_id AND c.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = campaign_targets.market_id AND m.owner_id = auth.uid()))
);
CREATE POLICY "Owners delete campaign targets" ON public.campaign_targets
FOR DELETE TO authenticated USING (
  (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_targets.campaign_id AND c.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = campaign_targets.market_id AND m.owner_id = auth.uid()))
);

-- weather_trigger_events write policies (owner via rule or market)
CREATE POLICY "Owners insert weather trigger events" ON public.weather_trigger_events
FOR INSERT TO authenticated WITH CHECK (
  (EXISTS (SELECT 1 FROM public.auto_campaign_rules r WHERE r.id = weather_trigger_events.rule_id AND r.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = weather_trigger_events.market_id AND m.owner_id = auth.uid()))
);
CREATE POLICY "Owners update weather trigger events" ON public.weather_trigger_events
FOR UPDATE TO authenticated USING (
  (EXISTS (SELECT 1 FROM public.auto_campaign_rules r WHERE r.id = weather_trigger_events.rule_id AND r.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = weather_trigger_events.market_id AND m.owner_id = auth.uid()))
) WITH CHECK (
  (EXISTS (SELECT 1 FROM public.auto_campaign_rules r WHERE r.id = weather_trigger_events.rule_id AND r.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = weather_trigger_events.market_id AND m.owner_id = auth.uid()))
);
CREATE POLICY "Owners delete weather trigger events" ON public.weather_trigger_events
FOR DELETE TO authenticated USING (
  (EXISTS (SELECT 1 FROM public.auto_campaign_rules r WHERE r.id = weather_trigger_events.rule_id AND r.owner_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.markets m WHERE m.id = weather_trigger_events.market_id AND m.owner_id = auth.uid()))
);

-- user_roles: remove client-side admin write access (privilege escalation). Service role (backend) bypasses RLS.
DROP POLICY IF EXISTS "Admins manage roles insert" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles update" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles delete" ON public.user_roles;

-- Revoke anon EXECUTE on SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;

-- Remove broad public listing on avatars bucket (public URLs still serve images)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
