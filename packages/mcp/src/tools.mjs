// Tool implementations. Everything mutating goes through `transaction` and
// writes exactly one event.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { computeScore, fingerprint, normalizePath } from "../../core/index.mjs";
import { bumpRev, ensureProject, eventByIdem, now, recordEvent, transaction, ulid } from "./db.mjs";

export class ToolError extends Error {
  constructor(code, message, remedy) {
    super(message);
    this.code = code;
    this.remedy = remedy;
  }
}

const DEFAULT_CHART = {
  stack: "",
  platforms: [],
  visits: true,
  tasks: [],
  users: "",
  brand: { color: "", type: "", keep: [] },
  accepted: [],
  offLimits: [],
};

function chartMarkdown(data) {
  const list = (items, empty = "—") => (items && items.length ? items.map((i) => `- ${i}`).join("\n") : empty);
  return [
    "# Chart",
    "",
    `Stack: ${data.stack || "unknown"}`,
    `Platforms: ${(data.platforms || []).join(", ") || "unknown"}`,
    `Visits: ${data.visits === false ? "off" : "on"}`,
    "",
    "## Top tasks",
    data.tasks?.length ? data.tasks.map((task, i) => `${i + 1}. ${task}`).join("\n") : "1. Unknown",
    "",
    "## Users and context",
    data.users || "Unknown",
    "",
    "## Brand",
    `- Color: ${data.brand?.color || "unknown"}`,
    `- Type: ${data.brand?.type || "unknown"}`,
    `- Keep: ${(data.brand?.keep || []).join("; ") || "—"}`,
    "",
    "## Accepted",
    list(data.accepted),
    "",
    "## Off limits",
    list(data.offLimits),
    "",
  ].join("\n");
}

function readChart(db, project) {
  let row = db.prepare("SELECT * FROM documents WHERE project_id = ? AND kind = 'chart' AND slug = 'default'").get(project.id);
  if (!row) {
    const at = now();
    const id = ulid();
    db.prepare(
      `INSERT INTO documents (id, project_id, kind, slug, body, field_revs, rev, updated_at, updated_by)
       VALUES (?, ?, 'chart', 'default', ?, '{}', 0, ?, 'system')`,
    ).run(id, project.id, JSON.stringify(DEFAULT_CHART), at);
    row = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  }
  const data = { ...DEFAULT_CHART, ...JSON.parse(row.body) };
  return {
    row,
    data,
    fieldRevs: JSON.parse(row.field_revs || "{}"),
    markdown: chartMarkdown(data),
  };
}

function replay(db, project, idem) {
  const event = eventByIdem(db, project.id, idem);
  if (!event) return null;
  return { ok: true, replayed: true, rev: event.rev, eventId: event.id };
}

