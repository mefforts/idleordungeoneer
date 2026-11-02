# Dungeon progression and balance

Build 10.0 replaces individual Zone Shops with a permanent Dungeon Shop. All current Zones belong to The First Descent. The data model can assign future Zones to a new Dungeon with a separate wallet and purchases. Equipment, global Dungeoneering and Mastery retain their own roles.

## Equipment ceilings

| Weapon | Style | Iron | Dedicated Iron | Steel | Dedicated Steel |
| --- | --- | ---: | ---: | ---: | ---: |
| Arming Sword | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Sword & Shield | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Halberd | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Greatsword | Melee | 80.0 | 86.4 | 160.0 | 172.8 |
| Hunting Bow | Ranged | 80.0 | 86.4 | 160.0 | 172.8 |
| Focus Staff | Mage | 80.0 | 86.2 | 160.0 | 171.9 |

These figures use maximum refinement and speed, 5% base critical chance and matching robes for Mage. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. Equipment recipes, jewelry and material costs remain unchanged.

Above 100 single-target DPS in Zone 1 or 200 in later Zones, each additional calculated DPS contributes 0.25 actual DPS. Live primary damage uses the same adjustment. Ranged extra arrows contribute 15% each and are included in that figure. Conditional effects, burns, chains, ricochets, secondary targets and temporary blessings are additional.

## Dungeon Shop

| Perk | Dungeoneering | Maximum rank | First price |
| --- | ---: | ---: | ---: |
| Ember Edge | 1 | 5 | 6 |
| Winter Thread | 1 | 3 | 6 |
| Soul Conductor | 1 | 4 | 8 |
| Fracture | 1 | 3 | 8 |
| Dungeon Ward | 1 | 4 | 8 |
| Battle Geometry · changes by style | 1 | 3 | 10 |
| Echo Arts · changes by style | 1 | 3 | 12 |
| Spellbreaker | 1 | 3 | 10 |
| Cold Verdict | 3 | 3 | 14 |
| Returning Power · changes by style | 5 | 3 | 18 |
| Gravitation | 8 | 3 | 22 |
| Mirrorcraft | 12 | 3 | 26 |

Eight perks are available at level 1. More unlock at levels 3, 5, 8 and 12. Costs grow by 2.8× per rank, rounded upward; every exact rank price is in balance-report.json. Purchased ranks apply across all Zones in the same Dungeon. Traditional flat damage, speed, health, critical chance, gold, XP and regeneration are reserved for other systems.

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

## Pacing and counterplay

| Zone | Forecast at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~10 min | 80.0 |
| 2 | ~20 min | 160.0 |
| 3 | ~30 min | 160.0 |
| 4 | ~35 min | 160.0 |

- Live Zone 1: **9.5 min**, 375 rewarded defeats, 80.0 reference DPS.
- Live Zone 2: **20.3 min**, 570 rewarded defeats, 160.0 reference DPS.
- Live Zone 3: **31.0 min**, 780 rewarded defeats, 160.0 reference DPS.
- Live Zone 4: **36.0 min**, 960 rewarded defeats, 160.0 reference DPS.
- Live Zone 9: **41.1 min**, 960 rewarded defeats, 160.0 reference DPS.
- Live Zone 15: **41.4 min**, 960 rewarded defeats, 160.0 reference DPS.

The live fixture uses actual spawning, attacks, movement, shield guards, summoning spires, reflection and phase transitions at 40 ms steps. It suppresses incoming damage and XP advancement, skips blessing choices and uses no purchased Dungeon perks. It moves to reflect centers, destroys spires, defeats guards and intercepts healing streams. These are combat-time benchmarks, not a promise of wall-clock play time. Menus, mistakes and preparation can extend them.

Bosses have 12% more health than the previous baseline and change tactics at 75% / 40% HP. Melee uses a capsule matching the visible body of large creatures; player projectiles use swept collision against that same body. Healing and power totems remain interceptable and untargetable. Summoning spires have a health bar and remain until destroyed or their caster falls. They replenish ordinary monsters every 5.5s or elites every 9s, following a visible arrival warning. At most two spires, eight summoned enemies and three summoned elites are active.

## Warning language and ability library

| Color | Meaning |
| --- | --- |
| Red | Dangerous to the player only |
| Violet | Dangerous to player and other monsters |
| Gold / white center | Stand in the center to reflect |
| Teal | Safe area or an intercepted benefit |
| Blue | Shield; remove its source / Royal Guards |

Colors are reinforced by outlines, shapes and labels. Violet attacks deal 35% ordinary, 12% elite or 2.5% boss maximum HP before shields, once per cast; the caster is immune. These hits cannot trigger player lifesteal, enchantment or weapon procs.

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
- **Calling Spire**: Destroy the spire · stop its reinforcements.
- **Royal Calling**: Destroy the crowned spire · it calls elites.
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
| Plentiful Hunt | 50s | Each non-summoned kill grants 1 material from this Zone |
| Chain Reaction | 45s | Hits have a 22% chance to arc to another enemy |
| Momentum | 45s | +10% hit damage · +8% attack speed |
| Long Reach | 50s | +25% attack reach for Melee, Mage and Ranged |

Different blessings and repeated copies stack with independent combat timers. Damage, attack speed, reach and movement multipliers multiply; extra gold/material rewards add. Menus, pause and skilling freeze timers. Blessings carry across Zones in the same Dungeon. Secondary proc attacks do not recursively trigger more procs. No new blessing heals.

Ordinary monsters have a 2% chance of a 3% maximum-HP heal. Other elites have a 55% chance of 12%; rares have a 70% chance of 15%. Intercepted healing restores 0.35% player maximum HP per second, with a finite 15% lifetime reserve per healing totem. Once depleted it still blocks the caster’s healing. An uninterrupted stream restores 0.4% caster maximum HP per second. Healing streams do not stack. The lifesteal ring remains at 0.5% of actual health removed.

## Persistent progression and migration

Dungeoneering XP is shared across Zones. Level 2 needs 1,600 total XP; level 3 needs 6,400. Levels unlock shop choices and grant no Mastery points. Only Zone-final overlords grant 2 Mastery, except the first victory over Zone 1 Floor 1’s overlord, which also grants 2 once and opens 2× Delve speed. Mastery never accelerates skilling; its own future speed perk remains separate. Ammunition still supplies ten seconds of firing per arrow or rune.

The first idle-slot tip explains that the next slot unlocks at Zone 2. Crafting the first upgraded weapon gives a refinement / Warding enchantment tip. Floor travel, equipment, 55 authored floors and 42 ordinary / 42 rare creature forms are preserved.

Old Zone wallets and the full historical price of every purchased rank are refunded at 25 seals per Sigil. Fractional credit is retained and a versioned receipt prevents a second refund. Original Zone ledgers are archived in the save. Earlier progression first passes through the existing XP / Mastery migration. Gold, materials, equipment, cached XP and Mastery are preserved. A legacy active blessing becomes one entry in the stacking collection.

Run npm test for the browser suites, including 72 new-pattern / environment combinations, mobile picker safety, reward isolation, exact migration, style-adaptive perks, base equipment ceilings and full Zone simulations. Run npm run report:balance to regenerate this document and balance-report.json.
