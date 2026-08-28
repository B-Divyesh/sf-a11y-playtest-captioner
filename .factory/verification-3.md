# Independent verification 3 — FAIL

**Work order:** `a11y-playtest-captioner-verify-3`  
**Candidate:** `d0461111d3f254a781f1da9824c57dd3c152ca91` (`main`)  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Artifact:** npm library plus static local-first/PWA workspace

## Decision

**FAIL.** The live deployment is healthy and byte-for-byte matches the candidate. All repository gates, packed-library checks, core authoring/rehearsal flows, privacy checks, offline behavior, response policies, bundle budgets, and Lighthouse targets pass. The five defects from verification 2 are repaired.

Fresh independent keyboard testing found a remaining acceptance defect: controls that rebuild a UI region move focus to the document body. This affects state and language selection, focus-order editing, deletion, the voice-language selector, and the visible Next action review control. The operation takes effect, but a keyboard-only user loses their place and must restart navigation from the top of the page. The mobile header/footer links also remain below the contract's 44px target, and axe reports a moderate landmark-structure issue.

## Defects

### Medium — render-replacing controls discard keyboard focus

On the live site, load the example project, focus any affected control, and activate it with the keyboard. After each of the following independent cases, `document.activeElement` is `<body>`:

- select the **Watcher alert** state with Enter;
- select the **es** language tab with Enter;
- activate **Move Loose rope later** with Enter;
- activate **Remove Loose rope** with Enter;
- activate **Delete “Ravine crossing”** with Enter;
- activate the visible **Next action** review button with Enter;
- change **Voice language** with ArrowDown.

These controls synchronously replace the element that owns focus and generally do not restore focus. `moveCue()` tries to focus the replacement `<li>`, but that element is not focusable. The monitor's documented Arrow/Home/End review loop correctly restores focus, and the repaired State name → State ID Tab path now works, so this is not a trap or total blocker. It is nevertheless a broad keyboard context failure in core authoring and visible review controls, contrary to the acceptance contract's keyboard requirement.

### Low — ancillary mobile link targets are shorter than 44px

At 390 × 844, the primary workspace buttons and repaired cue-order controls pass. The following visible navigation targets remain below the attached 44 × 44px design/accessibility target:

- header brand: about `181.8 × 32px`;
- footer brand: about `149.9 × 21.7px`;
- Privacy, Terms, and Source footer links: about `49 × 24.8px`, `43 × 24.8px`, and `50 × 24.8px`.

The footer links have 20px gaps and exceed WCAG 2.5.8's 24px minimum except the Terms width rounds to 43px while its height is 24.8px, but they do not meet this product's stricter 44px contract.

### Low — complementary landmarks are nested inside `main`

Axe 4.10.2 reports one moderate rule, `landmark-complementary-is-top-level`, on `.state-rail` and `.review-pane`: both `<aside>` complementary landmarks are contained by the main landmark. There are **0 serious/critical** axe findings on the authored home page, desktop or mobile, and no findings on `/privacy/` or `/terms/`.

## Clean checkout and repository gates

Verification ran in detached clean worktree `/tmp/a11y-captioner-qa.Lcaop9` at the exact candidate SHA. No tracked files changed during build/test/package work.

| Check | Result |
| --- | --- |
| Node / npm | `v22.23.2` / `10.9.8` |
| `npm ci` | PASS — 62 packages added, 63 audited, 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — currently a second `tsc --noEmit`, not a separate linter |
| `npm test` | PASS — 9/9 Vitest tests; 14 Playwright tests passed, 2 intentional viewport skips |
| `npm run build` | PASS — exact clean production build emitted `dist/lib` and `dist/site` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm pack --dry-run` | PASS — 12 files, 17.6 kB packed / 70.0 kB unpacked |

`verify-url.sh` passed locally and live with HTTP 200, the expected title, `lang=en`, exactly one `<h1>`, a main landmark, no missing image alt text, no unlabeled buttons, and no console errors. Measured load time was 1088ms locally and 1095ms live.

## Packed-library consumer evidence

The actual tarball was installed with scripts disabled into empty consumer `/tmp/a11y-captioner-consumer.kNmJJT`.

- Install added exactly one package, audited two packages, and found 0 vulnerabilities.
- Packed `package.json` has no runtime dependencies and exposes ESM, CommonJS, and declarations.
- ESM passed a representative 10-state bilingual registration, `es-MX` → `es` and fallback-locale resolution, activation, cue wrapping, subscription, frozen snapshots, invalid locale/ID recovery, atomic duplicate rejection, an eleventh registration, and post-destroy guards.
- CommonJS passed empty-state, empty-focus-order, blank-description rejection/recovery, invalid direction with an active cue, and idempotent destruction.
- A real Chromium consumer imported the installed ESM artifact and passed adjacent live-region mounting, stale-cleanup isolation, `lang=es` state announcements, English cue fallback with `resolvedLocale` and live-region `lang=en`, speech text with `lang=en`, editable-input shortcut suppression, window keyboard navigation, cleanup, and destruction.

This independently confirms all previous library blockers are repaired: correct cue speech language, safe stale unmount, and a genuinely zero-dependency packed install.

## Live end-to-end evidence

### Authoring, validation, rehearsal, import/export, and persistence

A fresh desktop context completed the smallest useful workflow:

- created and named a state while preserving natural Tab order from State name through ID, language controls, description, Add action, label, and spoken hint;
- entered invalid ID `bad id`, received the actionable native error, corrected it to `gate-warning`, and continued by keyboard;
- entered invalid language `!!`, received the BCP 47 error, corrected it by keyboard to `es-MX`, and added the locale;
- authored two English and Spanish actions;
- attempted export with blank newly localized fields, received an `Export blocked` non-blank validation message, completed the fields, and exported valid JSON with one state/two cues;
- rehearsed ArrowRight, Home, End, and `S`; captured Spanish text with `lang=es-MX`;
- imported malformed JSON and received an `Import failed` recovery message;
- imported a complete bilingual 10-state pilot, reloaded, and recovered all 10 states from browser storage;
- exercised corrupt saved JSON (clean fallback plus explanatory toast) and unavailable storage (editing remains available plus `Could not save in this browser`).

The browser stored only `a11y-playtest-captioner:project:v1`, set no cookies, and made requests only to `https://a11y-playtest-captioner.sociobot.in`. No analytics, telemetry, third-party scripts/fonts, console errors, page errors, failed online requests, or HTTP error responses were observed. Source inspection found no library network APIs; site fetches are limited to same-origin service-worker caching.

