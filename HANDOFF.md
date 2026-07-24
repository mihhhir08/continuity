# Continuity / ChangeTwin — Complete Project Handoff

> **Standalone context for Claude Code or another engineer**
>
> Last updated: **2026-07-24**
>
> This document explains the product, business thesis, architecture, completed
> implementation, current production state, remaining engineering, founder
> actions, safety boundaries, and exact continuation workflow. Read this file
> before making changes. Repository rules in `AGENTS.md` still bind edits.

## 1. Immediate situation

| Item | Current state |
|---|---|
| Working product name | **Continuity** |
| Preferred future name | **ChangeTwin**, blocked by the brand gate |
| Repository | `https://github.com/mihhhir08/continuity` |
| Repository visibility | **Public by explicit founder approval on 2026-07-24** |
| Branch and delivery rule | Commit completed work directly to `main` unless the founder says otherwise |
| Published handoff commit | `0b9eed0` |
| Latest verified GitHub workflow | `Continuity` run `30065137339`, passed on `77981ba` |
| Vercel production | `https://continuity-eight.vercel.app/` |
| Secondary Sites project | `appgprj_6a62715872d881919f7d1dc6a0c20f8e` |
| Cal.com | `https://cal.com/mihirsinh-chavda-df8o2m/chat-with-mihir` |
| Founder portfolio | `https://mihirsinhchavda.com/` |
| Active milestone | Production activation and design-partner onboarding |

### Public repository decision

The founder intentionally made `mihhhir08/continuity` public and explicitly
approved publishing the complete `HANDOFF.md`, including internal strategy and
architecture, on 2026-07-24. Treat the monorepo and its full Git history as
public information. Do not describe its PRD, business plan, console, hosted
control plane, or operational documentation as private.

The earlier private-monorepo plus fresh open-core repository plan is superseded
for the current repository. `scripts/export-open-core.sh` remains available
only if the founder later wants a smaller package-focused repository with clean
history; it cannot make information already published here private again.

A current-worktree credential-pattern scan found only documented local demo
database strings, not a live credential. A second scan across Git patches found
no common GitHub, Stripe, Supabase, or private-key signature pattern. These
focused checks are not a substitute for a dedicated full-history scanner and
manual review. If any real secret was ever committed, rotate it even if it was
later removed.

### Preserve this untracked file

At handoff time, the worktree contains a pre-existing untracked file:

```text
web/app/console/page 2.tsx
```

It differs from the tracked `web/app/console/page.tsx`. It was not created,
edited, staged, or committed as part of this handoff. Inspect it with the
founder before deleting, renaming, or publishing it.

## 2. Product thesis

> **Software that survives change.**

Continuity predicts what a proposed software change will break, repairs the
affected consumer systems inside their own security boundaries, runs their
existing checks, and produces independently verifiable evidence before the
change is released.

The problem is broader than dependency upgrades. Changes can affect APIs,
SDKs, schemas, authentication, infrastructure, models, internal services, and
runtime behavior. Changelogs and contract diffs explain what changed, but they
do not prove which real consumers will fail or whether a migration works.

The closed loop is:

```text
SCAN → SIMULATE → REPAIR → VERIFY → ATTEST
```

- **Scan:** map contracts, dependencies, service usage, and affected call
  sites.
- **Simulate:** evaluate a proposed provider change against the consumer's real
  project without centralizing its source.
- **Repair:** generate a deterministic, reviewable migration first; use a model
  only as a bounded fallback.
- **Verify:** run customer-owned tests, builds, type checks, and policy.
- **Attest:** sign the complete outcome so another party can verify it offline.

### The X-factor

The defensible product is the **Counterfactual Change Network**:

1. A provider submits a proposed `ChangeSet` before release.
2. Participating customer-operated agents test it inside each customer's
   environment.
3. Source code, secrets, and sensitive runtime data stay local by default.
4. Providers receive only policy-approved aggregate compatibility states.
5. Local agents repair affected systems and run their existing checks.
6. Providers distribute signed **Migration Capsules** containing official,
   bounded migration logic.
7. Signed **Evidence Attestations** prove exactly what was tested, changed, and
   verified.

