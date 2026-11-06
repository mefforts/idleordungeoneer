# Combat mechanics bible

This is the design contract for current and future dungeons. Build 11.17.0 applies its first shared runtime pass. Exact tunable values live in `combat.mechanics` in [src/balance-config.json](src/balance-config.json); [src/mechanic-contracts.js](src/mechanic-contracts.js) enforces encounter pressure, recovery and tactical rewards. Individual modules own geometry and theme. [SELECTED_MECHANICS.md](SELECTED_MECHANICS.md) lists the implemented abilities.

## The experience

An elite should pose a memorable problem: recognize its intention, choose an answer, execute it, feel the result and reposition. At 1× Delving and intended equipment DPS, the player must have time to read that problem. Difficulty comes from commitments, positioning, priorities and optional opportunities. Increasing the Zone should develop the problem before simply increasing its frequency.

Enemies have stable themed repertoires. Variants may change order, direction, route or interaction, with the changed detail visible before commitment. A surprise is a recognizable variation, never an unannounced rule change. Large HP pools must not produce a permanently saturated arena.

## Color is a promise

| Signal | Player interpretation | Required supporting shape |
| --- | --- | --- |
| **Red** | Dangerous to me. A direct hit should hurt; lingering exposure should demand movement. | A visible footprint, projectile or moving front; a countdown or buildup before commitment. |
| **Purple** | Dangerous to me and monsters. I can reposition enemies to exploit it. | A physical attack and purple boundary/trail, using the same collision geometry for both sides. |
| **Yellow** | I can interrupt or claim this. Taking the opportunity is optional and can be very rewarding. | Broken brackets on the actual target/cut point, with remaining time where needed. |
| **Teal** | A protected opening for this attack, a beneficial interaction or confirmed successful counter. | An actual open route, inward chevrons, beneficial symbol or brief success flash. |
| **Gold/white** | A reflect rune with a deadline. Enter correctly to counter it. | A mirror/rune symbol and timer; red jaws and a teal opening if the approach is hazardous. |
| **Blue** | Protection supplied by a source or guards. | A shield icon, link or guard relationship. |

Color must agree during warning, activity, impact and aftermath. Theme materials may be bone, foliage, flame or crystal, but must not replace the semantic boundary. A purple-looking hostile ghost still needs a red danger outline when it cannot hit enemies. Never label an opening with the word prohibited by AGENTS.md; teal and geometry carry that meaning.

Yellow is an overlay on an opportunity, not a promise that an enemy is harmless. An interruptible charge has a purple damage lane and yellow brackets on its caster. A siphon has a red draining chain and a yellow cut point. Support streams retain green crosses, red swords and blue chevrons as **payload symbols**, not damaging floor areas; a red sword stream does not deal contact damage.

Gold reflect deadlines remain punishable at 15% base maximum health before defenses. This is distinct from an optional yellow pickup. Ember Catch is yellow: catch it for a purple return with a teal protected catch core, or leave its red local explosion. It must not deal unavoidable map-wide damage for declining.

Actual renderer examples: [optional Ember Catch](preview-mechanic-ember-mobile.png) · [interruptible charge](preview-mechanic-charge-mobile.png).

## Every ability has a complete lifecycle

1. **Intention:** a recognizable creature/prop/pose shows what is coming.
2. **Warning:** show the real footprint, target lock, route, order, opening and any counter point. Avoid repeated sentences over the battlefield.
3. **Commitment:** aim stays locked unless tracking was explicitly shown. Burrowing Briar visibly settles before striking. Do not move a damaging footprint without updating its visible effect.
4. **Activity:** make the danger physical. Flames burn, roots grow, blades travel, chains connect. Decorative particles cannot imply a larger hitbox.
5. **Resolution:** show the hit, missed opportunity or successful solve. Give the player a brief opportunity to exploit an interrupted or staggered enemy.
6. **Recovery:** allow repositioning and damage before the next demand.
7. **Cleanup:** retire according to the mechanic's own rule, then clear all transient state on defeat/retry/new floor.

