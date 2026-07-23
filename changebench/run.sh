#!/usr/bin/env bash
set -euo pipefail
cargo test --workspace --locked
bash scripts/demo.sh
printf '%s\n' "ChangeBench implemented cases passed; no comparative score is claimed."
