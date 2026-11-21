import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHandler } from "../src/server.mjs";

const dir = mkdtempSync(join(process.cwd(), ".tmp-mcp-"));
const handler = createHandler({ projectRoot: dir, actorId: "codex:test", actorKind: "agent", client: "codex" });

let nextId = 1;
async function call(method, params = {}) {
  const response = await handler.handle({ jsonrpc: "2.0", id: nextId++, method, params });
  return response;
}
async function tool(name, args = {}) {
  const response = await call("tools/call", { name, arguments: args });
  if (response.error) throw new Error(`${name}: ${response.error.message}`);
  return response.result.structuredContent;
}

test.after(() => {
  handler.db.close();
  rmSync(dir, { recursive: true, force: true });
});

test("initialize negotiates and advertises tools and resources", async () => {
  const response = await call("initialize", { protocolVersion: "2025-06-18", clientInfo: { name: "test" } });
  assert.equal(response.result.protocolVersion, "2025-06-18");
  assert.ok(response.result.capabilities.tools);
  assert.ok(response.result.instructions.includes("chart"));
});

test("tools/list returns the full surface", async () => {
  const response = await call("tools/list");
  const names = response.result.tools.map((t) => t.name);
  for (const expected of ["chart_read", "chart_patch", "finding_upsert", "visit_record", "sync_pull", "export_text"]) {
    assert.ok(names.includes(expected), `missing ${expected}`);
  }
  assert.ok(names.length >= 12);
});

test("chart patch is revisioned, field-level, and idempotent", async () => {
  const before = await tool("chart_read");
  assert.equal(before.rev, 0);

  const first = await tool("chart_patch", { baseRev: 0, fields: { stack: "React 19" }, idem: "patch-1" });
  assert.equal(first.ok, true);
  assert.equal(first.rev, 1);

  const stale = await tool("chart_patch", { baseRev: 0, fields: { stack: "Vue" }, idem: "patch-2" });
  assert.equal(stale.ok, false);
  assert.equal(stale.conflicts[0].field, "stack");

  const parallel = await tool("chart_patch", { baseRev: 1, fields: { platforms: ["web"] }, idem: "patch-3" });
  assert.equal(parallel.ok, true);
  assert.deepEqual(parallel.applied, ["platforms"]);

  const replay = await tool("chart_patch", { baseRev: 0, fields: { stack: "React 19" }, idem: "patch-1" });
  assert.equal(replay.replayed, true);

  const after = await tool("chart_read");
  assert.equal(after.data.stack, "React 19");
  assert.deepEqual(after.data.platforms, ["web"]);
  assert.equal(after.rev, 2);
});

test("findings dedupe by fingerprint", async () => {
  const args = {
    rule: "ui.nested-cards",
    file: "src\\Card.tsx",
    line: 118,
    snippet: "<Card><Card>",
    severity: "noticeable",
    message: "A card inside a card.",
    fix: "Keep one container level.",
    idem: "finding-1",
  };
  const created = await tool("finding_upsert", args);
  assert.equal(created.created, true);

  const again = await tool("finding_upsert", { ...args, line: 140, idem: "finding-2" });
  assert.equal(again.created, false);
  assert.equal(again.id, created.id);

  const listed = await tool("finding_list", { status: "open" });
  assert.equal(listed.findings.length, 1);
  assert.equal(listed.findings[0].file, "src/Card.tsx");
});

test("visits record and list", async () => {
  const recorded = await tool("visit_record", {
    scope: "checkout",
    command: "review",
    total: 12,
    scores: { taskPath: 2, truth: 3, nativeFit: 2, states: 2, access: 2, specificity: 1 },
    band: "sloppy",
    reportMd: "# Report",
    idem: "visit-1",
  });
  assert.ok(recorded.id);

  const visits = await tool("visit_list", { scope: "checkout" });
  assert.equal(visits.visits.length, 1);
  assert.equal(visits.visits[0].band, "sloppy");
});

test("waivers from agents are proposals", async () => {
  const waiver = await tool("waiver_add", {
    rule: "ui.status-dot",
    scope: "src/legacy/**",
    reason: "status LED mirrors the hardware",
    idem: "waiver-1",
  });
  assert.equal(waiver.status, "proposed");
});

test("sync pulls ordered events with a cursor", async () => {
  const pull = await tool("sync_pull", { since: 0, limit: 100 });
  assert.ok(pull.events.length >= 5);
  assert.deepEqual(
    pull.events.map((e) => e.seq),
    [...pull.events.map((e) => e.seq)].sort((a, b) => a - b),
  );
  assert.equal(pull.nextSeq, pull.events.at(-1).seq);

  const none = await tool("sync_pull", { since: pull.nextSeq });
  assert.equal(none.events.length, 0);
});

test("score compute uses the shared core", async () => {
  const score = await tool("score_compute", {
    dimensions: { taskPath: 2, truth: 3, nativeFit: 2, states: 2, access: 2, specificity: 1 },
  });
  assert.equal(score.total, 12);
  assert.equal(score.band, "sloppy");
  assert.equal(score.index, 50);
});

test("export writes the committed text artifacts", async () => {
  const result = await tool("export_text", {});
  assert.equal(result.written.length, 3);
  const chart = readFileSync(join(dir, ".slopdrop", "chart.md"), "utf8");
  assert.ok(chart.includes("Stack: React 19"));
  assert.ok(chart.includes("Platforms: web"));
  assert.ok(existsSync(join(dir, ".slopdrop", "findings.jsonl")));
  const waivers = JSON.parse(readFileSync(join(dir, ".slopdrop", "waivers.json"), "utf8"));
  assert.equal(waivers.waivers.length, 0, "proposed waivers are not exported");
});

test("unknown tools fail cleanly", async () => {
  const response = await call("tools/call", { name: "nope", arguments: {} });
  assert.equal(response.error.code, -32601);
  assert.ok(response.error.data.supported.includes("chart_read"));
});
