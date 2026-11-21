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

// A globally installed CLI can still do the job.
const cli = spawnSync("slopdrop", ["detect", ...args], { stdio: "inherit", shell: true });
if (cli.error === undefined) process.exit(cli.status ?? 1);

console.error(
  [
    "SLOPDROP detector not found.",
    "",
    "Install it in the project:   npx slopdrop init",
    "Or run it globally:          npx slopdrop detect <paths> --json",
    "",
    "The review can continue from code only. Say under Not checked that the",
    "detector did not run.",
  ].join("\n"),
);
process.exit(1);
