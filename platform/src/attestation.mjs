import { webcrypto } from "node:crypto";

export function attestationPayload(evidence) {
  return new TextEncoder().encode(JSON.stringify([
    evidence.predicate_type,
    evidence.change_id,
    evidence.project_hash,
    evidence.patch_hash,
    evidence.created_at_unix,
    (evidence.checks ?? []).map((check) => ({
      command: check.command,
      success: check.success,
      code: check.code ?? null,
    })),
    evidence.verified,
  ]));
}

export async function verifyAttestation(evidence) {
  if (
    evidence?.predicate_type !== "https://continuity.dev/attestation/v1"
    || evidence.verified !== true
    || !Array.isArray(evidence.checks)
    || !evidence.checks.length
    || evidence.checks.some((check) => check.success !== true)
  ) return false;
  try {
    const key = await webcrypto.subtle.importKey(
      "raw",
      Buffer.from(evidence.public_key, "base64"),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return webcrypto.subtle.verify(
      "Ed25519",
      key,
      Buffer.from(evidence.signature, "base64"),
      attestationPayload(evidence),
    );
  } catch {
    return false;
  }
}
