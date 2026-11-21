# Field test 1: a real Next.js app

The first run against code nobody wrote for this tool. Goal: measure precision, find rule defects, and see what the catalog misses.

## Subject

A public, MIT-licensed Next.js App Router application: a marketing site, docs, an auth flow, a dashboard, and an editor. 14 routes, 132 source files (`.tsx`, `.ts`, `.css`), Tailwind, shadcn/ui components. Anonymous here on purpose; the point is the method, not the brand.

Reviewed from code only. No browser, no screenshots, no profiler.

## Method

```bash
node packages/detect/bin/slopdrop-detect.mjs <app>/ --platform web --json
```

Every hit was opened in context before being counted. A hit is confirmed when the flagged pattern is real in that product and the described harm applies; it is a false positive when the pattern is present but the rule misreads it.

## Raw result

177 ms for 132 files. 34 hits in 21 files.

| Rule | Hits | Severity |
|---|---|---|
| `a11y.focus-removed` | 19 | noticeable |
| `motion.transition-all` | 7 | minor |
| `copy.oops-error` | 6 | noticeable |
| `ui.icon-tile` | 1 | minor |
| `ui.status-dot` | 1 | minor |

## What the review found

Fourteen of the 34 hits held up. The other twenty exposed three rule defects.

| Rule | Confirmed | False | Why |
|---|---|---|---|
| `motion.transition-all` | 7 | 0 | Real `transition-all` on transforms, overlays, progress, tabs, toasts. All should name the property. |
| `copy.oops-error` | 6 | 0 | Six toast titles say "Something went wrong." with no cause and no next step. |
| `a11y.focus-removed` | 1 | 18 | `outline-none` on a title textarea is real. But the rule also fired on menu items with `focus:bg-accent`, on `aria-selected` rows, and on non-interactive popover and hover-card surfaces that are not keyboard stops. |
| `ui.icon-tile` | 0 | 1 | Matched a navigation link with `bg-accent/50` and `h-10`; it is not a square icon tile. |
| `ui.status-dot` | 0 | 1 | Matched a slider track (`h-2 w-full rounded-full`); a slider is not a status dot. |

Precision before review: 14/34, 41%. That is what "a hit is a lead" means in practice.

## What changed because of it

Three rule defects fixed in the catalog, with fixtures that keep them fixed:

1. **`ui.status-dot`** now requires both dimensions to be small and equal-ish, or the `size-*` utility. A wide track with a small height no longer matches.
2. **`ui.icon-tile`** now requires a square: both `w-*` and `h-*`, or `size-*`, plus a tint and centered content. A nav link with a tinted hover state no longer matches.
3. **`a11y.focus-removed`** now excludes lines that already show focus or selection (`aria-selected:`, `bg-popover`, open-state styling) and files that handle focus at the container (`focus-within`, `focus:bg-`, `focus:text-`, `focus:border-`).

The clean fixture grew a `Ui.tsx` with the exact false positives: a slider track, a tinted nav link, a command row with `aria-selected`, a popover surface.

## Result after the fix

Same 132 files, 177 ms, 15 hits in 14 files.

| Rule | Hits |
|---|---|
| `motion.transition-all` | 7 |
| `copy.oops-error` | 6 |
| `a11y.focus-removed` | 2 |

14 of 15 confirmed on review (93%); the remaining one is a command input with no visible focus ring, which is arguable because the caret is visible. That is the honest ceiling of a static rule: it can find the class, not judge the screen.

## What the rules missed

The interesting part. This app is a textbook example of the calm generated look, and almost none of it is detectable from class strings without turning into noise:

- Inter everywhere, zinc neutrals, `rounded-lg border shadow-sm` cards, `text-muted-foreground` under every title.
- A `Badge` on most rows, a two-column bento grid on the marketing page, a dashboard that opens with stat cards.
- An editor toolbar of icon-only buttons where the icon is a lucide glyph in a bordered square.
- Marketing copy with the same rhythm on every section.

These are judgment calls in `reference/tells.md`, not rules. A regex for `Badge` would fire on every shadcn app and tell the reviewer nothing. This is the boundary the product claims: deterministic evidence for what code gives away, eyes for what it does not.

Also missed: Next.js `<Image>` is not `<img>`, so the alt-text rule did not run on any image; Tailwind arbitrary values like `h-[38px]` are not covered; no mobile, no spatial, no visual contrast, no focus order, no performance.

## Limits

- One app, one platform, one reviewer. Not a benchmark.
- No running app, so no task-path, truth, state, or accessibility findings beyond code patterns.
- The rule changes were made after seeing this app, so the post-fix precision is optimistic. The fixtures are the guard against tuning to one codebase.
- The app is a component-library demo; its tells are the library's defaults, not a team's original choices.

## Next field tests

1. A React Native or Expo app, for the mobile-only rules (drawer, keyboard, safe area, back gesture).
2. A Flutter app, for the template-theme and adaptive-widget rules.
3. A visionOS or Unity sample, for the spatial rules that are currently judgment-only.
4. A project with a committed chart, to measure whether accepted exceptions actually stop re-flagging.
