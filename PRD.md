# Product Requirements Document

## 1. Product summary

Continuity predicts the impact of software changes, repairs affected systems
locally, verifies those repairs with the customer's own checks, and produces
signed evidence before release.

The long-term product is a Counterfactual Change Network connecting software
providers with participating consumers without centralizing consumer source
code. Providers can simulate proposed changes across the network, distribute
signed Migration Capsules, and see aggregated compatibility status. Consumers
retain control of execution, data, approvals, and verification.

### Product thesis

> Software that survives change.

### Public surfaces

- CLI
- Local and remote MCP servers
- REST API and SDKs
- Web console

There is no installed source-control application.
Native CI workflow templates are an integration and distribution channel, not
a separate product surface.

## 2. Problem and market thesis

Software changes propagate through dependencies that are only partially
visible. Changelogs and contract diffs describe what a provider changed, but
not which consumer call sites, workflows, or runtime behaviors are affected.
Dependency update tools can change declared versions without understanding
remote behavior. General coding agents can edit one checked-out repository but
do not possess provider-side release context, cross-organization compatibility
data, policy, or independently verifiable evidence.

Continuity turns software change from a notification problem into a closed-loop
workflow:

1. observe or receive a proposed change;
2. map affected integrations;
3. simulate the change locally;
4. propose and apply a repair;
5. run authoritative customer verification;
6. attest the outcome;
7. aggregate only approved compatibility evidence.

## 3. Personas and jobs

### Individual developer or maintainer

- Discover upcoming changes affecting a repository.
- Understand exact affected files and operations.
- Generate a reviewable repair without uploading source.
- Use the same workflow from a terminal or coding agent.

### Engineering team

- Protect multiple repositories with consistent policies.
- Run simulations in CI.
- Share evidence, failures, approvals, and exceptions.
- Control spend and model providers.

### API or SDK provider

- Evaluate a proposed release against participating integrations.
- Publish one signed Migration Capsule instead of repeating support work.
- Measure adoption and unresolved compatibility risk.
- Gate a release on explicit continuity policies.

### Enterprise platform or security team

- Operate in a private network or customer-controlled cloud.
- Enforce access, approval, data-retention, and model policies.
- Produce auditable evidence without exposing source to the hosted service.
- Support disconnected operation when required.

## 4. Primary journeys

### Local developer journey

1. Run `continuity init` inside a Git repository.
2. Run `continuity scan` to generate a local dependency and service graph.
3. Run `continuity simulate` against a selected change.
4. Review impact findings and a proposed repair.
5. Run `continuity repair` for the default dry run, approve it, then apply.
6. Run `continuity verify`.
7. Export a signed evidence bundle.

Local scan, simulation, repair, and verification must work without a hosted
account.

### Agent journey

1. Start `continuity mcp serve`.
2. Discover project, graph, change, migration, and attestation resources.
3. Invoke read-only analysis tools.
4. Request a dry-run repair.
5. Obtain explicit authorization before applying changes.
6. Verify and return structured evidence with uncertainty and unresolved risk.

### CI journey

1. A native CI workflow checks out the repository.
2. It invokes the same Continuity CLI used locally.
3. It receives a provider capsule or change-set reference.
4. It runs simulation and configured verification.
5. It publishes a check result or branch using credentials already controlled
   by the repository owner.
6. It sends only approved evidence to the hosted API.

### Provider journey

1. Create a proposed `ChangeSet`.
2. Attach contracts, SDK releases, behavioral guidance, and a signed capsule.
3. Start a network simulation.
4. View aggregated affected, verified, blocked, and unknown integrations.
5. Revise the change or publish the capsule.
6. Enforce a release policy when configured.

## 5. Functional requirements

### CLI

The first stable command surface is:

```text
continuity init
continuity scan
continuity simulate
continuity repair
continuity verify
continuity export
continuity agent run-once
continuity agent serve
continuity capsule create
continuity capsule verify
continuity capsule apply
continuity mcp serve
```

