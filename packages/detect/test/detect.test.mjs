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

// ---------- color-aware rules ----------

const ROOT = join(HERE, "..", "..", "..");
const BANK = join(ROOT, "examples", "kiyi-bank");
const css = (source, kind = "web") => scanSource(source, "a.css", { stack: "css", kind, rules: RULES });
const html = (source, kind = "web") => scanSource(source, "a.html", { stack: "web", kind, rules: RULES });
const ruleIds = (findings) => findings.map((f) => f.rule);

test("parseColors reads hex, rgb, hsl, ARGB, and names", async () => {
  const { parseColors } = await import("../src/color.mjs");
  const colors = parseColors("#7C3AED rgba(124, 58, 237, .5) hsl(262 83% 58%) 0xFF7C3AED Color.purple");
  assert.equal(colors.length, 5);
  for (const c of colors) assert.ok(c.h > 255 && c.h <= 300, `hue ${c.h}`);
  assert.ok(colors.some((c) => c.a === 0.5), "alpha from rgba");
});

test("slop gradient reads the hue, not the spelling", () => {
  // Purple in any case and any notation.
  assert.ok(ruleIds(css(".a{background:linear-gradient(135deg,#7C3AED,#DB2777)}")).includes("ui.slop-gradient"));
  assert.ok(ruleIds(css(".a{background:radial-gradient(circle,hsl(270 70% 50%),transparent)}")).includes("ui.slop-gradient"));
  const canvas = "const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#ff8fff');g.addColorStop(1,'#64f5ff');";
  assert.ok(ruleIds(scanSource(canvas, "a.js", { stack: "js", kind: "web", rules: RULES })).includes("ui.slop-gradient"));
  // Neutral and on-brand gradients are not the default AI palette.
  assert.ok(!ruleIds(css(".a{background:linear-gradient(180deg,#ffffff,#f5f5f5)}")).includes("ui.slop-gradient"));
  assert.ok(!ruleIds(css(".a{background:linear-gradient(90deg,#17318d,#4071de)}")).includes("ui.slop-gradient"));
  assert.ok(!ruleIds(css(".a{background:linear-gradient(#a3e635,#65a30d)}")).includes("ui.slop-gradient"));
});

test("glow is a blurred saturated halo, not a focus ring or a soft shadow", () => {
  assert.ok(ruleIds(css(".a{box-shadow:0 0 16px #b23cf587}")).includes("ui.glow-shadow"));
  assert.ok(ruleIds(css(".a{text-shadow:0 0 10px #ed60ff}")).includes("ui.glow-shadow"));
  assert.ok(ruleIds(css(".a{filter:drop-shadow(0 0 4px #32e4ff)}")).includes("ui.glow-shadow"));
  assert.ok(ruleIds(html('<div class="shadow-[0_0_24px_#a855f7]"></div>')).includes("ui.glow-shadow"));
  assert.ok(!ruleIds(css(".a{box-shadow:0 0 0 3px #6366f1}")).includes("ui.glow-shadow"), "focus ring");
  assert.ok(!ruleIds(css(".a{box-shadow:0 0 65px #26335413}")).includes("ui.glow-shadow"), "faint neutral ambient");
  assert.ok(!ruleIds(css(".a{box-shadow:0 4px 12px rgba(0,0,0,.12)}")).includes("ui.glow-shadow"), "elevation");
});

test("icon tiles are found in plain CSS, circles are not", () => {
  const tile = ".tx-icon{display:grid;place-items:center;width:33px;height:33px;border-radius:10px;background:#4c263c}";
  assert.ok(ruleIds(css(tile)).includes("ui.icon-tile"));
  const circle = ".avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:50%}";
  assert.ok(!ruleIds(css(circle)).includes("ui.icon-tile"));
  const wide = ".pill{display:flex;align-items:center;min-width:40px;width:120px;height:40px;border-radius:8px}";
  assert.ok(!ruleIds(css(wide)).includes("ui.icon-tile"));
});

test("sparkle glyphs count as sparkle icons", () => {
  assert.ok(ruleIds(html('<span class="spark">✧</span>')).includes("ui.sparkle-icon"));
  assert.ok(ruleIds(html("<span>✦ Yeni</span>")).includes("ui.sparkle-icon"));
});

// ---------- Turkish copy ----------

