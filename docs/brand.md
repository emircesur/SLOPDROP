# Brand

A slop detector cannot ship a sloppy interface. SLOPDROP's own surfaces are the first test case.

## Position

An instrument, not a landing page. Dense, flat, readable, table-first. It should feel like a measurement device that happens to be well designed, not a startup that happens to measure design.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F5F2EA` | Page background |
| `--ink` | `#111110` | Primary text |
| `--muted` | `#6B675F` | Secondary text |
| `--line` | `#D9D3C7` | Borders, dividers |
| `--signal` | `#D93A1F` | Slop, failure, critical |
| `--pass` | `#1C6B4A` | Clean, passing |
| `--warn` | `#B4720E` | Estimated, not profiled |
| `--surface` | `#FFFDF7` | Raised content |
| Space | 4, 8, 12, 16, 24, 32, 48 | One scale, everywhere |
| Radius | 0 cards, 2px inputs | Rounding is a decision, not a default |
| Elevation | border only | A shadow that carries no hierarchy is noise |
| Motion | 120ms opacity | `prefers-reduced-motion` is the default |

Single accent rule: `--signal` is the only chromatic color that carries meaning beyond pass/warn. If a screen needs a second accent, the screen is wrong.

## Type

- UI: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Identifiers, numbers, rule ids, file paths: `ui-monospace, "SF Mono", "JetBrains Mono", monospace`.
- Scale: 12 / 13 / 15 / 17 / 20 / 26 / 34. Two weights: 400, 600.
- Sentence case everywhere. No tracked capitals. No letter-spacing above 0.01em.
- Numbers use tabular figures.

The system font is deliberate. "Inter because it looks modern" is the tell we are treating.

## Components

**Verdict block.** One-sentence verdict, total out of 24, six dimension rows, band tag. Color appears only on the band tag.

**Finding row.** `file:line` in mono, severity tag, one sentence of what is wrong, one sentence of fix. Clicking opens the file at the line.

**Score table.** Six rows, 0–4, one reason each. No gauge, no dial, no animated counter. A number and a table are enough.

**Before/after.** Same screen, same data, same device, same appearance. Labels above the images, not in the middle of them.

**Chart editor.** Markdown, editable. Saving increments the revision and emits an event to the other agents.

**Diff summary.** Additions and deletions at the top; color only on the `+` and `−` markers.

## Voice

Dry, specific, on the screen's side rather than the person's. Humor is rare and short. Praise is not a category; say what works instead.

Good verdicts:

- "The order button moved, the list stutters, and the dashboard reports numbers no one measured."
- "Four cards, two hamburger menus, and a back button that goes to the wrong place."
- "The screen is clean. Cover the logo and it could be any product."
- "Three gradients, two sparkles, and not one real number."

Bad verdicts:

- "Classic AI slop." Generic, which is the thing being treated.
- "Your design is terrible." Aimed at the person, not the screen.
- "Looks great!" Unmeasured praise is not a report.

Banned in our own copy: seamless, effortless, supercharge, unlock, elevate, AI-powered, next-generation, built for the future, trusted by, exclamation marks, emoji.

## Surfaces

- CLI: aligned columns, no color, a boundary line at the end of every output.
- Docs: short paragraphs, tables where a table is clearer, no hero sections.
- Web: a single column of evidence, no carousel, no "trusted by" strip, no chatbot bubble.
- Plugin and marketplace listings: the first sentence says what it does, the second says what it will not do.

## The test

Run SLOPDROP on SLOPDROP. If the detector fires on our own README, CLI output, or site, fix the site before shipping the rule.
