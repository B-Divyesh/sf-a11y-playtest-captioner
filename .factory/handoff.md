# A11y Playtest Captioner — independent verification 4 handoff

## Release status: FAIL

Candidate `1616dbd0f454316d6d6a7b6acd5d699ad2f8d950` at <https://a11y-playtest-captioner.sociobot.in/> is **not releasable**. Fresh verification on 2026-08-30 found no deployment-only failure: all 17 deployable files match the candidate build. The release fails the mandatory claims and demo gates, and its packed declarations break standard NodeNext TypeScript consumers.

Full evidence and reproducible defects are in [`.factory/verification-4.md`](./verification-4.md).

## Release blockers

1. `.factory/claims.json` is missing. No required claim tests could run, while the site and README make privacy, offline, dependency, and telemetry claims.
2. The first screen does not plainly name browser-game creators and has no **Try it with sample data** action. `/demo` and `?demo=1` are ordinary empty workspaces with no isolated namespace, persistent banner, reset, or exit. The below-fold sample loader writes the real draft key.
3. The packed `dist/lib/index.d.ts` uses extensionless `./types` imports. A clean strict TypeScript 5.9.2 NodeNext consumer fails with TS2834.

Additional findings: unknown routes return landing HTML with 200; canonical/social/apple metadata and footer build identity are missing; the home title is 65 characters; desktop **Add action** is about 42.8px high; `.factory/demo.md` and `.factory/copy-audit.md` are absent.

## Passing evidence

- Clean install, typecheck, lint, unit/integration tests, production build, audit, and package creation pass.
- `npm test`: 9/9 Vitest; 17 Playwright passes with 3 intentional project-specific skips.
- Packed ESM, CommonJS, and Chromium runtime consumers pass; only clean NodeNext type checking fails.
- Live sample load, multilingual keyboard review, invalid locale/import recovery, 10-state boundary authoring, duplicate-ID recovery, export/import, and persistence pass.
- Desktop and 390px axe: 0 violations. Factory URL verification passes with no console errors. Mobile has no horizontal overflow; reduced motion is applied.
- Privacy flow: zero cross-origin requests, zero cookies, one namespaced project key, self-hosted assets, and no network request for speech.
- PWA update/offline reload passes with sole cache `a11y-captioner-42f83e257193` and both sample states restored.
- Production identity: 17/17 public files match local SHA-256. Security and caching headers are present.
- Lighthouse mobile: Performance 93, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4s, CLS 0.079, transfer 97 KiB.

## How to reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
npm pack
```

For the typed-package blocker, install the tarball in an empty consumer and compile an import with TypeScript 5.9 using `module` and `moduleResolution` set to `NodeNext`; `dist/lib/index.d.ts` reports TS2834 on both `./types` specifiers.

## Required next work

Implement the claims registry/tests and isolated first-screen demo first. Then repair NodeNext declarations, add a real 404 and required metadata/build identity, raise the small desktop target, and add demo/copy audit documentation. Re-run every claim command before ordinary tests. Do not publish the package until a new independent verification passes.
