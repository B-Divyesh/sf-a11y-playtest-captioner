# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-30 UTC  
**Live URL:** https://a11y-playtest-captioner.sociobot.in  
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900

## Verdict

**FAIL.** The main job is clear, the demo is real and isolated, every declared claim test passes, and earlier functional defects are repaired. Four minor findings remain. The owner’s stated standard is zero findings, so this is not a PASS.

## Cold first read

Before scrolling, at both sizes, I understood the product as: a browser-game creator writes captions for important visual game states and checks their action order with a keyboard before disabled playtesting. It is for browser-game creators preparing accessible playtests. I should click **“Try it with sample data”** first.

The words that made this clear were **“Caption game states before playtests”**, **“For browser-game creators who need multilingual descriptions and keyboard rehearsal before inviting disabled playtesters.”**, and **“Try it with sample data”**. This gate passes.

The 390 px first screen shows the headline, lede, primary action, and its result note. It does not show all three required fact lines before scrolling; see F-1-1.

## Findings

### F-1-1 — Minor — Mobile first screen hides two of the three required facts

**Location / evidence:** live `/` at 390 × 844. The initial viewport ends midway through **“Private: sample data never changes your real draft.”** The required **“Offline: works after the first visit.”** and **“Free: no account or payment.”** lines are below the fold. The cause is the mobile hero’s large heading and vertical action layout (`site/styles.css`, mobile rules).

**Why this matters:** the plain-words first-screen contract requires the privacy, offline, and price facts as three short lines. A phone visitor does not receive that compact decision information on the first screen, despite the desktop layout meeting it.

**Concrete fix:** keep the three fact lines in the initial 390 × 844 viewport. For example, reduce the mobile hero top/bottom padding and heading size enough to reserve 54 px for the facts, or place the three facts directly below the primary action in a compact three-item row/list. Add a 390 × 844 first-screen assertion that all three fact strings have bounding boxes within the viewport.

### F-1-2 — Minor — Route changes leave keyboard and screen-reader context on the document body

**Location / evidence:** live `/` → header **Privacy** → `/privacy/`, then browser Back. In a fresh desktop context, `document.activeElement` was `BODY` after the Privacy navigation and again after Back; the destination page had zero `[aria-live]` regions. The site uses ordinary document navigations and has no route-focus code. This fails the required route-change focus and announcement behavior.

**Why this matters:** a keyboard or screen-reader visitor who follows Privacy, Terms, Demo, or Back is not placed at the new page’s subject. They must restart navigation from the top and get no programmatic confirmation of the new route.

**Concrete fix:** on each destination page, move focus to its `<h1 tabindex="-1">` after navigation and announce the new page title in a polite live region; preserve/restores meaningful focus and scroll on Back/Forward. Add a browser regression for Home → Privacy → Back that asserts focus reaches the appropriate `h1` (or explicitly documented equivalent) and that the announcement changes.

### F-1-3 — Minor — Claim-like statements in the landing page and README are not all registered in `.factory/claims.json`

**Location / exact quotes:**

- Landing workspace: **“Drafts save in this browser.”**
- Landing library section: **“Register authored states, activate them from your game loop, and reuse the JSON you rehearsed here.”**
- README line 53: **“All localized strings are keyed by valid BCP 47 language tags.”**
- README line 53: **“State and cue fallbacks resolve independently, and an active cue exposes its own `resolvedLocale` so its live-region and speech language tag always match the cue text.”**
- README line 53: **“`mount()` adds a visually hidden polite live region next to the supplied game element; pass `{ liveRegion: false }` if the game already owns announcements.”**
- README line 72: **“The live site … lets you create states, add language variants and ordered cues, rehearse by keyboard, and export project JSON.”**
- README line 74: **“The demo opens the two-state Signal Hollow sample in a separate browser-storage namespace.”**
- README line 99: **“Projects are stored in the current browser unless exported.”**
- README Public API bullets (for example, **“`createCaptioner(options)` creates an isolated captioner.”** and **“`speak()` reads the current state and cue with on-device browser speech.”**) are additional observable API promises without registry entries.

The six registry entries cover isolation, offline reload, no product-service transmission, free demo, author/rehearsal, and JSON export. They do not name or test the additional promises above. Some are likely already covered incidentally by unit/E2E tests; that is not a registered observable claim test as required.

