#!/usr/bin/env node
// Renders the README's before/after picture from the example screens.
//
//   node scripts/before-after.mjs              # English and Turkish
//   node scripts/before-after.mjs --lang en    # one language
//
// Needs a local Chrome or Chromium (set CHROME_PATH if it is not found).
// Everything is computed: the screenshots, where the markers sit, and the
// detector output in the terminal panels. Nothing in the picture is typed in
// by hand except the treatment notes.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scan } from "../packages/detect/src/engine.mjs";
import { detectableRules } from "../packages/rules/index.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "assets");
const PHONE = { width: 412, height: 856 };

const COPY = {
  en: {
    dir: "examples/kiyi-bank/en",
    subtitle: "The same bank screen and the same data, before and after one review-and-treat pass.",
    before: "Before SLOPDROP",
    after: "After SLOPDROP",
    findings: (n) => (n === 1 ? "1 finding" : `${n} findings`),
    rules: {
      "ui.slop-gradient": "purple and pink fills",
      "ui.glow-shadow": "colored halos",
      "ui.sparkle-icon": "sparkle after the name",
      "copy.welcome-back": "greeting as headline",
      "ui.icon-tile": "tinted icon squares",
      "ui.pillow-radius": "pillow-soft corners",
      "a11y.low-contrast": "text fails contrast",
      "a11y.tiny-text": "text under 11px",
    },
    notes: [
      "Flat surfaces, one filled button",
      "Rows merged into one list: 5 visible",
      "Spending chart from the same records",
      "Order of tabs and actions kept",
      "Design review 20/24 in the visit note",
    ],
    footer: "Shore Bank is fictional and the data is sample data. Screens: examples/kiyi-bank/en/. Rendered by scripts/before-after.mjs.",
  },
  tr: {
    dir: "examples/kiyi-bank",
    subtitle: "Aynı banka ekranı, aynı veri: bir inceleme ve düzeltme turundan önce ve sonra.",
    before: "SLOPDROP öncesi",
    after: "SLOPDROP sonrası",
    findings: (n) => `${n} bulgu`,
    rules: {
      "ui.slop-gradient": "mor ve pembe dolgular",
      "ui.glow-shadow": "renkli parlamalar",
      "ui.sparkle-icon": "isimden sonra yıldız",
      "copy.welcome-back": "başlık olarak selam",
      "ui.icon-tile": "renkli ikon kareleri",
      "ui.pillow-radius": "yastık gibi köşeler",
      "a11y.low-contrast": "kontrast yetersiz",
      "a11y.tiny-text": "11px altı yazı",
    },
    notes: [
      "Düz yüzeyler, tek dolu düğme",
      "Hareketler tek listede: 5 satır görünür",
      "Harcama grafiği aynı kayıtlardan",
      "Sekme ve işlem sırası korundu",
      "Ziyaret notunda tasarım puanı 20/24",
    ],
    footer: "Kıyı Bank kurgusaldır, veriler örnektir. Ekranlar: examples/kiyi-bank/. Çizen: scripts/before-after.mjs.",
  },
};

// Where each rule's marker goes on the "before" screen: a selector and the
// corner of its box the marker sits on. Rules without an entry get no marker.
const MARKERS = {
  "ui.slop-gradient": { selector: ".hero", at: "left", dy: 0.3 },
  "ui.glow-shadow": { selector: ".mark", at: "top-right" },
  "ui.sparkle-icon": { selector: ".spark", at: "top-right" },
  "copy.welcome-back": { selector: ".greeting h1", at: "left", dy: 0.5 },
  "ui.icon-tile": { selector: ".tx-icon", at: "left", dy: 0.5 },
};