A general coding agent can edit one checkout. It does not own provider release
context, a cross-organization compatibility network, trusted capsule
distribution, enterprise policy, or portable evidence. The durable moat is the
provider-to-consumer network, installed local execution layer, capsule
registry, migration outcomes, trust, and evidence—not generic AI patch
generation.

## 3. Market, users, and positioning

### Public personas

- **Developers:** find upcoming breakage and create a safe local repair.
- **Engineering teams:** protect many projects with shared policies, usage,
  evidence, and CI.
- **API/SDK providers:** test releases across participating integrations and
  publish one official Migration Capsule.
- **Enterprises:** operate privately, enforce identity and policy, and export
  auditable evidence.

### Positioning rule

Do not explicitly market the product as a “government product” or use
government agencies as public positioning. It should be strong enough for
high-assurance buyers through:

- local-first execution;
- private-cloud, customer-VPC, self-hosted, and disconnected deployment;
- least-privilege identity and approvals;
- signed offline evidence;
- retention, egress, model, and policy controls;
- customer-operated infrastructure and models.

Do not claim a certification, authorization, government approval, customer,
benchmark, testimonial, or security audit that has not actually happened.
Standard Vercel and Supabase deployment must never be presented as a certified
high-assurance environment.

### Consumer or enterprise?

This is a developer infrastructure product with a self-serve adoption layer,
not a mass-market consumer app. Individual developers can start freely through
the CLI/MCP, teams buy self-serve plans, and providers/enterprises buy the
network and control plane.

### Agent and MCP strategy

The product is agent-native:

- the local MCP server exposes the same Rust engine as the CLI;
- read and write capabilities are separate;
- write operations require dry-run review and explicit authorization;
- a future public remote MCP surface uses resource-bound OAuth;
- future provider/agent ecosystems can consume capsule and evidence resources.

## 4. Product surfaces and explicit exclusions

The only public product surfaces are:

1. CLI;
2. local and remote MCP;
3. REST API and SDKs;
4. web console.

Native CI workflows are integrations and a distribution channel. There is no
GitHub App or other installed source-control application.

The product is not:

- a general autonomous coding agent;
- a dependency bot that only changes version numbers;
- a replacement for CycloneDX;
- an automatic merge system by default;
- a service that requires source upload;
- a claim that all languages and protocols work at launch.

## 5. Business and monetization

### Product-led ladder

| Layer | Offering |
|---|---|
| Free adoption | Open local CLI and local MCP |
| Developer platform | API, SDKs, console, and CI templates |
| Ecosystem | Migration Capsules, MCP clients, and provider integrations |
| Technical authority | Reproducible ChangeBench research |
| Self-serve revenue | Free, Pro, Max, and Scale |
| Enterprise conversion | Private deployment, identity, policy, evidence, support, and Book a Call |
| Trust | Local execution, open formats, security docs, and changelog |

The business-page rhythm was informed by Supermemory's combination of open
source, local operation, API/MCP entry points, research, self-serve plans,
private deployments, and contact-led enterprise sales. Do not copy
Supermemory's product, branding, text, assets, illustrations, or distinctive
layouts.

### Public pricing

| Plan | Public presentation |
|---|---|
| Free | `$0`, limited projects, simulations, and repairs |
| Pro | `$29/month`, individual developers |
| Max | `$129/month`, power users and small teams |
| Scale | `$499/month`, production teams and API startups |
| Enterprise | **No price; Book a Call only** |

Enterprise material may mention private deployment, custom capacity, SSO,
policy controls, dedicated infrastructure, audit evidence, SLAs,
forward-deployed support, customer-operated models, and disconnected
operation. It must never show an enterprise number, range, or “starting at”
price.

Stripe-hosted Checkout and the Stripe customer portal are implemented for Pro,
Max, and Scale. Verified, idempotently processed webhooks—not browser state—
are authoritative for subscription status.

### Distribution loops

- Developer: install → useful finding → verified repair → team invite → paid
  plan.
- Provider: publish capsule → consumers use it → aggregate compatibility
  improves → more providers participate.
- Research: reproducible case → developer evaluation → installation →
  contributed cases/outcomes.
