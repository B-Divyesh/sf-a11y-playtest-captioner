# Independent verification 4 — FAIL

**Work order:** `a11y-playtest-captioner-verify-4`  
**Candidate:** `1616dbd0f454316d6d6a7b6acd5d699ad2f8d950` (`main`)  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Verified:** 2026-08-30 UTC  
**Artifact:** npm library plus static local-first/PWA workspace

## Decision

**FAIL.** Fresh evidence rules out a deployment-only failure: the live site is healthy, and all 17 deployable files match the exact production build byte-for-byte. The workspace's main authoring, multilingual review, import/export, privacy, mobile, accessibility, and offline flows work.

The candidate nevertheless fails three acceptance-critical requirements:

1. `.factory/claims.json` is missing, so no required claim tests exist or can run.
2. The first screen does not plainly name the user and has no **Try it with sample data** action or isolated demo sandbox.
3. The packed TypeScript declarations fail in a clean, standard NodeNext consumer.

The first two are explicit mandatory-fail gates in this work order. The passing repository suite cannot override them.

## Mandatory acceptance gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Candidate and clean tree before QA | PASS | `HEAD` was exactly `1616dbd0f454316d6d6a7b6acd5d699ad2f8d950`; `git status --porcelain` was empty |
| Every `.factory/claims.json` test, before other tests | **FAIL** | File does not exist; the initial `test -f .factory/claims.json` stopped with exit 1 before any claim could run |
| Cold first-read: what it does | PARTIAL | The lede describes writing localized game-state descriptions and rehearsing keyboard order, but the headline is the metaphorical “Describe what the canvas can’t say.” |
| Cold first-read: who it is for | **FAIL** | The first screen never plainly says browser-game creators/authors |
| Cold first-read: what to click first | PASS | **Open the workspace** is visually primary |
| First-screen one-click sample demo | **FAIL** | Zero **Try it with sample data** actions on desktop and 390px; **Load example project** is below the first screen |
| Isolated demo mode | **FAIL** | `/demo` and `/?demo=1` both open an empty ordinary workspace: 0 sample states, 0 demo banners, and no Reset demo/Start for real controls |

The first screen also supplies only one combined privacy/account line, not the required three plain facts for privacy, offline use, and price.

The existing **Load example project** control is not a sandbox. It writes the sample into the ordinary `a11y-playtest-captioner:project:v1` local-storage key, replacing the user's current project (with only a short-lived Undo). `.factory/demo.md` is also absent.

## Defects by severity

### Release blocker — claims registry and claim tests are absent

`.factory/claims.json` does not exist. Therefore the candidate has no tests tagged or registered for claims visitors are asked to rely on, including:

- “Drafts and speech stay on this device.”
- “Ready offline after first visit.”
- “Zero dependencies” and “The library adds no telemetry.”
- README claims that the app works offline and uses no analytics, network speech service, or third-party runtime script.

Independent QA verified several of these behaviors, but that does not satisfy the contract requiring every claim to be registered and exercised from the demo entry point on every build.

### Release blocker — no plain first-screen sample demo or sandbox

On a fresh desktop context, the visible first screen contained:

- headline: **Describe what the canvas can’t say.**
- lede: localized descriptions and keyboard-order rehearsal;
- actions: **Open the workspace** and **Use the library**;
- one privacy line.

It does not name the target user in plain words, offer the mandated sample-data action, or show the three required facts. The only sample loader appears lower in the workspace. Direct `/demo` and `?demo=1` checks prove there is no separate demo behavior, banner, reset, exit, or storage namespace.

### High — packed declarations fail for NodeNext TypeScript consumers

The actual `17,632` byte tarball was installed into a clean consumer. ESM, CommonJS, and real Chromium runtime consumers passed. A strict TypeScript 5.9.2 consumer using the standard `module: NodeNext` and `moduleResolution: NodeNext` failed:

```text
dist/lib/index.d.ts:1:50 TS2834: Relative import paths need explicit file extensions
dist/lib/index.d.ts:2:178 TS2834: Relative import paths need explicit file extensions
```

