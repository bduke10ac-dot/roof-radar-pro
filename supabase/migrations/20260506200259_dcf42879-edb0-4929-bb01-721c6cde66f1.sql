
-- Helper: drop overly permissive write policies and keep SELECT open for reference data
DO $$ BEGIN END $$;

-- storm_events
DROP POLICY IF EXISTS "Authenticated can insert storm_events" ON public.storm_events;
DROP POLICY IF EXISTS "Authenticated can update storm_events" ON public.storm_events;
DROP POLICY IF EXISTS "Authenticated can delete storm_events" ON public.storm_events;

-- live_weather_events
DROP POLICY IF EXISTS "Authenticated can insert live_weather_events" ON public.live_weather_events;
DROP POLICY IF EXISTS "Authenticated can update live_weather_events" ON public.live_weather_events;
DROP POLICY IF EXISTS "Authenticated can delete live_weather_events" ON public.live_weather_events;

-- storm_overlay_layers
DROP POLICY IF EXISTS "Authenticated can insert storm_overlay_layers" ON public.storm_overlay_layers;
DROP POLICY IF EXISTS "Authenticated can update storm_overlay_layers" ON public.storm_overlay_layers;
DROP POLICY IF EXISTS "Authenticated can delete storm_overlay_layers" ON public.storm_overlay_layers;

-- weather_trigger_events
DROP POLICY IF EXISTS "Authenticated can insert weather_trigger_events" ON public.weather_trigger_events;
DROP POLICY IF EXISTS "Authenticated can update weather_trigger_events" ON public.weather_trigger_events;
DROP POLICY IF EXISTS "Authenticated can delete weather_trigger_events" ON public.weather_trigger_events;

-- campaign_targets
DROP POLICY IF EXISTS "Authenticated can insert campaign_targets" ON public.campaign_targets;
DROP POLICY IF EXISTS "Authenticated can update campaign_targets" ON public.campaign_targets;
DROP POLICY IF EXISTS "Authenticated can delete campaign_targets" ON public.campaign_targets;

-- job_zones
DROP POLICY IF EXISTS "Authenticated can insert job_zones" ON public.job_zones;
DROP POLICY IF EXISTS "Authenticated can update job_zones" ON public.job_zones;
DROP POLICY IF EXISTS "Authenticated can delete job_zones" ON public.job_zones;
