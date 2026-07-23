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
