"use client";

import { useEffect, useRef, useState } from "react";

const products = [
  ["Change Twin", "A living map of contracts, dependencies, and real usage."],
  ["Local Engine", "Deterministic analysis and repair without source upload."],
  ["Agent MCP", "A permissioned interface for every compatible coding agent."],
  ["Migration Capsules", "Provider-signed migration logic consumers can verify."],
  ["Evidence Vault", "Offline-verifiable proof tied to customer-owned checks."],
  ["Policy Gate", "Release decisions based on verified compatibility, not hope."],
];

const plans = [
  ["Free", "$0", "Learn the workflow", "3 projects", "10 simulations / month"],
  ["Pro", "$29", "For individual builders", "25 projects", "100 simulations / month"],
  ["Max", "$129", "For power users", "Unlimited projects", "500 simulations / month"],
  ["Scale", "$499", "For production teams", "Team policy and API", "2,500 simulations / month"],
];

const faq = [
  ["Does Continuity upload source code?", "No. Scan, simulation, repair, and verification run locally by default. Only policy-approved metadata and evidence are synchronized."],
  ["What counts as verified?", "Your existing tests, builds, type checks, and policy decide. A model can propose a repair, but it cannot declare success."],
  ["Does it work with coding agents?", "Yes. The local MCP server exposes read tools and separately authorized write tools to any compatible client."],
  ["Can we use our own models?", "Yes. Model adapters are optional and customer-operated models are supported. Deterministic transforms run first."],
  ["How does usage billing work?", "Self-serve plans meter simulations and verified repairs with explicit limits. Enterprise capacity is scoped during a call."],
];

