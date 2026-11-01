"""Export a world healing mote and its distinct illustrated Codex medallion."""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np
import base64, io, json

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'assets/restoration/source.png').convert('RGBA')
labels, _ = ndimage.label(np.asarray(source)[:, :, 3] > 128)
counts = np.bincount(labels.ravel()); counts[0] = 0
parts = ndimage.find_objects(labels)
largest = sorted(np.argsort(counts)[-2:], key=lambda label: parts[label - 1][1].start)
art, metrics = {}, {}
for label, key in zip(largest, ['health-drop', 'codex-health_pickup']):
    ys, xs = parts[label - 1]
    box = [max(0, xs.start - 2), max(0, ys.start - 2), min(source.width, xs.stop + 2), min(source.height, ys.stop + 2)]
    sprite = source.crop(box)
    sprite.thumbnail((180, 180), Image.Resampling.LANCZOS)
    packed = Image.new('RGBA', (192, 192))
    packed.alpha_composite(sprite, ((192 - sprite.width) // 2, (192 - sprite.height) // 2))
    out = io.BytesIO(); packed.save(out, 'WEBP', quality=94, method=6)
    art[key + '.svg'] = 'data:image/webp;base64,' + base64.b64encode(out.getvalue()).decode()
    metrics[key] = {'source': [int(value) for value in box], 'bytes': len(out.getvalue())}
(ROOT / 'src/restoration-art.json').write_text(json.dumps(art, separators=(',', ':')) + '\n')
(ROOT / 'assets/restoration/metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
print('Exported healing mote and Codex medallion.')
