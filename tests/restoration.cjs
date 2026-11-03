const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRuntime}=require('./runtime.cjs');
function restorationFixture(){
 function fresh(){resetArenaTouch();closeDrawer();hideOverlay();data=defaults();data.onboardingDone=data.tutorialSeen=true;normalizeProgression();normalizeZone();resetRun();game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=true;game.phase=1;game.phaseTarget=1e9;game.enemies=[];game.player.hp=game.player.maxHp=1000;game.player.invuln=1e9;game.attackTimer=1e9;game.keys={};setScene('combat',false);hideOverlay();}
 function state(){return {points:masteryFor().points,earned:masteryFor().earned,unlocked:masteryUnlocked(),early:data.earlyMasteryClaimed,level:dungeonProgress().level,drops:(game.healthDrops||[]).map(mote=>({...mote})),hp:game.player.hp,maxHp:game.player.maxHp};}
 window.__restorationTest={fresh,state,frontier(zone){data.cleared=zoneStart(zone-1)-1;data.floor=data.cleared+1;normalizeProgression();normalizeZone();refreshUI();return state();},
  xp(){gainXp(6400);refreshUI();return state();},
  boss(floor,index,elite=false){data.floor=floor;normalizeZone();resetRun();hideOverlay();game.scene='combat';game.status='running';game.menuPaused=true;game.phase=index*2+1;game.phaseTarget=1e9;game.attackTimer=1e9;const enemy=spawnEnemy(!elite,index);enemy.boss=!elite;enemy.elite=elite;enemy.bossIndex=index;enemy.hp=1;enemy.name='Guardian';onKill(enemy);refreshUI();return state();},
  ordinary(){fresh();const random=Math.random;try{for(let i=0;i<100;i++){Math.random=()=>(i+.5)/100;const enemy=spawnEnemy();enemy.x=100+i;enemy.y=0;onKill(enemy);}}finally{Math.random=random;}return state();},
  elite(){fresh();const enemy=spawnEnemy();enemy.elite=true;enemy.x=game.player.x;enemy.y=game.player.y;const random=Math.random;Math.random=()=>0;try{onKill(enemy);}finally{Math.random=random;}return state();},
  collect(hp){game.player.hp=hp;for(const mote of game.healthDrops){mote.x=game.player.x;mote.y=game.player.y;}tickHealthDrops(.02);return state();},
  preserve(){const before=game.healthDrops.length;tickCombat(120);const afterTime=game.healthDrops.length;nextPhase();const afterWave=game.healthDrops.length;setScene('mine',false);const afterSkill=game.healthDrops.length;setScene('combat',false);return {before,afterTime,afterWave,afterSkill,afterReturn:game.healthDrops.length};},
  retry(){resetRun();return state();},
  legacy(){fresh();data.cleared=7;data.masteryRewardVersion=0;data.timeProgressionVersion=0;data.zoneShopVersion=1;data.dungeonMastery={points:37,earned:41,onslaught:1,fortune:1,adaptation:0,intensity:0};normalizeProgression();save();return state();},
  save(){save();}
 };
}
(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 try{
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+restorationFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));await p.evaluate(()=>__restorationTest.fresh());
  let state=await p.evaluate(()=>__restorationTest.xp());assert.equal(state.level,0);assert.equal(state.points,0);assert.equal(state.unlocked,false);assert.equal(await p.locator('#speedControl').isVisible(),false);
  for(const index of [0,1,2]){state=await p.evaluate(index=>__restorationTest.boss(1,index),index);assert.equal(state.points,0);assert.equal(state.unlocked,false);}
  state=await p.evaluate(()=>__restorationTest.frontier(2));assert.equal(state.points,1);assert.equal(state.level,1);assert.equal(state.unlocked,true);assert.equal(await p.locator('#speedControl').isVisible(),true);
  for(const [zone,points] of [[2,1],[4,1],[5,2],[10,3]]){state=await p.evaluate(zone=>__restorationTest.frontier(zone),zone);assert.equal(state.points,points);}
  await p.evaluate(()=>__restorationTest.save());await p.reload();state=await p.evaluate(()=>__restorationTest.state());assert.equal(state.points,3);state=await p.evaluate(()=>__restorationTest.boss(1,2));assert.equal(state.points,3);
  const legacy=await p.evaluate(()=>__restorationTest.legacy());assert.equal(legacy.points,38);assert.equal(legacy.earned,46);assert.equal(legacy.early,true);assert.equal((await p.evaluate(()=>__restorationTest.xp())).points,38);
  passed.push('Guardians and XP grant no early points; first point comes at Zone 2, then Zone 5 and 10; migration and reload retain prior balances and award milestones only once');
  state=await p.evaluate(()=>__restorationTest.ordinary());assert.equal(state.drops.length,2);assert.ok(state.drops.every(mote=>mote.fraction===.03&&!mote.elite));state=await p.evaluate(()=>__restorationTest.elite());assert.equal(state.drops.length,1);assert.equal(state.drops[0].fraction,.12);assert.equal(state.points,0);
  assert.equal((await p.evaluate(()=>__restorationTest.collect(1000))).drops.length,1,'Full health cannot waste a mote');const preserved=await p.evaluate(()=>__restorationTest.preserve());assert.deepEqual(preserved,{before:1,afterTime:1,afterWave:1,afterSkill:1,afterReturn:1});state=await p.evaluate(()=>__restorationTest.collect(100));assert.equal(state.hp,220);assert.equal(state.drops.length,0);
  await p.evaluate(()=>__restorationTest.elite());state=await p.evaluate(()=>__restorationTest.collect(990));assert.equal(state.hp,1000);assert.equal(state.drops.length,0);await p.evaluate(()=>__restorationTest.elite());state=await p.evaluate(()=>__restorationTest.retry());assert.equal(state.drops.length,0);
  passed.push('Ordinary monsters drop 3% heals on 2% of deterministic trials; elites have a reduced 55% chance of 12% heals; motes wait at full health, persist through waves/skilling/time, clamp healing and clear on retry');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
