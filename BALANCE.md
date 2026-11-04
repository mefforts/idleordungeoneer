# Dungeon progression and balance

Build 11.11.0 upgrades travelling attacks with seven layered physical assets and a consistent signal: teal openings, purple attacks that hit players and monsters, red player-only threats, yellow interrupt brackets and gold/white reflect centers. Channelers, cut links, lanterns, anchors, charging enemies and siphons use yellow marks; reflected/dash recovery uses a small reset symbol. Standard hazard rims gain stronger contrast without filling large opaque panels.

Walking Hedge sends two or three parallel thorn walls, with offset 100-unit openings. Initial speed is at least 245 world units/second or 1.3 times player running speed, and only rises if movement buffs require it. Walls begin 220 units behind the player along their travel axis and are separated by 1.5 seconds of their initial speed; successive openings shift at most 100 units. Each clearing has a checked route and terrain corridor. Walls span the world across their travel axis, so walking around an end or waiting 4.4 seconds no longer works. Each wall retires only after passing the player, living enemies and visible screen. A direct dash over the thorns is protected but does not refund dash; a dash-then-opening route works at 10/40/80 ms simulation steps. Each wall can hurt a player once.

Grave Pulse starts with one ring; the greater of floor band and combat phase selects up to three. Repeated rings launch 1.2 combat seconds apart, so the normal 3.2-second cooldown cannot solve the entire sequence. Crossing a rim completely during a dash immediately refunds it, once per ring; touching or skimming the same side does not. Pending and active rings share one sequence budget across casters. Every ring still expands faster than running, with swept collision and offscreen retirement after all actors are passed. Each ring has its own friendly-fire ledger, with normal caster immunity and category fractions. Collapsing Nova retains its separate single outgoing ring.

Rolling Furnace progresses from repeated bankshots to splitting cores and paired crossing bankshots. Train/cross casts launch two or three cores 0.95 seconds apart; a split core forks into two smaller pieces at its marked bank. Shots travel at 230 units/second (fragments 1.12 times that), with a 24-unit core radius and 16-unit fragments. Every bank/fork is previewed and uses the same piecewise trajectory for rendering and moving swept collision. Rollers keep going beyond their former 4.6-second lifetime and the arena border until they pass the actors and viewport. Purple friendly fire hits each other enemy at most once per core; the caster is immune. These projectile dodges do not refund dash.

Travelling attacks pause with combat. Owner defeat, player defeat, retry and phase changes clear their active and pending state; defeating a caster still cancels that caster’s attacks. Enemy HP, equipment, skilling and loot retain their prior calibration. Clear times below include the new repeated patterns.

Build 11.10.0 gives elites, rares and guardian Echoes flanking/standoff movement and three interruptible priorities: Ascendance, Rare Awakening and Living Conduit. They walk to clear, separated channel sites; at most one task runs in Zones 1–2 and two from Zone 3 onward. Full bosses, summons and uncommons do not perform these tasks. Existing links retain their required separation.

Ascendance channels for 5.5 seconds, heals 0.35% maximum HP per second (at most 2%), then grants 35% extra attack damage and 25% faster cooldown recovery for 14 seconds. Warnings retain their full duration and special-hit damage remains capped at 50% maximum HP. Rare Awakening channels for six seconds to promote an existing ordinary mob, preserving its health fraction and wave count; at most one promotion per early-Zone wave and two from Zone 3. Summons cannot be promoted. Living Conduit summons until interrupted, first after 2.8 seconds and then at 5.5-second intervals, with a 1.2-second warning and the shared eight-summon cap. These minions grant no loot, XP or kill credit.

Dash through a task owner, stun it, land three focused weapon hits (at least 0.15 seconds apart), or deal 12% of its maximum HP in direct weapon damage to interrupt. Secondary splash and passive burn do not count. Removing a recruit, defeating a caster, silence against Conduit, defeat, retry and phase changes clear their relevant channels. Menu pauses freeze progress. Interrupted tasks cause a 0.8-second stagger and retry after at least 15 seconds.

