# Taxonomy

Slop is layered. Each layer has its own tells, its own measurement, and its own fix order.

| Layer | Tells | Detected by | Reference |
|---|---|---|---|
| Copy | Binary contrasts, faux insight, colon reveals, fake-profound endings, buzzwords | patterns + judgment | `reference/copy.md` |
| Layout | Nested cards, uniform card grids, centered text, chrome eating the screen | patterns + eyes | `reference/tells.md` |
| Color | Purple gradient, template theme, gradient text, meaningless accents | patterns | `reference/tells.md` |
| Type | One size for everything, fixed px, tracked caps, low contrast | patterns + eyes | `reference/tells.md` |
| Icons | Emoji, sparkles, icon tiles, mixed icon sets | patterns | `reference/tells.md` |
| Motion | `transition-all`, hover scale, looping pulse, mount animations everywhere | patterns | `reference/tells.md` |
| States | Happy path only, spinner for everything, "Oops" | patterns + judgment | `reference/tells.md` |
| Truth | Invented stats, unverified claims, failed loads shown as empty | patterns + data check | `reference/tells.md` |
| Access | Missing focus, small targets, zoom disabled, fixed text size | patterns + tools | `reference/platforms.md` |
| Platform fit | Website in a phone, iOS control on Android, broken back | patterns | `reference/platforms.md` |
| Spatial | Head-locked HUD, tiny angular text, forced locomotion | patterns + device | `reference/spatial.md` |
| Performance | Unvirtualized lists, main-thread work, frame drops | patterns (leads only) | `reference/performance.md` |

## Families and rule ids

| Prefix | Family | Example |
|---|---|---|
| `ui.` | Look | `ui.slop-gradient`, `ui.nested-cards`, `ui.icon-tile` |
| `ux.` | Interaction and platform fit | `ux.drawer-nav`, `ux.keyboard-cover` |
| `a11y.` | Accessibility | `a11y.focus-removed`, `a11y.zoom-disabled` |
| `copy.` | Copy | `copy.oops-error`, `copy.binary-contrast` |
| `motion.` | Motion | `motion.transition-all`, `motion.decorative-pulse` |
| `perf.` | Performance | `perf.unvirtualized-list`, `perf.frame-budget` |
| `truth.` | Truthfulness | `truth.invented-stat`, `truth.unverified-claim` |
| `web.` | Web-specific | `web.clickable-div`, `web.scroll-jack` |
| `xr.` | Spatial | `xr.headlocked-hud`, `xr.small-gaze-target` |

## Copy patterns

Each has a rule id and a one-line fix.

| Pattern | Rule | Fix |
|---|---|---|
| Binary contrast | `copy.binary-contrast` | State Y directly |
| Negative listing | `copy.negative-listing` | State Z |
| Throat-clearing opener | `copy.throat-clearing` | Cut, state the point |
| Faux-insight setup | `copy.faux-insight` | Cut the setup, keep the claim |
| Colon reveal | `copy.colon-reveal` | Plain sentence |
| Dramatic fragment | `copy.dramatic-fragment` | Complete sentence |
| Robotic rhythm | `copy.robotic-rhythm` | Vary only where it helps |
| Rhetorical setup | `copy.rhetorical-setup` | Drop the question |
| Superficial analysis | `copy.superficial-analysis` | Say the consequence |
| Importance puffery | `copy.importance-puffery` | State the fact |
| Interpretive metadiscourse | `copy.metadiscourse` | Delete the aside |
| Weasel attribution | `copy.weasel-attribution` | Name the source or cut |
| Fake-strong verb | `copy.fake-strong-verb` | Use "is" or "has" |
| Synonym cycling | `copy.synonym-cycling` | Repeat the right word |
| Fake-profound kicker | `copy.fake-profound` | End on the clearest concrete line |
| Summary recap | `copy.summary-recap` | End on the last point |
| Formatting slop | `copy.formatting-slop` | Format follows content |
| Em dash dependency | `copy.em-dash` | None in short copy, 1–2 in long |
| Buzzword | `copy.buzzword` | Plain words |
| Welcome back | `copy.welcome-back` | Use the space for the task |
| Vague button | `copy.vague-button` | Verb + object |
| Oops error | `copy.oops-error` | Cause + next step |

## Severity

The catalog assigns a default severity; the reviewer may raise it when the finding blocks a task. Severity never lowers below the catalog floor without a recorded reason.

## What is not a tell

- A brand gradient that comes from the logo and is used deliberately.
- A dense screen for a tool used all day.
- A custom control that carries the brand and keeps the platform's guarantees.
- Whitespace with a reason.
- A status dot with a text label, used consistently, that a color-blind user can read.

These belong in the chart under Accepted, with a reason.
