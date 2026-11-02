# Idle or Dungeoneer

**[Play in your browser](https://mefforts.github.io/idleordungeoneer/)** · **[Download the latest game (ZIP)](https://github.com/mefforts/idleordungeoneer/raw/refs/heads/main/downloads/Idle_or_Dungeoneer_Latest.zip)** — extract it and open `index.html` in a modern browser.

The game, environments, creatures, equipment and icons are embedded in one HTML file. The downloaded build needs no installation or internet connection. `npm start` serves it locally if you prefer a consistent browser save origin.

**Build 10.0.1** protects gameplay holds from Safari text selection, highlighting and Copy/Look Up callouts. Mining and touch movement continue while held; releasing, cancelling or losing pointer capture stops them. Menus retain scrolling, keyboard controls and editable/save controls retain native behavior.

A lightweight loading screen appears before the embedded assets arrive and hands over to the intro when the first scene is ready. It supports reduced motion and offers retry if startup fails. [Phone preview](preview-loading-mobile.png) · [Desktop preview](preview-loading.png).

For iPhone and iPad, enable **Settings → Pages → Deploy from a branch → main → /(root)**, then open **https://mefforts.github.io/idleordungeoneer/** in Safari. Use **Share → Add to Home Screen** for a game icon. The root `.nojekyll` marker serves the standalone game without Jekyll processing. The first Pages deployment must finish before the URL works; its result appears under **Actions → pages build and deployment**. Use the in-game save backup/restore when moving between downloaded files and the website.

![Mobile touch movement and full-size navigation](preview-mobile-controls.png)

[Inventory](preview-inventory-mobile.png) · [Materials](preview-inventory-materials.png) · [Dungeon Shop](preview-dungeon-shop-mobile.png) · [Intro](preview-intro-mobile.png) · [Counterplay themes](preview-encounter-themes.png) · [Healing stream](preview-totems.png) · [Phone elite group](preview-encounters-mobile.png) · [Floor progression](preview-floor-progression.png) · [Phone environment](preview-environments-mobile.png) · [Desktop Dungeon Shop](preview-dungeon-shop.png) · [Skills](polish-mobile-gather.png) · [Codex](polish-reading.png)

## Dungeon Shop

**Build 10.0** replaces separate Zone shops with a shared **Dungeon Shop**. All current Zones belong to **The First Descent**; a future Dungeon can have its own wallet and perks. Open the wisp, the Dungeon Sigil counter or **B**. Purchased ranks remain active throughout this Dungeon.

Eight perks start unlocked: Ember Edge, Winter Thread, Soul Conductor, Fracture, Dungeon Ward, Battle Geometry, Echo Arts and Spellbreaker. Cold Verdict, Returning Power, Gravitation and Mirrorcraft unlock at Dungeoneering **3 / 5 / 8 / 12**. First ranks cost 6–26 Sigils; subsequent ranks cost 2.8× more, rounded upward.

Every purchase benefits **Melee, Mage and Ranged**. Some perks change with the equipped weapon, as the shop explains:

| Shared purchase | Melee | Mage | Ranged |
| --- | --- | --- | --- |
| Battle Geometry | More sweep targets and reach | Elite-first homing | Piercing arrows |
| Echo Arts | Weak echo blade | Spell ricochets | Additional arrows |
| Returning Power | Returning slash | Returning orb | Returning arrow |

Dungeon Sigils arrive slowly: ordinary monsters have a **0.3% chance of one**, other elites **35%**, and rares guarantee **one**. Guardians grant **1 / 1 / 2**, with **3 more** from a Zone-final overlord. Summoned creatures grant no rewards. Fortune 4 raises the ordinary chance to **0.42%**. Jewelry and equipment retain traditional statistics; the shop focuses on elemental effects, area attacks and utility.

Old Zone wallets and the full historical price of purchased ranks convert once at **25 seals per Dungeon Sigil**, retaining fractional credit. Original ledgers stay archived in the save. Choose new perks freely.

**Dungeoneering XP and level persist across Zones.** Level 2 needs 1,600 total XP; level 3 needs 6,400. Levels unlock shop choices and grant no Mastery points. XP orbs and saved ground caches retain their existing behavior.

**Mastery** remains a separate shared bank for dungeon settings and reward bonuses. Zone-final overlords grant 2 points. Zone 1 Floor 1's overlord also grants 2 on the first victory only, unlocking **2× Delve speed**. Mastery speed never affects skilling.

Press **Delve while delving** to replay a cleared floor or return to the frontier. The first idle-slot tip explains that the second slot comes at **Zone 2**. Entering Zone 2 also explains replay travel and the second idle slot. Crafting your first upgraded weapon gives a refinement and Warding enchantment tip.

[Phone shop](preview-dungeon-shop-mobile.png) · [Desktop shop](preview-dungeon-shop.png).

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

References use complete Iron / Steel equipment at base proficiency, with no required Dungeon abilities. Movement, menus, deaths, preparation, cleaves and speed settings affect real completion time. [BALANCE.md](BALANCE.md) explains the paths, rank costs and live simulations; [balance-report.json](balance-report.json) includes exact weapon, shop and economy values. Later equipment progression remains reserved.

Ordinary monsters drop **no gold**. Baseline clears pay **191 gold in Zone 1 / 293 in Zone 2**, mainly from guardians and floor caches, before elites and jewelry. Those per-Zone gold budgets stay the same across the longer floor counts; guardian XP is also spread across each Zone. Scavenging remains another gold source. Fractional rewards survive reload; existing balances and crafting costs are preserved.

## Zone scenery and creatures

The four authored Zones now contain **168 scenery, terrain and creature assets**. There are **42 ordinary creature forms and 42 matching rare elites**. The first pass added 72 environment illustrations; the new creature passes add 60 more illustrations, alongside four new medallions.

| Zone | Floors | Ordinary forms | Rare elites |
| --- | ---: | ---: | ---: |
| The Overgrowth | 5 | 8 | 8 |
| Embervault | 10 | 10 | 10 |
| Hollow Crypt | 20 | 12 | 12 |
| Astral Rift | 20 | 12 | 12 |

Each area also keeps its twelve scenery objects, three guardian forms, three terrain textures and three ground details. New families join the spawn mix gradually as you descend. Floor names, layouts and creature mixes change throughout all **55 named floors**.

Each floor changes the terrain, scenery mix and regular-creature mix gradually. Overgrowth moves from woodland to rooted ruins and the Elder Grove; Embervault from ash to the foundry and molten heart; the Crypt from graves to vaults and the Sovereign’s sanctum; the Rift from fractured approaches to starlit ruins and the Unmade threshold. Ground litter groups around larger landmarks, and starting areas retain open walking space. Later Zones that repeat a biome receive their own seeded layout.

New creatures scuttle, sway, hop, prowl or hover, with reduced-motion support. Their appearance does not change wave health, speed, rewards or boss mechanics. Scenery uses foot-level collision and fades when it would hide the player or nearby enemies. Ground details stay beneath characters and telegraphs. Zone Codex pages list the floors and creatures.

[Compare early, middle and final floors](preview-floor-progression.png). Source sheets, sprite-isolation metrics and the asset catalog are in `assets/environments/`. `npm run art:environments` exports transparent WebP cutouts and terrain textures into `src/environment-art.js`; `npm run review:environments` captures the actual game renderer. Runtime placement, floor palettes and creature animation are in `src/environments.js`.

## Minimal runestone interface

Gameplay uses outlined information and isolated controls with transparent backing. Delve, Inventory, Skills, Dungeon Shop, Codex, Settings, Pause and unlocked speed occupy a circular icon rail. The dungeon entrance, satchel, wisp and raised play/pause medallions use over 90% of each button’s space. **Settings → Navigation** selects either side and reorders pins with dragging or arrows. Titles sit at the top center, health/XP on the left, and warnings/messages below them. The message icon reopens the latest 40 notices.

Menus use warm stone, leather and brass. Carved runestone buttons and headers keep hard corners; painted medallions frame the icons. All **111 collection entries** have distinct artwork. Tooltips, native buttons, focus restoration and accessible labels support keyboard and touch navigation. Detailed explanations stay in the Codex.

**Inventory** shows the worn set, actual Zone DPS, health, attack speed and reach. Touch anywhere on a weapon’s main card or an owned armor card to equip it; the separate book button opens details. Weapons, armor, jewelry and materials have their own tabs. Materials show live quantities and link to their source; style training expands when needed. Books return you to the same recipe, shop, search or unapplied Mastery allocation.

## Gathering and crafting

Scavenging cards show their gold yield alongside fragments or salvage. Each search gives a visible material-and-coin receipt, and gold recipe costs lead directly to Scavenging. Work surfaces, hand tools and separate head/torso/arm joints keep each activity grounded; kneeling searches, hammer strikes, knife carving, woven cloth, rune tracing and gem cutting have distinct motion. Warding effects follow the current Zone’s palette. [Scavenging](preview-scavenging-mobile.png) · [Gold rewards](preview-skilling-rewards.png) · [Warding](preview-warding.png) · [Armor poses](preview-workshop-poses.png).

A small link below the idle-unlock notice guides new players to craft a stronger weapon. It stays until their first weapon craft or refinement, then remains dismissed across reloads.

**Skills** organizes each discipline into Gather, Refine, Equipment and Tools. Hold the work control, scene or Space. Active material bonuses can be tapped, dragged over, or collected with Enter/Space while focused. Forge sparks, twigs, glistens and similar crafting bonuses advance the cycle by **35%**, while still consuming ingredients. A second finger can collect bonuses while the first keeps working.

Resource costs link to their sources, and tracked recipes follow you back to the crafting bench. Every skill hub and activity has a direct **Idle** button. With one slot, choosing another task switches it immediately. With two slots, an empty slot is used first; if both are occupied, choose which task to replace without stopping it first. The first slot unlocks at **Zone 1, Floor 2**, with a notice linking directly to Skills. The second opens when you clear Zone 1 and enter Zone 2. Assigned tasks continue during combat and menus, with up to eight hours offline; missing ingredients pause refining.

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

Each arrow supplies **10 seconds of bow firing time**, and each rune **10 seconds of staff casting time**. Loaded time stays while waiting for a target, paused, skilling or using the other weapon, and survives reloads. Delve speed scales this combat clock. The HUD shows reserve items and loaded seconds beside the Zone seal counter. [Phone HUD](preview-ammunition-mobile.png).

One weapon selects your Melee, Ranged or Mage style. Each style has separate refinement, speed, reach, enchantment and proficiency. Iron caps at refinement **10**, speed/reach **5**, reinforcement **5** and enchantment **2**. Steel caps at **20 / 10 / 10 / 4**. Clear Zone 1, reach refinement 10 and crafting level 10, then pay a Steel promotion to open the next ranks for that style.

Combat proficiency grants up to **3% damage** and matching crafting levels up to **5%** more. Equipment-only dedicated limits are approximately **86 / 173 DPS**. Zone elemental upgrades work with every combat style.

The Opal Leech Ring starts at **0.5%** lifesteal. Armor equips independently of the weapon. Melee, Ranged and Mage each have two illustrated sets: Iron/Steel armor, Plain/Cured leathers, and Linen/Blue Wool robes. The worn set supplies its own health and protection, movement or Mage bonus. Reinforcement adds 8 HP per rank, limited by that set’s tier. Switching owned armor never heals you. Promotions change held weapon art; bows aim toward targets while retreating, and articulated hands, collars and weapon grips stay joined across poses.

## Player and animation

The player has a compact, illustrated 2D style: expressive faces, crisp outlines, simple shading and plain starter clothing. **42 vector parts** cover travel clothes and the six existing armor sets, with independent head, shoulder, chest, leg, boot and glove attachments. Arms and legs have continuous outlines across their joints. Near and far arms use separate layers, with inward-facing thumbs and forearms that can cross the chest. The eight work tools include a weaving shuttle and jeweler’s chisel; weapon art keeps its existing detail.

The same rig serves combat, gathering, crafting, appearance previews and inventory portraits. Relaxed hands rest below the waist; combat has distinct ready stances and two-handed tools and weapons share calibrated grips. Work has continuous anticipation, strikes and recovery, plus distinct carving, weaving, engraving, gem working and kneeling searches. Starting and stopping blend smoothly. Saved appearance choices retain their colors and styles. [Outfits](preview-player-sets.png) · [Motion phases](preview-player-actions.png) · [Mining on phone](preview-player-mining-mobile.png) · [Weaving](preview-player-warding.png) · [Animation recording](preview-player-motion.webm). [CHARACTER_ART.md](CHARACTER_ART.md) describes the assets and attachment system.

Attack clips now ease into windup and return to their ready stance, including a continuous bow release. Working elbows bend below raised hands, and the tool arcs clear the head. Carving, rune engraving and gem work use larger, distinct gestures; their tools meet the workpiece and sparks appear on contact. Weaving passes the shuttle across the cloth, and scavenging uses a planted support palm with a lift-and-rake cycle. Solid workpieces sit behind the fingers. Appearance plays complete attack cycles.

[Motion reel](preview-player-motion-overview.mp4) · [Live work scenes](preview-player-live-skills.mp4) · [Animated work loops](preview-player-work-loops.gif). These recordings show the current renderer at 1× animation speed. The close-up reel covers movement, all six weapon families and all eight work families; the scene reel includes starting and releasing work.

## Guardians and elites

The combat library now has **28 attack patterns**, including eighteen new ones. Bosses change tactics at **75% and 40% health**, with shielded Royal Guards, summoning spires, failed-reflect healing, and large arena attacks. Their body hurtboxes now match their visible size, so a short sword can hit a large creature above its feet.

| Warning | Meaning |
| --- | --- |
| **Red** | Dangerous to you only |
| **Violet** | Dangerous to you and other monsters |
| **Gold / white center** | Stand in the center to reflect |
| **Teal** | Safe space or an intercepted benefit |
| **Blue** | Shield; remove its source or Royal Guards |

Shapes, outlines and labels reinforce the colors. Violet sweeps, charges, beams, eruptions and rebounding rings also damage other enemies once per cast: **35% ordinary / 12% elite / 2.5% boss maximum HP**, before shields. They cannot trigger player weapon procs or lifesteal.

- **Rebounding Barrage** fires three projectile rings with rotating gaps, then banks them off the arena bounds. **Growing Stars** expand as they travel. **Homeward Blades** turn back toward their caster.
- **Threefold Ruin** warns three red arena quarters and marks one teal quarter safe. Numbered lanes, inner/outer rings, pincers, spirals, mines, siphon tethers and orbital blades provide other movement challenges.
- **Royal Guard** protects the boss with a blue shield until its guards are defeated. The boss takes 70% less damage while protected.
- **Hungry Mirror** returns 12% maximum boss HP and staggers when reflected; a missed center heals the boss for 5%. Standard reflects retain their 1.9s warning.
- **Calling Spires** are permanent, destructible summoning totems. They replenish ordinary monsters or elites after visible arrival warnings. Destroy them to stop reinforcements. Summons grant no loot, XP, Mastery or wave progress; encounter caps prevent unlimited armies.
- **Healing and power totems** remain untargetable. Get closer to the totem than its caster to redirect the stream. They stay until the caster falls. Power interception grants +10% hit damage for five seconds; healing now has a finite reserve.

Reflect centers, stream corridors and totems retain their larger spacing and scenery checks. Major arena attacks and reflects reserve clear cast windows. Owner death, retry, defeat and transitions clean up the caster's mechanics. Menus and skilling pause combat timers.

Known guardians still return as elite echoes, up to **one / two / three per wave** as floors deepen. They can charge, ricochet, shield allies and use additional themed patterns. Shield sources cannot form shield chains.

[Safe-quarter warning](preview-boss-sunder-mobile.png) · [Summoning spire](preview-summoning-spire.png) · [Combat reel](preview-boss-patterns.mp4).

## Rare elites and blessings

All **42 ordinary creature forms** have a distinct painted rare elite form with **3.5× health**. Eligible spawns have a **1.5% chance**, capped at one rare per wave. Rares always leave blessing spoils; other elites leave them **35%** of the time.

**Walk over spoils** to pause the delve and see three A/B/C options. Touch/click a card or press **1 / 2 / 3**. Movement and Escape cannot choose or dismiss the screen. **Skip blessing** explicitly discards that drop. Choice contents are fixed when dropped and survive reload.

The ten blessings last **40–60 seconds**: Battle Fervor, Windstep, Stonebreaker, Totem Silence, Stillworld, Golden Hunt, Plentiful Hunt, Chain Reaction, Momentum and Long Reach. They add offense or powerful utility: disabling totems, halving enemy movement, and granting gold or materials on kills. There are no healing blessings.

**Different blessings and repeated copies stack**, with independent timers and visible stack counts. Menus, pause and skilling freeze their duration. They carry across Zones in this Dungeon. Unclaimed spoils stay in their original Zone. Delve speed advances combat time.

The Opal Leech Ring remains at **0.5%** of actual direct-hit health removed, with no overkill healing.

[Phone choices](preview-blessings-mobile.png) · [Landscape choices](preview-blessings-landscape.png).

## Healing drops

Ordinary monsters have a **2% chance** of a mote healing **3% maximum HP**. Other elites have a **55% chance** of **12%**, and rares a **70% chance** of **15%**. Motes wait at full health and stay through waves on the same floor; starting or retrying clears them.

An intercepted healing stream restores **0.35% maximum HP per second**, up to a **15% lifetime reserve per totem**. A depleted stream still blocks the caster's healing. Uninterrupted streams restore **0.4% caster maximum HP per second**. Healing streams do not stack.

## Controls and saves

| Action | Controls |
| --- | --- |
| Move | Touch anywhere in the arena and drag; release to stop. WASD/arrows and mouse also work |
| Dash | Three short drags in the same direction, triple tap a movement key, Space or Dash |
| Work | Hold work control, scene or Space |
| Collect active bonus | Tap, drag, Enter/Space on focused bonus |
| Skills / Inventory / Codex / Dungeon Shop | G / E / C / B |
| Return to delve | D or Delve pin |
| Close menu / pause | Escape |

Older three-floor saves migrate to the expanded depths once. Previously reached Zones, equipment, wallets, materials, Dungeoneering XP, Mastery and idle assignments are preserved. Former Zone completions mark the expanded Zone as cleared, so the new intermediate floors can be replayed. Saves retain the `deepwell-prototype-v1` key. Settings provides backup/restore and reduced motion. Back up and restore your save when moving between browser origins or downloaded filenames.

Existing power ranks and pending choices pass through the legacy Zone migration, then convert into Dungeon Sigils. Earned XP becomes global XP while uncollected orbs stay separate. Old biome Mastery banks are pooled; duplicate allocations are refunded. Migration runs once and archives the old Zone/Mastery record. Equipment, materials, gold and XP caches remain. Older excess equipment ranks and unavailable armor remain archived under the existing tier rules.

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

Dungeon progression, global XP, migration and combat math live in `src/zone-shop.js`; shop UI/styles in `src/zone-shop-ui.js` and `src/zone-shop.css`. Player presentation and Codex remain in `src/presentation.*` / `src/codex.js`. Skill definitions live in `src/game-data.json`, tier rules in `src/zone-progression.js`, and the shared character rig in `src/avatar-rig.js`. Gold rewards are in `src/economy.js`; test travel in `src/testing.js`. The expanded ability library, geometry and combat language live in `src/combat-expansion.js`; guardian patterns, counterplay and elite scheduling live in `src/encounters.js`, with embedded sprites in `src/encounter-art.js`. Work animations, gold receipts and painted foreground props live in `src/workshop.*` / `src/workshop-art.js`; ammunition timing in `src/ammunition.js`; Mastery milestones and healing drops in `src/restoration.js`. Rare creatures, timed blessings and enemy area damage live in `src/rare-elites.js`; floor coordinates and migration in `src/zone-layout.js`, with the expanded bestiary and elite roles in `src/deep-encounters.js`; `npm run art:rare-elites` exports their source art and `npm run review:rare-elites` captures actual game previews. The early loading screen lives in `src/loading.*` and `src/loading-runtime.js`. Mobile controls, navigation and material inventory live in `src/mobile.js` / `src/mobile.css`; themed ability definitions, migration and pricing in `src/zone-abilities.js`. The original engine and compiled standalone output are in `index.html`.

Twenty-five browser suites cover save migration, shared Dungeon progression, automatic and explicitly dismissed buff choices, actual damage/cadence across all weapons, equipment limits, shop costs, global Mastery, all activities, active bonuses, touch/keyboard controls, Idle navigation, bosses, rewards, layouts and 111 distinct painted collection icons. Counterplay tests cover reflect timing, stream geometry, all six weapons, cleanup, overlap limits and phone placement. Real touch tests cover movement, cancellation, multiple fingers, whole-card gear selection, guidance and over 90% visible icon coverage on both rail sides. Native-gesture regressions cover sustained mining/movement holds, bonus dragging, lost capture and interruption cleanup, menu swipes, clipboard editing, save controls and keyboard focus. A complete 55-floor progression test verifies Zone endings, Mastery gates and migration. Full combat simulations verify the first four Zones and later pacing. Startup tests hold back the game download to verify the loading screen actually paints first; they also cover reduced motion, asset readiness and retry. Core phase, biome, gear and jewelry definitions remain guarded by manifests; the approved style-name copy is updated.

For an on-device iOS Safari or in-app browser check, hold both the work button and mining scene for at least five seconds, drag over a bonus, then release or interrupt the touch. Hold and drag in the arena, then lift, switch apps or rotate. Gameplay should never show text handles or Copy/Look Up, and work/movement should stop after interruption. Swipe a long menu and Codex overlay, copy/paste in Settings and Codex search, and open save backup/restore. Automated Chromium touch tests cover these game behaviors; the operating system's Safari callout UI still needs an actual iOS device check.

Generated icon sheets, calibrated regions and alignment metrics live in `assets/icons/`. `python3 scripts/measure-icon-bounds.py` measures the medallions without altering source art; `npm run art:icons` exports embedded WebP badges. `scripts/export-player.py` isolates the player textures with Pillow, NumPy and SciPy; `scripts/measure-player-binds.py` calibrates their joint axes. Use `CHROMIUM_PATH` for a custom browser. Local test output stays in ignored `test-results/`.

`npm run art:blessings` exports the original blessing emblems and embedded WebP caches. `npm run review:combat` records six actual boss patterns and captures the Dungeon Shop and blessing picker; it requires FFmpeg and Playwright video support.
