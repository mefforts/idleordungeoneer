const fs=require('node:fs'),assert=require('node:assert/strict');
const {createRuntime}=require('./runtime.cjs');

// Isolated UI journeys never alter the shipped HTML or use personal saves.
function uxFlowFixture(){
 update=()=>{};
 function fresh(level=20,zone=3){
  if(codexSession)closeCodex();closeDrawer(false);hideOverlay(true);data=defaults();
  data.onboardingDone=data.tutorialSeen=data.skillsNudgeSeen=data.firstMasteryTipSeen=data.essenceEnchantTipSeen=data.voucherIntroSeen=true;
  data.skillAutoReturn=false;data.skillXpCurveVersion=data.artisanProgressionVersion=data.refinementRanksVersion=data.tierProgressionVersion=data.equipmentVersion=1;
  data.floor=zoneStart(zone);data.cleared=zone?zoneEnd(zone-1):0;
  for(const d of Object.values(DISCIPLINES))data[d.xp]=skillXpThreshold(level);
  for(const key of Object.keys(RESOURCE_LABEL))if(key!=='zoneMaterials')data[key]=10000;
  data.gold=10000;data.biomeLoot[0]=1000;data.unlockedWeapons=Object.keys(WEAPON_TYPES);
  normalizeProgression();normalizeZone();ensureJobs();resetRun();tourIndex=-1;
  game.status='running';game.scene='combat';game.manualPaused=game.menuPaused=true;game.enemies=[];game.keys={};
  data.specificVouchers.iron_weapon=1;data.specificVouchers.mithril_weapon=1;
  refreshUI();
 }
 window.__uxFlow={
  fresh,
  state(){return {scene:game.scene,drawer:drawerKind,scroll:$('gameDrawer').scrollTop,focus:document.activeElement?.id,focusKey:document.activeElement?.dataset.focusKey,rank:data.styles.melee.weapon};},
  materials(){equipmentTab='materials';openDrawer('gear');renderEquipmentTab();},
  bench(weapon='sword',rank=1){data.weaponType=weapon;const style=styleForWeapon(weapon);data.styles[style].tier=1;data.styles[style].weapon=rank;data.styles[style].lastWeapon=weapon;projectCombatStyle();openWorkshop(STYLE_DEFS[style].group,'equipment');return {weapon,style,dps:weaponDps(weapon,{equipmentOnly:true}).toFixed(1)};},
  dps(){return weaponDps(data.weaponType,{equipmentOnly:true}).toFixed(1);},
  workshop(group='blacksmithing',view='equipment'){openWorkshop(group,view);},
  scroll(n){$('gameDrawer').scrollTop=n;return $('gameDrawer').scrollTop;},
  sources(){return Object.fromEntries(['gold','arrows','runes'].map(key=>[key,preparationActivity(key)]));},
  training(){return Object.fromEntries(Object.keys(DISCIPLINES).map(group=>[group,{key:trainingActivity(group),tier:SKILLS[trainingActivity(group)].tier||1,usable:canUseSkill(trainingActivity(group))}]));},
  live(){data.mithrilBars++;data.gold+=2;data.discovered.resource_cutSapphires=1;data.cutSapphires=1;refreshUI();},
  history(){data.lootHistory=[{name:'Coal',amount:1,zone:2}];refreshUI();},
  moreHistory(){data.lootHistory.push({name:'Iron ore',amount:2,zone:1});refreshUI();},
  guide(){openVoucherGuide('iron_weapon');},
  empty(){for(const key of Object.keys(RESOURCE_LABEL))if(!['gold','essence','zoneMaterials'].includes(key))data[key]=0;data.specificVouchers={};data.biomeLoot={0:0,1:0,2:0,3:0};data.discovered={};refreshUI();}
 };
}

