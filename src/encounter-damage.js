/* Fractions are base maximum-health damage; protection still mitigates them. */
const ENCOUNTER_DAMAGE={minimum:.125,projectile:.125,contact:.15,standard:.18,heavy:.25,major:.50,reflect:.15,dot:.025,dotInterval:.35,hitWindow:.47};
const ENEMY_RESOLVE={perAlly:.10,maximum:.50,dashLockout:10};
const ENCOUNTER_AREA={common:1.25};
function resolveEnemy(enemy){return !!enemy&&enemy.hp>0&&!enemy.totem&&!enemy.uncommon&&!!(enemy.boss||enemy.elite||enemy.bossElite||enemy.champion);}
function enemyResolveBlocked(enemy){return enemy.stagger>0||(enemy.resolveDisabledUntil||0)>game.frame;}
function enemyResolveReduction(enemy){
 if(!resolveEnemy(enemy)||enemyResolveBlocked(enemy)||!game.enemies.includes(enemy))return 0;
 const allies=game.enemies.filter(other=>other!==enemy&&resolveEnemy(other)&&!enemyResolveBlocked(other)).length;
 return Math.min(ENEMY_RESOLVE.maximum,allies*ENEMY_RESOLVE.perAlly);
}
function enemyChargeHalfWidth(enemy){return (enemy.rad+8)*ENCOUNTER_AREA.common;}
function enemyChargeLength(cast){return Math.min(340,Math.max(100,Math.hypot(cast.target.x-cast.origin.x,cast.target.y-cast.origin.y)+65));}
function paintEnemyResolve(enemy){
 if(!resolveEnemy(enemy))return;const reduction=enemyResolveReduction(enemy),blocked=enemyResolveBlocked(enemy);
 if(!reduction&&!(blocked&&game.enemies.some(other=>other!==enemy&&resolveEnemy(other))))return;
 const theme=combatTheme(blocked?'reflect':'shield'),x=enemy.x+(enemy.rad||20)+15,y=enemy.y-45;
 ctx.save();ctx.globalAlpha=blocked?.65:1;paintAbilityShield(x,y,10,theme);
 if(blocked){line(x-6,y-8,x+1,y-1,2,theme.hot);line(x+1,y-1,x-2,y+5,2,theme.hot);}
 else{themedArc(enemy.x,enemy.y+enemy.rad*.65,enemy.rad+9,.25+reduction,theme.color+'a0',2);}
 textAt(Math.round(reduction*100)+'%',x,y+19,'700 10px system-ui',theme.hot);ctx.restore();
}
function hostileDamage(owner,fraction){const boost=(owner?.furyLinked?1.12:1)*themedRallyMultiplier(owner)*(owner?.ascendance>0?ELITE_TASKS.ascend.damage:1);return game.player.maxHp*Math.min(.5,fraction*boost)/incomingDamageScale();}
function hurtEncounter(owner,attack,amount){
 const special=owner&&!owner.uncommon&&(owner.boss||owner.elite||owner.bossElite||owner.champion);
 return hurt(special?Math.max(amount,game.player.maxHp*ENCOUNTER_DAMAGE.minimum/incomingDamageScale()):amount,special?{eliteHit:attack||owner}:{});
}
function bossAttackDamage(owner,type=owner.cast?.type){
 if(owner.uncommon)return hostileDamage(owner,type==='ground'?.08:type==='charge'||owner.charge?.10:.06);
 if(themedAbility(type))return hostileDamage(owner,ENCOUNTER_DAMAGE.heavy);
 const scale=type==='ricochet'?.85:['ringchain','bloom','return','spiral','orbit','gravePulse'].includes(type)?.85:['sunder','gauntlet','donut','nova','crossfire','pincer','minefield'].includes(type)?1.15:1;
 const fraction=['volley','ricochet','ringchain','bloom','return','spiral','orbit'].includes(type)?ENCOUNTER_DAMAGE.projectile:['sunder','donut'].includes(type)?ENCOUNTER_DAMAGE.major:['cleave','charge','beam','ground','gravePulse','eruptionTrail','gauntlet','nova','crossfire','pincer','minefield'].includes(type)?ENCOUNTER_DAMAGE.heavy:ENCOUNTER_DAMAGE.standard;
 return hostileDamage(owner,fraction)/scale;
}
function tickCombatDot(source,key,contains,fraction=ENCOUNTER_DAMAGE.dot){
 const timers=source.dotTimers||(source.dotTimers={});
 if(!contains(game.player)){delete timers[key];return;}
 const timer=timers[key];
 if(!timer||game.frame-timer.seen>.12){timers[key]={next:game.frame+ENCOUNTER_DAMAGE.dotInterval,seen:game.frame};return;}
 timer.seen=game.frame;
 if(game.frame+1e-9<timer.next)return;timer.next=game.frame+ENCOUNTER_DAMAGE.dotInterval;
 const p=game.player;if(game.frame-(p.dotWindowAt??-1)>ENCOUNTER_DAMAGE.dotInterval){p.dotWindowAt=game.frame;p.dotWindowSpent=0;}const paid=Math.min(fraction,Math.max(0,.05-(p.dotWindowSpent||0)));if(paid<=0)return;const before=p.hp;hurt(p.maxHp*paid/incomingDamageScale(),{dot:true});if(p.hp<before)p.dotWindowSpent=(p.dotWindowSpent||0)+paid;
}
function interludePackSize(index=zoneNumber(),stage=zoneStage()){return 3+zoneVisualBand(index,stage);}
function interludeEscortCount(index=zoneNumber()){let count=0;for(let stage=1;stage<=zoneFloorCount(index);stage++)count+=2*(interludePackSize(index,stage)-1);return count;}
function spawnInterludePack(leader){
 const total=interludePackSize(),p=game.player;
 for(let i=1;i<total;i++){
  const enemy=spawnEnemy(false),angle=Math.atan2(leader.y-p.y,leader.x-p.x)+(i%2?1:-1)*Math.ceil(i/2)*.6,radius=220+(i%2)*35;
  Object.assign(enemy,{elite:true,bossElite:true,interludeEscort:true,bossIndex:i%3,rad:23,x:p.x+Math.cos(angle)*radius,y:p.y+Math.sin(angle)*radius,castCooldown:1.3+i*.7});
  enemy.hp=enemy.maxHp=zoneEnemyHp(false,0,1,enemy)*2.8*encounterHealthMultiplier(enemy);enemy.speed*=.82;enemy.name=biome().boss[enemy.bossIndex]+' Echo';assignEnemyAppearance(enemy);
 }
 game.phaseTarget=total;game.phaseSpawned=total;
}

function enemyShieldMultiplier(enemy,from=game.player){return linkedShieldMultiplier(enemy)*themedShieldMultiplier(enemy,from)*(1-enemyResolveReduction(enemy));}
