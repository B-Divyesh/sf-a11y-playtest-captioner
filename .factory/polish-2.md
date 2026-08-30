# Polish 2 — cumulative review resolution

**Base:** `03333e4584c531ba28af434f8576ce3113ca49f8` and [review-2.md](./review-2.md)  
**Repair:** `6e39fb8bb65954fddd0092329fbe6dc2ad24e7a1`  
**Deployment:** `4cb0d9c3-0a68-44a4-afa4-2ab7cecb15d2`  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>

All review and prior polish files were read. The table includes prior findings so the accepted state is auditable as one cumulative repair.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the compact mobile hero and added a fresh live measurement. | `keeps all three first-screen facts visible at 390px`; live bottoms are 467.375, 485.969, and 504.563 px in [live-regression.json](/tmp/a11y-captioner-polish2-live.yXd4pL/live-regression.json). Screenshot: `/tmp/a11y-captioner-polish2-live.yXd4pL/live-home.png`. |
| F-1-2 | Added the shared `prepareRouteFocus()` handoff and used it for **Start for real** before full-document navigation. | `moves focus and announces home after leaving the demo`; live mobile exit focuses `#hero-title` and announces the home title in `live-regression.json`. |
| F-1-3 | Added `demo-seed`, `import-local`, and `validation-errors`; expanded the library lifecycle test to prove live announcement, keyboard review, speech invocation, and cleanup; removed unprovable on-device wording. | Every one of 13 exact `.factory/claims.json` commands passed from clean clone `/tmp/a11y-captioner-clean.NMgb1M`; tagged tests include `@claim:demo-seed`, `@claim:import-local`, `@claim:library-api`, and `@claim:validation-errors`. |
| F-1-4 | Kept the earlier plain-language labels and rewrote remaining README terminology: language tags, screen-reader status message, captions/actions, and browser speech. Updated the copy audit and terminology table. | `.factory/copy-audit.md`; `npm test` passes. |
| F-2-1 | `/demo` now suppresses marketing sections, gives the non-covering sticky demo controls a layout slot, and opens on a real populated workspace summary with Ravine crossing, its caption, and **Speak this caption**. | `@claim:demo-seed` in both projects; live first-view bottoms: state 344.625, control 412.266, caption 466.422 px ≤ 844. Screenshot: `/tmp/a11y-captioner-polish2-live.yXd4pL/live-demo-mobile-first-view.png`; <https://a11y-playtest-captioner.sociobot.in/demo>. |
| F-2-2 | The build now emits `/demo/index.html` with static Demo title, canonical, description, OG, and Twitter fields; the host rewrites `/demo` to that document. Runtime updates those fields too for `?demo=1`. | `tests/site-build-surface.mjs`; live raw `/demo` contains all fields and `live-regression.json` records title/OG/Twitter true. |
| F-2-3 | Standardized the visible product language to captions and actions, replaced the unsupported state-order figure caption, and removed unexplained language-tag and polite-announcement wording. | `.factory/copy-audit.md`; `npm test` passes; live home and demo screenshots above. |

## Verification

- Fresh clone `/tmp/a11y-captioner-clean.NMgb1M`: `npm ci`, every declared claim command independently, `npm test`, `npm run build`, and `npm pack --dry-run` passed. The full suite has 16 unit/static tests, a packed consumer test, 22 claim-browser checks, and 32 workspace-browser checks across desktop and 390 px mobile.
- `npm run build` emits `dist/lib` and `dist/site`; build-surface verification proves the static demo metadata and exactly one demo `h1`.
- Live `verify-url.sh` passed for `/` and `/demo`; screenshots and JSON evidence are under `/tmp/a11y-captioner-polish2-live.yXd4pL`.
- Live Playwright AxeBuilder found zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404. Lighthouse mobile scored Performance 1.0 and Accessibility 1.0, with 1.35 s LCP and CLS 0 (`lighthouse-home.json`).
- Live headers include CSP, `frame-ancestors 'none'`, no-referrer policy, permissions policy, and immutable hashed-asset caching. All 19 public production files SHA-256 match `dist/site`.

No known product gaps remain.
