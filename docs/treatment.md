# Treatment

Diagnosis says what is wrong. This says how to fix it without creating a different mess.

## 1. Triage before planning

Read the diagnosis honestly and name the case.

| Case | When | What happens |
|---|---|---|
| **Heavy** | Generated tells across color, type, icons, copy, and layout; or Task path or Truth ≤ 2 | Five-line direction, then every pass |
| **Light** | Mostly designed, a few tells left | Fix only the findings; keep palette, type, layout, visuals |
| **Healthy** | Nothing structural wrong | Say so; offer two or three refinements with exact values; apply only on request |

Never change a healthy screen to make it different.

## 2. Direction, five lines

For a heavy case, write this before touching anything and show it with the diagnosis.

1. **Product.** What it does and for whom, in one plain sentence.
2. **Use.** Where and how: one-handed on a train, at a desk all day, in a kitchen with wet hands, once a month at tax time. This sets density, target size, contrast.
3. **Character.** Two or three concrete words: "exact, calm, a little dry"; "quick, friendly, loud". Clean, modern, sleek, minimal, premium are banned; they describe every template.
4. **The bright spot.** The one or two places that get color and care, chosen from the content: the zone that needs attention, the chart that answers the question, the photo of the dish.
5. **Signature.** One small detail only this product would have, used consistently. One, not five.

If the product has a real brand, the direction is built around it. In a light case, the direction is the existing brand.

## 3. Order of work

1. Tokens: color roles, type scale, spacing scale, radius, elevation, motion.
2. Shared components: buttons, list rows, cards, headers, empty and error states.
3. Screens, in finding order: Critical, Noticeable, Minor.
4. Ask-first items only after the human answers.

On a screen, finish each pass across the whole screen before starting the next.

| Pass | Do |
|---|---|
| 1. Spacing | One small scale; related closer than unrelated; rows of one kind the same height |
| 2. Color | Semantic roles; one accent; color only where it means something |
| 3. Icons | One set, one size, one stroke, text color; emoji and decoration go |
| 4. Copy | The product's nouns and verbs; errors with a cause and a next step; no hype, no invented claims |
| 5. Type | Platform styles or one scale; two weights; sentence case; tabular figures for numbers |
| 6. Layout | Content first; native structure; one primary action |
| 7. Details | States, nesting radius, focus, pressed, empty, error, offline |
| 8. Motion | What explains a change stays; what loops or decorates goes |

## 4. Rules of the fix

- Remove before adding. Most screens improve by losing containers, colors, captions, and copy.
- Keep frequently used controls, gestures, and URLs where users expect them. Ask before moving, removing, or redefining one.
- Do not change business logic, data flow, or analytics.
- Ask before changing navigation structure or visual identity.
- Ask before adding a dependency. Use what the platform and the project already have.
- Never invent a metric, quote, logo, or testimonial. Ask whether a claim is real; if not, remove it and list it.
- Mark placeholder content as placeholder. Mock data looks plausible, never `123,456` or `[X]`.
- Keep the diff to the agreed screens and the shared code they need.
- Use the platform's building blocks first.

## 5. Do not swap one default for another

The common failure takes a purple, sparkly screen and returns white cards with gray borders, one blue accent, an icon in a tinted square on every row, and a lot of empty space. It is cleaner. It is also every model's default, and people recognize it instantly.

A treated screen gets its character from the product:

- **Content first.** The thing the user came for gets the most space and the strongest type.
- **The product's nouns.** "Kitchen lights", not "Overview".
- **Color with a job.** State and meaning, not decoration.
- **Quiet chrome, one bright spot.**
- **Hierarchy from type and space first.** A list usually beats a stack of cards.
- **Native over bespoke.**
- **Density that fits the use.** Generous whitespace is a choice, not a default.

## 6. The floor

Every changed screen meets these before it is done.

- Touch targets: 44pt iOS, 48dp Android, 24×24 CSS px on web (44 for primary touch).
- Contrast 4.5:1 body, 3:1 large text and meaningful icons, light and dark.
- Platform text styles or a named scale; respects user size or browser zoom; nothing clips at the largest size or 200%.
- Content clear of notch, Dynamic Island, home indicator, status bar, keyboard. Backgrounds may run edge to edge.
- One primary action per screen, within thumb reach on a phone.
- Spacing from a small scale; related items closer.
- Semantic color roles; dark mode is a real palette, not an inversion.
- Native navigation: tabs for 3–5 peers, push to drill, sheets for short tasks; real links and a working back button on web.
- Icon-only controls labeled; logical focus order; visible focus; Reduce Motion honored; color never the only signal.
- Pressed, hover (where a pointer exists), focus, disabled, loading, empty, error, offline for everything touched.
- Each shipped platform gets its own patterns. Share the brand, not every control.

## 7. Waivers

A tell can stay for a real reason: the brand, a user need, a platform constraint. Record it in `.slopdrop/chart.md` under Accepted with the reason, and list it under Waived in the report. A tell kept without a reason is a finding.

## 8. Self-check

Answer these in one line each in the treatment summary.

1. **Cover the logo.** Could the after screen belong to an unrelated product? If yes, it is not done.
2. **Neighbor test.** Would a competitor get this exact screen from the same request? If yes, change one decision and say which.
3. **Count the containers.** Did cards, borders, and tinted backgrounds go down?
4. **Count the colors.** Does every color carry meaning?
5. **Find the dots.** What status does each dot, badge, and pill show, and would a color-blind user get it?
6. **Find the task.** Is the top task's control in the same place or better, reachable with one thumb or one Tab?
7. **Run the detector** on changed files. Explain any hit kept.
8. **Fresh look.** What did the fresh-context reviewer say, and what changed because of it?
9. **Say what was not checked**, performance included. An unrun check is not a pass.
