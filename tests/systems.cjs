const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const {createRuntime}=require('./runtime.cjs');
(async()=>{
 const runtime=await createRuntime();const {browser,baseURL,resultsDir}=runtime;const errors=[],passed=[];
 try{
  const initial=await browser.newPage();await initial.goto(baseURL);const base=await initial.evaluate(()=>__deepwell.getState().data);await initial.close();
  async function profile(patch={},viewport={width:1440,height:1000},fixedRandom=false){
   const c=await browser.newContext({viewport});const seed={...base,onboardingDone:true,tutorialSeen:true,savedAt:Date.now(),...patch};if((patch.zone||patch.mastery)&&patch.zoneShopVersion===undefined){seed.zoneShopVersion=0;seed.zoneAbilityVersion=0;}if(patch.styles===null&&patch.equipmentVersion===undefined)seed.equipmentVersion=0;
   await c.addInitScript(({seed,fixedRandom})=>{if(!sessionStorage.getItem('systems-seeded')){localStorage.setItem('deepwell-prototype-v1',JSON.stringify(seed));sessionStorage.setItem('systems-seeded','1');}if(fixedRandom)Math.random=()=>.01;},{seed,fixedRandom});
   const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route(baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','window.__systemsCompleteFloor=()=>clearFloor();window.__systemsCommonBonus=()=>{const roll=rollSkillBonusRarity;rollSkillBonusRarity=()=>SKILL_BONUS_RARITIES[0];try{return spawnSkillBonus();}finally{rollSkillBonusRarity=roll;}};resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);')}));await p.goto(baseURL);await p.waitForFunction(()=>window.__deepwell&&!document.documentElement.classList.contains('game-loading'));return {c,p};
  }
  const rich={gold:10000,ore:20000,silverOre:1000,opals:100,cutOpals:10,bars:2000,logs:2000,cloth:2000,scraps:2000,arrows:1000,runes:1000,essence:1000,blacksmithXp:3000};
  {
   const {c,p}=await profile({styles:null,stationLevels:null,progressionVersion:1,weapon:3,armor:2,enchant:1,skillBoosts:{blacksmithing:1},weaponType:'bow',unlockedWeapons:['sword','bow']});
   const st=await p.evaluate(()=>__deepwell.getState());for(const s of Object.values(st.data.styles)){assert.equal(s.weapon,3);assert.equal(s.armor,2);assert.equal(s.enchant,1);}assert.equal(st.data.stationLevels.blacksmithing,1);assert.equal(st.data.weapon,3);assert.equal(st.combatStyle,'ranged');
   await p.reload();assert.equal((await p.evaluate(()=>__deepwell.getState())).data.styles.melee.weapon,3);passed.push('Legacy upgrades migrate once to all three independent styles; legacy station bonuses remain');await c.close();
  }
  {
   const {c,p}=await profile({logs:5,bars:2,cloth:6,scraps:4});
   const out=await p.evaluate(()=>{__deepwell.produce('fletch',true);__deepwell.produce('rune',true);return __deepwell.getState().data;});
   assert.deepEqual([out.logs,out.bars,out.arrows,out.cloth,out.scraps,out.runes],[3,1,8,4,2,6]);
   await p.evaluate(()=>__deepwell.produce('fletch',true));const fail=await p.evaluate(()=>({result:__deepwell.produce('fletch',true),data:__deepwell.getState().data}));assert.equal(fail.result,false);assert.equal(fail.data.logs,1);assert.equal(fail.data.bars,0);
   passed.push('Arrows consume logs + iron; runes consume cloth + salvage; missing inputs block production');await c.close();
  }
  {
   const {c,p}=await profile(rich);const timings=await p.evaluate(()=>{const before=__deepwell.skillInterval('forge');__deepwell.upgradeSkill('blacksmithing');return {before,after:__deepwell.skillInterval('forge'),idle:__deepwell.skillInterval('forge',false)};});assert.ok(timings.after<timings.before);assert.ok(Math.abs(timings.after-2.8/1.03)<1e-6);
   const result=await p.evaluate(()=>{const before=__deepwell.getState().data.ore;for(let i=0;i<50;i++)__deepwell.produce('forge',true);return {spent:before-__deepwell.getState().data.ore,data:__deepwell.getState().data};});assert.equal(result.spent,98);assert.equal(result.data.stationSaved.blacksmithing,2);assert.ok(Number.isInteger(result.data.ore));
   await p.evaluate(()=>{for(let i=0;i<4;i++)__deepwell.upgradeSkill('blacksmithing')});assert.equal(await p.evaluate(()=>__deepwell.upgradeSkill('blacksmithing')),false);assert.equal((await p.evaluate(()=>__deepwell.getState())).data.stationLevels.blacksmithing,5);
   await p.click('#introSkills');await p.click('#quickSkills');await p.click('[data-workshop-view="tools"]');await p.screenshot({path:path.join(resultsDir,'systems-tools-station.png')});
   passed.push('Station levels cap at five; speed improves; ingredient conservation saves whole items without fractional inventory');await c.close();
  }
  {
   const {c,p}=await profile(rich);const tool=await p.evaluate(()=>{const before=__deepwell.skillInterval('mine'),bars=__deepwell.getState().data.bars;const made=__deepwell.makeTool('pickaxe'),after=__deepwell.skillInterval('mine');return {before,after,made,bars:bars-__deepwell.getState().data.bars,duplicate:__deepwell.makeTool('pickaxe')};});assert.equal(tool.made,true);assert.equal(tool.duplicate,false);assert.equal(tool.bars,4);assert.ok(Math.abs(tool.after-tool.before/1.08)<1e-6);
   await p.evaluate(()=>{__deepwell.makeTool('hatchet');__deepwell.makeTool('mattock');__deepwell.enterActivity('scavenge')});assert.match(await p.locator('#activeTool').innerText(),/Iron Mattock/);await p.screenshot({path:path.join(resultsDir,'systems-mattock.png')});
   passed.push('Pickaxe, hatchet and mattock craft once, equip automatically, appear at stations and improve gathering');await c.close();
  }
  {
   const {c,p}=await profile({...rich,unlockedWeapons:['sword','shield','polearm','greatsword','bow','staff']});
   await p.evaluate(()=>__deepwell.craftStyleUpgrade('melee','weapon'));let st=await p.evaluate(()=>__deepwell.getState());assert.equal(st.data.styles.melee.weapon,1);assert.equal(st.data.styles.ranged.weapon,0);assert.equal(st.data.styles.magic.weapon,0);assert.ok(st.attackDamage>14&&st.attackDamage<30);
   const armorCosts=await p.evaluate(()=>Object.fromEntries(['melee','ranged','magic'].map(s=>[s,__deepwell.styleUpgradeCost(s,'armor')])));assert.deepEqual(armorCosts.melee,{bars:6,gold:25});assert.deepEqual(armorCosts.ranged,{bars:3,cloth:6,gold:25});assert.deepEqual(armorCosts.magic,{bars:2,cloth:12,gold:25});
   await p.evaluate(()=>{__deepwell.makeArmor('ranged_1');__deepwell.craftStyleUpgrade('ranged','armor');__deepwell.craftStyleUpgrade('magic','speed');__deepwell.craftStyleUpgrade('magic','reach');__deepwell.craftStyleUpgrade('magic','enchant');__deepwell.openDrawer('gear')});await p.click('[data-weapon="bow"]');st=await p.evaluate(()=>__deepwell.getState());assert.equal(st.combatStyle,'ranged');assert.equal(st.data.weapon,0);assert.equal(st.maxHp,152);assert.equal(st.data.enchant,0);assert.equal(st.attackReach,295);assert.equal(st.data.styles.magic.enchant,1);
   const hp=st.hp;await p.click('[data-weapon="staff"]');st=await p.evaluate(()=>__deepwell.getState());assert.equal(st.combatStyle,'magic');assert.equal(st.data.enchant,1);assert.ok(Math.abs(st.attackCooldown-1.36/1.02)<1e-6);assert.ok(Math.abs(st.attackReach-260*1.03)<1e-6);assert.equal(st.hp,hp);assert.equal(st.maxHp,152);assert.equal(st.data.equippedArmor,'ranged_1');assert.equal((await p.evaluate(()=>__deepwell.avatarAppearance())).chest,'ranger');
   await p.screenshot({path:path.join(resultsDir,'systems-combat-styles.png')});passed.push('Permanent combat modifiers remain style-specific; crafted armor stays worn when changing weapons; switching does not heal');await c.close();
  }
  {
   const {c,p}=await profile();await p.click('#introSkills');assert.equal(await p.locator('#quickSkills .nav-label').innerText(),'Skills');assert.ok(await p.locator('#idleWarning').isVisible());assert.match(await p.locator('#idleWarning').innerText(),/Zone 1.*Floor 2/);
   const hold=await p.locator('#skillHold').boundingBox();await p.mouse.move(hold.x+hold.width/2,hold.y+hold.height/2);await p.mouse.down();await p.waitForFunction(()=>__deepwell.bonusInfo().length>0,null,{timeout:4000});
   const token=await p.evaluate(()=>__deepwell.bonusInfo()[0]),before=await p.evaluate(()=>__deepwell.getState().data.ore);const arena=await p.locator('#gameCanvas').boundingBox();await p.mouse.move(arena.x+token.x,arena.y+token.y,{steps:10});await p.mouse.up();assert.equal((await p.evaluate(()=>__deepwell.getState())).data.ore,before+1);assert.equal(await p.evaluate(id=>__deepwell.claimSkillBonus(id),token.id),false);
   await p.evaluate(()=>__deepwell.spawnSkillBonus());await p.screenshot({path:path.join(resultsDir,'systems-active-bonus.png')});await p.click('#quickSkills');assert.equal(await p.locator('[data-skill-bonus]').count(),0);
   passed.push('Bonuses spawn during active work, support captured drag gestures, reward once, and clear on menus');await c.close();
  }
  {
   const {c,p}=await profile({...rich,ore:8});await p.click('#introSkills');await p.evaluate(()=>{__deepwell.enterActivity('forge');__deepwell.activeSkill('forge')});const before=await p.evaluate(()=>__deepwell.getState().data);
   await p.evaluate(()=>{for(let i=0;i<3;i++){const id=__systemsCommonBonus();if(id)__deepwell.claimSkillBonus(id)}});const after=await p.evaluate(()=>__deepwell.getState().data);assert.equal(after.bars,before.bars);assert.equal(after.ore,before.ore);assert.ok(after.skillingBuffs.some(b=>b.key==='forge'&&b.left>0));
   await p.evaluate(()=>{while(__deepwell.getState().data.ore>=2)__deepwell.produce('forge',true)});assert.equal(await p.evaluate(()=>__deepwell.spawnSkillBonus()),false);
   passed.push('Crafting sparks grant timed speed instead of instant crafts; missing resources prevent free crafts');await c.close();
  }
  {
   const {c,p}=await profile({...rich,cleared:27,floor:28});await p.click('#introSkills');await p.click('#quickSkills');await p.locator('[data-idle-skill="mine"]').first().click();assert.deepEqual((await p.evaluate(()=>__deepwell.getState())).data.idleJobs,['mine','']);
   await p.click('[data-workshop-view="refine"]');await p.locator('[data-idle-skill="forge"]').first().click();assert.deepEqual((await p.evaluate(()=>__deepwell.getState())).data.idleJobs,['mine','forge']);
   await p.click('[data-workshop-group="woodworking"]');await p.click('[data-workshop-view="gather"]');await p.locator('[data-idle-skill="wood"]').first().click();assert.ok(await p.locator('.idle-choice').isVisible());assert.deepEqual((await p.evaluate(()=>__deepwell.getState())).data.idleJobs,['mine','forge']);await p.click('[data-replace-idle="1"]');assert.deepEqual((await p.evaluate(()=>__deepwell.getState())).data.idleJobs,['mine','wood']);
   for(const g of ['blacksmithing','woodworking','warding','scavenging','artisan']){await p.click(`[data-workshop-group="${g}"]`);assert.ok(await p.locator('#consolidatedSkills button[data-idle-skill]').count());}assert.equal(await p.locator('#idleManager select').count(),0);await p.screenshot({path:path.join(resultsDir,'systems-idle-hub.png')});
   await p.evaluate(()=>__deepwell.enterActivity('mine'));await p.waitForTimeout(1600);assert.match(await p.locator('#activityDetails').innerText(),/Idling/);assert.equal((await p.evaluate(()=>__deepwell.bonusInfo())).length,0,'Idle work alone must not spawn active bonuses');const idleOre=await p.evaluate(()=>__deepwell.getState().data.ore);await p.evaluate(()=>__deepwell.advanceProduction(7));assert.ok((await p.evaluate(()=>__deepwell.getState())).data.ore>=idleOre+2);
   passed.push('Every skill hub has direct Idle buttons; two occupied slots use an explicit replacement chooser; no dropdown is required');await c.close();
  }
  {
   const {c,p}=await profile({gold:150});await p.click('#introDelve');await p.waitForTimeout(200);assert.ok(await p.locator('#firstWeaponHint').isVisible());await p.click('#firstWeaponHint');assert.equal(await p.locator('#drawerTitle').innerText(),'Skills');assert.equal(await p.locator('[data-workshop-view="equipment"]').getAttribute('aria-pressed'),'true');assert.equal((await p.evaluate(()=>__deepwell.getState())).data.firstWeaponCrafted,false);passed.push('New players retain the small first-weapon Skills link at 150 gold until they actually craft or refine');await c.close();
  }
  {
   const {c,p}=await profile({styles:null,weapon:10,armor:5,weaponType:'greatsword',unlockedWeapons:['sword','greatsword'],masteryIntroSeen:true,mastery:{0:{points:0,earned:15,onslaught:5,intensity:5,fortune:0,adaptation:0}},zone:{index:0,upgrades:{might:6,haste:6,cleave:4,ward:4,vitality:5,regen:4},level:99,xp:0,required:1000000}});
   await p.click('#introDelve');await p.evaluate(()=>__systemsCompleteFloor());await p.waitForSelector('#selectIdleTask',{timeout:20000});assert.match(await p.locator('.progression-tip').innerText(),/second.*Zone 2/);assert.equal((await p.evaluate(()=>__deepwell.getState())).data.cleared,1);await p.click('#selectIdleTask');assert.equal(await p.locator('#drawerTitle').innerText(),'Skills');await p.locator('[data-idle-skill="mine"]').first().click();assert.equal((await p.evaluate(()=>__deepwell.getState())).data.idleJobs[0],'mine');
   passed.push('Actually clearing Floor 1 shows Select an idle task, which opens Skills and starts an idle task directly');await c.close();
  }
  {
   const {c,p}=await profile({...rich,cleared:1,floor:2});await p.click('#introSkills');
   for(const key of ['mine','silverMine','wood','scavenge','forge','silverSmelt','fletch','ward','rune','polish']){
    await p.evaluate(key=>__deepwell.enterActivity(key),key);const id=await p.evaluate(()=>__deepwell.spawnSkillBonus());assert.ok(id,key+' should support an active bonus');
    const img=p.locator('[data-skill-bonus] img').first();await img.evaluate(i=>i.decode());assert.ok(await img.evaluate(i=>i.naturalWidth>0));assert.equal(await p.evaluate(id=>__deepwell.claimSkillBonus(id),id),true);
   }
   passed.push('All ten activities have loaded, collectable, correctly bounded bonus artwork');await c.close();
  }
  {
   const {c,p}=await profile({gold:150},{width:390,height:844});await p.click('#introDelve');await p.waitForTimeout(200);const n=await p.locator('#firstWeaponHint').boundingBox(),d=await p.locator('#dashButton').boundingBox();assert.equal(await p.locator('#joystickZone').isVisible(),false);assert.ok(n.y+n.height<d.y);passed.push('Mobile weapon guidance leaves drag movement and dash unobstructed');await c.close();
  }
  // A half-refined weapon can kill Zone 3 targets while exercising hit effects, even with guaranteed critical hits.
  for(const weapon of ['sword','bow','staff']){
   const {c,p}=await profile({styles:null,floor:16,cleared:15,weapon:5,armor:40,weaponType:weapon,unlockedWeapons:['sword','bow','staff'],arrows:500,runes:500,masteryIntroSeen:true,mastery:{0:{points:0,earned:15,onslaught:5,intensity:5,fortune:0,adaptation:0}},dungeonShopVersion:1,dungeonShops:{deepwell:{currency:0,earned:10,ranks:{storm:1}}},zone:{index:2,upgrades:{},level:1,xp:0,required:1000000}},undefined,true);
   await p.click('#introDelve');await p.waitForFunction(()=>__deepwell.getState().effectCounts.lightning>0,null,{timeout:10000});await p.waitForFunction(()=>__deepwell.getState().data.styles[__deepwell.getState().combatStyle].xp>0,null,{timeout:10000});const st=await p.evaluate(()=>__deepwell.getState());assert.equal(st.upgrades.storm,1);assert.ok(st.data.styles[st.combatStyle].xp>0);for(const id of ['melee','ranged','magic'].filter(x=>x!==st.combatStyle))assert.equal(st.data.styles[id].xp,0);await c.close();
  }
  passed.push('Real melee, ranged and magic attacks all trigger purchased Dungeon chain lightning; combat proficiency credits the wielded style');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close()}
})().catch(e=>{console.error(e);process.exit(1)});
