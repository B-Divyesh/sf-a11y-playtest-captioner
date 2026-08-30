# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-30 UTC  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in>  
**Revision tested:** `03333e4584c531ba28af434f8576ce3113ca49f8`  
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900

## Verdict

**FAIL.** The landing screen is clear and the demo data is genuinely isolated, but the demo does not show the product in use on its first screen. Two earlier findings are also only partly fixed: one programmatic route change still loses focus, and several published claims still lack matching tagged tests. Two minor copy/metadata findings remain. A PASS requires zero findings.

## Cold first read

Before scrolling, at both sizes, I understood this as a tool for browser-game creators to write multilingual captions for important game states and rehearse the order of available actions before a disabled-player playtest. It is for browser-game creators. I should select **“Try it with sample data”** first.

The exact first-screen text that supplied those answers was:

- **“Caption game states before playtests”**
- **“For browser-game creators who need multilingual descriptions and keyboard rehearsal before inviting disabled playtesters.”**
- **“Try it with sample data”** and **“Loads a two-state sample in a private demo.”**

This gate passes. On the 390 × 844 screen, the privacy, offline, and price facts ended at 467, 486, and 505 px respectively, so all three were visible without scrolling. On desktop they ended at 815, 843, and 871 px in a 900 px viewport.

## Findings

### F-2-1 — BLOCKING — The demo’s first screen is still the marketing hero, not the product in use

**Location / exact text:** Select **“Try it with sample data”** on `/`. The browser opens `/demo` at `scrollY = 0`. At 390 × 844, `#workspace` starts at 842 px, the first sample state starts at 1,214 px, and the editor starts at 1,466 px. At 1440 × 900, the workspace starts at 967 px and the first sample state starts at 1,277 px. The only new first-screen content is the fixed banner: **“Demo — sample data, nothing is saved to your real draft. Edit Signal Hollow freely.”**

**Why this fails:** the one-click path technically loads sample data, but a first-time visitor still sees the landing hero after clicking. No sample state, authored caption, or rehearsal result is visible. On mobile, the fixed banner is 163 px high and overlays the bottom of that unchanged hero. This fails the explicit requirement that the first screen after the click already show the product being used with realistic data.

**Concrete fix:** make `/demo` open with the populated workspace in view. Prefer a demo-specific layout that places the compact banner above the state list/editor/rehearsal UI and omits or collapses the hero. Keep **Reset demo** and **Start for real** visible without covering controls. Add desktop and 390 × 844 tests that enter through the landing CTA and assert that **Ravine crossing**, its caption, and a rehearsal control all intersect the first viewport.

### F-1-2 — BLOCKING regression — Programmatic route changes still lose keyboard and screen-reader context

**Location / evidence:** live `/demo` → **Start for real** → `/`. After navigation, `document.activeElement` is `BODY` and `#route-announcement` is empty. In code, `startForReal()` calls `window.location.assign("/")` directly, while `site/route-context.ts` only records pending focus after clicks on links. The existing regression test covers Home → Privacy → Back, which passes, but not this core button-driven route change.

**Why this fails:** the earlier route-focus finding was repaired only for links and history traversal. A keyboard or screen-reader user leaving the demo is returned to the document body without the new page subject being focused or announced. The site-structure requirement applies to every route change.

**Concrete fix:** use one navigation helper for links and programmatic navigation. Set the route-focus intent before `location.assign`, then focus the destination `h1` and update the polite announcement. Add a regression for `/demo` → **Start for real** that asserts the home `h1` is focused and announced.

### F-1-3 — BLOCKING regression — Published claims still exceed the registered, tagged evidence

The ten declared commands pass, but the earlier unlisted-claims finding is only partly fixed. The following exact claims do not have a tagged test that proves the stated outcome:

