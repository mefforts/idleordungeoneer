# Dungeon progression and balance

Build 10.0 replaces individual Zone Shops with a permanent Dungeon Shop. All current Zones belong to The First Descent. The data model can assign future Zones to a new Dungeon with a separate wallet and purchases. Equipment, global Dungeoneering and Mastery retain their own roles.

Build 10.1 adds physical counterplay to summoning spires: one bump breaks an ordinary spire; a crowned spire takes two. Leave the base between walking impacts, or use another dash. Teal is safe; red means a summoning surge. Dash through a surge or wait for teal to avoid retaliation.

## Dungeoneering and game time

Build 11 starts Dungeoneering at level 0. Reaching Zone 2 grants the first level and point; completing Zone 2 grants the second. Later milestones remain Zones 10, 20, 40 and so on, doubling each time. Replays and kills grant no extra points. This defines long-term milestones without adding Zone content.

| Rank | Delving | Skilling, including idle |
| --- | ---: | ---: |
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

Each permanent rank costs one point. The first choice is 1.25× Delving or 2× Skilling. Delving adds 0.25× per rank. Skilling advances in ones to 10×, then in twos. Skilling applies to active work, online idle and up to eight real hours of offline production. The offline cap is applied before the earned multiplier. Selected earned rates persist; testing speed remains separate and does not multiply offline production. Existing unlocked 2× Delving is retained on migration.

Build 11.4 keeps the Speed button visible from the start. Delving offers free 0.25×, 0.50×, 0.75× and 1× choices plus every purchased rank. Skilling offers 1× and every purchased rank, including idling; it never goes below 1×. Selections persist, and buying a rank preserves a selected slow Delving rate. Code-unlocked testing multipliers remain separate choices in the same menu. The quick badge reports the combined game-time rate.

Optional Mastery allocations share the bank after the first speed choice. Refunding these allocations does not refund permanent time ranks. Existing point balances and allocated ranks are retained; earlier XP-based combat-perk unlocks remain available.

## Active skilling discoveries

Build 11.1 replaces 35% instant crafting progress with timed work speed. Every discovery has one rarity roll. Gathering speed discoveries also grant their existing material bundle. Build 11.3 keeps 1–5 direct gathering items for a strictly weaker pickup. Refining pickups instead complete up to five normal recipe batches immediately, consuming ingredients, honoring conservation and stopping at affordable stock. Normal batch yields and training XP apply; the stronger buff and normal work progress are unchanged.

| Rarity | Chance | Active work speed | Duration |
| --- | ---: | ---: | ---: |
| Common | 65% | +35% | 6s |
| Uncommon | 24% | +50% | 8s |
| Rare | 9% | +75% | 10s |
| Very rare | 2% | +100% | 15s |

Discoveries appear after 1.2 seconds of engagement, then every 4.2 real seconds, with six seconds to collect. The strongest current boost applies; equal pickups refresh its bounded duration and stronger pickups improve it. Weaker pickups leave the timers untouched. Gathering grants the displayed resources; refining crafts up to the displayed maximum from available ingredients. Earlier timers count down concurrently. There is no multiplying or unlimited time bank. Collecting a pickup alone does not sustain further discoveries without working.

Build 11.2.1 removes visible rarity names from skilling pickups, collection feedback and active buff displays; colors, effects, timers and accessible descriptions remain. Work hand motion is slower at 1× and 2× and stops accelerating beyond 4× game speed. Above 4×, bounded sparks indicate extra speed; 10× adds short bursts and 24× adds occasional fans above the character. Production keeps its full selected rate. Reduced motion suppresses decorative bursts.

Timers count real seconds while actively working on that activity, including while earned Skilling speed accelerates production. Release, missing ingredients, menus, other activities and backgrounding pause them. Remaining time survives saves. These bonuses do not accelerate idle or offline work. Permanent Skilling game time and station/tool benefits retain their normal effects. Every accelerated craft still consumes its complete station-adjusted recipe.

A seeded five-minute active refining check at 1× made **107 bars without pickups / 252 bars collecting all 72 discoveries**. This includes 82 instantly crafted bars. All 252 bars consumed 504 ore: exactly two per crafted bar. This is a perfect-collection test; actual gains depend on attention and rarity rolls. Idle production is tested separately and receives no temporary bonus.