test("Turkish copy slop is caught", () => {
  const ids = ruleIds(
    html(
      [
        "<h1>İyi akşamlar, Deniz</h1>",
        "<p>Bir şeyler ters gitti</p>",
        "<p>Bir hata oluştu.</p>",
        "<p>Finansal potansiyelini açığa çıkar</p>",
        "<button>Gönder</button>",
        "<p>10.000+ müşterinin güvendiği banka</p>",
      ].join("\n"),
    ),
  );
  for (const expected of ["copy.welcome-back", "copy.oops-error", "copy.buzzword", "copy.vague-button", "truth.unverified-claim"]) {
    assert.ok(ids.includes(expected), `expected ${expected}, got ${ids.join(", ")}`);
  }
});

test("Turkish copy with a cause and a next step is left alone", () => {
  const ids = ruleIds(
    html(
      [
        "<p>Bağlantı koptu. Para gönderilmedi; tekrar dene.</p>",
        "<p>Bir hata oluştu: kart numarası 16 hane olmalı.</p>",
        "<button>Para gönder</button>",
        "<p>Merhaba dünya</p>",
      ].join("\n"),
    ),
  );
  assert.deepEqual(ids, []);
});

// ---------- the Kıyı Bank field test ----------

test("Kıyı Bank: the neon screen is caught, the treated screens are clean", () => {
  const neon = scan([join(BANK, "neon.html")], { platform: "web", rules: RULES });
  const ids = new Set(neon.findings.map((f) => f.rule));
  for (const expected of ["ui.slop-gradient", "ui.glow-shadow", "ui.icon-tile", "ui.sparkle-icon", "copy.welcome-back"]) {
    assert.ok(ids.has(expected), `expected ${expected}, got ${[...ids].join(", ")}`);
  }
  assert.ok(neon.findings.length >= 12, `neon: ${neon.findings.length} findings`);

  const generic = scan([join(BANK, "generic.html")], { platform: "web", rules: RULES });
  assert.ok(generic.findings.some((f) => f.rule === "ui.icon-tile"));

  for (const name of ["treated.html", "neon-treated.html"]) {
    for (const platform of ["web", "mobile"]) {
      const result = scan([join(BANK, name)], { platform, rules: RULES });
      assert.deepEqual(result.findings, [], `${name} on ${platform}`);
    }
  }
});

// ---------- CLI: SARIF and --fail-on ----------

test("SARIF output is valid 2.1.0 with one rule entry per rule used", async () => {
  const { toSarif } = await import("../src/sarif.mjs");
  const { loadRules } = await import("../../rules/index.mjs");
  const result = scan([join(BANK, "neon.html")], { platform: "web", rules: RULES });
  const sarif = toSarif(result, loadRules());
  assert.equal(sarif.version, "2.1.0");
  const run = sarif.runs[0];
  assert.equal(run.results.length, result.findings.length);
  assert.equal(run.tool.driver.rules.length, new Set(result.findings.map((f) => f.rule)).size);
  for (const r of run.results) {
    assert.equal(run.tool.driver.rules[r.ruleIndex].id, r.ruleId);
    assert.ok(["error", "warning", "note"].includes(r.level));
    assert.ok(r.locations[0].physicalLocation.region.startLine > 0);
    assert.ok(r.partialFingerprints.slopdropFingerprint);
  }
});

test("--fail-on raises the bar for the exit code", async () => {
  const { main } = await import("../bin/slopdrop-detect.mjs");
  const log = console.log;
  console.log = () => {};
  try {
    const generic = join(BANK, "generic.html");
    assert.equal(main([generic, "--platform", "web"]), 2, "minor hits fail by default");
    assert.equal(main([generic, "--platform", "web", "--fail-on", "noticeable"]), 0, "minor hits pass the noticeable bar");
    assert.equal(main([join(BANK, "neon.html"), "--platform", "web", "--fail-on", "noticeable"]), 2);
    assert.equal(main([generic, "--format", "sarif"]), 2);
  } finally {
    console.log = log;
  }
  const error = console.error;
  console.error = () => {};
  try {
    assert.equal(main([".", "--fail-on", "loud"]), 1);
    assert.equal(main([".", "--format", "xml"]), 1);
  } finally {
    console.error = error;
  }
});
