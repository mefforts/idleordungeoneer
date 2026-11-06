const TOTEM_SUPPORT={playerHeal:.0035,playerReserve:.15,enemyHeal:.004,rallySeconds:5};
/* Guardian counterplay. All encounter objects are transient combat state. */
const encounterImages=new Map();
function encounterImage(kind,type){
 const key=ENVIRONMENT_ZONES[kind].key+'-'+type;
 if(!encounterImages.has(key)){const image=new Image();image.src=ENCOUNTER_ART[key].src;encounterImages.set(key,image);}
 return encounterImages.get(key);
}
function clearEncounterState(){
 game.mechanicDirector=null;game.themedEvents=[];game.themedHistory=[];game.hazards=[];game.releasedWards=[];
 game.eliteRecruits=new Map();game.elitePromotionCount=0;game.enemyPositionSerial=0;game.dashSweep=null;
 game.phaseCleanupPending=false;game.graveEchoes=[];game.totems=[];game.counterEffects=[];game.counterRequest=null;game.reflectCooldown=0;game.disruptReadyAt=0;game.bossBursts=[];
 if(game.player){game.player.hitInvuln=0;game.player.rallyTime=0;game.player.mending=false;game.player.dotDamage=0;game.player.dotDisplayAt=0;game.player.dotWindowAt=-1;game.player.dotWindowSpent=0;game.player.dashGuard=0;game.player.refundedDashSerial=null;game.player.refundFlashUntil=0;}
 for(const e of game.enemies||[]){e.furyLinked=false;e.cast=null;e.stagger=0;e.charge=null;e.shieldLink=null;e.guardIds=[];e.phaseQueue=[];e.eliteTask=null;e.eliteBehavior=null;e.enemyPosition=null;e.healingRetreat=null;e.retreatReadyAt=0;e.ascendance=0;e.stunnedByDash=null;e.resolveDisabledUntil=0;e.friendlyStaggerReadyAt=0;e.mechanicCounts={};}
}
function clearOwnerMechanics(owner){
 if(isReflectCast(owner.cast)&&!owner.cast.resolved)(game.releasedWards||(game.releasedWards=[])).push({owner,cast:owner.cast});
 owner.defeated=true;game.themedEvents=(game.themedEvents||[]).filter(e=>e.partner!==owner&&(e.owner!==owner||independentThemedMechanic(e)));
 owner.cast=null;owner.charge=null;owner.shieldLink=null;owner.guardIds=[];
 clearEliteTask(owner);for(const enemy of game.enemies)if(enemy.eliteTask?.target===owner)interruptEliteTask(enemy,'target');
 for(const enemy of game.enemies)if(enemy.cast?.themed?.partner===owner)enemy.cast=null;
 for(const enemy of game.enemies)if(enemy.shieldLink?.target===owner)enemy.shieldLink=null;
 game.enemies=game.enemies.filter(e=>!e.summoned||e.summonedBy!==owner||e.summonTotem&&(game.totems||[]).includes(e.summonTotem));owner.furyLinked=false;clearDeadShieldLinks();
 if(game.counterRequest===owner)game.counterRequest=null;
}
function combatTargets(){return game.enemies.filter(e=>e.hp>0);}
function encounterFoot(actor){return {x:actor.x,y:actor.y+(actor===game.player?13:actor.totem?18:actor.rad*.65)};}
function encounterClear(x,y,radius=20){
 return !worldScenery(biomeIndex(),x,y,180,180).some(o=>{
  if(o.decal)return false;const def=environmentProp(o.kind,o.index);if(!def.rx)return false;
  return Math.hypot((x-o.x)/(def.rx*o.s+radius),(y-o.y+4*o.s)/(def.ry*o.s+radius))<1;
 });
}
function encounterPoint(owner,type){
 const p=encounterFoot(game.player),o=encounterFoot(owner),small=game.viewWidth<600,reflect=type==='reflect';
 const radius=reflect?(small?86:110):38,w=game.viewWidth,h=game.viewHeight;
 const left=game.camX-w/2+radius+14+(data.hudLayout.side==='left'?52:0),right=game.camX+w/2-radius-14-(data.hudLayout.side==='right'?52:0);
 const top=game.camY-h/2+Math.max(radius+14,118),bottom=game.camY+h/2-radius-75;
 const preferred=reflect?(small?250:300):(small?260:320),minimum=reflect?(small?200:230):(small?190:220),away=Math.atan2(p.y-o.y,p.x-o.x);let best=null,bestScore=Infinity;
 for(let i=0;i<96;i++){
  const ring=Math.floor(i/24),a=away+(i%24)*Math.PI/12,fromPlayer=reflect&&ring===3,origin=fromPlayer?p:o,d=fromPlayer?145:[preferred,preferred+70,minimum,minimum+40][ring];
  const x=clamp(origin.x+Math.cos(a)*d,left,Math.max(left,right)),y=clamp(origin.y+Math.sin(a)*d,top,Math.max(top,bottom)),distance=Math.hypot(x-o.x,y-o.y),travel=Math.hypot(x-p.x,y-p.y);
  if(distance<minimum||!encounterClear(x,y,reflect?36:25))continue;
  if(reflect){
   if(travel>300||game.enemies.some(e=>e!==owner&&Math.hypot(e.x-x,e.y+e.rad*.65-y)<e.rad+44))continue;
  }else{
   if((game.totems||[]).some(t=>Math.hypot(t.x-x,t.y+18-y)<95))continue;
   if([.25,.5,.75].some(t=>!encounterClear(o.x+(x-o.x)*t,o.y+(y-o.y)*t,16)))continue;
  }
  const score=Math.abs(distance-preferred)+(reflect?travel*.30:travel*.15);
  if(score<bestScore){best={x,y,r:radius};bestScore=score;}
 }
 return best;
}
function standardBossPlan(e,zone=zoneNumber()){
 if(e.champion){const role=rareEliteRole(e),extra=['nova','bloom','minefield','return','summon','pincer','crossfire','orbit'][(e.visualType+(e.biome||0))%8];return role==='shield'?['shield',extra,'cleave']:role==='charge'?['charge','cleave',extra]:['ricochet','cleave',extra];}
 if(zone===2&&e.bossIndex===0)return e.elite?['gravePulse','reflect','charge','cleave']:['gravePulse','reflect','crossfire','cleave','summon','gravePulse','charge'];
 if(zone===1&&e.bossIndex===0)return e.elite?['bloom','cleave','reflect','bloom','charge','nova']:['bloom','cleave','reflect','bloom','charge','fury','bloom','crossfire','nova'];
 if(zone===1&&e.bossIndex===1)return e.elite?['ground','bloom','shield','summon','tether']:['ground','bloom','cleave','mend','beam','reflect','bloom','summon','pincer','donut','tether'];
 if(e.elite)return e.bossIndex===0?['volley','reflect','charge','nova']:e.bossIndex===1?['ground','mend','shield','summon','tether']:['beam','fury','reflect','ricochet','bloom'];
 if(e.bossIndex===0)return ['volley','reflect','cleave','charge','fury','crossfire','nova'];
 if(e.bossIndex===1)return ['ground','mend','beam','reflect','summon','pincer','donut','tether'];
 return ['ringchain','sunder','reversal','summon','bloom','cleave','bastion','return','gauntlet','spiral','minefield','orbit','eliteSummon','donut','pincer','tether','eruptionTrail','crossfire'];
}
function bossMechanicHint(){
 const e=game.boss;if(!e)return '';if(e.stagger>0)return 'Stunned';
 if(e.cast)return e.cast.hint||(['reflect','reversal'].includes(e.cast.type)?'Gold center · reflect':e.cast.type==='mend'?'Green healing stream · approach totem':e.cast.type==='fury'?'Red damage stream · approach totem':e.cast.label);
 if(e.guardIds?.some(g=>game.enemies.includes(g)&&g.hp>0))return 'Blue shield · defeat Royal Guards';
 const owned=(game.totems||[]).filter(t=>t.owner===e);return owned.length?(owned.some(t=>t.destructible)?'Spire · bump to break · dash while red':owned.some(t=>t.blocked)?'Stream redirected':'Totem · approach'):'';
}
function beginBossCast(e){
 const plan=bossPlan(e),theme=DUNGEON_THEMES[e.biome??biomeIndex()];let type=e.phaseQueue?.[0]||plan[(e.mechanicIndex||0)%plan.length];
 if(type==='cleave'&&bodyDistance(e,game.player.x,game.player.y)>210){if(e.champion)return false;type='volley';}
 let shieldTarget=null,banks=null;if(type==='shield'){shieldTarget=shieldingTarget(e);if(!shieldTarget)type='ricochet';}if(type==='ricochet'){banks=ricochetPoints(e);if(!banks)type='volley';}
 if(e.uncommon&&Math.hypot(game.player.x-e.x,game.player.y-e.y)>550)return false;
 if(type==='charge'&&Math.hypot(game.player.x-e.x,game.player.y-e.y)>340)return false;
 if(!canStartMechanic(e,type))return false;
 const active=game.enemies.filter(other=>other.cast),reflect=active.some(other=>['reflect','reversal'].includes(other.cast.type)),major=['sunder','gauntlet','donut','bastion','tether'];
 if(type==='tether'&&!canBeginSiphonCast())return false;
 if(type==='gravePulse'&&!gravePulseCanCast())return false;
 if(themedAbility(type)&&!canBeginThemedCast(e,type))return false;
 if(active.some(other=>themedAbility(other.cast.type))||(game.themedEvents||[]).some(event=>!event.done)&&!['volley','ricochet','shield','mend','fury'].includes(type))return false;
 const minor=['volley','ricochet','shield','mend','fury'].includes(type);if((game.releasedWards||[]).length&&!minor)return false;
 if(reflect||active.some(other=>major.includes(other.cast.type)&&!(other.cast.siphon&&minor)))return false;
 if(game.counterRequest&&!game.enemies.includes(game.counterRequest))game.counterRequest=null;
 if(['reflect','reversal'].includes(type)){
  if((game.reflectCooldown||0)>0)return false;if(!game.counterRequest)game.counterRequest=e;
  if(game.counterRequest!==e||active.length||(game.hazards||[]).some(h=>h.life>0))return false;
 }else if(game.counterRequest||active.length>=2||major.includes(type)&&(active.length||(game.hazards||[]).some(h=>h.life>0)))return false;
 const support=['mend','fury'].includes(type),pending=active.filter(other=>['mend','fury'].includes(other.cast.type)).length;
 if(support&&((game.totems||[]).filter(t=>!t.destructible).length+pending>=2||(game.totems||[]).some(t=>t.owner===e&&t.type===type))){if(e.phaseQueue?.[0]===type)e.phaseQueue.shift();e.mechanicIndex=(e.mechanicIndex||0)+1;return beginBossCast(e);}
 if(['summon','eliteSummon'].includes(type)&&((game.totems||[]).filter(t=>t.destructible).length>=2||(game.totems||[]).some(t=>t.owner===e&&t.destructible))){if(e.phaseQueue?.[0]===type)e.phaseQueue.shift();e.mechanicIndex=(e.mechanicIndex||0)+1;return beginBossCast(e);}
 if(type==='bastion'&&game.enemies.filter(g=>g.summoned&&g.elite).length>=3){if(e.phaseQueue?.[0]===type)e.phaseQueue.shift();type='crossfire';if(!canStartMechanic(e,type))return false;}
 const needsPoint=['reflect','reversal','mend','fury'].includes(type),point=needsPoint?(isReflectCast({type})&&reflectVariantFor(e)==='rebound'?{...encounterFoot(game.player),r:54}:encounterPoint(e,isReflectCast({type})?'reflect':type)):null;
 if(needsPoint&&!point){releaseMechanicReservation(e);if(game.counterRequest===e)game.counterRequest=null;return false;}
 const duration=['reflect','reversal'].includes(type)?1.9:support?1.4:type==='volley'?1.15:type==='ground'?1.5:type==='cleave'||type==='charge'?1.1:type==='ricochet'?1.15:type==='shield'?1.2:1.7;
 const origin={x:e.x,y:e.y},cast={type,label:type==='cleave'?['Briar Sweep','Slag Sweep','Grave Sweep','Rift Sweep'][e.biome??biomeIndex()]:specialAttackName(type,e.biome??biomeIndex())||theme[type],windup:duration,total:duration,origin,angle:Math.atan2(game.player.y-e.y,game.player.x-e.x),targets:[],point,reach:(e.champion?145:170)*ENCOUNTER_AREA.common,halfAngle:Math.PI/3,beamWidth:48*ENCOUNTER_AREA.common,enemyHits:new Set(),shieldTarget,ricochetPoints:banks,target:{x:game.player.x,y:game.player.y}};
 if(['reflect','reversal'].includes(type)){cast.point.inner=34;game.counterRequest=null;}
 if(type==='ground'){
  const count=e.elite||e.uncommon?1:e.bossIndex===2?4:2;cast.targets.push({x:game.player.x,y:game.player.y,r:(e.uncommon?34:e.boss&&isZoneFinal()?54:44)*ENCOUNTER_AREA.common});
  for(let i=1;i<count;i++){const a=i*Math.PI*2/count+(e.mechanicIndex||0)*.75;cast.targets.push({x:game.player.x+Math.cos(a)*105,y:game.player.y+Math.sin(a)*105,r:44*ENCOUNTER_AREA.common});}
 }
 if(expandedCastSetup(e,cast)===false){releaseMechanicReservation(e);if(themedAbility(type)&&!e.phaseQueue?.length)e.mechanicIndex=(e.mechanicIndex||0)+1;return false;}if(isReflectCast(cast))configureReflectWard(e,cast);
 if(['summon','eliteSummon'].includes(type)&&!cast.point)return false;
 if(type==='bastion'&&!cast.guards.length)return false;
 if(e.phaseQueue?.[0]===type)e.phaseQueue.shift();else e.mechanicIndex=(e.mechanicIndex||0)+1;
 noteMechanicCast(e,cast);e.cast=cast;if(themedAbility(type))codexDiscover('mechanic_'+type);codexDiscover('combat_language');if(!data.combatLanguageTipSeen){data.combatLanguageTipSeen=true;toast('Read the warnings','Red is dangerous. Purple can damage and stagger monsters. Gold centers reflect. Yellow brackets mark optional interrupts. Teal marks openings and benefits. Blue marks shields. See the Codex for more.');}e.mechanicsUsed=e.mechanicsUsed||[];if(!e.mechanicsUsed.includes(type))e.mechanicsUsed.push(type);return true;
}
function resolveBossCast(e,cast){
 const theme=e.biome??biomeIndex(),damage=bossAttackDamage(e,cast.type);if(cast.resolved)return;cast.resolved=true;e.castCooldown=mechanicRecovery(e);
 if(e.uncommon){resolveUncommonAttack(e,cast);return;}
 if(resolveExpandedCast(e,cast,damage)||resolveEliteSpecial(e,cast,damage))return;
 if(isReflectCast(cast)){resolveReflectWard(e,cast);return;}
 if(cast.type==='mend'||cast.type==='fury'){
  if(!game.enemies.includes(e)||(game.totems||[]).filter(t=>!t.destructible).length>=2)return;
  (game.totems||(game.totems=[])).push({totem:true,type:cast.type,biome:theme,owner:e,x:cast.point.x,y:cast.point.y-18,rad:16,age:0,blocked:false,healReserve:game.player.maxHp*TOTEM_SUPPORT.playerReserve});return;
 }
 if(cast.type==='cleave'){addEmberCleave(e,cast,damage);if(cleaveContains(game.player,cast))hurtEncounter(e,cast,damage);damageMonstersInAttack(e,cast,enemy=>cleaveContains(enemy,cast));(game.counterEffects||(game.counterEffects=[])).push({type:'cleave',cast,biome:theme,life:.35,total:.35});return;}
 if(cast.type==='volley'){
  const count=e.bossIndex===2?18:10,offset=(e.mechanicIndex||0)*.39;
  for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset,speed=e.elite?145:e.bossIndex===2?182:158;game.hostileShots.push({x:cast.origin.x,y:cast.origin.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rad:e.bossIndex===2?8:6,life:5,biome:theme,damage,owner:e,attack:cast,language:'danger'});}
 }else if(cast.type==='ground')for(const target of cast.targets)(game.hazards||(game.hazards=[])).push({...target,type:'ground',singleHit:true,language:'friendly',owner:e,enemyHits:cast.enemyHits,biome:theme,life:1.6,total:1.6,damage,age:0});
 else (game.hazards||(game.hazards=[])).push({type:'beam',singleHit:true,language:'friendly',owner:e,enemyHits:cast.enemyHits,x:cast.origin.x,y:cast.origin.y,angle:cast.angle,width:cast.beamWidth,length:540,life:.55,total:.55,biome:theme,damage:damage*1.3,age:0});
}
function tickBossSpecial(e,dt,playerFrom=encounterFoot(game.player),dashing=game.player.dashTime>0){
 if(e.boss){
  const phase=e.hp/e.maxHp<.40?2:e.hp/e.maxHp<.75?1:0,old=e.combatPhase||0;
  if(phase>old){e.combatPhase=phase;(e.phaseQueue||(e.phaseQueue=[])).push(e.bossIndex===2?(phase===1?'sunder':'bastion'):phase===1?'crossfire':'summon');e.castCooldown=Math.min(e.castCooldown||0,.5);floater(e.x,e.y-65,phase===1?'ENRAGED':'FINAL STAND',combatTheme('danger').hot);}
 }
 if(e.charge){if(e.stagger>0)e.charge=null;else{tickEnemyCharge(e,dt,{x:playerFrom.x,y:playerFrom.y-13});return;}}
 if(e.stagger>0){if(isReflectCast(e.cast))tickReflectWard(e,e.cast,dt,playerFrom);if(e.cast?.siphon)e.cast=null;e.stagger=Math.max(0,e.stagger-dt);return;}
 if(e.eliteTask)return;
 if(e.cast?.siphon){tickSiphonTether(e,e.cast,dt,playerFrom,dashing);return;}
 if(isReflectCast(e.cast)){tickReflectWard(e,e.cast,dt,playerFrom);return;}
 if(e.cast?.themed){tickThemedWindup(e,e.cast,dt);return;}
 if(e.cast){e.cast.windup-=dt;if(e.cast.windup<=0){const cast=e.cast;e.cast=null;resolveBossCast(e,cast);e.castCooldown=mechanicRecovery(e);}return;}
 e.castCooldown=(e.castCooldown??2)-dt*(e.ascendance>0?ELITE_TASKS.ascend.tempo:1);if(e.castCooldown<=0&&!beginBossCast(e))e.castCooldown=.35+(e.visualType||e.bossIndex||0)%4*.08;
}
function totemInterception(t){
 const recipient=supportTotemRecipient(t);if(!recipient)return false;const totem=encounterFoot(t),caster=encounterFoot(recipient),player=encounterFoot(game.player);
 return Math.hypot(player.x-totem.x,player.y-totem.y)<Math.hypot(caster.x-totem.x,caster.y-totem.y);
}
function dashSupportTotem(t,from=encounterFoot(game.player),dashing=false){
 if(!dashing||t.destructible||!['mend','fury'].includes(t.type)||!(game.totems||[]).includes(t))return false;
 const foot=encounterFoot(t),player=encounterFoot(game.player);
 if(segmentsDistance(from.x,from.y,player.x,player.y,foot.x,foot.y-SUMMON_BUMPS.dashRise,foot.x,foot.y+4)>SUMMON_BUMPS.dashRadius)return false;
 game.totems.splice(game.totems.indexOf(t),1);t.blocked=false;
 refundCounterDash();
 burst(foot.x,foot.y-14,18,totemSignal(t).color);return true;
}
function tickEncounterObjects(dt,playerFrom=encounterFoot(game.player),dashing=game.player.dashTime>0){
 const p=game.player;p.rallyTime=Math.max(0,(p.rallyTime||0)-dt);p.mending=false;game.reflectCooldown=Math.max(0,(game.reflectCooldown||0)-dt);
 game.counterEffects=(game.counterEffects||[]).filter(fx=>{fx.life-=dt;return fx.life>0;});for(const e of game.enemies)e.furyLinked=false;
 game.totems=(game.totems||[]).filter(t=>!t.destructible||t.hp>0);
 let healing=0;
 for(const t of [...game.totems]){
  if(!game.totems.includes(t))continue;
  t.age+=dt;t.disabled=totemsDisabled()||(t.disabledUntil||0)>game.frame;
  if(t.destructible){bumpSummonTotem(t,playerFrom,dashing);if(game.status==='dead')return;if(!game.totems.includes(t))continue;}
  else if(dashSupportTotem(t,playerFrom,dashing))continue;
  if(t.disabled){t.blocked=false;continue;}
  if(t.destructible){tickSummonTotem(t,dt);tickSummonArrival(t,dt);continue;}
  const recipient=supportTotemRecipient(t);t.dormant=!recipient;t.blocked=totemInterception(t);const disrupt=waveRank('disrupt'),power=Math.max(.4,1-.15*disrupt);
  if(t.type==='mend'){
   if(t.blocked){t.healReserve=t.healReserve??p.maxHp*TOTEM_SUPPORT.playerReserve;const amount=Math.min(t.healReserve,p.maxHp*TOTEM_SUPPORT.playerHeal*dt,Math.max(0,p.maxHp-p.hp));healing=Math.max(healing,amount);t.healReserve-=amount;p.mending=amount>0;}
   else if(recipient)recipient.hp=Math.min(recipient.maxHp,recipient.hp+recipient.maxHp*TOTEM_SUPPORT.enemyHeal*dt*power);
  }else if(t.blocked)p.rallyTime=TOTEM_SUPPORT.rallySeconds;else if(recipient)recipient.furyLinked=true;
 }
 if(healing)p.hp=Math.min(p.maxHp,p.hp+healing);tickReleasedWards(dt,playerFrom);tickBossBursts(dt);tickGraveEchoes(dt);
}
function damageTotem(t,damage,impact=false){
 if(!impact||!t?.destructible||t.hp<=0||!(game.totems||[]).includes(t)||damage<=0)return false;
 const amount=Math.max(0,damage)*(impact?1:enemyShieldMultiplier(t)*eliteBoonValue('damage')*(1+.18*waveRank('disrupt')));t.hp-=amount;floater(t.x,t.y-30,impact?(t.hp>0?'CRACK · '+summonBumpsLeft(t)+' BUMP LEFT':'SHATTERED'):Math.round(amount),'#ffe2d8');
 if(t.hp<=0){game.totems.splice(game.totems.indexOf(t),1);clearDeadShieldLinks();burst(t.x,t.y,14,combatTheme('danger').color);floater(t.x,t.y-48,'SUMMONING STOPPED','#d4fff0');completeSummonCleanup();}return true;
}

