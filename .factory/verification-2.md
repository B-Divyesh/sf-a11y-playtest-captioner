# Independent verification 2 — FAIL

**Work order:** `a11y-playtest-captioner-verify-2`  
**Candidate:** `2debf388c786ca1050d9d456fde9744b53d0905b` (`main`)  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Artifact:** npm library plus static local-first/PWA workspace

## Decision

**FAIL.** The candidate builds, its existing automated suite passes, the prior invalid-locale and host-policy defects are repaired, and the live public files match the candidate. Fresh end-to-end testing nevertheless found two high-severity failures in acceptance-critical workflows:

1. A keyboard-only author cannot advance beyond **State name** because blur replaces the focused editor and resets focus to the document body.
2. The packed library assigns a Spanish speech language to English fallback cue text, violating the explicit requirement that spoken localized strings retain the correct language tag.

The published manifest also incorrectly adds 39 runtime dependencies to a library advertised as zero-dependency, and enabled mobile reorder controls are less than half the required touch-target dimensions.

## Reproducible defects

### High — keyboard-only authoring loops between State name and the document body

1. In a fresh browser, activate **Add first state**.
2. Type `Gate warning` in **State name**.
3. Press Tab.

Observed: focus becomes `<body>`, not **State ID**. Pressing Tab again returns to the newly rendered **State name** field. Pressing Tab from that field resets focus to `<body>` again. A 30-Tab trace alternated between `state-name` and `<body>` and never reached `state-id`.

The value saves, but the blur handler synchronously re-renders and replaces the editor. A keyboard-only author cannot continue through ID, localized description, language, or action fields without changing input modality. This is a direct failure of the required keyboard workflow and affects every newly named state.

The repository's passing E2E test does not catch this: it uses locator-driven focus/fill operations and never asserts that the edited ID persisted or that natural Tab order advanced.

### High — English fallback cue text is spoken with a Spanish language tag

This was reproduced from the packed artifact in a clean browser consumer using accepted public API input:

```js
createCaptioner({
  locale: "es-MX",
  fallbackLocale: "en",
  states: [{
    id: "gate",
    name: "Gate",
    descriptions: { es: "La puerta está cerrada.", en: "The gate is closed." },
    focusOrder: [{
      id: "lever",
      labels: { en: "Lever" },
      descriptions: { en: "Press E." }
    }]
  }]
});
```

After activation and `moveFocus("next")`, the snapshot correctly falls back to the English cue `Lever / Press E.` while retaining the state's `resolvedLocale: "es"`. `speak()` then produces:

```json
{ "text": "Lever. Press E. 1 of 1.", "lang": "es" }
```

The API permits cue locale sets to differ from state-description locale sets and exposes locale fallback as a feature. Speaking fallback English with a Spanish voice/language is therefore a product defect, not rejected input. It conflicts with the brief's language-tag constraint and the core multilingual review job.

### Medium — the supposedly zero-dependency npm package installs 39 runtime dependencies

The site says **Zero dependencies**, the README calls the library zero-dependency, and the compiled library is self-contained. The packed `package.json` nevertheless declares 39 production dependencies, including `playwright`, `playwright-core`, `vite-node`, `axe-core`, Chai internals, Rollup internals, and other test/build tooling.

Installing the 17.3 kB tarball into an empty consumer produced:

- 46 installed top-level package directories;
- 46 MB under `node_modules`;
- 39 declared runtime dependencies;
- no runtime vulnerability finding at verification time.

ESM and CommonJS imports still work, but this is a material supply-chain, install-size, and product-claim regression in the primary `library-npm` artifact. The lockfile's root record also has no `dependencies` section, so it does not accurately describe the publish manifest.

### Medium — enabled mobile reorder controls are about 19.5 × 26 px

At 390 × 844 after loading the example project, the enabled **Move Loose rope later** and **Move Anchor post earlier** controls measured about `19.5 × 26` CSS px. Their adjacent arrow controls use a 3 px gap. The disabled companion arrows have the same size. These fail the required 44 × 44 px target and 8 px adjacent spacing.

Two additional controls were shorter than 44 px in the same rendered page: toast **Undo** was `51 × 40`, and **Copy command** was `98.7 × 36`. The tiny reorder arrows are the material issue because they are the only direct way to edit authored focus order on touch.

### Low — stale `mount()` cleanup removes the current live region

In the packed browser consumer:

1. `unmount1 = captioner.mount(firstCanvas)`
2. `unmount2 = captioner.mount(secondCanvas)`
3. Confirm one current managed live region exists.
4. Call the stale `unmount1()` cleanup.

Observed: the live-region count drops from 1 to 0, removing the second/current mount. Cleanup closures share the mutable current-region reference rather than owning the region created by that call. This can break component remount/HMR integrations.

## Clean checkout and repository gates

The candidate was checked out detached into `/tmp/a11y-captioner-qa.7AOHx8`; it began clean at the exact SHA.