**Why this matters:** a visitor can rely on these behavior and privacy statements, but the published claims registry does not make each one independently auditable from the stated sandbox.

**Concrete fix:** either remove/qualify the statements so they are not promises, or add one narrowly worded registry entry and tagged observable test for each distinct promise. For example: a demo test for browser storage persistence and language-tag rejection/recovery; a packed-browser playground test for cue fallback language and `mount()` behavior. Align each sentence with the precise registered claim rather than relying on broad adjacent claims.

### F-1-4 — Minor — README copy contains overlong, jargon-heavy sentences; one landing label is decorative jargon

**Location / exact quotes:**

- README line 53, 26 words: **“State and cue fallbacks resolve independently, and an active cue exposes its own `resolvedLocale` so its live-region and speech language tag always match the cue text.”** It exceeds 22 words, combines several ideas, and uses unexplained implementation terms.
- README line 53, 21 words: **“`mount()` adds a visually hidden polite live region next to the supplied game element; pass `{ liveRegion: false }` if the game already owns announcements.”** It combines implementation jargon without a plain-language explanation.
- README line 91, 24 words: **“`npm run build` emits ESM, CommonJS, and TypeScript declarations under `dist/lib`, plus the deployable documentation site under `dist/site` with `index.html` at that root.”** It exceeds 22 words and combines two outputs.
- README line 95, 29 words: **“For the factory’s Azure Static Web Apps deployment, the included `staticwebapp.config.json` applies content-security, permissions, referrer, cache, `/demo`, and styled 404 response policies; `_headers` mirrors applicable headers for compatible static hosts.”** It exceeds 22 words and is difficult to scan.
- Landing hero figure caption: **“STATE / SIGNAL MAP.”** This is a metaphorical decorative label rather than a section name a first-time visitor can use.
- Landing heading list includes **“Author”** and **“Rehearse”**, which are not independently meaningful headings in a screen-reader heading list.
- The visible language-form button is only **“Add”**. It does not name its result when read outside the nearby field.

**Why this matters:** the README is part of the first-use path for a library. Dense implementation language makes an otherwise clear product harder to understand; the landing labels do not meet the stated plain-words heading standard.

**Concrete fix:** split and rewrite. For example: “Each state and action can use its own fallback language. The spoken language always matches the text being read.” “`mount()` adds a hidden announcement near your canvas. Use `{ liveRegion: false }` when your game already announces changes.” “`npm run build` writes the library to `dist/lib`. It writes the site to `dist/site`.” Replace **“STATE / SIGNAL MAP”** with **“Caption state map”** or remove it; replace **“Author”** with **“Write captions”** and **“Rehearse”** with **“Test action order.”**
Rename **“Add”** to **“Add language.”**

## Demo and sandbox verification

This gate passes. A fresh 390 px visitor clicked **Try it with sample data** once and reached `/demo` with the realistic two-state Signal Hollow project already shown (Ravine crossing and Watcher alert). The persistent banner said **“Demo — sample data, nothing is saved to your real draft.”** and supplied **Reset demo** and **Start for real**.

Editing a sample description wrote only `demo:a11y-playtest-captioner:project:v1`. **Reset demo** restored the original description. **Start for real** removed demo storage, returned to `/`, and showed an empty ordinary workspace. The observed demo flow made only same-origin requests. This confirms that the demo does not touch the real-storage key in the exercised flow.

## Claims verification

All exact commands declared in `.factory/claims.json` were run after `npm ci`, each in its own command, and passed in the configured desktop and mobile projects:

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS — 2/2 |
| `offline-reload` | PASS — 2/2 |
| `local-only` | PASS — 2/2 |
| `free-demo` | PASS — 2/2 |
| `author-review` | PASS — 2/2 |
| `json-export` | PASS — 2/2 |

`npm test` also passed: 12 unit/static tests, the packed consumer test, 16 claim-browser tests, and the workspace suite (`test-results/.last-run.json` reports `passed`). No declared claim test failed. F-1-3 concerns unregistered additional promises, not a failed declared test.

## Copy audit

