"""Encode the three painted 2×2 skilling atlases without image metadata."""
from pathlib import Path
from PIL import Image

DIRECTORY = Path(__file__).resolve().parents[1] / 'assets/skilling'
for name in ['outdoor', 'workshops', 'advanced']:
    source = Image.open(DIRECTORY / (name + '.png')).convert('RGB')
    assert source.size == (1536, 1024), (name, source.size)
    clean = Image.new('RGB', source.size)
    clean.paste(source)
    target = DIRECTORY / (name + '.webp')
    clean.save(target, format='WEBP', quality=94, method=6)
    print(f'{name}: four 768×512 backgrounds, {target.stat().st_size:,} bytes')