// ---------- Chrome over the DevTools protocol ----------

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "slopdrop-shot-"));
  const child = spawn(
    findChrome(),
    ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const url = await new Promise((ok, fail) => {
    let buffer = "";
    const timer = setTimeout(() => fail(new Error("Chrome did not start")), 20000);
    child.stderr.on("data", (chunk) => {
      buffer += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(buffer);
      if (match) {
        clearTimeout(timer);
        ok(match[1]);
      }
    });
  });

  const socket = new WebSocket(url);
  await new Promise((ok) => socket.addEventListener("open", ok, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, fail } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) fail(new Error(msg.error.message));
      else ok(msg.result);
    } else {
      for (const listener of listeners) listener(msg);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((ok, fail) => {
      id += 1;
      pending.set(id, { ok, fail });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  await page("Page.enable");
  await page("Runtime.enable");

  return {
    async open(url, width, height) {
      await page("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: false });
      const loaded = new Promise((ok) => {
        const listener = (msg) => {
          if (msg.method === "Page.loadEventFired" && msg.sessionId === sessionId) {
            listeners.delete(listener);
            ok();
          }
        };
        listeners.add(listener);
      });
      await page("Page.navigate", { url });
      await loaded;
      await new Promise((ok) => setTimeout(ok, 600)); // canvases draw after load
    },
    async evaluate(expression) {
      const { result } = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      return result.value;
    },
    async screenshot(width, height) {
      const { data } = await page("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 } });
      return data;
    },
    async close() {
      socket.close();
      child.kill();
      await new Promise((ok) => setTimeout(ok, 300));
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

// ---------- the picture ----------

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function detectorRun(file) {
  const result = scan([file], { platform: "web", rules: detectableRules() });
  const counts = new Map();
  for (const f of result.findings) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);
  const severities = ["critical", "noticeable", "minor"]
    .map((s) => [s, result.findings.filter((f) => f.severity === s).length])
    .filter(([, n]) => n);
  return { total: result.findings.length, counts: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), severities };
}

function summaryLine(run) {
  if (!run.total) return "No findings in 1 files.";
  return `${run.total} findings (${run.severities.map(([s, n]) => `${n} ${s}`).join(", ")})`;
}

function page({ copy, before, after, beforeRun, afterRun, beforeShot, afterShot, markers }) {
  const numbered = new Map(beforeRun.counts.map(([rule], i) => [rule, i + 1]));
  const dots = markers
    .filter((m) => numbered.has(m.rule))
    .map((m) => `<span class="dot" style="left:${m.x}px;top:${m.y}px">${numbered.get(m.rule)}</span>`)
    .join("");
  const hits = beforeRun.counts
    .map(([rule, n]) => `<li><span class="dot small">${numbered.get(rule)}</span><code>${n}x ${esc(rule)}</code><em>${esc(copy.rules[rule] ?? "")}</em></li>`)
    .join("");
  const notes = copy.notes.map((n) => `<li><span class="ok"></span>${esc(n)}</li>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:932px;background:#f3f1ec;color:#1b1d22;font:16px/1.35 "Segoe UI",system-ui,sans-serif;padding:32px 36px 28px}
h1{font-size:38px;margin:0 0 2px;letter-spacing:-.5px}.sub{color:#686c76;font-size:16px;margin:0 0 30px}
.cols{display:grid;grid-template-columns:412px 412px;gap:36px}
h2{font-size:20px;margin:0}.meta{color:#686c76;font-size:14px;margin:2px 0 14px}
.phone{position:relative;width:412px;height:856px}
.phone img{display:block;width:412px;height:856px;border-radius:14px;outline:1px solid #d6d1c8}
.dot{position:absolute;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;background:#d65c52;color:#fff;font:700 13px/26px "Segoe UI",system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2.5px #fff}
.dot.small{position:static;transform:none;display:inline-block;width:20px;height:20px;line-height:20px;font-size:11px;box-shadow:0 0 0 2px #fff;margin-right:12px;flex:none}
.term{margin-top:22px;background:#181a1f;color:#e2e4e8;border-radius:11px;padding:16px 17px;min-height:204px;font:13.5px/1.55 Consolas,"SF Mono",Menlo,monospace}
.term .cmd b{color:#8c929e;font-weight:700}.term .cmd{font-weight:700}
.term .bad{color:#f0968c}.term .good{color:#8cdcb9}
.term ul{list-style:none;margin:6px 0 0;padding:0}.term li{display:flex;align-items:center;min-height:23px}
.term code{font:inherit;width:168px;flex:none}.term em{font-style:normal;color:#8c929e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ok{width:12px;height:12px;border-radius:50%;background:#4ebe96;margin:0 16px 0 4px;flex:none}
.foot{color:#686c76;font-size:12px;margin-top:22px}
</style></head><body>
<h1>SLOPDROP</h1><p class="sub">${esc(copy.subtitle)}</p>
<div class="cols">
 <section><h2>${esc(copy.before)}</h2><p class="meta">${esc(before)} · ${esc(copy.findings(beforeRun.total))}</p>
  <div class="phone"><img src="data:image/png;base64,${beforeShot}" alt="">${dots}</div>
  <div class="term"><div class="cmd"><b>$</b> slopdrop detect ${esc(before)}</div><div class="${beforeRun.total ? "bad" : "good"}">${esc(summaryLine(beforeRun))}</div><ul>${hits}</ul></div>
 </section>
 <section><h2>${esc(copy.after)}</h2><p class="meta">${esc(after)} · ${esc(copy.findings(afterRun.total))}</p>
  <div class="phone"><img src="data:image/png;base64,${afterShot}" alt=""></div>
  <div class="term"><div class="cmd"><b>$</b> slopdrop detect ${esc(after)}</div><div class="${afterRun.total ? "bad" : "good"}">${esc(summaryLine(afterRun))}</div><ul>${notes}</ul></div>
 </section>
</div>
<p class="foot">${esc(copy.footer)}</p>
</body></html>`;
}

const MARKER_JS = (spec) => `(() => {
  const spec = ${JSON.stringify(spec)};
  return Object.entries(spec).flatMap(([rule, m]) => {
    const el = document.querySelector(m.selector);
    if (!el) return [];
    const r = el.getBoundingClientRect();
    const x = m.at === "top-right" ? r.right - 2 : 0; // left markers sit on the phone edge, off the content
    const y = m.at === "top-right" ? r.top + 2 : r.top + r.height * (m.dy ?? 0.5);
    return [{ rule, x: Math.round(x), y: Math.round(y) }];
  });
})()`;

async function render(browser, lang) {
  const copy = COPY[lang];
  const before = "neon.html";
  const after = "neon-treated.html";
  const beforeFile = join(ROOT, copy.dir, before);
  const afterFile = join(ROOT, copy.dir, after);

  await browser.open(pathToFileURL(beforeFile).href, PHONE.width, PHONE.height);
  const markers = await browser.evaluate(MARKER_JS(MARKERS));
  const beforeShot = await browser.screenshot(PHONE.width, PHONE.height);
  await browser.open(pathToFileURL(afterFile).href, PHONE.width, PHONE.height);
  const afterShot = await browser.screenshot(PHONE.width, PHONE.height);

  const html = page({
    copy,
    before,
    after,
    beforeRun: detectorRun(beforeFile),
    afterRun: detectorRun(afterFile),
    beforeShot,
    afterShot,
    markers,
  });
  const tmp = mkdtempSync(join(tmpdir(), "slopdrop-page-"));
  const file = join(tmp, "before-after.html");
  writeFileSync(file, html);
  await browser.open(pathToFileURL(file).href, 932, 600);
  const height = await browser.evaluate("Math.ceil(document.documentElement.scrollHeight)");
  await browser.open(pathToFileURL(file).href, 932, height);
  const png = await browser.screenshot(932, height);
  rmSync(tmp, { recursive: true, force: true });

  const out = join(OUT, `before-after.${lang}.png`);
  writeFileSync(out, Buffer.from(png, "base64"));
  console.log(`${out.slice(ROOT.length + 1)}  (${lang})`);
}

const args = process.argv.slice(2);
const only = args.includes("--lang") ? [args[args.indexOf("--lang") + 1]] : Object.keys(COPY);
for (const lang of only) if (!COPY[lang]) throw new Error(`Unknown language ${lang}. Use ${Object.keys(COPY).join(", ")}.`);

const browser = await launch();
try {
  for (const lang of only) await render(browser, lang);
} finally {
  await browser.close();
}
