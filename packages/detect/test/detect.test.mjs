import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { blankComments, scan, scanSource } from "../src/engine.mjs";
import { detectableRules } from "../../rules/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLOP = join(HERE, "fixtures", "slop");
const CLEAN = join(HERE, "fixtures", "clean");
const RULES = detectableRules();

test("finds the obvious tells in a slop fixture", () => {
  const result = scan([SLOP], { platform: "web", rules: RULES });
  const ids = new Set(result.findings.map((f) => f.rule));

  for (const expected of [
    "ui.slop-gradient",
    "ui.nested-cards",
    "ui.icon-tile",
    "ui.tracked-caps-label",
    "ui.sparkle-icon",
    "ui.emoji-icon",
    "ui.status-dot",
    "web.clickable-div",
    "a11y.img-no-alt",
    "motion.transition-all",
    "motion.hover-scale",
    "truth.unverified-claim",
    "copy.oops-error",
    "copy.welcome-back",
    "copy.vague-button",
  ]) {
    assert.ok(ids.has(expected), `expected ${expected}, got ${[...ids].join(", ")}`);
  }

  assert.ok(result.findings.every((f) => f.fingerprint), "every finding has a fingerprint");
  assert.ok(result.findings.every((f) => f.line > 0));
});

test("leaves a clean fixture alone", () => {
  const result = scan([CLEAN], { platform: "web", rules: RULES });
  assert.deepEqual(result.findings, []);
});

test("finds Swift tells", () => {
  const result = scan([SLOP], { platform: "mobile", rules: RULES });
  const ids = new Set(result.findings.map((f) => f.rule));
  for (const expected of ["ux.safe-area-off", "a11y.fixed-text-size", "ui.glass-everywhere"]) {
    assert.ok(ids.has(expected), `expected ${expected}, got ${[...ids].join(", ")}`);
  }
  // glass-everywhere is once per file, not once per material.
  assert.equal(result.findings.filter((f) => f.rule === "ui.glass-everywhere").length, 1);
});

test("output is deterministic", () => {
  const a = scan([SLOP], { platform: "web", rules: RULES });
  const b = scan([SLOP], { platform: "web", rules: RULES });
  assert.deepEqual(a.findings, b.findings);
});

test("comments are blanked without shifting lines", () => {
  const source = [
    "// background: linear-gradient(#7c3aed, #db2777)",
    "const ok = 1;",
    "/* <div onClick={go}>x</div> */",
    "const alsoOk = 2;",
  ].join("\n");
  const blanked = blankComments(source, "js");
  assert.equal(blanked.split("\n").length, 4);
  assert.ok(!blanked.includes("linear-gradient"));
  assert.ok(blanked.includes("const ok = 1;"));
});

test("urls inside strings survive comment blanking", () => {
  const source = 'const url = "https://example.com/a";\nconst x = 1;';
  assert.equal(blankComments(source, "js"), source);
});

test("slopdrop-ignore silences one line", () => {
  const ignored = [
    "// slopdrop-ignore ui.nested-cards",
    "<Card><Card>inner</Card></Card>",
  ].join("\n");
  assert.equal(scanSource(ignored, "a.tsx", { stack: "js", kind: "web", rules: RULES }).length, 0);

  const notIgnored = "<Card><Card>inner</Card></Card>";
  assert.ok(scanSource(notIgnored, "a.tsx", { stack: "js", kind: "web", rules: RULES }).length > 0);
});

test("platform gates keep hover out of web", () => {
  const source = 'const x = <div className="hover:bg-red-500" />;';
  const web = scanSource(source, "a.tsx", { stack: "js", kind: "web", rules: RULES });
  const mobile = scanSource(source, "a.tsx", { stack: "js", kind: "mobile", rules: RULES });
  assert.equal(web.some((f) => f.rule === "ux.hover-only"), false);
  assert.equal(mobile.some((f) => f.rule === "ux.hover-only"), true);
});
