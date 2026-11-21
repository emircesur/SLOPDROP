# Architecture

The repo is a monorepo with one rule: **data flows down, never sideways.** The rule catalog is data. Everything else is a reader of that data.

```text
                    ┌──────────────────────────────┐
                    │ packages/rules  (catalog)    │
                    │ ids, families, patterns, fixes│
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              ▼                    ▼                     ▼
      packages/detect        packages/core         skills/slopdrop
      (static scanner)     (score, severity,      (agent protocol,
              │             fingerprint, waiver)   reads detector JSON)
              │                    │                     │
              └──────────┬─────────┴──────────┬──────────┘
                         ▼                    ▼
                  packages/mcp          packages/cli
              (SQLite + MCP tools)   (init, install, sync)
                         │
                         ▼
              Claude Desktop · Antigravity · Codex · CI · editor
```

## Packages

### `packages/rules`

The canonical catalog, as JSON, one file per family under `rules/`. A rule is inert data:

```json
{
  "id": "ui.status-dot",
  "family": "look",
  "severity": "minor",
  "platforms": ["mobile", "web", "spatial"],
  "stacks": ["js", "web", "swift", "kotlin", "dart"],
  "message": "Small colored dot next to a label.",
  "fix": "Keep it only if it shows a status the user acts on, with a text label or shape. Otherwise delete it.",
  "patterns": ["...regex..."],
  "exclude": ["..."],
  "context": ["line", "file"]
}
```

Rules never import code. `validate.mjs` enforces the schema, unique ids, a fix on every rule, and a test fixture per rule. Adding a rule is a data change plus a fixture, not an engine change. That is what keeps the detector honest at 100 rules.

### `packages/core`

Pure functions, no I/O:

- `score(findings, dimensions)` → six dimension scores, total out of 24, band, slop index.
- `severityOf(finding)` → critical / noticeable / minor / ask-first.
- `fingerprint(finding)` → stable hash of rule + normalized file + anchor + context, so the same finding survives a re-scan and a line move.
- `waive(finding, waiver)` → accepted / rejected / expired, with the reason attached.
- `band(total)` → clean / smudged / sloppy / deep-slop.

Every function here is unit-tested and has no dependency on Node APIs, so the CLI, the MCP server, and a future web app share one definition of "16 out of 24".

### `packages/detect`

The only place that reads source files. Pipeline:

```text
targets → walk (extensions, skip dirs, tests) → read → blank comments
        → detect stack → detect platform (nearest package.json)
        → apply rules (patterns, excludes, platform/stacks gate)
        → group by line → dedupe → sort by severity → JSON or text
```

Hard requirements:

- zero runtime dependencies;
- never executes project code, never imports project files;
- deterministic output (stable sort, relative paths, no timestamps);
- exit `0` clean, `2` findings, `1` error;
- unreadable files are reported, not swallowed;
- `--list-rules`, `--json`, `--platform`, `--ignore`, `--include-tests`.

Complex rules (nested components, list virtualization, focus restoration) get a `handler` name resolved through a small registry, still inside this package. If a rule cannot be decided from source, it does not belong in the detector; it belongs in `reference/tells.md` as a judgment call.

### `packages/mcp`

The local-first bus. See [docs/mcp-sync.md](docs/mcp-sync.md) and [docs/data-model.md](docs/data-model.md).

```text
MCP client (stdio JSON-RPC)
   │
   ├── tools: chart_read, chart_patch, finding_upsert, finding_list,
   │          finding_resolve, visit_record, visit_list, waiver_add,
   │          sync_pull, sync_push, export_text, import_text, score_compute
   └── resources: slopdrop://chart, slopdrop://findings, slopdrop://visits/latest
   │
SQLite (WAL, busy_timeout, BEGIN IMMEDIATE)
   │
.slopdrop/project.db  ←→  .slopdrop/chart.md, findings.jsonl, waivers.json, visits.jsonl, visits/*.md
```

Rules:

- one writer at a time is enforced by SQLite, not by hope;
- every mutation carries `baseRev` and `idem` (idempotency key);
- the DB is disposable: `export_text` can rebuild every committed artifact, and `import_text` can rebuild the DB from the repo;
- no network, no telemetry, no cloud account.

