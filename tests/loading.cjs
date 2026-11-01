const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {createRuntime}=require('./runtime.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),boundary=html.indexOf('<style id="gameStyles">'),prefix=html.slice(0,boundary),pending=new Map(),errors=[],passed=[];let failedAttempts=0;
 assert.ok(boundary>0&&Buffer.byteLength(prefix)<12000,'First-paint screen precedes game art and fits in 12 KB');
 const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  if(req.url.startsWith('/slow')){res.write(prefix);pending.set(req.url,()=>res.end(html.slice(boundary)));res.on('close',()=>pending.delete(req.url));}
  else if(req.url==='/failure'&&failedAttempts++===0)res.end(prefix+'<script>throw new Error("Isolated startup failure")</script></body></html>');
  else res.end(html);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
   const p=await runtime.browser.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));const route='/slow-'+viewport.width;
   await p.goto(base+route,{waitUntil:'commit'});await p.locator('#loadingScreen').waitFor({state:'visible'});
   assert.equal(await p.locator('#loadingTitle').innerText(),'Idle or Dungeoneer');assert.equal(await p.locator('#loadingStatus').innerText(),'Loading your adventure…');assert.equal(await p.locator('#app').count(),0,'The loader must paint before the game DOM or main script exists');assert.equal(await p.evaluate(()=>typeof window.__deepwell),'undefined');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.screenshot({path:path.join(root,viewport.width===390?'preview-loading-mobile.png':'preview-loading.png')});
   pending.get(route)();await p.waitForFunction(()=>window.__deepwell&&!document.documentElement.classList.contains('game-loading'));
   assert.equal(await p.locator('#app').getAttribute('inert'),null);assert.equal(await p.locator('#app').getAttribute('aria-hidden'),null);await p.locator('#loadingScreen').waitFor({state:'detached'});assert.equal(await p.locator('#introDelve').isVisible(),true);assert.equal(await p.locator('#overlayCard').evaluate(card=>card===document.activeElement),true);
   await p.click('#introDelve');assert.equal(await p.evaluate(()=>__deepwell.getState().status),'running');await p.close();
  }
  passed.push('A complete themed screen paints during a genuinely paused HTML download, before any game DOM, on phone and desktop; the intro replaces it only after initial scene assets decode');
  const reduced=await runtime.browser.newPage({viewport:{width:320,height:844},reducedMotion:'reduce'});await reduced.goto(base+'/slow-reduced',{waitUntil:'commit'});await reduced.locator('#loadingScreen').waitFor({state:'visible'});assert.equal(await reduced.locator('.loading-wisp').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await reduced.locator('.loading-track').evaluate(el=>getComputedStyle(el,'::after').animationName),'none');assert.equal(await reduced.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);pending.get('/slow-reduced')();await reduced.waitForFunction(()=>window.__deepwell&&!document.documentElement.classList.contains('game-loading'));await reduced.close();
  const failed=await runtime.browser.newPage();await failed.goto(base+'/failure');assert.equal(await failed.locator('#loadingRetry').isVisible(),true);assert.match(await failed.locator('#loadingStatus').innerText(),/couldn’t open/);assert.equal(await failed.locator('.loading-track').isVisible(),false);await failed.click('#loadingRetry');await failed.waitForFunction(()=>window.__deepwell&&!document.documentElement.classList.contains('game-loading'));assert.equal(await failed.locator('#introDelve').isVisible(),true);await failed.close();
  const noScript=await runtime.browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await noScript.goto(base+'/no-script');assert.equal(await noScript.locator('#loadingScreen noscript p').isVisible(),true);assert.match(await noScript.locator('#loadingScreen noscript p').innerText(),/Enable JavaScript/);assert.equal(await noScript.locator('.loading-track').isVisible(),false);await noScript.close();
  passed.push('Reduced motion avoids animation; a real startup error offers working retry; JavaScript-disabled browsers receive a clear message');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,firstPaintBytes:Buffer.byteLength(prefix),errors},null,2));
 }finally{
  for(const finish of pending.values())finish();await runtime.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exit(1)});
