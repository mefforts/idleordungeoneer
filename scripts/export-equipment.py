"""Pack the generated equipment sheets and export unique inventory portraits."""
from PIL import Image
from pathlib import Path
import base64, io, json, sys
import numpy as np
from scipy import ndimage
root=Path(__file__).resolve().parents[1]
armor=Image.open(sys.argv[1]).convert('RGBA')
weapons=Image.open(sys.argv[2]).convert('RGBA')
assets=root/'assets/equipment'; assets.mkdir(parents=True, exist_ok=True)
icons={}; regions={'armor':{},'weapons':{}}
def uri(im, quality=92):
    out=io.BytesIO(); im.save(out,'WEBP',quality=quality,method=6)
    return 'data:image/webp;base64,'+base64.b64encode(out.getvalue()).decode()
def detect_regions(sheet,cols,rows):
    mask=np.asarray(sheet)[:,:,3]>40
    labels,_=ndimage.label(mask);sizes=np.bincount(labels.ravel());found={}
    for number,part in enumerate(ndimage.find_objects(labels),1):
        if part is None or sizes[number]<200: continue
        top,bottom,left,right=part[0].start,part[0].stop,part[1].start,part[1].stop
        col=min(cols-1,int((left+right)/2/sheet.width*cols));row=min(rows-1,int((top+bottom)/2/sheet.height*rows))
        key=(col,row)
        if key in found:
            old=found[key];found[key]=(min(left,old[0]),min(top,old[1]),max(right,old[2]),max(bottom,old[3]))
        else: found[key]=(left,top,right,bottom)
    assert len(found)==cols*rows,(cols,rows,found)
    return found
bounds={id(armor):detect_regions(armor,4,3),id(weapons):detect_regions(weapons,6,4)}
def cell(sheet,col,row,cols,rows):
    bx,by,ex,ey=bounds[id(sheet)][(col,row)]
    bx=max(0,bx-2);by=max(0,by-2);ex=min(sheet.width,ex+2);ey=min(sheet.height,ey+2)
    return sheet.crop((bx,by,ex,ey)),[bx,by,ex-bx,ey-by]
def icon(im,weapon=False,shield=False):
    art=im.copy()
    if weapon and not shield:
        # Inventory silhouettes read better at an angle; world sprites stay vertical.
        art=art.rotate(-27,resample=Image.Resampling.BICUBIC,expand=True)
        art=art.crop(art.getbbox())
    art.thumbnail((224,224),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(256,256));out.alpha_composite(art,((256-art.width)//2,(256-art.height)//2))
    return uri(out)
def pack(sheet,cols,rows,cell_size):
    packed=Image.new('RGBA',(cols*cell_size[0],rows*cell_size[1]));placed={}
    for row in range(rows):
        for col in range(cols):
            box=bounds[id(sheet)][(col,row)]
            sprite=sheet.crop(box)
            sprite.thumbnail((cell_size[0]-32,cell_size[1]-32),Image.Resampling.LANCZOS)
            x=col*cell_size[0]+(cell_size[0]-sprite.width)//2
            y=row*cell_size[1]+(cell_size[1]-sprite.height)//2
            packed.alpha_composite(sprite,(x,y));placed[(col,row)]=(x,y,x+sprite.width,y+sprite.height)
    bounds[id(packed)]=placed
    return packed
# Transparent gutters prevent adjacent sprites bleeding into one another at game scale.
armor=pack(armor,4,3,(256,384));weapons=pack(weapons,6,4,(192,320))
styles=['melee','ranged','magic']; kinds=['sword','shield','polearm','greatsword','bow','staff']
for row,style in enumerate(styles):
    for col in range(4):
        im,region=cell(armor,col,row,4,3);key=f'{style}_{col+1}'
        regions['armor'][key]=region
        icons[f'armor-set-{key}.svg']=icon(im)
        icons[f'codex-armor_set_{key}.svg']=icon(im)
        if col==0:
            icons[f'style-{style}-armor.svg']=icon(im)
            icons[f'codex-armor_{style}.svg']=icon(im)
for row in range(4):
    for col,kind in enumerate(kinds):
        im,region=cell(weapons,col,row,6,4);key=f'{kind}_{row+1}'
        regions['weapons'][key]=region
        icons[f'weapon-art-{key}.svg']=icon(im,True,kind=='shield')
        if row==0:
            name={'polearm':'halberd'}.get(kind,kind)
            icons[f'{name}.svg']=icon(im,True,kind=='shield')
            icons[f'codex-weapon_{kind}.svg']=icon(im,True,kind=='shield')
            if kind in ['sword','bow','staff']:
                style={'sword':'melee','bow':'ranged','staff':'magic'}[kind]
                icons[f'style-{style}-weapon.svg']=icon(im,True,False)
for name,sheet in [('armor',armor),('weapons',weapons)]:
    sheet.save(assets/(name+'-atlas.webp'),'WEBP',quality=92,method=6)
    icons['equipment-'+name+'-atlas.svg']=uri(sheet)
crest='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><radialGradient id="b"><stop stop-color="#685536"/><stop offset="1" stop-color="#171913"/></radialGradient><linearGradient id="g" x2=".6" y2="1"><stop stop-color="#ffe4a0"/><stop offset=".5" stop-color="#b98e41"/><stop offset="1" stop-color="#765629"/></linearGradient></defs><circle cx="48" cy="48" r="44" fill="url(#b)" stroke="#bd9b5f" stroke-width="3"/><path d="m23 25 25-12 25 12-4 36-21 21-21-21Z" fill="#292c25" stroke="url(#g)" stroke-width="5"/><path d="m37 35 11-13 11 13-7 10v22h-8V45Z" fill="url(#g)" stroke="#efce87" stroke-width="1.5"/><path d="M31 52h34M36 58h24" stroke="#d7b16b" stroke-width="3"/><circle cx="48" cy="36" r="5" fill="#e2ecbb"/><path d="m48 5 3 5-3 5-3-5Z" fill="#fff0bb"/></svg>'
icons['mastery-points.svg']='data:image/svg+xml;base64,'+base64.b64encode(crest.encode()).decode()
icons['codex-permanent_mastery.svg']=icons['mastery-points.svg']
(root/'src/equipment-art.json').write_text(json.dumps(icons,separators=(',',':'))+'\n')
(root/'src/equipment-regions.js').write_text('const EQUIPMENT_REGIONS = '+json.dumps(regions,separators=(',',':'))+';\n')
print('Exported',len(regions['armor']),'armor sets,',len(regions['weapons']),'weapon sprites and',len(icons),'embedded assets.')
