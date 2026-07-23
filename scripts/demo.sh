#!/usr/bin/env bash
set -euo pipefail

cargo build --quiet -p continuity
demo_root="$(mktemp -d)"
trap 'rm -rf "$demo_root"' EXIT
cp -R fixtures/consumer-ts fixtures/consumer-py "$demo_root/"

for name in consumer-ts consumer-py; do
  project="$demo_root/$name"
  target/debug/continuity --root "$project" simulate --change fixtures/openapi-change.json
  target/debug/continuity --root "$project" repair --change fixtures/openapi-change.json
  target/debug/continuity --root "$project" repair --change fixtures/openapi-change.json --apply --approve
  target/debug/continuity --root "$project" export --change fixtures/openapi-change.json
  target/debug/continuity attestation-verify "$project/.continuity/attestation.json"
done
