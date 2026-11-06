# Balance and content extension

The tuned reference is **Zones 1–5**. Zone 6+ remains experimental continuation; it is not an authored or balanced promise of later content. The current game still has one dungeon, The First Descent. This update adds configuration and tests for extending it, rather than pretending further dungeons already exist.

`src/balance-config.json` is the shared numeric configuration. `src/balance.js` selects dungeon and Zone rules. The build validates the configuration, embeds it into the standalone game, derives startup-safe resource catalogs from the activity data and derives each idle interval from the active activity interval and the configured idle ratio. Runtime modules use aliases to that configuration instead of keeping a second editable copy.

| What to tune | Owner |
| --- | --- |
| Authored Zones: stable ID, theme, floor count, reference gear, regional health, gold/Sigil multipliers | `balance-config.json` → `dungeons[].zones[]` |
| Experimental continuation: floors, health/reward growth, reference tier | `dungeons[].continuation` |
| Dungeon identity, start Zone, local perk unlocks and perk price/rank overrides | `dungeons[]` |
| Combat perk definitions and rank-price growth | `rewards.perks`, `rewards.perkCostGrowth`; behavior in `zone-abilities.js` / `dungeoneering.js` |
| Weapon tier floors/ceilings, rank limits, skill/Zone gates and soft budgets | `equipment.tiers` |
| Armor recipes/bonuses, reinforcement health/mitigation and Vigor mitigation | `equipment.armorStyles`, `equipment.reinforcement` |
| Promotion recipes, tier resource roles, speed/reach increments and enchantment | `equipment.promotionCosts`, `equipment.resources`, other `equipment` fields |
| Exponential refinement growth and style material weights | `refinement` |
| XP thresholds, outdated-tier taper, discipline rates and reference budget | `skills` |
| Active/idle ratio, offline cap, station/tool rules and gold search yields | `production` |
| Enemy-class HP, percentage damage, shared protection and common attack area | `combat` |
| Spawn/health calibration and spawn cadence | `encounters`; `zones[].calibrationMinutes` |
| Base gold, Sigils, rare resource drops and first-clear vouchers | `rewards` |
| Activity recipes, output, active intervals, discipline membership, resource labels and biome catalog | `src/game-data.json` |
| Each mechanic's timings, movement, counter rules and rendering | Its owning `src/` module; see `DEVELOPMENT.md` |
| Equipment, creature, effect and background assets | Existing `src/*-art.*`, `assets/` and renderer catalogs |
| Reproducible combat profiles | `tests/progression-profiles.json` |

`calibrationDps` is deliberately separate from a tier's current equipment `power`. It establishes the underlying enemy-health calibration; regional multipliers are then applied. Raising equipment power does not silently raise every enemy's health to cancel the upgrade. Calibration minutes are an input to that model, not a claim about actual clear times. Read the measured output in `PROGRESSION.md`.

## Current balance choices

- Iron remains the Zone 1 tier. Steel spans Zones 2–4. Mithril requires Zone 3 completion and matching skill 20; it is practical around Zones 4–5, without requiring full Steel refinement.
- Zone 3 retains 4× ordinary HP. Regional special multipliers are 4× / 4.5× / 5× in Zones 3 / 4 / 5, on top of enemy-class health. The earlier 6× special multiplier made the stretch before Mithril excessively long. Early Zone health is retained.
- Zone 3 / 4 / 5 multiply base gold by 3 / 4 / 5 and Sigil bundles by 3 / 4 / 5. Drop chance remains separate from bundle value; raw materials stay rare.
- Cold Verdict unlocks on reaching Zone 2; Returning Power at 3; Gravitation at 4; Mirrorcraft at 5. Old entitlements remain honored.
- Every reinforcement adds 8 HP and 0.75 percentage points of mitigation, including ranged and mage armor. Vigor adds mitigation equal to 0.1 percentage point per jewelry HP. Total damage reduction caps at 80% so later scaling cannot produce immunity or healing. Percentage attacks retain their threatening pre-reduction values.
- The level-20 reference retains all three combat styles at approximately 80% Iron/Steel completion, with jewelry at rank 15, tools at 8/10 and stations at 4/5. It credits 4,000 gold from delving. Rank-40 jewelry is an optional later investment.
- Tier-2/3 gold searches yield 6 / 10 base gold. Ranged wood requirements use 2.5× material weight; magic cloth uses 2×. All discipline rates were recalibrated against actual paid production, without removing earned XP or gear.
- Time points can be reassigned in the Dungeon Shop. The requested speed ladders and the first two point milestones are retained. Idle stays at 25% of base active speed and caps at eight real hours offline before earned speed.
- Vouchers choose a named eligible upgrade on owned gear, tools or stations. They follow actual equipment tiers, including early Mithril, and never fall back to an unusable weapon voucher when every eligible path is complete.