- Enterprise: team usage → security review → private deployment → wider project
  and provider coverage.

## 6. Locked product and engineering decisions

Preserve these unless the founder deliberately changes them and records a new
decision:

- Source, secrets, and sensitive runtime data remain local by default.
- Customer-owned checks, not a model, determine verification.
- Deterministic transformations precede model-generated repair.
- Failed verification restores affected files and cannot create verified
  evidence.
- CLI, MCP, and CI reuse one Rust engine.
- Write-capable CLI/MCP actions require dry-run and explicit authorization.
- Hosted orchestration coordinates metadata and jobs; it does not centralize
  source to simplify execution.
- API mutations are idempotent.
- API-key scopes `agent`, `orchestrate`, `read`, and `write` are not
  interchangeable.
- Agent keys are bound to one project.
- Supabase passwordless email and PostgreSQL RLS are the hosted console identity
  model.
- A Supabase service-role key must never appear in browser code or a
  `NEXT_PUBLIC_` variable.
- Stripe webhook state is authoritative for billing.
- PostgreSQL is the initial state, adjacency, and durable-queue store.
- Do not add microservices or a graph database before measured need.
- Extend CycloneDX, Sigstore-compatible signing, and in-toto-style provenance
  before inventing incompatible formats.
- Book a Call goes directly to Cal.com. Do not restore the nested modal or
  iframe that previously clashed with Cal.com's own UI.
- Enterprise has no public price.
- Do not fabricate proof.

## 7. Brand and repository release plan

### Current brand

The current interfaces remain `Continuity` until `BRAND_GATE.md` contains the
exact line:

```text
Status: cleared
```

The founder reported that `changetwin.com` was available, but availability is
not purchase, control, or legal clearance.

### Founder gates before rename

- purchase and control `changetwin.com`;
- run a current US trademark search;
- obtain legal review for the intended software/infrastructure use;
- recheck and reserve npm, PyPI, and crates.io names if needed;
- retain DNS access for cutover.

### Rename after clearance

Perform one clean, breaking rename because the interfaces have not been
publicly released:

```text
continuity CLI      → changetwin
continuity://       → changetwin://
.continuity/        → .changetwin/
Continuity identity → ChangeTwin
```

Also rename crates, packages, evidence identity, MCP server identity, Docker
names, documentation, metadata, environment prefixes, deployments, and the
private repository. Rename the product feature formerly called “Change Twin”
to **Compatibility Graph** so it does not duplicate the company name. Preserve
REST paths and entity schemas under `/v1`.

### Repository direction

- The current full monorepo is public by founder decision.
- A future rename may rename this repository after the brand gate is cleared.
- A separate `mihhhir08/changetwin` repository is optional, not the current
  privacy boundary.
- If a separate open-core repository is created, use fresh history and the MIT
  license.

The public allowlist includes only the Rust engine/CLI, local MCP, root Cargo
manifests, sanitized TypeScript/Python fixtures, public ChangeBench cases,
demonstration, open formats/policy example, public README, sanitized trust
documentation, community files, MIT license, and minimal pinned CI.

`scripts/export-open-core.sh` enforces the historical allowlist and refuses to
run while the brand gate is pending. If it is used for a separate repository,
use fresh history, scan secrets, audit dependencies, run
tests/demo/format/Clippy, pin Actions by full SHA, use a GitHub noreply commit
address, enable secret scanning, push protection, Dependabot, CodeQL, and
private vulnerability reporting, and obtain the founder's explicit
confirmation.

## 8. What has been implemented

### Rust engine and CLI

Location: `crates/continuity/`

Implemented:

- TypeScript/JavaScript and Python source scanning;
- CycloneDX-like continuity BOM generation;
- OpenAPI change simulation;
- deterministic repair planning and patching;
- dry-run by default;
- application only when both `--apply` and `--approve` are supplied;
- customer-configured verification commands;
- rollback of modified files when hosted migration verification fails;
- Ed25519 evidence signing and offline verification;
- signatures covering the full verification result;
- tamper-detection tests;
- Unix signing-key permissions restricted to `0600`;
- signed, expiring, issuer-gated Migration Capsules;
- capsule create, verify, and apply commands;
- customer-operated hosted agent with leased jobs and heartbeats.

