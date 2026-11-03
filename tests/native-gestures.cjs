const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
const {mobileFixture}=require('./mobile-fixture.cjs');

(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 try{
  const context=await runtime.browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,permissions:['clipboard-read','clipboard-write']});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+mobileFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);
  const client=await context.newCDPSession(p),touch=(type,touchPoints)=>client.send('Input.dispatchTouchEvent',{type,touchPoints});
  const state=()=>p.evaluate(()=>__deepwell.getState());
  const mining=async()=>{await p.evaluate(()=>{__mobileTest.fresh();__deepwell.enterActivity('mine');});await p.locator('#skillHold').waitFor({state:'visible'});};
  const point=async selector=>{const b=await p.locator(selector).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2,id:1};};
  const native=selector=>p.locator(selector).first().evaluate(el=>Object.fromEntries(['selectstart','contextmenu','dragstart'].map(type=>[type,el.dispatchEvent(new Event(type,{bubbles:true,cancelable:true}))])));
  const allowed={selectstart:true,contextmenu:true,dragstart:true},blocked={selectstart:false,contextmenu:false,dragstart:false};

  await mining();
  for(const selector of ['#stageWrap','#gameCanvas','#skillHoldText','#quickLocation','#quickPause img']){
   assert.deepEqual(await native(selector),blocked,selector+' suppresses native selection, callouts and image dragging');
   assert.equal(await p.locator(selector).evaluate(el=>getComputedStyle(el).userSelect),'none');
  }
  assert.equal(await p.locator('#stageWrap').evaluate(el=>getComputedStyle(el).touchAction),'auto','Stage must allow scrolling overlays');
  for(const selector of ['#gameCanvas','#skillHold'])assert.equal(await p.locator(selector).evaluate(el=>getComputedStyle(el).touchAction),'none');
  assert.equal(await p.locator('#skillHoldText').evaluate(el=>el.firstChild.dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true}))),false,'Text-node selection events are guarded too');
  const label=await p.locator('#quickLocation').boundingBox();await p.mouse.move(label.x+2,label.y+label.height/2);await p.mouse.down();await p.mouse.move(label.x+label.width-2,label.y+label.height/2,{steps:12});await p.mouse.up();
  assert.equal(await p.evaluate(()=>getSelection().toString()),'','Dragging over HUD text cannot highlight the game');
  passed.push('Gameplay text, nested art and controls reject native selection, callouts and dragging; touch suppression stays on continuous inputs');

  for(const selector of ['#skillHold','#gameCanvas']){
   await mining();const anchor=await point(selector);await touch('touchStart',[anchor]);const before=(await state()).data.ore;
   await p.waitForTimeout(1800);assert.deepEqual(await native(selector),blocked);await p.waitForTimeout(1800);
   assert.equal((await state()).workingSkill,'mine');assert.ok((await state()).data.ore>=before+2,'A sustained hold keeps producing after the native long-press threshold');
   await touch('touchMove',[{...anchor,x:anchor.x-28,y:anchor.y-20}]);assert.equal((await state()).workingSkill,'mine','Dragging a held work pointer continues work');
   await touch(selector==='#skillHold'?'touchEnd':'touchCancel',[]);assert.equal((await state()).workingSkill,'');
   const stopped=(await state()).data.ore;await p.waitForTimeout(2500);assert.equal((await state()).data.ore,stopped,'Release/cancellation stops further production');
  }
  passed.push('Real touch holds on both the work button and mining scene survive long presses and dragging, then stop production on release/cancel');

  for(const selector of ['#gameCanvas','#skillHold'])for(const reason of ['capture','blur','resize','hidden','pagehide']){
   await mining();const anchor=await point(selector);
   await p.locator(selector).evaluate(el=>el.addEventListener('pointerdown',e=>window.__heldPointer=e.pointerId,{once:true}));
   await touch('touchStart',[anchor]);await p.waitForTimeout(60);assert.equal((await state()).workingSkill,'mine');
   if(reason==='capture'){
    // Process pending capture before releasing it; cancelling pending capture
    // alone does not emit lostpointercapture in the Pointer Events spec.
    await touch('touchMove',[{...anchor,x:anchor.x+1}]);
    await p.locator(selector).evaluate(el=>el.releasePointerCapture(window.__heldPointer));
    await touch('touchMove',[{...anchor,x:anchor.x+2}]);
   }else if(reason==='hidden')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});
   else await p.evaluate(reason=>window.dispatchEvent(new Event(reason)),reason);
   await p.waitForFunction(()=>__deepwell.getState().workingSkill==='',null,{timeout:2000}).catch(error=>{throw Error(selector+' / '+reason+': '+error.message);});await touch('touchCancel',[]);
  }
  passed.push('Lost pointer capture, blur, resize, a hidden document and page exit clear work holds on either surface');

  await mining();await touch('touchStart',[await point('#skillHold')]);const bonus=await p.evaluate(()=>{__deepwell.spawnSkillBonus();return __deepwell.bonusInfo()[0];});
  assert.deepEqual(await native('[data-skill-bonus="'+bonus.id+'"]'),blocked);
  const canvas=await p.locator('#gameCanvas').boundingBox();await touch('touchMove',[{x:canvas.x+bonus.x,y:canvas.y+bonus.y,id:1}]);
  assert.equal(await p.evaluate(id=>__deepwell.bonusInfo().some(b=>b.id===id),bonus.id),false,'Dragging a held finger over a bonus still collects it');
  assert.equal((await state()).workingSkill,'mine');await touch('touchEnd',[]);

  await p.evaluate(()=>__mobileTest.fresh());const anchor={x:280,y:610,id:1},dragged={x:240,y:610,id:1};
  await touch('touchStart',[anchor]);await p.waitForTimeout(1600);assert.equal((await p.evaluate(()=>__mobileTest.motion())).x,0,'Long touch without dragging stays still');
  assert.deepEqual(await native('#gameCanvas'),blocked);await touch('touchMove',[dragged]);await p.waitForTimeout(1800);
  assert.ok((await p.evaluate(()=>__mobileTest.motion())).x<-100,'Movement continues throughout a sustained drag');
  await touch('touchEnd',[]);const stopped=await p.evaluate(()=>__mobileTest.motion());await p.waitForTimeout(180);
  assert.equal(stopped.pointer,null);assert.equal(stopped.touch,false);assert.ok(Math.abs((await p.evaluate(()=>__mobileTest.motion())).x-stopped.x)<.1);
  await touch('touchStart',[anchor]);await touch('touchMove',[dragged]);await touch('touchCancel',[]);assert.equal((await p.evaluate(()=>__mobileTest.motion())).touch,false);
  passed.push('Bonus drag collection and sustained arena movement work; a held touch alone stays still and release/cancel stops movement');

  await p.tap('#quickSettings');assert.deepEqual(await native('#settingsView'),allowed);
  const drawer=p.locator('#gameDrawer'),b=await drawer.boundingBox(),x=b.x+b.width/2,y=b.y+b.height*.78;
  await touch('touchStart',[{x,y,id:1}]);for(let step=1;step<=12;step++){await touch('touchMove',[{x,y:y-step*25,id:1}]);await p.waitForTimeout(20);}await touch('touchEnd',[]);
  await p.waitForFunction(()=>document.querySelector('#gameDrawer').scrollTop>50);
  for(const selector of ['#settingsExport','#settingsImport','#settingsImportFile'])assert.deepEqual(await native(selector),allowed);
  await p.locator('#settingsCodes').scrollIntoViewIfNeeded();await p.tap('#settingsCodes');const code=p.locator('#codeInput');await code.fill('editable test');await code.selectText();
  assert.deepEqual(await native('#codeInput'),allowed);await p.keyboard.press('Control+c');await code.fill('');await p.keyboard.press('Control+v');assert.equal(await code.inputValue(),'editable test','Native clipboard copy/paste still works');
  await code.fill('');await p.keyboard.type('egb ');assert.equal(await code.inputValue(),'egb ');assert.equal((await state()).workingSkill,'','Typing game shortcuts in a field must not start gameplay');
  const downloadEvent=p.waitForEvent('download');await p.locator('#settingsExport').click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'Idle_or_Dungeoneer_Save.json');assert.equal(await download.failure(),null);
  const fileEvent=p.waitForEvent('filechooser');await p.locator('#settingsImport').click();assert.equal((await fileEvent).isMultiple(),false);
  passed.push('Menus scroll with real touch; settings fields retain native copy/paste and shortcut typing; backup download and restore picker still open');

  await p.tap('#drawerClose');await p.tap('#quickGear');await p.tap('#equipmentCodex');assert.deepEqual(await native('#codexSearch'),allowed);assert.deepEqual(await native('#overlayCard h2'),allowed);
  const card=await p.locator('#overlayCard').boundingBox(),cx=card.x+card.width/2,cy=card.y+card.height*.8;
  await touch('touchStart',[{x:cx,y:cy,id:1}]);for(let step=1;step<=12;step++){await touch('touchMove',[{x:cx,y:cy-step*25,id:1}]);await p.waitForTimeout(20);}await touch('touchEnd',[]);
  await p.waitForFunction(()=>document.querySelector('#overlayCard').scrollTop>50,null,{timeout:2000});
  await p.locator('#codexSearch').scrollIntoViewIfNeeded();
  await p.locator('#codexSearch').fill('Arming Sword');await p.locator('#codexSearch').selectText();await p.keyboard.press('Control+c');await p.locator('#codexSearch').fill('');await p.keyboard.press('Control+v');assert.equal(await p.locator('#codexSearch').inputValue(),'Arming Sword');
  await p.tap('#codexClose');
  await p.evaluate(()=>{
   const test=document.createElement('div');test.id='nativeFields';test.innerHTML='<textarea>editable textarea</textarea><select><option>native choice</option></select><div contenteditable=""><span>editable content</span></div><div contenteditable="plaintext-only"><span>plain content</span></div><div data-native-selection><span>copyable save text</span><input value="save text"></div>';
   document.querySelector('#stageWrap').append(test);
  });
  for(const selector of ['#nativeFields textarea','#nativeFields select','#nativeFields [contenteditable] span','#nativeFields [contenteditable="plaintext-only"] span','#nativeFields [data-native-selection] span','#nativeFields input']){
   assert.deepEqual(await native(selector),allowed);assert.equal(await p.locator(selector).first().evaluate(el=>getComputedStyle(el).userSelect),'text');
  }
  await p.locator('#nativeFields').evaluate(el=>el.remove());
  passed.push('Codex search, textareas, selects, rich/plain editable descendants and opt-in copyable save text preserve native behavior inside the stage');

  await mining();const hold=p.locator('#skillHold');await hold.focus();const before=(await state()).data.ore;
  await p.keyboard.down('Space');await p.waitForTimeout(2600);assert.ok((await state()).data.ore>=before+2);await p.keyboard.up('Space');assert.equal((await state()).workingSkill,'');
  await p.locator('#quickSettings').focus();await p.keyboard.press('Enter');assert.equal(await drawer.getAttribute('aria-hidden'),'false');await p.keyboard.press('Escape');assert.equal(await p.locator('#quickSettings').evaluate(el=>document.activeElement===el),true);
  await p.evaluate(()=>__mobileTest.fresh());await p.locator('#quickPause').focus();await p.keyboard.down('ArrowRight');await p.waitForTimeout(220);await p.keyboard.up('ArrowRight');assert.ok((await p.evaluate(()=>__mobileTest.motion())).x>10);
  assert.deepEqual(errors,[]);passed.push('Keyboard work, movement, menu activation and focus restoration remain usable');console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
