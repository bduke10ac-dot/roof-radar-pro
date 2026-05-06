CREATE TABLE public.user_map_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  default_map_type text DEFAULT 'roadmap',
  satellite_enabled boolean DEFAULT false,
  hybrid_enabled boolean DEFAULT false,
  terrain_enabled boolean DEFAULT false,
  three_d_enabled boolean DEFAULT false,
  street_view_enabled boolean DEFAULT false,
  parcel_layer_enabled boolean DEFAULT true,
  hail_layer_enabled boolean DEFAULT true,
  wind_layer_enabled boolean DEFAULT true,
  rain_layer_enabled boolean DEFAULT false,
  tornado_layer_enabled boolean DEFAULT false,
  lightning_layer_enabled boolean DEFAULT false,
  lead_heatmap_enabled boolean DEFAULT true,
  roof_age_heatmap_enabled boolean DEFAULT false,
  claim_opportunity_enabled boolean DEFAULT true,
  job_zone_enabled boolean DEFAULT true,
  route_layer_enabled boolean DEFAULT false,
  saved_market_boundaries_enabled boolean DEFAULT true,
  measurement_tools_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_map_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own map prefs" ON public.user_map_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own map prefs" ON public.user_map_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own map prefs" ON public.user_map_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own map prefs" ON public.user_map_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_map_preferences_user_id_key ON public.user_map_preferences(user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_map_preferences_updated_at
  BEFORE UPDATE ON public.user_map_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();