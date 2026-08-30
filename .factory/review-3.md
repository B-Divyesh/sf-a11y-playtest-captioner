# Adversarial first-read review 3 — PASS

**Reviewed:** 2026-08-30 UTC  
**Revision:** `103e2d2c7f8959322cc1ea0201a9f12e45459f93`  
**Live URL:** <https://a11y-playtest-captioner.sociobot.in/>  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900, plus a clean local clone

## Verdict

**PASS.** No blocking or minor finding remains. The first screen explains the job, audience, and first action; the one-click demo opens on populated, isolated sample data; all published claims have passing tagged tests; and the historical findings are fixed in both live behavior and code.

## Cold first read

Before scrolling, I understood the product as: a browser-game creator writes captions for important visual game states, then tests the action order by keyboard before inviting disabled playtesters. It is for browser-game creators preparing that playtest. I should click **“Try it with sample data.”**

The exact copy that answered those questions was **“Caption game states before playtests”**, **“For browser-game creators who need multilingual captions and keyboard rehearsal before inviting disabled playtesters.”**, and **“Try it with sample data.”** The supporting result note says **“Loads a two-state sample in a private demo.”** This gate passes at both sizes.

All three decision facts are in the initial viewport: their bottoms were 467, 486, and 505 px at 390 × 844; 815, 843, and 871 px at 1440 × 900.

## Demo and sandbox

The first landing action opens `/demo` in one click. Its initial screen is already in use: the h1 is **“Ravine crossing”**, with its realistic caption, **“Speak this caption”** control, populated state rail, and persistent **“Demo — sample data, nothing is saved to your real draft.”** controls. At 390 px, the state, Speak control, and caption end at 345, 412, and 466 px respectively; all are visible before scrolling. The same holds on desktop.

The sample contains Ravine crossing and Watcher alert. Fresh browser inspection found only `demo:a11y-playtest-captioner:project:v1` while in demo. Reset restored the sample, and Start for real removed the demo key, returned home, focused the home h1, and announced the destination. The demo request log contained only `https://a11y-playtest-captioner.sociobot.in`; it set no cookies.

## Claims and clean-clone verification

In a fresh clone at `/tmp/a11y-captioner-review3.yYKUF5/repo`, `npm ci` completed with zero vulnerabilities. Every exact command in `.factory/claims.json` was executed independently and passed:

| Claim IDs | Result |
| --- | --- |
| `demo-isolation`, `demo-seed`, `offline-reload`, `local-only`, `import-local`, `free-demo`, `author-review`, `browser-storage`, `json-export` | PASS — tagged desktop and 390 px browser checks |
| `language-tags-and-fallback`, `mounted-announcement`, `library-api`, `validation-errors` | PASS — tagged unit checks |

`npm test` passed: 16 unit/static tests, the packed-package consumer, 22 claim-browser checks, and the workspace browser suite. `npm run build` produced `dist/lib` and `dist/site`; `npm pack --dry-run` passed (12 files, 17,553 bytes). The generated main JS is 26.40 kB / 9.11 kB gzip.

No live landing or README promise lacks a matching registry entry. The broader documented API promise is registered as `library-api`, language/speech behavior as `language-tags-and-fallback`, and storage/import/export/demo behavior as their respective distinct entries.

## Copy audit

