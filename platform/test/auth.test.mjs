import assert from "node:assert/strict";
import test from "node:test";
import { hashToken, hashesEqual } from "../src/auth.mjs";

test("documents SHA-256 API-key storage", () => {
  const digest = hashToken("example-only");
  assert.equal(digest.length, 64);
  assert.notEqual(digest, "example-only");
  assert.equal(hashesEqual(digest, digest), true);
  assert.equal(hashesEqual(digest, hashToken("different")), false);
});
