const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {createRuntime}=require('../tests/runtime.cjs'),{dungeonCombatFixture}=require('../tests/dungeon-combat-fixture.cjs'),{spireFixture}=require('../tests/spire-fixture.cjs');
function spireReviewFixture(){
 let recorder,chunks=[],raf=0,returning=false,mode='',heading='';
 const captions={normal:'Ordinary spire · one bump',royal:'Crowned spire · step out, then bump again',surging:'Red surge · walking in takes backlash',dash:'Red surge · dash through safely'};
 function begin(){
  const output=document.createElement('canvas');output.width=600;output.height=686;const c=output.getContext('2d');chunks=[];
  function draw(){
   const rect=canvas.getBoundingClientRect(),ratio=canvas.height/rect.height,state=__spireTest.state();
   c.fillStyle='#142225';c.fillRect(0,0,600,686);c.fillStyle='#f4e7c9';c.font='20px Georgia';c.fillText(heading,18,29);c.font='13px system-ui';c.fillStyle='#bdd4c8';c.fillText('Actual game movement · '+Math.round(state.hp)+' / '+state.maxHp+' HP',18,53);
   c.drawImage(canvas,0,250*ratio,canvas.width,400*ratio,0,70,600,616);raf=requestAnimationFrame(draw);
  }draw();
  recorder=new MediaRecorder(output.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();
 }
 window.__spireReview={
  begin,
  scene(kind){mode=kind;returning=false;heading=captions[kind];__spireTest.setup({royal:kind==='royal',mode:kind==='surging'||kind==='dash'?'surging':'safe',preview:true});if(kind==='normal'||kind==='royal')for(const t of game.totems)t.spawnClock=t.eliteSummon?9:5.5;},
  step(frame){
   const state=__spireTest.state(),foot=state.source.foot;game.keys={};
   if(frame>=12&&state.source.exists){
    if(mode==='dash'){if(frame===12){game.player.vx=1;game.player.vy=0;dash();}}
    else{if(mode==='royal'&&state.source.hp<state.source.maxHp&&game.player.x>foot.x+SUMMON_BUMPS.releaseRadius+5)returning=true;game.keys[returning?'ArrowLeft':'ArrowRight']=true;}
   }
   tickCombat(.04);animateEffects(.04);render();
  },
  stop(){return new Promise(resolve=>{recorder.onstop=async()=>{cancelAnimationFrame(raf);recorder.stream.getTracks().forEach(track=>track.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));resolve(btoa(binary));};recorder.stop();});}
 };
}
(async()=>{const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[],before=fs.readFileSync(path.join(root,'index.html'));try{
 const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+dungeonCombatFixture.toString()+')();('+spireFixture.toString()+')();('+spireReviewFixture.toString()+')();'+seam);
 const p=await runtime.browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
 await p.evaluate(()=>__spireTest.setup({royal:true,preview:true}));await p.evaluate(()=>__spireTest.ready());await p.screenshot({path:path.join(root,'preview-spire-collisions-mobile.png')});
 await p.evaluate(()=>__spireTest.setup({royal:true,mode:'surging',preview:true}));await p.evaluate(()=>__spireTest.ready());await p.screenshot({path:path.join(root,'preview-spire-surging-mobile.png')});
 await p.setViewportSize({width:1280,height:800});await p.evaluate(()=>__spireTest.setup({royal:true,mode:'surging',zone:2,preview:true}));await p.evaluate(()=>__spireTest.ready());await p.screenshot({path:path.join(root,'preview-summoning-spire.png')});await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>__spireReview.scene('normal'));await p.evaluate(()=>__spireTest.ready());await p.evaluate(()=>__spireReview.begin());
 for(const kind of ['normal','royal','surging','dash']){
  await p.evaluate(kind=>__spireReview.scene(kind),kind);await p.evaluate(()=>__spireTest.ready());
  for(let frame=0;frame<90;frame++){await p.evaluate(frame=>__spireReview.step(frame),frame);await p.waitForTimeout(40);}
  const end=await p.evaluate(()=>__spireTest.state());assert.equal(end.source.exists,false,kind+' demo must break the spire');if(kind==='surging')assert.ok(end.hp<end.maxHp);else assert.equal(end.hp,end.maxHp,kind+' demo should avoid retaliation');
 }
 const recording=await p.evaluate(()=>__spireReview.stop()),video=path.join(runtime.resultsDir,'spire-collisions.webm');fs.writeFileSync(video,Buffer.from(recording,'base64'));
 function encode(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{cwd:root,encoding:'utf8',timeout:120000});if(r.status!==0)throw Error(r.stderr||'Spire recording export failed');}
 encode(['-i',video,'-an','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-r','30','-movflags','+faststart','-map_metadata','-1','preview-spire-collisions.mp4']);
 encode(['-i',video,'-filter_complex','fps=8,scale=360:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','-map_metadata','-1','preview-spire-collisions.gif']);
 assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);
 console.log(JSON.stringify({files:['preview-spire-collisions-mobile.png','preview-spire-surging-mobile.png','preview-summoning-spire.png','preview-spire-collisions.mp4','preview-spire-collisions.gif'].map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