Stable command surface:

```bash
continuity init
continuity scan
continuity simulate --change proposed-change.json
continuity repair --change proposed-change.json
continuity repair --change proposed-change.json --apply --approve
continuity verify
continuity export --change proposed-change.json
continuity attestation-verify .continuity/attestation.json
continuity agent run-once --project <project-id>
continuity agent serve --project <project-id>
continuity capsule create --issuer provider.example --artifact api.example/openapi --change proposed-change.json --output capsule.json
continuity capsule verify capsule.json
continuity capsule apply --capsule capsule.json --trust-issuer provider.example
continuity capsule apply --capsule capsule.json --trust-issuer provider.example --apply --approve
continuity mcp serve
```

### Local MCP

The STDIO MCP server is a thin adapter over the Rust engine.

Resources:

```text
continuity://projects/current
continuity://projects/current/graph
continuity://changes/{id}
continuity://migrations/{id}
continuity://attestations/{id}
```

Tools:

```text
scan_project
list_change_risks
simulate_change
propose_repair
apply_repair
verify_migration
get_attestation
```

Read/write capabilities are separated. `apply_repair` fails without reviewed
dry-run and explicit write authorization.

### Remote MCP

`web/app/api/mcp/route.ts` implements a stateless organization-scoped endpoint
at `/api/mcp`. It can expose projects and risks, queue simulations, approve
migrations, and retrieve evidence through configured Supabase authorization.

Current limitation: it uses an authenticated Supabase organization token. Do
not advertise it as a general public third-party MCP endpoint until
resource-bound OAuth authorization, protected-resource metadata, consent, and
client tests exist. With production Supabase absent, it correctly returns
`503 Remote MCP is not configured`.

### Hosted control plane

Location: `platform/`

Implemented as one Node.js/PostgreSQL service:

- `/healthz`;
- `/v1/projects`;
- `/v1/continuity-boms`;
- `/v1/change-sets`;
- `/v1/simulations`;
- `/v1/migrations`;
- `/v1/capsules`;
- `/v1/attestations`;
- `/v1/events`;
- OpenAPI contract at `platform/openapi.yaml`;
- organization scoping;
- mandatory idempotency for mutations;
- API-key SHA-256 storage and scoped validation;
- project-bound agent keys;
- durable PostgreSQL job queue;
- lease, heartbeat, claim, completion, expiry, and retry behavior;
- SSE job/event progress;
- append-only usage;
- PostgreSQL plan enforcement;
- server-side validation of Rust Ed25519 attestations and capsules.

Only the customer-operated agent can complete hosted simulations/migrations
and create verified attestations. A browser or general API caller cannot forge
a verified record.

### Customer-operated hosted agent

The agent uses:

```bash
export CONTINUITY_API_URL=https://api.example.com
export CONTINUITY_ORGANIZATION=<workspace-id>
export CONTINUITY_API_KEY=<agent-scoped-key>
continuity agent serve --project <project-id>
```

It claims project-scoped leased jobs, runs locally, uploads compatibility
counts/hashes rather than paths or patches, applies an authorized migration,
runs customer checks, restores files on failure, and uploads signed evidence
on success.

### PostgreSQL and Supabase

Schema files:

```text
platform/schema.sql
platform/supabase.sql
```

Implemented:

- organizations and memberships;
- owner, admin, member, and viewer roles;
- projects, changes, simulations, migrations, policies, capsules, evidence;
- API keys, idempotency, usage, billing events, plans, and durable jobs;
- row-level security;
- security-definer RPCs for workspace creation, simulation queueing, and
  migration approval;
- viewers are read-only;
- members can operate project/change/simulation flows;
- owner/admin roles control approvals, policy, capsules, keys, billing, and
  invitations.

Supabase passwordless email is the selected hosted-pilot authentication model.
Team invites are implemented using the trusted Supabase Admin API and remain
truthfully unavailable until the server-only key and email delivery are
configured.

### Web console

Location: `web/app/console/`

The console is not just onboarding. It includes:

