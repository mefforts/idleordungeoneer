const fs=require('node:fs');
const path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
(async()=>{
 const runtime=await createRuntime(),errors=[],root=path.resolve(__dirname,'..');
 try{
  const initial=await runtime.browser.newPage();await initial.goto(runtime.baseURL);
  const seed=await initial.evaluate(()=>__deepwell.getState().data);await initial.close();
  const context=await runtime.browser.newContext({viewport:{width:1440,height:1080}});
  await context.addInitScript(d=>{
   d.floor=2;d.cleared=1;d.gold=2376;d.ore=282;d.blacksmithXp=3000;d.bars=70;d.cloth=80;
   d.idleJobs=['mine'];d.idleFirstAssigned=true;d.idleNoticeSlots=1;
   d.onboardingDone=d.tutorialSeen=d.skillsNudgeSeen=true;d.savedAt=Date.now();
   localStorage.setItem('deepwell-prototype-v1',JSON.stringify(d));
  },seed);
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(runtime.baseURL);
  await p.click('#introSkills');await p.click('#quickSkills');await p.click('[data-workshop-group="blacksmithing"]');
  await p.waitForTimeout(200);
  await p.locator('#gameDrawer').screenshot({path:path.join(root,'preview-runestones.png')});
  await p.click('[data-workshop-view="equipment"]');await p.screenshot({path:path.join(root,'preview-menu.png')});
  await p.setViewportSize({width:390,height:844});await p.click('[data-workshop-view="gather"]');await p.waitForTimeout(100);
  await p.screenshot({path:path.join(runtime.resultsDir,'runestones-mobile.png')});
  await p.click('#drawerClose');await p.click('#quickSettings');await p.screenshot({path:path.join(runtime.resultsDir,'runestones-settings.png')});
  await p.click('#drawerClose');await p.click('#quickCodex');await p.screenshot({path:path.join(runtime.resultsDir,'runestones-codex.png')});
  const embedded=await p.evaluate(()=>({stone:getComputedStyle(document.documentElement).getPropertyValue('--rune-button').trim().startsWith('url("data:image/svg+xml;base64,'),overflow:document.documentElement.scrollWidth>innerWidth+1}));
  if(!embedded.stone||embedded.overflow||errors.length)throw Error(JSON.stringify({embedded,errors}));
  console.log('Captured carved runestone desktop, mobile, crafting, settings and Codex previews; standalone artwork loaded without errors.');
  await context.close();
 }finally{await runtime.close()}
})().catch(e=>{console.error(e);process.exit(1)});