Counts use whitespace-separated words. Code examples, URLs, navigation repetition, and alt text are excluded. Headings and controls are included because they must make sense independently. No audited sentence exceeds 22 words, no banned marketing term appears, controls name their result, and terminology is consistent: **state**, **caption**, **action**, **rehearsal**, **demo**, and **real draft**.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| For browser-game creators | 3 | Plain audience label |
| Caption game states before playtests | 5 | Plain job headline |
| For browser-game creators who need multilingual captions and keyboard rehearsal before inviting disabled playtesters. | 14 | Plain audience and outcome |
| Try it with sample data | 5 | Result-naming action |
| Loads a two-state sample in a private demo. | 8 | `demo-seed` |
| Open the workspace | 3 | Result-naming action |
| Use the library | 3 | Result-naming action |
| Private: sample data never changes your real draft. | 8 | `demo-isolation` |
| Offline: works after the first visit. | 6 | `offline-reload` |
| Free: no account or payment. | 5 | `free-demo` |
| Caption state map | 3 | Descriptive figure label |
| Connect each game state to its ordered actions. | 9 | Descriptive caption |
| Sample workspace | 2 | Contextual heading |
| Active game state | 3 | Descriptive label |
| Speak this caption | 4 | Result-naming action |
| Rehearsal control: hear the active caption before reviewing its ordered actions below. | 11 | Plain instruction |
| Local workspace | 2 | Contextual heading |
| Author game-state captions | 3 | Descriptive heading |
| Drafts save in this browser. | 5 | `browser-storage` |
| Export JSON to move them into your game. | 8 | `json-export` |
| States | 1 | Descriptive heading |
| No states yet. | 3 | Plain empty state |
| Add the first critical moment. | 5 | Plain empty-state instruction |
| Load example project | 3 | Result-naming action |
| Write captions | 2 | Descriptive heading |
| Stored locally | 2 | `browser-storage` status |
| Map your first critical moment | 5 | Descriptive empty-state heading |
| Start with a state where the objective or available action is only visible on the game canvas. | 17 | Plain instruction |
| Add first state | 3 | Result-naming action |
| Test action order | 3 | Descriptive heading |
| Browser speech | 2 | Plain feature label |
| Preview waiting | 2 | Plain empty state |
| Choose a state to test its description and action order. | 10 | Plain instruction |
| Ready offline after first visit | 5 | `offline-reload` |
| Import JSON | 2 | Result-naming action |
| Export project | 2 | Result-naming action |
| TypeScript library | 2 | Contextual heading |
| Use caption states in your game | 6 | Descriptive heading |
| Use your authored captions in the game states you register with the library. | 13 | `library-api` |
| Copy command | 2 | Result-naming action |
| Product boundaries | 2 | Contextual heading |
| What this tool does not do | 6 | Descriptive heading |
| This helps teams make intentional game state available for review. | 10 | Product scope |
| It does not replace disabled playtesters, accessibility audits, or the judgment needed to write useful descriptions. | 16 | Product boundary |
| Free local authoring · Built by Param Factory · v0.1.0 · build [id] | 10 | Footer identity |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| A TypeScript library and local workspace for browser-game creators. | 9 | Plain summary |
| Author localized captions and test action order with a keyboard. | 10 | `author-review` |
| It does not inspect a canvas, write descriptions, or certify accessibility. | 10 | Clear scope |
| Authors decide what each game state needs to say. | 9 | Clear authorship boundary |
| Use language tags such as `en`, `es`, or `pt-BR` for localized strings. | 12 | `language-tags-and-fallback` |
| Each state and action can use its own fallback language. | 10 | `language-tags-and-fallback` |
| The spoken language matches the action text being read. | 9 | `language-tags-and-fallback` |
| Speech uses your browser’s speech feature. | 6 | `library-api` |
| Project content and speech text are not sent to a product service. | 12 | `local-only` |
| `mount()` adds a hidden screen-reader status message near your canvas. | 10 | `mounted-announcement` |
| Use `{ liveRegion: false }` when your game already announces changes. | 11 | `mounted-announcement` |
| `createCaptioner(options)` starts an isolated captioner. | 5 | `library-api` |
| `register(state)` and `registerMany(states)` add validated states. | 6 | `library-api` |
| `activate(id)` selects a state and announces its description. | 8 | `library-api` |
| `setLocale(tag)` selects the best available language. | 6 | `library-api` |
| `moveFocus(direction)` follows the authored action order. | 6 | `library-api` |
| `speak()` reads the current state and action with browser speech. | 10 | `library-api` |
| `mount(element, options?)` manages a status message beside the game. | 8 | `mounted-announcement` |
| `connectKeyboard(target?)` enables the documented review keys. | 6 | `library-api` |
| `getSnapshot()` and `subscribe(listener)` provide current state. | 6 | `library-api` |
| `destroy()` removes generated listeners and elements. | 6 | `library-api` |
| See the exported TypeScript types for the complete contract. | 9 | Useful direction |
| Invalid IDs, language tags, duplicate state or action IDs, and blank descriptions throw `CaptionerValidationError`. | 14 | `validation-errors` |
| Each message names the invalid field. | 6 | `validation-errors` |
| Try the sample at the demo URL. | 7 | Plain action |
| It contains the two-state Signal Hollow project. | 7 | `demo-seed` |
| The demo uses separate browser storage. | 6 | `demo-isolation` |
| Sample data never changes your real draft. | 7 | `demo-isolation` |
| Free: no account or payment is needed to use the demo. | 11 | `free-demo` |
| Choose Start for real to discard demo data and open an empty workspace. | 13 | `demo-isolation` |
| The workspace works offline after the first visit. | 8 | `offline-reload` |
| Open the printed local URL. | 5 | Plain instruction |
| The demo makes no cross-origin product requests while you author, import, or use browser speech. | 15 | `local-only`, `import-local` |
| `npm test` runs unit, package, claim, and browser checks. | 9 | Verified command description |
| `npm run build` writes the library to `dist/lib`. | 8 | Verified command description |
| It writes the site to `dist/site`. | 6 | Verified command description |
| Deploy `dist/site` as a static site. | 6 | Plain deployment instruction |
| The included host configuration provides the site’s route, cache, and security policies. | 12 | Repository direction |
| The factory owns registry publishing and deployment credentials. | 8 | Clear ownership |
| Projects stay in the current browser until you export them. | 10 | `browser-storage` |
| Read the in-app privacy page and terms. | 7 | Plain direction |
| This tool supports authoring and rehearsal. | 6 | Product scope |
| It does not replace testing with disabled players or claim conformance with any standard. | 14 | Honest limitation |
| MIT. | 1 | License |
| See LICENSE. | 2 | Plain direction |

