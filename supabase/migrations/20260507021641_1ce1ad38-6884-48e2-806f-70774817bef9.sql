-- Extend auto_campaign_rules with market scope metadata
ALTER TABLE public.auto_campaign_rules
  ADD COLUMN IF NOT EXISTS market_scope_type text,
  ADD COLUMN IF NOT EXISTS market_scope_value text;

-- Extend triggered_campaigns with all fields needed for the approval queue / trigger log
ALTER TABLE public.triggered_campaigns
  ADD COLUMN IF NOT EXISTS rule_id uuid,
  ADD COLUMN IF NOT EXISTS rule_name text,
  ADD COLUMN IF NOT EXISTS market_name text,
  ADD COLUMN IF NOT EXISTS trigger_type text,
  ADD COLUMN IF NOT EXISTS trigger_reading text,
  ADD COLUMN IF NOT EXISTS channels text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sms_eligible integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sms_blocked_no_consent integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sms_blocked_dnc integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rerouted_to_mail integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rerouted_to_door_knock integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- Track email opt-out separately so we can gate email sends
ALTER TABLE public.contact_methods
  ADD COLUMN IF NOT EXISTS email_unsubscribed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_triggered_campaigns_owner_status ON public.triggered_campaigns(owner_id, campaign_status);
CREATE INDEX IF NOT EXISTS idx_triggered_campaigns_created_at ON public.triggered_campaigns(created_at DESC);
