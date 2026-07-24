#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?set DATABASE_URL to a disposable PostgreSQL database}"

api_url="${CONTINUITY_API_URL:-http://127.0.0.1:8080}"
organization="${CONTINUITY_ORGANIZATION:-00000000-0000-4000-8000-000000000001}"
api_key="${CONTINUITY_API_KEY:-continuity-hosted-demo-key}"
api_hash="$(node -e 'process.stdout.write(require("node:crypto").createHash("sha256").update(process.argv[1]).digest("hex"))' "$api_key")"
demo_root="$(mktemp -d)"
api_log="$demo_root/control-plane.log"

cleanup() {
  if [[ -n "${api_pid:-}" ]]; then kill "$api_pid" 2>/dev/null || true; fi
  rm -rf "$demo_root"
}
trap cleanup EXIT

node platform/src/apply-schema.mjs
NODE_ENV=production DATABASE_URL="$DATABASE_URL" CONTINUITY_API_KEY_SHA256="$api_hash" \
  node platform/src/server.mjs >"$api_log" 2>&1 &
api_pid=$!

for _ in {1..30}; do
  curl --fail --silent "$api_url/healthz" >/dev/null && break
  sleep 1
done
curl --fail --silent "$api_url/healthz" >/dev/null

request() {
  curl --fail --silent \
    -H "authorization: Bearer $api_key" \
    -H "x-continuity-organization: $organization" \
    -H "content-type: application/json" \
    "$@"
}

project_json="$(request -H "idempotency-key: demo-project" -d '{"name":"Hosted demo"}' "$api_url/v1/projects")"
project_id="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).data.id))' <<<"$project_json")"
change='{"id":"payments-api-v2","from":"/v1/jobs","to":"/v2/runs","description":"Rename endpoint"}'

request -H "idempotency-key: demo-simulation" \
  -d "{\"project_id\":\"$project_id\",\"change\":$change}" "$api_url/v1/simulations" >/dev/null

cp -R fixtures/consumer-ts "$demo_root/project"
cargo build --quiet -p continuity
CONTINUITY_API_URL="$api_url" CONTINUITY_ORGANIZATION="$organization" CONTINUITY_API_KEY="$api_key" \
  target/debug/continuity --root "$demo_root/project" agent run-once --project "$project_id" >/dev/null

request -H "idempotency-key: demo-migration" \
  -d "{\"project_id\":\"$project_id\",\"change\":$change,\"authorized\":true,\"dry_run_reviewed\":true}" \
  "$api_url/v1/migrations" >/dev/null
CONTINUITY_API_URL="$api_url" CONTINUITY_ORGANIZATION="$organization" CONTINUITY_API_KEY="$api_key" \
  target/debug/continuity --root "$demo_root/project" agent run-once --project "$project_id" >/dev/null

result="$(request "$api_url/v1/migrations")"
node -e '
  let s="";
  process.stdin.on("data",d=>s+=d).on("end",()=>{
    const rows=JSON.parse(s).data;
    if(rows[0]?.state!=="verified" || !rows[0]?.body?.result?.attestation?.signature) process.exit(1);
    console.log("Hosted simulation → approved repair → verification → attestation passed");
  });
' <<<"$result"
