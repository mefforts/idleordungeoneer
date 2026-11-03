# Player art and animation

The player uses an original illustrated 2D style with compact proportions, expressive eyes, bold outlines and two or three shading tones. Travel tunics, plain iron/steel armor, ranger leathers and linen/wool robes keep simple shapes. The renderer draws these shapes directly, so joint surfaces remain continuous as a limb bends.

There are **60 independent SVG parts**: six physical slots for travel clothing and each of the nine armor sets. Eight transparent WebP work tools complete the 68-asset catalog in `assets/player/parts/`. Warding uses a weaving shuttle; Artisan uses a jeweler’s chisel. The other six tools and all existing weapon illustrations retain their artwork. Only the eight tools need image decoding at entry.

| Physical slot | Attachment | Parts |
| --- | --- | --- |
| Head | Neck and independent head joint | Face, hair, plumed helm, ranger cap or wizard hat |
| Shoulders | Each upper-arm root | Mirrored cloth sleeves or shoulder caps |
| Chest | Torso and arm bones | Tunic, breastplate or robe, with sleeves and bracers |
| Legs | Pelvis and knee joints | Continuous trousers or robe panels |
| Boots | Each ankle | Plain leather or reinforced boot |
| Gloves | Each wrist | Relaxed hand, closed grip or weaving gesture |

A set resolves these slots together. `parts` overrides can mix them independently, for example `parts: {head: 'base', shoulders: 'melee_1'}`. Unknown overrides fall back to the worn set. Equipment ownership, recipes, statistics and saved appearance identifiers stay in the existing equipment system.

`src/avatar-rig.js` owns both the poses and vector artwork. Coordinates use a foot origin, positive Y downward, with a standing figure about 117 units high. Arm segments measure 20 / 19.5 units; leg segments measure 19 / 18. Reach constraints precede the elbow and knee solve. Kneeling preserves leg lengths and ground contact. The pelvis stays level while the torso leans. Shoulders follow the upper arms independently of the head.

Each limb has one outlined silhouette across both bones, with clipped shadows and separate sleeves, bracers, knee panels and boots. A resting far arm sits behind the torso. During work or a reach across the body, the entire far arm draws in front of the shirt and beneath the near arm, preserving its shoulder, sleeve, elbow and wrist as one continuous shape. The renderer never clips a duplicate arm at the elbow: that exposed jagged upper-arm fragments and made forearms look detached. The head covers shoulder roots. During work, the tool and supporting hand draw after the far arm, followed by the near arm and its hand. This keeps the supporting palm behind a crossing near forearm while both hands cover the shaft they grip. Hands follow the forearm angle, with opposite thumb orientations for the near and far sides. Supporting grips fit within the actual remaining handle length, including bonus flourishes. The entire assembled figure mirrors when facing left.

Two-handed placement solves both shoulder reach limits while preserving a shared grip offset on the weapon or tool. Bowstring, nock and aim points share the same axis. Tool grips are calibrated to each handle, including the offset hatchet shaft. The Artisan’s free hand supports the work below the chisel.

Combat reads the existing attack timer as a countdown. Each clip starts and ends at its ready pose, with eased windup, follow-through and recovery. A charged bow carries its draw into release instead of resetting the string hand in one frame. The staff uses a forward casting-ready hand; real spell bolts continue to start at that hand socket. Movement adds a small counter-sway and foot roll. Damage, cooldowns, ammunition and production rates keep their existing rules.

Working and two-handed arms use an elbow bend that stays below raised hands. Tool arcs clear the head. Carving, rune engraving and gem cutting aim the tool tip at the real workpiece; their support hands brace its edge. Warding pins the left selvage with the supporting hand while the shuttle works along the right edge. Both bonus clips preserve these separate hand lanes: one lifts the finished weave and the other stretches it taut. The wider cloth draws in front of the torso and behind the arms and fingers, while scavenging plants an open palm and lifts the rake between ground strokes. The full tool footprint determines the mobile scene bounds. Solid workpieces draw behind the fingers; threads, etching glints and contact particles draw in front.

