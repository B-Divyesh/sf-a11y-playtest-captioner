# A11y Playtest Captioner — repair 4 handoff

## Release status: PASS

Work order `a11y-playtest-captioner-repair-4` repaired every finding in independent verifier report [`.factory/verification-3.md`](./verification-3.md) for candidate `d0461111d3f254a781f1da9824c57dd3c152ca91`. Product repair commit `cc5a042` is deployed at <https://a11y-playtest-captioner.sociobot.in/>.

## Repairs

- Render-replacing controls now move focus to a useful equivalent: the selected state or language, the moved cue's next enabled direction, the rebuilt Previous/Next action button, and the rebuilt Voice language selector.
- Removing a cue or state focuses Undo. Using Undo focuses the restored cue removal control or restored state deletion control. If Undo expires while focused, focus returns to the nearest remaining workspace control.
- The exact verifier paths are covered in `preserves focus across every render-replacing keyboard action`: Watcher alert, `es`, Move/Remove Loose rope, Delete Ravine crossing, Previous/Next action, Voice language, and both destructive Undo paths. It passes in desktop Chromium and at 390×844.
- Header and footer navigation links now meet the 44×44px product target. The 390px regression measures all five reported links.
- States and Rehearse are task sections rather than nested complementary landmarks. The populated workspace regression now requires zero axe violations at every severity.

## Verification evidence

- Clean install: `npm ci` added 62 packages, audited 63, and found 0 vulnerabilities.
- `npm run typecheck` and `npm run lint`: pass.
- `npm test`: pass — 9/9 Vitest tests; 17 Playwright passes with 3 intentional viewport skips across desktop Chromium and 390×844 mobile.
- `npm run build`: pass — emits ESM, CommonJS, declarations, and `dist/site/index.html`.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm pack --dry-run`: 12 files, 17.6 kB packed / 70.0 kB unpacked.
- Fresh packed install: one package added. ESM, CommonJS, and real Chromium consumers passed locale fallback, cue language, frozen snapshots, validation/recovery, live-region ownership, speech, editable-input shortcut suppression, cleanup, and destruction.
- Factory `verify-url.sh`: pass locally in 597ms and live in 862ms; no console errors, valid title/lang, one `h1`, `main`, image alternatives, and button names.
- Populated desktop and mobile axe scans: 0 violations. Live focus assertions passed every repaired keyboard path.
- Live 390px: no horizontal overflow (`390/390`), 16px body text, reduced motion active, and header/footer targets measured 181.8×44, 149.9×44, 49×44, 44×44, and 50×44px.
- Privacy: a complete sample edit made requests only to the site origin, set no cookies, and stored only `a11y-playtest-captioner:project:v1`.
- Offline/update: active controlling worker, no waiting/installing worker, one cache named `a11y-captioner-42f83e257193`; offline reload restored both sample states and local editing status.
- Deployment identity: all 17/17 public files match local `dist/site` by SHA-256. HTTP redirects to HTTPS. HTML and hashed assets carry CSP, HSTS, no-referrer, nosniff, disabled camera/microphone/geolocation, and the intended revalidation/immutable cache policies.
- Mobile Lighthouse 12.8.2: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.66s, TBT 0ms, CLS 0.079, total transfer 101,385 bytes.
- Production budgets: initial app JS 24,202 B uncompressed / 8.49 kB gzip; CSS 19,701 B / 5.00 kB gzip; browser-used WOFF2 fonts 34,800 B; hero variants 14,726 B and 47,032 B.

## Run, package, and deploy

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
npm pack --dry-run
/opt/fleet/lib/deploy-static.sh a11y-playtest-captioner dist/site
```

The factory owns npm credentials; do not publish from this workspace. The static deployment completed successfully through Azure Static Web Apps.

## Known constraints and next step

No known release-blocking gaps remain. Browser and operating-system speech voice inventory and pronunciation remain external constraints; speech stays on device and fails softly when unavailable. The next step is independent release verification of commit `cc5a042` plus this handoff.
