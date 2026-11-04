/* Elite intentions are transient; ordinary waves and equipment keep their budgets. */
const ELITE_TASKS={initial:6,cooldown:15,travelSeconds:12,interruptHits:3,interruptHealth:.12,interruptStun:.8,cap:[1,1,2],promotions:[1,1,2],ascend:{seconds:12,healRate:.0035,healCap:.04,duration:14,damage:1.35,tempo:1.25},empower:{seconds:14},conduit:{first:2.8,interval:5.5,warning:1.2},siege:{first:1,interval:2.8,warning:1.2,projectile:.125,mark:.18}};
const ELITE_TASK_NAMES={ascend:'Ascendance',empower:'Rare Awakening',conduit:'Living Conduit',siege:'Siege Channel'};
function eliteBehaviorEligible(e){return !!e&&e.hp>0&&e.elite&&!e.boss&&!e.summoned&&!e.uncommon&&!e.totem&&e.speed>0;}
function eliteTaskCap(){return ELITE_TASKS.cap[Math.min(2,zoneNumber())];}
function elitePromotionCap(){return ELITE_TASKS.promotions[Math.min(2,zoneNumber())];}
function initializeEliteBehavior(e){
 if(!eliteBehaviorEligible(e)||e.eliteBehavior)return;
 const slot=game.enemies.filter(eliteBehaviorEligible).indexOf(e),family=e.champion?{charge:0,shield:1,ricochet:2}[rareEliteRole(e)]:(e.bossIndex||0)%3;
 e.eliteBehavior={slot,family,nextTaskAt:game.frame+ELITE_TASKS.initial+(slot%3)*1.25,taskIndex:family+(slot%2)};
}
function eliteRecruitEligible(e){return e&&e.hp>0&&!e.boss&&!e.elite&&!e.uncommon&&!e.totem&&!e.summoned&&!e.cast;}
function eliteTaskLinked(e){return (game.themedEvents||[]).some(t=>!t.done&&(t.owner===e||t.partner===e))||game.enemies.some(other=>other.cast?.themed&&(other===e||other.cast.themed.partner===e));}
function eliteRecruit(owner){
 if(game.phase%2||game.phase>=6||(game.elitePromotionCount||0)>=elitePromotionCap()||game.enemies.filter(e=>e.champion&&e.hp>0).length>=rareEliteQuota()+elitePromotionCap())return null;
 return game.enemies.filter(e=>eliteRecruitEligible(e)&&!game.enemies.some(other=>other.eliteTask?.target===e)&&Math.hypot(e.x-owner.x,e.y-owner.y)<300).sort((a,b)=>Math.hypot(a.x-owner.x,a.y-owner.y)-Math.hypot(b.x-owner.x,b.y-owner.y))[0]||null;
}
function eliteRouteClear(from,to,radius=12){
 const distance=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(distance/22));
 for(let i=0;i<=steps;i++){const u=i/steps;if(!encounterClear(from.x+(to.x-from.x)*u,from.y+(to.y-from.y)*u+13,radius))return false;}return true;
}
function eliteTaskSite(owner,target){
 const arena=expandedArena(),p=game.player,angle=Math.atan2(owner.y-p.y,owner.x-p.x);let best=null,score=Infinity;
 for(const radius of [200,240,280])for(let i=0;i<24;i++){
  const a=angle+i*Math.PI/12,q={x:p.x+Math.cos(a)*radius,y:p.y+Math.sin(a)*radius},travel=Math.hypot(q.x-owner.x,q.y-owner.y);
  if(travel>215||!insideRect(q,arena,-40)||!encounterClear(q.x,q.y+13,Math.max(18,owner.rad*.7))||!eliteRouteClear(owner,q))continue;
  if(game.enemies.some(e=>e!==owner&&e!==target&&e.hp>0&&e.elite&&Math.hypot(q.x-e.x,q.y-e.y)<100)||(game.totems||[]).some(t=>Math.hypot(q.x-t.x,q.y-t.y)<75))continue;
  const recruit=target?{x:q.x-Math.sin(a)*72+Math.cos(a)*15,y:q.y+Math.cos(a)*72+Math.sin(a)*15}:null;
  if(recruit&&(!insideRect(recruit,arena,-28)||!encounterClear(recruit.x,recruit.y+13,18)||!eliteRouteClear(target,recruit)))continue;
  const next=travel+Math.abs(radius-230)*.35+(target?Math.hypot(target.x-recruit.x,target.y-recruit.y)*.2:0);
  if(next<score){score=next;best={point:q,recruit};}
 }
 return best;
}
function startEliteTask(owner,kind){
 if(!eliteBehaviorEligible(owner)||owner.eliteTask||owner.cast||owner.charge||owner.stagger>0||owner.phaseQueue?.length||eliteTaskLinked(owner))return false;
 if(game.enemies.filter(e=>e.eliteTask).length>=eliteTaskCap()||game.counterRequest||game.enemies.some(e=>isReflectCast(e.cast)))return false;
 if(kind==='ascend'&&owner.ascendance>0||kind==='conduit'&&(totemsDisabled()||game.enemies.filter(e=>e.summoned).length>=8))return false;
 const target=kind==='empower'?eliteRecruit(owner):null;if(kind==='empower'&&!target)return false;
 const site=eliteTaskSite(owner,target);if(!site)return false;
 initializeEliteBehavior(owner);owner.eliteTask={kind,target,...site,phase:'travel',travelLeft:ELITE_TASKS.travelSeconds,age:0,total:ELITE_TASKS[kind].seconds||0,hits:0,pressure:0,lastHit:-Infinity,healed:0,spawnClock:kind==='siege'?ELITE_TASKS.siege.first:ELITE_TASKS.conduit.first,variant:owner.eliteBehavior.family%2?'marks':'volley',pending:null};
 owner.tasksUsed=[...new Set([...(owner.tasksUsed||[]),kind])];codexDiscover('elite_tasks');return true;
}
function clearEliteTask(owner){const task=owner.eliteTask;if(task?.target)game.eliteRecruits?.delete(task.target);owner.eliteTask=null;}
function finishEliteTask(owner){
 clearEliteTask(owner);if(owner.eliteBehavior)owner.eliteBehavior.nextTaskAt=game.frame+ELITE_TASKS.cooldown+(owner.eliteBehavior.slot%3);owner.castCooldown=Math.max(owner.castCooldown||0,1.2);
}
function interruptEliteTask(owner,reason='stun'){
 if(!owner.eliteTask)return false;finishEliteTask(owner);owner.stagger=Math.max(owner.stagger||0,ELITE_TASKS.interruptStun);burst(owner.x,owner.y-18,14,combatTheme('safe').color);if(reason==='dash')refundCounterDash();return true;
}
function noteEliteTaskHit(owner,damage){
 const task=owner.eliteTask;if(!task||owner.hp<=0||damage<=0)return;task.pressure+=damage;
 if(game.frame-task.lastHit>=.15){task.hits++;task.lastHit=game.frame;}
 if(task.hits>=ELITE_TASKS.interruptHits||task.pressure>=owner.maxHp*ELITE_TASKS.interruptHealth)interruptEliteTask(owner,'weapon');
}
function tickEliteTask(owner,dt){
 const task=owner.eliteTask;if(!task)return;
 if(owner.stagger>0||owner.hp<=0||task.target&&!eliteRecruitEligible(task.target)){interruptEliteTask(owner);return;}
 if(task.target)game.eliteRecruits.set(task.target,owner);
 if(task.phase==='travel'){
  task.travelLeft-=dt;
  if(Math.hypot(owner.x-task.point.x,owner.y-task.point.y)<18&&(!task.target||Math.hypot(task.target.x-task.recruit.x,task.target.y-task.recruit.y)<25)){task.phase='channel';task.age=0;}
  else if(task.travelLeft<=0)finishEliteTask(owner);
  return;
 }
 const previous=task.age;task.age+=dt;
 if(task.kind==='siege'){tickEliteSiege(owner,task,dt);return;}
 if(task.kind==='ascend'){
  const elapsed=Math.max(0,Math.min(task.age,task.total)-previous),heal=Math.max(0,Math.min(owner.maxHp-owner.hp,owner.maxHp*ELITE_TASKS.ascend.healRate*elapsed,owner.maxHp*ELITE_TASKS.ascend.healCap-task.healed));owner.hp+=heal;task.healed+=heal;
  if(task.age>=task.total){owner.ascendance=ELITE_TASKS.ascend.duration;finishEliteTask(owner);burst(owner.x,owner.y-25,18,TOTEM_SIGNALS.fury.color);}
 }else if(task.kind==='empower'){
  if(task.age>=task.total){const target=task.target;if(promoteRareElite(target,0,true))burst(target.x,target.y-20,18,combatTheme('reflect').hot);finishEliteTask(owner);}
 }else{
  if(totemsDisabled()){interruptEliteTask(owner,'silence');return;}
  if(task.pending){task.warn-=dt;if(task.warn<=0){spawnSummonedEnemy(owner,task.pending);task.pending=null;task.spawnClock=ELITE_TASKS.conduit.interval;}}
  else{task.spawnClock-=dt;if(task.spawnClock<=ELITE_TASKS.conduit.warning&&game.enemies.filter(e=>e.summoned).length<8){const angle=task.age*1.7;task.pending=summonPoint(owner,owner.x+Math.cos(angle)*70,owner.y+Math.sin(angle)*70);if(task.pending)task.warn=ELITE_TASKS.conduit.warning;else task.spawnClock=.5;}}
 }
}
function tickEliteTasks(dt){
 if(!(game.eliteRecruits instanceof Map))game.eliteRecruits=new Map();else game.eliteRecruits.clear();
 for(const owner of [...game.enemies]){
  owner.ascendance=Math.max(0,(owner.ascendance||0)-dt);initializeEliteBehavior(owner);
  if(owner.eliteTask){tickEliteTask(owner,dt);continue;}
  const behavior=owner.eliteBehavior;if(!eliteBehaviorEligible(owner)||!behavior||game.frame<behavior.nextTaskAt||owner.cast||owner.charge||owner.stagger>0||owner.phaseQueue?.length)continue;
  for(let n=0;n<4;n++){const kind=['ascend','empower','conduit','siege'][behavior.taskIndex++%4];if(startEliteTask(owner,kind))break;}
  if(!owner.eliteTask)behavior.nextTaskAt=game.frame+2;
 }
}
function tickEliteSiege(owner,task,dt){
 const config=ELITE_TASKS.siege;
 if(task.pending){task.warn-=dt;if(task.warn>0)return;const q=task.pending,attack={},damage=hostileDamage(owner,task.variant==='marks'?config.mark:config.projectile);
  if(task.variant==='marks')game.hazards.push({...q,type:'ground',owner,attack,biome:owner.biome,language:'danger',r:52,life:.4,total:.4,age:0,singleHit:true,damage});
  else for(const offset of [-.2,0,.2]){const angle=q.angle+offset;game.hostileShots.push({x:owner.x,y:owner.y-22,vx:Math.cos(angle)*175,vy:Math.sin(angle)*175,rad:7,life:6,age:0,owner,attack,biome:owner.biome,language:'danger',damage,abilityType:'volley'});}
  task.pending=null;task.spawnClock=config.interval;return;
 }
 task.spawnClock-=dt;if(task.spawnClock<=0){const p=game.player;task.pending={x:p.x,y:p.y,angle:Math.atan2(p.y-owner.y+22,p.x-owner.x)};task.warn=config.warning;}
}
function eliteBehaviorStep(enemy,dx,dy,step){
 const task=enemy.eliteTask,source=game.eliteRecruits?.get(enemy),recruit=source?.eliteTask?.target===enemy?source.eliteTask.recruit:null;
 if(enemy.stagger>0)return {x:0,y:0};
 let goal=task?.phase==='travel'?task.point:recruit;if(task?.phase==='channel')return {x:0,y:0};
 if(goal){const x=goal.x-enemy.x,y=goal.y-enemy.y,d=Math.hypot(x,y);return d<8?{x:0,y:0}:{x:x/d*Math.min(Math.abs(step)*1.2,d),y:y/d*Math.min(Math.abs(step)*1.2,d)};}
 if(!eliteBehaviorEligible(enemy)||!enemy.eliteBehavior||!step||enemy.charge)return {x:dx,y:dy};
 const p=game.player,b=enemy.eliteBehavior,d=Math.hypot(enemy.x-p.x,enemy.y-p.y),a=d>1?Math.atan2(enemy.y-p.y,enemy.x-p.x):b.slot*2.4,ux=Math.cos(a),uy=Math.sin(a),close=b.family===0||enemy.champion&&!enemy.cast&&enemy.castCooldown<1,lo=close?65:165,hi=close?125:230,radial=d>hi?-1:d<lo?.85:0,side=(b.slot%2?1:-1)*(Math.floor(game.frame/7)%2?1:-1);
 let x=ux*radial-uy*side*(d<hi+70?.4:.15),y=uy*radial+ux*side*(d<hi+70?.4:.15);
 for(const other of game.enemies){if(other===enemy||!other.elite||other.hp<=0)continue;const gap=Math.hypot(enemy.x-other.x,enemy.y-other.y);if(gap<95){const angle=gap>1?Math.atan2(enemy.y-other.y,enemy.x-other.x):a+b.slot;const force=(95-gap)/70;x+=Math.cos(angle)*force;y+=Math.sin(angle)*force;}}
 const norm=Math.max(1,Math.hypot(x,y)),move={x:x/norm*Math.abs(step),y:y/norm*Math.abs(step)};
 if(encounterClear(enemy.x+move.x,enemy.y+move.y+13,12))return move;
 if(encounterClear(enemy.x+move.x,enemy.y+13,12))return {x:move.x,y:0};if(encounterClear(enemy.x,enemy.y+move.y+13,12))return {x:0,y:move.y};return {x:0,y:0};
}
function eliteTaskGuideIcon(){return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><title>Elite intentions</title><defs><radialGradient id="b"><stop stop-color="#485549"/><stop offset="1" stop-color="#18252a"/></radialGradient></defs><circle cx="64" cy="64" r="60" fill="url(#b)" stroke="#b8a574" stroke-width="2"/><path d="M64 29L30 88H98Z" fill="none" stroke="#c8b88d" stroke-width="4"/><g stroke="#edd9a9" stroke-width="2"><circle cx="64" cy="29" r="19" fill="#345c46"/><circle cx="30" cy="88" r="19" fill="#684d39"/><circle cx="98" cy="88" r="19" fill="#414c68"/></g><path d="M64 16V42M51 29H77" stroke="#9ce2af" stroke-width="6"/><path d="M17 91L15 76L25 83L30 74L35 83L45 76L43 91Z" fill="#efd28a"/><path d="M98 73Q79 81 89 97Q104 109 111 94Q117 79 98 73M98 81Q89 88 97 96Q105 99 106 90Q104 84 98 87" fill="none" stroke="#adc7f0" stroke-width="3"/></svg>');}
function installEliteTaskGuide(){SVG_FILES['codex-elite_tasks.svg']=eliteTaskGuideIcon();CODEX_ITEMS.push({id:'elite_tasks',cat:'Enemies',name:'Elite intentions',desc:'Elites and rares spread out, then sometimes leave the chase for a task. Ascendance slowly heals and grants a strong temporary damage/cadence buff if finished. Rare Awakening turns an ordinary monster into a rare; killing that recruit stops it. Living Conduit summons a bounded army until interrupted. Siege Channel moves into position and keeps firing warned volleys or marking ground until interrupted. Dash through the channeler, stun it, land three focused weapon hits, or remove 12% of its maximum health to interrupt. A successful dash interrupt refunds dash. Summoned enemies cannot perform these tasks or be promoted.'});}