- truthful unconfigured/local setup mode;
- passwordless magic-link authentication when configured;
- workspace creation;
- roles and team invitations;
- project creation and management;
- change sets;
- live Compatibility Graph counts;
- queued simulation status and polling;
- repair approval;
- migration tracking;
- customer-agent connection command;
- policies;
- capsule planning/publishing workflow;
- evidence vault and export;
- one-time API key display and revocation;
- agent, CI/orchestration, provider/write, and read scopes;
- usage and billing;
- plan selection and subscription management.

### Billing

Implemented in Next.js server routes:

- Stripe-hosted Checkout;
- Stripe customer portal;
- raw-body webhook verification;
- timestamp tolerance and multiple `v1` signature support;
- idempotent billing-event processing;
- checkout completion and subscription update/delete handling;
- database plan state updated only by verified webhook events.

Initial database plan limits are configuration defaults, not public performance
claims:

| Plan | Projects | Monthly simulations | Monthly verified migrations | Retention days |
|---|---:|---:|---:|---:|
| Free | 2 | 10 | 3 | 30 |
| Pro | 10 | 100 | 30 | 90 |
| Max | 50 | 1,000 | 300 | 365 |
| Scale | 500 | 10,000 | 3,000 | 730 |
| Enterprise | custom/unlimited | custom/unlimited | custom/unlimited | 2,555 default |

### Marketing site

Location: `web/`

Implemented:

- Next.js `16.2.11`;
- bright editorial visual system with off-white paper, white panels, grid
  lines, electric blue, and contained dark code/terminal components;
- original typography, graphics, motion, and social preview;
- interactive synthetic Compatibility Graph;
- reduced-motion fallback;
- keyboard navigation, focus states, semantic tabs, and responsive layouts;
- homepage plus pricing, docs, MCP, research, security, enterprise, changelog,
  open-source, console, and branded error routes;
- truthful ChangeBench methodology with no unpublished scores;
- local, hosted, private-cloud, and disconnected deployment visuals;
- security headers, sitemap, robots metadata, structured product metadata;
- direct Cal.com scheduling;
- footer link “Built by Mihir” to the founder portfolio;
- original copy/assets rather than a Supermemory clone.

“Start free”/developer CTAs lead to real getting-started or console paths.
Enterprise Book a Call navigates directly to Cal.com to avoid nested-modal UI
conflicts.

### Fixtures, ChangeBench, CI, and deployment

Implemented:

- TypeScript and Python OpenAPI consumer fixtures;
- `scripts/demo.sh` local two-language workflow;
- `scripts/hosted-demo.sh` PostgreSQL queue-to-attestation lifecycle;
- one published ChangeBench endpoint-rename case;
- native CI templates;
- pinned GitHub Actions for Rust, local demo, platform tests, real PostgreSQL
  hosted lifecycle, and web tests;
- customer-controlled Docker Compose deployment;
- Vercel and Sites-compatible web builds.

Do not describe cases marked `specified` in `changebench/cases.json` as measured
benchmark results.

## 9. Repository map

```text
.
├── crates/continuity/          Rust engine, CLI, agent, and local MCP
├── fixtures/                   TypeScript and Python consumers
├── changebench/                Public reproducible cases and runner
├── platform/                   PostgreSQL hosted control plane
├── web/                        Next.js marketing site and console
├── deploy/                     Docker customer-controlled deployment
├── scripts/demo.sh             Local end-to-end demonstration
├── scripts/hosted-demo.sh      Hosted lifecycle verification
├── scripts/export-open-core.sh Fresh-history public allowlist exporter
├── open-core/                  Public-release support material
├── .github/workflows/          Pinned CI
├── PRD.md                      Authoritative requirements
├── ARCHITECTURE.md             Component/trust design
├── SECURITY.md                 Threat model and controls
├── BUSINESS.md                 Monetization and distribution
├── DECISIONS.md                Locked decision history
├── STATUS.md                   Current milestone and verification
├── BRAND_GATE.md               Rename/public-release gate
└── LAUNCH_CHECKLIST.md         Operator checklist
```

## 10. Production and deployment state

### Verified

