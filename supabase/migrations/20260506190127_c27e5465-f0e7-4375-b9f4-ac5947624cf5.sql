ALTER TABLE public.storm_events
  ADD COLUMN IF NOT EXISTS storm_type text,
  ADD COLUMN IF NOT EXISTS storm_intensity numeric,
  ADD COLUMN IF NOT EXISTS storm_path_geojson jsonb,
  ADD COLUMN IF NOT EXISTS overlay_color text,
  ADD COLUMN IF NOT EXISTS overlay_opacity numeric DEFAULT 0.35;

CREATE TABLE IF NOT EXISTS public.storm_overlay_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storm_event_id uuid REFERENCES public.storm_events(id) ON DELETE CASCADE,
  layer_name text,
  layer_type text,
  min_intensity numeric,
  max_intensity numeric,
  color text,
  opacity numeric DEFAULT 0.35,
  geojson jsonb,
  visible_default boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storm_overlay_layers_storm ON public.storm_overlay_layers(storm_event_id);

ALTER TABLE public.storm_overlay_layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select storm_overlay_layers"
  ON public.storm_overlay_layers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert storm_overlay_layers"
  ON public.storm_overlay_layers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update storm_overlay_layers"
  ON public.storm_overlay_layers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete storm_overlay_layers"
  ON public.storm_overlay_layers FOR DELETE TO authenticated USING (true);
