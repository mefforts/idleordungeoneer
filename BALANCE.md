# Dungeon progression and balance

Build 10.0 replaces individual Zone Shops with a permanent Dungeon Shop. All current Zones belong to The First Descent. The data model can assign future Zones to a new Dungeon with a separate wallet and purchases. Equipment, global Dungeoneering and Mastery retain their own roles.

Build 10.1 adds physical counterplay to summoning spires: one bump breaks an ordinary spire; a crowned spire takes two. Leave the base between impacts. Teal is safe; red means a summoning surge. Dash through a surge or wait for teal to avoid retaliation.

## Dungeoneering and game time

Build 11 starts Dungeoneering at level 0. Reaching Zones 2, 5, 10, 20, 40 and so on grants one level and one shared point. After Zone 5 the milestone doubles each time. Replays and kills grant no extra points. This defines long-term milestones without adding Zone content.

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

Optional Mastery allocations share the bank after the first speed choice. Refunding these allocations does not refund permanent time ranks. Existing point balances and allocated ranks are retained; earlier XP-based combat-perk unlocks remain available.

## Equipment ceilings

| Weapon | Style | Iron | Dedicated Iron | Steel | Dedicated Steel |
| --- | --- | ---: | ---: | ---: | ---: |
| Arming Sword | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Sword & Shield | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Halberd | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Greatsword | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Hunting Bow | Ranged | 80.0 | 86.4 | 160.0 | 172.8 |
| Focus Staff | Mage | 80.0 | 86.2 | 160.0 | 171.9 |

These figures use maximum refinement and speed, 5% base critical chance and matching robes for Mage. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. Material recipes, jewelry, armor prices and equipment limits remain unchanged.

## Preparation costs and equipment work

| Core upgrades | Previous gold | Build 11 gold |
| --- | ---: | ---: |
| Iron refinement 0–10 + speed 0–5 | 1,485 | 785 |
| Steel refinement 10–20 + speed 5–10 | 3,050 | 1,885 |
| Steel promotion per style | 150 | 100 |

Iron refinement costs 18 + 9 × current rank; Iron speed costs 20 + 10 × current rank. Steel refinement/speed costs 45 + 22 × ranks above the Iron limit. Resources and later rank goals remain required. Equipment work trains its matching discipline: crafting a new weapon gives 60 XP, refinement 60 / 120, speed 20 / 40 for Iron / Steel, and promotion 100. Equipping again and failed purchases grant none. Existing armor-work XP remains unchanged.

Older saves receive a one-time gold credit equal to the price reduction on currently owned refinement/speed ranks and Steel promotions. This preserves the value of owned upgrades without estimating a full spending history; no materials, gear, balances or allocations are removed and no retrospective skill XP is added. The credit is recorded in Settings → Messages. [Preparation comparison](PREPARATION.md) separates steady and lean routes, active work, combat/retries and the Steel handoff.

Above 100 single-target DPS in Zone 1 or 200 in later Zones, each additional calculated DPS contributes 0.25 actual DPS. Live primary damage uses the same adjustment. Ranged extra arrows contribute 15% each and are included in that figure. Conditional effects, burns, chains, ricochets, secondary targets and temporary blessings are additional.

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
| 1 | 36.80 |
| 2 | 69.34 |
| 3 | 131.37 |
| 4 | 134.25 |

Ordinary enemies have a 0.3% chance of one Sigil, rising to 0.42% at Fortune 4. Other elites have a 35% chance of one. Rare creatures guarantee one. Guardians grant 1 / 1 / 2, with another 3 from the final overlord of each Zone. Summoned enemies and totems grant no rewards or wave progress. The estimate includes first-clear known-elite substitutions and expected rare spawns, without requiring an ability purchase.

| Zone | Guardian gold | Floor caches | Baseline gold without elites |
| --- | ---: | ---: | ---: |
| 1 | 126 | 65 | 191 |
| 2 | 189 | 104 | 293 |

