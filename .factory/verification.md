# Independent verification — FAIL

**Work order:** `a11y-playtest-captioner-verify-1`  
**Candidate:** `50b14f1280f92db7af46310087ca83820e4d25af` (`main`)  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Verified:** 2026-08-28 UTC

## Decision

**FAIL.** The normal authoring and review path works, but a corrected locale tag cannot be submitted after a validation error. This directly blocks recovery for the product's multilingual authoring job. The live static host also does not deliver the security and immutable-cache policies supplied with the build.

## Reproducible defects

### High — language-tag validation cannot recover

1. Open the workspace and choose **Add first state**.
2. In **Language tag**, type `!!`; choose **Add**. The intended actionable validation error appears.
3. Select the value, replace it with valid `es-MX`, and choose **Add**.
4. The form remains invalid with `Enter a valid BCP 47 language tag, such as fr or pt-BR.`; no `es-MX` language tab is added and the review language remains `en`.

Evidence from a fresh Chromium session: invalid input `{ value: "!!", valid: false }`; after a real keyboard correction `{ value: "es-MX", valid: false }`; language tabs remain `["en"]`. The application sets a custom validity message on the invalid submission but does not clear it on input. Native form validation therefore prevents the submit handler from running to clear it. Reloading is the only observed recovery.

This violates the required invalid-input recovery path and the brief's localized-description workflow.

### Medium — live response policies and cache behavior do not match the shipped policy file

`dist/site/_headers` declares `Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy: no-referrer`, and one-year immutable caching for `/assets/*` and the hero image. Fresh HTTPS responses from the live URL instead had:

| Request | Observed live policy |
| --- | --- |
| `/` | `Cache-Control: public, must-revalidate, max-age=30`; no CSP or Permissions-Policy; `Referrer-Policy: strict-origin-when-cross-origin` |
| `/assets/main-HZOKhG3Q.js` | `Cache-Control: public, must-revalidate, max-age=30`; no CSP or Permissions-Policy |
| `/hero-caption-landscape.webp` | `Cache-Control: public, must-revalidate, max-age=30`; no CSP or Permissions-Policy |

HTTPS redirect, HSTS and `X-Content-Type-Options: nosniff` are present. The missing CSP/Permissions-Policy means the stated outbound-script/connect restrictions are not enforced in production; 30-second caching misses the required long-lived immutable caching for content-hashed assets.

## Evidence collected

### Clean build and automated checks

- Starting checkout was clean and exactly at the candidate SHA.
- `npm ci`: pass; `npm audit --omit=dev`: 0 vulnerabilities.
- `npm run test:unit`: pass — 5/5 Vitest tests.
- `npx tsc --noEmit`: pass. No lint script is configured in `package.json`.
- `npm run build`: pass from its clean step; creates `dist/lib` and `dist/site`.
- `npm run test:e2e`: pass — 9 Chromium checks passed, 1 desktop-only duplicate assertion skipped. This includes local authoring/persistence, keyboard rehearsal, export/undo, offline reload and 390px overflow.
- `npm pack --dry-run`: pass — 12 files, 16.7 kB packed / 66.8 kB unpacked.

### Clean consumer package exercise

Packed the candidate, installed it into a new temporary npm consumer, then imported the public package as both ESM and CommonJS. Both entry points passed normal state activation, `es-MX` → `es` locale fallback, ordered cue navigation, missing-speech behavior in Node, validation errors for invalid IDs/tags/blank descriptions, and destroyed-instance behavior.

### Browser and accessibility checks

- Fresh desktop live session: created a state and cue, rehearsed it with ArrowRight and `S`, observed the expected cue and on-device speech status; invalid state-ID and malformed-JSON import errors were actionable; export worked after valid data. No page errors, console errors, or failed requests.
- Fresh 390×844 mobile/reduced-motion session: no horizontal document overflow (`390 / 390`), keyboard Home/End moved to the first/last authored cue, skip link received keyboard focus and showed its 3px focus outline, zoom was not disabled, and reduced-motion transition/animation durations were effectively zero.
- Axe Playwright scan on the live authored page: **0 serious/critical** findings. The repository's desktop/mobile axe check also passed.
- Local production Lighthouse mobile retry: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP **1.7 s**, CLS **0.079**.
- Production output budget: initial JavaScript 23.10 kB uncompressed / 8.40 kB gzip (main plus loader), CSS 19.59 kB / 4.99 kB gzip, WOFF2 fonts 34.80 kB, and responsive hero images 14.73 kB / 47.03 kB. All are below the stated budgets.

### Privacy, deployment, and identity

- A request capture of a fresh live page load contained only `a11y-playtest-captioner.sociobot.in`; no analytics, third-party runtime script, or outbound data request was observed. Source inspection confirms localStorage project storage and browser `speechSynthesis`; it contains no telemetry client.
- The home page, `/privacy/`, `/terms/`, and `/sw.js` returned HTTP 200. HTTP redirects to HTTPS.
- The service-worker offline reload/local editing path passed in the repository E2E suite on both desktop and mobile.
- Every generated static file was compared to the URL of the same name on the live deployment: **18/18 SHA-256 hashes matched**. The live body is therefore the candidate artifact; the response-header failure is a delivery/configuration failure, not a stale deployment.

## Required resolution and re-verification

1. Clear language-tag custom validity as the user edits the field (and add a regression test covering invalid tag → correction → successful locale creation).
2. Configure the actual static host to send the declared CSP, Permissions-Policy, `Referrer-Policy: no-referrer`, and immutable cache policy for hashed assets; merely shipping `_headers` is not applying it on this host.
3. Rebuild/deploy and rerun the invalid-language recovery, live-header, and cache checks before changing this report to PASS.
