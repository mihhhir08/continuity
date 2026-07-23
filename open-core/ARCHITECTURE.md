# Public Architecture

ChangeTwin's open core runs inside the consumer-controlled environment:

```text
proposed change or signed capsule
                │
                ▼
scan → simulate → repair preview → authorized apply → customer checks
                                                           │
                                                           ▼
                                              signed attestation
```

The Rust library is shared by the CLI and local STDIO MCP server. Neither
interface reimplements analysis, repair, verification, or evidence logic.

## Boundaries

- Source, secrets, and sensitive runtime data remain local by default.
- Models may propose a repair but cannot declare it verified.
- Customer-owned checks are authoritative.
- Evidence can be verified without hosted connectivity.
- Hosted coordination is optional for the local workflow.

## Initial scope

- TypeScript and Python consumers
- OpenAPI endpoint changes
- Git repositories
- CLI, MCP, and native CI execution

The public API and format surfaces evolve through versioned releases.
