/* Runtime companion to MECHANICS_BIBLE.md. Combat time owns every clock here. */
const MECHANIC_RULES=BALANCE_CONFIG.combat.mechanics;
const MECHANIC_CORE=['volley','ground','beam','cleave','charge','ricochet','shield','reflect','mend','fury'];
const mechanicContractCache=new Map();
function mechanicContract(type){
 if(mechanicContractCache.has(type))return mechanicContractCache.get(type);
 const family=Object.entries(MECHANIC_RULES.families).find(([,value])=>value.abilities.includes(type))?.[0]||(themedAbility(type)?'themed':null);
 if(!family)return null;const contract={family,...MECHANIC_RULES.families[family],language:castLanguage(type)};mechanicContractCache.set(type,contract);return contract;
}
function mechanicRecovery(owner){return owner.uncommon?MECHANIC_RULES.recovery.uncommon:owner.boss?(owner.combatPhase>=2?MECHANIC_RULES.recovery.finalBoss:MECHANIC_RULES.recovery.boss):MECHANIC_RULES.recovery.elite;}
function mechanicDirector(){return game.mechanicDirector||(game.mechanicDirector={restUntil:0,hadExclusive:false,request:null});}
function releaseMechanicReservation(owner){
 const director=mechanicDirector(),request=director.request;if(!request||owner&&request.owner!==owner)return;
 if(game.counterRequest===request.owner&&!isReflectCast(request.owner.cast))game.counterRequest=null;director.request=null;
}
function pendingMechanicReservation(){
 const request=mechanicDirector().request;if(!request)return null;const owner=request.owner;
 if(game.frame>=request.until||owner.hp<=0||!game.enemies.includes(owner)||owner.stagger>0||owner.eliteTask||owner.cast||owner.charge){releaseMechanicReservation();return null;}
 return request;
}
function mechanicShotRelevant(shot){
 const radius=Math.hypot(game.viewWidth,game.viewHeight)/2+MECHANIC_RULES.pressureMargin,dx=shot.x-game.player.x,dy=shot.y-game.player.y;
 return Math.hypot(dx,dy)<radius||dx*(shot.vx||0)+dy*(shot.vy||0)<0;
}
function mechanicPressure(){
 const groups=new Map(),add=(object,type)=>{
  const contract=mechanicContract(type),key=object.attackGroup||object.enemyHits||object.attack?.enemyHits||object.attack||object.cast?.enemyHits||object;
  if(!groups.has(key))groups.set(key,{exclusive:!!contract?.exclusive,type});
 };
 for(const owner of game.enemies){if(owner.hp<=0)continue;if(owner.cast&&castLanguage(owner.cast.type)!=='safe'&&castLanguage(owner.cast.type)!=='shield')add(owner.cast,owner.cast.type);if(owner.charge)add(owner.charge,owner.charge.trail?'eruptionTrail':'charge');if(owner.eliteTask?.pending&&owner.eliteTask.kind==='siege')add(owner.eliteTask,'siege');}
 for(const event of game.themedEvents||[])if(!event.done&&(event.persistent||event.age<event.total))add(event,event.type);
 for(const ward of game.releasedWards||[])if(!ward.cast.resolved)add(ward.cast,ward.cast.type);
 for(const event of game.bossBursts||[])add(event,event.type);
 for(const hazard of game.hazards||[])if(hazard.wave||hazard.life>0)add(hazard,hazard.abilityType||hazard.type);
 for(const shot of game.hostileShots||[])if(shot.life>0&&mechanicShotRelevant(shot))add(shot,shot.abilityType||'volley');
 return {count:groups.size,exclusive:[...groups.values()].some(group=>group.exclusive),groups};
}
function tickMechanicDirector(){
 const director=mechanicDirector(),pressure=mechanicPressure();
 pendingMechanicReservation();
 if(director.hadExclusive&&!pressure.exclusive)director.restUntil=Math.max(director.restUntil,game.frame+MECHANIC_RULES.recovery.encounter);
 director.hadExclusive=pressure.exclusive;
}
function canStartMechanic(owner,type){
 const contract=mechanicContract(type);if(!contract)return false;
 if(contract.support)return true;
 const pressure=mechanicPressure(),director=mechanicDirector();let request=pendingMechanicReservation();
 if(request?.owner===owner&&request.type!==type){releaseMechanicReservation(owner);request=null;}
 if(game.frame+1e-9<mechanicDirector().restUntil)return false;
 if(request&&(request.owner!==owner||request.type!==type))return false;
 if(contract.exclusive&&!pressure.exclusive&&pressure.count>0){director.request={owner,type,until:request?.until??game.frame+MECHANIC_RULES.reservationSeconds};if(isReflectCast({type})&&!game.counterRequest)game.counterRequest=owner;return false;}
 if(!contract.exclusive&&request)return false;
 return contract.exclusive?pressure.count===0:!pressure.exclusive&&pressure.count<MECHANIC_RULES.maximumThreats;
}
function noteMechanicCast(owner,cast){
 const contract=mechanicContract(cast.type);cast.total=cast.windup=Math.max(cast.total,contract.minimumWarning);
 releaseMechanicReservation(owner);
 if(contract.exclusive)mechanicDirector().hadExclusive=true;
 owner.mechanicCounts||(owner.mechanicCounts={});owner.mechanicCounts[cast.type]=(owner.mechanicCounts[cast.type]||0)+1;
}
function mechanicVariant(owner,type){return (owner.mechanicCounts?.[type]||0)+(owner.visualType||0);}
function counterRecovery(){const director=mechanicDirector();director.restUntil=Math.max(director.restUntil,game.frame+MECHANIC_RULES.recovery.counter);}
function mechanicFriendlyFire(owner,shape,contains){
 const placed=shape.type==='ground'&&!shape.lingering||['seedChain','fallingCanopy','moltenDroplets','backdraft','gravityWell'].includes(shape.type);
 if(!shape.ownerArmed&&(placed||!contains(owner)))shape.ownerArmed=true;
 return !!shape.ownerArmed;
}
function staggerFromMechanic(enemy){
 if(!resolveEnemy(enemy)||game.frame<(enemy.friendlyStaggerReadyAt||0))return;
 enemy.stagger=Math.max(enemy.stagger||0,MECHANIC_RULES.friendlyFire.stagger);enemy.friendlyStaggerReadyAt=game.frame+MECHANIC_RULES.friendlyFire.staggerRecovery;
 if(enemy.eliteTask)interruptEliteTask(enemy,'friendly');
 if(enemy.charge)enemy.charge=null;
}
function paintMechanicRecovery(owner){
 if(owner.cast||owner.charge||owner.eliteTask||owner.stagger>0||!(owner.castCooldown>0)||owner.castCooldown>mechanicRecovery(owner))return;
 const body=enemyBody(owner),remaining=clamp(owner.castCooldown/mechanicRecovery(owner),0,1),theme=combatTheme('safe');
 ctx.save();ctx.globalAlpha=.6;for(const side of [-1,1])line(owner.x+side*12,body.top-11,owner.x+side*(12+remaining*12),body.top-11,2,theme.color);ctx.restore();
}
