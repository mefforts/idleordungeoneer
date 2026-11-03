const fs=require('node:fs'),{createRuntime}=require('./runtime.cjs'),{dungeonCombatFixture}=require('./dungeon-combat-fixture.cjs'),{workshopUpdateFixture}=require('./workshop-update-fixture.cjs'),{challengePressureFixture}=require('./challenge-pressure-fixture.cjs');
async function openWorkshopUpdate(options={}){
 const runtime=await createRuntime(),errors=[],source=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=source.replace(seam,'('+dungeonCombatFixture.toString()+')();('+workshopUpdateFixture.toString()+')();('+challengePressureFixture.toString()+')();'+seam),page=await runtime.browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,...options});
 page.on('pageerror',e=>errors.push(e.message));await page.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__workshopUpdate&&!document.documentElement.classList.contains('game-loading'));
 const call=(name,...args)=>page.evaluate(({name,args})=>__workshopUpdate[name](...args),{name,args});return {runtime,page,errors,source,call,async close(){await runtime.close();}};
}
module.exports={openWorkshopUpdate};
