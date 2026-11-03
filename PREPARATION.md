# Preparation comparison — Build 11

Lower gold costs reduce repeated work while preserving material recipes. They do **not** establish a 25-minute opening for every weapon. In these controller samples, staff and bow still spend over 25 active minutes preparing for Zone 1, with retries contributing to the extra upgrades. The Steel handoff improves, and choosing 2× Skilling reduces it further.

These are historical Build 11 simulations. Build 11.3 adds occasional one-item Zone-material upgrade costs and collects monster rewards from the ground; these timing samples have not been rerun under those changes.

## Method

Compared published v10.1 (`6f760ec`) with Build 11 in isolated Chromium phone sessions at 390 × 844. Each trial starts with the normal 45 gold, starter sword and empty resource inventory, crafts the chosen weapon, clears all five Zone 1 floors, then prepares Steel. There are **48 completed trials**, using seeds 1012026 and 1012027 across staff, bow and halberd. The 12 Skilling-speed variants repeat their corresponding Zone 1 paths; there are 36 distinct Zone 1 scenarios. Every recipe, enemy, damage event, ammunition use and reward uses the game rules. No invulnerability, free materials, forced kills or testing speed is used.

The controller advances 40 ms steps, makes movement decisions every 200 ms, and promptly collects active work bonuses. A virtual clock keeps normal idle work synchronized. Repeated interface refreshes are skipped inside bulk simulation steps; encounter choices and source navigation still use the real interface. Rendering occurs at checkpoints. This is a preparation/combat simulation, not human play or an iOS touch-comfort test. Menus, loading and reading are excluded.

Times are **simulated elapsed minutes**: active work and combat/retries are recorded separately. Baseline comparisons use 1× combat and 1× skilling throughout, even after the old free combat-speed unlock. The separate 2× column spends the first Zone 2 point on Skilling and applies it only from that arrival onward. Work changes the random sequence, so seeds do not create identical paired drops or encounters. Two seeds show sensitivity, not a statistical balance claim.

## Routes

- **Steady:** craft matching Iron armor, carry 24 ammunition initially and refill to 48; add one refinement after a death and gradual armor reinforcement. Between early floor clears, aim for refinements 2/4/6/8 and speed 1/2/3/4. At Zone 2, finish refinement 10, train the matching skill to 10, promote, craft matching Steel armor, then prepare refinement 12 / speed 6. No tools/stations are purchased.
- **Leaner:** start combat at refinement 2, buy a pickaxe and mattock (also a hatchet for bow), and one station rank in Blacksmithing, Scavenging and the matching discipline. Their investment time is included. Between floors, keep current refinement or aim for 2 early / 4 later, adding one if the prior clear exceeded three minutes or ended below 35% health; aim for speed 1 early / 2 later. Death recovery remains the same. Gather needed Steel ingredients before extra skill training. Its handoff ends at promotion / refinement 10, retaining Iron armor and existing speed: optional Steel armor and ranks 11–12 are excluded.
- An additional **rank-0 lean sensitivity pass** used the same tool/station policy without the two initial refinements. Its six baseline, six Build 11 and six Build 11 + Skilling trials are included in the total count; their limits are discussed below.

## Zone 1, including retries

Ranges are the two sampled seeds. Active preparation includes first crafting, tooling, ammunition and recovery upgrades. Combat is measured separately.

| Weapon | Route | Active work v10.1 | Active work v11 | Combat v10.1 | Combat v11 | Deaths v11 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Staff | Steady | 45.3–48.9 | 30.2–39.7 | 21.6–25.6 | 25.9–28.8 | 6–9 |
| Staff | Leaner | 42.0–61.9 | 31.2–36.6 | 20.7–24.7 | 20.2–21.9 | 5–6 |
| Bow | Steady | 42.3–43.5 | 31.5–47.7 | 25.5–29.8 | 26.4–30.4 | 7–10 |
| Bow | Leaner | 49.5–53.9 | 32.4–50.5 | 19.8–22.1 | 20.8–22.0 | 5–9 |
| Halberd | Steady | 36.4–36.6 | 24.3–25.7 | 17.8–22.3 | 18.5–19.5 | 1–2 |
| Halberd | Leaner | 16.1–22.3 | 15.3 | 13.8–13.9 | 13.9–16.3 | 0–1 |

## Zone 2 arrival to Steel readiness

The endpoints differ by route. Compare prices within a row; the lean promotion-only route does not promise the steady route’s armor, refinement or attack speed.

