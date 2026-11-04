// Injected into test/review responses only; never included in the standalone game.
function journeyFixture(){
 function fresh(zone=1){
  if(eliteRewardOpen())closeEliteReward(true);if(codexSession)closeCodex();closeDrawer(false);hideOverlay(true);masteryDraft=null;
  data=defaults();data.floor=zoneStart(zone-1);data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=true;normalizeProgression();normalizeZone();ensureJobs();resetRun();game.status='running';game.scene='combat';game.manualPaused=false;game.menuPaused=true;game.devSpeed=game.skillSpeed=1;game.activeClockMs=0;game.lastActiveAt={};game.holdAccum=0;game.lastJobsAt=Date.now();game.keys={};game.mouseMove.active=false;game.phase=1;game.phaseTarget=1e9;game.attackTimer=1e9;setScene('combat',false);hideOverlay(true);refreshUI();return state();
 }
 function state(){return {goal:data.craftGoal,scene:game.scene,frame:game.frame,level:dungeonProgress().level,nextZone:dungeonProgress().nextZone,points:masteryFor().points,earned:masteryFor().earned,ranks:{delve:timeRank('delve'),skilling:timeRank('skilling')},rates:{delve:selectedTimeRate('delve'),skilling:selectedTimeRate('skilling')},xp:data.dungeoneeringXp,resources:Object.fromEntries(Object.keys(RESOURCE_LABEL).map(k=>[k,data[k]||0])),vouchers:Object.fromEntries(['iron','steel'].map(tier=>[tier,Object.entries(data.specificVouchers).filter(([key])=>key.startsWith(tier+'_')).reduce((sum,[,n])=>sum+n,0)])),loot:JSON.parse(JSON.stringify(game.lootDrops||[])),gems:game.gems.length,boons:activeEliteBoons().map(b=>({...b})),rally:game.player.rallyTime,player:{x:game.player.x,y:game.player.y,dash:game.player.dashCooldown,pointer:game.joystick.pointer},status:game.status};}
 function clock(seconds,active=false){const original=Date.now;let now=original();game.lastJobsAt=now;Date.now=()=>now;try{if(active){enterActivity('mine');game.holdSkill='mine';activeSkill('mine');}for(let left=seconds;left>1e-8;left-=.02){const dt=Math.min(.02,left);now+=dt*1000;update(dt);}game.holdSkill=null;}finally{Date.now=original;game.lastJobsAt=original();}refreshUI();return state();}
 window.__journey={fresh,state,clock,
  reach(zone){data.cleared=zoneStart(zone-1)-1;data.floor=data.cleared+1;normalizeProgression();normalizeZone();resetRun();hideOverlay(true);game.status='running';game.menuPaused=true;refreshUI();return state();},
  xp(){gainXp(100000);refreshUI();return state();},
  replay(){const cleared=data.cleared;data.floor=1;game.status='running';clearFloor();if(data.cleared!==cleared)throw Error('Replay changed frontier');return state();},
  buy(kind){return buyTimeUpgrade(kind);},
  rate(kind,value){return setTimeRate(kind,value);},
  pointPool(points=50){masteryFor().points=points;masteryFor().earned=points+masterySpent(masteryFor());refreshUI();},
  curves(){return {delve:Array.from({length:8},(_,r)=>timeRateForRank('delve',r)),skilling:Array.from({length:17},(_,r)=>timeRateForRank('skilling',r))};},
  idle(){data.idleJobs=['mine'];data.jobTimers={mine:0};ensureJobs();game.scene='combat';game.menuPaused=true;},
  offlineDay(){masteryFor().skillingSpeed=16;masteryFor().earned=16;data.timeRates.skilling=24;data.idleJobs=['mine'];data.jobTimers={mine:0};ensureJobs();data.ore=0;advanceProduction(28800);return state();},
  offlineSave(){save();return JSON.parse(JSON.stringify(data));},
  quiet(){game.menuPaused=game.manualPaused=false;game.enemies=[];game.phase=1;game.phaseTarget=1e9;game.player.invuln=1e9;game.attackTimer=1e9;game.keys={};hideOverlay(true);refreshUI();},
  plan(action,patch={}){Object.assign(data,patch);data.craftGoal=action;const before=JSON.stringify(data),plan=preparationPlan(),after=JSON.stringify(data);return {plan,unchanged:before===after};},
  planPromotion(){data.biomeLoot[0]=1;data.styles.ranged.weapon=10;data.woodworkingXp=data.wardingSkillXp=1710;Object.assign(data,{gold:10000,steelBars:6,willowLogs:0,runicCloth:0,cloth:6,cutGarnets:1});return this.plan('promotion:ranged');},
  conservedPlan(){data.stationLevels.woodworking=5;data.stationCredits.woodworking={bars:.8,logs:.7,steelBars:.9,willowLogs:.9,runicCloth:.6};return this.planPromotion();},
  executePlan(action){let passes=0;while(passes++<50){const plan=preparationPlan(action);if(!plan.steps.length)break;const step=plan.steps[0];if(!step.activity||step.blocked)throw Error('Blocked '+JSON.stringify(step));for(let n=0;n<step.batches;n++){if(step.activity==='prospect'){if(!prospectOpal())throw Error('Prospect failed');}else if(!produce(step.activity,true))throw Error('Plan underfunded '+step.activity);}}return {passes,ready:hasIngredients(goalDetails(action).cost),plan:preparationPlan(action)};},
  materials(kind,roll=.999){const enemy={boss:kind==='boss',elite:kind==='elite',bossIndex:0},original=Math.random;Math.random=()=>roll;try{return monsterMaterialDrops(enemy);}finally{Math.random=original;}},
  materialChances(){return {normal:monsterMaterialChance({}),elite:monsterMaterialChance({elite:true}),boss:monsterMaterialChance({boss:true})};},
  economy(){return [1,2].map(tier=>['weapon','speed'].reduce((sum,kind)=>{const first=tier===1?0:kind==='weapon'?10:5,last=tier===1?(kind==='weapon'?10:5):(kind==='weapon'?20:10);for(let rank=first;rank<last;rank++)sum+=preparationUpgradeGold(tier,kind,rank);return sum;},0));},
  economyMigration(){fresh(2);data.preparationEconomyVersion=0;data.gold=321;Object.assign(data.styles.melee,{tier:2,weapon:20,speed:10});delete data.refinementRanksVersion;normalizeRefinementRanks();normalizePreparationEconomy();const first=data.gold;normalizePreparationEconomy();return {first,again:data.gold,credit:data.preparationEconomyCredit};},
  equipmentView(){openWorkshop(STYLE_DEFS[combatStyle()].group,'equipment');},
  equipmentXp(){fresh();Object.assign(data,{woodworkingXp:300,gold:10000,bars:1000,logs:1000});const before=data.woodworkingXp;chooseWeapon('bow');craftStyleUpgrade('ranged','weapon');craftStyleUpgrade('ranged','speed');const after=data.woodworkingXp;chooseWeapon('bow');data.gold=0;craftStyleUpgrade('ranged','weapon');return {gain:after-before,repeatGain:data.woodworkingXp-after,other:data.blacksmithXp};},
  sigilReceipt(){grantZoneCurrency(1);recordMonsterLoot({x:0,y:0,rad:15},[{key:'sigils',amount:1}]);refreshUI();},
  kill(kind='boss',roll=0){const e=spawnEnemy(kind==='boss',0);e.x=100;e.y=60;e.elite=kind==='elite';e.summoned=kind==='summon';e.hp=1;e.name='Test guardian';const original=Math.random;Math.random=()=>roll;try{onKill(e);}finally{Math.random=original;}refreshUI();return state();},
  collectLoot(){collectAllGroundLoot();return state();},
  voucher(tier='iron',style='melee'){data.specificVouchers[tier+'_weapon']=1;const before={gold:data.gold,bars:data.bars};const result=redeemUpgradeVoucher(style);return {result,before,after:{gold:data.gold,bars:data.bars},rank:data.styles[style].weapon,vouchers:Object.fromEntries(['iron','steel'].map(tier=>[tier,Object.entries(data.specificVouchers).filter(([key])=>key.startsWith(tier+'_')).reduce((sum,[,n])=>sum+n,0)]))};},
  cappedVoucher(){data.styles.melee.weapon=10;return this.voucher();},
  buffs(){data.eliteBoons=[{id:'windstep',remaining:5,dungeon:dungeonForZone().id,uid:1},{id:'windstep',remaining:19,dungeon:dungeonForZone().id,uid:2},{id:'fervor',remaining:12,dungeon:dungeonForZone().id,uid:3}];data.eliteBoonSequence=3;game.player.rallyTime=4;refreshUI();return state();},
  freezeBuffs(kind){if(kind==='menu')openDrawer('gear');else if(kind==='skill')setScene('mine',false);else game.manualPaused=game.menuPaused=true;return clock(2);},
  expireBuffs(){hideOverlay(true);closeDrawer(false);game.menuPaused=game.manualPaused=false;setScene('combat',false);game.enemies=[];game.phase=1;return clock(6);},
  fade(){const t={},out=[];for(const time of [0,.2,1,3,4,8,9,9.2,10]){game.tipClock=time;out.push(combatTipAlpha(t,'BUMP'));}game.tipClock=4;const reset=combatTipAlpha(t,'STEP CLEAR');return {out,reset};},
  save(){save();},
  legacySeed(){const d=defaults();delete d.timeProgressionVersion;delete d.lootPresentationVersion;delete d.preparationEconomyVersion;d.zoneShopVersion=d.dungeonShopVersion=1;d.floor=6;d.cleared=5;d.gold=321;d.tierProgressionVersion=1;d.styles={melee:{weapon:20,speed:10,tier:2},ranged:{},magic:{}};d.dungeoneeringXp=6400;d.dungeonMastery={points:7,earned:8,onslaught:1,fortune:0,adaptation:0,intensity:0};d.xpCaches={0:[{x:1,y:1,value:12}]};d.onboardingDone=true;return d;}
 };
}
module.exports={journeyFixture};
