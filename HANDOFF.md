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

The private repository is published at
`https://github.com/mihhhir08/continuity`. The documentation foundation and all
eight implementation issues are present. The marketing site lives in `web/`,
has a successful production build, and has an owner-only Sites project.
No Cal.com event, billing account, or production identity provider has been
configured.

## Current blocker

None. GitHub CLI authentication is active for `mihhhir08`. Never copy its token
into repository files, shell scripts, logs, or documentation.

## Web application

The site is in `web/`. Use:

```bash
cd web
npm ci
npm run dev
npm run build
```

`web/.openai/hosting.json` contains the Sites project ID. Never create a second
Sites project for this application. `NEXT_PUBLIC_CAL_LINK` is documented in
`web/.env.example` and must be configured before scheduling is enabled.

## Local engine

The Rust engine, CLI, and MCP server live in `crates/continuity/`.

```bash
cargo test --workspace
bash scripts/demo.sh
cargo run -p continuity -- --help
cargo run -p continuity -- mcp serve
```

The demonstration copies fixtures to a temporary directory, so it never
modifies tracked examples. Private signing keys and generated attestations are
ignored by Git.

## Hosted control plane

The PostgreSQL-backed API is in `platform/`; customer-controlled deployment is
in `deploy/`.

```bash
cd platform
npm ci
npm test
docker compose -f ../deploy/docker-compose.yml up --build
```

Required production values are documented in `platform/.env.example` and the
Compose file. Never commit them. Remaining external setup: Cal.com, billing
products, production identity, managed data services, signing identity,
domain/DNS, and design-partner access.

Founder actions and the Vercel diagnosis are in `LAUNCH_CHECKLIST.md`.

ChangeBench currently claims only the implemented endpoint-rename case:

```bash
bash changebench/run.sh
```

Cases marked `specified` in `changebench/cases.json` are not benchmark results.

## Repository publication

Target:

```text
mihhhir08/continuity
private
main
```

Initial commit:

```text
4a7d76f Document Continuity product foundation
```

Created implementation issues:

1. `#1` Landing page and Cal.com integration.
2. `#2` Rust engine and CLI.
3. `#3` Local MCP server.
4. `#4` Change simulation demonstration.
5. `#5` Hosted API and console.
6. `#6` ChangeBench evaluation suite.
7. `#7` Provider Migration Capsules.
8. `#8` Private deployment and enterprise controls.

## Session closeout

Before ending any session:

1. update `STATUS.md`;
2. append product decisions to `DECISIONS.md`;
3. update this file when setup or commands change;
4. run relevant validation;
5. record failed checks and blockers truthfully;
6. commit only scoped work;
7. never commit credentials or generated secret files.
8. commit and push completed work to `main` unless the user explicitly requests
   a branch or pull request.

## Locked constraints

- No installed source-control application.
- Local execution and local MCP remain first-class.
- Enterprise shows no price and uses Book a Call.
- Cal.com uses `NEXT_PUBLIC_CAL_LINK`.
- No fabricated customers, benchmarks, certifications, or testimonials.
- No public source release until the open/private boundary and license are
  explicitly reviewed.
- Do not perform the ChangeTwin rename until every checkbox in
  `BRAND_GATE.md` is complete and its status is `cleared`.
- Never make the private monorepo public; create the public repository from the
  allowlist exporter with fresh history.
