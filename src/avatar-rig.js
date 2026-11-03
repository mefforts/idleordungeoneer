/* Modular player renderer. All coordinates use a grounded foot origin.
 * Separate joints, material layers and grip sockets serve every activity. */
(function(global){
'use strict';
const BASE=Object.freeze({hair:0,eyes:0,chest:0,legs:0,boots:0,hairColor:'#74513b',eyeColor:'#2387aa',chestColor:'#72937c',legsColor:'#705b48',bootsColor:'#93704f',skinColor:'#e3b18a'});
const STYLE_COUNTS=Object.freeze({hair:6,eyes:4,chest:4,legs:3,boots:4});
const COLOR_SETS=Object.freeze({hairColor:['#74513b','#3f3332','#c59650','#dcb76e','#a75f41','#853f40','#655374','#d8d2b9','#6c7c77','#f1d7ac'],eyeColor:['#2387aa','#3f9d6e','#8564c1','#b78b42','#546b9b','#d76b6b','#4aaeb2','#7f674f','#b1cae0','#d6ae64'],chestColor:['#72937c','#577da0','#8d5b65','#aa8952','#655a8f','#3f8c83','#9a6b44','#b0afa1','#464b55','#c17c6d'],legsColor:['#705b48','#484c57','#4f765c','#8e705b','#5f5380','#978c77','#333f48','#8f5861','#a28d64','#607c84'],bootsColor:['#93704f','#4e4243','#65534c','#6a7779','#8e5f53','#a18d69','#4a5c52','#70718a','#b07a43','#414a56'],skinColor:['#e3b18a','#f1cba9','#dba07e','#bc8068','#a86952','#80513f','#f1d6bc','#ce9876','#9c6854','#684737']});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
const PHYSICAL_SLOTS=Object.freeze(['head','shoulders','chest','legs','boots','gloves']);
const TOOLS=Object.freeze({mine:{key:'pickaxe',name:'Pickaxe',height:50,grip:[.5,.84]},smith:{key:'hammer',name:'Smithing hammer',height:44,grip:[.5,.82]},wood:{key:'hatchet',name:'Hatchet',height:50,grip:[.24,.84]},scavenge:{key:'mattock',name:'Mattock',height:32,grip:[.466,.84]},fletch:{key:'knife',name:'Fletching knife',height:17,grip:[.5,.82]},ward:{key:'spindle',name:'Weaving shuttle',height:24,grip:[.5,.83]},rune:{key:'burin',name:'Engraving burin',height:16,grip:[.5,.84]},polish:{key:'file',name:'Jeweler’s chisel',height:14,grip:[.5,.83]}});
const WORK_RATES=Object.freeze({mine:1.05,smith:1.2,wood:.92,fletch:.85,ward:.62,rune:.7,polish:1.15,scavenge:.72});
function workRate(pose){return WORK_RATES[pose]||1;}
const ARM_LENGTHS=Object.freeze([20,19.5]),LEG_LENGTHS=Object.freeze([19,18]);
const motionPreference=global.matchMedia?.('(prefers-reduced-motion: reduce)');
let assets={},images=new Map();
function normalizeCustom(src){const out={...BASE};if(!src||typeof src!=='object')return out;for(const [key,count]of Object.entries(STYLE_COUNTS)){const value=Number(src[key]);out[key]=Number.isInteger(value)?clamp(value,0,count-1):BASE[key];}for(const [key,colors]of Object.entries(COLOR_SETS))if(colors.includes(src[key]))out[key]=src[key];return out;}
function setAssets(source){assets=Object.fromEntries(Object.entries(source).filter(([key])=>key.startsWith('tool-')));images.clear();for(const [key,asset]of Object.entries(assets)){const image=new Image();image.decoding='async';image.src=asset.src;images.set(key,image);}}
function imageFor(key){const image=images.get(key);return image?.complete&&image.naturalWidth?image:null;}
function ellipse(c,x,y,rx,ry,color,outline='',width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=width;c.stroke();}}
function stroke(c,a,b,color,width){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function shade(color,factor){return '#'+color.slice(1).match(/../g).map(part=>clamp(Math.round(parseInt(part,16)*factor),0,255).toString(16).padStart(2,'0')).join('');}
function tier(n){return n<=0?0:n<3?1:n<6?2:3;}
function appearance(data={},overrides={}){
 const set=global.DeepwellEquipmentArt?.describe(data).armor||null,pieces={};
 for(const slot of PHYSICAL_SLOTS){const candidate=overrides[slot];pieces[slot]=candidate==='base'||Object.hasOwn(ARMOR_PALETTES,candidate)?candidate:set?.id||'base';}
 return {weapon:Math.max(0,Number(data.weapon)||0),armor:Math.max(0,Number(data.armor)||0),enchant:Math.max(0,Number(data.enchant)||0),armorSet:set?.id||'',armorTier:set?.tier||0,head:pieces.head==='base'?'hair':pieces.head.startsWith('melee')?'helmet':'hood',chest:pieces.chest==='base'?'tunic':pieces.chest.startsWith('magic')?'robes':pieces.chest.startsWith('ranged')?'ranger':'armor',legs:pieces.legs.startsWith('magic')?'robe':'trousers',boots:pieces.boots==='base'?'leather':'reinforced',cape:'none',mainHand:data.weaponType||'sword',offHand:data.weaponType==='shield'?'buckler':'none',aura:data.enchant>0?'lightning':'none',pieces};
}
function transform(body,point){const y=point.y+40,cs=Math.cos(body.angle),sn=Math.sin(body.angle);return {x:body.x+point.x*cs-y*sn,y:body.y+point.x*sn+y*cs};}
function inverseKinematics(root,target,bend,lengths){const dx=target.x-root.x,dy=target.y-root.y,raw=Math.max(.0001,Math.hypot(dx,dy)),distance=clamp(raw,Math.abs(lengths[0]-lengths[1])+.01,lengths[0]+lengths[1]-.02),ux=dx/raw,uy=dy/raw,along=(lengths[0]**2-lengths[1]**2+distance**2)/(2*distance),height=Math.sqrt(Math.max(0,lengths[0]**2-along**2));return {shoulder:{...root},hand:{x:root.x+ux*distance,y:root.y+uy*distance},elbow:{x:root.x+ux*along-uy*height*bend,y:root.y+uy*along+ux*height*bend},lengths:[...lengths]};}
function clipSample(keys,phase){let index=0;while(index<keys.length-2&&phase>keys[index+1][0])index++;const a=keys[index],b=keys[index+1],t=smooth(clamp((phase-a[0])/(b[0]-a[0]),0,1));return a.slice(1).map((value,i)=>lerp(value,b[i+1],t));}
function projectHand(point,root){const distance=Math.hypot(point.x-root.x,point.y-root.y),reach=ARM_LENGTHS[0]+ARM_LENGTHS[1]-.05;if(distance<=reach)return {...point};return {x:root.x+(point.x-root.x)/distance*reach,y:root.y+(point.y-root.y)/distance*reach};}
function poseRig(options={}){
 const {pose='idle',data={}}=options,reduced=!!options.reducedMotion||!!data.reducedMotion||!!motionPreference?.matches,time=reduced?0:(options.time||0),weapon=data.weaponType||'sword',activity=Object.hasOwn(TOOLS,pose)||pose==='cast',working=options.working!==false,walking=!reduced&&(pose==='walk'||pose==='combat'&&Math.hypot(options.vx||0,options.vy||0)>.1),backpedal=walking&&(options.vx||0)*(options.facing||1)<-.1;
 const a=reduced?(pose==='attack'?.45:0):clamp(options.attack||0,0,1),attack=pose==='attack'&&options.attack===undefined?.65:a,elapsed=1-attack,walk=walking?Math.sin(time*8)*(backpedal?-1:1):0,phase=reduced?.65:((options.workPhase??time*workRate(pose))%1+1)%1,cycle=phase*Math.PI*2,breath=Math.sin(time*2.25)*.32;
 const body={x:walking?walk*.5:0,y:-42+(walking?Math.abs(walk)*1.4:breath),angle:(options.dash&&!reduced?.18:0)+(walking?walk*.025:0)};
 let main={x:21,y:-35},back={x:-17,y:-31},angle=.35,headAngle=walking?walk*.02:0,kneeling=false,twoHand=0,contact=false,workPiece=null;
 const tool=TOOLS[pose],placeTip=(x,y,toolAngle)=>{angle=toolAngle;const length=tool.height*tool.grip[1];main={x:x-Math.sin(angle)*length,y:y+Math.cos(angle)*length};};
 if(walking){main.x-=walk*1.2;main.y+=walk*1.1;back.x+=walk*6;back.y-=Math.abs(walk)*.9;}
 if(weapon==='shield')back={x:-14,y:-49};
 if(weapon==='polearm'){main={x:17,y:-45};angle=.38;twoHand=-13;}
 if(weapon==='greatsword'){main={x:16,y:-46};angle=.40;twoHand=7;}
 if(attack>0&&!['bow','staff'].includes(weapon)){
  const resting=[main.x,main.y,angle],heavy=weapon==='greatsword',long=weapon==='polearm';
  // The live timer runs 1 → 0. Both ends of the clip meet the ready pose.
  const sample=clipSample([[0,...resting],[.18,28,long?-56:-54,long?.34:.08],[.40,long?30:33,-48,long?1.10:1.40],[.57,heavy?30:29,heavy?-35:-38,long?1.12:1.88],[.76,25,-34,long?.85:1.55],[1,...resting]],elapsed);
  [main.x,main.y,angle]=sample;const weight=Math.sin(elapsed*Math.PI)**2;
  body.angle+=weight*(heavy?.12:.085);body.x+=weight*(long?1.4:1.8);headAngle+=weight*.025;
  if(weapon==='shield')back={x:lerp(-14,-8,weight),y:lerp(-49,-54,weight)};
  else back={x:lerp(back.x,-21,weight),y:lerp(back.y,-40,weight)};
 }
 if(weapon==='bow'){
  const aim=clamp(options.aimAngle||0,-.8,.8),drawing=smooth(clamp(((options.charge||0)-.45)/.55,0,1)),release=attack>0?1-smooth(clamp(elapsed/.30,0,1)):0,draw=Math.max(drawing,release),recoil=attack>0?Math.sin(Math.PI*clamp(elapsed/.42,0,1)):0;
  main={x:8+(24+recoil)*Math.cos(aim),y:-60+(24+recoil)*Math.sin(aim)};angle=aim;twoHand=-(12+draw*14);body.x-=recoil*.8;
 }
 if(weapon==='staff'){
  const ready=pose==='combat'||pose==='attack';main={x:20,y:-35};angle=.22;
  if(ready)back={x:18,y:-48};
  if(attack>0){
   const rest={...back},sample=clipSample([[0,rest.x,rest.y,0],[.20,12,-57,.7],[.43,30,-52,1],[.68,25,-45,.5],[1,rest.x,rest.y,0]],elapsed);back={x:sample[0],y:sample[1]};main.y-=sample[2]*6;angle+=sample[2]*.14;body.angle+=sample[2]*.04;
  }
 }
 if(activity){
  body.x=3;body.angle=.16;main={x:24,y:-50};back={x:12,y:-45};angle=2.3;twoHand=0;headAngle=.08;
  if(['mine','smith','wood'].includes(pose)){
   const impact=clipSample([[0,.72],[.24,0],[.40,.05],[.65,1],[.76,.98],[1,.72]],phase)[0],lift=working?impact:1;
   body.angle=working?.07+impact*.20:.04;body.x=working?3+impact*3:0;main={x:working?30-lift:27,y:working?-68+lift*27:-36};angle=working?lerp(.40,pose==='smith'?1.72:pose==='wood'?1.64:1.53,lift):.65;
   back=working?{x:pose==='smith'?24:14,y:pose==='smith'?-45:-43}:{x:-17,y:-31};twoHand=working&&pose!=='smith'?13:0;headAngle=working?.10+lift*.07:0;contact=working&&phase>.60&&phase<.80;
  }else if(pose==='fletch'){
   const pass=clipSample([[0,0,4],[.16,0,0],[.60,1,0],[.76,1,5],[1,0,4]],phase);workPiece={x:31,y:-48,angle:0};back={x:15,y:-47.2};
   placeTip(34+pass[0]*9,-48.4-pass[0]*.6-pass[1],2.48+pass[0]*.18);body.angle=.12+Math.sin(cycle)*.018;headAngle=.14;contact=working&&phase>=.16&&phase<=.60;
  }else if(pose==='ward'||pose==='cast'){
   body.angle=.08+Math.sin(cycle)*.025;main={x:38+Math.sin(cycle)*5,y:-45+Math.sin(cycle*2)*3};back={x:15-Math.sin(cycle)*4,y:-57-Math.cos(cycle)*3};angle=-1.16+Math.cos(cycle)*.22;headAngle=.08;workPiece={x:29,y:-49+Math.sin(cycle)*1.2,angle:0};contact=working;
  }else if(pose==='rune'){
   workPiece={x:31,y:-47,angle:0};back={x:23,y:-46};placeTip(31+Math.cos(cycle)*3.8,-48+Math.sin(cycle)*2.6,2.10+Math.sin(cycle)*.16);body.angle=.15+Math.cos(cycle)*.018;headAngle=.14;contact=working;
  }else if(pose==='polish'){
   const lift=clipSample([[0,0],[.20,1],[.36,1],[.60,0],[.74,0],[1,0]],phase)[0];workPiece={x:31,y:-47,angle:Math.sin(cycle)*.14};back={x:23,y:-45};placeTip(32+Math.sin(cycle)*1.8,-49-lift*5.5,2.12+Math.cos(cycle)*.18);body.angle=.15+lift*.035;headAngle=.12+lift*.035;contact=working&&phase>=.58&&phase<=.76;
  }else if(pose==='scavenge'){
   kneeling=true;body.x=-11;body.y=-17;body.angle=1.00+(working?Math.sin(cycle)*.025:0);back={x:22,y:-4};headAngle=.35;
   if(working)placeTip(61+Math.sin(cycle)*8,-2-Math.max(0,-Math.cos(cycle))*8,1.62+Math.sin(cycle)*.16);
   else{main={x:37,y:-5};angle=1.62;}
   contact=working&&Math.cos(cycle)>.10;
  }
  if(!working&&!['mine','smith','wood','scavenge'].includes(pose)){main={x:27,y:-36};back={x:-17,y:-31};angle=.4;body.angle=.04;headAngle=0;if(workPiece)workPiece={...workPiece,angle:0,...(pose==='ward'||pose==='cast'?{y:-49}:{})};}
 }
 const blend=clamp(options.workBlend??(working?1:0),0,1);
 if(activity&&options.workBlend!==undefined&&!options._unblended&&(working?blend<1:blend>0)){
  const activeRig=poseRig({...options,working:true,_unblended:true}),restRig=poseRig({...options,working:false,_unblended:true}),amount=smooth(blend);
  for(const key of ['x','y','angle'])body[key]=lerp(restRig.body[key],activeRig.body[key],amount);
  main={x:lerp(restRig.main.x,activeRig.main.x,amount),y:lerp(restRig.main.y,activeRig.main.y,amount)};back={x:lerp(restRig.back.x,activeRig.back.x,amount),y:lerp(restRig.back.y,activeRig.back.y,amount)};
  angle=lerp(restRig.angle,activeRig.angle,amount);headAngle=lerp(restRig.head.angle,activeRig.head.angle,amount);twoHand=0;
  if(workPiece)for(const key of ['x','y','angle'])workPiece[key]=lerp(restRig.workPiece[key],activeRig.workPiece[key],amount);
 }
 if(!reduced&&!activity&&options.hit>0){const recoil=clamp(options.hit,0,1)**2;body.angle-=recoil*.09;body.x-=recoil*1.5;}
 const frontRoot=transform(body,{x:12,y:-69}),backRoot=transform(body,{x:-10,y:-68});let offset=null;
 if(weapon==='bow'&&!activity)offset={x:twoHand*Math.cos(angle),y:twoHand*Math.sin(angle)};
 else if(twoHand)offset={x:-Math.sin(angle)*twoHand,y:Math.cos(angle)*twoHand};
 if(offset){for(let pass=0;pass<12;pass++){main=projectHand(main,frontRoot);const projected=projectHand({x:main.x+offset.x,y:main.y+offset.y},backRoot);main={x:projected.x-offset.x,y:projected.y-offset.y};}back={x:main.x+offset.x,y:main.y+offset.y};}
 const frontArm=inverseKinematics(frontRoot,main,activity||['bow','polearm','greatsword'].includes(weapon)?1:-1,ARM_LENGTHS),backArm=inverseKinematics(backRoot,back,1,ARM_LENGTHS);main=frontArm.hand;back=backArm.hand;
 const headBase=transform(body,{x:0,y:-75}),head={x:headBase.x+Math.sin(headAngle)*10,y:headBase.y-Math.cos(headAngle)*10,angle:headAngle},legs=[];
 for(const side of [-1,1]){
  const hip={x:body.x+side*6,y:body.y};let ankle;if(kneeling)ankle={x:side<0?-28:-13,y:-5};else ankle={x:side*6+side*walk*8,y:-5-(walking?Math.max(0,Math.cos(time*8+(side<0?Math.PI:0)))*4:0)};
  let joint=inverseKinematics(hip,ankle,-1,LEG_LENGTHS);
  if(kneeling){const knee={x:hip.x+Math.sqrt(Math.max(0,LEG_LENGTHS[0]**2-(-3-hip.y)**2)),y:-3};ankle={x:knee.x-Math.sqrt(LEG_LENGTHS[1]**2-4),y:-5};joint={shoulder:hip,elbow:knee,hand:ankle,lengths:LEG_LENGTHS};}
  legs.push({side,hip:joint.shoulder,knee:joint.elbow,ankle:joint.hand,footAngle:kneeling?-.3:walking?side*walk*.08:0});
 }
 const point=(x,y)=>({x:main.x+x*Math.cos(angle)-y*Math.sin(angle),y:main.y+x*Math.sin(angle)+y*Math.cos(angle)}),tip=tool?point(0,-tool.height*tool.grip[1]):null;
 const backGesture=activity?(pose==='scavenge'?'plant':['ward','cast'].includes(pose)?'reach':offset||blend>.5&&['mine','wood','fletch','rune','polish'].includes(pose)?'grip':'rest'):weapon==='staff'&&(pose==='combat'||pose==='attack')?'reach':offset?'grip':'rest';
 return {weapon,activity,walking,backpedal,walk,stroke:Math.sin(attack*Math.PI),angle,main,back,body,head,kneeling,phase,frontArm,backArm,legs,neck:headBase,bowUpper:point(-12,-25),bowLower:point(-12,25),arrowTip:point(27,0),toolTip:tip,tool:tool||null,gripOffset:offset,workPiece,contact:contact&&blend>.95,backGesture};
}
const INK='#293337';
const ARMOR_PALETTES=Object.freeze({
 melee_1:{style:'melee',mid:'#819292',light:'#c9d4cf',dark:'#465b60',trim:'#a7a18a',cloth:'#435559',leather:'#725539'},
 melee_2:{style:'melee',mid:'#91aab7',light:'#e0e9df',dark:'#466273',trim:'#c4bd94',cloth:'#3e535e',leather:'#654f3b'},
 ranged_1:{style:'ranged',mid:'#886447',light:'#b69a65',dark:'#513f31',trim:'#c3ac78',cloth:'#65774f',leather:'#745238'},
 ranged_2:{style:'ranged',mid:'#536c4e',light:'#91a174',dark:'#304b3b',trim:'#b5a276',cloth:'#3f5e46',leather:'#634b36'},
 magic_1:{style:'magic',mid:'#c5bca3',light:'#eee5c9',dark:'#897e66',trim:'#a89c7f',cloth:'#c5bca3',leather:'#75583c'},
 magic_2:{style:'magic',mid:'#526f9b',light:'#9bb2cf',dark:'#2c4367',trim:'#b5c2c9',cloth:'#526f9b',leather:'#68513c'}
});
function path(c,points,fill,outline=INK,width=1.2){c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
function line(c,x,y,xx,yy,color,width=1){stroke(c,{x,y},{x:xx,y:yy},color,width);}
function paletteFor(kit,slot,look){return ARMOR_PALETTES[kit.pieces[slot]]||{style:'travel',mid:look.chestColor,light:shade(look.chestColor,1.25),dark:shade(look.chestColor,.64),trim:shade(look.bootsColor,1.35),cloth:look.chestColor,leather:look.bootsColor};}
function boneFrame(start,end){const length=Math.max(.001,Math.hypot(end.x-start.x,end.y-start.y)),dx=(end.x-start.x)/length,dy=(end.y-start.y)/length;return {dx,dy,nx:-dy,ny:dx,length};}
function limbPath(c,a,b,d,upper=5,lower=3.5){
 const u=boneFrame(a,b),v=boneFrame(b,d),sum=Math.hypot(u.nx+v.nx,u.ny+v.ny)||1,nx=(u.nx+v.nx)/sum,ny=(u.ny+v.ny)/sum,joint=(upper+lower)*.5;
 c.beginPath();c.moveTo(a.x+u.nx*upper,a.y+u.ny*upper);
 // Pass both sides of the actual elbow/knee; a long quadratic can cut across
 // a bent joint and leave its center outside the painted limb.
 c.lineTo(b.x+u.nx*joint,b.y+u.ny*joint);c.quadraticCurveTo(b.x+nx*joint*1.2,b.y+ny*joint*1.2,b.x+v.nx*joint,b.y+v.ny*joint);c.lineTo(d.x+v.nx*lower,d.y+v.ny*lower);
 c.quadraticCurveTo(d.x+v.dx*1.6,d.y+v.dy*1.6,d.x-v.nx*lower,d.y-v.ny*lower);
 c.lineTo(b.x-v.nx*joint,b.y-v.ny*joint);c.quadraticCurveTo(b.x-nx*joint*1.2,b.y-ny*joint*1.2,b.x-u.nx*joint,b.y-u.ny*joint);c.lineTo(a.x-u.nx*upper,a.y-u.ny*upper);
 c.quadraticCurveTo(a.x-u.dx*2,a.y-u.dy*2,a.x+u.nx*upper,a.y+u.ny*upper);c.closePath();
}
function fillLimb(c,a,b,d,upper,lower,color,shadow,highlight){
 limbPath(c,a,b,d,upper,lower);c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=1.15;c.lineJoin='round';c.stroke();
 c.save();limbPath(c,a,b,d,upper,lower);c.clip();const u=boneFrame(a,b),v=boneFrame(b,d);
 stroke(c,{x:a.x-u.nx*upper*.7,y:a.y-u.ny*upper*.7},{x:b.x-u.nx*upper*.5,y:b.y-u.ny*upper*.5},shadow,upper*.9);
 stroke(c,{x:b.x-v.nx*lower*.55,y:b.y-v.ny*lower*.55},{x:d.x-v.nx*lower*.65,y:d.y-v.ny*lower*.65},shadow,lower*.95);
 stroke(c,{x:a.x+u.nx*upper*.35,y:a.y+u.ny*upper*.35},{x:b.x+u.nx*upper*.35,y:b.y+u.ny*upper*.35},highlight,1.1);c.restore();
}
function band(c,start,end,width,color,light,outline=INK){const axis=boneFrame(start,end);path(c,[start.x+axis.nx*width,start.y+axis.ny*width,end.x+axis.nx*width*.86,end.y+axis.ny*width*.86,end.x-axis.nx*width*.86,end.y-axis.ny*width*.86,start.x-axis.nx*width,start.y-axis.ny*width],color,outline,.9);line(c,start.x+axis.nx*width*.55,start.y+axis.ny*width*.55,end.x+axis.nx*width*.48,end.y+axis.ny*width*.48,light,1);}
function paintBoot(c,leg,kit,look){
 const p=paletteFor(kit,'boots',look),plain=kit.pieces.boots==='base',metal=p.style==='melee',height=plain?[9,13,10,11][look.boots]:p.style==='ranged'?12:9,base=metal?p.dark:p.leather;
 c.save();c.translate(leg.ankle.x,leg.ankle.y);c.rotate(leg.footAngle||0);
 path(c,[-4.6,-height+6,4.1,-height+6,5.3,1,10.2,3,10.7,6,-7.4,6,-7.8,2,-5.1,.5],base,INK,1.1);
 path(c,[-4.4,-height+6,-.8,-height+6,.3,1,6.3,3,-4.9,3],metal?p.mid:shade(base,1.22),'',0);
 path(c,[-7.3,4,10.2,4,10.7,6,-7.4,6],metal?'#344851':shade(base,.62),'',0);
 if(metal)path(c,[-4.8,-2,3.5,-2,5.8,2,-4.8,3],p.mid,INK,.7);
 line(c,-3.5,-height+7,3.4,-height+7,metal?p.light:shade(base,1.42),1.1);
 if(plain&&look.boots===2||p.style==='ranged')for(const y of [-1,1.8])line(c,-3.7,y,3.1,y,shade(base,1.5),.8);
 c.restore();
}
function paintLeg(c,rig,leg,kit,look,noBoot=false){
 const p=paletteFor(kit,'legs',look),plain=kit.pieces.legs==='base',mage=p.style==='magic',base=plain?look.legsColor:mage?p.mid:p.style==='melee'?p.cloth:p.dark;
 if(mage){fillLimb(c,leg.hip,leg.knee,leg.ankle,9,7.5,p.mid,p.dark,p.light);line(c,leg.ankle.x-5,leg.ankle.y,leg.ankle.x+5,leg.ankle.y,p.trim,1.2);}
 else{
  fillLimb(c,leg.hip,leg.knee,leg.ankle,5.9,4.1,base,shade(base,.70),shade(base,1.24));
  if(p.style==='melee'){
   const bottom={x:lerp(leg.knee.x,leg.ankle.x,.83),y:lerp(leg.knee.y,leg.ankle.y,.83)};band(c,leg.knee,bottom,4.5,p.mid,p.light);
   c.save();c.translate(leg.knee.x,leg.knee.y);path(c,[-4.8,-3.3,2.6,-4.0,5.4,-.3,3.4,3.4,-3.9,3.8,-5.2,.5],p.mid,INK,.9);line(c,-2.8,-1.8,2.4,-2.2,p.light,1);c.restore();
  }else if(p.style==='ranged'||plain&&look.legs===2){c.save();c.translate(leg.knee.x,leg.knee.y);path(c,[-4.3,-3,3.5,-3,4.2,2,-4.0,3],p.style==='ranged'?p.leather:shade(look.bootsColor,.80),INK,.8);c.restore();}
  if(plain&&look.legs===1){const at={x:lerp(leg.knee.x,leg.ankle.x,.58),y:lerp(leg.knee.y,leg.ankle.y,.58)};for(let i=0;i<3;i++)line(c,at.x-4.1,at.y+i*2,at.x+4.1,at.y+i*2,shade(look.bootsColor,1.3),1.2);}
 }
 if(!noBoot)paintBoot(c,leg,kit,look);
}
function paintShoulder(c,root,angle,side,kit,look){
 const p=paletteFor(kit,'shoulders',look);c.save();c.translate(root.x,root.y);c.rotate(angle*.4);if(side<0)c.scale(-1,1);
 if(p.style==='travel'){path(c,[-6.5,-2.3,-2.2,-4.1,5.7,-2.5,6.4,4.4,-5.0,5.3],p.mid,INK,1);line(c,-4.3,3.2,4.7,3.0,p.light,.9);}
 else{path(c,[-8,-1.3,-5.0,-5.4,1,-6.2,7.2,-3.0,8.5,3.8,3.3,6.1,-6.8,4.7],p.mid,INK,1.2);path(c,[-6,-1.9,-3.8,-4.1,1,-4.5,5.4,-2.5,2.1,-.6],p.light,'',0);line(c,-6.4,3.3,6.4,3.1,p.style==='magic'?p.trim:p.dark,1);}
 c.restore();
}
function paintArm(c,joints,side,kit,look){
 const p=paletteFor(kit,'chest',look),plain=p.style==='travel',mage=p.style==='magic';
 fillLimb(c,joints.shoulder,joints.elbow,joints.hand,plain?4.4:mage?5.9:5.2,plain?3.2:mage?4.6:3.8,plain?look.skinColor:p.style==='melee'?p.cloth:p.mid,plain?shade(look.skinColor,.70):p.dark,plain?shade(look.skinColor,1.12):p.light);
 if(plain){const end={x:lerp(joints.shoulder.x,joints.elbow.x,.43),y:lerp(joints.shoulder.y,joints.elbow.y,.43)};band(c,joints.shoulder,end,4.8,look.chestColor,shade(look.chestColor,1.3));}
 else if(p.style==='melee'||p.style==='ranged'){
  const start={x:lerp(joints.elbow.x,joints.hand.x,.2),y:lerp(joints.elbow.y,joints.hand.y,.2)},end={x:lerp(joints.elbow.x,joints.hand.x,.86),y:lerp(joints.elbow.y,joints.hand.y,.86)};band(c,start,end,p.style==='melee'?4.1:3.8,p.style==='melee'?p.mid:p.leather,p.style==='melee'?p.light:shade(p.leather,1.3));
 }else{const axis=boneFrame(joints.elbow,joints.hand),at={x:lerp(joints.elbow.x,joints.hand.x,.83),y:lerp(joints.elbow.y,joints.hand.y,.83)};line(c,at.x-axis.nx*4.6,at.y-axis.ny*4.6,at.x+axis.nx*4.6,at.y+axis.ny*4.6,p.trim,1.2);}
 const angle=Math.atan2(joints.elbow.y-joints.shoulder.y,joints.elbow.x-joints.shoulder.x)-Math.PI/2;paintShoulder(c,joints.shoulder,angle,side,kit,look);
}
function paintHand(c,point,angle,side,kit,look,handPose='rest'){
 const p=paletteFor(kit,'gloves',look),bare=p.style==='travel',color=bare?look.skinColor:p.style==='melee'&&kit.pieces.gloves.endsWith('_2')?p.mid:p.leather,light=shade(color,1.20),dark=shade(color,.72);
 c.save();c.translate(point.x,point.y);c.rotate(handPose==='plant'?0:angle);if(side>0)c.scale(-1,1);
 if(handPose==='plant'){path(c,[-4,-3,2,-3,3,-.5,7,0,7.5,1.5,4.6,2.3,0,2.1,-3,1.3,-4.5,-.5],color,INK,.8);line(c,-2,-1.7,2,-1.5,light,.8);}
 else if(handPose==='reach'){
  path(c,[-3,-4.2,2.2,-4.2,3.6,-.2,6.8,-1.3,7.5,.0,3.2,3.2,1.4,6.0,-.1,5.7,-1.6,3.3,-2.1,6.4,-3.6,6.1,-3.9,2.9,-5.3,5.0,-6.5,4.1,-5.5,.0],color,INK,.85);line(c,-2.7,-2.5,1.3,-2.5,light,.8);
 }else{c.beginPath();c.moveTo(-3.3,-4.7);c.lineTo(2.9,-4.7);c.quadraticCurveTo(4.7,-.9,4.0,2.6);c.quadraticCurveTo(2.0,5.1,-1.7,4.2);c.quadraticCurveTo(-4.5,3.0,-4.2,-.2);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=.9;c.stroke();path(c,[-2.6,-3.2,.8,-3.6,2.3,-.3,.6,1.2,-2.6,.8],light,'',0);if(handPose==='grip'){path(c,[2.4,-2.0,4.2,-1.3,3.2,1.4,1.1,1.9,.2,.8],color,INK,.7);line(c,-2.7,1.8,.0,2.2,dark,.7);}else line(c,-1.1,1.1,-1.3,3.3,dark,.7);}
 c.restore();
}
function paintBody(c,rig,kit,look){
 const p=paletteFor(kit,'chest',look),plain=p.style==='travel',mage=p.style==='magic';c.save();c.translate(rig.body.x,rig.body.y);c.rotate(rig.body.angle);
 const hem=plain?[5,11,6,7][look.chest]:mage?9:5;
 path(c,[-13,-29,-6,-31,0,-28,6,-31,13,-29,14,-20,11,-11,15,hem,6,hem+1,0,hem-1,-6,hem+1,-15,hem,-11,-11,-14,-20],p.mid,INK,1.35);
 path(c,[-12,-27,-5,-28,-3,-12,-6,hem-1,-12,hem-1,-9,-12],p.light,'',0);
 path(c,[6,-28,12,-26,11,-14,14,hem-1,7,hem-1,4,-10],p.dark,'',0);
 if(p.style==='melee'){
  path(c,[-10,-26,-3,-27,0,-24,4,-27,10,-25,9,-12,2,-8,-9,-11],p.mid,INK,.9);path(c,[-8,-24,-3,-25,-3,-14,-8,-13],p.light,'',0);line(c,-8,-10,8,-11,p.dark,1.1);
  for(const side of [-1,1])path(c,[side*2,2,side*11,1,side*14,8,side*4,7],p.mid,INK,.8);
 }else if(mage){
  path(c,[-7,-29,-2,-19,7,-29,10,-26,-1,-13,-10,-25],p.light,INK,.65);line(c,-2,-12,-5,hem-1,p.dark,1.1);line(c,4,-11,8,hem-1,p.light,1.0);
 }else if(p.style==='ranged'){
  line(c,-10,-26,9,-6,p.leather,3.4);line(c,-10,-26,9,-6,p.trim,.8);for(const x of [-8,8]){line(c,x,-17,x,-10,p.trim,.6);}
 }else{
  path(c,[-6,-29,0,-24,6,-29,4,-25,0,-21,-4,-25],p.dark,INK,.7);
  if(look.chest===1)line(c,-1,-20,-1,hem-1,p.dark,1.1);
  if(look.chest===2){line(c,-10,-26,10,-3,p.leather,3);line(c,-10,-26,10,-3,p.trim,.8);}
  if(look.chest===3){path(c,[-11,-29,-6,-28,-4,-16,-10,-10],p.dark,INK,.8);line(c,7,-24,8,-14,p.light,1.5);}
 }
 line(c,-12,-1,12,-1,p.leather,3.4);path(c,[-2.4,-3.3,3.1,-3.3,3.1,1.7,-2.4,1.7],p.trim,INK,.8);line(c,-.5,-1,1.5,-1,p.leather,.8);
 if(plain&&look.chest===3)path(c,[7,-.5,14,0,13.3,6,7.3,5.4],shade(p.leather,.84),INK,.8);
 c.restore();
}
function paintHead(c,rig,kit,look,time){
 const p=paletteFor(kit,'head',look),armored=p.style!=='travel';c.save();c.translate(rig.head.x,rig.head.y);c.rotate(rig.head.angle);c.scale(1.20,1.20);
 if(armored&&p.style!=='melee'){
  c.beginPath();c.moveTo(-16,14);c.quadraticCurveTo(-23,-2,-15,-17);c.quadraticCurveTo(-4,-29,8,-24);c.quadraticCurveTo(23,-15,18,12);c.lineTo(11,18);c.lineTo(-7,18);c.closePath();c.fillStyle=p.dark;c.fill();c.strokeStyle=INK;c.lineWidth=1.4;c.stroke();
 }
 illustratedFace(c,look,time,armored);
 if(armored&&p.style==='melee'){
  path(c,[-17,-6,-18,-16,-11,-23,-1,-26,10,-22,17,-15,18,-6,11,-8,-10,-8],p.dark,INK,1.3);
  path(c,[-15,-15,-10,-21,-2,-23,-2,-9,-13,-9],p.light,'',0);path(c,[1,-23,10,-20,15,-14,12,-9,1,-9],p.mid,'',0);line(c,-16,-7,16,-7,p.mid,3);line(c,-13,-6,13,-6,p.light,.7);
  path(c,[-17,-6,-12,-4,-12,10,-15,12,-18,2],p.mid,INK,.8);path(c,[13,-6,18,-5,17,6,13,12,11,10,12,-2],p.dark,INK,.8);line(c,-15,-1,-14,7,p.light,.9);
 }else if(armored){
  path(c,[-17,-2,-16,-14,-9,-22,-1,-25,9,-22,16,-14,19,-3,13,-6,8,-13,0,-17,-8,-12,-12,-4],p.mid,INK,1.2);
  path(c,[-15,-10,-9,-20,-1,-23,1,-19,-6,-15,-11,-5],p.light,'',0);
  path(c,[-18,-1,-13,-3,-12,8,-5,13,-8,18,-17,13],p.mid,INK,.9);path(c,[14,-3,19,-1,17,13,8,18,6,14,12,8],p.dark,INK,.9);
  line(c,-12,8,-6,13,p.light,1.0);line(c,8,14,13,9,p.trim,.8);
 }
 c.restore();
}
function drawPart(c,slot,options={}){
 const look=normalizeCustom(options.custom),prefix=options.set||'base',pieces=Object.fromEntries(PHYSICAL_SLOTS.map(part=>[part,prefix])),kit={...appearance({}),pieces,armorSet:prefix==='base'?'':prefix},rig=poseRig({pose:'idle',time:0});
 if(slot==='head')paintHead(c,{head:{x:0,y:0,angle:0}},kit,look,0);
 if(slot==='shoulders')paintShoulder(c,{x:0,y:0},0,1,kit,look);
 if(slot==='chest')paintBody(c,{body:{x:0,y:0,angle:0}},kit,look);
 if(slot==='legs')for(const side of [-1,1])paintLeg(c,rig,{side,hip:{x:side*6,y:0},knee:{x:side*6,y:18},ankle:{x:side*6,y:36},footAngle:0},kit,look,true);
 if(slot==='boots')paintBoot(c,{ankle:{x:0,y:0},footAngle:0},kit,look);
 if(slot==='gloves')paintHand(c,{x:0,y:0},0,1,kit,look,'grip');
}

function illustratedFace(c,look,time,hideHair=false){
 const LOOK=look,walk=0,SKIN=look.skinColor,SKIN_L=shade(SKIN,1.15),SKIN_D=shade(SKIN,.69),HAIR=look.hairColor,HAIR_LIGHT=shade(HAIR,1.45),HAIR_SHADOW=shade(HAIR,.58),EYE=look.eyeColor,EYE_DARK=shade(EYE,.45);
 c.save();c.translate(0,-3);c.scale(.84,.84);c.translate(0,63);

 const sway=Math.sin(time*4.8)*.65+walk*.65,blink=Math.sin(time*1.91+.9)>.998;
 // Keep jaw, eye line, ears, and proportions invariant through all tiers.
 // Back hair appears under helmets as well; hairline is intentionally asymmetric.
 if(!hideHair){
 {
  path(c,[-14,-65,-19,-65,-18,-70,-12,-75,-10,-79,-3,-77,3,-80,10,-75,16,-76,20,-70,18,-61,17,-52,-13,-51],HAIR_SHADOW,INK,1.4);
  path(c,[-15,-65,-15,-71,-8,-77,4,-77,16,-72,15,-62],HAIR,INK,1);
 }
 }
 // Ears and softer, tapered anime jaw rather than a rectangle.
 ellipse(c,-14,-57,3.4,4.7,SKIN,SKIN_D,1);ellipse(c,14,-57,3.4,4.7,SKIN,SKIN_D,1);
 path(c,[-13,-64,-8,-69,6,-69,13,-64,14,-57,12,-50,7,-46,2,-44,-4,-46,-11,-51,-14,-57],SKIN,SKIN_D,1.2);
 path(c,[-11,-64,-7,-67,5,-67,10,-64,10,-57,6,-50,1,-47,-7,-50,-10,-57],SKIN_L,'',0);
 path(c,[9,-67,13,-64,14,-56,11,-50,3,-45,7,-53], '#bc856d','',0);
 path(c,[-11,-52,-9,-50,-6,-50,-7,-52], '#e9a18b','',0);
 path(c,[8,-51,11,-52,10,-49,7,-49], '#d99583','',0);
 // Shaded crown is built in overlapping clumps that can sway without shifting face anchors.
 {
  if(!hideHair&&LOOK.hair===0){
  path(c,[-18,-63,-19,-69,-13,-71,-11,-77,-5,-74,3,-79,9,-75,16,-75,20,-70,18,-64,14,-65,11,-59,7,-65,0,-61,-2,-67,-8,-61,-12,-64], HAIR,INK,1.35);
  path(c,[-16,-70,-11,-76,-4,-74,0,-77,5,-74,-2,-70,-8,-67],HAIR_LIGHT,'',0);
  path(c,[2,-75,10,-76,17,-72,17,-66,12,-67,10,-62,8,-67], shade(HAIR,.85),'',0);
  path(c,[-12,-75,-7,-82,-3,-76],HAIR_SHADOW,INK,1.15);
  path(c,[4,-78,10,-86,11,-77,17,-79,14,-73],HAIR,INK,1.1);
  path(c,[8,-81,11,-83,12,-78],shade(HAIR,1.35),'',0);
  path(c,[-15,-66,-18-sway,-57,-14,-59], HAIR_SHADOW,INK,1);
  path(c,[15,-65,18+sway,-56,13,-59], HAIR_SHADOW,INK,1);
  line(c,-9,-70,-4,-72,shade(HAIR,1.5),1.3);
  }
 }
 // Variant hair geometry shares the same helmet-safe anchors and skin contour.
 if(!hideHair){
  const h=LOOK.hair;
  if(h===1){ // swept fringe
   path(c,[-17,-69,-12,-79,2,-81,15,-75,19,-67,11,-68,3,-63,-7,-61,-14,-57],HAIR,INK,1);
   path(c,[-13,-75,1,-79,13,-74,2,-69,-10,-63],HAIR_LIGHT,'',0);
  }else if(h===2){ // cropped
   path(c,[-16,-67,-14,-73,-5,-76,6,-76,16,-72,17,-65,9,-66,3,-63,-7,-65],HAIR,INK,1.3);
   line(c,-9,-73,8,-72,HAIR_LIGHT,1.8);
  }else if(h===3){ // long windswept
   path(c,[-18,-70,-12,-80,-2,-82,12,-78,21,-69,17,-61,19,-52,14,-45,10,-54,12,-66,-2,-61,-16,-57,-19,-49,-23,-55],HAIR,INK,1.5);
   path(c,[-14,-77,-4,-82,15,-74,6,-71,-7,-70],HAIR_LIGHT,'',0);
  }else if(h===4){ // fluffy curls
   for(const [xx,yy,rr] of [[-15,-72,7],[-7,-79,7],[3,-81,7],[13,-78,7],[18,-70,6],[-19,-63,5],[15,-62,5]]){
     ellipse(c,xx,yy,rr,rr*.83,HAIR,INK,1);ellipse(c,xx-2,yy-2,rr*.38,rr*.29,HAIR_LIGHT);
   }
  }else if(h===5){ // topknot
   path(c,[-16,-68,-10,-75,6,-76,16,-72,18,-64,-9,-64],HAIR,INK,1);
   ellipse(c,0,-82,8,6,HAIR,INK,1.1);
   path(c,[-4,-84,-1,-91,7,-88,7,-82],HAIR,INK,.9);
   line(c,-12,-70,12,-70,HAIR_LIGHT,2);
  }
 }
 // Eye whites remain slightly angled; eyelids, iris and pinpoint reflection are
 // separate shapes so they survive scaling in both combat and equipment preview.
 for(const side of [-1,1]){
  c.save();c.translate(side*6.5,-56);c.scale(side,1);
  // Individual eyes look slightly toward the action instead of straight ahead.
  const eyeStyle=LOOK.eyes;
  if(eyeStyle===0)path(c,[-3.5,-1.4,2.5,-2.2,3.8,0,2.8,2.0,-2.8,2.1], '#fff8e8','',0);
  else if(eyeStyle===1)path(c,[-3.5,-.4,3.3,-2.2,3.8,-.7,1.7,1,-3,1], '#fff8e8','',0);
  else if(eyeStyle===2)ellipse(c,0,0,3.6,3.2,'#fff8e8');
  else path(c,[-3.8,-1.4,2.7,-2.2,3.6,-.2,1.2,2.2,-3,2.3], '#fff8e8','',0);
  if(blink){line(c,-3.3,-.2,3.1,.1,INK,1.4)}else{
   ellipse(c,.35,-.25,eyeStyle===2?2.5:eyeStyle===1?2:2.15,eyeStyle===1?1.9:2.65,EYE_DARK);
   ellipse(c,.65,-.35,1.32,eyeStyle===1?1.5:2.05,EYE);
   ellipse(c,.05,-1.44,.74,.85,'#fafffb');
   ellipse(c,1.5,.8,.4,.5,'#7fe7f0');
  }
  if(eyeStyle===3)line(c,-3.6,-2.7,3.2,-3.4,INK,1.9);else if(eyeStyle===1)line(c,-3.6,-1.4,3.1,-2.4,INK,1.8);else line(c,-3.6,-2.3,3,-2.9,INK,1.55);
  // warm brown eyebrows separate from top hair.
  line(c,-2.8,-5.6,2.2,-6.05,HAIR_SHADOW,1.25);
  c.restore();
 }
 line(c,.3,-53,1.5,-51.6,'#b27762',.85);
 line(c,-1.5,-48.7,2,-48.4,'#985e53',1.1);
 ellipse(c,-7.5,-63,2.3,.7,'#fff3ca70');

 c.restore();
}
function paintTool(c,rig){const tool=rig.tool;if(!tool)return false;const asset=assets['tool-'+tool.key],image=imageFor('tool-'+tool.key);if(!image||!asset)return false;const width=tool.height*asset.width/asset.height;c.save();c.translate(rig.main.x,rig.main.y);c.rotate(rig.angle);c.drawImage(image,-tool.grip[0]*width,-tool.grip[1]*tool.height,width,tool.height);c.restore();return true;}
function paintAura(c,level,time){if(level<=0)return;c.save();c.globalAlpha=.25;for(let i=0;i<3;i++){const angle=time*.8+i*Math.PI*2/3;ellipse(c,Math.cos(angle)*20,-48+Math.sin(angle)*25,1.3,2,'#91d7df');}c.restore();}
function render(c,options={}){
 const {x=0,y=0,scale=1,time=0,data={},facing=1}=options,look=normalizeCustom(data.custom),kit=appearance(data,options.parts),rig=poseRig(options),art=global.DeepwellEquipmentArt;
 c.save();c.translate(x,y);c.scale(scale*(facing<0?-1:1),scale);ellipse(c,1,1,16,3.4,'#0b0f1260');paintAura(c,kit.enchant,data.reducedMotion||options.reducedMotion||motionPreference?.matches?0:time);
 for(const leg of rig.legs)paintLeg(c,rig,leg,kit,look);
 const collar=transform(rig.body,{x:0,y:-71});stroke(c,collar,rig.neck,shade(look.skinColor,.82),8);stroke(c,{x:collar.x-1,y:collar.y},{x:rig.neck.x-1,y:rig.neck.y},look.skinColor,5.8);
 // Reaching arms need a continuous shoulder-to-wrist silhouette in front of
 // the shirt. Clipping a second copy at the elbow exposes upper-arm fragments
 // when the bones fold back across each other, leaving a floating forearm.
 const reaching=rig.activity||rig.back.x>rig.body.x-2;
 if(!reaching)paintArm(c,rig.backArm,-1,kit,look);
 paintBody(c,rig,kit,look);
 if(reaching)paintArm(c,rig.backArm,-1,kit,look);
 paintArm(c,rig.frontArm,1,kit,look);paintHead(c,rig,kit,look,data.reducedMotion||options.reducedMotion||motionPreference?.matches?0:time);
 if(rig.activity)paintTool(c,rig);else if(options.showWeapon!==false){
  art?.paintWeapon(c,data,rig.weapon==='shield'?'sword':rig.weapon,{x:rig.main.x,y:rig.main.y,angle:rig.angle});
  if(rig.weapon==='shield')art?.paintWeapon(c,data,'shield',{x:rig.back.x,y:rig.back.y,angle:-.12});
  if(rig.weapon==='bow'){c.beginPath();c.moveTo(rig.bowUpper.x,rig.bowUpper.y);c.lineTo(rig.back.x,rig.back.y);c.lineTo(rig.bowLower.x,rig.bowLower.y);c.strokeStyle='#ddcba3';c.lineWidth=.65;c.stroke();if(options.charge>.45&&((data.arrows||0)>0||(data.ammoCharges?.arrows||0)>0))stroke(c,rig.back,rig.arrowTip,'#cfb682',.9);}
  if(rig.weapon==='staff'&&options.attack>0)ellipse(c,rig.back.x,rig.back.y,3+rig.stroke*2,3+rig.stroke*2,'#a4d9e2aa');
 }
 const wrist=arm=>Math.atan2(arm.hand.y-arm.elbow.y,arm.hand.x-arm.elbow.x)-Math.PI/2;
 if(rig.weapon!=='shield'||rig.activity)paintHand(c,rig.back,wrist(rig.backArm),-1,kit,look,rig.backGesture);paintHand(c,rig.main,wrist(rig.frontArm),1,kit,look,rig.activity?rig.tool?'grip':'reach':options.showWeapon===false?'rest':'grip');c.restore();return kit;
}
global.DeepwellAvatar=Object.freeze({render,drawPart,appearance,poseRig,tier,normalizeCustom,STYLE_COUNTS,COLOR_SETS,BASE,setAssets,images:()=>[...images.values()],assetKeys:()=>[...['base',...Object.keys(ARMOR_PALETTES)].flatMap(set=>PHYSICAL_SLOTS.map(slot=>(set==='base'?'base':'armor-'+set)+'-'+slot)),...Object.keys(assets)],metrics:()=>({height:117,version:2,style:'illustrated-2d',armLengths:[...ARM_LENGTHS],legLengths:[...LEG_LENGTHS],physicalSlots:[...PHYSICAL_SLOTS]}),workRate,toolForPose:pose=>TOOLS[pose]||null,slots:Object.freeze([...PHYSICAL_SLOTS,'mainHand','offHand','tool','aura'])});
})(window);
