# Player art and animation

The player uses 88 transparent painted textures: 14 base-body/hand parts, six hairstyles, 60 armor parts across the six existing sets, and eight work tools. Original source sheets, individual WebP sprites, isolation metrics and measured limb axes live in `assets/player/`. Runtime textures are embedded in `src/player-art.js`.

| Physical slot | Attachment | Parts |
| --- | --- | --- |
| Head | Neck and independent head joint | Face, hair, helmet or hood |
| Shoulders | Each upper-arm root | Mirrored shoulder caps |
| Chest | Torso | Chest, upper sleeves, forearm sleeves |
| Legs | Pelvis and knee joints | Separate thigh and shin panels |
| Boots | Each ankle | Boot |
| Gloves | Each wrist | Relaxed hand or closed grip; base hands also have a weaving gesture |

A set resolves these slots together. The renderer also accepts `parts` overrides for future equipment combinations, for example `parts: {head: 'base', shoulders: 'melee_1'}`. It validates the corresponding textures before using an override. Equipment ownership, recipes and combat statistics remain in the existing equipment system.

`src/avatar-rig.js` is a stateless pose and rendering module. Coordinates use a foot origin, positive Y downward, with a standing character about 100 units high. Arm segments measure 20 / 19.5 units; leg segments measure 19 / 18. Targets are constrained to reach before solving elbows and knees. Kneeling preserves both leg lengths and ground contact. The pelvis stays level while the torso leans. Head rotation is independent of the shoulder roots.

Two-handed placement solves both shoulder reach limits while preserving a shared grip offset on the weapon or tool. Bowstring, nock and aim points share the same axis. Hands follow the forearm orientation; closed grip sprites render over the held shaft. Tool grip positions are calibrated to each handle, including the offset hatchet shaft.

Each limb texture has two measured bind points and a material width. `scripts/measure-player-binds.py` measures its painted axis without changing the source pixels. The renderer aligns that axis to the bone and overlaps the material at joints. It excludes the item illustration's hollow end caps from the joint surface. Full-outfit silhouettes are never used as limb textures.

Work clips provide anticipation, strike and recovery, or continuous carving, weaving, engraving, filing and searching motions. Starting and stopping work blend over 180 / 240 ms. Animation is separate from the production cycle. The visual rate caps at 2.5× for readability at high testing speeds; resource production retains the full Skilling time multiplier. Dungeoneering speed does not enter this clock. Reduced motion uses stable working poses.

The same rig renders combat, all 20 skill activities, appearance previews and inventory portraits. Saved hair, eye, clothing and skin choices retain their identifiers and colors. Base clothing variants use their own layered details; armor replaces the relevant physical parts.

To rebuild assets and matching portraits:

```sh
npm run art:player
npm run build
npm run art:player-icons
npm run build
npm test
npm run review:player
```

`tests/player-rig.cjs` checks more than 5,000 poses, fixed segment lengths, exact grips, rest positions, cyclic motion, action blending and visible head/body connections. Existing suites cover real attacks, ammunition, resource costs, input, saves and mobile layouts. [Outfits](preview-player-sets.png), [motion phases](preview-player-actions.png), [mining](preview-player-mining-mobile.png), [weaving](preview-player-warding.png) and a [live animation recording](preview-player-motion.webm) show the actual renderer.
