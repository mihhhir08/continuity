# Landing Page Specification

## Goal

Explain Continuity as a new infrastructure category, give developers a
one-command path, prove technical credibility through reproducible research,
and convert enterprise visitors through **Book a Call**.

The page may use the information rhythm common to strong developer
infrastructure sites—hero, product catalog, system explanation, proof, use
cases, deployment, pricing, and FAQ—but must not copy another company's text,
assets, brand, or distinctive composition.

## Visual system

- Ink: `#0B1015`
- Paper: `#F5F8FC`
- Primary accent: electric blue `#1268FF`
- Risk: signal amber `#FFB04A`
- Verified: mint `#56D99B`
- Sans type: Geist Sans
- Code type: Geist Mono
- Rhythm: oversized editorial type, generous whitespace, numbered sections,
  and alternating ink, paper, and blue surfaces
- Motif: connected systems transition from amber risk to mint verification

Motion must be functional, restrained, and disabled by reduced-motion
preferences.

## Navigation

- Product
- Developers
- Providers
- Enterprise
- Research
- Pricing
- Docs
- Sign in

Do not expose a sign-in link until the console exists. Use a truthful waitlist
or documentation path instead.

## Hero

Eyebrow:

> The change infrastructure.

Headline:

> **Software that survives change.**

Supporting copy:

> Continuity predicts what every code and API change will break, repairs
> affected systems inside their own environments, and proves they are safe
> before release.

Actions:

- Start free
- Run the simulation
- Book a Call

### Hero demonstration

Use clearly labeled synthetic data:

1. a proposed provider change enters the graph;
2. impact propagates across applications;
3. affected nodes turn amber;
4. local agents repair them;
5. verification evidence arrives;
6. verified nodes turn mint;
7. unresolved nodes remain explicitly blocked.

The visualization must never imply real customer usage.

## Page sections

1. **Trust evidence** — real customers, installations, research, or usage only.
2. **Product catalog** — Change Twin, CLI, MCP, Migration Capsules, Repair
   Engine, Evidence Vault, and Policy Gate.
3. **System explanation** — Scan → Simulate → Repair → Verify → Attest.
4. **Quick start** — CLI, MCP, and API examples.
5. **ChangeBench** — methodology and measured results only.
6. **Use cases** — developers, teams, providers, and enterprises.
7. **Deployment** — local, hosted, private cloud, and disconnected.
8. **Customer outcomes** — only with permission and source links.
9. **Pricing** — Free, Pro, Max, Scale, and Enterprise.
10. **FAQ** — billing, privacy, models, deployment, and verification.
11. **Final action** — Start free and Book a Call.

## Pricing

| Plan | Display |
|---|---|
| Free | $0 |
| Pro | $29/month |
| Max | $129/month |
| Scale | $499/month |
| Enterprise | Book a Call |

The Enterprise card may list private deployment, SSO, policies, dedicated
capacity, evidence, SLAs, customer-operated models, and support. It must not
show a price or range.

## Cal.com behavior

Configuration:

```text
NEXT_PUBLIC_CAL_LINK
```

- Load the Cal.com embed only after the user activates **Book a Call**.
- Use an accessible modal with focus management and Escape-to-close.
- Never hardcode the event identifier into shared product logic.
- When the value is absent in development, show a clear scheduling placeholder.
- Never show a false booking-success state.

## Supporting routes

- `/pricing`
- `/docs`
- `/mcp`
- `/research`
- `/security`
- `/enterprise`
- `/changelog`
- `/open-source`

## Content rules

- No fabricated customers, usage, benchmarks, certifications, or testimonials.
- No copied claims or designs.
- No market-specific institutional positioning.
- No enterprise price.
- Every comparison claim must link to its methodology or source.
- Accessibility target: WCAG 2.2 AA.
