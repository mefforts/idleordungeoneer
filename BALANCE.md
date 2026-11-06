# Current game rules and balance

Build **11.19.0**. Generated from the standalone game by `npm run report:balance`. [README](README.md) covers play and controls; [balance-report.json](balance-report.json) contains exact prices, formulas and measured results. Zones 1–5 use authored health and reward tuning. [BALANCE_CONFIG.md](BALANCE_CONFIG.md) describes configuration and expansion; [PROGRESSION.md](PROGRESSION.md) gives current gear-profile measurements.

## Progression and clocks

Each floor contains three monster waves, two guardian packs and a final floor boss. A pack contains 4 / 5 / 6 special enemies in early / middle / deep floors. All current Zones belong to The First Descent.

| Zone | Theme | Floors | Ordinary forms | Rare forms |
| --- | --- | --- | --- | --- |
| 1 | The Overgrowth | 5 | 8 | 8 |
| 2 | The Embervault | 10 | 10 | 10 |
| 3 | The Hollow Crypt | 20 | 12 | 12 |
| 4 | The Astral Rift | 20 | 12 | 12 |
| 5 | The Overgrowth | 20 | 8 | 8 |

Zones 6+ remain experimental continuation outside this balance target. Dungeoneering is milestone progression: kills do not grant new spendable levels. Historical combat XP remains in saves.

| Dungeoneering level | Earn a point by |
| --- | --- |
| 1 | Reach Zone 2 |
| 2 | Complete Zone 2 |
| 3 | Reach Zone 10 |
| 4 | Reach Zone 20 |
| 5 | Reach Zone 40 |
| 6 | Reach Zone 80 |

Each new level grants one shared Mastery point. Time ranks cost 1 point each. Optional Mastery allocations use that same bank; refunding optional allocations retains time ranks. Reassign game time in the Dungeon Shop to return points spent on those ranks.

| Rank | Delving | Skilling, including idle |
| --- | --- | --- |
| 0 | 1× | 1× |
| 1 | 1.25× | 2× |
| 2 | 1.5× | 3× |
| 3 | 1.75× | 4× |
| 4 | 2× | 5× |
| 5 | 2.25× | 6× |
| 6 | 2.5× | 7× |
| 7 | 2.75× | 8× |
| 8 | 3× | 9× |
| 9 | 3.25× | 10× |
| 10 | 3.5× | 12× |
| 11 | 3.75× | 14× |
| 12 | 4× | 16× |
| 13 | 4.25× | 18× |
| 14 | 4.5× | 20× |
| 15 | 4.75× | 22× |
| 16 | 5× | 24× |

Speed is available from the beginning. Free Delving choices are 0.25×, 0.5×, 0.75×, 1×. Skilling starts at 1× and cannot go below it. Selected earned speeds persist. Delving advances combat, ammunition and combat-buff timers; Skilling advances active and idle production. Testing multipliers remain separate.

Idle runs at 25% of the base active production rate, with equal XP per completed batch. The offline cap is eight real hours before the selected earned Skilling multiplier. Active-only tools and discoveries retain their separate benefits.

## Skills and equipment

Tier 2 requires Zone 2 access and matching skill level 10. Tier 3 requires Zone 3 completion and matching level 20. Active, idle, offline and instant refining enforce the same gates. Silver mining and smelting require Smithing level 10.

Iron is intended for Zone 1; Steel spans Zones 2–4. Mithril is intended around Zones 4–5 and eligible earlier after enough skilling. Promoting to Steel needs completed Iron refinement; promoting owned Steel to Mithril does not require full Steel refinement. Armor is crafted separately.

| Tier | Weapon refinements | Speed / reach / reinforcement | Enchantment |
| --- | --- | --- | --- |
| Iron | 3 | 5 / 5 / 5 | 2 |
| Steel | 12 | 10 / 10 / 10 | 4 |
| Mithril | 10 | 15 / 15 / 15 | 6 |

