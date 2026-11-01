// Deterministic progression for navigation checks; injected into responses only.
function delveFixture(){
 function fresh(floor=1,cleared=0){
  resetArenaTouch();if(codexSession)closeCodex();closeDrawer(false);hideOverlay();data=defaults();data.floor=floor;data.cleared=cleared;data.onboardingDone=data.tutorialSeen=data.skillsNudgeSeen=data.zone2SkillsAnnounced=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=true;game.keys={};game.enemies=[];game.phase=1;game.phaseTarget=1e9;game.attackTimer=1e9;game.player.invuln=1e9;game.holdSkill=null;tourIndex=-1;setScene('combat',false);$('toastStack').replaceChildren();refreshUI();
 }
 window.__delveTest={
  fresh,
  finishZone1(){fresh(zoneEnd(0),zoneEnd(0)-1);data.idleJobs=['mine'];ensureJobs();game.status='running';game.phase=5;const boss=spawnEnemy(true,2);boss.name=biome().boss[2];onKill(boss);nextPhase();},
  seedTravel(){data.gold=321;data.bars=7;data.craftGoal='weapon:bow';data.dungeoneeringXp=777;data.ammoCharges={arrows:7.5,runes:4.2};zoneShopFor(0).ranks={fire:2};zoneShopFor(0).currency=17;game.gems=[{x:700,y:700,value:37}];checkpointGroundXp();syncZone();game.manualPaused=game.menuPaused=true;refreshUI();return this.state();},
  state(){return {floor:data.floor,cleared:data.cleared,slots:idleSlotsUnlocked(),jobs:[...data.idleJobs],timers:{...data.jobTimers},gold:data.gold,bars:data.bars,goal:data.craftGoal,xp:data.dungeoneeringXp,charges:{...data.ammoCharges},cache:JSON.parse(JSON.stringify(data.xpCaches||{})),ranks:{...zoneShopFor(0).ranks},seals:zoneShopFor(0).currency,tip:!!data.zone2TravelTipSeen,drawer:drawerKind,scene:game.scene,points:masteryFor().points};},
  travel(floor){return startDelveFloor(floor);},
  clearNotices(){ $('toastStack').replaceChildren();},
  open(){openDelveTravel();},
  idleCase(two=false,empty=false){fresh(two?zoneStart(1):2,two?zoneEnd(0):1);data.idleJobs=two?['mine',empty?'':'forge']:['mine'];data.jobTimers.mine=3.4;ensureJobs();openWorkshop('woodworking','gather');},
  activityIdle(two=false){this.idleCase(two);enterActivity('wood');},
  save(){save();}
 };
}
module.exports={delveFixture};
