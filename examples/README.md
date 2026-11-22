# Examples

Two artifacts that show what the product produces, plus two field tests:

- [report-example.md](report-example.md): a full review of a small, deliberately sloppy screen, in the exact report format.
- [chart-example.md](chart-example.md): a filled chart, the project context every command reads.
- [field-test-1.md](field-test-1.md): the first run against a real public app, with raw hits, confirmed findings, the two rule defects it exposed, and what the rules cannot see.
- [field-test-2.md](field-test-2.md): four HTML screens of a fictional bank, where the detector was blind to plain CSS. Two rounds: color-aware rules, then contrast math and the same screens in English.
- [kiyi-bank/](kiyi-bank/): those four screens in Turkish, and in English under `kiyi-bank/en/`. `neon.html` and `generic.html` are the befores; `neon-treated.html` and `treated.html` are the afters. CI keeps the afters at zero findings in both languages.

The fixtures behind the report live in `packages/detect/test/fixtures/`. The app, the data, and the numbers in the examples are invented; the findings are the ones the detector actually returns for those files.
