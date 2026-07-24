import { createClient } from "@supabase/supabase-js";
import { accountContext } from "../billing/_stripe";

const tools = [
  ["list_projects", "List organization projects and their hosted state", ["organization_id"]],
  ["list_change_risks", "List privacy-preserving simulation outcomes", ["organization_id"]],
  ["get_attestation", "Read one verified evidence attestation", ["organization_id", "attestation_id"]],
  ["queue_simulation", "Queue a local-only simulation for a project and change", ["organization_id", "project_id", "change_id"]],
  ["approve_migration", "Approve a reviewed simulation for local repair", ["organization_id", "simulation_id"]],
] as const;

function result(id: unknown, value: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result: value });
}

function error(id: unknown, code: number, message: string, status = 400) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return error(null, -32000, "Remote MCP is not configured.", 503);
  try {
    const rpc = await request.json();
    if (rpc.method === "initialize") {
      return result(rpc.id, { protocolVersion: "2025-06-18", capabilities: { resources: {}, tools: {} }, serverInfo: { name: "continuity-remote", version: "0.1.0" } });
    }
    if (rpc.method === "tools/list") {
      return result(rpc.id, { tools: tools.map(([name, description, required]) => ({ name, description, inputSchema: { type: "object", required, properties: Object.fromEntries(required.map((field) => [field, { type: "string" }])) } })) });
    }
    if (rpc.method === "resources/list") {
      return result(rpc.id, { resources: [
        { uri: "continuity://projects/current", name: "Organization projects" },
        { uri: "continuity://projects/current/graph", name: "Compatibility Graph" },
      ] });
    }
    const args = rpc.params?.arguments ?? rpc.params ?? {};
    const organizationId = args.organization_id;
    const account = await accountContext(request, organizationId);
    if (!account) return error(rpc.id, -32001, "Unauthorized.", 401);
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
    const client = createClient(url, key, { global: { headers: { authorization: `Bearer ${token}` } }, auth: { persistSession: false } });

    if (rpc.method === "resources/read") {
      const { data, error: queryError } = await client.from("records").select("id,kind,state,body,updated_at").eq("organization_id", organizationId).in("kind", ["projects", "simulations", "migrations"]).order("updated_at", { ascending: false }).limit(100);
      if (queryError) return error(rpc.id, -32002, queryError.message);
      return result(rpc.id, { contents: [{ uri: rpc.params.uri, mimeType: "application/json", text: JSON.stringify(data) }] });
    }
    if (rpc.method !== "tools/call") return error(rpc.id, -32601, "Method not found.", 404);

    let value: unknown;
    const name = rpc.params?.name;
    if (name === "list_projects") {
      const { data, error: queryError } = await client.from("records").select("id,state,body,updated_at").eq("organization_id", organizationId).eq("kind", "projects");
      if (queryError) return error(rpc.id, -32002, queryError.message);
      value = data;
    } else if (name === "list_change_risks") {
      const { data, error: queryError } = await client.from("records").select("id,state,body,updated_at").eq("organization_id", organizationId).eq("kind", "simulations").order("updated_at", { ascending: false });
      if (queryError) return error(rpc.id, -32002, queryError.message);
      value = data;
    } else if (name === "get_attestation") {
      const { data, error: queryError } = await client.from("records").select("id,state,body,updated_at").eq("organization_id", organizationId).eq("kind", "attestations").eq("id", args.attestation_id).single();
      if (queryError) return error(rpc.id, -32002, queryError.message);
      value = data;
    } else if (name === "queue_simulation") {
      const { data, error: queryError } = await client.rpc("queue_simulation", { target_project: args.project_id, target_change: args.change_id });
      if (queryError) return error(rpc.id, -32002, queryError.message);
      value = data;
    } else if (name === "approve_migration") {
      const { data, error: queryError } = await client.rpc("approve_migration", { target_simulation: args.simulation_id });
      if (queryError) return error(rpc.id, -32002, queryError.message);
      value = data;
    } else {
      return error(rpc.id, -32602, "Unknown tool.");
    }
    return result(rpc.id, { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError: false });
  } catch {
    return error(null, -32700, "Invalid request.");
  }
}
