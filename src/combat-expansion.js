/* Shared combat language and reusable, geometry-driven encounter patterns. */
const COMBAT_LANGUAGE={danger:{color:'#f16d68',hot:'#ffe2d8',dark:'#52272a'},friendly:{color:'#c887ff',hot:'#f3ddff',dark:'#432756'},reflect:{color:'#edcb76',hot:'#fff5d5',dark:'#51452c'},safe:{color:'#6ce0bc',hot:'#d4fff0',dark:'#214940'},shield:{color:'#79bdff',hot:'#e4f3ff',dark:'#233e63'}};
const SUMMON_BUMPS=Object.freeze({normal:1,royal:2,radius:28,releaseRadius:40,normalBacklash:.08,royalBacklash:.12});
const EXPANDED_ABILITIES={
 ringchain:{name:'Rebounding Barrage',seconds:1.6,hint:'Three rings · gaps rotate · violet shots rebound'},
 bloom:{name:'Growing Stars',seconds:1.5,hint:'Projectiles grow · leave a wider gap'},
 return:{name:'Homeward Blades',seconds:1.5,hint:'Red blades turn home · watch the return path'},
 crossfire:{name:'Crossfire',seconds:1.5,hint:'Violet cross · lure enemies into the lanes'},
 spiral:{name:'Spiral Barrage',seconds:1.6,hint:'Rotating gaps · keep moving'},
 sunder:{name:'Threefold Ruin',seconds:2.8,hint:'Three red quarters · enter the teal quarter'},
 gauntlet:{name:'Marching Ruin',seconds:1.7,hint:'Red lanes strike in numbered order'},
 donut:{name:'Outer Ruin',seconds:1.8,hint:'Teal center · red outer ring'},
 nova:{name:'Inner Ruin',seconds:1.6,hint:'Red center · move outside'},
 pincer:{name:'Closing Jaws',seconds:1.8,hint:'Two violet sweeps · use the gap'},
 summon:{name:'Calling Spire',seconds:1.7,hint:'Bump once to break · dash or wait while red'},
 eliteSummon:{name:'Royal Calling',seconds:2,hint:'Bump twice · step away between hits · dash or wait while red'},
 bastion:{name:'Royal Guard',seconds:2,hint:'Blue shield · defeat both guards'},
 reversal:{name:'Hungry Mirror',seconds:1.9,hint:'Gold center reflects · a missed mirror heals the boss'},
 minefield:{name:'Marked Ground',seconds:1.8,hint:'Red marks lock on cast · step between them'},
 tether:{name:'Siphon Tether',seconds:2.6,hint:'Break the red tether · move beyond the ring'},
 orbit:{name:'Orbital Blades',seconds:1.8,hint:'Red blades orbit then fly outward'},
 eruptionTrail:{name:'Ruinous Rush',seconds:1.5,hint:'Violet charge leaves a burning trail'}
};
function combatTheme(type){return COMBAT_LANGUAGE[type]||COMBAT_LANGUAGE.danger;}
function castLanguage(type){return ['cleave','charge','eruptionTrail','ground','beam','crossfire','pincer','ringchain'].includes(type)?'friendly':['reflect','reversal'].includes(type)?'reflect':['mend','fury'].includes(type)?'safe':type==='shield'||type==='bastion'?'shield':'danger';}
function enemyBody(enemy){
 if(enemy.totem)return {x:enemy.x,top:enemy.y-42,bottom:enemy.y+4,r:18};
 if(!enemy.boss&&!enemy.elite)return {x:enemy.x,top:enemy.y-4,bottom:enemy.y,r:enemy.rad};
 const h=enemy.champion?environmentMobSize(enemy).height*1.17:enemy.elite?(enemy.bossIndex===2?118:94):enemy.bossIndex===2?185:enemy.bossIndex===1?140:124,r=Math.max(enemy.rad,h*.16),foot=enemy.y+enemy.rad*.65;
 return {x:enemy.x,top:foot-h*.80+r,bottom:foot-r-4,r};
}
function bodyPoint(enemy,x,y){const body=enemyBody(enemy);return {x:body.x,y:clamp(y,Math.min(body.top,body.bottom),Math.max(body.top,body.bottom)),r:body.r};}
function bodyDistance(enemy,x,y){const point=bodyPoint(enemy,x,y);return Math.max(0,Math.hypot(point.x-x,point.y-y)-point.r);}
function segmentsDistance(ax,ay,bx,by,cx,cy,dx,dy){
 const orient=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1),o1=orient(ax,ay,bx,by,cx,cy),o2=orient(ax,ay,bx,by,dx,dy),o3=orient(cx,cy,dx,dy,ax,ay),o4=orient(cx,cy,dx,dy,bx,by);
 if(o1*o2<0&&o3*o4<0)return 0;
 return Math.min(segmentDistance(ax,ay,cx,cy,dx,dy),segmentDistance(bx,by,cx,cy,dx,dy),segmentDistance(cx,cy,ax,ay,bx,by),segmentDistance(dx,dy,ax,ay,bx,by));
}
function shotHitsBody(shot,enemy,oldX,oldY){const b=enemyBody(enemy);return segmentsDistance(oldX,oldY,shot.x,shot.y,b.x,b.top,b.x,b.bottom)<=b.r+(shot.rad||6);}
function expandedArena(){
 const w=game.viewWidth,h=game.viewHeight,side=data.hudLayout.side;return {left:game.camX-w/2+22+(side==='left'?54:0),right:game.camX+w/2-22-(side==='right'?54:0),top:game.camY-h/2+116,bottom:game.camY+h/2-78};
}
function arenaQuarter(rect,index){const x=(rect.left+rect.right)/2,y=(rect.top+rect.bottom)/2;return {left:index%2?x:rect.left,right:index%2?rect.right:x,top:index<2?rect.top:y,bottom:index<2?y:rect.bottom};}
function insideRect(actor,r,margin=0){return actor.x>=r.left-margin&&actor.x<=r.right+margin&&actor.y>=r.top-margin&&actor.y<=r.bottom+margin;}
function expandedCastSetup(enemy,cast){
 const type=cast.type,def=EXPANDED_ABILITIES[type];if(!def)return;
 cast.label=def.name;cast.hint=def.hint;cast.total=cast.windup=def.seconds;cast.arena=expandedArena();cast.shapes=[];
 const r=cast.arena,cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;
 if(type==='sunder'){
  const index=((enemy.mechanicIndex||0)+(enemy.biome||0))%4;cast.safe=arenaQuarter(r,index);
  cast.shapes=[{shape:'quarters',rect:r,safe:cast.safe}];const px=clamp(game.player.x,cast.safe.left+18,cast.safe.right-18),py=clamp(game.player.y,cast.safe.top+18,cast.safe.bottom-18);
  cast.total=cast.windup=Math.max(2.4,Math.hypot(game.player.x-px,game.player.y-py)/175+.8);
 }else if(type==='crossfire')cast.shapes=[{shape:'rect',rect:{left:r.left,right:r.right,top:cy-24,bottom:cy+24}},{shape:'rect',rect:{left:cx-24,right:cx+24,top:r.top,bottom:r.bottom}}];
 else if(type==='gauntlet')for(let i=0;i<4;i++){const width=(r.right-r.left)/4;cast.shapes.push({shape:'rect',rect:{left:r.left+i*width+5,right:r.left+(i+1)*width-5,top:r.top,bottom:r.bottom},delay:i*.7,order:i+1});}
 else if(type==='donut'||type==='nova')cast.shapes=[{shape:'ring',x:cast.origin.x,y:cast.origin.y,inner:type==='donut'?82:0,r:type==='donut'?270:120}];
 else if(type==='pincer')cast.shapes=[-.92,.92].map(a=>({shape:'cone',origin:cast.origin,angle:cast.angle+a,reach:300,halfAngle:.62}));
 else if(type==='minefield')for(let i=0;i<7;i++){const a=i*2.4;cast.shapes.push({shape:'circle',x:cast.target.x+Math.cos(a)*(i?90:0),y:cast.target.y+Math.sin(a)*(i?90:0),r:32});}
 else if(type==='tether'){cast.shapes=[{shape:'circle',x:cast.origin.x,y:cast.origin.y,r:180}];const travel=Math.max(0,180-Math.hypot(game.player.x-cast.origin.x,game.player.y-cast.origin.y));cast.total=cast.windup=Math.max(2.2,travel/175+.9);}
 else if(type==='reversal'){cast.point.inner=34;}
 else if(type==='summon'||type==='eliteSummon'){cast.point=encounterPoint(enemy,'summon');}
 else if(type==='bastion'){cast.guards=[-.9,.9].map(a=>{const angle=cast.angle+a;return summonPoint(enemy,enemy.x+Math.cos(angle)*150,enemy.y+Math.sin(angle)*150);}).filter(Boolean);}
}
function expandedContains(actor,shape){
 const radius=actor===game.player?9:Math.min(18,actor.rad||10);
 if(shape.shape==='quarters')return insideRect(actor,shape.rect,radius)&&!insideRect(actor,shape.safe,-radius);
 if(shape.shape==='rect')return insideRect(actor,shape.rect,radius);
 if(shape.shape==='circle')return Math.hypot(actor.x-shape.x,actor.y-shape.y)<shape.r+radius;
 if(shape.shape==='ring'){const d=Math.hypot(actor.x-shape.x,actor.y-shape.y);return d<shape.r+radius&&d>shape.inner-radius;}
 if(shape.shape==='cone')return cleaveContains(actor,shape);
 return false;
}
function addExpandedHazard(owner,cast,shape,damage,delay=0){(game.hazards||(game.hazards=[])).push({...shape,type:'expanded',abilityType:cast.type,owner,enemyHits:cast.enemyHits,language:castLanguage(cast.type),biome:owner.biome,life:.65+delay,total:.65,delay,damage,age:0});}
function resolveExpandedCast(enemy,cast,damage){
 const type=cast.type;if(!EXPANDED_ABILITIES[type]||type==='reversal')return false;
 if(cast.shapes.length&&type!=='tether')for(const shape of cast.shapes)addExpandedHazard(enemy,cast,shape,damage*1.15,shape.delay||0);
 if(type==='tether'){
  if(expandedContains(game.player,cast.shapes[0])){hurt(damage);enemy.hp=Math.min(enemy.maxHp,enemy.hp+enemy.maxHp*.025);encounterLabel('SIPHON',enemy.x,enemy.y-60,combatTheme('danger').hot);}
 }else if(type==='summon'||type==='eliteSummon')createSummonTotem(enemy,cast.point,type==='eliteSummon');
 else if(type==='bastion'){
  for(const point of cast.guards||[])spawnSummonedEnemy(enemy,point,true,true);
  enemy.guardIds=game.enemies.filter(e=>e.summonedBy===enemy&&e.bastionGuard);
  floater(enemy.x,enemy.y-70,'ROYAL GUARD · DEFEAT GUARDS',combatTheme('shield').hot);
 }else if(type==='ringchain'||type==='bloom'||type==='return'||type==='spiral'||type==='orbit'){
  const bursts=type==='ringchain'?3:type==='spiral'?5:1;
  for(let i=0;i<bursts;i++)(game.bossBursts||(game.bossBursts=[])).push({owner:enemy,cast,type,delay:i*(type==='spiral'?.32:.6),index:i,damage});
 }else if(type==='eruptionTrail'){
  enemy.charge={angle:cast.angle,remaining:Math.min(340,Math.hypot(cast.target.x-cast.origin.x,cast.target.y-cast.origin.y)+65),hitPlayer:false,enemyHits:cast.enemyHits,trail:true,trailClock:0};
 }
 return true;
}
function summonPoint(owner,x,y){
 for(let i=0;i<24;i++){const a=i*2.4,d=i?24+Math.floor(i/6)*25:0,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(encounterClear(px,py,22)&&Math.hypot(px-game.player.x,py-game.player.y)>65&&game.enemies.every(e=>Math.hypot(e.x-px,e.y-py)>25))return {x:px,y:py};}return null;
}
function createSummonTotem(owner,point,elite=false){
 if(!point||(game.totems||[]).filter(t=>t.destructible).length>=2)return null;
 const hp=Math.max(40,zoneEnemyHp(false,0)*(elite?1.6:1));
 const t={totem:true,destructible:true,type:elite?'eliteSummon':'summon',eliteSummon:elite,biome:owner.biome,owner,x:point.x,y:point.y-18,rad:18,hp,maxHp:hp,age:0,spawnClock:2.4,spawnWarn:0,summonCount:0};
 (game.totems||(game.totems=[])).push(t);return t;
}
function summonBumpDamage(t){return t.maxHp/(t.eliteSummon?SUMMON_BUMPS.royal:SUMMON_BUMPS.normal);}
function summonBumpsLeft(t){return t.hp>0?Math.max(1,Math.ceil(t.hp/summonBumpDamage(t)-1e-9)):0;}
function bumpSummonTotem(t,from=encounterFoot(game.player),dashing=false){
 if(!t.destructible||!['summon','eliteSummon'].includes(t.type)||t.hp<=0)return false;
 const foot=encounterFoot(t),player=encounterFoot(game.player),distance=Math.hypot(player.x-foot.x,player.y-foot.y);
 // Re-arm only after clearing the base. A held touch or boundary jitter must
 // never turn one collision into several; a dash can cross it in one step.
 if(t.bumpContact){
  if(Math.hypot(from.x-foot.x,from.y-foot.y)<=SUMMON_BUMPS.releaseRadius){if(distance>SUMMON_BUMPS.releaseRadius)t.bumpContact=false;return false;}
  t.bumpContact=false;
 }
 if(t.bumpContact||segmentDistance(foot.x,foot.y,from.x,from.y,player.x,player.y)>SUMMON_BUMPS.radius)return false;
 t.bumpContact=true;const surging=!!t.spawnPoint&&!t.disabled&&!totemsDisabled();
 if(!damageTotem(t,summonBumpDamage(t),true))return false;
 t.bumpFlashUntil=game.frame+.2;burst(foot.x,foot.y-12,8,combatTheme('safe').color);
 if(surging&&!dashing)hurt(game.player.maxHp*(t.eliteSummon?SUMMON_BUMPS.royalBacklash:SUMMON_BUMPS.normalBacklash));
 return true;
}
function spawnSummonedEnemy(owner,point,elite=false,guard=false,totem=null){
 if(!point||!game.enemies.includes(owner)||game.enemies.filter(e=>e.summoned).length>=8||elite&&game.enemies.filter(e=>e.summoned&&e.elite).length>=3)return null;
 const e=spawnBaseEnemy(false,0);Object.assign(e,{x:point.x,y:point.y,biome:owner.biome,summoned:true,summonedBy:owner,summonTotem:totem,bastionGuard:guard,castCooldown:2,mechanicIndex:0,mechanicsUsed:[]});
 if(elite){e.elite=true;e.bossIndex=(owner.bossIndex||0)%3;e.rad=21;e.hp=e.maxHp=zoneEnemyHp(false,0)*1.7;e.speed*=.85;e.name=guard?'Royal Guard':'Summoned Elite';}else e.name='Summoned '+e.name;
 assignEnemyAppearance(e);burst(e.x,e.y,8,combatTheme('shield').color);return e;
}
function tickSummonTotem(t,dt){
 t.spawnClock-=dt;if(t.spawnClock>1.3||t.spawnPoint)return;
 const source=encounterFoot(t);t.spawnPoint=summonPoint(t.owner,source.x+Math.cos(t.summonCount*2.4)*65,source.y+Math.sin(t.summonCount*2.4)*65);t.spawnWarn=1.3;
}
function tickSummonArrival(t,dt){
 if(!t.spawnPoint)return;t.spawnWarn-=dt;if(t.spawnWarn>0)return;
 const spawned=spawnSummonedEnemy(t.owner,t.spawnPoint,t.eliteSummon,false,t);if(spawned)t.summonCount++;
 t.spawnPoint=null;t.spawnClock=t.eliteSummon?9:5.5;
}
function totemsDisabled(){return eliteBoonActive('silence');}
function enemyMovementFactor(){return activeEliteBoons().reduce((n,b)=>n*(ELITE_BOONS[b.id]?.enemyMovement||1),1);}
function secondaryDamage(enemy,damage,sourceStyle=combatStyle(),origin=null){
 if(!enemy||enemy.hp<=0)return;if(enemy.totem){damageTotem(enemy,damage);return;}
 if(!game.enemies.includes(enemy))return;enemy.hp-=damage*enemyShieldMultiplier(enemy);enemy.lastDamageStyle=sourceStyle;enemy.lastHitAt=game.frame;
 if(origin)game.arcs.push({x:origin.x,y:origin.y,tx:enemy.x,ty:enemy.y,life:.18,color:'#b4eaff'});
 if(enemy.hp<=0)onKill(enemy);
}
function dungeonKillEffects(enemy){
 const gold=grantDelveGold(eliteBoonSum('goldPerKill'));
 if(waveRank('shatter')&&enemy.frozen>0){for(const other of game.enemies.filter(e=>e!==enemy&&Math.hypot(e.x-enemy.x,e.y-enemy.y)<100).slice(0,5))secondaryDamage(other,attackDamage()*.08*waveRank('shatter'),enemy.lastDamageStyle,enemy);burst(enemy.x,enemy.y,9,'#a9e9ef');}
 if(waveRank('vortex'))for(const other of game.enemies){if(other.boss||other.elite)continue;const dx=enemy.x-other.x,dy=enemy.y-other.y,d=Math.hypot(dx,dy);if(d>25&&d<130){const step=Math.min(d-24,12*waveRank('vortex'));const x=other.x+dx/d*step,y=other.y+dy/d*step;if(encounterClear(x,y,other.rad)){other.x=x;other.y=y;}}}
 return {gold};
}
function tickBossBursts(dt){
 game.bossBursts=(game.bossBursts||[]).filter(event=>{
  if(!game.enemies.includes(event.owner)||event.owner.hp<=0)return false;event.delay-=dt;if(event.delay>0)return true;
  const {owner,type,index,damage,cast}=event,count=type==='spiral'?8:type==='orbit'?8:16,offset=index*.21+(owner.mechanicIndex||0)*.28,speed=type==='bloom'?125:type==='return'?175:165;
  for(let i=0;i<count;i++){
   if(type!=='orbit'&&i%4===0)continue;const a=i*Math.PI*2/count+offset;
   game.hostileShots.push({x:owner.x,y:owner.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,rad:6,baseRad:6,life:type==='return'?6:5,age:0,damage:damage*.85,owner,biome:owner.biome,language:castLanguage(type),abilityType:type,enemyHits:cast.enemyHits,bounce:type==='ringchain'?2:0,bounds:cast.arena,growing:type==='bloom',boomerang:type==='return',orbit:type==='orbit'?{angle:a,radius:70,remaining:1.3}:null});
  }return false;
 });
}
function advanceExpandedShot(s,dt){
 if(!s.owner||!game.enemies.includes(s.owner)||s.owner.hp<=0){s.life=0;return true;}
 s.age=(s.age||0)+dt;if(s.growing)s.rad=Math.min(23,(s.baseRad||6)+s.age*4.5);
 if(s.orbit){
  s.orbit.remaining-=dt;s.orbit.angle+=dt*1.8;s.x=s.owner.x+Math.cos(s.orbit.angle)*s.orbit.radius;s.y=s.owner.y+Math.sin(s.orbit.angle)*s.orbit.radius;
  if(s.orbit.remaining<=0){s.vx=Math.cos(s.orbit.angle)*s.speed;s.vy=Math.sin(s.orbit.angle)*s.speed;s.orbit=null;}return true;
 }
 if(s.boomerang&&s.age>1.25){const dx=s.owner.x-s.x,dy=s.owner.y-s.y,d=Math.hypot(dx,dy);if(d<22){s.life=0;return true;}s.vx=dx/Math.max(1,d)*s.speed;s.vy=dy/Math.max(1,d)*s.speed;s.returning=true;}
 if(advanceRicochet(s,dt))return true;s.x+=s.vx*dt;s.y+=s.vy*dt;
 if(s.bounce>0&&s.bounds){const r=s.bounds;let hit=false;if(s.x<r.left+s.rad||s.x>r.right-s.rad){s.vx*=-1;s.x=clamp(s.x,r.left+s.rad,r.right-s.rad);hit=true;}if(s.y<r.top+s.rad||s.y>r.bottom-s.rad){s.vy*=-1;s.y=clamp(s.y,r.top+s.rad,r.bottom-s.rad);hit=true;}if(hit){s.bounce--;burst(s.x,s.y,3,combatTheme('friendly').color);}}
 return true;
}
function steerPlayerShot(s,dt){
 if(s.returning){const p=game.player,dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy);if(d<18){s.life=0;return;}const speed=Math.hypot(s.vx,s.vy)||300;s.vx=dx/Math.max(1,d)*speed;s.vy=dy/Math.max(1,d)*speed;}
 else if(s.returnPower&&(s.age||0)> .65){s.returning=true;s.hits=new Set();}
 else if(s.homing){
  const target=combatTargets().filter(e=>!s.hits.has(e)&&bodyDistance(e,s.x,s.y)<430).sort((a,b)=>(b.boss||b.elite?1:0)-(a.boss||a.elite?1:0)||bodyDistance(a,s.x,s.y)-bodyDistance(b,s.x,s.y))[0];
  if(target){const point=bodyPoint(target,s.x,s.y),angle=Math.atan2(point.y-s.y,point.x-s.x),current=Math.atan2(s.vy,s.vx),delta=Math.atan2(Math.sin(angle-current),Math.cos(angle-current)),speed=Math.hypot(s.vx,s.vy),next=current+clamp(delta,-dt*(2.5+s.homing),dt*(2.5+s.homing));s.vx=Math.cos(next)*speed;s.vy=Math.sin(next)*speed;}
 }
 s.age=(s.age||0)+dt;
}
function redirectPlayerShot(s,enemy){
 if(!(s.ricochet>0))return false;const target=combatTargets().filter(e=>!s.hits.has(e)&&bodyDistance(e,s.x,s.y)<240).sort((a,b)=>(b.elite||b.boss?1:0)-(a.elite||a.boss?1:0)||bodyDistance(a,s.x,s.y)-bodyDistance(b,s.x,s.y))[0];if(!target)return false;
 s.ricochet--;s.damage*=.70;const point=bodyPoint(target,s.x,s.y),a=Math.atan2(point.y-s.y,point.x-s.x),speed=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;game.arcs.push({x:enemy.x,y:enemy.y,tx:point.x,ty:point.y,life:.12});return true;
}
function paintExpandedShape(shape,theme,progress=1,active=false){
 if(shape.shape==='quarters'){
  for(let i=0;i<4;i++){const rect=arenaQuarter(shape.rect,i),safe=rect.left===shape.safe.left&&rect.top===shape.safe.top;paintExpandedShape({shape:'rect',rect},safe?combatTheme('safe'):theme,progress,active);if(safe)encounterLabel('◇ SAFE',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2,combatTheme('safe').hot,12);}
 }else if(shape.shape==='rect'){
  const r=shape.rect;quad(r.left,r.top,r.right-r.left,r.bottom-r.top,theme.color+(active?'1c':'22'),theme.color,2);const step=28;if(!active){ctx.save();ctx.beginPath();ctx.rect(r.left,r.top,r.right-r.left,r.bottom-r.top);ctx.clip();for(let x=r.left-(r.bottom-r.top);x<r.right;x+=step)line(x,r.top,x+r.bottom-r.top,r.bottom,1,theme.color+'55');ctx.restore();}
  if(shape.order)encounterLabel(String(shape.order),(r.left+r.right)/2,(r.top+r.bottom)/2,theme.hot,20);
 }else if(shape.shape==='circle')paintWarningCircle(shape.x,shape.y,shape.r,progress,theme,active);
 else if(shape.shape==='ring'){
  ctx.save();ctx.beginPath();ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2);if(shape.inner)ctx.arc(shape.x,shape.y,shape.inner,0,Math.PI*2,true);ctx.fillStyle=theme.color+(active?'1c':'22');ctx.fill();ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.stroke();ctx.restore();if(shape.inner){paintWarningCircle(shape.x,shape.y,shape.inner,progress,combatTheme('safe'));encounterLabel('◇ SAFE',shape.x,shape.y,combatTheme('safe').hot);}
 }else if(shape.shape==='cone')paintEnemyCleave(shape,theme,progress,active);
}
function paintExpandedWarning(enemy,cast,progress){
 if(!EXPANDED_ABILITIES[cast.type]||cast.type==='reversal')return false;
 const theme=combatTheme(castLanguage(cast.type));for(const shape of cast.shapes||[])paintExpandedShape(shape,theme,progress);
 if(cast.point)paintWarningCircle(cast.point.x,cast.point.y,30,progress,theme);
 for(const point of cast.guards||[])paintWarningCircle(point.x,point.y,28,progress,theme);
 if(['ringchain','spiral','bloom','return','orbit'].includes(cast.type)){paintWarningCircle(cast.origin.x,cast.origin.y,enemy.rad+25,progress,theme);const count=['spiral','orbit'].includes(cast.type)?8:16,offset=(enemy.mechanicIndex||0)*.28;for(let i=0;i<count;i++){if(cast.type!=='orbit'&&i%4===0)continue;const a=i*Math.PI*2/count+offset;line(enemy.x+Math.cos(a)*50,enemy.y+Math.sin(a)*50,enemy.x+Math.cos(a)*140,enemy.y+Math.sin(a)*140,1.5,theme.color+'a0');}}
 if(cast.type==='eruptionTrail')paintEliteSpecialWarning(enemy,{...cast,type:'charge'},theme,progress);
 if(cast.type==='tether')line(enemy.x,enemy.y-20,game.player.x,game.player.y-18,2,theme.color);
 if(!game.boss&&game.enemies.find(e=>e.cast)===enemy)encounterLabel(cast.hint,game.camX,game.camY+game.viewHeight/2-100,theme.hot,game.viewWidth<600?9:11);return true;
}
function paintSummonTotem(t){
 const disabled=totemsDisabled()||(t.disabledUntil||0)>game.frame,surging=!!t.spawnPoint&&!disabled,theme=combatTheme(disabled?'shield':surging?'danger':'safe'),foot=encounterFoot(t),image=encounterImage(t.biome,'fury'),height=82,width=height*image.naturalWidth/Math.max(1,image.naturalHeight),bumps=summonBumpsLeft(t);
 ellipse(t.x,foot.y,26,8,'#080d1480');ctx.save();ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(t.x,foot.y-2,27,10,0,0,Math.PI*2);ctx.stroke();
 if(disabled)ctx.globalAlpha=.48;
 paintAbilityPortal({x:t.x,y:foot.y-10},surging?1:.65,TOTEM_SIGNALS.summon,t.eliteSummon);
 if(image.complete&&image.naturalWidth)ctx.drawImage(image,t.x-width/2,foot.y-height,width,height);
 else{poly([t.x-11,foot.y-4,t.x-15,foot.y-55,t.x,foot.y-76,t.x+15,foot.y-55,t.x+11,foot.y-4],theme.dark,theme.color,2);}
 ctx.restore();
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3+(reducedMotion()?0:game.frame*.9),x=t.x+Math.cos(a)*20,y=foot.y-42+Math.sin(a)*9;glow(x,y,10,theme.color+'55');disc(x,y,2.5,theme.hot);}
 if(t.eliteSummon)encounterLabel('♛',t.x,foot.y-83,theme.hot,18);
 quad(t.x-24,foot.y-99,48,5,'#171822');quad(t.x-24,foot.y-99,48*clamp(t.hp/t.maxHp,0,1),5,theme.color);
 encounterTip(bumps+' BUMP'+(bumps===1?'':'S')+' TO BREAK',t.x,foot.y-112,theme.hot,game.viewWidth<600?12:11,t,String(bumps),'count');
 const total=t.eliteSummon?SUMMON_BUMPS.royal:SUMMON_BUMPS.normal;
 for(let i=1;i<total;i++)quad(t.x-24+48*i/total-.75,foot.y-99,1.5,5,'#171822');
 encounterTip(t.bumpContact?'STEP CLEAR · BUMP AGAIN':disabled?'DISABLED':surging?'SURGING · DASH OR WAIT':'BUMP TO BREAK',t.x,foot.y+26,theme.hot,game.viewWidth<600?10:9,t,undefined,'instruction');
 if((t.bumpFlashUntil||0)>game.frame)paintWarningCircle(foot.x,foot.y,31,1,combatTheme('safe'));
 if(t.spawnPoint){paintWarningCircle(t.spawnPoint.x,t.spawnPoint.y,22,1-t.spawnWarn/1.3,theme);encounterLabel('SUMMON',t.spawnPoint.x,t.spawnPoint.y-27,theme.hot,8);}
}
function combatGuideHtml(){return codexParagraph('Move, dash and attack automatically. Each warning uses both a color and a shape or label. Threats lock their aim when the warning appears.')+codexRuleList([['Red · danger','Hurts you only. Leave the marked area.'],['Violet · friendly fire','Hurts you and other enemies. Lure monsters into sweeps, charges, beams, eruptions and rebounding rings.'],['Gold / white · reflect','Stand inside the small white center to reflect. Hungry Mirrors heal their caster when missed.'],['Teal · safe / benefit','Safe quarters and circles, or the ring around a stream redirected to you.'],['Totem beams · follow the symbol','Green crosses carry healing; red swords carry damage boosts. These support streams do not deal contact damage. Blue chevrons identify attack-speed effects. A disabled stream is muted and stops sending symbols.'],['Blue · shield','Break guards or a shield source to expose the protected target.'],['Spire · bump to break','Walk into an ordinary spire once, or a crowned spire twice. Step clear of its base before another bump. Teal is safe; a red, surging spire retaliates for 8% / 12% maximum health before defenses. Dash through or wait for teal to avoid that damage. Weapons can still damage spires. Healing and power totems remain stream interceptions.'],['Reinforcements','Summoned monsters and guards drop no rewards and do not count toward the wave.']])+codexParagraph('Bosses change patterns at health thresholds. Rebounding rings arrive in three waves; growing shots widen; returning blades come back to their caster. Watch their shape as well as their color.');}

