import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
assert.match(await readFile("client.ts", "utf8"), /\/v2\/runs/);
console.log("TypeScript consumer verified");
