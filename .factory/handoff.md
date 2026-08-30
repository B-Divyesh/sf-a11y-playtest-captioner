# A11y Playtest Captioner — polish 1 handoff

## Release status: PASS

This repair closes every finding in [review-1.md](./review-1.md), which reviewed release candidate `62947bde31811677dfa6d20a470b2ba45733f9db`. Product changes are commit `e531d46553def479ce51ae3764aa2d4601760f25` (`fix: close adversarial polish findings`). It is pushed to `main` and deployed to <https://a11y-playtest-captioner.sociobot.in/> using `/opt/fleet/lib/deploy-static.sh a11y-playtest-captioner dist/site`.

Azure deployment: `72577c28-640d-456d-ab86-cb87241f3330`.

## What changed

- Kept all three privacy, offline, and price facts inside the 390 × 844 first screen. Mobile now prioritizes the job, lede, one demo action, result note, and facts before the hero art.
- Added document-route context handling. Same-origin navigation records intent; each destination, Back, and Forward navigation moves focus to its `h1` without changing restored scroll and announces the route through a polite live region.
- Expanded `.factory/claims.json` from six to ten claims. New browser-storage, language/fallback, mounted-announcement, and library-lifecycle claims each have a dedicated tagged observable test.
- Rewrote the README into short, plain sentences; replaced decorative and context-free labels with **Caption state map**, **Write captions**, and **Test action order**; renamed the language form action to **Add language**.
- Added regression coverage for the mobile first screen, route focus/history announcement, normal browser-storage persistence, and the new library claims.
- Added the verb-first 77-character catalog description and updated the full landing/README copy audit.

## Verification

Fresh remote clone: `/tmp/a11y-captioner-clean.5J0bbb` at `e531d46`.

- `npm ci` — pass; 62 packages and 0 vulnerabilities.
- Every command listed in `.factory/claims.json` — pass independently: `demo-isolation`, `offline-reload`, `local-only`, `free-demo`, `author-review`, `browser-storage`, `language-tags-and-fallback`, `mounted-announcement`, `library-api`, and `json-export`.
- `npm test` — pass. The clean clone Playwright result is `test-results/.last-run.json: {"status":"passed","failedTests":[]}`.
- `npm run build` — pass; produced `dist/lib` and `dist/site`.
- `npm pack --dry-run` — pass; 12 files, 17.5 kB packed, 69.9 kB unpacked.
- `npm run test:e2e -- --grep "first-screen|route changes"` — pass; validates the 390px fact bounds and Home → Privacy → Back focus/announcement behavior.
- Live `/opt/fleet/lib/verify-url.sh` — pass: HTTPS 200, correct title, `lang=en`, one `h1`, `<main>`, image alternatives, labelled buttons, and no console errors. Evidence: `/tmp/a11y-captioner-live.ZCOkWS/verify.json` and screenshots in that directory.
- Fresh live Playwright + axe check — zero axe violations. It measured the three mobile fact bottoms at `467.375`, `485.969`, and `504.563` px in an 844px viewport; `/demo` showed its banner and Signal Hollow; Privacy and Back both focused their `h1` and announced the route. Screenshot: `/tmp/a11y-captioner-live.ZCOkWS/cold-mobile.png`.

The standalone `@axe-core/cli` could not locate a Chrome binary in this container. The repository’s Playwright AxeBuilder integration ran successfully against the live demo instead, with zero violations.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm pack --dry-run
/opt/fleet/lib/deploy-static.sh a11y-playtest-captioner dist/site
```

The factory owns npm publishing credentials. Do not publish from this workspace.

## Known constraints

Browser speech voices and pronunciation are controlled by the visitor’s browser and operating system. The product intentionally does not inspect game canvases, generate captions, certify conformance, or replace testing with disabled players.
