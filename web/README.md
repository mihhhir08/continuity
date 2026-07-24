# Continuity web

Marketing, documentation, research, pricing, enterprise, and future console
surfaces for Continuity.

```bash
npm ci
npm run dev
npm test
```

Scheduling is disabled truthfully unless `NEXT_PUBLIC_CAL_LINK` is set. The
Sites project ID is stored in `.openai/hosting.json`; do not create another
project for this application.

The console becomes account-backed when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured. Without them it presents
the working local CLI onboarding path and never pretends that an account or
project was created.
