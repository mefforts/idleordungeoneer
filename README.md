# Idle or Dungeoneer

**[Play in your browser](https://mefforts.github.io/idleordungeoneer/)** · **[Download the latest ZIP](https://github.com/mefforts/idleordungeoneer/raw/refs/heads/main/downloads/Idle_or_Dungeoneer_Latest.zip)**

**Current build: 11.16.0.** A standalone fantasy RPG about delving, gathering and crafting. Extract the ZIP and open `index.html` in a modern browser. The game, artwork and environments are embedded; the download needs no installation or internet connection.

This update balances Zones 1–5 around Iron, Steel and Mithril: reachable combat-perk unlocks, stronger deeper-Zone rewards, armor reinforcement that mitigates percentage hits, usable vouchers and reassignable game-time points. Level-20 training is recalibrated around all three styles with rank-15 supporting jewelry. [Measured progression](PROGRESSION.md) · [Balance and extension guide](BALANCE_CONFIG.md) · [Exact current rules](BALANCE.md). Zones 6+ remain experimental continuation outside this balance target.

## Play, prepare, return

Delve for gold, Dungeon Sigils, essence and occasional materials. Gather and refine in **Skills** to craft equipment, then return to the same floor. Your weapon selects Melee, Ranged or Mage; armor is equipped separately. Death offers a retry or **Go skilling**.

| Progress | Equipment and goals |
| --- | --- |
| Zone 1 | Iron; 3 weapon refinements. The first idle slot unlocks at Zone 1, Floor 2. |
| Reach Zone 2 | First Dungeoneering level and Mastery point; second idle slot. Tier-2 work also needs matching skill level 10. |
| Zones 2–4 | Steel; 12 weapon refinements with rising material costs. Complete Zone 2 for the second Mastery point. |
| Complete Zone 3 + matching skill 20 | Mithril eligibility: promote an owned Steel style without requiring full Steel refinement. Mithril is intended around Zones 4–5. |
| Later milestones | Reach Zones 10, 20, 40… for later Dungeoneering levels and points. |

Mithril has 10 weapon refinements. Melee uses blue metal, Ranged blue leathers and Mage green Runewoven robes. Speed, reach and reinforcement limits are 5 / 10 / 15 across Iron / Steel / Mithril; enchantment limits are 2 / 4 / 6. Equipment DPS ceilings are approximately 80 / 240 / 480 before proficiency, matching-skill training and conditional perks. Each armor reinforcement adds 8 HP and 0.75 percentage points of damage reduction, within the worn set's tier; switching owned armor does not heal you. Vigor jewelry also grants mitigation proportional to its HP bonus.

The Leech Ring starts at **0.5% lifesteal**, reaches **1.25% at refinement 15** and **3% at 50**. Each rank adds 0.05 percentage points. Other jewelry gains 1% of its base effect per rank. Lifesteal uses actual direct-hit health removed and grants no overkill healing. Changing owned jewelry preserves current HP; genuine crafting/refinement gains retain their health increase. [Jewelry preview](preview-jewelry-refinement-mobile.png).

## Currencies and game time

| Resource | Purpose |
| --- | --- |
| Gold and materials | Craft new gear, refine equipment and improve tools/stations. |
| Dungeon Sigils | Permanent combat perks shared by all styles in the Dungeon. |
| Mastery points | Permanent Delving or Skilling speeds; optional Mastery allocations share the same point bank. |
| Essence | Enchant owned combat styles in Warding → Equipment; Warding also offers costly raw-resource transmutation. |
| Zone materials | Seeds, cores, dust and shards combine for occasional upgrade costs and Long blessings. |
| Specific upgrade vouchers | Pay for one matching rank on gear you own, a tool or a station. New gear and promotions still require materials. |

The first Mastery point offers a meaningful choice: **1.25× Delving** or **2× Skilling**. Further Delving ranks add 0.25×; Skilling progresses 2×, 3×…10×, then 12×, 14×…24× and onward. Purchases unlock choices in the **Speed** menu; each path's selection persists. **Reassign game time** in the Dungeon Shop returns the spent time points so you can change the allocation.

Speed is present from the start. Delving freely offers **0.25× / 0.50× / 0.75× / 1×**. Skilling starts at **1×**, includes active work, online idle and offline idle, and never goes below 1×. Delving changes combat, enemy, ammunition and combat-buff clocks independently of Skilling.

Combat perks use Sigils separately from Mastery points. Eight are available immediately. Cold Verdict unlocks at Zone 2, Returning Power at Zone 3, Gravitation at Zone 4 and Mirrorcraft at Zone 5. Effects such as Battle Geometry, Echo Arts and Returning Power adapt to the equipped style while keeping their shared ranks. The shop's **Long blessings** section spends 60–100 Zone materials for five times a blessing's normal duration.

Enchantment arcs trigger at **14% / 28% / 42% / 56% / 58% / 60%** across ranks 1–6. The last two Mithril ranks share the remaining chance below the 60% ceiling; Iron and Steel retain their prior values. Arcs need a second target and deal 50% of the triggering hit.

## Skills and idling

Each discipline has **Gather, Refine and Equipment** tabs. All three material tiers remain visible before unlock. Tier-2 activities need Zone 2 access and matching level 10; tier 3 needs Zone 3 completion and matching level 20. Silver mining/smelting also needs Smithing level 10. Active, idle and offline production enforce the same gates.

Hold a work scene, its work button or Space. The **Skills** shortcut opens the current discipline; **Gather / Refine / Source** swaps directly to related work. Ingredient chips visit their source and recipe bookmarks track a preparation route. Gold, arrow and rune links prefer the highest unlocked activity; training routes also respect current skill and Zone gates.

Colored discoveries give temporary active speed, from **+35% for 6 working seconds** to **double speed for 15**. The strongest applies; equal pickups refresh it and stronger pickups improve it. A weaker gathering pickup gives 1–5 items. A weaker refining pickup completes up to five normal batches, paying available ingredients and stopping when stock runs out. Timers count real seconds of work and pause on release, missing ingredients, menus or backgrounding. They survive reload but do not accelerate idle/offline production. Animation tempo is capped; higher speeds add bounded effects. Releasing, cancelling or resuming a hold keeps the work pose continuous. [Work transition review](preview-work-release.png).

**Idle produces at 25% of the base active rate**, with the same XP per batch. Assign it with an activity's Idle control: one slot switches directly; two slots use an empty slot or ask which task to replace. Assigned work continues through combat and menus, with up to **eight real hours offline** before the earned Skilling multiplier. Missing ingredients pause refining.

Tools equip automatically, start at 8% active speed and gain up to ten refinements of +0.5 percentage points each. They do not speed up idle work. Stations have five ranks of 3% work speed and 2% ingredient conservation; fractional savings carry between paid crafts.

Level 20 requires **32,166 XP** and targets the material work for roughly 80% of Iron/Steel upgrades **across all three combat styles**, including supporting jewelry at rank 15, tools and stations, with a modest delve-gold contribution. Older-tier XP tapers while material yields stay full. [Reproducible skill/material budget](SKILL_ECONOMY.md).

## Combat and readable threats

| Signal | Meaning |
| --- | --- |
| Red | Hurts you. |
| Violet | Hurts you and other monsters. |
| Teal | Protected opening or benefit. |
| Gold / white | Reflect interaction. |
| Yellow brackets | Interruptible target or cut point. |
| Blue | Shield; remove its source or guards. |

Warnings and visible effects use the same geometry. Detailed rules live in the Codex; brief combat reminders fade and recur. The player damage capsule spans chest to feet, excluding head and outstretched arms. Teal protected openings protect that full damage body.

Dash-throughs briefly stagger elites, rares, bosses and guardian Echoes without damage. Successful mechanic counters immediately reset dash; an ordinary body stagger retains its cooldown. Reflect variants use a reachable gold center, jaw opening or underfoot rune requiring exit and return. Ignoring a reflect costs 15% maximum HP before defenses.

Special enemies reserve separate positions, guard support and channel tasks such as Ascendance, Rare Awakening, Living Conduit and Siege Channel. Stuns, focused direct hits and appropriate counters interrupt them. Warband Resolve makes special enemies tougher together; the shield percentage communicates their shared protection. Ordinary wounded creatures can retreat toward healing support.

**Released attacks and placed hazards outlive their caster.** Unfinished casts, living channels and effects tied to a living pair stop with their source. Support totems can remain and retarget another living enemy. Summoning spires ignore weapons and require physical impacts: one normally, two when crowned, with a step clear between walking bumps. Dash through or wait during a red summoning surge. Summons and totems grant no rewards or wave credit. Encounter completion waits for remaining danger; defeat, retry and new floors clear transient effects.

**Walking Hedge** keeps travelling through offset teal openings. **Grave Pulse** opens 25% slower, keeps expanding and uses separated repeats later in a fight; dash fully across each rim to reset dash. **Rolling Furnace** uses persistent bankshots, splitting cores and crossing paths. These travelling attacks retire after passing the encounter rather than timing out. Hedge and Furnace dodges retain the normal dash cooldown. [Implemented mechanic library](SELECTED_MECHANICS.md).

Zone 2 has frequent returning/growing stars, lingering cleave fire and a crowded finale. Zone 3 introduces pursuing death echoes and Grave Pulse, with the stronger HP step carried into later Zones. Direct special-enemy hits have a 12.5% maximum-health floor before defenses; major mistakes can cost 25–50%, and independent overlapping attacks can stack. Fire and siphons use smaller, bounded rapid ticks. [Current balance and pacing evidence](BALANCE.md).

## Loot, blessings and health

Gold, Sigils, essence, raw materials and vouchers land before collection; pickup radius draws them in. Unclaimed ordinary loot persists through retries, reloads and floor travel, and floor completion gathers leftovers. Receipts and **Inventory → Materials** show what was collected. Monster resources are rare supplemental income; gathering and refining remain the primary supply.

Eligible elites, rares and Echoes have a **15% blessing-spoils chance**. Walk over spoils to pause and choose one of three cards with touch/click or 1 / 2 / 3; **Skip blessing** explicitly discards it. The choice has no fullscreen tint or background. Different and repeated blessings stack with independent saved timers. The mobile display uses icons and next-expiry timers; tap for all stack details. Delving speed advances combat timers; menus, pause and skilling freeze them.

Health motes are separate: ordinary enemies have a 2% chance of a 3% heal; elites and rares a 50% chance of a 12% heal. Motes expire after **12 combat seconds**, even at full health, and fade over the final three. They clear on floor start, retry and reload. Intercepted healing restores 0.35% maximum HP/second, bounded by a 15% player-healing reserve per totem.

The first upgrade voucher introduces its purpose and eligible owned upgrades. Later receipts link back to it. Use the explicit **Use voucher** button in Skills; crafting new items and promoting tiers retain their normal requirements.

## Interface, controls and saves

Seven curved-label medallions provide **Delve, Inventory, Skills, Shop, Settings, Pause / Play and Speed**. Settings → Navigation chooses the rail side/order. Inventory contains weapons, armor, jewelry, materials and **Codex**. Codex → **Guides** stays readable independently of discovery; its Getting started page explains the current loop and currencies. [Guides on phone](preview-current-guides-mobile.png) · [Getting started](preview-current-guide-mobile.png). Recipe and item books return to the menu and focus you left. Settings → Messages retains recent notices.

Inventory tabs, Skills sections and the Dungeon Shop remember their scroll positions while you play. Weapon refinement cards show current → next equipment DPS before spending. **Inventory → Materials** searches material and voucher names, including multiword searches; live counts keep the field and cursor intact. Clear or the first Escape clears the search; another Escape closes Inventory. Voucher links reveal their item even when a filter would hide it. [Material search](preview-material-search-mobile.png) · [Refinement preview](preview-refinement-preview-mobile.png).

| Action | Controls |
| --- | --- |
| Move | Touch and drag; release to stop. WASD/arrows and mouse also work. |
| Dash | Space, Dash, double tap while moving, two quick directional drags or triple tap a movement key. |
| Work | Hold the scene, work control or Space. |
| Collect a discovery | Tap, drag over it, or Enter/Space while focused. |
| Skills / Inventory / Codex / Shop | G / E / C / B. |
| Return to delve | D or Delve; while delving, it opens replay/frontier travel. |
| Close menu / pause | Escape. Blessing choices require a selection or Skip. |

Each arrow or rune supplies **10 combat seconds of firing**. Loaded time persists while waiting, paused, skilling or using another weapon. Ammunition engagement uses the same monster-body range as attacks. Preparation links help maintain supplies.

Progress saves in this browser. **Settings → Save → Backup/Export** downloads it; **Restore** accepts that backup. Use these when moving between browsers, downloaded filenames and the online game. Existing gear, resources, earned levels, Mastery balances, earlier perk unlocks and migration credits remain compatible. Reset progress remains a separate explicit action.

Gameplay suppresses native selection/callouts while keeping menu scrolling, keyboard access and editing/copy/paste in input and save controls. Reduced motion disables decorative effects while retaining visible hazard travel. Automated Chromium touch checks cover these behaviors; native Safari/in-app callouts still need a real iOS device check.

## Development and references

```sh
npm ci
# If system Chromium is unavailable:
npx playwright install chromium
npm run build
npm test
npm run report:skills
npm run report:balance
npm start
```

[DEVELOPMENT.md](DEVELOPMENT.md) lists source ownership, validation, art tools and delivery checks. [AGENTS.md](AGENTS.md) governs publishing. The standalone game and latest ZIP are delivered on GitHub `main`; GitHub Pages serves the same built HTML.

- [BALANCE.md](BALANCE.md): current rules, costs, damage, drops and measured pacing.
- [SKILL_ECONOMY.md](SKILL_ECONOMY.md): the all-style refinement/material target.
- [SELECTED_MECHANICS.md](SELECTED_MECHANICS.md): the 39 implemented themed abilities and current counters.
- [CHARACTER_ART.md](CHARACTER_ART.md): shared character rig and appearance assets.
- [ABILITY_IDEAS.md](ABILITY_IDEAS.md) and [THEME_NEUTRAL_IDEAS.md](THEME_NEUTRAL_IDEAS.md): original proposal records; unselected ideas remain unimplemented.
- [PREPARATION.md](PREPARATION.md): historical v10.1→v11 preparation experiments, labeled separately from current balance.

Older releases and their artwork remain in [Git history](https://github.com/mefforts/idleordungeoneer/commits/main/).
