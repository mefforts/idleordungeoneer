"""Isolate purpose-made player parts and embed transparent WebP sprites."""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np
import json,base64,io
root=Path(__file__).resolve().parents[1]
folder=root/'assets/player'
parts=['head','shoulder','chest','thigh','shin','boot','upperarm','forearm','hand']
body=['head','chest','upperarm','forearm','hand','thigh','shin','boot','shoulder','waist','neck','cuff']
assets={};metrics=[]
def sheet(name,cols,rows,keys):
    image=Image.open(folder/name).convert('RGBA');pixels=np.asarray(image);alpha=pixels[:,:,3]
    labels,_=ndimage.label(alpha>24);sizes=np.bincount(labels.ravel());groups={}
    for number,region in enumerate(ndimage.find_objects(labels),1):
        if region is None or sizes[number]<16:continue
        yy,xx=np.nonzero(labels[region]==number)
        cx=float(xx.mean()+region[1].start);cy=float(yy.mean()+region[0].start)
        cell=(min(cols-1,int(cx/image.width*cols)),min(rows-1,int(cy/image.height*rows)))
        groups.setdefault(cell,[]).append(number)
    for row in range(rows):
        for col in range(cols):
            key=keys[row*cols+col];numbers=groups.get((col,row),[])
            assert numbers,(name,col,row)
            mask=np.isin(labels,numbers);assert mask.sum()>120,(key,mask.sum())
            mask=ndimage.binary_dilation(mask,iterations=3)
            yy,xx=np.nonzero(mask);box=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
            crop=np.array(pixels[box[1]:box[3],box[0]:box[2]],copy=True)
            crop[:,:,3]=np.where(mask[box[1]:box[3],box[0]:box[2]],crop[:,:,3],0)
            cut=Image.fromarray(crop);cut.thumbnail((224,240),Image.Resampling.LANCZOS)
            output=Image.new('RGBA',(cut.width+8,cut.height+8));output.alpha_composite(cut,(4,4))
            buffer=io.BytesIO();output.save(buffer,'WEBP',quality=94,method=6)
            (folder/'parts'/f'{key}.webp').write_bytes(buffer.getvalue())
            assets[key]={'src':'data:image/webp;base64,'+base64.b64encode(buffer.getvalue()).decode(),'width':output.width,'height':output.height}
            metrics.append({'key':key,'sheet':name,'cell':[col,row],'sourceBox':box,'size':[output.width,output.height],'pixels':int((np.asarray(output)[:,:,3]>32).sum())})
for tier,name in [(1,'armor-iron.png'),(2,'armor-steel.png')]:
    sheet(name,9,3,[f'armor-{style}_{tier}-{part}' for style in ['melee','ranged','magic'] for part in parts])
sheet('body.png',4,3,['base-'+part for part in body])
sheet('hair.png',3,2,['hair-'+str(i) for i in range(6)])
sheet('tools.png',4,2,['tool-'+name for name in ['pickaxe','hammer','hatchet','mattock','knife','spindle','burin','file']])
sheet('grips.png',4,2,['base-grip','armor-melee_1-grip','armor-melee_2-grip','armor-ranged_1-grip','armor-ranged_2-grip','armor-magic_1-grip','armor-magic_2-grip','base-reach'])
assert len(assets)==88
(root/'src/player-art.js').write_text('/* Independent player textures, exported from the source sheets. */\nconst PLAYER_ART='+json.dumps(assets,separators=(',',':'))+';\n')
(folder/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
(folder/'catalog.json').write_text(json.dumps({'version':1,'bodyParts':body+['grip','reach'],'armorParts':parts+['grip'],'armorSets':[style+'_'+str(tier) for style in ['melee','ranged','magic'] for tier in [1,2]],'physicalSlots':['head','shoulders','chest','legs','boots','gloves'],'hairstyles':6,'tools':8,'sprites':88,'coordinateSystem':'Foot origin; upright bind pose; shared shoulder, elbow, knee and wrist sockets','sourceSheets':['body.png','hair.png','armor-iron.png','armor-steel.png','tools.png','grips.png']},indent=2)+'\n')
print('Exported',len(assets),'independent player textures; embedded bytes',sum(len(a['src']) for a in assets.values()))

from importlib.util import spec_from_file_location, module_from_spec
spec=spec_from_file_location("player_binds",root/"scripts/measure-player-binds.py")
module=module_from_spec(spec);spec.loader.exec_module(module);module.calibrate_all(root)
