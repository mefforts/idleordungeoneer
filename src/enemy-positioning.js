/* Persistent fighting positions, rather than a shared pursuit point. No teleports or stat changes. */
const ENEMY_POSITIONING={separation:150,planSeconds:1.6,holdRadius:18,retreatHealth:.38,retreatSeconds:12,retreatCooldown:20,retreatHealRate:.015,retreatHealCap:.12,healingRadius:64};
function tacticalEnemy(e){return resolveEnemy(e)&&!e.boss&&e.speed>0&&!e.totem;}
function initializeEnemyPosition(e){
 if(!tacticalEnemy(e)||e.enemyPosition)return;
 const serial=game.enemyPositionSerial=(game.enemyPositionSerial||0)+1,role=e.champion?{charge:'advance',shield:'guard',ricochet:'ranged'}[rareEliteRole(e)]:['advance','ranged','guard'][(serial-1)%3];
 e.enemyPosition={serial,role,angle:Math.atan2(e.y-game.player.y,e.x-game.player.x),nextPlanAt:0,goal:null,support:null};
}
function activeRetreatTotem(t){return !!t&&(game.totems||[]).includes(t)&&t.type==='mend'&&!t.destructible&&!t.disabled&&!t.blocked&&!totemsDisabled()&&(t.disabledUntil||0)<=game.frame&&!!supportTotemRecipient(t);}
function finishEnemyRetreat(e){e.healingRetreat=null;e.retreatReadyAt=game.frame+ENEMY_POSITIONING.retreatCooldown;}
function tickEnemyRetreats(dt){
 for(const e of game.enemies){
  const retreat=e.healingRetreat;
  if(retreat){
   if(e.hp<=0||e.boss||e.elite||e.bossElite||e.champion||e.summoned||e.cast||e.charge||game.eliteRecruits?.has(e)||!activeRetreatTotem(retreat.totem)||game.frame>=retreat.until){finishEnemyRetreat(e);continue;}
   if(e.stagger>0)continue;
   if(Math.hypot(e.x-retreat.totem.x,e.y-retreat.totem.y)<ENEMY_POSITIONING.healingRadius){
    const amount=Math.max(0,Math.min(e.maxHp-e.hp,e.maxHp*ENEMY_POSITIONING.retreatHealRate*dt,e.maxHp*ENEMY_POSITIONING.retreatHealCap-retreat.healed));e.hp+=amount;retreat.healed+=amount;retreat.healing=amount>0;
    if(retreat.healed>=e.maxHp*ENEMY_POSITIONING.retreatHealCap-1e-8||e.hp>=e.maxHp*.6)finishEnemyRetreat(e);
   }else retreat.healing=false;
   continue;
  }
  if(e.boss||e.elite||e.bossElite||e.champion||e.totem||e.summoned||e.hp<=0||e.hp>e.maxHp*ENEMY_POSITIONING.retreatHealth||e.cast||e.charge||e.stagger>0||game.eliteRecruits?.has(e)||(e.retreatReadyAt||0)>game.frame)continue;
  const choices=(game.totems||[]).filter(t=>activeRetreatTotem(t)&&!game.enemies.some(other=>other.healingRetreat?.totem===t)&&Math.hypot(e.x-t.x,e.y-t.y)<360&&eliteRouteClear(e,t));
  choices.sort((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)-Math.hypot(e.x-b.x,e.y-b.y));
  if(choices[0])e.healingRetreat={totem:choices[0],until:game.frame+ENEMY_POSITIONING.retreatSeconds,healed:0,healing:false};else e.retreatReadyAt=game.frame+1;
 }
}
function enemyPositionSupport(e){
 const state=e.enemyPosition,totems=(game.totems||[]).filter(t=>!t.disabled&&(t.disabledUntil||0)<=game.frame&&!totemsDisabled()&&(!t.destructible||t.hp>0)&&Math.hypot(t.x-game.player.x,t.y-game.player.y)<440&&!game.enemies.some(other=>other!==e&&other.hp>0&&other.enemyPosition?.support===t));
 return totems.find(t=>t.owner===e)||(state.role==='guard'?totems.sort((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)-Math.hypot(e.x-b.x,e.y-b.y))[0]:null)||null;
}
function planEnemyPosition(e){
 const p=game.player,state=e.enemyPosition,arena=expandedArena(),support=enemyPositionSupport(e),center=support||p,advance=state.role==='advance',radii=support?[74,106]:advance?[100,140,180]:[185,230,270];let best=null,bestScore=Infinity;
 state.support=support;state.plannedPlayer={x:p.x,y:p.y};state.nextPlanAt=game.frame+ENEMY_POSITIONING.planSeconds+(state.serial%4)*.17;
 const allies=game.enemies.filter(other=>other!==e&&tacticalEnemy(other));
 for(const radius of radii)for(let i=0;i<16;i++){
  const angle=state.angle+i*Math.PI/8,q={x:center.x+Math.cos(angle)*radius,y:center.y+Math.sin(angle)*radius},distance=Math.hypot(q.x-e.x,q.y-e.y);
  if(!insideRect(q,arena,-24)||!encounterClear(q.x,q.y+13,Math.max(12,e.rad*.6))||Math.hypot(q.x-p.x,q.y-p.y)<70)continue;
  let score=distance*.24+Math.abs(radius-(support?86:advance?120:215))*.4;
  for(const other of allies){const goal=other.enemyPosition?.goal,gap=Math.min(Math.hypot(q.x-other.x,q.y-other.y),goal?Math.hypot(q.x-goal.x,q.y-goal.y):Infinity);score+=Math.pow(Math.max(0,ENEMY_POSITIONING.separation-gap),2)*.055;}
  if(state.goal)score+=Math.min(120,Math.hypot(q.x-state.goal.x,q.y-state.goal.y))*.12;
  if(score>=bestScore||!eliteRouteClear(e,q,Math.max(12,e.rad*.6)))continue;
  best=q;bestScore=score;
 }
 state.goal=best;return best;
}
function enemyStepToward(e,goal,step){
 const dx=goal.x-e.x,dy=goal.y-e.y,d=Math.hypot(dx,dy);if(d<ENEMY_POSITIONING.holdRadius)return {x:0,y:0};
 return {x:dx/d*Math.min(Math.abs(step),d),y:dy/d*Math.min(Math.abs(step),d)};
}
function enemyTerrainOverlap(e,x=e.x,y=e.y){
 const radius=Math.max(12,e.rad*.6);let total=0;
 for(const o of worldScenery(biomeIndex(),x,y+13,180,180)){if(o.decal)continue;const def=environmentProp(o.kind,o.index);if(!def.rx)continue;total+=Math.max(0,1-Math.hypot((x-o.x)/(def.rx*o.s+radius),(y+13-o.y+4*o.s)/(def.ry*o.s+radius)));}
 return total;
}
function clearEnemyStep(e,move){
 const r=Math.max(12,e.rad*.6),clear=(x,y)=>encounterClear(e.x+x,e.y+y+13,r);
 if(clear(move.x,move.y))return move;if(e.enemyPosition)e.enemyPosition.nextPlanAt=0;
 // Existing spawns can begin inside scenery. Walk out without crossing deeper into it.
 const overlap=enemyTerrainOverlap(e),length=Math.hypot(move.x,move.y);
 if(overlap>0&&length>0){let best=null,score=overlap;const angle=Math.atan2(move.y,move.x);for(let i=0;i<16;i++){const a=angle+i*Math.PI/8,q={x:Math.cos(a)*length,y:Math.sin(a)*length},next=enemyTerrainOverlap(e,e.x+q.x,e.y+q.y);if(next<score-1e-10){score=next;best=q;}}if(best)return best;}
 if(move.x&&clear(move.x,0))return {x:move.x,y:0};if(move.y&&clear(0,move.y))return {x:0,y:move.y};return {x:0,y:0};
}
function enemyPairedMovement(e){
 const paired=t=>t?.partner&&liveThemedLink(t)&&(t.owner===e||t.partner===e);
 return (game.themedEvents||[]).some(paired)||game.enemies.some(other=>paired(other.cast?.themed));
}
function enemyPositionStep(e,dx,dy,step){
 if(!step||e.charge||e.stagger>0)return {x:dx,y:dy};
 if(e.healingRetreat){const t=e.healingRetreat.totem;if(Math.hypot(e.x-t.x,e.y-t.y)<ENEMY_POSITIONING.healingRadius-10)return {x:0,y:0};return clearEnemyStep(e,enemyStepToward(e,t,step));}
 if(!tacticalEnemy(e))return {x:dx,y:dy};initializeEnemyPosition(e);
 // Paired mechanics retain their deliberate shared movement and crossing geometry.
 if(enemyPairedMovement(e))return clearEnemyStep(e,{x:dx,y:dy});
 const state=e.enemyPosition,p=game.player,displaced=!state.plannedPlayer||Math.hypot(p.x-state.plannedPlayer.x,p.y-state.plannedPlayer.y)>85,support=enemyPositionSupport(e);
 if(!state.goal||game.frame>=state.nextPlanAt||displaced||support!==state.support)planEnemyPosition(e);
 let move=state.goal?enemyStepToward(e,state.goal,step):{x:dx,y:dy};
 // Local separation also works while approaching a reserved destination.
 let sx=0,sy=0;
 for(const other of game.enemies){if(other===e||!tacticalEnemy(other))continue;const x=e.x-other.x,y=e.y-other.y,d=Math.hypot(x,y),limit=Math.max(90,(e.rad||20)+(other.rad||20)+48);if(d>=limit)continue;const angle=d>.1?Math.atan2(y,x):state.serial*2.399963,force=(limit-d)/limit;sx+=Math.cos(angle)*force;sy+=Math.sin(angle)*force;}
 move.x+=sx*Math.abs(step)*1.7;move.y+=sy*Math.abs(step)*1.7;const length=Math.hypot(move.x,move.y),cap=Math.abs(step);if(length>cap){move.x*=cap/length;move.y*=cap/length;}
 return clearEnemyStep(e,move);
}
function paintRetreatHealing(){
 const theme=TOTEM_SIGNALS.mend;
 for(const e of game.enemies){const retreat=e.healingRetreat;if(!retreat?.healing||!activeRetreatTotem(retreat.totem))continue;const t=retreat.totem,time=reducedMotion()?0:game.frame;
  line(t.x,t.y-22,e.x,e.y-12,1,theme.color+'85');
  for(let i=0;i<3;i++){const u=reducedMotion()?.5:((time*.55+i/3)%1),x=t.x+(e.x-t.x)*u,y=t.y-22+(e.y-t.y+10)*u;line(x-3,y,x+3,y,1.5,theme.hot);line(x,y-3,x,y+3,1.5,theme.hot);}
 }
}
