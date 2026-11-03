// Review/test helpers are injected into an isolated browser response only.
function playerFixture(){
 function ready(){return Promise.all([...DeepwellAvatar.images(),...Object.values(equipmentImages||{})].map(image=>image.decode()));}
 function renderToCanvas(options={}){const canvas=document.createElement('canvas');canvas.width=canvas.height=600;const c=canvas.getContext('2d',{willReadFrequently:true});DeepwellAvatar.render(c,{x:240,y:540,scale:2.5,time:1.4,data:{...data,enchant:0,...options.data},...options});return {canvas,c};}
 window.__playerTest={
  ready,
  openCreator(){creator.open();},
  closeCreator(){creator.close();},
  creatorPixels(){const canvas=$('wardrobeCanvas'),r=canvas.getBoundingClientRect(),scale=Math.min(r.width/145,r.height/135)*.89,x=r.width*.5*canvas.width/r.width,y=(r.height*.88-53*scale)*canvas.height/r.height,pixels=canvas.getContext('2d').getImageData(Math.round(x)-3,Math.round(y)-3,7,7).data;let green=0;for(let i=0;i<pixels.length;i+=4)green+=pixels[i+1]-pixels[i];return green/49;},
  fixtures(){return {keys:DeepwellAvatar.assetKeys(),metrics:DeepwellAvatar.metrics(),rasterImages:DeepwellAvatar.images().length,armor:Object.keys(ARMOR_SETS),custom:DeepwellAvatar.normalizeCustom(data.custom),tools:['mine','smith','wood','scavenge','fletch','ward','rune','polish'].map(pose=>({pose,...DeepwellAvatar.toolForPose(pose)}))};},
  joints(){
   let samples=0,maxArmError=0,maxLegError=0,maxGripError=0;const failures=[];
   for(const pose of ['combat','mine','smith','wood','fletch','ward','rune','polish','scavenge'])for(const weapon of Object.keys(WEAPON_TYPES))for(const facing of [-1,1])for(let frame=0;frame<48;frame++){
    const rig=DeepwellAvatar.poseRig({pose,workPhase:frame/48,working:true,attack:pose==='combat'?frame/48:0,charge:.9,aimAngle:Math.sin(frame/48*Math.PI*2)*.8,time:frame/8,vx:-facing,facing,data:{...data,weaponType:weapon}});samples++;
    for(const arm of [rig.frontArm,rig.backArm]){const upper=Math.hypot(arm.elbow.x-arm.shoulder.x,arm.elbow.y-arm.shoulder.y),lower=Math.hypot(arm.hand.x-arm.elbow.x,arm.hand.y-arm.elbow.y);maxArmError=Math.max(maxArmError,Math.abs(upper-arm.lengths[0]),Math.abs(lower-arm.lengths[1]));}
    for(const leg of rig.legs)maxLegError=Math.max(maxLegError,Math.abs(Math.hypot(leg.knee.x-leg.hip.x,leg.knee.y-leg.hip.y)-DeepwellAvatar.metrics().legLengths[0]),Math.abs(Math.hypot(leg.ankle.x-leg.knee.x,leg.ankle.y-leg.knee.y)-DeepwellAvatar.metrics().legLengths[1]));
    if(rig.gripOffset)maxGripError=Math.max(maxGripError,Math.hypot(rig.back.x-rig.main.x-rig.gripOffset.x,rig.back.y-rig.main.y-rig.gripOffset.y));
    if(![rig.head.x,rig.head.y,rig.main.x,rig.back.y].every(Number.isFinite))failures.push({pose,weapon,frame});
   }return {samples,maxArmError,maxLegError,maxGripError,failures};
  },
  bowString(){const canvas=document.createElement('canvas');canvas.width=canvas.height=300;const c=canvas.getContext('2d');c.translate(150,150);c.scale(4,4);paintEquipmentWeapon(c,{...data,weaponType:'bow'},'bow',{x:0,y:0,angle:0});const pixel=c.getImageData(102,150,1,1).data;return {bakedStringAlpha:pixel[3],woodAlpha:c.getImageData(150,150,1,1).data[3]};},
  resting(){return [...['sword','staff'].map(weapon=>({pose:'idle',weapon})),...['mine','smith','wood','fletch','ward','rune','polish','scavenge'].map(pose=>({pose,weapon:'sword'}))].map(({pose,weapon})=>{const rig=DeepwellAvatar.poseRig({pose,working:false,data:{...data,weaponType:weapon}});return {pose,weapon,hip:rig.body.y,main:rig.main,back:rig.back,elbow:rig.backArm.elbow};});},
  continuity(){const out=[];for(const pose of ['mine','smith','wood','fletch','ward','rune','polish','scavenge']){let last=null,largestStep=0;const points=[];for(let frame=0;frame<=120;frame++){const rig=DeepwellAvatar.poseRig({pose,workPhase:frame/120,working:true,data});points.push(rig.main);if(last)largestStep=Math.max(largestStep,Math.hypot(rig.main.x-last.x,rig.main.y-last.y));last=rig.main;}out.push({pose,largestStep,travel:Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))});}return out;},
  attackSeams(){
   const rows=[],distance=(a,b)=>Math.max(...[a.main,a.back,a.frontArm.elbow,a.backArm.elbow,a.head].map((p,i)=>Math.hypot(p.x-[b.main,b.back,b.frontArm.elbow,b.backArm.elbow,b.head][i].x,p.y-[b.main,b.back,b.frontArm.elbow,b.backArm.elbow,b.head][i].y)));
   for(const weapon of Object.keys(WEAPON_TYPES))for(const facing of [-1,1])for(const direction of [-1,0,1])for(const dash of [false,true]){
    const base={pose:'combat',time:1.2,facing,vx:direction*facing,vy:0,dash,data:{...data,weaponType:weapon}},ready=DeepwellAvatar.poseRig({...base,attack:0,charge:weapon==='bow'?1:0}),start=DeepwellAvatar.poseRig({...base,attack:1,charge:0}),rest=DeepwellAvatar.poseRig({...base,attack:0,charge:.38}),end=DeepwellAvatar.poseRig({...base,attack:.0001,charge:.38});
    let last=ready,maxStep=0;for(let frame=0;frame<=120;frame++){const age=frame/120,r=DeepwellAvatar.poseRig({...base,attack:age<.38?1-age/.38:0,charge:age});maxStep=Math.max(maxStep,distance(last,r));last=r;}
    rows.push({weapon,facing,direction,dash,startGap:distance(ready,start),endGap:distance(rest,end),startAngle:Math.abs(ready.angle-start.angle),endAngle:Math.abs(rest.angle-end.angle),maxStep});
   }return rows;
  },
  workContacts(){
   const out=[];for(const pose of ['fletch','rune','polish','scavenge']){
    let contacts=0,maxMiss=0,supportGap=0;for(let frame=0;frame<120;frame++){const r=DeepwellAvatar.poseRig({pose,working:true,workBlend:1,workPhase:frame/120,data}),p=r.workPiece,t=r.toolTip;
     if(r.contact){contacts++;if(pose==='fletch')maxMiss=Math.max(maxMiss,Math.abs(t.y-(p.y+1-(t.x-(p.x-19))*2/31)));if(pose==='rune')maxMiss=Math.max(maxMiss,Math.max(0,Math.hypot((t.x-p.x)/8,(t.y-p.y)/5)-1));if(pose==='polish')maxMiss=Math.max(maxMiss,Math.max(0,Math.hypot(t.x-p.x,t.y-p.y)-5));if(pose==='scavenge')maxMiss=Math.max(maxMiss,Math.abs(t.y+2));}
     if(p){const edge=pose==='fletch'?{x:p.x-16,y:p.y+.8}:pose==='rune'?{x:p.x-8,y:p.y}:{x:p.x-5,y:p.y};supportGap=Math.max(supportGap,Math.hypot(r.back.x-edge.x,r.back.y-edge.y));}
    }out.push({pose,contacts,maxMiss,supportGap});
   }return out;
  },
  toolBounds(){
   const rows=[];for(const [key,pose]of [['mine','mine'],['forge','smith'],['wood','wood'],['fletch','fletch'],['ward','ward'],['rune','rune'],['polish','polish'],['scavenge','scavenge']]){
    let left=Infinity,right=-Infinity;const bound=workshopBounds(key);
    for(let frame=0;frame<120;frame++){const r=DeepwellAvatar.poseRig({pose,working:true,workPhase:frame/120,data}),t=r.tool,a=PLAYER_ART['tool-'+t.key],width=t.height*a.width/a.height;
     for(const u of [0,1])for(const v of [0,1]){const x=(u-t.grip[0])*width,y=(v-t.grip[1])*t.height,px=r.main.x+x*Math.cos(r.angle)-y*Math.sin(r.angle);left=Math.min(left,px);right=Math.max(right,px);}
    }rows.push({pose,left,right,bound});
   }return rows;
  },
  layers(){
   const rows=[];for(const armor of ['',...Object.keys(ARMOR_SETS)])for(const pose of ['idle','mine','smith','wood','fletch','ward','rune','polish','scavenge'])for(const facing of [-1,1])for(const workPhase of [.12,.24,.65]){
    const options={pose,facing,working:true,workBlend:1,workPhase,showWeapon:false,data:{...data,equippedArmor:armor,enchant:0}},rig=DeepwellAvatar.poseRig(options),{canvas,c}=renderToCanvas(options),pixels=c.getImageData(0,0,600,600).data;
    const point=p=>({x:Math.round(240+p.x*2.5*facing),y:Math.round(540+p.y*2.5)}),neck=point(rig.neck),chest=point({x:rig.body.x+Math.sin(rig.body.angle)*13,y:rig.body.y-Math.cos(rig.body.angle)*13});
    let seen=new Uint8Array(600*600),queue=[chest.y*600+chest.x];seen[queue[0]]=1;for(let at=0;at<queue.length;at++){const p=queue[at],x=p%600,y=Math.floor(p/600);for(const next of [x>0?p-1:-1,x<599?p+1:-1,y>0?p-600:-1,y<599?p+600:-1])if(next>=0&&!seen[next]&&pixels[next*4+3]>28){seen[next]=1;queue.push(next);}}
    const joints=[rig.frontArm.shoulder,rig.frontArm.elbow,rig.frontArm.hand,rig.backArm.shoulder,rig.backArm.elbow,rig.backArm.hand,...rig.legs.flatMap(leg=>[leg.hip,leg.knee,leg.ankle])],detached=joints.map(point).map((p,index)=>seen[p.y*600+p.x]?null:index).filter(index=>index!==null);
    rows.push({armor,pose,facing,workPhase,neckConnected:!!seen[neck.y*600+neck.x],detached,visiblePixels:queue.length});
   }return rows;
  },
  workArmCoverage(){
   const rows=[],canvas=document.createElement('canvas');canvas.width=240;canvas.height=270;const c=canvas.getContext('2d',{willReadFrequently:true});
   const skin=['#e3b18a','#9f7c61','#fec69b'].map(hex=>hex.slice(1).match(/../g).map(value=>parseInt(value,16)));
   for(const pose of ['mine','smith','wood','fletch','ward','rune','polish','scavenge'])for(const facing of [-1,1])for(const scale of [1.5,2.5]){
    let covered=0,total=0;const misses=[];
    for(let frame=0;frame<48;frame++){
     const options={pose,facing,working:true,workBlend:1,workPhase:frame/48,time:0,data:{...data,custom:{...DeepwellAvatar.BASE},equippedArmor:'',enchant:0}},rig=DeepwellAvatar.poseRig(options),arm=rig.backArm;
     c.clearRect(0,0,240,270);DeepwellAvatar.render(c,{...options,x:110,y:260,scale});
     // A torso-colored interruption below the sleeve is the floating-arm bug:
     // joint coordinates and whole-character alpha connectivity cannot catch it.
     for(const t of [.55,.65,.80]){
      const x=Math.round(110+(arm.shoulder.x+(arm.elbow.x-arm.shoulder.x)*t)*scale*facing),y=Math.round(260+(arm.shoulder.y+(arm.elbow.y-arm.shoulder.y)*t)*scale),pixels=c.getImageData(x-1,y-1,3,3).data;
      let visible=false;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>240&&skin.some(rgb=>rgb.every((value,k)=>Math.abs(pixels[i+k]-value)<12)))visible=true;
      total++;if(visible)covered++;else misses.push({frame,t});
     }
    }rows.push({pose,facing,scale,covered,total,misses});
   }return rows;
  },
  gallery(){
   const canvas=document.createElement('canvas');canvas.id='playerReviewCanvas';canvas.width=1540;canvas.height=400;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d'),sets=['',...Object.keys(ARMOR_SETS)];c.fillStyle='#28271f';c.fillRect(0,0,1540,400);c.font='15px Georgia';
   sets.forEach((id,i)=>{c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(ARMOR_SETS[id]?.name||'Travel clothes',i*220+104,30);DeepwellAvatar.render(c,{x:i*220+94,y:365,scale:id.startsWith('melee')?2.27:id.startsWith('ranged')?2.33:id.startsWith('magic')?2.35:2.6,time:1.5,pose:'idle',showWeapon:false,data:{...data,equippedArmor:id,enchant:0}});});
  },
  weapons(){
   const canvas=document.createElement('canvas');canvas.id='playerReviewCanvas';canvas.width=1440;canvas.height=1240;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d'),weapons=Object.keys(WEAPON_TYPES);c.fillStyle='#28271f';c.fillRect(0,0,1440,1240);c.font='14px Georgia';
   for(let row=0;row<4;row++)weapons.forEach((weapon,col)=>{const style=styleForWeapon(weapon),outfit=style+'_2';c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(WEAPON_TYPES[weapon].name+(row%2?' · attack':' · ready')+(row<2?' · right':' · left'),col*240+110,row*310+22);DeepwellAvatar.render(c,{x:col*240+(row<2?95:145),y:row*310+285,scale:2,time:1.2,pose:'combat',vx:weapon==='bow'?-1:0,facing:row<2?1:-1,attack:row%2?.44:0,charge:.9,data:{...data,weaponType:weapon,equippedArmor:outfit,enchant:0,arrows:100,styles:{...data.styles,[style]:{...data.styles[style],tier:2}}}});});
  },
  actions(){
   const canvas=document.createElement('canvas');canvas.id='playerReviewCanvas';canvas.width=1760;canvas.height=1040;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d'),poses=['mine','smith','wood','fletch','ward','rune','polish','scavenge'];c.fillStyle='#28271f';c.fillRect(0,0,1760,1040);c.font='14px Georgia';
   for(let row=0;row<4;row++)poses.forEach((pose,col)=>{c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(pose,col*220+100,row*260+24);DeepwellAvatar.render(c,{x:col*220+85,y:row*260+245,scale:1.7,time:1.3,pose,workPhase:[.12,.37,.62,.87][row],working:true,workBlend:1,data:{...data,equippedArmor:pose==='ward'||pose==='rune'?'magic_2':'melee_1',enchant:0}});});
  },
  mix(){const pieces={head:'magic_2',shoulders:'melee_2',chest:'ranged_1',legs:'ranged_2',boots:'base',gloves:'melee_1'};return DeepwellAvatar.appearance(data,pieces);},
  icons(){const out={};for(const [id,set]of Object.entries(ARMOR_SETS)){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),g=c.createRadialGradient(112,86,8,128,128,123);g.addColorStop(0,'#776b48');g.addColorStop(.65,'#3b3a2b');g.addColorStop(1,'#171b18');c.fillStyle=g;c.beginPath();c.arc(128,128,121,0,Math.PI*2);c.fill();c.strokeStyle='#aa8c54';c.lineWidth=5;c.stroke();c.strokeStyle='#e2c997';c.lineWidth=1.5;c.beginPath();c.arc(128,128,116,0,Math.PI*2);c.stroke();DeepwellAvatar.render(c,{x:127,y:232,scale:set.style==='melee'?1.55:1.59,time:1.6,pose:'idle',showWeapon:false,data:{...data,equippedArmor:id,enchant:0}});out['armor-set-'+id+'.svg']=canvas.toDataURL('image/webp',.94);out['codex-armor_set_'+id+'.svg']=out['armor-set-'+id+'.svg'];
  }
  for(const [style,color]of Object.entries({melee:'#48525a',ranged:'#384e3a',magic:'#39445d'})){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),g=c.createRadialGradient(110,80,8,128,128,122);g.addColorStop(0,color);g.addColorStop(1,'#161a18');c.fillStyle=g;c.beginPath();c.arc(128,128,121,0,Math.PI*2);c.fill();c.save();c.beginPath();c.arc(128,128,115,0,Math.PI*2);c.clip();DeepwellAvatar.render(c,{x:style==='ranged'?105:style==='melee'?120:127,y:style==='ranged'?408:419,scale:style==='melee'?2.85:style==='ranged'?2.75:3,time:1.5,pose:'idle',showWeapon:false,data:{...data,equippedArmor:style+'_1',enchant:0}});c.restore();c.strokeStyle='#bda06b';c.lineWidth=5;c.beginPath();c.arc(128,128,121,0,Math.PI*2);c.stroke();out['style-'+style+'-armor.svg']=canvas.toDataURL('image/webp',.94);out['codex-armor_'+style+'.svg']=out['style-'+style+'-armor.svg'];
  }
  for(const name of ['pickaxe','hatchet','mattock']){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),g=c.createRadialGradient(105,90,8,128,128,121);g.addColorStop(0,'#657477');g.addColorStop(1,'#17262b');c.fillStyle=g;c.beginPath();c.arc(128,128,121,0,Math.PI*2);c.fill();c.strokeStyle='#9ba590';c.lineWidth=4;c.stroke();const image=new Image();image.src=PLAYER_ART['tool-'+name].src;const loaded=DeepwellAvatar.images().find(i=>i.src===image.src);if(!loaded?.naturalWidth)throw Error('Tool not ready');const height=190,width=height*loaded.naturalWidth/loaded.naturalHeight;c.save();c.translate(128,128);c.rotate(.30);c.drawImage(loaded,-width/2,-height/2,width,height);c.restore();out['tool-'+name+'.svg']=canvas.toDataURL('image/webp',.94);out['codex-tool_'+name+'.svg']=out['tool-'+name+'.svg'];
  }return out;}
 };
}
module.exports={playerFixture};
