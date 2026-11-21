-- SLOPDROP project database. Forward-only migrations; one file per project.
-- SQLite in WAL mode, one writer at a time, optimistic revisions.

PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id         TEXT PRIMARY KEY,
  root       TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  rev        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS actors (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL CHECK (kind IN ('human', 'agent', 'ci')),
  label      TEXT NOT NULL,
  client     TEXT,
  first_seen TEXT NOT NULL,
  last_seen  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  body       TEXT NOT NULL,
  field_revs TEXT NOT NULL DEFAULT '{}',
  rev        INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  UNIQUE (project_id, kind, slug)
);

CREATE TABLE IF NOT EXISTS findings (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  rule       TEXT NOT NULL,
  family     TEXT NOT NULL,
  severity   TEXT NOT NULL,
  file       TEXT NOT NULL,
  line       INTEGER NOT NULL,
  snippet    TEXT NOT NULL,
  message    TEXT NOT NULL,
  fix        TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'waived', 'false-positive')),
  first_seen TEXT NOT NULL,
  last_seen  TEXT NOT NULL,
  visit_id   TEXT,
  UNIQUE (project_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS visits (
  id         TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope      TEXT NOT NULL,
  command    TEXT NOT NULL,
  band       TEXT NOT NULL,
  total      INTEGER NOT NULL,
  scores     TEXT NOT NULL,
  report_md  TEXT NOT NULL,
  actor_id   TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waivers (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rule        TEXT NOT NULL,
  scope       TEXT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'revoked')),
  proposed_by TEXT NOT NULL,
  approved_by TEXT,
  created_at  TEXT NOT NULL,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  id         TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  at         TEXT NOT NULL,
  actor_id   TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  op         TEXT NOT NULL,
  patch      TEXT NOT NULL,
  base_rev   INTEGER,
  rev        INTEGER,
  idem       TEXT NOT NULL,
  UNIQUE (project_id, idem)
);

CREATE TABLE IF NOT EXISTS cursors (
  actor_id   TEXT NOT NULL,
  project_id TEXT NOT NULL,
  last_seq   INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (actor_id, project_id)
);

CREATE TABLE IF NOT EXISTS conflicts (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entity       TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  field        TEXT NOT NULL,
  ours         TEXT NOT NULL,
  theirs       TEXT NOT NULL,
  ours_actor   TEXT NOT NULL,
  theirs_actor TEXT NOT NULL,
  at           TEXT NOT NULL,
  resolved_by  TEXT,
  resolution   TEXT
);

CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(project_id, status, severity);
CREATE INDEX IF NOT EXISTS idx_findings_file   ON findings(project_id, file, line);
CREATE INDEX IF NOT EXISTS idx_events_seq      ON events(project_id, seq);
CREATE INDEX IF NOT EXISTS idx_visits_scope    ON visits(project_id, scope, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflicts_open  ON conflicts(project_id, resolved_by);
