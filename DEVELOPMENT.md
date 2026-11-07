# Development and delivery

The current player reference is [README.md](README.md), with exact rules in generated [BALANCE.md](BALANCE.md) and [balance-report.json](balance-report.json). Historical experiments and proposals are labeled separately. [AGENTS.md](AGENTS.md) governs reviewed commits, archive verification and publishing.

## Balance ownership

[BALANCE_CONFIG.md](BALANCE_CONFIG.md) maps the shared configuration, activity/asset catalogs and mechanic modules. `npm run check:balance` validates content before build; `npm run report:progression` measures configured Zone 1–5 gear profiles. Dungeon definitions supply independent layouts, unlocks, prices and Sigil wallets. Existing save locations remap through stored layout snapshots.

## Build ownership

`npm run build` compiles the source modules, data, CSS and embedded art into the standalone root `index.html`. The current engine/template also lives in that file; do not discard it when building. `scripts/sync-systems.cjs` defines module order and validates the resulting JavaScript. A function has one current source definition; duplicate source definitions fail the build instead of silently letting a later patch win.

Prefer changing the owning `src/` module. Do not edit only the compiled copy of a module function: the next build replaces it. The build still retains save/API adapters with older internal names such as `zoneShopFor`; player-facing names are Dungeon Shop and Dungeon Sigils. These adapters and historical migration ledgers remain intentional compatibility code.

| Area | Current source |
| --- | --- |
| Skill/style data, limits, recipes | `src/game-data.json`, `src/systems.js`, `src/zone-progression.js` |
| Refinement costs, power and rank migration | `src/refinement-economy.js` |
| Tier-3 promotion and resources | `src/tier-three.js` |
| Current crafting rows, jewelry and tools | `src/crafting-update.js`, `src/equipment.js` |
| Skill curve, active work and direct swaps | `src/skill-progression.js`, `src/workshop.js`, `src/work-navigation.js` |
| Active discoveries | `src/skilling-bonuses.js` |
| Dungeoneering milestones and earned clocks | `src/time-progression.js` |
| Dungeon perks, prices and adapters | `src/zone-abilities.js`, `src/zone-shop.js`, `src/zone-shop-ui.js` |
| Preparation, recipe tracking and ingredients | `src/preparation.js`, `src/preparation-economy.js`, `src/zone-materials.js` |
| Loot, pickup and vouchers | `src/loot.js`, `src/ground-loot.js`, `src/specific-vouchers.js` |
| Blessing store and active display | `src/blessing-shop.js`, `src/temporary-buffs.js`, `src/rare-elites.js` |
| Layouts, scenery and creature families | `src/zone-layout.js`, `src/environments.js`, `src/deep-encounters.js` |
| Standard attacks and support streams | `src/encounters.js`, `src/combat-expansion.js` |
| Themed mechanics, effects and siphons | `src/themed-encounters.js`, `src/themed-encounter-art.js`, `src/ability-effects.js`, `src/siphon-tethers.js` |
| Hit geometry, damage and enemy health | `src/player-hitbox.js`, `src/encounter-damage.js`, `src/encounter-health.js` |
| Elite tasks, positioning and released attacks | `src/elite-behaviors.js`, `src/enemy-positioning.js`, `src/released-attacks.js` |
| Mechanic contracts, overlap and tactical rewards | `src/mechanic-contracts.js`, `combat.mechanics` in `src/balance-config.json`, [MECHANICS_BIBLE.md](MECHANICS_BIBLE.md) |
| Dashes and travelling mechanics | `src/dash-counters.js`, `src/travelling-mechanics.js`, `src/zone-challenge.js` |
| Offscreen warnings, floor travel and defeat navigation | `src/offscreen-threats.js`, `src/delve-travel.js`, `src/delve-update.js` |
| Combat engine and rendering | `src/dungeoneering.js`, `src/mechanic-presentation.js`, `src/ability-conveyance.js` |
| Ammunition and healing motes | `src/ammunition.js`, `src/restoration.js` |
| Navigation, menus, touch and tooltips | `src/presentation.js`, `src/arena.js`, `src/mobile.js` |
| Codex and shared current explanations | `src/codex.js`, `src/guide-rules.js`, `src/progression-guidance.js` |
| Character rig, appearance and loading | `src/avatar-rig.js`, `src/character-creator.js`, `src/loading.*`, `src/loading-runtime.js` |

Shared descriptions read rule values such as `SUMMON_BUMPS`, `JEWELRY_REFINEMENT` and `TOTEM_SUPPORT`; use those values rather than copying outdated percentages into another guide. Guardian Codex libraries use the guardian's own theme instead of the player's current Zone. General Guides remain readable; collection discovery remains separate.

