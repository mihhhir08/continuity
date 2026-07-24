import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { capsulePayload, verifyCapsule } from "../src/capsule.mjs";

test("capsule verification fails closed after signed content changes", async () => {
  const keys = await webcrypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const capsule = {
    format: "https://continuity.dev/migration-capsule/v1",
    issuer: "provider.example",
    artifact: "api.example/openapi",
    change: { id: "v2", from: "/v1/jobs", to: "/v2/runs", description: "endpoint rename" },
    expires_at_unix: Math.floor(Date.now() / 1000) + 3600,
    public_key: Buffer.from(await webcrypto.subtle.exportKey("raw", keys.publicKey)).toString("base64"),
    signature: "",
  };
  capsule.signature = Buffer.from(await webcrypto.subtle.sign("Ed25519", keys.privateKey, capsulePayload(capsule))).toString("base64");
  assert.equal(await verifyCapsule(capsule), true);
  capsule.change.to = "/attacker";
  assert.equal(await verifyCapsule(capsule), false);
});
