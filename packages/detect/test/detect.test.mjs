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

for (const [lang, dir] of [["tr", BANK], ["en", join(BANK, "en")]]) {
  test(`Kıyı Bank (${lang}): the befores are caught, the treated screens are clean`, () => {
    const neon = scan([join(dir, "neon.html")], { platform: "web", rules: RULES });
    const ids = new Set(neon.findings.map((f) => f.rule));
    for (const expected of ["ui.slop-gradient", "ui.glow-shadow", "ui.icon-tile", "ui.sparkle-icon", "copy.welcome-back"]) {
      assert.ok(ids.has(expected), `expected ${expected}, got ${[...ids].join(", ")}`);
    }
    assert.equal(neon.findings.length, 16, `neon: ${neon.findings.length} findings`);

    const generic = scan([join(dir, "generic.html")], { platform: "web", rules: RULES });
    const genericIds = new Set(generic.findings.map((f) => f.rule));
    for (const expected of ["ui.icon-tile", "ui.pillow-radius", "copy.welcome-back"]) {
      assert.ok(genericIds.has(expected), `generic: expected ${expected}, got ${[...genericIds].join(", ")}`);
    }

    for (const name of ["treated.html", "neon-treated.html"]) {
      for (const platform of ["web", "mobile"]) {
        const result = scan([join(dir, name)], { platform, rules: RULES });
        assert.deepEqual(result.findings, [], `${lang}/${name} on ${platform}`);
      }
    }
  });
}

test("Linden Bakehouse: the SaaS template on a bakery trips many families, the treated site none", () => {
  const dir = join(ROOT, "examples", "linden-bakehouse");
  const slop = scan([join(dir, "slop.html")], { platform: "web", rules: RULES });
  const ids = new Set(slop.findings.map((f) => f.rule));
  for (const expected of [
    "ui.slop-gradient", "ui.gradient-text", "ui.glow-shadow", "ui.glass-everywhere", "ui.tracked-caps-label",
    "copy.buzzword", "copy.exclamation", "truth.unverified-claim", "truth.invented-stat", "truth.placeholder-content",
    "a11y.low-contrast", "a11y.tiny-text", "motion.hover-scale", "web.chatbot-bubble",
  ]) {
    assert.ok(ids.has(expected), `expected ${expected}, got ${[...ids].join(", ")}`);
  }
  assert.ok(new Set(slop.findings.map((f) => f.family)).size >= 6, "spans at least six rule families");
  for (const platform of ["web", "mobile"]) {
    assert.deepEqual(scan([join(dir, "treated.html")], { platform, rules: RULES }).findings, [], `treated on ${platform}`);
  }
});

test("greetings with a name are caught in English and Turkish", () => {
  for (const text of ["Good evening, Dana", "Hello, Dana", "Hi, {user.name}", "Welcome back!", "İyi akşamlar, Deniz", "Merhaba, Deniz", "Hoş geldin!"]) {
    assert.ok(ruleIds(html(`<h1>${text}</h1>`)).includes("copy.welcome-back"), text);
  }
  for (const text of ["Hello world", "This is a high-yield account", "Hi there"]) {
    assert.ok(!ruleIds(html(`<h1>${text}</h1>`)).includes("copy.welcome-back"), text);
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
    assert.equal(main([generic, "--platform", "web", "--fail-on", "critical"]), 0, "no critical hits, so the build passes");
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

// ---------- contrast, tiny text, placeholders, radius, exclamation ----------

test("contrast is computed from the colors in one rule", async () => {
  const { contrastRatio, parseSolid } = await import("../src/color.mjs");
  assert.equal(Math.round(contrastRatio(parseSolid("#000"), parseSolid("#fff"))), 21);
  assert.ok(ruleIds(css(".hint{color:#999;background:#fff}")).includes("a11y.low-contrast"));
  assert.ok(ruleIds(css(".cta{color:#fff;background-color:#7cedd4}")).includes("a11y.low-contrast"));
  assert.ok(ruleIds(html('<p style={{ color: "#aaa", backgroundColor: "white" }}>x</p>')).includes("a11y.low-contrast"));
  // Passing pairs, large text at 3:1, and pairs the detector cannot resolve stay quiet.
  assert.ok(!ruleIds(css(".ok{color:#767676;background:#fff}")).includes("a11y.low-contrast"));
  assert.ok(!ruleIds(css(".big{color:#949494;background:#fff;font-size:28px}")).includes("a11y.low-contrast"));
  assert.ok(!ruleIds(css(".v{color:var(--ink);background:#fff}")).includes("a11y.low-contrast"));
  assert.ok(!ruleIds(css(".g{color:#eee;background:linear-gradient(#fff,#eee)}")).includes("a11y.low-contrast"));
  assert.ok(!ruleIds(css(".a{color:#eeeeee80;background:#fff}")).includes("a11y.low-contrast"), "translucent text is not judged");
});

test("tiny text is under 11px in any unit", () => {
  for (const source of [".a{font-size:10px}", ".a{font-size:.6rem}", ".a{font-size:9.5px}"]) {
    assert.ok(ruleIds(css(source)).includes("a11y.tiny-text"), source);
  }
  assert.ok(ruleIds(scanSource("const s = { fontSize: 9 };", "a.tsx", { stack: "js", kind: "mobile", rules: RULES })).includes("a11y.tiny-text"));
  assert.ok(ruleIds(html('<span class="text-[10px]">x</span>')).includes("a11y.tiny-text"));
  for (const source of [".a{font-size:11px}", ".a{font-size:.69rem}", ".a{font-size:100px}", ".a{font-size:0}", ".a{font-size:1.6rem}"]) {
    assert.ok(!ruleIds(css(source)).includes("a11y.tiny-text"), source);
  }
});

const lines = (...parts) => parts.join("\n");

test("placeholder content is caught", () => {
  const ids = ruleIds(html(lines("<p>Lorem ipsum dolor sit amet</p>", "<p>John Doe</p>", "<p>Ahmet Yılmaz</p>", "<p>Acme Inc.</p>")));
  assert.equal(ids.filter((id) => id === "truth.placeholder-content").length, 4);
  assert.ok(!ruleIds(html('<input placeholder="you@example.com">')).includes("truth.placeholder-content"));
});

test("pillow radius needs four large radii in a file", () => {
  const three = lines(".a{border-radius:22px}.b{border-radius:19px}", ".c{border-radius:24px}");
  assert.ok(!ruleIds(css(three)).includes("ui.pillow-radius"));
  const four = lines(three, ".d{border-radius:20px}");
  assert.equal(ruleIds(css(four)).filter((id) => id === "ui.pillow-radius").length, 1);
  const calm = lines(".a{border-radius:12px}.b{border-radius:12px}", ".c{border-radius:50%}", ".d{border-radius:16px}", ".e{border-radius:8px}");
  assert.ok(!ruleIds(css(calm)).includes("ui.pillow-radius"));
});

test("exclamation marks are counted per file", () => {
  assert.ok(!ruleIds(html(lines("<p>Saved!</p>", "<p>Done.</p>"))).includes("copy.exclamation"));
  const loud = lines("<p>Saved!</p>", "<p>You're all set!</p>", "<p>Great job!</p>");
  assert.equal(ruleIds(html(loud)).filter((id) => id === "copy.exclamation").length, 1);
  assert.ok(!ruleIds(html(lines("<p>{a !== b}</p>", "<p>{!x}</p>", "<p>{!y}</p>"))).includes("copy.exclamation"));
});

