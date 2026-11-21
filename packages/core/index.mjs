// Pure functions shared by the CLI, the MCP server, and any future web app.
// No filesystem, no process, no network.

export const DIMENSIONS = [
  { key: "taskPath", label: "Task path" },
  { key: "truth", label: "Truth" },
  { key: "nativeFit", label: "Native fit" },
  { key: "states", label: "States and input" },
  { key: "access", label: "Access" },
  { key: "specificity", label: "Specificity" },
];

export const MAX_TOTAL = DIMENSIONS.length * 4;

export const BANDS = [
  { key: "clean", label: "Clean", min: 21, note: "Minor polish." },
  { key: "smudged", label: "Smudged", min: 16, note: "Address the weak dimensions." },
  { key: "sloppy", label: "Sloppy", min: 11, note: "Significant work." },
  { key: "deep-slop", label: "Deep slop", min: 0, note: "Start with Critical and Task path." },
];

/** Bands that must be estimated when the review is code-only. */
export const ESTIMATED_DIMENSIONS = ["nativeFit", "states", "access"];

export const SEVERITY_RANK = { critical: 0, noticeable: 1, minor: 2, "ask-first": 3 };

export class ScoreError extends TypeError {}

export function bandFor(total) {
  if (!Number.isInteger(total) || total < 0 || total > MAX_TOTAL) {
    throw new ScoreError(`total must be an integer between 0 and ${MAX_TOTAL}, got ${total}`);
  }
  return BANDS.find((b) => total >= b.min);
}

export function slopIndex(total) {
  return Math.round(((MAX_TOTAL - total) / MAX_TOTAL) * 100);
}

export function computeScore({ dimensions, estimates = [] } = {}) {
  if (!dimensions || typeof dimensions !== "object") throw new ScoreError("dimensions is required");

  const scores = {};
  let total = 0;
  for (const { key } of DIMENSIONS) {
    const value = dimensions[key];
    if (!Number.isInteger(value) || value < 0 || value > 4) {
      throw new ScoreError(`${key} must be an integer 0-4, got ${JSON.stringify(value)}`);
    }
    scores[key] = value;
    total += value;
  }

  const unknownEstimates = estimates.filter((k) => !DIMENSIONS.some((d) => d.key === k));
  if (unknownEstimates.length) throw new ScoreError(`unknown estimate keys: ${unknownEstimates.join(", ")}`);

  const band = bandFor(total);
  return {
    dimensions: scores,
    estimates: [...new Set(estimates)],
    total,
    band: band.key,
    bandLabel: band.label,
    index: slopIndex(total),
  };
}

export function severityRank(severity) {
  return SEVERITY_RANK[severity] ?? 99;
}

export function summarizeSeverities(findings = []) {
  const counts = { critical: 0, noticeable: 0, minor: 0, "ask-first": 0 };
  for (const f of findings) if (f.severity in counts) counts[f.severity] += 1;
  return counts;
}

export function sortFindings(findings = []) {
  return [...findings].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      String(a.file).localeCompare(String(b.file)) ||
      Number(a.line) - Number(b.line) ||
      String(a.rule).localeCompare(String(b.rule)),
  );
}

// ---------- fingerprints ----------

export function normalizePath(file) {
  return String(file).replace(/\\/g, "/").replace(/^\.\//, "");
}

/** 64-bit FNV-1a. Deterministic, dependency-free, good enough to identify a finding. */
export function hash64(input) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

/**
 * A finding keeps its identity when lines move, because the line number is not
 * part of the hash. The snippet and optional anchor are.
 */
export function fingerprint({ rule, file, snippet = "", anchor = "" }) {
  if (!rule) throw new Error("fingerprint needs a rule id");
  return hash64([rule, normalizePath(file), String(snippet).trim(), String(anchor).trim()].join("\u0000"));
}

// ---------- waivers ----------

function globToRegExp(glob) {
  let out = "^";
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      out += ".*";
      i += 1;
    } else if (c === "*") {
      out += "[^/]*";
    } else if (c === "?") {
      out += ".";
    } else {
      out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`${out}$`);
}

export function ruleMatches(waiverRule, ruleId) {
  if (waiverRule === ruleId) return true;
  if (waiverRule.endsWith(".*")) return ruleId.startsWith(waiverRule.slice(0, -1));
  return false;
}

export function waiverApplies(waiver, finding, now = Date.now()) {
  if (waiver.status !== "accepted") return false;
  if (waiver.expiresAt && Date.parse(waiver.expiresAt) < now) return false;
  if (!ruleMatches(waiver.rule, finding.rule)) return false;
  if (!waiver.scope || waiver.scope === "project") return true;
  return globToRegExp(waiver.scope).test(normalizePath(finding.file));
}

export function applyWaivers(findings = [], waivers = [], now = Date.now()) {
  return findings.map((finding) => {
    const waiver = waivers.find((w) => waiverApplies(w, finding, now));
    return waiver ? { ...finding, status: "waived", waiver: { reason: waiver.reason, approvedBy: waiver.approvedBy } } : finding;
  });
}

export function dedupeFindings(findings = []) {
  const seen = new Map();
  for (const finding of findings) {
    const key = finding.fingerprint ?? fingerprint(finding);
    if (!seen.has(key)) seen.set(key, { ...finding, fingerprint: key });
  }
  return [...seen.values()];
}