| Exact quote / location | Evidence gap | Concrete fix |
| --- | --- | --- |
| **“Loads a two-state sample in a private demo.”** (landing) and **“It contains the two-state Signal Hollow project.”** (README) | `demo-isolation` asserts one named state and storage separation; it does not assert exactly two named sample states. | Add a `demo-seed` claim and tagged test for both named states, their realistic captions/actions, and the first-viewport result required by F-2-1. |
| **“Register authored states, activate them from your game loop, and reuse the JSON you rehearsed here.”** (landing) | `library-api` checks hard-coded state objects; `json-export` only parses the download. No tagged integration test loads exported workspace data through the library. | Add one tagged package/playground test that exports the sample, passes its states and locale into the packed library, activates a state, and verifies the caption/action output. |
| **“Speech uses the browser’s on-device speech feature.”**, **“`speak()` reads the current state and action with on-device speech.”** (README), and **“On device”** (landing workspace) | `local-only` records page requests, but Web Speech can expose non-local voices. `speak()` does not inspect `SpeechSynthesisVoice.localService` and may select a remote voice. The test cannot prove that the browser or OS keeps synthesis on device. | Either remove **on-device** and say only “Uses your browser’s speech feature; this product sends no speech text,” or select only `localService` voices, fail clearly when none exist, and add a tagged local-voice test. |
| **“`connectKeyboard(target?)` enables the documented review keys.”** (README) | `author-review` exercises the site’s monitor handler, not the package’s `connectKeyboard()` API. | Add a tagged library test that dispatches Left, Right, Home, End, and S, verifies state/speech changes, verifies editable controls are ignored, and verifies cleanup. |
| **“`activate(id)` selects a state and announces its description.”** (README) | `library-api` checks selection only. `mounted-announcement` checks the region’s attributes only. Neither tagged test verifies announced content after activation. | Extend one precisely worded claim/test to mount, activate, and assert the live-region text and language. |
| **“`destroy()` removes generated listeners and elements.”** (README) | `library-api` only checks that registration throws after destruction. The cleanup behavior is not asserted by that tagged test. | Add a tagged cleanup assertion for the keyboard listener, live region, subscription, and pending speech. |
| **“Invalid IDs, language tags, duplicate state/cue IDs, and blank descriptions throw `CaptionerValidationError` with actionable messages.”** (README) | `language-tags-and-fallback` tests one invalid top-level locale. It does not test localized-string tags, invalid IDs, duplicate state/cue IDs, blank descriptions, the error class for each case, or what “actionable” means. | Register a `validation-errors` claim and tag a table-driven test for every listed input. Replace “actionable” with a measurable promise such as “the message names the invalid field.” |
| **“Imported files are read locally.”** (Privacy page) | The tagged `local-only` flow edits and speaks; it does not import a file while recording requests. | Add an import-local claim/test that imports a fixture while asserting same-origin-only requests, or remove the separate promise. |

This is BLOCKING under the history rule because F-1-3 was previously reported as fixed. Incidental untagged unit coverage does not satisfy the contract that each published claim map to a tagged observable test.

### F-2-2 — Minor — `/demo` retains the home page’s social title and description

**Location / exact values:** live `/demo` correctly changes `document.title` to **“Demo — A11y Playtest Captioner”**, the canonical URL to `/demo`, and the standard description to **“Try the isolated sample workspace for browser-game caption authoring.”** However, `og:title` and `twitter:title` remain **“A11y Playtest Captioner — game-state captions”**, while `og:description` and `twitter:description` remain the home-page description. `site/main.ts` updates only the canonical URL, `og:url`, and standard description.

**Why this matters:** copied demo links advertise the landing page rather than identifying the isolated sample. Non-JavaScript social crawlers also receive the home page’s original metadata from the shared HTML response.

**Concrete fix:** give `/demo` route-specific static metadata where the host can serve it, or update every OG/Twitter field consistently and verify the built response used by social crawlers. Add metadata assertions for `/demo`, not only source-file presence.

### F-2-3 — Minor — Copy still mixes terms and includes an unsupported caption

**Locations / rewrites:**

