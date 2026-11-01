const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
// This driver exists only in the isolated HTTP test response.
function instrumentation(){
  function fresh(floor=1){
    data=defaults();data.floor=floor;data.cleared=floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;
    normalizeProgression();normalizeZone();ensureJobs();seedCodex();resetRun();drawerKind='';$('app').classList.remove('drawer-open');hideOverlay();game.scene='combat';game.status='running';game.menuPaused=game.manualPaused=false;game.keys={};game.holdSkill=null;game.lastActiveAt={};game.devSpeed=1;game.lastJobsAt=Date.now();game.activeClockMs=0;game.attackTimer=1e6;game.transition=0;game.phase=1;game.enemies=[];game.boss=null;setScene('combat',false);
  }
  window.__dungeonTest={
    fresh,ready(){game.status='ready';},
    trial(speed,skill){
      fresh();game.devSpeed=speed;
      if(skill){game.scene=skill;game.menuPaused=true;game.holdSkill=skill;}
      for(let i=0;i<500;i++)update(.02);
      game.holdSkill=null;const out={ore:data.ore,clock:game.activeClockMs,combat:game.runSeconds};game.manualPaused=game.menuPaused=true;return out;
    },
    boss(theme,stage,index){
      fresh(theme*3+stage);game.phase=index*2;nextPhase();const boss=game.boss;
      boss.x=boss.y=0;game.player.x=0;game.player.y=170;game.player.hp=game.player.maxHp=500;game.player.invuln=1e8;return bossPlan(boss);
    },
    projectiles(theme){this.boss(theme,1,0);beginBossCast(game.boss);tickBossSpecial(game.boss,1.2);return game.hostileShots.map(s=>({biome:s.biome,damage:s.damage}));},
    cycle(seconds){for(let time=0;time<seconds;time+=.04)tickCombat(Math.min(.04,seconds-time));return {used:[...game.boss.mechanicsUsed],shots:game.hostileShots.map(s=>({biome:s.biome,damage:s.damage})),hazards:(game.hazards||[]).map(h=>h.type)};},
    warning(type,avoid){
      fresh(3);const boss=spawnEnemy(true,2);boss.x=boss.y=0;boss.hp=boss.maxHp=10000;game.boss=boss;game.player.hp=game.player.maxHp=500;game.player.invuln=0;game.player.x=0;game.player.y=170;
      boss.mechanicIndex=type==='ground'?1:2;beginBossCast(boss);const before=game.player.hp;
      tickBossSpecial(boss,boss.cast.total-.05);tickDungeonHazards(.01);const during=game.player.hp;
      if(avoid)game.player.x=1000;tickBossSpecial(boss,.06);tickDungeonHazards(.04);return {before,during,after:game.player.hp,cast:boss.cast,hazards:game.hazards.length};
    },
    elites(){
      fresh();game.phase=0;game.phaseTarget=24;game.eliteAt=7;game.phaseSpawned=7;
      const unseen=!!spawnEnemy().elite;game.phase=0;nextPhase();const seen=[...data.seenElites[0]];
      game.phase=2;game.phaseTarget=40;game.phaseSpawned=20;game.phaseKills=0;game.eliteAt=7;game.waveEliteSpawned=false;game.enemies=[];game.boss=null;
      const elite=spawnEnemy(),second=spawnEnemy(),before={points:masteryFor().points,essence:data.essence};onKill(elite);
      return {unseen,seen,index:elite.bossIndex,elite:!!elite.elite,boss:!!elite.boss,second:!!second.elite,before,after:{points:masteryFor().points,essence:data.essence},kills:game.phaseKills};
    },
    rewards(){fresh();game.upgrades={wisdom:1,forage:1};const boss=spawnEnemy(true,0);boss.name='Reward check';game.boss=boss;onKill(boss);return {gold:data.gold,xp:23+56+game.runXp,level:game.runLevel};},
    capped(){fresh();game.upgrades={...UPGRADE_CAPS};game.pendingLevels=200;game.status='upgrade';showUpgrade();return {gold:data.gold,pending:game.pendingLevels,status:game.status};},
    burn(){
      fresh();game.upgrades.fire=1;const enemy=spawnEnemy();enemy.x=0;enemy.y=40;enemy.hp=enemy.maxHp=500;
      const random=Math.random;Math.random=()=>.99;
      try{dealDamage(enemy,10,0,0);tickBurn(enemy,.6);const first={hp:enemy.hp,rate:enemy.burnDps,floaters:game.floaters.map(f=>f.text)};
        game.pendingLevels=1;game.status='upgrade';game.levelChoices=[UPGRADES.find(u=>u.id==='fire')];selectUpgrade(0);const before=enemy.hp;tickBurn(enemy,.6);
        return {first,second:{damage:before-enemy.hp,rate:enemy.burnDps,rank:game.upgrades.fire,floaters:game.floaters.map(f=>f.text)}};
      }finally{Math.random=random;game.manualPaused=game.menuPaused=true;}
    },
    fireChoices(){
      fresh();game.upgrades=Object.fromEntries(Object.entries(UPGRADE_CAPS).map(([id,n])=>[id,n]));game.upgrades.fire=1;game.upgrades.might=game.upgrades.regen=0;game.pendingLevels=1;game.status='upgrade';showUpgrade();
    },
    bestEarlyDps(id){
      fresh();data.weaponType=id;projectCombatStyle();let best=0,build={};
      for(let might=0;might<=6;might++)for(let haste=0;haste<=6;haste++)for(let crit=0;crit<=5;crit++)for(let multishot=0;multishot<=4;multishot++){
        if(might+haste+crit+multishot>8||!['bow','staff'].includes(id)&&multishot)continue;
        game.upgrades={might,haste,crit,multishot};const dps=weaponDps(id,{run:true});if(dps>best){best=dps;build={...game.upgrades};}
      }
      return {weapon:id,dps:best,target:zoneBalance().dps,build};
    },
    viewCodex(){data.discovered=Object.fromEntries(CODEX_ITEMS.map(c=>[c.id,1]));showCodex();},
    plain(){fresh();refreshUI();}
  };
}
(async()=>{
  const runtime=await createRuntime(),{browser,baseURL,resultsDir}=runtime,errors=[],passed=[];
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  async function page(patch={},options={viewport:{width:1440,height:1000}}){
    const p=await browser.newPage(options);p.on('pageerror',e=>errors.push(e.message));await p.route(baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));
    if(Object.keys(patch).length)await p.addInitScript(patch=>{if(!sessionStorage.getItem('dungeon-fixture')){localStorage.setItem('deepwell-prototype-v1',JSON.stringify({...patch,savedAt:Date.now()}));sessionStorage.setItem('dungeon-fixture','1');}},patch);
    await p.goto(baseURL);return p;
  }
  try{
    const p=await page({essence:1234,mastery:{0:{points:7,earned:7,onslaught:0,fortune:0,adaptation:0,intensity:0}},onboardingDone:true,tutorialSeen:true});
    await p.click('#introSkills');assert.equal(await p.locator('#quickEssence').innerText(),'7');assert.match(await p.locator('#hudEssence').getAttribute('aria-label'),/Dungeoneering Mastery/);
    await p.click('#hudEssence');assert.match(await p.locator('.mastery-head h2').innerText(),/Dungeoneering Mastery/);await p.click('[data-invest="onslaught"]');await p.click('#applyMastery');await p.click('#masteryDecisionConfirm');
    assert.equal(await p.locator('#quickEssence').innerText(),'6');assert.equal(await p.evaluate(()=>__deepwell.getState().data.essence),1234);
    passed.push('Dungeoneering Mastery is named consistently; HUD shows spendable dungeon points, and spending leaves Essence unchanged');
    const trials=await p.evaluate(()=>({normal:__dungeonTest.trial(1,'mine'),mastery:__dungeonTest.trial(2,'mine'),code:__dungeonTest.trial(500,'mine'),combat:__dungeonTest.trial(2)}));
    assert.equal(trials.normal.ore,trials.mastery.ore);assert.equal(trials.normal.ore,trials.code.ore);assert.ok(Math.abs(trials.normal.clock-10000)<.1);assert.ok(Math.abs(trials.code.clock-10000)<.1);assert.ok(Math.abs(trials.combat.combat-20)<.01);
    passed.push('1×, 2× and 500× Delve speed give identical active skilling progress; combat alone advances faster');
    const bossResults=[];
    for(let theme=0;theme<4;theme++){
      const floorPlan=await p.evaluate(theme=>__dungeonTest.boss(theme,1,2),theme);assert.deepEqual(floorPlan,['volley','ground']);
      const plan=await p.evaluate(theme=>__dungeonTest.boss(theme,3,2),theme);assert.deepEqual(plan,['volley','ground','beam']);
      const result=await p.evaluate(()=>__dungeonTest.cycle(17));assert.deepEqual(result.used,['volley','ground','beam']);assert.ok(result.shots.every(s=>s.biome===theme&&s.damage>0));const shots=await p.evaluate(theme=>__dungeonTest.projectiles(theme),theme);assert.ok(shots.length>=8);assert.ok(shots.every(s=>s.biome===theme&&s.damage>0));bossResults.push({theme,used:result.used,projectiles:shots.length});
      await p.screenshot({path:path.join(resultsDir,'dungeon-boss-'+theme+'.png')});
    }
    for(const type of ['ground','beam']){
      const hit=await p.evaluate(type=>__dungeonTest.warning(type,false),type),avoid=await p.evaluate(type=>__dungeonTest.warning(type,true),type);
      assert.equal(hit.before,hit.during,'Warnings cannot deal damage');assert.ok(hit.after<hit.before);assert.equal(avoid.after,avoid.before,'Leaving the locked telegraph avoids the attack');
    }
    const elites=await p.evaluate(()=>__dungeonTest.elites());assert.equal(elites.unseen,false);assert.deepEqual(elites.seen,[true,false,false]);assert.equal(elites.elite,true);assert.equal(elites.boss,false);assert.equal(elites.index,0);assert.equal(elites.second,false);assert.deepEqual(elites.after,elites.before);assert.equal(elites.kills,1);
    passed.push('All four areas use themed attacks; floor overlords have two mechanics, zone overlords three; telegraphs precede damage and can be dodged');
    passed.push('Elite echoes appear only after a known boss has appeared, stay capped at one per wave, count toward the wave and grant no duplicate Mastery');
    const burn=await p.evaluate(()=>__dungeonTest.burn());assert.equal(burn.first.rate,1);assert.equal(burn.second.rank,2);assert.equal(burn.second.rate,2);assert.ok(Math.abs(burn.second.damage-1.2)<1e-6);assert.ok(burn.second.floaters.some(t=>/Burn/.test(t)));
    await p.evaluate(()=>__dungeonTest.fireChoices());assert.equal(await p.locator('.choice-number').count(),0);const fire=p.locator('[data-pick="1"]');assert.match(await fire.innerText(),/Rank 2/);assert.match(await fire.locator('.power-before').innerText(),/10%/);assert.match(await fire.locator('.power-after').innerText(),/20%/);await p.screenshot({path:path.join(resultsDir,'dungeon-power-ranks.png')});await p.keyboard.press('2');assert.equal(await p.evaluate(()=>__deepwell.getState().upgrades.fire),2);
    passed.push('Burn deals visible tick damage, doubles its per-second damage on rank two, and buff cards show exact current/next effects while number shortcuts still work');
    const rewards=await p.evaluate(()=>__dungeonTest.rewards());assert.equal(rewards.gold,69);assert.equal(rewards.level,3);assert.ok(Math.abs(rewards.xp-112.7)<1e-6);const capped=await p.evaluate(()=>__dungeonTest.capped());assert.deepEqual(capped,{gold:3045,pending:0,status:'running'});passed.push('XP and gold powers also apply to guardian rewards; capped legacy choices convert safely without recursion');
    const early=[];for(const id of ['sword','shield','polearm','greatsword','bow','staff']){const result=await p.evaluate(id=>__dungeonTest.bestEarlyDps(id),id);assert.ok(result.dps<result.target,'Eight offensive picks alone should not reach ideal DPS: '+id);early.push(result);}
    passed.push('Even optimal early offensive picks stay below Zone 1’s ideal DPS without permanent training');
    await p.evaluate(()=>__dungeonTest.plain());await p.keyboard.down('d');await p.keyboard.up('d');assert.equal((await p.evaluate(()=>__deepwell.getState())).dashCooldown,0);await p.waitForTimeout(80);await p.keyboard.down('d');await p.keyboard.up('d');assert.ok((await p.evaluate(()=>__deepwell.getState())).dashCooldown>2.7);
    await p.evaluate(()=>{__dungeonTest.plain();__deepwell.toggleManualPause();});await p.keyboard.press('a');await p.waitForTimeout(70);await p.keyboard.press('a');assert.equal((await p.evaluate(()=>__deepwell.getState())).dashCooldown,0);
    const touch=await page({}, {viewport:{width:390,height:844},hasTouch:true,isMobile:true});await touch.evaluate(()=>__dungeonTest.plain());const joystick=await touch.locator('#joystickZone').boundingBox(),cdp=await touch.context().newCDPSession(touch);const point={x:joystick.x+joystick.width*.76,y:joystick.y+joystick.height*.5};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(80);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await touch.evaluate(()=>__deepwell.getState())).dashCooldown>2.7);await touch.close();
    passed.push('Keyboard and real touch double-taps dash in the movement direction; a single tap and paused input do not dash');
    await p.close();
    const gear=await page({gold:10000,bars:2000,silverBars:500,logs:2000,cloth:3000,scraps:2000,cutOpals:100,onboardingDone:true,tutorialSeen:true,unlockedWeapons:['sword','bow','staff']});
    await gear.click('#introSkills');assert.equal(await gear.evaluate(()=>__deepwell.makeArmor('magic_4')),false,'Future armor tiers are unavailable');
    const before=await gear.evaluate(()=>__deepwell.getState().data);assert.equal(await gear.evaluate(()=>__deepwell.makeArmor('magic_1')),true);const after=await gear.evaluate(()=>__deepwell.getState().data);
    assert.deepEqual([before.bars-after.bars,before.cloth-after.cloth,before.scraps-after.scraps,before.gold-after.gold],[2,18,4,40]);assert.equal(after.weaponType,'sword');assert.equal(after.equippedArmor,'magic_1');assert.equal(await gear.evaluate(()=>__deepwell.avatarAppearance().chest),'robes');
    await gear.click('#quickGear');await gear.click('[data-weapon="bow"]');assert.equal(await gear.evaluate(()=>__deepwell.getState().data.equippedArmor),'magic_1');assert.equal(await gear.evaluate(()=>__deepwell.avatarAppearance().chest),'robes');await gear.click('#drawerClose');
    assert.equal(await gear.evaluate(()=>__deepwell.makeArmor('ranged_1')),true);await gear.evaluate(()=>__deepwell.equipArmor('magic_1'));await gear.evaluate(()=>__deepwell.save());await gear.reload();assert.equal(await gear.evaluate(()=>__deepwell.getState().data.equippedArmor),'magic_1');assert.equal(await gear.evaluate(()=>__deepwell.getState().weaponType),'bow');
    passed.push('Actual armor sets enforce materials and skill levels, equip independently of weapons, preserve appearance across styles and survive reload');
    await gear.click('#introSkills');await gear.setViewportSize({width:320,height:844});await gear.click('#quickSkills');for(const group of ['blacksmithing','woodworking','warding']){await gear.click('[data-workshop-group="'+group+'"]');await gear.click('[data-workshop-view="equipment"]');assert.equal(await gear.locator('.armor-set-card').count(),2);assert.ok(await gear.locator('.armor-set-card').evaluateAll(cards=>cards.every(c=>c.getBoundingClientRect().right<=innerWidth+1)));}
    await gear.click('#drawerClose');await gear.evaluate(()=>__dungeonTest.viewCodex());const images=gear.locator('.codex-icon img');await images.evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));const audit=await images.evaluateAll(imgs=>imgs.map(i=>i.src));assert.equal(new Set(audit).size,audit.length);assert.ok(audit.length>=91);
    passed.push('Six set recipes fit narrow screens; every discovered Codex entry has a distinct loaded icon');
    await gear.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,trials,bossResults,early,errors},null,2));
  }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1);});
