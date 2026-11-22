// SARIF 2.1.0 output, so a scan shows up in GitHub code scanning, VS Code's
// SARIF viewer, or any other tool that reads the standard. Pure function.

import { VERSION } from "./engine.mjs";

const LEVEL = { critical: "error", noticeable: "warning", minor: "note" };
const SECURITY_SEVERITY = { critical: "7.0", noticeable: "4.0", minor: "1.0" };

export function toSarif(result, catalog = []) {
  const used = [...new Set(result.findings.map((f) => f.rule))].sort();
  const byId = new Map(catalog.map((rule) => [rule.id, rule]));

  const rules = used.map((id) => {
    const rule = byId.get(id) ?? {};
    const sample = result.findings.find((f) => f.rule === id);
    return {
      id,
      name: id.replace(/[.-](\w)/g, (_, c) => c.toUpperCase()),
      shortDescription: { text: rule.message ?? sample.message },
      fullDescription: { text: rule.message ?? sample.message },
      help: { text: `Fix: ${rule.fix ?? sample.fix}`, markdown: `**Fix:** ${rule.fix ?? sample.fix}` },
      defaultConfiguration: { level: LEVEL[rule.severity ?? sample.severity] ?? "note" },
      properties: {
        tags: ["slopdrop", rule.family ?? sample.family].filter(Boolean),
        "problem.severity": LEVEL[rule.severity ?? sample.severity] ?? "note",
        "security-severity": SECURITY_SEVERITY[rule.severity ?? sample.severity] ?? "1.0",
        heuristic: Boolean(rule.heuristic ?? sample.heuristic),
      },
    };
  });

  const index = new Map(used.map((id, i) => [id, i]));

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "SLOPDROP",
            informationUri: "https://github.com/emircesur/SLOPDROP",
            semanticVersion: `0.1.${VERSION}`,
            rules,
          },
        },
        results: result.findings.map((f) => ({
          ruleId: f.rule,
          ruleIndex: index.get(f.rule),
          level: LEVEL[f.severity] ?? "note",
          message: { text: `${f.message} Fix: ${f.fix}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.file, uriBaseId: "%SRCROOT%" },
                region: { startLine: f.line, snippet: { text: f.snippet } },
              },
            },
          ],
          partialFingerprints: { slopdropFingerprint: f.fingerprint },
          properties: { heuristic: f.heuristic, note: "A hit is a lead, not a finding." },
        })),
        columnKind: "unicodeCodePoints",
      },
    ],
  };
}
