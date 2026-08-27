# A11y Playtest Captioner

A zero-dependency TypeScript library and local authoring workspace for browser-game creators who want to write, localize, and rehearse concise descriptions of important visual game states.

It does not inspect a canvas, generate descriptions, or certify accessibility. Authors decide what matters; the library provides predictable state, focus-order, keyboard, live-region, and on-device speech hooks for testing with disabled players.

## Install

```sh
npm install a11y-playtest-captioner
```

## Usage

```ts
import { createCaptioner } from "a11y-playtest-captioner";

const captioner = createCaptioner({
  locale: "en",
  states: [
    {
      id: "bridge-out",
      name: "Broken bridge",
      descriptions: {
        en: "The bridge has collapsed. Find another path across the ravine.",
        es: "El puente se ha derrumbado. Busca otra ruta para cruzar el barranco."
      },
      focusOrder: [
        {
          id: "rope",
          labels: { en: "Coiled rope", es: "Cuerda enrollada" },
          descriptions: { en: "Press E to pick up.", es: "Pulsa E para recogerla." }
        }
      ]
    }
  ]
});

captioner.mount(document.querySelector("canvas")!);
captioner.activate("bridge-out");

// Optional review controls: Left/Right/Home/End move through cues; S speaks.
const disconnect = captioner.connectKeyboard(window);

captioner.subscribe((snapshot) => {
  console.log(snapshot.description, snapshot.activeCue?.label);
});

disconnect();
captioner.destroy();
```

All localized strings are keyed by valid BCP 47 language tags. Speech uses the browser’s `speechSynthesis` API and never leaves the device. `mount()` adds a visually hidden polite live region next to the supplied game element; pass `{ liveRegion: false }` if the game already owns announcements.

## Public API

- `createCaptioner(options)` creates an isolated captioner.
- `register(state)` / `registerMany(states)` validates and adds authored states.
- `activate(id)` selects a state and announces its description.
- `setLocale(tag)` selects the best available language with deterministic fallback.
- `moveFocus(direction)` follows the authored cue order.
- `speak()` reads the current state and cue with on-device browser speech.
- `mount(element, options?)` manages a live region adjacent to the game.
- `connectKeyboard(target?)` enables the documented review keys and returns a cleanup function.
- `getSnapshot()` and `subscribe(listener)` expose immutable state.
- `destroy()` removes listeners, speech, and generated DOM.

See the exported TypeScript types for the complete contract. Invalid IDs, language tags, duplicate state/cue IDs, and blank descriptions throw `CaptionerValidationError` with actionable messages.

## Local authoring site

The live site at <https://a11y-playtest-captioner.sociobot.in> lets you create states, add language variants and ordered cues, rehearse entirely by keyboard, and import/export compatible JSON. Drafts stay in browser storage and the app works offline after the first visit.

```sh
npm install
npm run dev
```

Open the printed local URL. No account, analytics, network speech service, or third-party runtime script is used.

## Test, build, and package

```sh
npm test
npm run build
npm pack --dry-run
```

`npm run build` emits ESM, CommonJS, and TypeScript declarations under `dist/lib`, plus the deployable documentation site under `dist/site` with `index.html` at that root.

## Deploy

Deploy `dist/site` as a static site. The included `_headers` file documents recommended immutable asset caching and security headers. The factory owns registry publishing and deployment credentials; contributors should not publish directly.

## Privacy and scope

Projects are stored only in the current browser unless exported. Read the in-app [privacy page](https://a11y-playtest-captioner.sociobot.in/privacy/) and [terms](https://a11y-playtest-captioner.sociobot.in/terms/). This tool supports authoring and rehearsal; it does not replace testing with disabled players and does not claim conformance with any standard.

## License

MIT. See [LICENSE](./LICENSE).