Requirements:

- Run from any local Git repository.
- Support local-only operation.
- Produce patches or branches without cloud repository access.
- Require dry-run and explicit approval before applying changes by default.
- Return structured JSON when `--json` is supplied.
- Use stable exit codes for CI.
- Keep local state inside a documented project directory that can be deleted or
  moved.

### MCP

Resources:

- `continuity://projects/current`
- `continuity://projects/current/graph`
- `continuity://changes/{id}`
- `continuity://migrations/{id}`
- `continuity://attestations/{id}`

Tools:

- `scan_project`
- `list_change_risks`
- `simulate_change`
- `propose_repair`
- `apply_repair`
- `verify_migration`
- `get_attestation`

Requirements:

- Local transport uses STDIO.
- Remote transport uses the hosted API and OAuth.
- Read-only operations request no write capability.
- Write-capable tools require scoped authorization.
- `apply_repair` requires a prior dry-run result unless policy explicitly
  overrides it.
- Long operations expose progress, cancellation, and final structured output.

### REST API

Initial resource groups:

- `/v1/projects`
- `/v1/continuity-boms`
- `/v1/change-sets`
- `/v1/simulations`
- `/v1/migrations`
- `/v1/capsules`
- `/v1/attestations`
- `/v1/events`

All mutations accept an idempotency key. Long operations return a job
identifier and stream progress through server-sent events.

The hosted execution loop must:

1. queue a project-scoped simulation or migration;
2. lease it to an `agent`-scoped customer process;
3. reclaim interrupted expired leases;
4. require reviewed dry-run and authorization fields for repair;
5. roll back modified files when verification fails;
6. atomically complete the job and its public record;
7. create an attestation record only from a verified local-agent result.

### Web console

The console manages:

- projects and organizations;
- scoped API credentials;
- usage and billing;
- Change Twin graphs;
- provider release simulations;
- migration progress and exceptions;
- policies and approvals;
- capsules and attestations;
- private deployment administration.
- team invitations and organization roles;
- live job state and Compatibility Graph counts;
- change-set creation and simulation queueing;
- explicit migration approval;
- evidence export and scoped credential revocation.

The console must never be required for local operation.
When account infrastructure is configured, the console supports passwordless
email sign-in, workspace creation, project creation, one-time API-key display,
onboarding progress, and truthful empty states. API-key plaintext is never
stored; only a SHA-256 digest and display prefix are persisted.
Self-serve billing redirects to provider-hosted Checkout and billing portal
sessions. Verified webhooks, not the browser, update plan state.

### Migration Capsules

A capsule contains:

- provider and artifact identity;
- source and destination contract references;
- affected operations and versions;
- deterministic transforms or signed WASM recipes;
- bounded model guidance;
- required verification;
- expiration, revocation, and rollback data;
- signature and provenance.

Invalid, expired, revoked, or untrusted capsules must fail closed.

### Evidence attestations

Evidence includes:

- source and change-set hashes;
- tool and model versions;
- applied transform or patch identity;
- verification commands and exit status;
- policy decisions and approvals;
- timestamps and environment claims;
- unresolved findings;
- signature and provenance.

Evidence must be independently verifiable offline.

## 6. Data model

Core entities:

- `Project`
- `Integration`
- `ChangeSet`
- `ImpactFinding`
- `MigrationCapsule`
- `SimulationRun`
- `MigrationRun`
- `PolicyDecision`
- `EvidenceAttestation`

The Continuity dependency artifact uses a published CycloneDX profile rather
than an incompatible format. Source text, secrets, and sensitive runtime
payloads are not part of the hosted data model by default.

## 7. Trust boundaries

- The local engine owns source analysis and modification.
- Customer verification is authoritative.
- The hosted control plane coordinates metadata, policy, aggregation, and
  evidence.