- GitHub workflow `30065137339` passed on commit `77981ba` on 2026-07-24.
- The workflow covered Rust tests, the local demo, platform tests, a real
  PostgreSQL hosted lifecycle, and web tests.
- Vercel `https://continuity-eight.vercel.app/` returned HTTP 200 in the last
  deployment verification.
- The production `/api/mcp` route truthfully returned 503 because production
  Supabase was not configured.
- The last known private Sites deployment was
  `https://continuity-change-infrastructure.mihhhir08.chatgpt.site`.

### Sites caveat

The Sites project already exists; never create a second project. The last
attempt to publish the newest source state to the owner-only Sites mirror was
blocked because the credentialed Git push required by that workflow did not
receive safety approval. Vercel is the current primary deployment.

Do not retry Sites publication as a hidden side effect. If the founder wants
the secondary mirror updated, ask for explicit approval for the private Sites
publish, then reuse the exact project ID in `web/.openai/hosting.json`.

### Why Vercel previously returned `404: NOT_FOUND`

The original causes were deployment configuration/state, not a missing product:

- the Next.js root is `web/`, not the repository root;
- Vercel must build `main`;
- the Root Directory must be `web`;
- Output Directory should remain empty;
- the Vercel build is `npm run build:vercel`;
- old/deleted deployment URLs can return `NOT_FOUND`.

Current Vercel domain:

```text
https://continuity-eight.vercel.app/
```

## 11. Founder manual work — do this in order

Never send passwords, database credentials, service-role keys, Stripe secrets,
private signing keys, or tokens in chat. Put them directly into the relevant
platform's encrypted secret manager.

### 0. Maintain the public repository safely

- Keep credentials and production secrets out of Git.
- Run a dedicated full-history secret scan.
- Enable GitHub secret scanning, push protection, Dependabot, CodeQL, and
  private vulnerability reporting.
- Rotate any credential that ever appeared in history, even if deleted later.
- Require an explicit founder decision before changing visibility again.

### 1. Create and configure Supabase

1. Create a Supabase project in the required production region.
2. Run `platform/schema.sql` in SQL Editor.
3. Run `platform/supabase.sql` second.
4. Set the Auth Site URL to the production Vercel origin.
5. Allow `/console` redirects for Vercel, the Sites mirror if used, and the
   future custom domain.
6. Configure custom SMTP.
7. Configure magic-link and invite templates.
8. Configure backups, restore policy, storage policy, spend limits, and alerts.
9. Add these browser-safe Vercel values:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

10. Add this only as a server-side Vercel secret:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Never prefix the service-role key with `NEXT_PUBLIC_`.

### 2. Deploy the control plane

1. Deploy `platform/` or `deploy/docker-compose.yml` behind HTTPS.
2. Provision PostgreSQL and use its pooled connection string as
   `DATABASE_URL`.
3. Configure the trusted server/API role; browser users remain governed by
   Supabase RLS.
4. Set Vercel:

```text
NEXT_PUBLIC_CONTROL_PLANE_URL=https://<control-plane-origin>
```

5. Run the hosted lifecycle against a disposable production-like database:

```bash
DATABASE_URL=postgres://... bash scripts/hosted-demo.sh
```

6. Add edge rate limiting, `/healthz` monitoring, log redaction, alerts,
   backups, and a restore drill.

### 3. Configure Stripe

