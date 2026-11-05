# Selected encounter mechanics

The 39 selected mechanics below are implemented. Original proposal numbers remain stable; the in-game Codex provides current counterplay. Combat uses illustrated objects, trajectories, openings and timer arcs, with brief fading reminders.

Red hurts the player; violet also hurts monsters; teal marks protected openings or benefits; gold marks reflects; yellow brackets mark interruptible targets; blue marks shields. Released independent hazards outlive their caster, while living channels and effects bound to a living pair stop with their source. Support totems can retarget living allies.

Rally Thread, Orbit Transfer and Briar Leash use separated pairs/anchors with a clear crossing. Linked enemies preserve that space while their mechanic is active. Warband Resolve makes groups tougher together; stunned enemies lose the protection and stop providing it. Elites, rares and Echoes can pursue Ascendance, Rare Awakening, Living Conduit or Siege Channel instead of clumping around the player.

Walking Hedge sends persistent trains with offset openings and no dash refund. Grave Pulse opens at 240 units/second, 25% below the follow-up target; later rings keep a dashable gap and each completed crossing refunds dash. Rolling Furnace uses repeated, splitting and crossing bankshots. Travelling threats retire after passing the encounter rather than timing out. [Current timings, damage and validation](BALANCE.md).

| Idea # | Mechanic | Theme | Counterplay |
| --- | --- | --- | --- |
| 1 | Burrowing Briar | Overgrowth | Move after the root stops tracking |
| 2 | Root Gates | Overgrowth | Cross the two offset openings |
| 3 | Walking Hedge | Overgrowth | Cross the staggered teal openings; walls keep travelling and do not refund dash |
| 4 | Seed Chain | Overgrowth | Read the next swelling seed |
| 5 | Briar Leash | Overgrowth | Dash across the tether to cut it |
| 6 | Spore Fan | Overgrowth | Step between spores and their clouds |
| 7 | Pollen Tide | Overgrowth | Move sideways through the debris |
| 8 | Clinging Seeds | Overgrowth | A dash shakes off attached seeds |
| 9 | Grafted Swap | Overgrowth | Both root portals preview the swap |
| 10 | Falling Canopy | Overgrowth | Leave each falling branch shadow |
| 11 | Rolling Furnace | Embervault | Read the bank and fork paths of repeated, splitting or crossing rollers |
| 12 | Forge Hammers | Embervault | The raised hammer strikes next |
| 13 | Furnace Vents | Embervault | Follow the grates lighting in order |
| 14 | Cooling Islands | Embervault | Move to the next cooling island |
| 16 | Cinder Stitch | Embervault | Cross before the stitched trail ignites |
| 17 | Molten Droplets | Embervault | Splash marks include the smaller bursts |
| 18 | Slag Anchors | Embervault | Dash through an anchor to tear the fire curtain |
| 19 | Backdraft | Embervault | Your older footprints ignite first |
| 20 | Ember Catch | Embervault | Touch the gold ember to return a violet blast |
| 21 | Bone Loom | Hollow Crypt | Thread the wide corridor between the ribs |
| 22 | Soul Lantern | Hollow Crypt | Intercept healing souls or dash through the lantern |
| 23 | Coffin Press | Hollow Crypt | Leave through the open ends |
| 24 | Haunted Footsteps | Hollow Crypt | The ghost repeats the marked route |
| 25 | Grave Clock | Hollow Crypt | Use the broken hand; it reverses after a pause |
| 27 | Returning Sigil | Hollow Crypt | Touch each gold rune before its arc runs out |
| 28 | Ribcage Rise | Hollow Crypt | Leave through the opening before the ribs collapse |
| 29 | Hollow Chorus | Hollow Crypt | Raised lanterns show the order of the waves |
| 30 | Borrowed Breath | Hollow Crypt | Visit a teal stone before the curse closes |
| 31 | Astral Slingshot | Astral Rift | Shots curve around the lens |
| 32 | Gravity Well | Astral Rift | Escape the pull before its burst |
| 33 | Orbit Transfer | Astral Rift | Watch the bridge and the blade’s next owner |
| 34 | Stargate Volley | Astral Rift | The second portal previews the exit direction |
| 35 | Constellation Cage | Astral Rift | Leave the outlined triangle before it connects |
| 36 | Rift Scissors | Astral Rift | Use the openings beyond the crescent tips |
| 37 | Collapsing Nova | Astral Rift | Counter the gold rune or cross the delayed pulse |
| 39 | Prism Relay | Astral Rift | Read the beam’s route through both crystals |
| 40 | Comet Ladder | Astral Rift | Zigzag between alternating comet lanes |
| 41 | Turning Bulwark | All themes | Circle behind the rotating front shield |
| 46 | Rally Thread | All themes | Dash across the enemy buff thread |

Build 11.8.1 makes Walking Hedge the Zone 1 Floor 5 overlord’s opening move and repeats it between every other normal-rotation attack. His other themed and legacy attacks remain; threshold attacks retain their existing queue and major hazards keep their shared budget.

The two encounters between monster waves contain a lead guardian and escorts: four enemies early in a Zone, five in the middle and six deeper down. The floor boss remains a separate encounter. Defeating the lead does not clear surviving escorts. Ordinary monster waves keep their existing counts.

Uncommon creatures replace about 7% of eligible ordinary spawns, after the opening enemies. They have 2× ordinary health and repeat one ranged move. Their simultaneous cap is 1 / 2 / 3 / 4 by Zone, capped at four. They keep ordinary loot, do not occupy rare slots and cannot appear as summons or guardian escorts.

Elite, rare and boss damage uses maximum-health fractions. Base projectiles start at 10%; heavy marked hits reach 25%, with the clearest major failures reaching 50%. Failed reflects cost 15%. Protection applies. Uncommons use lighter 6% shots, 8% marks or 10% charges. Fire and similar persistent hazards use small ticks, typically 2–3.5% every 0.35 combat seconds, with a shared 5%-per-interval base cap across overlapping DoTs. Dashes protect through these ticks.

The 116 effect props and 40 Codex medallions are authored SVG assets in `assets/effects/`, exported by `npm run art:themed-effects` and embedded into the standalone build. Motion uses the combat clock. Essential hazard movement persists with reduced motion; decorative bobbing, spinning and flicker stop. Warning and active collision use the same geometric definitions.

Each Grave Pulse ring keeps expanding; later sequences require the refund from each completed crossing to dash through the next ring. The first warning allows the normal recharge; new major mechanics cannot overlap each other or the large legacy arena attacks. Counters and props are transient: pause, defeat, retry, travel and caster cleanup cannot leave an invisible attack, buff or stuck encounter behind.

[Fifty new theme-neutral variations](THEME_NEUTRAL_IDEAS.md) are proposals only. Unselected original ideas are not added to live rotations.

Validation covers 51 browser suites. Controlled combat tests cover all 39 selected mechanics, 156 themed effect assets, seven travelling-attack props, three additional Codex medallions, proportional damage, capped DoTs, pack completion, uncommon spawn limits, real-terrain phone/landscape placements, timed/swept counters and transient-state cleanup. The encounter-tuning suite adds Resolve stacking and stun windows, actual terrain-crossing dashes, minimum link separation, larger attack boundaries and both siphon variants. Full invulnerable combat benchmarks clear Zones 1–4 and later reference Zones; three-seed 150-DPS pressure comparisons use real health, damage and loot. These automated controllers are not human playtests. Exact results and limits are in [BALANCE.md](BALANCE.md).
