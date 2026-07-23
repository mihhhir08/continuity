import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";

test("documents SHA-256 API-key storage", () => {
  const digest = createHash("sha256").update("example-only").digest("hex");
  assert.equal(digest.length, 64);
  assert.notEqual(digest, "example-only");
});
