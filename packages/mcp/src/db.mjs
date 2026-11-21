// SQLite access. One file per project, WAL mode, optimistic revisions.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCHEMA_VERSION = 1;

export function now() {
  return new Date().toISOString();
}

export function ulid() {
  const time = Date.now().toString(36).padStart(9, "0");
  let random = "";
  for (let i = 0; i < 12; i += 1) random += Math.floor(Math.random() * 36).toString(36);
  return (time + random).toUpperCase();
}

export function openDb(projectRoot, options = {}) {
  const root = resolve(projectRoot);
  const dir = options.dir ?? join(root, ".slopdrop");
  mkdirSync(dir, { recursive: true });

  const file = options.file ?? join(dir, "project.db");
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);

  return { db, file, root, dir };
}

export function migrate(db) {
  db.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);");
  const current = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get();
  if (!current) {
    const schema = readFileSync(join(HERE, "..", "migrations", "001_init.sql"), "utf8");
    db.exec(schema);
    db.prepare("INSERT INTO meta (key, value) VALUES ('schema_version', ?)").run(String(SCHEMA_VERSION));
    db.prepare("INSERT INTO meta (key, value) VALUES ('created_at', ?)").run(now());
    return;
  }
  if (Number(current.value) > SCHEMA_VERSION) {
    throw new Error(`Database schema ${current.value} is newer than this server (${SCHEMA_VERSION}). Update SLOPDROP.`);
  }
}

export function ensureProject(db, root) {
  const existing = db.prepare("SELECT * FROM projects ORDER BY created_at LIMIT 1").get();
  if (existing) return existing;

  const project = {
    id: ulid(),
    root,
    name: root.split(/[\\/]/).filter(Boolean).pop() ?? "project",
    created_at: now(),
    rev: 0,
  };
  db.prepare("INSERT INTO projects (id, root, name, created_at, rev) VALUES (?, ?, ?, ?, 0)").run(
    project.id,
    project.root,
    project.name,
    project.created_at,
  );
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(project.id);
}

export function ensureActor(db, { id, kind = "agent", label, client = null }) {
  const at = now();
  const existing = db.prepare("SELECT * FROM actors WHERE id = ?").get(id);
  if (existing) {
    db.prepare("UPDATE actors SET last_seen = ?, label = COALESCE(?, label) WHERE id = ?").run(at, label ?? null, id);
    return db.prepare("SELECT * FROM actors WHERE id = ?").get(id);
  }
  db.prepare("INSERT INTO actors (id, kind, label, client, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    kind,
    label ?? id,
    client,
    at,
    at,
  );
  return db.prepare("SELECT * FROM actors WHERE id = ?").get(id);
}

export function bumpRev(db, projectId) {
  db.prepare("UPDATE projects SET rev = rev + 1 WHERE id = ?").run(projectId);
  return db.prepare("SELECT rev FROM projects WHERE id = ?").get(projectId).rev;
}

export function recordEvent(db, event) {
  db.prepare(
    `INSERT INTO events (id, project_id, at, actor_id, entity, entity_id, op, patch, base_rev, rev, idem)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    event.id ?? ulid(),
    event.projectId,
    event.at ?? now(),
    event.actorId,
    event.entity,
    event.entityId,
    event.op,
    JSON.stringify(event.patch ?? {}),
    event.baseRev ?? null,
    event.rev ?? null,
    event.idem,
  );
}

export function eventByIdem(db, projectId, idem) {
  return db.prepare("SELECT * FROM events WHERE project_id = ? AND idem = ?").get(projectId, idem);
}

export function transaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // The transaction was already rolled back.
    }
    throw error;
  }
}
