# Evidence

Why the review checks friction before it checks gradients.

## Corpus

5,008,684 reviews of 7,786 apps from the App Store (1,993,979) and Google Play (3,014,705). 21 categories. Top-free charts of the US, UK, India, Canada, and Australia. Google Play down to rank 200. Up to 20 English-language storefronts. The 24 months before collection. 2,072,794 reviews rated 3 stars or lower.

Labels came from a random sample of 600 low-rated reviews per store, read one by one against written definitions, plus 150 four-star reviews per store. A rule classifier labeled the whole corpus; its measured error was corrected with the Rogan–Gladen estimator, with bootstrap intervals resampling both reviews and apps.

## What low-rated reviews complain about

| Complaint | App Store | Google Play |
|---|---|---|
| Something does not work (bug) | 35% | 35% |
| Support, refunds, scams | 22% | 20% |
| The business behind the app | 18% | 21% |
| Price, paywall, subscription | 20% | 18% |
| Login and account | 11% | 11% |
| Ads and popups mid-task | 9% | 12% |
| Hard to find or use | 9% | 7% |
| A redesign moved or removed something | 7% | 5% |
| Slow or laggy | 5% | 6% |
| Crashes | 5% | 4% |
| AI forced into the app | 2% | 1% |
| Broken layouts | 1% | 1% |

A design and front-end pass can address about a quarter of complaints: 26% App Store, 24% Google Play. Bugs, lag, and crashes together are 41% on both stores.

## Four-star reviews

87% of four-star App Store reviews and 61% of four-star Google Play reviews still name a problem, but a different list: missing features lead (30% and 12%), while support and login trouble drop to 2% or less. Low ratings describe acute pain; four stars describe ambition.

## The purple gradient

"Purple gradient" appears once in 5 million reviews, in a two-star review asking a company to bring its blue and purple gradients back. "Gradient" appears 163 times, mostly people asking for one.

This does not mean gradients are fine. It means users do not share the aesthetic obsession. They complain when a button is missing, a screen lies, or a popup interrupts a task. Aesthetic tells remain a signal of genericness, not the top of the list.

## Method limits

- People who leave low-rated reviews are not a random sample of users.
- Google Play has no date filter, so busy apps' newest reviews cover hours.
- Only top-chart apps are included.
- Reference labels came from a model, once, without a second independent pass.
- The rule classifier is weak on some themes (kappa 0.2–0.4): bugs, the business behind the app, missing features.
- Rules miss sarcasm, negation, and indirect complaints.
- A review says "slow"; it does not measure it.

## What this changed in the product

1. Task path, truth, and states outrank aesthetics in the review order and in the score.
2. Performance is never scored from code; reports say **Not profiled** until measured.
3. The detector checks generated tells, but the report ranks friction first.
4. Every report ends with what was not checked, because the evidence has the same shape: strong on themes, blind to individual cases.

## Reproducing it

The study is a pipeline, not a static table: choose apps, collect reviews, build the population, label a reference sample, run rules over everything, correct the estimates, publish the limits. Collection is rate-limited and resumes where it stopped. Raw review text is not redistributed; only aggregate results and code are.
