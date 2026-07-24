# Security

## Security model

Continuity analyzes and may modify source code. The default boundary therefore
keeps source, secrets, credentials, and sensitive runtime payloads in the
customer-controlled environment.

The hosted service coordinates metadata, policy, capsule distribution,
aggregated compatibility, and evidence. It does not receive source by default.

## Protected assets

- source code and repository history;
- build and deployment credentials;
- model credentials;
- proprietary API contracts and migration guidance;
- runtime metadata and payload shapes;
- provider and consumer identities;
- policies, approvals, and evidence;
- signing keys.

## Primary threats

- malicious instructions embedded in source, contracts, or changelogs;
- model-generated unsafe or unrelated changes;
- malicious, expired, or revoked Migration Capsules;
- excessive MCP or CLI permissions;
- credential leakage through logs or evidence;
- cross-tenant access;
- replayed or duplicated jobs;
- unauthorized network egress;
- tampered evidence;
- misleading partial or failed outcomes shown as verified;
- compromised dependencies or build tools.

## Controls

### Local execution

- Default-deny write behavior until approval.
- Mandatory dry run for agent-initiated repair.
- Isolated worktree or sandbox.
- Configurable network egress.
- Environment and secret redaction.
- Bounded command execution and timeouts.
- Customer-configured verification commands.

### MCP

- Separate read and write capabilities.
- Scoped authorization per project and action.
- Structured tool descriptions and output.
- Protection against lookalike or tool-poisoning behavior.
- Replay protection and idempotency for mutations.
- Progress and cancellation for long work.

### Capsules and evidence

- Provider identity and content signatures.
- Expiration and revocation.
- Source and artifact hashes.
- Verification command and result recording.
- Offline signature verification.
- Explicit `unknown`, `partial`, `failed`, and `verified` states.

### Hosted service

- Least-privilege service identities.
- Passwordless console authentication and organization-scoped PostgreSQL RLS.
- API-key plaintext shown once and never persisted.
- Encryption in transit and at rest.
- Tenant isolation.
- Immutable audit events.
- Configurable retention and deletion.
- Customer-managed keys for eligible deployments.
- OIDC/SAML and separation of duties.

## Privacy promises

- Source code is not uploaded by default.
- Private telemetry is not sold.
- Provider dashboards receive only consumer-approved aggregate fields.
- Evidence excludes raw secrets and sensitive payloads.
- Local-only operation does not require a hosted account.

## Disclosure

A public vulnerability-reporting address and response policy must be created
before product code is released publicly. Do not claim certifications or
audits until they are complete and verifiable.

## Security acceptance

- Failed verification cannot issue successful evidence.
- Invalid capsules cannot execute.
- Write-capable MCP and CLI operations require authorization.
- Secret-scanning fixtures do not appear in logs or evidence.
- Tenant-isolation tests cover all hosted resource types.
- Offline verification works without hosted connectivity.
