#!/usr/bin/env node
// Packages the skill into the plugin directories and checks the manifests.
// The packaged SKILL.md must be byte-identical to the canonical file.

import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(ROOT, "skills", "slopdrop");
const CHECK = process.argv.includes("--check");

const packages = [
  { name: "claude", manifest: join(ROOT, "plugins", "claude", ".claude-plugin", "plugin.json") },
  { name: "codex", manifest: join(ROOT, "plugins", "codex", ".codex-plugin", "plugin.json") },
];

let failures = 0;

for (const pkg of packages) {
  const destRoot = join(ROOT, "plugins", pkg.name);
  const dest = join(destRoot, "skills", "slopdrop");

  if (!CHECK) {
    rmSync(dest, { recursive: true, force: true });
    cpSync(SKILL, dest, { recursive: true });
  }

  if (!existsSync(pkg.manifest)) {
    console.error(`${pkg.name}: missing ${pkg.manifest}`);
    failures += 1;
    continue;
  }

  const manifest = JSON.parse(readFileSync(pkg.manifest, "utf8"));
  for (const field of ["name", "description", "version", "license", "skills"]) {
    if (!manifest[field]) {
      console.error(`${pkg.name}: manifest missing ${field}`);
      failures += 1;
    }
  }

  const packagedSkill = join(dest, "SKILL.md");
  if (!existsSync(packagedSkill)) {
    console.error(`${pkg.name}: packaged SKILL.md missing (run without --check)`);
    failures += 1;
    continue;
  }

  if (readFileSync(packagedSkill, "utf8") !== readFileSync(join(SKILL, "SKILL.md"), "utf8")) {
    console.error(`${pkg.name}: packaged SKILL.md differs from the canonical file`);
    failures += 1;
  }
}

if (failures) {
  console.error(`\n${failures} plugin problem(s).`);
  process.exit(1);
}

console.log(`Plugin packages OK: ${packages.map((p) => p.name).join(", ")}.`);
