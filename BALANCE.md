# Zone progression and balance

Build 9.6 gives each Zone four themed abilities. Core weapon statistics come from equipment, proficiency and existing jewelry. Each exact Zone retains its own seals and ranks; global Dungeoneering and Mastery remain separate.

## Equipment ceilings

| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |
| --- | ---: | ---: | ---: | ---: |
| Arming Sword | 80.0 | 86.4 | 160.0 | 172.8 |
| Sword & Shield | 80.0 | 86.4 | 160.0 | 172.8 |
| Halberd | 80.0 | 86.4 | 160.0 | 172.8 |
| Greatsword | 80.0 | 86.4 | 160.0 | 172.8 |
| Hunting Bow | 80.0 | 86.4 | 160.0 | 172.8 |
| Focus Staff | 80.0 | 86.2 | 160.0 | 171.9 |

Figures use maximum refinement and speed, 5% base critical chance and matching robes for Magic. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. One weapon and one independent armor set are equipped at a time.

Above 100 DPS in Zone 1 or 200 DPS in later Zones, each additional calculated point of single-target DPS contributes 0.25 actual DPS. Actual attack damage uses the same adjustment. Cleaves, elemental chains, damage over time and conditional bonuses are separate. Mirrorcast contributes 15% damage per additional projectile, and its direct projectile damage is included in the displayed figure.

Clear Zone 1, reach refinement 10 and matching crafting level 10, then pay a Steel promotion recipe to unlock refinement 11–20. Recipes, jewelry and material costs remain unchanged.

## Zone abilities

| Zone | Abilities |
| --- | --- |
| The Overgrowth | Briar Venom (8) · Grasping Roots (5) · Bramble Sweep (3) · Barkskin (5) |
| The Embervault | Cinderbrand (8) · Slagburst (5) · Searing Shot (3) · Basalt Guard (5) |
| The Hollow Crypt | Soul Chain (5) · Grave Chill (5) · Soulburst (5) · Bone Ward (5) |
| The Astral Rift | Arc Rift (5) · Mirrorcast (3) · Phase Sweep (3) · Astral Ward (5) |

Each number is the maximum rank. Effects use existing combat mechanics: venom/burn on hit, slowing, melee cleaves, projectile piercing, extra projectiles, chains, critical splashes and damage reduction. Themed artwork, names, DoT colors and effect colors match the area. Each ability has its own illustrated Codex entry.

First ranks cost 8–24 seals before Zone scaling. Ordinary ranks grow by 1.65× through rank five, then 2.35×; cleave, piercing and additional projectiles cost 6× more each rank. The exact prices and effects are included for all sixteen abilities in balance-report.json. The shop contains no ordinary weapon damage, attack speed, health, critical chance, gold, XP, movement, pickup or regeneration purchases. Existing jewelry remains the source of its established stat bonuses.

## Seals and gold

| Zone | Currency | Expected seals / first clear |
| --- | --- | ---: |
| 1 | Verdant Seals | 526.44 |
| 2 | Ember Seals | 1057.00 |
| 3 | Soul Seals | 2095.75 |
| 4 | Rift Seals | 2116.97 |

Ordinary monsters have a 4% chance of one seal. Elites guarantee 6 seals; guardians guarantee 12 / 20 / 35. Guardian echoes substitute ordinary enemies, up to one / two / three per wave in the early / middle / deep floors. First-clear counts depend on the authored Zone depth. The table includes first-clear guardian echoes and expected rare elites at baseline Fortune. Rare elites have a 1.5% chance after the first three wave spawns, capped at one per wave. More than 95% of expected first-clear seals come from elites and guardians. Fortune rank 4 changes ordinary-monster chance to 5.6%, while guardian and elite chunks remain fixed.

| Zone | Guardian gold | Floor caches | Baseline gold without elites |
| --- | ---: | ---: | ---: |
| 1 | 126 | 65 | 191 |
| 2 | 189 | 104 | 293 |

Ordinary monsters drop no gold. Elites give 2 / 2.8 gold in Zones 1 / 2. Existing gold jewelry modifies combat income; whole gold is paid using a saved fractional remainder. Scavenging and skilling remain additional sources. Retired shop gold/XP ranks no longer apply.

## Pacing

| Zone | Target at 1× | Reference DPS | Refinement | Speed |
| --- | --- | ---: | ---: | ---: |
| 1 | ~10 min | 80.0 | 10 | 5 |
| 2 | ~20 min | 160.0 | 20 | 10 |
| 3 | ~30 min | 160.0 | 20 | 10 |
| 4 | ~35 min | 160.0 | 20 | 10 |

References now use completed Iron / Steel equipment at base proficiency, with no required Zone abilities. Health forecasts retain the 10 / 20 / 30-minute targets and the later 35–40-minute plateau. Movement, deaths, preparation and menus extend play time; abilities and successful counters can shorten it. Future equipment tiers remain unauthored.

- Live Zone 1 simulation: **9.7 min**, 375 defeats, 80.0 reference DPS.
- Live Zone 2 simulation: **20.4 min**, 570 defeats, 160.0 reference DPS.
- Live Zone 3 simulation: **32.2 min**, 780 defeats, 160.0 reference DPS.
- Live Zone 4 simulation: **36.3 min**, 960 defeats, 160.0 reference DPS.
- Live Zone 9 simulation: **42.0 min**, 960 defeats, 160.0 reference DPS.
- Live Zone 15 simulation: **41.4 min**, 960 defeats, 160.0 reference DPS.

