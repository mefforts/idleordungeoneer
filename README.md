# Idle or Dungeoneer

**[Play in your browser](https://mefforts.github.io/idleordungeoneer/)** · **[Download the latest game (ZIP)](https://github.com/mefforts/idleordungeoneer/raw/refs/heads/main/downloads/Idle_or_Dungeoneer_Latest.zip)** — extract it and open `index.html` in a modern browser.

The game, environments, creatures, equipment and icons are embedded in one HTML file. The downloaded build needs no installation or internet connection. `npm start` serves it locally if you prefer a consistent browser save origin.

**Build 11.13.2** buffs jewelry refinements. The **Leech Ring reaches 1.25% lifesteal at rank 15**, an early Zone 3 preparation goal, and 3% at rank 50. Each rank adds 0.05 percentage points; other jewelry gains 1% of its base effect per rank. Existing ranks benefit immediately, with the same material costs and XP.

**Grave Pulse’s opening ring is 25% slower** (240 instead of 320 units/second). Follow-up rings keep enough space for separate dash counters rather than catching the opener. Movement-speed protection, persistent travel, damage and dash refunds remain. [Balance details](BALANCE.md).

**Build 11.13.1** makes save exports explicit: open **Settings → Save → Backup/Export** to download a readable copy of your current progress for review or backup. **Restore** accepts that same file.

**Build 11.13.0** gives the player a **chest-to-feet damage hitbox**. Body hits now register across projectiles, charges and floor attacks; the head and outstretched arms stay outside it. Dashes, movement, pickups and teal protected openings retain their existing roles. [Hitbox preview](preview-player-hitbox-mobile.png).

**Elites, rares and guardian Echoes reserve separate fighting positions** instead of converging on the player. Advance, ranged and guard roles keep pressure from different directions; some defend totems, and paired mechanics retain their coordinated movement. Wounded ordinary and uncommon creatures can retreat toward an unblocked healing totem for a small, capped heal. Intercept or break that support to deny it. [Enemy positions](preview-enemy-positions-mobile.png).

Offscreen enemies now produce a **soft red corner pulse** in their direction. Groups share one haze; reduced motion uses a steady glow. The signal stops when the enemy enters view or dies, and it leaves all controls interactive. [Phone](preview-offscreen-threats-mobile.png) · [Desktop](preview-offscreen-threats-desktop.png).

Temporary blessing drops are **40% less frequent**: eligible enemies now roll 15% instead of 25%; health-drop rates are unchanged. **Released attacks and placed hazards outlive their caster.** Waves, fire, projectiles, planted reflect wards and deployed mechanics finish their own sequence or counter, and encounter completion waits for remaining danger. Healing/power totems and lanterns can support surviving enemies. Unfinished casts and effects attached to a living caster or pair still stop on defeat; death, retry and floor boundaries clean up the encounter.

Threefold Ruin keeps its red/teal floor lighting and fire effects, with the quarter divider lines removed. [Phone](preview-threefold-ruin-mobile.png) · [Desktop](preview-threefold-ruin-desktop.png). The shared-defense foot arc and the ring around intercepted totem beams are removed; shield percentages and colored streams remain. Base health and damage, material/gold rewards, progression and the curved navigation labels retain their prior values. [Rules and checks](BALANCE.md).

**Build 11.12.0** makes overlapping elite and boss mistakes hurt. Direct hits have a **12.5% maximum-health floor before defenses**; distinct mechanics can hit together, while one projectile spread shares a short repeat-hit window. Dash and spawn protection still work. Fire and siphons keep their smaller, capped ticks; missed reflects remain 15%.

**Ascendance lasts 12 seconds, Rare Awakening 14**, and siphons last at least 12. Rally Thread, Orbit Transfer, Briar Leash, Soul Lantern and Slag Anchors stay for 14 seconds. New **Siege Channel** variants walk to a clear position, then keep firing warned volleys or marking the ground until interrupted. Existing focused-hit, stun and dash interrupts apply, including dash refunds. [Volley channel](preview-siege-volley-mobile.png) · [Ground-mark channel](preview-siege-marks-mobile.png).

Your **first voucher** now introduces what it pays for and leads to eligible upgrades. Later receipts provide a saved, dismissible link to that voucher. Inventory → Materials opens the same guide, with direct links to the matching Skills upgrade and its explicit **Use voucher** button. [First receipt](preview-first-voucher-mobile.png) · [Voucher guide](preview-voucher-guide-mobile.png).

Navigation medallions now have **curved names above them**: Delve, Inventory, Skills, Shop, Settings, Pause / Play and Speed. Their full buttons, icons and keyboard labels remain. [Phone preview](preview-curved-navigation-mobile.png) · [Landscape preview](preview-curved-navigation-landscape.png). [Balance and validation](BALANCE.md).

**Build 11.11.2** extends the Warband Resolve dash lockout to **ten combat seconds**, preserving the current stagger. Keyboard, touch Dash and mobile double-tap checks verify that moving elites take full damage after stagger ends and beyond the former five-second limit; both receiving and granting the boon stay disabled until expiry. No new in-game hint is added.

**Build 11.11.1** makes dash-throughs a longer opening against **Warband Resolve**. The enemy keeps its existing stagger, then remains unable to receive or grant the shared damage-reduction boon until **five combat seconds after impact**. Fresh dashes refresh the window; pauses and skilling freeze it. The cracked shield stays at 0% during recovery, with no new in-game hint.

**Build 11.11.0** gives travelling mechanics physical artwork and deliberate repeat patterns. **Walking Hedge** sends two or three world-spanning thorn walls through offset teal openings. They keep travelling faster than running and retire after passing the encounter; crossing a Hedge keeps the normal dash cooldown. The space between walls allows a dash through one, then a walking route through the next opening.

**Grave Pulse** keeps its single opening ring, then grows to two or three rings later in a floor or fight. Rings launch **at least 1.2 combat seconds apart**. Each completed dash crossing immediately resets dash for the next ring; merely grazing the rim does not. Every ring keeps expanding until it passes the fight. Bone crests, skulls, spirit trails and a small sequence symbol replace a plain colored band.

**Rolling Furnace** uses repeated bankshots, splitting cores and paired crossing shots as its floor band advances. Iron cages, incandescent cores, fragments and bank markers show the actual route and fork. Rollers keep travelling beyond the arena boundary and their former lifetime. Purple rims identify attacks that hit players and monsters; red Hedge roots hurt players. **Yellow brackets and a broken-bolt symbol mark interruptible channels and cut points.** Teal remains for openings and protected interactions; gold/white mirrors retain reflection. A small reset symbol confirms dash refunds.

[Walking Hedge](preview-walking-hedge-mobile.png) · [Grave Pulse](preview-grave-pulse-crests-mobile.png) · [Furnace bankshots](preview-furnace-bankshots-mobile.png) · [Splitting cores](preview-furnace-split-mobile.png) · [Crossing shots](preview-furnace-cross-mobile.png) · [Motion preview](preview-travelling-mechanics.mp4). [Timing and validation](BALANCE.md).

**Build 11.10.0** adds **dash-to-stun**: pass through an elite, rare, boss or guardian Echo to stun it for **0.65 seconds**, without dealing damage. A successful dash counter immediately resets dash, including reflects, summon interruptions, spire impacts, support-totem breaks and severed threads. A plain body stun keeps the normal cooldown. Refunded dashes retain their normal protection window.

Elites, rares and Echoes now spread out and sometimes pursue a task: **Ascendance** heals while channeling and grants a temporary offensive boost if completed; **Rare Awakening** turns an existing normal mob into a rare; **Living Conduit** summons until interrupted. Dash through the channeler, stun it, land three focused weapon hits, or remove 12% of its maximum HP with direct weapon hits to stop it. Tasks use themed props, progress arcs, teal dash arrows and hit pips. Early Zones allow one task at a time; later Zones allow two. Promotions and summons are capped, and summoned minions give no rewards. [Rules and validation](BALANCE.md).

[Ascendance](preview-elite-ascendance-mobile.png) · [Rare Awakening](preview-elite-awakening-mobile.png) · [Living Conduit](preview-elite-conduit-mobile.png).

**Build 11.9.0** gives Rally Thread and Orbit Transfer a visible teleport that separates their enemy pair, with at least **220 world units** of space and a clear dash crossing. Briar Leash gets the same spacing for its anchor. Movement keeps these links open until they break or expire; thread/leash cuts also work while forming.

**Warband Resolve** grants elites, rares, bosses and guardian Echoes **10% damage reduction per other special enemy**, capped at **50%** in every Zone. A small shield percentage shows the boon. Stunned enemies lose it and stop protecting their allies until recovery. Ordinary monsters and uncommons do not contribute. Existing Royal Guard and directional shields retain their separate effects.

Common **charge widths, cleave reach, ground-mark radii, beam widths and nova radii are 25% larger**, with matching warnings. **Hungry Siphon** attaches a red chain that breaks when you dash away; **Knotted Siphon** instead requires a dash through its teal knot. Both use a light, rapid drain with a short grace period and bounded caster healing, with no final damage burst. [Combat rules and validation](BALANCE.md).

[Separated Rally Thread](preview-rally-thread-mobile.png) · [Shared protection and a stunned ally](preview-warband-resolve-mobile.png) · [Dash-away siphon](preview-siphon-escape-mobile.png) · [Siphon cut point](preview-siphon-knot-mobile.png).

**Build 11.8.2** adds **75% HP to regular elites** and **25% to bosses and guardian Echoes** in **Zones 1–2 only**, on top of v11.8.1. Royal Guards and summoned elites use the regular-elite increase. Rares, uncommons and ordinary monsters retain their current health, as do enemies from Zone 3 onward. [Balance and pacing](BALANCE.md).

**Build 11.8.1** gives healing motes a **12-combat-second lifetime**, including while at full health, with a fade over the last three seconds. Menus, pauses and skilling freeze their timer. Elites and rares now independently roll **25% for blessing spoils** and **50% for a 12% health mote**. Ordinary monsters keep their 2% chance of a 3% heal. Other ground loot retains its persistence. The **Zone 1 Floor 5 boss** now opens with Walking Hedge and repeats it between his other normal-rotation attacks.

**Build 11.8.0** adds **39 themed elite, rare and boss mechanics**, with illustrated roots, hammers, lanterns, portals and other animated effects. Openings use teal symbols, counter targets use gold and timer arcs, and the Codex holds the detailed instructions. Major new attacks share one arena budget. [Mechanics and counterplay](SELECTED_MECHANICS.md) · [All 39 appearances](preview-themed-mechanics.png) · [Animation reel](preview-themed-mechanics.mp4).

The two guardian encounters between monster waves now field **4 enemies early, 5 midway and 6 deep in each Zone**, including the lead guardian. The final floor boss remains separate. **Uncommon creatures** occasionally replace ordinary spawns: **2× ordinary HP**, one ranged attack, ordinary loot, and simultaneous caps of **1 / 2 / 3 / 4** by Zone. Their eligible spawn chance is **7%**, after the opening enemies. [Uncommon threats](preview-uncommon-mobile.png) · [Guardian pack](preview-guardian-pack-mobile.png).

Elite, rare and boss attacks now use **maximum-health damage**: projectiles start at **10%**, heavy hits around **25%**, major mistakes up to **50%**, and missed reflects **15%**, before protection. Uncommons instead chip for **6% / 8% / 10%** with shots, ground marks or charges. Lingering fire uses small, rapid ticks; overlapping DoTs share a cap and dashes still protect you.

[Fifty new theme-neutral mechanic variations](THEME_NEUTRAL_IDEAS.md) are proposed for review only. [Original proposal status](ABILITY_IDEAS.md) retains the selected numbers and leaves the other eleven unimplemented.

**Build 11.7.1** makes Grave Pulse a **single continuously expanding ring**. It no longer expires at a fixed range, and its speed stays above running speed, including movement buffs. Dash through the rim. Pulse warnings and active rings cannot overlap across casters; the next warning allows the normal dash to recharge before impact.

**Build 11.7.0** aligns level 20 with the materials for roughly **80% of the Iron/Steel upgrade paths across all three combat styles**, including supporting jewelry, tools and stations. Iron weapons have **3 refinements**, Steel **12**, and Mithril **10 per tier**. Steel material costs rise exponentially, with cut gems used as weapon-refinement abrasives; the reference uses **2,894 Steel bars**, versus **6,626** at full completion. [Material/XP budget](SKILL_ECONOMY.md).

**Idle runs at 25% of base active speed** across all 31 activities. XP per completed batch is the same for active and idle; Mastery accelerates both while retaining their gap. Older-tier XP tapers sharply after level 20. Existing skill levels, material banks and equipment are retained; old weapon ranks convert once by tier progress, rounded upward.

**Steel now reaches about 240 equipment DPS. Mithril starts around 300 with completed Steel speed training and refines toward 480.** Equipped-tier damage budgets preserve that gain in Zone 3; enemy health and spawn cadence retain their prior calibration. Mithril needs **Zone 3 completion plus matching skill level 20**. Fully refining Steel is optional, so intensive skilling can bring Mithril into Zone 4; Zone 5 remains its intended normal starting point.

[Steel refinement costs](preview-steel-refinement-budget-mobile.png) · [Mithril before max Steel](preview-mithril-early-access-mobile.png) · [Mithril power guide](preview-mithril-power-guide-mobile.png).

**Build 11.6.4** fixes crossed arms in **Runecrafting and Gem Cutting**, including all three material tiers and both bonus flourishes. The tool approaches from the right, with the working elbow outside the supporting arm, while the tool tip still meets the rune or gem. Entry, release and reduced-motion poses keep the same separation. [Runecrafting on phone](preview-runecrafting-mobile.png) · [Gem Cutting on phone](preview-gem-cutting-mobile.png) · [Arm close-ups](preview-arm-crossings.png).

**Build 11.6.3** repaints all **12 skilling backgrounds** with cleaner equipment, consistent arrows and bowstrings, coherent workbenches and looms, and more deliberate lighting. Warding uses a compact cloth grip, with the weave drawn beneath the fingers during work and bonus flourishes. [Background overview](preview-skilling-backgrounds.png) · [Fletching on phone](preview-fletching-clean-mobile.png) · [Warding on phone](preview-warding-grip-mobile.png) · [Weaving grips](preview-warding-grips.png).

Healing and power totems can now be **destroyed by dashing through their bases**, with a color-matched burst and no new in-game text prompt. Walking still redirects their streams, weapons still ignore them, and breaking them grants no rewards. Fast swept crossings, the final dash frame, edge grazes and disabled totems all count.

**Build 11.6.2** doubles standard-monster HP again from Zone 3 onward: **2× v11.6.1, or 4× the v11.6.0 baseline**. The 6× elite, rare, guardian Echo and boss health setting is retained separately. Zones 1–2 keep their current health.

**Build 11.6.1** makes the Zone 3 health jump much stronger and carries it forward: ordinary minions gain **2× HP**, while elites, rares, guardian Echoes and bosses gain **6× HP over v11.6.0**. Special enemies receive their 6× once, rather than also inheriting the minion multiplier. Zones 1–2 retain their current health. Player damage, incoming damage, spawn counts, loot and summoning-spire impacts keep their current rules.

**Grave Pulse requires a dash:** cross its single expanding violet rim; running away cannot outlast it. Moving rings no longer paint their centers teal or show a `SAFE` label. Stationary Outer Ruin rings place their teal refuge away from the caster, inside the visible arena, with clear terrain and time to reach it. The refuge remains fixed through impact and uses a symbol. Mechanic labels and the combat guide no longer use the word `SAFE`. [Pulse warning](preview-grave-pulse-warning-mobile.png) · [Moving rim](preview-grave-pulse-mobile.png) · [Offset refuge](preview-ring-refuge-mobile.png).

**Build 11.6.0** slows skill progression after level 10. Levels 1–10 keep their existing requirements; level 20 now needs **32,166 total XP** instead of 7,410. Tier-1 work gives **10% XP after level 10**, and tier-2 work gives **10% after level 20**, while material yields and production speeds stay the same. Active work, idling, offline work, refining discoveries and equipment upgrades share these rules. Existing saves retain their earned levels and fractional progress through a one-time conversion.

**Mithril equipment unlocks after completing Zone 3**, with level **20** in the matching discipline. Promote an owned Steel style to open **10 Mithril refinements**; armor is crafted independently. The three sets use **Mithril blue metal, blue ranged leathers and green Runewoven robes**, retaining the current full helms, slim caps and wizard hats, with small buckle and shoulder-trim changes. Mithril ore/bars, yew, verdant cloth, enchanted salvage/fragments and sapphires supply ten new activities with the same Zone/skill gate. Every tier remains visible before unlock.

The two work-scene shortcuts now have distinct purposes: **Skills** opens the current discipline and **Gather / Refine** switches directly to related work, including ore ↔ bars, logs ↔ arrows, salvage ↔ cleaned relics and rough ↔ cut gems. Multi-step refining can jump straight to its input source. Switching releases the active hold and leaves idle assignments in place.

[Compare Steel and Mithril outfits](preview-tier-three-comparison.png) · [Mithril mining](preview-mithril-mining-mobile.png) · [Direct Gather / Refine controls](preview-direct-refining-mobile.png) · [Blue ranger](preview-blue-ranger-mobile.png) · [Green Mage](preview-green-mage-mobile.png) · [Visible tier-3 requirements](preview-tier-three-locked-mobile.png) · [Training bands](preview-training-curve-mobile.png) · [Mithril promotion](preview-mithril-promotion-mobile.png).

The earlier base health experiment applies across all Zones: **regular elites +75%**, **rares +50%**, and **bosses / guardian Echoes +50%**. Ordinary health calibration, spawn counts, player damage and loot stay the same, so fights last longer. Rare and boss-elite bonuses do not stack with the regular elite multiplier. [BALANCE.md](BALANCE.md) records the revised forecasts and playtest results.

**Build 11.5.0** consolidates crafting: Gather and Refine show both material tiers together, including locked recipes. Every tier-2 activity needs **Zone 2 access and level 10 in its matching discipline**, including idle/offline work. Steel promotions sit directly below their weapon; station and tool upgrades use the same compact rows in Equipment. The separate Tools tab and station footer are gone. [Equipment](preview-unified-equipment-mobile.png) · [Workshop upgrades](preview-unified-workshop-upgrades-mobile.png) · [Visible tier-2 requirements](preview-visible-tier-two-mobile.png).

**Artisan work now awards 8× its former XP**, with the same one-time catch-up for existing Artisan XP. Owned jewelry has 50 refinements. Leech ranks add **0.05 percentage points** of lifesteal; other pieces gain **1% of their base effect** per rank. Tools you own can gain ten refinements of +0.5 percentage points of active speed. Vouchers now name a specific rank upgrade—refinement, speed, reach, reinforcement, enchantment, jewelry, a particular tool or a named station. New item crafting and Steel promotions require materials. Old wildcard balances convert once to named upgrades without losing their count, and existing owned items remain. [Jewelry refinements](preview-jewelry-refinement-mobile.png).

Relic prospecting is now ingredient-paid work: **12 fragments → one rough opal**. Prospecting and ancient cleaning use a standing brush-and-relic animation at a bench. Warding Refine also offers **100 essence → 1–10 chosen raw resources**, with normal unlocks and the full essence cost. [Relic cleaning](preview-relic-cleaning-mobile.png) · [Prospecting](preview-clean-prospecting-mobile.png) · [Essence conversion](preview-essence-transmutation-mobile.png) · [Motion preview](preview-workshop-and-crypt.mp4).

The second Dungeoneering level and point now arrive on **completing Zone 2**; the first remains at Zone 2 entry, with later milestones still at Zones 10, 20, 40… The Dungeon Shop’s **Long blessings** store spends surplus Zone materials: most effects cost 60, Golden/Plentiful Hunt cost 80, and Silence/Stillworld cost 100. Each activates an independent stack lasting five times its normal combat duration. [Long blessing store](preview-long-blessing-shop-mobile.png).

Delving blessing choices now show just **three cards and Skip**, without a full-screen tint, blur or outer frame. Mobile active buffs use **icons with overlaid timers**; tap for effects and every stack’s remaining time. The HUD message-history shortcut is removed; Settings retains Messages. [Floating choices](preview-floating-blessings-mobile.png) · [Compact mobile buffs](preview-compact-delve-buffs-mobile.png).

**Summoning spires require bumps or dashes** and survive their caster’s death, continuing to summon. The encounter waits until the spires and their remaining minions are cleared. Weapons ignore spires, and all sources of weapon/proc damage leave their impact segments intact. Retry and defeat still clear encounter objects.

Rare spawn chance doubles to **3%**, with rares now using the standard elite loot/healing/blessing tables. Zone 2’s final floor substitutes up to **six known elites and three rares per wave**, at 10% rare chance, while keeping the wave totals. Growing stars appear more often, travel at 200 units/sec and stay outbound at least 2.2 seconds before returning from a substantial caster gap. Embervault cleaves leave **3.2 seconds of dangerous fire**. Quadrant and rebounding-ring arenas are **50% wider and taller**. [Larger quadrants](preview-larger-quadrants-mobile.png) · [Lingering fire](preview-ember-cleave-fire-mobile.png) · [Farther-reaching stars](preview-reaching-stars-mobile.png).

**Zone 3 starts above Zone 2’s final-floor health**, with 1.6× normal incoming damage. Fallen foes awaken as pursuing death echoes from the first wave, and the first guardian opens with a single expanding Grave Pulse ring. The equipment ceilings and your earned damage remain intact. Short automated 150-DPS comparisons use real damage, spawning, loot and normal blessing choices; [BALANCE.md](BALANCE.md) records the rules and limits of those trials. [Grave Pulse](preview-grave-pulse-mobile.png) · [Death echo](preview-crypt-death-echo-mobile.png).

**Build 11.4.0** adds free **0.25× / 0.50× / 0.75× / 1× Delving** controls from the start. Skilling starts at **1×** and includes idling; Mastery unlocks faster rates on either path. Both choices persist. **Codex now lives inside Inventory**, with its C shortcut retained. The defeat screen offers **Go skilling** and keeps a normal retry available when you return. [Starting speeds](preview-starting-speeds-mobile.png) · [Inventory guide](preview-inventory-codex-mobile.png) · [Defeat options](preview-defeat-skills-mobile.png).

Reflect casters keep moving. Touching the gold center triggers the counter immediately: enter an illustrated jaw through its teal opening, reach a distant timed rune, or step out and return to a rune beneath your feet. Ignoring a timer costs **15% maximum HP** before defenses at any distance; closed jaws deal **4%**, and Hungry Mirrors retain their boss-healing penalty. Timers pause with combat. [Three variants](preview-reflect-variants.png) · [Motion preview](preview-reflect-wards.mp4).

Zone 2 takes a firmer step up: **25% more incoming damage**, and its first guardian and corresponding elite echoes introduce **growing stars that return toward their moving caster**. Summoning spires can receive an elite shield link. In v11.5.0 weapons ignore spires; physical impacts always retain full strength. **Every fresh dash through a spire counts as one full, safe bump**, even when already touching its base or clipping its edge; an ordinary spire needs one impact and a crowned spire needs two. [Shielded spire](preview-shielded-spire-mobile.png).

Repeated delving blessings stack with independent expiry times. The vertical HUD and blessing picker now show their combined strength, and details show every stack's remaining time. [Stacked blessings](preview-stacked-blessings-mobile.png). With the current health experiment, the deterministic pressure check uses basic ranged armor and ~55 DPS with real damage: stationary play died in 6.3–6.9 combat seconds, while a moving bot using counters and dashes defeated the first Zone 2 guardian with 46–87 of 144 HP. This is a short controller comparison, not a human difficulty rating.

**Build 11.3.0** makes monster loot physical: gold, Sigils, essence, resources and vouchers land first, draw in within pickup radius, then show the familiar receipt. Pickup jewelry now helps collect these drops. Unclaimed loot survives retries, reloads and floor travel; completing a floor gathers leftovers. Temporary delve buffs now form a vertical, scrollable column. [Phone loot and buffs](preview-ground-loot-mobile.png).

V11.3.0 introduced Iron/Steel upgrade vouchers. V11.5.0 replaces their broad recipe eligibility with named upgrades on owned equipment, tools and stations; crafting new items and Steel promotions require materials. Dungeon Shop and game-time purchases keep their own currencies. [Voucher choices](preview-voucher-options-mobile.png).

Old Zone drops—Verdant Seeds, Ember Cores, Grave Dust and Rift Shards—now pay occasional **one-item upgrade costs**. Any combination works, with earlier Zone materials used first. These costs apply to every second refinement, the last rank of other equipment upgrades per tier, Steel promotion and station ranks 3 and 5. Existing balances remain; starter equipment/tool recipes keep their current costs.

Weaker refining pickups now **craft using available ingredients**, up to five normal batches, stopping when stock runs out. The pickup shows a maximum; the receipt shows the actual normal batch yield. Gathering windfalls still award 1–5 resources. Warding has a new separated-hand weaving loop, finished-cloth lift and taut-weave flourish. [Instant refining](preview-instant-refining-mobile.png) · [Phone weaving](preview-weaving-mobile.png) · [Motion and collection](preview-weaving-rework.mp4) · [Weaving poses](preview-weaving-poses.png).

Two dismissible progression tips explain the first Zone 2 Mastery point and how to use enough **essence** for a first Warding enchantment. Threefold Ruin’s dangerous quarters now erupt with substantial themed art; its safe quarter uses a clear teal symbol. [First Mastery tip](preview-first-mastery-mobile.png) · [Enchantment tip](preview-enchantment-tip-mobile.png) · [Four-quarter attack](preview-threefold-ruin-mobile.png) · [Lava eruption](preview-threefold-ruin.png).

**Build 11.2.1** fixes purchased game-time controls: the Speed button stays available in every scene after either purchase, with separate **Delving** and **Skilling (including idle)** selectors containing every unlocked rate. Both selections survive reload, and code-unlocked testing multipliers remain available alongside them. [Phone controls](preview-purchased-speed-mobile.png) · [Landscape controls](preview-speed-controls-landscape.png).

Skilling uses calmer work loops with a visual tempo cap at **4×**. Higher rates add sparks, then short bursts at **10×** and small fireworks at **24×**, while production keeps the chosen speed. Visible rarity names are removed from pickups, popups and active buffs; colors, effects and remaining time stay clear. [Phone skilling](preview-skilling-speed-mobile.png) · [Tempo comparison](preview-skilling-tempo.mp4).

**Build 11.2.0** gives elite and guardian abilities illustrated appearances alongside their warning glows: roots and thorns, molten eruptions, skeletal hands, crystal ruptures, growing stars, returning blades, chains, shield emblems and summoning portals. Effects animate through preparation and impact, pause with combat and have steady reduced-motion appearances. Colored threat boundaries and safe spaces stay readable. [Appearance comparison](preview-ability-effects.png) · [Animation reel](preview-ability-effects.mp4) · [Phone eruptions](preview-ability-eruption-mobile.png).

Totem beams now keep a consistent purpose color: **green crosses for healing**, **red swords for damage**, with **blue chevrons assigned to the attack-speed palette**. Current enemies still use their existing healing, damage and summoning mechanics. Streams keep their purpose color when intercepted, gain a teal recipient ring, and become muted when disabled. [Both streams on phone](preview-totem-beams-mobile.png).

**Build 11.1.1** fixes crossing arms during skilling: the supporting palm stays behind the nearer forearm, with both grips on the tool handle. The correction applies through regular work, bonus flourishes and both facings. [Crossing close-ups](preview-arm-crossings.png) · [Updated animation reel](preview-skilling-upgrade.mp4).

When a stronger speed bonus is already active on the same activity, a weaker pickup now becomes **1–5 of that activity’s output instantly**, including refined materials. The pickup shows the item and quantity before collection. Refining windfalls now spend ingredients as described in Build 11.3. Equal pickups refresh speed and stronger ones improve it, while an instant reward leaves the active timer untouched. [Phone windfall](preview-skilling-windfall-mobile.png).

**Build 11.1.0** upgrades the eight skilling animation families with distinct strike rhythms, subtle cycle variations, contact sparks/chips and two collection flourishes per family. Refining discoveries now grant timed crafting speed instead of a one-off progress jump. [Phone refining](preview-skilling-bonuses-mobile.png) · [Phone gathering](preview-skilling-gathering-mobile.png) · [Animation and bonus capture reel](preview-skilling-upgrade.mp4) · [Collection poses](preview-skilling-flourishes.png).

| Discovery | Chance | Active speed | Working time |
| --- | ---: | ---: | ---: |
| Common | 65% | +35% | 6s |
| Uncommon | 24% | +50% | 8s |
| Rare | 9% | +75% | 10s |
| Very rare | 2% | 2× | 15s |

Pickups show their color, speed and duration; an active chip shows the remaining time and opens details. The strongest boost applies, and collecting the same rarity refreshes it. Weaker gathering pickups grant 1–5 items; refining pickups complete up to five ingredient-paid batches. Timers count real seconds of active work on the matching activity, pause on release, missing ingredients, menus or backgrounding, and survive reloads. These temporary boosts apply to active work; permanent Skilling speed still includes online/offline idling. Gathering pickups also retain their material reward, and every accelerated craft consumes its ingredients.

Melee helms reveal the face through the **original T-shaped cutout**. Cohesive chests use one centered breastplate, softer leather shading and centered robe collars. The previous closed-helm art and downloadable build remain preserved at [v11.0.2](https://github.com/mefforts/idleordungeoneer/tree/b3b03755ab730dbfbbb2e21a746bce9689a0f90a).

**Build 11.0.2** gives Iron and Steel armor enclosed full helms with narrow visors and red plumes. Ranger leathers now have slimmer, open-faced caps with a single pale feather. Combat, skilling, Appearance, Inventory and Codex use the same headwear. [Compare both tiers](preview-headwear.png) · [Phone full helm](preview-full-helm-mobile.png) · [Phone ranger cap](preview-ranger-cap-mobile.png) · [Phone Inventory](preview-headwear-inventory-mobile.png).

**Build 11.0.1** replaces the Mage hoods with small wizard hats: a folded point, broad brim and stitched arcane star, in linen cream or blue to match the robes. The same hats appear in combat, skilling, Inventory and Codex portraits. [Both robe sets](preview-wizard-hats.png) · [Phone Warding](preview-wizard-hat-warding-mobile.png) · [Phone Inventory](preview-wizard-hat-inventory-mobile.png).

**Build 11.0** adds a meaningful first game-time choice, clearer preparation, and visible monster loot. [Time choices](preview-game-time-mobile.png) · [Preparation route](preview-preparation-mobile.png) · [Loot and active buffs](preview-loot-buffs-mobile.png).

Reach **Zone 2** for your first Dungeoneering level and point, then **complete Zone 2**, followed by **Zones 10, 20, 40…** for the next points. In the Dungeon Shop, spend one point per rank on **Delving: 1.25×, 1.5×, 1.75×, 2×, 2.25×…** or **Skilling: 2×, 3×…10×, 12×, 14×…24×…**. Skilling includes gathering, crafting, online idling and offline idling. The eight initial combat perks still use Dungeon Sigils and remain available from the start.

Monster rewards now show actual gold, Sigils, essence and rare raw-material bundles, with recent loot readable in Inventory. Ordinary / elite / boss material chances are **1.5% / 8% / 18%**, for **1 / 3 / 6** items; material income supplements skilling. Guardians can drop tiered upgrade vouchers on their first defeat (**6%**, or **15%** for a Zone-final overlord). Redeem one explicitly on an eligible equipment, tool or station recipe in Skills. The Scholar Ring now improves material drop chance, and Plentiful Hunt boosts the capped material chance.

Temporary buffs have a vertical combat column with countdowns, stack counts and next expiry; tap a buff for every stack's remaining time. Combat instructions fade and recur while warning shapes remain visible. **Double tap while moving on mobile to dash**: keep moving with one finger and double tap with another, or use two quick directional drags. Space, the Dash button and keyboard triple-taps remain available.

Ammunition descriptions consistently show ten seconds per arrow/rune. Recipe cards explain weapon roles, and a five-minute supply action opens a tracked preparation route. The existing tracker now plans shared ingredients, batches and remaining Iron refinements for Steel promotion, while keeping Zone access, skill training, refinement and optional armor distinct.

Repeated upgrade preparation costs less gold: the full Iron refinement/speed curve is **785** instead of 1,485; Steel is **1,885** instead of 3,050; promotion is **100** instead of 150. Successful weapon crafting, refinement, speed training and promotion train the matching discipline. Material requirements remain. Existing saves receive the price difference for owned ranks/promotions as a one-time gold credit, recorded in Settings → Messages. [Preparation comparisons](PREPARATION.md) explain the routes and timing limits. Existing saves retain balances, equipment, allocations, earlier combat-perk unlocks and the old 2× Delving entitlement.

**Build 10.1** lets you break summoning spires by walking into them: **one bump normally, two for a crowned spire**. Step clear between hits. Teal is safe; red means a summoning surge that can hurt you. Dash through it or wait for teal to avoid retaliation. Weapons still work, and the label above each spire shows the remaining bumps. [Phone preview](preview-spire-collisions-mobile.png) · [Collision demo](preview-spire-collisions.mp4) · [Looping preview](preview-spire-collisions.gif).

**Build 10.0.2** fixes skilling arms that looked detached from the shirt. Working and reaching arms now keep a continuous shoulder-to-wrist outline across all eight work families. [Phone mining](preview-player-mining-mobile.png) · [Phone warding](preview-player-warding-mobile.png) · [Work loops](preview-player-work-loops.gif).

**Build 10.0.1** protects gameplay holds from Safari text selection, highlighting and Copy/Look Up callouts. Mining and touch movement continue while held; releasing, cancelling or losing pointer capture stops them. Menus retain scrolling, keyboard controls and editable/save controls retain native behavior.

A lightweight loading screen appears before the embedded assets arrive and hands over to the intro when the first scene is ready. It supports reduced motion and offers retry if startup fails. [Phone preview](preview-loading-mobile.png) · [Desktop preview](preview-loading.png).

For iPhone and iPad, enable **Settings → Pages → Deploy from a branch → main → /(root)**, then open **https://mefforts.github.io/idleordungeoneer/** in Safari. Use **Share → Add to Home Screen** for a game icon. The root `.nojekyll` marker serves the standalone game without Jekyll processing. The first Pages deployment must finish before the URL works; its result appears under **Actions → pages build and deployment**. Use the in-game save backup/restore when moving between downloaded files and the website.

![Mobile touch movement and full-size navigation](preview-mobile-controls.png)

[Inventory](preview-inventory-mobile.png) · [Materials](preview-inventory-materials.png) · [Dungeon Shop](preview-dungeon-shop-mobile.png) · [Intro](preview-intro-mobile.png) · [Counterplay themes](preview-encounter-themes.png) · [Healing stream](preview-totems.png) · [Phone elite group](preview-encounters-mobile.png) · [Floor progression](preview-floor-progression.png) · [Phone environment](preview-environments-mobile.png) · [Desktop Dungeon Shop](preview-dungeon-shop.png) · [Skills](polish-mobile-gather.png) · [Codex](polish-reading.png)

## Dungeon Shop

**Build 10.0** replaces separate Zone shops with a shared **Dungeon Shop**. All current Zones belong to **The First Descent**; a future Dungeon can have its own wallet and perks. Open the wisp, the Dungeon Sigil counter or **B**. Purchased ranks remain active throughout this Dungeon.

Eight combat perks start unlocked: Ember Edge, Winter Thread, Soul Conductor, Fracture, Dungeon Ward, Battle Geometry, Echo Arts and Spellbreaker. Cold Verdict, Returning Power, Gravitation and Mirrorcraft unlock at Dungeoneering **3 / 5 / 8 / 12**. First ranks cost 6–26 Sigils; subsequent ranks cost 2.8× more, rounded upward.

Every purchase benefits **Melee, Mage and Ranged**. Some perks change with the equipped weapon, as the shop explains:

| Shared purchase | Melee | Mage | Ranged |
| --- | --- | --- | --- |
| Battle Geometry | More sweep targets and reach | Elite-first homing | Piercing arrows |
| Echo Arts | Weak echo blade | Spell ricochets | Additional arrows |
| Returning Power | Returning slash | Returning orb | Returning arrow |

Dungeon Sigils arrive slowly: ordinary monsters have a **0.3% chance of one**, all elites, including rares, **35%**. Guardians grant **1 / 1 / 2**, with **3 more** from a Zone-final overlord. Summoned creatures grant no rewards. Fortune 4 raises the ordinary chance to **0.42%**. Jewelry and equipment retain traditional statistics; the shop focuses on elemental effects, area attacks and utility.

Old Zone wallets and the full historical price of purchased ranks convert once at **25 seals per Dungeon Sigil**, retaining fractional credit. Original ledgers stay archived in the save. Choose new perks freely.

**Dungeoneering starts at level 0.** Reaching Zone 2 grants the first level and point; completing Zone 2 grants the second. Later points remain at Zones 10, 20, 40 and so on. Replays grant no extra points. Spend the first point on one of the two game-time paths in the Dungeon Shop; additional optional Mastery allocations share that bank. Permanent time ranks are retained when allocations are refunded. Combat XP and old ground caches are preserved as a historical ledger, with no new visible XP drops. These milestone rules do not add new Zone content.

Press **Delve while delving** to replay a cleared floor or return to the frontier. The first idle-slot tip explains that the second slot comes at **Zone 2**. Entering Zone 2 also explains replay travel and the second idle slot. Crafting your first upgraded weapon gives a refinement and Warding enchantment tip.

[Phone shop](preview-dungeon-shop-mobile.png) · [Desktop shop](preview-dungeon-shop.png).

## Equipment and pacing

| Build | Zone 1 / Iron | Zone 2 / Steel | Zone 5 / Mithril |
| --- | ---: | ---: | ---: |
| Maximum equipment, base proficiency | 80 DPS | 240 DPS | 480 DPS |
| Dedicated equipment training | ~86 DPS | ~259 DPS | ~518 DPS |
| Single-target soft budget | 100 DPS | 300 DPS | 600 DPS |

Weapon refinement, attack-speed training, proficiency and matching crafting levels provide core damage. Above the single-target budget, floored by the equipped tier, each extra calculated DPS contributes at 25%; real hit damage uses the same adjustment. Conditional elemental damage and additional targets can add more. Abilities have finite ranks and increasingly expensive prices.

| Zone | Forecast at 1× | Reference DPS |
| --- | --- | ---: |
| 1 | ~16 minutes | ~80 |
| 2 | ~24 minutes | ~240 |
| 3 | ~239 minutes | Current Steel reference, ~240 |
| 4 | ~254 minutes | Current Steel reference, ~240 |
| 5 | ~135 minutes | Mithril reference, ~480 |

References use complete Iron / Steel / Mithril equipment at base proficiency, with no required Dungeon abilities. Movement, menus, deaths, preparation, cleaves and speed settings affect real completion time. [BALANCE.md](BALANCE.md) explains the paths, rank costs and live simulations; [balance-report.json](balance-report.json) includes exact weapon, shop and economy values. Mithril becomes eligible after Zone 3 at matching level 20; later tiers remain reserved.

Ordinary monsters drop **no gold**. Baseline clears pay **191 gold in Zone 1 / 293 in Zone 2**, mainly from guardians and floor caches, before elites and jewelry. Those per-Zone gold budgets stay the same across the longer floor counts; guardian XP is also spread across each Zone. Scavenging remains another gold source. Fractional rewards survive reload; existing balances and crafting costs are preserved.

## Zone scenery and creatures

The four authored Zones now contain **168 scenery, terrain and creature assets**. There are **42 ordinary creature forms and 42 matching rare elites**. The first pass added 72 environment illustrations; the new creature passes add 60 more illustrations, alongside four new medallions.

| Zone | Floors | Ordinary forms | Rare elites |
| --- | ---: | ---: | ---: |
| The Overgrowth | 5 | 8 | 8 |
| Embervault | 10 | 10 | 10 |
| Hollow Crypt | 20 | 12 | 12 |
| Astral Rift | 20 | 12 | 12 |

Each area also keeps its twelve scenery objects, three guardian forms, three terrain textures and three ground details. New families join the spawn mix gradually as you descend. Floor names, layouts and creature mixes change throughout all **55 named floors**.

Each floor changes the terrain, scenery mix and regular-creature mix gradually. Overgrowth moves from woodland to rooted ruins and the Elder Grove; Embervault from ash to the foundry and molten heart; the Crypt from graves to vaults and the Sovereign’s sanctum; the Rift from fractured approaches to starlit ruins and the Unmade threshold. Ground litter groups around larger landmarks, and starting areas retain open walking space. Later Zones that repeat a biome receive their own seeded layout.

New creatures scuttle, sway, hop, prowl or hover, with reduced-motion support. Their illustrated forms retain their own motion; Zone 3’s new death echoes and guardian pulses add explicit combat mechanics. Scenery uses foot-level collision and fades when it would hide the player or nearby enemies. Ground details stay beneath characters and telegraphs. Zone Codex pages list the floors and creatures.

[Compare early, middle and final floors](preview-floor-progression.png). Source sheets, sprite-isolation metrics and the asset catalog are in `assets/environments/`. `npm run art:environments` exports transparent WebP cutouts and terrain textures into `src/environment-art.js`; `npm run review:environments` captures the actual game renderer. Runtime placement, floor palettes and creature animation are in `src/environments.js`.

## Minimal runestone interface

Gameplay uses outlined information and isolated controls with transparent backing. Delve, Inventory, Skills, Dungeon Shop, Settings, Pause and Speed occupy a circular icon rail. Codex is inside Inventory and also opens with C. The dungeon entrance, satchel, wisp and raised play/pause medallions use over 90% of each button’s space. **Settings → Navigation** selects either side and reorders pins with dragging or arrows. Titles sit at the top center, health and Dungeoneering on the left, and warnings/messages below them. Settings → Messages retains the latest 40 notices.

Menus use warm stone, leather and brass. Carved runestone buttons and headers keep hard corners; painted medallions frame the icons. Collection entries and guides have distinct artwork. Tooltips, native buttons, focus restoration and accessible labels support keyboard and touch navigation. Detailed explanations stay in the Codex.

**Inventory** shows the worn set, actual Zone DPS, health, attack speed and reach. Touch anywhere on a weapon’s main card or an owned armor card to equip it; the separate book button opens details. Weapons, armor, jewelry and materials have their own tabs, alongside a labeled Codex button. Materials show live quantities and link to their source; style training expands when needed. Books return you to the same recipe, shop, search or unapplied Mastery allocation.

## Gathering and crafting

Scavenging cards show their gold yield alongside fragments or salvage. Each search gives a visible material-and-coin receipt, and gold recipe costs lead directly to Scavenging. Work surfaces, hand tools and separate head/torso/arm joints keep each activity grounded; kneeling searches, hammer strikes, knife carving, woven cloth, rune tracing and gem cutting have distinct motion. Warding effects follow the current Zone’s palette. [Scavenging](preview-scavenging-mobile.png) · [Gold rewards](preview-skilling-rewards.png) · [Warding](preview-warding.png) · [Armor poses](preview-workshop-poses.png).

A small link below the idle-unlock notice guides new players to craft a stronger weapon. It stays until their first weapon craft or refinement, then remains dismissed across reloads.

**Skills** organizes each discipline into Gather, Refine and Equipment. Hold the work control, scene or Space. Active material bonuses can be tapped, dragged over, or collected with Enter/Space while focused. Forge sparks, twigs, glistens and similar discoveries grant **timed active speed**, from +35% for 6 working seconds to double speed for 15 working seconds, while still consuming ingredients. A second finger can collect bonuses while the first keeps working.

Resource costs link to their sources, and tracked recipes follow you back to the crafting bench. Every skill hub and activity has a direct **Idle** button. With one slot, choosing another task switches it immediately. With two slots, an empty slot is used first; if both are occupied, choose which task to replace without stopping it first. The first slot unlocks at **Zone 1, Floor 2**, with a notice linking directly to Skills. The second opens when you clear Zone 1 and enter Zone 2. Assigned tasks continue during combat and menus, with up to eight hours offline; missing ingredients pause refining.

Crafted pickaxes, hatchets and mattocks equip automatically, appear in gathering scenes, work **8% faster actively**, and add one material to gathering bonuses. Each station has five upgrades, each granting **2% ingredient conservation and 3% work speed**. Conservation carries between crafts until it saves a whole ingredient; viewing costs never consumes that credit.

All three resource tiers appear in the same menus. Tier-2 work requires Zone 2 access and level 10 in the matching discipline; active, idle and offline production enforce the same gate. Existing inventories and owned gear remain intact.

| Discipline | Zone 2 gathering / refining |
| --- | --- |
| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar |
| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows |
| Scavenging | Ancient Salvage; 2 salvage → 2 Ancient Fragments |
| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 cloth + 2 fragments → 10 runes |
| Artisan | Rough Garnet → Cut Garnet |

All 31 activities support their appropriate scenes, active bonuses and visible tools. Existing starter recipes cross disciplines too: arrows use oak and iron; runes use cloth and fragments; armor uses different proportions of cloth, metal and wood. Existing opal jewelry remains available.

## Weapons and armor

Each arrow supplies **10 seconds of bow firing time**, and each rune **10 seconds of staff casting time**. Loaded time stays while waiting for a target, paused, skilling or using the other weapon, and survives reloads. Delve speed scales this combat clock. The HUD shows reserve items and total firing time beside the Sigil counter; its details include loaded seconds. Low supplies are marked and link to preparation. [Phone HUD](preview-ammunition-mobile.png).

One weapon selects your Melee, Ranged or Mage style. Each style has separate refinement, speed, reach, enchantment and proficiency. Iron weapons have **3 refinements**, Steel **12**, and Mithril **10**, counted within their tier. Other paths retain speed/reach/reinforcement caps of **5 / 10 / 15** and enchantment caps of **2 / 4 / 6**. Clear Zone 1, finish Iron refinement 3 and reach crafting level 10, then promote to Steel. Mithril requires matching level 20 and Zone 3 completion, with no maximum-Steel-refinement requirement.

Combat proficiency grants up to **3% damage** and matching crafting levels up to **5%** more. Equipment-only dedicated limits are approximately **86 / 259 / 518 DPS** for Iron / Steel / Mithril. Zone elemental upgrades work with every combat style.

The Opal Leech Ring starts at **0.5%** lifesteal. Armor equips independently of the weapon. Melee, Ranged and Mage each have three illustrated sets: Iron/Steel/Mithril armor, Plain/Cured/Blue leathers, and Linen/Blue Wool/Green Runewoven robes. The worn set supplies its own health and protection, movement or Mage bonus. Reinforcement adds 8 HP per rank, limited by that set’s tier. Switching owned armor never heals you. Promotions change held weapon art; bows aim toward targets while retreating, and articulated hands, collars and weapon grips stay joined across poses.

## Player and animation

The player has a compact, illustrated 2D style: expressive faces, crisp outlines, simple shading and plain starter clothing. **60 vector parts** cover travel clothes and the nine armor sets, with independent head, shoulder, chest, leg, boot and glove attachments. Arms and legs have continuous outlines across their joints. Near and far arms use separate layers, with inward-facing thumbs and forearms that can cross the chest. The work tools include a weaving shuttle and jeweler’s chisel; weapon art keeps its existing detail.

The same rig serves combat, gathering, crafting, appearance previews and inventory portraits. Relaxed hands rest below the waist; combat has distinct ready stances and two-handed tools and weapons share calibrated grips. Work has continuous anticipation, strikes and recovery, plus distinct carving, weaving, engraving, gem working and kneeling searches. Starting and stopping blend smoothly. Saved appearance choices retain their colors and styles. [Outfits](preview-player-sets.png) · [Motion phases](preview-player-actions.png) · [Mining on phone](preview-player-mining-mobile.png) · [Weaving](preview-player-warding.png) · [Animation recording](preview-player-motion.webm). [CHARACTER_ART.md](CHARACTER_ART.md) describes the assets and attachment system.

Attack clips now ease into windup and return to their ready stance, including a continuous bow release. Working elbows bend below raised hands, and the tool arcs clear the head. Carving, rune engraving and gem work use larger, distinct gestures; their tools meet the workpiece and sparks appear on contact. Weaving passes the shuttle across the cloth, scavenging uses a planted support palm with a lift-and-rake cycle, and relic cleaning uses a standing brush pass with a braced relic. Solid workpieces sit behind the fingers. Appearance plays complete attack cycles.

[Motion reel](preview-player-motion-overview.mp4) · [Live work scenes](preview-player-live-skills.mp4) · [Animated work loops](preview-player-work-loops.gif). These recordings show the current renderer at 1× animation speed. The close-up reel covers movement, all six weapon families and all eight work families; the scene reel includes starting and releasing work.

## Guardians and elites

The combat library now has **68 attack patterns**: the prior 29 plus the 39 selected themed mechanics. Bosses change tactics at **75% and 40% health**, with shielded Royal Guards, summoning spires, failed-reflect healing, and large arena attacks. Their body hurtboxes now match their visible size, so a short sword can hit a large creature above its feet.

| Warning | Meaning |
| --- | --- |
| **Red** | Dangerous to you only |
| **Violet** | Dangerous to you and other monsters |
| **Yellow brackets** | Interruptible channel or cut point |
| **Gold / white center** | Stand in the center to reflect |
| **Teal** | Safe space or an intercepted benefit |
| **Blue** | Shield; remove its source or Royal Guards |

Shapes, outlines and labels reinforce the colors. Violet sweeps, charges, beams, eruptions and rebounding rings also damage other enemies once per cast: **35% ordinary / 12% elite / 2.5% boss maximum HP**, before shields. They cannot trigger player weapon procs or lifesteal.

- **Rebounding Barrage** fires three projectile rings with rotating gaps, then banks them off the arena bounds. **Growing Stars** expand as they travel. **Homeward Blades** turn back toward their caster.
- **Threefold Ruin** warns three red arena quarters and marks one teal quarter safe. Numbered lanes, inner/outer rings, pincers, spirals, mines, siphon tethers and orbital blades provide other movement challenges.
- **Royal Guard** protects the boss with a blue shield until its guards are defeated. The boss takes 70% less damage while protected.
- **Hungry Mirror** returns 12% maximum boss HP and staggers when reflected; a missed center heals the boss for 5%. Reflect variants use at least 3s (3.4s for an underfoot rune) and trigger on center contact.
- **Calling Spires** replenish ordinary monsters or elites after visible arrival warnings. Walk into a normal spire once, or a crowned spire twice, stepping away between bumps. Teal is safe; a red, surging spire retaliates for **8% / 12% maximum HP before defenses**. Dash through or wait for teal to avoid that damage. Weapons cannot target or damage them. Spires and their minions remain after the caster dies; clear them to advance. Breaking a spire cancels its pending arrival; existing minions stay. Summons and spires grant no loot, XP, Mastery or wave progress; encounter caps prevent unlimited armies.
- **Healing and power totems** remain untargetable by weapons. Get closer to the totem than its caster to redirect the stream, or dash through its base to destroy it. Otherwise it stays until the caster falls. Power interception grants +10% hit damage for five seconds; healing has a finite reserve.

Reflect centers, stream corridors and totems retain their larger spacing and scenery checks. Major arena attacks and reflects reserve clear cast windows. Owner death clears support streams and most attacks; summoning spires persist. Retry, defeat and transitions clear transient encounter objects. Menus and skilling pause combat timers.

The interludes have four to six guardians/Echoes. Within ordinary monster waves, known guardians still return as elite echoes, up to **one / two / three per wave** as floors deepen. They can charge, ricochet, shield allies and use additional themed patterns. Shield sources cannot form shield chains.

[Safe-quarter warning](preview-boss-sunder-mobile.png) · [Summoning spire](preview-summoning-spire.png) · [Combat reel](preview-boss-patterns.mp4).

## Rare elites and blessings

All **42 ordinary creature forms** have a distinct painted rare elite form with **5.25× ordinary health in Zones 1–2 / 7.875× from Zone 3**. Eligible spawns have a **3% chance**, capped at one rare per ordinary wave. Zone 2’s final floor uses 10% and permits three rares. Rares and other elites share a **25%** chance of blessing spoils and the same loot/healing rules.

**Walk over spoils** to pause the delve and see three A/B/C options. Touch/click a card or press **1 / 2 / 3**. Movement and Escape cannot choose or dismiss the screen. **Skip blessing** explicitly discards that drop. Choice contents are fixed when dropped and survive reload.

The ten blessings last **40–60 seconds**: Battle Fervor, Windstep, Stonebreaker, Totem Silence, Stillworld, Golden Hunt, Plentiful Hunt, Chain Reaction, Momentum and Long Reach. They add offense or powerful utility: disabling totems, halving enemy movement, granting gold or improving rare material chances. There are no healing blessings.

**Different blessings and repeated copies stack**, with independent timers and visible stack counts. Menus, pause and skilling freeze their duration. They carry across Zones in this Dungeon. Unclaimed spoils stay in their original Zone. Delve speed advances combat time.

The Opal Leech Ring starts at **0.5%** of actual direct-hit health removed, with no overkill healing; refinement 15 reaches **1.25%**, and rank 50 reaches **3%**.

[Phone choices](preview-blessings-mobile.png) · [Landscape choices](preview-blessings-landscape.png).

## Healing drops

Ordinary monsters have a **2% chance** of a mote healing **3% maximum HP**. Other elites have a **50% chance** of **12%**, and rares share that **50% chance** and **12%** heal. Motes expire after **12 combat seconds**, even at full health, fading during the final three seconds. Waves do not refresh the timer; menus, pause and skilling freeze it. Starting, retrying or reloading clears motes. They are separate from persistent gold/material drops.

An intercepted healing stream restores **0.35% maximum HP per second**, up to a **15% lifetime reserve per totem**. A depleted stream still blocks the caster's healing. Uninterrupted streams restore **0.4% caster maximum HP per second**. Healing streams do not stack.

## Controls and saves

| Action | Controls |
| --- | --- |
| Move | Touch anywhere in the arena and drag; release to stop. WASD/arrows and mouse also work |
| Dash | Double tap with another finger while moving, two quick directional drags, triple tap a movement key, Space or Dash |
| Break summoning spire | Walk into it; crowned spires need two bumps with a step away between hits. Dash or wait while red |
| Work | Hold work control, scene or Space |
| Collect active bonus | Tap, drag, Enter/Space on focused bonus |
| Skills / Inventory / Codex / Dungeon Shop | G / E / C / B |
| Return to delve | D or Delve pin |
| Close menu / pause | Escape |

Older three-floor saves migrate to the expanded depths once. Previously reached Zones, equipment, wallets, materials, Dungeoneering XP, Mastery and idle assignments are preserved. Former Zone completions mark the expanded Zone as cleared, so the new intermediate floors can be replayed. Saves retain the `deepwell-prototype-v1` key. Settings provides backup/restore and reduced motion. Back up and restore your save when moving between browser origins or downloaded filenames.

Existing power ranks and pending choices pass through the legacy Zone migration, then convert into Dungeon Sigils. Earned XP becomes historical global XP; old uncollected orbs are banked once. Old biome Mastery banks are pooled; duplicate allocations are refunded. Migration runs once and archives the old Zone/Mastery record. Equipment, materials, gold and XP caches remain. Older excess equipment ranks and unavailable armor remain archived under the existing tier rules.

## Development and validation

Builds are committed to GitHub with the standalone ZIP in `downloads/`. [AGENTS.md](AGENTS.md) describes public-file review and delivery verification. Cloud drafts and website deployments are separate.

```sh
npm ci
# If system Chromium is unavailable:
npx playwright install chromium
npm run build
npm test
npm run report:balance
npm run review:ui
```

Dungeon progression, global XP, migration and combat math live in `src/zone-shop.js`; shop UI/styles in `src/zone-shop-ui.js` and `src/zone-shop.css`. Player presentation and Codex remain in `src/presentation.*` / `src/codex.js`. Skill definitions live in `src/game-data.json`, tier rules in `src/zone-progression.js`, and the shared character rig in `src/avatar-rig.js`. Gold rewards are in `src/economy.js`; test travel in `src/testing.js`. The expanded ability library, geometry and combat language live in `src/combat-expansion.js`; guardian patterns, counterplay and elite scheduling live in `src/encounters.js`, with embedded sprites in `src/encounter-art.js`. Work animations, gold receipts and painted foreground props live in `src/workshop.*` / `src/workshop-art.js`; ammunition timing in `src/ammunition.js`; healing drops in `src/restoration.js`. Milestones and game-time ranks live in `src/time-progression.js`, preparation routes in `src/preparation.js`, loot and vouchers in `src/loot.js`, physical drops in `src/ground-loot.js`, named voucher rules in `src/specific-vouchers.js`, fine crafting and unified menus in `src/crafting-update.js`, the long-blessing store in `src/blessing-shop.js`, Crypt/finale mechanics in `src/zone-challenge.js`, shared Zone materials in `src/zone-materials.js`, contextual tips in `src/progression-guidance.js`, and the visible buff strip in `src/temporary-buffs.js`. Rare creatures, timed blessings and enemy area damage live in `src/rare-elites.js`; floor coordinates and migration in `src/zone-layout.js`, with the expanded bestiary and elite roles in `src/deep-encounters.js`; `npm run art:rare-elites` exports their source art and `npm run review:rare-elites` captures actual game previews. The early loading screen lives in `src/loading.*` and `src/loading-runtime.js`. Mobile controls, navigation and material inventory live in `src/mobile.js` / `src/mobile.css`; themed ability definitions, migration and pricing in `src/zone-abilities.js`. Reflect variants and their artwork live in `src/reflect-wards.js`; regional incoming damage, dash identity, death-to-skilling navigation and combined blessing descriptions live in `src/delve-update.js`. Selected mechanics and shared collision definitions live in `src/themed-encounters.js`, their rendering in `src/themed-encounter-art.js`, percentage damage and interlude packs in `src/encounter-damage.js`, and capped ranged creatures in `src/uncommon-enemies.js`. The original engine and compiled standalone output are in `index.html`.

Fifty-two browser suites cover save migration, shared Dungeon progression, automatic and explicitly dismissed buff choices, actual damage/cadence across all weapons, equipment limits, shop costs, global Mastery, all activities, active bonuses, touch/keyboard controls, Idle navigation, bosses, rewards, layouts and distinct collection and guide icons. Counterplay tests cover reflect timing, stream geometry, all six weapons, cleanup, overlap limits and phone placement. Real touch tests cover movement, cancellation, multiple fingers, whole-card gear selection, guidance and over 90% visible icon coverage on both rail sides. Native-gesture regressions cover sustained mining/movement holds, bonus dragging, lost capture and interruption cleanup, menu swipes, clipboard editing, save controls and keyboard focus. Spire collision tests cover ordinary/crowned impacts, full-speed dash crossings, red-window retaliation, disabled spires, weapon immunity, reward isolation, cleanup and actual touch/keyboard movement. A complete 55-floor progression test verifies Zone endings, Mastery gates and migration. The all-style material-budget regression completes actual production to level 20, checks quarter-rate idle work, paid exponential costs, tier-local rank migration and stronger live Zone 3 equipment damage while preserving enemy health. Skilling discovery regressions cover every rarity, exact expiry, ingredient costs, strongest-only boosts, earned-time composition, release/menu pauses, idle/offline isolation, save restoration, real phone touches and 38,720 collection-flourish poses. Journey regressions cover milestone rewards, both time paths, offline batches, compound preparation, loot/vouchers, fading reminders, independent buff timers and real two-finger double-tap dashes. Full combat simulations verify the first four Zones and later pacing. Startup tests hold back the game download to verify the loading screen actually paints first; they also cover reduced motion, asset readiness and retry. Core phase, biome, gear and jewelry definitions remain guarded by manifests; the approved style-name copy is updated.

For an on-device iOS Safari or in-app browser check, hold both the work button and mining scene for at least five seconds, drag over a bonus, then release or interrupt the touch. Hold and drag in the arena, then lift, switch apps or rotate. Gameplay should never show text handles or Copy/Look Up, and work/movement should stop after interruption. Swipe a long menu and Codex overlay, copy/paste in Settings and Codex search, and open save backup/restore. Automated Chromium touch tests cover these game behaviors; the operating system's Safari callout UI still needs an actual iOS device check.

Generated icon sheets, calibrated regions and alignment metrics live in `assets/icons/`. `python3 scripts/measure-icon-bounds.py` measures the medallions without altering source art; `npm run art:icons` exports embedded WebP badges. `scripts/export-player.py` isolates the player textures with Pillow, NumPy and SciPy; `scripts/measure-player-binds.py` calibrates their joint axes. Use `CHROMIUM_PATH` for a custom browser. Local test output stays in ignored `test-results/`.

`npm run art:blessings` exports the original blessing emblems and embedded WebP caches. `npm run review:combat` records six actual boss patterns and captures the Dungeon Shop and blessing picker; it requires FFmpeg and Playwright video support.

`npm run review:journey` captures game-time choices, compound preparation, actual loot receipts and temporary buff timers at phone and desktop sizes.

`npm run review:hats` captures both Mage hats, the outfit lineup, phone combat/work/Inventory and portrait/landscape fitting, using the live renderer and isolated review states.

`npm run review:spires` captures phone and desktop spire states and records ordinary/crowned bumps, red-window retaliation and a safe dash. It exports an MP4 and a looping GIF with FFmpeg, using isolated encounter fixtures and the real movement/collision loop.

`npm run review:headwear` captures both full-helm and ranger-cap tiers, their portraits, motion poses and phone/desktop fitting with the live renderer.

`npm run review:skilling` records all eight live work families, collects real rarity pickups, and captures the active timer and collection poses at phone, landscape and desktop sizes. Playwright video recording requires its FFmpeg dependency (`npx playwright install ffmpeg`); final MP4 encoding uses system FFmpeg. Add `-- --stills` to refresh screenshots without recording.

`npm run review:arms` captures arm and hand layering in mining, smithing, fletching, weaving, rune engraving and gem cutting, including regular work, both bonus reactions and both facings. The rig suite checks actual surface occlusion as well as joint geometry. A separate 50,400-pose regression checks that rune/gem arms never intersect through five cycle variations, work/release blends, both flourishes and reduced motion, while existing checks retain tool contact and joint continuity.

`src/ability-effects.js` draws the illustrated attack materials, projectiles and support symbols without advancing combat state. `npm run review:abilities` records twelve actual patterns and captures four-Zone comparisons and phone views. Use `-- --stills` to skip recording; FFmpeg requirements match the skilling review. `tests/ability-effects.cjs` checks 448 boss/elite warning and impact states, rendered beam hues before/after interception, disabled links, safe-region clipping, combat-clock animation, reduced motion and owner cleanup.

`npm run review:speeds` captures purchased speed controls, the compact skilling feedback and 1× / 2× / 24× work pacing. Add `-- --stills` to skip recording. Speed-control regressions exercise actual purchases, both paths in every scene, persistence, code coexistence, real production clocks, touch scrolling, keyboard use and reordered rails on phones and landscape screens.

`npm run review:progression` captures the essence reminder, recipe vouchers, vertical buffs, physical loot, Threefold Ruin and the reworked weaving loop and both flourishes. Use `-- --stills` to skip recording.

`npm run review:reflects` captures all three reflect variants, shielded spires, free speed controls, Inventory Codex, defeat navigation and stacked blessings, plus a short motion preview. Use `-- --stills` to skip recording. New regressions exercise 96 dash angles/latch combinations, edge grazes, real dash cooldowns, underfoot rune exit/return, immediate and late contacts, moving casters, remote expiry penalties, pause clocks, all ten blessings through the normal picker, save/reload and real death-to-crafting input. `tests/zone-pressure.cjs` compares stationary and moving controllers with real Zone 2 damage at ~55 DPS; it does not suppress incoming damage or claim a human playthrough.

`npm run review:workshop-update` captures unified recipes, visible tier-2 gates, fine jewelry upgrades, transmutation, compact Delving buffs, transparent blessing choices, cleaning poses and new Embervault/Crypt attacks. Add `-- --stills` to skip recording. The five new suites verify matching skill gates through real production paths, voucher type/ownership/migration, long-blessing costs and timer persistence, bump-only orphan spires, and actual 150-DPS opening encounters with normal health and damage.

`npm run review:skill-tiers` captures the Steel/Mithril outfit comparison, tier-3 work and locked recipes, promotions, training guidance and direct work controls at phone size. `npm run art:tier-three` exports the resource and work medallions. Shared XP requirements and save conversion live in `src/skill-progression.js`, tier-3 unlocks and promotion costs in `src/tier-three.js`, work partners in `src/work-navigation.js`, and the enemy health experiment in `src/encounter-health.js`. New regressions cover level/fraction retention, exact active/offline XP, matching skill and Zone gates, crafted Mithril save/reload, all six weapon ceilings, ingredient-free navigation by touch/keyboard, and exact before/after health comparisons in fifteen Zones.

`npm run review:combat-cues` captures moving Grave Pulse rims and offset Outer Ruin refuges using actual cast placement. The cue suite checks 464 warning/impact states for text labels, 80 terrain/viewport/HUD placements, actual refuge damage exclusion, blocked placement, pause behavior and a single dash through the live pulse rim. The Grave Pulse suite checks long-distance travel, actual dash timing at several frame steps, movement-buff stacks, cross-caster spacing, swept collisions, pause behavior and cleanup. Health comparisons across fifteen Zones verify the exact 2× / 6× step, unchanged calibration, damage, spawns, loot and spire health.

The three source atlases in `assets/skilling/` supply all twelve painted work settings. `npm run art:skilling-backgrounds` exports metadata-free WebP atlases; `npm run build` embeds them without external requests. `npm run review:skilling-art` captures the live scenes, checks all 31 activities at four viewport sizes, and compares weaving phases and both bonus flourishes. The spire collision suite also checks support-totem dash destruction, walking interception, reward isolation, silence, pause and text-free feedback.

`npm run art:themed-effects` exports 156 illustrated SVG props and Codex medallions. `npm run review:themed` captures all 39 selected mechanics and phone views of effects, uncommons and guardian packs. Add `-- --motion` for a short animation reel (FFmpeg required). `tests/themed-encounters.cjs` exercises actual counterplay, gaps, timers, shielding, returns, projectiles, pause/retry cleanup and reduced motion; `tests/encounter-pressure.cjs` verifies proportional damage, bounded DoTs, guardian packs, uncommon caps, ranged spacing and ordinary loot.

`src/elite-behaviors.js` controls transient elite priorities and spacing; `src/elite-task-art.js` draws their channel cues. `src/dash-counters.js` owns damage-free body stuns and accepted-counter refunds. The two regression suites cover swept/final-frame contacts, repeat contacts, walking versus dash counters, protection after refunds, task interruption/cleanup, capped promotions/summons, terrain placement and reduced-motion rendering.

`npm run art:travelling` exports seven layered SVG props in `assets/effects/travelling/`. `src/travelling-mechanics.js` shares travelling geometry and collision; `src/mechanic-presentation.js` draws crests, bank paths and interrupt marks. `npm run review:travelling` captures the focused attacks; add `-- --motion` to record their actual combat-clock animation with system FFmpeg. The travelling suite verifies persistent travel, repeated dash chains, non-refunding Hedge routes, real terrain, moving swept collisions, color rules and cleanup.
