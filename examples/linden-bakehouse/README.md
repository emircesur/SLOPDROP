# Linden Bakehouse

A fictional neighborhood bakery's website, twice. Desktop width; both pages are single HTML files with no network, fonts, or libraries.

| Page | What it is | Hits |
|---|---|---:|
| [`slop.html`](slop.html) | What you get when a SaaS landing template meets a bakery: a glass nav with "Pricing" and "Get Started", an "AI-powered freshness" eyebrow, gradient headline text, invented stats, "Trusted by 10,000+ customers", Jane Doe from Acme Inc., Lorem ipsum, and an "Ask AI" bubble. | 42 from 19 rules |
| [`treated.html`](treated.html) | The same bakery after a SLOPDROP treatment. It leads with today's board: when each batch came out, what it costs, what is left, what is sold out. Hours, address, and phone sit above the fold; the one action is ordering for pickup. | 0 |

The slop page spans six rule families (ui, copy, truth, a11y, motion, web), which is the point of having it next to the bank screens: those exercise color and layout, this one exercises copy and truthfulness.

```bash
node packages/detect/bin/slopdrop-detect.mjs examples/linden-bakehouse --platform web
node scripts/before-after.mjs --only bakery   # re-renders docs/assets/before-after-bakery.en.png
```

The treated page is checked in CI on web and mobile rules. The bakery, the address, the phone number, and the prices are invented.