1. Create recurring products/prices for Pro, Max, and Scale.
2. Free uses no Checkout price.
3. Enterprise remains Book a Call only.
4. Add server-side Vercel secrets:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO
STRIPE_PRICE_MAX
STRIPE_PRICE_SCALE
```

5. Register:

```text
https://<production-domain>/api/billing/webhook
```

for:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

6. Configure the Stripe customer portal, branding, products, cancellation,
   invoices, return URL, tax, and legal business details.
7. Test sandbox checkout, portal, upgrade, downgrade, cancellation, duplicate
   webhook, and delayed webhook behavior.

### 4. Verify scheduling and production web

- Ensure `NEXT_PUBLIC_CAL_LINK` equals the real event URL.
- Complete one real booking on desktop and mobile.
- Confirm Book a Call goes directly to Cal.com without a Continuity modal.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin.
- Keep Vercel Root Directory `web`, Node.js 22, and Output Directory empty.

### 5. Production security and operations

- Provision object storage for larger immutable evidence/capsule bundles.
- Establish signing-key custody and rotation using KMS/HSM where required.
- Run tenant-isolation and role-escalation tests in the actual environment.
- Test source-egress denial, malicious capsules/instructions, job replay,
  interrupted leases, evidence tampering, backup restore, and disconnected
  operation.
- Establish monitoring, incident response, support, retention, deletion,
  recovery objectives, and audit-log procedures.
- Complete privacy policy, terms, acceptable-use terms, security contact, and
  vulnerability disclosure.
- Obtain external legal and security review before high-assurance claims.

### 6. Brand gate

- Purchase `changetwin.com`.
- Complete trademark and legal review.
- Reserve package names.
- Confirm DNS control.
- Mark `BRAND_GATE.md` cleared only after every gate is true.
- Then perform the one-time full rename and domain cutover.

### 7. Design partners and proof

- Recruit initial developer/team/provider design partners.
- Choose real breaking-change scenarios with permission.
- Record measured installation, migration, repair acceptance, and time-to-safe
  outcomes.
- Publish only reproducible, permissioned ChangeBench and customer evidence.

### Information still required from the founder

- Confirmation that `changetwin.com` was purchased, not merely available.
- Trademark/legal clearance result.
- Chosen production cloud and region.
- Data residency, retention, RTO/RPO, and support requirements.
- Stripe legal country, settlement currency, and tax approach.
- First three design-partner profiles and proposed change scenarios.
- Whether the Sites mirror should be updated.

## 12. Remaining engineering backlog

### P0 — activation and security

- Complete full-history secret scanning and enable GitHub repository security
  controls.
- Activate Supabase/SMTP, hosted PostgreSQL/API, and Stripe in production.
- Run production tenant-isolation, billing, restore, egress, and adversarial
  tests.
- Configure production object storage, monitoring, backups, and signing-key
  custody.
- Add a resource-bound OAuth authorization server/gateway before public
  third-party remote MCP access.

### P1 — core product depth

- Add capsule revocation distribution.
- Execute signed WASM migration recipes in a constrained sandbox.
- Expand ChangeBench beyond the implemented endpoint-rename case:
  removed endpoints, renamed fields, type changes, authentication changes, and
  behavioral mismatches.
- Add production SDK packages for TypeScript and Python from the OpenAPI
  contract.
- Deepen provider registry, release simulation aggregation, and real provider
  pilots.
- Add stronger policy/audit export and customer-managed signing identities.

### P2 — enterprise and ecosystem

- SAML/OIDC enterprise SSO in the selected production environment.
- Customer-managed keys and KMS/HSM integration.
- Java and Go.
- GraphQL, gRPC, and AsyncAPI.
- Additional package ecosystems and CI systems.
- Managed runners only if customer demand justifies changing the local-first
  default.
- Sanitized runtime replay or confidential execution only after measured need.

### Release work

- Complete ChangeTwin rename after the brand gate.
- Re-run all product, website, offline, and deployment validations.
- Generate the public open-core tree using the allowlist exporter.
- Create the fresh repository privately first.
- Complete security, dependency, legal, documentation, and license review.
- Obtain explicit founder confirmation before making the fresh open-core
  repository public.

## 13. Known limitations and truthful claims

- The code is end-to-end, but the live SaaS is not activated until Supabase,
  hosted control plane, Stripe, SMTP, storage, monitoring, and key custody are
  configured.
- Remote MCP is implemented but is not ready for general third-party clients
  without resource-bound OAuth.
- ChangeBench has one implemented published case; other specified cases are
  not results.
- Provider-network defensibility is architectural and functional, but the
  network effect requires real providers and participating consumers.
- SSO, KMS/HSM, revocation distribution, signed WASM execution, Java, Go,
  GraphQL, and gRPC remain future work.
- No customer, revenue, benchmark, certification, authorization, testimonial,
  audit, or government adoption claim is currently supported.
- The preferred ChangeTwin name is not cleared until domain ownership and legal
  review are documented.

## 14. Environment variable reference

### Browser-safe web configuration

```text
NEXT_PUBLIC_CAL_LINK
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_CONTROL_PLANE_URL
NEXT_PUBLIC_SITE_URL
```

### Server-only web configuration

```text
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO
STRIPE_PRICE_MAX
STRIPE_PRICE_SCALE
```

### Hosted control plane

```text
NODE_ENV
PORT
DATABASE_URL
CONTINUITY_API_KEY_SHA256
CONTINUITY_ORGANIZATION_NAME
```

### Customer-operated agent

```text
CONTINUITY_API_URL
CONTINUITY_ORGANIZATION
CONTINUITY_API_KEY
```

Only browser-safe values may use `NEXT_PUBLIC_`. Never commit populated secret
environment files.

## 15. Build and validation commands

Start every Claude Code session with:

```bash
git status --short --branch
git pull --ff-only origin main
git log -5 --oneline
```

Do not use destructive cleanup to remove the untracked `page 2.tsx`.

### Rust

```bash
cargo fmt --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace --locked
bash scripts/demo.sh
bash changebench/run.sh
```

### Hosted platform

```bash
cd platform
npm ci
npm test
```

With a disposable PostgreSQL database:

```bash
DATABASE_URL=postgres://... bash scripts/hosted-demo.sh
```

### Web

```bash
cd web
npm ci
npm run lint
npm run build:vercel
npm test
```

`npm test` uses the Sites/vinext build and rendered-route checks. Vercel uses
`npm run build:vercel`.

### Documentation and hygiene

```bash
git diff --check
git status --short
```

Also verify:

- no live credential or private key was added;
- Enterprise contains no public price;
- production commands match the real CLI;
- no fabricated claims were introduced;
- failed or partial states never display as verified;
- source paths/patches do not cross the hosted boundary by default;
- the private/public code boundary remains intact.

## 16. Workflow for Claude Code

1. Read this document.
2. Read `AGENTS.md`; it contains binding repository rules.
3. Check `git status` and preserve all pre-existing user work.
4. Treat the repository as public and keep secrets or customer data out of
   every file, commit, issue, and build log.
5. Work on the highest-priority unfinished item only.
6. Prefer the existing architecture and dependencies; do not create speculative
   services or abstractions.
7. Run the smallest meaningful test while iterating, then the complete relevant
   validation before delivery.
8. Update `STATUS.md` before each commit.
9. Append to `DECISIONS.md` only for a real product-level decision.
10. Keep this handoff current when setup, architecture, commands, blockers, or
    production state changes.
11. Stage only scoped files. Do not stage `web/app/console/page 2.tsx` without
    founder confirmation.
12. Commit and push completed work to `main` unless the founder explicitly
    requests a branch or pull request.

## 17. Recommended next session

The most valuable next session is production activation, not more speculative
UI or architecture:

1. enable GitHub security controls and run a full-history secret scan;
2. create Supabase and apply both SQL files;
3. deploy the control plane and run `scripts/hosted-demo.sh`;
4. connect Vercel to Supabase/control-plane values;
5. configure Stripe and exercise the entire sandbox lifecycle;
6. run one real console → simulation → local agent → approval → repair →
   verification → evidence flow;
7. run tenant isolation and restore tests;
8. onboard the first design partner.

If external accounts are not ready, the best engineering task is the
resource-bound OAuth gateway for remote MCP or expansion of ChangeBench. Do
not build additional speculative surfaces.

## 18. Definition of “ready”

The product is ready for a controlled design-partner pilot when:

- public-repository security controls and history review are complete;
- Supabase authentication, RLS, SMTP, and invitations work;
- the hosted control plane and PostgreSQL are monitored and backed up;
- Stripe sandbox lifecycle passes;
- a real customer-operated agent completes the full hosted workflow;
- failure rolls back and cannot create verified evidence;
- cross-tenant and role tests pass;
- direct Cal.com booking works;
- legal/security pages and incident contacts exist;
- every public claim is supported by reproducible evidence.

It is ready for an open-core public launch only after the separate brand,
security, legal, fresh-history, and founder-approval gates are also complete.