The following inventory covers every prose sentence and text heading on the initial landing state and README. Code examples, navigation repetition, URLs, and API identifiers inside code blocks are excluded; implementation bullets are included only where they are prose. Counts use whitespace-separated words. `*` marks a finding under F-1-4; `†` marks an unlisted promise under F-1-3.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| For browser-game creators | 3 | Pass |
| Caption game states before playtests | 5 | Pass |
| For browser-game creators who need multilingual descriptions and keyboard rehearsal before inviting disabled playtesters. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Loads a two-state sample in a private demo. | 9 | Pass |
| Open the workspace | 3 | Pass |
| Use the library | 3 | Pass |
| Private: sample data never changes your real draft. | 8 | Registered claim |
| Offline: works after the first visit. | 6 | Registered claim |
| Free: no account or payment. | 5 | Registered claim |
| STATE / SIGNAL MAP | 3 | * Decorative/mood label |
| Author states in deliberate order | 5 | Pass |
| Local workspace | 2 | Pass |
| Author game-state captions | 3 | Pass |
| Drafts save in this browser. | 5 | † Unlisted claim |
| Export JSON to move them into your game. | 9 | Covered by JSON export claim |
| States | 1 | Pass |
| No states yet. | 3 | Pass |
| Add the first critical moment. | 5 | Pass |
| Author | 1 | * Context-free heading |
| Stored locally | 2 | Pass |
| Map your first critical moment | 5 | Pass |
| Start with a state where the objective or available action is only visible on the game canvas. | 16 | Pass |
| Rehearse | 1 | * Context-free heading |
| On device | 2 | Pass |
| Preview waiting | 2 | Pass |
| Choose a state to test its description and action order. | 10 | Pass |
| Ready offline after first visit | 5 | Registered claim |
| TypeScript library | 2 | Pass |
| Use caption states in your game | 6 | Pass |
| Register authored states, activate them from your game loop, and reuse the JSON you rehearsed here. | 16 | † Unlisted claim |
| Product boundaries | 2 | Pass |
| What this tool does not do | 6 | Pass |
| This helps teams make intentional game state available for review. | 10 | Pass |
| It does not replace disabled playtesters, accessibility audits, or the judgment needed to write useful descriptions. | 16 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| A TypeScript library and local authoring workspace for browser-game creators who need localized captions for important visual game states. | 19 | Pass |
| Author localized captions and rehearse the action order with a keyboard. | 10 | Registered claim |
| It does not inspect a canvas, generate descriptions, or certify accessibility. | 10 | Pass |
| Authors decide what matters; the library provides predictable state, focus-order, keyboard, live-region, and on-device speech hooks for testing with disabled players. | 20 | Jargon; split recommended |
| All localized strings are keyed by valid BCP 47 language tags. | 10 | † Unlisted claim; jargon |
| State and cue fallbacks resolve independently, and an active cue exposes its own `resolvedLocale` so its live-region and speech language tag always match the cue text. | 26 | * † Over 22 / jargon / unlisted |
| Speech uses the browser’s `speechSynthesis` API; project content and speech text are not sent to a product service. | 18 | Registered privacy claim; jargon can be simplified |
| `mount()` adds a visually hidden polite live region next to the supplied game element; pass `{ liveRegion: false }` if the game already owns announcements. | 21 | * † Jargon / unlisted |
| `createCaptioner(options)` creates an isolated captioner. | 4 | † Unlisted API promise |
| `register(state)` / `registerMany(states)` validates and adds authored states. | 6 | † Unlisted API promise |
| `activate(id)` selects a state and announces its description. | 7 | † Unlisted API promise |
| `setLocale(tag)` selects the best available language with deterministic fallback. | 8 | † Unlisted API promise |
| `moveFocus(direction)` follows the authored cue order. | 5 | † Unlisted API promise |
| `speak()` reads the current state and cue with on-device browser speech. | 9 | † Unlisted API promise |
| `mount(element, options?)` manages a live region adjacent to the game. | 7 | † Unlisted API promise |
| `connectKeyboard(target?)` enables the documented review keys and returns a cleanup function. | 10 | † Unlisted API promise |
| `getSnapshot()` and `subscribe(listener)` expose immutable state. | 6 | † Unlisted API promise |
| `destroy()` removes listeners, speech, and generated DOM. | 6 | † Unlisted API promise |
| See the exported TypeScript types for the complete contract. | 9 | Pass |
| Invalid IDs, language tags, duplicate state/cue IDs, and blank descriptions throw `CaptionerValidationError` with actionable messages. | 14 | Pass |
| The live site lets you create states, add language variants and ordered cues, rehearse by keyboard, and export project JSON. | 20 | † Unlisted composite claim |
| Try it immediately at the `/demo` URL. | 7 | Pass |
| The demo opens the two-state Signal Hollow sample in a separate browser-storage namespace. | 13 | † Unlisted claim |
| Sample data never changes your real draft. | 8 | Registered claim |
| Free: no account or payment is needed to use the demo. | 10 | Registered claim |
| Choose Start for real to discard its demo data and open an empty local workspace. | 14 | Covered by isolation behavior |
| The workspace works offline after the first visit. | 8 | Registered claim |
| Open the printed local URL. | 5 | Pass |
| The demo makes no cross-origin product requests while you author or use browser speech. | 13 | Registered privacy claim |
| `npm test` includes a packed, strict NodeNext TypeScript consumer and all claim checks. | 12 | Implementation statement; add test reference or simplify |
| `npm run build` emits ESM, CommonJS, and TypeScript declarations under `dist/lib`, plus the deployable documentation site under `dist/site` with `index.html` at that root. | 24 | * Over 22 / two ideas |
| Deploy `dist/site` as a static site. | 5 | Pass |
| For the factory’s Azure Static Web Apps deployment, the included `staticwebapp.config.json` applies content-security, permissions, referrer, cache, `/demo`, and styled 404 response policies; `_headers` mirrors applicable headers for compatible static hosts. | 29 | * Over 22 / jargon / two ideas |
| The factory owns registry publishing and deployment credentials; contributors should not publish directly. | 11 | Pass |
| Projects are stored in the current browser unless exported. | 8 | † Unlisted privacy/storage claim |
| Read the in-app privacy page and terms. | 8 | Pass |
| This tool supports authoring and rehearsal; it does not replace testing with disabled players and does not claim conformance with any standard. | 20 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

