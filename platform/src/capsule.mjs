import { webcrypto } from "node:crypto";

export function capsulePayload(capsule) {
  return new TextEncoder().encode(JSON.stringify([
    capsule.format,
    capsule.issuer,
    capsule.artifact,
    {
      id: capsule.change?.id,
      from: capsule.change?.from,
      to: capsule.change?.to,
      description: capsule.change?.description ?? "",
    },
    capsule.expires_at_unix,
  ]));
}

export async function verifyCapsule(capsule) {
  if (
    capsule?.format !== "https://continuity.dev/migration-capsule/v1"
    || typeof capsule.issuer !== "string"
    || typeof capsule.artifact !== "string"
    || !capsule.change
    || Number(capsule.expires_at_unix) <= Date.now() / 1000
  ) return false;
  try {
    const key = await webcrypto.subtle.importKey(
      "raw",
      Buffer.from(capsule.public_key, "base64"),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return webcrypto.subtle.verify(
      "Ed25519",
      key,
      Buffer.from(capsule.signature, "base64"),
      capsulePayload(capsule),
    );
  } catch {
    return false;
  }
}
