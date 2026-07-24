export const terminalStates = new Set(["awaiting_approval", "verified", "failed", "partial", "cancelled", "rejected"]);

export function completionAllowed(kind, state) {
  if (!terminalStates.has(state)) return false;
  if (kind === "simulations") return state === "awaiting_approval" || state === "failed" || state === "partial";
  if (kind === "migrations") return state === "verified" || state === "failed" || state === "partial" || state === "rejected";
  return false;
}

export function safeRecordState(kind, requested) {
  if (kind === "simulations" || kind === "migrations") return "queued";
  if (kind === "capsules") return "active";
  return requested === "active" ? "active" : "created";
}