Ordinary kills grant no gold unless Golden Hunt is active. Existing gold jewelry modifies normal combat income. Fractional gold persists. Scavenging remains a separate source.

## Monster loot and vouchers

XP diamonds are replaced by receipts for actual awarded gold, Sigils, essence, rare materials and vouchers. Rewards are credited once on defeat, persist through death and are readable in Inventory’s recent loot. Health motes and blessing spoils keep their existing pickup behavior.

| Enemy | Material chance | Bundle | Maximum with bonuses |
| --- | ---: | ---: | ---: |
| normal | 1.5% | 1 | 6% |
| elite | 8.0% | 3 | 16% |
| boss | 18.0% | 6 | 28% |

Only raw materials drop. Zone 1 uses ore, oak, cloth and fragments; later Zones use ore, coal, willow, ancient salvage and cloth. As a baseline reference, 360 ordinary kills would average 5.4 raw materials; 15 guardians average 16.2. Actual waves substitute some elites for ordinary monsters. Elites add occasional three-item bundles. This remains a supplement to gathering, not a replacement for skilling/refining. Discovery and the Scholar Ring increase material luck; Plentiful Hunt adds 50% chance while active, within the per-enemy caps. Elites and bosses never guarantee material drops.

Guardians have a 6% voucher chance, or 15% for the Zone-final overlord. Only the first defeat of each guardian rolls, including across retries and reloads; completed-floor replays do not roll. The expected Zone 1 supply is about 0.99 vouchers. A voucher pays for one eligible weapon refinement of its Iron/Steel tier; it cannot bypass promotion, ownership or rank limits. Redemption is explicit at the Equipment bench. Summons and totems grant neither resources nor vouchers.

## Pacing and counterplay

| Zone | Forecast at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~10 min | 80.0 |
| 2 | ~20 min | 160.0 |
| 3 | ~30 min | 160.0 |
| 4 | ~35 min | 160.0 |

- Live Zone 1: **9.3 min**, 375 rewarded defeats, 80.0 reference DPS.
- Live Zone 2: **20.3 min**, 570 rewarded defeats, 160.0 reference DPS.
- Live Zone 3: **30.8 min**, 780 rewarded defeats, 160.0 reference DPS.
- Live Zone 4: **35.9 min**, 960 rewarded defeats, 160.0 reference DPS.
- Live Zone 9: **40.9 min**, 960 rewarded defeats, 160.0 reference DPS.
- Live Zone 15: **41.1 min**, 960 rewarded defeats, 160.0 reference DPS.

The live fixture uses actual spawning, attacks, movement, shield guards, summoning spires, reflection and phase transitions at 40 ms steps. It suppresses incoming damage and XP advancement, skips blessing choices and uses no purchased Dungeon perks. It moves to reflect centers, destroys spires, defeats guards and intercepts healing streams. These are combat-time benchmarks, not a promise of wall-clock play time. Menus, mistakes and preparation can extend them.

Bosses have 12% more health than the previous baseline and change tactics at 75% / 40% HP. Melee uses a capsule matching the visible body of large creatures; player projectiles use swept collision against that same body. Healing and power totems remain interceptable and untargetable. Summoning spires have a health bar and remain until destroyed or their caster falls. They replenish ordinary monsters every 5.5s or elites every 9s, following a visible arrival warning. At most two spires, eight summoned enemies and three summoned elites are active.

Ordinary / crowned spires need 1 / 2 physical impacts regardless of Zone, weapon or damage bonuses. Each bump removes one full impact segment from the existing health bar; weapon damage can help finish it. Contact uses a 28-unit ground radius and re-arms after leaving 40 units. A red summoning surge retaliates for 8% / 12% player maximum HP before normal defenses and invulnerability. Idle, disabled and silenced spires are safe to bump; dashing is always safe. A fast pass counts once, and destroying a spire cancels its pending arrival. Existing minions remain. Spires grant no rewards or wave progress.

## Warning language and ability library

| Color | Meaning |
| --- | --- |
| Red | Dangerous to the player only |
| Violet | Dangerous to player and other monsters |
| Gold / white center | Stand in the center to reflect |
| Teal | Safe area or an intercepted benefit |
| Blue | Shield; remove its source / Royal Guards |

