const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {createRuntime}=require('../tests/runtime.cjs'),{dungeonCombatFixture}=require('../tests/dungeon-combat-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),videoDir=path.join(runtime.resultsDir,'combat-video'),errors=[];fs.mkdirSync(videoDir,{recursive:true});
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+dungeonCombatFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1280,height:800},recordVideo:{dir:videoDir,size:{width:1280,height:800}}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
  for(const [type,kind]of [['ringchain',1],['bloom',3],['return',2],['sunder',0],['bastion',1],['eliteSummon',2]]){
   await p.evaluate(({type,kind})=>__dungeonTest.show(type,kind),{type,kind});
   for(let frame=0;frame<100;frame++){await p.evaluate(()=>__dungeonTest.advance(.04));await p.waitForTimeout(40);if(frame===40&&type==='eliteSummon')await p.screenshot({path:path.join(root,'preview-summoning-spire.png')});}
  }
  const video=p.video();await p.close();const source=await video.path(),output=path.join(root,'preview-boss-patterns.mp4');const encoded=spawnSync('ffmpeg',['-y','-i',source,'-an','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',output],{encoding:'utf8'});if(encoded.status!==0)throw Error('Video export failed');
  const phone=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});phone.on('pageerror',e=>errors.push(e.message));await phone.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await phone.goto(runtime.baseURL);await phone.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
  await phone.evaluate(()=>__dungeonTest.show('sunder',0));await phone.screenshot({path:path.join(root,'preview-boss-sunder-mobile.png')});await phone.evaluate(()=>__dungeonTest.shop());await phone.screenshot({path:path.join(root,'preview-dungeon-shop-mobile.png')});await phone.setViewportSize({width:1440,height:900});await phone.evaluate(()=>__dungeonTest.shop('staff'));await phone.screenshot({path:path.join(root,'preview-dungeon-shop.png')});
  await phone.setViewportSize({width:390,height:844});await phone.evaluate(()=>__dungeonTest.pickup());await phone.screenshot({path:path.join(root,'preview-blessings-mobile.png')});await phone.setViewportSize({width:844,height:390});await phone.screenshot({path:path.join(root,'preview-blessings-landscape.png')});await phone.close();
  if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({screenshots:6,video:'preview-boss-patterns.mp4',frames:600,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
