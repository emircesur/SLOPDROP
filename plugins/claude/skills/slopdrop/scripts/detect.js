#!/usr/bin/env node
// Bridge from the skill to the packaged detector.
// The skill must work when the packages are not installed, so this file
// explains what is missing instead of failing silently.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

const candidates = [
  resolve(here, "../../../packages/detect/bin/slopdrop-detect.mjs"),
  resolve(here, "../../../../packages/detect/bin/slopdrop-detect.mjs"),
  resolve(here, "../../../node_modules/slopdrop/packages/detect/bin/slopdrop-detect.mjs"),
].filter((p) => existsSync(p));

if (candidates.length > 0) {
  const result = spawnSync(process.execPath, [candidates[0], ...args], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

// No global fallback on purpose: the npm name "slopdrop" belongs to an
// unrelated package, so a bare `slopdrop` on PATH may not be this tool.
console.error(
  [
    "SLOPDROP detector not found.",
    "",
    "Run it from GitHub:   npx -y github:emircesur/SLOPDROP detect <paths> --json",
    "Or from a clone:      node <clone>/packages/detect/bin/slopdrop-detect.mjs <paths> --json",
    "",
    "The review can continue from code only. Say under Not checked that the",
    "detector did not run.",
  ].join("\n"),
);
process.exit(1);
