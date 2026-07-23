# Handoff

## Resume protocol

Read these files in order:

1. `AGENTS.md`
2. `PRD.md`
3. `DECISIONS.md`
4. `STATUS.md`
5. the active milestone in `ROADMAP.md`

Do not start a later milestone while the active milestone remains incomplete.

## Current state

The repository contains the documentation foundation only. No product code,
site project, hosted resources, billing account, or Cal.com event has been
created.

## Current blocker

GitHub CLI authentication for the configured account is invalid. Restore it
interactively:

```bash
gh auth login -h github.com
gh auth status
```

Do not store the resulting token in repository files, shell scripts, logs, or
documentation.

## Repository publication

Target:

```text
mihhhir08/continuity
private
main
```

Initial commit:

```text
Document Continuity product foundation
```

After the initial push, create these eight implementation issues:

1. Landing page and Cal.com integration.
2. Rust engine and CLI.
3. Local MCP server.
4. Change simulation demonstration.
5. Hosted API and console.
6. ChangeBench evaluation suite.
7. Provider Migration Capsules.
8. Private deployment and enterprise controls.

## Session closeout

Before ending any session:

1. update `STATUS.md`;
2. append product decisions to `DECISIONS.md`;
3. update this file when setup or commands change;
4. run relevant validation;
5. record failed checks and blockers truthfully;
6. commit only scoped work;
7. never commit credentials or generated secret files.

## Locked constraints

- No installed source-control application.
- Local execution and local MCP remain first-class.
- Enterprise shows no price and uses Book a Call.
- Cal.com uses `NEXT_PUBLIC_CAL_LINK`.
- No fabricated customers, benchmarks, certifications, or testimonials.
- No public source release until the open/private boundary and license are
  explicitly reviewed.
