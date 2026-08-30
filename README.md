# A11y Playtest Captioner

A TypeScript library and local authoring workspace for browser-game creators who need localized captions for important visual game states. Author localized captions and rehearse the action order with a keyboard.

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

All localized strings are keyed by valid BCP 47 language tags. State and cue fallbacks resolve independently, and an active cue exposes its own `resolvedLocale` so its live-region and speech language tag always match the cue text. Speech uses the browser’s `speechSynthesis` API; project content and speech text are not sent to a product service. `mount()` adds a visually hidden polite live region next to the supplied game element; pass `{ liveRegion: false }` if the game already owns announcements.

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

The live site at <https://a11y-playtest-captioner.sociobot.in> lets you create states, add language variants and ordered cues, rehearse by keyboard, and export project JSON. Try it immediately at <https://a11y-playtest-captioner.sociobot.in/demo>.

The demo opens the two-state Signal Hollow sample in a separate browser-storage namespace. Sample data never changes your real draft. **Free: no account or payment is needed to use the demo.** Choose **Start for real** to discard its demo data and open an empty local workspace. The workspace works offline after the first visit.

```sh
npm install
npm run dev
```

Open the printed local URL. The demo makes no cross-origin product requests while you author or use browser speech.

## Test, build, and package

```sh
npm test
npm run build
npm pack --dry-run
```

`npm test` includes a packed, strict NodeNext TypeScript consumer and all claim checks. `npm run build` emits ESM, CommonJS, and TypeScript declarations under `dist/lib`, plus the deployable documentation site under `dist/site` with `index.html` at that root.

## Deploy

Deploy `dist/site` as a static site. For the factory's Azure Static Web Apps deployment, the included `staticwebapp.config.json` applies content-security, permissions, referrer, cache, `/demo`, and styled 404 response policies; `_headers` mirrors applicable headers for compatible static hosts. The factory owns registry publishing and deployment credentials; contributors should not publish directly.

## Privacy and scope

Projects are stored in the current browser unless exported. Read the in-app [privacy page](https://a11y-playtest-captioner.sociobot.in/privacy/) and [terms](https://a11y-playtest-captioner.sociobot.in/terms/). This tool supports authoring and rehearsal; it does not replace testing with disabled players and does not claim conformance with any standard.

## License

MIT. See [LICENSE](./LICENSE).
