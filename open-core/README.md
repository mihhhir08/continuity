<div align="center">
  <h1>ChangeTwin</h1>
  <p><strong>Software that survives change.</strong></p>
  <p>Local-first change simulation, deterministic repair, customer-owned verification, and portable evidence.</p>
</div>

## What this repository contains

- Rust engine and CLI
- Local STDIO MCP server
- TypeScript and Python migration fixtures
- Public ChangeBench cases
- Signed, offline-verifiable evidence
- Open policy and evidence examples

The hosted compatibility network, commercial control plane, web console, and
enterprise deployment tooling are not part of this repository.

## Demonstration

```bash
./scripts/demo.sh
```

The script works in isolated temporary fixtures. Repair is dry-run-first and
requires explicit authorization before files are changed.

## CLI

```bash
changetwin init
changetwin scan
changetwin simulate --change proposed-change.json
changetwin repair --change proposed-change.json
changetwin repair --change proposed-change.json --apply --approve
changetwin verify
changetwin export --change proposed-change.json
changetwin mcp serve
```

## Trust boundary

- Source stays local by default.
- Deterministic transformations run before optional model assistance.
- Agent writes require reviewed dry runs and authorization.
- Customer builds and tests determine verification.
- Invalid, failed, partial, and unknown states never become verified.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
