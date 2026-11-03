/* Visible production rewards and a shared, non-overlapping resource row. */
let workshopInstalled=false;
const workshopArtImages=new Map();
function skillGoldYield(key){const base=SKILLS[key]?.goldGain||0;return base?base+(data.skillBoosts?.scavenging?1:0)+base*trinketBonus('gold'):0;}
function workGoldLabel(key){const amount=skillGoldYield(key);return amount?Number(amount.toFixed(2)).toString():'';}
function workshopYieldHtml(key){return '<b>+'+skillYield(key)+'</b>'+(SKILLS[key].goldGain?'<span class="work-gold" aria-label="'+workGoldLabel(key)+' Gold per search">'+artHTML('coins')+'<b>+'+workGoldLabel(key)+'</b></span>':'');}
function installWorkshopUI(){
 if(workshopInstalled)return;workshopInstalled=true;
 const row=document.createElement('div');row.id='resourceHud';row.className='resource-hud';row.setAttribute('aria-label','Dungeon Sigils and ammunition');$('stageWrap').append(row);
 for(const id of ['zoneCurrencyHud','ammoNotice'])if($(id))row.append($(id));
 for(const key of Object.keys(WORKSHOP_ART))workshopPropImage(key);
}
function recordWorkshopReward(key,amount,gold,gem){
 if(!workshopInstalled||game.scene!==key||drawerKind||!$('overlay').classList.contains('hidden'))return;
 const now=performance.now(),last=game.workReward;
 if(last&&last.key===key&&now-last.time<180){last.amount+=amount;last.gold+=gold;if(gem)last.gems=(last.gems||0)+1;last.time=now;}
 else game.workReward={key,amount,gold,gems:gem?1:0,time:now};
 if(gold){const chip=$('quickGold').parentElement;chip.classList.remove('currency-gain');requestAnimationFrame(()=>chip.classList.add('currency-gain'));}
 if(now-(game.lastRewardAnnounced||0)>1200){$('skillBonusStatus').textContent='+'+amount+' '+RESOURCE_LABEL[SKILLS[key].resource]+(gold?' · +'+Number(gold.toFixed(2))+' Gold':'');game.lastRewardAnnounced=now;}
}
function paintWorkshopReward(anchor){
 const reward=game.workReward;if(!reward||reward.key!==game.scene)return;
 const age=(performance.now()-reward.time)/1000;if(age>1.8)return;
 const fade=age<1.2?1:Math.max(0,(1.8-age)/.6),rise=reducedMotion()?0:Math.min(22,age*15),items=[[SKILLS[reward.key].resource,reward.amount],...(reward.gold?[['gold',Number(reward.gold.toFixed(2))]]:[])];
 const y=clamp(anchor.y-anchor.height*.68-rise,110,(game.workAreaBottom||game.viewHeight-230)-24),width=items.length*82;ctx.save();ctx.globalAlpha=fade;
 items.forEach(([key,amount],index)=>{const x=clamp(anchor.x-width/2+index*82,16,game.viewWidth-80),image=presentationResourceImage(key);if(image.complete&&image.naturalWidth)ctx.drawImage(image,x,y-13,25,25);ctx.font='700 15px system-ui';ctx.textAlign='left';ctx.lineWidth=4;ctx.strokeStyle='#151710';ctx.strokeText('+'+amount,x+29,y+5);ctx.fillStyle=key==='gold'?'#f4d287':'#f0e3c7';ctx.fillText('+'+amount,x+29,y+5);});ctx.restore();
}
function produce(key,active=false){
 const skill=SKILLS[key];if(!skill||!canUseSkill(key)||!spendAtStation(skill.cost||{},disciplineFor(key)))return false;
 const amount=skillYield(key);data[skill.resource]=(data[skill.resource]||0)+amount;let gold=0,found='';
 if(skill.goldGain){gold=skillGoldYield(key);data.gold+=gold;data.scavengeDry=(data.scavengeDry||0)+1;
  if(Math.random()<.07+trinketBonus('find')||data.scavengeDry>=20){data.scavengeDry=0;found=skill.tier===2?'garnets':'opals';data[found]++;codexDiscover('resource_'+found);if(active)toast(found==='garnets'?'Garnet found!':'Opal found!','A rough gem for Artisan');}}
 const xp=active?Math.max(5,Math.floor(skill.gain*.65)):skill.gain;data[skill.xp]=(data[skill.xp]||0)+xp;const group=disciplineOf(key);data[group.xp]=(data[group.xp]||0)+xp;
 recordWorkshopReward(key,amount,gold,found);codexDiscover('discipline_'+disciplineFor(key));codexDiscover('resource_'+skill.resource);codexDiscover('skill_'+key);return amount;
}
function goToSource(resource){
 if(resource==='gold'){enterActivity('scavenge');return;}
 if(resource==='essence'){closeDrawer();setScene('combat',true);toast('Defeat a guardian for essence');return;}
 const key=RESOURCE_SOURCE[resource];if(!key)return;workshopTier=SKILLS[key].tier||1;
 if(!canUseSkill(key)){openWorkshop(disciplineFor(key),SKILLS[key].cost?'refine':'gather');toast('Resource locked',skillLockReason(key));return;}
 enterActivity(key);
}

