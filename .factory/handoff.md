# A11y Playtest Captioner — review 2 handoff

## Status: FAIL

Adversarial first-read review 2 is recorded in [review-2.md](./review-2.md). No product code was modified.

## Findings

- **F-2-1 (blocking):** `/demo` opens on the marketing hero; neither viewport shows the populated workspace on the first post-click screen.
- **F-1-2 (blocking regression):** `/demo` → **Start for real** leaves focus on `BODY` and does not announce the destination.
- **F-1-3 (blocking regression):** several demo, library, validation, import, and on-device speech statements are broader than the registered tagged tests.
- **F-2-2 (minor):** `/demo` retains the home page’s OG and Twitter title/description.
- **F-2-3 (minor):** landing and README copy still mix caption/description and action/cue terminology and retain some jargon or unsupported wording.

## Verification performed

- Cold live Chromium contexts at 390 × 844 and 1440 × 900.
- One-click live demo flow, reset, exit, seeded real-data isolation, request log, cookie check, and live offline reload.
- Every `.factory/claims.json` command from fresh clone `/tmp/a11y-captioner-review2-clean.IDcyek` at `03333e4584c531ba28af434f8576ce3113ca49f8`; all passed.
- `npm test`; passed (15 unit tests, package consumer, 18 claim-browser tests, 25 workspace tests, 5 expected skips).
- `npm run build`; passed and produced `dist/lib` and `dist/site`.
- `/opt/fleet/lib/verify-url.sh`; passed. Evidence is in `/tmp/a11y-captioner-review2-live.LTBao6`.
- Live AxeBuilder checks on home, demo, privacy, terms, and 404; zero violations.
- Live metadata/header inspection, internal/external link crawl, deep-link checks, designed 404 check, and Home → Privacy → Back focus check.
- Read and independently checked `.factory/review-1.md`, `.factory/polish-1.md`, and the prior handoff.

## Next step

Repair every finding in `.factory/review-2.md`, add the specified demo-first-viewport, programmatic-route-focus, claim, and metadata regressions, deploy, and rerun the complete review. The factory owns deployment and npm publishing.
