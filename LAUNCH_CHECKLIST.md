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

1. Create the real Cal.com event.
2. Add its URL as `NEXT_PUBLIC_CAL_LINK` in production.
3. Test keyboard focus, Escape-to-close, and one real booking.

### Payments

1. Choose the billing provider.
2. Create Free, Pro, Max, and Scale products and usage limits.
3. Store credentials in the deployment platform's secret manager.
4. Configure webhook signing and test retries and duplicate events.

### Production customer data

1. Provision PostgreSQL and object storage.
2. Choose the identity provider and configure organization SSO.
3. Provision signing identity and key rotation.
4. Configure retention, backup, recovery, audit, monitoring, and alerts.
5. Test tenant isolation, egress denial, restore, and disconnected deployment.

## What each task means

| Task | Meaning |
|---|---|
| Merge pull requests | Move implemented code into the branch deployment services build. |
| Root Directory `web` | Tell Vercel where the Next.js app and `package.json` live. |
| Cal.com | Connect Book a Call to a real event without hardcoding it. |
| Billing | Create plans, usage records, webhooks, taxes, and failure behavior. |
| Identity | Add customer and organization authentication, including SSO. |
| Managed data | Operate PostgreSQL, evidence objects, backups, and recovery. |
| Signing | Make capsules and attestations verifiable without a development key. |
| Design partners | Obtain real migrations and permissioned evidence before claims. |

## Implemented

- Multi-route site, private Sites deployment, and Vercel build configuration.
- Accessible Cal.com modal with truthful missing configuration.
- Rust CLI, shared engine, and permissioned MCP server.
- TypeScript and Python OpenAPI migration demonstration.
- Deterministic repair, customer verification, and Ed25519 evidence.
- PostgreSQL control-plane foundation with organization scoping, idempotency,
  usage events, and durable jobs.
- Console, native CI, ChangeBench harness, and Docker deployment.

## Yet to be fixed or implemented

- Complete production tenant-isolation policies and adversarial tests.
- Connect identity, billing, storage, signing, monitoring, and backups.
- Complete capsule publishing, issuer trust, revocation, and signed WASM.
- Implement remaining ChangeBench cases; only endpoint rename is measured.
- Add Java, Go, GraphQL, and gRPC after the initial workflow is proven.
- Complete legal terms, privacy, support, incident response, and license review.
- Clear the ChangeTwin brand and public-release gates.
- Obtain real usage, customer outcomes, benchmarks, and security assessment
  before publishing those claims.

## Information required from the founder

- Production domain.
- Cal.com event URL.
- Billing provider and legal business country.
- Identity provider.
- Cloud and production region.
- Data-residency, retention, recovery, and support requirements.
- Whether the site should remain private or become public.
- First three design-partner profiles and their change scenarios.

Do not send passwords, private keys, tokens, database passwords, or service-role
credentials. Configure them in the platform's secret manager.

## Supabase

Supabase is **not required**. It can provide PostgreSQL and object storage for a
fast hosted pilot, but it does not replace the Rust engine, MCP, durable
execution, signing, or private deployment.

If selected:

1. create a project in the required region;
2. apply `platform/schema.sql`;
3. use a server-side pooled database URL;
4. keep the service-role credential server-side only;
5. configure backups, recovery, storage policies, and spend limits.

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
