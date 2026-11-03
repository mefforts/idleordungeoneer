// Deterministic work clocks and discoveries exist only in test/review responses.
function skillingBonusesFixture(){
 const realUpdate=update;let manual=true;update=dt=>{if(!manual)realUpdate(dt);};
 function fresh(key='forge',armor='melee_1',zone=0){
  manual=true;__workshopTest.fresh(key,armor,zone);game.holdAccum=0;game.workVisualClock=game.workEffectsClock=0;game.workPresentation=null;game.workBonusReaction=null;game.workBonusSerial=0;game.workReward=null;
  data.skillingBuffs=[];data.idleJobs=['',''];game.lastActiveAt={[key]:game.activeClockMs};refreshUI();render();
 }
 function spawn(rarity='common',amount){
  const original=rollSkillBonusRarity;rollSkillBonusRarity=()=>SKILL_BONUS_RARITIES.find(r=>r.id===rarity);
  try{const id=spawnSkillBonus(),node=bonusState().nodes.find(n=>n.id===id);if(node&&amount!==undefined){node.windfall=amount;refreshSkillBonusOffer(node);}return id;}finally{rollSkillBonusRarity=original;}
 }
 function snapshot(){return {key:game.scene,hits:game.activeHits,clock:game.activeClockMs,interval:skillInterval(game.scene),ore:data.ore,bars:data.bars,output:data[SKILLS[game.scene]?.resource],buffs:structuredClone(data.skillingBuffs),multiplier:skillBuffMultiplier(game.scene),reaction:game.workBonusReaction&&{...game.workBonusReaction},hold:game.holdSkill};}
 window.__skillBonusTest={fresh,spawn,snapshot,activities:()=>Object.keys(SKILLS),
  details(){showSkillBuffDetails();},
  setSpeed(rate){const m=masteryFor();data.devSpeedUnlocked=rate===500;game.skillSpeed=rate===500?500:1;m.skillingSpeed=rate===500?0:rate<=10?rate-1:(rate-10)/2+9;m.earned=masterySpent(m)+m.points;data.timeRates.skilling=rate===500?1:rate;refreshUI();},
  tempo(rate,seconds=1){fresh();this.setSpeed(rate);data.ore=1000000;game.holdSkill=game.scene;const before=game.activeClockMs;realUpdate(seconds);const frame=workshopAnimation(game.scene,true,true);return {visual:game.workVisualClock,effects:game.workEffectsClock,production:game.activeClockMs-before,tier:frame.speedTier,rate:frame.speedRate};},
  effectPixels(reduced=false,working=true){
   data.reducedMotion=reduced;game.workEffectsClock=.45;const frame=workshopAnimation(game.scene,true,working),rig=DeepwellAvatar.poseRig(frame),before=JSON.stringify(data);
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);paintWorkshopSpeedEffects(frame,{x:120,y:300,scale:2},rig);ctx.restore();const p=ctx.getImageData(0,0,canvas.width,canvas.height).data;let count=0;for(let i=0;i<p.length;i+=4)if(p[i]||p[i+1]||p[i+2])count++;return {count,unchanged:before===JSON.stringify(data)};
  },
  collect(rarity,amount){const id=spawn(rarity,amount);return {id,result:claimSkillBonus(id)};},
  limitedRefining(key,available=2,conserved=false){
   fresh(key);this.collect('very-rare');const id=spawn('common',5),skill=SKILLS[key],group=disciplineFor(key);if(conserved){data.stationLevels[group]=5;data.stationCredits[group]={ore:.8};}
   for(const [resource,n]of Object.entries(skill.cost||{}))data[resource]=available*n;
   const before=snapshot(),stock=Object.fromEntries(Object.keys(skill.cost||{}).map(k=>[k,data[k]])),result=claimSkillBonus(id),after=snapshot();
   return {key,result,yield:skillYield(key),cost:skill.cost,before,after,stock,remaining:Object.fromEntries(Object.keys(skill.cost||{}).map(k=>[k,data[k]])),feedback:$('skillBonusLayer').querySelector('.skill-bonus-pop:last-child')?.textContent};
  },
  takeAll(){for(const node of [...bonusState().nodes])claimSkillBonus(node.id);},
  tick(seconds,hold=true){game.holdSkill=hold?game.scene:null;game.lastJobsAt=Date.now();realUpdate(seconds);refreshUI();render();return snapshot();},
  ingredients(values){Object.assign(data,values);},
  normalize(value){data.skillingBuffs=value;normalizeSkillingBuffs();return structuredClone(data.skillingBuffs);},
  offline(seconds){return advanceProduction(seconds);},
  idle(key){data.idleJobs=[key,''];data.jobTimers={};},
  earnedSpeed(){data.dungeonMastery.skillingSpeed=1;data.timeRates.skilling=2;},
  benchmark(seconds,collect){
   fresh('forge');data.ore=10000;data.bars=0;game.holdSkill='forge';const random=Math.random;let seed=913,pickups=0,bonusBars=0;
   Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   try{for(let elapsed=0;elapsed<seconds-1e-8;elapsed+=.1){game.lastJobsAt=Date.now();realUpdate(Math.min(.1,seconds-elapsed));if(collect)for(const n of [...bonusState().nodes]){const before=data.bars;if(claimSkillBonus(n.id)){pickups++;bonusBars+=data.bars-before;}}}}
   finally{Math.random=random;resetSkillHold();}
   return {seconds,bars:data.bars,bonusBars,oreSpent:10000-data.ore,pickups};
  },
  roll(values){const original=Math.random;try{return values.map(value=>{Math.random=()=>value;return rollSkillBonusRarity().id;});}finally{Math.random=original;}},
  persist(){save();return structuredClone(data.skillingBuffs);},
  play(){manual=false;game.holdSkill=game.scene;game.lastActiveAt[game.scene]=game.activeClockMs;},
  freeze(){manual=true;},
  reaction(progress=.5){if(game.workBonusReaction)game.workBonusReaction.age=progress*game.workBonusReaction.duration;refreshUI();render();},
  poses(){
   const failures=[];let samples=0,maxStep=0,maxArmError=0,maxGripError=0;
   for(const pose of ['mine','smith','wood','fletch','ward','rune','polish','scavenge'])for(const variant of [0,1])for(const armor of ['',...Object.keys(ARMOR_SETS)])for(const facing of [-1,1]){
    let last=null;for(let i=0;i<=120;i++){
     const options={pose,working:true,workBlend:1,workPhase:.65,time:1.5,facing,data:{...data,equippedArmor:armor},bonusReaction:{progress:i/120,variant}},r=DeepwellAvatar.poseRig(options);samples++;
     for(const arm of [r.frontArm,r.backArm])maxArmError=Math.max(maxArmError,Math.abs(Math.hypot(arm.elbow.x-arm.shoulder.x,arm.elbow.y-arm.shoulder.y)-arm.lengths[0]),Math.abs(Math.hypot(arm.hand.x-arm.elbow.x,arm.hand.y-arm.elbow.y)-arm.lengths[1]));
     if(r.gripOffset)maxGripError=Math.max(maxGripError,Math.hypot(r.back.x-r.main.x-r.gripOffset.x,r.back.y-r.main.y-r.gripOffset.y));
     if(last)maxStep=Math.max(maxStep,...['main','back','head'].map(k=>Math.hypot(r[k].x-last[k].x,r[k].y-last[k].y)));last=r;
     if(![r.main.x,r.main.y,r.back.x,r.head.y].every(Number.isFinite))failures.push({pose,variant,armor,facing,i});
    }
   }return {samples,maxStep,maxArmError,maxGripError,failures};
  }
 };
}
module.exports={skillingBonusesFixture};
