// Injected into isolated test/review responses, never into the standalone game.
function speedControlsFixture(){
 function state(){return {scene:game.scene,points:masteryFor().points,ranks:{delve:timeRank('delve'),skilling:timeRank('skilling')},rates:{...data.timeRates},testing:{enabled:!!data.devSpeedUnlocked,delve:game.devSpeed||1,skilling:game.skillSpeed||1},effective:{delve:delvingTimeMultiplier(),skilling:skillingTimeMultiplier()}};}
 function fresh(zone=2){__journey.fresh(zone);game.status='running';game.menuPaused=game.manualPaused=true;game.spawnTimer=game.attackTimer=1e9;game.player.invuln=1e9;data.devSpeedUnlocked=false;game.devSpeed=game.skillSpeed=1;refreshUI();return state();}
 window.__speedControlsTest={fresh,state,
  ranks(delve,skilling){fresh();__journey.pointPool(delve+skilling);for(let i=0;i<delve;i++)buyTimeUpgrade('delve');for(let i=0;i<skilling;i++)buyTimeUpgrade('skilling');$('toastStack').replaceChildren();refreshUI();return state();},
  scene(key){if(key==='combat')setScene(key,false);else enterActivity(key);game.status='running';game.menuPaused=true;refreshUI();return state();},
  side(side,speedFirst=false){data.hudLayout.side=side;if(speedFirst)data.hudLayout.order=['speed',...data.hudLayout.order.filter(id=>id!=='speed')];applyHudLayout();refreshUI();},
  save(){save();},
  valid(kind,rate){return setTimeRate(kind,rate);},
  run(seconds,kind,active=false){
   game.status='running';game.scene=kind==='delve'?'combat':'mine';game.phase=0;game.phaseTarget=game.phaseSpawned=1e9;game.phaseKills=0;game.spawnTimer=game.attackTimer=1e9;game.enemies=[];game.manualPaused=game.menuPaused=false;game.player.invuln=1e9;
   data.idleJobs=active?['','']:['mine'];ensureJobs();data.jobTimers.mine=0;data.ore=0;game.activeClockMs=0;game.holdAccum=0;game.holdSkill=active?'mine':null;
   const original=Date.now;let now=original();Date.now=()=>now;game.lastJobsAt=now;const before=game.frame;
   try{for(let left=seconds;left>1e-8;left-=.02){const dt=Math.min(.02,left);now+=dt*1000;update(dt);}}finally{Date.now=original;game.lastJobsAt=original();game.holdSkill=null;game.status='ready';game.menuPaused=true;}
   refreshUI();return {combatSeconds:game.frame-before,workMilliseconds:game.activeClockMs,ore:data.ore};
  }
 };
}
module.exports={speedControlsFixture};
