
-- =========================================================
-- Add ownership columns
-- =========================================================
ALTER TABLE public.markets               ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.properties            ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.leads                 ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.campaigns             ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.auto_campaign_rules   ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.triggered_campaigns   ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.market_storm_scores   ADD COLUMN IF NOT EXISTS owner_id uuid;

-- =========================================================
-- MARKETS
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can insert markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can update markets" ON public.markets;
DROP POLICY IF EXISTS "Authenticated can delete markets" ON public.markets;

CREATE POLICY "Owners view markets" ON public.markets
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert markets" ON public.markets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update markets" ON public.markets
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete markets" ON public.markets
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- PROPERTIES
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated can update properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated can delete properties" ON public.properties;

CREATE POLICY "Owners view properties" ON public.properties
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update properties" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete properties" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- LEADS
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can delete leads" ON public.leads;

CREATE POLICY "Owners view leads" ON public.leads
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update leads" ON public.leads
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete leads" ON public.leads
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- CAMPAIGNS
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated can delete campaigns" ON public.campaigns;

CREATE POLICY "Owners view campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert campaigns" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update campaigns" ON public.campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete campaigns" ON public.campaigns
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- AUTO_CAMPAIGN_RULES
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select auto_campaign_rules" ON public.auto_campaign_rules;
DROP POLICY IF EXISTS "Authenticated can insert auto_campaign_rules" ON public.auto_campaign_rules;
DROP POLICY IF EXISTS "Authenticated can update auto_campaign_rules" ON public.auto_campaign_rules;
DROP POLICY IF EXISTS "Authenticated can delete auto_campaign_rules" ON public.auto_campaign_rules;

CREATE POLICY "Owners view rules" ON public.auto_campaign_rules
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert rules" ON public.auto_campaign_rules
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update rules" ON public.auto_campaign_rules
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete rules" ON public.auto_campaign_rules
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- TRIGGERED_CAMPAIGNS
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select triggered_campaigns" ON public.triggered_campaigns;
DROP POLICY IF EXISTS "Authenticated can insert triggered_campaigns" ON public.triggered_campaigns;
DROP POLICY IF EXISTS "Authenticated can update triggered_campaigns" ON public.triggered_campaigns;
DROP POLICY IF EXISTS "Authenticated can delete triggered_campaigns" ON public.triggered_campaigns;

CREATE POLICY "Owners view triggered" ON public.triggered_campaigns
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert triggered" ON public.triggered_campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update triggered" ON public.triggered_campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete triggered" ON public.triggered_campaigns
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- MARKET_STORM_SCORES
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select market_storm_scores" ON public.market_storm_scores;
DROP POLICY IF EXISTS "Authenticated can insert market_storm_scores" ON public.market_storm_scores;
DROP POLICY IF EXISTS "Authenticated can update market_storm_scores" ON public.market_storm_scores;
DROP POLICY IF EXISTS "Authenticated can delete market_storm_scores" ON public.market_storm_scores;

CREATE POLICY "Owners view storm scores" ON public.market_storm_scores
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert storm scores" ON public.market_storm_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update storm scores" ON public.market_storm_scores
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete storm scores" ON public.market_storm_scores
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =========================================================
-- CONTACT_METHODS — scope via parent lead
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select contact_methods" ON public.contact_methods;
DROP POLICY IF EXISTS "Authenticated can insert contact_methods" ON public.contact_methods;
DROP POLICY IF EXISTS "Authenticated can update contact_methods" ON public.contact_methods;
DROP POLICY IF EXISTS "Authenticated can delete contact_methods" ON public.contact_methods;

CREATE POLICY "Lead owners view contacts" ON public.contact_methods
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = contact_methods.lead_id AND l.owner_id = auth.uid()));
CREATE POLICY "Lead owners insert contacts" ON public.contact_methods
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = contact_methods.lead_id AND l.owner_id = auth.uid()));
CREATE POLICY "Lead owners update contacts" ON public.contact_methods
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = contact_methods.lead_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = contact_methods.lead_id AND l.owner_id = auth.uid()));
CREATE POLICY "Lead owners delete contacts" ON public.contact_methods
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = contact_methods.lead_id AND l.owner_id = auth.uid()));

-- =========================================================
-- CAMPAIGN_COMPLIANCE_LOGS — scope via parent triggered_campaign
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can select campaign_compliance_logs" ON public.campaign_compliance_logs;
DROP POLICY IF EXISTS "Authenticated can insert campaign_compliance_logs" ON public.campaign_compliance_logs;
DROP POLICY IF EXISTS "Authenticated can update campaign_compliance_logs" ON public.campaign_compliance_logs;
DROP POLICY IF EXISTS "Authenticated can delete campaign_compliance_logs" ON public.campaign_compliance_logs;

CREATE POLICY "Owners view compliance logs" ON public.campaign_compliance_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.triggered_campaigns t WHERE t.id = campaign_compliance_logs.triggered_campaign_id AND t.owner_id = auth.uid()));
CREATE POLICY "Owners insert compliance logs" ON public.campaign_compliance_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.triggered_campaigns t WHERE t.id = campaign_compliance_logs.triggered_campaign_id AND t.owner_id = auth.uid()));
CREATE POLICY "Owners update compliance logs" ON public.campaign_compliance_logs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.triggered_campaigns t WHERE t.id = campaign_compliance_logs.triggered_campaign_id AND t.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.triggered_campaigns t WHERE t.id = campaign_compliance_logs.triggered_campaign_id AND t.owner_id = auth.uid()));
CREATE POLICY "Owners delete compliance logs" ON public.campaign_compliance_logs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.triggered_campaigns t WHERE t.id = campaign_compliance_logs.triggered_campaign_id AND t.owner_id = auth.uid()));

-- =========================================================
-- USER_SUBSCRIPTIONS — remove client INSERT (must come from server-side billing)
-- =========================================================
DROP POLICY IF EXISTS "Users insert own subscription" ON public.user_subscriptions;