(async()=>{
 const rt=await createRuntime(),errors=[],passed=[];
 try{
  const original=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=original.replace(seam,'('+uxFlowFixture.toString()+')();'+seam);
  const p=await rt.browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.message));
  await p.route(rt.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(rt.baseURL);
  await p.waitForFunction(()=>window.__uxFlow&&!document.documentElement.classList.contains('game-loading'));
  const call=(name,...args)=>p.evaluate(({name,args})=>__uxFlow[name](...args),{name,args});
  const visible=()=>p.locator('[data-inventory-key]:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.inventoryKey));

  for(const [level,zone,expected]of [[1,0,['scavenge','fletch','rune']],[10,0,['scavenge','fletch','rune']],[10,1,['ancientScavenge','steelFletch','greaterRune']],[20,2,['ancientScavenge','steelFletch','greaterRune']],[20,3,['deepScavenge','mithrilFletch','verdantRune']]]){
   await call('fresh',level,zone);const sources=await call('sources');assert.deepEqual(Object.values(sources),expected);
   for(const [key,scene]of Object.entries(sources)){
    await call('materials');
    // Gold's source is available through a normal recipe ingredient chip.
    if(key==='gold'){await call('workshop');await p.locator('[data-source="gold"]').first().click();}
    else await p.locator('[data-inventory-key="'+key+'"]').click();
    assert.equal((await call('state')).scene,scene);
   }
   const training=await call('training');for(const row of Object.values(training)){assert.ok(row.usable);assert.equal(row.tier,zone===3?3:level>=10&&zone>0?2:1);}
  }
  passed.push('Real ingredient/material links choose the highest unlocked gold, arrow and rune activity; training routes use unlocked tiers through Mithril and respect both Zone and skill gates');

  for(const weapon of ['sword','shield','polearm','greatsword','bow','staff']){
   await call('fresh');const before=await call('bench',weapon),row=p.locator('.craft-tile').filter({has:p.locator('[data-style-upgrade="'+before.style+':weapon"]')});
   const effect=row.locator('.refinement-dps'),match=(await effect.innerText()).match(/^([\d.]+) → ([\d.]+) DPS$/);assert.ok(match);assert.equal(match[1],before.dps);
   const button=row.locator('[data-style-upgrade]');await button.scrollIntoViewIfNeeded();await button.focus();await p.keyboard.press('Enter');
   assert.equal(await call('dps'),match[2]);assert.equal((await call('state')).focusKey,'craft-upgrade:'+before.style+':weapon');
   await p.keyboard.press('Enter');assert.equal(await button.isDisabled(),true);assert.doesNotMatch(await effect.innerText(),/→/);
   assert.ok((await p.evaluate(()=>document.activeElement.classList.contains('codex-link'))));
  }
  await call('fresh');await call('bench');const voucher=p.locator('[data-redeem-voucher="upgrade:melee:weapon"][data-voucher-tier="iron"]');
  await voucher.scrollIntoViewIfNeeded();await voucher.focus();await p.keyboard.press('Enter');
  assert.equal(await voucher.count(),0);assert.equal((await call('state')).focusKey,'craft-upgrade:melee:weapon');
  passed.push('All six weapon refinements preview the actual purchased DPS gain; repeated keyboard upgrades and last-voucher redemption retain useful focus, including at the rank cap');

  await call('fresh');await call('workshop');const skillsScroll=await call('scroll',600);assert.ok(skillsScroll>500);
  await p.locator('#drawerClose').click();await p.locator('#quickShop').click();assert.equal((await call('state')).scroll,0);
  const shopScroll=await call('scroll',400);await p.locator('#drawerClose').click();await p.locator('#quickSettings').click();assert.equal((await call('state')).scroll,0);
  await p.locator('#drawerClose').click();await p.locator('#quickSkills').click();assert.ok(Math.abs((await call('state')).scroll-skillsScroll)<2);
  await call('workshop','woodworking','equipment');assert.equal((await call('state')).scroll,0);
  await call('scroll',350);await call('workshop','blacksmithing','equipment');assert.ok(Math.abs((await call('state')).scroll-skillsScroll)<2);
  await p.locator('#drawerClose').click();await p.locator('#quickShop').click();assert.ok(Math.abs((await call('state')).scroll-shopScroll)<2);
  // Keep the source pane's position while exercising the header navigation.
  await p.locator('[data-dungeon-shop-view="blessings"]').evaluate(el=>el.click());assert.equal((await call('state')).scroll,0);
  await p.locator('[data-dungeon-shop-view="abilities"]').evaluate(el=>el.click());assert.ok(Math.abs((await call('state')).scroll-shopScroll)<2);
  passed.push('Skills, each discipline/view, Shop sections and other menus remember their own scroll; first visits open at the top and reopening restores the previous position');

  await call('fresh');await call('materials');const input=p.locator('#materialSearch');await input.fill('mItHrIl');
  assert.ok((await visible()).length>=3);assert.ok((await visible()).every(k=>k.toLowerCase().includes('mithril')));
  await input.focus();await input.evaluate(el=>{window.__uxSearchInput=el;el.setSelectionRange(3,3);});await call('live');
  assert.ok(await input.evaluate(el=>el===window.__uxSearchInput&&document.activeElement===el&&el.selectionStart===3));assert.equal(await input.inputValue(),'mItHrIl');
  assert.match(await p.locator('[data-inventory-key="mithrilBars"]').getAttribute('aria-label'),/10,001/);
  await input.fill('mithril voucher');assert.deepEqual(await visible(),['voucher_mithril_weapon']);
  await input.fill('no such item');assert.ok(await p.locator('#materialSearchEmpty').isVisible());assert.equal((await visible()).length,0);
  await p.locator('#materialSearchClear').click();assert.equal(await input.inputValue(),'');assert.equal((await call('state')).focus,'materialSearch');
  await call('history');await p.locator('.loot-history summary').click();await call('moreHistory');assert.ok(await p.locator('.loot-history').evaluate(el=>el.open));
  await input.fill('coal');assert.equal(await p.locator('.loot-history').isVisible(),false);
  await p.keyboard.press('Escape');assert.equal(await input.inputValue(),'');assert.equal((await call('state')).drawer,'gear');assert.ok(await p.locator('.loot-history').evaluate(el=>el.open));
  await p.keyboard.press('Escape');assert.equal((await call('state')).drawer,'');
  await p.locator('#quickGear').click();assert.equal(await input.inputValue(),'');
  await input.fill('coal');await call('guide');await p.locator('.voucher-guide-back').click();
  assert.equal(await input.inputValue(),'');assert.ok(await p.locator('[data-inventory-key="voucher_iron_weapon"]').isVisible());assert.equal((await call('state')).focusKey,'inventory-voucher_iron_weapon');
  await input.fill('');await input.focus();await p.keyboard.type('b c e g');assert.equal((await call('state')).drawer,'gear');
  await call('empty');assert.ok(await p.locator('#materialSearchEmpty').isVisible());await p.locator('#materialSearchClear').click();assert.ok(await p.locator('#materialInventoryRows .empty-loadout').isVisible());
  passed.push('Material search supports case-insensitive multiword queries, clear/empty states and Escape; live item/count/history changes preserve the input, caret and open receipts; voucher return reveals its target and typing cannot trigger gameplay shortcuts');

  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
   await p.setViewportSize(viewport);await call('fresh');await call('materials');await input.fill('voucher');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const clear=await p.locator('#materialSearchClear').boundingBox();assert.ok(clear.width>=44&&clear.height>=44);
   assert.ok(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
   await p.screenshot({path:rt.resultsDir+'/ux-material-search-'+viewport.width+'.png'});
   await call('bench','staff');const preview=p.locator('.refinement-dps');await preview.scrollIntoViewIfNeeded();assert.ok(await preview.isVisible());
   assert.ok(await preview.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=12));
   await preview.evaluate(el=>el.closest('article').scrollIntoView({block:'center'}));await p.screenshot({path:rt.resultsDir+'/ux-refinement-preview-'+viewport.width+'.png'});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  passed.push('Search, voucher results and DPS previews fit small phones, landscape and desktop with 44px search controls and no horizontal overflow');
  assert.deepEqual(errors,[]);assert.equal(fs.readFileSync('index.html','utf8'),original);
  const report={passed,errors};fs.writeFileSync(rt.resultsDir+'/ux-flow.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await rt.close();}
})().catch(e=>{console.error(e);process.exit(1)});
