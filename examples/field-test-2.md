# Field test 2: four screens of a fictional bank

The first field test was a Tailwind app. This one is the other half of what coding agents ship: a single HTML file with a `<style>` block, plain CSS, and a canvas. The detector had barely been pointed at that shape before.

## Subject

Kıyı Bank, a fictional Turkish mobile bank. Same data on every screen: one current account, five transactions, Turkish copy.

| File | What it is |
|---|---|
| [`kiyi-bank/generic.html`](kiyi-bank/generic.html) | Built without SLOPDROP: the calm generated look. Blue card, tinted icon tiles, a greeting as the headline. |
| [`kiyi-bank/treated.html`](kiyi-bank/treated.html) | The same screen after a SLOPDROP treatment, light theme. |
| [`kiyi-bank/neon.html`](kiyi-bank/neon.html) | The loud generated look: purple gradients, glows, a wireframe torus, a sparkle after the user's name. |
| [`kiyi-bank/neon-treated.html`](kiyi-bank/neon-treated.html) | The same screen after a SLOPDROP treatment, dark theme. |

## Method

```bash
node packages/detect/bin/slopdrop-detect.mjs examples/kiyi-bank/<file> --platform web
node packages/detect/bin/slopdrop-detect.mjs examples/kiyi-bank/<file> --platform mobile
```

Every hit was opened in context. Screens were checked in Chrome mobile emulation at 412 × 856 CSS pixels for the picture in the README.

## Raw result before this change

| File | Hits | Rules |
|---|---:|---|
| `generic.html` | 0 | |
| `treated.html` | 0 | |
| `neon.html` | 6 | `ui.slop-gradient` ×6 |
| `neon-treated.html` | 0 | |

Zero on the generic screen is the interesting number. A reviewer finds the tells in seconds; the detector found none of them.

## What it missed, and why

| Tell on screen | Why the rule did not fire |
|---|---|
| Glowing logo, halo on the balance, glowing icons | `ui.glow-shadow` only knew color *names* (`purple`, `glow`) and SwiftUI/RN shadow APIs. `box-shadow: 0 0 16px #b23cf587` has no name in it. |
| Tinted icon tiles on every transaction row and action | `ui.icon-tile` only read Tailwind class strings. `.tx-icon{width:33px;height:33px;border-radius:10px;place-items:center}` is the same tile in CSS. |
| `✧` after "İyi akşamlar, Deniz" | `ui.sparkle-icon` knew `✨` and icon names, not the other sparkle glyphs. |
| "İyi akşamlar, Deniz" / "Merhaba, Deniz" as the headline | `copy.welcome-back` matched only English "Welcome back!". |
| Gradients in `.css` and `.scss` files | `ui.slop-gradient`, `ui.gradient-text`, `ui.tracked-caps-label`, and `ui.glass-everywhere` did not list the `css` stack, so standalone stylesheets were never checked. |

The six gradient hits were right, but the rule was right by accident. It looked at the first two hex digits only, so it also fired on `linear-gradient(#ffffff, #f5f5f5)` and missed upper-case `#7C3AED`.

## What changed because of it

1. **Color-aware patterns.** A pattern can carry a `colors` spec (hue ranges, minimum saturation, lightness band, minimum alpha). The engine parses hex, `rgb()`, `hsl()`, `0xAARRGGBB`, and named colors out of the match and keeps the hit only if one passes. The catalog stays data; `validate.mjs` checks the spec.
2. **`ui.slop-gradient`** reads the hue (238° to 340°, saturation ≥ 0.25). Neutral and brand-blue gradients no longer match; upper-case hex, `hsl()`, canvas gradients, and Android `<gradient>` do.
3. **`ui.glow-shadow`** finds zero-offset, blurred, saturated `box-shadow`, `text-shadow`, `drop-shadow()`, and Tailwind `shadow-[0_0_…]`. A `0 0 0 3px` focus ring, a soft elevation shadow, and a 7%-alpha ambient shadow do not match.
4. **`ui.icon-tile`** reads CSS blocks: equal width and height between 28 and 59 px, a 4 to 24 px radius, and centered content. Circles (`50%`) and wide pills do not match.
5. **`ui.sparkle-icon`** adds `✦ ✧ ❇ ❈`.
6. **Turkish copy.** `copy.oops-error` ("Bir şeyler ters gitti", a bare "Bir hata oluştu."), `copy.welcome-back` (time-of-day greetings with a name, in English and Turkish), `copy.buzzword`, `copy.vague-button` (a bare "Gönder"), `truth.unverified-claim` ("10.000+ müşterinin güvendiği"). "Bir hata oluştu: kart numarası 16 hane olmalı." has a cause and is left alone.
7. **CI and tooling.** `--format sarif` for GitHub code scanning, `--fail-on` to set the severity that fails a build, and the CLI now forwards `--ignore`, `--format`, and `--fail-on` values. The CI step that checks the clean fixture now passes `--platform web`; without it, a mobile-only rule fired on the web fixture.

