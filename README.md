# RoofRadar

Storm-driven lead intelligence for roofing contractors. Real Leaflet/OSM maps,
NWS alerts, RainViewer radar, lead import + geocoding, Stripe subscriptions,
and a mobile-first field workflow (call / text / route / mark inspected).

Built with **Vite + React 18 + TypeScript + Tailwind + shadcn/ui**, backed by
**Lovable Cloud (Supabase)** for auth, Postgres + RLS, storage, and edge
functions. Payments via **Stripe Embedded Checkout**. Optional mobile shell
via **Capacitor**.

---

## Tech stack

- Vite 5, React 18, TypeScript 5
- Tailwind CSS v3 + shadcn/ui (Radix)
- React Router 6, TanStack Query
- Supabase JS (auth, Postgres, storage, edge functions)
- Leaflet + react-leaflet (OSM tiles, RainViewer radar, NWS GeoJSON)
- Stripe Embedded Checkout
- Vitest + Testing Library

---

## Local setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
# VITE_SUPABASE_PROJECT_ID, and VITE_PAYMENTS_CLIENT_TOKEN

# 3. Run dev server
npm run dev          # http://localhost:8080
```

### Required environment variables

Frontend (`.env` / `.env.development` / `.env.production`):

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |
| `VITE_PAYMENTS_CLIENT_TOKEN` | Stripe publishable key (`pk_test_…` / `pk_live_…`) |

Backend (set in Supabase dashboard → Edge Functions → Secrets):

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`,
`PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `PAYMENTS_LIVE_WEBHOOK_SECRET`,
`LOVABLE_API_KEY` (if using Lovable AI Gateway). Optional providers:
`GOOGLE_MAPS_API_KEY`, `OPENWEATHER_API_KEY`, `TWILIO_*`, `SENDGRID_*`,
`ATTOM_API_KEY` / `ESTATED_API_KEY` / `REGRID_API_KEY`.

NWS alerts and RainViewer radar require **no key**.

---

## Scripts

```bash
npm run dev          # Vite dev server on :8080
npm run build        # production build → dist/
npm run build:dev    # dev-mode build (source maps, no minify)
npm run preview      # serve dist/ locally
npm run lint         # eslint
npm test             # vitest
```

---

## Backend (Supabase)

Everything backend lives under `supabase/`:

- `supabase/migrations/` — schema + RLS policies (apply in order)
- `supabase/functions/` — Deno edge functions
  - `create-checkout`, `create-portal-session`, `payments-webhook` — Stripe
  - `nws-alerts` — NOAA active alerts proxy
  - `geocode` — Nominatim address → lat/lng
  - `delete-account`, `notify-guest-signup`
- `supabase/config.toml` — function-level config (e.g. `verify_jwt`)

To run against your own Supabase project:

```bash
# install the Supabase CLI, then
supabase link --project-ref <your-ref>
supabase db push                    # apply migrations
supabase functions deploy           # deploy all edge functions
```

Set the runtime secrets listed above in the Supabase dashboard before
invoking the Stripe / AI / messaging functions.

---

## Deploy

- **Lovable hosting**: click **Publish** in the editor. SPA fallback is
  built in. Custom domains: Project Settings → Domains.
- **Self-host the frontend**: `npm run build` and deploy `dist/` to any
  static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront). Configure
  SPA fallback to `index.html`.
- **Mobile (Capacitor)**: see `PRODUCTION.md`.

---

## Known limitations

- Geocoding uses public Nominatim (≈1 req/sec). For volume, swap in
  Google/Mapbox geocoding inside `supabase/functions/geocode`.
- Radar tiles come from RainViewer (free, best-effort availability).
- The mobile build via Capacitor is login-only by design — purchases happen
  on the web to avoid Apple IAP requirements.
- `src/lib/mockData.ts` is still used as a fallback for unauthenticated
  preview only; authenticated users always see real DB data.
- Lovable Cloud (Supabase) project ref and keys are baked into `.env`. When
  forking, replace them with your own project's values.

---

## Documentation

- [`PRODUCTION.md`](./PRODUCTION.md) — production / Stripe / mobile setup
- [`EXPORT_CHECKLIST.md`](./EXPORT_CHECKLIST.md) — what to do after exporting from Lovable
