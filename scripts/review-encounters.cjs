const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{encounterFixture}=require('../tests/encounter-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+encounterFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.evaluate(()=>__encounterTest.ready());
  for(let kind=0;kind<4;kind++)for(const type of ['reflect','mend','fury']){
   await p.evaluate(({kind,type})=>__encounterTest.show(kind,type),{kind,type});await p.screenshot({path:path.join(runtime.resultsDir,'encounter-'+kind+'-'+type+'.png')});
  }
  await p.evaluate(()=>__encounterTest.show(0,'reflect'));await p.screenshot({path:path.join(root,'preview-counterplay.png')});
  await p.evaluate(()=>__encounterTest.show(2,'mend'));await p.screenshot({path:path.join(root,'preview-totems.png')});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__encounterTest.show(1,'reflect',true));await p.screenshot({path:path.join(root,'preview-encounters-mobile.png')});
  await p.setViewportSize({width:1440,height:1800});
  await p.evaluate(()=>{
   const host=document.createElement('main');host.style.cssText='position:fixed;inset:0;z-index:9999;background:#151c20;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:4px;padding:5px';document.body.append(host);
   const kinds=['The Overgrowth','The Embervault','The Hollow Crypt','The Astral Rift'],types=['reflect','mend','fury'];
   for(let kind=0;kind<4;kind++)for(const type of types){
    __encounterTest.show(kind,type);const card=document.createElement('section');card.style.cssText='position:relative;overflow:hidden';const copy=document.createElement('canvas');copy.width=560;copy.height=560;
    const source=document.getElementById('gameCanvas');copy.getContext('2d').drawImage(source,source.width/2-280,source.height/2-340,560,560,0,0,560,560);copy.style.cssText='width:100%;height:100%;object-fit:contain';card.append(copy);
    const label=document.createElement('span');label.textContent=kinds[kind]+' · '+{reflect:'Reflect',mend:'Healing stream',fury:'Power stream'}[type];label.style.cssText='position:absolute;left:12px;top:8px;color:#f3e7c7;font:15px Georgia;text-shadow:0 2px 4px #000';card.append(label);host.append(card);
   }
  });await p.screenshot({path:path.join(root,'preview-encounter-themes.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Reviewed all twelve counterplay assets in actual combat, including phone elite groups.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
