"""Export illustrated vector props used by the animated encounter renderer."""
from pathlib import Path
import json,base64,re,math
from effect_artwork import ILLUSTRATIONS, MATERIAL_DEFS
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/effects';OUT.mkdir(parents=True,exist_ok=True)
PALETTES=[('#405431','#a5bb6c','#d5d49c','#263427','#746044'),('#633e32','#dc9752','#ffde91','#302a2e','#756d61'),('#69606b','#cec6aa','#f0e9ce','#30303f','#998a7f'),('#405471','#92c9d2','#e5f6e4','#252d47','#83719f')]
SHAPES={'boulder': '<path d="M-39-9L-52-40L-33-77L2-91L33-77L50-42L36-9L2 1Z" fill="url(#body)" stroke="{dark}" stroke-width="4"/><path d="M-30-72L-8-65L-17-37L3-24L-2-2M-12-63L11-77L22-62L11-45L36-30M-48-40L-19-39M12-44L-2-25" fill="none" stroke="#e77736" stroke-width="7"/><path d="M-29-72L-8-65L-17-37L3-24M-8-65L11-77L22-62L11-45L36-30" fill="none" stroke="{edge}" stroke-width="2"/><path d="M-31-24L-42-41L-29-62M27-19L39-43L27-59" fill="none" stroke="{light}" stroke-width="4"/>', 'hammer': '<path d="M-5 1L-9-65L6-65L11-2Z" fill="#805c3c" stroke="{dark}" stroke-width="3"/><path d="M-3-5L-5-57" stroke="#c19b60" stroke-width="2"/><path d="M-43-90L-21-103L43-93L49-65L27-52L-40-61Z" fill="url(#body)" stroke="{dark}" stroke-width="4"/><path d="M-43-90L24-81L43-93L-21-103Z" fill="{edge}"/><path d="M24-81L27-52L49-65L43-93Z" fill="{base}" stroke="{dark}" stroke-width="2"/><path d="M-39-83L19-76L20-58L-37-67Z" fill="{light}"/><path d="M-24-79L-20-64M-10-77L-6-62M5-75L8-60" stroke="{base}" stroke-width="2"/>', 'shield': '<path d="M-42-87L0-108L43-87L34-35L0 3L-34-35Z" fill="url(#body)" stroke="{dark}" stroke-width="4"/><path d="M-32-81L0-98L33-80L25-39L0-11L-25-39Z" fill="{base}" stroke="{edge}" stroke-width="3"/><path d="M0-94L0-15L26-41L32-79Z" fill="{light}"/><path d="M-19-56L0-77L20-55L0-31Z" fill="{edge}" stroke="{dark}" stroke-width="3"/><path d="M0-69L9-56L0-41L-9-56Z" fill="{base}"/>', 'banner': '<path d="M-15 5L-15-108" stroke="{dark}" stroke-width="7"/><path d="M-15 5L-15-108" stroke="{edge}" stroke-width="3"/><path d="M-13-99Q12-109 42-91L33-67L42-42Q11-57-13-48Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M-8-91Q11-99 32-87L27-68L32-51Q8-63-8-57Z" fill="{base}" stroke="{edge}" stroke-width="2"/><path d="M5-86L20-82L10-72L22-63L6-68Z" fill="{edge}"/>', 'star': '<path d="M0-105L13-68L46-80L29-49L50-24L16-26L0 4L-15-26L-49-23L-29-49L-46-81L-13-68Z" fill="url(#body)" stroke="{dark}" stroke-width="3"/><path d="M0-100L0-48L42-77L12-64ZM0-48L47-25L14-29L0 1ZM0-48L-43-77L-12-64L0-99Z" fill="{edge}"/><path d="M0-68L17-49L0-31L-17-49Z" fill="{base}" stroke="{dark}" stroke-width="2"/>'}
SHAPES.update(ILLUSTRATIONS)
# Focal props retain a readable silhouette at phone size: a forged head with a
# bound haft, and a faceted astral core instead of flat colored tokens.
SHAPES['hammer'] = (
 '<path d="M-6 4L-10-63L7-65L11 3Z" fill="#654935" stroke="{dark}" stroke-width="3"/>'
 '<path d="M-7-47L8-52M-6-35L9-40M-5-23L10-28M-4-11L10-16" stroke="#c4a074" stroke-width="4"/>'
 '<path d="M-10-60L10-63L11-53L-9-50Z M-6-3L11-5L13 3L-5 6Z" fill="{light}" stroke="{dark}" stroke-width="2"/>'
 '<path d="M-48-94L-26-109L44-99L51-69L29-53L-44-64Z" fill="url(#body)" stroke="{dark}" stroke-width="4"/>'
 '<path d="M-47-94L25-84L44-99L-26-109Z" fill="{edge}" stroke="{dark}" stroke-width="2"/>'
 '<path d="M25-84L29-53L51-69L44-99Z" fill="{base}" stroke="{dark}" stroke-width="2"/>'
 '<path d="M-40-86L18-78L21-61L-38-70Z" fill="{dark}" stroke="{light}" stroke-width="2"/>'
 '<path d="M-33-100L-28-67L-18-65L-22-98Z M9-93L14-61L23-59L18-91Z" fill="{light}" stroke="{dark}" stroke-width="2"/>'
 '<path d="M-9-87L3-78L-3-67L-15-76Z" fill="{accent}" stroke="{edge}" stroke-width="2"/>'
 '<path d="M-8-82L-2-77L-5-73L-11-77Z" fill="{edge}"/>'
 '<path d="M-39-91L-31-90M-28-105L28-97M31-81L43-88" stroke="{edge}" stroke-width="2"/>'
 '<circle cx="-31" cy="-73" r="2" fill="{edge}"/><circle cx="16" cy="-66" r="2" fill="{edge}"/>'
)
SHAPES['star'] += (
 '<circle cx="0" cy="-49" r="19" fill="{dark}" stroke="{light}" stroke-width="3"/>'
 '<path d="M0-67L13-49L0-31L-13-49Z" fill="{accent}" stroke="{edge}" stroke-width="2"/>'
 '<path d="M0-64L0-49L11-49Z" fill="{edge}"/><path d="M0-49L0-34L-10-49Z" fill="{base}"/>'
 '<path d="M0-99L4-82M40-76L28-66M44-27L29-31M0-1L-4-17M-44-27L-29-31M-40-76L-28-66" stroke="{edge}" stroke-width="2"/>'
)
SHAPES['thorns']=SHAPES['root']+'<path d="M-19-44L-50-34L-30-56M20-38L51-25L33-51M0-63L26-96L6-84" fill="{edge}" stroke="{dark}" stroke-width="2"/>'
art={}
for name,shape in SHAPES.items():
 for kind,palette in enumerate(PALETTES):
  base,light,edge,dark,accent=palette
  if name=='hammer' and kind==1:base,light,edge,accent='#51505a','#c0b69f','#fff0c7','#ff9847'
  body=shape.format(base=base,light=light,edge=edge,dark=dark,accent=accent)
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -116 128 136"><defs><linearGradient id="body" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></linearGradient>{MATERIAL_DEFS.format(base=base,light=light,edge=edge,dark=dark,accent=accent)}</defs>{body}</svg>'
  key=f'{name}-{kind}';(OUT/(key+'.svg')).write_text(svg+'\n');art[key]='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
