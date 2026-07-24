import { createServer } from "node:http";
import pg from "pg";
import { hashToken, hashesEqual } from "./auth.mjs";

const kinds = new Set(["projects","continuity-boms","change-sets","simulations","migrations","capsules","attestations","events","policies"]);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 8080);

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
async function keyValid(req, organization) {
  const expected = process.env.CONTINUITY_API_KEY_SHA256;
  const token = req.headers.authorization?.replace(/^Bearer /, "") || "";
  if (!token) return !expected && process.env.NODE_ENV !== "production";
  const actual = hashToken(token);
  if (expected && hashesEqual(actual, expected)) return true;
  const result = await pool.query(
    "SELECT id FROM api_keys WHERE organization_id::text=$1 AND key_hash=$2 AND revoked_at IS NULL LIMIT 1",
    [organization, actual],
  );
  if (!result.rowCount) return false;
  await pool.query("UPDATE api_keys SET last_used_at=now() WHERE id=$1", [result.rows[0].id]);
  return true;
}
async function body(req) {
  let value = "";
  for await (const chunk of req) {
    value += chunk;
    if (value.length > 1_000_000) throw new Error("body too large");
  }
  return value ? JSON.parse(value) : {};
}

export const server = createServer(async (req, res) => {
  try {
    if (req.url === "/healthz") return json(res, 200, { status: "ok" });
    const match = new URL(req.url, "http://localhost").pathname.match(/^\/v1\/([^/]+)(?:\/([^/]+))?$/);
    if (!match || !kinds.has(match[1])) return json(res, 404, { error: "not_found" });
    const [kind, id] = [match[1], match[2]];
    const organization = req.headers["x-continuity-organization"];
    if (typeof organization !== "string" || !organization) return json(res, 400, { error: "organization_required" });
    if (!(await keyValid(req, organization))) return json(res, 401, { error: "unauthorized" });

    if (req.method === "GET") {
      const result = id
        ? await pool.query("SELECT * FROM records WHERE organization_id=$1 AND kind=$2 AND id=$3", [organization, kind, id])
        : await pool.query("SELECT * FROM records WHERE organization_id=$1 AND kind=$2 ORDER BY created_at DESC LIMIT 100", [organization, kind]);
      return json(res, id && !result.rowCount ? 404 : 200, id ? result.rows[0] ?? { error: "not_found" } : { data: result.rows });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    const idem = req.headers["idempotency-key"];
    if (typeof idem !== "string" || !idem) return json(res, 400, { error: "idempotency_key_required" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const previous = await client.query("SELECT status,response FROM idempotency_keys WHERE organization_id=$1 AND key=$2 FOR UPDATE", [organization, idem]);
      if (previous.rowCount) { await client.query("COMMIT"); return json(res, previous.rows[0].status, previous.rows[0].response); }
      const payload = await body(req);
      const state = kind === "simulations" || kind === "migrations" ? "queued" : "created";
      const created = await client.query("INSERT INTO records(organization_id,kind,state,body) VALUES($1,$2,$3,$4) RETURNING *", [organization, kind, state, payload]);
      if (state === "queued") await client.query("INSERT INTO durable_jobs(organization_id,kind,state,input) VALUES($1,$2,'queued',$3)", [organization, kind, payload]);
      await client.query("INSERT INTO usage_events(organization_id,metric,quantity,record_id) VALUES($1,$2,1,$3)", [organization, `${kind}.created`, created.rows[0].id]);
      const response = { data: created.rows[0] };
      await client.query("INSERT INTO idempotency_keys(organization_id,key,status,response) VALUES($1,$2,201,$3)", [organization, idem, response]);
      await client.query("COMMIT");
      return json(res, 201, response);
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "internal_error" });
  }
});

if (process.env.NODE_ENV !== "test") server.listen(port, () => console.log(`continuity control plane :${port}`));
