# A11y Playtest Captioner — polish 2 handoff

## Status: PASS

Repair commit: `6e39fb8bb65954fddd0092329fbe6dc2ad24e7a1`
Deployment: `4cb0d9c3-0a68-44a4-afa4-2ab7cecb15d2`
Live: <https://a11y-playtest-captioner.sociobot.in/>

All cumulative findings in [polish-2.md](./polish-2.md) are resolved. `/demo` is now a product-first isolated sample view, programmatic demo exit restores and announces focus, claims have exact tagged evidence, the demo has static social metadata, and copy uses consistent captions/actions language.

## Exact verification evidence

- Clean clone: `/tmp/a11y-captioner-clean.NMgb1M` from repair commit; `npm ci` passed.
- Every one of the 13 exact commands in `.factory/claims.json` passed independently in that clone.
- Full clean-clone `npm test` passed: 16 unit/static tests, packed ESM/CJS consumer check, 22 browser claim checks, and 32 workspace checks across desktop and 390 × 844 mobile. `npm run build` created `dist/lib` and `dist/site`; `npm pack --dry-run` created the 12-file, 17.6 kB package.
- Live `verify-url.sh` passed for home and demo. Fresh live AxeBuilder found zero violations on home, demo, Privacy, Terms, and 404. Lighthouse mobile: Performance 1.0, Accessibility 1.0, LCP 1.35 s, CLS 0.
- Live first-screen proof: `/tmp/a11y-captioner-polish2-live.yXd4pL/live-demo-mobile-first-view.png`; structured checks and route focus result: `/tmp/a11y-captioner-polish2-live.yXd4pL/live-regression.json`.
- All 19 public files match the deployed `dist/site` byte-for-byte. Live CSP, no-referrer, permissions policy, and immutable hashed-asset cache headers are present.

## Run locally

```sh
npm ci
npm test
npm run build
npm pack --dry-run
```

Deploy `dist/site` as the static site. Do not publish the npm package from this checkout; the factory owns registry credentials.

## Known gaps

None.
