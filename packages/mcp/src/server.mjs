#!/usr/bin/env node
// Minimal, dependency-free MCP server over stdio (JSON-RPC 2.0, one object per line).
// The tools live in tools.mjs; this file is transport, discovery, and lifecycle.

import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadRules } from "../../rules/index.mjs";
import { ensureActor, ensureProject, openDb } from "./db.mjs";
import { createTools, ToolError } from "./tools.mjs";

export const SERVER_INFO = { name: "slopdrop", version: "0.1.0" };
export const PROTOCOL_VERSION = "2025-06-18";

const TOOL_DEFS = [
  {
    name: "project_open",
    description: "Open or create the SLOPDROP project for a directory. Returns the project id, revision, and your actor id.",
    inputSchema: { type: "object", properties: { root: { type: "string" } }, required: ["root"] },
  },
  {
    name: "chart_read",
    description: "Read the project chart: stack, platforms, top tasks, users, brand, accepted exceptions, off-limits areas. Returns parsed data and rendered markdown.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "chart_patch",
    description: "Patch chart fields with optimistic concurrency. Fields changed since baseRev are refused and recorded as conflicts.",
    inputSchema: {
      type: "object",
      properties: {
        baseRev: { type: "integer" },
        fields: { type: "object" },
        idem: { type: "string" },
      },
      required: ["baseRev", "fields", "idem"],
    },
  },
  {
    name: "finding_upsert",
    description: "Record a confirmed finding. Idempotent by rule + file + snippet fingerprint; a repeat updates lastSeen instead of duplicating.",
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string" },
        file: { type: "string" },
        line: { type: "integer", minimum: 1 },
        snippet: { type: "string" },
        severity: { enum: ["critical", "noticeable", "minor"] },
        message: { type: "string" },
        fix: { type: "string" },
        visitId: { type: "string" },
        idem: { type: "string" },
      },
      required: ["rule", "file", "line", "snippet", "severity", "message", "fix", "idem"],
    },
  },
  {
    name: "finding_list",
    description: "List findings, optionally filtered by status, severity, or file.",
    inputSchema: {
      type: "object",
      properties: {
        status: { enum: ["open", "fixed", "waived", "false-positive"] },
        severity: { enum: ["critical", "noticeable", "minor"] },
        file: { type: "string" },
        limit: { type: "integer", maximum: 200 },
      },
    },
  },
  {
    name: "finding_resolve",
    description: "Close a finding as fixed, waived, or false-positive.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { enum: ["fixed", "waived", "false-positive"] },
        note: { type: "string" },
        idem: { type: "string" },
      },
      required: ["id", "status", "idem"],
    },
  },
  {
    name: "visit_record",
    description: "Record a review: scope, command, score, band, and the full report. Visits are never edited.",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string" },
        command: { enum: ["review", "treat", "follow-up", "scan"] },
        total: { type: "integer", minimum: 0, maximum: 24 },
        scores: { type: "object" },
        band: { enum: ["clean", "smudged", "sloppy", "deep-slop"] },
        reportMd: { type: "string" },
        idem: { type: "string" },
      },
      required: ["scope", "command", "total", "scores", "band", "reportMd", "idem"],
    },
  },
  {
    name: "visit_list",
    description: "List visits, newest first, optionally for one scope.",
    inputSchema: {
      type: "object",
      properties: { scope: { type: "string" }, limit: { type: "integer", maximum: 100 } },
    },
  },
  {
    name: "waiver_add",
    description: "Propose a waiver. Agents get status=proposed; only a human caller gets accepted.",
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string" },
        scope: { type: "string" },
        reason: { type: "string", minLength: 4 },
        idem: { type: "string" },
      },
      required: ["rule", "scope", "reason", "idem"],
    },
  },
  {
    name: "sync_pull",
    description: "Pull events after a cursor. Updates your cursor and returns hasMore.",
    inputSchema: {
      type: "object",
      properties: { since: { type: "integer" }, limit: { type: "integer", maximum: 500 } },
    },
  },
  {
    name: "sync_push",
    description: "Push events from another device or agent. Duplicate idempotency keys are skipped, not rejected.",
    inputSchema: {
      type: "object",
      properties: { events: { type: "array", items: { type: "object" } } },
      required: ["events"],
    },
  },
  {
    name: "export_text",
    description: "Write chart.md, findings.jsonl, waivers.json, and visits.jsonl back to the project's .slopdrop directory, plus one markdown file per visit.",
    inputSchema: { type: "object", properties: { dir: { type: "string" } } },
  },
  {
    name: "import_text",
    description: "Rebuild the database from the committed text artifacts. Idempotent: unchanged files produce no events.",
    inputSchema: { type: "object", properties: { dir: { type: "string" } } },
  },
  {
    name: "score_compute",
    description: "Compute the six-dimension score, total out of 24, band, and slop index from scores and findings.",
    inputSchema: {
      type: "object",
      properties: {
        dimensions: { type: "object" },
        estimates: { type: "array", items: { type: "string" } },
      },
      required: ["dimensions"],
    },
  },
];