## Validation

```sh
npm ci
npm run build
npm test
npm run report:skills
npm run report:balance
```

Use system Chromium or set `CHROMIUM_PATH`; install Playwright Chromium only if needed. `tests/ability-conveyance.cjs` checks cast-clock buildup, later-strike emphasis, distinct lifecycle stages, exact visual footprints, random/state purity and reduced-motion/layout behavior. `npm run review:conveyance` captures the actual renderer through buildup, commitment and activity.

`tests/mechanic-bible.cjs` covers every ability contract, grouped released-threat limits, recovery, anti-chain stagger, optional opportunities, dash interrupts and four viewport sizes. Browser suites cover progression, actual paid production and combat, saves/migrations, native gesture suppression, touch/keyboard navigation, encounters, appearance and all-zone pacing. Runtime fixtures are injected into isolated browser responses and must never be embedded in the public standalone.

`tests/current-experience.cjs` exercises the current guide/menu loop, named guardian libraries, tier/tool details, loot receipts and focus restoration. `tests/equipment-edge-cases.cjs` covers health-preserving jewelry swaps, live stat caches, body-range ammunition and current weapon previews. `tests/animation-balance.cjs` exercises all work release/resume transitions, real keyboard/touch cancellation, empty-ammo poses, in-flight enchantment ownership and paid enchantment gains. `tests/ux-flow.cjs` covers tier-aware source links, paid DPS previews, repeated keyboard purchases, voucher focus, menu scroll memory, live material search and small-screen fitting. Existing economy, jewelry, input and encounter suites retain their precise rules. Rendering and input tests should not be run with heavy simultaneous browser workloads; timing assertions use real input.

Full-Zone pacing suppresses incoming damage and replenishes HP. It measures combat time rather than human survival or wall-clock completion. Keep the report's build and standalone hash with the measurements. Historical preparation/survival comparisons must remain clearly labeled; do not present them as freshly retested balance.

Rebuild once more after validation and verify identical standalone bytes. When game behavior or content changes, update `downloads/Idle_or_Dungeoneer_Latest.zip` with only the built `index.html` and short launch instructions. Check archive CRC, exact embedded HTML, reviewed staged paths and private-data exclusion before committing. Verify remote `main`, the GitHub ZIP bytes and the Pages deployment after pushing. Local test output belongs in ignored `test-results/`; personal saves and private diagnostics never belong in Git.

For iOS Safari/in-app review, hold gameplay for at least five seconds, drag over a discovery or through the arena, then release, cancel, rotate or switch apps. Check that work/movement stops and Copy/Look Up does not appear. Separately swipe long menus and edit/copy/paste in fields and save controls. Chromium touch automation cannot verify the operating system's Safari callout UI.

## Art and reviews

Common combat sprites live in `assets/effects/combat/`, authored by `scripts/export-combat-fx.py`. Run `npm run art:combat-fx` after changing their shapes or palettes, then build. `src/combat-fx-art.js` owns cached drawing, explicit ground/projectile anchors and physical spire states; `src/ability-effects.js` owns their standard-attack composition. `npm run review:combat-materials -- --motion` captures the asset atlas, spire states and a scripted motion reel. `tests/combat-materials.cjs` covers startup readiness, cached drawing, image anchors, fallback visibility, clock/reduced-motion behavior, unchanged bump counts and disabled-state quieting.

`scripts/effect_artwork.py` owns the current illustrated material props; `scripts/export-themed-effects.py` builds the four palettes, matching Codex medallions and embedded image catalog. `src/ability-artwork.js` owns bounded decorative poses and field details. Gameplay geometry and deadlines remain in the mechanic modules. `npm run review:artwork -- --motion` captures the prop studies, phone examples and scripted motion reel. `tests/ability-artwork.cjs` checks cached-image rendering, stable rotation/projectile anchors, reduced motion, clipped openings, render purity and viewport fitting.

The existing `art:*` and `review:*` commands in `package.json` export art and capture the actual renderer. Most motion reviews accept `-- --stills`; recording needs Playwright video support and FFmpeg. Source work atlases live in `assets/skilling/`; actor, navigation and encounter assets retain their source catalogs in `assets/` and `src/*-art.*`.

Use the closest existing review for a change rather than regenerating every preview. Preserve reduced-motion states, clear teal openings, purple tactical damage and yellow interrupt targets. Shared equipment silhouettes and articulated hands must remain joined across combat, work, Inventory and Appearance. [CHARACTER_ART.md](CHARACTER_ART.md) describes attachment and animation checks.
