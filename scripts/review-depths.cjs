const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{depthFixture}=require('../tests/depth-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+depthFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});p.on('pageerror',error=>errors.push(error.message));await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));await p.evaluate(()=>__depthTest.assets());
  for(const [type,kind,file]of [['ricochet',3,'preview-elite-ricochet.png'],['shield',2,'preview-elite-shield.png']]){await p.evaluate(({type,kind})=>__depthTest.preview(type,kind),{type,kind});await p.screenshot({path:path.join(root,file)});}
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__depthTest.preview('charge',1));await p.screenshot({path:path.join(root,'preview-elite-charge-mobile.png')});
  await p.evaluate(()=>{__depthTest.max();__depthTest.travel(3,1);__depthTest.openTravel();});await p.screenshot({path:path.join(root,'preview-zone-depths-mobile.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Reviewed charge, ricochet, shield and twenty-floor replay navigation.');
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