Dashing through an elite, rare, boss or guardian Echo inflicts a 0.65-second stun and zero damage, once per enemy per dash. Ordinary mobs and uncommons are excluded. This plain stun does not refund dash. Successful dash counters immediately reset its cooldown: reflects, task/charge/siphon interruptions, accepted summoning-spire impacts, support-totem breaks, severed threads, seeds, anchors, lanterns, gold/teal rune counters and Grave Pulse rim crossings. Walking counters do not refund. A pulse grants at most one refund; crowned spires still require two distinct impacts. Refunding does not end or extend the existing 0.35-second dash protection.

The underlying health calibration, equipment, material economy and ordinary wave budgets remain unchanged. Actual clear times can increase because enemies spread out, heal or promote a wave member. Full-Zone controllers now pursue channelers and use dash interrupts; their measured times below include that behavior. Natural-spawn reward estimates exclude optional ritual promotions; a promotion keeps that mob’s normal rare loot.

Build 11.9.0 separates linked enemy pairs with a visible teleport and a 220-unit minimum span; Briar Leash anchors share the clear crossing rule. Rally/Leash cuts work during formation and activity, including swept final-frame dashes. Link movement restrictions end on sever, expiry, owner/partner defeat or encounter cleanup. Blocked placements defer without teleporting enemies.

Warband Resolve grants each elite, rare, boss or guardian Echo 10% damage reduction per other living, unstunned special enemy, capped at 50%, in all Zones. Stunned recipients lose the boon and stop contributing to allies; ordinary/uncommon monsters and totems do not participate. The small shield percentage updates immediately. Royal Guard and directional shields remain separate multiplicative effects.

Common charge widths, cleave reach, ground-mark radii, beam widths and nova radii grow by 25%, with the warning and collision using the same dimensions.

Hungry Siphon breaks on an outward dash; Knotted Siphon breaks on a dash through its reachable teal knot. Channels allow at least four combat seconds and dash recharge, give 0.8s before the drain begins, then use 2% maximum-HP DoT ticks through the shared fire cap. Caster healing is at most 0.2% per actual damaging tick and 2% per channel. Walking does not sever a siphon, and expiration has no final burst. Enemy HP, calibration, equipment, rewards and spawn cadence retain v11.8.2 rules.

Build 11.8.2 adds 75% regular-elite HP and 25% boss/guardian-Echo HP in Zones 1–2, measured against v11.8.1. Royal Guards and summoned elites count as regular elites. Rares, uncommons, ordinary monsters, spires and all enemies from Zone 3 onward retain their previous health. These multipliers apply once after the existing health calibration; player damage, incoming damage, rewards and spawn cadence keep their current rules.

Build 11.8.1 gives health motes a 12-combat-second lifetime, including at full health, and a three-second fade. Elites/rares independently roll 25% for blessing spoils and 50% for health; ordinary health drop frequency and all healing amounts remain. Other ground loot keeps its persistence. Zone 1’s Floor 5 overlord opens with Walking Hedge and repeats it between normal-rotation attacks, retaining his full attack variety and the major-attack budget.

Build 11.8 adds 39 selected themed mechanics, 4/5/6-enemy guardian interludes and capped uncommon ranged creatures. [Selected mechanics and counterplay](SELECTED_MECHANICS.md); [50 new theme-neutral proposals only](THEME_NEUTRAL_IDEAS.md). Per-enemy health and ordinary spawn cadence retain their previous calibration.

Build 11.7 gives Iron 3 weapon refinements, Steel 12 and Mithril 10, with exponential late Steel material costs. The all-three-style 80% material reference trains each discipline to about level 20; idle runs at 25% of base active speed. Equipment ceilings are 80 / 240 / 480 DPS, with a stronger Mithril starting point. See [SKILL_ECONOMY.md](SKILL_ECONOMY.md) for the reproducible material and XP budget. Enemy health and spawn cadence retain their previous calibration.

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

