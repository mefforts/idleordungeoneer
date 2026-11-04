# Painted skilling backgrounds

Each 1536×1024 source atlas contains four equal 768×512 scenes, read left to right, top to bottom.

| Atlas | Top left | Top right | Bottom left | Bottom right |
| --- | --- | --- | --- | --- |
| outdoor | Oak woodland | Iron mine | Smithing forge | Overgrown ruins |
| workshops | Fletcher | Weaver | Rune engraver | Jeweler |
| advanced | Coal mine | Willow grove | Ancient dig | Garnet cave |

Keep the lower foreground clear for the animated character and its work prop. Arrows need continuous wooden shafts, small triangular heads and feather tails; bows need visible strings joining their tips. Tools have separate recognizable heads and handles. Loom threads, furniture and architectural supports should form coherent structures. These backgrounds contain no characters or hands; the shared avatar rig supplies them.

Run `npm run art:skilling-backgrounds` to encode the metadata-free WebP atlases, then `npm run build` to embed them in the standalone game. The build retains the existing scene and tier mappings. `npm run review:skilling-art` captures actual rendered scenes, mobile views and weaving grips.

The v11.6.2 backgrounds remain available in Git history.
