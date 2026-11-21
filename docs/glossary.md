# Glossary

**Actor** — who wrote a change: a human, an agent, or CI. Stored on every event.

**Bant / Band** — the verbal label for a 24-point score: `clean`, `smudged`, `sloppy`, `deep-slop`.

**Chart** — the project's standing context: stack, platforms, top tasks, users, brand, accepted exceptions, off-limits areas. One page, in `.slopdrop/chart.md`.

**Conflict** — two writes to the same field from different actors. Recorded as a row, never silently overwritten.

**Cursor** — an actor's last-seen event sequence, used for incremental sync.

**Detector** — the deterministic scanner. Reads source code, never runs it. Exit 2 means findings.

**Dimension** — one of the six scored aspects: task path, truth, native fit, states and input, access, specificity.

**Event** — one immutable row describing a mutation: actor, entity, operation, patch, revision, idempotency key.

**Finding** — a confirmed problem, with a rule id, a file and line, a severity, and a fix. A rule hit is not a finding until it is verified in context.

**Fingerprint** — a stable hash that lets the same finding survive re-scans and line moves.

**Floor** — the non-negotiable list every changed screen must meet: targets, contrast, text scaling, safe areas, states, labels.

**Idempotency key (`idem`)** — a client-generated UUID that makes a retried write safe.

**MCP** — Model Context Protocol. The local transport that lets several agents share one project database.

**Proposal** — a waiver an agent suggested but a human has not approved. Proposals suppress nothing.

**Rule** — catalog data: id, family, severity, platforms, stacks, patterns, message, fix.

**Severity** — critical, noticeable, minor, or ask-first. Ask-first is a decision, not a defect, and is not scored.

**Slop** — design that carries no decision: generic, sometimes untruthful, often friction-heavy.

**Slop index** — `(24 − total) / 24 × 100`. Derived from the clinical score; used for gates and badges.

**Tell** — an observable sign of slop. Most have a rule id; some require eyes on the running product.

**Triage** — the heavy / light / healthy decision made before any edit.

**Visit** — one recorded review: scope, command, scores, report, timestamp. Never edited; corrections are new visits.

**Waiver** — an accepted, reasoned exception, recorded in the chart and listed in the report.