Enchantment trigger chances by rank are 14% / 28% / 42% / 56% / 58% / 60%. Every rank improves the chance; Iron and Steel retain their prior values, with Mithril ranks 5/6 sharing the final four percentage points below the 60% ceiling. Arcs deal 50% of the triggering hit to another target within 200 units. Airborne shots use their firing style’s enchantment even after switching weapons. Crafting rows show current and next chance; single-target DPS excludes the arc.

| Weapon | Iron DPS | Steel DPS | Mithril DPS |
| --- | --- | --- | --- |
| Arming Sword | 80 | 240 | 480 |
| Sword & Shield | 80 | 240 | 480 |
| Halberd | 80 | 240 | 480 |
| Greatsword | 80 | 240 | 480 |
| Hunting Bow | 80 | 240 | 480 |
| Focus Staff | 80 | 240 | 480 |

These are maximum equipment-only values at base proficiency. Full combat proficiency adds up to 3% damage, and matching crafting levels up to 5%. Mage equipment figures include matching robes. Mithril starts around 300 DPS with completed Steel speed training. Soft budgets of at least 100 / 300 / 600 DPS follow equipped tier; damage above a budget contributes at 25%. Live direct-DPS displays include temporary damage/speed bonuses, Rally and the greatsword’s low-health bonus. Additional targets, enemy defenses and elemental procs remain separate.

Level 20 targets the work for about 80% of Iron/Steel upgrade paths across **all three styles**, including supporting jewelry at rank 15, tools and stations, with 4,000 delve gold credited. [SKILL_ECONOMY.md](SKILL_ECONOMY.md) gives the reproducible budget. Steel weapon materials grow 1.48× per rank; its other upgrade materials grow 1.6×. Steel/Mithril weapon refinement also consumes cut gems.

| Level | Total skill XP |
| --- | --- |
| 10 | 1710 |
| 11 | 3210 |
| 12 | 4935 |
| 13 | 6919 |
| 14 | 9201 |
| 15 | 11824 |
| 16 | 14841 |
| 17 | 18311 |
| 18 | 22301 |
| 19 | 26889 |
| 20 | 32166 |

Tier-1 work grants 10% XP after level 10 and 0.1% after level 20; tier-2 work grants 1% after level 20. Older bands taper further. Material yield stays full, and awards split at training boundaries. Artisan keeps its 8× base XP. Existing skill levels and fractional progress survive migration.

## Jewelry, tools and stations

Jewelry has 50 optional refinements. The Leech Ring starts at 0.5% lifesteal and adds 0.05 percentage points per rank: 1.25% at rank 15, and 3% at rank 50. Other pieces add 1% of their base effect per rank, up to 50% extra. Existing ranks receive these effects automatically. Vigor also reduces damage by 0.1 percentage point per jewelry HP. Every armor reinforcement adds 8 HP and 0.75 percentage points of damage reduction, for every style. Equipping or removing owned jewelry preserves current HP; crafting/refinement can grant a genuine maximum-health increase.

The first 15 Leech ranks cost 20 silver bars, 465 gold and 3 cut opals before station savings, excluding the ring craft. Each rank gives 80 base Artisan XP before training reductions. Lifesteal uses actual direct-hit health removed, caps overkill and never exceeds maximum player HP.

Tools equip automatically, start at 8% active gathering speed and support 10 refinements of 0.5 percentage points each. Gathering bonuses gain one material. Tools do not speed up idle work. Each station has five ranks, each adding 3% work speed and 2% ingredient conservation; fractional savings carry between paid crafts. Viewing a recipe never spends conservation credit.

Zone materials share one spendable pool: seeds, cores, dust and shards each cover one unit, with earlier banks used first. Even weapon refinements, final equipment upgrade ranks per tier, tier promotions and station ranks 3/5 use occasional Zone-material costs. Mithril promotion uses two; other listed costs use one. Starter crafts retain their material recipes.

Warding transmutation spends exactly 100 essence for 1–10 selected raw resources. Resource unlocks apply; conservation does not discount this essence cost.

## Skilling discoveries

| Chance | Active speed | Working real seconds |
| --- | --- | --- |
| 65% | +35% | 6 |
| 24% | +50% | 8 |
| 9% | +75% | 10 |
| 2% | +100% | 15 |

