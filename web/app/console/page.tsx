import type { Metadata } from "next";
import Link from "next/link";
import { getChatGPTUser, chatGPTSignInPath } from "../chatgpt-auth";
import { SiteHeader } from "../marketing";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const user = await getChatGPTUser();
  const cards = [["Compatibility Graph","Project and integration graph. Connect the hosted API to populate live state."],["Simulations","Queued, running, approval, verification, and terminal states."],["Policy","Write authorization, model, egress, retention, and capsule trust."],["Evidence","Signed attestations and offline verification exports."],["Usage","Metered simulations and repairs with enforceable limits."],["Deployment","Hosted, private-cloud, self-hosted, and disconnected boundaries."]];
  return <main className="route"><SiteHeader /><section className="route-hero"><div className="shell"><span className="eyebrow">Control plane</span><h1>Compatibility, policy, and evidence.</h1><p>{user ? `Signed in as ${user.displayName}.` : "Sign in to access organization-scoped projects and evidence."}</p>{!user && <div className="actions"><a className="button primary" href={chatGPTSignInPath("/console")}>Sign in</a><Link className="button" href="/">Return home</Link></div>}</div></section><section className="route-body shell"><div className="route-grid">{cards.map(([title,text], index)=><article key={title}><span className="eyebrow">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section></main>;
}
