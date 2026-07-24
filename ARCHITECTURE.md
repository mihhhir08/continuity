# Architecture

## Principles

1. Source code and sensitive runtime data remain local by default.
2. The customer's own checks determine verification.
3. CLI, MCP, and CI reuse one Rust engine.
4. The hosted service coordinates; it is not required for local operation.
5. Deterministic analysis and transforms precede model-generated repair.
6. Evidence and capsules are signed and independently verifiable.
7. Existing standards are extended before new formats are invented.

## System context

```text
Provider                                      Consumer environment
┌────────────────────┐                        ┌─────────────────────────┐
│ Proposed ChangeSet │                        │ Source + tests + policy │
│ Migration Capsule  │                        │                         │
└─────────┬──────────┘                        │ Continuity Rust engine  │
          │                                   │  ├─ scan               │
          ▼                                   │  ├─ simulate           │
┌────────────────────┐  approved metadata     │  ├─ repair             │
│ Hosted control     │◀──────────────────────▶│  └─ verify             │
│ plane              │  capsule + task refs   │                         │
│  ├─ API            │                        │ CLI / MCP / CI          │
│  ├─ console        │                        └───────────┬─────────────┘
│  ├─ policy         │                                    │
│  ├─ registry       │                                    ▼
│  └─ evidence       │                          Signed attestation
└────────────────────┘
```

## Components

### Rust engine

Shared library for:

- repository discovery;
- package and contract parsing;
- static dependency analysis;
- CycloneDX profile generation;
- simulation;
- deterministic transforms;
- repair orchestration;
- verification execution;
- evidence generation and verification.

### CLI

Thin command interface over the Rust engine. It owns terminal UX, configuration,
JSON output, stable exit codes, and CI behavior.

### Local MCP server

Thin protocol adapter over the Rust engine. It does not duplicate analysis or
repair logic. Write-capable tools enforce dry-run and authorization rules.

### Hosted API

Coordinates organizations, projects, change sets, simulations, capsules,
policies, attestations, usage, and billing. It never silently expands the local
agent's permissions.

### Web console

Displays the Change Twin, provider simulations, migration status, evidence,
policy, usage, and billing.

### Durable worker

Runs metadata aggregation, provider simulation coordination, event delivery,
and other hosted jobs. Repair execution remains local unless a customer
explicitly selects a managed execution environment.

### Customer-operated agent

`continuity agent serve --project <id>` holds an `agent`-scoped credential and
polls the PostgreSQL durable queue. It claims one leased project job, executes
against the selected local repository, heartbeats before consequential work,
and reports a terminal outcome. Expired leases are reclaimable after an
interruption. Simulation reports only counts and hashes; repair uploads signed
evidence after customer checks pass.

## Technology decisions

- Rust for the local engine, CLI, and local MCP server.
- TypeScript for the hosted API, console, and marketing site.
- PostgreSQL for transactional state and initial graph adjacency.
- Object storage for immutable capsules and evidence bundles.
- PostgreSQL-backed durable queue before adopting separate queue
  infrastructure.
- Server-sent events for one-way live job progress.
- Signed WASM modules for portable deterministic migration recipes.
- CycloneDX profile for services, dependencies, and attestations.
- Sigstore-compatible signatures and in-toto-style provenance.

## Supported scope

First:

- TypeScript/JavaScript;
- Python;
- OpenAPI/REST;
- npm and PyPI;
- Git repositories;
- native CI workflows.

Later:

- Java and Go;
- GraphQL, gRPC, and AsyncAPI;
- additional package ecosystems and CI systems;
- sanitized runtime replay;
- confidential execution where justified by demand.

## Local data flow

1. Discover repository structure and configuration.
2. Parse manifests, contracts, source references, and optional runtime metadata.
3. Generate a local dependency graph and CycloneDX-compatible artifact.
4. Resolve a proposed change or capsule.
5. Calculate impact findings with evidence.
6. Produce a deterministic or model-assisted repair plan.
7. Require approval before writing.
8. Apply changes in an isolated worktree or sandbox.
9. Run configured verification.
10. Generate signed evidence.
11. Upload only policy-approved metadata when connected.

## Hosted state transitions

Simulation and migration jobs use explicit states:

```text
queued → running → awaiting_approval → verifying → verified
                     │                    │
                     ├─→ rejected         ├─→ failed
                     └─→ cancelled        └─→ partial
```

Unknown, partial, cancelled, rejected, and failed must never be presented as
verified.

If verification fails after a repair is applied, the engine restores every
affected file from its pre-repair snapshot before reporting failure.

## Authentication

- Web console: Supabase passwordless email with PostgreSQL RLS.
- Interactive CLI: device authorization.
- Automation: scoped API keys.
- Enterprise agents: OIDC workload identity or mTLS.
- Remote MCP: OAuth with resource-bound access.
- Local MCP: STDIO with credentials obtained from the environment.

Console-created API keys are generated in the browser with cryptographically
secure randomness, shown once, and stored only as SHA-256 digests. The hosted
API validates them inside the requested organization scope. A Supabase
publishable key may be exposed to the browser; service-role and database
credentials may not.

Scopes separate local agents, CI orchestration, provider publishing, and
read-only integrations. Agent keys are additionally bound to one project. The
database and API reject cross-project claims and forged verified records.

## Billing

The web server creates Stripe-hosted Checkout and customer-portal sessions only
after validating the Supabase user and organization role. Raw webhook bodies
are verified with Stripe's signing secret and a timestamp tolerance. Event IDs
are recorded once before subscription state changes. Browser plan selection is
never authoritative.

## Deployment

- Local-only workstation.
- Native CI runner.
- Hosted multi-tenant control plane.
- Dedicated managed instance.
- Customer VPC.
- Fully self-hosted.
- Disconnected deployment with offline capsule and evidence transfer.

The same public API contract should remain available across hosted and private
deployments.

## Evolution constraints

- Do not introduce a dedicated graph database before measured PostgreSQL query
  limits.
- Do not introduce microservices before independently scalable or isolated
  boundaries are demonstrated.
- Do not add a second implementation of core analysis for MCP or hosted use.
- Do not move source into the hosted boundary merely to simplify orchestration.