### `packages/cli`

Thin command shell. It parses arguments, calls `detect`, `mcp`, or `install`, and prints. No business logic lives here.

```text
slopdrop init [--platform ...]      create .slopdrop/, detect stack, write config
slopdrop scan [paths]               detector pass, exit code for CI
slopdrop detect [paths]             alias, machine output
slopdrop install [--agent ...]      write the skill into agent skill folders
slopdrop mcp install|serve          register/provide the MCP server
slopdrop sync status|export|import  inspect the bus, write text artifacts
slopdrop score [report]             parse a visit and print the score table
```

### `skills/slopdrop`

The agent-facing product. It is not code; it is a protocol. `SKILL.md` is short enough to load on every invocation. `reference/` is loaded on demand: `tells.md`, `copy.md`, `platforms.md`, `spatial.md`, `treatment.md`, `report.md`, `chart.md`, `performance.md`. `eval.md` is the self-check the agent runs before returning.

The skill must work with zero packages installed (a copy-paste install), and must degrade gracefully when the detector or the MCP server is missing: say what was not checked.

## Dependency rules

1. `rules` depends on nothing.
2. `core` depends on `rules` types only, never on filesystem or process.
3. `detect` depends on `rules` + `core`.
4. `mcp` depends on `core` types only; it does not import the detector.
5. `cli` wires everything; nothing imports `cli`.
6. `skills/` imports nothing; it calls the CLI and the MCP server as a user would.

A violation fails `pnpm lint:deps` (added in M0).

## Data flow, end to end

```text
agent                CLI                    MCP server            SQLite
  │  /slopdrop review  │                        │                    │
  ├───────────────────►│  detect --json         │                    │
  │                    ├───────────────────────►│                    │
  │                    │◄──── findings ─────────┤                    │
  │  judgment + report │                        │                    │
  ├────────────────────┼───────────────────────►│ visit_record       │
  │                    │                        ├───────────────────►│ events
  │                    │                        │◄──── rev, seq ─────┤
  │  other agent       │                        │                    │
  ├────────────────────┼───────────────────────►│ sync_pull since=41 │
  │◄───────────────────┼──── chart + findings ──┤                    │
```

The report is written by the agent, not by the engine, because the engine cannot see the running app. The engine's job is evidence and memory; the agent's job is judgment.

## Determinism and evidence

- Every number in a report is either measured (with the method named) or marked estimated with `~`.
- Performance is never scored from code. It is a line, not a dimension.
- A rule hit is evidence, not a finding. The report only contains confirmed findings.
- The same inputs must produce the same detector output, byte for byte. Snapshot tests enforce it.

## Testing strategy

| Layer | Test |
|---|---|
| rules | schema validation, unique ids, every rule has a fixture that fires and a fixture that stays quiet |
| core | table-driven score/band/fingerprint/waiver cases |
| detect | golden JSON per stack, snapshot output, exit codes, ignore comments, config |
| mcp | schema migration, idempotency, rev conflict, cursor pagination, export/import round-trip |
| skill | golden prompts in `evals/`: the agent must name the right patterns and refuse to invent data |

## Versioning

- Rule ids are append-only. Removing or renaming an id requires a major version and a mapping file.
- The MCP tool surface follows semver; new tools are minor, changed arguments are major.
- The SQLite schema uses numbered migrations, applied forward only. `schema_version` in `meta`.
- Skill versions track the package version; the plugin manifests read it at build time.

## Security and privacy

Local first means local only. The MCP server binds to stdio (or `127.0.0.1` in daemon mode), never `0.0.0.0`. No review text, source, or screenshot leaves the machine. The database stores file paths and snippets, so `.slopdrop/` is gitignored by default and `sync export` redacts absolute paths. Screenshots belong in the repo only if the project already commits them.

## Build and release

`pnpm build` compiles TypeScript packages to `dist/`; the shipped packages stay ESM and Node 22.5+. The skill and the plugins are built by `scripts/build-plugins.mjs`: it copies `skills/slopdrop` into `plugins/*/skills/`, validates manifests, fails if a packaged `SKILL.md` differs from the canonical one, and leaves zipping to the release job. CI runs on Ubuntu; the MCP tests run in-process, so no stdio subprocess is needed.