| Check | Result |
| --- | --- |
| Node / npm | `v22.23.2` / `10.9.8` |
| `npm ci` | PASS — 62 packages, 0 audit findings |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; currently an alias of `tsc --noEmit` rather than a separate linter |
| `npm test` | PASS — 6/6 Vitest tests; 11 Playwright tests passed, 1 intentionally skipped |
| `npm run build` | PASS — exact production build emitted `dist/lib` and `dist/site` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm pack --dry-run` / `npm pack` | PASS — 12 files, 17,319 B packed / 68,414 B unpacked |
| Worktree after gates | No tracked changes |

The existing browser suite covers locale-form recovery on desktop/mobile, ordinary authoring, export/undo, axe, 390 px overflow, and offline reload. Its locale regression now passes.

## Packed-library consumer evidence

The tarball was installed with scripts disabled into a new empty npm consumer at `/tmp/a11y-captioner-consumer-clean.wkPcUl`.

- ESM: PASS for activation, `es-MX` → `es` fallback, first/last/wrapping cue navigation, unavailable Node speech, invalid locale then valid recovery, and post-destroy errors.
- CommonJS: PASS for registration, empty focus order, invalid ID then valid registration recovery, and activation.
- Browser ESM from the installed package: PASS for managed `role=status` live region, adjacent mounting, resolved `lang=es`, keyboard cue navigation, editable-input key suppression, and on-device speech invocation.
- Negative browser cases exposed the fallback speech-language and stale-unmount defects above.

## Live end-to-end evidence

### Authoring, recovery, and persistence

With pointer-assisted focus used to get past the keyboard blocker, a fresh live session passed:

- invalid state ID `bad id` → actionable validation → valid `gate-warning` recovery;
- invalid language `!!` → keyboard correction to `es-MX` → successful locale creation;
- English and Spanish state descriptions plus an action label/hint;
- blank action → blocked export with an actionable `non-blank` message → completed fields → successful JSON download;
- malformed JSON import → `Import failed` message;
- valid bilingual 10-state project import and local persistence;
- ArrowRight/Home/End review and `S` speech status.

The live page stored only `a11y-playtest-captioner:project:v1` in localStorage. There were no cookies. Captured runtime traffic, including after authoring and speech, used only `https://a11y-playtest-captioner.sociobot.in`, and all observed methods were GET.

### Accessibility and responsive behavior

- `/opt/fleet/lib/verify-url.sh`: PASS in 759 ms; title, `lang=en`, one `h1`, main landmark, image alt text, button labels, and zero console errors.
- Axe on the authored home page: 0 serious/critical on desktop and 390 px mobile. The only mobile finding was moderate `landmark-complementary-is-top-level`.
- Axe on `/privacy/` and `/terms/`: no findings.
- 390 px width: `scrollWidth=390`, `clientWidth=390`; no document overflow.
- 640 px reflow check (equivalent CSS width for 200% zoom at 1280 px): no document overflow; workspace and Export remained available.
- Reduced motion: media query matched, root scrolling became `auto`, and animation/transition durations were `0.00001s`.
- Visible focus: skip link showed the designed 3 px cyan outline; the rehearsal monitor also had a visible cyan focus ring. The State-name focus-destruction defect and touch-target failures remain.
- No console errors, page errors, failed online requests, or HTTP error responses were observed in fresh desktop/mobile runs.

### Service worker and offline

The live worker was active and controlling the page. Its declared cache and actual cache were both `a11y-captioner-bcb0d1d6ef75`. `registration.update()` completed with no waiting or installing replacement, the worker reported the same build cache, and an offline reload restored the persisted 10-state project with the offline status visible.

### Response policies and caching

- HTTP redirects to HTTPS with 301.
- `/`, `/privacy/`, `/terms/`, `/sw.js`, hashed assets, hero images, and `robots.txt` returned 200.
- Live responses include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and the candidate CSP.
- Hashed JS/CSS and both hero image routes use `Cache-Control: public, max-age=31536000, immutable`.
- The HTML shell and service worker use 30-second revalidation. A conditional hashed-JS request returned 304.
- TLS certificate covered the product hostname and was valid from 2026-08-28 through 2027-02-28.

The prior host-policy defect is repaired.

### Deployment identity

Every publicly served candidate build file was downloaded and SHA-256 compared with the exact local `dist/site` output. **17/17 files matched, 0 mismatched**, including HTML pages, JS/CSS/font assets, both hero images, favicon, robots, sitemap, and service worker. `_headers` and `staticwebapp.config.json` are deployment control files and were not treated as public artifacts.

The live deployment therefore matches candidate `2debf388c786ca1050d9d456fde9744b53d0905b` at the content level.

## Performance and bundle evidence

| Budget / metric | Result |
| --- | ---: |
| Built initial JS | 23,225 B uncompressed; 8,590 B transferred in Lighthouse |
| Built CSS | 19,590 B uncompressed; 5,281 B transferred |
| Browser-used WOFF2 fonts | 34,800 B |
| All emitted font formats | 63,132 B |
| Hero variants | 14,726 B / 47,032 B |
| Lighthouse total transfer | about 99.4 kB |
| Lighthouse LCP, 3 runs | 1.37 s / 1.38 s / 1.22 s |
| Lighthouse CLS | 0.079 |

All static bundle budgets pass. Three fresh Lighthouse 12.8.2 mobile runs scored Performance **86, 98, 91** (median **91**), with Accessibility **100**, Best Practices **100**, and SEO **100** on every run. The first run's 86 came from 499.5 ms TBT dominated by unattributable tasks; subsequent TBT was 92 ms and 335.5 ms. The median clears the required threshold, but performance was not perfectly stable in this container.

## Required resolution before PASS

1. Preserve sequential keyboard focus when the state name and state ID save/re-render; add a real Tab-order regression that reaches the description and action controls without pointer or programmatic focus.
2. Track the resolved locale of the active cue and apply the matching language to cue live-region/speech output (or reject cross-locale fallback rather than mis-tagging it); add a packed-browser regression.
3. Remove the 39 accidental runtime dependencies and regenerate the lockfile; confirm an empty consumer installs only the library.
4. Increase enabled reorder targets to at least 44 × 44 CSS px with at least 8 px separation, and bring the remaining short controls up to target size.
5. Bind each `mount()` cleanup to the region created by that call so stale cleanup cannot remove a newer mount.