const WORKSHOP_THEMES=[{light:'#bed99a',deep:'#527b46',spark:'#e5d79c'},{light:'#f1c082',deep:'#b96835',spark:'#ffe3a1'},{light:'#cfb7ef',deep:'#8060a7',spark:'#e9dcff'},{light:'#a2e3e8',deep:'#4d95b1',spark:'#e5fbff'}];
function workshopAnimation(key,active,working){
 const base=SKILLS[key].scene||key,pose={mine:'mine',silverMine:'mine',forge:'smith',silverSmelt:'smith',wood:'wood',fletch:'fletch',ward:'ward',rune:'rune',polish:'polish',scavenge:'scavenge'}[base]||'scavenge';
 const interval=skillInterval(key,active),elapsed=active?(game.activeClockMs-(game.lastActiveAt?.[key]??game.activeClockMs))/1000:(data.jobTimers[key]||0),phase=working&&!reducedMotion()?Math.min(.9999,Math.max(0,elapsed/interval)):.3;
 const time=reducedMotion()?0:(game.workVisualClock||0),now=performance.now();
 if(!game.workPresentation||game.workPresentation.key!==key)game.workPresentation={key,at:now,blend:0};
 const presentation=game.workPresentation,elapsedVisual=Math.min(.08,Math.max(0,(now-presentation.at)/1000));presentation.at=now;presentation.blend=clamp(presentation.blend+(working?elapsedVisual/.18:-elapsedVisual/.24),0,1);
 const visualPhase=working&&!reducedMotion()?((time*DeepwellAvatar.workRate(pose))%1):.65;
 const reaction=game.workBonusReaction?.key===key?game.workBonusReaction:null;
 const frame={key,base,pose,working,phase:visualPhase,productionPhase:phase,time,workCycle:Math.floor(time*DeepwellAvatar.workRate(pose)),workBlend:reducedMotion()?(working?1:0):presentation.blend,workPhase:visualPhase,bonusReaction:reaction&&!reducedMotion()?{progress:reaction.age/reaction.duration,variant:reaction.variant}:null,action:working?game.workAction:0,data,theme:WORKSHOP_THEMES[biomeIndex()]};
 const rig=DeepwellAvatar.poseRig(frame);
 if(working&&!reducedMotion()&&rig.contact&&!presentation.lastContact&&['mine','smith','wood','polish'].includes(pose))presentation.impact={point:rig.toolTip,at:now,seed:frame.workCycle};
 presentation.lastContact=rig.contact;return frame;
}
function workshopGlyph(c,x,y,r,kind,color){
 c.save();c.translate(x,y);c.strokeStyle=color;c.lineWidth=.7;c.beginPath();
 if(kind===0){c.moveTo(-r,r);c.quadraticCurveTo(-r,-r,r,-r);c.quadraticCurveTo(r,r,-r,r);c.moveTo(-r,r);c.lineTo(r,-r);}
 else if(kind===1){c.moveTo(0,-r);c.lineTo(r,r);c.lineTo(-r,r);c.closePath();c.moveTo(-r*.7,0);c.lineTo(r*.7,0);}
 else if(kind===2){c.moveTo(-r,-r);c.lineTo(r,r);c.moveTo(r,-r);c.lineTo(-r,r);c.moveTo(0,-r*1.3);c.lineTo(0,r*1.3);}
 else{c.moveTo(0,-r*1.3);c.lineTo(r,0);c.lineTo(0,r*1.3);c.lineTo(-r,0);c.closePath();c.moveTo(-r,0);c.lineTo(r,0);}
 c.stroke();c.restore();
}
function paintWorkshopWorkpiece(frame,rig){
 const {pose,working,key,theme}=frame,piece=rig.workPiece;if(!piece)return;const {x,y}=piece;
 if(pose==='ward'){
  ctx.fillStyle=SKILLS[key].tier===2?'#94aac6':'#c5b3ce';ctx.strokeStyle='#4e4351';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-9,y-6);ctx.quadraticCurveTo(x,y-4,x+9,y-6);ctx.lineTo(x+8,y+7);ctx.quadraticCurveTo(x,y+5,x-8,y+7);ctx.closePath();ctx.fill();ctx.stroke();
  for(let row=0;row<5;row++){ctx.strokeStyle=row%2?theme.light:'#e2d6d7';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(x-7,y-4+row*2);ctx.quadraticCurveTo(x,y-2+row*2,x+7,y-4+row*2);ctx.stroke();}
 }else if(pose==='rune'){
  ctx.save();ctx.translate(x,y);ctx.rotate(piece.angle||0);ctx.fillStyle='#626d72';ctx.strokeStyle='#263438';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,8,5,-.2,0,Math.PI*2);ctx.fill();ctx.stroke();workshopGlyph(ctx,0,-1,3.1,biomeIndex(),working?theme.spark:theme.light);ctx.restore();
 }else if(pose==='polish'){
  ctx.save();ctx.translate(x,y);ctx.rotate(piece.angle);ctx.fillStyle=SKILLS[key].tier===2?'#a7523a':'#a8d9ce';ctx.strokeStyle='#3a4b4c';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(5,-1);ctx.lineTo(2,4);ctx.lineTo(-4,2);ctx.lineTo(-5,-2);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#e4eee0';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(-1,0);ctx.lineTo(5,-1);ctx.moveTo(-1,0);ctx.lineTo(2,4);ctx.stroke();ctx.restore();
 }else if(pose==='fletch'){
  ctx.strokeStyle=SKILLS[key].tier===2?'#b8a27b':'#c5a276';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-19,y+1);ctx.lineTo(x+12,y-1);ctx.stroke();ctx.fillStyle='#a6b6ba';ctx.beginPath();ctx.moveTo(x+12,y-3);ctx.lineTo(x+18,y-2);ctx.lineTo(x+12,y+1);ctx.fill();ctx.strokeStyle='#d6d3b8';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-18+i*2,y+1);ctx.lineTo(x-22+i*2,y-2);ctx.stroke();}
 }
}
function paintWorkshopSceneEffects(frame,anchor,layer){
 const {pose,working,time,theme,key}=frame,kind=biomeIndex(),rig=DeepwellAvatar.poseRig(frame),phase=rig.phase,magical=['ward','rune'].includes(pose),center=rig.workPiece||{x:33,y:-44};
 ctx.save();ctx.translate(anchor.x,anchor.y);ctx.scale(anchor.scale,anchor.scale);
 if(layer==='back'){
  const prop=workshopProp(frame),image=prop&&workshopPropImage(prop.art);if(image?.complete&&image.naturalWidth){const width=Math.min(62,prop.height*image.naturalWidth/image.naturalHeight);ctx.drawImage(image,prop.x-width/2,-prop.height,width,prop.height);}
  if(magical){const g=ctx.createRadialGradient(center.x,center.y,1,center.x,center.y,29);g.addColorStop(0,theme.light+'35');g.addColorStop(1,theme.light+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(center.x,center.y,29,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=theme.deep+'b0';ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(center.x,center.y,23,17,-.2,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3+(working?time*.15:0);workshopGlyph(ctx,center.x+Math.cos(a)*23,center.y+Math.sin(a)*17,2.1,kind,theme.light+'c0');}}
  // The fingers and tools must sit in front of the solid workpiece.
  paintWorkshopWorkpiece(frame,rig);ctx.restore();return;
 }
 if(pose==='ward'&&working){
  const {x,y}=center;ctx.strokeStyle=theme.light;ctx.lineWidth=.8;
  for(const [i,hand]of [rig.back,rig.toolTip||rig.main].entries()){ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.bezierCurveTo(hand.x+7,hand.y-10,x-9,y+8,x+(i?6:-6),y+(i?-4:4));ctx.stroke();}
  const weft=x-7+14*((phase*2)%1);ctx.strokeStyle='#fff6db';ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(weft,y-4);ctx.lineTo(weft+1,y+4);ctx.stroke();workshopGlyph(ctx,x,y,3,kind,'#f6eed9');
 }else if(pose==='rune'&&working){
  ctx.strokeStyle=theme.light;ctx.lineWidth=.75;ctx.beginPath();ctx.ellipse(center.x,center.y,13,8,-.2,-Math.PI/2,-Math.PI/2+Math.PI*2*phase);ctx.stroke();
  if(rig.toolTip){ctx.fillStyle=theme.spark;ctx.beginPath();ctx.arc(rig.toolTip.x,rig.toolTip.y,1.15,0,Math.PI*2);ctx.fill();}
 }else if(pose==='scavenge'){
  for(let i=0;i<5;i++){const x=35+i*6,y=-1+(i%2);ctx.fillStyle=i%2?'#716650':'#8c8067';ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x-1,y-3-i%2);ctx.lineTo(x+2,y-2);ctx.lineTo(x+3,y+1);ctx.fill();}
  const reward=game.workReward;if(reward?.key===key&&reward.gold&&performance.now()-reward.time<900){ctx.fillStyle='#dfb766';ctx.beginPath();ctx.ellipse(34,-5,3,1.8,-.2,0,Math.PI*2);ctx.fill();workshopGlyph(ctx,34,-9,2,3,'#fff0bb');}
 }
 const striking=['mine','smith','wood','polish'].includes(pose),impact=game.workPresentation?.key===key?game.workPresentation.impact:null,impactAge=impact?(performance.now()-impact.at)/1000:10;
 if(!reducedMotion()&&(striking?impactAge<.36:working&&rig.contact)){
  const origin=striking?impact.point:rig.toolTip||center,count=pose==='smith'?10:pose==='ward'?7:5;
  for(let i=0;i<count;i++){const age=striking?clamp(impactAge/.36,0,1):((time*.5+i/count)%1),a=i*2.399+(impact?.seed||0)*.3,dist=age*(magical?16:pose==='smith'?19:11);ctx.globalAlpha=(1-age)*.8;ctx.strokeStyle=pose==='smith'?'#f5bf75':magical?theme.light:pose==='wood'||pose==='fletch'?'#c8a16a':pose==='scavenge'?'#b4a080':'#a7b6b7';ctx.lineWidth=pose==='smith'?.8:1;ctx.beginPath();ctx.moveTo(origin.x+Math.cos(a)*dist,origin.y+Math.sin(a)*dist*.6-age*6);ctx.lineTo(origin.x+Math.cos(a)*(dist+2.4),origin.y+Math.sin(a)*(dist+2.4)*.6-age*6);ctx.stroke();}
 }
 ctx.restore();paintWorkshopBonusCapture(frame,anchor,rig);
}

function paintWorkshopBonusCapture(frame,anchor,rig){
 const reaction=game.workBonusReaction;if(!reaction||reaction.key!==frame.key||reducedMotion())return;
 const progress=clamp(reaction.age/reaction.duration,0,1),point=rig.workPiece||rig.toolTip||rig.main,target={x:anchor.x+point.x*anchor.scale,y:anchor.y+point.y*anchor.scale},rect=canvas.getBoundingClientRect(),origin=reaction.origin?{x:reaction.origin.x*game.viewWidth/rect.width,y:reaction.origin.y*game.viewHeight/rect.height}:target;
 const rare=['rare','very-rare'].includes(reaction.rarity),count=rare?7:4;
 ctx.save();ctx.strokeStyle=reaction.color;ctx.fillStyle=reaction.color;ctx.lineWidth=1.4;
 for(let i=0;i<count;i++){
  const t=clamp((progress-i*.035)/.58,0,1);if(t>=1)continue;const ease=1-(1-t)**3,spread=Math.sin(t*Math.PI),x=origin.x+(target.x-origin.x)*ease+spread*Math.sin(i*2.4)*18,y=origin.y+(target.y-origin.y)*ease-spread*(24+i*3);
  ctx.globalAlpha=Math.sin(t*Math.PI)*.8;ctx.beginPath();ctx.arc(x,y,rare?2.2:1.6,0,Math.PI*2);ctx.fill();
 }
 if(progress>.30){const burst=clamp((progress-.30)/.70,0,1);ctx.globalAlpha=(1-burst)*.6;ctx.beginPath();ctx.ellipse(target.x,target.y,(7+burst*20)*anchor.scale,(4+burst*10)*anchor.scale,0,0,Math.PI*2);ctx.stroke();if(rare){ctx.globalAlpha=(1-burst)*.8;workshopGlyph(ctx,target.x,target.y,5*anchor.scale,reaction.variant,reaction.color);}}
 ctx.restore();
}

function workshopPropImage(key){
 if(!workshopArtImages.has(key)){const image=new Image();image.decoding='async';image.src=WORKSHOP_ART[key].src;workshopArtImages.set(key,image);}return workshopArtImages.get(key);
}
function workshopProp(frame){
 const pose=frame.pose;
 if(pose==='mine')return {art:frame.key==='coal'?'coal':frame.base==='silverMine'?'silver':'iron',x:58,height:48};
 if(pose==='smith')return {art:'anvil',x:60,height:36};
 if(pose==='wood')return {art:'chopping',x:58,height:39};
 if(pose==='fletch')return {art:'fletching',x:34,height:44};
 if(pose==='ward')return {art:'warding',x:29,height:26};
 if(pose==='rune')return {art:'engraving',x:33,height:44};
 if(pose==='polish')return {art:'jeweling',x:31,height:44};
 return null;
}
function workshopBounds(key){
 const base=SKILLS[key].scene||key;
 return base==='scavenge'?{left:-46,right:80}:['mine','silverMine','forge','silverSmelt','wood'].includes(base)?{left:-24,right:90}:base==='fletch'?{left:-24,right:67}:{left:-24,right:62};
}

function drawProceduralWorkstation(w,h,key){
 const base=SKILLS[key].scene||key;
 const t=reducedMotion()?0:game.activeClockMs/1000,top=90,bottom=h-(innerWidth<=760?283:215),available=Math.max(180,bottom-top),scale=Math.min(w/1000,available/520,1.5),x=w/2,y=top+available/2+20;
 const cacheKey=[key,Math.round(w),Math.round(h),innerWidth<=760].join(':');
 let surface=roomSceneCache.get(cacheKey);
 if(!surface){
  surface=document.createElement('canvas');surface.width=Math.ceil(w);surface.height=Math.ceil(h);
  // Keep helpers bound to the main context by rendering a cached static layer once.
  ctx.save();roomArchitecture(w,h,base);ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-500,-280);drawRoomSet(base);ctx.restore();
  surface.getContext('2d').drawImage(canvas,0,0,canvas.width,canvas.height,0,0,surface.width,surface.height);
  roomSceneCache.set(cacheKey,surface);if(roomSceneCache.size>16)roomSceneCache.delete(roomSceneCache.keys().next().value);
 }else ctx.drawImage(surface,0,0,w,h);
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-500,-280);
 const active=game.holdSkill===key&&!$('skillHold').disabled,working=active||(data.idleJobs.includes(key)&&hasIngredients(skillCost(key)));
 if(base==='forge'||base==='silverSmelt'){
  glow(279,351,130,'#e0a15f20');for(let i=0;i<7;i++){const x=241+i*13,y=401,fl=23+Math.sin(t*3+i)*8;ctx.beginPath();ctx.moveTo(x-10,y);ctx.bezierCurveTo(x-18,y-fl,x+7,y-fl-22,x+4,y-fl-38);ctx.bezierCurveTo(x+18,y-fl+4,x+20,y-4,x+9,y);ctx.closePath();ctx.fillStyle=i%2?'#ecb478':'#d98f56';ctx.fill();}
 }
 const frame=workshopAnimation(key,active,working),anchor={x:521,y:534,scale:1.8,height:180};
 paintWorkshopSceneEffects(frame,anchor,'back');DeepwellAvatar.render(ctx,{...frame,x:anchor.x,y:anchor.y,scale:anchor.scale});paintWorkshopSceneEffects(frame,anchor,'front');
 ctx.restore();
 paintWorkshopReward({x:x+21*scale,y:y+254*scale,height:180*scale});
 // Local ambient motes are few, slow, and never cover the action bar.
 if(!reducedMotion())for(let i=0;i<12;i++){const px=rng(i,83,key.length)*w,py=top+((rng(i,84)*available+t*(2+i%3))%available);ctx.globalAlpha=.14;disc(px,py,1,'#ecdbb2');}ctx.globalAlpha=1;
}
