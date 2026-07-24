# Status

Last updated: 2026-07-23

## Active milestone

Milestone 4 production activation and design-partner onboarding. The product
code is implemented end to end; external accounts and production credentials
remain the activation gate.

## Completed

- Product thesis and public surfaces locked.
- GitHub repository target and visibility selected.
- Documentation-first delivery selected.
- Enterprise Book a Call and Cal.com configuration selected.
- Supermemory business structure reviewed as a business-model reference.
- Repository foundation files drafted.
- Documentation terminology, internal links, pricing constraints, and secret
  hygiene validated.
- Initial commit `4a7d76f` created and pushed to `main`.
- Private repository `mihhhir08/continuity` created.
- Eight implementation issues created with milestone acceptance criteria.
- Multi-route marketing site implemented and production build validated.
- Synthetic Counterfactual Change Network demonstration and original social
  preview implemented.
- Enterprise scheduling uses `NEXT_PUBLIC_CAL_LINK` with a truthful
  unconfigured state.
- Sites project created for private production deployment.
- Shared Rust engine and CLI implemented.
- Local STDIO MCP server implemented over the shared engine.
- TypeScript and Python OpenAPI migration fixtures implemented.
- Deterministic dry-run, authorized repair, customer-owned verification, and
  Ed25519-signed offline evidence demonstrated end to end.
- PostgreSQL-backed hosted API implemented with API-key hashing, organization
  scoping, idempotent mutations, usage events, and durable jobs.
- Authenticated console, native CI workflow, ChangeBench manifest, and
  customer-controlled Docker deployment implemented.
- Enterprise policy example covers source egress, model control, write
  approval, capsule trust, and evidence retention.

## Blocker

External production credentials and private values are intentionally not
stored in Git. The public Cal.com booking URL is deployment configuration.
The ChangeTwin rename and public open-core launch are additionally blocked on
domain purchase and trademark clearance. The manual configuration list is
recorded below, in `BRAND_GATE.md`, and in `HANDOFF.md`.

## Next task

1. Create the Supabase project, apply both SQL files, configure Auth URLs and
   SMTP, and add its public and server-only values to Vercel.
2. Deploy the control plane with the pooled `DATABASE_URL`, set
   `NEXT_PUBLIC_CONTROL_PLANE_URL`, and run the hosted lifecycle check.
3. Create Stripe products/prices, register the webhook, configure its portal,
   and add the documented secrets and price IDs.
4. Confirm one real Cal.com booking and one Stripe sandbox subscription.
5. Provision production object storage, backup/restore, monitoring, and signing
   key custody.
6. Run tenant-isolation and disconnected-deployment tests in that environment.
7. Recruit design partners before publishing performance or customer claims.

## Verification record

Validated on 2026-07-23:

- `git diff --check` passed.
- Every local Markdown link from `README.md` resolves to a repository file.
- Public positioning addresses only the approved personas.
- Enterprise has no public numeric price.
- Secret-pattern scan found no credential material.
- The four product surfaces and CI integration distinction agree across the
  PRD, roadmap, decision log, and agent instructions.
- GitHub reports the repository as private with `main` as its default branch.
- All eight approved implementation issues exist.
- The marketing site production build succeeds.
- Enterprise cards contain no numeric price.
- Missing Cal.com configuration clearly states that no booking occurred.
- `cargo test --workspace` passes.
- `scripts/demo.sh` repairs both language fixtures, runs their checks, exports
  signed attestations, and verifies them offline.
- `platform` tests pass.
- `changebench/run.sh` passes the implemented case and publishes no comparative
  score.
- Web production build and route tests pass with the console included.
- Vercel requirements and founder actions are documented in
  `LAUNCH_CHECKLIST.md`.
- Marketing UI redesigned with an original editorial ink, paper, and
  electric-blue system, while preserving truthful claims and product
  boundaries.
- Repository delivery policy updated: completed work goes to `main` unless the
  user explicitly requests otherwise.
- Root README rebuilt as the polished product and engineering front door with
  truthful status, architecture, quick starts, trust boundaries, and durable
  documentation links.
- Bright editorial marketing system implemented across the homepage and all
  supporting routes with an interactive illustrative Compatibility Graph,
  accessible navigation and tabs, accurate CLI examples, discovery metadata,
  security headers, and an original social card.
- Conditional ChangeTwin brand gate and allowlist-only fresh-history public
  exporter implemented. The rename and public launch remain blocked until
  domain purchase and trademark clearance.
- `npm run lint`, the Next.js/Vercel production build, the Sites/vinext build,
  and rendered-route tests pass for the editorial redesign.
- `cargo fmt --check`, strict Clippy, locked Rust tests, the two-language demo,
  platform tests, and the implemented ChangeBench case pass.
- The open-core exporter passes shell validation and correctly refuses to
  export while the brand gate is pending.
- GitHub `main`, Vercel, and private Sites version 5 contain the redesign;
  both production endpoints returned HTTP 200 with the new Compatibility
  Graph content.
- Hero and pricing CTAs have explicit destinations, Cal.com has an external
  fallback, the founder credit links to the portfolio, and richer motion
  graphics retain a complete reduced-motion state.
- Start Building now enters a truthful developer console with passwordless
  Supabase authentication, workspace/project onboarding, one-time API-key
  display, onboarding progress, usage/evidence empty states, and local CLI
  fallback.
- Book a Call now navigates directly to Cal.com without a nested modal.
- PostgreSQL schema, Supabase RLS policies, workspace bootstrap function, and
  organization-scoped API-key validation are implemented.
- Next.js 16.2.11 and the hosted build toolchain pass the Vercel and Sites
  production builds; the full npm audit reports zero known vulnerabilities.
- Rust workspace tests, formatting, platform tests, web lint, and all seven
  rendered-site tests pass.
- Console now operates the product rather than stopping at onboarding:
  projects, change sets, live Compatibility Graph counts, simulations,
  approvals, migrations, policies, capsules, evidence export, usage, scoped
  keys, billing, and team access are present.
- Customer-operated agents claim leased hosted jobs, return privacy-preserving
  simulation summaries, perform authorized repairs locally, run customer
  checks, roll back failed repairs, and upload signed evidence.
- Evidence signatures cover the full verification result and fail after
  tampering. Migration Capsules are signed, expiring, issuer-gated, and
  independently verified by both Rust and the hosted API.
- Plan limits, Stripe Checkout, customer portal sessions, signed idempotent
  webhooks, and subscription-state persistence are implemented.
- Supabase organization roles and RLS prevent viewers from writing, reserve
  approvals and credentials for administrators, and prohibit browser clients
  from forging simulations, migrations, or attestations.
- Team invitation delivery is implemented through the trusted Supabase Admin
  API and remains disabled truthfully until the server-only key and SMTP are
  configured.
- GitHub Actions are pinned to immutable full commit SHAs and now include
  platform tests plus a real PostgreSQL hosted lifecycle demonstration on
  every push to `main` and every pull request.
- A stateless remote MCP endpoint exposes organization-scoped projects, risks,
  simulations, approvals, and attestations through the same Supabase
  authorization boundary. Public third-party access remains gated on external
  resource-bound OAuth configuration.