## Historical finding verification

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 | Fixed. All three hero facts fit the 390 px and desktop first screens. |
| F-1-2 | Fixed. Link navigation, Back, and Demo → Start for real focus the destination h1 and update `#route-announcement`. |
| F-1-3 | Fixed. The registry now contains 13 precise claims with tagged observable tests. |
| F-1-4 | Fixed. The landing and README now use plain, consistent labels; no audited sentence is over 22 words. |
| F-2-1 | Fixed. `/demo` starts with the populated sample workspace, caption, and rehearsal control in the initial viewport. |
| F-2-2 | Fixed. Raw `/demo` HTML and runtime metadata use the Demo title, description, canonical, OG, and Twitter values. |
| F-2-3 | Fixed. The UI and README consistently use captions and actions, and use plain language for language tags and status messages. |

## Structure, accessibility, privacy, and links

Home, Demo, Privacy, Terms, and the unknown-route response each returned the expected title, description, canonical, OG/Twitter fields, favicon, Apple touch icon, `lang="en"`, one h1, and one main. `/not-a-real-route` returned HTTP 404 and the designed page. The home/demo/privacy/terms routes, robots, sitemap, and public GitHub source link returned 200. Privacy, Terms, and source links are present in the footer; the header is consistent and has a skip link.

Privacy navigation and browser Back focused the destination heading and announced its title. The deployment sends CSP with `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and the expected permissions policy. The visible identity follows the documented dark signal-map system with original generated art, self-hosted type, and responsive three-pane authoring layout; it is not a generic SaaS-template surface.

Fresh Axe checks at 390 px found zero violations on home, demo, Privacy, Terms, and 404. No console errors occurred during the cold, demo, reset, exit, or route-focus flows. The source and live request log show no analytics, third-party runtime calls, or embedded provider keys.

## Missed leverage

No missing AI feature is indicated. The brief requires author-controlled descriptions, so AI-generated captions would weaken the stated product boundary. The useful import/export capability is already present and covered by claims.

## What would make this perfect

Maintain this state: keep the first-screen copy and direct demo path intact; require a claim and tagged sandbox test for each new visitor-facing promise; and rerun mobile, offline, storage-isolation, route-focus, and 404 checks whenever the static host or routing changes. No product change is currently required.