- Landing lede: **“multilingual descriptions”** conflicts with the headline and README term **“captions.”** Use: **“For browser-game creators who need multilingual captions and keyboard rehearsal before inviting disabled playtesters.”**
- Hero figure caption: **“Author states in deliberate order”** suggests that state order is editable or meaningful, but the product authors the order of actions inside a state. Use: **“Connect each game state to its ordered actions.”**
- README: **“Use valid BCP 47 tags…”** uses an unexplained standards acronym. Use: **“Use language tags such as `en`, `es`, or `pt-BR`.”**
- README: **“hidden polite announcement”** is ARIA jargon without a user-facing noun. Use: **“hidden screen-reader status message.”**
- README: **“duplicate state/cue IDs”** conflicts with the site and terminology table, which call cues **actions**. Use **“duplicate state or action IDs”**, while retaining `CaptionCue` only where it names the exported type.

No sentence exceeds 22 words and no banned marketing adjective appears. The controls use result-naming verbs or accessible names; the visible **Remove** control has a specific accessible name such as **“Remove Loose rope.”**

## Copy audit

Counts use whitespace-separated visible words. Code blocks and raw URLs are excluded. Headings and actions are included because the brief requires checking them out of context. **Flag** points to the finding above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| For browser-game creators | 3 | Pass |
| Caption game states before playtests | 5 | Pass |
| For browser-game creators who need multilingual descriptions and keyboard rehearsal before inviting disabled playtesters. | 14 | **Flag: F-2-3** |
| Try it with sample data | 5 | Pass |
| Loads a two-state sample in a private demo. | 8 | **Flag: F-1-3** |
| Open the workspace | 3 | Pass |
| Use the library | 3 | Pass |
| Private: sample data never changes your real draft. | 8 | Registered claim |
| Offline: works after the first visit. | 6 | Registered claim |
| Free: no account or payment. | 5 | Registered claim |
| Caption state map | 3 | Pass |
| Author states in deliberate order | 5 | **Flag: F-2-3** |
| Local workspace | 2 | Pass |
| Author game-state captions | 3 | Pass |
| Drafts save in this browser. | 5 | Registered claim |
| Export JSON to move them into your game. | 8 | Registered claim |
| States | 1 | Pass |
| No states yet. | 3 | Pass |
| Add the first critical moment. | 5 | Pass |
| Load example project | 3 | Pass |
| Write captions | 2 | Pass |
| Stored locally | 2 | Registered claim |
| Map your first critical moment | 5 | Pass |
| Start with a state where the objective or available action is only visible on the game canvas. | 17 | Pass |
| Add first state | 3 | Pass |
| Test action order | 3 | Pass |
| On device | 2 | **Flag: F-1-3** |
| Preview waiting | 2 | Pass |
| Choose a state to test its description and action order. | 10 | Pass |
| Ready offline after first visit | 5 | Registered claim |
| Import JSON | 2 | Pass |
| Export project | 2 | Pass |
| TypeScript library | 2 | Pass |
| Use caption states in your game | 6 | Pass |
| Register authored states, activate them from your game loop, and reuse the JSON you rehearsed here. | 16 | **Flag: F-1-3** |
| Product boundaries | 2 | Pass |
| What this tool does not do | 6 | Pass |
| This helps teams make intentional game state available for review. | 10 | Registered claim |
| It does not replace disabled playtesters, accessibility audits, or the judgment needed to write useful descriptions. | 16 | Pass |
| Free local authoring · Built by Param Factory · v0.1.0 | 10 | Registered claim / build identity |

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| A TypeScript library and local workspace for browser-game creators. | 9 | Pass |
| Author localized captions and test action order with a keyboard. | 10 | Registered claim |
| It does not inspect a canvas, write descriptions, or certify accessibility. | 11 | Pass |
| Authors decide what each game state needs to say. | 9 | Pass |
| Use valid BCP 47 tags such as `en`, `es`, or `pt-BR` for localized strings. | 14 | **Flag: F-2-3** |
| Each state and action can use its own fallback language. | 10 | Registered claim |
| The spoken language matches the action text being read. | 9 | Registered claim |
| Speech uses the browser’s on-device speech feature. | 7 | **Flag: F-1-3** |
| Project content and speech text are not sent to a product service. | 12 | Registered claim |
| `mount()` adds a hidden polite announcement near your canvas. | 9 | **Flag: F-2-3** |
| Use `{ liveRegion: false }` when your game already announces changes. | 11 | Registered claim |
| `createCaptioner(options)` starts an isolated captioner. | 5 | Registered claim |
| `register(state)` and `registerMany(states)` add validated states. | 6 | **Flag: F-1-3** |
| `activate(id)` selects a state and announces its description. | 8 | **Flag: F-1-3** |
| `setLocale(tag)` selects the best available language. | 6 | Registered claim |
| `moveFocus(direction)` follows the authored action order. | 6 | Registered claim |
| `speak()` reads the current state and action with on-device speech. | 10 | **Flag: F-1-3** |
| `mount(element, options?)` manages an announcement beside the game. | 8 | Registered claim |
| `connectKeyboard(target?)` enables the documented review keys. | 6 | **Flag: F-1-3** |
| `getSnapshot()` and `subscribe(listener)` provide current state. | 6 | Registered claim |
| `destroy()` removes generated listeners and elements. | 6 | **Flag: F-1-3** |
| See the exported TypeScript types for the complete contract. | 9 | Pass |
| Invalid IDs, language tags, duplicate state/cue IDs, and blank descriptions throw `CaptionerValidationError` with actionable messages. | 15 | **Flag: F-1-3, F-2-3** |
| Try the sample at the demo URL. | 7 | Pass |
| It contains the two-state Signal Hollow project. | 7 | **Flag: F-1-3** |
| The demo uses separate browser storage. | 6 | Registered claim |
| Sample data never changes your real draft. | 7 | Registered claim |
| Free: no account or payment is needed to use the demo. | 11 | Registered claim |
| Choose Start for real to discard demo data and open an empty workspace. | 13 | Registered claim |
| The workspace works offline after the first visit. | 8 | Registered claim |
| Open the printed local URL. | 5 | Pass |
| The demo makes no cross-origin product requests while you author or use browser speech. | 14 | Registered claim |
| `npm test` runs unit, package, claim, and browser checks. | 9 | Verified build instruction |
| `npm run build` writes the library to `dist/lib`. | 8 | Verified build instruction |
| It writes the site to `dist/site`. | 6 | Verified build instruction |
| Deploy `dist/site` as a static site. | 6 | Pass |
| The included host configuration provides the site’s route, cache, and security policies. | 12 | Verified repository statement |
| The factory owns registry publishing and deployment credentials. | 8 | Pass |
| Projects stay in the current browser until you export them. | 10 | Registered claim |
| Read the in-app privacy page and terms. | 7 | Pass |
| This tool supports authoring and rehearsal. | 6 | Registered claim |
| It does not replace testing with disabled players or claim conformance with any standard. | 14 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

