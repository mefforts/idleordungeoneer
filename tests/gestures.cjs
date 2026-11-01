const assert=require('node:assert/strict');
const {createRuntime}=require('./runtime.cjs');
(async()=>{
 const runtime=await createRuntime();const {browser,baseURL,resultsDir}=runtime;const errors=[];
 try{
  const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.goto(baseURL);await p.click('#introSkills');
  const hold=await p.locator('#skillHold').boundingBox(),a={x:hold.x+hold.width/2,y:hold.y+hold.height/2,id:0};const client=await p.context().newCDPSession(p);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await p.waitForFunction(()=>__deepwell.bonusInfo().length>0,null,{timeout:4000});
  const bonus=await p.evaluate(()=>__deepwell.bonusInfo()[0]),r=await p.locator('#gameCanvas').boundingBox(),b={x:r.x+bonus.x,y:r.y+bonus.y,id:1};
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});
  await p.waitForTimeout(100);assert.equal((await p.evaluate(()=>__deepwell.getState())).workingSkill,'mine','A second-finger bonus tap must not interrupt the held work finger');
  const ore=await p.evaluate(()=>__deepwell.getState().data.ore);await p.waitForTimeout(2500);assert.ok((await p.evaluate(()=>__deepwell.getState())).data.ore>=ore+2);
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await p.evaluate(()=>__deepwell.getState())).workingSkill,'');await p.screenshot({path:resultsDir+'/systems-touch-bonuses.png'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));await page.goto(baseURL);await page.click('#introSkills');
  await page.evaluate(()=>__deepwell.spawnSkillBonus());const node=page.locator('[data-skill-bonus]').first();await node.focus();const before=await page.evaluate(()=>__deepwell.getState().data.ore);await page.keyboard.press('Space');assert.equal((await page.evaluate(()=>__deepwell.getState())).data.ore,before+1);assert.equal((await page.evaluate(()=>__deepwell.getState())).workingSkill,'');
  await page.evaluate(()=>__deepwell.enterActivity('wood'));const id=await page.evaluate(()=>__deepwell.spawnSkillBonus());await page.waitForTimeout(6500);assert.equal(await page.evaluate(id=>__deepwell.claimSkillBonus(id),id),false);assert.equal((await page.evaluate(()=>__deepwell.getState())).data.logs,0);
  await page.click('#quickGear');await page.click('[data-equipment-tab="jewelry"]');await page.click('#jewelryCraftLink');assert.equal(await page.locator('[data-workshop-group="artisan"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);console.log('Passed: two-finger work + bonus collection, keyboard bonuses, expiry without rewards, and jewelry Skills navigation.');
 }finally{await runtime.close()}
})().catch(e=>{console.error(e);process.exit(1)});
