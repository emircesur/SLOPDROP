# Platforms and the web

Everything in `tells.md` applies, except section 3, which is for native apps. This file adds what is different on the web and per platform.

## Two kinds of web page

- **An app** is where people work: dashboards, editors, settings, admin, inboxes, checkout. Judge it like a mobile app: task path first, density for daily use, quiet chrome, content carries the color. A landing hero inside an app is a tell.
- **A site** persuades someone to act: landing page, pricing, portfolio, restaurant, event. Judge whether a visitor understands the offer and finds the action within seconds, and whether it could belong to anyone else.

A product's marketing site and its app are two scopes. Review one at a time.

## Web floor

These break the web for real people. Critical or Noticeable, whatever the look.

- **Real controls.** Actions are `<button>`, navigation is `<a href>`. A `div` or `span` with a click handler is unreachable by keyboard and silent to screen readers [`web.clickable-div`].
- **Visible focus.** Every interactive element shows `:focus-visible`, in the palette, instantly. `outline: none` with nothing in its place locks keyboard users out [`a11y.focus-removed`].
- **Zoom stays on.** No `maximum-scale=1` or `user-scalable=no` [`a11y.zoom-disabled`]. Inputs at 16px stop iOS zooming on focus.
- **Text alternatives.** Content images have alt text; decoration has `alt=""` [`a11y.img-no-alt`].
- **URLs mean something.** Back returns to the previous view. Filters, tabs, search, pagination that someone would share live in the URL. Opening in a new tab works.
- **Contrast** 4.5:1 body, 3:1 large text and meaningful icons, light and dark.
- **Reduced motion.** Every animation has a `prefers-reduced-motion: reduce` fallback. Content is visible without it.
- **No horizontal scroll** at 375; layout holds at 1920 with capped, centered width.
- **Forms** have labels (not placeholders as labels), right `type` and `autocomplete`, errors next to the field in words, entered data kept after an error.
- **Nothing invented.** No customer counts, logo walls, testimonials, ratings, or case studies the user did not supply.

## Web tells

**App screens**

- A dashboard that opens with a greeting and three stat cards instead of the thing the user came to do
- Every section in a bordered card, cards in a uniform grid, one radius everywhere
- Stat cards with sparklines, icons, and colored deltas with no "vs" (compared to what?)
- Charts with a rainbow inside one series, glowing bars, or placeholder data
- A sidebar with an icon in a tinted square beside every item [`ui.icon-tile`]
- Tables that are cards on desktop, or cards that should have been a table
- `transition-all`, cards that grow on hover, skeletons and dots that pulse forever
- Modals for things that should be a page or inline edit; toasts for errors the user must act on

**Sites**

- The centered hero: tracked-caps eyebrow pill ("New: AI-powered"), gradient headline, subhead repeating it, two buttons, blurred blob behind
- A hero that does not show the product, or shows a hand-drawn fake browser window
- Three feature cards with an icon tile, a two-word title, and a sentence each, repeated for every section
- Logo walls, testimonial grids with stock avatars, "Trusted by 10,000+ teams", "10x faster"
- A pricing table with a glowing "Most popular" card and a checklist identical on every plan
- An email sign-up band at the end of every page
- Scroll-jacking, parallax, every section fading up on scroll
- More than about 80 words on one screen of a landing page; a headline longer than two lines at 1280
- The hero's headline, sentence, and main action not all visible at 1280 by 800

**The web's new default.** Inter or Geist everywhere, zinc or slate neutrals, `rounded-lg border shadow-sm` cards, `text-muted-foreground` under every title, a `Badge` on every row, a two-column bento grid, a dark mode that is the same layout in gray. Kits like shadcn/ui are fine as building blocks; untouched defaults on every surface are the tell. Ask what on the page is specific to this product. If the answer is only the copy, it is the default.

## Native building blocks

| Need | Use |
|---|---|
| Actions and links | `<button>`, `<a href>` |
| Dialogs | `<dialog>` with `showModal()`, or the project's accessible dialog |
| Menus and popovers | the `popover` attribute, or the project's menu with arrow-key support |
| Disclosure | `<details>` and `<summary>` |
| Choices | `<select>`, radio groups, checkboxes; `<input type="date">` before a custom picker |
| Page changes | real routes and links; View Transitions for continuity |
| Layout | CSS grid with `minmax(0, 1fr)`, `clamp()` for type, container queries |
| Theming | CSS custom properties at `:root`, `prefers-color-scheme`, `color-scheme` |
| Motion | `transform` and `opacity`, named transition properties, reduced motion |
| Browser surfaces | `::selection`, `accent-color`, `caret-color`, scrollbar colors, focus rings from the palette |

## iOS

- Tabs for two to five top-level sections; tabs are places, never actions. No hamburger for main destinations.
- Navigation stack for drilling in; large titles on top level, inline deeper.
- Sheets for short self-contained tasks, with detents. Full-screen covers only for immersive flows.
- Edge-swipe back always works. A custom back button must not cost the gesture.
- Safe areas: nothing tappable under the Dynamic Island, home indicator, or rounded corners.
- System controls before custom: `Toggle`, `Picker`, segmented control, `Stepper`, `Menu`, context menus, swipe actions.
- SF Symbols at the text style's weight; do not mix in a web icon set.
- Dynamic Type through text styles; custom fonts scale with `relativeTo:`.
- Semantic colors (`label`, `secondaryLabel`, `systemBackground`, `separator`, tint). Raw hex breaks in dark mode and increased contrast.
- One tint for interactive elements; it is not decoration.
- Check with `xcrun simctl io booted screenshot <file>.png`; dark with `xcrun simctl ui booted appearance dark`; largest text with `content_size accessibility-extra-extra-extra-large` (reset to `large`).

## Android

- Navigation bar for three to five top destinations; rail or permanent drawer on wide windows. Do not stretch the phone layout across a tablet.
- System Back always works; predictive back previews where it lands. Guard only real data loss with `OnBackPressedCallback` or `BackHandler`, never `onBackPressed`.
- Edge to edge with window insets: status bar, nav bar, cutout, IME (`WindowInsets.safeDrawing`, `Modifier.imePadding()`).
- Material 3 components; snackbars for transient feedback with undo where it makes sense.
- Material Symbols, one style.
- No iOS-shaped switches, action sheets, or back chevrons.
- Type scale in `sp`; color roles (`primary`, `onPrimary`, `surface`, `surfaceContainer`, `outline`, `error`), never raw hex in components.
- Dynamic color where it fits the brand, with a static fallback. Dark theme designed, not inverted.
- Check with `adb exec-out screencap -p > <file>.png`; night mode `adb shell cmd uimode night yes`; large text `adb shell settings put system font_scale 2.0` (read the old value and restore).

## Accessibility checks

- Tab through every changed page from the address bar. Every stop visible, in reading order; Enter and Space work; Escape closes what opened.
- Run the browser's accessibility panel or Lighthouse for contrast and missing names. They catch a floor, not quality.
- On mobile, turn on the screen reader and the largest text size for one pass through the top task.
- Zoom to 200% and check nothing overlaps or disappears.

## Screenshots

- Web: Playwright or the browser at 375, 768, 1280, and 1920 wide; dark with `colorScheme: 'dark'`; reduced motion with `reducedMotion: 'reduce'`.
- Mobile: simulator/emulator, light and dark, largest text.
- For a live site with no code, save the page and work on a local copy; say in the report that the result is a redesign in code for whoever owns the site.