README headings also pass the out-of-context check: **A11y Playtest Captioner** (3), **Install** (1), **Usage** (1), **Public API** (2), **Local authoring site** (3), **Test, build, and package** (5), **Deploy** (1), **Privacy and scope** (3), and **License** (1).

## Demo and sandbox evidence

- One click from the visible first-screen CTA opens `/demo`.
- The loaded data is realistic: **Ravine crossing** and **Watcher alert**, localized captions, and ordered actions.
- The banner remains present with **Reset demo** and **Start for real**.
- A seeded real value under `a11y-playtest-captioner:project:v1` remained byte-for-byte unchanged while the demo was edited and reset.
- Demo changes were written only to `demo:a11y-playtest-captioner:project:v1`. **Reset demo** restored the original Ravine crossing text. **Start for real** removed the demo key and preserved the seeded real key.
- The live edit/speech flow issued requests only to `https://a11y-playtest-captioner.sociobot.in`, set no cookies, and produced no console errors.
- A fresh live context loaded `/demo`, became service-worker controlled, then reloaded successfully offline with both sample states and **“Offline — local editing still works.”**

Isolation passes. First-view usability fails under F-2-1.

## Declared claim tests

Each exact command in `.factory/claims.json` was run independently after `npm ci` in fresh clone `/tmp/a11y-captioner-review2-clean.IDcyek` at `03333e4584c531ba28af434f8576ce3113ca49f8`.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | 2/2 browser projects |
| `offline-reload` | PASS | 2/2 browser projects |
| `local-only` | PASS | 2/2 browser projects |
| `free-demo` | PASS | 2/2 browser projects |
| `author-review` | PASS | 2/2 browser projects |
| `browser-storage` | PASS | 2/2 browser projects |
| `language-tags-and-fallback` | PASS | 1 tagged unit test |
| `mounted-announcement` | PASS | 1 tagged unit test |
| `library-api` | PASS | 1 tagged unit test |
| `json-export` | PASS | 2/2 browser projects |

