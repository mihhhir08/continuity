# Launch and Operator Checklist

This separates implemented work from external configuration and future
engineering. Never paste credentials into GitHub, chat, or source files.

## What the founder must do

### Vercel

1. Keep the Vercel project's **Root Directory** set to `web`.
2. Leave **Output Directory** empty.
3. Use Node.js 22 and deploy `main`.
4. Confirm the build command is `npm run build:vercel`.
5. Set `NEXT_PUBLIC_SITE_URL` to the final production origin.
6. Add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` after completing the Supabase steps.
7. Add `NEXT_PUBLIC_CONTROL_PLANE_URL` after the hosted API is deployed.
8. Add `SUPABASE_SERVICE_ROLE_KEY` as a server-only secret for team invitations
   and billing webhooks.

### Brand gate

1. Purchase `changetwin.com`.
2. Complete US trademark screening and legal review.
3. Recheck and reserve package names.
4. Mark `BRAND_GATE.md` cleared.
5. Perform the complete interface and repository rename in one change.
6. Configure DNS only after the renamed deployment is validated.

### Public open core

1. Never change the private monorepo visibility.
2. Run the allowlist exporter only after brand clearance and the clean rename.
3. Create `mihhhir08/changetwin` as a new private repository with fresh history.
4. Run its pinned CI, secret scan, dependency review, and documentation audit.
5. Enable private vulnerability reporting, Dependabot, CodeQL, secret scanning,
   and push protection.
6. Obtain explicit founder approval before making it public.

### Scheduling

1. The real Cal.com event URL is configured through `NEXT_PUBLIC_CAL_LINK`.
2. Test one real booking before launch.
3. Confirm Book a Call navigates directly to Cal.com on desktop and mobile.

### Payments

1. Create recurring Stripe prices for Pro, Max, and Scale. Free has no Checkout
   price; Enterprise remains Book a Call.
2. Add the price IDs as `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MAX`, and
   `STRIPE_PRICE_SCALE`.
3. Add `STRIPE_SECRET_KEY` as a server-only deployment secret.
4. Register `https://<production-domain>/api/billing/webhook` for
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`.
5. Store its signing secret as `STRIPE_WEBHOOK_SECRET`.
6. Configure and brand the Stripe customer portal, including products,
   cancellation, invoices, tax behavior, and the return URL.
7. Run one sandbox checkout, portal visit, upgrade/downgrade, cancellation,
   duplicate webhook, and delayed-webhook test.

### Production customer data

1. Provision PostgreSQL and object storage.
2. Configure Supabase passwordless identity; add organization SSO when an
   enterprise customer requires it.
3. Provision signing identity and key rotation.
4. Configure retention, backup, recovery, audit, monitoring, and alerts.
5. Test tenant isolation, egress denial, restore, and disconnected deployment.

## What each task means

| Task | Meaning |
|---|---|
| Merge pull requests | Move implemented code into the branch deployment services build. |
| Root Directory `web` | Tell Vercel where the Next.js app and `package.json` live. |
| Cal.com | Send Book a Call directly to the native scheduling page. |
| Billing | Create plans, usage records, webhooks, taxes, and failure behavior. |
| Identity | Add customer and organization authentication, including SSO. |
| Managed data | Operate PostgreSQL, evidence objects, backups, and recovery. |
| Signing | Make capsules and attestations verifiable without a development key. |
| Design partners | Obtain real migrations and permissioned evidence before claims. |

## Implemented

- Multi-route site, private Sites deployment, and Vercel build configuration.
- Direct Cal.com scheduling without nested modals.
- Rust CLI, shared engine, and permissioned MCP server.
- TypeScript and Python OpenAPI migration demonstration.
- Deterministic repair, customer verification, and Ed25519 evidence.
- PostgreSQL control-plane foundation with organization scoping, idempotency,
  usage events, and durable jobs.
- Operational developer console covering projects, changes, simulations,
  approvals, migrations, policies, capsules, evidence, teams, scoped keys,
  usage, billing, native CI, ChangeBench, and Docker deployment.
- Customer-operated hosted agent with leases, heartbeats, local repair,
  customer checks, rollback, and signed evidence.
- Stripe Checkout, customer portal, signed idempotent webhooks, and database
  plan enforcement.
- Signed, expiring, issuer-gated Migration Capsules.

## Yet to be fixed or implemented

- Execute production tenant-isolation, webhook, backup/restore, and adversarial
  tests after the external environment exists.
- Configure Supabase, Stripe, SMTP, storage, key custody, monitoring, and
  backups.
- Add capsule revocation distribution and signed WASM recipes after a provider
  pilot requires them.
- Implement remaining ChangeBench cases; only endpoint rename is measured.
- Add Java, Go, GraphQL, and gRPC after the initial workflow is proven.
- Complete legal terms, privacy, support, incident response, and license review.
- Clear the ChangeTwin brand and public-release gates.
- Obtain real usage, customer outcomes, benchmarks, and security assessment
  before publishing those claims.

## Information required from the founder

- Production domain.
- Cal.com event URL.
- Stripe account, legal business country, currency, and tax configuration.
- Supabase project URL and publishable key, configured in Vercel—not sent in
  chat.
- Cloud and production region.
- Data-residency, retention, recovery, and support requirements.
- Whether the site should remain private or become public.
- First three design-partner profiles and their change scenarios.

Do not send passwords, private keys, tokens, database passwords, or service-role
credentials. Configure them in the platform's secret manager.

## Supabase

Supabase is the selected hosted-pilot identity and PostgreSQL provider. It does
not replace the Rust engine, MCP, durable execution, signing, or private
deployment.

1. Create a Supabase project in the required region.
2. In SQL Editor, run `platform/schema.sql`.
3. Then run `platform/supabase.sql`.
4. Under Authentication → URL Configuration, set the Site URL to the Vercel
   production origin and allow `/console` on Vercel, Sites, and the final
   domain as redirect URLs.
5. Copy only the Project URL and publishable key into Vercel as
   `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Put the pooled database connection string in the control plane as
   `DATABASE_URL`; never expose it to the browser.
