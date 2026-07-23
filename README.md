# Continuity

> Software that survives change.

Continuity is agent-native infrastructure that predicts what software changes
will break, repairs affected systems inside their own security boundaries, and
produces verifiable evidence before release.

The product is designed around four public surfaces:

- a local-first CLI;
- local and remote MCP servers;
- a REST API and SDKs;
- a collaborative web console.

Repository automation is provided through native CI workflows. Continuity does
not require an installed source-control application, and source code remains
local by default.

## Current status

Milestone 1, the repository foundation, is in progress. This repository
currently contains the authoritative requirements and implementation plan.
Product code begins only after the documentation foundation is reviewed and
committed.

## Start here

1. Read [PRD.md](PRD.md) for the authoritative product requirements.
2. Read [DECISIONS.md](DECISIONS.md) for locked decisions.
3. Read [STATUS.md](STATUS.md) for the current milestone and next task.
4. Read [ROADMAP.md](ROADMAP.md) for delivery order and acceptance criteria.
5. Read [HANDOFF.md](HANDOFF.md) before continuing work in a new session.

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Business model](BUSINESS.md)
- [Landing page](LANDING_PAGE.md)
- [Security](SECURITY.md)
- [Sources](SOURCES.md)
- [Agent instructions](AGENTS.md)

## Working name

Continuity is a replaceable working name. Renaming must preserve stable aliases
for any published CLI commands, packages, APIs, MCP resources, or evidence
formats.