Mining, smithing and chopping now use distinct anticipation/impact/recovery timing with small variations between cycles. Variations ease to zero at the loop seam; hands still resolve through the same fixed-length joints and calibrated tool grips. Sparks and chips burst on contact instead of streaming throughout a strike. Two bonus-collection clips per family add finishing strokes, a shuttle flourish, inspection of an engraved rune or cut gem, or a lifted scavenging find. A brief rarity-coloured capture trail follows the pickup into the work, while reduced motion suppresses flourishes and moving particles.

Work clips retain anticipation, strike and recovery, plus continuous carving, weaving, engraving, gem working and searching motions. Starting and stopping blend over 180 / 240 ms. The rig and work scenes share one visual-rate table. Animation is separate from production. The visual rate caps at 2.5× for readability; resource production retains the full Skilling time multiplier. Dungeoneering speed does not enter this clock. Reduced motion uses stable working poses.

Combat, all 31 skill activities, appearance previews and inventory portraits share this rig. Saved hair, eye, clothing and skin choices retain their identifiers and colors. Six hair shapes and four eye styles use the same face anchors.

To rebuild assets and matching portraits:

```sh
npm run art:player
npm run build
npm run art:player-icons
npm run build
npm test
npm run review:player
```

`scripts/export-player-parts.cjs` records the live `drawPart` API to SVG, keeping exported parts and runtime art in agreement. `scripts/export-player.py` isolates the tools from their transparent source sheets. Catalogs, SVG metrics and tool crop metrics are stored beside the assets. Runtime tool data is embedded in `src/player-art.js`; vector body art stays in the rig.

`tests/player-rig.cjs` checks more than 5,000 poses, fixed segment lengths, exact grips, resting positions, cyclic motion, action blending, visible body connections and decoding of every exported SVG. It also checks 72 attack transitions across facings, movement and dashes, 378 rendered body connections, raised elbow direction, tool contact and complete tool bounds. Another 4,608 pixel probes check visible upper-arm coverage below the sleeves across all eight work loops, 48 phases, both facings and phone/close-up scales. These catch the old detached-arm appearance that bone lengths and whole-character alpha connectivity missed. Existing suites cover real attacks, ammunition, resource costs, input, saves and mobile layouts. [Outfits](preview-player-sets.png), [motion phases](preview-player-actions.png), [mining](preview-player-mining-mobile.png), [phone weaving](preview-player-warding-mobile.png) and a [live recording](preview-player-motion.webm) show the actual renderer.

For a motion review, run `npm run review:motion` with FFmpeg available. It exports a 24-second MP4 of movement, six weapon families and eight work families, an MP4 of the eight actual work scenes including start/release transitions, and an eight-second looping GIF. The rig reel uses the production pose functions at 1× animation speed, with combat previews triggered once per second and facing changes every four seconds. Work loops show travel clothes first and armor in the second facing. The scene reel includes mining and warding in travel clothes to keep exposed arm connections visible. Work scenes use their real clocks and effects. Recording leaves the shipped HTML unchanged.

`npm run review:skilling` captures the current work loops and bonus collection in actual scenes, plus a comparative sheet of both collection clips. `tests/skilling-bonuses.cjs` checks 38,720 collection poses for smooth hand motion, fixed bones and two-handed grips, alongside production, timing, touch and persistence regressions.

The rig suite uses labelled render surfaces in isolated test responses to inspect 640 work/bonus crossing poses across both facings and all four material families. It checks visible arm/hand ownership at intersections, grips over the tool shaft and grip positions within the handle; these diagnostics never enter the standalone game.

The progression suite samples 50,400 weaving/casting poses across both bonuses, release blends, outfits, facings and reduced motion, checking fixed bone lengths and zero arm-segment crossings.

Mithril, Blue Ranged Leathers and Green Runewoven Robes retain the Steel-tier silhouettes and attachment points. Their main change is palette; a centered inset buckle and fine shoulder edging add small finishing details. Mithril weapon illustrations use the existing third row of the weapon atlas. The same renderer exports all 60 body parts and matching portraits.
