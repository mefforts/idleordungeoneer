"""Author the travelling attacks as layered, self-contained vector props."""
from pathlib import Path
import base64
import json
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/effects/travelling'
OUT.mkdir(parents=True, exist_ok=True)
DEFS = '''<defs>
<linearGradient id="iron" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#8f9294"/><stop offset=".38" stop-color="#4d535c"/><stop offset="1" stop-color="#222735"/></linearGradient>
<radialGradient id="heat" cx=".35" cy=".32"><stop stop-color="#fff5b1"/><stop offset=".38" stop-color="#ffc75d"/><stop offset=".72" stop-color="#f47e35"/><stop offset="1" stop-color="#9d382a"/></radialGradient>
<linearGradient id="wood" x2=".35" y2="1"><stop stop-color="#b49162"/><stop offset=".45" stop-color="#766044"/><stop offset="1" stop-color="#3d3a2c"/></linearGradient>
<linearGradient id="leaf" x2=".6" y2="1"><stop stop-color="#a4b86a"/><stop offset=".4" stop-color="#627f40"/><stop offset="1" stop-color="#304d31"/></linearGradient>
<linearGradient id="bone" x2=".6" y2="1"><stop stop-color="#fff4d7"/><stop offset=".45" stop-color="#d8cbaa"/><stop offset="1" stop-color="#8d8494"/></linearGradient>
</defs>'''

hedge = '''<path d="M-63 10Q-43-10-24 5T16-3T63 4M-64-7Q-37 13-15-8T27 6T63-8" fill="none" stroke="#233027" stroke-width="17" stroke-linecap="round"/>
<path d="M-63 10Q-43-10-24 5T16-3T63 4M-64-7Q-37 13-15-8T27 6T63-8" fill="none" stroke="url(#wood)" stroke-width="12" stroke-linecap="round"/>
<path d="M-58 7Q-43-5-26 8M-14-6Q4-16 20 4M30 7Q45-6 58-4" fill="none" stroke="#d4ba84" stroke-width="2"/>
<path d="M-45 0L-57-29L-39-16M-21-5L-20-34L-9-13M6 1L17-31L18-10M34 0L53-26L47-5M-35 8L-43 30L-25 17M20 9L31 32L30 11" fill="#beaa79" stroke="#283829" stroke-width="2.5"/>'''
for x, y, angle in [(-49,-10,-25),(-28,10,30),(-8,-15,-18),(15,12,25),(39,-12,-35),(53,12,25)]:
    hedge += f'<g transform="translate({x} {y}) rotate({angle})"><path d="M-16 0Q-7-21 13-13Q15 2-4 7Z" fill="url(#leaf)" stroke="#283d2b" stroke-width="2"/><path d="M-13 1L10-11M-5-3L-7-12M2-7L10-6" fill="none" stroke="#bac88a" stroke-width="1.3"/></g>'

furnace = '''<circle cy="3" r="51" fill="#1c202b"/>
<path d="M-42-24L-18-48L15-49L43-27L51 4L35 39L3 51L-32 39L-49 8Z" fill="url(#heat)" stroke="#2c2630" stroke-width="4"/>
<path d="M-39-22L-17-43L-4-29L-21-11L-42-4Z M12-44L37-26L30-9L6-17Z M46 7L31 34L15 25L21 4Z M-28 35L-43 9L-22 3L-8 23Z M-1 47L-8 27L12 27L17 42Z" fill="url(#iron)" stroke="#202636" stroke-width="3"/>
<path d="M-49 0Q-17-21 49 0L48 11Q0-4-47 12Z" fill="url(#iron)" stroke="#242a36" stroke-width="3"/>
<path d="M-9-49Q12-11-8 49L4 49Q24 3 4-49Z" fill="url(#iron)" stroke="#242a36" stroke-width="3"/>
<path d="M-34-25L-18-39M16-38L32-25M-37 14L-29 28M29 24L36 9M-43 1Q-28-7-13-7M-4-42Q6-20 7-10" fill="none" stroke="#b0aba1" stroke-width="2.2"/>
<path d="M-16-19L-7-26L-7-11M15 14L8 21L5 8M-28 18L-24 10L-18 17" fill="none" stroke="#fff0a0" stroke-width="2.5"/>'''
furnace += '<circle r="12" fill="url(#heat)" stroke="#272b35" stroke-width="3"/><circle cx="-3" cy="-4" r="4" fill="#fff7ca"/><path d="M-35-25L-20-38M30 16L22 31" stroke="#ffb866" stroke-width="2"/>'
for angle in range(0, 360, 45):
    x, y = math.cos(math.radians(angle))*39, math.sin(math.radians(angle))*39
    furnace += f'<circle cx="{x:.2f}" cy="{y:.2f}" r="3.5" fill="#232b38" stroke="#c0b69b" stroke-width="1.4"/><circle cx="{x-1:.2f}" cy="{y-1:.2f}" r=".9" fill="#ddd1ac"/>'

