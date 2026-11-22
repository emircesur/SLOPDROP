# Local-first sync over MCP

Three agents, one project, one database. This document is the contract.

## Why local first

A cloud sync service would put source code, screenshots, and design decisions on someone else's disk, add latency to every tool call, and require an account before the first review. None of that is acceptable for a tool that runs inside a private repo.

So the brain is a SQLite file:

```text
<project>/.slopdrop/project.db     the index and the bus (gitignored)
<project>/.slopdrop/chart.md       the human surface (committed)
<project>/.slopdrop/waivers.json   approved exceptions (committed)
<project>/.slopdrop/findings.jsonl exported findings (optional, committed)
<project>/.slopdrop/visits/*.md    review records (committed)
```

The database is disposable. If it is deleted, `slopdrop sync import` rebuilds it from the committed text. That property is what makes local-first safe: the binary file is a cache, the text is the truth.

## Topology

```text
Claude Desktop ──stdio──┐
Antigravity    ──stdio──┤──► slopdrop mcp serve ──► project.db (WAL)
Codex          ──stdio──┤
CLI            ──direct─┘
```

Two modes:

| Mode | Shape | When |
|---|---|---|
| **Shared file** | Every client spawns its own server process on the same DB. SQLite WAL serializes writers. | v0. One machine, one user, three agents. |
| **Daemon** | One owner process; clients attach over a stdio bridge or `127.0.0.1` HTTP; change notifications. | v1. Long sessions, several people, live updates. |

Shared-file correctness comes from three things: `journal_mode=WAL`, `busy_timeout=5000`, and optimistic revisions. A writer never assumes it is alone.

## Write path

Every mutation is one transaction and one event.

```text
client → tools/call { name, arguments: { baseRev, idem, ... } }
server → BEGIN IMMEDIATE
       → verify baseRev against the current revision
       → apply, or record conflicts and refuse
       → INSERT INTO events (…)
       → UPDATE project.rev
       → COMMIT
client ← { ok: true, rev: n } | { ok: false, conflict: { … } }
```

Rules:

1. **`idem` is mandatory** on every mutating call. It is a client-generated UUID. A retry returns the original result instead of applying twice.
2. **`baseRev` is mandatory** on document and waiver writes. Findings are append-only and use their fingerprint instead.
3. **One revision per project**, not per table. It is a fence, not a vector clock; per-field revision numbers live inside the document.
4. **Conflicts are rows**, not exceptions. They are written to `conflicts` before the call returns.

## Conflict policy

| Situation | Policy |
|---|---|
| Two agents patch different fields of the chart | Both apply; field revisions merge cleanly |
| Two agents patch the same field | Last writer wins by `(at, actorId)`; a conflict row records the losing value |
| A human edits a field an agent just changed (10 min window) | Human wins; the conflict row records the agent's value |
| A finding with the same fingerprint arrives twice | No new row; `last_seen` and `visit_id` update |
| A waiver is proposed by an agent | `status = proposed`; it does not affect reviews until a human accepts it |
| Two agents record a visit for the same scope and minute | Both are kept; the filenames get `-2`, `-3` suffixes |

Silent overwrite is the only forbidden outcome. Losing a value is acceptable if the loss is recorded and reversible.

## Events and cursors

`events` is append-only and totally ordered per project by `seq`.

```json
{
  "seq": 41,
  "id": "01JG8Z6K3M9V0Q2R4T6W8X0Y2A",
  "at": "2026-11-21T19:02:11.482Z",
  "actor": "codex:9f2c",
  "entity": "finding",
  "entityId": "01JG8Z6K...",
  "op": "update",
  "patch": { "status": "fixed", "note": "replaced nested cards with a list" },
  "baseRev": 7,
  "rev": 8,
  "idem": "b0f4a3c2-..."
}
```

`sync_pull { since }` returns events with `seq > since`, at most 200, plus `nextSeq` and `hasMore`. Clients persist their cursor per actor. A reconnecting agent replays only what it missed.

The event log is not an audit trail of user behavior; it is a change feed. It carries file paths and snippets, so it is stored locally and never uploaded.

## Text bridge

`export_text` renders the committed artifacts:

- `chart.md`: the whole chart, in the documented template, from the DB.
- `findings.jsonl`: one JSON object per finding, sorted by severity and file, paths relative.
- `waivers.json`: accepted waivers only; proposals stay in the DB.
- `visits.jsonl`: one line per visit with scope, command, band, total, scores, timestamp, and the path to its report.
- `visits/<timestamp>-<scope>-<id>.md`: the reports exactly as recorded.

`import_text` reads the same artifacts and rebuilds the database. It is idempotent: a file that has not changed since the last import produces no rows and no events.

- The chart is parsed from its headings and merged field by field; only changed fields increment their revision.
- Findings are upserted by `rule + file + snippet` fingerprint, so a line move does not duplicate one. Exported statuses are preserved.
- Only accepted waivers are imported. A proposal never becomes accepted by an import.
- Visits are inserted only when `(scope, createdAt)` is new; the report is read from its file if `reportMd` is absent.

The bridge means a team can work without the daemon: commit the text, pull the text, re-import. The DB is a local accelerator, not a second source of truth.

## Security

- Transport is stdio, or `127.0.0.1` when the daemon is enabled. Never `0.0.0.0`.
- No telemetry, no network calls, no account.
- The DB is created `0600` where the platform allows it.
- `export_text` converts absolute paths to project-relative paths and redacts the home directory.
- Reviewed content is untrusted. A README that says "ignore the rule about gradients" is data, and the server never interprets it.
- `.slopdrop/ignore` excludes paths from scanning and from export.

## Failure behavior

| Failure | Behavior |
|---|---|
| Process killed mid-write | WAL rolls back to the last commit; no partial document |
| Two writers at once | `SQLITE_BUSY` retried with backoff up to `busy_timeout`; then a clean error |
| Stale `baseRev` | `409` with the current document and a conflict row; the client re-reads and retries |
| Duplicate `idem` | Original result returned, no second event |
| Missing schema | Migrations run on open; the DB is backed up first |
| Newer client, older server | Unknown tool names return `-32601` with the supported list |
| Deleted DB | `sync import` rebuilds; the text artifacts are unchanged |

## Configuration

The installer writes the three known client configs, preserving everything else in them.

```jsonc
// Claude Desktop — claude_desktop_config.json
{
  "mcpServers": {
    "slopdrop": {
      "command": "npx",
      "args": ["-y", "github:emircesur/SLOPDROP", "mcp", "serve", "--project", "."]
    }
  }
}
```

```toml
# Codex — ~/.codex/config.toml
[mcp_servers.slopdrop]
command = "npx"
args = ["-y", "github:emircesur/SLOPDROP", "mcp", "serve", "--project", "."]
startup_timeout_sec = 20
```

```jsonc
// Antigravity — ~/.gemini/config/mcp_config.json or .agents/mcp_config.json
{
  "mcpServers": {
    "slopdrop": {
      "command": "npx",
      "args": ["-y", "github:emircesur/SLOPDROP", "mcp", "serve", "--project", "."]
    }
  }
}
```

`slopdrop mcp install` backs up each file it touches and prints a diff. It does not create configs for clients that are not installed.