Levels 1–10 retain their original thresholds. Level 20 now requires 32,166 total XP instead of 7,410. Tier 1 gives 10% XP after level 10 and 0.1% after level 20; tier 2 gives 1% after level 20. Later outdated bands taper again. Material yield stays full. Active/idle work share XP per batch, and idle uses 25% of the base active production rate. The reward splits exactly at every training boundary. Active/idle/offline production, instant refining batches, jewelry/tool refinements, new armor, equipment ranks and transmutation use the shared award path. Artisan retains its eightfold base XP.

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

Completing Zone 3 unlocks Mithril resources and equipment at matching discipline level 20. Owned Steel weapons can promote without max refinement; each tier has its own weapon ranks (3 Iron / 12 Steel / 10 Mithril). Speed, reach and reinforcement retain their cumulative caps of 5 / 10 / 15; enchantment retains 2 / 4 / 6. Armor is crafted separately. Mithril metal, blue ranged leathers and green Runewoven robes use the same silhouettes and joints, with small belt and shoulder changes. Ten activities introduce mithril ore/bars, yew, verdant cloth, enchanted salvage/fragments and sapphires. The equipment tier does not change authored floor layouts. Steel reaches 240 equipment DPS; Mithril starts around 300 with Steel speed training and reaches 480. Soft budgets of at least 100 / 300 / 600 follow equipped tier. Enemy HP calibration remains fixed at its previous values.

The work-scene controls now separate Skills navigation from direct Gather/Refine or input-source swaps. A swap clears held input, consumes no materials and leaves assigned idle tasks untouched.

## Unified crafting and fine refinements

Gather and Refine list all three tiers together, including locked rows. Every tier-2 activity requires Zone 2 access and level 10 in its matching discipline, across active/idle/offline work; existing inventories and owned gear remain. Preparation falls back to available tier-1 ammunition/gold sources and directs blocked material work toward training. Steel promotions sit directly below their weapon list. Stations and tools use ordinary compact rows in Equipment, with no separate Tools tab or station footer.

Artisan gathering/cutting XP is multiplied by eight and jewelry crafting gives 400 XP. Existing Artisan XP receives the same eightfold catch-up once. Owned jewelry supports 50 optional refinements, each adding 0.25% of its base effect, with 80 base Artisan XP per successful rank before the old-tier reduction. The Leech Ring gains 0.00125 percentage points of lifesteal per rank, from 0.5% to at most 0.5625%. Costs start at one silver bar and 10 gold, grow every ten ranks in silver and by three gold per rank, and add one cut opal each fifth rank.

Crafted tools retain 8% active speed and support ten refinements of +0.5 percentage points each, with normal material/gold costs. They do not accelerate idle work. Relic prospecting is now a normal ingredient-paid activity: 12 fragments for one rough opal, 4s active / 16s idle before bonuses. Prospecting and ancient cleaning use a standing brush-and-relic pose at a bench, with no digging animation. Warding Refine offers a compact resource selector: exactly 100 essence for a random 1–10 chosen raw resources. Unlocks apply and conservation does not discount this essence cost.

The Dungeon Shop has a Long blessings sub-store. Most effects cost 60 interchangeable Zone materials, Golden/Plentiful Hunt cost 80 and Silence/Stillworld cost 100. Purchase activates one independent stack at five times normal combat duration (200–300s), with existing pause, stacking, save and Dungeon rules. The 128-stack limit is checked before spending.

## Encounter health experiment

Build 11.6 retains +75% regular elite health and +50% rare, guardian Echo (boss elite) and boss health. Build 11.6.1 added 2× ordinary minion health and 6× health for special enemies from Zone 3 onward, measured against v11.6.0. Build 11.6.2 doubles ordinary minions again: 4× v11.6.0, or 2× v11.6.1. Special enemies retain their existing 6×; they do not inherit the ordinary multiplier. The Zone 3 step excludes Zones 1–2; Build 11.8.2 separately raises regular elite and boss/Echo health there. Rare and boss-elite flags retain their category precedence. Summoning-spire health and one/two-impact rules remain unchanged. All multipliers apply after the existing health-scale calibration: the equipment curve and ordinary-monster health retain their calibration, with the early-Zone additions recorded above. In Build 11.8 the two interludes add escorts, eligible uncommons have 2× ordinary HP, and elite/rare/boss damage uses maximum-health fractions. Forecast times below include escort durability and a chance-weighted uncommon estimate; concurrent caps can reduce the latter.

