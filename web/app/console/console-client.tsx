"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { brand } from "../brand";

type Workspace = { id: string; name: string; slug: string; role: string };
type Project = { id: string; state: string; body: { name?: string }; created_at: string };
type ApiKey = { id: string; name: string; prefix: string; created_at: string; last_used_at: string | null };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
          <a href="#api-keys"><span>⌘</span> API keys</a>
          <a href="#usage"><span>◫</span> Usage</a>
          <a href="#evidence"><span>✓</span> Evidence</a>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const { data: membership, error } = await client.from("organization_members").select("organization_id,role").eq("user_id", user.id).limit(1).maybeSingle();
    if (error) { setMessage(error.message); setWorkspace(null); return; }
    if (!membership) { setWorkspace(null); return; }
    const [{ data: organization }, { data: projectRows }, { data: keyRows }] = await Promise.all([
      client.from("organizations").select("id,name,slug").eq("id", membership.organization_id).single(),
      client.from("records").select("id,state,body,created_at").eq("organization_id", membership.organization_id).eq("kind", "projects").order("created_at", { ascending: false }),
      client.from("api_keys").select("id,name,prefix,created_at,last_used_at").eq("organization_id", membership.organization_id).is("revoked_at", null).order("created_at", { ascending: false }),
    ]);
    if (organization) setWorkspace({ ...organization, role: membership.role });
    setProjects((projectRows as Project[]) ?? []);
    setKeys((keyRows as ApiKey[]) ?? []);
  }, [client, user.id]);

  // Loading tenant state is the external synchronization this effect owns.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  if (workspace === undefined) return <ConsoleFrame user={user}><div className="console-loading">Loading your workspace…</div></ConsoleFrame>;
  if (!workspace) return <CreateWorkspace client={client} onCreated={() => void load()} />;

  const createProject = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    const { error } = await client.from("records").insert({ organization_id: workspace.id, kind: "projects", state: "created", body: { name: projectName.trim() } });
    if (error) return setMessage(error.message);
    setProjectName(""); await load();
  };
  const createKey = async () => {
    const token = newApiToken();
    const { error } = await client.from("api_keys").insert({ organization_id: workspace.id, name: "Developer key", prefix: token.slice(0, 15), key_hash: await sha256(token), created_by: user.id });
    if (error) return setMessage(error.message);
    setNewKey(token); await load();
  };
  const progress = [true, keys.length > 0, projects.length > 0, false];
  return (
    <ConsoleFrame user={user} onSignOut={() => void client.auth.signOut()}>
      <div className="console-content">
        <section className="dashboard-head" id="overview">
          <div><span className="console-kicker">{workspace.name}</span><h1>Good changes start with visibility.</h1><p>Map compatibility, simulate impact, and preserve evidence without moving source outside your boundary.</p></div>
          <div className="workspace-badge"><span>WORKSPACE</span><strong>{workspace.slug}</strong><small>{workspace.role}</small></div>
        </section>
        {selectedPlan && <div className="plan-notice"><strong>{selectedPlan[0].toUpperCase() + selectedPlan.slice(1)} selected.</strong><span>Your workspace is ready; billing will be confirmed only after Stripe is connected.</span></div>}
        <section className="onboarding-card" id="onboarding">
          <header><div><span className="console-kicker">Getting started</span><h2>Go from account to first verified change.</h2></div><strong>{progress.filter(Boolean).length}/4 complete</strong></header>
          <div className="onboarding-steps">
            {["Workspace created", "Issue an API key", "Create a project", "Run first simulation"].map((step, index) => <article className={progress[index] ? "complete" : ""} key={step}><span>{progress[index] ? "✓" : `0${index + 1}`}</span><strong>{step}</strong><small>{index === 3 ? "Use the CLI after connecting a project." : "Required for hosted coordination."}</small></article>)}
          </div>
        </section>
        <section className="metric-grid" id="usage"><article><span>Projects</span><strong>{projects.length}</strong><small>in this workspace</small></article><article><span>Active keys</span><strong>{keys.length}</strong><small>scoped credentials</small></article><article><span>Simulations</span><strong>0</strong><small>hosted runs</small></article><article><span>Verified</span><strong>—</strong><small>no result claimed</small></article></section>
        <section className="console-panel" id="projects"><header><div><span className="console-kicker">Projects</span><h2>Protected systems</h2></div><form onSubmit={createProject}><label className="sr-only" htmlFor="project-name">Project name</label><input id="project-name" required value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" /><button className="button primary">Create project</button></form></header>{projects.length ? <div className="console-table">{projects.map((project) => <article key={project.id}><i /><div><strong>{project.body.name || "Untitled project"}</strong><span>{project.id}</span></div><b>{project.state}</b></article>)}</div> : <div className="empty-state"><strong>No projects yet.</strong><p>Create a project, then initialize the CLI inside its local repository.</p></div>}</section>
        <section className="console-panel" id="api-keys"><header><div><span className="console-kicker">Credentials</span><h2>API keys</h2></div><button className="button primary" onClick={createKey}>Create API key</button></header>{newKey && <div className="key-reveal"><strong>Copy this key now. It will not be shown again.</strong><code>{newKey}</code><button onClick={() => copy(newKey, () => setCopied("key"))}>{copied === "key" ? "Copied ✓" : "Copy key"}</button></div>}<div className="console-table">{keys.map((key) => <article key={key.id}><i /><div><strong>{key.name}</strong><span>{key.prefix}•••• · created {new Date(key.created_at).toLocaleDateString()}</span></div><b>{key.last_used_at ? "used" : "new"}</b></article>)}</div></section>
        <section className="console-panel cli-panel"><header><div><span className="console-kicker">Local engine</span><h2>Connect this workspace</h2></div></header><p>From a checked-out Continuity source tree:</p><pre><code><i>$</i> {installCommand}{"\n"}<i>$</i> {initCommand}{"\n"}<span>✓ Source stays local. Approved evidence can sync.</span></code></pre><Link className="text-link" href="/docs#get-started">Read the CLI guide →</Link></section>
        <section className="console-panel" id="evidence"><header><div><span className="console-kicker">Trust</span><h2>Evidence and policy</h2></div></header><div className="evidence-empty"><div className="mini-seal">✓</div><div><strong>No attestation has been uploaded.</strong><p>Customer checks remain authoritative. Failed and partial runs cannot become verified evidence.</p></div></div></section>
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
