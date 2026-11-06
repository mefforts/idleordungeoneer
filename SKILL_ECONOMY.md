# Skill and refinement material budget

Build 11.17.0. Level 20 remains **32,166 XP**. The reference includes **all three combat styles**, rather than a single loadout.

Iron weapons have **3 refinements**, Steel **12**, and Mithril **10**, counted within each weapon tier. Other upgrade paths retain their existing caps. Weapon damage ceilings are **80 / 240 / 480 equipment DPS**. Mithril starts around **300 DPS** with completed Steel speed training. Tier-aware soft caps preserve these gains, with enemy health and rewards following the authored Zone tuning. Steel weapon materials grow by **1.48× per rank**; other Steel upgrade materials grow by **1.6×**. Gold grows more gently. Steel and Mithril weapon refinements use cut garnets and sapphires as abrasives, giving Artisan a material role in the long upgrade paths.

The reference targets Steel weapon **10/12**, speed/reach/armor **8/10**, enchantment **3/4**, jewelry **15/50**, tools **8/10**, and stations **4/5**, after completing Iron.

| Discipline | XP from reference work | Level | Active hours at 1× | Active at 3× | Idle at 3× |
| --- | ---: | ---: | ---: | ---: | ---: |
| blacksmithing | 32166 | 20 | 8.09 | 2.7 | 10.78 |
| woodworking | 32166 | 20 | 2.06 | 0.69 | 2.75 |
| warding | 32166 | 20 | 2.71 | 0.9 | 3.62 |
| scavenging | 32166 | 20 | 3.41 | 1.14 | 4.55 |
| artisan | 32166.01 | 20 | 2.77 | 0.92 | 3.69 |

Times are work-hours within that discipline, not total preparation time or a required play session. The table separately includes the Blacksmithing and Scavenging work that supplies Artisan inputs. Bonuses, conservation, combat loot and existing stock can shorten actual preparation. The reference credits 4,000 gold from delving; the rest is supplied by gold searches.

| Material | Reference target | Full completion |
| --- | ---: | ---: |
| bars | 816 | 875 |
| steelBars | 2894 | 6626 |
| silverBars | 277 | 1357 |
| logs | 1248 | 1941 |
| willowLogs | 2434 | 5610 |
| cloth | 1324 | 1954 |
| runicCloth | 3028 | 7001 |
| ancientFragments | 956 | 2084 |
| cutOpals | 38 | 94 |
| cutGarnets | 1260 | 2769 |
| gold | 16884 | 52788 |
| essence | 30 | 48 |
| zoneMaterials | 38 | 58 |

The final ranks require **3732 more Steel bars**: 56.32% of the full Steel-bar budget lies beyond the reference. This gives the final Steel upgrades a substantial resource tail for Zones 3–4.

Active and idle work grant the **same XP per completed batch**. Idle takes **four times the base active interval**. Permanent Skilling speed accelerates both, so the 25% idle rate remains; active tools and discoveries can widen the gap. Offline time still caps at eight real hours before its earned multiplier.

Tier 1 gives 10% XP after level 10 and 0.1% after level 20. Tier 2 gives 1% XP after level 20. Further outdated bands taper again. This lets remaining Steel goals yield resources without rapidly granting levels intended for Mithril work.

Mithril equipment and materials need **Zone 3 completion plus level 20 in the matching discipline**. Promotion recipes draw on other level-20 disciplines too. Armor remains independently crafted. Weapon promotion requires owning Steel and paying Mithril materials; maxing Steel is optional. Intensive skilling can open Mithril during Zone 4, with Zone 5 remaining its intended normal starting point.

Existing weapon ranks convert once by tier progress, rounded upward so earned weapon power is retained. Tier promotion starts its new weapon counter at zero; it retains the preceding tier’s power. Materials, skill XP, owned equipment and voucher balances are retained.

Run `npm run report:skills` to reproduce the budget from actual game recipes. `tests/refinement-economy.cjs` also performs the production, spending, idle, migration, gate and DPS checks. See [BALANCE_CONFIG.md](BALANCE_CONFIG.md) for tuning and expansion rules, and [PROGRESSION.md](PROGRESSION.md) for current combat measurements.
