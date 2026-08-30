# Landing-page and README copy audit

Reviewed 2026-08-30. Word counts exclude code, URLs, navigation repetition, and image alt text. No sentence exceeds 22 words and no banned plain-words terms appear.

| Copy | Words | Result |
| --- | ---: | --- |
| For browser-game creators | 3 | Pass |
| Caption game states before playtests | 5 | Pass |
| For browser-game creators who need multilingual descriptions and keyboard rehearsal before inviting disabled playtesters. | 14 | Pass |
| Loads a two-state sample in a private demo. | 9 | Pass |
| Private: sample data never changes your real draft. | 8 | Pass |
| Offline: works after the first visit. | 6 | Pass |
| Free: no account or payment. | 5 | Pass |
| Author states in deliberate order | 5 | Pass |
| Drafts save in this browser. | 5 | Pass |
| Export JSON to move them into your game. | 9 | Pass |
| Register authored states, activate them from your game loop, and reuse the JSON you rehearsed here. | 16 | Pass |
| This helps teams make intentional game state available for review. | 10 | Pass |
| It does not replace disabled playtesters, accessibility audits, or the judgment needed to write useful descriptions. | 16 | Pass |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| A TypeScript library and local workspace for browser-game creators. | 10 | Pass |
| Author localized captions and test action order with a keyboard. | 10 | Registered: author-review |
| It does not inspect a canvas, write descriptions, or certify accessibility. | 11 | Pass |
| Authors decide what each game state needs to say. | 10 | Pass |
| Use valid BCP 47 tags such as `en`, `es`, or `pt-BR` for localized strings. | 13 | Registered: language-tags-and-fallback |
| Each state and action can use its own fallback language. | 10 | Registered: language-tags-and-fallback |
| The spoken language matches the action text being read. | 9 | Registered: language-tags-and-fallback |
| Speech uses the browser’s on-device speech feature. | 7 | Registered: local-only |
| Project content and speech text are not sent to a product service. | 12 | Registered: local-only |
| `mount()` adds a hidden polite announcement near your canvas. | 9 | Registered: mounted-announcement |
| Use `{ liveRegion: false }` when your game already announces changes. | 10 | Registered: mounted-announcement |
| `createCaptioner(options)` starts an isolated captioner. | 4 | Registered: library-api |
| `register(state)` and `registerMany(states)` add validated states. | 6 | Registered: library-api |
| `activate(id)` selects a state and announces its description. | 7 | Registered: library-api |
| `setLocale(tag)` selects the best available language. | 6 | Registered: library-api |
| `moveFocus(direction)` follows the authored action order. | 6 | Registered: library-api |
| `speak()` reads the current state and action with on-device speech. | 9 | Registered: language-tags-and-fallback |
| `mount(element, options?)` manages an announcement beside the game. | 8 | Registered: mounted-announcement |
| `connectKeyboard(target?)` enables the documented review keys. | 6 | Registered: author-review |
| `getSnapshot()` and `subscribe(listener)` provide current state. | 7 | Registered: library-api |
| `destroy()` removes generated listeners and elements. | 6 | Registered: library-api |
| See the exported TypeScript types for the complete contract. | 9 | Pass |
| Invalid IDs, language tags, duplicate state/cue IDs, and blank descriptions throw `CaptionerValidationError` with actionable messages. | 14 | Registered: language-tags-and-fallback |
| Try the sample at the demo URL. | 7 | Pass |
| It contains the two-state Signal Hollow project. | 6 | Registered: demo-isolation |
| The demo uses separate browser storage. | 6 | Registered: demo-isolation |
| Sample data never changes your real draft. | 8 | Registered: demo-isolation |
| Free: no account or payment is needed to use the demo. | 10 | Registered: free-demo |
| Choose Start for real to discard demo data and open an empty workspace. | 13 | Registered: demo-isolation |
| The workspace works offline after the first visit. | 8 | Registered: offline-reload |
| Open the printed local URL. | 5 | Pass |
| The demo makes no cross-origin product requests while you author or use browser speech. | 13 | Registered: local-only |
| `npm test` runs unit, package, claim, and browser checks. | 9 | Pass |
| `npm run build` writes the library to `dist/lib`. | 8 | Pass |
| It writes the site to `dist/site`. | 7 | Pass |
| Deploy `dist/site` as a static site. | 5 | Pass |
| The included host configuration provides the site’s route, cache, and security policies. | 12 | Pass |
| The factory owns registry publishing and deployment credentials. | 8 | Pass |
| Projects stay in the current browser until you export them. | 10 | Registered: browser-storage |
| Read the in-app privacy page and terms. | 8 | Pass |
| This tool supports authoring and rehearsal. | 6 | Pass |
| It does not replace testing with disabled players or claim conformance with any standard. | 14 | Pass |

## Terminology

| Concept | One term |
| --- | --- |
| A named visual game moment | state |
| A localized authored explanation | caption |
| An ordered interactive item | action |
| The keyboard and speech check | rehearsal |
| Isolated sample workspace | demo |
| Browser-saved non-demo content | real draft |
| A browser-stored authored project | project |