7. Store the server secret as `SUPABASE_SERVICE_ROLE_KEY` in Vercel/Sites only;
   it enables team invitations and subscription webhook updates.
8. Keep server-secret and database credentials server-side only.
9. Configure the magic-link and invite email templates, redirect allowlist,
   custom SMTP, backups, recovery, storage policies, and spend limits before
   inviting production users.

## Control plane

1. Deploy `platform/` or `deploy/docker-compose.yml` behind HTTPS.
2. Configure the pooled `DATABASE_URL`.
3. For the hosted multi-tenant deployment, connect with the database role used
   for trusted service operations; browser users remain governed by RLS.
4. Set `NEXT_PUBLIC_CONTROL_PLANE_URL` to its public HTTPS origin.
5. Run `DATABASE_URL=... bash scripts/hosted-demo.sh` against a disposable
   environment before inviting users.
6. Configure health monitoring for `/healthz`, log redaction, rate limiting at
   the edge, backups, restore drills, and alerting.

Use customer-managed PostgreSQL for private-cloud or disconnected deployments.

## Why Vercel returned `404: NOT_FOUND`

The displayed ID is a Vercel request trace, not the cause. Likely causes:

1. Vercel deployed `main`, while the app remains in draft pull requests.
2. The app root is `web/`, not the repository root.
3. The original build produces a Sites/Cloudflare artifact, not Vercel output.
4. The visited URL may identify a deleted or replaced deployment.

The repository now includes `web/vercel.json` and `npm run build:vercel`.
Merge the pull requests, set Root Directory to `web`, redeploy, and use the
current production URL displayed by Vercel.

References:

- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Vercel 404 guide](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)
- [Deployment not found](https://vercel.com/docs/errors/deployment_not_found)