Pickups use color, speed and duration rather than rarity labels. The strongest active boost applies; equal pickups refresh within a bounded duration, stronger pickups improve it. A weaker gathering pickup gives 1–5 resources; a weaker refining pickup completes up to five normal, ingredient-paid batches and stops when stock runs out. Every batch retains its normal yield and XP.

Discovery timers count real seconds of active work on that activity. Release, menus, missing ingredients, backgrounding and other activities pause them. They survive reload and do not boost idle/offline work. Permanent Skilling speed still affects both active and idle production. The visual clock runs at 0.6× base clip speed at 1× production and caps at 1.05×. Release/resume retains the clip phase through its rest blend; higher production rates add bounded effects. Reduced motion suppresses decoration.

## Dungeon Shop and rewards

| Combat perk | Unlock | Maximum rank | First Sigil price |
| --- | --- | --- | --- |
| Ember Edge | Start | 5 | 6 |
| Winter Thread | Start | 3 | 6 |
| Soul Conductor | Start | 4 | 8 |
| Fracture | Start | 3 | 8 |
| Dungeon Ward | Start | 4 | 8 |
| Battle Geometry | Start | 3 | 10 |
| Echo Arts | Start | 3 | 12 |
| Spellbreaker | Start | 3 | 10 |
| Cold Verdict | Zone 2 | 3 | 14 |
| Returning Power | Zone 3 | 3 | 18 |
| Gravitation | Zone 4 | 3 | 22 |
| Mirrorcraft | Zone 5 | 3 | 26 |

Eight perks are available immediately; reaching Zones 2 / 3 / 4 / 5 unlocks Cold Verdict / Returning Power / Gravitation / Mirrorcraft, while prior-save entitlements remain. Prices grow 2.8× per rank, rounded upward. Every purchase applies to Melee, Mage and Ranged in the Dungeon. Battle Geometry, Echo Arts and Returning Power adapt their effect to the equipped style; ranks remain shared.

| Zone | Expected first-clear Sigils |
| --- | --- |
| 1 | 48.62 |
| 2 | 98.39 |
| 3 | 553.83 |
| 4 | 746.3 |
| 5 | 932.88 |

Ordinary enemies have a 0.3% chance of one Sigil; elites, rares and Echoes use 35%. Guardians grant 1 / 1 / 2; a Zone-final overlord adds 3. Summons and totems grant no rewards or wave credit. Ordinary kills give no gold without Golden Hunt. Authored Zones 3 / 4 / 5 multiply gold by 3 / 4 / 5 and Sigil bundles by 3 / 4 / 5.

| Zone | Guardian gold | Floor caches | Baseline before elites |
| --- | --- | --- | --- |
| 1 | 126 | 65 | 191 |
| 2 | 189 | 104 | 293 |
| 3 | 756 | 429 | 1185 |
| 4 | 1260 | 728 | 1988 |
| 5 | 1890 | 1105 | 2995 |

| Enemy | Raw-material chance | Bundle | Maximum chance |
| --- | --- | --- | --- |
| normal | 1.5% | 1 | 6% |
| elite | 8% | 3 | 16% |
| boss | 18% | 6 | 28% |

Rare creatures use elite rewards. Material drops remain a supplement to skilling, never guaranteed; Scholar jewelry, Mastery and Plentiful Hunt modify the capped chance. Tier-3 raw materials enter eligible drops from Zone 5, subject to skill unlocks.

Gold, Sigils, essence, materials and vouchers land on the ground and credit on collection. Pickup radius draws them in after landing. Unclaimed ordinary loot persists through retry, reload and floor travel; floor completion gathers leftovers. Receipts and Inventory show collected items. Health motes follow the separate expiry rules below.

Guardians roll a voucher once on first defeat: 6% normally, 15% for a Zone-final overlord. Each voucher names a rank upgrade on owned equipment, jewelry, a specific tool or a station. Its tier follows owned eligible gear, including Mithril in Zone 4; an empty eligible pool produces no obsolete fallback. New gear and tier promotions require normal materials. Explicit redemption covers the complete matching rank cost and respects ownership, tier and caps. The first receipt introduces the voucher; later receipts link to it in Inventory → Materials.