## Skill curve and Mithril progression

Levels 1–10 retain their original thresholds. Level 20 now requires 32,166 total XP instead of 7,410. After each work tier’s training band (10 / 20 / 30), that older work gives 10% XP while keeping its full material yield and production speed. The reward splits exactly at the boundary. Active/idle/offline production, instant refining batches, jewelry/tool refinements, new armor, equipment ranks and transmutation use the shared award path. Artisan retains its eightfold base XP.

| Skill level | Total XP |
| --- | ---: |
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

A one-time save conversion retains each existing skill level and fractional progress, rather than dropping earned levels when the curve changes. Levels, equipment, materials and earlier unlocks survive actual reloads. New gains use the slower curve.

Completing Zone 4 unlocks Mithril resources and equipment at matching discipline level 20. Steel refinement 20 promotes into ranks 21–30; speed/reach/reinforcement cap at 15 and enchantment at 6. Armor is crafted separately. Mithril metal, blue ranged leathers and green Runewoven robes use the same silhouettes and joints, with small belt and shoulder changes. Ten activities introduce mithril ore/bars, yew, verdant cloth, enchanted salvage/fragments and sapphires. No new authored Zone layouts or attacks are added. Zone 5 and later existing repeat layouts use the 240-DPS Mithril reference and a 300-DPS soft budget.

The work-scene controls now separate Skills navigation from direct Gather/Refine or input-source swaps. A swap clears held input, consumes no materials and leaves assigned idle tasks untouched.

## Unified crafting and fine refinements

Gather and Refine list all three tiers together, including locked rows. Every tier-2 activity requires Zone 2 access and level 10 in its matching discipline, across active/idle/offline work; existing inventories and owned gear remain. Preparation falls back to available tier-1 ammunition/gold sources and directs blocked material work toward training. Steel promotions sit directly below their weapon list. Stations and tools use ordinary compact rows in Equipment, with no separate Tools tab or station footer.

Artisan gathering/cutting XP is multiplied by eight and jewelry crafting gives 400 XP. Existing Artisan XP receives the same eightfold catch-up once. Owned jewelry supports 50 optional refinements, each adding 0.25% of its base effect, with 80 base Artisan XP per successful rank before the old-tier reduction. The Leech Ring gains 0.00125 percentage points of lifesteal per rank, from 0.5% to at most 0.5625%. Costs start at one silver bar and 10 gold, grow every ten ranks in silver and by three gold per rank, and add one cut opal each fifth rank.

Crafted tools retain 8% active speed and support ten refinements of +0.5 percentage points each, with normal material/gold costs. They do not accelerate idle work. Relic prospecting is now a normal ingredient-paid activity: 12 fragments for one rough opal, 4s active / 20s idle before bonuses. Prospecting and ancient cleaning use a standing brush-and-relic pose at a bench, with no digging animation. Warding Refine offers a compact resource selector: exactly 100 essence for a random 1–10 chosen raw resources. Unlocks apply and conservation does not discount this essence cost.

The Dungeon Shop has a Long blessings sub-store. Most effects cost 60 interchangeable Zone materials, Golden/Plentiful Hunt cost 80 and Silence/Stillworld cost 100. Purchase activates one independent stack at five times normal combat duration (200–300s), with existing pause, stacking, save and Dungeon rules. The 128-stack limit is checked before spending.

## Encounter health experiment

Compared with the previous build, regular elites have 75% more health. Rares, guardian Echoes (boss elites), and full bosses have 50% more. Rare and boss-elite flags take precedence, so a rare is not multiplied again as an elite. Ordinary monsters and summoning spires retain their health; bump counts remain one or two. These multipliers apply after the existing health-scale calibration: player damage, rewards, spawn counts and cadence are preserved. Forecast times below include the extra durability.

## Equipment ceilings

