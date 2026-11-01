# Idle or Dungeoneer

**[Play in your browser](https://mefforts.github.io/idleordungeoneer/)** · **[Download the latest game (ZIP)](https://github.com/mefforts/idleordungeoneer/raw/refs/heads/main/downloads/Idle_or_Dungeoneer_Latest.zip)** — extract it and open `index.html` in a modern browser.

The game, environments, creatures, equipment and icons are embedded in one HTML file. The downloaded build needs no installation or internet connection. `npm start` serves it locally if you prefer a consistent browser save origin.

For iPhone and iPad, enable **Settings → Pages → Deploy from a branch → main → /(root)**, then open **https://mefforts.github.io/idleordungeoneer/** in Safari. Use **Share → Add to Home Screen** for a game icon. The root `.nojekyll` marker serves the standalone game without Jekyll processing. The first Pages deployment must finish before the URL works; its result appears under **Actions → pages build and deployment**. Use the in-game save backup/restore when moving between downloaded files and the website.

![Mobile touch movement and full-size navigation](preview-mobile-controls.png)

[Inventory](preview-inventory-mobile.png) · [Materials](preview-inventory-materials.png) · [Zone abilities](preview-zone-abilities-mobile.png) · [Intro](preview-intro-mobile.png) · [Counterplay themes](preview-encounter-themes.png) · [Healing stream](preview-totems.png) · [Phone elite group](preview-encounters-mobile.png) · [Floor progression](preview-floor-progression.png) · [Phone environment](preview-environments-mobile.png) · [Desktop Zone Shop](preview-zone-abilities.png) · [Skills](polish-mobile-gather.png) · [Codex](polish-reading.png)

## Zone abilities

Each Zone Shop offers **four themed abilities**, with sixteen distinct illustrations and Codex entries across the four environments. Open the **wisp pin**, your seal counter or **B**. Each exact Zone keeps its own wallet and purchased ranks, even when later Zones repeat an environment.

| Zone | Abilities |
| --- | --- |
| The Overgrowth | Briar Venom · Grasping Roots · Bramble Sweep · Barkskin |
| Embervault | Cinderbrand · Slagburst · Searing Shot · Basalt Guard |
| Hollow Crypt | Soul Chain · Grave Chill · Soulburst · Bone Ward |
| Astral Rift | Arc Rift · Mirrorcast · Phase Sweep · Astral Ward |

Ordinary monsters rarely drop seals: **4% chance of one**. Elites guarantee **6**, and guardians **12 / 20 / 35**. Most seals come from these larger fights. Fortune Mastery raises the regular drop chance to **5.6%** at rank four.

The shop focuses on elemental effects, additional targets/projectiles and themed protection. Ordinary damage, speed, health, critical chance, gold, XP and similar purchases have been removed. Earlier ranks that are no longer available, including ranks above revised limits, refund their exact original cost to their original Zone wallet once. Retained abilities, equipment and progression are preserved. Existing equipment and jewelry provide their established statistics.

**Dungeoneering level and XP are global and persistent.** Level 2 needs 1,600 total XP; level 3 needs 6,400. Progress slows at higher levels, with one Mastery point per level. Leveling and the first Mastery unlock leave combat running. XP orbs never expire: positions and values survive activity changes, retries and returning to a Zone. Encounter completion collects the remaining XP exactly once.

**Dungeoneering Mastery** is a separate shared, refundable bank. Guardians grant 1 / 1 / 2 points. Onslaught unlocks spawn settings, Fortune improves seal drops, and Discovery improves rare-material drops. These change dungeon configuration and rewards rather than attack damage or protection. Its HUD shortcut shows unspent Mastery points; Essence remains an enchanting material.

The first guardian unlocks **1× / 2× Delve speed**. Mastery speed affects combat only. The **mefforts** testing code unlocks **separate 1×–500× Delve and Skilling speed controls**. Use the speed pin in a skill scene to accelerate active gathering, crafting and online idle production; its setting stays independent of Delve speed, even after redeeming the code. Existing testing unlocks and **max** include this automatically. Offline earnings and the time to collect active bonuses keep real-time timing. Both speeds start at 1× each launch.

## Equipment and pacing

| Build | Zone 1 / Iron | Zone 2 / Steel |
| --- | ---: | ---: |
| Maximum equipment, base proficiency | 80 DPS | 160 DPS |
| Dedicated equipment training | ~86 DPS | ~173 DPS |
| Single-target soft budget | 100 DPS | 200 DPS |

Weapon refinement, attack-speed training, proficiency and matching crafting levels provide core damage. Above the Zone’s single-target budget, each extra calculated DPS contributes at 25%; real hit damage uses the same adjustment. Conditional elemental damage and additional targets can add more. Abilities have finite ranks and increasingly expensive prices.

| Zone | Target at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~10 minutes | ~80 |
| 2 | ~20 minutes | ~160 |
| 3 | ~30 minutes | Current Steel reference |
| 4+ | ~35–40 minutes | Current Steel reference |

References use complete Iron / Steel equipment at base proficiency, with no required Zone abilities. Movement, menus, deaths, preparation, cleaves and speed settings affect real completion time. [BALANCE.md](BALANCE.md) explains the paths, rank costs and live simulations; [balance-report.json](balance-report.json) includes exact weapon, shop and economy values. Later equipment progression remains reserved.

Ordinary monsters drop **no gold**. Baseline clears pay **191 gold in Zone 1 / 293 in Zone 2**, mainly from guardians and floor caches, before elites and jewelry. Scavenging remains another gold source. Fractional rewards survive reload; existing balances and crafting costs are preserved.

## Zone scenery and creatures

The four authored Zones now have **27 visual assets each, up from 9**: **108 total**, including **72 new illustrations**. This scenery expansion leaves gear, loot and regular-monster combat values unchanged. Guardian mechanics are described below.

| Per Zone | Before | Now |
| --- | ---: | ---: |
| Scenery objects | 4 | 12 |
| Regular creature appearances | 1 | 6 |
| Guardian appearances | 3 | 3 |
| Ground textures | 1 | 3 |
| Ground-detail patches | 0 | 3 |
| Total | 9 | 27 |

Each floor changes the terrain, scenery mix and regular-creature mix gradually. Overgrowth moves from woodland to rooted ruins and the Elder Grove; Embervault from ash to the foundry and molten heart; the Crypt from graves to vaults and the Sovereign’s sanctum; the Rift from fractured approaches to starlit ruins and the Unmade threshold. Ground litter groups around larger landmarks, and starting areas retain open walking space. Later Zones that repeat a biome receive their own seeded layout.

New creatures scuttle, sway, hop, prowl or hover, with reduced-motion support. Their appearance does not change wave health, speed, rewards or boss mechanics. Scenery uses foot-level collision and fades when it would hide the player or nearby enemies. Ground details stay beneath characters and telegraphs. Zone Codex pages list the floors and creatures.

[Compare all twelve floor scenes](preview-floor-progression.png). Source sheets, sprite-isolation metrics and the asset catalog are in `assets/environments/`. `npm run art:environments` exports transparent WebP cutouts and terrain textures into `src/environment-art.js`; `npm run review:environments` captures the actual game renderer. Runtime placement, floor palettes and creature animation are in `src/environments.js`.

## Minimal runestone interface

Gameplay uses outlined information and isolated controls with transparent backing. Delve, Inventory, Skills, Zone Shop, Codex, Settings, Pause and unlocked speed occupy a circular icon rail. The dungeon entrance, satchel, wisp and raised play/pause medallions use over 90% of each button’s space. **Settings → Navigation** selects either side and reorders pins with dragging or arrows. Titles sit at the top center, health/XP on the left, and warnings/messages below them. The message icon reopens the latest 40 notices.

Menus use warm stone, leather and brass. Carved runestone buttons and headers keep hard corners; painted medallions frame the icons. All **106 collection entries** have distinct artwork. Tooltips, native buttons, focus restoration and accessible labels support keyboard and touch navigation. Detailed explanations stay in the Codex.

**Inventory** shows the worn set, actual Zone DPS, health, attack speed and reach. Touch anywhere on a weapon’s main card or an owned armor card to equip it; the separate book button opens details. Weapons, armor, jewelry and materials have their own tabs. Materials show live quantities and link to their source; style training expands when needed. Books return you to the same recipe, shop, search or unapplied Mastery allocation.

## Gathering and crafting

A small link below the idle-unlock notice guides new players to craft a stronger weapon. It stays until their first weapon craft or refinement, then remains dismissed across reloads.

**Skills** organizes each discipline into Gather, Refine, Equipment and Tools. Hold the work control, scene or Space. Active material bonuses can be tapped, dragged over, or collected with Enter/Space while focused. Forge sparks, twigs, glistens and similar crafting bonuses advance the cycle by **35%**, while still consuming ingredients. A second finger can collect bonuses while the first keeps working.

Resource costs link to their sources, and tracked recipes follow you back to the crafting bench. Every skill hub and activity has a direct **Idle** button. The first slot unlocks at **Zone 1, Floor 2**, with a notice linking directly to Skills. The second opens at Zone 10. Assigned tasks continue during combat and menus, with up to eight hours offline; missing ingredients pause refining.

Crafted pickaxes, hatchets and mattocks equip automatically, appear in gathering scenes, work **8% faster actively**, and add one material to gathering bonuses. Each station has five upgrades, each granting **2% ingredient conservation and 3% work speed**. Conservation carries between crafts until it saves a whole ingredient; viewing costs never consumes that credit.

Clear Zone 1 to unlock the second resource tier in every discipline. The gate applies to active, idle and offline work, armor recipes and promotions.

| Discipline | Zone 2 gathering / refining |
| --- | --- |
| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar |
| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows |
| Scavenging | Ancient Salvage; 2 salvage → 2 Ancient Fragments |
| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 cloth + 2 fragments → 10 runes |
| Artisan | Rough Garnet → Cut Garnet |

All 20 activities support their appropriate scenes, active bonuses and visible tools. Existing starter recipes cross disciplines too: arrows use oak and iron; runes use cloth and fragments; armor uses different proportions of cloth, metal and wood. Existing opal jewelry remains available.

## Weapons and armor

One weapon selects your Melee, Ranged or Magic style. Each style has separate refinement, speed, reach, enchantment and proficiency. Iron caps at refinement **10**, speed/reach **5**, reinforcement **5** and enchantment **2**. Steel caps at **20 / 10 / 10 / 4**. Clear Zone 1, reach refinement 10 and crafting level 10, then pay a Steel promotion to open the next ranks for that style.

Combat proficiency grants up to **3% damage** and matching crafting levels up to **5%** more. Equipment-only dedicated limits are approximately **86 / 173 DPS**. Zone elemental upgrades work with every combat style.

Armor equips independently of the weapon. Warrior, Ranger and Mage each have two illustrated sets: Iron/Steel armor, Plain/Cured leathers, and Linen/Blue Wool robes. The worn set supplies its own health and protection, movement or Magic bonus. Reinforcement adds 8 HP per rank, limited by that set’s tier. Switching owned armor never heals you. Promotions change held weapon art; bows aim toward targets while retreating, and articulated hands, collars and weapon grips stay joined across poses.

## Guardians and elites

Guardians combine area-themed projectiles, ground strikes and beams with three kinds of counterplay:

- **Reflect wards:** enter the pale shield at the center before its ring completes. Return **12% of the caster’s maximum HP** and stagger it for **1.6 seconds**. The surrounding ring is dangerous; escaping the whole mark is also safe. The core absorbs hostile projectiles during the warning.
- **Healing totems:** stand in the stream between totem and guardian to divert **2% of your maximum HP per second**. Left alone, it restores **0.8% of the guardian’s maximum HP per second** for six seconds.
- **Power totems:** an uninterrupted stream gives its guardian **12% stronger attacks**. Intercept it for **10% more hit damage**, refreshed for five seconds. This conditional bonus never changes permanent equipment or Zone training.

Totems can be destroyed with any weapon. Move close to focus attacks on one, including when a bow or staff is already tracking a guardian. Totems give no loot, XP or wave credit; streams and intercepted bonuses do not stack. Encounter objects clear on defeat, retry and floor transitions. Menus and skilling pause their combat clock.

The first guardian uses three distinct patterns, the second four. Floor overlords use four; the Zone’s final overlord uses all six and attacks faster below 40% health. Up to two attacks can wind up together. A reflect mark reserves a clear cast window and waits for existing ground hazards to expire. Marks avoid scenery and occupied enemy positions when placed.

Known guardians return as smaller elite echoes: **up to one per wave on Floor 1, two on Floor 2 and three on Floor 3**. Different known guardians are favored before repeats. Echoes replace ordinary wave enemies, retain reduced pattern sets and grant seals/gold without duplicate Mastery or Essence.

Each area has its own painted reflect ward, healing totem and power totem, alongside its themed attack effects: green briars and spring blossoms, amber basalt and furnaces, violet soul fonts and grave idols, or cyan starwells and prisms. Source art and export metrics are in `assets/encounters/`; `npm run art:encounters` rebuilds embedded sprites, and `npm run review:encounters` captures all twelve mechanics in combat. Full descriptions stay in guardian Codex entries. Burn retains visible flames and orange damage numbers.

## Controls and saves

| Action | Controls |
| --- | --- |
| Move | Touch anywhere in the arena and drag; release to stop. WASD/arrows and mouse also work |
| Dash | Two short drags in the same direction, double tap a movement key, Space or Dash |
| Work | Hold work control, scene or Space |
| Collect active bonus | Tap, drag, Enter/Space on focused bonus |
| Skills / Inventory / Codex / Zone Shop | G / E / C / B |
| Return to delve | D or Delve pin |
| Close menu / pause | Escape |

Saves retain the `deepwell-prototype-v1` key. Settings provides backup/restore and reduced motion. Back up and restore your save when moving between browser origins or downloaded filenames.

Existing power ranks migrate into their saved Zone, and pending choices convert to seals. Earned XP becomes global XP while uncollected orbs stay separate. Old biome Mastery banks are pooled; duplicate allocations are refunded. Migration runs once and archives the old Zone/Mastery record. Equipment, materials, gold and XP caches remain. Older excess equipment ranks and unavailable armor remain archived under the existing tier rules.

The **max** testing code unlocks **Settings → Test travel**, marks all four authored dungeons complete, funds their shops and enables separate 1×–500× Delve and Skilling speed controls. Travel grants no clear reward and retains purchased training in each Zone. Testing unlocks persist; redeem max again on an older testing save to fund the new wallets.

## Development and validation

Builds are committed to GitHub with the standalone ZIP in `downloads/`. [AGENTS.md](AGENTS.md) describes public-file review and delivery verification. Cloud drafts and website deployments are separate.

```sh
npm ci
# If system Chromium is unavailable:
npx playwright install chromium
npm run build
npm test
npm run report:balance
npm run review:ui
```

Zone shops, global XP, migration and combat math live in `src/zone-shop.js`; shop UI/styles in `src/zone-shop-ui.js` and `src/zone-shop.css`. Player presentation and Codex remain in `src/presentation.*` / `src/codex.js`. Skill definitions live in `src/game-data.json`, tier rules in `src/zone-progression.js`, and the shared character rig in `src/avatar-rig.js`. Gold rewards are in `src/economy.js`; test travel in `src/testing.js`. Guardian patterns, counterplay and elite scheduling live in `src/encounters.js`, with embedded sprites in `src/encounter-art.js`. Mobile controls, navigation and material inventory live in `src/mobile.js` / `src/mobile.css`; themed ability definitions, migration and pricing in `src/zone-abilities.js`. The original engine and compiled standalone output are in `index.html`.

Fifteen browser suites cover saves/migration, exact-Zone isolation, no automatic buff modals, actual damage/cadence across all weapons, equipment limits, shop costs, global Mastery, all activities, active bonuses, touch/keyboard controls, Idle navigation, bosses, rewards, layouts and 106 distinct painted collection icons. Counterplay tests cover reflect timing, stream geometry, all six weapons, cleanup, overlap limits and phone placement. Real touch tests cover movement, cancellation, multiple fingers, whole-card gear selection, guidance and over 90% visible icon coverage on both rail sides. Full combat simulations verify the first four Zones and later pacing. Static encounters, biome and jewelry definitions remain guarded by a manifest.

Generated icon sheets, calibrated regions and alignment metrics live in `assets/icons/`. `python3 scripts/measure-icon-bounds.py` measures the medallions without altering source art; `npm run art:icons` exports embedded WebP badges. `scripts/export-equipment.py` packs rig textures using Pillow, NumPy and SciPy. Use `CHROMIUM_PATH` for a custom browser. Local test output stays in ignored `test-results/`.