Both generated declarations import/export from `"./types"` rather than a NodeNext-compatible path. This blocks a normal typed consumer of a product described as a TypeScript library.

### Medium — unknown routes are soft 404s

`/not-a-real-route` returns HTTP 200 and the landing page. The candidate has no designed `404.html` or Static Web Apps 404 response override. This fails the required real 404 route and makes broken URLs indistinguishable from valid pages.

### Medium — required site metadata and build identity are incomplete

- Home title is 65 characters, over the 60-character limit.
- Home, Privacy, and Terms have no canonical link, Open Graph metadata, Twitter card, or Apple touch icon.
- There is no 1200×630 social image.
- Footers do not show the required version/build id.

Core metadata does pass: each tested page has a nonempty title/description, `lang=en`, one `<h1>`, and one main landmark.

### Low — one visible desktop action is below the 44px target

With the sample loaded at 1440px, **Add action** measured about `110 × 42.8px`. Mobile CSS raises it to at least 44px. The other apparent undersized elements were visually hidden inputs/labels whose associated visible controls meet the target.

## Clean checkout and repository gates

| Check | Result |
| --- | --- |
| Node / npm | `v22.23.2` / `10.9.8` |
| `npm ci` | PASS — 62 packages added, 63 audited, 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — currently another `tsc --noEmit`, not an independent linter |
| `npm test` | PASS — 9/9 Vitest; 17 Playwright passes and 3 intentional project-specific skips |
| `npm run build` | PASS — exact production build emitted `dist/lib` and `dist/site` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm pack` / `npm pack --dry-run` | PASS — 12 files, 17.6 kB packed / 70.0 kB unpacked |

The repository tests cover authoring, keyboard context, invalid locale recovery, example load/export/undo, axe, offline reload, mobile overflow, and mobile target sizing. None are registered as claim tests because the claims file is absent.

## Packed-library consumer evidence

The packed package has no runtime dependencies and exposes ESM, CommonJS, and declarations.

- ESM Node consumer passed bilingual registration, `es-MX` → `es` resolution, cue resolution, frozen snapshots, validation errors, and destruction.
- CommonJS consumer passed creation and activation.
- Real Chromium consumer passed adjacent live-region mounting, `lang=es` announcements, window keyboard navigation, editable-input shortcut suppression, speech text/language, cleanup, and post-destroy guards.
- Strict NodeNext type checking failed as documented above.

The package is not yet in the public npm registry (`npm view a11y-playtest-captioner` returned 404). This was not scored as a candidate defect because the factory contract explicitly reserves publishing credentials and asks verification to use the packed artifact. It remains a post-acceptance release step; this failed candidate must not be published.

## Live end-to-end evidence

### Normal, boundary, invalid, and recovery paths

Fresh desktop and 390×844 contexts completed the useful workflow:

- loaded the two-state Signal Hollow example;
- reviewed the two Ravine crossing actions with ArrowRight and End;
- entered invalid language `!!`, received the specific BCP 47 error, corrected it to `es-MX`, and continued;
- exported `signal-hollow-captions.json` with two states and English/Spanish descriptions;
- imported malformed JSON and received an actionable `Import failed` message;
- restored the valid export;
- created ten complete critical states plus an action in 2.3 seconds of automation, then exported all ten;
- attempted duplicate state ID `checkpoint-1`, received “That state ID is already in use,” corrected it, and exported successfully;
- reloaded persisted sample data.

No console errors, page errors, failed online responses, or workflow traps occurred.

### Accessibility, keyboard, mobile, and motion

- Factory `verify-url.sh`: PASS in 992ms; title/lang/main/alt/button checks passed with no console errors.
- Landing and sample-loaded axe scans at desktop and 390px: 0 violations, including 0 serious/critical.
- Keyboard Tab order starts with the skip link and reaches header, primary actions, workspace, import/export, and footer controls.
- Keyboard-focused controls show the designed solid 3px cyan outline.
- 390px sample page: `scrollWidth=390`, `clientWidth=390`; no page-level horizontal overflow.
- At 640 CSS px (the reflow width for 200% zoom on a 1280px viewport), document width remained 640px and the workspace, monitor, and Export action remained visible.
- Reduced-motion media query matched; author-panel animation and transitions were reduced to `0.00001s`.
- `lang=en`, exactly one `<h1>`, one `<main>`, no missing image alternative, and no unlabeled button were observed.
- Dark-theme contrast passed axe/Lighthouse. The intentionally single-mode design is documented in `.factory/design.md`.

### Privacy and outbound requests

A complete sample/review/validation/export/import flow made seven same-origin requests in total and **zero cross-origin requests**. It set no cookies. Browser storage contained only `a11y-playtest-captioner:project:v1`. Clicking speech caused no network request. Fonts, scripts, styles, and images are self-hosted.

The live HTML and assets send:

- same-origin CSP with `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'none'`;
- HSTS;
- `Referrer-Policy: no-referrer`;
- `X-Content-Type-Options: nosniff`;
- camera, microphone, and geolocation disabled by Permissions Policy.

This static product has no server-side or product-unlock endpoint, so an API allowance/429/`Retry-After` test is not applicable. There is no sign-in flow, so the Entra authority check is not applicable.

### Service worker and offline update behavior

The live worker was active and controlling the page. `registration.update()` left no waiting or installing worker. The worker-reported cache was the only cache, `a11y-captioner-42f83e257193`, with all 14 shell entries. A forced offline reload restored both sample states, the local project, and “Offline — local editing still works” with no console errors.

### Deployment identity, routing, and caching

All 17 public production files were downloaded and SHA-256 compared with the local `dist/site`: **17/17 matched, 0 mismatched**. This includes HTML, JS, CSS, fonts, images, favicon, robots, sitemap, and service worker. The candidate commit changes only handoff documentation over the deployed product code, so this establishes candidate/live identity.

- HTTP redirects to HTTPS with 301.
- `/`, `/privacy/`, `/terms/`, `/demo`, `/sw.js`, robots, sitemap, and hashed assets return 200.
- HTML and `sw.js` use `public, must-revalidate, max-age=30`.
- Hashed assets use `public, max-age=31536000, immutable`.
- Unknown routes incorrectly return 200 as recorded above.

### Performance and bundle budgets

| Budget / metric | Fresh result |
| --- | ---: |
| Initial app JS | 24.20 kB main + 0.71 kB style loader; 8.89 kB combined gzip |
| CSS | 19.70 kB / 5.00 kB gzip |
| Browser-used WOFF2 fonts | 34.8 kB |
| Hero variants | 14.7 kB mobile / 47.0 kB desktop |
| Lighthouse transfer | 97 KiB |
| Lighthouse Performance | 93 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| LCP | 1.4s |
| TBT | 260ms |
| CLS | 0.079 |

The required JS/CSS/font/image, LCP, CLS, and score budgets pass. Lighthouse noted possible responsive-image savings but no budget failure.

## Other contract checks

- `.factory/design.md` records a product-specific palette, self-hosted type, spacing, motion policy, single-mode rationale, and generated-asset provenance.
- README, MIT LICENSE, CHANGELOG, Privacy, and Terms exist and cover normal setup/use/deployment boundaries.
- `.factory/copy-audit.md` is absent, so the required plain-language audit artifact was not produced.
- The brief requires author-controlled descriptions; adding AI would conflict with that role. No missed AI leverage finding was recorded. JSON import/export is present.

## Required resolution before PASS

1. Add `.factory/claims.json`; register every live/README claim exactly once; add tagged observable tests that start only from the isolated demo entry point; run every listed command cleanly.
2. Replace the first screen with the mandated plain-words shape and a visible **Try it with sample data** action. Implement `/demo` or `?demo=1`, persistent demo banner, reset/exit controls, and a separate `demo:` storage namespace that never overwrites ordinary drafts. Add `.factory/demo.md`.
3. Emit declarations compatible with NodeNext consumers and add a clean-consumer typecheck to CI.
4. Add a real styled 404 response and complete canonical/social/apple metadata plus footer version/build identity.
5. Raise **Add action** to at least 44px and add the missing copy-audit artifact.
