CREATE TABLE public.guest_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  consent boolean NOT NULL DEFAULT true,
  user_agent text,
  source text DEFAULT 'use_it_now',
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous guests) may insert their own contact info
CREATE POLICY "Anyone can submit a guest lead"
ON public.guest_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No public read/update/delete; only service role can read leads
CREATE POLICY "Service role full access guest leads"
ON public.guest_leads FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_guest_leads_created_at ON public.guest_leads(created_at DESC);
CREATE INDEX idx_guest_leads_email ON public.guest_leads(email);