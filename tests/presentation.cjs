const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createRuntime} = require('./runtime.cjs');

// Fixture hooks are injected only into this browser's response.
function instrumentation() {
  window.__presentationTest = {
    fresh() {
      if(codexSession)closeCodex();
      closeDrawer();hideOverlay();data=defaults();data.floor=4;data.cleared=3;
      data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=data.zone2SkillsAnnounced=true;
      data.ownedArmor=['melee_1','magic_1'];data.equippedArmor='melee_1';
      data.equipmentVersion=data.tierProgressionVersion=1;
      data.unlockedWeapons=['sword','bow','staff'];data.weaponType='sword';
      for(const key of Object.keys(RESOURCE_LABEL))data[key]=1000;
      for(const d of Object.values(DISCIPLINES))data[d.xp]=3000;
      data.mastery={0:{points:8,earned:8,onslaught:0,fortune:0,adaptation:0,intensity:0},1:{points:8,earned:8,onslaught:0,fortune:0,adaptation:0,intensity:0}};
      normalizeProgression();normalizeZone();ensureJobs();seedCodex();resetRun();masteryDraft=null;
      equipmentTab='weapons';game.status='ready';game.manualPaused=game.menuPaused=false;
      enterActivity('mine');refreshUI();
    },
    patch(values) { Object.assign(data,values);projectCombatStyle();refreshUI(); },
    track(goal) { data.craftGoal=goal;refreshUI(); },
    offers() {
      closeDrawer();game.status='upgrade';game.pendingLevels=2;game.runLevel=4;
      game.upgrades={fire:1};Math.random=()=>.24;showUpgrade();
    },
    snapshot() { return {pending:game.pendingLevels,upgrades:{...game.upgrades},choices:game.levelChoices.map(u=>u.id),draft:masteryDraft?{...masteryDraft}:null}; },
    mastery() { closeDrawer();game.status='ready';showMastery(); },
    read(id) { showCodex(id); },
    levelOnly(xp) {data.wardingSkillXp=xp;refreshUI();},
    inspectAll() {data.discovered=Object.fromEntries(CODEX_ITEMS.map(e=>[e.id,1]));return CODEX_ITEMS.map(e=>e.id);}
  };
}

