import { createHash, timingSafeEqual } from "node:crypto";

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashesEqual(actual, expected) {
  return actual.length === expected.length &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