## Equipment ceilings

| Weapon | Style | Iron | Dedicated Iron | Steel | Dedicated Steel | Mithril | Dedicated Mithril |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Arming Sword | Melee | 80.0 | 86.4 | 240.0 | 259.2 | 480.0 | 518.4 |
| Sword & Shield | Melee | 80.0 | 86.4 | 240.0 | 259.2 | 480.0 | 518.4 |
| Halberd | Melee | 80.0 | 86.4 | 240.0 | 259.2 | 480.0 | 518.4 |
| Greatsword | Melee | 80.0 | 86.4 | 240.0 | 259.2 | 480.0 | 518.4 |
| Hunting Bow | Ranged | 80.0 | 86.4 | 240.0 | 259.2 | 480.0 | 518.4 |
| Focus Staff | Mage | 80.0 | 86.2 | 240.0 | 257.8 | 480.0 | 514.3 |

These figures use maximum refinement and speed, 5% base critical chance and matching robes for Mage. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron weapons have 3 refinements, Steel 12 and Mithril 10. Speed/reach/reinforcement caps remain 5 / 10 / 15, and enchantment caps remain 2 / 4 / 6. Weapon refinements use 3 / 12 / 10 tier-local ranks. Steel weapon material costs grow 1.48× per rank; its other upgrade material costs grow 1.6×. Steel/Mithril weapon refinements also use cut gems as abrasives. Gold grows more gently. Jewelry, armor crafting and non-weapon rank caps are retained. Occasional one-item Zone-material costs below are additional.

## Historical preparation credit and equipment work

| Historical core upgrades | Before Build 11 | Build 11, before 11.7 |
| --- | ---: | ---: |
| Iron refinement 0–10 + speed 0–5 | 1,485 | 785 |
| Steel refinement 10–20 + speed 5–10 | 3,050 | 1,885 |
| Steel promotion per style | 150 | 100 |

The current all-style refinement material budget and 1×/3× timings are in [SKILL_ECONOMY.md](SKILL_ECONOMY.md). Its 80% reference requires 2,894 Steel bars versus 6,626 at full completion. Active and idle work grant equal XP per item; idle uses four times the base active interval. Skill XP rates are calibrated to that material reference across all five disciplines. Equipment work trains its matching discipline: crafting a new weapon gives 60 XP, refinement 60 / 120, speed 20 / 40 for Iron / Steel, and promotion 100. Equipping again and failed purchases grant none. These are base XP amounts, before the discipline training multiplier and outdated-tier reductions; existing armor-work base XP remains unchanged.

Older saves receive a one-time gold credit equal to the price reduction on currently owned refinement/speed ranks and Steel promotions. This preserves the value of owned upgrades without estimating a full spending history; no materials, gear, balances or allocations are removed and no retrospective skill XP is added. The credit is recorded in Settings → Messages. [Preparation comparison](PREPARATION.md) separates steady and lean routes, active work, combat/retries and the Steel handoff.

Above the single-target budget (at least 100 / 300 / 600 DPS for Iron / Steel / Mithril), each additional calculated DPS contributes 0.25 actual DPS. Live primary damage uses the same adjustment. Ranged extra arrows contribute 15% each and are included in that figure. Conditional effects, burns, chains, ricochets, secondary targets and temporary blessings are additional.

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
| 1 | 48.62 |
| 2 | 98.39 |
| 3 | 184.61 |
| 4 | 186.58 |

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
| 1 | ~16 min | 80.0 |
| 2 | ~24 min | 240.0 |
| 3 | ~239 min | 240.0 |
| 4 | ~254 min | 240.0 |
| 5 | ~135 min | 480.0 |

