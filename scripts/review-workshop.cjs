const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+workshopFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));await p.evaluate(()=>__workshopTest.ready());
  await p.evaluate(()=>__workshopTest.review('scavenge','ranged_1',0,.4));await p.screenshot({path:path.join(root,'preview-scavenging-mobile.png')});await p.evaluate(()=>__workshopTest.reward());await p.screenshot({path:path.join(root,'preview-skilling-rewards.png')});
  await p.evaluate(()=>{__workshopTest.fresh();__workshopTest.hub();});await p.screenshot({path:path.join(root,'preview-scavenging-hub.png')});
  await p.evaluate(()=>__workshopTest.hud('staff','right'));await p.screenshot({path:path.join(root,'preview-ammunition-mobile.png')});
  await p.evaluate(()=>__workshopTest.healing());await p.screenshot({path:path.join(root,'preview-healing-mobile.png')});
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>__workshopTest.review('ward','magic_1',0,.35));await p.screenshot({path:path.join(root,'preview-warding.png')});
  for(let zone=0;zone<4;zone++){await p.evaluate(zone=>__workshopTest.review('ward','magic_2',zone,.35),zone);await p.screenshot({path:path.join(runtime.resultsDir,'warding-zone-'+zone+'.png')});}
  for(const [key,armor]of [['mine','melee_1'],['forge','melee_2'],['wood','ranged_1'],['fletch','ranged_1'],['rune','magic_1'],['polish','ranged_2'],['cleanAncient','ranged_2']]){await p.evaluate(({key,armor})=>__workshopTest.review(key,armor,1,.93),{key,armor});await p.screenshot({path:path.join(runtime.resultsDir,'workshop-'+key+'.png')});}
  await p.setViewportSize({width:1710,height:1070});await p.evaluate(()=>__workshopTest.contacts());await p.screenshot({path:path.join(root,'preview-workshop-poses.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Captured Scavenging discovery/rewards, Warding, ammunition, all activity families and six armor sets.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
