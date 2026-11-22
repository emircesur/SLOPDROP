#!/usr/bin/env node
// slopdrop detect — deterministic scan. Exit 0 clean, 2 findings, 1 error.

import { pathToFileURL } from "node:url";
import { loadRules, detectableRules } from "../../rules/index.mjs";
import { scan } from "../src/engine.mjs";
import { toSarif } from "../src/sarif.mjs";

const FORMATS = ["text", "json", "sarif"];
const SEVERITY_ORDER = ["minor", "noticeable", "critical"];

const USAGE = `Usage: slopdrop detect [paths...] [--format text|json|sarif] [--json]
                          [--platform mobile|web|universal|spatial]
                          [--fail-on minor|noticeable|critical]
                          [--ignore rule,rule] [--include-tests] [--list-rules]

Scans mobile, web, and spatial source for generated-looking UI, website-in-a-phone
patterns, copy slop, accessibility defaults, and performance leads. The platform
comes from the nearest package.json; --platform overrides it.

Exit code: 0 clean, 2 findings at or above --fail-on (default: minor), 1 error.
--format sarif writes SARIF 2.1.0 for GitHub code scanning and other viewers.
Silence one line with a comment: slopdrop-ignore <rule-id>
Project config: .slopdrop/config.json  { "ignoreRules": [], "ignorePaths": [] }`;

function formatText(result) {
  const { findings, filesScanned } = result;
  const out = [];

  if (findings.length === 0) {
    out.push(`No findings in ${filesScanned} files. That is not a clean bill of health.`);
  } else {
    const count = (severity) => findings.filter((f) => f.severity === severity).length;
    const files = new Set(findings.map((f) => f.file)).size;
    const parts = ["critical", "noticeable", "minor"].filter((s) => count(s)).map((s) => `${count(s)} ${s}`);
    out.push(`${findings.length} findings in ${files} of ${filesScanned} files (${parts.join(", ")})`);

    let current = null;
    for (const finding of findings) {
      if (finding.file !== current) {
        current = finding.file;
        out.push("", current);
      }
      const mark = finding.heuristic ? "~" : " ";
      out.push(
        `  ${String(finding.line).padStart(4)}${mark} ${finding.severity.padEnd(10)}  ${finding.rule.padEnd(24)}  ${finding.message}`,
      );
    }
    out.push("", "Fixes: slopdrop detect --list-rules");
  }

  out.push("Static checks only. Nothing was run, profiled, or tapped.");
  return out.join("\n");
}

function listRules() {
  return loadRules()
    .map((rule) => {
      const mode = rule.detect === false ? "manual" : "pattern";
      return `${rule.id.padEnd(28)} ${rule.severity.padEnd(10)} ${mode.padEnd(8)} ${rule.message}\n${" ".repeat(30)}Fix: ${rule.fix}`;
    })
    .join("\n\n");
}

export function main(argv) {
  const args = argv.slice();

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return 0;
  }
  if (args.includes("--list-rules")) {
    console.log(listRules());
    return 0;
  }

  let format = args.includes("--json") ? "json" : "text";
  let failOn = "minor";
  const includeTests = args.includes("--include-tests");
  let platform = null;
  const ignoreRules = [];
  const targets = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--platform") {
      platform = args[++i];
      if (!["mobile", "web", "universal", "spatial"].includes(platform)) {
        console.error(USAGE);
        return 1;
      }
    } else if (arg === "--format") {
      format = args[++i];
      if (!FORMATS.includes(format)) {
        console.error(`--format must be one of ${FORMATS.join(", ")}\n\n${USAGE}`);
        return 1;
      }
    } else if (arg === "--fail-on") {
      failOn = args[++i];
      if (!SEVERITY_ORDER.includes(failOn)) {
        console.error(`--fail-on must be one of ${SEVERITY_ORDER.join(", ")}\n\n${USAGE}`);
        return 1;
      }
    } else if (arg === "--ignore") {
      if (!args[i + 1]) {
        console.error(USAGE);
        return 1;
      }
      ignoreRules.push(...args[++i].split(",").map((s) => s.trim()).filter(Boolean));
    } else if (arg === "--json" || arg === "--include-tests") {
      // handled above
    } else if (arg.startsWith("--")) {
      console.error(`Unknown option ${arg}\n\n${USAGE}`);
      return 1;
    } else {
      targets.push(arg);
    }
  }

  const known = new Set(loadRules().map((r) => r.id));
  const unknown = ignoreRules.filter((id) => !known.has(id));
  if (unknown.length) {
    console.error(`Unknown rule: ${unknown.join(", ")}. See --list-rules.`);
    return 1;
  }

  let result;
  try {
    result = scan(targets.length ? targets : ["."], { includeTests, ignoreRules, platform, rules: detectableRules() });
  } catch (error) {
    console.error(error.message);
    return 1;
  }

  if (format === "json") {
    console.log(JSON.stringify({ ...result, generatedBy: "slopdrop", note: "Hits are leads, not findings." }, null, 2));
  } else if (format === "sarif") {
    console.log(JSON.stringify(toSarif(result, loadRules()), null, 2));
  } else {
    console.log(formatText(result));
  }

  if (result.unreadable.length) {
    console.error(`Could not read ${result.unreadable.length} file(s): ${result.unreadable.join(", ")}. The scan is incomplete.`);
    return 1;
  }

  const threshold = SEVERITY_ORDER.indexOf(failOn);
  const gating = result.findings.filter((f) => SEVERITY_ORDER.indexOf(f.severity) >= threshold);
  return gating.length ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