Every item except the Android `<gradient>` form has a test in `packages/detect/test/detect.test.mjs`, including the negatives.

## Result after the fix

| File | Hits | Rules |
|---|---:|---|
| `generic.html` | 4 | `ui.icon-tile` ×3, `copy.welcome-back` ×1 |
| `treated.html` | 0 | |
| `neon.html` | 16 | `ui.slop-gradient` ×7, `ui.glow-shadow` ×6, `ui.icon-tile`, `ui.sparkle-icon`, `copy.welcome-back` |
| `neon-treated.html` | 0 | |

Same result on `--platform mobile`, except `ui.icon-tile`, which stays off on mobile because tinted tiles are a native settings-list convention there.

Reviewed in context: all 16 neon hits and 3 of 4 generic hits hold up. The generic false positive is the brand mark: a tinted rounded square, and the rule's own fix says a tile is fine where the shape carries meaning, like an app icon. That is a judgment call, so the rule is marked heuristic (`~` in the text output).

Both treated screens stay at zero on web and mobile. CI now enforces that.

## What the rules still miss

- The wireframe torus is drawn on a canvas. The detector sees the gradient on its stroke, not the decoration itself.
- Four neon colors on three action buttons, each with its own border tint, read as slop but are not a pattern.
- Contrast of light-purple text on a purple card needs a renderer.
- Whether the spending chart is honest needs the data, not the code. The treated screen computes it from the same records; the detector cannot know that.

These stay in `reference/tells.md` for the skill to judge with its eyes.

## Round 2: five more rules, and the same screens in English

The first round taught the detector colors. The second round makes it do the arithmetic a reviewer does by eye, and adds the screens in English so the test is not tied to one language.

### New rules

| Rule | What it reads |
|---|---|
| `a11y.low-contrast` | One CSS rule or inline style that sets both `color` and `background` to literal colors. It computes the WCAG ratio and fires below 4.5:1, or 3:1 when the same rule makes the text large (24px, or 18.66px bold). `var()`, gradients, and translucent colors are skipped: the detector cannot resolve them, so it does not guess. |
| `a11y.tiny-text` | Text under 11px in `px`, `rem`, Tailwind `text-[…]`, React Native, Compose, or Flutter. 11px and up pass: iOS tab labels sit at 10 to 11 points, so the bar is set below the platforms' own minimum, not at a taste. |
| `truth.placeholder-content` | Lorem ipsum, John Doe, Acme Inc., 123 Main St, and the Turkish John Doe, Ahmet Yılmaz. `you@example.com` as an input placeholder is fine and left alone. |
| `ui.pillow-radius` | Four or more radii of 18px or more in one file (CSS, Tailwind `rounded-3xl`, React Native, Flutter, SwiftUI). Sheets and one hero surface are fine; every surface is the tell. |
| `copy.exclamation` | Three or more interface strings ending in "!" in one file. |

`copy.welcome-back` also learned "Hello, Dana" and "Hi, {name}", which the English generic screen exposed: it greets in the same place the Turkish one says "Merhaba, Deniz".

The engine change behind `ui.pillow-radius`: per-file rules used to count matching *lines*. Minified CSS puts many rules on one line, so a file with ten large radii on two lines counted as two. Per-file rules now count every match.

### Result

The same numbers in both languages:

| File | Turkish | English | Rules |
|---|---:|---:|---|
| `generic.html` | 6 | 6 | `ui.icon-tile` ×3, `ui.pillow-radius`, `copy.welcome-back`, `a11y.low-contrast` |
| `treated.html` | 0 | 0 | |
| `neon.html` | 16 | 16 | unchanged from round 1 |
| `neon-treated.html` | 0 | 0 | |

`ui.pillow-radius` on the generic screen is right: the balance card, the action strip, the transaction list, and the dialog are all 19 to 22px pillows.

`a11y.low-contrast` on the generic screen is a false positive, and an instructive one. `.market{background:#fae7e4;color:#ba5147}` is 4.04:1, which fails for text. But that `color` paints an icon through `currentColor`, and icons need 3:1, which it passes. The detector cannot see what the color is used for. The hit stays a lead; the reviewer drops it in one look.

Round 2 precision on the four befores, both languages: 40 of 44 hits hold up. The four that do not are the same two in each generic file: the brand mark as an icon tile, and this contrast pair.

The English screens live in [`kiyi-bank/en/`](kiyi-bank/en/): Shore Bank, Dana Ellis, dollars, US dates. The README picture now comes from `scripts/before-after.mjs`, which renders both languages from these files and reads every count from the detector.