| Weapon | Endpoint | v10.1 at 1× | v11 at 1× | v11 with first point in Skilling |
| --- | --- | ---: | ---: | ---: |
| Staff | Steel 12 / speed 6 + armor | 32.6–34.3 | 19.2–23.7 | Not sampled |
| Staff | Promotion only | 2.1–15.5 | 4.6–8.8 | 2.6–4.9 |
| Bow | Steel 12 / speed 6 + armor | 35.6–37.1 | 12.3–22.9 | Not sampled |
| Bow | Promotion only | 7.5–8.4 | 1.8–8.4 | 0.9–4.7 |
| Halberd | Steel 12 / speed 6 + armor | 28.9–29.5 | 21.2–21.8 | Not sampled |
| Halberd | Promotion only | 23.8–30.4 | 16.7–18.7 | 9.3–10.3 |

## Gold, idle work and upgrade value

No trial waits passively or uses offline catch-up: **passive waiting is zero**. The first idle slot runs Scavenging during other work and combat. The second slot at Zone 2 runs the weapon’s matching gathering task. Idle production overlaps those times and is not added again as waiting. These source counts include the entire leaner route through promotion at 1×. Scavenging supplies one gold per ordinary search and three per ancient search; tooling/station changes conserve ingredients or speed work, not gold yield. Guardians, elites, floor caches and Golden Hunt remain additional gold sources.

| Weapon | Active scavenging minutes v10.1 → v11 | Active search gold v10.1 → v11 | Idle search gold v10.1 → v11 |
| --- | ---: | ---: | ---: |
| Staff | 26.4–32.9 → 11.9–13.0 | 631–664 → 253–260 | 80–109 → 60–69 |
| Bow | 24.5–27.4 → 12.7–23.0 | 491–524 → 247–443 | 112–133 → 27–81 |
| Halberd | 22.1–22.5 → 8.0–10.2 | 779–880 → 239–346 | 99–100 → 75–76 |

Weapon power curves and enemy statistics are retained. Preparation grants normal refinement/speed ranks; successful equipment work now also trains the matching crafting discipline. The leaner route’s displayed DPS illustrates the gain without requiring the full Steel setup:

| Weapon | First attempt at refinement 2 | After promotion, existing armor/speed |
| --- | ---: | ---: |
| Staff | 24.4 | 75.8 |
| Bow | 24.7 | 75.8 |
| Halberd | 25.3 | 76.3 |

## Decision and remaining limits

Build 11 retains the gentler gold prototype: the complete Iron refinement/speed curve falls from **1,485 to 785 gold**, Steel from **3,050 to 1,885**, and promotion from **150 to 100**. All material recipes, rank limits, armor prices and tier gates remain. Finite equipment work contributes matching skill XP, reducing surplus training without removing the level-10 gate. Older saves receive one price-difference credit for owned refinement/speed ranks and promotions; current equipment/materials remain owned, and past skill XP is not estimated. See [BALANCE.md](BALANCE.md) for exact prices, XP and migration.

The proposed **≤25-minute Zone 1 preparation target is not met consistently for staff or bow** in these runs. Halberd improves substantially; staff/bow results remain sensitive to deaths and the resulting reinforcement/material spending. In the rank-0 lean sensitivity pass, Build 11 active Zone 1 preparation was staff 32.8–38.6, bow 37.8–38.2, halberd 15.5–15.7 minutes. Starting with two refinements is not a guaranteed remedy, so the interface offers preparation rather than prescribing a mandatory loadout.

The **≤20-minute Steel handoff target is met by the sampled promotion-only routes**. The optional full Steel setup can take longer. This is why the tracker distinguishes promotion, skill training, remaining Iron refinements and optional armor. Spending the first point on Skilling materially shortens that preparation, while choosing Delving instead speeds encounters.

No flat weapon buff, reduced enemy damage or first-floor checkpoint is justified by these controller samples alone. Staff/bow’s opening retries still warrant the separately proposed low-refinement hit-rate / incoming-damage study and a human mobile pass. Tools/stations are included in the lean route; these comparisons do not isolate the payback of each item. Vouchers are earned normally but not redeemed by the controller, so the preparation estimates do not assume a rare voucher. Actual players can redeem one for an eligible refinement.

The validation covers the scoped early preparation and Steel handoff, not another full Zone 2 difficulty comparison. Previous complete staff/bow/halberd runs established the longer-route experience; these new samples measure the approved preparation changes. Automated regressions separately cover all authored floors, combat pacing, migration, actual loot, independent buff timers, sustained holds, touch cancellation and editable fields.
