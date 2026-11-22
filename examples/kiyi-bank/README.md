# Kıyı Bank / Shore Bank

Four single-file prototypes of a fictional bank's home screen, in Turkish and in English. They are used by [field test 2](../field-test-2.md), the README picture, and the detector tests. The bank, the person, and every number are invented.

| | Turkish (Kıyı Bank) | English (Shore Bank) | Hits on web |
|---|---|---|---:|
| Before, calm generated look | [`generic.html`](generic.html) | [`en/generic.html`](en/generic.html) | 6 |
| After | [`treated.html`](treated.html) | [`en/treated.html`](en/treated.html) | 0 |
| Before, neon generated look | [`neon.html`](neon.html) | [`en/neon.html`](en/neon.html) | 16 |
| After | [`neon-treated.html`](neon-treated.html) | [`en/neon-treated.html`](en/neon-treated.html) | 0 |

The English files are a straight translation: same layout, same records, with dollars and US dates instead of lira and Turkish dates. The detector returns the same counts for both.

Open any file in a browser at phone width. Everything runs locally: no network, no fonts, no libraries.

```bash
node packages/detect/bin/slopdrop-detect.mjs examples/kiyi-bank --platform web
npm run image   # re-renders docs/assets/before-after.en.png and .tr.png from these files
```

The afters are checked in CI on both `--platform web` and `--platform mobile`, in both languages. If a rule change makes them fire, either the rule is wrong or the treatment was, and the test says which file.