| Weapon | Style | Iron | Dedicated Iron | Steel | Dedicated Steel | Mithril | Dedicated Mithril |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Arming Sword | Melee | 80.0 | 86.4 | 160.0 | 172.8 | 240.0 | 259.2 |
| Sword & Shield | Melee | 80.0 | 86.4 | 160.0 | 172.8 | 240.0 | 259.2 |
| Halberd | Melee | 80.0 | 86.4 | 160.0 | 172.8 | 240.0 | 259.2 |
| Greatsword | Melee | 80.0 | 86.4 | 160.0 | 172.8 | 240.0 | 259.2 |
| Hunting Bow | Ranged | 80.0 | 86.4 | 160.0 | 172.8 | 240.0 | 259.2 |
| Focus Staff | Mage | 80.0 | 86.2 | 160.0 | 171.9 | 240.0 | 257.1 |

These figures use maximum refinement and speed, 5% base critical chance and matching robes for Mage. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4; Mithril ends at 30 / 15 / 15 / 6. Primary material curves, jewelry and armor prices and equipment limits are retained. Occasional one-item Zone-material costs below are additional.

## Preparation costs and equipment work

| Core upgrades | Previous gold | Build 11 gold |
| --- | ---: | ---: |
| Iron refinement 0–10 + speed 0–5 | 1,485 | 785 |
| Steel refinement 10–20 + speed 5–10 | 3,050 | 1,885 |
| Steel promotion per style | 150 | 100 |

Iron refinement costs 18 + 9 × current rank; Iron speed costs 20 + 10 × current rank. Steel refinement/speed costs 45 + 22 × ranks above the Iron limit. Resources and later rank goals remain required. Equipment work trains its matching discipline: crafting a new weapon gives 60 XP, refinement 60 / 120, speed 20 / 40 for Iron / Steel, and promotion 100. Equipping again and failed purchases grant none. Existing armor-work XP remains unchanged.

Older saves receive a one-time gold credit equal to the price reduction on currently owned refinement/speed ranks and Steel promotions. This preserves the value of owned upgrades without estimating a full spending history; no materials, gear, balances or allocations are removed and no retrospective skill XP is added. The credit is recorded in Settings → Messages. [Preparation comparison](PREPARATION.md) separates steady and lean routes, active work, combat/retries and the Steel handoff.

Above the single-target budget (100 DPS in Zone 1, 200 in Zones 2–4, 300 from Zone 5), each additional calculated DPS contributes 0.25 actual DPS. Live primary damage uses the same adjustment. Ranged extra arrows contribute 15% each and are included in that figure. Conditional effects, burns, chains, ricochets, secondary targets and temporary blessings are additional.

## Dungeon Shop

| Perk | Dungeoneering | Maximum rank | First price |
| --- | ---: | ---: | ---: |
| Ember Edge | Start | 5 | 6 |
| Winter Thread | Start | 3 | 6 |
| Soul Conductor | Start | 4 | 8 |
| Fracture | Start | 3 | 8 |
| Dungeon Ward | Start | 4 | 8 |
| Battle Geometry · changes by style | Start | 3 | 10 |
| Echo Arts · changes by style | Start | 3 | 12 |
| Spellbreaker | Start | 3 | 10 |
| Cold Verdict | 3 | 3 | 14 |
| Returning Power · changes by style | 5 | 3 | 18 |
| Gravitation | 8 | 3 | 22 |
| Mirrorcraft | 12 | 3 | 26 |

Eight combat perks are available from the start. More unlock at levels 3, 5, 8 and 12. Costs grow by 2.8× per rank, rounded upward; every exact rank price is in balance-report.json. Purchased ranks apply across all Zones in the same Dungeon. Traditional flat damage, speed, health, critical chance, gold, XP and regeneration are reserved for other systems.

| Shared purchase | Melee | Mage | Ranged |
| --- | --- | --- | --- |
| Battle Geometry | Each rank adds one sweep target and 12% melee reach. | Projectiles seek targets, prioritizing elites and bosses. Each rank improves steering. | Projectiles pierce one more target per rank, keeping 84% damage after each. |
| Echo Arts | A hit can send a weak blade into another nearby target. | Projectiles ricochet to another enemy per rank, keeping 70% damage. | Fire one extra arrow per rank, each dealing 15% damage. |
| Returning Power | Occasional hits throw a blade that returns to you. | Occasional spells release an orb that returns to you. | Occasional shots release an arrow that returns to you. |

