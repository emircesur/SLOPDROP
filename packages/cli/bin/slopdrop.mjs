#!/usr/bin/env node
// slopdrop — install, scan, share. Thin command shell over the packages.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { main as detectMain } from "../../detect/bin/slopdrop-detect.mjs";
import { main as mcpMain, createHandler } from "../../mcp/src/server.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const SKILL = join(ROOT, "skills", "slopdrop");

// The npm name "slopdrop" belongs to an unrelated package, so every command
// and MCP config runs SLOPDROP from its GitHub repository instead.
export const PACKAGE_SPEC = "github:emircesur/SLOPDROP";
const RUN = `npx -y ${PACKAGE_SPEC}`;

const USAGE = `Usage: slopdrop <command> [options]

  init [--platform web|mobile|spatial]   create .slopdrop/ and a config
  scan [paths...] [--format text|json|sarif] [--fail-on minor|noticeable|critical]
                                         deterministic scan (exit 2 on findings)
  install [--agent a,b] [--project]      install the skill for your agents
          [--dir <folder>]
  mcp install                            register the MCP server with installed clients
  mcp serve [--project <dir>] [--human]  run the server (stdio)
  sync status                            project revision, open findings, last visit
  sync export                            write chart.md, findings.jsonl, waivers.json, visits
  sync import                            rebuild the database from those files

Agents: claude, codex, antigravity, cursor, opencode, gemini, copilot`;

const AGENTS = {
  claude: { name: "Claude Code / Desktop", global: ".claude/skills", project: ".claude/skills", seen: [".claude"] },
  codex: { name: "Codex", global: ".agents/skills", project: ".agents/skills", seen: [".codex"] },
  antigravity: { name: "Google Antigravity", global: ".gemini/skills", project: ".agents/skills", seen: [".gemini"] },
  cursor: { name: "Cursor", global: ".agents/skills", project: ".cursor/skills", seen: [".cursor"] },
  opencode: { name: "OpenCode", global: ".agents/skills", project: ".opencode/skills", seen: [".config/opencode"] },
  gemini: { name: "Gemini CLI", global: ".gemini/skills", project: ".gemini/skills", seen: [".gemini"] },
  copilot: { name: "GitHub Copilot", global: null, project: ".github/skills", seen: [] },
};

function parse(argv) {
  const positional = [];
  const flags = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [key, inline] = arg.slice(2).split("=");
      if (inline !== undefined) flags.set(key, inline);
      else if (argv[i + 1] && !argv[i + 1].startsWith("--") && ["agent", "dir", "project", "platform", "ignore", "format", "fail-on"].includes(key)) {
        flags.set(key, argv[++i]);
      } else flags.set(key, true);
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function detectPlatform(root) {
  const pkgPath = join(root, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      if (deps.some((d) => /^(react-native|expo|@capacitor\/|@ionic\/)$/.test(d))) return "mobile";
      if (deps.some((d) => /^(react-dom|next|vue|nuxt|svelte|astro|vite)$/.test(d))) return "web";
    } catch {
      // Ignore a broken package.json; the detector will report it.
    }
  }
  if (existsSync(join(root, "ios")) || existsSync(join(root, "android"))) return "mobile";
  if (existsSync(join(root, "ProjectSettings"))) return "spatial";
  return "unknown";
}

