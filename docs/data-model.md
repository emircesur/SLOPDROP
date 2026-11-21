# Data model

One SQLite file per project. Forward-only migrations. Every table carries `project_id` so a future shared DB can hold several projects without a rewrite.

## Tables

### `meta`

| Key | Value |
|---|---|
| `schema_version` | integer, current migration |
| `created_at` | ISO timestamp |
| `app_version` | the server that created the file |

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `root` | TEXT | absolute path, never exported |
| `name` | TEXT | directory name |
| `created_at` | TEXT | |
| `rev` | INTEGER | monotonic project revision |

### `actors`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | `codex:9f2c`, `human:emir` |
| `kind` | TEXT | `human`, `agent`, `ci` |
| `label` | TEXT | display name |
| `client` | TEXT | `claude-desktop`, `antigravity`, `codex`, `cli` |
| `first_seen`, `last_seen` | TEXT | |

`kind` drives the human-wins policy. It is set by the client, not guessed.

### `documents`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `project_id` | TEXT FK | |
| `kind` | TEXT | `chart`, `tokens`, `config` |
| `slug` | TEXT | usually `default` |
| `body` | TEXT | JSON for `chart` and `tokens`, raw markdown for notes |
| `field_revs` | TEXT | JSON `{ "brand.color": 12, ... }` |
| `rev` | INTEGER | whole-document revision |
| `updated_at`, `updated_by` | TEXT | |

`UNIQUE(project_id, kind, slug)`.

Field revisions are what make concurrent patches merge instead of clobber. A patch that touches only `tasks` never conflicts with a patch that touches `brand`.

### `findings`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `fingerprint` | TEXT | `sha256(rule|normalizedPath|anchor|contextHash)` |
| `rule`, `family`, `severity` | TEXT | copied from the catalog at write time |
| `file`, `line`, `snippet` | TEXT/INT | path relative to project root |
| `message`, `fix` | TEXT | from the rule, unless the agent overrides |
| `status` | TEXT | `open`, `fixed`, `waived`, `false-positive` |
| `first_seen`, `last_seen` | TEXT | |
| `visit_id` | TEXT | nullable |

`UNIQUE(project_id, fingerprint)`. Re-scanning the same code updates `last_seen` instead of duplicating.

The fingerprint deliberately ignores the line number: a finding that moves down ten lines is the same finding. The anchor is the trimmed snippet plus the enclosing symbol when the agent supplies one.

### `visits`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `scope` | TEXT | `checkout`, `home` |
| `command` | TEXT | `review`, `treat`, `follow-up` |
| `band`, `total` | TEXT/INT | `clean`, `smudged`, `sloppy`, `deep-slop` |
| `scores` | TEXT | JSON `{taskPath: 3, truth: 2, ...}` |
| `report_md` | TEXT | the full report |
| `actor_id` | TEXT | |
| `created_at` | TEXT | |

Visits are never updated. A follow-up compares the last two visits for a scope.

### `waivers`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `rule` | TEXT | rule id, or `*` for a family |
| `scope` | TEXT | path glob or `project` |
| `reason` | TEXT | required, non-empty |
| `status` | TEXT | `proposed`, `accepted`, `revoked` |
| `proposed_by`, `approved_by` | TEXT | actor ids |
| `created_at`, `approved_at` | TEXT | |

Only `accepted` waivers suppress findings. An agent can propose; a human accepts.

### `events`

| Column | Type | Notes |
|---|---|---|
| `seq` | INTEGER PK AUTOINCREMENT | per database, monotonic |
| `id` | TEXT UNIQUE | ULID |
| `project_id` | TEXT | |
| `at` | TEXT | ISO |
| `actor_id` | TEXT | |
| `entity` | TEXT | `chart`, `finding`, `visit`, `waiver`, `config` |
| `entity_id` | TEXT | |
| `op` | TEXT | `create`, `update`, `delete` |
| `patch` | TEXT | JSON |
| `base_rev`, `rev` | INTEGER | nullable for findings |
| `idem` | TEXT | `UNIQUE(project_id, idem)` |

### `cursors`

`(actor_id, project_id)` primary key, `last_seq`, `updated_at`. One row per agent that has ever pulled.

### `conflicts`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | ULID |
| `entity`, `entity_id`, `field` | TEXT | |
| `ours`, `theirs` | TEXT | JSON values |
| `ours_actor`, `theirs_actor` | TEXT | |
| `at` | TEXT | |
| `resolved_by`, `resolution` | TEXT | nullable until a human decides |

## Indexes

```sql
CREATE INDEX idx_findings_status ON findings(project_id, status, severity);
CREATE INDEX idx_findings_file   ON findings(project_id, file, line);
CREATE INDEX idx_events_seq      ON events(project_id, seq);
CREATE INDEX idx_visits_scope    ON visits(project_id, scope, created_at DESC);
CREATE INDEX idx_conflicts_open  ON conflicts(project_id, resolved_by);
```

## Migrations

Numbered files in `packages/mcp/migrations/`, applied forward inside a transaction, recorded in `meta.schema_version`. Before any migration that rewrites a table, the server copies the DB to `project.db.bak-<version>`. There is no down migration; restore the backup.

## Export formats

`findings.jsonl`:

```json
{"rule":"ui.nested-cards","severity":"noticeable","file":"src/Card.tsx","line":118,"status":"open","fingerprint":"3f9c…","firstSeen":"2026-11-20T…","lastSeen":"2026-11-21T…"}
```

`waivers.json`:

```json
{"version":1,"waivers":[{"rule":"ui.status-dot","scope":"src/legacy/**","reason":"status LED mirrors the hardware","approvedBy":"human:emir","approvedAt":"2026-11-20T…"}]}
```

`chart.md` is rendered from the document body; the template lives in `skills/slopdrop/reference/chart.md`.

## Invariants

1. `project.rev` increases by exactly one per mutating call.
2. Every mutation has exactly one event.
3. `events.seq` has no gaps within a database.
4. No finding row is deleted; it changes status.
5. No visit row is updated; corrections are new visits.
6. A waiver without `approved_by` never suppresses anything.
