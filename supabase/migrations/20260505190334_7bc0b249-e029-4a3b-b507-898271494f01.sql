
-- Properties
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text,
  property_address text,
  mailing_address text,
  parcel_id text,
  latitude numeric,
  longitude numeric,
  estimated_roof_age integer,
  home_value numeric,
  data_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Storm events
CREATE TABLE public.storm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date date,
  area_name text,
  hail_size numeric,
  wind_speed numeric,
  confidence_score integer,
  storm_polygon jsonb,
  data_provider text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES public.storm_events(id) ON DELETE SET NULL,
  storm_score integer,
  lead_status text NOT NULL DEFAULT 'New',
  assigned_rep text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contact methods
CREATE TABLE public.contact_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  phone text,
  email text,
  sms_consent boolean NOT NULL DEFAULT false,
  email_consent boolean NOT NULL DEFAULT false,
  consent_source text,
  opt_in_date timestamptz,
  opt_out_date timestamptz,
  dnc_status boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  channel text,
  message text,
  sent_count integer NOT NULL DEFAULT 0,
  opt_out_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Job zones
CREATE TABLE public.job_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_address text,
  radius_miles numeric,
  polygon_geojson jsonb,
  active_status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_property ON public.leads(property_id);
CREATE INDEX idx_leads_storm ON public.leads(storm_event_id);
CREATE INDEX idx_leads_status ON public.leads(lead_status);
CREATE INDEX idx_contact_lead ON public.contact_methods(lead_id);
CREATE INDEX idx_properties_parcel ON public.properties(parcel_id);
CREATE INDEX idx_storm_date ON public.storm_events(event_date);

-- Enable RLS on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_zones ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can fully manage (single-team contractor app).
-- Tighten with org/role scoping once authentication and roles are added.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['properties','storm_events','leads','contact_methods','campaigns','job_zones'])
  LOOP
    EXECUTE format('CREATE POLICY "Authenticated can select %I" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);
    EXECUTE format('CREATE POLICY "Authenticated can insert %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (true);', t, t);
    EXECUTE format('CREATE POLICY "Authenticated can update %I" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);', t, t);
    EXECUTE format('CREATE POLICY "Authenticated can delete %I" ON public.%I FOR DELETE TO authenticated USING (true);', t, t);
  END LOOP;
END $$;
