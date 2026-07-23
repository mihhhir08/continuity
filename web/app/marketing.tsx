"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "./brand";

const products = [
  {
    name: "Compatibility Graph",
    label: "MAP",
    description: "A living view of contracts, dependencies, and real integration paths.",
    kind: "graph",
  },
  {
    name: "Local Engine",
    label: "EXECUTE",
    description: "Deterministic analysis and repair without uploading source.",
    kind: "engine",
  },
  {
    name: "Agent MCP",
    label: "ORCHESTRATE",
    description: "A permissioned change interface for every compatible coding agent.",
    kind: "mcp",
  },
  {
    name: "Migration Capsules",
    label: "DISTRIBUTE",
    description: "Provider-signed migration logic that consumers can verify.",
    kind: "capsule",
  },
  {
    name: "Evidence Vault",
    label: "PROVE",
    description: "Offline-verifiable evidence tied to customer-owned checks.",
    kind: "evidence",
  },
  {
    name: "Policy Gate",
    label: "CONTROL",
    description: "Release decisions based on verified compatibility, not hope.",
    kind: "policy",
  },
] as const;

const audiences = [
  ["Developers", "Repair dependency and API changes without handing your repository to another service.", "Local CLI · dry-run repair · signed evidence"],
  ["Teams", "Standardize approval, verification, evidence, and spend across every protected project.", "Shared policy · CI workflows · usage controls"],
  ["Providers", "Publish migration logic once and test proposed releases before they reach customers.", "ChangeSets · capsules · aggregate outcomes"],
  ["Enterprises", "Operate inside your boundary with identity, policy, audit, and model control.", "Private cloud · disconnected · customer models"],
] as const;

const plans = [
  ["Free", "$0", "Learn the workflow", "3 projects", "10 simulations / month"],
  ["Pro", "$29", "For individual builders", "25 projects", "100 simulations / month"],
  ["Max", "$129", "For power users", "Unlimited projects", "500 simulations / month"],
  ["Scale", "$499", "For production teams", "Team policy and API", "2,500 simulations / month"],
] as const;

const faq = [
  ["Does Continuity upload source code?", "No. Scan, simulation, repair, and verification run locally by default. Only policy-approved metadata and evidence are synchronized."],
  ["What counts as verified?", "Your existing tests, builds, type checks, and policy decide. A model can propose a repair, but it cannot declare success."],
  ["Does it work with coding agents?", "Yes. The local MCP server exposes read tools and separately authorized write tools to compatible clients."],
  ["Can we use our own models?", "Yes. Model adapters are optional and customer-operated models are supported. Deterministic transforms run first."],
  ["How does usage billing work?", "Self-serve plans meter simulations and verified repairs with explicit limits. Enterprise capacity is scoped during a call."],
] as const;

function Brand() {
  return <Link className="brand" href="/"><span aria-hidden="true">{brand.mark}</span>{brand.name}</Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <Brand />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        <span /><span /><span /><span className="sr-only">Toggle navigation</span>
      </button>
      <nav id="main-navigation" className={open ? "nav-open" : ""} aria-label="Main navigation">
        <Link href="/#product" onClick={() => setOpen(false)}>Product</Link>
        <Link href="/#developers" onClick={() => setOpen(false)}>Developers</Link>
        <Link href="/#providers" onClick={() => setOpen(false)}>Providers</Link>
        <Link href="/enterprise" onClick={() => setOpen(false)}>Enterprise</Link>
        <Link href="/research" onClick={() => setOpen(false)}>Research</Link>
        <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link href="/docs" onClick={() => setOpen(false)}>Docs</Link>
      </nav>
      <Link className="nav-cta" href="/docs#get-started">Start building <span aria-hidden="true">↗</span></Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-lead">
          <Brand />
          <p>Change infrastructure for software that cannot afford surprise.</p>
        </div>
        <div><strong>Build</strong><Link href="/docs">Docs</Link><Link href="/mcp">MCP</Link><Link href="/open-source">Open core</Link></div>
        <div><strong>Trust</strong><Link href="/security">Security</Link><Link href="/research">Research</Link><Link href="/enterprise">Enterprise</Link></div>
        <div><strong>Company</strong><Link href="/changelog">Changelog</Link><Link href="/pricing">Pricing</Link><Link href="/enterprise">Contact</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Continuity</span><span>Software that survives change.</span></div>
      <div className="footer-word" aria-hidden="true">Continuity.</div>
    </footer>
  );
}

