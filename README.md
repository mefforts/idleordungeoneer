# Idle or Dungeoneer

**[Download the latest game (ZIP)](https://github.com/mefforts/idleordungeoneer/raw/refs/heads/main/downloads/Idle_or_Dungeoneer_Latest.zip)** — extract it and open `index.html` in a modern browser.

The game, environments, creatures, equipment and icons are embedded in one HTML file. Playing needs no installation or internet connection. `npm start` serves it locally if you prefer a consistent browser save origin.

![Open gameplay](polish-combat.png)

[Zone Shop](polish-shop.png) · [Phone shop](polish-mobile-shop.png) · [Skills](polish-mobile-gather.png) · [Equipment](polish-equipment.png) · [Codex](polish-reading.png)

## Persistent Zone training

Combat no longer offers temporary power cards. Ordinary monsters have a **40% chance to drop one Zone seal**; elites guarantee **3**, and guardians **8 / 12 / 20**. Open the **Zone Shop** using its rail pin, your seal counter or **B**. Each Zone has a separate wallet and section, with illustrated currency, upgrade ranks, current/next effects, prices and actual DPS previews.

| Zone | Currency |
| --- | --- |
| The Overgrowth | Verdant Seals |
| Embervault | Ember Seals |
| Hollow Crypt | Soul Seals |
| Astral Rift | Rift Seals |

Purchased ranks persist through defeat, travel, replay and reload. They apply only in their exact Zone; even later Zones that repeat an environment have separate wallets and ranks. Future shops can be previewed before unlocking them. Books open detailed upgrade rules without making a purchase.

**Dungeoneering level and XP are global and persistent.** Level 2 needs 1,600 total XP; level 3 needs 6,400. Progress slows at higher levels, with one Mastery point per level. Leveling and the first Mastery unlock leave combat running. XP orbs never expire: positions and values survive activity changes, retries and returning to a Zone. Encounter completion collects the remaining XP exactly once.

**Dungeoneering Mastery** is a separate shared, refundable bank. Guardians grant 1 / 1 / 2 points. Onslaught unlocks spawn settings, Fortune improves seal drops, and Discovery improves rare-material drops. These change dungeon configuration and rewards rather than attack damage or protection. Its HUD shortcut shows unspent Mastery points; Essence remains an enchanting material.

The first guardian unlocks **1× / 2× Delve speed**. Mastery speed affects combat only. The **mefforts** testing code unlocks **separate 1×–500× Delve and Skilling speed controls**. Use the speed pin in a skill scene to accelerate active gathering, crafting and online idle production; its setting stays independent of Delve speed, even after redeeming the code. Existing testing unlocks and **max** include this automatically. Offline earnings and the time to collect active bonuses keep real-time timing. Both speeds start at 1× each launch.

## Equipment, shops and pacing

| Build | Zone 1 / Iron | Zone 2 / Steel |
| --- | ---: | ---: |
| Maximum equipment, base proficiency | 80 DPS | 160 DPS |
| Shop training with an unrefined weapon | ~87 DPS | ~174 DPS |
| Ordinary combined build | ~98 DPS | ~198 DPS |
| Recommended build budget | 100 DPS | 200 DPS |

The shop example uses Heavy Strikes 7, Quick Hands 3 and Keen Edge 3. Crafted equipment and Heavy Strikes offer alternative damage paths: the stronger increase applies fully, plus 15% of the weaker. Above the Zone’s build budget, additional calculated single-target DPS contributes at 25%. The same adjustment applies to actual attacks, so the HUD and purchase previews show the damage you receive.

Early shop ranks are affordable. High ranks cost sharply more seals and can exceed the recommended range. Skilling remains a viable optional path with finite equipment upgrades, style proficiency and small crafting-level bonuses. Conditional effects and extra targets can add damage beyond the single-target figure.

| Zone | Target at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~10 minutes | ~80 |
| 2 | ~20 minutes | ~160 |
| 3 | ~30 minutes | Current Steel reference |
| 4+ | ~35–40 minutes | Current Steel reference |

References assume sustained single-target combat with modest shop ranks. Movement, menus, deaths, preparation, cleaves and speed settings affect real completion time. [BALANCE.md](BALANCE.md) explains the paths, rank costs and live simulations; [balance-report.json](balance-report.json) includes exact weapon, shop and economy values. Later equipment progression remains reserved.

Ordinary monsters drop **no gold**. Baseline clears pay **191 gold in Zone 1 / 293 in Zone 2**, mainly from guardians and floor caches, before elites and jewelry. Scavenging remains another gold source. Fractional rewards survive reload; existing balances and crafting costs are preserved.

## Minimal runestone interface

Gameplay uses outlined information and isolated controls with transparent backing. Delve, Equipment, Skills, Zone Shop, Codex, Settings, Pause and unlocked speed occupy a circular icon rail. **Settings → Navigation** selects either side and reorders pins with dragging or arrows. Titles sit at the top center, health/XP on the left, and warnings/messages below them. The message icon reopens the latest 40 notices.

Menus use warm stone, leather and brass. Carved runestone buttons and headers keep hard corners; painted medallions frame the icons. All **108 collection entries** have distinct artwork. Tooltips, native buttons, focus restoration and accessible labels support keyboard and touch navigation. Detailed explanations stay in the Codex.

**Equipment** shows the worn set, actual Zone DPS, health, attack speed and reach. Owned weapons can be compared directly. Armor and jewelry have separate tabs; style training expands when needed. Books return you to the same recipe, shop, search or unapplied Mastery allocation.

## Gathering and crafting

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

The first two floor overlords use **two telegraphed mechanics**; a Zone’s final overlord adds a **third**, has more health and attacks faster below 40% health. Warnings lock before damage and can be dodged. Overgrowth uses green thorns/roots, Embervault cinders/magma, Hollow Crypt violet souls/grave marks, and Astral Rift cyan stars/rifts.

Known bosses can return as smaller elite echoes, at most one per wave. They count toward completion and grant seals/gold without duplicate Mastery or Essence. Burn has visible flames and orange damage numbers; shop ranks improve its damage and duration.

## Controls and saves

| Action | Controls |
| --- | --- |
| Move | WASD, arrows, drag the arena, touch joystick |
| Dash | Double tap a direction, Space in combat, Dash button |
| Work | Hold work control, scene or Space |
| Collect active bonus | Tap, drag, Enter/Space on focused bonus |
| Skills / Equipment / Codex / Zone Shop | G / E / C / B |
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

Zone shops, global XP, migration and combat math live in `src/zone-shop.js`; shop UI/styles in `src/zone-shop-ui.js` and `src/zone-shop.css`. Player presentation and Codex remain in `src/presentation.*` / `src/codex.js`. Skill definitions live in `src/game-data.json`, tier rules in `src/zone-progression.js`, and the shared character rig in `src/avatar-rig.js`. Gold rewards are in `src/economy.js`; test travel in `src/testing.js`. The original engine and compiled standalone output are in `index.html`.

Twelve browser suites cover saves/migration, exact-Zone isolation, no automatic buff modals, actual damage/cadence across all weapons, equipment limits, shop costs, global Mastery, all activities, active bonuses, touch/keyboard controls, Idle navigation, bosses, rewards, layouts and 108 distinct painted collection icons. Full combat simulations verify the first four Zones and later pacing. Static encounters, biome and jewelry definitions remain guarded by a manifest.

Generated icon sheets, calibrated regions and alignment metrics live in `assets/icons/`. `python3 scripts/measure-icon-bounds.py` measures the medallions without altering source art; `npm run art:icons` exports embedded WebP badges. `scripts/export-equipment.py` packs rig textures using Pillow, NumPy and SciPy. Use `CHROMIUM_PATH` for a custom browser. Local test output stays in ignored `test-results/`.
