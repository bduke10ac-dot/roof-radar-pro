# Export Checklist

What to do after syncing this project from Lovable to GitHub and opening it
in Cursor / VS Code.

## 1. Local bootstrap

- [ ] `git clone <your-repo>` and open in your editor
- [ ] `node -v` (use Node 20+)
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] Fill in `.env` with your Supabase URL, anon key, project ref, and
      Stripe publishable key (see README)
- [ ] `npm run dev` → http://localhost:8080 should load

## 2. Things you must save manually from Lovable / Supabase

These live outside the repo and are NOT exported by GitHub sync:

- [ ] **Supabase runtime secrets** (Cloud → Edge Functions → Secrets):
      `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SANDBOX_API_KEY`,
      `STRIPE_LIVE_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`,
      `PAYMENTS_LIVE_WEBHOOK_SECRET`, `LOVABLE_API_KEY`, plus any
      optional provider keys you've added.
- [ ] **Stripe** dashboard: products, prices, webhook endpoint URL +
      signing secret (sandbox AND live).
- [ ] **Database data** you care about: Cloud → Database → Tables →
      export each table as CSV.
- [ ] **Storage buckets** (`avatars`, `company-logos`): download any
      objects you want to keep.
- [ ] **Auth settings**: providers enabled, redirect URLs, email
      templates, SMTP config.
- [ ] **Custom domains**: DNS records currently pointed at Lovable.
- [ ] **Lovable AI Gateway** usage (if used): note that `LOVABLE_API_KEY`
      only works on Lovable infrastructure — replace with direct
      OpenAI/Google keys if self-hosting.

## 3. Point the app at your own Supabase project

If you're moving off the Lovable-managed Supabase project:

- [ ] Create a new Supabase project
- [ ] `supabase link --project-ref <new-ref>`
- [ ] `supabase db push` to apply everything in `supabase/migrations/`
- [ ] `supabase functions deploy` to deploy every function in
      `supabase/functions/`
- [ ] Re-add all runtime secrets from step 2
- [ ] Update `.env` with the new project's URL / anon key / project ref
- [ ] Re-create storage buckets (`avatars`, `company-logos`, both public)
- [ ] Re-import any CSV data you exported
- [ ] Re-configure auth providers (email, Google, etc.)

## 4. Stripe webhook

- [ ] In Stripe dashboard, create a webhook endpoint pointing at
      `https://<your-project-ref>.supabase.co/functions/v1/payments-webhook`
- [ ] Copy the signing secret into `PAYMENTS_SANDBOX_WEBHOOK_SECRET` /
      `PAYMENTS_LIVE_WEBHOOK_SECRET`
- [ ] Subscribe to: `checkout.session.completed`,
      `customer.subscription.updated`, `customer.subscription.deleted`,
      `invoice.payment_succeeded`, `invoice.payment_failed`

## 5. Deploy the frontend

Pick one:

- [ ] Keep using Lovable hosting (just click Publish)
- [ ] Vercel / Netlify / Cloudflare Pages: build command `npm run build`,
      output dir `dist`, SPA fallback to `index.html`. Add the four
      `VITE_*` env vars in the host's dashboard.

## 6. Mobile (optional)

See `PRODUCTION.md` for the Capacitor flow. You'll need a Mac + Xcode for
iOS and Android Studio for Android. Comment out the `server.url` block in
`capacitor.config.ts` before building store binaries.

## 7. Sanity checks

- [ ] Sign up a test user → profile row created
- [ ] Import 5 leads → "Geocode N leads" button works → pins appear on map
- [ ] Tap pin → call/text/route/mark-inspected actions work
- [ ] Stripe test checkout completes → subscription row created
- [ ] NWS alerts panel loads real data
- [ ] RainViewer radar tiles render (or show "unavailable")