function reflectAbsorbsShot(s){return game.enemies.some(e=>isReflectCast(e.cast)&&e.cast.point.armed!==false&&segmentDistance(e.cast.point.x,e.cast.point.y,s.oldX??s.x,s.oldY??s.y,s.x,s.y)<=e.cast.point.inner);}
function eliteQuota(){return zoneNumber()===1&&isZoneFinal()?6:zoneVisualBand();}
function prepareEliteWave(){
 game.rareEliteSpawned=false;game.rareEliteCount=0;
 game.eliteCount=0;game.eliteKinds=[];game.waveEliteSpawned=false;
 const fractions=zoneNumber()===1&&isZoneFinal()?[.12,.27,.42,.57,.72,.86]:zoneVisualBand()===3?[.18,.46,.76]:zoneVisualBand()===2?[.24,.62]:[rand(.42,.68)];
 game.eliteSchedule=fractions.map(f=>Math.min(game.phaseTarget-1,Math.max(3,Math.floor(game.phaseTarget*f))));game.eliteAt=game.eliteSchedule[0];
}
function spawnEnemy(boss=false,bossIndex=0){
 const e=spawnBaseEnemy(boss,bossIndex);e.biome=biomeIndex();e.mechanicIndex=0;e.mechanicsUsed=[];e.castCooldown=boss?1.8:0;
 const count=game.eliteCount||0,threshold=count===0?(game.eliteAt??Infinity):(game.eliteSchedule?.[count]??Infinity);
 if(!boss&&game.phase%2===0&&game.phaseSpawned>=threshold&&count<eliteQuota()&&game.enemies.filter(other=>other.elite&&!other.champion).length<eliteQuota()){
  const known=(data.seenElites[biomeIndex()]||[]).map((seen,i)=>seen?i:-1).filter(i=>i>=0);
  if(known.length){
   const unused=known.filter(i=>!(game.eliteKinds||[]).includes(i)),pool=unused.length?unused:known;
   e.elite=e.bossElite=true;e.bossIndex=pool[Math.floor(Math.random()*pool.length)];e.name=biome().boss[e.bossIndex]+' Echo';e.rad=23;e.hp=e.maxHp=zoneEnemyHp(false,0,1,e)*2.8*encounterHealthMultiplier(e);e.speed*=.82;e.castCooldown=.7+count*.7;
   game.eliteCount=count+1;(game.eliteKinds||(game.eliteKinds=[])).push(e.bossIndex);game.waveEliteSpawned=true;
  }
 }
 assignEnemyAppearance(e);return e;
}
function encounterLabel(label,x,y,color,size=10){
 ctx.save();ctx.font='600 '+size+'px system-ui';ctx.textAlign='center';ctx.lineWidth=3.5;ctx.strokeStyle='#10140f';ctx.strokeText(label,x,y);ctx.fillStyle=color;ctx.fillText(label,x,y);ctx.restore();
}
function paintReflectWard(point,progress,kind,active=false){paintReflectWardArt(point,progress,kind,active);}
function paintEncounterGround(){
 paintAbilityGroundArt();paintThemedGround();paintReleasedWards();
 paintEliteTaskGround();
 for(const e of game.enemies)if(['reflect','reversal'].includes(e.cast?.type))paintReflectWard(e.cast.point,clamp(1-e.cast.windup/e.cast.total,0,1),e.biome);
 for(const fx of game.counterEffects||[]){ctx.save();ctx.globalAlpha=fx.life/fx.total;if(fx.type==='cleave')paintEnemyCleave(fx.cast,combatTheme('friendly'),1,true);else if(fx.type==='ricochet')for(const point of fx.points)paintRicochetBank(point,DUNGEON_THEMES[fx.biome]);else if(fx.type==='emberDetonation'){paintWarningCircle(fx.x,fx.y,fx.r,1,combatTheme('danger'),true);paintEmberFlame(fx.x,fx.y,48,0);}else if(fx.type==='opportunityBlast'){const progress=1-fx.life/fx.total;paintExpandedShape({shape:'ring',x:fx.x,y:fx.y,inner:32,r:fx.r*(.4+.6*progress)},combatTheme('friendly'),progress,true);paintWarningCircle(fx.x,fx.y,32,progress,combatTheme('safe'));paintAbilityEmblem('mirror',fx.x,fx.y,17,combatTheme('safe'));}else paintReflectWard(fx,1,fx.biome,true);ctx.restore();}
}
function paintTotem(t){
 if(t.destructible){paintSummonTotem(t);return;}
 const theme=DUNGEON_THEMES[t.biome],image=encounterImage(t.biome,t.type),height=64,width=height*image.naturalWidth/Math.max(1,image.naturalHeight),foot=encounterFoot(t);
 ellipse(t.x,foot.y,23,7,'#090f1360');
 if(image.complete&&image.naturalWidth)ctx.drawImage(image,t.x-width/2,foot.y-height,width,height);
 else {disc(t.x,foot.y-28,15,theme.dark);encounterLabel(t.type==='mend'?'+':'ϟ',t.x,foot.y-24,theme.hot,22);}
 paintAbilityTotemCrest(t);
}
function paintEncounterLinks(){
 paintCounterReadiness();
 for(const t of game.totems||[]){
  if(t.destructible)continue;const recipient=supportTotemRecipient(t);if(!recipient)continue;
  const a={x:t.x,y:t.y-22},b={x:recipient.x,y:recipient.y-22},p={x:game.player.x,y:game.player.y-18},theme=totemSignal(t),end=t.blocked?p:b;
  paintAbilityStream(t,a,end,b);
  const label=t.disabled?'DISABLED':t.blocked?(t.type==='mend'&&t.healReserve<=0?'HEALING DEPLETED · BLOCKED':theme.label+' · YOU'):theme.label+' · APPROACH';
  encounterTip(label,t.x,t.y-62,theme.hot,10,t,label,'stream');
 }
 for(const e of game.enemies){
  paintEnemyResolve(e);paintMechanicRecovery(e);
  paintEliteTaskAir(e);
  if(e.cast?.type==='tether')paintAbilityTether(e,e.cast);
  if(['reflect','reversal'].includes(e.cast?.type)){
   const point=e.cast.point;
   // The safe boundary stays readable when a large creature overlaps the mark.
   ctx.save();ctx.strokeStyle='#f3edcf';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(point.x,point.y,point.inner+3,0,Math.PI*2);ctx.stroke();ctx.restore();
   encounterTip(point.armed?'TOUCH CENTER · REFLECT':'STEP OUT · RETURN',point.x,point.y+point.inner+19,DUNGEON_THEMES[e.biome].hot,11,e.cast,point.armed?'armed':'leave','reflect');
  }
  if(e.stagger>0)encounterLabel('STAGGERED',e.x,e.y-e.rad-24,DUNGEON_THEMES[e.biome].hot);
 }
 for(const fx of game.counterEffects||[])if(fx.reflected){ctx.save();ctx.globalAlpha=fx.life/fx.total;line(fx.x,fx.y,fx.tx,fx.ty,8,DUNGEON_THEMES[fx.biome].color+'60');line(fx.x,fx.y,fx.tx,fx.ty,2.5,DUNGEON_THEMES[fx.biome].hot);ctx.restore();}
 const p=game.player;if(p.mending||p.rallyTime>0)encounterLabel(p.mending?'+ HP':'+10% DMG',p.x,p.y+39,(p.mending?TOTEM_SIGNALS.mend:TOTEM_SIGNALS.fury).hot);
}