export function createTools({ db, project, actor }) {
  const tools = {};

  tools.project_open = () => {
    const fresh = ensureProject(db, project.root);
    return {
      projectId: fresh.id,
      name: fresh.name,
      rev: fresh.rev,
      actor: { id: actor.id, kind: actor.kind, label: actor.label },
      db: project.file,
    };
  };

  tools.chart_read = () => {
    const chart = readChart(db, project);
    return {
      data: chart.data,
      markdown: chart.markdown,
      rev: chart.row.rev,
      updatedAt: chart.row.updated_at,
      updatedBy: chart.row.updated_by,
      fieldRevs: chart.fieldRevs,
    };
  };

  tools.chart_patch = ({ baseRev, fields, idem } = {}) => {
    if (!Number.isInteger(baseRev)) throw new ToolError(-32602, "baseRev must be an integer", "Call chart_read first.");
    if (!fields || typeof fields !== "object") throw new ToolError(-32602, "fields must be an object", "Send a partial chart.");
    if (!idem) throw new ToolError(-32602, "idem is required", "Generate a UUID per write.");

    const replayed = replay(db, project, idem);
    if (replayed) return replayed;

    return transaction(db, () => {
      const chart = readChart(db, project);
      const conflicts = [];
      const applied = [];
      const nextFieldRevs = { ...chart.fieldRevs };

      for (const [field, value] of Object.entries(fields)) {
        const fieldRev = chart.fieldRevs[field] ?? 0;
        if (fieldRev > baseRev) {
          conflicts.push({
            field,
            ours: chart.data[field],
            theirs: value,
            oursActor: chart.row.updated_by,
          });
          continue;
        }
        chart.data[field] = value;
        nextFieldRevs[field] = chart.row.rev + 1;
        applied.push(field);
      }

      if (applied.length === 0) {
        return { ok: false, rev: chart.row.rev, applied, conflicts };
      }

      const rev = bumpRev(db, project.id);
      db.prepare(
        `UPDATE documents SET body = ?, field_revs = ?, rev = ?, updated_at = ?, updated_by = ?
         WHERE id = ?`,
      ).run(JSON.stringify(chart.data), JSON.stringify(nextFieldRevs), rev, now(), actor.id, chart.row.id);

      recordEvent(db, {
        projectId: project.id,
        actorId: actor.id,
        entity: "chart",
        entityId: chart.row.id,
        op: "update",
        patch: Object.fromEntries(applied.map((field) => [field, chart.data[field]])),
        baseRev,
        rev,
        idem,
      });

      for (const conflict of conflicts) {
        db.prepare(
          `INSERT INTO conflicts (id, project_id, entity, entity_id, field, ours, theirs, ours_actor, theirs_actor, at)
           VALUES (?, ?, 'chart', ?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          ulid(),
          project.id,
          chart.row.id,
          conflict.field,
          JSON.stringify(conflict.ours),
          JSON.stringify(conflict.theirs),
          conflict.oursActor,
          actor.id,
          now(),
        );
      }

      return { ok: true, rev, applied, conflicts };
    });
  };

  tools.finding_upsert = (args = {}) => {
    const { rule, file, line, snippet, severity, message, fix, visitId = null, idem } = args;
    if (!rule || !file || !Number.isInteger(line) || !snippet || !severity || !message || !fix) {
      throw new ToolError(-32602, "rule, file, line, snippet, severity, message, and fix are required");
    }
    if (!idem) throw new ToolError(-32602, "idem is required");

    const replayed = replay(db, project, idem);
    if (replayed) return replayed;

    const target = normalizePath(file);
    const id = fingerprint({ rule, file: target, snippet });

    return transaction(db, () => {
      const existing = db.prepare("SELECT * FROM findings WHERE project_id = ? AND fingerprint = ?").get(project.id, id);
      const at = now();

      if (existing) {
        db.prepare("UPDATE findings SET last_seen = ?, line = ?, visit_id = COALESCE(?, visit_id) WHERE id = ?").run(
          at,
          line,
          visitId,
          existing.id,
        );
        const rev = bumpRev(db, project.id);
        recordEvent(db, {
          projectId: project.id,
          actorId: actor.id,
          entity: "finding",
          entityId: existing.id,
          op: "update",
          patch: { status: existing.status, lastSeen: at },
          rev,
          idem,
        });
        return { id: existing.id, fingerprint: id, created: false, rev };
      }

      const findingId = ulid();
      db.prepare(
        `INSERT INTO findings (id, project_id, fingerprint, rule, family, severity, file, line, snippet, message, fix, status, first_seen, last_seen, visit_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)`,
      ).run(
        findingId,
        project.id,
        id,
        rule,
        rule.split(".")[0],
        severity,
        target,
        line,
        String(snippet).slice(0, 400),
        message,
        fix,
        at,
        at,
        visitId,
      );

      const rev = bumpRev(db, project.id);
      recordEvent(db, {
        projectId: project.id,
        actorId: actor.id,
        entity: "finding",
        entityId: findingId,
        op: "create",
        patch: { rule, file: target, line, severity },
        rev,
        idem,
      });
      return { id: findingId, fingerprint: id, created: true, rev };
    });
  };

  tools.finding_list = ({ status, severity, file, limit = 50 } = {}) => {
    const clauses = ["project_id = ?"];
    const params = [project.id];
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    }
    if (severity) {
      clauses.push("severity = ?");
      params.push(severity);
    }
    if (file) {
      clauses.push("file = ?");
      params.push(normalizePath(file));
    }
    const rows = db
      .prepare(
        `SELECT * FROM findings WHERE ${clauses.join(" AND ")}
         ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'noticeable' THEN 1 ELSE 2 END, file, line
         LIMIT ?`,
      )
      .all(...params, Math.min(Number(limit) || 50, 200));

    return {
      findings: rows.map((row) => ({
        id: row.id,
        rule: row.rule,
        severity: row.severity,
        file: row.file,
        line: row.line,
        status: row.status,
        message: row.message,
        fix: row.fix,
        firstSeen: row.first_seen,
        lastSeen: row.last_seen,
      })),
    };
  };

  tools.finding_resolve = ({ id, status, note = "", idem } = {}) => {
    if (!id || !status || !idem) throw new ToolError(-32602, "id, status, and idem are required");
    if (!["fixed", "waived", "false-positive"].includes(status)) {
      throw new ToolError(-32602, `unknown status ${status}`);
    }
    const replayed = replay(db, project, idem);
    if (replayed) return replayed;

    return transaction(db, () => {
      const row = db.prepare("SELECT * FROM findings WHERE project_id = ? AND id = ?").get(project.id, id);
      if (!row) throw new ToolError(-32602, `no finding ${id}`);
      db.prepare("UPDATE findings SET status = ?, last_seen = ? WHERE id = ?").run(status, now(), id);
      const rev = bumpRev(db, project.id);
      recordEvent(db, {
        projectId: project.id,
        actorId: actor.id,
        entity: "finding",
        entityId: id,
        op: "update",
        patch: { status, note },
        rev,
        idem,
      });
      return { ok: true, id, status, rev };
    });
  };

  tools.visit_record = ({ scope, command, total, scores, band, reportMd, idem } = {}) => {
    if (!scope || !command || !Number.isInteger(total) || !scores || !band || !reportMd) {
      throw new ToolError(-32602, "scope, command, total, scores, band, and reportMd are required");
    }
    if (!idem) throw new ToolError(-32602, "idem is required");
    const replayed = replay(db, project, idem);
    if (replayed) return replayed;

    return transaction(db, () => {
      const id = ulid();
      const at = now();
      db.prepare(
        `INSERT INTO visits (id, project_id, scope, command, band, total, scores, report_md, actor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, project.id, scope, command, band, total, JSON.stringify(scores), reportMd, actor.id, at);
      const rev = bumpRev(db, project.id);
      recordEvent(db, {
        projectId: project.id,
        actorId: actor.id,
        entity: "visit",
        entityId: id,
        op: "create",
        patch: { scope, total, band },
        rev,
        idem,
      });
      return { id, at, rev };
    });
  };

  tools.visit_list = ({ scope, limit = 20 } = {}) => {
    const rows = scope
      ? db
          .prepare("SELECT * FROM visits WHERE project_id = ? AND scope = ? ORDER BY created_at DESC LIMIT ?")
          .all(project.id, scope, Math.min(Number(limit) || 20, 100))
      : db.prepare("SELECT * FROM visits WHERE project_id = ? ORDER BY created_at DESC LIMIT ?").all(project.id, Math.min(Number(limit) || 20, 100));

    return {
      visits: rows.map((row) => ({
        id: row.id,
        scope: row.scope,
        command: row.command,
        total: row.total,
        band: row.band,
        createdAt: row.created_at,
      })),
    };
  };

  tools.waiver_add = ({ rule, scope, reason, idem } = {}) => {
    if (!rule || !scope || !reason || !idem) throw new ToolError(-32602, "rule, scope, reason, and idem are required");
    if (String(reason).trim().length < 4) throw new ToolError(-32602, "a waiver needs a reason");
    const replayed = replay(db, project, idem);
    if (replayed) return replayed;

    return transaction(db, () => {
      const id = ulid();
      const status = actor.kind === "human" ? "accepted" : "proposed";
      db.prepare(
        `INSERT INTO waivers (id, project_id, rule, scope, reason, status, proposed_by, approved_by, created_at, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, project.id, rule, scope, reason, status, actor.id, status === "accepted" ? actor.id : null, now(), status === "accepted" ? now() : null);
      const rev = bumpRev(db, project.id);
      recordEvent(db, {
        projectId: project.id,
        actorId: actor.id,
        entity: "waiver",
        entityId: id,
        op: "create",
        patch: { rule, scope, reason, status },
        rev,
        idem,
      });
      return { id, status, rev };
    });
  };

  tools.sync_pull = ({ since = 0, limit = 200 } = {}) => {
    const rows = db
      .prepare("SELECT * FROM events WHERE project_id = ? AND seq > ? ORDER BY seq LIMIT ?")
      .all(project.id, Number(since) || 0, Math.min(Number(limit) || 200, 500));

    const nextSeq = rows.length ? rows[rows.length - 1].seq : Number(since) || 0;
    db.prepare(
      `INSERT INTO cursors (actor_id, project_id, last_seq, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(actor_id, project_id) DO UPDATE SET last_seq = excluded.last_seq, updated_at = excluded.updated_at`,
    ).run(actor.id, project.id, nextSeq, now());

    return {
      events: rows.map((row) => ({
        seq: row.seq,
        id: row.id,
        at: row.at,
        actor: row.actor_id,
        entity: row.entity,
        entityId: row.entity_id,
        op: row.op,
        patch: JSON.parse(row.patch),
        baseRev: row.base_rev,
        rev: row.rev,
        idem: row.idem,
      })),
      nextSeq,
      hasMore: rows.length === Math.min(Number(limit) || 200, 500),
    };
  };

  tools.sync_push = ({ events = [] } = {}) => {
    const applied = [];
    const skipped = [];
    for (const event of events) {
      if (!event?.idem) {
        skipped.push({ idem: null, reason: "missing idem" });
        continue;
      }
      if (eventByIdem(db, project.id, event.idem)) {
        skipped.push({ idem: event.idem, reason: "duplicate" });
        continue;
      }
      const rev = bumpRev(db, project.id);
      recordEvent(db, {
        projectId: project.id,
        actorId: event.actor ?? actor.id,
        entity: event.entity ?? "unknown",
        entityId: event.entityId ?? "unknown",
        op: event.op ?? "update",
        patch: event.patch ?? {},
        baseRev: event.baseRev ?? null,
        rev,
        idem: event.idem,
      });
      applied.push(event.idem);
    }
    return { applied, skipped };
  };

  tools.export_text = ({ dir } = {}) => {
    const target = dir ?? project.dir;
    const chart = readChart(db, project);
    const written = [];

    const chartPath = join(target, "chart.md");
    writeFileSync(chartPath, chart.markdown, "utf8");
    written.push(chartPath);

    const findings = tools.finding_list({ limit: 200 }).findings;
    const findingsPath = join(target, "findings.jsonl");
    writeFileSync(findingsPath, findings.map((finding) => JSON.stringify(finding)).join("\n") + (findings.length ? "\n" : ""), "utf8");
    written.push(findingsPath);

    const waivers = db.prepare("SELECT * FROM waivers WHERE project_id = ? AND status = 'accepted'").all(project.id);
    const waiverPath = join(target, "waivers.json");
    writeFileSync(
      waiverPath,
      `${JSON.stringify(
        {
          version: 1,
          waivers: waivers.map((w) => ({ rule: w.rule, scope: w.scope, reason: w.reason, approvedBy: w.approved_by, approvedAt: w.approved_at })),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    written.push(waiverPath);

    return { written };
  };

  tools.score_compute = ({ dimensions, estimates = [] } = {}) => computeScore({ dimensions, estimates });

  return tools;
}