- Models may propose changes but cannot declare them verified.
- Providers cannot inspect consumer source through the network.
- Aggregated provider results reveal only fields explicitly permitted by the
  consumer policy.
- Hosted unavailability must not prevent local analysis or offline evidence
  verification.

## 8. Non-functional requirements

### Security and privacy

- Local-first execution.
- Least-privilege credentials.
- No secret values in logs, attestations, or hosted metadata.
- Signed capsules and evidence.
- Sandboxed untrusted transforms.
- Configurable network egress.
- Customer-controlled retention and deletion.
- Private-cloud, customer-VPC, self-hosted, and disconnected deployment.

### Reliability

- Idempotent hosted mutations.
- Resumable long-running work.
- Deterministic state transitions.
- Explicit partial and unknown states.
- Failure must not create a successful attestation.

### Accessibility

- Web surfaces meet WCAG 2.2 AA.
- Keyboard and assistive-technology access is required.
- Motion respects reduced-motion preferences.

### Performance

No public performance claims are permitted without a reproducible ChangeBench
result. Budgets and service objectives are established from measured production
workloads rather than invented in this document.

## 9. Monetization

| Plan | Public presentation |
|---|---|
| Free | $0 with limited projects, simulations, and repairs |
| Pro | $29/month for individual developers |
| Max | $129/month for power users and small teams |
| Scale | $499/month for production teams and API startups |
| Enterprise | No price; Book a Call |

Self-serve plans use bounded verified-repair credits with hard spend controls.
Customer-operated models reduce hosted compute usage. Source code and private
telemetry are never sold.

Enterprise material may describe private deployment, custom throughput, SSO,
policy controls, dedicated infrastructure, evidence, SLAs, support,
customer-operated models, and disconnected operation. It must not include a
price, range, or starting price.

## 10. Success metrics

Initial product metrics:

- successful clean installations;
- active protected projects;
- genuine change simulations;
- verified repair acceptance without manual rewriting;
- time from detected change to verified outcome;
- provider capsules published and consumed;
- zero-source-egress mode passing its privacy tests;
- conversion from individual to team usage.

Targets are recorded in `ROADMAP.md` and revised only with dated evidence.

## 11. Competitive objections

| Objection | Product answer |
|---|---|
| Breaking APIs are rare. | The system covers SDK, schema, authentication, model, infrastructure, internal service, and behavioral changes. |
| Versioning solves this. | Versioning postpones migration and multiplies support burden; Continuity completes and verifies it. |
| A coding agent can fix it. | A coding agent lacks provider release context, cross-organization simulation, policies, signed capsules, and ecosystem evidence. |
| Dependency bots open pull requests. | They update declared versions; Continuity reasons about remote behavior, actual usage, runtime evidence, and cross-repository effects. |
| API diff tools already exist. | They detect contract differences but do not privately simulate across consumer environments or verify completed migrations. |
| Architecture graphs already exist. | They are organization-local; Continuity connects providers and consumers without centralizing source. |
| AI patches are unsafe. | Deterministic repair is preferred, customer tests remain authoritative, failure stops verification, and writes require approval. |
| The open agent can be copied. | The moat is the provider network, capsule registry, migration outcomes, trust, and installed compatibility graph. |

## 12. Explicit exclusions

The first product does not include:

- an installed source-control application;
- automatic merging by default;
- a general-purpose autonomous coding agent;
- a proprietary replacement for CycloneDX;
- unverified benchmark, customer, security, or compliance claims;
- mandatory source-code upload;
- every language, protocol, or source-control system at launch.

## 13. Release phases

1. Repository foundation.
2. Marketing site and Cal.com integration.
3. Rust engine, CLI, local MCP, and end-to-end demonstration.
4. Hosted API, console, billing, CI templates, capsules, and ChangeBench.
5. Private deployment, enterprise controls, and expanded language/protocol
   coverage.

Detailed acceptance criteria live in `ROADMAP.md`.