function announceWeaponUpgradeTip(){
 if(data.weaponUpgradeTipSeen)return;data.weaponUpgradeTipSeen=true;toast('Strengthen your new weapon','Refine it at its crafting bench, then visit Warding to enchant it. Both improvements are permanent.');
}

function paintCombatBanks(){
 const owners=new Set();for(const shot of game.hostileShots){if(!(shot.bounce>0)||!shot.bounds||owners.has(shot.owner))continue;owners.add(shot.owner);const r=shot.bounds,theme=combatTheme('friendly');
  ctx.save();ctx.strokeStyle=theme.color+'65';ctx.lineWidth=1.5;ctx.strokeRect(r.left,r.top,r.right-r.left,r.bottom-r.top);ctx.restore();
  for(const [x,y]of [[r.left,r.top],[r.right,r.top],[r.left,r.bottom],[r.right,r.bottom],[(r.left+r.right)/2,r.top],[(r.left+r.right)/2,r.bottom]])paintRicochetBank({x,y},theme,.85);
 }
}

function hideOverlay(force=false){
 if(eliteRewardOpen()&&!force)return false;
 const visible=!$('overlay').classList.contains('hidden');$('overlay').classList.add('hidden');$('overlay').classList.remove('mastery-modal','codex-modal');document.body.classList.remove('mastery-modal-open','codex-modal-open');
 if(visible&&modalFocus?.isConnected)modalFocus.focus({preventScroll:true});
}
