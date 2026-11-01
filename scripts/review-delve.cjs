const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{delveFixture}=require('../tests/delve-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+delveFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
  await p.evaluate(()=>{__delveTest.fresh(6,5);__delveTest.open();});await p.locator('#delveTravelView img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await p.screenshot({path:path.join(root,'preview-delve-mobile.png')});
  await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:path.join(root,'preview-delve.png')});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__delveTest.idleCase(true));await p.locator('[data-idle-skill="wood"]').first().tap();await p.screenshot({path:path.join(root,'preview-idle-replacement.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Reviewed normal replay travel and direct idle replacement.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
