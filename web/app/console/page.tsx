import type { Metadata } from "next";
import { ConsoleClient } from "./console-client";

export const metadata: Metadata = {
  title: "Developer Console",
  description: "Create a workspace, issue scoped API keys, connect projects, and inspect compatibility evidence.",
};

export const dynamic = "force-dynamic";

export default async function ConsolePage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const requestedPlan = (await searchParams).plan ?? "";
  const plan = ["free", "pro", "max", "scale"].includes(requestedPlan) ? requestedPlan : "";
  return <ConsoleClient selectedPlan={plan} />;
}
