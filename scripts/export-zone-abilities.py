"""Isolate the sixteen themed ability medallions from their source atlas."""
import base64
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
directory = ROOT / 'assets/zone-abilities'
source = Image.open(directory / 'source.png').convert('RGBA')
rgba = np.asarray(source)
labels, _ = ndimage.label(rgba[:, :, 3] > 128)
counts = np.bincount(labels.ravel())
counts[0] = 0
slices, slots, slot_labels = ndimage.find_objects(labels), {}, {}
for label in np.argsort(counts)[-16:]:
    ys, xs = slices[label - 1]
    column = min(3, int((xs.start + xs.stop) / 2 / source.width * 4))
    row = min(3, int((ys.start + ys.stop) / 2 / source.height * 4))
    slot = row * 4 + column
    assert slot not in slots, slot
    slots[slot] = [max(0, xs.start - 2), max(0, ys.start - 2), min(source.width, xs.stop + 2), min(source.height, ys.stop + 2)]
    slot_labels[slot] = int(label)
assert set(slots) == set(range(16))
keys = [['fire', 'frost', 'cleave', 'ward'], ['fire', 'nova', 'pierce', 'ward'], ['storm', 'frost', 'nova', 'ward'], ['storm', 'multishot', 'cleave', 'ward']]
art, metrics = {}, {}
for zone, abilities in enumerate(keys):
    for column, ability in enumerate(abilities):
        box = [int(v) for v in slots[zone * 4 + column]]
        mask = ndimage.binary_dilation(labels == slot_labels[zone * 4 + column], iterations=2)
        pixels = rgba[box[1]:box[3], box[0]:box[2]].copy()
        pixels[:, :, 3] = np.where(mask[box[1]:box[3], box[0]:box[2]], pixels[:, :, 3], 0)
        sprite = Image.new('RGBA', (256, 256))
        sprite.paste(Image.fromarray(pixels).resize((244, 244), Image.Resampling.LANCZOS), (6, 6))
        out = io.BytesIO()
        sprite.save(out, format='WEBP', quality=94, method=6)
        uri = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
        key = f'zone-ability-{zone}-{ability}'
        art[key + '.svg'] = uri
        art[f'codex-zone_ability_{zone}_{ability}.svg'] = uri
        metrics[key] = {'source': box, 'bytes': len(out.getvalue()), 'size': 256}
(ROOT / 'src/zone-ability-icons.json').write_text(json.dumps(art, separators=(',', ':')) + '\n')
(directory / 'metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
print('Exported sixteen unique Zone ability medallions and their Codex bindings.')