- Live Zone 1: **16.1 min**, 413 rewarded defeats, 80.0 reference DPS.
- Live Zone 2: **27.8 min**, 648 rewarded defeats, 240.0 reference DPS.
- Live Zone 3: **247.2 min**, 938 rewarded defeats, 240.0 reference DPS.
- Live Zone 4: **270.1 min**, 1118 rewarded defeats, 240.0 reference DPS.
- Live Zone 9: **182.2 min**, 1118 rewarded defeats, 480.0 reference DPS.
- Live Zone 15: **180.0 min**, 1118 rewarded defeats, 480.0 reference DPS.

| Zone | v11.8.1 live reference | Current live reference |
| --- | ---: | ---: |
| 1 | 12.2 min | 16.1 min |
| 2 | 20.8 min | 27.8 min |

This comparison retains reference equipment and invulnerability. The current controller also recognizes task interrupts; movement and random encounters differ, so these times measure pacing rather than a matched human survival or difficulty trial.

The live fixture uses actual spawning, attacks, movement, shield guards, summoning spires, reflection and phase transitions at 40 ms steps. It suppresses incoming damage and XP advancement, skips blessing choices and uses no purchased Dungeon perks. It leaves underfoot runes before returning to reflect centers, destroys spires, defeats guards and intercepts healing streams. These are combat-time benchmarks, not a promise of wall-clock play time. Forecasts use direct damage without the shared Resolve boon; percent-health reflections and friendly fire can shorten actual fights, especially after the Zone 3 health step. Menus, mistakes and preparation can extend them.

Boss health retains the earlier 1.12× baseline adjustment, followed by the 1.5× health experiment, then either the additional 1.25× in Zones 1–2 or the existing 6× step from Zone 3. Bosses change tactics at 75% / 40% HP. Melee uses a capsule matching the visible body of large creatures; player projectiles use swept collision against that same body. Healing and power totems remain interceptable and untargetable. Summoning spires have a health bar and remain until broken, including after their caster falls. They replenish ordinary monsters every 5.5s or elites every 9s, following a visible arrival warning. At most two spires, eight summoned enemies and three summoned elites are active.

Build 11.6.3 allows a dash through a healing or power totem’s base to destroy it without a text prompt or reward. The collision sweeps the same base capsule used by summoning-spire dashes, including final-frame crossings, edge grazes and disabled totems. Walking still intercepts streams and weapons cannot damage them. Destruction stops the stream before that tick’s healing or buff delivery; an already-earned Rally keeps its normal remaining duration. Summoning-spire bump counts, enemy health, damage and reward rules are unchanged.

Ordinary / crowned spires need 1 / 2 physical impacts regardless of Zone, weapon or damage bonuses. Each bump removes one full impact segment from the existing health bar; weapons cannot target or damage them through any primary or secondary path. Contact uses a 28-unit ground radius and re-arms after leaving 40 units. A red summoning surge retaliates for 8% / 12% player maximum HP before regional damage scaling, normal defenses and invulnerability. Idle, disabled and silenced spires are safe to bump; dashing is always safe. Each accepted dash uses swept contact across the visible base, counts once per spire, bypasses existing walking contact and retains a full impact through shields. Shielding elites can link summoning spires within 340 units. Their shields do not block bump/dash impacts and disappear with either endpoint. Spires keep summoning after their caster dies; the phase waits for the remaining spires and their minions, with no additional rewards from either. Retry, defeat and phase transitions clear transient encounter state. A fast pass counts once, and destroying a spire cancels its pending arrival. Existing minions remain. Spires grant no rewards or wave progress.

Build 11.4 raises ordinary incoming damage in Zone 2 by 25%, without changing health, spawn counts, equipment or rewards. Build 11.5 makes growing stars more frequent in Zone 2 and raises them to speed 200. They remain outbound at least 2.2s and normally reach 230 units from the moving caster before returning; a 3.7s fallback prevents indefinite outbound flight. Cleaves leave 3.2s of red fire dealing 25% of the cleave hit per tick before defenses/invulnerability. Its final floor substitutes six known elites per wave and permits up to three rares at 10% spawn chance. Other floors use a doubled 3% rare chance and one rare per wave. Rares now use the ordinary elite gold, Sigil, blessing, material and healing tables.

