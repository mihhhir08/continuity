import type { Metadata } from "next";
import { getChatGPTUser, chatGPTSignInPath } from "../chatgpt-auth";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const user = await getChatGPTUser();
  return <main className="route"><header className="nav"><a className="brand" href="/"><span>C</span>Continuity</a><a className="nav-cta" href="/">Home</a></header><section className="route-hero shell"><span className="eyebrow">Control plane</span><h1>Compatibility, policy, and evidence.</h1><p>{user ? `Signed in as ${user.displayName}.` : "Sign in to access organization-scoped projects and evidence."}</p>{!user && <div className="actions"><a className="button primary" href={chatGPTSignInPath("/console")}>Sign in</a></div>}</section><section className="route-grid shell">{[["Change Twin","Project and integration graph. Connect the hosted API to populate live state."],["Simulations","Queued, running, approval, verification, and terminal states."],["Policy","Write authorization, model, egress, retention, and capsule trust."],["Evidence","Signed attestations and offline verification exports."],["Usage","Metered simulations and repairs with enforceable limits."],["Deployment","Hosted, private-cloud, self-hosted, and disconnected boundaries."]].map(([title,text])=><article key={title}><span className="eyebrow">{title}</span><p>{text}</p></article>)}</section></main>;
}
