const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRuntime}=require('../tests/runtime.cjs'),{playerFixture}=require('../tests/player-fixture.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs');
// These wardrobe states exist only in the review response, never in the game.
function wizardHatReviewFixture(){
 function arena(armor='magic_2'){
  __workshopTest.fresh('ward',armor,1);data.weaponType='staff';data.styles.magic.tier=armor.endsWith('2')?2:1;data.styles.magic.weapon=armor.endsWith('2')?12:5;data.styles.magic.speed=armor.endsWith('2')?6:2;data.runes=30;data.ammoCharges.runes=10;data.firstWeaponCrafted=true;projectCombatStyle();
  setScene('combat',false);game.status='running';game.menuPaused=game.manualPaused=true;game.player.x=game.player.y=game.camX=game.camY=0;game.enemies=[];game.holdSkill=null;$('toastStack').replaceChildren();refreshUI();render();
 }
 function sheet(motion=false){
  const canvas=document.createElement('canvas');canvas.id='wizardHatReviewCanvas';canvas.width=motion?960:640;canvas.height=motion?1200:420;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d');c.fillStyle='#28271f';c.fillRect(0,0,canvas.width,canvas.height);
  if(!motion){for(const [i,armor]of ['magic_1','magic_2'].entries()){c.font='20px Georgia';c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(ARMOR_SETS[armor].name,i*320+160,38);DeepwellAvatar.render(c,{x:i*320+154,y:389,scale:2.2,time:1.5,pose:'idle',showWeapon:false,data:{...data,equippedArmor:armor,enchant:0}});}return;}
  for(const [row,pose]of ['idle','walk','ward'].entries())for(const [col,armor]of ['magic_1','magic_2','magic_1','magic_2'].entries()){
   const facing=col<2?1:-1;c.font='15px Georgia';c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(ARMOR_SETS[armor].name,col*240+120,row*400+28);c.font='12px system-ui';c.fillText(pose+' · '+(facing>0?'right':'left'),col*240+120,row*400+50);
   DeepwellAvatar.render(c,{x:col*240+120,y:row*400+375,scale:2.1,time:1.5,pose,workPhase:.65,working:true,workBlend:1,vx:pose==='walk'?80*facing:0,facing,showWeapon:false,data:{...data,equippedArmor:armor,enchant:0}});
  }
 }
 function icons(){const pane=document.createElement('div');pane.id='wizardHatReviewCanvas';pane.style='position:fixed;inset:0;z-index:999999;background:#28271f;display:flex;align-items:center;justify-content:space-around';pane.innerHTML=['armor-set-magic_1','armor-set-magic_2','style-magic-armor'].map(key=>'<img width="200" height="200" alt="'+key+'" src="'+iconAsset(key)+'">').join('');document.body.append(pane);}
 window.__wizardReview={arena,sheet,icons,clear(){document.querySelector('#wizardHatReviewCanvas')?.remove();},async ready(){await Promise.all([...document.images,...DeepwellAvatar.images()].map(image=>image.decode().catch(()=>{})));render();}};
}
(async()=>{
 const root=path.resolve(__dirname,'..'),before=fs.readFileSync(path.join(root,'index.html')),runtime=await createRuntime(),errors=[],files=[];
 try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+workshopFixture.toString()+')();('+playerFixture.toString()+')();('+wizardHatReviewFixture.toString()+')();'+seam);assert.notEqual(html,before.toString());
  const page=await runtime.browser.newPage({viewport:{width:640,height:420},hasTouch:true,isMobile:true});page.on('pageerror',error=>errors.push(error.message));await page.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__wizardReview&&!document.documentElement.classList.contains('game-loading'));await page.evaluate(()=>__playerTest.ready());
  const capture=async file=>{await page.evaluate(()=>__wizardReview.ready());await page.screenshot({path:path.join(root,file)});files.push(file);};
  await page.evaluate(()=>__wizardReview.arena());await page.evaluate(()=>__wizardReview.sheet());await capture('preview-wizard-hats.png');await page.evaluate(()=>__wizardReview.clear());
  await page.setViewportSize({width:1540,height:400});await page.evaluate(()=>__playerTest.gallery());await capture('preview-player-sets.png');await page.evaluate(()=>document.querySelector('#playerReviewCanvas').remove());
  await page.setViewportSize({width:960,height:1200});await page.evaluate(()=>__wizardReview.sheet(true));await page.screenshot({path:path.join(runtime.resultsDir,'wizard-hats-poses.png')});await page.evaluate(()=>__wizardReview.clear());
  await page.setViewportSize({width:640,height:260});await page.evaluate(()=>__wizardReview.icons());await page.evaluate(()=>__wizardReview.ready());await page.screenshot({path:path.join(runtime.resultsDir,'wizard-hat-icons.png')});await page.evaluate(()=>__wizardReview.clear());
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>__wizardReview.arena());await capture('preview-wizard-hat-combat-mobile.png');
  await page.evaluate(()=>__workshopTest.review('ward','magic_2',1,.65));await page.evaluate(()=>__workshopTest.ready());await capture('preview-wizard-hat-warding-mobile.png');
  await page.evaluate(()=>{__wizardReview.arena();__deepwell.openDrawer('gear');});await page.click('[data-equipment-tab="armor"]');await capture('preview-wizard-hat-inventory-mobile.png');
  await page.click('#drawerClose');await page.evaluate(()=>__playerTest.openCreator());await page.uncheck('#wardrobeBase');await page.waitForTimeout(80);await page.screenshot({path:path.join(runtime.resultsDir,'wizard-hat-appearance-mobile.png')});await page.evaluate(()=>__playerTest.closeCreator());
  for(const viewport of [{width:320,height:568},{width:844,height:390}]){await page.setViewportSize(viewport);await page.evaluate(()=>__wizardReview.arena());await page.screenshot({path:path.join(runtime.resultsDir,'wizard-hat-combat-'+viewport.width+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);console.log(JSON.stringify({files:files.map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
