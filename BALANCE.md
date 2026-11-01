# Zone 1–2 progression and DPS

Only two equipment tiers are currently available: Iron / starter equipment and Steel / advanced equipment. Six independently equipped armor sets cover Warrior, Ranger and Mage. Black, Mithril and later tiers are reserved for a future pass.

## Permanent tier limits

| Tier | Intended DPS ceiling | Refinement | Speed | Reach | Reinforcement | Enchantment |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Iron | 100 | 10 | 5 | 5 | 5 | 2 |
| Steel | 200 | 20 | 10 | 10 | 10 | 4 |

Iron refinement stops at 10. Clear all three floors of Zone 1, train the matching crafting discipline to level 10, and pay for a **Steel promotion** to open refinement 11–20 for that combat style. Promotion retains rank 10, and each style promotes independently. Capped upgrades refuse the purchase without spending ingredients.

Speed adds 2% per rank; reach adds 3%. Reinforcement adds 8 health per rank, limited by the worn set’s tier. Warrior armor provides 4% / 7% damage reduction, Ranger armor 4% / 6% movement, and Mage robes 4% / 8% magic damage.

Combat proficiency gradually adds up to **3%** damage at level 50. Matching crafting-skill levels 11–60 add up to **5%** more. Dedicated permanent training therefore tops out near **108 / 216 DPS**. Magic’s total is slightly lower because the robe bonus shares its damage multiplier. Temporary zone powers can exceed those figures during a run.

## Actual weapon ceilings

Permanent single-target DPS uses 1× combat, base 5% critical chance, capped refinement / speed and matching robes for magic. Temporary powers, splash, cleave, enchantment arcs and conditional berserk are excluded. These numbers agree with actual hit damage divided by attack cooldown, multiplied by 1.05.

| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |
| --- | ---: | ---: | ---: | ---: |
| Arming Sword | 100.0 | 108.0 | 200.0 | 216.0 |
| Sword & Shield | 100.0 | 108.0 | 200.0 | 216.0 |
| Halberd | 100.0 | 108.0 | 200.0 | 216.0 |
| Greatsword | 100.0 | 108.0 | 200.0 | 216.0 |
| Hunting Bow | 100.0 | 108.0 | 200.0 | 216.0 |
| Focus Staff | 100.0 | 107.7 | 200.0 | 214.8 |

Refinement interpolates each weapon’s starter output to the same tier budget. Cooldown, hit damage, reach and utility stay distinct. The Iron weapon-only budget at rank 10 is 100 / 1.10 DPS; Steel at rank 20 is 200 / 1.20. Speed supplies the remaining factor. Magic hit scaling allows for its matching robe bonus. Readiness uses your actual build rather than assuming all these upgrades.

## Zone references

| Zone | Full-zone target at 1× | Intended permanent DPS | Reference refinement | Speed | Tier |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | ~10 min | 80.6 | 8 | 3 | Iron |
| 2 | ~20 min | 160.9 | 16 | 9 | Steel |

References sit below the full tier ceilings, at about **80 DPS for Zone 1** and **160 DPS for Zone 2**, with a sword, base proficiency and no temporary powers. Continuous single-target combat determines the health budget. Movement, missed shots, deaths, menus and preparation add time; cleaves, splash and wave powers can shorten it. Delve speed affects combat only.

- Latest full-zone simulation: Zone 1 cleared in **10.6 minutes**, with 369 defeats.
- Latest full-zone simulation: Zone 2 cleared in **20.9 minutes**, with 549 defeats.

Later zones remain playable against the current Steel reference and retain their previous 30–40-minute pacing targets. Further equipment and zone-specific progression are not authored in this pass.

## Zone 2 resource chain

All ten second-tier activities require clearing Zone 1 / entering Zone 2. The requirement applies to active gathering, refining, idle assignment, offline production, armor crafting and style promotion.

| Discipline | New gathering / refining | Uses |
| --- | --- | --- |
| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Steel weapons, armor and upgrades |
| Woodworking | Willow Logs; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, promotion, ammo and Runic Cloth |
| Scavenging | Ancient Salvage; 2 salvage → 2 Ancient Fragments | Refinement, robes and greater runes |
| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Mage / Ranger armor, promotion and ammo |
| Artisan | Rough Garnet → Cut Garnet | Promotion in every style, Mage robes and enchantments |

Each activity supports active bonuses and a direct Idle button. Newly illustrated environments cover coal, willow, ancient salvage and garnets. Material-source links and tracked armor / promotion recipes connect gathering back to equipment. Existing opal jewelry remains available.

## Steel promotion costs

| Style | Base recipe |
| --- | --- |
| melee | 12 Steel Bars + 6 Willow Logs + 4 Ancient Fragments + 1 Cut Garnets + 150 gold |
| ranged | 6 Steel Bars + 18 Willow Logs + 6 Runic Cloth + 1 Cut Garnets + 150 gold |
| magic | 4 Steel Bars + 18 Runic Cloth + 6 Ancient Fragments + 2 Cut Garnets + 150 gold |

Armor tiers require crafting levels 1 / 10. Steel-tier sets also require Zone 2 and their new ingredients. Station conservation can reduce whole-ingredient costs; fractional savings carry to a later craft. The JSON report contains every armor recipe and activity timing.

## Saves and verification

Older excess ranks and unavailable outfits are retained in legacyProgressionArchive / archivedArmor. Playable ranks follow the new tier limits; future outfits map to the available corresponding class set. Promotions, selected outfits and resource ownership survive reload.

tests/tiers.cjs checks the real Zone 1 clear, new recipe costs, all six ceilings against live hit damage / cooldowns, bounded training, promotion, thirty rig poses, all ten activities, 320px layouts, distinct loaded Codex art, saves and migration. tests/arena.cjs runs full zones through the actual spawn / attack / boss / transition code; incoming damage and XP changes are suppressed only in its isolated response fixture.

Run npm run report:balance to regenerate this file and balance-report.json from the embedded game.
