
-- 1) usage_tracking: revoke client write policies; SELECT remains
DROP POLICY IF EXISTS "Users insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users update own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users delete own usage" ON public.usage_tracking;

CREATE POLICY "Service role manages usage tracking"
ON public.usage_tracking
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2) weather_trigger_events: scope SELECT to rule owner (or market owner)
DROP POLICY IF EXISTS "Authenticated can select weather_trigger_events" ON public.weather_trigger_events;

CREATE POLICY "Owners view weather trigger events"
ON public.weather_trigger_events
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.auto_campaign_rules r
          WHERE r.id = weather_trigger_events.rule_id AND r.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.markets m
             WHERE m.id = weather_trigger_events.market_id AND m.owner_id = auth.uid())
);

-- 3) campaign_targets: scope SELECT to campaign or market owner
DROP POLICY IF EXISTS "Authenticated can select campaign_targets" ON public.campaign_targets;

CREATE POLICY "Owners view campaign targets"
ON public.campaign_targets
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.campaigns c
          WHERE c.id = campaign_targets.campaign_id AND c.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.markets m
             WHERE m.id = campaign_targets.market_id AND m.owner_id = auth.uid())
);

-- 4) Revoke execute on subscription helper from client roles (server-side use only)
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;
