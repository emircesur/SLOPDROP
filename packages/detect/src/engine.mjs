// The deterministic detector. Reads source, never runs it.
// Zero dependencies: node:fs and node:path only.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { compilePattern, detectableRules } from "../../rules/index.mjs";
import { fingerprint, sortFindings } from "../../core/index.mjs";
import { failsContrast, textHasColor } from "./color.mjs";

export const VERSION = 1;

export const STACK_BY_EXT = {
  ".swift": "swift",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".dart": "dart",
  ".tsx": "js",
  ".jsx": "js",
  ".ts": "js",
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".vue": "web",
  ".svelte": "web",
  ".astro": "web",
  ".html": "web",
  ".htm": "web",
  ".xml": "xml",
  ".css": "css",
  ".scss": "css",
};

const SKIP_DIRS = new Set([
  "node_modules", ".git", "Pods", "build", "dist", ".expo", ".dart_tool",
  "DerivedData", ".gradle", ".idea", ".vscode", "coverage", "vendor", ".next",
  "www", ".slopdrop", "Carthage", ".build", "generated", "__generated__",
]);

const TEST_FILE =
  /(^|[./_-])(test|tests|spec|stories|story|preview|previews|fixture|fixtures|mock|mocks)\.[a-z]+$|Tests?\.(swift|kt)$|_test\.dart$|Preview/;
const TEST_DIR = /^(?:__tests__|__mocks__|__fixtures__|test|tests|testing|fixtures|mocks|androidTest|testDebug|UITests|e2e)$/;

const SEVERITY_RANK = { critical: 0, noticeable: 1, minor: 2 };

// ---------- text helpers ----------

/**
 * Replace comments with spaces while keeping offsets and newlines, so rules
 * never match commented-out code and line numbers never shift.
 */
export function blankComments(text, stack) {
  const out = text.split("");
  const blank = (from, to) => {
    for (let i = from; i < to; i += 1) if (out[i] !== "\n") out[i] = " ";
  };

  if (stack === "xml" || stack === "web") {
    const html = /<!--[\s\S]*?-->/g;
    let match;
    while ((match = html.exec(text))) blank(match.index, match.index + match[0].length);
    if (stack === "xml") return out.join("");
  }

  let i = 0;
  let quote = null;
  while (i < text.length) {
    const char = text[i];
    const next = text[i + 1];

    if (quote) {
      if (char === "\\") {
        i += 2;
        continue;
      }
      if (char === quote || (char === "\n" && quote !== "`")) quote = null;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      i += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      if (text[i - 1] === ":") {
        i += 1;
        continue;
      }
      const end = text.indexOf("\n", i);
      const stop = end === -1 ? text.length : end;
      blank(i, stop);
      i = stop;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }

    i += 1;
  }

  return out.join("");
}

export function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text[i] === "\n") starts.push(i + 1);
  return starts;
}

export function lineAt(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

// ---------- project context ----------

const kindCache = new Map();

/** What the nearest package.json says the code ships to. */
export function projectKind(dir) {
  const start = resolve(dir);
  if (kindCache.has(start)) return kindCache.get(start);

  let kind = "unknown";
  let pkg = null;
  try {
    pkg = readFileSync(join(start, "package.json"), "utf8");
  } catch {
    // No package.json here; keep walking up.
  }

  if (pkg !== null) {
    let deps = [];
    try {
      const parsed = JSON.parse(pkg);
      deps = Object.keys({ ...parsed.dependencies, ...parsed.devDependencies, ...parsed.peerDependencies });
    } catch {
      deps = [];
    }
    const has = (re) => deps.some((d) => re.test(d));
    const mobile = has(/^(?:react-native|expo|@capacitor\/|@ionic\/|nativescript|@nativescript\/)/);
    const universal = has(/^(?:react-native-web|@expo\/metro-runtime)$/);
    const web = has(/^(?:react-dom|next|vue|nuxt|svelte|@sveltejs\/kit|astro|@angular\/core|solid-js|@remix-run\/|vite|preact|gatsby)$/);
    kind = mobile ? (universal ? "universal" : "mobile") : web ? "web" : "unknown";
  }

  if (kind === "unknown" && dirname(start) !== start) kind = projectKind(dirname(start));
  kindCache.set(start, kind);
  return kind;
}

export function loadConfig(root) {
  const candidates = [];
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    candidates.push(join(dir, ".slopdrop", "config.json"));
    if (dirname(dir) === dir) break;
  }
  candidates.push(join(process.cwd(), ".slopdrop", "config.json"));

  for (const file of candidates) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf8"));
      return {
        ignoreRules: Array.isArray(raw.ignoreRules) ? raw.ignoreRules : [],
        ignorePaths: Array.isArray(raw.ignorePaths) ? raw.ignorePaths : [],
        configPath: file,
      };
    } catch {
      // Missing or unreadable: defaults.
    }
  }
  return { ignoreRules: [], ignorePaths: [], configPath: null };
}

// ---------- walking ----------

