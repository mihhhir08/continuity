# Contributing

Before proposing a change:

1. run `cargo fmt --check`;
2. run `cargo clippy --workspace --all-targets -- -D warnings`;
3. run `cargo test --workspace --locked`;
4. run `bash scripts/demo.sh`;
5. avoid credentials, customer data, unsupported claims, and generated keys.

Security reports belong in private vulnerability reporting, not public issues.
Changes to CLI, MCP, capsule, or evidence behavior must include a compatibility
note and a focused test.
