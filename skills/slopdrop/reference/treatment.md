# Treatment

Read this before the first edit. The diagnosis says what is wrong. This says how to fix it without making a different mess.

## How much to change

Call the case before planning anything.

- **Heavy.** Generated tells across color, type, icons, copy, and layout, or a Task path or Truth score of 2 or less. Full treatment: direction, then every pass.
- **Light.** A screen that is mostly designed, with a few tells left. Fix only the findings. Keep palette, type, layout, visuals. Bigger ideas go in the report as suggestions.
- **Healthy.** Say so plainly. Offer two or three small refinements with exact values, and apply only if the user agrees. Never change a good screen to make it different.

## Direction

For a heavy case, write five short lines before touching anything, derived from what the product does and who uses it, never from fashion. Show them with the diagnosis and wait.

- **Product.** What it does and for whom, one plain sentence.
- **Use.** Where and how: one-handed on a train, at a desk all day, in a kitchen with wet hands, once a month at tax time. Sets density, target sizes, contrast.
- **Character.** Two or three concrete words: "exact, calm, a little dry" or "quick, friendly, loud". Clean, modern, sleek, minimal, premium are banned.
- **The bright spot.** The one or two places that get color and care, chosen from the content.
- **Signature.** One small detail only this product would have, used consistently. One, not five.

If the product has a real brand, the direction is built around it. In a light case, the direction is the existing brand.

## Order of work

1. Tokens: color roles, type scale, spacing scale, radius, elevation, motion.
2. Shared components: buttons, list rows, cards, headers, empty and error states.
3. Screens in finding order: Critical, Noticeable, Minor.
4. Ask-first items only after the human answers.

For visual work, finish each pass across the whole screen before the next:

1. **Spacing:** one small scale; related closer than unrelated; rows of one kind the same height.
2. **Color:** semantic roles, one accent, color only where it means something.
3. **Icons:** one set, one size, one stroke, text color; emoji and decoration go.
4. **Copy:** the product's nouns and verbs; errors with cause and next step; no hype, no invented claims.
5. **Type:** platform styles or one scale, two weights, sentence case, tabular figures.
6. **Layout:** content first, native structure, one primary action.
7. **Details:** states, nesting radius, focus, pressed, empty, error, offline.
8. **Motion:** what explains a change stays; what loops or decorates goes.

## Rules of the fix

- Remove before adding.
- Keep frequently used controls, gestures, and URLs where users expect them. Ask before moving, removing, or redefining one.
- Keep business logic, data flow, analytics unchanged.
- Ask before changing navigation structure or visual identity.
- Ask before adding a dependency.
- Never invent a metric, quote, logo, or testimonial. Ask whether a claim is real; if not, remove it and list it.
- Mark placeholder content as placeholder. Mock data looks plausible, never `123,456` or `[X]`.
- Keep the diff to the agreed screens and the shared code they need.
- Use the platform's building blocks before custom ones.

## Do not swap one default for another

The common failed treatment returns white cards with gray borders, one blue accent, an icon in a tinted square on every row, and a lot of empty space. It is cleaner and just as generic.

A treated screen gets its character from the product:

- **Content first.** The thing the user came for gets the most space and strongest type.
- **The product's nouns.** "Kitchen lights", not "Overview".
- **Color with a job.** State and meaning, not decoration.
- **Quiet chrome, one bright spot.**
- **Hierarchy from type and space first.** A list usually beats a stack of cards.
- **Native over bespoke.**
- **Density that fits the use.**

## The floor

Every changed screen meets these before it is done.

- 44pt iOS / 48dp Android targets, including padding and hit slop. 24×24 CSS px on web, 44 for primary touch.
- Contrast 4.5:1 body, 3:1 large text and meaningful icons, light and dark.
- Platform text styles or a named scale; follows user size or browser zoom; nothing clips at the largest size or 200%.
- Content clear of notch, Dynamic Island, home indicator, status bar, keyboard.
- One primary action per screen, in thumb reach on a phone.
- Spacing from a small scale; related closer.
- Semantic color roles; dark mode is a real palette.
- Native navigation: tabs for 3–5 peers, push to drill, sheets for short tasks; real links and back on web.
- Icon-only controls labeled; logical focus; visible focus; Reduce Motion; color never the only signal.
- Pressed, hover (where a pointer exists), focus, disabled, loading, empty, error, offline for everything touched.
- Each platform gets its own patterns. Share the brand, not every control.

## Waivers

A tell can stay for a real reason: brand, user need, platform constraint. Record it in `.slopdrop/chart.md` under Accepted with the reason, and list it under Waived. A tell kept without a reason is a finding.

## Self-check

Answer each in one line in the treatment summary.

1. Cover the logo. Could the after belong to an unrelated product? Then it is not done.
2. Neighbor test. Would a competitor get this exact screen? Then change one decision and say which.
3. Count the containers. Did cards, borders, and tints go down?
4. Count the colors. Does each carry meaning?
5. Find the dots. What status does each show, and would a color-blind user get it?
6. Find the task. Is its control in the same place or better, reachable with one thumb or one Tab?
7. Run the detector on changed files. Explain every hit kept.
8. Fresh look. What did the fresh-context reviewer say, and what changed?
9. Say what was not checked, performance included.
