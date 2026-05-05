-- markets
CREATE TABLE public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_name text NOT NULL,
  state text,
  region text,
  counties text[],
  cities text[],
  zip_codes text[],
  market_type text,
  opportunity_score integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select markets" ON public.markets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert markets" ON public.markets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update markets" ON public.markets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete markets" ON public.markets FOR DELETE TO authenticated USING (true);

-- market_storm_scores
CREATE TABLE public.market_storm_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES public.markets(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES public.storm_events(id) ON DELETE SET NULL,
  hail_size numeric,
  wind_speed numeric,
  affected_home_count integer,
  average_roof_age integer,
  average_home_value numeric,
  claim_likelihood_score integer,
  competition_score integer,
  distance_from_office numeric,
  total_opportunity_score integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.market_storm_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select market_storm_scores" ON public.market_storm_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert market_storm_scores" ON public.market_storm_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update market_storm_scores" ON public.market_storm_scores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete market_storm_scores" ON public.market_storm_scores FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_mss_market ON public.market_storm_scores(market_id);
CREATE INDEX idx_mss_storm ON public.market_storm_scores(storm_event_id);

-- campaign_targets
CREATE TABLE public.campaign_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  target_type text,
  state text,
  region text,
  county text,
  city text,
  zip_code text,
  geofence_geojson jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select campaign_targets" ON public.campaign_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert campaign_targets" ON public.campaign_targets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update campaign_targets" ON public.campaign_targets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete campaign_targets" ON public.campaign_targets FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_ct_campaign ON public.campaign_targets(campaign_id);
CREATE INDEX idx_ct_market ON public.campaign_targets(market_id);