Instruction labels fade in, fade out and recur on a real-time clock; changing instructions restart the reminder. Hazard geometry and health bars remain visible. Reduced motion uses steady visibility windows. Colors are reinforced by outlines, shapes and labels. Violet attacks deal 35% ordinary, 12% elite or 2.5% boss maximum HP before shields, once per cast; the caster is immune. These hits cannot trigger player lifesteal, enchantment or weapon procs.

The encounter library now has 28 patterns: the ten existing attacks plus the following eighteen. Final guardians use a broad rotation and forced phase attacks.

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
- **Hungry Mirror**: Gold center reflects · a missed mirror heals the boss.
- **Marked Ground**: Red marks lock on cast · step between them.
- **Siphon Tether**: Break the red tether · move beyond the ring.
- **Orbital Blades**: Red blades orbit then fly outward.
- **Ruinous Rush**: Violet charge leaves a burning trail.

Rebounding Barrage fires three spaced rings that bounce off the marked arena bounds. Growing Stars expand from radius 6 to at most 23. Homeward Blades turn back toward their caster after 1.25s. A successful reflect returns 12% maximum HP and staggers for 1.6s; a missed Hungry Mirror restores 5% boss HP. Royal Guards reduce boss damage taken by 70% until both are defeated. Major arena attacks and reflect warnings do not overlap other casts; projectile rings remain visible and their center can be protected by a reflect ward.

## Stackable blessings and healing

Rare creatures always leave a blessing choice. Other non-summoned elites leave one 35% of the time. Walk over spoils to pause combat and choose A/B/C by click, touch or keys 1/2/3. Movement and Escape cannot select or dismiss it; Skip explicitly discards it. Choice contents are fixed when dropped and persist through reload.

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

A visible combat strip shows temporary buffs, stack counts and the next expiry. Details list every independent remaining time, including Rally. Different blessings and repeated copies stack with independent combat timers. Damage, attack speed, reach and movement multipliers multiply; extra gold adds; material luck increases the capped drop chance. Menus, pause and skilling freeze timers. Blessings carry across Zones in the same Dungeon. Secondary proc attacks do not recursively trigger more procs. No new blessing heals.

Ordinary monsters have a 2% chance of a 3% maximum-HP heal. Other elites have a 55% chance of 12%; rares have a 70% chance of 15%. Intercepted healing restores 0.35% player maximum HP per second, with a finite 15% lifetime reserve per healing totem. Once depleted it still blocks the caster’s healing. An uninterrupted stream restores 0.4% caster maximum HP per second. Healing streams do not stack. The lifesteal ring remains at 0.5% of actual health removed.

## Persistent progression and migration

Dungeoneering levels now follow Zone milestones. Combat XP is retained as a historical ledger; old saved ground XP is banked once and no new XP diamonds spawn. Existing equipment, materials, point balances, allocations and prior combat-perk unlocks survive migration. The first new point is earned at Zone 2, and the next at Zone 5. Ammunition still supplies ten seconds of firing per arrow or rune.

The first idle-slot tip explains that the next slot unlocks at Zone 2. Crafting the first upgraded weapon gives a refinement / Warding enchantment tip. Floor travel, equipment, 55 authored floors and 42 ordinary / 42 rare creature forms are preserved.

Old Zone wallets and the full historical price of every purchased rank are refunded at 25 seals per Sigil. Fractional credit is retained and a versioned receipt prevents a second refund. Original Zone ledgers are archived in the save. Earlier progression first passes through the existing XP / Mastery migration. Gold, materials, equipment, cached XP and Mastery are preserved. A legacy active blessing becomes one entry in the stacking collection.

Run npm test for the browser suites, including 72 new-pattern / environment combinations, mobile picker safety, reward isolation, exact migration, style-adaptive perks, base equipment ceilings and full Zone simulations. Run npm run report:balance to regenerate this document and balance-report.json.
