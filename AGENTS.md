# Agent Instructions

These instructions bind all coding agents working in this repository.

## Required reading

Before changing files, read:

1. `PRD.md`
2. `DECISIONS.md`
3. `STATUS.md`
4. the active milestone in `ROADMAP.md`

Read `ARCHITECTURE.md`, `SECURITY.md`, or `LANDING_PAGE.md` when the task
touches those areas.

## Work protocol

- Work only on the active milestone unless the user explicitly changes it.
- Treat `PRD.md` as the authoritative product specification.
- Preserve locked decisions in `DECISIONS.md`.
- Update `STATUS.md` before every commit.
- Append product-level decisions to `DECISIONS.md`.
- Update `HANDOFF.md` when setup, commands, blockers, or architecture change.
- Keep changes scoped; do not stage unrelated work.
- Run the smallest meaningful validation for every non-trivial change.

## Product invariants

- Public product surfaces are CLI, MCP, API/SDKs, and the web console.
- Native CI workflow templates are integrations, not another product surface.
- There is no installed source-control application.
- Source and sensitive runtime data remain local by default.
- Customer checks, not models, determine verification.
- Write-capable agent operations require dry-run and authorization.
- Enterprise has no public price and uses Book a Call.
- Cal.com uses `NEXT_PUBLIC_CAL_LINK`.
- Book a Call navigates directly to Cal.com; do not restore a nested iframe or
  scheduling modal.
- Public console authentication uses Supabase passwordless email and RLS.
- Never expose a Supabase service-role key to the browser.
- Treat the local agent as the only authority allowed to complete hosted
  simulation and migration jobs or create verified attestations.
- Preserve API-key scope separation: `agent`, `orchestrate`, `read`, and
  `write` are not interchangeable.
- A failed verification must restore modified files and must not create
  verified evidence.
- Billing state comes from a verified, idempotently processed Stripe webhook;
  UI selections are not payment confirmation.
- Public positioning addresses developers, teams, providers, and enterprises.
- Never invent customers, benchmarks, testimonials, certifications, or claims.

## Engineering constraints

- Reuse the Rust engine across CLI and local MCP.
- Prefer deterministic analysis and transforms before model-generated work.
- Extend established standards before inventing formats.
- Do not introduce microservices or a specialized graph database without
  measured need.
- Do not centralize source code to simplify hosted orchestration.
- Never commit credentials, API keys, tokens, private certificates, or secret
  environment files.

## Git protocol

- Commit and push completed work to `main` unless the user explicitly requests
  a branch or pull request.
- Feature branches and pull requests are exceptions, not the default.
- Use terse, intentional commits.

## Brand and public-release gate

- `ChangeTwin` is the preferred future name, but the current identity remains
  `Continuity` until `BRAND_GATE.md` says `Status: cleared`.
- Do not rename interfaces, repositories, packages, deployments, or domains
  before that gate.
- Never change this private repository to public.
- The future public repository must be created from the explicit allowlist in
  `scripts/export-open-core.sh` with fresh Git history.