## Blessings and healing

Eligible non-summoned elites, rares and Echoes roll 15% for blessing spoils. Walk over one to pause combat and choose from three cards, or Skip. Keys 1/2/3 select; movement and Escape cannot choose or dismiss. Drop choices are fixed and saved. The picker has no fullscreen tint or background.

| Blessing | Combat seconds | Effect |
| --- | --- | --- |
| Battle Fervor | 45 | +18% hit damage |
| Windstep | 40 | +15% attack speed · +12% movement |
| Stonebreaker | 60 | +25% damage to elites and bosses |
| Totem Silence | 45 | Disable every enemy totem while this blessing lasts |
| Stillworld | 40 | All enemy movement is halved, including charges |
| Golden Hunt | 50 | Each non-summoned kill grants 1 extra gold |
| Plentiful Hunt | 50 | +50% material drop chance; drops remain rare |
| Chain Reaction | 45 | Hits have a 22% chance to arc to another enemy |
| Momentum | 45 | +10% hit damage · +8% attack speed |
| Long Reach | 50 | +25% attack reach for Melee, Mage and Ranged |

Different and repeated blessings stack with independent saved timers. The compact mobile HUD shows icons and next-expiry timers; details list every stack. Menus, pause and skilling freeze combat buffs. They persist within this Dungeon. Long blessings in the Dungeon Shop spend 60–100 Zone materials for 5× duration. Purchases activate one independent stack; the cap is 128.

Ordinary health drops roll 2% for 3% maximum HP; elites and rares roll 50% for 12%. Motes expire after 12 combat seconds, including at full health, and fade over the last 3. Menus/skilling pause expiry; waves do not refresh it. Motes clear on floor start, retry and reload.

Intercepted healing restores 0.35% maximum HP/second, bounded by a 15% player-healing reserve per totem. Depleted streams still block enemy healing. Uninterrupted streams heal a living recipient for 0.4% maximum HP/second. Healing streams do not stack. Intercepted power grants its normal +10% hit damage, lingering 5 seconds.

## Combat communication and damage

| Signal | Meaning |
| --- | --- |
| Red | Hurts the player |
| Purple | Tactical damage to player and monsters; can stagger special enemies |
| Teal | Protected opening or benefit |
| Gold / white | Reflect interaction |
| Yellow brackets | Optional interruptible target or cut point |
| Blue | Shield; remove its source or guards |

Warnings, visible artwork and damage geometry share their shapes. Mechanic labels never write a refuge instruction in an expanding pulse center. Details live in the Codex; brief combat reminders fade and recur. Decorative motion pauses with combat and respects reduced motion.

Player damage uses a stable chest-to-feet capsule with 12-unit radius; head, hats, arms and equipment do not alter it. Movement, pickups and beneficial/counter interactions keep ground-anchor checks. Teal protected openings protect the full damage body.

Direct special-enemy hits have a 12.5% maximum-health floor before defenses. Projectiles start at 12.5%, heavy hits around 25%, major failures up to 50%, and failed reflects 15%. Independent mechanics can hit together; one projectile spread shares a 0.47-second window. Standard eruptions and beams deal one burst per impact rather than repeating through their visual aftermath. Dash/spawn protection and normal defenses remain. Uncommons use smaller 6% shots / 8% marks / 10% charges.

Lingering damage uses small rapid ticks. Fire defaults to 2.5% per 0.35 combat seconds; overlapping DoTs share a 5% base cap per interval. Dash protection prevents these ticks; ordinary hit immunity does not erase fire pressure. Leaving resets a field’s first-tick delay.

Purple attacks deal 35% / 14% / 4% ordinary / elite / boss maximum HP before shields, once per attack. An emitted attack can hit its caster after first clearing its launch point; remote ground eruptions can hit the caster directly. Special enemies stagger for 0.55s, with 3s before another friendly-fire stagger. Enemy attacks do not trigger player lifesteal, enchantment or weapon procs.