export function BookCall({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button className={className || "button secondary"} onClick={() => setOpen(true)}>
        Book a Call
      </button>
      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">Enterprise</span>
                <h2 id="schedule-title">Design your deployment.</h2>
              </div>
              <button ref={closeRef} className="icon-button" onClick={() => setOpen(false)} aria-label="Close scheduling">
                ×
              </button>
            </div>
            {calLink ? (
              <iframe title="Schedule with Continuity" src={calLink} className="cal-frame" />
            ) : (
              <div className="schedule-placeholder">
                <strong>Scheduling is not configured yet.</strong>
                <p>Set NEXT_PUBLIC_CAL_LINK to enable the embedded calendar. No booking has been created.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Network() {
  return (
    <div className="network" aria-label="Synthetic simulation: one proposed change, three repaired integrations, and one blocked integration">
      <div className="synthetic">Synthetic simulation</div>
      <div className="change-card">
        <span>PROPOSED CHANGE</span>
        <strong>POST /v1/jobs → /v2/runs</strong>
      </div>
      <div className="rail" />
      {[
        ["Billing API", "verified", "12 checks"],
        ["Agent runtime", "verified", "38 checks"],
        ["Python SDK", "repairing", "patch ready"],
        ["Legacy worker", "blocked", "owner approval"],
      ].map(([name, state, note], index) => (
        <div className={`node node-${index} ${state}`} key={name}>
          <i />
          <div><strong>{name}</strong><span>{note}</span></div>
          <b>{state}</b>
        </div>
      ))}
      <div className="evidence-chip">Attestation 8F21 · locally verified</div>
    </div>
  );
}

export function MarketingPage() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="/"><span>C</span>Continuity</a>
        <nav aria-label="Main navigation">
          <a href="#product">Product</a><a href="#developers">Developers</a><a href="#providers">Providers</a>
          <a href="/enterprise">Enterprise</a><a href="/research">Research</a><a href="/pricing">Pricing</a><a href="/docs">Docs</a>
        </nav>
        <a className="nav-cta" href="#quickstart">Start free</a>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow"><i /> The change infrastructure</span>
          <h1>Software that<br /><em>survives change.</em></h1>
          <p>Continuity predicts what every code and API change will break, repairs affected systems inside their own environments, and proves they are safe before release.</p>
          <div className="actions">
            <a className="button primary" href="#quickstart">Start free <span>↗</span></a>
            <a className="button ghost" href="#simulation">Run the simulation</a>
            <BookCall />
          </div>
          <div className="trust-line"><span>LOCAL-FIRST</span><span>MODEL-AGNOSTIC</span><span>OFFLINE-VERIFIABLE</span></div>
        </div>
        <Network />
      </section>

      <section className="proof shell">
        <p>We publish methods before metrics.</p>
        <div><span>OPEN FORMATS</span><span>REPRODUCIBLE EVALUATIONS</span><span>CUSTOMER-OWNED VERIFICATION</span></div>
      </section>

      <section className="section shell" id="product">
        <div className="section-head"><span className="eyebrow">One continuity layer</span><h2>Change becomes a controlled system.</h2><p>Every surface shares the same local engine and evidence model.</p></div>
        <div className="product-grid">
          {products.map(([name, description], index) => <article className="product-card" key={name}><span>0{index + 1}</span><div className="mini-mark" /><h3>{name}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="section flow-section" id="simulation">
        <div className="shell">
          <div className="section-head"><span className="eyebrow">Closed-loop change</span><h2>From unknown risk to signed evidence.</h2></div>
          <div className="flow">
            {["Scan", "Simulate", "Repair", "Verify", "Attest"].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong><p>{["Map contracts and usage.", "Replay the proposed change.", "Apply the smallest patch.", "Run your own checks.", "Sign the outcome."][index]}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section shell quickstart" id="quickstart">
        <div className="section-head" id="developers"><span className="eyebrow">Developer quick start</span><h2>One command between change and certainty.</h2></div>
        <div className="terminal">
          <div className="terminal-bar"><span /><span /><span /><b>continuity — local</b></div>
          <pre><code><i>$</i> continuity init{"\n"}<i>$</i> continuity scan{"\n"}<span>✓ 47 integrations mapped. Source stayed local.</span>{"\n"}<i>$</i> continuity simulate --change openapi-v2.json{"\n"}<b>! 4 affected · 3 deterministic repairs · 1 approval required</b>{"\n"}<i>$</i> continuity repair --dry-run{"\n"}<i>$</i> continuity verify --export evidence.json{"\n"}<span>✓ Verified by 62 customer-owned checks. Attestation signed.</span></code></pre>
        </div>
        <div className="interfaces"><a href="/docs">CLI <span>terminal-native</span></a><a href="/mcp">MCP <span>agent-native</span></a><a href="/docs#api">API <span>platform-native</span></a></div>
      </section>

      <section className="section benchmark">
        <div className="shell benchmark-grid">
          <div><span className="eyebrow">ChangeBench</span><h2>Proof that can be reproduced.</h2><p>Our evaluation suite covers contract, type, authentication, and behavioral changes. Results appear only after fixtures, commands, and raw outputs are published.</p><a className="text-link" href="/research">Read the methodology →</a></div>
          <div className="pending-panel"><span>PUBLIC RESULT STATUS</span><strong>Measurement in progress</strong><p>No invented score. No cherry-picked comparison. The benchmark ships with the engine.</p><div><i /> fixtures defined</div><div><i /> methodology public</div><div className="muted"><i /> results pending release</div></div>
        </div>
      </section>

      <section className="section shell" id="providers">
        <div className="section-head"><span className="eyebrow">Counterfactual Change Network</span><h2>Providers test tomorrow’s change against today’s integrations.</h2><p>Consumers execute locally. Providers receive only approved compatibility outcomes.</p></div>
        <div className="audience-grid">
          {[
            ["Developers", "Repair a dependency change without handing your repository to another service."],
            ["Teams", "Standardize approval, verification, evidence, and spend across projects."],
            ["Providers", "Publish a signed migration once and measure compatibility before release."],
            ["Enterprises", "Operate in your network with identity, policy, audit, and model control."],
          ].map(([name, text]) => <article key={name}><span>FOR {name.toUpperCase()}</span><h3>{name}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="section deployment">
        <div className="shell"><div className="section-head"><span className="eyebrow">Deploy where the code lives</span><h2>One protocol. Four boundaries.</h2></div>
          <div className="deployment-row">{["Local", "Hosted", "Private cloud", "Disconnected"].map((item, i) => <div key={item}><span>0{i + 1}</span><strong>{item}</strong><i className={i === 0 || i === 3 ? "mint" : "cyan"} /></div>)}</div>
        </div>
      </section>

      <section className="section shell pricing" id="pricing">
        <div className="section-head"><span className="eyebrow">Simple entry. Infrastructure depth.</span><h2>Start locally. Scale when the network matters.</h2></div>
        <div className="pricing-grid">
          {plans.map(([name, price, blurb, a, b]) => <article key={name}><span>{name}</span><div className="price">{price}<small>{price !== "$0" && "/month"}</small></div><p>{blurb}</p><ul><li>{a}</li><li>{b}</li><li>Local CLI + MCP</li></ul><a className="button ghost" href="#quickstart">Start free</a></article>)}
          <article className="enterprise-card"><span>Enterprise</span><div className="price">Designed with you</div><p>Private deployment and control for consequential systems.</p><ul><li>SSO, policy, and evidence</li><li>Dedicated or disconnected</li><li>Customer-operated models</li><li>SLAs and deployment support</li></ul><BookCall className="button primary" /></article>
        </div>
      </section>

      <section className="section shell faq">
        <div className="section-head"><span className="eyebrow">FAQ</span><h2>The trust boundary, plainly.</h2></div>
        {faq.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
      </section>

      <section className="final-cta"><div className="shell"><span className="eyebrow">Make change survivable</span><h2>Know before release.<br />Repair before impact.</h2><div className="actions"><a className="button primary" href="#quickstart">Start free</a><BookCall /></div></div></section>
      <footer className="footer shell"><a className="brand" href="/"><span>C</span>Continuity</a><div><a href="/docs">Docs</a><a href="/security">Security</a><a href="/open-source">Open source</a><a href="/changelog">Changelog</a></div><p>Software that survives change.</p></footer>
    </main>
  );
}