Buttons are result-naming verbs where they need to be: **Try it with sample data**, **Open the workspace**, **Load example project**, **Add first state**, **Import JSON**, and **Export project**. No forbidden marketing adjective was found in landing copy. The visual identity is distinct and follows the documented luminous signal-map direction; it is not a generic three-card SaaS template.

## Structure, accessibility, and links

The live home, demo, privacy, terms, and 404 responses had the expected title pattern, one `h1`, one `main`, `lang="en"`, descriptions, canonical URLs, OG/Twitter metadata, SVG/favicon and Apple touch icon. `/not-a-real-route` returned HTTP 404 and a designed page. Crawl results: `/`, `/demo`, `/privacy/`, and `/terms/` returned 200; the external Source link returned 200. Headers included response-header CSP with `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and the required permissions policy. The remaining routing defect is F-1-2.

The complete demo flow recorded only same-origin requests and no cookies. The live visual system matched `.factory/design.md`: dark signal-map palette, self-hosted Atkinson Hyperlegible, generated product-specific hero art, 44 px controls, visible cyan focus, and reduced-motion rules. No generic-template finding or missed AI feature applies: the brief requires author-controlled descriptions, and JSON import/export is present.

## Earlier-review regression check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files, so no prior finding IDs can be repeated. I read every available `.factory/verification*.md` and the prior handoff. Their reported defects are confirmed fixed on the current live site and in code/tests:

- invalid language correction: `site/main.ts` clears custom validity on input; the live/tested `!!` → `es-MX` flow succeeds;
- headers/cache policy: current live responses have CSP, permissions policy, no-referrer policy, and immutable hashed assets;
- workspace keyboard focus loss: `site/main.ts` restores focus after state/language/cue/review rerenders; `workspace.spec.ts` covers each path;
- cue fallback speech language and stale live-region cleanup: `src/index.ts` retains resolved cue locale and the package consumer suite passes;
- runtime dependency leak and undersized controls: `package.json` has no runtime `dependencies`; current CSS/test suite enforces 44 px controls;
- missing claims/demo/NodeNext declarations/metadata/404/copy-audit: each artifact exists, the six declared claim commands pass, `/demo` is isolated, package consumer passes, and current live metadata/404 are present.

These repairs do not resolve the new F-1-1 through F-1-4 findings above.

## What would make this perfect

Show all three decision facts on the first 390 px screen, make every real route establish and announce focus, register or remove every remaining behavior promise, and split the marked README sentences into plain, short documentation. Then repeat this full cold-read, demo, claim, history, route, and link review with zero findings.
