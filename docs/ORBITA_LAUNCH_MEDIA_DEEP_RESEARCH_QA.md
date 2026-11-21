# QA — ORBITA launch media deep research (2026-11-21)

- Baseline entities: 420 / current: 420.
- Launch entities: 68; covered prior 38, covered now 47, uncovered 21.
- New companies covered: 9; previous covered companies enriched: 3.
- New media entries: 21; unique IDs and entity keys preserved.
- Non-launch entities deep-equal original: PASS.
- Old launch media prefix unchanged: PASS.
- New items have proof_url and license: PASS.
- media_bank.validate_catalog: PASS (0 errors).
- JSON Schema legacy validation: 58 original / 58 current, unchanged.
- Online CDN HTTP probe: NOT RUN (runtime lacks external network).
- Browser interactive UI smoke test: NOT RUN.
- Internal package only: not deployed.
- Red flags: China News Service media CC license has third-party caveat; archival images are source-page checked, not publisher permissions audited. 

- Historical launch increment manifest intentionally preserved; version-aware regression test updated to new research manifest.
- New stage regression test validates all 21 added media records and 47 covered companies.

- Python unittest full tests directory: 65/65 passed after version-aware test correction.
- Node.js focused interface/data tests: 27/27 passed.
- Exact original filename -> MD5 Commons CDN path deterministically checked in code, live CDN probe for all 21 NOT performed. One Chinese source image checked by web retrieval, not a full HTTP health check.
