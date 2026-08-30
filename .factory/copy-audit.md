# Landing-page and README copy audit

Reviewed 2026-08-30. Counts use whitespace-separated words. Code examples, URLs, navigation repetition, and image alt text are excluded. No listed sentence exceeds 22 words or contains a banned plain-words term.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Caption game states before playtests | 5 | Plain job headline |
| For browser-game creators who need multilingual captions and keyboard rehearsal before inviting disabled playtesters. | 14 | Plain audience and outcome |
| Loads a two-state sample in a private demo. | 8 | Registered: demo-seed |
| Private: sample data never changes your real draft. | 8 | Registered: demo-isolation |
| Offline: works after the first visit. | 6 | Registered: offline-reload |
| Free: no account or payment. | 5 | Registered: free-demo |
| Connect each game state to its ordered actions. | 9 | Plain figure caption |
| Drafts save in this browser. | 5 | Registered: browser-storage |
| Export JSON to move them into your game. | 8 | Registered: json-export |
| Rehearsal control: hear the active caption before reviewing its ordered actions below. | 11 | Demo instruction |
| Use your authored captions in the game states you register with the library. | 13 | Registered: library-api |
| This helps teams make intentional game state available for review. | 10 | Product boundary |
| It does not replace disabled playtesters, accessibility audits, or the judgment needed to write useful descriptions. | 16 | Product boundary |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| A TypeScript library and local workspace for browser-game creators. | 9 | Plain product summary |
| Author localized captions and test action order with a keyboard. | 10 | Registered: author-review |
| Use language tags such as `en`, `es`, or `pt-BR` for localized strings. | 12 | Registered: language-tags-and-fallback |
| Each state and action can use its own fallback language. | 10 | Registered: language-tags-and-fallback |
| The spoken language matches the action text being read. | 9 | Registered: language-tags-and-fallback |
| Speech uses your browser’s speech feature. | 6 | Registered: library-api |
| Project content and speech text are not sent to a product service. | 12 | Registered: local-only |
| `mount()` adds a hidden screen-reader status message near your canvas. | 10 | Registered: library-api |
| `connectKeyboard(target?)` enables the documented review keys. | 6 | Registered: library-api |
| `destroy()` removes generated listeners and elements. | 6 | Registered: library-api |
| Invalid IDs, language tags, duplicate state or action IDs, and blank descriptions throw `CaptionerValidationError`. | 14 | Registered: validation-errors |
| Each message names the invalid field. | 6 | Registered: validation-errors |
| It contains the two-state Signal Hollow project. | 7 | Registered: demo-seed |
| The demo uses separate browser storage. | 6 | Registered: demo-isolation |
| The demo makes no cross-origin product requests while you author, import, or use browser speech. | 15 | Registered: local-only and import-local |
| Projects stay in the current browser until you export them. | 10 | Registered: browser-storage |

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
