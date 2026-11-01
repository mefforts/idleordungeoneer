# Zone progression and balance

Version 9 replaces combat power selections with persistent purchases in each exact Zone. Equipment works everywhere; Zone training is active only in its owner Zone. Dungeoneering XP and Mastery are shared across all Zones.

## Build budgets

| Path | Zone 1 / Iron | Zone 2 / Steel |
| --- | ---: | ---: |
| Equipment only | 80.0 DPS | 160.0 DPS |
| Shop only | 87.2 DPS | 174.4 DPS |
| Combined | 97.5 DPS | 197.8 DPS |

Gear-only uses maximum refinement and speed, with base proficiency. Shop-only uses an unrefined weapon and Heavy Strikes 7, Quick Hands 3 and Keen Edge 3. Combined uses both. This shop build costs 248 seals in Zone 1 and 291 in Zone 2. Equipment can remain a slower, optional alternative: its finite upgrades require materials, crafting levels and gold rather than seals.

Heavy Strikes and equipment supply alternative core damage. The stronger increase applies fully, plus 15% of the weaker increase. Zone attack speed, critical chance and extra projectiles then apply. Above the recommended 100 / 200 single-target DPS budget, only 25% of each additional calculated DPS applies. Actual hit damage is reduced by that same ratio; HUD and shop previews show the final amount. Conditional damage, cleaves and additional targets are excluded from this single-target figure.

Three initial offensive purchases (one rank each of Heavy Strikes, Quick Hands and Keen Edge) cost 23 seals in Zone 1. A starter sword rises from 16.7 to 33.5 DPS; adding the same purchases to full Iron gear has a much smaller effect. Heavy Strikes ranks 1–7 cost 3, 5, 8, 13, 21, 34 and 55 seals. Ranks 8–10 cost 120, 240 and 480. Later ranks grow by 2.1× per rank. Other branches also escalate, especially extra targets and projectiles. Higher DPS remains possible through repeat clears and costly ranks.

## Equipment ceilings

| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |
| --- | ---: | ---: | ---: | ---: |
| Arming Sword | 80.0 | 86.4 | 160.0 | 172.8 |
| Sword & Shield | 80.0 | 86.4 | 160.0 | 172.8 |
| Halberd | 80.0 | 86.4 | 160.0 | 172.8 |
| Greatsword | 80.0 | 86.4 | 160.0 | 172.8 |
| Hunting Bow | 80.0 | 86.4 | 160.0 | 172.8 |
| Focus Staff | 80.0 | 86.2 | 160.0 | 171.9 |

These are equipment-only figures, at 1× combat and 5% base critical chance, with the matching robe tier for magic. Dedicated training adds the capped 3% proficiency and 5% crafting bonuses; magic is slightly lower because robe damage shares its multiplier. Damage / cooldown × 1.05 agrees with the equipment number. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. One weapon and one independently chosen armor set are equipped at a time.

Clear Zone 1, reach refinement 10 and the matching crafting level 10, then pay a Steel promotion recipe to unlock refinement 11–20 for that style. Armor has two available sets per class. Proficiency and crafting training remain style-specific; elemental Zone upgrades work with every style. Recipes and material costs are unchanged in this pass.

## Pacing

| Zone | Target at 1× | Reference DPS | Refinement | Speed | Shop ranks: damage / speed / crit |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | ~10 min | 79.8 | 6 | 3 | 5 / 2 / 2 |
| 2 | ~20 min | 159.8 | 14 | 6 | 5 / 2 / 2 |
| 3 | ~30 min | 188.6 | 20 | 10 | 5 / 2 / 2 |
| 4 | ~35 min | 188.6 | 20 | 10 | 5 / 2 / 2 |

References use a sword and base proficiency. Forecasts budget enemy health against sustained single-target attacking and spawn timing. Movement, incoming damage, menus, preparation and missed attacks change the result. Cleave, elemental effects, spawn pressure and Delve speed can shorten a run. Future equipment progression remains unauthored; later Zones use the existing Steel reference and approach a 30–40-minute target.

