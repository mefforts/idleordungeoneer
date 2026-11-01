"""Pack nine isolated foreground work props from their original painted atlas."""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np
import base64, io, json

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'assets/workshop/source.png').convert('RGBA')
labels, _ = ndimage.label(np.asarray(source)[:, :, 3] > 128)
counts = np.bincount(labels.ravel())
counts[0] = 0
slices, slots = ndimage.find_objects(labels), {}
for label in np.argsort(counts)[-9:]:
    ys, xs = slices[label - 1]
    col = min(2, int((xs.start + xs.stop) / 2 / source.width * 3))
    row = min(2, int((ys.start + ys.stop) / 2 / source.height * 3))
    assert row * 3 + col not in slots
    slots[row * 3 + col] = [max(0, xs.start - 3), max(0, ys.start - 3), min(source.width, xs.stop + 3), min(source.height, ys.stop + 3)]
assert set(slots) == set(range(9))
art, metrics = {}, {}
for slot, key in enumerate(['iron', 'silver', 'coal', 'anvil', 'chopping', 'fletching', 'warding', 'engraving', 'jeweling']):
    box = [int(value) for value in slots[slot]]
    sprite = source.crop(box)
    sprite.thumbnail((480, 360), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    sprite.save(out, format='WEBP', quality=93, method=6)
    art[key] = {'src': 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode(), 'width': sprite.width, 'height': sprite.height}
    metrics[key] = {'source': box, 'width': sprite.width, 'height': sprite.height, 'bytes': len(out.getvalue())}
(ROOT / 'src/workshop-art.js').write_text('const WORKSHOP_ART=' + json.dumps(art, separators=(',', ':')) + ';\n')
(ROOT / 'assets/workshop/metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
print('Exported nine transparent foreground work props.')
