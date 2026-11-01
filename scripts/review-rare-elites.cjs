const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{rareEliteFixture}=require('../tests/rare-elite-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+rareEliteFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});p.on('pageerror',error=>errors.push(error.message));await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
  for(let kind=0;kind<4;kind++){await p.evaluate(kind=>__rareTest.show(kind),kind);await p.screenshot({path:path.join(root,'preview-rare-'+['overgrowth','embervault','crypt','rift'][kind]+'.png')});}
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__rareTest.spoils());await p.tap('#eliteSpoilsButton');await p.locator('.elite-boon-choice img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await p.screenshot({path:path.join(root,'preview-elite-spoils-mobile.png')});
  await p.setViewportSize({width:844,height:390});await p.screenshot({path:path.join(root,'preview-elite-spoils-landscape.png')});
  await p.setViewportSize({width:390,height:844});await p.tap('[data-elite-choice="windstep"]');await p.screenshot({path:path.join(root,'preview-elite-boon-mobile.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Reviewed all 24 elite forms, locked sweeps and mobile boon choices.');
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