function cmdInit(positional, flags) {
  const root = resolve(positional[0] ?? ".");
  const dir = join(root, ".slopdrop");
  mkdirSync(dir, { recursive: true });
  const configPath = join(dir, "config.json");
  if (existsSync(configPath)) {
    console.log(`Already initialized: ${configPath}`);
    return 0;
  }
  const platform = flags.get("platform") ?? detectPlatform(root);
  const config = {
    version: 1,
    platform,
    ignoreRules: [],
    ignorePaths: ["dist/", "build/", "vendor/", "node_modules/"],
    gate: { max_critical: 0, max_slop_index: 45 },
  };
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Created ${configPath}`);
  console.log(`Platform: ${platform}`);
  console.log("");
  console.log("Next:");
  console.log(`  ${RUN} scan .`);
  console.log(`  ${RUN} install`);
  console.log(`  ${RUN} mcp install`);
  return 0;
}

function copySkill(base) {
  const dest = join(base, "slopdrop");
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  cpSync(SKILL, dest, { recursive: true });
  return dest;
}

function cmdInstall(_positional, flags) {
  const requested = flags.get("agent");
  const project = flags.get("project") === true;
  let ids;

  if (requested) {
    ids = String(requested).split(",").map((s) => s.trim().toLowerCase());
    const unknown = ids.filter((id) => !AGENTS[id]);
    if (unknown.length) {
      console.error(`Unknown agent: ${unknown.join(", ")}. Choose from ${Object.keys(AGENTS).join(", ")}.`);
      return 1;
    }
  } else {
    ids = Object.keys(AGENTS).filter((id) => AGENTS[id].seen.some((dir) => existsSync(join(homedir(), dir))));
    if (ids.length === 0) ids = ["claude"];
  }

  const dirFlag = flags.get("dir");
  if (dirFlag) {
    const dest = copySkill(resolve(String(dirFlag).replace(/^~(?=$|\/)/, homedir())));
    console.log(`Skill installed to ${dest}`);
    return 0;
  }

  const installed = new Map();
  const skipped = [];
  for (const id of ids) {
    const agent = AGENTS[id];
    const relative = project ? agent.project : agent.global;
    if (!relative) {
      skipped.push(agent.name);
      continue;
    }
    const base = project ? resolve(relative) : join(homedir(), relative);
    if (!installed.has(base)) installed.set(base, { dest: copySkill(base), agents: [] });
    installed.get(base).agents.push(agent);
  }

  console.log("SLOPDROP skill installed.");
  for (const { dest, agents } of installed.values()) {
    console.log(`\n${agents.map((a) => a.name).join(", ")}\n  ${dest}`);
    console.log("  then ask: /slopdrop review my app");
  }
  if (skipped.length) console.log(`\n${skipped.join(", ")}: no global skills folder. Run with --project inside the project.`);
  return 0;
}

function patchJsonConfig(file, add, label) {
  let json = {};
  if (existsSync(file)) {
    try {
      json = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      console.error(`${label}: ${file} is not valid JSON. Not touched.`);
      return false;
    }
    writeFileSync(`${file}.bak`, readFileSync(file));
  } else {
    mkdirSync(dirname(file), { recursive: true });
  }
  json.mcpServers = json.mcpServers ?? {};
  if (json.mcpServers.slopdrop) {
    console.log(`${label}: already registered (${file})`);
    return false;
  }
  json.mcpServers.slopdrop = add;
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${label}: added slopdrop to ${file}`);
  return true;
}

function cmdMcpInstall() {
  const projectRoot = resolve(".");
  const entry = { command: "npx", args: ["-y", PACKAGE_SPEC, "mcp", "serve", "--project", projectRoot] };
  let changed = 0;

  const appData = process.env.APPDATA;
  const claudeCandidates = [
    appData ? join(appData, "Claude", "claude_desktop_config.json") : null,
    join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json"),
    join(homedir(), ".config", "Claude", "claude_desktop_config.json"),
  ].filter(Boolean);

  const claudeFile = claudeCandidates.find((file) => existsSync(file));
  if (claudeFile) {
    if (patchJsonConfig(claudeFile, entry, "Claude Desktop")) changed += 1;
  } else {
    console.log("Claude Desktop: config not found, skipped.");
  }

  const antigravity = join(homedir(), ".gemini", "config", "mcp_config.json");
  if (existsSync(join(homedir(), ".gemini"))) {
    if (patchJsonConfig(antigravity, entry, "Antigravity")) changed += 1;
  } else {
    console.log("Antigravity: ~/.gemini not found, skipped.");
  }

  const codexFile = join(homedir(), ".codex", "config.toml");
  if (existsSync(join(homedir(), ".codex"))) {
    const current = existsSync(codexFile) ? readFileSync(codexFile, "utf8") : "";
    if (current.includes("[mcp_servers.slopdrop]")) {
      console.log("Codex: already registered");
    } else {
      const block = `\n[mcp_servers.slopdrop]\ncommand = "npx"\nargs = ["-y", "${PACKAGE_SPEC}", "mcp", "serve", "--project", "${projectRoot.replace(/\\/g, "\\\\")}"]\nstartup_timeout_sec = 20\n`;
      if (existsSync(codexFile)) writeFileSync(`${codexFile}.bak`, current);
      writeFileSync(codexFile, current + block);
      console.log(`Codex: added slopdrop to ${codexFile}`);
      changed += 1;
    }
  } else {
    console.log("Codex: ~/.codex not found, skipped.");
  }

  console.log(changed ? `\nRegistered with ${changed} client(s). Restart them to pick it up.` : "\nNo client configs changed.");
  return 0;
}