A released attack belongs to the encounter. Killing its caster does not erase it or remove it from the pressure budget. Living channels and effects tied to a living pair stop with their source. Persistent travelling fronts retire after passing the player, enemies and viewport; they never vanish because a hidden timer ran out. Support totems retain their separate persistence rules.

## Timing and encounter composition

All values below are **combat seconds at 1× Delving**. Slower/faster Delving scales them together with movement, dash and damage clocks. Menus, pause and skilling freeze them.

| Rule | Current shared value |
| --- | --- |
| Ordinary offensive warning floor | 1.5 seconds |
| Large arena warning floor | 1.8 seconds, with longer travel allowances where needed |
| Elite recovery after a cast | 4.2 seconds |
| Full boss recovery | 3.4 seconds; 2.9 in final phase |
| Uncommon recovery | 4.5 seconds |
| Recovery after an exclusive mechanic ends | 1.25 seconds |
| Recovery from new offensive casts after a successful dash counter | 0.8 seconds |
| Simultaneous offensive groups | At most two; an exclusive mechanic reserves the encounter |

The budget counts casts, charges, pending siege strikes, themed events, released wards, queued bursts, ground hazards and relevant projectiles. A projectile spread is **one group**, not one group per projectile. Group identity survives the warning-to-release transition and caster death. Shots that have already passed the encounter and travel away need not block the next local attack. Existing terrain/hazard/dash-readiness checks remain in force. A waiting exclusive mechanic can reserve the next opportunity for up to ten combat seconds, allowing current projectiles to drain instead of being continually replaced. Interrupting/killing its caster, failed placement, expiry or encounter cleanup releases the reservation.

Large arena attacks, Grave Pulse, reflects, siphons and themed mechanics are exclusive. They must not be combined with another demand that removes their answer. Optional elite tasks may coexist; Siege Channel waits for an offensive slot before warning its next strike. Support totems/guards have separate existing hard caps. A counter's recovery does not erase attacks already released.

No new mechanic may assume a fresh dash while another unavoidable dash demand has consumed it. A repeat that needs dash sooner than normal recharge must refund a **completed** crossing. A repeat with a walking opening may retain cooldown only if its next opening can be reached at ordinary movement speed. Reachable routes must fit the full chest-to-feet hurtbox and respect terrain, screen orientation and HUD placement.

Changing a cooldown is not enough to demonstrate fairness. Review long fights, four-plus elite packs, ranged uncommon pressure, persistent orphaned hazards, low DPS and higher Delving speeds. Ensure progress resumes after each demand rather than silently deadlocking a cast queue.

## Dash is an engagement tool

Dash has movement and protection, plus a precisely checked swept path. A normal dash through a special enemy briefly staggers it without damage. It also disables receiving/granting Warband Resolve for ten combat seconds. That body interaction keeps its normal cooldown.

A successful mechanic counter refunds dash once for the current dash serial: reflect, accepted spire impact, support-totem destruction, task/charge interrupt, tether/thread/anchor cut, seed cleanse or completed Grave Pulse crossing. A mere graze, near miss, ordinary body stagger or walking counter does not refund. Walking Hedge and Rolling Furnace dodges keep cooldown because their patterns provide navigable alternatives.

The final movement frame counts. A refund changes cooldown; it does not extend active dash time or invulnerability. Repeated contact with the same solved object cannot farm additional rewards. A crowned spire still needs two distinct accepted impacts.

Yellow brackets on charge windups identify a real early interrupt: dash through the caster to stop the windup and refund dash. Ordinary offensive windups without brackets retain their normal body-stagger behavior.

## Purple creates tactical depth

Purple attacks damage player and monsters. An emitted attack can hit its caster after first clearing the launch footprint; its release socket does not automatically injure the caster. A remotely placed eruption, seed, falling branch, droplet, backdraft trail or gravity collapse can hit its caster directly: baiting that enemy into its marked ground is a valid tactic. This enables baiting a returning or banked attack back into its source without rewarding an enemy for simply casting.

