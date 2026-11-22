# Kıyı Bank

Four single-file prototypes of a fictional bank's home screen, used by [field test 2](../field-test-2.md), the README image, and the detector tests. The bank, the person, and every number are invented.

| Before | After |
|---|---|
| [`generic.html`](generic.html): 4 hits | [`treated.html`](treated.html): 0 hits |
| [`neon.html`](neon.html): 16 hits | [`neon-treated.html`](neon-treated.html): 0 hits |

Open any file in a browser at phone width. Everything runs locally: no network, no fonts, no libraries.

```bash
node packages/detect/bin/slopdrop-detect.mjs examples/kiyi-bank --platform web
```

The afters are checked in CI on both `--platform web` and `--platform mobile`. If a rule change makes them fire, either the rule is wrong or the treatment was, and the test says which file.