The shop displays the equipped style and explains that these effects change when switching weapon. Every purchase has an effect for all three styles.

## Dungeon Sigils and gold

| Zone | Expected Sigils / first clear |
| --- | ---: |
| 1 | 35.32 |
| 2 | 71.09 |
| 3 | 129.31 |
| 4 | 131.28 |

Ordinary enemies have a 0.3% chance of one Sigil, rising to 0.42% at Fortune 4. All elites, including rares, have a 35% chance of one. Guardians grant 1 / 1 / 2, with another 3 from the final overlord of each Zone. Summoned enemies and totems grant no rewards or wave progress. The estimate includes first-clear known-elite substitutions and expected rare spawns, without requiring an ability purchase.

| Zone | Guardian gold | Floor caches | Baseline gold without elites |
| --- | ---: | ---: | ---: |
| 1 | 126 | 65 | 191 |
| 2 | 189 | 104 | 293 |

Ordinary kills grant no gold unless Golden Hunt is active. Existing gold jewelry modifies normal combat income. Fractional gold persists. Scavenging remains a separate source.

## Monster loot and vouchers

Monster gold, Sigils, essence, rare materials and vouchers first land on the ground. After a brief landing, loot within 68 units draws toward the player; pickup jewelry and Gravitation extend this radius. Credit and the existing receipt appear only on collection. Unclaimed loot has no expiry, remains saved on its floor through death/retry/reload/travel, and is gathered automatically at floor completion. Recent loot records collected rewards. Health motes and blessing spoils keep their existing behavior.

| Enemy | Material chance | Bundle | Maximum with bonuses |
| --- | ---: | ---: | ---: |
| normal | 1.5% | 1 | 6% |
| elite | 8.0% | 3 | 16% |
| boss | 18.0% | 6 | 28% |

Only raw materials drop. Zone 1 uses ore, oak, cloth and fragments; later Zones use ore, coal, willow, ancient salvage and cloth. From Zone 5, unlocked tier-3 gathering sources join the raw-material pool. As a baseline reference, 360 ordinary kills would average 5.4 raw materials; 15 guardians average 16.2. Actual waves substitute some elites for ordinary monsters. Elites add occasional three-item bundles. This remains a supplement to gathering, not a replacement for skilling/refining. Discovery and the Scholar Ring increase material luck; Plentiful Hunt adds 50% chance while active, within the per-enemy caps. Elites and bosses never guarantee material drops.

Guardians have a 6% voucher chance, or 15% for the Zone-final overlord. Only the first defeat of each guardian rolls, including across retries and reloads; completed-floor replays do not roll. The expected Zone 1 supply is about 0.99 vouchers. Each voucher names one rank upgrade: weapon refinement, attack speed, reach, reinforcement, enchantment, jewelry refinement, a specific owned tool, or a named station. Crafting weapons, armor, jewelry or tools and promoting a style to Steel or Mithril require their normal materials. Iron covers jewelry/tools; all three tiers can cover their named station. Zone 5 guardians roll Mithril vouchers. Ownership, matching kind/tier and normal caps apply. Old wildcard inventory and ground balances split deterministically into named upgrades with their total count retained. Existing crafted items remain owned. Redemption is explicit on the matching row. Dungeon Shop and game-time purchases keep their own currencies. Summons and totems grant neither resources nor vouchers.

Verdant Seeds, Ember Cores, Grave Dust and Rift Shards now each pay one unit of any Zone-material cost, in any combination. Earlier Zone banks are spent first; existing balances stay intact. Each even refinement, each final speed / reach / reinforcement / enchantment rank per tier, Steel promotion and station ranks 3 and 5 costs one; Mithril promotion costs two. Starter weapon, armor and tool recipes gain no such cost. A full refinement + speed tier uses six; all five equipment paths use nine. Drop chances remain unchanged. Cost chips show the combined balance and explain the accepted materials; tracked preparation leads back to delving. Vouchers waive these ingredients too.

## Pacing and counterplay

| Zone | Forecast at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~12 min | 80.0 |
| 2 | ~24 min | 160.0 |
| 3 | ~55 min | 160.0 |
| 4 | ~61 min | 160.0 |
| 5 | ~44 min | 240.0 |

