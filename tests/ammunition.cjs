const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRuntime}=require('./runtime.cjs');
function ammunitionFixture(){
 window.__ammunitionTest={
  fresh(weapon='bow',reserve=3){
   resetArenaTouch();closeDrawer();hideOverlay();data=defaults();data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;data.unlockedWeapons=['sword','bow','staff'];data.weaponType=weapon;data.arrows=data.runes=reserve;normalizeProgression();normalizeZone();ensureJobs();resetRun();game.status='running';game.scene='combat';game.manualPaused=game.menuPaused=false;game.keys={};game.enemies=[];game.phase=1;game.phaseTarget=1e9;game.transition=0;game.attackTimer=0;game.player.invuln=1e9;game.devSpeed=game.skillSpeed=1;game.holdSkill=null;game.lastJobsAt=Date.now();
   const enemy=spawnEnemy();enemy.x=0;enemy.y=80;enemy.speed=0;enemy.hp=enemy.maxHp=1e9;enemy.contact=1e9;setScene('combat',false);game.manualPaused=game.menuPaused=true;refreshUI();
  },
  fire(){const result=attack();game.attackTimer=attackCooldown();return result;},
  ticks(seconds){for(let left=seconds;left>1e-9;left-=.02)tickCombat(Math.min(.02,left));refreshUI();},
  update(seconds,reason='combat',speed=1){game.manualPaused=reason==='pause';game.menuPaused=reason==='menu'||reason==='pause';game.devSpeed=1;masteryFor().delveSpeed=(speed-1)*4;masteryFor().earned=masterySpent(masteryFor());data.timeRates.delve=speed;if(reason==='skill')setScene('mine',false);if(reason==='waiting')for(const enemy of game.enemies){enemy.x=2000;enemy.speed=0;}for(let left=seconds;left>1e-9;left-=.02)update(Math.min(.02,left));game.manualPaused=game.menuPaused=true;refreshUI();},
  switch(weapon){data.weaponType=weapon;projectCombatStyle();refreshUI();},
  state(){return {charges:{...data.ammoCharges},arrows:data.arrows,runes:data.runes,shots:game.shots.length,damage:attackDamage(),cooldown:attackCooldown()};},
  save(){save();}
 };
}
(async()=>{
 const runtime=await createRuntime(),errors=[],passed=[];
 try{
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+ammunitionFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
  for(const [weapon,key]of [['bow','arrows'],['staff','runes']]){
   await p.evaluate(weapon=>__ammunitionTest.fresh(weapon),weapon);const before=await p.evaluate(()=>__ammunitionTest.state());for(let i=0;i<8;i++)assert.equal(await p.evaluate(()=>__ammunitionTest.fire()),true);let state=await p.evaluate(()=>__ammunitionTest.state());assert.equal(state[key],2);assert.equal(state.charges[key],10,'Multiple shots consume no additional item');assert.equal(state.damage,before.damage);assert.equal(state.cooldown,before.cooldown);
   await p.evaluate(()=>__ammunitionTest.ticks(7.25));state=await p.evaluate(()=>__ammunitionTest.state());assert.ok(Math.abs(state.charges[key]-2.75)<1e-7);assert.equal(state[key],2);await p.evaluate(()=>__ammunitionTest.ticks(4));state=await p.evaluate(()=>__ammunitionTest.state());assert.equal(state[key],1);assert.ok(state.charges[key]>8&&state.charges[key]<10);
   await p.evaluate(weapon=>{__ammunitionTest.fresh(weapon,1);__ammunitionTest.fire();__ammunitionTest.ticks(12);},weapon);state=await p.evaluate(()=>__ammunitionTest.state());assert.equal(state[key],0);assert.equal(state.charges[key],0);assert.equal(await p.evaluate(()=>__ammunitionTest.fire()),false);
  }
  passed.push('Each arrow and rune loads exactly ten seconds; repeated shots preserve the item count and damage/cadence, expiry loads the next item once, and an empty reserve eventually stops firing');
  for(const reason of ['pause','menu','skill','waiting']){await p.evaluate(()=>{__ammunitionTest.fresh();__ammunitionTest.fire();});await p.evaluate(reason=>__ammunitionTest.update(3,reason),reason);assert.equal((await p.evaluate(()=>__ammunitionTest.state())).charges.arrows,10,reason+' cannot drain ammunition');}
  await p.evaluate(()=>{__ammunitionTest.fresh();__ammunitionTest.fire();__ammunitionTest.update(2,'combat',2);});assert.ok(Math.abs((await p.evaluate(()=>__ammunitionTest.state())).charges.arrows-6)<1e-7,'Delve speed scales combat firing time');
  await p.evaluate(()=>{__ammunitionTest.fresh();__ammunitionTest.fire();__ammunitionTest.ticks(2.5);__ammunitionTest.switch('staff');__ammunitionTest.fire();__ammunitionTest.ticks(3);__ammunitionTest.save();});const saved=await p.evaluate(()=>__ammunitionTest.state());assert.ok(Math.abs(saved.charges.arrows-7.5)<1e-7);assert.ok(Math.abs(saved.charges.runes-7)<1e-7);await p.reload();const restored=await p.evaluate(()=>__ammunitionTest.state());assert.deepEqual(restored.charges,saved.charges);assert.equal(restored.arrows,saved.arrows);assert.equal(restored.runes,saved.runes);
  passed.push('Waiting, menus, pause, skilling and the other weapon preserve loaded time; Delve speed uses the combat clock and both independent charges survive save/reload');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