The [mechanics bible](MECHANICS_BIBLE.md) defines shared color, counter and encounter rules. At most 2 offensive attack groups can be active, including nearby released attacks. Large arena attacks, reflects, siphons and themed mechanics reserve the encounter. Support remains bounded separately. Exclusive mechanics leave 1.25s of recovery after ending. Ordinary warnings last at least 1.5s; elite recovery is 4.2s and full-boss recovery 3.4s (2.9s in the final phase). Successful dash counters provide 0.8s before another offensive cast. All these clocks use Delving time.

Ember Catch is optional: 6s to touch the yellow ember for a 145-unit purple blast, or leave its 80-unit red detonation. Walking catches retain dash cooldown; catches during a dash refund it. Seed chains, hammer leads and marching lanes alternate their displayed order. Furnace variants advance per successful use instead of depending on unrelated casts.

## Special enemies, tasks and support

Elites, rares and Echoes reserve separate terrain-checked advance/ranged/guard positions at normal speed. Some guard support totems. Natural wounded ordinary/uncommon creatures can retreat to one nearby healing totem for bounded healing; intercepting or removing support ends it. Full-boss scripts and paired mechanics keep their movement rules.

Warband Resolve grants 10% damage reduction per other living, active special enemy, capped at 50%. Stunned enemies receive and grant none. A dash disables both roles for 10 combat seconds, beyond the 0.65-second body stagger. The shield percentage is sufficient visual feedback; the former foot arc is removed. This longer dash opening remains discovered gameplay rather than an extra combat prompt.

Natural elites, rares and Echoes can prioritize channel tasks. Early Zones allow 1 active task; Zone 3 onward allows 2. Full bosses, uncommons and summons do not perform these tasks. Tasks walk to clear positions before channeling.

| Task | Current behavior |
| --- | --- |
| Ascendance | 12s channel; heals at most 4% before a 14s offense boost |
| Rare Awakening | 14s channel; promotes one existing normal mob, preserving health fraction |
| Living Conduit | Summons after 2.8s, then every 5.5s until interrupted |
| Siege Channel | Warned volleys or marks every 2.8s until interrupted |

Stun, dash through, land 3 focused direct hits, or remove 12% maximum HP with direct weapon hits to interrupt. Secondary splash and passive burns do not count. Interrupted tasks stagger for 0.8s and retry after at least 15s. Summons and recruits cannot create unlimited rewards or armies.

Summoning spires ignore weapons. Ordinary / crowned spires need 1 / 2 physical impacts, with a step clear between walking bumps; each fresh swept dash counts even from contact or through a shield. Surge backlash is 12.5% / 15% base maximum-health damage before regional scaling and defenses. Dashes avoid it. Caps remain two spires, eight summons and three summoned elites; existing summons remain after a spire breaks.

Healing/power totems remain untargetable by weapons and can retarget living allies after their original caster falls. Walking can intercept streams. Dash destruction retains no dedicated prompt or reward. Support totems persist between encounters on the same floor; defeat, retry and floor boundaries clear them.

Released projectiles, planted wards, waves and independent placed mechanics continue after source defeat, with their normal counters, damage and lifetime. Unreleased casts, living channels and caster/pair-bound effects stop. Encounter completion waits for released danger. Caster-bound mechanics: briarLeash, rallyThread, orbitTransfer, graftedSwap, turningBulwark. Ordinary ground loot keeps its separate persistent save rules.

## Travelling mechanics

Walking Hedge sends two or three world-spanning walls through offset teal openings. It travels faster than running and retires only after passing actors and viewport; it cannot be waited out or walked around an end. Opening routes allow a dash through one wall and movement toward another gap. Hedge crossings retain the normal dash cooldown.

Grave Pulse opens at 240 units/second, 25% below the 320 follow-up target. Every ring keeps at least 1.25× running speed. Faster repeats maintain 320 units of separation, with launches at least 1.2s apart. Later floor bands/phases use up to 3 rings. A complete dash crossing refunds dash once per ring; grazing does not. The rims persist beyond fixed lifetime/range and retire after passing actors and viewport. Only one sequence can be active or preparing.

