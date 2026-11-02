# Player art and animation

The player uses an original illustrated 2D style with compact proportions, expressive eyes, bold outlines and two or three shading tones. Travel tunics, plain iron/steel armor, ranger leathers and linen/wool robes keep simple shapes. The renderer draws these shapes directly, so joint surfaces remain continuous as a limb bends.

There are **42 independent SVG parts**: six physical slots for travel clothing and each of the six existing armor sets. Eight transparent WebP work tools complete the 50-asset catalog in `assets/player/parts/`. Warding uses a weaving shuttle; Artisan uses a jeweler’s chisel. The other six tools and all existing weapon illustrations retain their artwork. Only the eight tools need image decoding at entry.

| Physical slot | Attachment | Parts |
| --- | --- | --- |
| Head | Neck and independent head joint | Face, hair, helmet or hood |
| Shoulders | Each upper-arm root | Mirrored cloth sleeves or shoulder caps |
| Chest | Torso and arm bones | Tunic, breastplate or robe, with sleeves and bracers |
| Legs | Pelvis and knee joints | Continuous trousers or robe panels |
| Boots | Each ankle | Plain leather or reinforced boot |
| Gloves | Each wrist | Relaxed hand, closed grip or weaving gesture |

A set resolves these slots together. `parts` overrides can mix them independently, for example `parts: {head: 'base', shoulders: 'melee_1'}`. Unknown overrides fall back to the worn set. Equipment ownership, recipes, statistics and saved appearance identifiers stay in the existing equipment system.

`src/avatar-rig.js` owns both the poses and vector artwork. Coordinates use a foot origin, positive Y downward, with a standing figure about 117 units high. Arm segments measure 20 / 19.5 units; leg segments measure 19 / 18. Reach constraints precede the elbow and knee solve. Kneeling preserves leg lengths and ground contact. The pelvis stays level while the torso leans. Shoulders follow the upper arms independently of the head.

Each limb has one outlined silhouette across both bones, with clipped shadows and separate sleeves, bracers, knee panels and boots. The far upper arm sits behind the torso. Its forearm moves in front when reaching across the body; the near arm remains in front. The head covers shoulder roots. Hands follow the forearm angle, with opposite thumb orientations for the near and far sides. Closed grips draw over the held shaft. The entire assembled figure mirrors when facing left.

Two-handed placement solves both shoulder reach limits while preserving a shared grip offset on the weapon or tool. Bowstring, nock and aim points share the same axis. Tool grips are calibrated to each handle, including the offset hatchet shaft. The Artisan’s free hand supports the work below the chisel.

Combat reads the existing attack timer as a countdown. Each clip starts and ends at its ready pose, with eased windup, follow-through and recovery. A charged bow carries its draw into release instead of resetting the string hand in one frame. The staff uses a forward casting-ready hand; real spell bolts continue to start at that hand socket. Movement adds a small counter-sway and foot roll. Damage, cooldowns, ammunition and production rates keep their existing rules.

Working and two-handed arms use an elbow bend that stays below raised hands. Tool arcs clear the head. Carving, rune engraving and gem cutting aim the tool tip at the real workpiece; their support hands brace its edge. Warding moves a horizontal shuttle through the weave, while scavenging plants an open palm and lifts the rake between ground strokes. The full tool footprint determines the mobile scene bounds. Solid workpieces draw behind the fingers; threads, etching glints and contact particles draw in front.

Work clips retain anticipation, strike and recovery, plus continuous carving, weaving, engraving, gem working and searching motions. Starting and stopping blend over 180 / 240 ms. The rig and work scenes share one visual-rate table. Animation is separate from production. The visual rate caps at 2.5× for readability; resource production retains the full Skilling time multiplier. Dungeoneering speed does not enter this clock. Reduced motion uses stable working poses.

Combat, all 20 skill activities, appearance previews and inventory portraits share this rig. Saved hair, eye, clothing and skin choices retain their identifiers and colors. Six hair shapes and four eye styles use the same face anchors.

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

`tests/player-rig.cjs` checks more than 5,000 poses, fixed segment lengths, exact grips, resting positions, cyclic motion, action blending, visible body connections and decoding of every exported SVG. It also checks 72 attack transitions across facings, movement and dashes, 378 rendered body connections, raised elbow direction, tool contact and complete tool bounds. Existing suites cover real attacks, ammunition, resource costs, input, saves and mobile layouts. [Outfits](preview-player-sets.png), [motion phases](preview-player-actions.png), [mining](preview-player-mining-mobile.png), [weaving](preview-player-warding.png) and a [live recording](preview-player-motion.webm) show the actual renderer.

For a motion review, run `npm run review:motion` with FFmpeg available. It exports a 24-second MP4 of movement, six weapon families and eight work families, an MP4 of the eight actual work scenes including start/release transitions, and an eight-second looping GIF. The rig reel uses the production pose functions at 1× animation speed, with combat previews triggered once per second and facing changes every four seconds. Work scenes use their real clocks and effects. Recording leaves the shipped HTML unchanged.
