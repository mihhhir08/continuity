"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { brand } from "../brand";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
  plan: string;
  subscription_status: string;
  stripe_customer_id: string | null;
};
type ProductRecord = {
  id: string;
  kind: string;
  state: string;
  body: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
type ApiKey = { id: string; name: string; prefix: string; scopes: string[]; project_id: string | null; created_at: string; last_used_at: string | null };
type UsageEvent = { id: number; metric: string; quantity: number; created_at: string };
type Member = { user_id: string; role: string; created_at: string };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;
const configured = Boolean(supabaseUrl && supabasePublishableKey);
const installCommand = "cargo build --release -p continuity";
const initCommand =
  "./target/release/continuity init && ./target/release/continuity scan";

function ConsoleBrand() {
  return <Link className="console-brand" href="/"><span>{brand.mark}</span><strong>{brand.name}</strong><small>Console</small></Link>;
}

function copy(value: string, done: () => void) {
  navigator.clipboard.writeText(value).then(done).catch(() => undefined);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function newApiToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const encoded = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `ct_live_${encoded}`;
}

function ConsoleFrame({ children, user, onSignOut }: { children: React.ReactNode; user?: User | null; onSignOut?: () => void }) {
  return (
    <main className="console">
      <aside className="console-sidebar">
        <ConsoleBrand />
        <nav aria-label="Console navigation">
          <a className="active" href="#overview"><span>⌁</span> Overview</a>
          <a href="#projects"><span>◇</span> Projects</a>
          <a href="#changes"><span>⇄</span> Changes</a>
          <a href="#simulations"><span>◎</span> Simulations</a>
          <a href="#migrations"><span>↗</span> Migrations</a>
          <a href="#policies"><span>◈</span> Policies</a>
          <a href="#evidence"><span>✓</span> Evidence</a>
          <a href="#team"><span>♢</span> Team</a>
          <a href="#api-keys"><span>⌘</span> API keys</a>
          <a href="#billing"><span>◫</span> Usage & billing</a>
        </nav>
        <div className="console-side-bottom">
          <Link href="/docs">Documentation ↗</Link>
          <Link href="/mcp">MCP setup ↗</Link>
          {user && <button type="button" onClick={onSignOut}>Sign out</button>}
        </div>
      </aside>
      <div className="console-main">
        <header className="console-topbar">
          <span><i /> Local engine available</span>
          <div>{user?.email ?? "Developer preview"}</div>
        </header>
        {children}
      </div>
    </main>
  );
}

function SetupPreview() {
  const [copied, setCopied] = useState("");
  return (
    <ConsoleFrame>
      <div className="console-content">
        <section className="console-welcome">
          <span className="console-kicker">Developer console</span>
          <h1>Start with the engine.<br />Connect the network when ready.</h1>
          <p>The local workflow works now. Account-backed projects, API keys, and usage become active after the production database variables are configured.</p>
          <div className="console-actions"><Link className="button primary" href="/docs#get-started">Run locally</Link><Link className="button" href="/">Back to website</Link></div>
        </section>
        <section className="console-setup-grid">
          <article className="setup-command">
            <span>01 · BUILD</span><h2>Run the local engine.</h2>
            <p>From a checked-out Continuity source tree:</p>
            <pre><code>$ {installCommand}</code></pre>
            <button onClick={() => copy(installCommand, () => setCopied("install"))}>{copied === "install" ? "Copied ✓" : "Copy command"}</button>
            <pre><code>$ {initCommand}</code></pre>
            <button onClick={() => copy(initCommand, () => setCopied("init"))}>{copied === "init" ? "Copied ✓" : "Copy command"}</button>
          </article>
          <article className="setup-status">
            <span>02 · HOSTED ACCESS</span><h2>Account infrastructure is not connected.</h2>
            <p>This is an honest setup state—not a fake signup. Add the two public Supabase values after running the included SQL migration.</p>
            <ul><li><i className="done" /> Marketing and console UI</li><li><i className="done" /> Local CLI and MCP</li><li><i /> Supabase URL and publishable key</li><li><i /> Production control-plane URL</li></ul>
          </article>
        </section>
      </div>
    </ConsoleFrame>
  );
}

function SignIn({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/console` } });
    setMessage(error ? error.message : "Check your email for a secure sign-in link.");
    setBusy(false);
  };
  return (
    <ConsoleFrame>
      <div className="console-auth">
        <div className="auth-copy"><span className="console-kicker">Developer console</span><h1>Build change-resistant software.</h1><p>Create projects, issue scoped API keys, coordinate simulations, and keep verification evidence in one place.</p><div className="auth-graphic"><i /><i /><i /><strong>verified</strong></div></div>
        <form onSubmit={submit}>
          <span className="console-kicker">Passwordless access</span><h2>Sign in or create an account.</h2><p>We’ll email you a secure magic link. No password required.</p>
          <label htmlFor="console-email">Work email</label><input id="console-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
          <button className="button primary" disabled={busy}>{busy ? "Sending…" : "Continue with email"}</button>
          {message && <output className="auth-message">{message}</output>}
          <small>By continuing, you agree to receive an authentication email. Local CLI use does not require an account.</small>
        </form>
      </div>
    </ConsoleFrame>
  );
}

function CreateWorkspace({ client, onCreated }: { client: SupabaseClient; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const slug = slugify(name);
    if (slug.length < 3) return setMessage("Use at least three letters or numbers.");
    const { error } = await client.rpc("create_organization", { org_name: name.trim(), org_slug: slug });
    if (error) return setMessage(error.message);
    onCreated();
  };
  return (
    <ConsoleFrame>
      <div className="workspace-create"><span className="console-kicker">Step 1 of 3</span><h1>Create your workspace.</h1><p>A workspace contains projects, team access, scoped keys, policies, usage, and evidence.</p><form onSubmit={submit}><label htmlFor="workspace-name">Workspace name</label><input id="workspace-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Engineering" /><button className="button primary">Create workspace</button>{message && <output>{message}</output>}</form></div>
    </ConsoleFrame>
  );
}

function Dashboard({ client, user, selectedPlan }: { client: SupabaseClient; user: User; selectedPlan: string }) {
  const [workspace, setWorkspace] = useState<Workspace | null | undefined>(undefined);
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<UsageEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newKey, setNewKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [changeName, setChangeName] = useState("");
  const [changeFrom, setChangeFrom] = useState("");
  const [changeTo, setChangeTo] = useState("");
  const [capsuleProvider, setCapsuleProvider] = useState("");
  const [capsuleArtifact, setCapsuleArtifact] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const { data: membership, error } = await client.from("organization_members").select("organization_id,role").eq("user_id", user.id).limit(1).maybeSingle();
    if (error) { setMessage(error.message); setWorkspace(null); return; }
    if (!membership) { setWorkspace(null); return; }
    const [{ data: organization }, { data: recordRows }, { data: keyRows }, { data: usageRows }, { data: memberRows }] = await Promise.all([
      client.from("organizations").select("id,name,slug,plan,subscription_status,stripe_customer_id").eq("id", membership.organization_id).single(),
      client.from("records").select("id,kind,state,body,created_at,updated_at").eq("organization_id", membership.organization_id).order("created_at", { ascending: false }),
      client.from("api_keys").select("id,name,prefix,scopes,project_id,created_at,last_used_at").eq("organization_id", membership.organization_id).is("revoked_at", null).order("created_at", { ascending: false }),
      client.from("usage_events").select("id,metric,quantity,created_at").eq("organization_id", membership.organization_id).order("created_at", { ascending: false }).limit(100),
      client.from("organization_members").select("user_id,role,created_at").eq("organization_id", membership.organization_id).order("created_at"),
    ]);
    if (organization) setWorkspace({ ...organization, role: membership.role });
    const loaded = (recordRows as ProductRecord[]) ?? [];
    setRecords(loaded);
    setSelectedProject((current) => current || loaded.find((record) => record.kind === "projects")?.id || "");
    setKeys((keyRows as ApiKey[]) ?? []);
    setUsage((usageRows as UsageEvent[]) ?? []);
    setMembers((memberRows as Member[]) ?? []);
  }, [client, user.id]);

  useEffect(() => {
    // Loading tenant state is the external synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = window.setInterval(() => void load(), 5_000);
    return () => window.clearInterval(timer);
  }, [load]);
  if (workspace === undefined) return <ConsoleFrame user={user}><div className="console-loading">Loading your workspace…</div></ConsoleFrame>;
  if (!workspace) return <CreateWorkspace client={client} onCreated={() => void load()} />;

  const projects = records.filter((record) => record.kind === "projects");
  const changes = records.filter((record) => record.kind === "change-sets");
  const simulations = records.filter((record) => record.kind === "simulations");
  const migrations = records.filter((record) => record.kind === "migrations");
  const attestations = records.filter((record) => record.kind === "attestations");
  const policies = records.filter((record) => record.kind === "policies");
  const capsules = records.filter((record) => record.kind === "capsules");
  const canWrite = ["owner", "admin", "member"].includes(workspace.role);
  const isAdmin = ["owner", "admin"].includes(workspace.role);
  const verified = migrations.filter((record) => record.state === "verified").length;
  const bodyString = (record: ProductRecord, key: string) => typeof record.body[key] === "string" ? String(record.body[key]) : "";
  const resultCount = (record: ProductRecord) => {
    const result = record.body.result as { simulation?: { finding_count?: number } } | undefined;
    return result?.simulation?.finding_count;
  };

  const createProject = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    const { data, error } = await client.from("records").insert({ organization_id: workspace.id, kind: "projects", state: "created", body: { name: projectName.trim() } }).select("id").single();
    if (error) return setMessage(error.message);
    setProjectName(""); setSelectedProject(data.id); await load();
  };
  const createChange = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    const { error } = await client.from("records").insert({
      organization_id: workspace.id,
      kind: "change-sets",
      state: "created",
      body: { id: crypto.randomUUID(), name: changeName.trim(), from: changeFrom, to: changeTo, description: changeName.trim() },
    });
    if (error) return setMessage(error.message);
    setChangeName(""); setChangeFrom(""); setChangeTo(""); await load();
  };
  const queueSimulation = async (changeId: string) => {
    if (!selectedProject) return setMessage("Create or select a project first.");
    setMessage("");
    const { error } = await client.rpc("queue_simulation", { target_project: selectedProject, target_change: changeId });
    if (error) return setMessage(error.message);
    await load();
  };
  const approveMigration = async (simulationId: string) => {
    setMessage("");
    const { error } = await client.rpc("approve_migration", { target_simulation: simulationId });
    if (error) return setMessage(error.message);
    await load();
  };
  const createKey = async (scope = "agent") => {
    if (scope === "agent" && !selectedProject) return setMessage("Select a project before creating its agent key.");
    const token = newApiToken();
    const scopes = scope === "orchestrate" ? ["orchestrate", "read"] : [scope];
    const names: Record<string, string> = { agent: "Local agent key", write: "Provider publishing key", orchestrate: "CI orchestration key" };
    const { error } = await client.from("api_keys").insert({ organization_id: workspace.id, name: names[scope], prefix: token.slice(0, 15), scopes, project_id: scope === "agent" ? selectedProject : null, key_hash: await sha256(token), created_by: user.id });
    if (error) return setMessage(error.message);
    setNewKey(token); await load();
  };
  const revokeKey = async (id: string) => {
    const { error } = await client.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) return setMessage(error.message);
    await load();
  };
  const createPolicy = async () => {
    const { error } = await client.from("records").insert({
      organization_id: workspace.id,
      kind: "policies",
      state: "active",
      body: {
        name: "Local-first baseline",
        source_egress: "deny",
        model_provider: "customer",
        dry_run_required: true,
        approval_required: true,
        evidence_retention_days: 365,
      },
    });
    if (error) return setMessage(error.message);
    await load();
  };
  const publishCapsule = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    const { error } = await client.from("records").insert({
      organization_id: workspace.id,
      kind: "capsules",
      state: "draft",
      body: {
        provider: capsuleProvider.trim(),
        artifact: capsuleArtifact.trim(),
        format: "continuity-migration-capsule/v1",
        trusted: false,
        signed: false,
      },
    });
    if (error) return setMessage(error.message);
    setCapsuleProvider(""); setCapsuleArtifact(""); await load();
  };
  const openBilling = async (portal = false) => {
    setMessage("");
    const { data: session } = await client.auth.getSession();
    const response = await fetch(portal ? "/api/billing/portal" : "/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${session.session?.access_token ?? ""}` },
      body: JSON.stringify({ organization_id: workspace.id, plan: selectedPlan || "pro" }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) return setMessage(payload.error || "Billing is not configured.");
    window.location.assign(payload.url);
  };
  const inviteMember = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    const { data: session } = await client.auth.getSession();
    const response = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${session.session?.access_token ?? ""}` },
      body: JSON.stringify({ organization_id: workspace.id, email: inviteEmail, role: inviteRole }),
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error || "Invitation failed.");
    setInviteEmail(""); await load();
  };
  const progress = [true, keys.length > 0, projects.length > 0, simulations.length > 0];
  const agentCommand = [
    `export CONTINUITY_API_URL=${controlPlaneUrl || "https://api.your-domain.com"}`,
    `export CONTINUITY_ORGANIZATION=${workspace.id}`,
    "export CONTINUITY_API_KEY=ct_live_…",
    `cargo run -p continuity -- agent serve --project ${selectedProject || "<project-id>"}`,
  ].join("\n");
  return (
    <ConsoleFrame user={user} onSignOut={() => void client.auth.signOut()}>
      <div className="console-content">
        <section className="dashboard-head" id="overview">
          <div><span className="console-kicker">{workspace.name}</span><h1>Good changes start with visibility.</h1><p>Map compatibility, simulate impact, and preserve evidence without moving source outside your boundary.</p></div>
          <div className="workspace-badge"><span>WORKSPACE</span><strong>{workspace.slug}</strong><small>{workspace.role}</small></div>
        </section>
        {selectedPlan && <div className="plan-notice"><strong>{selectedPlan[0].toUpperCase() + selectedPlan.slice(1)} selected.</strong><span>{workspace.subscription_status === "active" ? "Subscription active." : "Checkout activates after Stripe variables are configured."}</span>{selectedPlan !== "free" && workspace.subscription_status !== "active" && <button onClick={() => void openBilling()}>Continue to secure checkout</button>}</div>}
        <section className="onboarding-card" id="onboarding">
          <header><div><span className="console-kicker">Getting started</span><h2>Go from account to first verified change.</h2></div><strong>{progress.filter(Boolean).length}/4 complete</strong></header>
          <div className="onboarding-steps">
            {["Workspace created", "Issue an API key", "Create a project", "Run first simulation"].map((step, index) => <article className={progress[index] ? "complete" : ""} key={step}><span>{progress[index] ? "✓" : `0${index + 1}`}</span><strong>{step}</strong><small>{index === 3 ? "Use the CLI after connecting a project." : "Required for hosted coordination."}</small></article>)}
          </div>
        </section>
        <section className="metric-grid" id="usage"><article><span>Projects</span><strong>{projects.length}</strong><small>protected systems</small></article><article><span>Simulations</span><strong>{simulations.length}</strong><small>coordinated runs</small></article><article><span>Verified repairs</span><strong>{verified}</strong><small>customer checks passed</small></article><article><span>Plan</span><strong>{workspace.plan}</strong><small>{workspace.subscription_status}</small></article></section>

        <section className="console-panel graph-panel" id="graph"><header><div><span className="console-kicker">Compatibility Graph</span><h2>Provider change → local evidence</h2></div><span className="live-label"><i /> {simulations.some((record) => record.state === "running") ? "Agent working" : "Ready"}</span></header><div className="console-graph"><div><span>CHANGE SETS</span><strong>{changes.length}</strong></div><i>→</i><div><span>PROJECTS</span><strong>{projects.length}</strong></div><i>→</i><div className="amber"><span>AT RISK</span><strong>{simulations.filter((record) => ["queued","running","awaiting_approval"].includes(record.state)).length}</strong></div><i>→</i><div className="mint"><span>VERIFIED</span><strong>{verified}</strong></div></div></section>

        <section className="console-panel" id="projects"><header><div><span className="console-kicker">Projects</span><h2>Protected systems</h2></div>{canWrite && <form onSubmit={createProject}><label className="sr-only" htmlFor="project-name">Project name</label><input id="project-name" required value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" /><button className="button primary">Create project</button></form>}</header>{projects.length ? <div className="console-table">{projects.map((project) => <article className={selectedProject === project.id ? "selected" : ""} key={project.id}><i /><button className="row-button" onClick={() => setSelectedProject(project.id)}><strong>{bodyString(project, "name") || "Untitled project"}</strong><span>{project.id}</span></button><b>{selectedProject === project.id ? "selected" : project.state}</b></article>)}</div> : <div className="empty-state"><strong>No projects yet.</strong><p>Create a project, then connect its local agent.</p></div>}</section>

        <section className="console-panel" id="changes"><header><div><span className="console-kicker">Change sets</span><h2>Define a provider change</h2></div></header>{canWrite && <form className="console-form-grid" onSubmit={createChange}><label>Name<input required value={changeName} onChange={(event) => setChangeName(event.target.value)} placeholder="OpenAPI v2 migration" /></label><label>Before<input required value={changeFrom} onChange={(event) => setChangeFrom(event.target.value)} placeholder="/v1/jobs" /></label><label>After<input required value={changeTo} onChange={(event) => setChangeTo(event.target.value)} placeholder="/v2/runs" /></label><button className="button primary">Create change</button></form>}<div className="console-table">{changes.map((change) => <article key={change.id}><i /><div><strong>{bodyString(change, "name") || bodyString(change, "description")}</strong><span>{bodyString(change, "from")} → {bodyString(change, "to")}</span></div>{canWrite ? <button onClick={() => void queueSimulation(change.id)} disabled={!selectedProject}>Simulate</button> : <b>read only</b>}</article>)}</div></section>

        <section className="console-panel" id="simulations"><header><div><span className="console-kicker">Simulation runs</span><h2>Impact before release</h2></div></header>{simulations.length ? <div className="console-table">{simulations.map((simulation) => <article key={simulation.id}><i className={simulation.state} /><div><strong>{simulation.state.replaceAll("_", " ")}</strong><span>{resultCount(simulation) === undefined ? "Waiting for local agent" : `${resultCount(simulation)} repairable finding(s)`}</span></div>{simulation.state === "awaiting_approval" && isAdmin ? <button onClick={() => void approveMigration(simulation.id)}>Approve repair</button> : <b>{new Date(simulation.created_at).toLocaleDateString()}</b>}</article>)}</div> : <div className="empty-state"><strong>No simulation has run.</strong><p>Create a change, select a project, and queue a simulation.</p></div>}</section>

        <section className="console-panel" id="migrations"><header><div><span className="console-kicker">Migration runs</span><h2>Authorized repair and verification</h2></div></header>{migrations.length ? <div className="console-table">{migrations.map((migration) => <article key={migration.id}><i className={migration.state} /><div><strong>{migration.state.replaceAll("_", " ")}</strong><span>{migration.state === "verified" ? "Signed evidence generated" : "Local agent owns execution"}</span></div><b>{new Date(migration.updated_at).toLocaleString()}</b></article>)}</div> : <div className="empty-state"><strong>No repair has been approved.</strong><p>Completed simulations require an explicit approval before local files can change.</p></div>}</section>

        <section className="console-panel cli-panel"><header><div><span className="console-kicker">Local agent</span><h2>Connect the selected project</h2></div></header><p>The key remains in your environment; source and patches remain local.</p><pre><code>{agentCommand}</code></pre><button onClick={() => copy(agentCommand, () => setCopied("agent"))}>{copied === "agent" ? "Copied ✓" : "Copy agent command"}</button><Link className="text-link" href="/docs#get-started">Read the CLI guide →</Link></section>

        <section className="console-panel" id="policies"><header><div><span className="console-kicker">Policy gate</span><h2>Write and egress controls</h2></div>{isAdmin && !policies.length && <button className="button primary" onClick={() => void createPolicy()}>Create secure baseline</button>}</header>{policies.length ? <div className="console-policy-grid">{policies.map((policy) => <article key={policy.id}><strong>{bodyString(policy, "name")}</strong><span>Source egress: {String(policy.body.source_egress)}</span><span>Approval: {String(policy.body.approval_required)}</span><span>Retention: {String(policy.body.evidence_retention_days)} days</span></article>)}</div> : <div className="empty-state"><strong>No hosted policy yet.</strong><p>The local engine still requires dry-run review and explicit write approval.</p></div>}</section>

        <section className="console-panel" id="capsules"><header><div><span className="console-kicker">Migration Capsules</span><h2>Provider-authored migration logic</h2></div></header>{isAdmin && <form className="console-form-grid capsule-form" onSubmit={publishCapsule}><label>Provider<input required value={capsuleProvider} onChange={(event) => setCapsuleProvider(event.target.value)} placeholder="Provider name" /></label><label>Artifact<input required value={capsuleArtifact} onChange={(event) => setCapsuleArtifact(event.target.value)} placeholder="api.example.com/openapi" /></label><button className="button primary">Create draft</button></form>}<div className="console-table">{capsules.map((capsule) => <article key={capsule.id}><i /><div><strong>{bodyString(capsule, "provider") || bodyString(capsule, "issuer")}</strong><span>{bodyString(capsule, "artifact")}</span></div><b>{capsule.state}</b></article>)}</div></section>

        <section className="console-panel" id="evidence"><header><div><span className="console-kicker">Evidence Vault</span><h2>Offline-verifiable attestations</h2></div></header>{attestations.length ? <div className="console-table">{attestations.map((attestation) => <article key={attestation.id}><i className="verified" /><div><strong>{bodyString(attestation, "change_id") || "Verified migration"}</strong><span>Project {bodyString(attestation, "project_hash").slice(0, 16)}…</span></div><button onClick={() => { const blob = new Blob([JSON.stringify(attestation.body, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `attestation-${attestation.id}.json`; link.click(); URL.revokeObjectURL(link.href); }}>Export</button></article>)}</div> : <div className="evidence-empty"><div className="mini-seal">✓</div><div><strong>No attestation has been uploaded.</strong><p>Failed and partial runs cannot become verified evidence.</p></div></div>}</section>

        <section className="console-panel" id="api-keys"><header><div><span className="console-kicker">Credentials</span><h2>Scoped API keys</h2></div>{isAdmin && <div className="header-actions"><button className="button" onClick={() => void createKey("write")}>Provider</button><button className="button" onClick={() => void createKey("orchestrate")}>CI</button><button className="button primary" onClick={() => void createKey("agent")}>Agent</button></div>}</header>{newKey && <div className="key-reveal"><strong>Copy this key now. It will not be shown again.</strong><code>{newKey}</code><button onClick={() => copy(newKey, () => setCopied("key"))}>{copied === "key" ? "Copied ✓" : "Copy key"}</button></div>}<div className="console-table">{keys.map((key) => <article key={key.id}><i /><div><strong>{key.name}</strong><span>{key.prefix}•••• · {key.scopes.join(", ")}{key.project_id ? ` · project ${key.project_id.slice(0, 8)}` : ""} · created {new Date(key.created_at).toLocaleDateString()}</span></div>{isAdmin && <button onClick={() => void revokeKey(key.id)}>Revoke</button>}</article>)}</div></section>

        <section className="console-panel" id="team"><header><div><span className="console-kicker">Team</span><h2>Workspace access</h2></div></header>{["owner","admin"].includes(workspace.role) && <form className="console-form-grid team-form" onSubmit={inviteMember}><label>Email<input type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="engineer@company.com" /></label><label>Role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option value="member">Member</option><option value="viewer">Viewer</option><option value="admin">Admin</option></select></label><button className="button primary">Invite member</button></form>}<div className="console-table">{members.map((member) => <article key={member.user_id}><i /><div><strong>{member.user_id === user.id ? user.email : "Workspace member"}</strong><span>{member.user_id}</span></div><b>{member.role}</b></article>)}</div></section>

        <section className="console-panel split-panel" id="billing"><div><span className="console-kicker">Usage</span><h2>Metered operations</h2>{usage.length ? <ul className="usage-list">{usage.slice(0, 8).map((event) => <li key={event.id}><span>{event.metric}</span><strong>{event.quantity}</strong><small>{new Date(event.created_at).toLocaleDateString()}</small></li>)}</ul> : <p>No hosted usage has been recorded.</p>}</div><div><span className="console-kicker">Billing</span><h2>{workspace.plan} plan</h2><p>Status: {workspace.subscription_status}. Billing never activates without a completed provider checkout.</p>{workspace.stripe_customer_id ? <button className="button" onClick={() => void openBilling(true)}>Manage billing</button> : <Link className="button" href="/pricing">Compare plans</Link>}</div></section>
        {message && <output className="console-error">{message}</output>}
      </div>
    </ConsoleFrame>
  );
}

export function ConsoleClient({ selectedPlan = "" }: { selectedPlan?: string }) {
  const client = useMemo(() => configured ? createClient(supabaseUrl!, supabasePublishableKey!) : null, []);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [client]);
  if (!client) return <SetupPreview />;
  if (user === undefined) return <ConsoleFrame><div className="console-loading">Checking your session…</div></ConsoleFrame>;
  if (!user) return <SignIn client={client} />;
  return <Dashboard client={client} user={user} selectedPlan={selectedPlan} />;
}
