#!/usr/bin/env node
// Validates the catalog. Adding a rule is a data change; this keeps the data honest.

import { loadRules, compilePattern, SEVERITIES, PLATFORMS } from "./index.mjs";

const rules = loadRules();
const errors = [];
const ids = new Set();

const ID = /^(ui|ux|a11y|copy|motion|perf|truth|web|xr)\.[a-z0-9]+(?:-[a-z0-9]+)*$/;

for (const rule of rules) {
  const where = rule.id || `${rule.source}#${rules.indexOf(rule)}`;
  if (!rule.id || !ID.test(rule.id)) errors.push(`${where}: id must look like "family.kebab-case"`);
  if (ids.has(rule.id)) errors.push(`${where}: duplicate id`);
  ids.add(rule.id);

  if (!SEVERITIES.includes(rule.severity)) errors.push(`${where}: severity must be one of ${SEVERITIES.join(", ")}`);
  if (!rule.message || rule.message.length < 10) errors.push(`${where}: message is required`);
  if (!rule.fix || rule.fix.length < 10) errors.push(`${where}: fix is required`);

  for (const p of rule.platforms ?? []) {
    if (!PLATFORMS.includes(p)) errors.push(`${where}: unknown platform "${p}"`);
  }
  if (rule.detect !== false && !Array.isArray(rule.patterns)) {
    errors.push(`${where}: a detectable rule needs a patterns array (or set detect:false)`);
  }
  for (const pattern of rule.patterns ?? []) {
    try {
      compilePattern(pattern);
    } catch (err) {
      errors.push(`${where}: bad pattern ${JSON.stringify(pattern)} (${err.message})`);
    }
    if (typeof pattern === "object" && pattern.colors !== undefined) {
      const c = pattern.colors;
      const unit = (v) => typeof v === "number" && v >= 0 && v <= 1;
      const known = new Set(["hues", "minSaturation", "lightness", "minAlpha"]);
      for (const key of Object.keys(c)) if (!known.has(key)) errors.push(`${where}: unknown colors key "${key}"`);
      if (c.hues !== undefined && !(Array.isArray(c.hues) && c.hues.every((r) => Array.isArray(r) && r.length === 2 && r.every((h) => h >= 0 && h <= 360)))) {
        errors.push(`${where}: colors.hues must be [[from, to], ...] in degrees`);
      }
      if (c.lightness !== undefined && !(Array.isArray(c.lightness) && c.lightness.length === 2 && c.lightness.every(unit))) {
        errors.push(`${where}: colors.lightness must be [min, max] in 0..1`);
      }
      for (const key of ["minSaturation", "minAlpha"]) {
        if (c[key] !== undefined && !unit(c[key])) errors.push(`${where}: colors.${key} must be in 0..1`);
      }
    }
  }
  if (rule.minMatches !== undefined && (!Number.isInteger(rule.minMatches) || rule.minMatches < 1)) {
    errors.push(`${where}: minMatches must be a positive integer`);
  }
  if (rule.perFile && !rule.minMatches) errors.push(`${where}: perFile rules need minMatches`);
}

const families = [...new Set(rules.map((r) => r.family))];
const detectable = rules.filter((r) => r.detect !== false && r.patterns?.length).length;

if (errors.length) {
  console.error(`Rule catalog invalid (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Rule catalog valid: ${rules.length} rules, ${detectable} detectable, ${rules.length - detectable} judgment-only.`);
console.log(`Families: ${families.sort().join(", ")}`);
