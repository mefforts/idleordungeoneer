/* Dungeoneering milestones and earned game clocks share one point bank. */
function dungeoneeringMilestone(rank){return rank<=1?2:5*Math.pow(2,rank-2);}
function dungeoneeringJourney(){
 const frontier=Math.max(1,Math.floor(Number(data.cleared)||0)+1),zone=zoneForFloor(frontier)+1;let level=0;
 while(level<40&&zone>=dungeoneeringMilestone(level+1))level++;
 const nextZone=dungeoneeringMilestone(level+1),previous=level?zoneStart(dungeoneeringMilestone(level)-1):1,next=zoneStart(nextZone-1);
 return {level,zone,nextZone,xp:Math.max(0,frontier-previous),required:Math.max(1,next-previous)};
}
function normalizeTimeProgression(){
 const m=data.dungeonMastery,journey=dungeoneeringJourney();if(!m)return;
 if(data.timeProgressionVersion!==1){
  const oldLevel=1+Math.floor(Math.sqrt((data.dungeoneeringXp||0)/DUNGEONEERING_XP_STEP));
  data.legacyDungeoneeringLevel=Math.max(oldLevel,Number(data.legacyDungeoneeringLevel)||0);
  // Existing Mastery unlocked 2× Delving. Preserve that entitlement, balances
  // and allocations while new saves earn their first speed choice in Zone 2.
  if(m.earned>0&&m.delveSpeed<4){m.earned+=4-m.delveSpeed;m.delveSpeed=4;}
  data.timeMilestones=0;data.timeProgressionVersion=1;
 }
 const credited=Math.max(0,Math.floor(Number(data.timeMilestones)||0)),awarded=Math.max(0,journey.level-credited);
 if(awarded){m.points+=awarded;m.earned+=awarded;data.timeMilestones=journey.level;}
 if(!data.timeRates||typeof data.timeRates!=='object')data.timeRates={};
 for(const kind of ['delve','skilling']){
  const maximum=earnedTimeRate(kind),selected=Number(data.timeRates[kind]);
  data.timeRates[kind]=timeRateChoices(kind).includes(selected)?selected:maximum;
 }
}
function timeRank(kind){return Math.max(0,Math.floor(Number(data.dungeonMastery?.[kind==='delve'?'delveSpeed':'skillingSpeed'])||0));}
function timeRateForRank(kind,rank){return rank<=0?1:kind==='delve'?1+rank*.25:rank<=9?rank+1:10+(rank-9)*2;}
function earnedTimeRate(kind){return timeRateForRank(kind,timeRank(kind));}
function timeRateChoices(kind){return Array.from({length:timeRank(kind)+1},(_,rank)=>timeRateForRank(kind,rank));}
function selectedTimeRate(kind){const value=Number(data.timeRates?.[kind]);return timeRateChoices(kind).includes(value)?value:earnedTimeRate(kind);}
function delvingTimeMultiplier(){return selectedTimeRate('delve')*(data.devSpeedUnlocked?(game.devSpeed||1):1);}
function settleIdleTime(){
 const now=Date.now(),seconds=Math.max(0,(now-game.lastJobsAt)/1000);game.lastJobsAt=now;
 if(seconds)advanceProduction(seconds,skillingTimeMultiplier());
}
function buyTimeUpgrade(kind){
 if(!['delve','skilling'].includes(kind)||masteryFor().points<1)return false;
 settleIdleTime();const m=masteryFor(),key=kind==='delve'?'delveSpeed':'skillingSpeed';m[key]++;m.points--;
 data.timeRates[kind]=earnedTimeRate(kind);masteryDraft=null;shopSignature='';
 toast((kind==='delve'?'Delving':'Skilling')+' '+earnedTimeRate(kind)+'×',(kind==='skilling'?'Gathering, crafting and idle work, including offline.':'Combat, enemies and ammunition advance together.')+' Use the Speed button to choose your rate.');
 save();refreshUI();return true;
}
function setTimeRate(kind,value){
 if(!['delve','skilling'].includes(kind)||!timeRateChoices(kind).includes(value))return false;settleIdleTime();data.timeRates[kind]=value;save();return true;
}
function gameTimeShopHtml(){
 const m=masteryFor(),journey=dungeoneeringJourney();
 return '<section class="game-time-shop" aria-labelledby="gameTimeTitle"><div class="game-time-heading"><h3 id="gameTimeTitle">Game time</h3><span>'+artHTML('mastery-points')+'<b>'+format(m.points)+'</b> '+(m.points===1?'point':'points')+'</span></div><p class="time-milestone">Dungeoneering '+journey.level+' · '+(journey.level?'Next point: Zone '+journey.nextZone:'First point: reach Zone 2')+'</p>'+(m.points===1&&!timeRank('delve')&&!timeRank('skilling')?'<p class="time-first-choice">Your first point: choose faster Delving or faster Skilling.</p>':'')+'<div class="game-time-choices">'+['delve','skilling'].map(kind=>{
  const name=kind==='delve'?'Delving':'Skilling',current=earnedTimeRate(kind),next=timeRateForRank(kind,timeRank(kind)+1);
  return '<article class="game-time-card"><h4>'+uiIcon(kind==='delve'?'sword':'idle')+name+'</h4><p>'+(kind==='delve'?'Faster combat and encounters.':'Gathering, crafting <b>and idling</b>, online and offline.')+'</p><div class="time-rate"><strong>'+current+'×</strong>'+uiIcon('arrow')+'<strong>'+next+'×</strong></div><button type="button" data-buy-time="'+kind+'" data-focus-key="time-'+kind+'" '+(m.points<1?'disabled':'')+' aria-label="Increase '+name+' from '+current+' to '+next+' times for one Dungeoneering point">'+(m.points?'1 point':'Need 1 point')+'</button></article>';
 }).join('')+'</div><small>Each rank costs one shared Dungeoneering point. Milestones: Zones 2, 5, 10, 20, 40…</small></section>';
}
function refreshSpeedChoices(){
 const host=$('speedOptions'),kind=game.scene==='combat'?'delve':'skilling',signature=JSON.stringify([kind,timeRank('delve'),timeRank('skilling'),!!data.devSpeedUnlocked]);
 if(host.dataset.context&&host.dataset.context!==kind)closeSpeedChoices();host.dataset.context=kind;
 if(host.dataset.choices!==signature){
  host.dataset.choices=signature;host.setAttribute('aria-label','Game speed');
  const testing=data.devSpeedUnlocked?'<section class="speed-option-group" aria-labelledby="testingSpeedTitle"><h3 id="testingSpeedTitle">Testing · '+(kind==='delve'?'Delving':'Skilling')+'</h3><p>Additional multiplier</p><div class="speed-rate-grid">'+[1,2,5,10,25,50,100,500].map(rate=>'<button type="button" data-speed="'+rate+'" aria-label="Testing '+(kind==='delve'?'Delving':'Skilling')+' multiplier '+rate+' times">'+rate+'×</button>').join('')+'</div></section>':'';
  host.innerHTML=testing+[kind,kind==='delve'?'skilling':'delve'].map(path=>{
   const name=path==='delve'?'Delving':'Skilling';
   return '<section class="speed-option-group" aria-labelledby="'+path+'SpeedTitle"><h3 id="'+path+'SpeedTitle">'+name+'</h3><p>'+(path==='delve'?'Combat and encounters':'Includes active work and idling')+'</p><div class="speed-rate-grid">'+timeRateChoices(path).map(rate=>'<button type="button" data-time-kind="'+path+'" data-time-rate="'+rate+'" '+(!data.devSpeedUnlocked&&path===kind?'data-speed="'+rate+'" ':'')+'aria-label="'+name+' speed '+rate+' times">'+rate+'×</button>').join('')+'</div></section>';
  }).join('')+'<button type="button" class="speed-shop-link" id="speedShopLink">Unlock more speeds '+uiIcon('arrow')+'</button>';
  host.querySelectorAll('[data-time-rate]').forEach(button=>button.onclick=()=>{if(setTimeRate(button.dataset.timeKind,Number(button.dataset.timeRate))){closeSpeedChoices(true);refreshArenaUI();}});
  host.querySelectorAll('[data-speed]:not([data-time-rate])').forEach(button=>button.onclick=()=>setArenaSpeed(Number(button.dataset.speed)));
  $('speedShopLink').onclick=()=>{closeSpeedChoices();openZoneShop();};
  host.querySelectorAll('button').forEach(bindTouchNavigation);
 }
 host.querySelectorAll('[data-time-rate]').forEach(button=>{const active=Number(button.dataset.timeRate)===selectedTimeRate(button.dataset.timeKind);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 host.querySelectorAll('[data-speed]:not([data-time-rate])').forEach(button=>{const active=Number(button.dataset.speed)===selectedSceneSpeed();button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 if(!host.classList.contains('hidden'))positionSpeedChoices();
}
function dungeonPerkUnlocked(p){return !!p&&(p.level<=1||Math.max(dungeonProgress().level,data.legacyDungeoneeringLevel||0)>=p.level);}