Per attack, ordinary enemies take 35%, elite enemies 14% and full bosses 4% maximum health before shields/Resolve. A shared hit set prevents multi-particle or lingering attacks from multiplying that damage. Special enemies also stagger for 0.55 seconds, with three combat seconds before another purple stagger can extend the control. This temporarily removes their shared protection and can interrupt a task. It does not replace dash's ten-second Resolve reward.

Friendly damage grants no player lifesteal, enchantment or weapon procs. It cannot create a self-sustaining damage/control loop. Increasing a mechanic's duration must not multiply its friendly damage simply because it rendered more frames. Standard eruptions and beams hit the player once per impact as well; their visual aftermath must not repeat the full burst after hit immunity expires. Fire and siphons keep their explicit bounded damage ticks.

## Identity, variants and meaningful stakes

- Keep each family recognizable through its props, characteristic movement and core answer. A summoner sets up a persistent problem; a channeler creates an interruption priority; a charger commits to a route.
- Let variants change decisions. Current examples include three reflect approaches, furnace trains/splits/crossing bankshots, hedge orientations/openings, siphon escape/cut-point variants, alternating seed chains, hammer leads and marching-lane orders.
- Cycle variants per successful use of that ability. Failed placement or a busy encounter must not consume a variant. Unrelated casts must not trap the ability permanently in one variant.
- Preview the next sequence with swelling props, timer arcs, trajectories and pips. Full randomization of untelegraphed timing is not depth.
- Preserve severe direct-hit consequences. The existing special-enemy floor is 12.5% maximum health before defenses; large mistakes can reach 25–50%. Independent mistakes can stack. DoTs use small bounded ticks and end when the player leaves the footprint.
- Channels worth travelling toward last long enough to reach: Ascendance 12 seconds, Rare Awakening 14 seconds; Conduit/Siege persist until interrupted. Their effects and summons retain hard caps.

## Future dash upgrade choices — design only

These are planned alternatives, not purchases introduced by this release. Keep the base dash and mechanic solves intact. A future choice should change how the player engages rather than become required to solve a dungeon.

| Choice | Intended play | Constraints |
| --- | --- | --- |
| **Impact Burst** | Deal a bounded burst along the dash path or at its end; reward entering a cluster. | One hit per enemy per dash. Cannot pay for its own refund or replace mandatory physical spire impacts. |
| **Departure Pool** | Leave a short damaging pool where the dash began; bait pursuers and commit to a route. | Explicit duration/active-pool cap; one placement per dash serial. Refunded dashes cannot fill the arena indefinitely. |
| **Return Arc** | A successful counter sends a limited arc toward the solved source. | Trigger on an accepted counter, once per serial; no recursive procs or lifesteal loop. |
| **Momentum** | A successful solve grants brief movement control or a wider landing choice. | No extra immunity, altered warning clocks or requirement to equip it for a reachable opening. |

Player-created damage uses the equipped style's palette. Use purple only if that effect can also hurt the player; its artwork must not disguise red attacks or fill teal openings.

Use explicit dash-start, swept-contact, accepted-counter and dash-end events when implementing these later. Keep movement, defense, counter reward and optional damage independently tunable. Pure body staggers must not become unlimited dash batteries.

## Required validation for future changes

Every new ability/variant needs a contract, readable damage/counter geometry, legal placement, a full lifecycle and a budget identity. Reject unknown contracts and invalid tuning at build time. Add meaningful behavioral coverage for the actual risk:

- sustained exposure, intended avoidance and a near miss;
- successful/wrong/late counter, including swept final dash frames;
- repeated use without infinite damage, control, refunds or entity accumulation;
- caster death during warning, activity and aftermath;
- overlap with existing released threats, recovery and eventual resumption;
- pause/skilling/Delving speeds, defeat/retry/floor cleanup;
- phone, narrow phone, landscape, desktop, real terrain and reduced motion.

`tests/mechanic-bible.cjs` checks the shared contracts and encounter rules. Existing themed, travelling, dash, hitbox, pressure and rendering suites test the detailed behaviors. Pacing simulations disable incoming damage and are not a substitute for survival or real-device review.
