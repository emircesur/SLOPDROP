# SLOPDROP review

Verdict: The order list is a div you cannot tab to, the hero screams "welcome back" over the data, and the page promises ten thousand teams nobody counted.

Stack: React 19, Tailwind (web)
Reviewed: `Home.tsx` (fixture), top tasks "scan today's orders" and "open an order", code only
Score: 8/24 deep-slop  Task 2 · Truth 1 · Native 2 · States 1 · Access 1 · Specificity 1
Performance: Not profiled. Static lead: the card grid maps over a list inside a plain container; on real data this renders every row.

## Critical

- `Home.tsx:14` The only way into an order is a `div` with `onClick`. Keyboard users and screen readers cannot reach it, and there is no focus state. -> Use `<a href>` for navigation and `<button>` for actions.
- `Home.tsx:6` "Welcome back!" takes the top of the screen while the orders, the reason people opened the page, start below the fold on a phone. -> Delete the greeting; lead with the orders and their status.

## Noticeable

- `Home.tsx:5` A violet-to-fuchsia gradient covers the entire page. It carries no state and appears nowhere in the brand. -> Use the paper background and the shopfront green for the mark and the primary action only.
- `Home.tsx:11-16` A card inside a card, with the inner card holding a single dot and a link. The nesting adds a border, a shadow, and a radius without adding meaning. -> One list, one row per order, a divider between rows.
- `Home.tsx:7` `uppercase tracking-wider` section label above content that already has a heading. -> Delete it; the heading carries the section.
- `Home.tsx:8-10` An emoji inside a tinted rounded tile stands in for an icon. -> Use a real icon in the text color, or drop it.
- `Home.tsx:17` `<img>` with no alt text. -> Describe the image, or `alt=""` if it is decoration.
- `Home.tsx:19` "Trusted by 10,000+ teams" is not backed by any data in the project. -> Remove it, or supply the real number and what it counts.
- `Home.tsx:20` "Something went wrong" gives no cause and no next step. -> Say what failed and what to do: "Could not load today's orders. Check your connection, then try again."

## Minor

- `Home.tsx:13` A 2×2 green dot sits beside the order with no label; a color-blind user cannot tell what it means. -> Add the word ("paid in cash") or remove the dot.
- `Home.tsx:18` `transition-all` combined with `hover:scale-105` on the submit button animates layout and grows the target under the pointer. -> `transition-colors`, and keep scale for a small press-down.
- `Home.tsx:18` The button says "Submit". -> "Export today's orders".
- `Home.tsx:9` The sparkle emoji marks nothing in particular and is the most decorative element on the screen. -> Remove it.

## Ask first

- Making the order row a real link changes the URL structure. Proposed: `/orders/:id`, so a row can be opened in a new tab and the back button works. This changes navigation, so it needs a decision.
- The status dot could become a status column with text. That changes the table layout the team may depend on.

## Worth keeping

- The real order data is rendered per row, with a stable key.
- The button is a real `<button>` and the page has a single clear action.
- The type scale is small but consistent; the fix is hierarchy, not a new typeface.

## Not checked

- Performance: not profiled. The list is short in the fixture; the real dataset may be long.
- Dark mode: no dark styles in the fixture, so dark-mode contrast is unknown.
- The running app: reviewed from code only. Screenshots would confirm the fold position on a phone.
