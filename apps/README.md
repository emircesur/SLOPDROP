# Apps

The packages and the skill are the product. This folder is for surfaces that need a UI and are not built yet.

Planned, in order:

1. **`apps/web`** — a local playground: paste a repo path or drop a folder, see the detector output, the chart, and the last visits. No upload, no account; it reads the same `.slopdrop/project.db` the agents use.
2. **`apps/desktop`** — an optional tray app that owns the MCP daemon (one writer, live change notifications) for people running three agents at once.
3. **`apps/docs`** — the public site for the rule catalog, with a before/after per rule. Static, generated from `packages/rules/`.

Nothing here ships before M1. A web surface that looks like every other generated dashboard would be the worst possible demo for this product.
