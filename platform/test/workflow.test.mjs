import assert from "node:assert/strict";
import test from "node:test";
import { completionAllowed, safeRecordState } from "../src/workflow.mjs";

test("only valid local-agent outcomes complete hosted jobs", () => {
  assert.equal(completionAllowed("simulations", "awaiting_approval"), true);
  assert.equal(completionAllowed("simulations", "verified"), false);
  assert.equal(completionAllowed("migrations", "verified"), true);
  assert.equal(completionAllowed("migrations", "running"), false);
  assert.equal(safeRecordState("migrations", "verified"), "queued");
  assert.equal(safeRecordState("capsules"), "active");
  assert.equal(safeRecordState("policies", "active"), "active");
});
