"""Package and verify the exact standalone build, without source or private files."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text())['version']
html = (root / 'index.html').read_bytes()
assert b'<html' in html and len(html) > 1_000_000, 'Build the standalone game first'
assert not any(key in html for key in [b'__arenaTest', b'__balanceProgress', b'__mechanicBible', b'__communication', b'__artwork', b'__materials', b'__abilityEffectsTest', b'__themedTest', b'test-expansion']), 'Response-only fixtures must not ship'
instructions = f'''Idle or Dungeoneer — v{version}

Extract the entire folder, then open index.html in a modern browser.
The game and artwork are embedded. No installation or internet connection is required.

Saves belong to the browser and origin used to play. Use Settings → Backup/Export before changing browsers, devices or play locations. Restore that backup in Settings to continue there.

Browser play: https://mefforts.github.io/idleordungeoneer/
Project and latest download: https://github.com/mefforts/idleordungeoneer
'''.encode('utf-8')
archive = root / 'downloads' / 'Idle_or_Dungeoneer_Latest.zip'
entries = {'Idle_or_Dungeoneer/index.html': html, 'Idle_or_Dungeoneer/START_HERE.txt': instructions}
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as target:
    for name, content in entries.items():
        info = zipfile.ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        target.writestr(info, content, compresslevel=9)
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None, 'Archive CRC failed'
    assert check.namelist() == list(entries), 'Unexpected archive contents'
    for name, content in entries.items():
        assert check.read(name) == content, 'Archive differs from the tested build'
print(json.dumps({'version': version, 'entries': list(entries), 'htmlSha256': hashlib.sha256(html).hexdigest(), 'zipSha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'zipBytes': archive.stat().st_size}, indent=2))
