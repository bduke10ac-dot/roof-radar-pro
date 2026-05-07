ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS import_id uuid;

CREATE TABLE IF NOT EXISTS public.lead_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  file_name text NOT NULL,
  source_tag text,
  total_rows integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  invalid_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  field_mapping jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view lead imports" ON public.lead_imports
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert lead imports" ON public.lead_imports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update lead imports" ON public.lead_imports
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete lead imports" ON public.lead_imports
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_leads_import_id ON public.leads (import_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);