- Live Zone 1: **11.0 min**, 375 rewarded defeats, 80.0 reference DPS.
- Live Zone 2: **23.7 min**, 570 rewarded defeats, 160.0 reference DPS.
- Live Zone 3: **56.4 min**, 780 rewarded defeats, 160.0 reference DPS.
- Live Zone 4: **61.7 min**, 960 rewarded defeats, 160.0 reference DPS.
- Live Zone 9: **50.7 min**, 960 rewarded defeats, 240.0 reference DPS.
- Live Zone 15: **51.1 min**, 960 rewarded defeats, 240.0 reference DPS.

The live fixture uses actual spawning, attacks, movement, shield guards, summoning spires, reflection and phase transitions at 40 ms steps. It suppresses incoming damage and XP advancement, skips blessing choices and uses no purchased Dungeon perks. It leaves underfoot runes before returning to reflect centers, destroys spires, defeats guards and intercepts healing streams. These are combat-time benchmarks, not a promise of wall-clock play time. Menus, mistakes and preparation can extend them.

Boss health retains the earlier 1.12× baseline adjustment, followed by this build’s 1.5× health experiment. Bosses change tactics at 75% / 40% HP. Melee uses a capsule matching the visible body of large creatures; player projectiles use swept collision against that same body. Healing and power totems remain interceptable and untargetable. Summoning spires have a health bar and remain until broken, including after their caster falls. They replenish ordinary monsters every 5.5s or elites every 9s, following a visible arrival warning. At most two spires, eight summoned enemies and three summoned elites are active.

Ordinary / crowned spires need 1 / 2 physical impacts regardless of Zone, weapon or damage bonuses. Each bump removes one full impact segment from the existing health bar; weapons cannot target or damage them through any primary or secondary path. Contact uses a 28-unit ground radius and re-arms after leaving 40 units. A red summoning surge retaliates for 8% / 12% player maximum HP before regional damage scaling, normal defenses and invulnerability. Idle, disabled and silenced spires are safe to bump; dashing is always safe. Each accepted dash uses swept contact across the visible base, counts once per spire, bypasses existing walking contact and retains a full impact through shields. Shielding elites can link summoning spires within 340 units. Their shields do not block bump/dash impacts and disappear with either endpoint. Spires keep summoning after their caster dies; the phase waits for the remaining spires and their minions, with no additional rewards from either. Retry, defeat and phase transitions clear transient encounter state. A fast pass counts once, and destroying a spire cancels its pending arrival. Existing minions remain. Spires grant no rewards or wave progress.

Build 11.4 raises ordinary incoming damage in Zone 2 by 25%, without changing health, spawn counts, equipment or rewards. Build 11.5 makes growing stars more frequent in Zone 2 and raises them to speed 200. They remain outbound at least 2.2s and normally reach 230 units from the moving caster before returning; a 3.7s fallback prevents indefinite outbound flight. Cleaves leave 3.2s of red fire dealing 25% of the cleave hit per tick before defenses/invulnerability. Its final floor substitutes six known elites per wave and permits up to three rares at 10% spawn chance. Other floors use a doubled 3% rare chance and one rare per wave. Rares now use the ordinary elite gold, Sigil, blessing, material and healing tables.

Zone 3 onward uses 1.6× normal incoming damage. Opening health is floored at 125% of Zone 2’s final-floor reference, removing the old health drop when crossing the boundary. Existing 80/160 equipment ceilings and earned DPS are retained. The health floor also prevents later Zones stepping back down; reference combat times are recalculated rather than claiming the former 30–40-minute plateau. The first Crypt wave introduces death echoes: a 0.85s warning, a slow pursuing soul, then a final burst, capped at five. The first guardian opens with two expanding Grave Pulse rims; dash across or outrun them. Quadrant and rebounding-ring boundaries are 1.5× wider and taller in actual warning/collision geometry. Ring lifetimes cover the larger travel distance.