Zone 3 onward uses 1.6× normal incoming damage. Opening health is floored at 125% of Zone 2’s final-floor reference, removing the old health drop when crossing the boundary. The v11.7 equipment ceilings are 80/240/480, while the earlier enemy health calibration is retained. The health floor also prevents later Zones stepping back down; reference combat times are recalculated rather than claiming the former 30–40-minute plateau. The first Crypt wave introduces death echoes: a 0.85s warning, a slow pursuing soul, then a final burst, capped at five. The first guardian opens with one continuously expanding Grave Pulse ring. Dash through it: it has no fixed lifetime or travel limit and always moves faster than running, including movement buffs. Pulse casts cannot overlap, and the next warning allows dash recharge before impact. Quadrant and rebounding-ring boundaries are 1.5× wider and taller in actual warning/collision geometry. Ring lifetimes cover the larger travel distance.

The zone-pressure fixture compares stationary and moving controllers with real damage, basic Iron ranged armor and about 55 DPS. The separate zone-challenge-pressure fixture uses about 150 DPS, reinforced Steel ranged armor (189 HP), actual spawns, ammunition, loot, chosen blessings and spire cleanup. Across 3 seeds, stationary play died in 7.5–9.5s on Zone 2’s finale and 4.7–5.6s at Zone 3 entry. Moving counterplay cleared the opening wave and first guardian in 3 of 6 trials: 89.8–113.4 HP remained in the finale trials and 0 HP in the Crypt trials. These are short automated controller comparisons, not human difficulty ratings; raw rows are in balance-report.json. This ranged reference keeps its existing movement priorities instead of chasing every new channel. A separate task-chasing comparison survived less well, so these results do not establish the best human interruption strategy.

