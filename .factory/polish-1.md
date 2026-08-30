# Polish 1 — review finding resolution

**Base review:** [review-1.md](./review-1.md), commit `934be93f0d1d4c1ba2a6a4df89616a664783bd57`  
**Product repair:** `e531d46553def479ce51ae3764aa2d4601760f25`  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>

All available `.factory/review-*.md` and `.factory/polish-*.md` files were read. `review-1.md` is the only review and there was no earlier polish file. The historical `verification*.md` reports were also read; their earlier defects remain covered by their existing tests and this repair adds no regression.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Tightened the 390px hero rhythm, reduced its mobile title scale, and deferred secondary hero links so the three required facts precede the art. | `keeps all three first-screen facts visible at 390px` passes in `npm test`; live fresh-browser measurement: 467.375px, 485.969px, 504.563px ≤ 844px. Screenshot: `/tmp/a11y-captioner-live.ZCOkWS/cold-mobile.png`; <https://a11y-playtest-captioner.sociobot.in/>. |
| F-1-2 | Added `site/route-context.ts`. It installs a polite route announcement and focuses each destination `h1` after same-origin navigation or Back/Forward, with `preventScroll` to preserve browser restoration. | `moves focus and announces the destination on document route changes` passes. Fresh live Home → Privacy → Back: both focus checks are true and announce the destination title; <https://a11y-playtest-captioner.sociobot.in/privacy/>. |
| F-1-3 | Registered the remaining observable promises in ten total claims. Added tagged browser-storage and library-language/live-region/API tests. README and landing wording now points to their precise registry claim. | Every exact `claims.json` command passed from fresh clone `/tmp/a11y-captioner-clean.5J0bbb`; `npm test` result is passed. Live `/demo` confirms the isolated Signal Hollow banner and sample; <https://a11y-playtest-captioner.sociobot.in/demo>. |
| F-1-4 | Split dense README copy, rewrote labels in plain words, replaced **STATE / SIGNAL MAP**, replaced context-free headings, and renamed **Add** to **Add language**. Updated `.factory/copy-audit.md` with README and landing inventory. | `npm test` passes copy/static and browser checks. Live screenshot and HTML show **Caption state map**, **Write captions**, **Test action order**, and **Add language**; <https://a11y-playtest-captioner.sociobot.in/>. |

## Live evidence

Deployment `72577c28-640d-456d-ab86-cb87241f3330` completed through the work-order static deployment configuration. `/opt/fleet/lib/verify-url.sh` reports HTTP 200, no browser console errors, one `h1`, `<main>`, `lang=en`, title, and image/button checks. Playwright AxeBuilder reports no live violations. Evidence directory: `/tmp/a11y-captioner-live.ZCOkWS`.
