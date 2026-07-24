# Decision Log

This file records product-level decisions. Append new entries; do not silently
rewrite prior decisions.

## 2026-07-23

### D-001 — Working name

`Continuity` is a replaceable working name. Published interfaces require stable
aliases if the brand changes.

### D-002 — Product surfaces

The public product surfaces are CLI, local and remote MCP, REST API and SDKs,
and the web console. Native CI workflow templates are integrations rather than
a separate product surface.

### D-003 — Repository integration

Repository automation uses native CI workflows and customer-controlled
credentials. There is no installed source-control application.

### D-004 — Local-first boundary

Source, secrets, and sensitive runtime data remain local by default. The hosted
service receives only policy-approved metadata and evidence.

### D-005 — Open core

The Rust engine, CLI, local MCP server, CycloneDX profile, Migration Capsule
format, and evidence format are intended to be open. The compatibility network,
registry, hosted intelligence, console, and enterprise controls are commercial.

### D-006 — Standards

Continuity extends CycloneDX for service and dependency evidence rather than
creating an incompatible inventory format.

### D-007 — Verification

Deterministic repair precedes model-generated repair. Customer-owned checks
determine verification; models cannot declare success.

### D-008 — Enterprise conversion

Enterprise has no public price, range, or starting price. The call to action is
**Book a Call**.

### D-009 — Scheduling

Cal.com is configured through `NEXT_PUBLIC_CAL_LINK` and lazy-loaded after user
interaction. Missing configuration must not produce a false booking state.

### D-010 — Initial repository

The repository begins private at `mihhhir08/continuity`. Documentation is
committed before product code.

### D-011 — Initial technical scope

TypeScript/JavaScript, Python, OpenAPI/REST, npm, PyPI, Git repositories, and
native CI workflows are supported first.

### D-012 — Public positioning

Public positioning addresses developers, teams, API providers, and enterprises.
High-assurance capabilities appear as enterprise security and private
deployment.

### D-013 — Repository layout

Continuity is a monorepo. The marketing site and future console live in `web/`;
the shared local engine and adapters live in their own top-level workspaces.
One Sites project serves the web application.

### D-014 — Hosted foundation

The first control plane is one PostgreSQL-backed TypeScript service. It uses
organization scoping, mandatory idempotency keys, an in-database durable queue,
and append-only usage events. Separate microservices require measured need.

### D-015 — Production truth

External identity, billing, signing, storage, domain, and scheduling resources
are manual production configuration. The product must fail truthfully when
they are absent and must never commit their credentials.

### D-016 — Marketing visual direction

Continuity uses an original editorial infrastructure design with oversized
type, generous whitespace, numbered product sections, and alternating ink,
paper, and electric-blue surfaces. Supermemory informs the business-page
rhythm only; Continuity does not copy its assets, language, claims, or
distinctive product presentation.

### D-017 — Default delivery branch

Completed changes are committed and pushed to `main` unless the user explicitly
requests a branch or pull request. Feature branches and draft pull requests are
no longer the default delivery workflow.

### D-018 — Conditional ChangeTwin rebrand

`ChangeTwin` is the preferred replacement name. The rename is blocked until the
domain is purchased and trademark review is complete. After clearance, the
CLI, MCP URIs, local state, packages, evidence identity, deployment, and
documentation are renamed together without compatibility aliases because no
public release exists yet.

### D-019 — Public open-core boundary

The full monorepo and its history remain private. A new MIT-licensed repository
with fresh history will contain only the Rust engine, CLI, local MCP, public
formats, sanitized fixtures, public ChangeBench cases, demonstration, and
trust documentation. Strategy, web, console, hosted control plane, network
intelligence, and operational material remain private.

### D-020 — Console identity and onboarding

The public developer console uses Supabase passwordless email authentication
and PostgreSQL row-level security. Supabase is the managed production option,
not a second data model: the existing control plane continues to use the same
PostgreSQL schema. The console can create workspaces, projects, and hashed API
keys after configuration, while the unconfigured state offers only truthful
local onboarding.

### D-021 — Direct scheduling

Book a Call navigates directly to the configured Cal.com event. Continuity does
not wrap Cal.com in its own modal because nested scheduling overlays degrade
focus, navigation, and mobile usability.

### D-022 — End-to-end hosted execution

The console coordinates changes and approvals while a customer-operated local
agent claims leased jobs from the hosted control plane. Simulation, repair,
verification, rollback, signing, and source access remain inside the customer
boundary. Hosted job output contains compatibility summaries and evidence, not
source files or patches.

### D-023 — Least-privilege automation credentials

API keys have explicit `agent`, `orchestrate`, `read`, or `write` scopes.
Agent keys are additionally bound to one project.
Attestations can only be created from successful local-agent completion.
Provider publishing keys cannot approve repairs, and agent keys cannot create
arbitrary control-plane records.

### D-024 — Self-serve billing

Pro, Max, and Scale use Stripe-hosted Checkout and the Stripe customer portal.
Signed, idempotently recorded webhooks are authoritative for subscription
state. The console never claims payment or an active plan before the webhook is
processed.

### D-025 — Plan enforcement

Plan limits are enforced at the PostgreSQL trust boundary for projects,
simulations, and verified repairs. Initial limits are configuration data in
`plan_limits`, not public performance claims, and can be revised from measured
usage.

### D-026 — Public monorepo

The founder intentionally made `mihhhir08/continuity` public and explicitly
approved publishing the complete handoff, including internal strategy and
architecture, on 2026-07-24. This supersedes the private-monorepo assumption in
D-019 for the current repository. A separate fresh-history open-core repository
is optional, but remains the required method if a smaller package-focused
repository is created.
