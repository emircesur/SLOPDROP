// Loads the rule catalog. The catalog is data: no rule may import code.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const SEVERITIES = ["critical", "noticeable", "minor"];
export const PLATFORMS = ["mobile", "web", "universal", "spatial", "unknown"];
export const STACKS = ["js", "web", "css", "swift", "kotlin", "dart", "xml"];

let cache = null;

/** All rules, flattened, with `family` attached. */
export function loadRules(dir = HERE) {
  if (cache && dir === HERE) return cache;
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "package.json").sort();
  const rules = [];
  for (const file of files) {
    const group = JSON.parse(readFileSync(join(dir, file), "utf8"));
    if (!Array.isArray(group.rules)) continue;
    for (const rule of group.rules) {
      rules.push({ ...rule, family: rule.family ?? group.family, source: file });
    }
  }
  if (dir === HERE) cache = rules;
  return rules;
}

/** Rules the detector can actually evaluate. */
export function detectableRules(dir = HERE) {
  return loadRules(dir).filter((r) => r.detect !== false && Array.isArray(r.patterns) && r.patterns.length > 0);
}

export function ruleById(id, dir = HERE) {
  return loadRules(dir).find((r) => r.id === id);
}

/** Compile a catalog pattern: a string, or { re, flags }. */
export function compilePattern(pattern, extraFlags = "") {
  const source = typeof pattern === "string" ? pattern : pattern.re;
  const flags = `${typeof pattern === "string" ? "" : (pattern.flags ?? "")}${extraFlags}g`;
  return new RegExp(source, flags);
}