The zone-pressure fixture compares stationary and moving controllers with real damage, basic Iron ranged armor and about 55 DPS. The separate zone-challenge-pressure fixture uses 150.18 DPS, reinforced Steel ranged armor (189 HP), actual spawns, ammunition, loot, chosen blessings and spire cleanup. Across 3 seeds, stationary play died in 10.4–10.7s on Zone 2’s finale and 8.4–9.3s at Zone 3 entry. Moving counterplay cleared the opening wave and first guardian in 6 of 6 trials: 130.9–189 HP remained in the finale trials and 79.4–189 HP in the Crypt trials. These are short automated controller comparisons, not human difficulty ratings; raw rows are in balance-report.json.

Codex is nested inside Inventory (C still opens it). Defeat can open the last available skill directly without reviving or restarting the floor; returning to Delve offers the regular retry. All ten chosen blessings stack through the normal picker, multiply or add according to their effect, retain independent saved timers and show combined strength; chain chance retains its 85% cap and Silence lasts while any copy remains.

## Warning language and ability library

| Color | Meaning |
| --- | --- |
| Red | Dangerous to the player only |
| Violet | Dangerous to player and other monsters |
| Gold / white center | Touch the center to reflect immediately |
| Teal | Safe area or an intercepted benefit |
| Blue | Shield; remove its source / Royal Guards |

Build 11.2 adds illustrated, animated roots, molten eruptions, bone hands, crystal ruptures, physical projectiles, chains, shield emblems and summoning portals. Threefold Ruin now grows full-height roots, lava, bone hands or crystals through the three dangerous quarters, with connected ground fissures. The empty teal quarter has a sanctuary symbol instead of a SAFE text label. Threat rims retain their existing geometry and colors. Artwork stays outside safe quarters and ring centers. Decorative motion uses the paused combat clock, with steady reduced-motion appearances. Totem streams use green crosses for healing and red swords for damage; the attack-speed palette uses blue chevrons. Stream colors persist through interception; disabled links are muted. This presentation pass does not change damage, collision, durations or rewards.

Instruction labels fade in, fade out and recur on a real-time clock; changing instructions restart the reminder. Hazard geometry and health bars remain visible. Reduced motion uses steady visibility windows. Colors are reinforced by outlines, shapes and labels. Violet attacks deal 35% ordinary, 12% elite or 2.5% boss maximum HP before shields, once per cast; the caster is immune. These hits cannot trigger player lifesteal, enchantment or weapon procs.

The encounter library now has 29 patterns: the ten original attacks plus nineteen expanded patterns. Final guardians use a broad rotation and forced phase attacks.

- **Grave Pulse**: Expanding bone rings · dash across the rims.
- **Rebounding Barrage**: Three rings · gaps rotate · violet shots rebound.
- **Growing Stars**: Projectiles grow · leave a wider gap.
- **Homeward Blades**: Red blades turn home · watch the return path.
- **Crossfire**: Violet cross · lure enemies into the lanes.
- **Spiral Barrage**: Rotating gaps · keep moving.
- **Threefold Ruin**: Three red quarters · enter the teal quarter.
- **Marching Ruin**: Red lanes strike in numbered order.
- **Outer Ruin**: Teal center · red outer ring.
- **Inner Ruin**: Red center · move outside.
- **Closing Jaws**: Two violet sweeps · use the gap.
- **Calling Spire**: Bump once to break · dash or wait while red.
- **Royal Calling**: Bump twice · step away between hits · dash or wait while red.
- **Royal Guard**: Blue shield · defeat both guards.
- **Hungry Mirror**: Touch the gold rune; step out first if it appears under you · missing hurts and heals the boss.
- **Marked Ground**: Red marks lock on cast · step between them.
- **Siphon Tether**: Break the red tether · move beyond the ring.
- **Orbital Blades**: Red blades orbit then fly outward.
- **Ruinous Rush**: Violet charge leaves a burning trail.

Rebounding Barrage fires three spaced rings that bounce off the marked arena bounds. Growing Stars expand from radius 6 to at most 23. Homeward Blades turn back toward their caster after 1.25s. Build 11.4 rotates three reflect variants: illustrated dangerous jaws with a safe teal opening, a distant timed rune, and an underfoot rune requiring exit beyond 48 units before returning. Touching the 34-unit center triggers immediately, including a swept dash entry. Casters keep pursuing while the ward is active. Timers allow at least 3 seconds (3.4 for underfoot runes), increased for distant travel. Closed jaws hurt for 4% maximum HP; ignoring a timer hurts for 8% at any distance, both before defenses and invulnerability. These two fractions do not gain the Zone 2 damage multiplier. A successful reflect returns 12% caster maximum HP and staggers for 1.6s; a missed Hungry Mirror also restores 5% boss HP. Royal Guards reduce boss damage taken by 70% until both are defeated. Major arena attacks and reflect warnings do not overlap other casts; projectile rings remain visible and their center can be protected by a reflect ward.

