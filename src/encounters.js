/* Guardian counterplay. All encounter objects are transient combat state. */
const encounterImages=new Map();
function encounterImage(kind,type){
 const key=ENVIRONMENT_ZONES[kind].key+'-'+type;
 if(!encounterImages.has(key)){const image=new Image();image.src=ENCOUNTER_ART[key].src;encounterImages.set(key,image);}
 return encounterImages.get(key);
}
function clearEncounterState(){
 game.totems=[];game.counterEffects=[];game.counterRequest=null;game.reflectCooldown=0;
 if(game.player){game.player.rallyTime=0;game.player.mending=false;}
 for(const e of game.enemies||[]){e.furyLinked=false;e.cast=null;e.stagger=0;}
}
function clearOwnerMechanics(owner){
 game.totems=(game.totems||[]).filter(t=>t.owner!==owner);owner.furyLinked=false;
 if(game.counterRequest===owner)game.counterRequest=null;
}
function combatTargets(){return [...game.enemies,...(game.totems||[])].filter(e=>e.hp>0&&(!e.totem||e.life>0&&game.enemies.includes(e.owner)));}
function encounterFoot(actor){return {x:actor.x,y:actor.y+(actor===game.player?13:actor.totem?18:actor.rad*.65)};}
function encounterClear(x,y,radius=20){
 return !worldScenery(biomeIndex(),x,y,180,180).some(o=>{
  if(o.decal)return false;const def=environmentProp(o.kind,o.index);if(!def.rx)return false;
  return Math.hypot((x-o.x)/(def.rx*o.s+radius),(y-o.y+4*o.s)/(def.ry*o.s+radius))<1;
 });
}
function encounterPoint(owner,type){
 const p=encounterFoot(game.player),o=encounterFoot(owner),small=game.viewWidth<600;
 const radius=type==='reflect'?(small?86:110):38,w=game.viewWidth,h=game.viewHeight;
 const left=game.camX-w/2+radius+14+(data.hudLayout.side==='left'?52:0),right=game.camX+w/2-radius-14-(data.hudLayout.side==='right'?52:0);
 const top=game.camY-h/2+Math.max(radius+14,118),bottom=game.camY+h/2-radius-75;
 const away=Math.atan2(p.y-o.y,p.x-o.x);let best=null,bestScore=Infinity;
 for(let i=0;i<28;i++){
  const a=away+(i%14)*Math.PI/7,d=type==='reflect'?(i<14?64:90):(i<14?170:225);
  const x=clamp((type==='reflect'?p.x:o.x)+Math.cos(a)*d,left,Math.max(left,right));
  const y=clamp((type==='reflect'?p.y:o.y)+Math.sin(a)*d,top,Math.max(top,bottom));
  const distance=Math.hypot(x-o.x,y-o.y);
  if(!encounterClear(x,y,type==='reflect'?36:25)||distance<owner.rad+(type==='reflect'?44:85))continue;
  if(type==='reflect'&&game.enemies.some(e=>e!==owner&&Math.hypot(e.x-x,e.y+e.rad*.65-y)<e.rad+44))continue;
  if(type!=='reflect'&&!encounterClear((x+o.x)/2,(y+o.y)/2,22))continue;
  const score=type==='reflect'?Math.abs(Math.hypot(x-p.x,y-p.y)-64):Math.abs(distance-175)+Math.hypot(x-p.x,y-p.y)*.25;
  if(score<bestScore){best={x,y,r:radius};bestScore=score;}
 }
 return best;
}
function bossPlan(e){
 if(e.elite)return e.bossIndex===0?['volley','reflect']:e.bossIndex===1?['ground','mend']:['beam','fury','reflect'];
 if(e.bossIndex===0)return ['volley','reflect','volley','fury'];
 if(e.bossIndex===1)return ['ground','mend','beam','reflect'];
 return zoneStage()===3?['volley','ground','reflect','fury','beam','mend']:['volley','ground','reflect','mend'];
}
function bossMechanicHint(){
 const e=game.boss;if(!e)return '';
 if(e.stagger>0)return 'Reflected · staggered';
 if(e.cast)return e.cast.type==='reflect'?'Center · reflect':e.cast.type==='mend'||e.cast.type==='fury'?'Totem · intercept or break':e.cast.label;
 const totem=(game.totems||[]).find(t=>t.owner===e);
 return totem?(totem.blocked?'Stream intercepted':'Totem · intercept or break'):'';
}
function beginBossCast(e){
 const type=bossPlan(e)[(e.mechanicIndex||0)%bossPlan(e).length],theme=DUNGEON_THEMES[e.biome??biomeIndex()];
 const active=game.enemies.filter(other=>other.cast),reflect=active.some(other=>other.cast.type==='reflect');
 if(reflect)return false;
 if(game.counterRequest&&!game.enemies.includes(game.counterRequest))game.counterRequest=null;
 if(type==='reflect'){
  if((game.reflectCooldown||0)>0)return false;
  if(!game.counterRequest)game.counterRequest=e;
  if(game.counterRequest!==e||active.length||(game.hazards||[]).some(h=>h.life>0))return false;
 }else if(game.counterRequest||active.length>=2)return false;
 const pendingTotems=active.filter(other=>other.cast.type==='mend'||other.cast.type==='fury').length;
 if((type==='mend'||type==='fury')&&((game.totems||[]).length+pendingTotems>=2||(game.totems||[]).some(t=>t.owner===e)))return false;
 const point=['reflect','mend','fury'].includes(type)?encounterPoint(e,type):null;
 if(['reflect','mend','fury'].includes(type)&&!point){if(game.counterRequest===e)game.counterRequest=null;return false;}
 const duration=type==='reflect'?2.8:type==='mend'||type==='fury'?1.4:type==='volley'?1.15:type==='ground'?1.5:1.7;
 const origin={x:e.x,y:e.y},cast={type,label:theme[type],windup:duration,total:duration,origin,angle:Math.atan2(game.player.y-e.y,game.player.x-e.x),targets:[],point};
 if(type==='reflect'){cast.point.inner=34;game.counterRequest=null;}
 if(type==='ground'){
  const count=e.elite?1:e.bossIndex===2?(zoneStage()===3?4:2):2;
  cast.targets.push({x:game.player.x,y:game.player.y,r:e.boss&&zoneStage()===3?54:44});
  for(let i=1;i<count;i++){const a=i*Math.PI*2/count+(e.mechanicIndex||0)*.75;cast.targets.push({x:game.player.x+Math.cos(a)*105,y:game.player.y+Math.sin(a)*105,r:44});}
 }
 e.mechanicIndex=(e.mechanicIndex||0)+1;e.cast=cast;e.mechanicsUsed=e.mechanicsUsed||[];
 if(!e.mechanicsUsed.includes(type))e.mechanicsUsed.push(type);return true;
}
function bossAttackDamage(e){return (e.elite?14+zoneNumber()*2:e.bossIndex===2?(zoneStage()===3?36+data.floor*1.4:27+data.floor*1.2):19+data.floor)*(e.furyLinked?1.12:1);}
function resolveBossCast(e,cast){
 const theme=e.biome??biomeIndex(),damage=bossAttackDamage(e);
 if(cast.resolved)return;cast.resolved=true;
 if(cast.type==='reflect'){
  const point=cast.point,p=encounterFoot(game.player),distance=Math.hypot(p.x-point.x,p.y-point.y),reflected=distance<=point.inner;
  (game.counterEffects||(game.counterEffects=[])).push({x:point.x,y:point.y,tx:e.x,ty:e.y-22,r:point.r,inner:point.inner,biome:theme,reflected,life:.75,total:.75});game.reflectCooldown=6;
  if(reflected){
   const amount=e.maxHp*.12;e.hp-=amount;e.stagger=1.6;e.lastDamageStyle=combatStyle();
   floater(e.x,e.y-42,'Reflected · '+Math.round(amount),DUNGEON_THEMES[theme].hot);burst(e.x,e.y,10,DUNGEON_THEMES[theme].color);
   if(e.hp<=0)onKill(e);
  }else if(distance<point.r+10)hurt(damage*1.15);
  return;
 }
 if(cast.type==='mend'||cast.type==='fury'){
  if(!game.enemies.includes(e)||(game.totems||[]).length>=2)return;
  const hp=zoneBalance().dps*(e.elite?.9:1.4);
  (game.totems||(game.totems=[])).push({totem:true,type:cast.type,biome:theme,owner:e,x:cast.point.x,y:cast.point.y-18,rad:16,hp,maxHp:hp,life:6,total:6,age:0,blocked:false});return;
 }
 if(cast.type==='volley'){
  const count=e.bossIndex===2?(e.boss&&zoneStage()===3?18:14):10,offset=(e.mechanicIndex||0)*.39;
  for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset,speed=e.elite?145:e.bossIndex===2?182:158;game.hostileShots.push({x:cast.origin.x,y:cast.origin.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rad:e.bossIndex===2?8:6,life:5,biome:theme,damage,owner:e});}
 }else if(cast.type==='ground'){
  for(const target of cast.targets)(game.hazards||(game.hazards=[])).push({...target,type:'ground',biome:theme,life:1.6,total:1.6,damage,age:0});
 }else (game.hazards||(game.hazards=[])).push({type:'beam',x:cast.origin.x,y:cast.origin.y,angle:cast.angle,width:48,length:540,life:.55,total:.55,biome:theme,damage:damage*1.3,age:0});
}
function tickBossSpecial(e,dt){
 if(e.stagger>0){e.stagger=Math.max(0,e.stagger-dt);return;}
 if(e.cast){
  e.cast.windup-=dt;if(e.cast.windup<=0){const cast=e.cast;e.cast=null;resolveBossCast(e,cast);e.castCooldown=e.bossIndex===2&&e.hp<e.maxHp*.4?2.1:3.1;}return;
 }
 e.castCooldown=(e.castCooldown??2)-dt;
 if(e.castCooldown<=0&&!beginBossCast(e))e.castCooldown=.2;
}
function totemInterception(t){
 const a=encounterFoot(t),b=encounterFoot(t.owner),p=encounterFoot(game.player),dx=b.x-a.x,dy=b.y-a.y;
 const fraction=((p.x-a.x)*dx+(p.y-a.y)*dy)/Math.max(1,dx*dx+dy*dy);
 return fraction>.12&&fraction<.88&&segmentDistance(p.x,p.y,a.x,a.y,b.x,b.y)<=19;
}
function tickEncounterObjects(dt){
 const p=game.player;p.rallyTime=Math.max(0,(p.rallyTime||0)-dt);p.mending=false;game.reflectCooldown=Math.max(0,(game.reflectCooldown||0)-dt);
 game.counterEffects=(game.counterEffects||[]).filter(fx=>{fx.life-=dt;return fx.life>0;});
 for(const e of game.enemies)e.furyLinked=false;
 game.totems=(game.totems||[]).filter(t=>t.hp>0&&t.life>0&&game.enemies.includes(t.owner));
 let healing=0;
 for(const t of game.totems){
  const elapsed=Math.min(dt,t.life);t.age+=elapsed;t.life-=elapsed;t.blocked=totemInterception(t);
  if(t.type==='mend'){
   if(t.blocked){p.mending=true;healing=Math.max(healing,elapsed);}else t.owner.hp=Math.min(t.owner.maxHp,t.owner.hp+t.owner.maxHp*.008*elapsed);
  }else if(t.blocked)p.rallyTime=5;else if(t.life>0)t.owner.furyLinked=true;
 }
 // Duplicate healing streams do not stack. Partial last ticks remain proportional.
 if(healing)p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.02*healing);
 game.totems=game.totems.filter(t=>t.life>0);
}
function damageTotem(t,base){
 if(!(game.totems||[]).includes(t)||t.hp<=0)return;
 const damage=base*(Math.random()<waveCritChance()?2:1);t.hp-=damage;
 floater(t.x,t.y-40,Math.round(damage),DUNGEON_THEMES[t.biome].hot);burst(t.x,t.y,3,DUNGEON_THEMES[t.biome].color);
 if(t.hp<=0){game.totems.splice(game.totems.indexOf(t),1);t.owner.furyLinked=false;floater(t.x,t.y-55,'Broken','#f1e6c9');}
}
function reflectAbsorbsShot(s){
 return game.enemies.some(e=>e.cast?.type==='reflect'&&Math.hypot(s.x-e.cast.point.x,s.y-e.cast.point.y)<=e.cast.point.inner);
}
function eliteQuota(){return zoneStage();}
function prepareEliteWave(){
 game.eliteCount=0;game.eliteKinds=[];game.waveEliteSpawned=false;
 const fractions=zoneStage()===3?[.18,.46,.76]:zoneStage()===2?[.24,.62]:[rand(.42,.68)];
 game.eliteSchedule=fractions.map(f=>Math.max(7,Math.floor(game.phaseTarget*f)));game.eliteAt=game.eliteSchedule[0];
}
function spawnEnemy(boss=false,bossIndex=0){
 const e=spawnBaseEnemy(boss,bossIndex);e.biome=biomeIndex();e.mechanicIndex=0;e.mechanicsUsed=[];e.castCooldown=boss?1.8:0;
 const count=game.eliteCount||0,threshold=count===0?(game.eliteAt??Infinity):(game.eliteSchedule?.[count]??Infinity);
 if(!boss&&game.phase%2===0&&game.phaseSpawned>=threshold&&count<eliteQuota()&&game.enemies.filter(other=>other.elite).length<eliteQuota()){
  const known=(data.seenElites[biomeIndex()]||[]).map((seen,i)=>seen?i:-1).filter(i=>i>=0);
  if(known.length){
   const unused=known.filter(i=>!(game.eliteKinds||[]).includes(i)),pool=unused.length?unused:known;
   e.elite=true;e.bossIndex=pool[Math.floor(Math.random()*pool.length)];e.name=biome().boss[e.bossIndex]+' Echo';e.rad=23;e.hp=e.maxHp=zoneEnemyHp(false,0)*2.8;e.speed*=.82;e.castCooldown=.7+count*.7;
   game.eliteCount=count+1;(game.eliteKinds||(game.eliteKinds=[])).push(e.bossIndex);game.waveEliteSpawned=true;
  }
 }
 assignEnemyAppearance(e);return e;
}
function encounterLabel(label,x,y,color,size=10){
 ctx.save();ctx.font='600 '+size+'px system-ui';ctx.textAlign='center';ctx.lineWidth=3.5;ctx.strokeStyle='#10140f';ctx.strokeText(label,x,y);ctx.fillStyle=color;ctx.fillText(label,x,y);ctx.restore();
}
function paintReflectWard(point,progress,kind,active=false){
 const theme=DUNGEON_THEMES[kind],image=encounterImage(kind,'reflect'),r=point.r,inner=point.inner;
 ctx.save();ctx.beginPath();ctx.arc(point.x,point.y,r,0,Math.PI*2);ctx.arc(point.x,point.y,inner,0,Math.PI*2,true);ctx.fillStyle=theme.color+(active?'40':'16');ctx.fill();ctx.strokeStyle=theme.color+'c0';ctx.lineWidth=2;ctx.stroke();
 if(image.complete&&image.naturalWidth){ctx.globalAlpha=.82;ctx.drawImage(image,point.x-inner,point.y-inner,inner*2,inner*2);ctx.globalAlpha=1;}
 ctx.strokeStyle='#f3edcf';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(point.x,point.y,inner+3,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle=theme.hot;ctx.lineWidth=4;ctx.beginPath();ctx.arc(point.x,point.y,r+4,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
 for(let i=0;i<6;i++){const a=i*Math.PI/3,d=inner+13+(1-progress)*20,x=point.x+Math.cos(a)*d,y=point.y+Math.sin(a)*d;ctx.save();ctx.translate(x,y);ctx.rotate(a);line(5,-4,0,0,2,theme.hot);line(0,0,5,4,2,theme.hot);ctx.restore();}
 ctx.restore();
}
function paintEncounterGround(){
 for(const e of game.enemies)if(e.cast?.type==='reflect')paintReflectWard(e.cast.point,clamp(1-e.cast.windup/e.cast.total,0,1),e.biome);
 for(const fx of game.counterEffects||[]){ctx.save();ctx.globalAlpha=fx.life/fx.total;paintReflectWard(fx,1,fx.biome,true);ctx.restore();}
}
function paintTotem(t){
 const theme=DUNGEON_THEMES[t.biome],image=encounterImage(t.biome,t.type),height=64,width=height*image.naturalWidth/Math.max(1,image.naturalHeight),foot=encounterFoot(t);
 ellipse(t.x,foot.y,23,7,'#090f1360');
 if(image.complete&&image.naturalWidth)ctx.drawImage(image,t.x-width/2,foot.y-height,width,height);
 else {disc(t.x,foot.y-28,15,theme.dark);encounterLabel(t.type==='mend'?'+':'ϟ',t.x,foot.y-24,theme.hot,22);}
 const y=foot.y-height-7;quad(t.x-19,y,38,4,'#101711');quad(t.x-19,y,38*clamp(t.hp/t.maxHp,0,1),4,t.blocked?'#f3e7b6':theme.color);
 ctx.save();ctx.strokeStyle=theme.hot;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(t.x,foot.y,24,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(t.life/t.total,0,1));ctx.stroke();ctx.restore();
}
function paintEncounterLinks(){
 for(const t of game.totems||[]){
  const a={x:t.x,y:t.y-22},b={x:t.owner.x,y:t.owner.y-22},p={x:game.player.x,y:game.player.y-18},theme=DUNGEON_THEMES[t.biome],end=t.blocked?p:b;
  ctx.save();ctx.lineCap='round';
  if(t.blocked){ctx.setLineDash([4,6]);line(p.x,p.y,b.x,b.y,1.5,theme.color+'50');ctx.setLineDash([]);}
  line(a.x,a.y,end.x,end.y,7,theme.dark+'c0');line(a.x,a.y,end.x,end.y,3,t.blocked?'#f3e7b6':theme.color);line(a.x,a.y,end.x,end.y,1,theme.hot);
  const steps=reducedMotion()?1:4;for(let i=0;i<steps;i++){const u=reducedMotion()?.5:((game.frame*.7+i/steps)%1);disc(a.x+(end.x-a.x)*u,a.y+(end.y-a.y)*u,2.5,theme.hot);}
  ctx.restore();
  encounterLabel(t.blocked?'Intercepted':'Intercept / break',t.x,t.y-62,t.blocked?'#f3e7b6':theme.hot);
 }
 for(const e of game.enemies){
  if(e.cast?.type==='reflect'){
   const point=e.cast.point;
   // The safe boundary stays readable when a large creature overlaps the mark.
   ctx.save();ctx.strokeStyle='#f3edcf';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(point.x,point.y,point.inner+3,0,Math.PI*2);ctx.stroke();ctx.restore();
   encounterLabel('CENTER · REFLECT',point.x,point.y+point.inner+19,DUNGEON_THEMES[e.biome].hot,11);
  }
  if(e.stagger>0)encounterLabel('STAGGERED',e.x,e.y-e.rad-24,DUNGEON_THEMES[e.biome].hot);
 }
 for(const fx of game.counterEffects||[])if(fx.reflected){ctx.save();ctx.globalAlpha=fx.life/fx.total;line(fx.x,fx.y,fx.tx,fx.ty,8,DUNGEON_THEMES[fx.biome].color+'60');line(fx.x,fx.y,fx.tx,fx.ty,2.5,DUNGEON_THEMES[fx.biome].hot);ctx.restore();}
 const p=game.player;if(p.mending||p.rallyTime>0)encounterLabel(p.mending?'+ HP':'+10% DMG',p.x,p.y+39,'#f3e7b6');
}