Live tests use actual spawning, damage, approach, guardian mechanics and transitions at 40 ms steps. Only incoming damage and XP progression are suppressed in the isolated fixture. They approach healing totems to divert permanent healing, and do not deliberately seek reflect marks. Attack-cadence rounding contributes to the difference from the forecast.

## Guardian counterplay

Floor overlords use four patterns and final Zone overlords six. Known elite substitutions are capped at one / two / three per wave on early / middle / deep floors. Reflect warnings last 1.9 seconds, with centers within 300 units of the player. Reflecting returns 12% maximum caster HP and staggers for 1.6 seconds. A healing stream restores 0.8% guardian HP per second until its caster is defeated, or 2% player HP when the player is nearer to the totem than its caster. Power streams add 12% guardian attack damage, or 10% conditional player hit damage for five seconds when the player is nearer to the totem than its caster. Stream bonuses do not stack. Totems are untargetable and have no expiry or health bar. They remain until the caster is defeated; the player draws their benefit whenever closer to the totem than its caster, without needing to stand in its path. One of each type per caster and at most two total remain active. They grant no loot/XP and never count as wave defeats.

## Authored Zone depths

| Zone | Floors | Ordinary / elite families |
| --- | ---: | ---: |
| 1 | 5 | 8 / 8 |
| 2 | 10 | 10 / 10 |
| 3 | 20 | 12 / 12 |
| 4 | 20 | 12 / 12 |

There are 55 named floors. Terrain changes across early, middle and deep bands, with a different deterministic scenery layout on every floor. New creature families enter the mix gradually. Combat health and spawn budgets are calibrated per Zone; gold and guardian XP remain spread across the Zone rather than multiplying with floor count. Three-floor saves retain their previously reached Zones and migrate once.

## Rare elites and timed blessings

Each of the 42 ordinary creature appearances has a painted rare elite form with 3.5× health. Roles add 1.1-second locked charges and sweeps, fixed ricochet paths with visible banks and a six-second lifetime, and eight-second shields reducing an allied elite’s weapon damage taken by 35%. Shielders cannot be shielded; pending casts reserve their targets to prevent chains. A rare elite can appear alongside guardian echoes. Its optional spoils offer Battle Fervor (+18% hit damage, 45s), Windstep (+15% attack speed and +12% movement, 40s), or Stoneguard (20% less damage and 0.3% max HP/s, 60s). One blessing can be active; choosing another replaces it. Combat time, including Delve speed, advances duration; menus, pause and skilling do not. Leaving its exact Zone ends a blessing. Unclaimed spoils persist.

Enemy sweeps, charges, beams and ground eruptions deal 35% of maximum HP to ordinary monsters once per cast, including overlapping marks. Elites, guardians and totems are immune. These hits grant normal kill rewards without player lifesteal, critical hits, enchantments or weapon effects. The Opal Leech Ring now returns 0.5% of actual direct-hit health removed; overkill grants no extra healing.

## Global Dungeoneering and Mastery

| Dungeoneering level | Total XP |
| --- | ---: |
| 1 | 0 |
| 2 | 1600 |
| 3 | 6400 |
| 4 | 14400 |
| 5 | 25600 |
| 6 | 40000 |
| 7 | 57600 |
| 8 | 78400 |

Level is 1 + floor(sqrt(total XP / 1600)). XP persists across Zones; levels grant no Mastery points. Zone final bosses grant 2 points. The Zone 1, Floor 1 final boss also grants 2 once, unlocking early speed access. Ground XP positions and values persist until collected or banked after an encounter. No combat power cards or automatic shopping modals appear.

Mastery is shared and refundable. Onslaught controls spawn settings up to 60×, Fortune raises ordinary seal-drop chance by 10% relative per rank, and Discovery raises rare-material chance by 25% relative per rank. Mastery gives no damage/protection. The first Zone 1, Floor 1 final victory unlocks 2× Delve speed, which never speeds up skilling. Offline earnings and collection windows keep real-time timing.

Each arrow or rune supplies 10 seconds of firing time. Only the wielded ranged weapon with an in-range target drains its charge; waiting, pause, skilling, other weapons and reload retain it. Ordinary health drops: 5% chance, heal 5% maximum HP. Elite echoes guarantee a 25% heal. Motes remain through waves on a floor and wait at full health.

## Zone 2 resource chain

| Discipline | Gathering / refining | Uses |
| --- | --- | --- |
| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Equipment, promotions and upgrades |
| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, ammunition and Runic Cloth |
| Scavenging | Ancient Salvage; 2 salvage → 2 fragments | Refinement, robes and runes |
| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Armor and ammunition |
| Artisan | Rough Garnet → Cut Garnet | Promotions, robes and enchantments |

Clearing Zone 1 unlocks the second idle slot and a replay-travel tip. All ten advanced activities require clearing Zone 1, including idle and offline work. Source links, tracked recipes and Inventory material links connect gathering back to equipment.

## Migration and verification

Retired statistics, abilities absent from a Zone and ranks above its revised maximum refund their original purchase prices to that exact Zone. Retained abilities keep their ranks. A versioned receipt prevents repeated credits. Older power-card saves first pass through the existing global-XP/Mastery migration, then receive any applicable refunds. Equipment, materials, gold, ground XP and Mastery are preserved.

Twenty-two browser suites cover migration and exact refunds, real damage/cadence for all six weapons, both equipment tiers, every skill, first-weapon guidance, real touch gestures, full-card equipment selection, the four-ability shops, all 111 distinct painted Codex entries, boss mechanics and live Zone pacing. Startup checks pause the HTML download to verify first paint, then cover asset readiness, reduced motion and retry. Run npm run report:balance to regenerate this file and balance-report.json.
