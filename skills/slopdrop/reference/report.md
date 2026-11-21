# The report

## Severity

- **Critical:** a user cannot finish a task, gets wrong information, or cannot read or reach a primary control.
- **Noticeable:** a task is slower or more confusing, or the screen clearly looks generated.
- **Minor:** polish that does not affect the task.
- **Ask first:** a fix that would change navigation, visual identity, monetization, or a frequently used control.

Keep Minor short. More than eight: list the top eight and give a count for the rest.

## Scores

Score each dimension 0–4 from what you saw. A score needs a reason: the worst finding in that dimension, or what earned the 4.

| Dimension | 0 | 4 |
|---|---|---|
| Task path | Core task blocked or interrupted | Direct, thumb-reachable, uninterrupted |
| Truth | Errors shown as empty, invented data | Every number and state real and labeled |
| Native fit | A website in a phone, or a web page that breaks the web | A fluent user trusts every screen |
| States and input | Happy path only | Every state designed and reachable |
| Access | Unusable with a screen reader or large text | Labeled, ordered, scales cleanly |
| Specificity | Could be any app; generated tells throughout | Built from this product's content and voice |

Total out of 24:

- 21–24: **clean.** Minor polish.
- 16–20: **smudged.** Address the weak dimensions.
- 11–15: **sloppy.** Significant work.
- 0–10: **deep-slop.** Start with Critical and Task path.

Performance is not scored. It gets its own line.

When you reviewed from code only, mark Native fit, States and input, and Access as estimated with `~` before the score.

## Format

```text
SLOPDROP review
Verdict: <one dry sentence>
Stack: <stack and platforms>
Reviewed: <screens, top tasks, running app or code only>
Score: <total>/24 <band>  Task <n> · Truth <n> · Native <n> · States <n> · Access <n> · Specificity <n>
Performance: <"Not profiled." and static leads, or what was profiled, how, and the numbers>

Critical
- <file:line> <what is wrong and who it hurts> -> <specific fix>

Noticeable
- <file:line> <what is wrong> -> <specific fix>

Minor
- <file:line> <what is wrong> -> <specific fix>

Ask first
- <file:line> <what is wrong> -> <proposed fix and what it would change for users>

Waived
- <rule or tell> kept because <reason>, recorded in the chart

Worth keeping
- <what already works and should survive the treatment>

Not checked
- <anything you could not verify, always including performance unless profiled>
```

Leave out empty sections, except Not checked.

If the screen is healthy, the verdict says so and the report is short. A report that invents problems to fill its sections is its own kind of slop.

## The verdict line

One sentence, dry, specific to this app. It names the worst thing, not the funniest. It is never cruel about the person and never about AI use; the patient is the screen.

Good: "The order button moved, the list stutters, and the dashboard reports numbers no one measured."
Bad: "Classic AI slop." Generic, which is the thing being treated.

## After a treatment

List what changed by screen. Capture before and after screenshots of the same screen, same data, same device, same appearance. Run the self-check in `treatment.md` and give the new score.

## Saving the visit

Write the report to `.slopdrop/visits/<YYYY-MM-DD-HHmm>-<scope>.md`, local time in 24-hour form, scope as a short slug ("home", "checkout-flow"). If the file exists, add `-2`, `-3` before `.md`; never overwrite. Names sort by time, so `follow-up` reads the last file for the same scope in name order and adds one line per dimension: `Task path 2 -> 3`. Skip saving if the chart says `visits: off`.

If the MCP server is available, also record it with `visit_record` so the other agents see it.
