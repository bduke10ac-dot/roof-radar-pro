CREATE TABLE IF NOT EXISTS public.user_market_automation_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  market_id uuid,
  market_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, market_name)
);

ALTER TABLE public.user_market_automation_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own market automation prefs"
  ON public.user_market_automation_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own market automation prefs"
  ON public.user_market_automation_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own market automation prefs"
  ON public.user_market_automation_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own market automation prefs"
  ON public.user_market_automation_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_market_automation_prefs_updated_at
  BEFORE UPDATE ON public.user_market_automation_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
