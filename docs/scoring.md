# Scoring

Six dimensions, each 0–4, total 24. The score is a summary, not the product; the findings are.

## Severity

| Level | Definition |
|---|---|
| Critical | A user cannot finish a task, gets wrong information, or cannot read or reach a primary control. |
| Noticeable | A task is slower or more confusing, or the screen clearly looks generated. |
| Minor | Polish that does not affect the task. |
| Ask first | A fix that would change navigation, visual identity, monetization, or a frequently used control. |

Ask-first items are not counted in the score. They are decisions for a human, not defects.

## Dimensions

| Dimension | Key | Asks | 0 anchor | 4 anchor |
|---|---|---|---|---|
| Task path | `taskPath` | Can people do what they came to do, fast, with controls where they expect, and nothing in the way? | Core task blocked or interrupted | Direct, reachable, uninterrupted |
| Truth | `truth` | Do labels, numbers, and states say what is true? | Errors shown as empty, invented data | Every number and state real and labeled |
| Native fit | `nativeFit` | Navigation, gestures, controls, safe areas as the platform expects; on web, real controls, URLs, focus, zoom | A website in a phone, or a page that breaks the web | A fluent user trusts every screen |
| States and input | `states` | Loading, empty, error, offline, pressed, keyboard | Happy path only | Every state designed and reachable |
| Access | `access` | Targets, contrast, text scaling, screen reader labels and order | Unusable with a screen reader or large text | Labeled, ordered, scales cleanly |
| Specificity | `specificity` | Does it look like this product rather than a template, old or new? | Could be any app | Built from this product's content and voice |

A score needs a reason: the worst finding in that dimension, or the thing that earned the 4.

## Bands

| Total | Band | Meaning |
|---|---|---|
| 21–24 | `clean` | Minor polish. Say it is healthy and leave it alone. |
| 16–20 | `smudged` | Address the weak dimensions. |
| 11–15 | `sloppy` | Significant work. |
| 0–10 | `deep-slop` | Start with Critical and Task path. |

## Slop index

`index = round((24 - total) / 24 * 100)`.

0 is clean, 100 is maximum slop. It exists for dashboards, badges, and CI thresholds. The 24-point clinical score stays the source of truth; the index is derived, never stored independently.

## Estimates

When the review is code-only, three dimensions are estimates: `nativeFit`, `states`, `access`. Mark them with `~` in the report and set `estimated: true` in the JSON. Never present an estimate as a measurement.

Performance is not a dimension. It is a line:

- `Not profiled.` plus static leads, by default.
- `Profiled on <device>, <build type>, with <tool>:` plus numbers, only when someone actually measured.

## Worked example

```json
{
  "findings": [
    { "rule": "ux.keyboard-cover", "severity": "critical" },
    { "rule": "ui.nested-cards", "severity": "noticeable" },
    { "rule": "copy.welcome-back", "severity": "minor" }
  ],
  "dimensions": {
    "taskPath": 2,
    "truth": 3,
    "nativeFit": 2,
    "states": 2,
    "access": 2,
    "specificity": 1
  }
}
```

Total 12, band `sloppy`, index `50`. Verdict: the keyboard hides the field, the list is wrapped in three containers, and the screen opens with a greeting instead of the task.

## CI gate

```toml
[gate]
max_critical = 0
max_slop_index = 45
fail_on_new_rules = ["xr.*", "a11y.*"]
```

The gate reads confirmed findings, not raw detector hits. A rule hit that the agent dismissed as a false positive must not fail a build.

## Anti-gaming

- Do not raise a score by deleting findings without fixing them. Resolved findings need a note and a follow-up visit.
- Do not lower a score by waiving rules in bulk. Waivers require a reason and a human approval.
- Do not compare scores across products. 18/24 on a dense trading terminal and 18/24 on a bakery site mean different things.
- A clean score with `Not profiled` performance is not a clean bill of health.
