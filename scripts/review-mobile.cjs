const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs'),{mobileFixture}=require('../tests/mobile-fixture.cjs');
function reviewFixture(){
 window.__mobileReview={
  scene(){
   __mobileTest.fresh();game.menuPaused=true;game.phase=0;game.phaseTarget=24;game.frame=4.6;game.player.invuln=0;game.enemies=[];
   for(const [i,point]of [[-85,-75],[115,-40],[-110,140],[70,195]].entries()){const e=spawnEnemy();e.x=point[0];e.y=point[1];e.speed=0;e.visualType=i;e.hp=e.maxHp=100;}
   $('toastStack').replaceChildren();refreshUI();render();
  },
  inventory(materials=false){
   __mobileTest.fresh(true);game.menuPaused=true;data.gold=237;data.bars=21;data.ore=14;data.logs=42;data.arrows=76;data.cloth=18;data.runes=35;data.scraps=11;data.coal=7;data.steelBars=4;data.willowLogs=13;data.biomeLoot={0:3,1:1};
   data.weaponType='staff';data.equippedArmor='magic_1';projectCombatStyle();equipmentTab=materials?'materials':'weapons';openDrawer('gear');renderEquipmentTab();refreshUI();
  },
  shop(kind){
   __mobileTest.fresh(true);data.floor=zoneStart(kind);data.cleared=Math.max(9,data.floor-1);normalizeZone();resetRun();game.scene='combat';game.status='running';game.menuPaused=true;
   zoneShopFor().currency=83;zoneShopFor().earned=120;zoneShopFor().ranks={[zoneAbilities()[0].id]:2,ward:1};syncZone();openZoneShop();refreshUI();
  }
 };
}
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+mobileFixture.toString()+')();('+reviewFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.locator('#introCodex img').evaluate(img=>img.decode());await p.screenshot({path:path.join(root,'preview-intro-mobile.png')});
  await p.evaluate(()=>__mobileReview.scene());await p.waitForTimeout(100);const cdp=await p.context().newCDPSession(p);await p.evaluate(()=>__deepwell.toggleManualPause());await p.evaluate(()=>{if(__deepwell.getState().manualPaused)__deepwell.toggleManualPause();});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:105,y:615,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:135,y:600,id:1}]});await p.waitForTimeout(80);await p.screenshot({path:path.join(root,'preview-mobile-controls.png')});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.evaluate(()=>__mobileReview.inventory());await p.locator('.equipment-surface img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await p.screenshot({path:path.join(root,'preview-inventory-mobile.png')});await p.evaluate(()=>__mobileReview.inventory(true));await p.locator('.equipment-surface img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await p.screenshot({path:path.join(root,'preview-inventory-materials.png')});
  for(let kind=0;kind<4;kind++){await p.evaluate(kind=>__mobileReview.shop(kind),kind);await p.locator('.zone-upgrade-art img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await p.screenshot({path:path.join(runtime.resultsDir,'zone-abilities-theme-'+kind+'.png')});if(kind===0)await p.screenshot({path:path.join(root,'preview-zone-abilities-mobile.png')});}
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>__mobileReview.shop(3));await p.screenshot({path:path.join(root,'preview-zone-abilities.png')});
  assertNoErrors();console.log('Captured native intro, touch movement, Inventory and four themed Zone Shops on mobile and desktop.');
  function assertNoErrors(){if(errors.length)throw Error(errors.join('; '));}
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
