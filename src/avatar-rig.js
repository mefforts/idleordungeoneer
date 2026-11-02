/* Modular player renderer. All coordinates use a grounded foot origin.
 * Separate joints, material layers and grip sockets serve every activity. */
(function(global){
'use strict';
const BASE=Object.freeze({hair:0,eyes:0,chest:0,legs:0,boots:0,hairColor:'#74513b',eyeColor:'#2387aa',chestColor:'#72937c',legsColor:'#705b48',bootsColor:'#93704f',skinColor:'#e3b18a'});
const STYLE_COUNTS=Object.freeze({hair:6,eyes:4,chest:4,legs:3,boots:4});
const COLOR_SETS=Object.freeze({hairColor:['#74513b','#3f3332','#c59650','#dcb76e','#a75f41','#853f40','#655374','#d8d2b9','#6c7c77','#f1d7ac'],eyeColor:['#2387aa','#3f9d6e','#8564c1','#b78b42','#546b9b','#d76b6b','#4aaeb2','#7f674f','#b1cae0','#d6ae64'],chestColor:['#72937c','#577da0','#8d5b65','#aa8952','#655a8f','#3f8c83','#9a6b44','#b0afa1','#464b55','#c17c6d'],legsColor:['#705b48','#484c57','#4f765c','#8e705b','#5f5380','#978c77','#333f48','#8f5861','#a28d64','#607c84'],bootsColor:['#93704f','#4e4243','#65534c','#6a7779','#8e5f53','#a18d69','#4a5c52','#70718a','#b07a43','#414a56'],skinColor:['#e3b18a','#f1cba9','#dba07e','#bc8068','#a86952','#80513f','#f1d6bc','#ce9876','#9c6854','#684737']});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
const PHYSICAL_SLOTS=Object.freeze(['head','shoulders','chest','legs','boots','gloves']);
const TOOLS=Object.freeze({mine:{key:'pickaxe',name:'Pickaxe',height:50,grip:[.5,.84]},smith:{key:'hammer',name:'Smithing hammer',height:44,grip:[.5,.82]},wood:{key:'hatchet',name:'Hatchet',height:50,grip:[.24,.84]},scavenge:{key:'mattock',name:'Mattock',height:32,grip:[.466,.84]},fletch:{key:'knife',name:'Fletching knife',height:17,grip:[.5,.82]},ward:{key:'spindle',name:'Warding spindle',height:24,grip:[.5,.83]},rune:{key:'burin',name:'Engraving burin',height:16,grip:[.5,.84]},polish:{key:'file',name:'Jeweler’s file',height:14,grip:[.5,.83]}});
const ARM_LENGTHS=Object.freeze([20,19.5]),LEG_LENGTHS=Object.freeze([19,18]);
const motionPreference=global.matchMedia?.('(prefers-reduced-motion: reduce)');
let assets={},images=new Map(),tints=new Map();
function normalizeCustom(src){const out={...BASE};if(!src||typeof src!=='object')return out;for(const [key,count]of Object.entries(STYLE_COUNTS)){const value=Number(src[key]);out[key]=Number.isInteger(value)?clamp(value,0,count-1):BASE[key];}for(const [key,colors]of Object.entries(COLOR_SETS))if(colors.includes(src[key]))out[key]=src[key];return out;}
function setAssets(source){assets=source;images.clear();tints.clear();for(const [key,asset]of Object.entries(assets)){const image=new Image();image.decoding='async';image.src=asset.src;images.set(key,image);}}
function imageFor(key,tint){const image=images.get(key);if(!image?.complete||!image.naturalWidth)return null;if(!tint)return image;const cache=key+':'+tint;if(tints.has(cache))return tints.get(cache);const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const c=canvas.getContext('2d');c.drawImage(image,0,0);c.globalCompositeOperation='source-in';c.fillStyle=tint;c.fillRect(0,0,canvas.width,canvas.height);c.globalCompositeOperation='multiply';c.drawImage(image,0,0);c.globalCompositeOperation='destination-in';c.drawImage(image,0,0);if(tints.size>192)tints.delete(tints.keys().next().value);tints.set(cache,canvas);return canvas;}
function sprite(c,key,x,y,w,h,tint){const image=imageFor(key,tint);if(!image)return false;c.drawImage(image,x,y,w,h);return true;}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function stroke(c,a,b,color,width){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function shade(color,factor){return '#'+color.slice(1).match(/../g).map(part=>clamp(Math.round(parseInt(part,16)*factor),0,255).toString(16).padStart(2,'0')).join('');}
function tier(n){return n<=0?0:n<3?1:n<6?2:3;}
function appearance(data={},overrides={}){
 const set=global.DeepwellEquipmentArt?.describe(data).armor||null,pieces={};
 for(const slot of PHYSICAL_SLOTS){const candidate=overrides[slot];pieces[slot]=candidate==='base'||assets['armor-'+candidate+'-head']?candidate:set?.id||'base';}
 return {weapon:Math.max(0,Number(data.weapon)||0),armor:Math.max(0,Number(data.armor)||0),enchant:Math.max(0,Number(data.enchant)||0),armorSet:set?.id||'',armorTier:set?.tier||0,head:pieces.head==='base'?'hair':pieces.head.startsWith('melee')?'helmet':'hood',chest:pieces.chest==='base'?'tunic':pieces.chest.startsWith('magic')?'robes':pieces.chest.startsWith('ranged')?'ranger':'armor',legs:pieces.legs.startsWith('magic')?'robe':'trousers',boots:pieces.boots==='base'?'leather':'reinforced',cape:'none',mainHand:data.weaponType||'sword',offHand:data.weaponType==='shield'?'buckler':'none',aura:data.enchant>0?'lightning':'none',pieces};
}
function transform(body,point){const y=point.y+40,cs=Math.cos(body.angle),sn=Math.sin(body.angle);return {x:body.x+point.x*cs-y*sn,y:body.y+point.x*sn+y*cs};}
function inverseKinematics(root,target,bend,lengths){const dx=target.x-root.x,dy=target.y-root.y,raw=Math.max(.0001,Math.hypot(dx,dy)),distance=clamp(raw,Math.abs(lengths[0]-lengths[1])+.01,lengths[0]+lengths[1]-.02),ux=dx/raw,uy=dy/raw,along=(lengths[0]**2-lengths[1]**2+distance**2)/(2*distance),height=Math.sqrt(Math.max(0,lengths[0]**2-along**2));return {shoulder:{...root},hand:{x:root.x+ux*distance,y:root.y+uy*distance},elbow:{x:root.x+ux*along-uy*height*bend,y:root.y+uy*along+ux*height*bend},lengths:[...lengths]};}
function clipSample(keys,phase){let index=0;while(index<keys.length-2&&phase>keys[index+1][0])index++;const a=keys[index],b=keys[index+1],t=smooth(clamp((phase-a[0])/(b[0]-a[0]),0,1));return a.slice(1).map((value,i)=>lerp(value,b[i+1],t));}
function projectHand(point,root){const distance=Math.hypot(point.x-root.x,point.y-root.y),reach=ARM_LENGTHS[0]+ARM_LENGTHS[1]-.05;if(distance<=reach)return {...point};return {x:root.x+(point.x-root.x)/distance*reach,y:root.y+(point.y-root.y)/distance*reach};}
function poseRig(options={}){
 const {pose='idle',data={}}=options,reduced=!!options.reducedMotion||!!data.reducedMotion||!!motionPreference?.matches,time=reduced?0:(options.time||0),weapon=data.weaponType||'sword',activity=Object.hasOwn(TOOLS,pose)||pose==='cast',working=options.working!==false,walking=!reduced&&(pose==='walk'||pose==='combat'&&Math.hypot(options.vx||0,options.vy||0)>.1),backpedal=walking&&(options.vx||0)*(options.facing||1)<-.1;
 const a=reduced?0:clamp(options.attack||0,0,1),attack=pose==='attack'&&a===0?.65:a,walk=walking?Math.sin(time*8)*(backpedal?-1:1):0,phase=((options.workPhase??time*1.05)%1+1)%1,cycle=phase*Math.PI*2,breath=Math.sin(time*2.25)*.32;
 const body={x:0,y:-42+(walking?Math.abs(walk)*1.4:breath),angle:options.dash?.18:0};let main={x:21,y:-35},back={x:-17,y:-31},angle=.35,headAngle=0,kneeling=false,twoHand=0;
 if(walking){main.y+=walk*1.1;back.x+=walk*5;back.y-=Math.abs(walk)*.7;}
 if(weapon==='shield')back={x:-14,y:-49};
 if(attack>0&&!['bow','staff'].includes(weapon)){const resting=weapon==='polearm'?[17,-45,.38]:weapon==='greatsword'?[16,-46,.4]:[21,-35,.35],sample=clipSample([[0,...resting],[.16,27,-42,1.9],[.43,31,-51,1.45],[.72,22,-59,.35],[1,16,-61,.12]],attack);[main.x,main.y,angle]=sample;body.angle=Math.sin(attack*Math.PI)*.12;back={x:lerp(-17,-21,Math.sin(attack*Math.PI)),y:lerp(-31,-43,Math.sin(attack*Math.PI))};if(weapon==='shield')back={x:lerp(-14,-8,Math.sin(attack*Math.PI)),y:lerp(-49,-54,Math.sin(attack*Math.PI))};}
 if(weapon==='polearm'){if(!attack){main={x:17,y:-45};angle=.38;}else angle=Math.min(1.12,angle);twoHand=-13;}
 if(weapon==='greatsword'){if(!attack){main={x:16,y:-46};angle=.40;}twoHand=7;}
 if(weapon==='bow'){const aim=clamp(options.aimAngle||0,-.8,.8),draw=clamp(((options.charge||0)-.45)/.55,0,1);main={x:8+(24+Math.sin(attack*Math.PI))*Math.cos(aim),y:-60+(24+Math.sin(attack*Math.PI))*Math.sin(aim)};angle=aim;twoHand=-(12+draw*14);}
 if(weapon==='staff'){main={x:20+attack*3,y:-35-attack*13};angle=.22+attack*.18;if(attack>0){const cast=Math.sin(attack*Math.PI/2);back={x:lerp(-17,17,cast),y:lerp(-31,-59,cast)};}}
 if(activity){
  body.x=3;body.angle=.18;main={x:24,y:-50};back={x:12,y:-45};angle=2.3;twoHand=0;headAngle=.08;
  if(['mine','smith','wood'].includes(pose)){
   const impact=clipSample([[0,.72],[.24,0],[.40,.05],[.65,1],[.76,.98],[1,.72]],phase)[0],lift=working?impact:1;
   body.angle=working?.07+impact*.20:.04;body.x=working?3+impact*3:0;main={x:working?20+lift*9:22,y:working?-68+lift*27:-36};angle=working?lerp(.22,pose==='smith'?1.72:pose==='wood'?1.64:1.53,lift):.5;
   back=working?{x:14,y:-43}:{x:-17,y:-31};twoHand=working&&pose!=='smith'?13:0;headAngle=working?.10+lift*.07:0;
  }else if(pose==='fletch'){main={x:24+Math.sin(cycle)*3*(working?1:0),y:-54+Math.cos(cycle)*.8};angle=2.55+Math.sin(cycle)*.12;back={x:12,y:-43};}
  else if(pose==='ward'||pose==='cast'){body.angle=.08+Math.sin(cycle)*.025*(working?1:0);main={x:34+Math.sin(cycle)*2,y:-45+Math.cos(cycle)*2};back={x:12-Math.sin(cycle)*2,y:-56-Math.cos(cycle)*2};angle=-.25+Math.sin(cycle)*.18;}
  else if(pose==='rune'){main={x:22+Math.sin(cycle)*2.7,y:-52+Math.cos(cycle)*1.4};back={x:12,y:-43};angle=2.3+Math.sin(cycle)*.1;headAngle=.14;}
  else if(pose==='polish'){main={x:23+Math.sin(cycle)*3,y:-51+Math.sin(cycle*2)*.7};back={x:13,y:-43};angle=2.3+Math.sin(cycle)*.09;headAngle=.16;}
  else if(pose==='scavenge'){kneeling=true;body.x=-9;body.y=-17;body.angle=1.03+Math.sin(cycle)*.035*(working?1:0);main={x:37+Math.sin(cycle)*4*(working?1:0),y:-5-Math.max(0,Math.sin(cycle))*6*(working?1:0)};back={x:11,y:-5};angle=1.5+Math.sin(cycle)*.2*(working?1:0);headAngle=.35;}
  if(!working&&!['mine','smith','wood','scavenge'].includes(pose)){main={x:23,y:-36};back={x:-17,y:-31};angle=.4;body.angle=.04;}
 }
 const blend=options.workBlend??(working?1:0);
 if(activity&&options.workBlend!==undefined&&!options._unblended&&(working?blend<1:blend>0)){
  const activeRig=poseRig({...options,working:true,_unblended:true}),restRig=poseRig({...options,working:false,_unblended:true}),amount=smooth(blend);
  for(const key of ['x','y','angle'])body[key]=lerp(restRig.body[key],activeRig.body[key],amount);
  main={x:lerp(restRig.main.x,activeRig.main.x,amount),y:lerp(restRig.main.y,activeRig.main.y,amount)};back={x:lerp(restRig.back.x,activeRig.back.x,amount),y:lerp(restRig.back.y,activeRig.back.y,amount)};
  angle=lerp(restRig.angle,activeRig.angle,amount);headAngle=lerp(restRig.head.angle,activeRig.head.angle,amount);twoHand=0;
 }
 if(!reduced&&!activity&&options.hit>0){const recoil=clamp(options.hit,0,1);body.angle-=recoil*.09;body.x-=recoil*1.5;}
 const frontRoot=transform(body,{x:12,y:-69}),backRoot=transform(body,{x:-10,y:-68});
 let offset=null;
 if(weapon==='bow'&&!activity)offset={x:twoHand*Math.cos(angle),y:twoHand*Math.sin(angle)};
 else if(twoHand)offset={x:-Math.sin(angle)*twoHand,y:Math.cos(angle)*twoHand};
 if(offset){for(let pass=0;pass<12;pass++){main=projectHand(main,frontRoot);const projected=projectHand({x:main.x+offset.x,y:main.y+offset.y},backRoot);main={x:projected.x-offset.x,y:projected.y-offset.y};}back={x:main.x+offset.x,y:main.y+offset.y};}
 const frontArm=inverseKinematics(frontRoot,main,-1,ARM_LENGTHS),backArm=inverseKinematics(backRoot,back,1,ARM_LENGTHS);main=frontArm.hand;back=backArm.hand;
 const headBase=transform(body,{x:0,y:-75}),head={x:headBase.x+Math.sin(headAngle)*10,y:headBase.y-Math.cos(headAngle)*10,angle:headAngle},legs=[];
 for(const side of [-1,1]){const hip={x:body.x+side*6,y:body.y};let ankle;if(kneeling)ankle={x:side<0?-28:-13,y:-5};else ankle={x:side*6+side*walk*8,y:-5-(walking?Math.max(0,Math.cos(time*8+(side<0?Math.PI:0)))*4:0)};let joint=inverseKinematics(hip,ankle,-1,LEG_LENGTHS);if(kneeling){const knee={x:hip.x+Math.sqrt(Math.max(0,LEG_LENGTHS[0]**2-(-3-hip.y)**2)),y:-3};ankle={x:knee.x-Math.sqrt(LEG_LENGTHS[1]**2-4),y:-5};joint={shoulder:hip,elbow:knee,hand:ankle,lengths:LEG_LENGTHS};}legs.push({side,hip:joint.shoulder,knee:joint.elbow,ankle:joint.hand,footAngle:kneeling?-.3:0});}
 const point=(x,y)=>({x:main.x+x*Math.cos(angle)-y*Math.sin(angle),y:main.y+x*Math.sin(angle)+y*Math.cos(angle)}),tool=TOOLS[pose],tip=tool?point(0,-tool.height*tool.grip[1]):null;
 return {weapon,activity,walking,backpedal,walk,stroke:Math.sin(attack*Math.PI),angle,main,back,body,head,kneeling,phase,frontArm,backArm,legs,neck:headBase,bowUpper:point(-12,-25),bowLower:point(-12,25),arrowTip:point(27,0),toolTip:tip,tool:tool||null,gripOffset:offset};
}
function assetKey(kit,part){const slot={head:'head',shoulder:'shoulders',chest:'chest',thigh:'legs',shin:'legs',boot:'boots',upperarm:'chest',forearm:'chest',hand:'gloves',grip:'gloves',reach:'gloves'}[part],prefix=kit.pieces[slot]||'base';return prefix==='base'?'base-'+part:'armor-'+prefix+'-'+part;}
function pieceTint(kit,part,look){if(!assetKey(kit,part).startsWith('base-'))return null;return ['head','upperarm','forearm','hand','grip','reach'].includes(part)?look.skinColor:['thigh','shin'].includes(part)?look.legsColor:part==='boot'?look.bootsColor:look.chestColor;}
function segment(c,key,root,end,width,tint,side=1){
 const length=Math.hypot(end.x-root.x,end.y-root.y),image=imageFor(key,tint),bind=assets[key]?.bind;
 const fill=tint?shade(tint,.72):(key.includes('melee_')?'#585e5b':key.includes('magic_2')?'#364468':key.includes('magic_1')?'#9c9078':'#65533b');
 c.save();c.translate(root.x,root.y);c.rotate(Math.atan2(end.y-root.y,end.x-root.x)-Math.PI/2);if(side<0)c.scale(-1,1);
 c.beginPath();c.roundRect(-width/2,-1.25,width,length+2.5,1.2);c.clip();c.fillStyle=fill;c.fillRect(-width/2,-1.25,width,length+2.5);
 if(image&&bind){const [rx,ry]=bind.root,[ex,ey]=bind.tip,rest=Math.hypot(ex-rx,ey-ry),ux=(ex-rx)/rest,uy=(ey-ry)/rest,sx=width/bind.width,sy=length/rest,a=sx*uy,b=sy*ux,cc=-sx*ux,d=sy*uy;c.transform(a,b,cc,d,-a*rx-cc*ry,-b*rx-d*ry);c.drawImage(image,0,0);}
 else if(image)c.drawImage(image,-width/2,0,width,length);c.restore();
}
function paintLeg(c,rig,leg,kit,look){
 const mage=kit.pieces.legs.startsWith('magic'),plain=kit.pieces.legs==='base',width=mage?15.5:10.5;
 segment(c,assetKey(kit,'thigh'),leg.hip,leg.knee,width,pieceTint(kit,'thigh',look),leg.side);
 segment(c,assetKey(kit,'shin'),leg.knee,leg.ankle,mage?13.5:9,pieceTint(kit,'shin',look),leg.side);
 if(plain&&look.legs===1){c.save();c.translate(lerp(leg.knee.x,leg.ankle.x,.65),lerp(leg.knee.y,leg.ankle.y,.65));c.rotate(Math.atan2(leg.ankle.y-leg.knee.y,leg.ankle.x-leg.knee.x)-Math.PI/2);sprite(c,'base-cuff',-5,-4,10,8,look.bootsColor);c.restore();}
 if(plain&&look.legs===2)sprite(c,'base-shoulder',leg.knee.x-5.5,leg.knee.y-3.5,11,8,look.bootsColor);
 c.save();c.translate(leg.ankle.x,leg.ankle.y);c.rotate(leg.footAngle);const base=kit.pieces.boots==='base',height=base?[10,14,11,12][look.boots]:10;sprite(c,assetKey(kit,'boot'),-5.8,6-height,15,height,pieceTint(kit,'boot',look));
 if(base&&look.boots===2)for(const y of [-1,2])stroke(c,{x:-4,y},{x:3,y},shade(look.bootsColor,1.35),.8);c.restore();
}
function paintArm(c,joints,side,kit,look){const tint=pieceTint(kit,'upperarm',look);segment(c,assetKey(kit,'upperarm'),joints.shoulder,joints.elbow,kit.pieces.chest!=='base'?9.2:7.2,tint,side);segment(c,assetKey(kit,'forearm'),joints.elbow,joints.hand,kit.pieces.chest!=='base'?8.2:6.4,pieceTint(kit,'forearm',look),side);c.save();c.translate(joints.shoulder.x,joints.shoulder.y);c.rotate((Math.atan2(joints.elbow.y-joints.shoulder.y,joints.elbow.x-joints.shoulder.x)-Math.PI/2)*.65);if(side<0)c.scale(-1,1);sprite(c,assetKey(kit,'shoulder'),-7,-4,14,11,pieceTint(kit,'shoulder',look));c.restore();}
function paintHand(c,point,angle,side,kit,look,handPose='rest'){
 const part=handPose==='grip'?'grip':handPose==='reach'&&kit.pieces.gloves==='base'?'reach':'hand',width=handPose==='grip'?8.6:7.6,height=handPose==='grip'?9.6:10.2;
 c.save();c.translate(point.x,point.y);c.rotate(angle);if(side<0)c.scale(-1,1);sprite(c,assetKey(kit,part),-width/2,-height*.60,width,height,pieceTint(kit,part,look));c.restore();
}
function paintBody(c,rig,kit,look){
 c.save();c.translate(rig.body.x,rig.body.y);c.rotate(rig.body.angle);sprite(c,assetKey(kit,'chest'),-14,-31,28,34,pieceTint(kit,'chest',look));
 if(kit.pieces.chest==='base'){const hem=[11,17,12,13][look.chest];sprite(c,'base-waist',-14,-4,28,hem,look.chestColor);
  if(look.chest===1)stroke(c,{x:-1,y:-28},{x:-1,y:8},shade(look.chestColor,.6),1.1);
  if(look.chest===2)stroke(c,{x:-10,y:-28},{x:10,y:-4},shade(look.bootsColor,.8),2.6);
  if(look.chest===3){stroke(c,{x:-3,y:-29},{x:-1,y:3},shade(look.chestColor,.6),1.4);stroke(c,{x:5,y:-28},{x:8,y:-19},shade(look.chestColor,1.2),2);}
 }c.restore();
}
function paintHead(c,rig,kit,look,time){c.save();c.translate(rig.head.x,rig.head.y);c.rotate(rig.head.angle);
 const armored=kit.pieces.head!=='base';if(armored){sprite(c,assetKey(kit,'head'),-14,-16,29,34);c.save();c.beginPath();c.moveTo(-5,-4);c.quadraticCurveTo(2,-9,10,-5);c.lineTo(10,4);c.quadraticCurveTo(7,13,1,13);c.quadraticCurveTo(-5,9,-5,-4);c.clip();}
 sprite(c,'base-head',-11,-14,22,28,look.skinColor);
 const eyes=[{x:-1.2,y:-1.4},{x:6.7,y:-1.3}],blink=Math.sin(time*1.91+.9)>.996;
 for(const [index,eye]of eyes.entries()){const width=(index?1.6:2.0)*(look.eyes===2?1.1:1);if(blink){ellipse(c,eye.x,eye.y,width+.3,1.6,shade(look.skinColor,.78));stroke(c,{x:eye.x-width,y:eye.y},{x:eye.x+width,y:eye.y},'#433d37',.6);}else{ellipse(c,eye.x,eye.y,width,look.eyes===1?.8:1.15,'#f0eadc');ellipse(c,eye.x+.35,eye.y,1.04,look.eyes===1?.86:1.18,shade(look.eyeColor,.72));ellipse(c,eye.x+.48,eye.y,.56,.97,'#242923');stroke(c,{x:eye.x-width,y:eye.y-.85},{x:eye.x+width*.85,y:eye.y-1.0},'#4b4138',.48);ellipse(c,eye.x+.15,eye.y-.35,.23,.26,'#fff8e9');if(look.eyes===3)stroke(c,{x:eye.x-width,y:eye.y-2},{x:eye.x+width*.7,y:eye.y-1.5},'#51453a',.7);}}
 if(armored)c.restore();else{const long=look.hair===3||look.hair===4;sprite(c,'hair-'+look.hair,-12.8,long?-20.5:-19.5,27,long?30:23,look.hairColor);}
 c.restore();}
function paintTool(c,rig){const tool=rig.tool;if(!tool)return false;const asset=assets['tool-'+tool.key],image=imageFor('tool-'+tool.key);if(!image||!asset)return false;const width=tool.height*asset.width/asset.height;c.save();c.translate(rig.main.x,rig.main.y);c.rotate(rig.angle);c.drawImage(image,-tool.grip[0]*width,-tool.grip[1]*tool.height,width,tool.height);c.restore();return true;}
function paintAura(c,level,time){if(level<=0)return;c.save();c.globalAlpha=.25;for(let i=0;i<3;i++){const angle=time*.8+i*Math.PI*2/3;ellipse(c,Math.cos(angle)*20,-48+Math.sin(angle)*25,1.3,2,'#91d7df');}c.restore();}
function render(c,options={}){
 const {x=0,y=0,scale=1,time=0,data={},facing=1}=options,look=normalizeCustom(data.custom),kit=appearance(data,options.parts),rig=poseRig(options),art=global.DeepwellEquipmentArt;
 c.save();c.translate(x,y);c.scale(scale*(facing<0?-1:1),scale);ellipse(c,1,1,16,3.4,'#0b0f1260');paintAura(c,kit.enchant,data.reducedMotion||options.reducedMotion||motionPreference?.matches?0:time);
 for(const leg of rig.legs)paintLeg(c,rig,leg,kit,look);
 const collar=transform(rig.body,{x:0,y:-71});stroke(c,collar,rig.neck,shade(look.skinColor,.82),8);stroke(c,{x:collar.x-1,y:collar.y},{x:rig.neck.x-1,y:rig.neck.y},look.skinColor,5.8);
 paintBody(c,rig,kit,look);paintArm(c,rig.backArm,-1,kit,look);paintHead(c,rig,kit,look,data.reducedMotion||options.reducedMotion||motionPreference?.matches?0:time);paintArm(c,rig.frontArm,1,kit,look);
 if(rig.activity)paintTool(c,rig);else if(options.showWeapon!==false){
  art?.paintWeapon(c,data,rig.weapon==='shield'?'sword':rig.weapon,{x:rig.main.x,y:rig.main.y,angle:rig.angle});
  if(rig.weapon==='shield')art?.paintWeapon(c,data,'shield',{x:rig.back.x,y:rig.back.y,angle:-.12});
  if(rig.weapon==='bow'){c.beginPath();c.moveTo(rig.bowUpper.x,rig.bowUpper.y);c.lineTo(rig.back.x,rig.back.y);c.lineTo(rig.bowLower.x,rig.bowLower.y);c.strokeStyle='#ddcba3';c.lineWidth=.65;c.stroke();if(options.charge>.45&&((data.arrows||0)>0||(data.ammoCharges?.arrows||0)>0))stroke(c,rig.back,rig.arrowTip,'#cfb682',.9);}
  if(rig.weapon==='staff'&&options.attack>0)ellipse(c,rig.back.x,rig.back.y,3+rig.stroke*2,3+rig.stroke*2,'#a4d9e2aa');
 }
 const wrist=arm=>Math.atan2(arm.hand.y-arm.elbow.y,arm.hand.x-arm.elbow.x)-Math.PI/2;
 if(rig.weapon!=='shield'||rig.activity)paintHand(c,rig.back,wrist(rig.backArm),-1,kit,look,rig.gripOffset?'grip':rig.activity&&['ward','cast'].includes(options.pose)?'reach':'rest');paintHand(c,rig.main,wrist(rig.frontArm),1,kit,look,rig.activity?rig.tool?'grip':'reach':options.showWeapon===false?'rest':'grip');c.restore();return kit;
}
global.DeepwellAvatar=Object.freeze({render,appearance,poseRig,tier,normalizeCustom,STYLE_COUNTS,COLOR_SETS,BASE,setAssets,images:()=>[...images.values()],assetKeys:()=>Object.keys(assets),metrics:()=>({height:100,version:1,armLengths:[...ARM_LENGTHS],legLengths:[...LEG_LENGTHS],physicalSlots:[...PHYSICAL_SLOTS]}),toolForPose:pose=>TOOLS[pose]||null,slots:Object.freeze([...PHYSICAL_SLOTS,'mainHand','offHand','tool','aura'])});
})(window);
