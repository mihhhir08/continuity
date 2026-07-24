import { createServer } from "node:http";
import pg from "pg";
import { verifyAttestation } from "./attestation.mjs";
import { hashToken, hashesEqual } from "./auth.mjs";
import { verifyCapsule } from "./capsule.mjs";
import { completionAllowed, safeRecordState } from "./workflow.mjs";

const kinds = new Set(["projects","continuity-boms","change-sets","simulations","migrations","capsules","attestations","events","policies"]);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 8080);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
async function authenticate(req, organization) {
  const expected = process.env.CONTINUITY_API_KEY_SHA256;
  const token = req.headers.authorization?.replace(/^Bearer /, "") || "";
  if (!token) return !expected && process.env.NODE_ENV !== "production" ? { scopes: new Set(["*"]), projectId: null } : null;
  const actual = hashToken(token);
  if (expected && hashesEqual(actual, expected)) {
    await pool.query(
      "INSERT INTO organizations(id,name,slug,plan) VALUES($1::uuid,$2,$3,'enterprise') ON CONFLICT (id) DO NOTHING",
      [organization, process.env.CONTINUITY_ORGANIZATION_NAME || "Self-hosted organization", `self-hosted-${organization}`],
    );
    return { scopes: new Set(["*"]), projectId: null };
  }
  const result = await pool.query(
    "SELECT id,scopes,project_id FROM api_keys WHERE organization_id::text=$1 AND key_hash=$2 AND revoked_at IS NULL LIMIT 1",
    [organization, actual],
  );
  if (!result.rowCount) return null;
  await pool.query("UPDATE api_keys SET last_used_at=now() WHERE id=$1", [result.rows[0].id]);
  return { scopes: new Set(result.rows[0].scopes), projectId: result.rows[0].project_id };
}
const can = (scopes, scope) => scopes.has("*") || scopes.has(scope);
const projectAllowed = (auth, projectId) => !auth.projectId || auth.projectId === projectId;
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
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/healthz") return json(res, 200, { status: "ok" });
    const match = pathname.match(/^\/v1\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (!match || !kinds.has(match[1])) return json(res, 404, { error: "not_found" });
    const [kind, id, action] = [match[1], match[2], match[3]];
    const organization = req.headers["x-continuity-organization"];
    if (typeof organization !== "string" || !uuidPattern.test(organization)) return json(res, 400, { error: "valid_organization_required" });
    const auth = await authenticate(req, organization);
    if (!auth) return json(res, 401, { error: "unauthorized" });
    const scopes = auth.scopes;

    if (kind === "events" && id === "claim" && req.method === "POST") {
      if (!can(scopes, "agent")) return json(res, 403, { error: "agent_scope_required" });
      const payload = await body(req);
      if (typeof payload.project_id !== "string") return json(res, 400, { error: "project_id_required" });
      if (!projectAllowed(auth, payload.project_id)) return json(res, 403, { error: "project_scope_required" });
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const claimed = await client.query(
          `SELECT * FROM durable_jobs
           WHERE organization_id=$1 AND project_id=$2
             AND available_at <= now()
             AND (state='queued' OR (state='running' AND lease_until < now()))
           ORDER BY created_at
           FOR UPDATE SKIP LOCKED LIMIT 1`,
          [organization, payload.project_id],
        );
        if (!claimed.rowCount) {
          await client.query("COMMIT");
          return json(res, 200, { data: null });
        }
        const job = (await client.query(
          "UPDATE durable_jobs SET state='running',attempt=attempt+1,lease_until=now()+interval '10 minutes',updated_at=now() WHERE id=$1 RETURNING *",
          [claimed.rows[0].id],
        )).rows[0];
        await client.query("UPDATE records SET state='running',updated_at=now() WHERE id=$1", [job.record_id]);
        await client.query("COMMIT");
        return json(res, 200, { data: job });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (kind === "events" && id && action === "heartbeat" && req.method === "POST") {
      if (!can(scopes, "agent")) return json(res, 403, { error: "agent_scope_required" });
      const result = await pool.query(
        "UPDATE durable_jobs SET lease_until=now()+interval '10 minutes',updated_at=now() WHERE id=$1 AND organization_id=$2 AND state='running' AND ($3::uuid IS NULL OR project_id=$3) RETURNING id",
        [id, organization, auth.projectId],
      );
      return json(res, result.rowCount ? 200 : 409, result.rowCount ? { data: result.rows[0] } : { error: "job_not_running" });
    }

    if (kind === "events" && id && action === "complete" && req.method === "POST") {
      if (!can(scopes, "agent")) return json(res, 403, { error: "agent_scope_required" });
      const payload = await body(req);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const current = await client.query(
          "SELECT * FROM durable_jobs WHERE id=$1 AND organization_id=$2 FOR UPDATE",
          [id, organization],
        );
        if (!current.rowCount) {
          await client.query("ROLLBACK");
          return json(res, 404, { error: "job_not_found" });
        }
        const job = current.rows[0];
        if (!projectAllowed(auth, job.project_id)) {
          await client.query("ROLLBACK");
          return json(res, 403, { error: "project_scope_required" });
        }
        if (!completionAllowed(job.kind, payload.state)) {
          await client.query("ROLLBACK");
          return json(res, 409, { error: "invalid_job_completion" });
        }
        if (job.kind === "migrations" && payload.state === "verified" && !(await verifyAttestation(payload.output?.attestation))) {
          await client.query("ROLLBACK");
          return json(res, 409, { error: "invalid_attestation" });
        }
        const completed = (await client.query(
          "UPDATE durable_jobs SET state=$1,output=$2,lease_until=NULL,updated_at=now() WHERE id=$3 RETURNING *",
          [payload.state, payload.output ?? {}, id],
        )).rows[0];
        await client.query(
          "UPDATE records SET state=$1,body=body || jsonb_build_object('result',$2::jsonb),updated_at=now() WHERE id=$3",
          [payload.state, JSON.stringify(payload.output ?? {}), job.record_id],
        );
        await client.query(
          "INSERT INTO usage_events(organization_id,metric,quantity,record_id) VALUES($1,$2,1,$3)",
          [organization, `${job.kind}.${payload.state}`, job.record_id],
        );
        if (job.kind === "migrations" && payload.state === "verified" && payload.output?.attestation) {
          await client.query(
            "INSERT INTO records(organization_id,kind,state,body) VALUES($1,'attestations','verified',$2)",
            [organization, payload.output.attestation],
          );
        }
        await client.query("COMMIT");
        return json(res, 200, { data: completed });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (kind === "events" && id === "stream" && req.method === "GET") {
      if (!can(scopes, "read")) return json(res, 403, { error: "read_scope_required" });
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      });
      let cursor = new Date().toISOString();
      res.write(`event: ready\ndata: ${JSON.stringify({ cursor })}\n\n`);
      const timer = setInterval(async () => {
        try {
          const result = await pool.query(
            "SELECT id,kind,state,updated_at FROM records WHERE organization_id=$1 AND updated_at>$2 ORDER BY updated_at LIMIT 100",
            [organization, cursor],
          );
          for (const row of result.rows) {
            cursor = row.updated_at.toISOString();
            res.write(`event: record\ndata: ${JSON.stringify(row)}\n\n`);
          }
          res.write(": keepalive\n\n");
        } catch {
          res.end();
        }
      }, 2_000);
      req.on("close", () => clearInterval(timer));
      return;
    }

    if (req.method === "GET") {
      if (!can(scopes, "read")) return json(res, 403, { error: "read_scope_required" });
      const result = id
        ? await pool.query("SELECT * FROM records WHERE organization_id=$1 AND kind=$2 AND id=$3", [organization, kind, id])
        : await pool.query("SELECT * FROM records WHERE organization_id=$1 AND kind=$2 ORDER BY created_at DESC LIMIT 100", [organization, kind]);
      return json(res, id && !result.rowCount ? 404 : 200, id ? result.rows[0] ?? { error: "not_found" } : { data: result.rows });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (kind === "attestations") return json(res, 405, { error: "attestations_are_agent_generated" });
    if (kind === "simulations" || kind === "migrations") {
      if (!can(scopes, "orchestrate")) return json(res, 403, { error: "orchestrate_scope_required" });
    } else if (!can(scopes, "write")) return json(res, 403, { error: "write_scope_required" });
    const idem = req.headers["idempotency-key"];
    if (typeof idem !== "string" || !idem) return json(res, 400, { error: "idempotency_key_required" });
    if (id || action) return json(res, 404, { error: "not_found" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const previous = await client.query("SELECT status,response FROM idempotency_keys WHERE organization_id=$1 AND key=$2 FOR UPDATE", [organization, idem]);
      if (previous.rowCount) { await client.query("COMMIT"); return json(res, previous.rows[0].status, previous.rows[0].response); }
      const payload = await body(req);
      if (kind === "capsules" && !(await verifyCapsule(payload))) {
        await client.query("ROLLBACK");
        return json(res, 400, { error: "invalid_or_expired_capsule" });
      }
      const quota = await client.query("SELECT within_plan_limit($1,$2) AS allowed", [organization, kind]);
      if (!quota.rows[0]?.allowed) {
        await client.query("ROLLBACK");
        return json(res, 402, { error: "plan_limit_reached" });
      }
      const state = safeRecordState(kind, payload.state);
      const created = await client.query("INSERT INTO records(organization_id,kind,state,body) VALUES($1,$2,$3,$4) RETURNING *", [organization, kind, state, payload]);
      if (state === "queued") {
        if (typeof payload.project_id !== "string") {
          await client.query("ROLLBACK");
          return json(res, 400, { error: "project_id_required" });
        }
        await client.query(
          "INSERT INTO durable_jobs(organization_id,project_id,record_id,kind,state,input) VALUES($1,$2,$3,$4,'queued',$5)",
          [organization, payload.project_id, created.rows[0].id, kind, payload],
        );
      }
      await client.query("INSERT INTO usage_events(organization_id,metric,quantity,record_id) VALUES($1,$2,1,$3)", [organization, `${kind}.created`, created.rows[0].id]);
      const response = { data: created.rows[0] };
      await client.query("INSERT INTO idempotency_keys(organization_id,key,status,response) VALUES($1,$2,201,$3)", [organization, idem, response]);
      await client.query("COMMIT");
      return json(res, 201, response);
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) return json(res, 400, { error: "invalid_json" });
    json(res, error.message === "body too large" ? 413 : 500, { error: error.message === "body too large" ? "body_too_large" : "internal_error" });
  }
});

if (process.env.NODE_ENV !== "test") server.listen(port, () => console.log(`continuity control plane :${port}`));
