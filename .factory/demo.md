# Demo sandbox

Open [the demo route](https://a11y-playtest-captioner.sociobot.in/demo) or append `?demo=1` to the home URL. The landing-page **Try it with sample data** action opens the same sandbox in one click.

The demo starts with the two-state Signal Hollow project:

- Ravine crossing has English and Spanish descriptions plus Loose rope and Anchor post cues.
- Watcher alert has English and Spanish descriptions plus a Stone cover cue.

Demo changes use only `demo:a11y-playtest-captioner:project:v1` in local storage. The ordinary workspace uses `a11y-playtest-captioner:project:v1`; demo mode never reads or writes that key. The persistent demo banner supplies **Reset demo**, which restores Signal Hollow, and **Start for real**, which removes the demo key before opening the ordinary workspace.

The service worker precaches the `/demo` shell after the first visit, so the sample workspace remains available during an offline reload. Claim checks in `.factory/claims.json` exercise every documented promise from this route in fresh browser contexts.
