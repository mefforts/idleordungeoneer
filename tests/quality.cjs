const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createRuntime} = require('./runtime.cjs');
(async()=>{
 const runtime = await createRuntime();
 const {browser,baseURL,resultsDir}=runtime;const errors=[];
 try {
  const p=await browser.newPage({viewport:{width:844,height:390}});
  p.on('pageerror',e=>errors.push(e.message));await p.goto(baseURL);await p.click('#introSkills');await p.waitForTimeout(100);
  const boxes=await p.evaluate(()=>({work:document.getElementById('skillActionBar').getBoundingClientRect().toJSON(),nav:document.querySelector('.hud-actions').getBoundingClientRect().toJSON()}));
  assert.ok(boxes.work.right < boxes.nav.left || boxes.work.bottom < boxes.nav.top,'Station controls must leave the side icon rail reachable in landscape');
  await p.screenshot({path:path.join(resultsDir,'phone-landscape.png')});
  await p.click('#quickSettings');const downloadPromise=p.waitForEvent('download');await p.click('#settingsExport');const download=await downloadPromise;
  const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.game,'IDLE OR DUNGEONEER');assert.equal(backup.data.gold,45);
  const restored={...backup.data,styles:null,equipmentVersion:0,progressionVersion:1,gold:321,weaponType:'bow',unlockedWeapons:['sword','bow'],arrows:47,armor:3,onboardingDone:true,tutorialSeen:true};
  await Promise.all([p.waitForEvent('load'),p.setInputFiles('#settingsImportFile',{name:'original-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...backup,data:restored}))})]);
  await p.waitForFunction(()=>window.__deepwell);
  const state=await p.evaluate(()=>__deepwell.getState());assert.equal(state.data.gold,321);assert.equal(state.weaponType,'bow');assert.equal(state.data.arrows,47);assert.equal(state.data.armor,3);
  await p.click('#introSkills');await p.click('#quickSettings');await p.click('#settingReducedMotion');assert.equal(await p.locator('#settingReducedMotion').getAttribute('aria-pressed'),'true');
  await p.click('#drawerClose');await p.reload();assert.equal((await p.evaluate(()=>__deepwell.getState())).data.reducedMotion,true);
  await p.click('#introSkills');await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__deepwell.fillTestingResources());await p.waitForTimeout(200);assert.match(await p.locator('#quickGold').innerText(),/M/);const resourceBox=await p.locator('.hud-resources').boundingBox(),brandBox=await p.locator('.hud-brand').boundingBox();assert.ok(resourceBox.y>=brandBox.y+brandBox.height-1 || resourceBox.x>=brandBox.x+brandBox.width-1,'Large balances must not overlap the centered brand');
  const offline=await browser.newContext({offline:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});const op=await offline.newPage();
  op.on('pageerror',e=>errors.push(e.message));await offline.route(baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.resolve(__dirname,'../index.html'))}));await op.goto(baseURL);await op.click('#introSkills');await op.waitForTimeout(250);await op.screenshot({path:path.join(resultsDir,'offline-mobile.png')});
  assert.equal((await op.evaluate(()=>__deepwell.getState())).scene,'mine');await op.locator('#skillHold').dispatchEvent('pointerdown',{pointerId:2,pointerType:'touch',button:0});await op.locator('#skillHold').dispatchEvent('pointerup',{pointerId:2,pointerType:'touch',button:0});assert.ok((await op.evaluate(()=>__deepwell.getState())).data.ore>=2);
  await offline.close();await p.click('#quickSettings');p.once('dialog',d=>d.accept());await p.click('#settingsReset');const reset=await p.evaluate(()=>__deepwell.getState());assert.equal(reset.data.gold,45);for(const profile of Object.values(reset.data.styles)){assert.equal(profile.weapon,0);assert.equal(profile.armor,0);}assert.ok(Object.values(reset.data.tools).every(v=>!v));assert.ok(Object.values(reset.data.stationLevels).every(v=>v===0));assert.deepEqual(errors,[]);
  console.log('Passed: phone landscape, save export, original-format save restoration, reduced-motion persistence, large currency balances, offline touch play, and reset of migrated progression.');
 }finally{await runtime.close()}
})().catch(e=>{console.error(e);process.exit(1)});