No declared command failed. F-1-3 concerns promises outside those tests and claims whose wording is broader than the tagged assertion.

The full local gates also pass: `npm test` completed 15 unit tests, the packed-package consumer, 18 claim-browser tests, and 25 workspace tests with 5 expected project-specific skips. `npm run build` produced `dist/lib` and `dist/site`; initial site JavaScript is about 27 kB raw and under 10 kB gzip.

## Earlier finding verification

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | **Fixed.** All three facts are inside both tested first viewports. The mobile bounding-box regression passes. |
| F-1-2 | **Half-fixed; BLOCKING again.** Home → Privacy → Back focuses and announces both `h1` elements, but Demo → Start for real leaves focus on `BODY` with an empty announcement. |
| F-1-3 | **Half-fixed; BLOCKING again.** Ten claims now exist and their commands pass, but the claim/test mismatches listed above remain. |
| F-1-4 | **Fixed for the cited copy.** No sentence exceeds 22 words; **Caption state map**, **Write captions**, **Test action order**, and **Add language** are live. F-2-3 records separate remaining wording issues found in this full rerun. |

I also checked `.factory/polish-1.md` and the current `.factory/handoff.md`; the live deployment matches the documented release revision and build identity. The two repeated findings above are verified behavior gaps, not stale documentation alone.

## Structure, accessibility, and links

Home, demo, privacy, terms, and the designed 404 have `lang="en"`, one `h1`, one `main`, route-appropriate document titles, descriptions, and canonicals. They also include OG/Twitter tags, the product social image, SVG favicon, and Apple touch icon; the `/demo` social-field inconsistency is F-2-2. An unknown path returns HTTP 404 with the designed page and routes back to the workspace or demo.

All real internal and external links crawled successfully: `/`, `/demo`, `/privacy/`, `/terms/`, and the GitHub source returned 200. The `#main`, `#workspace`, and `#install` targets exist and fresh deep links scroll to them. Home → Privacy → Back restores route focus; the button-driven exception is F-1-2.

Live headers include CSP with `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and the stated permissions policy. `/opt/fleet/lib/verify-url.sh` passed. Playwright AxeBuilder found zero violations on home, demo, privacy, terms, and 404. There were no console errors on valid routes. Focus styling, 44 px targets, reduced-motion rules, and 390 px horizontal fit are present and covered by tests.

The dark cyan/lime signal-map identity, self-hosted Atkinson Hyperlegible type, generated product-specific art, asymmetric desktop hero, and three-pane editor match `.factory/design.md`. It is visually distinct from a generic centered-hero/feature-card SaaS template.

## Missed leverage

No AI feature should be added. The brief requires author-controlled descriptions, and generated accessibility copy would undermine that boundary. JSON import/export is already present. The useful missing leverage is not AI or sync; it is making the existing seeded workspace visible immediately after the demo click, as specified in F-2-1.

## What would make this perfect

Open the demo directly on a compact, unobscured sample workspace; preserve and announce focus when **Start for real** navigates; align every published API, demo, import, and speech claim with one precise tagged test; use honest browser-speech wording unless local-only voices are enforced; give `/demo` complete route-specific social metadata; and use one term each for captions and actions. Then rerun this entire review from fresh browser and repository contexts.
