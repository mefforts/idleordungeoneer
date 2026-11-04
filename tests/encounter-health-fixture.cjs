// Response-only comparison against the build immediately before the health test.
function encounterHealthFixture(){
 window.__encounterHealth=(index=0)=>{
  data=defaults();data.floor=zoneStart(index);data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=true;normalizeProgression();normalizeZone();ensureJobs();resetRun();hideOverlay(true);game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=true;game.phase=0;game.phaseSpawned=3;game.phaseTarget=10000;game.enemies=[];game.eliteAt=Infinity;game.eliteCount=0;game.rareEliteCount=0;game.rareEliteSpawned=false;data.seenElites[biomeIndex()]=[true,true,true];const random=Math.random;Math.random=()=>.5;
  try{
   const ordinary=spawnEnemy(),normal=ordinary.hp;promoteRareElite(ordinary,0);const rare=ordinary.hp;game.enemies=[];game.eliteAt=0;game.eliteCount=0;const echo=spawnEnemy(),echoHp=echo.hp;game.enemies=[];game.eliteAt=Infinity;const originalFloor=data.floor;data.floor=zoneEnd(index);const finalBosses=[0,1,2].map(i=>zoneEnemyHp(true,i));data.floor=originalFloor;const owner=spawnEnemy(true,0),summon=spawnSummonedEnemy(owner,{x:240,y:240},true),guard=spawnSummonedEnemy(owner,{x:280,y:240},true,true),model=zoneBalance(index);
   const spires=[false,true].map(royal=>createSummonTotem(owner,{x:400,y:250},royal).maxHp);
   return {zone:index+1,normal,rare,echo:echoHp,echoIsBossElite:!!echo.bossElite,summon:summon.hp,guard:guard.hp,bosses:[0,1,2].map(i=>zoneEnemyHp(true,i)),finalBosses,spires,hpScale:model.hpScale,spawnSeconds:model.spawnSeconds,targets:model.targets,playerDps:weaponDps(),playerCooldown:attackCooldown(),reportedSeconds:model.seconds,rewards:JSON.stringify([MONSTER_LOOT,ZONE_ABILITY_REWARDS])};
  }finally{Math.random=random;}
 };
 window.__encounterHealth.multipliers=()=>[{boss:true,elite:true},{champion:true,elite:true},{bossElite:true,elite:true},{elite:true},{}].map(encounterHealthMultiplier);
 window.__encounterHealth.regional=()=>Array.from({length:15},(_,index)=>[{boss:true},{champion:true,elite:true},{bossElite:true,elite:true},{elite:true},{},{totem:true}].map(enemy=>regionalEncounterHealthMultiplier(enemy,index)));
}
module.exports={encounterHealthFixture};