### Accessibility, responsive behavior, and visual review

- Desktop and 390px mobile visual captures match the product-specific luminous signal-map thesis; content hierarchy, empty state, dark palette, generated hero asset, and responsive stacking are intact.
- Desktop and 390px authored-page axe scans: 0 serious/critical; the one moderate landmark finding is recorded above.
- `/privacy/` and `/terms/`: HTTP 200, unique title, `lang=en`, one `<h1>`, `<main>`, no horizontal overflow, and no axe findings.
- 390px initial and sample-loaded pages: `scrollWidth=390`, `clientWidth=390`; body text is 16px.
- 640px reflow check (equivalent CSS width for 200% zoom at 1280px): no document overflow; workspace and Export remain available.
- Reduced motion at 390px: query matches; root scroll behavior is `auto`; animation/transition duration is `0.00001s`.
- Repaired cue-order buttons are exactly `44 × 44px` with an 8px gap. Toast Undo is 51 × 44px; Copy command is about 98.7 × 44px.
- Keyboard focus on the skip link and rehearsal monitor uses the designed solid 3px cyan outline. The context-loss defect above remains.

### Service worker and offline

The live worker is active and controls the page. `registration.update()` left no waiting or installing worker. The worker-reported and only stored cache is `a11y-captioner-d83f85d7a887`; all required shell assets were present. After an online reload, a forced-offline reload restored the sample project's two states and showed `Offline — local editing still works`, with no unexpected console errors.

## Deployment identity, response policy, and caching

Every public production file was downloaded and SHA-256 compared with the exact local `dist/site`: **17/17 matched, 0 mismatched**. This includes HTML, JS, CSS, fonts, hero images, favicon, robots, sitemap, and service worker. `_headers` and `staticwebapp.config.json` are deployment controls and were excluded from public-file comparison.

- HTTP redirects to HTTPS with 301.
- `/`, `/privacy/`, `/terms/`, `/sw.js`, `robots.txt`, `sitemap.xml`, hashed assets, and hero images return 200.
- HTTPS responses carry HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a same-origin CSP with `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'none'`.
- HTML and `sw.js` use 30-second revalidation. Hashed JS/CSS and hero images use `public, max-age=31536000, immutable`; JS is Brotli-compressed and a conditional ETag request returned 304.
- The certificate matches the hostname and is valid from 2026-08-28 through 2027-02-28.

There is no current deployment-only failure.

## Performance and bundle evidence

| Budget / metric | Result |
| --- | ---: |
| Initial app JS | 23,020 B uncompressed / 8,226 B gzip |
| CSS | 19,592 B uncompressed / 5,010 B gzip |
| Browser-used WOFF2 fonts | 34,800 B |
| All emitted font formats | 63,132 B |
| Hero variants | 14,726 B / 47,032 B |
| Lighthouse total transfer | 99,148–99,211 B |
| Lighthouse Performance, 3 runs | 98 / 100 / 98 |
| Lighthouse Accessibility | 100 / 100 / 100 |
| Lighthouse Best Practices | 100 / 100 / 100 |
| Lighthouse SEO | 100 / 100 / 100 |
| Lighthouse LCP | 1.354s in all runs |
| Lighthouse TBT | 36ms / 0ms / 0ms |
| Lighthouse CLS | 0.079 / 0.017 / 0.079 |

All stated static and Lighthouse-class budgets pass.

## Required resolution before PASS

1. Preserve or deliberately move focus after every render-replacing keyboard action. For cue reorder, focus the moved cue's corresponding arrow button or make/focus an appropriately labelled focusable container. For state/language selection and visible review controls, restore focus to the equivalent current control. Add regressions that activate each affected path with Enter/Arrow keys and assert a meaningful focused element.
2. Bring the mobile header/footer navigation targets to the specified 44px target without reducing the existing spacing.
3. Remove complementary landmark semantics from panes that are subdivisions of the main task, or restructure/label landmarks so axe no longer reports nested complementary regions.