export function walk(target, opts = {}, out = []) {
  let stat;
  try {
    stat = statSync(target);
  } catch {
    throw new Error(`Cannot read ${target}`);
  }

  if (stat.isFile()) {
    if (STACK_BY_EXT[extname(target).toLowerCase()]) out.push(target);
    return out;
  }

  for (const entry of readdirSync(target, { withFileTypes: true })) {
    const full = join(target, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      if (!opts.includeTests && TEST_DIR.test(entry.name)) continue;
      walk(full, opts, out);
    } else if (entry.isFile()) {
      if (!STACK_BY_EXT[extname(entry.name).toLowerCase()]) continue;
      if (!opts.includeTests && TEST_FILE.test(entry.name)) continue;
      if (/\.(?:min|d)\.(?:js|ts)$/.test(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

// ---------- scanning ----------

function ignoredByComment(lines, line, ruleId) {
  const previous = lines[line - 2];
  const own = previous && /^\s*(?:\/\/|\/\*|\*|<!--|#)/.test(previous) ? previous : null;
  for (const candidate of [lines[line - 1], own]) {
    if (!candidate) continue;
    const match = /slopdrop-ignore(?:\s+([\w.-]+(?:\s*,\s*[\w.-]+)*))?/.exec(candidate);
    if (match && (!match[1] || match[1].split(/\s*,\s*/).includes(ruleId))) return true;
  }
  return false;
}

function fileMatches(code, patterns = []) {
  return patterns.every((pattern) => compilePattern(pattern).test(code));
}

function fileExcluded(code, patterns = []) {
  return patterns.some((pattern) => compilePattern(pattern).test(code));
}

export function scanSource(text, file, options = {}) {
  const stack = options.stack ?? STACK_BY_EXT[extname(file).toLowerCase()];
  if (!stack) return [];

  if (stack === "xml" && !/<(?:LinearLayout|ConstraintLayout|TextView|FrameLayout|RelativeLayout|manifest|application|shape|gradient|resources|androidx\.)/.test(text)) {
    return [];
  }

  const code = blankComments(text, stack);
  const starts = lineStarts(text);
  const lines = text.split("\n");
  const ignored = new Set(options.ignoreRules ?? []);
  const kind = options.kind ?? "unknown";
  const rules = options.rules ?? detectableRules();
  const findings = [];

  for (const rule of rules) {
    if (ignored.has(rule.id)) continue;
    if (rule.stacks && !rule.stacks.includes(stack)) continue;
    if (rule.platforms && kind !== "unknown" && !rule.platforms.includes(kind)) continue;
    if (rule.fileRequires && !fileMatches(code, rule.fileRequires)) continue;
    if (rule.fileExcludes && fileExcluded(code, rule.fileExcludes)) continue;

    const seenLines = new Set();
    const hits = [];
    let sameLineHits = 0;

    for (const pattern of rule.patterns) {
      const regex = compilePattern(pattern, rule.ignoreCase ? "i" : "");
      for (const match of code.matchAll(regex)) {
        const line = lineAt(starts, match.index);
        if (seenLines.has(line)) {
          // A per-file rule counts every match, so minified CSS is not undercounted.
          if (rule.perFile && (!pattern.colors || textHasColor(match[0], pattern.colors))) sameLineHits += 1;
          continue;
        }
        if (pattern.colors && !textHasColor(match[0], pattern.colors)) continue;
        if (pattern.contrast && !failsContrast(match[0], pattern.contrast)) continue;
        if (ignoredByComment(lines, line, rule.id)) continue;
        if (rule.excludePatterns) {
          const lineText = lines[line - 1] ?? "";
          if (rule.excludePatterns.some((p) => compilePattern(p).test(lineText))) continue;
        }
        seenLines.add(line);
        hits.push({ line, index: match.index });
      }
    }

    if (hits.length === 0) continue;
    if (rule.perFile && hits.length + sameLineHits < (rule.minMatches ?? 1)) continue;

    const selected = rule.perFile ? [hits.sort((a, b) => a.index - b.index)[0]] : hits;

    for (const hit of selected) {
      const snippet = (lines[hit.line - 1] ?? "").trim().slice(0, 160);
      findings.push({
        rule: rule.id,
        family: rule.family,
        severity: rule.severity,
        file,
        line: hit.line,
        snippet,
        message: rule.message,
        fix: rule.fix,
        heuristic: Boolean(rule.heuristic),
        fingerprint: fingerprint({ rule: rule.id, file, snippet }),
      });
    }
  }

  return sortFindings(findings);
}

export function scan(targets, opts = {}) {
  const findings = [];
  const unreadable = [];
  let filesScanned = 0;

  for (const target of targets) {
    const root = resolve(target);
    const config = loadConfig(statSync(root).isDirectory() ? root : dirname(root));
    const ignoreRules = [...config.ignoreRules, ...(opts.ignoreRules ?? [])];

    for (const file of walk(root, opts)) {
      const rel = relative(process.cwd(), file) || file;
      const posix = rel.split("\\").join("/");
      if (config.ignorePaths.some((p) => posix.includes(p))) continue;

      let text;
      try {
        text = readFileSync(file, "utf8");
      } catch {
        unreadable.push(posix);
        continue;
      }
      if (text.length > 1_000_000) continue;

      filesScanned += 1;
      const kind = opts.platform ?? projectKind(dirname(file));
      findings.push(...scanSource(text, posix, { ignoreRules, kind }));
    }
  }

  return {
    version: VERSION,
    filesScanned,
    unreadable,
    findings: findings.sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        a.file.localeCompare(b.file) ||
        a.line - b.line,
    ),
  };
}
