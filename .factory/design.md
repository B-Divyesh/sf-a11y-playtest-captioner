# Visual thesis: luminous glass data landscape

## Product idea

The interface treats each authored game state as a bright, readable signal suspended over a quiet midnight playfield. Thin routes connect state, language, and action order, making the invisible accessibility layer feel concrete without pretending to inspect the game itself. Glass is used only where it explains separation between the authored layer and the imagined canvas below it.

## Palette

This is an intentionally single-mode, dark authoring environment. It reduces glare during long game-testing sessions and lets the active state read like a lit caption monitor.

| Token | Value | Use |
| --- | --- | --- |
| Night field | `#07111f` | Page background |
| Deep pane | `#0d1b2a` | Opaque fallback and controls |
| Glass pane | `rgba(16, 35, 52, .78)` | Editor and review surfaces |
| Frost line | `#36516a` | Borders and inactive routes |
| Signal cyan | `#5de4d0` | Primary action, current position, focus |
| Signal ink | `#04201d` | Text on cyan |
| Aurora lime | `#c9f27b` | Success and saved state |
| Amber beacon | `#ffd27a` | Warnings and offline status |
| Coral fault | `#ff9a9f` | Destructive and validation errors |
| Ice text | `#f2f8fb` | Primary text |
| Mist text | `#b7c8d4` | Secondary text (contrast checked on panes) |

Primary text is at least 12.9:1 against the field; mist text is at least 8:1. Signal cyan is used with dark ink for filled controls, never as small text on a pale surface.

## Type

- **Interface and prose:** Atkinson Hyperlegible, self-hosted WOFF2, regular and bold. Its differentiated letterforms suit accessibility work and its open license permits bundling.
- **Data labels and code:** ui-monospace/system monospace. Used sparingly for language tags, IDs, and numeric position markers.
- Scale: 14, 16, 18, 22, 30, and responsive 48–68px. Body stays at 16px minimum. Long text is capped near 68 characters.

## Spacing and shape

- 4px base rhythm; common gaps are 8, 12, 16, 24, 32, 48, and 72px.
- Controls are at least 44px high; fields use 12px corners; large independent panes use 20px corners.
- The desktop editor is a three-part signal path: compact state rail, authoring canvas, live rehearsal monitor. At 900px they stack; on 390px the rail becomes a horizontal strip and secondary decoration drops away.

## Interaction grammar

- Cyan marks the one primary action in a region. The selected state has both a cyan route marker and textual “Active” status.
- Focus uses a 3px cyan outer ring plus a dark separation ring, visible on every surface.
- Editor changes save immediately and confirm through a polite status line. Destructive state deletion names the state and offers a short undo window.
- In rehearsal, `ArrowLeft`/`ArrowRight` move through the authored focus order, `Home`/`End` jump, and `S` speaks. Screen-reader announcements and visible position always agree.

## Motion policy

State selection and panel updates use 180ms opacity/translate transitions that follow the selected route. Save confirmation uses a single 220ms glow. There is no looping animation. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are immediate; the hierarchy remains through borders, labels, and luminance.

## Original asset plan and provenance

- `site/public/hero-caption-landscape.webp` and its 480px responsive derivative: generated specifically for this product with the factory image deployment on 2026-08-27, then locally converted to WebP. Prompt: “Abstract luminous glass data landscape for a browser game accessibility authoring tool; a dark navy isometric playfield with translucent cyan caption planes, ten small connected state beacons, and one warm lime objective path; editorial 3D glass illustration, crisp restrained geometry, deep negative space, no people, no game-brand references, no words, no letters, no UI screenshot, no logos, no watermark; wide 16:10 composition.” Licensed for use as a generated project asset under the product’s MIT distribution.
- `site/public/social-card.jpg` and `site/public/apple-touch-icon.png`: 2026-08-30 crops of that same original generated landscape, composed locally at 1200×630 and 180×180 respectively for social previews and device bookmarks. No external asset or text was introduced.
- All interface symbols are hand-authored inline SVG using simple geometric paths, decorative where labels already provide meaning.

The hero image explains the core mental model—intentional descriptions laid over game state—rather than decorating a generic marketing card.
