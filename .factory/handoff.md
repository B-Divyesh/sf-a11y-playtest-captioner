# A11y Playtest Captioner — build handoff

Repaired 2026-08-28 for work order `a11y-playtest-captioner-repair-1`, based on candidate `eb54ad5a534af407ed4cc2a28cb9380fac9a8b72`.

## What shipped

- A zero-dependency TypeScript library at version `0.1.0`, emitted as ESM, CommonJS, source maps, and declarations in `dist/lib`.
- Public API for validated localized state registration, activation, deterministic locale fallback, authored focus order, subscriptions, a managed live region, review keyboard controls, and on-device speech synthesis.
- A responsive local-first authoring site with state and language editing, ordered actionable cues, keyboard/speech rehearsal, sample data, autosave, import/export, validation, destructive-action undo, connection state, and actionable empty/error states.
- Offline support that precaches the three pages, hashed JS/CSS, self-hosted fonts, and both responsive hero images; an automated browser test proves a full offline reload.
- Deterministic offline updates: each build derives a new cache identifier from the shell contents, bypasses an older worker while staging its replacement cache, and matches same-origin precache entries despite Vite's `Vary: Origin` module responses. This prevents a cached old HTML shell from pointing at missing new modules after an update.
- Regression coverage waits for the activated worker that owns the current release cache before network emulation, permits only browser-generated disconnected-resource console messages during that exact phase, and proves the offline-reloaded workspace can add a local state.
- Product-specific luminous glass visual system, self-hosted Atkinson Hyperlegible, original generated art, privacy and terms pages, CSP/caching headers, robots and sitemap files, README/API usage, changelog, and MIT license.

## Run and verify

```sh
npm install
npm test
npm run build
npm pack --dry-run
```

The exact deploy build command is `npm run build`. Static hosting must publish `dist/site`; `dist/site/index.html` is present at that root. The factory owns npm publishing; the ready-to-publish package can be checked with `npm pack --dry-run`.

Verification completed locally:

- `npm ci && npm test`: pass — 5 unit tests plus 9 passing Chromium desktop/mobile checks (1 intentionally skipped desktop-only duplicate) covering authoring, persistence, keyboard rehearsal, export, undo, axe, 390px overflow, console errors, deterministic service-worker control, offline reload, offline status, and disconnected local authoring.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass (the exact clean deploy build); reproducibly creates `dist/lib` and `dist/site`.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`: HTTP 200, title and `lang`, exactly one `h1`, main landmark, all image alt text and button labels present, no console errors; local production-preview load 678ms. `/privacy/` and `/terms/` each returned HTTP 200.
- `npm audit`: 0 vulnerabilities.
- `npm pack --dry-run`: 12 files, 16.7 KB packed / 66.8 KB unpacked.
- Axe browser scan: no serious or critical violations at desktop or 390px.

## Lighthouse-class measurements

Mobile Lighthouse 12.8.2 against the local production preview:

| Category / metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.5s |
| CLS | 0.073 |

Production budgets: initial site JS 22.42 KB (8.00 KB gzip), CSS 19.59 KB (4.99 KB gzip), bundled fonts 63.13 KB total, responsive hero 14.73 KB / 47.03 KB. All are below the work-order limits.

## Asset provenance

`site/public/hero-caption-landscape.webp` was generated for this product with `/opt/fleet/lib/gen-image.sh` using the factory image deployment, then resized and converted locally to responsive WebP variants. The exact prompt, purpose, palette, motion policy, and license note are recorded in `.factory/design.md`.

## Known gaps and next steps

- Speech voice inventory and pronunciation depend on the user’s browser/operating system; the site reports when speech synthesis is unavailable.
- The product intentionally does not perform OCR, generate descriptions, certify conformance, or replace disabled playtesters.
- A useful next step is a pilot with one browser game: author ten critical states, time the workflow, then run the scripted-state identification measure with keyboard-only disabled reviewers.
