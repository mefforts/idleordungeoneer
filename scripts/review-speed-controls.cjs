const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {createRuntime}=require('../tests/runtime.cjs'),{journeyFixture}=require('../tests/journey-fixture.cjs'),{speedControlsFixture}=require('../tests/speed-controls-fixture.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs'),{skillingBonusesFixture}=require('../tests/skilling-bonuses-fixture.cjs');
function speedReviewFixture(){
 window.__speedReview={
  async ready(){await Promise.allSettled([...document.images,...DeepwellAvatar.images(),...workshopArtImages.values(),...campArt,zone2CampImage].filter(Boolean).map(i=>i.decode()));render();},
  controls(){__speedControlsTest.ranks(2,3);game.manualPaused=false;game.menuPaused=true;refreshUI();render();},
  work(rate,key='forge'){
   __skillBonusTest.fresh(key,key==='forge'?'melee_2':'',key==='forge'?1:0);__skillBonusTest.setSpeed(rate);game.holdSkill=game.scene;game.lastActiveAt[game.scene]=game.activeClockMs;
   let label=$('tempoCaption');if(!label){label=document.createElement('span');label.id='tempoCaption';label.style='position:absolute;top:124px;left:14px;color:#f3dfb1;font:16px Georgia;text-shadow:0 2px 3px #152221';$('stageWrap').append(label);}label.textContent=rate+'× Skilling';refreshUI();render();
  },
  feedback(){
   this.work(24);__skillBonusTest.collect('very-rare');__skillBonusTest.tick(.43);__skillBonusTest.spawn('common',3);__skillBonusTest.spawn('rare',5);__skillBonusTest.reaction(.35);
   const rect=canvas.getBoundingClientRect();bonusState().nodes.forEach((node,i)=>{node.x=rect.width*(i?.72:.24);node.y=rect.height*(i?.39:.27);node.el.style.left=node.x+'px';node.el.style.top=node.y+'px';});
  }
 };
}
(async()=>{const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),original=fs.readFileSync(path.join(root,'index.html'),'utf8'),errors=[],files=[];try{
 const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=original.replace(seam,'('+journeyFixture.toString()+')();('+speedControlsFixture.toString()+')();('+workshopFixture.toString()+')();('+skillingBonusesFixture.toString()+')();('+speedReviewFixture.toString()+')();'+seam);
 async function open(options){const p=await runtime.browser.newPage(options);p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__speedReview&&!document.documentElement.classList.contains('game-loading'));return p;}
 const phone=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await phone.evaluate(()=>__speedReview.controls());await phone.evaluate(()=>__speedReview.ready());await phone.tap('#speedToggle');await phone.screenshot({path:path.join(root,'preview-purchased-speed-mobile.png')});files.push('preview-purchased-speed-mobile.png');await phone.keyboard.press('Escape');
 await phone.setViewportSize({width:844,height:390});await phone.evaluate(()=>__speedControlsTest.ranks(5,16));await phone.tap('#speedToggle');await phone.screenshot({path:path.join(root,'preview-speed-controls-landscape.png')});files.push('preview-speed-controls-landscape.png');await phone.keyboard.press('Escape');
 await phone.setViewportSize({width:390,height:844});await phone.evaluate(()=>__speedReview.feedback());await phone.evaluate(()=>__speedReview.ready());await phone.waitForTimeout(150);await phone.screenshot({path:path.join(root,'preview-skilling-speed-mobile.png')});files.push('preview-skilling-speed-mobile.png');await phone.close();
 if(!process.argv.includes('--stills')){
  const dir=path.join(runtime.resultsDir,'tempo-video');fs.mkdirSync(dir,{recursive:true});const page=await open({viewport:{width:390,height:844},recordVideo:{dir,size:{width:390,height:844}}});
  for(const key of ['forge','mine'])for(const rate of [1,2,24]){
   await page.evaluate(({rate,key})=>__speedReview.work(rate,key),{rate,key});await page.evaluate(()=>__speedReview.ready());
   await page.evaluate(()=>__skillBonusTest.play());await page.waitForTimeout(5000);await page.evaluate(()=>__skillBonusTest.freeze());console.log('Recorded '+key+' at '+rate+' times');
  }
  const recording=page.video();await page.close();const input=await recording.path(),file='preview-skilling-tempo.mp4',encoded=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-an','-c:v','libx264','-threads','2','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',path.join(root,file)],{encoding:'utf8',timeout:120000});assert.ifError(encoded.error);assert.equal(encoded.status,0,encoded.stderr);files.push(file);
 }
 assert.deepEqual(errors,[]);assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),original);console.log(JSON.stringify({files:files.map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
