import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCall, SiteFooter, SiteHeader } from "../marketing";

type Page = {
  title: string;
  eyebrow: string;
  intro: string;
  sectionTitle: string;
  sectionIntro: string;
  cards: [string, string][];
};

const pages: Record<string, Page> = {
  pricing: {
    title: "Infrastructure pricing without infrastructure theater.",
    eyebrow: "Pricing",
    intro: "Start locally, meter only what creates value, and move to a designed deployment when policy and network scale demand it.",
    sectionTitle: "Clear limits. No invented enterprise number.",
    sectionIntro: "Self-serve plans are explicit. Consequential deployments are designed around the boundary, throughput, and support required.",
    cards: [["Free", "$0 · local workflow and limited simulations."], ["Pro", "$29/month · individual builders and protected projects."], ["Max", "$129/month · power users and small teams."], ["Scale", "$499/month · production teams and provider APIs."], ["Enterprise", "Private deployment, SSO, policy, dedicated capacity, evidence, and disconnected operation. Book a Call."], ["Billing principle", "Hard usage limits and spend controls. Private telemetry is never sold."]],
  },
  docs: {
    title: "One engine. Every interface.",
    eyebrow: "Documentation",
    intro: "The CLI, MCP server, API, and console share the same change, repair, policy, and evidence semantics.",
    sectionTitle: "Start with the local truth.",
    sectionIntro: "The core workflow runs without an account. Repair previews by default and only writes after explicit approval.",
    cards: [["Initialize", "continuity init"], ["Map the project", "continuity scan"], ["Simulate", "continuity simulate --change proposed-change.json"], ["Preview repair", "continuity repair --change proposed-change.json"], ["Apply repair", "continuity repair --change proposed-change.json --apply --approve"], ["Verify and export", "continuity verify · continuity export --change proposed-change.json"]],
  },
  mcp: {
    title: "A safer change tool for every agent.",
    eyebrow: "Model Context Protocol",
    intro: "Give compatible agents structured change intelligence without giving them silent permission to modify a repository.",
    sectionTitle: "Read broadly. Write deliberately.",
    sectionIntro: "STDIO keeps local use simple. Every write-capable call remains distinct, dry-run-first, and authorization-bound.",
    cards: [["Resources", "Current project, Compatibility Graph, changes, migrations, and attestations."], ["Read tools", "scan_project · list_change_risks · simulate_change · get_attestation"], ["Repair planning", "propose_repair returns a mandatory dry-run result."], ["Write tool", "apply_repair requires dry_run_reviewed and authorized."], ["Verification", "verify_migration runs customer-owned checks."], ["Transport", "STDIO locally; OAuth-protected remote MCP through the hosted API."]],
  },
  research: {
    title: "Methods before metrics.",
    eyebrow: "ChangeBench",
    intro: "Continuity publishes fixtures, commands, raw outputs, and failure definitions before publishing benchmark results.",
    sectionTitle: "A benchmark should be reproducible, or remain unpublished.",
    sectionIntro: "The current harness includes one implemented endpoint-rename case. No comparative score is claimed.",
    cards: [["Contract changes", "Removed endpoints, renamed fields, type changes, and new requirements."], ["Behavior changes", "Authentication, pagination, error semantics, and runtime mismatches."], ["Adversarial safety", "Malicious instructions, capsules, MCP calls, and prohibited network access."], ["Authoritative checks", "A model never marks itself correct; the fixture's own checks decide."], ["Published artifacts", "Fixture, command, raw output, tool version, and failure definition."], ["Current status", "Endpoint rename implemented. Remaining categories are specified, not measured."]],
  },
  security: {
    title: "Trust is a boundary, not a badge.",
    eyebrow: "Security",
    intro: "Source stays local by default, writes require authorization, evidence is signed, and failed checks never become verified.",
    sectionTitle: "Every boundary is explicit.",
    sectionIntro: "The hosted service coordinates policy-approved metadata. It does not receive source merely to simplify orchestration.",
    cards: [["Data boundary", "Only policy-approved metadata and evidence leave the customer environment."], ["Authorization", "Least privilege, explicit write approval, OIDC workload identity, and mTLS options."], ["Supply chain", "Signed capsules, provenance, expiry, revocation, and fail-closed validation."], ["Verification", "Customer builds, tests, type checks, and policy determine success."], ["Deployment", "Hosted, customer-VPC, self-hosted, and disconnected boundaries."], ["Disclosure", "Private vulnerability reporting will be enabled before the open-core release."]],
  },
  enterprise: {
    title: "Continuity inside your boundary.",
    eyebrow: "Enterprise",
    intro: "Run the same API and evidence contract in a private cloud, customer-controlled network, or disconnected environment.",
    sectionTitle: "Control without a separate product.",
    sectionIntro: "The same local engine and evidence semantics extend from one workstation to consequential organization-wide systems.",
    cards: [["Control", "SSO, policy, approvals, retention, egress, and customer-operated models."], ["Deployment", "Dedicated, customer-VPC, self-hosted, and disconnected options."], ["Evidence", "Offline-verifiable attestations, audit export, and policy decisions."], ["Support", "Deployment design, SLAs, and forward-deployed engineering."], ["Identity", "Organization scope, least privilege, workload identity, and separation of duties."], ["Resilience", "Local analysis and evidence verification continue during hosted unavailability."]],
  },
  changelog: {
    title: "Every consequential change, recorded.",
    eyebrow: "Changelog",
    intro: "Product releases and research results appear here only after they are reproducible.",
    sectionTitle: "Build in public without manufacturing proof.",
    sectionIntro: "Implementation status is recorded precisely; future customer, performance, and security claims require evidence.",
    cards: [["2026-07-23 · Foundation", "Product thesis, architecture, security model, business model, and implementation roadmap locked."], ["2026-07-23 · Local engine", "Rust CLI, STDIO MCP, deterministic migration demo, and signed evidence implemented."], ["2026-07-23 · Hosted foundation", "Organization-scoped API, durable jobs, usage events, console, and deployment foundation implemented."], ["2026-07-23 · Editorial web", "Bright marketing system, synthetic Compatibility Graph, accurate quick starts, and trust architecture implemented."]],
  },
  "open-source": {
    title: "Open where trust requires inspection.",
    eyebrow: "Open core",
    intro: "The local engine, CLI, MCP server, formats, fixtures, and evidence verifier are intended for public inspection after the release gate.",
    sectionTitle: "A clean public boundary—not a publicized private monorepo.",
    sectionIntro: "The future public repository will begin with fresh history and an explicit allowlist after brand clearance and a security review.",
    cards: [["Local engine", "Scan, simulate, repair, verify, and export without a hosted account."], ["Open formats", "CycloneDX-compatible inventory, signed capsules, and portable evidence."], ["Agent interface", "Local MCP resources and permissioned tools."], ["Reproducible fixtures", "TypeScript and Python consumers plus public ChangeBench cases."], ["Commercial network", "Hosted aggregation, registry, intelligence, console, and enterprise controls remain private."], ["Release gate", "MIT license selected. Repository remains private until brand and security gates are complete."]],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return pages[slug] ? { title: pages[slug].eyebrow, description: pages[slug].intro } : {};
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <main className="route">
      <SiteHeader />
      <section className="route-hero">
        <div className="shell">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          {slug === "enterprise" && <div className="actions"><BookCall className="button primary" /></div>}
          {slug === "docs" && <div className="actions"><a className="button primary" href="#get-started">Get started</a></div>}
        </div>
      </section>
      <section className="route-body shell" id={slug === "docs" ? "get-started" : undefined}>
        <div className="route-intro"><h2>{page.sectionTitle}</h2><p>{page.sectionIntro}</p></div>
        <div className="route-grid">
          {page.cards.map(([title, text], index) => <article key={title}><span className="eyebrow">0{index + 1}</span><h3>{title}</h3><p>{text}</p>{slug === "docs" && <pre className="route-code"><code>{text}</code></pre>}</article>)}
        </div>
        <div className="route-callout">
          <div><h2>{slug === "enterprise" ? "Design the boundary first." : "Make the next change survivable."}</h2><p>{slug === "enterprise" ? "Private deployment, policy, and evidence—without a separate product fork." : "Start with the local engine. Connect the network when it creates value."}</p></div>
          {slug === "enterprise" ? <BookCall className="button" /> : <Link className="button" href="/docs#get-started">Start building</Link>}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