In the initial v11.6.1 comparison, the moving 150-DPS controller failed all three Zone 3 openings, surviving 34.1–114.2 combat seconds. The same controller cleared all three in [v11.6.0](https://github.com/mefforts/idleordungeoneer/blob/8cd4b2485ea990f9dfd147d34665109cb3a82a52/balance-report.json). Zone 2 trial rows were identical. The controller uses no purchased combat perks or jewelry; these results record the size of the health experiment.

Codex is nested inside Inventory (C still opens it). Defeat can open the last available skill directly without reviving or restarting the floor; returning to Delve offers the regular retry. All ten chosen blessings stack through the normal picker, multiply or add according to their effect, retain independent saved timers and show combined strength; chain chance retains its 85% cap and Silence lasts while any copy remains.

## Warning language and ability library

Build 11.7.1 introduced one continuously expanding violet ring. Build 11.11 extends later casts to a two/three-ring sequence. Dash through each rim to refund dash; the rings cannot be outwaited or outrun. The wave retires only after passing every actor and the visible screen; caster defeat and encounter cleanup retain their normal cancellation. Its launch covers the origin too. Swept collision catches fast crossings, and movement buffs cannot overtake the wave. Separate pulse sequences never overlap across casters; their deliberate rings may overlap within one sequence. The next warning begins only when the remaining dash cooldown fits inside its 1.7-second windup with 0.4 seconds to spare. Moving rings have no teal center. Stationary Outer Ruin refuges are placed clear of the caster, terrain and other enemies, remain inside the visible arena and include time to reach the circle. Crowded arenas defer the cast when no reachable refuge fits. The teal circle and sanctuary symbol remain fixed through impact. Mechanic labels and the combat guide omit the word SAFE.

| Color | Meaning |
| --- | --- |
| Red | Dangerous to the player only |
| Violet | Dangerous to player and other monsters |
| Yellow brackets | Interruptible channel or cut point |
| Gold / white center | Touch the center to reflect immediately |
| Teal | Protected area or an intercepted benefit |
| Blue | Shield; remove its source / Royal Guards |

Build 11.2 adds illustrated, animated roots, molten eruptions, bone hands, crystal ruptures, physical projectiles, chains, shield emblems and summoning portals. Threefold Ruin now grows full-height roots, lava, bone hands or crystals through the three dangerous quarters, with connected ground fissures. The empty teal quarter has a sanctuary symbol instead of a SAFE text label. Threat rims retain their existing geometry and colors. Artwork stays outside safe quarters and ring centers. Decorative motion uses the paused combat clock, with steady reduced-motion appearances. Totem streams use green crosses for healing and red swords for damage; the attack-speed palette uses blue chevrons. Stream colors persist through interception; disabled links are muted. This presentation pass does not change damage, collision, durations or rewards.

Instruction labels fade in, fade out and recur on a real-time clock; changing instructions restart the reminder. Hazard geometry and health bars remain visible. Reduced motion uses steady visibility windows. Colors are reinforced by outlines, shapes and labels. Violet attacks deal 35% ordinary, 12% elite or 2.5% boss maximum HP before shields, once per cast; the caster is immune. These hits cannot trigger player lifesteal, enchantment or weapon procs.

The encounter library now has 68 patterns: the prior 29 plus 39 selected themed mechanics. Ten new mechanics belong to Overgrowth, nine each to Embervault, Hollow Crypt and Astral Rift, and two span all themes. Floor bands and enemy families gate/rotate introductions while retaining each original attack. [Complete selected list](SELECTED_MECHANICS.md).

Build 11.8 uses maximum-health base damage: projectiles start at 10%, heavy hits around 25%, the clearest major failures up to 50%, contact 15%, and missed reflects 15%. Regional flat-damage multipliers are normalized once for these attacks; armor, guard perks, shields and protection still reduce damage. Fury/Rally boosts remain bounded at 50%. Ordinary minion contact retains its existing regional damage. Uncommons instead use 6% shots, 8% single-hit ground marks or 10% charges.

Persistent fire uses 2.5% base damage per 0.35 combat seconds; selected vents/trails range from 1.5% to 3.5%. All simultaneous DoTs share a 5%-per-interval base cap. Hit invulnerability does not erase fire pressure, but dash protection does. Leaving a field resets its first-tick delay. Small combined tick receipts replace repeated heavy screen shake.

The two between-wave interludes now contain a lead guardian and three/four/five Echo escorts, for 4/5/6 total early/middle/deep in each Zone. They must all fall before progression; the final overlord remains separate. Echo health/rewards retain their category rules. Ordinary wave totals and cadence are unchanged.

Uncommons replace 7% of eligible ordinary spawns after the first four, excluding elites, rares, bosses, summons and interludes. Active caps are one in Zone 1, two in Zone 2, three in Zone 3 and four thereafter. They have twice ordinary HP, ordinary loot and one repeatable ranged ability, with staggered first casts and standoff movement. Forecasts approximate the chance-weighted extra durability before active-cap suppression.

Selected mechanics use 156 authored SVG props/medallions plus seven travelling-attack props, shared warning/collision geometry, timer arcs and teal/gold symbols, with the detailed rule in the Codex. Only one new major pattern runs at once; large existing attacks and Grave Pulse cannot overlap it. Mandatory dash warnings allow recharge. Decorative motion stops under reduced motion while essential hazard travel stays visible.

- **Grave Pulse**: Expanding bone ring · dash through the rim.
- **Rebounding Barrage**: Three rings · gaps rotate · violet shots rebound.
- **Growing Stars**: Projectiles grow · leave a wider gap.
- **Homeward Blades**: Red blades turn home · watch the return path.
- **Crossfire**: Violet cross · lure enemies into the lanes.
- **Spiral Barrage**: Rotating gaps · keep moving.
- **Threefold Ruin**: Three red quarters · enter the teal quarter.
- **Marching Ruin**: Red lanes strike in numbered order.
- **Outer Ruin**: Enter the teal circle · avoid the red ring.
- **Inner Ruin**: Red center · move outside.
- **Closing Jaws**: Two violet sweeps · use the gap.
- **Calling Spire**: Bump once to break · dash or wait while red.
- **Royal Calling**: Bump twice · step away between hits · dash or wait while red.
- **Royal Guard**: Blue shield · defeat both guards.
- **Hungry Mirror**: Touch the gold rune; step out first if it appears under you · missing hurts and heals the boss.
- **Marked Ground**: Red marks lock on cast · step between them.
- **Siphon Tether**: Dash away from the caster or through the teal knot.
- **Orbital Blades**: Red blades orbit then fly outward.
- **Ruinous Rush**: Violet charge leaves a burning trail.

Rebounding Barrage fires three spaced rings that bounce off the marked arena bounds. Growing Stars expand from radius 6 to at most 23. Homeward Blades turn back toward their caster after 1.25s. Build 11.4 rotates three reflect variants: illustrated dangerous jaws with a safe teal opening, a distant timed rune, and an underfoot rune requiring exit beyond 48 units before returning. Touching the 34-unit center triggers immediately, including a swept dash entry. Casters keep pursuing while the ward is active. Timers allow at least 3 seconds (3.4 for underfoot runes), increased for distant travel. Closed jaws hurt for 4% maximum HP; ignoring a timer hurts for 15% at any distance, both before defenses and invulnerability. These two fractions do not gain the Zone 2 damage multiplier. A successful reflect returns 12% caster maximum HP and staggers for 1.6s; a missed Hungry Mirror also restores 5% boss HP. Royal Guards reduce boss damage taken by 70% until both are defeated. Major arena attacks and reflect warnings do not overlap other casts; projectile rings remain visible and their center can be protected by a reflect ward.

## Stackable blessings and healing

Rare and other non-summoned elites each leave a blessing choice 25% of the time. Walk over spoils to pause combat and choose one of three cards by click, touch or keys 1/2/3. The outer frame and fullscreen tint/blur are removed; only the three cards and Skip remain over the arena. Movement and Escape cannot select or dismiss it; Skip explicitly discards it. Choice contents are fixed when dropped and persist through reload.

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

Ordinary monsters have a 2% chance of a 3% maximum-HP heal. Other elites have a 50% chance of 12%; rares use that same 50% chance and 12% heal. Motes last 12 combat seconds, including at full health, and fade during the last three. Waves do not reset their age; menus, pauses and skilling freeze it. Motes are transient and clear on floor start, retry or reload, while ordinary ground loot persists. Intercepted healing restores 0.35% player maximum HP per second, with a finite 15% lifetime reserve per healing totem. Once depleted it still blocks the caster’s healing. An uninterrupted stream restores 0.4% caster maximum HP per second. Healing streams do not stack. The lifesteal ring starts at 0.5% of actual health removed; fifty fine refinements raise it to at most 0.5625%.

## Persistent progression and migration

Dungeoneering levels now follow Zone milestones. Combat XP is retained as a historical ledger; old saved ground XP is banked once and no new XP diamonds spawn. Existing equipment, materials, point balances, allocations and prior combat-perk unlocks survive migration. The first new point is earned at Zone 2, and the second on completing Zone 2. Ammunition still supplies ten seconds of firing per arrow or rune.

After Zone 1 Floor 1, the result and a saved, dismissible reminder explain that all five floors lead to the first Mastery point at Zone 2, with a Delving / Skilling-including-idle choice. Once enough essence is held for an owned style’s first enchantment, a separate reminder opens that Warding recipe and explains the remaining bars and gem. Reminders defer during bosses, menus, pauses and active holds. Floor travel, equipment, 55 authored floors and 42 ordinary / 42 rare creature forms are preserved.

Old Zone wallets and the full historical price of every purchased rank are refunded at 25 seals per Sigil. Fractional credit is retained and a versioned receipt prevents a second refund. Original Zone ledgers are archived in the save. Earlier progression first passes through the existing XP / Mastery migration. Gold, materials, equipment, cached XP and Mastery are preserved. A legacy active blessing becomes one entry in the stacking collection.

Run npm test for the browser suites, including all 39 themed mechanics, persistent/repeating barriers and bankshots, elite priorities, swept dash stuns/refunds, proportional damage, DoT limits, interlude completion, capped uncommon spawns, 76 older-pattern / environment combinations, mobile picker safety, reward isolation, exact migration, style-adaptive perks, base equipment ceilings and full Zone simulations. Run npm run report:balance to regenerate this document and balance-report.json.
