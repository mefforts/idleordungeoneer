const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRuntime}=require('../tests/runtime.cjs'),{journeyFixture}=require('../tests/journey-fixture.cjs');
// Review states enter only the served response, never the standalone build.
function journeyReviewFixture(){
 window.__journeyReview={
  shop(){__journey.fresh(2);openZoneShop();},
  preparation(){__journey.fresh(2);data.styles.ranged.weapon=8;data.woodworkingXp=700;data.unlockedWeapons.push('bow');data.weaponType='bow';data.craftGoal='promotion:ranged';projectCombatStyle();openWorkshop('woodworking','equipment');$('preparationRoute').open=true;},
  loot(){
   __journey.fresh();const enemy=spawnEnemy(true,0);enemy.name=biome().boss[0];enemy.x=game.camX;enemy.y=game.camY+45;enemy.hp=1;
   const original=Math.random;Math.random=()=>0;try{onKill(enemy);}finally{Math.random=original;}
   game.enemies=[];game.phase=1;game.lootDrops.forEach(drop=>drop.age=1);game.tipClock=1;__journey.buffs();game.manualPaused=game.menuPaused=true;game.player.x=game.camX;game.player.y=game.camY+140;$('toastStack').replaceChildren();refreshUI();render();
  },
  async ready(){await Promise.all([...document.images].map(image=>image.decode?.().catch(()=>{})));await Promise.all([...lootImages.values()].map(image=>image.decode?.().catch(()=>{})));render();}
 };
}
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),before=fs.readFileSync(path.join(root,'index.html')),errors=[],files=[];
 try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+journeyFixture.toString()+')();('+journeyReviewFixture.toString()+')();'+seam);assert.notEqual(html,before.toString());
  const page=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});page.on('pageerror',error=>errors.push(error.message));await page.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__journeyReview&&!document.documentElement.classList.contains('game-loading'));
  for(const [scene,file]of [['shop','preview-game-time-mobile.png'],['preparation','preview-preparation-mobile.png'],['loot','preview-loot-buffs-mobile.png']]){await page.evaluate(scene=>__journeyReview[scene](),scene);await page.evaluate(()=>__journeyReview.ready());await page.screenshot({path:path.join(root,file)});files.push(file);}
  // Include the narrow phone and landscape layouts in the review validation.
  for(const viewport of [{width:320,height:568},{width:844,height:390}]){await page.setViewportSize(viewport);for(const scene of ['shop','preparation','loot']){await page.evaluate(scene=>__journeyReview[scene](),scene);await page.evaluate(()=>__journeyReview.ready());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Page overflow at '+viewport.width+'px in '+scene);await page.screenshot({path:path.join(runtime.resultsDir,'journey-'+scene+'-'+viewport.width+'.png')});}}
  await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>__journeyReview.shop());await page.evaluate(()=>__journeyReview.ready());const file='preview-game-time.png';await page.screenshot({path:path.join(root,file)});files.push(file);
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);console.log(JSON.stringify({files:files.map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
