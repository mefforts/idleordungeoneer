const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
const {testingCodes,withTestingCodes}=require('./code-fixture.cjs');

// Injected only into this test response; the downloadable game has no fixture,
// immortal player, instant clock, or means of granting itself experience.
const {arenaFixture:instrumentation}=require('./arena-fixture.cjs');
const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
(async()=>{
  const runtime=await createRuntime(),{browser,baseURL,resultsDir}=runtime,errors=[],results=[];
  const html=withTestingCodes(fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8'));
  const testHtml=html.replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  async function page(options={}){
    const p=await browser.newPage(options);p.on('pageerror',e=>errors.push(e.message));
    await p.route(baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:testHtml}));
    await p.goto(baseURL);return p;
  }
  try{
    const p=await page({viewport:{width:1440,height:1000}});
    await p.click('#introSkills');await p.click('#quickSettings');
    await p.click('[data-hud-side="left"]');await p.locator('.pin-order-details summary').click();
    await p.click('[data-pin-move="skills"][data-direction="-1"]');
    let order=await p.evaluate(()=>__deepwell.getState().data.hudLayout);
    assert.equal(order.side,'left');assert.ok(order.order.indexOf('skills')<order.order.indexOf('gear'));
    assert.equal(await p.locator('[data-pin-move="skills"][data-direction="-1"]').evaluate(el=>document.activeElement===el),true,'Keyboard focus survives reordering');
    await p.locator('[data-order-pin="gear"]').dragTo(p.locator('[data-order-pin="delve"]'));
    order=await p.evaluate(()=>__deepwell.getState().data.hudLayout);assert.equal(order.order[0],'gear');
    await p.click('#drawerClose');await p.reload();assert.deepEqual(await p.evaluate(()=>__deepwell.getState().data.hudLayout),order);
    await p.click('#introSkills');
    for(const size of [{width:320,height:844},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
      await p.setViewportSize(size);
      for(const side of ['left','right']){
        await p.click('#quickSettings');await p.click('[data-hud-side="'+side+'"]');await p.click('#drawerClose');
        const geometry=await p.evaluate(()=>{
          const box=el=>el.getBoundingClientRect().toJSON();
          return {rail:box(document.querySelector('.hud-actions')),work:box(document.getElementById('skillActionBar')),brand:box(document.querySelector('.hud-brand')),resources:box(document.querySelector('.hud-resources')),buttons:[...document.querySelectorAll('.icon-rail>.hud-icon')].filter(el=>el.getClientRects().length).map(box),overflow:document.documentElement.scrollWidth>innerWidth+1};
        });
        assert.equal(geometry.overflow,false);assert.ok(side==='right'?geometry.rail.x>=size.width-65:geometry.rail.x<=20,'Rail is pinned to the selected screen edge');assert.equal(intersects(geometry.rail,geometry.work),false,'Skill controls leave rail clear');
        assert.equal(intersects(geometry.brand,geometry.resources),false,'Resources leave centered title clear');
        assert.ok(geometry.buttons.every(b=>b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1),'Every pin remains in viewport');
        assert.ok(geometry.buttons.every(b=>b.y>=geometry.rail.y-1&&b.y+b.height<=geometry.rail.y+geometry.rail.height+1),'Pins form one contiguous rail');
        const backgrounds=await p.evaluate(()=>['.compact-hud','.hud-actions','#skillActionBar','.meters'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);return {bg:s.backgroundColor,image:s.backgroundImage};}));
        assert.ok(backgrounds.every(b=>b.bg==='rgba(0, 0, 0, 0)'&&b.image==='none'),'No broad gameplay backing plates');
      }
      await p.screenshot({path:path.join(resultsDir,'arena-layout-'+size.width+'.png')});
    }
    results.push('Persisted side selection, pointer/keyboard pin reordering, icon visibility, transparent HUD and clear controls at 320, 390, 844 and 1440 pixels');
    await p.setViewportSize({width:1440,height:1000});
    await p.evaluate(()=>__arenaTest.notify('A message <not markup>','A missed notice remains readable.'));
    assert.equal(await p.locator('.toast strong').last().innerText(),'A message <not markup>');assert.equal(await p.locator('.toast not').count(),0);
    assert.equal(await p.locator('#noticeHistoryButton').count(),0);await p.click('#quickSettings');await p.locator('#recentMessages summary').click();assert.ok(await p.locator('#recentMessages').evaluate(el=>el.open));assert.match(await p.locator('#recentMessages').innerText(),/A missed notice/);
    await p.click('#drawerClose');await p.evaluate(()=>__deepwell.start());await p.evaluate(()=>{__arenaTest.quietCombat();__arenaTest.placeXp([{x:3000,y:3000,value:17,life:.01}]);__arenaTest.tick(32);__deepwell.save();});
    assert.equal(await p.evaluate(()=>__deepwell.xpOrbs().reduce((sum,g)=>sum+g.value,0)),17);
    await p.evaluate(()=>__deepwell.changeScene('mine'));await p.evaluate(()=>__deepwell.changeScene('combat',false));
    assert.equal(await p.evaluate(()=>__deepwell.xpOrbs()[0].value),17);
    await p.evaluate(()=>__arenaTest.death());await p.evaluate(()=>__deepwell.start());assert.equal(await p.evaluate(()=>__deepwell.xpOrbs()[0].value),17);
    await p.evaluate(()=>__deepwell.save());await p.reload();assert.equal(await p.evaluate(()=>__deepwell.xpOrbs()[0].value),17);
    await p.evaluate(()=>__arenaTest.roundTripXp());assert.equal(await p.evaluate(()=>__deepwell.xpOrbs()[0].value),17);
    await p.click('#introDelve');await p.evaluate(()=>{__arenaTest.quietCombat();__arenaTest.placeXp([{x:3000,y:3000,value:89}]);__arenaTest.finish();});
    let bank=await p.evaluate(()=>__arenaTest.bank());assert.equal(bank.gems.length,0);assert.equal(bank.pending,0);assert.equal(bank.xp,89);
    await p.reload();await p.click('#introDelve');bank=await p.evaluate(()=>__arenaTest.bank());assert.equal(bank.pending,0);assert.equal(bank.xp,89);assert.equal(bank.gems.length,0);assert.equal(await p.evaluate(()=>__deepwell.getState().status),'running');
    results.push('XP survives time, activity and Zone travel, death, retry and reload; encounter banking awards every point once without opening power choices');
    await p.evaluate(()=>__arenaTest.firstGuardian());assert.equal(await p.locator('#masteryGotIt').count(),0);assert.equal(await p.locator('[data-pick]').count(),0);assert.equal(await p.locator('#overlay').isHidden(),true);
    results.push('Ordinary guardians leave combat running without a Mastery or power-choice popup');
    await p.click('#quickGear');assert.ok(await p.locator('#combatReadiness').isVisible());
    assert.equal(await p.locator('#combatWeaponSelector .weapon-option').count(),(await p.evaluate(()=>__deepwell.getState().data.unlockedWeapons)).length);assert.equal(await p.locator('#combatReadiness .loadout-stats>span').count(),4);
    const dps=await p.evaluate(()=>Object.keys(__deepwell.getState().data.styles).map(style=>({style,dps:__deepwell.weaponDps(style==='ranged'?'bow':style==='magic'?'staff':'sword')})));assert.ok(dps.every(row=>row.dps>0));
    results.push('Equipment lists owned weapons and current damage, health, attack speed and range; all six weapon profiles report positive DPS');
    const models=await p.evaluate(()=>Array.from({length:15},(_,i)=>__deepwell.zoneBalance(i)));
    assert.deepEqual(models.slice(0,2).map(m=>m.previousTargetSeconds),[600,1200]);assert.ok(models[2].hpScale>=models[1].hpScale*Math.pow(1.14,2)*1.25-1e-8,'Crypt entry health exceeds the Embervault finale');
    assert.ok(models.slice(2,4).every(m=>m.baseForecastSeconds/60>=25&&m.baseForecastSeconds/60<=45&&Math.abs(m.dps-240)<1e-7)&&models.slice(4).every(m=>m.baseForecastSeconds/60>=20&&m.baseForecastSeconds/60<=45&&m.gearTier===3&&Math.abs(m.dps-480)<1e-7));
    assert.ok(models.every(m=>Math.abs(m.forecastSeconds-m.seconds)<m.seconds*.02&&m.forecastSeconds>m.baseForecastSeconds&&(m.index>=5||m.forecastSeconds<=m.baseForecastSeconds*(m.index>=2?10.5:1.75))));
    const simulated=[];
    for(const i of [0,1,2,3,8,14]){
      const sim=await p.evaluate(i=>__arenaTest.simulate(i),i);simulated.push(sim);
      if(i<2)assert.ok(sim.seconds>sim.targetSeconds*.8&&sim.seconds<sim.targetSeconds*1.25,'Task travel and pack spacing remain within 25% of the unchanged health forecast in Zone '+(i+1)+': '+sim.seconds);
      else assert.ok(sim.seconds<sim.targetSeconds*1.25&&sim.seconds>models[i].baseForecastSeconds*2,'Zone '+(i+1)+' keeps a material health jump under percent-health counters: '+sim.seconds+'s; raw-DPS forecast '+sim.targetSeconds+'s');
      assert.equal(sim.kills,models[i].swarmCount+3*models[i].floors+models[i].escortCount);
    }
    fs.writeFileSync(path.join(resultsDir,'zone-pacing.json'),JSON.stringify({version:require('../package.json').version,htmlSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync('index.html')).digest('hex'),models,simulated},null,2));
    results.push('Full live combat simulation, including every spawn, hit, guard, spire and reflection with active counterplay and no shop or timed perks, verifies the first four zones and the long-term plateau');
    await p.close();
    const speed=await page({viewport:{width:390,height:844}});
    await speed.click('#introSkills');assert.equal(await speed.locator('#speedControl').isVisible(),true);
    const seed=await speed.evaluate(()=>{const d=__deepwell.getState().data;d.dungeonMastery={points:0,earned:4,delveSpeed:4,skillingSpeed:0,onslaught:0,fortune:0,adaptation:0,intensity:0};d.timeRates={delve:2,skilling:1};return d;});
    await speed.addInitScript(d=>localStorage.setItem('deepwell-prototype-v1',JSON.stringify({...d,savedAt:Date.now()})),seed);
    await speed.reload();await speed.click('#introSkills');assert.equal(await speed.locator('#speedControl').isVisible(),true);await speed.evaluate(()=>__deepwell.start());assert.ok(await speed.locator('#speedControl').isVisible());
    await speed.click('#speedToggle');assert.ok(await speed.locator('#speedOptions [data-speed="2"]').isVisible());assert.equal(await speed.locator('#speedOptions [data-speed="5"]').isVisible(),false);
    await speed.click('#speedOptions [data-speed="2"]');assert.equal(await speed.evaluate(()=>__deepwell.getState().data.timeRates.delve),2);
    await speed.click('#quickSettings');await speed.click('#settingsCodes');await speed.fill('#codeInput',testingCodes.speed);await speed.click('#codeRedeem');await speed.click('#drawerClose');await speed.click('#speedToggle');await speed.click('#speedOptions [data-speed="25"]');assert.equal(await speed.evaluate(()=>__deepwell.getState().devSpeed),25);
    results.push('Earned time ranks expose selectable rates; Skilling stays independent and existing testing speeds remain separate');
    assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results,simulated,errors},null,2));
  }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1);});
