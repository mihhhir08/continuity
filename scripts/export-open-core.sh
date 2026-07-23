#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
destination="${1:-}"

if [[ -z "$destination" ]]; then
  echo "usage: scripts/export-open-core.sh /absolute/new/destination" >&2
  exit 2
fi
if [[ "$destination" != /* || "$destination" == "/" || "$destination" == "$repo_root" || -e "$destination" ]]; then
  echo "destination must be a new, absolute path outside the private repository" >&2
  exit 2
fi
gate_status="$(awk '/^Status: / { print; exit }' "$repo_root/BRAND_GATE.md")"
if [[ "$gate_status" != "Status: cleared" ]]; then
  echo "brand gate is not cleared" >&2
  exit 3
fi
if [[ ! -d "$repo_root/crates/changetwin" ]]; then
  echo "clean ChangeTwin rename must complete before export" >&2
  exit 3
fi

allowlist=(
  Cargo.toml
  Cargo.lock
  crates/changetwin/Cargo.toml
  crates/changetwin/src/lib.rs
  crates/changetwin/src/main.rs
  crates/changetwin/src/mcp.rs
  fixtures/consumer-py/check.py
  fixtures/consumer-py/client.py
  fixtures/consumer-ts/check.mjs
  fixtures/consumer-ts/client.ts
  fixtures/openapi-change.json
  changebench/cases.json
  changebench/run.sh
  scripts/demo.sh
  deploy/policy.example.json
  open-core/.gitignore
  open-core/.github/dependabot.yml
  open-core/.github/workflows/verify.yml
  open-core/ARCHITECTURE.md
  open-core/CODE_OF_CONDUCT.md
  open-core/CONTRIBUTING.md
  open-core/LICENSE
  open-core/README.md
  open-core/SECURITY.md
)

for path in "${allowlist[@]}"; do
  if [[ ! -e "$repo_root/$path" ]]; then
    echo "missing allowlisted source: $path" >&2
    exit 4
  fi
  if [[ -L "$repo_root/$path" ]]; then
    echo "symlinks are not allowed in the public export: $path" >&2
    exit 4
  fi
done

source_roots=(Cargo.toml Cargo.lock crates/changetwin fixtures changebench scripts/demo.sh deploy/policy.example.json open-core)
expected="$(mktemp)"
actual="$(mktemp)"
trap 'rm -f "$expected" "$actual"' EXIT
printf '%s\n' "${allowlist[@]}" | sort > "$expected"
for path in "${source_roots[@]}"; do
  if [[ -d "$repo_root/$path" ]]; then
    find "$repo_root/$path" -type f
  else
    printf '%s\n' "$repo_root/$path"
  fi
done | sed "s#^$repo_root/##" | sort > "$actual"
unexpected="$(comm -13 "$expected" "$actual")"
if [[ -n "$unexpected" ]]; then
  printf 'unexpected public-source files:\n%s\n' "$unexpected" >&2
  exit 4
fi

mkdir -p "$destination"
for path in "${allowlist[@]}"; do
  public_path="$path"
  [[ "$path" == open-core/* ]] && public_path="${path#open-core/}"
  [[ "$path" == deploy/policy.example.json ]] && public_path="examples/policy.json"
  mkdir -p "$destination/$(dirname "$public_path")"
  cp "$repo_root/$path" "$destination/$public_path"
done

deny_names='^(PRD|BUSINESS|DECISIONS|STATUS|HANDOFF|LANDING_PAGE|LAUNCH_CHECKLIST|SOURCES|AGENTS)\.md$'
if find "$destination" -type f -exec basename {} \; | grep -Eq "$deny_names"; then
  echo "internal document reached the public export" >&2
  exit 5
fi
if grep -RIEq '(ghp_|github_pat_|art_v1_|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|appgprj_|chatgpt-team|mihhhir08|NEXT_PUBLIC_CAL_LINK|CONTINUITY_API_KEY|continuity-eight\.vercel\.app|\.chatgpt\.site)' "$destination"; then
  echo "credential-like or internal material reached the public export" >&2
  exit 5
fi
if grep -RIEq '(PRD\.md|BUSINESS\.md|DECISIONS\.md|HANDOFF\.md|LAUNCH_CHECKLIST\.md)' "$destination"; then
  echo "public files reference private documentation" >&2
  exit 5
fi

printf 'Open-core export ready at %s\n' "$destination"