## Add a Zone

Append a Zone record to its dungeon with a new stable `id`. Give it a theme present in the biome/art catalogs, a floor count, calibration minutes, a reference tier, all five health categories and reward multipliers. Optional `floorNames` belongs to that record. Add a benchmark in `tests/progression-profiles.json` describing the gear and purchased perks expected there. Increase the authored reference scope only when the content has been tested.

Keep existing IDs stable. Saved layout snapshots retain counts and authored IDs: changing earlier floor counts maps a player back to their Zone/stage, preserves completed Zone boundaries and avoids repeating the migration on reload. Reordering/removing content, changing its identity, or altering the XP formula still deserves an explicit migration review; arithmetic remapping is not a substitute for deciding how removed content should behave.

## Add a dungeon

Append a definition with a unique `id`, a sorted zero-based `firstZone` and its own Zone records and continuation defaults. Authored ranges must not overlap. `perkUnlockZones` is local to that dungeon. Optional `perkOverrides`, for example `{"fire":{"base":9,"max":3}}`, and `perkCostGrowth` tune its shop without rewriting perk behavior. Legacy unlock entitlements stay with the original dungeon.

Dungeon Sigil wallets and purchased perk ranks are keyed by dungeon ID. An absent content definition archives its wallet; restoring the same ID restores the balance. Gear, skill XP and Mastery time remain account-wide. Their milestones and tier gates are explicit configuration, so decide whether a new dungeon should introduce new tiers or new account-wide milestones.

A regression test injects a second dungeon with different floor counts, prices and unlocks, buys a perk from its separate wallet, removes/restores its definition, and checks that currency is preserved. That fixture is never part of the public game.

## Add equipment or mechanics

Tier limits, power interpolation, promotion lookup and material roles no longer assume that tier 3 is the final numeric tier. A new tier also needs matching armor recipes, resource activities/labels, promotion ingredients, voucher naming and equipment assets. Update the relevant catalogs together; validation rejects incomplete tier recipes and armor arrays. Do not add a numeric tier and leave its appearance or resource sources undefined.

The [mechanics bible](MECHANICS_BIBLE.md) governs combat communication, counterplay, overlap and future dash choices. `combat.mechanics` owns palette colors, family warning floors, recovery clocks, pressure limits, tactical damage/stagger and Ember Catch. `src/mechanic-contracts.js` enforces the shared rules. Mechanics remain small modules with their own geometry and effect assets. Add variants to the owning mechanic/theme library; add a new module when behavior is different. Register it once in `scripts/sync-systems.cjs`, keep one source definition per function and write a counterplay/expiry/owner-death test. Follow the existing red/purple/teal/yellow visual language. A content table is appropriate for timings and selection; new behavior still needs code and assets.

## Verify a tuning change

Run `npm run check:balance`, `npm run build`, the affected suites, `npm run report:skills`, `npm run report:progression` and `npm run report:balance`. The full `npm test` suite includes configuration, second-dungeon, save mapping, real crafting, damage and shop interaction checks. Preserve the build hash with pacing measurements and distinguish invulnerable pacing from survival playtests. Two idle slots may work concurrently, so work-hours are not automatically elapsed hours.

Change related knobs together. Cheaper preparation changes the material-to-XP calibration; higher enemy HP needs a reward and floor-duration review; a higher equipment ceiling should not accidentally increase its own enemy-health calibration. Price reductions, lower rank caps and XP-curve edits need a deliberate policy for existing investments. Rebuild and verify the standalone archive through the delivery workflow in `AGENTS.md`.
