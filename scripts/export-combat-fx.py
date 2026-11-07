"""Small, cached combat illustrations. Semantic rims remain runtime geometry."""
from pathlib import Path
import base64,json,math
from effect_artwork import ILLUSTRATIONS,MATERIAL_DEFS

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/effects/combat';OUT.mkdir(parents=True,exist_ok=True)
PALETTES=[('#60513a','#b7bf7a','#f3e2ac','#26342a','#8dad65'),('#604739','#c4a16a','#fff0c0','#302b33','#ff9b41'),('#817786','#dbceb4','#fff5da','#302c41','#b99bdf'),('#4b6685','#b6d5e7','#f1ffff','#252d48','#85c9e9')]
MISSILES=[
 '''<path d="M29 0L6-10L-22-7L-11 0L-22 8L6 10Z" fill="url(#wood)" stroke="{dark}" stroke-width="2.7"/><path d="M27 0L-8-3L-14-14L5-7Z" fill="url(#leaf)" stroke="{dark}" stroke-width="1.8"/><path d="M-6 0L18 0M-10-6L-3-5" stroke="{edge}" stroke-width="1.8"/><path d="M-10 2L-20 17L2 7Z" fill="{base}" stroke="{dark}" stroke-width="1.7"/>''',
 '''<path d="M-5-24L15-17L26-1L16 19L-8 25L-26 9L-23-12Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-6-20L-1-8L-10 2L-3 20M-1-8L14-13L14 2L23 4M14 2L4 8L-3 20" stroke="{accent}" stroke-width="5" fill="none"/><path d="M-6-18L-1-8L-9 2M14-11L14 2L5 7" stroke="{edge}" stroke-width="1.8" fill="none"/><path d="M-25-8L-31-1L-24 6" fill="{accent}"/>''',
 '''<path d="M-12-23Q7-31 21-13Q30 1 16 15L10 26L-8 25L-13 14Q-30 4-25-12Z" fill="url(#bone)" stroke="{dark}" stroke-width="2.6"/><path d="M-17-7L-5-3L-13 5M5-3L18-9L14 4M-4 8L3 8L0 14M-6 21L8 20" stroke="{dark}" stroke-width="3" fill="{dark}"/><path d="M-7-22L5-24M18 10L14 16" stroke="{edge}" stroke-width="1.8"/><path d="M-25-1L-32-9L-27 6L-32 17L-19 11" fill="{accent}"/>''',
 '''<path d="M30 0L6-22L-23-14L-29 4L-7 23Z" fill="url(#body)" stroke="{dark}" stroke-width="2.8"/><path d="M28 0L-2-3L6-20ZM-2-3L-7 20L-25 4Z" fill="{edge}"/><path d="M-2-3L-21-12L-26 4Z" fill="{accent}"/><path d="M0-3L17 0L-6 16" stroke="{light}" stroke-width="1.7" fill="none"/>'''
]
COMMON={
 'blade':'''<path d="M30-5L18-21L-5-26L-22-18L-31-1L-15-5L-2-1L15 9L29 7L17 18L-3 24L-22 17L-29 5L-13 9L-2 4L14-7Z" fill="url(#metal)" stroke="{dark}" stroke-width="2.6"/><path d="M-27-2L-18-15L-3-21L16-18L25-8L7-13L-8-10ZM-25 7L-19 15L-2 21L15 16L24 10L7 14L-8 11Z" fill="{edge}"/><path d="M-9-7L0-15L10-5L8 8L-1 14L-11 5Z" fill="{base}" stroke="{dark}" stroke-width="2"/><path d="M0-9L6-2L1 8L-6 2Z" fill="url(#core)" stroke="{edge}" stroke-width="1.3"/>''',
 'ring':'''<circle r="23" fill="none" stroke="{dark}" stroke-width="11"/><circle r="23" fill="none" stroke="url(#metal)" stroke-width="7"/><circle r="18" fill="none" stroke="{accent}" stroke-width="2"/>{teeth}<circle r="10" fill="url(#core)" opacity=".5"/><path d="M-5 0L0-6L5 0L0 6Z" fill="{edge}"/>''',
 'mine':'''<path d="M-26 8L-28-7L-16-25L8-29L26-13L28 9L11 24L-12 26Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-17-22L-3-12L-10 1L4 19M-3-12L10-23L15-9L24-5M15-9L5 1L4 19" stroke="{accent}" stroke-width="4" fill="none"/><path d="M-14-21L-3-12L-8-1M11-21L15-9" stroke="{edge}" stroke-width="1.6" fill="none"/><path d="M-5-3L1-10L8-2L2 8Z" fill="url(#core)" stroke="{dark}" stroke-width="1.6"/>''',
 'shield':'''<path d="M0-29L25-18L22 9L10 24L0 30L-12 23L-23 8L-26-18Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M0-23L18-15L15 6L7 18L0 23L-9 17L-17 4L-19-15Z" fill="#2b4d79" stroke="#a5d9ff" stroke-width="2"/><path d="M0-20L14-13L11 6L0 18Z" fill="#6ca3cf"/><path d="M-9-4L0-13L10-3L6 10L-5 10Z" fill="#a8d9f2" stroke="#e7f7ff" stroke-width="1.5"/><path d="M0-19L0 18" stroke="#e0f3ff" stroke-width="1.5"/>''',
 'crown':'''<path d="M-29 17L-31-17L-16-7L-6-23L3-9L19-25L22-7L31-17L27 18Z" fill="url(#gold)" stroke="{dark}" stroke-width="3"/><path d="M-26 7L26 7L25 19L-25 19Z" fill="#a77c39" stroke="{dark}" stroke-width="2"/><path d="M-24 9L24 9M-24 16L23 16" stroke="#ffe4a0" stroke-width="1.8"/><path d="M0-1L6 6L0 13L-6 6Z" fill="{accent}" stroke="#fff1b9" stroke-width="1.4"/><circle cx="-17" cy="12" r="2" fill="#fff1b9"/><circle cx="17" cy="12" r="2" fill="#fff1b9"/>''',
 'portal':'''<ellipse cx="0" cy="3" rx="44" ry="17" fill="{dark}" stroke="{base}" stroke-width="3"/><ellipse cy="-1" rx="38" ry="14" fill="url(#void)" stroke="#cda3ef" stroke-width="2"/><path d="M-29 0Q-20-15 8-10Q33-6 22 3Q10 12-13 5Q-25-1-7-4Q10-6 14 0" fill="none" stroke="#d8b4f0" stroke-width="2"/><path d="M-43-8L-36-22L-25-18L-28-5M27-8L29-24L41-25L44-6M-8-14L0-28L9-15" fill="url(#body)" stroke="{dark}" stroke-width="2"/><path d="M-37-19L-34-9M34-20L37-10M0-24L0-17" stroke="{edge}" stroke-width="1.5"/>'''
}
SPIRES=[
 '''<path d="M16 121L25 106L29 45L20 31L29 20L41 35L48 8L58 36L74 20L79 34L68 48L72 106L82 120L62 124L48 116L34 124Z" fill="url(#wood)" stroke="{dark}" stroke-width="3"/><path d="M32 105L35 52M61 103L58 51M30 34L38 41M65 35L60 42" stroke="{light}" stroke-width="2"/><path d="M48 43L63 62L59 86L48 102L35 85L33 62Z" fill="{dark}" stroke="{base}" stroke-width="2"/><path d="M48 49L57 65L54 83L48 94L41 82L40 65Z" fill="url(#summon)"/><path d="M26 59L12 48L16 70L30 79M69 60L85 45L81 71L67 80" fill="url(#leaf)" stroke="{dark}" stroke-width="2"/><path d="M26 108L15 116M70 108L82 117" stroke="{edge}" stroke-width="1.5"/>''',
 '''<path d="M17 120L21 108L27 105L27 30L19 26L24 13L70 13L77 26L69 31L69 105L77 110L81 120Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M28 18L68 18L65 28L31 28Z M28 105L68 105L72 114L24 114Z" fill="{base}" stroke="{dark}" stroke-width="2"/><path d="M34 36L62 36L63 98L33 98Z" fill="{dark}" stroke="{light}" stroke-width="2"/><path d="M40 40L57 40L57 94L40 94Z" fill="url(#summon)"/><path d="M32 47L64 47M32 66L64 66M32 85L64 85" stroke="{dark}" stroke-width="5"/><path d="M18 40L29 40M18 61L29 61M67 40L80 40M67 61L80 61" stroke="{base}" stroke-width="6"/><path d="M23 39L23 63M74 39L74 63M29 117L67 117" stroke="{edge}" stroke-width="1.5"/><circle cx="29" cy="22" r="2" fill="{edge}"/><circle cx="66" cy="22" r="2" fill="{edge}"/>''',
 '''<path d="M18 121L24 109L29 105L28 43L19 30L27 10L67 10L77 29L67 43L67 105L75 109L80 121Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/><path d="M25 26Q30 7 48 8Q67 8 72 27L66 42L57 47L57 56L39 56L38 46L29 41Z" fill="url(#bone)" stroke="{dark}" stroke-width="2.5"/><path d="M31 29L42 33L35 40M55 33L66 28L60 40M45 42L51 42L48 47M41 51L55 51" stroke="{dark}" stroke-width="3" fill="{dark}"/><path d="M35 62L61 62L59 102L37 102Z" fill="{dark}" stroke="{base}" stroke-width="2"/><path d="M48 65L57 81L48 100L40 81Z" fill="url(#summon)"/><path d="M29 68L38 72M28 85L38 87M60 72L70 68M59 88L69 85M29 116L68 116" stroke="{light}" stroke-width="3"/>''',
 '''<path d="M15 121L24 108L29 105L25 56L32 23L48 4L65 23L71 56L67 105L73 108L82 121Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M48 10L48 53L30 55L35 26Z" fill="{edge}"/><path d="M48 10L62 26L66 55L48 53Z" fill="{light}"/><path d="M32 61L48 55L64 62L61 101L48 112L34 102Z" fill="{dark}" stroke="{light}" stroke-width="2"/><path d="M48 62L58 76L55 98L48 105L41 97L39 76Z" fill="url(#summon)"/><path d="M20 68L10 51L15 39L28 53M69 53L80 37L87 49L77 69" fill="{accent}" stroke="{dark}" stroke-width="2"/><path d="M24 114L48 121L74 114" stroke="{edge}" stroke-width="1.5" fill="none"/>'''
]
ERUPTIONS=[ILLUSTRATIONS['root'],
 '''<path d="M-43 4L-49-11L-29-28L1-32L34-25L49-5L38 7L-6 12Z" fill="url(#metal)" stroke="{dark}" stroke-width="3"/><path d="M-29-25L-21-10L-5-7L6 6M5-28L9-13L30-10L38 0" stroke="{accent}" stroke-width="4" fill="none"/><path d="M-26 0C-47-30-10-35-23-69Q-5-58 0-106Q22-83 11-58Q41-79 33-48Q54-25 24 0Z" fill="url(#flame)" stroke="#7a3d2e" stroke-width="2.5"/><path d="M-15-1Q-28-27-4-49Q7-64 5-82Q24-59 12-39Q35-47 19-2Z" fill="#ffbd67"/><path d="M-8-1Q-13-20 3-40Q6-20 15-19L9 0Z" fill="#fff0bf"/><path d="M-36-7L-27-5M20-12L31-9" stroke="{edge}" stroke-width="1.6"/>''',
 '''<path d="M-23 4L-25-35L-17-49L14-49L24-34L22 4Z" fill="url(#bone)" stroke="{dark}" stroke-width="3"/><path d="M-18-35L-29-62L-29-87L-19-100L-12-95L-19-81L-16-62L-8-40M-5-47L-9-77L-5-107L5-112L12-105L4-98L2-76L7-48M11-46L14-70L26-92L37-93L42-84L31-80L24-62L22-38M-22-19L-41-32L-48-51L-42-61L-33-56L-35-48L-29-40L-14-31" fill="none" stroke="{dark}" stroke-width="13" stroke-linecap="round"/>
<path d="M-18-35L-29-62L-29-87L-19-100L-12-95M-5-47L-9-77L-5-107L5-112L12-105M11-46L14-70L26-92L37-93L42-84M-22-19L-41-32L-48-51L-42-61L-33-56" fill="none" stroke="url(#bone)" stroke-width="8" stroke-linecap="round"/>
<path d="M-24-64L-32-63M-3-77L-14-76M15-69L23-65M-43-38L-36-43M-15-32L-10-3M0-38L3-4M13-32L15-3" stroke="{base}" stroke-width="2.5"/><path d="M-12 5L-28 10M9 4L25 9" stroke="{accent}" stroke-width="2"/>''',
 '''<path d="M-33 6L-49-8L-45-35L-31-47L-17-30L-12-89L4-114L23-88L20-32L34-60L49-42L46-7L28 8Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M4-108L4-43L-8-84Z M4-43L18-85L4-108Z M-32-42L-32-5L-43-13Z M35-55L35 0L46-13Z" fill="{edge}"/><path d="M4-43L-6 0L4 7L15-2Z M-32-4L-19-25L-17-2Z M35-2L24-26L22-2Z" fill="{accent}"/><path d="M4-101L4-50M-36-33L-38-17M39-43L41-18" stroke="{light}" stroke-width="2"/><path d="M-52 9L-46-2L-37 9M30 12L42 2L53 10" fill="{base}" stroke="{dark}" stroke-width="2"/>'''
]