# Collection medallions combine the physical prop with its movement/counter motif.
for ident,number,theme,name,seconds,duration,prop in re.findall(r"\['(\w+)',(\d+),(-?\d+),'([^']+)',([\d.]+),([\d.]+),'(\w+)'",(ROOT/'src/themed-encounters.js').read_text()):
 kind=max(0,int(theme));number=int(number);base,light,edge,dark,accent=PALETTES[kind]
 if prop=='hammer' and kind==1:base,light,edge,accent='#51505a','#c0b69f','#fff0c7','#ff9847'
 body=SHAPES[prop].format(base=base,light=light,edge=edge,dark=dark,accent=accent)
 sequential=number in [2,4,10,12,13,17,21,27,29,40]
 if sequential:body=''.join(f'<g transform="translate({x},{y}) scale(.58)">{body}</g>' for x,y in [(-27,0),(0,-18),(27,0)])
 glyph=''
 if number in [5,8,18,22,46]:glyph='<path d="M-29 7L-7-2L-15 7L10-2L2 7L29-2" fill="none" stroke="#80d5b7" stroke-width="3"/>'
 elif number in [20,27,37]:glyph='<circle cx="29" cy="-20" r="16" fill="#433a2b" stroke="#edcb76" stroke-width="2"/><path d="M29-31L38-20L29-9L20-20Z" fill="#fff0ba"/>'
 elif number in [2,3,21,23,28,36]:glyph='<path d="M-51 5L-16 5M16 5L51 5" stroke="#c69ca0" stroke-width="5"/><path d="M-7 10L0 0L7 10" fill="none" stroke="#80d5b7" stroke-width="3"/>'
 else:
  bend=(number%5-2)*7;glyph=f'<path d="M-45 9Q{bend}-18 42 5L32-3M42 5L32 12" fill="none" stroke="{edge}" stroke-width="2.5"/>'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><title>{name}</title><defs><radialGradient id="bg"><stop stop-color="{base}"/><stop offset="1" stop-color="#1c2529"/></radialGradient><linearGradient id="body" x2=".85" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></linearGradient>{MATERIAL_DEFS.format(base=base,light=light,edge=edge,dark=dark,accent=accent)}</defs><circle cx="64" cy="64" r="59" fill="url(#bg)" stroke="#b8a574" stroke-width="2"/><circle cx="64" cy="64" r="54" fill="none" stroke="{edge}" opacity=".3"/><g transform="translate(64 98) scale(.72)">{body}{glyph}</g><path d="M24 25q6-4 12 0v13q-6-3-12 0-6-3-12 0V25q6-4 12 0Zm0 0v13" fill="#ead9ad" stroke="#60543c" stroke-width="1.5"/></svg>'
 key='icon-'+ident;(OUT/(key+'.svg')).write_text(svg+'\n');art[key]='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
# A lesser-creature guide shares the same centered medallion frame.
svg=svg.replace(name,'Uncommon creatures').replace(body+glyph,SHAPES['ghost'].format(base='#605746',light='#c4b183',edge='#f2e2be',dark='#302c2b',accent='#aa9774')+'<path d="M-36 4L36 4" stroke="#c4b183" stroke-width="4"/>')
key='icon-uncommon';(OUT/(key+'.svg')).write_text(svg+'\n');art[key]='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
(ROOT/'src/themed-effect-assets.js').write_text('/* Generated from assets/effects; npm run art:themed-effects. */\nconst THEMED_EFFECT_ART='+json.dumps(art,separators=(',',':'))+';\n')
print(f'Exported {len(art)} illustrated effect props across four material palettes.')
