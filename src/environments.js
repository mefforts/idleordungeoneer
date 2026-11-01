/* Authored visual variety. Combat values, encounter counts and rewards stay shared. */
const ENVIRONMENT_ZONES=[
 {key:'overgrowth',floors:['Woodland Edge','Rooted Ruins','The Elder Grove'],
  scenery:['twisted-oak','hollow-stump','fallen-log','rooted-menhir','ferns','mushrooms','root-tangle','moss-plinth'],
  heights:[186,74,78,145,52,49,94,78],rx:[25,18,42,19,0,0,29,25],ry:[15,11,13,12,0,0,13,12],
  monsters:['Mossling','Moss Beetle','Walking Sapling','Capling','Bramble Hound','Root Crawler'],
  creatures:['moss-beetle','sapling','capling','bramble-hound','root-crawler'],motions:['scuttle','sway','hop','prowl','crawl'],sizes:[.72,1,.9,.72,.82],
  decals:['root-carpet','fallen-leaves','moss-mosaic'],
  weights:[[7,2,1,4,2,4,4,1,8,4,1,1],[4,4,3,3,3,3,3,4,6,6,5,4],[3,4,6,2,6,2,2,5,3,4,8,5]]},
 {key:'embervault',floors:['Ashen Approach','The Old Foundry','The Molten Heart'],
  scenery:['furnace','coal-cart','iron-pipes','basalt-columns','slag-heap','chimney','foundry-wall','ember-monolith'],
  heights:[132,88,133,149,62,125,73,140],rx:[30,29,26,25,20,23,33,21],ry:[17,13,14,14,10,14,11,12],
  monsters:['Emberling','Ash Imp','Slag Beetle','Soot Wisp','Furnace Hound','Obsidian Crawler'],
  creatures:['ash-imp','slag-beetle','soot-wisp','furnace-hound','obsidian-crawler'],motions:['hop','scuttle','hover','prowl','crawl'],sizes:[1,.7,.94,.76,.78],
  decals:['ash-patch','cooled-slag','foundry-paving'],
  weights:[[6,1,2,7,2,4,2,2,6,2,4,1],[3,3,3,3,6,6,7,3,4,5,5,2],[5,4,5,5,3,2,4,7,7,4,2,7]]},
 {key:'crypt',floors:['Forgotten Graves','The Burial Vaults','The Sovereign’s Sanctum'],
  scenery:['sarcophagus','mausoleum','dead-tree','grave-cluster','bone-heap','candles','fallen-effigy','soul-urn'],
  heights:[82,151,163,94,57,103,63,126],rx:[35,28,23,27,0,18,30,19],ry:[16,15,13,13,0,11,12,12],
  monsters:['Shade','Bone Thrall','Grave Moth','Bone Scarab','Shroudling','Grave Crawler'],
  creatures:['bone-thrall','grave-moth','bone-scarab','shroudling','grave-crawler'],motions:['shamble','flutter','scuttle','shamble','hover'],sizes:[1,.87,.7,.96,.92],
  decals:['bone-scatter','funerary-mosaic','grave-mist'],
  weights:[[7,3,2,5,2,1,5,6,5,2,2,1],[3,5,4,3,6,6,2,3,4,4,5,4],[2,4,7,2,5,5,1,3,3,6,7,7]]},
 {key:'rift',floors:['The Fractured Approach','Starlit Ruins','The Unmade Threshold'],
  scenery:['crystal-arch','armillary','astral-obelisk','shard-cluster','star-dais','broken-bridge','split-column','moon-marker'],
  heights:[151,126,154,105,78,91,145,135],rx:[29,24,18,25,33,36,23,21],ry:[14,13,12,13,14,15,12,12],
  monsters:['Riftling','Shard Crawler','Astral Jelly','Star Moth','Void Hound','Rift Wisp'],
  creatures:['shard-crawler','astral-jelly','star-moth','void-hound','rift-wisp'],motions:['scuttle','hover','flutter','prowl','hover'],sizes:[.75,1,.85,.74,.96],
  decals:['crystal-scatter','star-mosaic','astral-dust'],
  weights:[[7,2,2,7,2,1,1,6,2,6,2,2],[4,4,4,3,5,7,4,3,6,5,4,5],[5,5,7,4,4,4,7,5,3,2,7,6]]}
];
const ENVIRONMENT_MOB_WEIGHTS=[[42,22,22,8,4,2],[22,16,16,20,14,12],[10,12,10,18,26,24]];
const environmentImages=new Map(),environmentGroundPatterns=new Map(),environmentCells=new Map(),environmentPrimed=new Set();

