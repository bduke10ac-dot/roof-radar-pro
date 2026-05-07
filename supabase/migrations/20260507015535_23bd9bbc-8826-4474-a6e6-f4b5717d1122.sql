ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS states text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_markets_owner ON public.markets(owner_id);

DROP TRIGGER IF EXISTS trg_markets_updated_at ON public.markets;
CREATE TRIGGER trg_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();