shard = '''<path d="M-47 22L-34-28L4-50L43-13L31 37L-6 49Z" fill="url(#heat)" stroke="#232633" stroke-width="4"/>
<path d="M-34-25L0-46L9-24L-19-5L-44 17Z M13-32L40-12L29 14L14 3Z M30 25L24 37L-5 45L-14 22L5 14Z" fill="url(#iron)" stroke="#242b38" stroke-width="3"/>
<path d="M-43 16L26-22L35-9L-39 29Z" fill="url(#iron)" stroke="#252b36" stroke-width="3"/>
<path d="M-30-20L-3-38M-33 18L-12 7M1 26L16 21" stroke="#b8b19f" stroke-width="2"/>
<circle cx="-25" cy="12" r="3.4" fill="#242a36" stroke="#b6aa8d" stroke-width="1.2"/>
<path d="M-12-18L-5-11L4-22M11 10L19 16L22 5" fill="none" stroke="#ffe9a5" stroke-width="2.5"/>'''

rib = '''<path d="M-54 16Q-43-32-1-31Q40-31 55 14L43 18Q30-17 0-17Q-32-17-42 20Z" fill="url(#bone)" stroke="#443c54" stroke-width="3.5"/>
<path d="M-41 13Q-29-16 0-17Q30-17 42 12" fill="none" stroke="#fff7df" stroke-width="3"/>
<path d="M-2-26L-1-10L7-7M-29-13L-34-22M25-16L31-24" fill="none" stroke="#8c7e8b" stroke-width="2"/>
<ellipse cx="-48" cy="17" rx="10" ry="7" fill="url(#bone)" stroke="#443c54" stroke-width="2.3"/>
<ellipse cx="49" cy="16" rx="10" ry="7" fill="url(#bone)" stroke="#443c54" stroke-width="2.3"/>
<path d="M-18 3L-23 23L-12 36L-6 18L6 21L18 5" fill="#ac79d7" opacity=".65"/>
<path d="M-7 7L-9 24L-4 31L2 15" fill="#e5c6ff" opacity=".85"/>'''

skull = '''<path d="M-28 27Q-55 4-37-33L-24-22L-18-53L0-31L17-58L25-27L43-41Q55 10 31 29L17 18L0 44L-15 21Z" fill="#70449b" opacity=".7"/>
<path d="M-24 13Q-43-7-28-28Q-16-47 9-39Q33-36 35-14Q39 3 23 14L20 33L-16 34L-20 14Z" fill="url(#bone)" stroke="#493c58" stroke-width="3.5"/>
<path d="M-27-17Q-20-30-5-19L-6-5Q-22 1-27-17M8-19Q24-32 29-15Q27 0 10-5Z" fill="#44334f"/>
<path d="M-17-17L-8-13M13-13L22-17" stroke="#cf9cf3" stroke-width="2.6"/>
<path d="M0-2L-7 11L7 10Z" fill="#74616c"/>
<path d="M-16 18Q0 22 20 17M-10 21L-10 30M0 22L0 32M10 21L10 31" fill="none" stroke="#7c7181" stroke-width="2"/>
<path d="M-22-28L-8-35M-31-7L-26 3M20-28L25-22" stroke="#fff9df" stroke-width="2.3"/>'''

interrupt = '''<path d="M-27-41L-43-41L-43-15M27-41L43-41L43-15M-43 15L-43 41L-27 41M43 15L43 41L27 41" fill="none" stroke="#302b25" stroke-width="10" stroke-linecap="round"/>
<path d="M-27-41L-43-41L-43-15M27-41L43-41L43-15M-43 15L-43 41L-27 41M43 15L43 41L27 41" fill="none" stroke="#ffe16b" stroke-width="5" stroke-linecap="round"/>
<path d="M7-30L-22 6L-4 6L-9 31L23-6L4-6Z" fill="#fff5b4" stroke="#6a5429" stroke-width="2"/>'''

bank = '''<path d="M-51-28L-41-43L35-43L51-27L51 26L37 42L-35 42L-51 26Z" fill="url(#iron)" stroke="#212738" stroke-width="4"/>
<path d="M-39-28L36-28L36 27L-38 27Z" fill="#353047" stroke="#b58cd8" stroke-width="2"/>
<path d="M-25 16L8 16Q22 16 22 1Q22-13 8-13L-19-13M-7-25L-20-13L-7-1" fill="none" stroke="#ecd7ff" stroke-width="6" stroke-linejoin="round"/>
<path d="M-42-34L-35-36M32 35L40 29" stroke="#b8a9bc" stroke-width="2"/>
<circle cx="-42" cy="-28" r="3" fill="#c1a8c9"/><circle cx="42" cy="28" r="3" fill="#c1a8c9"/>'''

shapes = {'hedge':hedge, 'furnace':furnace, 'furnace-shard':shard,
          'rib-wave':rib, 'skull-wave':skull, 'interrupt':interrupt, 'bank':bank}
embedded = {}
for name, body in shapes.items():
    title = name.replace('-', ' ').title()
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -64 128 128"><title>{title}</title>{DEFS}{body}</svg>'
    (OUT / (name+'.svg')).write_text(svg+'\n')
    embedded[name] = 'data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
(ROOT/'src/travelling-art-assets.js').write_text('/* Generated by npm run art:travelling. */\nconst TRAVELLING_EFFECT_ART='+json.dumps(embedded,separators=(',',':'))+';\n')
print(f'Exported {len(embedded)} layered travelling-mechanic props.')
