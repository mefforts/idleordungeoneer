# Combat asset library

The current library separates material illustrations from gameplay geometry. Images provide recognizable objects; runtime boundaries, arrows and brackets communicate the rules. New artwork must preserve timing, hit positions, counters and progression unless a separate gameplay change calls for them.

## Current collections

| Collection | Source and export | Runtime painter | Review |
| --- | --- | --- | --- |
| Themed props: 24 families × 4 palettes | `scripts/effect_artwork.py`, `npm run art:themed-effects` | `src/ability-artwork.js`, `src/themed-encounter-art.js` | [Prop studies](preview-ability-artwork.png) |
| Common combat: 10 families × 4 palettes | `scripts/export-combat-fx.py`, `npm run art:combat-fx` | `src/combat-fx-art.js`, `src/ability-effects.js` | [Combat materials](preview-combat-materials.png) |
| Support totems: 2 roles × 3 silhouettes × 4 materials | `scripts/support_artwork.py`, `npm run art:support` | `src/support-art.js` | [Support library](preview-support-library.png) |
| Elite instruments: 4 tasks × 4 materials | `scripts/support_artwork.py`, `npm run art:support` | `src/support-art.js`, `src/elite-task-art.js` | [Channel studies](preview-elite-instruments.png) |

Support materials change construction as well as color: living roots and leaves, riveted iron, carved bone and faceted crystal. Healing remains green with a cross; damage support remains red with a blade. Shrines, hanging lanterns and crystal altars share the same rules. Their style derives from a fixed world position, so rendering does not consume the gameplay random stream or depend on the camera.

Elite instruments identify Ascendance's brazier, Awakening's crown cradle, Conduit's portal and Siege's focusing battery. Ghosted instruments mark a travel destination; solid instruments accompany channeling. They are decorative extensions of the channeler. Yellow brackets and interruption hit markers remain on the enemy. Awakening sends small crowns toward its recruit; Siege no longer borrows Conduit's portal effect.

## Adding a support variation

1. Author a silhouette in `scripts/support_artwork.py`; keep major shapes readable at 40–70 pixels. Use shared material gradients and explicit role symbols before adding engraving.
2. Add its name and core anchor to `SUPPORT_VARIANTS`. The exporter writes [catalog.json](assets/effects/support/catalog.json), SVG files and the embedded `src/support-art-assets.js`. The runtime reads variant counts and core locations from that metadata.
3. Run `npm run art:support`, then `npm run build`. Assets remain embedded in the standalone HTML; no network request is needed during play.
4. Run `node tests/support-library.cjs` and the affected mechanic suites. Use `npm run review:support -- --motion` to inspect the actual renderer on a phone, plus the asset and channel galleries.

Support images use a `112 × 124` view box with ground at `(0, 0)` in source coordinates (`y = 112` in image coordinates). Source, catalog and runtime must agree on that anchor. Projectile images use centered anchors instead; do not substitute a ground-anchored prop for an airborne shot without an explicit frame.

## Presentation contract

Red means danger to the player, purple tactical damage to either side, teal a protected opening or benefit, yellow an interrupt opportunity, gold/white a reflect interaction, and blue a shield. Support beams additionally retain green healing crosses, red damage blades and blue speed chevrons. Material hue never replaces the mechanical signal. Do not write refuge instructions in moving pulse centers.

Decorative motion reads the combat clock and stays bounded. Menus and pause freeze it; reduced motion retains static material shapes. Disabled totems and depleted intercepted healing stop emitting motes. Images decode before play becomes interactive, are cached once, and retain a visible fallback if unavailable. Painters may not create targets, move actors, spend resources, advance attack clocks or call gameplay randomness. Interrupted channels leave no lingering instrument.

Preview fixtures contain synthetic states and are injected into isolated browser responses only. They never ship in the game or latest ZIP. See [MECHANICS_BIBLE.md](MECHANICS_BIBLE.md) and [DEVELOPMENT.md](DEVELOPMENT.md) for the broader contracts.
