import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { attestationPayload, verifyAttestation } from "../src/attestation.mjs";

test("hosted evidence verification rejects changed check results", async () => {
  const keys = await webcrypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const evidence = {
    predicate_type: "https://continuity.dev/attestation/v1",
    change_id: "v2",
    project_hash: "a".repeat(64),
    patch_hash: "b".repeat(64),
    created_at_unix: 1_800_000_000,
    checks: [{ command: "npm test", success: true, code: 0 }],
    verified: true,
    public_key: Buffer.from(await webcrypto.subtle.exportKey("raw", keys.publicKey)).toString("base64"),
    signature: "",
  };
  evidence.signature = Buffer.from(await webcrypto.subtle.sign("Ed25519", keys.privateKey, attestationPayload(evidence))).toString("base64");
  assert.equal(await verifyAttestation(evidence), true);
  evidence.checks[0].command = "echo forged";
  assert.equal(await verifyAttestation(evidence), false);
});
