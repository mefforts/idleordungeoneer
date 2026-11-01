"""Export six centered navigation medallions; preserve the generated atlas."""
import base64
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
directory = ROOT / 'assets/navigation'
source = Image.open(directory / 'source.png').convert('RGBA')
rgba = np.asarray(source)
labels, _ = ndimage.label(rgba[:, :, 3] > 128)
counts = np.bincount(labels.ravel())
counts[0] = 0
slices = ndimage.find_objects(labels)
slots = {}
for label in np.argsort(counts)[-6:]:
    ys, xs = slices[label - 1]
    column = min(2, int((xs.start + xs.stop) / 2 / source.width * 3))
    row = min(1, int((ys.start + ys.stop) / 2 / source.height * 2))
    slot = row * 3 + column
    assert slot not in slots
    slots[slot] = [xs.start - 2, ys.start - 2, xs.stop + 2, ys.stop + 2]
assert set(slots) == set(range(6))
art, metrics = {}, {}
for slot, key in enumerate(['nav-delve', 'nav-inventory', 'zone-shop', 'nav-play', 'nav-pause', 'nav-speed']):
    sprite = Image.new('RGBA', (256, 256))
    sprite.paste(source.crop(slots[slot]).resize((244, 244), Image.Resampling.LANCZOS), (6, 6))
    out = io.BytesIO()
    sprite.save(out, format='WEBP', quality=94, method=6)
    art[key + '.svg'] = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
    alpha = np.asarray(sprite)[:, :, 3]
    ys, xs = np.nonzero(alpha > 128)
    metrics[key] = {'source': [int(v) for v in slots[slot]], 'bounds': [int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)], 'diameterFraction': min(int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)) / 256}
    assert metrics[key]['diameterFraction'] >= .94
art['codex-zone_shop.svg'] = art['zone-shop.svg']
(ROOT / 'src/navigation-icons.json').write_text(json.dumps(art, separators=(',', ':')) + '\n')
(directory / 'metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
print('Exported six navigation medallions at more than 94% visible diameter.')
