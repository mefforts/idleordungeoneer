"""Measure the generated atlas discs; source artwork is never modified."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

root = Path(__file__).resolve().parents[1]
catalog_path = root / "assets/icons/catalog.json"
catalog = json.loads(catalog_path.read_text())
for sheet in catalog["sheets"]:
    alpha = np.asarray(Image.open(root / "assets/icons" / sheet["file"]).convert("RGBA"))[:, :, 3]
    labels, _ = ndimage.label(alpha > 128)
    counts = np.bincount(labels.ravel())
    objects = ndimage.find_objects(labels)
    boxes = []
    for label in np.flatnonzero(counts > 5000):
        if label == 0:
            continue
        y, x = objects[label - 1]
        boxes.append([x.start, y.start, x.stop - x.start, y.stop - y.start])
    width = float(np.median([b[2] for b in boxes]))
    height = float(np.median([b[3] for b in boxes]))
    regions = []
    for x, y, w, h in boxes:
        # A few opaque rims touch the next row. Divide those joined discs.
        columns = max(1, round(w / width))
        rows = max(1, round(h / height))
        for row in range(rows):
            for column in range(columns):
                regions.append([x + column * w / columns, y + row * h / rows, w / columns, h / rows])
    regions.sort(key=lambda r: r[1] + r[3] / 2)
    ordered = []
    for start in range(0, len(regions), sheet["columns"]):
        ordered.extend(sorted(regions[start:start + sheet["columns"]], key=lambda r: r[0]))
    assert len(ordered) == len(sheet["icons"]), sheet["file"]
    sheet["regions"] = ordered
    print(f"{sheet['file']}: {len(ordered)} measured medallions")
catalog_path.write_text(json.dumps(catalog, indent=2) + "\n")
