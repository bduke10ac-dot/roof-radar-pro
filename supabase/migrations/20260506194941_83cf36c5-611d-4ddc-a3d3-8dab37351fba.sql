
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text,
  monthly_price numeric,
  yearly_price numeric,
  max_markets integer,
  max_leads_per_month integer,
  max_emails_per_month integer,
  max_sms_per_month integer,
  automation_enabled boolean,
  sms_enabled boolean,
  api_access_enabled boolean,
  crm_integrations_enabled boolean,
  ai_scoring_enabled boolean,
  advanced_weather_enabled boolean,
  team_accounts_enabled boolean,
  white_label_enabled boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  billing_cycle text DEFAULT 'monthly',
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  leads_generated integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  sms_sent integer DEFAULT 0,
  markets_saved integer DEFAULT 0,
  api_calls integer DEFAULT 0,
  campaigns_triggered integer DEFAULT 0,
  tracking_month date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  team_user_id uuid NOT NULL,
  role text,
  territory text,
  permissions jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_accounts ENABLE ROW LEVEL SECURITY;

-- subscription_plans: readable by all authenticated
CREATE POLICY "Authenticated can view plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);

-- user_subscriptions: own rows
CREATE POLICY "Users view own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON public.user_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own subscription" ON public.user_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- usage_tracking: own rows
CREATE POLICY "Users view own usage" ON public.usage_tracking FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own usage" ON public.usage_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own usage" ON public.usage_tracking FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own usage" ON public.usage_tracking FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- team_accounts: owner or member can view; owner manages
CREATE POLICY "Owner or member view team" ON public.team_accounts FOR SELECT TO authenticated USING (auth.uid() = owner_user_id OR auth.uid() = team_user_id);
CREATE POLICY "Owner inserts team" ON public.team_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owner updates team" ON public.team_accounts FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owner deletes team" ON public.team_accounts FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_usage_tracking_user_month ON public.usage_tracking(user_id, tracking_month);
CREATE INDEX idx_team_accounts_owner ON public.team_accounts(owner_user_id);
CREATE INDEX idx_team_accounts_member ON public.team_accounts(team_user_id);

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