(async()=>{
  const runtime=await createRuntime(),errors=[],passed=[];
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  try {
    const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});
    p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
    await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);
    await p.click('#introDelve');assert.equal((await p.evaluate(()=>__deepwell.getState())).status,'running');
    assert.equal(await p.locator('#overlay').isVisible(),false,'A fresh delve starts without a blocking tour');
    const before=await p.evaluate(()=>__deepwell.getState().player.x);await p.keyboard.down('KeyD');await p.waitForTimeout(180);await p.keyboard.up('KeyD');
    assert.ok((await p.evaluate(()=>__deepwell.getState().player.x))>before,'The first movement key works immediately');
    passed.push('First Delve starts immediately, with a non-blocking movement hint');

    await p.evaluate(()=>__presentationTest.fresh());await p.click('#skillGather');assert.equal(await p.locator('#drawerTitle').innerText(),'Skills');await p.click('[data-workshop-view="equipment"]');
    const recipe=p.locator('.compact-recipe').filter({has:p.locator('[data-recipe-weapon="polearm"]')});
    await recipe.locator('[data-track-goal]').click();
    const source=recipe.locator('[data-source="bars"]');assert.equal(await source.getAttribute('type'),'button');
    await source.click();assert.equal((await p.evaluate(()=>__deepwell.getState())).scene,'forge');await p.click('#trackedRecipe');
    assert.equal(await p.locator('[data-workshop-view="equipment"]').getAttribute('aria-pressed'),'true');
    const book=recipe.locator('[data-codex-entry]');await book.click();
    assert.equal(await p.locator('#gameDrawer').getAttribute('aria-hidden'),'true');assert.match(await p.locator('#codexReading').innerText(),/Halberd/);assert.match(await p.locator('#codexReading').innerText(),/Refinement/);
    await p.click('#codexClose');assert.equal(await p.locator('#gameDrawer').isVisible(),true);
    assert.equal(await p.locator('#overlay').isVisible(),false);assert.equal(await book.evaluate(e=>e===document.activeElement),true,'Closing a recipe reference restores its originating control');
    const costs=await p.evaluate(()=>__deepwell.getState().data);await recipe.locator('[data-recipe-weapon]').click();
    const crafted=await p.evaluate(()=>__deepwell.getState().data);assert.ok(crafted.unlockedWeapons.includes('polearm'));assert.equal(crafted.weaponType,'polearm');assert.ok(crafted.bars<costs.bars);
    assert.equal(await p.locator('#trackedRecipe').isVisible(),false,'Completed recipe bookmarks clear');
    passed.push('Recipe costs lead to material sources; bookmarks return to the recipe; crafting consumes materials and equips the result');
    const refine=p.locator('[data-style-upgrade="melee:weapon"]');await refine.focus();await p.keyboard.press('Enter');await p.keyboard.press('Enter');
    assert.equal((await p.evaluate(()=>__deepwell.getState().data.styles.melee.weapon)),2);assert.equal(await refine.evaluate(e=>e===document.activeElement),true,'Repeated upgrades retain keyboard focus');
    passed.push('Keyboard upgrades retain focus through resource and rank refreshes');

    await p.evaluate(()=>__presentationTest.fresh());await p.evaluate(()=>__presentationTest.patch({blacksmithXp:0}));await p.evaluate(()=>__presentationTest.track('weapon:polearm'));
    assert.match(await p.locator('#trackedRecipe').innerText(),/Blacksmithing 6/);assert.doesNotMatch(await p.locator('#trackedRecipe').innerText(),/Ready/);
    await p.evaluate(()=>__presentationTest.track('armor:melee_2'));assert.doesNotMatch(await p.locator('#trackedRecipe').innerText(),/Ready/);
    passed.push('Recipe bookmarks show unmet skill requirements even when all materials are owned');

    await p.evaluate(()=>__presentationTest.fresh());await p.click('#quickGear');
    await p.click('[data-weapon="staff"]');const oldDps=await p.locator('#combatReadiness b').first().innerText();
    await p.click('[data-equipment-tab="armor"]');await p.click('[data-equip-armor="magic_1"]');
    const robeDps=await p.locator('#combatReadiness b').first().innerText();assert.ok(Number(robeDps)>Number(oldDps));
    await p.evaluate(()=>__presentationTest.levelOnly(1e8));await p.waitForTimeout(180);
    assert.ok(Number(await p.locator('#combatReadiness b').first().innerText())>Number(robeDps));
    passed.push('Equipment DPS refreshes after armor changes and crafting levels, without an unrelated gear change');

    await p.evaluate(()=>__presentationTest.offers());const offers=await p.evaluate(()=>__presentationTest.snapshot());
    await p.locator('.power-offer [data-codex-entry]').first().click();await p.keyboard.press('Digit1');
    assert.deepEqual(await p.evaluate(()=>__presentationTest.snapshot()),offers,'Reading a power never selects the hidden card');
    await p.click('#codexClose');assert.equal(await p.locator('[data-pick]').count(),3);
    assert.deepEqual(await p.evaluate(()=>__presentationTest.snapshot()),offers,'Same power offers and rank values return');
    await p.locator('[data-pick="0"]').click();assert.equal((await p.evaluate(()=>__presentationTest.snapshot())).pending,1);
    passed.push('Codex reading preserves queued power cards and blocks hidden number-key selection');

    await p.evaluate(()=>__presentationTest.fresh());await p.evaluate(()=>__presentationTest.mastery());await p.click('[data-invest="onslaught"]');
    const draft=await p.evaluate(()=>__presentationTest.snapshot());await p.click('[data-codex-entry="permanent_mastery"]');
    await p.click('#codexClose');assert.deepEqual(await p.evaluate(()=>__presentationTest.snapshot()),draft);
    assert.equal((await p.evaluate(()=>__deepwell.getState().data.mastery[1].points)),8,'Reading does not apply Mastery');
    await p.click('#applyMastery');await p.click('#masteryDecisionConfirm');assert.equal((await p.evaluate(()=>__deepwell.getState().data.mastery[1].points)),7);
    passed.push('Mastery edits survive reading a guide and spend points only after Apply');

    await p.evaluate(()=>__presentationTest.fresh());await p.evaluate(()=>__presentationTest.read());await p.fill('#codexSearch','Halberd');
    const matches=await p.locator('[data-read-codex]').count();await p.locator('[data-read-codex="weapon_polearm"]').click();await p.click('#codexBack');
    assert.equal(await p.locator('#codexSearch').inputValue(),'Halberd');assert.equal(await p.locator('[data-read-codex]').count(),matches);
    assert.equal(await p.locator('[data-read-codex="weapon_polearm"]').evaluate(e=>e===document.activeElement),true);
    const entries=await p.evaluate(()=>__presentationTest.inspectAll());
    for(const id of entries){await p.evaluate(id=>__presentationTest.read(id),id);assert.doesNotMatch(await p.locator('#codexReading').innerText(),/undefined|NaN|\[object Object\]/);}
    await p.evaluate(()=>__presentationTest.read('controls'));assert.equal(await p.locator('#codexReading img').count(),0,'The controls guide uses a real vector glyph');await p.locator('#overlayCard').evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await p.locator('#codexClose').isVisible());assert.ok((await p.locator('#codexClose').boundingBox()).y>=0,'Close stays reachable through long entries');await p.click('#codexClose');
    passed.push('All 104 Codex entries open readable details; Back preserves search and keyboard focus');

    for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
      await p.setViewportSize(viewport);await p.evaluate(()=>__presentationTest.fresh());
      for(const side of ['left','right']){
        await p.click('#quickSettings');await p.click('[data-hud-side="'+side+'"]');await p.click('#drawerClose');
        const boxes=await p.evaluate(()=>({work:document.getElementById('skillActionBar').getBoundingClientRect().toJSON(),nav:document.querySelector('.hud-actions').getBoundingClientRect().toJSON()}));
        assert.ok(boxes.work.right<=boxes.nav.left||boxes.work.left>=boxes.nav.right||boxes.work.bottom<=boxes.nav.top||boxes.work.top>=boxes.nav.bottom,viewport.width+'px controls leave either rail clear');
        await p.click('#quickSkills');await p.click('[data-workshop-view="equipment"]');
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
        const unlabeled=await p.locator('#gameDrawer button:visible').evaluateAll(bs=>bs.filter(b=>!b.getAttribute('aria-label')&&!b.getAttribute('aria-labelledby')&&!b.textContent.trim()).map(b=>b.outerHTML.slice(0,150)));assert.deepEqual(unlabeled,[]);
        assert.doesNotMatch(await p.locator('#gameDrawer').innerText(),/intended|reference build|ceiling|independent progression|this version|future pass|all materials ready|permanent loadout/i);
        await p.locator('[data-codex-entry="weapon_polearm"]').click();await p.click('#codexClose');await p.click('#drawerClose');
      }
    }
    passed.push('320px, phone, landscape and desktop layouts keep both rail positions reachable, all icon actions labeled and design commentary out of game menus');
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(runtime.resultsDir,'presentation-results.json'),JSON.stringify({passed,errors},null,2)+'\n');console.log(JSON.stringify({passed,errors},null,2));
  } finally {await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
