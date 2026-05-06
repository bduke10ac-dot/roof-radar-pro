# RoofRadar — Production setup

## Architecture

- **Web app** (this repo): public marketing site + pricing + Stripe checkout + the contractor dashboard.
- **Mobile app** (Capacitor wrapper): login-only — users subscribe on the web, then sign in on iOS/Android.
- **Backend**: Lovable Cloud (Supabase) — auth, database, RLS, edge functions.
- **Payments**: Stripe Embedded Checkout via Lovable's built-in payments.

## Routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Public landing | — |
| `/pricing` | Pricing tiers | — |
| `/signup` `/login` | Auth | — |
| `/checkout?plan=pro&cycle=monthly` | Stripe embedded checkout | required |
| `/app` | Contractor dashboard (was /) | required |
| `/privacy` `/terms` `/support` | Legal & support | — |

## Environment / Secrets

### Already configured (managed automatically)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — backend
- `STRIPE_SANDBOX_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET` — Stripe test
- `STRIPE_LIVE_API_KEY`, `PAYMENTS_LIVE_WEBHOOK_SECRET` — Stripe live (after go-live)
- `LOVABLE_API_KEY` — gateway auth
- `VITE_PAYMENTS_CLIENT_TOKEN` — frontend Stripe key (auto from `.env.development`/`.env.production`)

### You still need to add (Cloud → Secrets)
For production data sources & messaging, add these as **runtime secrets** so edge functions can use them:
- `GOOGLE_MAPS_API_KEY` — Maps JS / Geocoding (also needs a public `VITE_GOOGLE_MAPS_API_KEY` in build secrets if used client-side)
- `OPENWEATHER_API_KEY` or `NOAA_API_KEY` — weather/storm feeds
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — SMS
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` — transactional email
- `ATTOM_API_KEY` / `ESTATED_API_KEY` / `REGRID_API_KEY` — property data (optional, pick one)

> Add via the Cloud dashboard. You will be prompted in chat when an edge function is created that needs one.

## Stripe go-live

1. Open the Payments tab → Live → claim your Stripe account
2. Complete Stripe onboarding (verify business + bank)
3. Install the Lovable app on your live account
4. Live keys provision automatically — checkout switches to live on the published domain

## Mobile (Capacitor)

The web sells subscriptions; mobile is a login-only wrapper (avoids Apple's IAP requirement).

```bash
# After "Export to GitHub" + git pull
npm install
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap run ios       # requires Mac + Xcode
npx cap run android   # requires Android Studio
```

Hot reload from the Lovable preview is configured in `capacitor.config.ts`.
For App Store / Play Store builds, comment out the `server.url` block before `npm run build`.

## PWA install

`public/manifest.json` is already linked from `index.html` with `display: standalone`
so the app can be added to the home screen on iOS/Android without a service worker
(avoids preview cache issues).