Rolling Furnace repeats bankshots, splitting cores or crossing pairs. Its physical cages, banks, fragments and trajectories show the path; shots continue beyond the arena until they pass the encounter. Purple rollers can hit monsters. These projectile dodges do not refund dash.

## Zone pressure and health

Zone 2 has stronger ordinary incoming damage, frequent returning/growing stars and cleaves that leave fire. Its finale allows six known Echoes and three rares per wave. Zone 3 adds death echoes and Grave Pulse immediately, and carries a sharp HP step into later Zones.

Current HP calibration preserves the general +75% regular-elite / +50% rare, boss and Echo experiment. Zones 1–2 add +75% regular-elite and +25% boss/Echo HP; ordinary, uncommon and rare HP there retain their base experiment. Authored Zones 3 / 4 / 5 apply 4× / 4.25× / 4.5× ordinary HP and 4× / 4.5× / 5× special HP over the earlier calibration; special enemies do not inherit the ordinary factor. Uncommons have twice ordinary HP. Rare spawn chance is 3% with one per wave, except the Zone 2 finale at 10% and three.

## Pacing evidence

| Zone | Analytic forecast at 1× | Reference DPS |
| --- | --- | --- |
| 1 | 15.08 min | 80 |
| 2 | 23.72 min | 240 |
| 3 | 175.2 min | 240 |
| 4 | 208.92 min | 240 |
| 5 | 121.02 min | 480 |

| Progression profile | Measured combat minutes | Equipment DPS | Sigils invested |
| --- | --- | --- | --- |
| Zone 1 · progressing Iron | 21.5 | 56.22 | 0 |
| Zone 2 · progressing Steel | 32.13 | 155.45 | 42 |
| Zone 3 · 80% Steel | 133.6 | 207.39 | 160 |
| Zone 3 · 80% Steel Mage | 106.42 | 208.68 | 160 |
| Zone 3 · 80% Steel Bow | 109.33 | 207.39 | 160 |
| Zone 3 · 80% Steel Halberd | 124.48 | 207.39 | 160 |
| Zone 4 · new Mithril | 109.62 | 300 | 378 |
| Zone 4 · completed Steel | 133.71 | 240 | 378 |
| Zone 5 · middle Mithril | 96.79 | 383.92 | 727 |
| Zone 5 · middle Mithril Mage | 70.96 | 390.9 | 727 |

Benchmark build: **11.19.0**. Standalone SHA-256: `8d331d9902ebdd4bd0603cd7d3ae89ebef3598782be0ceabd92e7f30a5b531d7`. [Exact profiles and limits](PROGRESSION.md).

These full-Zone simulations use actual spawning, attacks, movement, counters, guards, spires and phase transitions. Incoming damage is disabled and HP replenished to isolate pacing. They are not human survival trials or wall-clock completion promises. Menus, deaths, preparation and selected game speeds change actual play time. Short survival experiments remain separate raw evidence in balance-report.json; they do not establish current human difficulty.

## Compatibility and validation

Save migrations retain gear, materials, gold, earned levels, fractional skill progress, point balances, prior perk unlocks and historical ledgers. Legacy Zone wallets/purchases convert once at 25 seals per Sigil, retaining fractional credit. Old wildcard vouchers split once into named upgrades; owned items remain owned. Historical preparation credits stay recorded in Settings → Messages.

Settings → Backup/Export and Restore move the same save between origins. Combat transient objects and healing motes clear appropriately; persistent ground loot and saved blessings retain their separate rules. The save key remains deepwell-prototype-v1.

Run `npm run build`, `npm test`, `npm run report:skills`, `npm run report:progression` and `npm run report:balance`. Native iOS selection/callout behavior still requires a real-device check in addition to Chromium touch tests. [DEVELOPMENT.md](DEVELOPMENT.md) describes source ownership, validation and delivery. [SELECTED_MECHANICS.md](SELECTED_MECHANICS.md) covers the implemented themed library; [THEME_NEUTRAL_IDEAS.md](THEME_NEUTRAL_IDEAS.md) remains proposals only.
