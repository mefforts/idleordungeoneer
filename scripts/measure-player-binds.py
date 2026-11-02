"""Measure the material axis of every limb sprite without changing its pixels."""
from pathlib import Path
from PIL import Image
import numpy as np
import json

def calibrate_all(root):
    file=root/'src/player-art.js'
    assets=json.loads(file.read_text().split('const PLAYER_ART=',1)[1].strip().removesuffix(';'))
    measurements={}
    for key,asset in assets.items():
        if key.split('-')[-1] not in ['upperarm','forearm','thigh','shin']:continue
        alpha=np.asarray(Image.open(root/'assets/player/parts'/f'{key}.webp').convert('RGBA'))[:,:,3]
        points=[]
        for fraction in [.22,.78]:
            y=int(alpha.shape[0]*fraction);band=alpha[max(0,y-3):y+4].astype(float);weights=band.sum(axis=0)
            x=float((weights*np.arange(alpha.shape[1])).sum()/weights.sum());points.append(np.array([x,float(y)]))
        axis=points[1]-points[0];length=np.linalg.norm(axis);axis/=length;perp=np.array([-axis[1],axis[0]])
        yy,xx=np.nonzero(alpha>32);positions=np.stack((xx,yy),axis=1)-points[0];along=positions@axis;across=positions@perp
        middle=across[(along>length*.36)&(along<length*.64)];width=float(np.quantile(middle,.98)-np.quantile(middle,.02))
        asset['bind']={'root':[round(float(x),3) for x in points[0]],'tip':[round(float(x),3) for x in points[1]],'width':round(width,3)}
        measurements[key]=asset['bind']
    file.write_text('/* Independent player textures, exported from the source sheets. */\nconst PLAYER_ART='+json.dumps(assets,separators=(',',':'))+';\n')
    (root/'assets/player/bind-points.json').write_text(json.dumps(measurements,indent=2)+'\n')
    print('Calibrated',len(measurements),'limb axes and joint attachment points.')

if __name__=='__main__':calibrate_all(Path(__file__).resolve().parents[1])