function environmentImage(key){
 if(!ENVIRONMENT_ART[key])return null;
 if(!environmentImages.has(key)){const image=new Image();image.src=ENVIRONMENT_ART[key].src;environmentImages.set(key,image);}
 return environmentImages.get(key);
}
function primeEnvironment(kind){
 if(environmentPrimed.has(kind))return;environmentPrimed.add(kind);const prefix=ENVIRONMENT_ZONES[kind].key+'-';
 for(const key of Object.keys(ENVIRONMENT_ART))if(key.startsWith(prefix))environmentImage(key);
}
function environmentPick(weights,value){
 let left=value*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<weights.length;i++){left-=weights[i];if(left<0)return i;}return weights.length-1;
}
function environmentProp(kind,index){
 const zone=ENVIRONMENT_ZONES[kind];
 if(index<4){
  const heights=[[177,115,132,59],[90,115,132,59],[103,110,132,59],[105,115,132,59]][kind];
  return {legacy:index,height:heights[index],rx:[22,30,18,21][index],ry:[13,14,12,11][index]};
 }
 const n=index-4;return {art:zone.key+'-'+zone.scenery[n],height:zone.heights[n],rx:zone.rx[n],ry:zone.ry[n]};
}
function environmentCell(kind,gx,gy){
 const stage=zoneStage()-1,seed=zoneNumber()*17+stage*41,key=[zoneNumber(),kind,stage,gx,gy].join(':');
 if(environmentCells.has(key))return environmentCells.get(key);
 const result=[],x=gx*260+130+(rng(gx,gy,seed+40)-.5)*84,y=gy*260+130+(rng(gx,gy,seed+88)-.5)*84;
 if(Math.hypot(x,y)>=180&&rng(gx,gy,kind+seed+63)>=.32){
  const index=environmentPick(ENVIRONMENT_ZONES[kind].weights[stage],rng(gx,gy,seed+kind+33));
  result.push({x,y,index,type:['tree','ruin','pillar','rock'][index]||'detail',s:.59+rng(gx,gy,seed+111)*.23,kind});
 }
 if(rng(gx,gy,seed+149)>.27){
  const side=rng(gx,gy,seed+154)>.5?1:-1;
  result.push({x:x+side*(65+rng(gx,gy,seed+151)*24),y:y+34+rng(gx,gy,seed+153)*26,decal:true,index:environmentPick(stage===0?[4,5,1]:stage===1?[3,2,5]:[5,1,4],rng(gx,gy,seed+150)),s:.75+rng(gx,gy,seed+155)*.4,angle:(rng(gx,gy,seed+156)-.5)*.65,kind});
 }
 environmentCells.set(key,result);if(environmentCells.size>4096)environmentCells.delete(environmentCells.keys().next().value);return result;
}
function worldScenery(kind,camX,camY,w,h){
 const step=260,result=[],left=Math.floor((camX-w/2-240)/step),right=Math.ceil((camX+w/2+240)/step),top=Math.floor((camY-h/2-240)/step),bottom=Math.ceil((camY+h/2+200)/step);
 for(let gx=left;gx<=right;gx++)for(let gy=top;gy<=bottom;gy++)result.push(...environmentCell(kind,gx,gy));
 return result;
}
function resolveWorldCollisions(p){
 for(const o of worldScenery(biomeIndex(),p.x,p.y,180,180)){
  if(o.decal)continue;const def=environmentProp(o.kind,o.index);if(!def.rx)continue;
  const rx=def.rx*o.s+9,ry=def.ry*o.s+7,dx=p.x-o.x,dy=p.y+13-(o.y-4*o.s),distance=Math.hypot(dx/rx,dy/ry);
  if(distance<1){if(distance<.001)p.x=o.x+rx;else{p.x=o.x+dx/distance;p.y=o.y-4*o.s+dy/distance-13;}}
 }
}
function drawEnvironmentDecals(objects){
 const zone=ENVIRONMENT_ZONES[biomeIndex()];
 for(const o of objects){if(!o.decal)continue;const image=environmentImage(zone.key+'-'+zone.decals[o.index]);if(!image?.complete||!image.naturalWidth)continue;
  const width=92*o.s,height=width*image.naturalHeight/image.naturalWidth;
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.angle);ctx.globalAlpha=.48+(zoneStage()-1)*.06;ctx.drawImage(image,-width/2,-height/2,width,height);ctx.restore();
 }
}
function scenerySprite(o,kind){
 if(o.decal)return;const def=environmentProp(kind,o.index),height=def.height*o.s;
 const image=def.art?environmentImage(def.art):propImage;
 if(!image?.complete||!image.naturalWidth)return;
 const region=def.art?[0,0,image.naturalWidth,image.naturalHeight]:PROP_REGIONS[kind][def.legacy];
 const [sx,sy,sw,sh]=region,width=height*sw/sh;
 const covers=actor=>actor.y+(actor===game.player?15:(actor.rad||15)*.65)<o.y&&actor.y>o.y-height-20&&Math.abs(actor.x-o.x)<width*.45;
 const fade=covers(game.player)?.32:game.enemies.some(covers)?.52:1;
 ctx.save();ctx.globalAlpha=fade;ellipse(o.x+1,o.y,width*.29,Math.min(9,height*.06),'#09151d38');ctx.drawImage(image,sx,sy,sw,sh,o.x-width/2,o.y-height+3,width,height);ctx.restore();
}
function drawTiles(b,w,h){
 const kind=biomeIndex(),stage=zoneStage(),key=kind+':'+stage,zone=ENVIRONMENT_ZONES[kind];
 primeEnvironment(kind);quad(0,0,w,h,['#2c4438','#3e3834','#343b48','#294854'][kind]);
 const image=stage===1?groundImage:environmentImage(zone.key+'-floor-'+stage);
 if(!image?.complete||!image.naturalWidth){drawFallbackTerrain(b,w,h);return;}
 if(!environmentGroundPatterns.has(key)){
  const sw=stage===1?image.naturalWidth/2:image.naturalWidth,sh=stage===1?image.naturalHeight/2:image.naturalHeight,sx=stage===1?(kind%2)*sw:0,sy=stage===1?Math.floor(kind/2)*sh:0;
  const tile=document.createElement('canvas');tile.width=sw*2;tile.height=sh*2;const c=tile.getContext('2d');
  for(let y=0;y<2;y++)for(let x=0;x<2;x++){c.save();c.translate(x?sw*2:0,y?sh*2:0);c.scale(x?-1:1,y?-1:1);c.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);c.restore();}
  environmentGroundPatterns.set(key,ctx.createPattern(tile,'repeat'));
  if(environmentGroundPatterns.size>4)environmentGroundPatterns.delete(environmentGroundPatterns.keys().next().value);
 }
 const pattern=environmentGroundPatterns.get(key),scale=stage===1?.78:.94;
 pattern.setTransform(new DOMMatrix([scale,0,0,scale,w/2-game.camX,h/2-game.camY]));ctx.save();ctx.globalAlpha=.46;ctx.fillStyle=pattern;ctx.fillRect(0,0,w,h);ctx.restore();
 const light=ctx.createRadialGradient(w*.5,h*.45,30,w*.5,h*.5,Math.max(w,h)*.7);light.addColorStop(0,'#d9e0b40a');light.addColorStop(1,['#081d2b22','#101c2427','#111b262c'][stage-1]);quad(0,0,w,h,light);
}
function assignEnemyAppearance(e){
 if(e.boss||e.elite)return;
 const kind=e.biome??biomeIndex();e.visualType=environmentPick(ENVIRONMENT_MOB_WEIGHTS[zoneStage()-1],rng(e.x*.01,e.y*.01,kind*71+(e.wobble||0)*11+game.phaseSpawned+game.runKills));e.name=ENVIRONMENT_ZONES[kind].monsters[e.visualType];
}
function environmentMobSize(e){
 const kind=e.biome??biomeIndex(),variant=e.visualType||0,base=Math.max(46,e.rad*3.8);
 if(!variant)return {height:base,width:base*CREATURE_REGIONS[kind][0][2]/CREATURE_REGIONS[kind][0][3]};
 const zone=ENVIRONMENT_ZONES[kind],art=ENVIRONMENT_ART[zone.key+'-'+zone.creatures[variant-1]],ratio=art.width/art.height;
 const height=Math.min(base*zone.sizes[variant-1],base*1.3/ratio);return {height,width:height*ratio};
}
function paintEnvironmentMob(e){
 const variant=e.visualType||0,size=environmentMobSize(e);if(!variant)return paintCreature(e,0,size.height);
 const zone=ENVIRONMENT_ZONES[e.biome??biomeIndex()],image=environmentImage(zone.key+'-'+zone.creatures[variant-1]);if(!image?.complete||!image.naturalWidth)return paintCreature(e,0,size.height);
 const motion=zone.motions[variant-1],still=reducedMotion(),t=game.frame*(e.frozen>0?.55:1)+(e.wobble||0),floating=motion==='hover'||motion==='flutter';
 const bob=still?0:floating?Math.sin(t*2.8)*3.2:motion==='hop'?Math.abs(Math.sin(t*6))*2.4:Math.sin(t*8)*.8;
 const tilt=still?0:Math.sin(t*(motion==='scuttle'?10:5))*(floating?.025:motion==='shamble'?.035:.018),feet=e.y+e.rad*.85;
 ctx.save();ellipse(e.x+2,feet+1,size.width*(floating?.24:.32),Math.min(8,size.width*.1),'#03141b80');ctx.translate(e.x,feet-bob);if(e.x>game.player.x)ctx.scale(-1,1);ctx.rotate(tilt);
 if(!still&&e.lastHitAt!==undefined&&game.frame-e.lastHitAt<.10)ctx.filter='brightness(1.35)';
 ctx.drawImage(image,-size.width/2,-size.height,size.width,size.height);ctx.restore();
 if(e.frozen>0){ctx.save();ctx.strokeStyle='#a5e5eb99';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(e.x,feet,Math.max(15,size.width*.28),5,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 return true;
}