export function BookCall({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK;

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll<HTMLElement>("button, iframe, a[href], [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus(); };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} className={className || "button secondary"} onClick={() => setOpen(true)}>Book a Call</button>
      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="schedule-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">Enterprise</span><h2 id="schedule-title">Design your deployment.</h2></div>
              <button ref={closeRef} className="icon-button" onClick={() => setOpen(false)} aria-label="Close scheduling">×</button>
            </div>
            {calLink ? <iframe title="Schedule with Continuity" src={calLink} className="cal-frame" /> : (
              <div className="schedule-placeholder"><strong>Scheduling is not configured yet.</strong><p>Set NEXT_PUBLIC_CAL_LINK to enable the embedded calendar. No booking has been created.</p></div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function SectionIndex({ name, number }: { name: string; number: string }) {
  return <div className="section-index"><span>〉 {name}</span><b>[ {number} / 08 ]</b></div>;
}

function CompatibilityDemo() {
  const [run, setRun] = useState(0);
  const replay = () => setRun((value) => value + 1);
  return (
    <div className="compat-demo" aria-label="Illustrative simulation of a proposed API change across four integrations">
      <div className="demo-topline"><span><i /> Illustrative simulation</span><button type="button" onClick={replay}>Replay <b aria-hidden="true">↻</b></button></div>
      <div className="demo-canvas" key={run}>
        <div className="provider-card"><span>PROPOSED CHANGE</span><strong>POST /v1/jobs</strong><i>becomes</i><strong>POST /v2/runs</strong></div>
        <div className="signal signal-a" /><div className="signal signal-b" /><div className="signal signal-c" /><div className="signal signal-d" />
        {[
          ["TypeScript SDK", "verified", "checks passed"],
          ["Billing service", "verified", "checks passed"],
          ["Python worker", "repairing", "patch ready"],
          ["Legacy client", "blocked", "approval required"],
        ].map(([name, state, note], index) => (
          <article className={`integration-card integration-${index} ${state}`} key={name}>
            <i aria-hidden="true" /><div><strong>{name}</strong><span>{note}</span></div><b>{state}</b>
          </article>
        ))}
        <div className="local-boundary"><span>RUNS INSIDE CUSTOMER BOUNDARY</span></div>
        <div className="attestation-card"><span>✓</span><div><strong>Evidence ready</strong><small>Signed · offline-verifiable</small></div></div>
      </div>
    </div>
  );
}

function ProductVisual({ kind }: { kind: typeof products[number]["kind"] }) {
  if (kind === "engine") return <div className="product-visual engine-visual"><div className="file-tree"><span>src/</span><b>client.ts</b><span>tests/</span><b>client.test.ts</b></div><div className="diff-card"><small>DETERMINISTIC REPAIR</small><del>&quot;/v1/jobs&quot;</del><ins>&quot;/v2/runs&quot;</ins><p>Source remains local</p></div></div>;
  if (kind === "mcp") return <div className="product-visual mcp-visual"><div className="agent-orb">AI</div><div className="tool-list"><p><span>scan_project</span><b>read</b></p><p><span>simulate_change</span><b>read</b></p><p className="write"><span>apply_repair</span><b>approval</b></p><p><span>verify_migration</span><b>read</b></p></div></div>;
  if (kind === "capsule") return <div className="product-visual capsule-visual"><div className="capsule"><span>PROVIDER SIGNED</span><strong>Migration Capsule</strong><p>contract.diff</p><p>recipe.wasm</p><p>verification.json</p><b>Signature valid ✓</b></div><div className="capsule-arrow">→</div><div className="consumer-box">LOCAL<br />ENGINE</div></div>;
  if (kind === "evidence") return <div className="product-visual evidence-visual"><div className="seal">✓</div><div className="evidence-sheet"><small>EVIDENCE ATTESTATION</small><h4>Migration verified</h4><p><span>Source hash</span><b>recorded</b></p><p><span>Customer checks</span><b>passed</b></p><p><span>Policy decision</span><b>approved</b></p><footer>Offline-verifiable signature</footer></div></div>;
  if (kind === "policy") return <div className="product-visual policy-visual"><div className="policy-grid"><p><span>Source egress</span><b>DENY</b></p><p><span>Model provider</span><b>CUSTOMER</b></p><p><span>Dry run</span><b>REQUIRED</b></p><p><span>Write approval</span><b>REQUIRED</b></p></div><div className="gate">POLICY<br />GATE <i /></div></div>;
  return <div className="product-visual graph-visual"><div className="graph-hub">CHANGE</div>{["API", "SDK", "APP", "JOB"].map((item, index) => <div className={`graph-node graph-node-${index}`} key={item}>{item}</div>)}<div className="graph-status">Compatibility mapped locally</div></div>;
}

function ProductCatalog() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const move = (index: number, key: string) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(key)) return;
    const direction = key === "ArrowDown" || key === "ArrowRight" ? 1 : -1;
    const next = (index + direction + products.length) % products.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  return (
    <div className="catalog">
      <div className="catalog-tabs" role="tablist" aria-label="Continuity products">
        {products.map((product, index) => (
          <button ref={(node) => { refs.current[index] = node; }} role="tab" aria-selected={active === index} aria-controls="product-panel" tabIndex={active === index ? 0 : -1} key={product.name} onClick={() => setActive(index)} onKeyDown={(event) => move(index, event.key)}>
            <span>0{index + 1}</span><strong>{product.name}</strong><i aria-hidden="true" />
          </button>
        ))}
      </div>
      <article id="product-panel" className="catalog-panel" role="tabpanel" tabIndex={0}>
        <div className="catalog-copy"><span>{products[active].label}</span><h3>{products[active].name}</h3><p>{products[active].description}</p></div>
        <ProductVisual kind={products[active].kind} />
      </article>
    </div>
  );
}

function AudienceTabs() {
  const [active, setActive] = useState(0);
  return (
    <div className="audience">
      <div className="audience-tabs" role="tablist" aria-label="Use cases">
        {audiences.map(([name], index) => <button role="tab" aria-selected={active === index} tabIndex={active === index ? 0 : -1} key={name} onClick={() => setActive(index)}>{name}</button>)}
      </div>
      <div className="audience-panel" role="tabpanel">
        <span>FOR {audiences[active][0].toUpperCase()}</span><h3>{audiences[active][1]}</h3><p>{audiences[active][2]}</p>
        <div className={`audience-art audience-art-${active}`}><i /><i /><i /><b>{audiences[active][0]}</b></div>
      </div>
    </div>
  );
}

export function MarketingPage() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("revealed")), { threshold: .12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="marketing">
      <SiteHeader />

      <section className="hero paper-grid">
        <div className="shell hero-copy" data-reveal>
          <Link className="announcement" href="/changelog"><b>NEW</b><span>Counterfactual Change Network</span><i>↗</i></Link>
          <span className="eyebrow">The change infrastructure</span>
          <h1>Software that<br />survives <em>change.</em></h1>
          <p>Continuity predicts what code and API changes will break, repairs affected systems inside their own environments, and proves they are safe before release.</p>
          <div className="actions"><Link className="button primary" href="/docs#get-started">Start building <span>↗</span></Link><a className="button ghost" href="#simulation">Run the simulation</a><BookCall /></div>
          <div className="trust-line"><span>LOCAL-FIRST</span><span>MODEL-AGNOSTIC</span><span>OFFLINE-VERIFIABLE</span></div>
          <CompatibilityDemo />
        </div>
      </section>

      <section className="trust-strip"><div className="shell"><p>Methods before metrics.</p><span>OPEN FORMATS</span><span>REPRODUCIBLE EVALUATIONS</span><span>CUSTOMER-OWNED VERIFICATION</span></div></section>

      <section className="section shell" id="product" data-reveal>
        <SectionIndex name="Product catalog" number="01" />
        <div className="section-head"><span className="eyebrow">One continuity layer</span><h2>All the pieces to make change survivable.</h2><p>Every surface shares the same local engine, permission model, and evidence contract.</p></div>
        <ProductCatalog />
      </section>

      <section className="section process-section" id="simulation">
        <div className="shell" data-reveal>
          <SectionIndex name="How it works" number="02" />
          <div className="section-head"><span className="eyebrow">Closed-loop change</span><h2>From unknown risk to signed evidence.</h2></div>
          <div className="process-grid">
            {[
              ["Scan", "Map contracts and real usage.", "01"],
              ["Simulate", "Replay the proposed change locally.", "02"],
              ["Repair", "Preview the smallest deterministic patch.", "03"],
              ["Verify", "Run builds and checks you already trust.", "04"],
              ["Attest", "Sign the outcome for offline verification.", "05"],
            ].map(([name, text, number]) => <article key={name}><span>{number}</span><div className="process-icon"><i /><i /><i /></div><h3>{name}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section shell quickstart" id="developers" data-reveal>
        <SectionIndex name="Interfaces" number="03" />
        <div className="section-head"><span className="eyebrow">Developer quick start</span><h2>One engine. Every interface.</h2><p>The examples below match the implemented local CLI. Repair previews by default and requires both flags before writing.</p></div>
        <div className="quickstart-grid">
          <div className="terminal">
            <div className="terminal-bar"><span /><span /><span /><b>continuity — local</b></div>
            <pre><code><i>$</i> continuity init{"\n"}<i>$</i> continuity scan{"\n"}<span>✓ Compatibility graph created locally</span>{"\n"}<i>$</i> continuity simulate --change openapi-v2.json{"\n"}<b>! Affected integrations found · review required</b>{"\n"}<i>$</i> continuity repair --change openapi-v2.json{"\n"}<span>✓ Dry-run patch ready</span>{"\n"}<i>$</i> continuity repair --change openapi-v2.json --apply --approve{"\n"}<i>$</i> continuity verify{"\n"}<i>$</i> continuity export --change openapi-v2.json</code></pre>
          </div>
          <div className="interface-stack">
            <Link href="/docs"><span>01</span><div><strong>CLI</strong><p>Terminal-native local workflow</p></div><b>↗</b></Link>
            <Link href="/mcp"><span>02</span><div><strong>MCP</strong><p>Permissioned tools for agents</p></div><b>↗</b></Link>
            <Link href="/docs#api"><span>03</span><div><strong>API</strong><p>Provider and team coordination</p></div><b>↗</b></Link>
          </div>
        </div>
      </section>

      <section className="section research-section" data-reveal>
        <div className="shell">
          <SectionIndex name="Research" number="04" />
          <div className="research-grid">
            <div><span className="eyebrow">ChangeBench</span><h2>Proof that can be reproduced.</h2><p>Fixtures, commands, raw output, and failure definitions come before any public score.</p><Link className="text-link" href="/research">Read the methodology →</Link></div>
            <div className="bench-visual">
              <header><span>PUBLIC RESULT STATUS</span><b>Methodology active</b></header>
              {["Contract changes", "Behavior changes", "Adversarial safety"].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong><i className={index === 0 ? "ready" : ""}>{index === 0 ? "fixture implemented" : "results pending"}</i></div>)}
              <footer>No comparative score is claimed.</footer>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="providers" data-reveal>
        <SectionIndex name="Use cases" number="05" />
        <div className="section-head"><span className="eyebrow">Counterfactual Change Network</span><h2>Test tomorrow’s change against today’s integrations.</h2><p>Consumers execute locally. Providers receive only policy-approved compatibility outcomes.</p></div>
        <AudienceTabs />
      </section>

      <section className="section deployment-section" data-reveal>
        <div className="shell">
          <SectionIndex name="Deployment" number="06" />
          <div className="section-head"><span className="eyebrow">Deploy where the code lives</span><h2>One protocol. Four boundaries.</h2></div>
          <div className="deployment-grid">
            {[
              ["Local", "Laptop or secure workstation"],
              ["Hosted", "Managed coordination layer"],
              ["Private cloud", "Inside your cloud account"],
              ["Disconnected", "Offline capsule and evidence transfer"],
            ].map(([name, text], index) => <article key={name}><span>0{index + 1}</span><div className={`boundary boundary-${index}`}><i /><i /><i /></div><h3>{name}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section trust-section" data-reveal>
        <div className="shell">
          <SectionIndex name="Trust architecture" number="07" />
          <div className="trust-grid">
            <div><span className="eyebrow">A boundary, not a badge</span><h2>Your code stays yours.</h2><p>Continuity coordinates change without silently expanding what a model, provider, or hosted service can see or modify.</p><Link className="text-link" href="/security">Explore the security model →</Link></div>
            <div className="boundary-map"><div className="customer-zone"><span>CUSTOMER ENVIRONMENT</span><b>Source</b><b>Tests</b><b>Policy</b><strong>Local engine</strong></div><div className="approved-flow">approved metadata →</div><div className="hosted-zone"><span>HOSTED CONTROL PLANE</span><b>Coordination</b><b>Registry</b><b>Evidence</b></div></div>
          </div>
        </div>
      </section>

      <section className="section shell pricing" id="pricing" data-reveal>
        <SectionIndex name="Pricing" number="08" />
        <div className="section-head"><span className="eyebrow">Simple entry. Infrastructure depth.</span><h2>Start locally. Scale when the network matters.</h2></div>
        <div className="pricing-grid">
          {plans.map(([name, price, blurb, a, b]) => <article key={name}><span>{name}</span><div className="price">{price}<small>{price !== "$0" && "/month"}</small></div><p>{blurb}</p><ul><li>{a}</li><li>{b}</li><li>Local CLI + MCP</li></ul><Link className="button ghost" href="/docs#get-started">Start building</Link></article>)}
          <article className="enterprise-card"><span>Enterprise</span><div className="price">Designed with you</div><p>Private deployment and control for consequential systems.</p><ul><li>SSO, policy, and evidence</li><li>Dedicated or disconnected</li><li>Customer-operated models</li><li>SLAs and deployment support</li></ul><BookCall className="button primary" /></article>
        </div>
      </section>

      <section className="section shell faq" data-reveal>
        <div className="section-head"><span className="eyebrow">FAQ</span><h2>The trust boundary, plainly.</h2></div>
        {faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
      </section>

      <section className="final-cta"><div className="shell" data-reveal><span className="eyebrow">Make change survivable</span><h2>Know before release.<br />Repair before impact.</h2><div className="actions"><Link className="button primary" href="/docs#get-started">Start building</Link><BookCall /></div></div></section>
      <SiteFooter />
    </main>
  );
}
