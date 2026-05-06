
CREATE TABLE public.auto_campaign_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  market_id uuid REFERENCES public.markets(id),
  is_active boolean DEFAULT true,
  trigger_hail boolean DEFAULT false,
  trigger_wind_gust boolean DEFAULT false,
  trigger_sustained_wind boolean DEFAULT false,
  trigger_tornado boolean DEFAULT false,
  trigger_severe_weather boolean DEFAULT false,
  trigger_heavy_rain boolean DEFAULT false,
  trigger_lightning boolean DEFAULT false,
  hail_threshold numeric,
  wind_gust_threshold numeric,
  sustained_wind_threshold numeric,
  tornado_alert_type text,
  severe_alert_type text,
  rain_threshold numeric,
  send_timing text DEFAULT 'manual_approval',
  require_manual_approval boolean DEFAULT true,
  allow_email boolean DEFAULT true,
  allow_sms boolean DEFAULT false,
  allow_direct_mail_export boolean DEFAULT true,
  allow_door_knock_route boolean DEFAULT true,
  allow_crm_task boolean DEFAULT true,
  allow_rep_push_notification boolean DEFAULT true,
  message_template text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weather_trigger_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.auto_campaign_rules(id) ON DELETE CASCADE,
  market_id uuid REFERENCES public.markets(id),
  storm_event_id uuid REFERENCES public.storm_events(id),
  trigger_type text,
  trigger_value numeric,
  trigger_threshold numeric,
  alert_title text,
  alert_description text,
  weather_source text,
  storm_path_geojson jsonb,
  affected_property_count integer,
  eligible_email_count integer,
  eligible_sms_count integer,
  blocked_sms_count integer,
  direct_mail_count integer,
  trigger_status text DEFAULT 'pending_review',
  recommended_action text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.triggered_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weather_trigger_event_id uuid REFERENCES public.weather_trigger_events(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id),
  market_id uuid REFERENCES public.markets(id),
  channel text,
  campaign_status text DEFAULT 'draft',
  requires_approval boolean DEFAULT true,
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  eligible_contact_count integer,
  blocked_contact_count integer,
  message_body text,
  compliance_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_compliance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_campaign_id uuid REFERENCES public.triggered_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id),
  channel text,
  eligible boolean,
  blocked_reason text,
  consent_status boolean,
  dnc_status boolean,
  opt_out_status boolean,
  message_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_campaign_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_trigger_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggered_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_compliance_logs ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['auto_campaign_rules','weather_trigger_events','triggered_campaigns','campaign_compliance_logs'] LOOP
    EXECUTE format('CREATE POLICY "Authenticated can select %1$s" ON public.%1$s FOR SELECT TO authenticated USING (true);', t);
    EXECUTE format('CREATE POLICY "Authenticated can insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "Authenticated can update %1$s" ON public.%1$s FOR UPDATE TO authenticated USING (true) WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "Authenticated can delete %1$s" ON public.%1$s FOR DELETE TO authenticated USING (true);', t);
  END LOOP;
END $$;

CREATE TRIGGER update_auto_campaign_rules_updated_at
BEFORE UPDATE ON public.auto_campaign_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_weather_trigger_events_rule ON public.weather_trigger_events(rule_id);
CREATE INDEX idx_weather_trigger_events_market ON public.weather_trigger_events(market_id);
CREATE INDEX idx_triggered_campaigns_event ON public.triggered_campaigns(weather_trigger_event_id);
CREATE INDEX idx_compliance_logs_campaign ON public.campaign_compliance_logs(triggered_campaign_id);
