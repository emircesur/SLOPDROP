import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bandFor,
  computeScore,
  dedupeFindings,
  fingerprint,
  slopIndex,
  sortFindings,
  applyWaivers,
  summarizeSeverities,
} from "../index.mjs";

test("score totals and bands", () => {
  const score = computeScore({
    dimensions: { taskPath: 3, truth: 4, nativeFit: 3, states: 3, access: 3, specificity: 4 },
  });
  assert.equal(score.total, 20);
  assert.equal(score.band, "smudged");
  assert.equal(score.index, 17);
});

test("band boundaries", () => {
  assert.equal(bandFor(24).key, "clean");
  assert.equal(bandFor(21).key, "clean");
  assert.equal(bandFor(20).key, "smudged");
  assert.equal(bandFor(16).key, "smudged");
  assert.equal(bandFor(15).key, "sloppy");
  assert.equal(bandFor(11).key, "sloppy");
  assert.equal(bandFor(10).key, "deep-slop");
  assert.equal(bandFor(0).key, "deep-slop");
  assert.equal(slopIndex(24), 0);
  assert.equal(slopIndex(0), 100);
});

test("score rejects bad input", () => {
  assert.throws(() => computeScore({ dimensions: { taskPath: 5 } }), /0-4/);
  assert.throws(() => computeScore({ dimensions: {} }), /0-4/);
  assert.throws(() => bandFor(25), /between 0 and 24/);
  assert.throws(
    () => computeScore({ dimensions: { taskPath: 1, truth: 1, nativeFit: 1, states: 1, access: 1, specificity: 1 }, estimates: ["nope"] }),
    /unknown estimate/,
  );
});

test("fingerprints survive line moves and path separators", () => {
  const a = fingerprint({ rule: "ui.nested-cards", file: "src\\Card.tsx", snippet: "<Card><Card>" });
  const b = fingerprint({ rule: "ui.nested-cards", file: "./src/Card.tsx", snippet: "<Card><Card>" });
  assert.equal(a, b);
  const c = fingerprint({ rule: "ui.nested-cards", file: "src/Card.tsx", snippet: "<Card><Card>", anchor: "render" });
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{16}$/);
});

test("findings sort by severity, then file, then line", () => {
  const sorted = sortFindings([
    { rule: "a", severity: "minor", file: "b.tsx", line: 2 },
    { rule: "b", severity: "critical", file: "z.tsx", line: 9 },
    { rule: "c", severity: "critical", file: "a.tsx", line: 4 },
  ]);
  assert.deepEqual(sorted.map((f) => f.rule), ["c", "b", "a"]);
});

test("waivers require acceptance, match globs, and can expire", () => {
  const finding = { rule: "ui.status-dot", file: "src/legacy/Row.tsx", severity: "minor" };
  const proposed = { rule: "ui.status-dot", scope: "src/legacy/**", status: "proposed", reason: "x" };
  const accepted = { ...proposed, status: "accepted", approvedBy: "human:emir" };
  assert.equal(applyWaivers([finding], [proposed])[0].status, undefined);
  assert.equal(applyWaivers([finding], [accepted])[0].status, "waived");
  assert.equal(applyWaivers([finding], [accepted], Date.now() + 1)[0].status, "waived");
  const expired = { ...accepted, expiresAt: "2000-01-01T00:00:00Z" };
  assert.equal(applyWaivers([finding], [expired])[0].status, undefined);
});

test("dedupe keeps the first fingerprint", () => {
  const list = dedupeFindings([
    { rule: "ui.status-dot", file: "a.tsx", snippet: "dot" },
    { rule: "ui.status-dot", file: "a.tsx", snippet: "dot" },
  ]);
  assert.equal(list.length, 1);
});

test("severity summary counts", () => {
  const counts = summarizeSeverities([
    { severity: "critical" },
    { severity: "minor" },
    { severity: "minor" },
    { severity: "unknown" },
  ]);
  assert.equal(counts.critical, 1);
  assert.equal(counts.minor, 2);
});
