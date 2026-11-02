"""Isolate the eight work tools; body and clothing use the vector rig."""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np
import json,base64,io
root=Path(__file__).resolve().parents[1]
folder=root/'assets/player'
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
sheet('tools.png',4,2,['tool-'+name for name in ['pickaxe','hammer','hatchet','mattock','knife','spindle','burin','file']])
sheet('ward-artisan.png',2,1,['tool-spindle','tool-file'])
assert len(assets)==8
(root/'src/player-art.js').write_text('/* Transparent work tools; illustrated body and clothing live in avatar-rig.js. */\nconst PLAYER_ART='+json.dumps(assets,separators=(',',':'))+';\n')
metrics=[item for item in metrics if item['sheet']=='ward-artisan.png' or item['key'] not in ['tool-spindle','tool-file']]
(folder/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
print('Exported',len(assets),'transparent work tools; embedded bytes',sum(len(a['src']) for a in assets.values()))