- Live Zone 1 simulation: **10.8 min**, 369 defeats, 79.8 reference DPS.
- Live Zone 2 simulation: **21.9 min**, 549 defeats, 159.8 reference DPS.
- Live Zone 3 simulation: **30.8 min**, 729 defeats, 188.6 reference DPS.
- Live Zone 4 simulation: **35.7 min**, 909 defeats, 188.6 reference DPS.
- Live Zone 9 simulation: **40.8 min**, 909 defeats, 188.6 reference DPS.
- Live Zone 15 simulation: **41.2 min**, 909 defeats, 188.6 reference DPS.

The live tests run actual spawn, hit, critical, movement, boss and transition code at 40 ms steps; incoming damage and XP progression are suppressed only in the isolated fixture. Timing includes that step size’s attack-cadence rounding.

## Seals and gold

| Zone | Currency | Expected seals / clear | Guardian gold | Floor caches | Baseline gold / clear |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | Verdant Seals | 264 | 126 | 65 | 191 |
| 2 | Ember Seals | 336 | 189 | 104 | 293 |

Ordinary monsters have a 40% chance to award one seal and drop no gold. Elites guarantee three seals and 2 / 2.8 gold in Zones 1 / 2. The three guardians per floor guarantee 8 / 12 / 20 seals. Elite substitutions and jewelry bonuses are excluded from the table. Guardian’s Bounty adds 4% elite/guardian gold per rank. Whole gold is paid using a saved fractional remainder. Scavenging income, existing gold balances and crafting costs stay intact.

Each exact Zone keeps its own wallet and purchased ranks, including later Zones that repeat a biome. Defeat, travel, replay and reload never reset them. Locked Zone shops can be previewed but cannot be purchased from.

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

The level is 1 + floor(sqrt(total XP / 1600)). It never resets on a new Zone. Each gained level grants one Mastery point, while guardians grant 1 / 1 / 2 points. Leveling never pauses combat or queues a power card. Uncollected XP positions and values remain saved per Zone; encounter completion banks them exactly once.

Mastery is one shared, refundable bank. Onslaught unlocks spawn settings up to 60×. Fortune adds 10% relative seal-drop chance per rank: 40% → 56% at rank 4. Discovery adds 25% relative rare-material chance per rank: 1.5% → 2.625% at rank 3, before jewelry. Mastery grants no attack damage or protection. The first guardian unlocks 2× Delve speed. Combat speed never changes gathering, crafting, active bonuses or idle production.

## Zone 2 resource chain

| Discipline | Gathering / refining | Uses |
| --- | --- | --- |
| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Weapons, armor, promotions, upgrades |
| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, ammunition, Runic Cloth |
| Scavenging | Ancient Salvage; 2 salvage → 2 fragments | Refinement, robes, runes |
| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Mage/Ranger armor and ammunition |
| Artisan | Rough Garnet → Cut Garnet | Promotions, robes, enchantments |

All ten advanced activities require clearing Zone 1, including idle/offline work. Armor, promotion and crafting recipes retain their material gates. Source links and recipe bookmarks connect gathering back to equipment.

## Migration and verification

Existing earned power ranks transfer into the saved exact Zone. Pending selections convert to three seals each. Earned legacy XP becomes global XP; ground XP stays separate until collected. Legacy biome Mastery balances and spent allocations are pooled, the highest rank in each branch is retained and duplicated allocations are refunded. The original Zone/Mastery data is archived in the save. Migration runs once, preserving equipment, materials, gold and XP caches.

The eleven browser suites cover actual damage across six weapons, both tiers, shop costs/caps, exact-Zone isolation, migration/reload, no automatic upgrade modals, Mastery configuration, rewards, all 20 activities, touch controls, direct Idle navigation, boss mechanics and 108 unique painted collection icons. Run npm run report:balance to regenerate this file and balance-report.json. The JSON includes every shop price/effect, resource chain, armor recipe and live weapon ceiling.