## Stackable blessings and healing

Rare and other non-summoned elites each leave a blessing choice 35% of the time. Walk over spoils to pause combat and choose one of three cards by click, touch or keys 1/2/3. The outer frame and fullscreen tint/blur are removed; only the three cards and Skip remain over the arena. Movement and Escape cannot select or dismiss it; Skip explicitly discards it. Choice contents are fixed when dropped and persist through reload.

| Blessing | Duration | Effect |
| --- | ---: | --- |
| Battle Fervor | 45s | +18% hit damage |
| Windstep | 40s | +15% attack speed · +12% movement |
| Stonebreaker | 60s | +25% damage to elites and bosses |
| Totem Silence | 45s | Disable every enemy totem while this blessing lasts |
| Stillworld | 40s | All enemy movement is halved, including charges |
| Golden Hunt | 50s | Each non-summoned kill grants 1 extra gold |
| Plentiful Hunt | 50s | +50% material drop chance; drops remain rare |
| Chain Reaction | 45s | Hits have a 22% chance to arc to another enemy |
| Momentum | 45s | +10% hit damage · +8% attack speed |
| Long Reach | 50s | +25% attack reach for Melee, Mage and Ranged |

A vertical, scrollable combat column shows temporary buffs. On mobile it is 44 units wide and shows only icons with timers above them, retaining 44-unit touch targets. Desktop keeps names, effects and counts. Details list every independent remaining time, including Rally. Different blessings and repeated copies stack with independent combat timers. Damage, attack speed, reach and movement multipliers multiply; extra gold adds; material luck increases the capped drop chance. Menus, pause and skilling freeze timers. Blessings carry across Zones in the same Dungeon. Secondary proc attacks do not recursively trigger more procs. No new blessing heals.

Ordinary monsters have a 2% chance of a 3% maximum-HP heal. Other elites have a 55% chance of 12%; rares use that same 55% chance and 12% heal. Intercepted healing restores 0.35% player maximum HP per second, with a finite 15% lifetime reserve per healing totem. Once depleted it still blocks the caster’s healing. An uninterrupted stream restores 0.4% caster maximum HP per second. Healing streams do not stack. The lifesteal ring starts at 0.5% of actual health removed; fifty fine refinements raise it to at most 0.5625%.

## Persistent progression and migration

Dungeoneering levels now follow Zone milestones. Combat XP is retained as a historical ledger; old saved ground XP is banked once and no new XP diamonds spawn. Existing equipment, materials, point balances, allocations and prior combat-perk unlocks survive migration. The first new point is earned at Zone 2, and the second on completing Zone 2. Ammunition still supplies ten seconds of firing per arrow or rune.

After Zone 1 Floor 1, the result and a saved, dismissible reminder explain that all five floors lead to the first Mastery point at Zone 2, with a Delving / Skilling-including-idle choice. Once enough essence is held for an owned style’s first enchantment, a separate reminder opens that Warding recipe and explains the remaining bars and gem. Reminders defer during bosses, menus, pauses and active holds. Floor travel, equipment, 55 authored floors and 42 ordinary / 42 rare creature forms are preserved.

Old Zone wallets and the full historical price of every purchased rank are refunded at 25 seals per Sigil. Fractional credit is retained and a versioned receipt prevents a second refund. Original Zone ledgers are archived in the save. Earlier progression first passes through the existing XP / Mastery migration. Gold, materials, equipment, cached XP and Mastery are preserved. A legacy active blessing becomes one entry in the stacking collection.

Run npm test for the browser suites, including 76 new-pattern / environment combinations, mobile picker safety, reward isolation, exact migration, style-adaptive perks, base equipment ceilings and full Zone simulations. Run npm run report:balance to regenerate this document and balance-report.json.
