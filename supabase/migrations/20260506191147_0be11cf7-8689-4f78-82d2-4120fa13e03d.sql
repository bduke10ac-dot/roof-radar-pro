CREATE TABLE public.live_weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES public.markets(id) ON DELETE CASCADE,
  event_type text,
  current_temperature numeric,
  feels_like numeric,
  wind_speed numeric,
  wind_gust numeric,
  wind_direction text,
  humidity numeric,
  dew_point numeric,
  pressure numeric,
  rain_chance numeric,
  hail_risk numeric,
  lightning_active boolean DEFAULT false,
  severe_alert_type text,
  storm_arrival_time timestamp with time zone,
  recommended_action text,
  weather_geojson jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_weather_events_market_id ON public.live_weather_events(market_id);
CREATE INDEX idx_live_weather_events_created_at ON public.live_weather_events(created_at DESC);

ALTER TABLE public.live_weather_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select live_weather_events"
  ON public.live_weather_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert live_weather_events"
  ON public.live_weather_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update live_weather_events"
  ON public.live_weather_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete live_weather_events"
  ON public.live_weather_events FOR DELETE TO authenticated USING (true);