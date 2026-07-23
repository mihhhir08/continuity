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

- Initial documentation foundation is committed to `main`.
- Later work uses `codex/<milestone>` branches.
- Use terse, intentional commits.
- Draft pull requests are the default for implementation milestones.
