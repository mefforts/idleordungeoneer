const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRuntime}=require('../tests/runtime.cjs'),{playerFixture}=require('../tests/player-fixture.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs');
// Isolated wardrobe states; no review controls enter the standalone game.
function headwearReviewFixture(){
 const sets=['melee_1','melee_2','ranged_1','ranged_2'],names=['Iron full helm','Steel full helm','Plain ranger cap','Cured ranger cap'];
 function reviewData(armor){const style=armor.split('_')[0],weapon=style==='melee'?'sword':'bow';return {...data,weaponType:weapon,equippedArmor:armor,enchant:0,arrows:30,ammoCharges:{arrows:10,runes:10},styles:{...data.styles,[style]:{...data.styles[style],tier:armor.endsWith('2')?2:1}}};}
 function arena(armor='melee_2'){
  __workshopTest.fresh('mine',armor,1);const style=armor.split('_')[0];data.weaponType=style==='melee'?'sword':'bow';data.styles[style].tier=armor.endsWith('2')?2:1;data.styles[style].weapon=armor.endsWith('2')?12:5;data.styles[style].speed=armor.endsWith('2')?6:2;data.arrows=30;data.ammoCharges.arrows=10;data.firstWeaponCrafted=true;projectCombatStyle();
  setScene('combat',false);game.status='running';game.menuPaused=game.manualPaused=true;game.player.x=game.player.y=game.camX=game.camY=0;game.enemies=[];game.holdSkill=null;$('toastStack').replaceChildren();refreshUI();render();
 }
 function sheet(motion=false){
  const canvas=document.createElement('canvas');canvas.id='headwearReviewCanvas';canvas.width=motion?1920:960;canvas.height=motion?1320:440;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d');c.fillStyle='#28271f';c.fillRect(0,0,canvas.width,canvas.height);
  if(!motion){sets.forEach((armor,i)=>{c.font='19px Georgia';c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(names[i],i*240+120,36);DeepwellAvatar.render(c,{x:i*240+114,y:410,scale:2.2,time:1.5,pose:'idle',showWeapon:false,data:reviewData(armor)});});return;}
  for(let row=0;row<4;row++)for(let col=0;col<8;col++){
   const armor=sets[col%4],facing=col<4?1:-1,pose=row===0?'idle':row===1?'combat':row===2?'attack':armor.startsWith('melee')?'mine':'fletch';
   c.font='15px Georgia';c.fillStyle='#e5d6b7';c.textAlign='center';c.fillText(names[col%4],col*240+120,row*330+25);c.font='12px system-ui';c.fillText((row===1?'walk':pose)+' · '+(facing>0?'right':'left'),col*240+120,row*330+46);
   DeepwellAvatar.render(c,{x:col*240+120,y:row*330+310,scale:1.65,time:1.5,pose,workPhase:.65,working:true,workBlend:1,vx:row===1?80*facing:0,facing,attack:row===2?.45:0,charge:.85,data:reviewData(armor)});
  }
 }
 function icons(){const pane=document.createElement('div');pane.id='headwearReviewCanvas';pane.style='position:fixed;inset:0;z-index:999999;background:#28271f;display:flex;align-items:center;justify-content:space-around';pane.innerHTML=[...sets.map(id=>'armor-set-'+id),'style-melee-armor','style-ranged-armor'].map(key=>'<img width="190" height="190" alt="'+key+'" src="'+iconAsset(key)+'">').join('');document.body.append(pane);}
 window.__headwearReview={arena,sheet,icons,clear(){document.querySelector('#headwearReviewCanvas')?.remove();},async ready(){await Promise.all([...document.images,...DeepwellAvatar.images()].map(image=>image.decode().catch(()=>{})));render();}};
}
(async()=>{
 const root=path.resolve(__dirname,'..'),before=fs.readFileSync(path.join(root,'index.html')),runtime=await createRuntime(),errors=[],files=[];
 try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+workshopFixture.toString()+')();('+playerFixture.toString()+')();('+headwearReviewFixture.toString()+')();'+seam);assert.notEqual(html,before.toString());
  const page=await runtime.browser.newPage({viewport:{width:960,height:440},hasTouch:true,isMobile:true});page.on('pageerror',error=>errors.push(error.message));await page.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__headwearReview&&!document.documentElement.classList.contains('game-loading'));await page.evaluate(()=>__playerTest.ready());
  const capture=async file=>{await page.evaluate(()=>__headwearReview.ready());await page.screenshot({path:path.join(root,file)});files.push(file);};
  await page.evaluate(()=>__headwearReview.arena());await page.evaluate(()=>__headwearReview.sheet());await capture('preview-headwear.png');await page.evaluate(()=>__headwearReview.clear());
  await page.setViewportSize({width:1540,height:400});await page.evaluate(()=>__playerTest.gallery());await capture('preview-player-sets.png');await page.evaluate(()=>document.querySelector('#playerReviewCanvas').remove());
  await page.setViewportSize({width:1920,height:1320});await page.evaluate(()=>__headwearReview.sheet(true));await page.screenshot({path:path.join(runtime.resultsDir,'headwear-poses.png')});await page.evaluate(()=>__headwearReview.clear());
  await page.setViewportSize({width:1240,height:220});await page.evaluate(()=>__headwearReview.icons());await page.evaluate(()=>__headwearReview.ready());await page.screenshot({path:path.join(runtime.resultsDir,'headwear-icons.png')});await page.evaluate(()=>__headwearReview.clear());
  await page.setViewportSize({width:390,height:844});for(const [armor,file]of [['melee_2','preview-full-helm-mobile.png'],['ranged_2','preview-ranger-cap-mobile.png']]){await page.evaluate(armor=>__headwearReview.arena(armor),armor);await capture(file);}
  await page.evaluate(()=>{__headwearReview.arena();__deepwell.openDrawer('gear');});await page.click('[data-equipment-tab="armor"]');await capture('preview-headwear-inventory-mobile.png');await page.click('#drawerClose');
  for(const [key,armor]of [['mine','melee_2'],['fletch','ranged_2']]){await page.evaluate(({key,armor})=>__workshopTest.review(key,armor,1,.65),{key,armor});await page.evaluate(()=>__workshopTest.ready());await page.screenshot({path:path.join(runtime.resultsDir,'headwear-'+key+'.png')});}
  for(const viewport of [{width:320,height:568},{width:844,height:390},{width:1280,height:800}]){await page.setViewportSize(viewport);for(const armor of ['melee_2','ranged_2']){await page.evaluate(armor=>__headwearReview.arena(armor),armor);await page.evaluate(()=>__playerTest.openCreator());await page.uncheck('#wardrobeBase');await page.waitForTimeout(80);await page.screenshot({path:path.join(runtime.resultsDir,'headwear-appearance-'+armor+'-'+viewport.width+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>__playerTest.closeCreator());}}
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);console.log(JSON.stringify({files:files.map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1)});
