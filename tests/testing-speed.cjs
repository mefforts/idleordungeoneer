const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
const {testingCodes,withTestingCodes}=require('./code-fixture.cjs');
// Clock control and fixtures exist only in this test's HTTP response.
function instrumentation(){
 function fresh(floor=1){
  if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=floor;data.cleared=floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.status='ready';game.menuPaused=game.manualPaused=true;game.devSpeed=1;game.skillSpeed=1;game.activeClockMs=0;game.holdAccum=0;game.activeHits=0;game.lastActiveAt={};game.holdSkill=null;game.keys={};game.lastJobsAt=Date.now();setScene('mine',false);clearSkillBonuses();refreshUI();
 }
 function runClock(seconds,dt=.02){const original=Date.now;let now=original();game.lastJobsAt=now;Date.now=()=>now;try{for(let elapsed=0;elapsed<seconds-1e-9;elapsed+=dt){const step=Math.min(dt,seconds-elapsed);now+=step*1000;update(step);}}finally{Date.now=original;game.lastJobsAt=original();}}
 window.__testingSpeed={fresh,
  active(speed,testing,key='mine',ore=100000,dt=.02,combatSpeed=2){
   fresh();data.devSpeedUnlocked=testing;game.skillSpeed=speed;game.devSpeed=combatSpeed;data.ore=key==='forge'?ore:0;setScene(key,false);game.holdSkill=key;const bonusBefore=bonusState().clock;activeSkill(key);runClock(10,dt);game.holdSkill=null;
   return {ore:data.ore,bars:data.bars,hits:game.activeHits,interval:skillInterval(key),clock:game.activeClockMs,bonusClock:bonusState().clock-bonusBefore};
  },
  idle(speed,testing,chain=false,scene='mine'){
   fresh(chain?28:2);data.devSpeedUnlocked=testing;game.skillSpeed=speed;game.devSpeed=2;data.idleJobs=chain?['mine','forge']:['mine'];ensureJobs();setScene(scene,false);game.status='ready';game.menuPaused=true;runClock(10);
   return {ore:data.ore,bars:data.bars,timers:{...data.jobTimers},clock:game.activeClockMs};
  },
  offlineSave(){fresh(2);data.devSpeedUnlocked=true;game.skillSpeed=500;game.devSpeed=2;data.idleJobs=['mine'];data.jobTimers.mine=3;ensureJobs();return JSON.parse(JSON.stringify(data));},
  mastery(){fresh();const m=masteryFor();m.points=m.earned=1;game.devSpeed=2;refreshUI();},
  selected(){return {speed:selectedSceneSpeed(),combatSpeed:game.devSpeed,skillSpeed:game.skillSpeed||1,unlocked:data.devSpeedUnlocked,clock:game.activeClockMs,ore:data.ore};}
 };
}
(async()=>{
 const runtime=await createRuntime(),{browser,baseURL,resultsDir}=runtime,errors=[],passed=[],active=[];
 const html=withTestingCodes(fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8')).replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));await p.route(baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 try{
  await p.goto(baseURL);await p.evaluate(()=>__testingSpeed.fresh());assert.equal(await p.locator('#speedControl').isVisible(),true);
  await p.click('#quickSettings');await p.click('#settingsCodes');await p.fill('#codeInput',testingCodes.speed);await p.click('#codeRedeem');assert.match(await p.locator('#codeFeedback').innerText(),/Delve & skilling speeds unlocked/);await p.click('#drawerClose');
  assert.equal(await p.locator('#speedControl').isVisible(),true);await p.click('#speedToggle');assert.equal(await p.locator('#speedOptions [data-speed="500"]').isVisible(),true);await p.click('#speedOptions [data-speed="25"]');assert.equal((await p.evaluate(()=>__testingSpeed.selected())).speed,25);assert.match(await p.locator('#speedToggle').getAttribute('aria-label'),/Skilling speed 25/);
  await p.evaluate(()=>__deepwell.changeScene('combat',false));await p.click('#speedToggle');await p.click('#speedOptions [data-speed="2"]');assert.deepEqual(await p.evaluate(()=>{const s=__testingSpeed.selected();return [s.combatSpeed,s.skillSpeed];}),[2,25]);await p.evaluate(()=>__deepwell.enterActivity('forge'));assert.equal(await p.locator('#speedControl').isVisible(),true);assert.equal((await p.evaluate(()=>__testingSpeed.selected())).speed,25);await p.screenshot({path:path.join(resultsDir,'testing-skilling-speed.png')});
  passed.push('A testing redemption exposes the 1×–500× Skilling speed control in gathering and crafting scenes');
  for(const speed of [1,2,5,10,25,50,100,500]){
   const result=await p.evaluate(speed=>__testingSpeed.active(speed,true),speed),expected=1+Math.floor(10*speed/result.interval+1e-9);assert.equal(result.hits,expected,'All gathering cycles complete at '+speed+'×');assert.equal(result.ore,expected*2);assert.ok(Math.abs(result.clock-10000*speed)<.01);assert.ok(Math.abs(result.bonusClock-10)<1e-6);active.push({speed,cycles:result.hits});
  }
  const forge=await p.evaluate(()=>__testingSpeed.active(500,true,'forge'));assert.equal(forge.hits,1+Math.floor(5000/forge.interval));assert.equal(forge.bars,forge.hits);assert.equal(forge.ore,100000-forge.bars*2);assert.ok(forge.hits>1000,'Fast crafting cannot be capped at one cycle per frame');
  const short=await p.evaluate(()=>__testingSpeed.active(500,true,'forge',3));assert.deepEqual([short.ore,short.bars,short.hits],[1,1,1]);
  for(const dt of [.04,1/60]){const otherFrames=await p.evaluate(dt=>__testingSpeed.active(500,true,'mine',100000,dt),dt);assert.equal(otherFrames.hits,active.at(-1).cycles,'Frame size must not change fast work yield');}
  passed.push('Every testing speed processes all active work cycles; 500× crafting consumes exact ingredients, stops on shortage and is independent of frame size; bonus collection remains readable');
  const normal=await p.evaluate(()=>__testingSpeed.active(1,false)),mastery=await p.evaluate(()=>__testingSpeed.active(2,false));assert.equal(normal.ore,mastery.ore);assert.equal(normal.clock,mastery.clock);const codeAtOne=await p.evaluate(()=>__testingSpeed.active(1,true));assert.equal(codeAtOne.ore,normal.ore);assert.equal(codeAtOne.clock,normal.clock);for(const combatSpeed of [1,2,500]){const independent=await p.evaluate(combatSpeed=>__testingSpeed.active(1,true,'mine',100000,.02,combatSpeed),combatSpeed);assert.equal(independent.ore,normal.ore);assert.equal(independent.clock,normal.clock);}
  const idle=[];for(const speed of [1,2,25,500]){const r=await p.evaluate(speed=>__testingSpeed.idle(speed,true),speed);assert.equal(r.ore,Math.floor(10*speed/9.6)*2);idle.push({speed,ore:r.ore});}
  const chain=await p.evaluate(()=>__testingSpeed.idle(25,true,true));assert.deepEqual([chain.ore,chain.bars],[8,22]);
  const delveIdle=await p.evaluate(()=>__testingSpeed.idle(25,true,true,'combat'));assert.deepEqual([delveIdle.ore,delveIdle.bars],[8,22]);
  const regularIdle=await p.evaluate(()=>__testingSpeed.idle(2,false));assert.equal(regularIdle.ore,2);
  passed.push('Testing speed advances online idle work and linked mine/smelt production in Skills and combat; Mastery speed leaves active and idle skilling unchanged, including when testing is unlocked');
  const oldSave=await p.evaluate(()=>__testingSpeed.offlineSave());await p.addInitScript(seed=>{const now=Date.now();Date.now=()=>now;localStorage.setItem('deepwell-prototype-v1',JSON.stringify({...seed,savedAt:now-14000}));},oldSave);await p.reload();const restored=await p.evaluate(()=>__testingSpeed.selected());assert.equal(restored.speed,1);assert.equal(restored.unlocked,true);assert.equal(restored.ore,2);await p.click('#introSkills');assert.equal(await p.locator('#speedControl').isVisible(),true);
  passed.push('An existing speed-unlocked save needs no new code; selected speed resets to 1× at launch and offline earnings use real elapsed time');
  await p.evaluate(()=>__testingSpeed.mastery());assert.equal(await p.locator('#speedControl').isVisible(),true);await p.evaluate(()=>__deepwell.start());assert.equal(await p.locator('#speedControl').isVisible(),true);assert.match(await p.locator('#speedToggle').getAttribute('aria-label'),/Delve speed/);
  await p.click('#quickSettings');await p.click('#settingsCodes');await p.fill('#codeInput',testingCodes.sandbox);await p.click('#codeRedeem');await p.click('#drawerClose');await p.evaluate(()=>__deepwell.enterActivity('mine'));assert.equal(await p.locator('#speedControl').isVisible(),true);assert.match(await p.locator('#speedToggle').getAttribute('aria-label'),/Skilling speed/);
  for(const viewport of [{width:320,height:844},{width:844,height:390}]){await p.setViewportSize(viewport);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);const b=await p.locator('#speedToggle').boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1);}
  passed.push('An unspent point links to both game-time paths; sandbox testing controls remain independent and fit narrow/landscape screens');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,active,idle,errors},null,2));
 }finally{await p.close();await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
