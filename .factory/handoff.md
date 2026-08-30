# A11y Playtest Captioner — repair 5 handoff

## Release status: PASS

This repair resolves every blocker in independent verification report [`.factory/verification-4.md`](./verification-4.md) for candidate `1616dbd0f454316d6d6a7b6acd5d699ad2f8d950` and report commit `349c07a056e7baea57c251e141890b1bacb11b04`.

Product repairs were committed and pushed as:

- `e361152` — demo, claims, declaration, metadata, 404, and target-size repair
- `780e423` — demo banner interaction and layout repair
- `1a93a19` — stable optional self-hosted font loading for zero layout shift

The final static artifact was deployed with `/opt/fleet/lib/deploy-static.sh a11y-playtest-captioner dist/site` (Azure deployment `17c89c50-ac48-4f46-80bf-81185f4dacab`) to <https://a11y-playtest-captioner.sociobot.in>.

## What changed

- Added the required `.factory/claims.json` with six observable claims and dedicated `@claim:` Playwright tests. Each listed command was run separately, and `npm test` runs the whole claims suite.
- Rewrote the first screen in plain words for browser-game creators. **Try it with sample data** is first and opens the two-state Signal Hollow sample in one click.
- Implemented `/demo` and `?demo=1` as an isolated sandbox. It uses only `demo:a11y-playtest-captioner:project:v1`, never reads or writes the normal project key, has persistent Reset demo / Start for real controls, and discards demo storage on exit. `.factory/demo.md` documents it.
- Corrected NodeNext declarations by emitting explicit `./types.js` declaration imports. `test:package` now packs the library, installs it into a clean TypeScript 5.9 NodeNext consumer, compiles it, and runs both ESM and CommonJS imports.
- Added a styled real `404.html`, `/demo` route rewrite, Static Web Apps 404 override, route and response-policy regression tests, complete canonical/Open Graph/Twitter/Apple metadata, social and bookmark images, sitemap demo entry, and footer version/build identity.
- Raised desktop **Add action** to 44px and added desktop/mobile measurement coverage.
- Added `.factory/copy-audit.md`; the design record now includes provenance for derived social/bookmark assets.
- Fixed a repair-found banner overlay interaction and switched the self-hosted Atkinson fonts to `font-display: optional`; the current live Lighthouse run has CLS 0.

## Verification evidence

From a clean `npm ci` (62 packages added; 0 vulnerabilities):

- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm test` — pass: 12 Vitest tests, 16 claim-browser tests, and 23 desktop/390px workspace passes with 3 intentional mobile-only skips. This includes keyboard focus, invalid-language recovery, import/export, undo, demo isolation, offline reload, touch targets, axe, and no-overflow checks.
- Every exact claim command in `.factory/claims.json` — pass independently in desktop and 390px Chromium.
- `npm run build` — pass; emits ESM, CJS, NodeNext-compatible declarations, and `dist/site`.
- `npm audit --omit=dev` — 0 vulnerabilities.
- `npm pack --dry-run` — 12 files; 17.9 kB packed and 70.7 kB unpacked.
- Clean packed consumer — strict TypeScript 5.9 NodeNext compile plus ESM and CommonJS runtime imports pass.

Local and live browser checks:

- Factory `verify-url.sh` passed on the live home page and `/demo`: correct titles, `lang=en`, exactly one `<h1>`, one main landmark, image alternatives, button labels, and no console errors.
- Fresh live desktop and 390×844 `/demo` checks: sample banner and state present; ArrowRight reaches **Loose rope**; axe has 0 violations; no horizontal overflow; no console/page errors; no cross-origin requests.
- Privacy claim flow: no cookies in the claim test, demo edits use only the `demo:` key, and the live sample flow makes no cross-origin requests. Speech uses the browser local API.
- Offline/update: both live viewports had an activated controlling worker, no waiting/installing worker, exactly one `a11y-captioner-ae5de9f8c7bc` cache, and a successful offline `/demo` reload with local editing status.
- Routing/headers: unknown live route returns HTTP 404 with **Page not found**; HTTP redirects to HTTPS. Home responses carry CSP (including response-header `frame-ancestors 'none'`), HSTS, no-referrer, nosniff, disabled camera/microphone/geolocation, and revalidation caching. Hashed JS is immutable for one year.
- Deployment identity: 19/19 publicly served files SHA-256-match the final `dist/site` artifact. `staticwebapp.config.json` is deployment configuration rather than a served public file.
- Mobile Lighthouse 13.4.1 on live `/demo`: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.36 s, CLS 0, TBT 5 ms, transfer 100,734 B.
- Production budgets: initial app JS 25.28 kB uncompressed / 8.86 kB gzip; CSS 21.03 kB / 5.23 kB gzip; browser-used WOFF2 fonts 34.8 kB; hero image remains 47.0 kB desktop / 14.7 kB mobile.

## Run, package, and deploy

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
npm pack --dry-run
```

The factory owns npm credentials; do not publish from this workspace. `npm pack` produces the ready-to-publish tarball. Deploy only `dist/site` with the static deployment command above.

## Known constraints

Browser and operating-system speech voice inventory and pronunciation remain outside the product’s control; speech fails softly when unavailable. The tool intentionally does not inspect game canvases, generate descriptions, certify conformance, or replace disabled playtesters.
