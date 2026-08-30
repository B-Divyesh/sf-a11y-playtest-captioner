# A11y Playtest Captioner

A TypeScript library and local workspace for browser-game creators. Author localized captions and test action order with a keyboard.

It does not inspect a canvas, write descriptions, or certify accessibility. Authors decide what each game state needs to say.

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

Use language tags such as `en`, `es`, or `pt-BR` for localized strings. Each state and action can use its own fallback language. The spoken language matches the action text being read.

Speech uses your browser’s speech feature. Project content and speech text are not sent to a product service. `mount()` adds a hidden screen-reader status message near your canvas. Use `{ liveRegion: false }` when your game already announces changes.

## Public API

- `createCaptioner(options)` starts an isolated captioner.
- `register(state)` and `registerMany(states)` add validated states.
- `activate(id)` selects a state and announces its description.
- `setLocale(tag)` selects the best available language.
- `moveFocus(direction)` follows the authored action order.
- `speak()` reads the current state and action with browser speech.
- `mount(element, options?)` manages a status message beside the game.
- `connectKeyboard(target?)` enables the documented review keys.
- `getSnapshot()` and `subscribe(listener)` provide current state.
- `destroy()` removes generated listeners and elements.

See the exported TypeScript types for the complete contract. Invalid IDs, language tags, duplicate state or action IDs, and blank descriptions throw `CaptionerValidationError`. Each message names the invalid field.

## Local authoring site

Try the sample at <https://a11y-playtest-captioner.sociobot.in/demo>. It contains the two-state Signal Hollow project.

The demo uses separate browser storage. Sample data never changes your real draft. **Free: no account or payment is needed to use the demo.** Choose **Start for real** to discard demo data and open an empty workspace. The workspace works offline after the first visit.

```sh
npm install
npm run dev
```

Open the printed local URL. The demo makes no cross-origin product requests while you author, import, or use browser speech.

## Test, build, and package

```sh
npm test
npm run build
npm pack --dry-run
```

`npm test` runs unit, package, claim, and browser checks. `npm run build` writes the library to `dist/lib`. It writes the site to `dist/site`.

## Deploy

Deploy `dist/site` as a static site. The included host configuration provides the site’s route, cache, and security policies. The factory owns registry publishing and deployment credentials.

## Privacy and scope

Projects stay in the current browser until you export them. Read the in-app [privacy page](https://a11y-playtest-captioner.sociobot.in/privacy/) and [terms](https://a11y-playtest-captioner.sociobot.in/terms/). This tool supports authoring and rehearsal. It does not replace testing with disabled players or claim conformance with any standard.

## License

MIT. See [LICENSE](./LICENSE).