const RESOURCES = [
  { uri: "slopdrop://chart", name: "Project chart", mimeType: "text/markdown", description: "The rendered chart." },
  { uri: "slopdrop://findings?status=open", name: "Open findings", mimeType: "application/json", description: "Open findings, severity first." },
  { uri: "slopdrop://visits/latest", name: "Recent visits", mimeType: "application/json", description: "The last visits per scope." },
];

function jsonrpcError(id, code, message, data) {
  return { jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) } };
}

function textResult(payload) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export function createHandler({ projectRoot = process.cwd(), actorId, actorKind = "agent", actorLabel, client = "mcp" } = {}) {
  const opened = openDb(projectRoot);
  const project = ensureProject(opened.db, opened.root);
  const actor = ensureActor(opened.db, {
    id: actorId ?? `${client}:${Math.random().toString(36).slice(2, 6)}`,
    kind: actorKind,
    label: actorLabel ?? actorId ?? client,
    client,
  });
  const tools = createTools({ db: opened.db, project: { ...project, dir: opened.dir, file: opened.file }, actor });

  async function handle(message) {
    const { id = null, method, params = {} } = message ?? {};
    const isNotification = id === null || id === undefined;

    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false } },
            serverInfo: SERVER_INFO,
            instructions:
              "SLOPDROP: read the chart, verify detector hits in context, record confirmed findings and visits, and propose waivers instead of assuming them.",
          },
        };

      case "notifications/initialized":
      case "notifications/cancelled":
        return null;

      case "ping":
        return { jsonrpc: "2.0", id, result: {} };

      case "tools/list":
        return { jsonrpc: "2.0", id, result: { tools: TOOL_DEFS } };

      case "tools/call": {
        const { name, arguments: args = {} } = params;
        const tool = tools[name];
        if (typeof tool !== "function") {
          return jsonrpcError(id, -32601, `Unknown tool ${name}`, { supported: Object.keys(tools) });
        }
        try {
          const result = await tool(args);
          return { jsonrpc: "2.0", id, result: textResult(result) };
        } catch (error) {
          if (error instanceof ToolError) {
            return jsonrpcError(id, error.code, error.message, error.remedy ? { remedy: error.remedy } : undefined);
          }
          return jsonrpcError(id, -32603, error.message);
        }
      }

      case "resources/list":
        return { jsonrpc: "2.0", id, result: { resources: RESOURCES } };

      case "resources/read": {
        const uri = params.uri;
        try {
          if (uri === "slopdrop://chart") {
            const chart = tools.chart_read();
            return { jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "text/markdown", text: chart.markdown }] } };
          }
          if (uri?.startsWith("slopdrop://findings")) {
            const status = new URL(uri).searchParams.get("status") ?? undefined;
            const payload = tools.finding_list({ status });
            return { jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(payload, null, 2) }] } };
          }
          if (uri === "slopdrop://visits/latest") {
            const payload = tools.visit_list({ limit: 10 });
            return { jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(payload, null, 2) }] } };
          }
          if (uri?.startsWith("slopdrop://rules/")) {
            const ruleId = uri.slice("slopdrop://rules/".length);
            const rule = loadRules().find((r) => r.id === ruleId);
            if (!rule) return jsonrpcError(id, -32602, `Unknown rule ${ruleId}`);
            return { jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(rule, null, 2) }] } };
          }
          return jsonrpcError(id, -32602, `Unknown resource ${uri}`);
        } catch (error) {
          return jsonrpcError(id, -32603, error.message);
        }
      }

      default:
        if (isNotification) return null;
        return jsonrpcError(id, -32601, `Unknown method ${method}`);
    }
  }

  return { handle, db: opened.db, project, actor, file: opened.file };
}

export function main(argv = process.argv.slice(2)) {
  const index = argv.indexOf("--project");
  const projectRoot = index !== -1 ? resolve(argv[index + 1]) : process.cwd();
  const human = argv.includes("--human");

  const handler = createHandler({
    projectRoot,
    actorId: process.env.SLOPDROP_ACTOR,
    actorKind: human ? "human" : process.env.SLOPDROP_ACTOR_KIND ?? "agent",
    actorLabel: process.env.SLOPDROP_ACTOR_LABEL,
    client: process.env.SLOPDROP_CLIENT ?? "mcp",
  });

  process.stderr.write(`slopdrop mcp: ${handler.file}\n`);

  if (human && handler.db) {
    handler.db.prepare("UPDATE actors SET kind = 'human' WHERE id = ?").run(handler.actor.id);
  }

  const rl = createInterface({ input: process.stdin, terminal: false });
  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      process.stdout.write(`${JSON.stringify(jsonrpcError(null, -32700, "Parse error"))}\n`);
      return;
    }
    try {
      const response = await handler.handle(message);
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify(jsonrpcError(message.id ?? null, -32603, error.message))}\n`);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