def star_shape():
 pts=[];facets=[]
 for i in range(12):
  a=i*math.pi/6;r=30 if i%2==0 else 14;pts.append(f'{math.cos(a)*r:.2f},{math.sin(a)*r:.2f}')
 for i in range(6):
  a=i*math.pi/3;b=a+math.pi/6
  facets.append(f'<path d="M0 0L{math.cos(a)*29:.2f} {math.sin(a)*29:.2f}L{math.cos(b)*13:.2f} {math.sin(b)*13:.2f}Z" fill="'+('{edge}' if i%2 else '{light}')+'"/>')
 return '<polygon points="'+' '.join(pts)+'" fill="url(#metal)" stroke="{dark}" stroke-width="2.5"/>'+''.join(facets)+'<circle r="9" fill="{dark}" stroke="{base}" stroke-width="2"/><path d="M0-7L5 0L0 7L-5 0Z" fill="url(#core)" stroke="{edge}" stroke-width="1"/>'

teeth=''.join(f'<g transform="rotate({i*90})"><path d="M-6-21L-2-31L9-22L5-16Z" fill="{{light}}" stroke="{{dark}}" stroke-width="1.5"/></g>' for i in range(4))
COMMON['ring']=COMMON['ring'].replace('{teeth}',teeth)
COMMON['star']=star_shape()
extra='''<linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#fff1bd"/><stop offset=".35" stop-color="#d4b46b"/><stop offset="1" stop-color="#82603e"/></linearGradient><radialGradient id="summon"><stop stop-color="#fff1ff"/><stop offset=".3" stop-color="#dab7f5"/><stop offset=".7" stop-color="#815bac"/><stop offset="1" stop-color="#332f52"/></radialGradient><linearGradient id="flame" x2=".2" y2="1"><stop stop-color="#fff4c7"/><stop offset=".4" stop-color="#ffbd62"/><stop offset=".7" stop-color="#e77537"/><stop offset="1" stop-color="#8b3a2f"/></linearGradient>'''
frames={k:{'width':64,'height':64,'anchorY':.5} for k in ['missile','blade','star','ring','mine','shield','crown']}
frames.update(eruption={'width':128,'height':136,'anchorY':116/136},spire={'width':96,'height':128,'anchorY':120/128},portal={'width':96,'height':64,'anchorY':.5})
art={}
for family,frame in frames.items():
 for kind,(base,light,edge,dark,accent) in enumerate(PALETTES):
  shape=MISSILES[kind] if family=='missile' else ERUPTIONS[kind] if family=='eruption' else SPIRES[kind] if family=='spire' else COMMON[family]
  view='-64 -116 128 136' if family=='eruption' else '0 0 96 128' if family=='spire' else '-48 -32 96 64' if family=='portal' else '-32 -32 64 64'
  defs=f'<linearGradient id="body" x2=".8" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></linearGradient>'+MATERIAL_DEFS.format(base=base,light=light,edge=edge,dark=dark,accent=accent)+extra
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"><defs>{defs}</defs>'+shape.format(base=base,light=light,edge=edge,dark=dark,accent=accent)+'</svg>'
  svg=''.join(svg.splitlines());key=f'{family}-{kind}';(OUT/(key+'.svg')).write_text(svg+'\n');art[key]='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
(ROOT/'src/combat-fx-assets.js').write_text('/* Generated by npm run art:combat-fx. */\nconst COMBAT_FX_ART='+json.dumps(art,separators=(',',':'))+';\nconst COMBAT_FX_FRAMES='+json.dumps(frames,separators=(',',':'))+';\n')
print(f'Exported {len(art)} combat illustrations, with explicit ground/projectile anchors.')