async function cmdSync(action, _positional, flags) {
  const root = resolve(flags.get("project") ? String(flags.get("project")) : ".");
  const stateDir = join(root, ".slopdrop");
  if (!existsSync(stateDir)) {
    console.error(`No SLOPDROP project at ${root}. Run "slopdrop init" first.`);
    return 1;
  }

  const handler = createHandler({ projectRoot: root, actorId: "cli", actorKind: "human", client: "cli" });
  try {
    if (action === "status") {
      const project = handler.project;
      const counts = handler.db
        .prepare("SELECT status, COUNT(*) AS n FROM findings WHERE project_id = ? GROUP BY status")
        .all(project.id);
      const visits = handler.db.prepare("SELECT COUNT(*) AS n FROM visits WHERE project_id = ?").get(project.id).n;
      const waivers = handler.db.prepare("SELECT COUNT(*) AS n FROM waivers WHERE project_id = ?").get(project.id).n;
      const last = handler.db.prepare("SELECT seq, at, entity, op FROM events WHERE project_id = ? ORDER BY seq DESC LIMIT 1").get(project.id);

      console.log(`Project:  ${project.name} (${project.root})`);
      console.log(`Revision: ${project.rev}`);
      console.log(`Findings: ${counts.length ? counts.map((c) => `${c.n} ${c.status}`).join(", ") : "none"}`);
      console.log(`Visits:   ${visits}`);
      console.log(`Waivers:  ${waivers}`);
      console.log(`Last:     ${last ? `#${last.seq} ${last.entity}.${last.op} at ${last.at}` : "no events"}`);
      return 0;
    }

    if (action === "export" || action === "import") {
      const response = await handler.handle({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: `${action}_text`, arguments: {} },
      });
      if (response.error) {
        console.error(response.error.message);
        return 1;
      }
      const payload = response.result.structuredContent;
      if (action === "export") {
        console.log(`Exported: ${payload.written.join(", ")}`);
      } else {
        console.log(
          `Imported: chart ${payload.chart ? "updated" : "unchanged"}, ${payload.findings} findings, ${payload.waivers} waivers, ${payload.visits} visits`,
        );
      }
      return 0;
    }

    console.error(`Unknown sync command: ${action}`);
    return 1;
  } finally {
    handler.db.close();
  }
}

export async function main(argv) {
  const { positional, flags } = parse(argv);
  const [command, sub] = positional;

  if (!command || flags.has("help")) {
    console.log(USAGE);
    return 0;
  }

  switch (command) {
    case "init":
      return cmdInit(positional.slice(1), flags);
    case "scan":
    case "detect": {
      const args = positional.slice(1);
      for (const [key, value] of flags) {
        if (key === "help") continue;
        if (value === true) args.push(`--${key}`);
        else args.push(`--${key}`, String(value));
      }
      return detectMain(args);
    }
    case "install":
      return cmdInstall(positional.slice(1), flags);
    case "mcp":
      if (sub === "install") return cmdMcpInstall();
      if (sub === "serve") return mcpMain(process.argv.slice(2));
      console.error(`Unknown mcp command: ${sub ?? "(none)"}`);
      return 1;
    case "sync": {
      return await cmdSync(sub, positional.slice(2), flags);
    }
    default:
      console.error(`Unknown command: ${command}\n\n${USAGE}`);
      return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
