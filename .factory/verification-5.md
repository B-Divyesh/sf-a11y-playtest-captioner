# Independent verification 5 — PASS

**Work order:** `a11y-playtest-captioner-verify-5`  
**Candidate:** `c4194970248f28559ca8b59f71fefba2a60bb657` (`main`)  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Verified:** 2026-08-30 UTC  
**Artifact:** npm library plus local-first PWA authoring workspace

## Decision

**PASS.** The deployed product is the candidate artifact and satisfies the researched brief's smallest useful product: browser-game creators can author named, localized game-state captions and ordered actions, rehearse them by keyboard with browser speech, and export the project. The one-click Signal Hollow demo is isolated from ordinary drafts. No release-blocking defects were found.

## Required first checks

`.factory/claims.json` exists and contains six claims. From the clean checkout, each exact declared command was run before broader QA; all passed in both Chromium desktop and the 390 px mobile project:

| Claim | Exact command | Result |
| --- | --- | --- |
| Demo isolation | `npm run test:claims -- --grep @claim:demo-isolation` | PASS (2/2) |
| Offline reload | `npm run test:claims -- --grep @claim:offline-reload` | PASS (2/2) |
| Local-only privacy | `npm run test:claims -- --grep @claim:local-only` | PASS (2/2) |
| Free demo | `npm run test:claims -- --grep @claim:free-demo` | PASS (2/2) |
| Author/rehearsal | `npm run test:claims -- --grep @claim:author-review` | PASS (2/2) |
| JSON export | `npm run test:claims -- --grep @claim:json-export` | PASS (2/2) |

Cold-reading the live home page answered all required questions in plain words: it says **“Caption game states before playtests”**, names browser-game creators needing multilingual descriptions and keyboard rehearsal, and offers **“Try it with sample data”** as the first primary action. Clicking it opens `/demo` directly with the two-state Signal Hollow sample and its persistent demo-isolation banner.

## Clean checkout and package gates

The checkout began clean at the exact candidate SHA.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 62 packages added; npm reported 0 vulnerabilities |
| `npm run test:unit` | PASS — 12/12 Vitest tests |
| `npm run test:package` | PASS — library build and packaged consumer test |
| `npm test` | PASS — full suite completed; final Playwright run records `status: passed` with no failed tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (configured as TypeScript no-emit check) |
| `npm run build` | PASS — emits `dist/lib` and `dist/site` |
| `npm pack --dry-run` | PASS — 12 files, 17.9 kB packed / 70.7 kB unpacked |

An additional clean temporary consumer installed the produced tarball. Its public ESM API successfully activated a Spanish state, resolved an ordered Spanish cue, and correctly rejected an invalid ID with `CaptionerValidationError`.

## Product and accessibility exercise

Fresh live desktop and 390 × 844 mobile sessions exercised the sample workspace, added an action, rehearsed the final action with `End`, and confirmed its visible action position. An invalid `!!` language tag produced the actionable BCP 47 error; keyboard correction to `es-MX` cleared native validity and successfully added the locale. Repository E2E coverage also passed normal authoring, persistence, import/export/undo, keyboard order, and invalid-input recovery.

- Axe on the populated live demo: **0 violations** (therefore 0 serious/critical).
- No console errors or page errors occurred on normal home/demo, privacy, or terms loads.
- The keyboard-focused rehearsal monitor exposes a designed `3px` solid cyan outline.
- All visible interactive controls measured at least 44 × 44 CSS px on desktop and 390 px mobile; mobile document width was `390 / 390`, with no horizontal overflow.
- Under `prefers-reduced-motion: reduce`, the only panel entrance animation is reduced to `0.00001s`; it is not looping.
- Home, demo, privacy, and terms each delivered `lang=en`, one `h1`, one `main`, titles appropriate to their route, and no image missing `alt`.

## Privacy, PWA, headers, deployment, and performance

The fresh live demo request capture, including editing and review/speech, used only `https://a11y-playtest-captioner.sociobot.in`; the context contained no cookies. This corroborates the local-only claim test. There is no sign-in, payment, product-unlock, API, or other server-side endpoint, so Entra authority and rate-limit/429 checks are not applicable.

The live service worker was active and controlling `/demo`, with one cache (`a11y-captioner-ae5de9f8c7bc`), no installing or waiting worker before or after `registration.update()`, and a successful offline reload showing both sample states and **“Offline — local editing still works.”**

Live response checks found the expected response-header CSP (`default-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`), HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and disabled camera/microphone/geolocation. HTML and `sw.js` revalidate at 30 seconds; hashed JS and CSS use `public, max-age=31536000, immutable`. An unknown route returns the designed HTTP 404 page.

Fresh production build output is within static budgets: main JS is 25.28 kB (8.86 kB gzip), CSS 21.03 kB (5.23 kB gzip), and self-hosted WOFF2 fonts total 34.8 kB. The generated responsive hero is 47.0 kB desktop / 14.7 kB mobile. All are below the stated limits.

Deployment identity was checked after the exact production build: **18/18** publicly served files (HTML, JS, CSS, fonts, images, worker, favicon, robots, sitemap) SHA-256 match `dist/site`, with zero mismatches. The live build id is `ae5de9f8c7bc`.

## Defects

None found. No release-blocking known gaps remain for this candidate.
