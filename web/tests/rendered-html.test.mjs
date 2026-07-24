import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the product truthfully", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Software that/);
  assert.match(html, /survives change/);
  assert.match(html, /Illustrative simulation/);
  assert.match(html, /Compatibility Graph/);
  assert.match(html, /Book a Call/);
  assert.match(html, /href="\/docs#get-started"/);
  assert.match(html, /href="#simulation-preview"/);
  assert.match(html, /https:\/\/mihirsinhchavda\.com\//);
  assert.match(html, /continuity repair --change openapi-v2\.json --apply --approve/);
  assert.doesNotMatch(html, /continuity repair --dry-run/);
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
  assert.doesNotMatch(html, /Enterprise[^<]{0,40}\$[0-9]/i);
});

test("renders supporting routes", async () => {
  for (const path of ["/docs", "/mcp", "/research", "/security", "/enterprise"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /Continuity/);
  }
});

test("publishes discovery metadata without exposing the console", async () => {
  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /\/security/);

  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/console/);
});

test("ships working scheduling and founder links in the interactive bundle", async () => {
  const assets = new URL("../dist/client/assets/", import.meta.url);
  const marketing = (await readdir(assets)).find((name) => name.startsWith("marketing-") && name.endsWith(".js"));
  assert.ok(marketing);
  const client = await readFile(new URL(marketing, assets), "utf8");
  assert.match(client, /cal\.com\/mihirsinh-chavda-df8o2m\/chat-with-mihir/);
  assert.match(client, /mihirsinhchavda\.com/);
  assert.match(client, /Built by/);
});
