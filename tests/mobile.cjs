const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs'),{mobileFixture}=require('./mobile-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 try{
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+mobileFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__mobileTest&&!document.documentElement.classList.contains('game-loading'));
  await p.locator('#introCodex').waitFor({state:'visible'});
  assert.equal(await p.locator('#introCodex').innerText(),'Codex');assert.equal(await p.locator('#introDelve img').getAttribute('src'),await p.locator('#delveNav img').getAttribute('src'));await p.tap('#introCodex');await p.locator('#codexEntries').waitFor({state:'visible'});assert.ok(await p.locator('#codexEntries').isVisible());await p.tap('#codexClose');assert.ok(await p.locator('#introDelve').isVisible());
  await p.evaluate(()=>__mobileTest.fresh());const cdp=await p.context().newCDPSession(p);let anchor={x:280,y:610,id:1},dragged={x:240,y:610,id:1};
  const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  const motion=()=>p.evaluate(()=>__mobileTest.motion());
  await touch('touchStart',[anchor]);await p.waitForTimeout(100);assert.equal((await motion()).x,0,'Touch down alone must not move toward screen center');
  await touch('touchMove',[dragged]);await p.waitForTimeout(200);let moved=await motion();assert.ok(moved.x<-18,'A left drag on the right half moves left');assert.ok(Math.abs(moved.y)<2);assert.equal(moved.guide,true);
  await touch('touchEnd',[]);const stopped=await motion();await p.waitForTimeout(160);assert.ok(Math.abs((await motion()).x-stopped.x)<.1);assert.equal(stopped.touch,false);assert.equal(stopped.pointer,null);assert.equal(stopped.guide,false);assert.equal(await p.locator('#joystickZone').isVisible(),false);
  passed.push('Real touch anywhere uses the drag direction rather than screen position; down alone stays still, lift stops immediately, and the fixed joystick is gone');
  await p.evaluate(()=>__mobileTest.fresh());anchor={x:110,y:580,id:1};dragged={x:150,y:580,id:1};await touch('touchStart',[anchor]);await touch('touchMove',[dragged]);
  const other={x:220,y:640,id:2};await touch('touchStart',[dragged,other]);await touch('touchEnd',[other]);assert.equal((await motion()).touch,true);assert.ok((await motion()).dx>0);await touch('touchCancel',[]);assert.equal((await motion()).touch,false);
  for(const reason of ['pause','menu','blur','resize']){
   await p.evaluate(()=>__mobileTest.fresh());await touch('touchStart',[anchor]);await touch('touchMove',[dragged]);
   if(reason==='pause')await p.evaluate(()=>__mobileTest.pause());else if(reason==='menu')await p.evaluate(()=>__mobileTest.menu());else if(reason==='blur')await p.evaluate(()=>window.dispatchEvent(new Event('blur')));else await p.setViewportSize({width:391,height:844});
   await p.waitForTimeout(170);assert.equal((await motion()).touch,false,reason+' clears the gesture');assert.equal((await motion()).pointer,null);await touch('touchCancel',[]);
  }
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__mobileTest.fresh());
  for(let i=0;i<2;i++){await touch('touchStart',[anchor]);await touch('touchMove',[dragged]);await touch('touchEnd',[]);if(i===0){assert.equal((await motion()).dash,0,'One directional drag must not dash');await p.waitForTimeout(70);}}
  assert.ok((await motion()).dash>2.5,'Two quick directional drags trigger dash');
  await p.evaluate(()=>__mobileTest.fresh());await touch('touchStart',[{x:105,y:615,id:1}]);await touch('touchMove',[{x:140,y:615,id:1}]);await p.waitForTimeout(40);const dashBox=await p.locator('#dashButton').boundingBox(),dashTouch={x:dashBox.x+dashBox.width/2,y:dashBox.y+dashBox.height/2,id:2};await touch('touchStart',[{x:140,y:615,id:1},dashTouch]);await touch('touchEnd',[dashTouch]);assert.ok((await motion()).dash>2.5,'A second finger can dash while the movement finger stays down');assert.equal((await motion()).touch,true);await touch('touchEnd',[]);
  await p.evaluate(()=>__mobileTest.fresh());await touch('touchStart',[{x:105,y:615,id:1}]);await touch('touchMove',[{x:140,y:615,id:1}]);const gearBox=await p.locator('#quickGear').boundingBox(),gearTouch={x:gearBox.x+gearBox.width/2,y:gearBox.y+gearBox.height/2,id:2};await touch('touchStart',[{x:140,y:615,id:1},gearTouch]);await touch('touchEnd',[gearTouch]);assert.equal(await p.locator('#gameDrawer').getAttribute('aria-hidden'),'false');assert.equal((await motion()).touch,false);await touch('touchEnd',[]);await p.tap('#drawerClose');
  await p.tap('#quickPause');assert.equal(await p.evaluate(()=>__deepwell.getState().manualPaused),true);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>__deepwell.getState().manualPaused),true,'Delayed native clicks must not toggle twice');await p.tap('#quickPause');assert.equal(await p.evaluate(()=>__deepwell.getState().manualPaused),false);
  passed.push('Secondary-finger release preserves movement; cancel, pause, menus, blur and rotation stop it; three short directional drags dash');
  await p.evaluate(()=>__mobileTest.fresh());assert.equal(await p.locator('#firstWeaponHint').isVisible(),true);const hintBox=await p.locator('#firstWeaponHint').boundingBox(),warningBox=await p.locator('#idleWarning').boundingBox();assert.ok(hintBox.y>=warningBox.y+warningBox.height);
  await p.evaluate(()=>__mobileTest.hint('gold'));assert.ok(await p.locator('#firstWeaponHint').isVisible());assert.equal(await p.evaluate(()=>__mobileTest.hint('fail')),false);assert.ok(await p.locator('#firstWeaponHint').isVisible());
  await p.tap('#firstWeaponHint');assert.equal(await p.locator('[data-workshop-view="equipment"]').getAttribute('aria-pressed'),'true');await p.tap('#drawerClose');
  assert.equal(await p.evaluate(()=>__mobileTest.hint('refine')),true);assert.equal(await p.locator('#firstWeaponHint').isVisible(),false);await p.evaluate(()=>__mobileTest.hint('save'));await p.reload();await p.tap('#introDelve');assert.equal(await p.locator('#firstWeaponHint').isVisible(),false);
  await p.evaluate(()=>__mobileTest.fresh());assert.equal(await p.evaluate(()=>__mobileTest.hint('craft')),true);assert.equal(await p.locator('#firstWeaponHint').isVisible(),false);
  passed.push('The small first-weapon notice sits beneath idle unlock, opens the right crafting hub, survives gold and failed crafting, then stays dismissed after a real craft/refinement and reload');
  await p.evaluate(()=>__mobileTest.fresh(true));await p.tap('#quickGear');assert.equal(await p.locator('#drawerTitle').innerText(),'Inventory');
  const staff=p.locator('[data-weapon="staff"]');await staff.scrollIntoViewIfNeeded();let box=await staff.boundingBox();await p.touchscreen.tap(box.x+8,box.y+box.height/2);assert.equal(await p.evaluate(()=>__deepwell.getState().data.weaponType),'staff');
  const sword=p.locator('[data-weapon="sword"]');await sword.scrollIntoViewIfNeeded();await sword.tap();const book=p.locator('.weapon-option').filter({has:p.locator('[data-weapon="staff"]')}).locator('.codex-link');await book.scrollIntoViewIfNeeded();await book.tap();assert.equal(await p.evaluate(()=>__deepwell.getState().data.weaponType),'sword');await p.tap('#codexClose');assert.equal(await book.evaluate(el=>el===document.activeElement),true);
  await p.tap('[data-equipment-tab="armor"]');const armor=p.locator('[data-equip-armor="magic_1"]');await armor.scrollIntoViewIfNeeded();box=await armor.boundingBox();await p.touchscreen.tap(box.x+5,box.y+box.height-6);assert.equal(await p.evaluate(()=>__deepwell.getState().data.equippedArmor),'magic_1');
  await p.evaluate(()=>__mobileTest.resources());await p.tap('[data-equipment-tab="materials"]');assert.match(await p.locator('#loadoutMaterials').innerText(),/Iron Ore\s+0/);assert.match(await p.locator('#loadoutMaterials').innerText(),/Oak Logs\s+7/);assert.match(await p.locator('#loadoutMaterials').innerText(),/Verdant Seeds\s+2/);assert.match(await p.locator('#loadoutMaterials').innerText(),/Grave Dust\s+5/);
  await p.evaluate(()=>__mobileTest.addLog());assert.match(await p.locator('#loadoutMaterials').innerText(),/Oak Logs\s+8/);await p.locator('#loadoutMaterials [data-source="logs"]').tap();assert.equal(await p.evaluate(()=>__deepwell.getState().scene),'wood');
  passed.push('Weapon rows and armor edges equip on touch; separate Codex buttons do not equip and restore focus; Inventory lists live materials and rare drops with source links');
  const metrics=[];
  for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
   await p.setViewportSize(viewport);await p.evaluate(()=>__mobileTest.fresh(true));
   for(const side of ['left','right']){await p.evaluate(side=>__mobileTest.pins(side),side);const rows=await p.evaluate(()=>__mobileTest.iconMetrics());assert.equal(rows.length,7);for(const row of rows){assert.ok(row.fill>=.9,viewport.width+' '+row.id+' fill '+row.fill);assert.ok(row.x>=0&&row.y>=0&&row.right<=viewport.width+1&&row.bottom<=viewport.height+1);}metrics.push({viewport,side,fill:Math.min(...rows.map(r=>r.fill))});}
   await p.tap('#quickGear');for(const tab of ['weapons','armor','jewelry','materials']){await p.tap('[data-equipment-tab="'+tab+'"]');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  }
  passed.push('All seven pins visibly fill at least 90% of their buttons at 320, 390, landscape and desktop widths on either side; all four Inventory tabs fit');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,metrics,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
