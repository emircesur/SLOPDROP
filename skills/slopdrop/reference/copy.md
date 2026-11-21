# Copy

Interface copy is half the product. Button labels, error messages, empty states, headings, notifications, marketing pages, emails.

Two jobs:

- **Edit** (default): make the minimum effective edit and return the full text plus **What changed**.
- **Detect**: name each pattern, quote the line, give the fix in a few words. Do not rewrite, score, or guess whether AI wrote it.

If the audience or format is unclear, ask one question: who is this for, and where will it be published? If the goal is unclear, ask what the reader should think, feel, or do.

## Editing principles

1. **Preserve the writer's voice.** Notice vocabulary, cadence, bluntness, humor, uncertainty, digressions, polish level. Keep what is personal. Do not make every paragraph equally tidy.
2. **Minimum effective edit.** Fix patterns, errors, repetition, and unclear passages. Leave strong human sentences alone.
3. **Lead with the point when the setup adds nothing.** Keep a personal aside that creates context, tension, or character.
4. **Front-load only when it improves clarity.** Do not force every section into point-detail-background.
5. **Keep the meaning.** No invented claims, examples, stats, or opinions. Ask when unsure.
6. **Open it up, do not dumb it down.** Keep substance and nuance; cut jargon, long sentences, abstract nouns, tangled structure.
7. **Active voice.** "The team shipped it Tuesday" beats "the decision emerged". Never let inanimate things do human verbs.
8. **Every sentence earns its place.** Cut empty qualifiers and throat-clearing. Keep "I think", "maybe", "to be honest" when they carry real uncertainty or rhythm.
9. **Untangle without flattening.** Split what is genuinely hard to follow. Keep clear spoken cadence, fragments, and pace changes.
10. **Be concrete.** "Cut deploy time from 40 minutes to 4" beats "improved efficiency". Names, numbers, dates, mechanisms, examples.
11. **Portability test.** If a sentence could move unchanged to another person, company, country, or product, it is filler.
12. **Show, do not tell.** Facts, actions, examples, consequences carry emphasis. Cut commentary that labels a point important, surprising, subtle, or obvious.
13. **Protect the specific fact.** Do not smooth a useful detail into generic importance.
14. **Verbs do the work.** "Made a decision" → "decided". "Has the ability to" → "can".
15. **Know the job.** What is this piece doing, and for whom?
16. **Preserve useful edge.** Strong opinions, blunt language, humor, profanity, self-interruptions, honest admissions stay if they belong to the writer.
17. **Keep structure unless it hurts.** If you reorganize, say why.
18. **Ask for the draft** if none was provided. Ask for the audience if it is unclear.

## Words to cut

Banned: delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, this is huge, this changes everything, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.

Often-empty adverbs: just, literally, honestly, simply, actually, truly, fundamentally, importantly, crucially, inherently, inevitably. Cut when they add nothing; keep when they carry emphasis, uncertainty, contrast, or spoken rhythm.

Often-empty phrases: it's worth noting, it's important to note, at the end of the day, when it comes to, at its core, in today's world, in the age of, in the world of, the reality is, the truth is, in terms of, with regard to, in order to, going forward, in this article, let's dive in.

Interface additions: unlock your potential, seamless, effortless, supercharge, all in one place, next-level, elevate your, game-changer, revolutionize, unleash, welcome back, oops, something went wrong, submit, click here, tap here, let's get started, you're all set, something magical.

## Patterns

**Binary contrast.** "This is not X. It's Y." / "The question isn't X, it's Y." / "It's not just X but Y." State Y.
"The question isn't the model. It's the eval." → "The eval matters more than the model."

**Negative listing.** "Not a X. Not a Y. A Z." Say Z.

**Throat-clearing.** "Here's the thing", "Let me be clear", "I'll be honest", "The uncomfortable truth is". Cut and state the point.

**Faux-insight setup.** "What nobody tells you", "The part everyone misses", "What most people get wrong". Cut the setup. "The part everyone misses: distribution is the real moat" → "Distribution is the moat."

**Colon reveal.** A noun phrase, a colon, a lowercase dramatic reveal: "The best part: it learns." Write a sentence: "A separate agent grades it, which is what makes it work." Use colons for lists, labels, quotes.

**Dramatic fragment.** "That's it. That's the whole thing." / "X. And Y. And Z." Complete sentences.

**Robotic rhythm.** Repeated sentence shapes, identical paragraph structures, stacked punchy fragments. Vary only where it helps.

**Rhetorical setup.** "What if I told you...", "Think about it:", "Plot twist:", self-answered questions. Drop and state the point.

**Superficial analysis.** Trailing `-ing` clauses that pretend to explain meaning: highlighting, underscoring, reflecting, showcasing. "The launch adds file search, highlighting the team's commitment" → "The launch adds file search, so users can find old drafts without leaving the editor."

**Importance puffery.** "Stands as a testament", "marks a pivotal moment", "plays a vital role", "solidifies its position". State the fact; let the reader judge.

**Interpretive metadiscourse.** "That last part matters more than it sounds", "The key point is", "As you can see", "This distinction matters", redundant "In other words". Delete if the point is clear; otherwise replace with support.

**Weasel attribution.** "Experts agree", "industry reports suggest", "many argue", "widely regarded", "studies show". Name the source or cut. Never invent one.

**Fake-strong verbs.** Prefer "is" and "has" when clearer. "Serves as a centralized hub for sponsor management" → "Tracks sponsors, drafts, due dates, and approvals in one place."

**Synonym cycling.** If the clear word is right, repeat it. "The agent reviews the draft. The assistant scores the piece. The tool suggests fixes" → "The agent reviews the draft, scores it, and suggests fixes."

**Fake-profound kicker.** The final "deep" line that turns the point into a metaphor or mic drop. Delete it; end on the clearest concrete sentence already there. Do not rewrite it into a better metaphor.

**Summary recap.** "In conclusion", "Ultimately", "Overall", or a final paragraph restating the piece. End on the last concrete point, takeaway, or next action.

**Formatting slop.** Emoji in headings, bold mid-sentence, bullets where two sentences of prose read better, headers over two-sentence sections.

**Em dashes.** Not a default rhythm. None in short copy; one or two in longer drafts if they clearly beat commas, periods, or parentheses.

## Interface copy specifics

- Errors say what failed, why if known, and what to do: "Couldn't load your orders. Check your connection, then try again."
- Empty states say what would be here and how to make it appear.
- Buttons use a verb and an object: "Save address", "Send invoice", "Book table".
- Headings name what is there: "This week's deliveries", not "Overview".
- No exclamation marks as personality. No emoji in UI strings.
- Do not repeat the title in the subtitle.

## Detect output

```text
Slop found: 4 patterns

1. Binary contrast — "It's not a dashboard. It's a command center."
   Fix: state the claim: "One screen for orders, drivers, and delays."
2. Faux insight — "What nobody tells you about churn"
   Fix: cut the setup.
3. Importance puffery — "marks a pivotal moment for the team"
   Fix: say what happened.
4. Fake-profound kicker — "The future isn't coming. It's already here."
   Fix: delete; end on the last concrete sentence.
```

No score, no rewrite, no authorship claim. Offer to edit after.
