const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
function instrumentation(){
 function fresh(zone2=false){data=defaults();data.floor=zone2?zoneStart(1):1;data.cleared=zone2?zoneEnd(0):0;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;normalizeProgression();resetRun();hideOverlay();closeDrawer();game.status='ready';game.manualPaused=game.menuPaused=false;refreshUI();}
 function rich(){for(const key of Object.keys(RESOURCE_LABEL))data[key]=100000;for(const key of Object.values(DISCIPLINES).map(g=>g.xp))data[key]=8000;}
 window.__tierTest={
  fresh,rich,
  locked(){fresh();rich();const before=data.coal;return {produce:produce('coal',true),idle:setIdleJob(0,'coal'),promote:promoteStyle('melee'),armor:makeArmor('melee_2'),entry:enterActivity('coal'),before,after:data.coal};},
  clearZone(){fresh();data.floor=zoneEnd(0);data.cleared=zoneEnd(0)-1;normalizeZone();game.phase=5;nextPhase();return {floor:data.floor,cleared:data.cleared,open:tier2Unlocked(),announced:data.zone2SkillsAnnounced};},
  materials(){fresh(true);rich();data.stationLevels=Object.fromEntries(Object.keys(DISCIPLINES).map(k=>[k,0]));data.stationCredits={};for(const k of Object.keys(DISCIPLINES))data.stationCredits[k]={};
   const keys=['ore','coal','steelBars','willowLogs','cloth','runicCloth','ancientSalvage','ancientFragments','arrows','runes','garnets','cutGarnets'];
   const changes=[];for(const key of ['steelSmelt','cleanAncient','aetherWeave','steelFletch','greaterRune','garnetCut']){const before=Object.fromEntries(keys.map(k=>[k,data[k]])),made=produce(key,true);changes.push({key,made,delta:Object.fromEntries(keys.map(k=>[k,data[k]-before[k]]).filter(([,n])=>n))});}return changes;},
  dps(tier,dedicated=false){fresh(tier===2);const rows=[];for(const id of Object.keys(WEAPON_TYPES)){
   const style=styleForWeapon(id);data.weaponType=id;data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.styles[style].tier=tier;data.styles[style].weapon=TIER_LIMITS[tier].weapon;data.styles[style].speed=TIER_LIMITS[tier].speed;data.styles[style].xp=dedicated?80*49**2:0;
   data[DISCIPLINES[STYLE_DEFS[style].group].xp]=dedicated?1e8:0;data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;projectCombatStyle();rows.push({id,now:weaponDps(id),damage:attackDamage(),cooldown:attackCooldown(),reported:weaponDps(id,{ceiling:true,dedicated})});
  }return rows;},
  capAndPromote(){fresh(true);rich();const s=data.styles.melee;s.weapon=10;s.speed=5;s.reach=5;s.enchant=2;projectCombatStyle();const before=data.bars,blocked=craftStyleUpgrade('melee','weapon'),spent=before-data.bars;
   const promote=promoteStyle('melee'),again=promoteStyle('melee'),rankAfterPromotion=s.weapon,upgrade=craftStyleUpgrade('melee','weapon');return {blocked,spent,promote,again,rankAfterPromotion,upgrade,rank:s.weapon,tier:s.tier,other:data.styles.ranged.tier};},
  setupZone2(){fresh(true);rich();refreshUI();},
  projectileSockets(){fresh(true);rich();const rows=[];for(const id of ['bow','staff']){data.weaponType=id;projectCombatStyle();game.enemies=[{x:200,y:0,rad:12,hp:1000,maxHp:1000}];game.shots=[];attack();const s=game.shots[0];rows.push({id,x:s.x,y:s.y,aimError:Math.abs((200-s.x)*s.vy+(s.y-bodyPoint(game.enemies[0],s.x,s.y).y)*s.vx)});}return rows;},
  persist(){fresh(true);rich();data.styles.melee.weapon=10;promoteStyle('melee');makeArmor('magic_2');chooseWeapon('bow');save();return {armor:data.equippedArmor,tier:data.styles.melee.tier,weapon:data.weaponType};},
  migrate(){fresh();data.tierProgressionVersion=0;data.equipmentVersion=1;data.ownedArmor=['melee_4','magic_3'];data.equippedArmor='melee_4';data.styles.melee.weapon=500;normalizeProgression();return {rank:data.styles.melee.weapon,armor:data.equippedArmor,owned:data.ownedArmor,archive:data.archivedArmor,raw:data.legacyProgressionArchive.styles.melee.weapon};},
  allKnown(){data.discovered=Object.fromEntries(CODEX_ITEMS.map(c=>[c.id,1]));showCodex();}
 };
}
(async()=>{
 const runtime=await createRuntime(),errors=[],passed=[],report={};
 const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 try{
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
  await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);
  const locked=await p.evaluate(()=>__tierTest.locked());assert.deepEqual([locked.produce,locked.idle,locked.promote,locked.armor,locked.entry],[false,false,false,false,false]);assert.equal(locked.before,locked.after);
  const clear=await p.evaluate(()=>__tierTest.clearZone());assert.deepEqual(clear,{floor:6,cleared:5,open:true,announced:true});passed.push('A real final-floor completion unlocks Zone 2; resources, idle assignment, armor and promotion are blocked before it');
  const costs=await p.evaluate(()=>__tierTest.materials());assert.deepEqual(costs.map(c=>c.delta),[
   {ore:-2,coal:-1,steelBars:1},{ancientSalvage:-2,ancientFragments:2},{willowLogs:-1,cloth:-2,runicCloth:2},{steelBars:-1,willowLogs:-2,arrows:12},{runicCloth:-2,ancientFragments:-2,runes:10},{garnets:-1,cutGarnets:1}
  ]);assert.ok(costs.every(c=>c.made>0));passed.push('All six new refining recipes consume their exact cross-skill ingredients and produce real equipment materials / ammunition');
  for(const tier of [1,2]){
   const normal=await p.evaluate(t=>__tierTest.dps(t),tier),dedicated=await p.evaluate(t=>__tierTest.dps(t,true),tier);report['tier'+tier]={normal,dedicated};
   assert.ok(normal.every(r=>Math.abs(r.now-tier*80)<.001),'All six weapons reach the tier budget');
   assert.ok(normal.every(r=>Math.abs(r.damage/r.cooldown*1.05-r.now)<.001),'Reported DPS agrees with live hit damage and attack cooldown');
   assert.ok(dedicated.every(r=>r.now>tier*80&&r.now<=tier*86.4+.001),'Dedicated training stays at most 8% above the tier budget');
  }passed.push('Live attacks and readiness figures agree: all six weapon families reach 80 / 160 equipment DPS; exhaustive training stays within 86.4 / 172.8');
  const caps=await p.evaluate(()=>__tierTest.capAndPromote());assert.deepEqual(caps,{blocked:false,spent:0,promote:true,again:false,rankAfterPromotion:10,upgrade:true,rank:11,tier:2,other:1});passed.push('A capped upgrade spends nothing; a paid Steel promotion retains rank 10, opens rank 11 and leaves other combat styles alone');
  const rig=await p.evaluate(()=>{
   const d=__deepwell.getState().data,rows=[];for(const weapon of ['sword','shield','polearm','greatsword','bow','staff'])for(const attack of [0,.25,.5,.75,1]){
    const r=DeepwellAvatar.poseRig({data:{...d,weaponType:weapon},pose:'combat',attack,time:1});rows.push({weapon,attack,main:r.main,back:r.back,angle:r.angle,shaft:weapon==='polearm'?Math.hypot(r.back.x-r.main.x-Math.sin(r.angle)*13,r.back.y-r.main.y+Math.cos(r.angle)*13):0});
   }return rows;
  });assert.ok(rig.every(r=>[r.main.x,r.main.y,r.back.x,r.back.y,r.angle].every(Number.isFinite)));assert.ok(rig.filter(r=>r.weapon==='polearm').every(r=>r.shaft<1e-8));assert.ok(rig.filter(r=>['sword','polearm','greatsword','staff'].includes(r.weapon)).every(r=>r.angle>=0&&r.main.x>0));passed.push('Thirty animation poses keep finite joints, forward-facing swings and both halberd hands on the same shaft');
  const shots=await p.evaluate(()=>__tierTest.projectileSockets());assert.ok(shots.every(s=>s.y<-20&&s.aimError<1e-6));assert.ok(shots[0].x>30);passed.push('Real arrows and spell bolts originate at their animated hand sockets and aim at the selected target');
  await p.evaluate(()=>__tierTest.setupZone2());
  for(const key of ['coal','steelSmelt','willow','steelFletch','ancientScavenge','cleanAncient','aetherWeave','greaterRune','garnetSearch','garnetCut']){
   assert.equal(await p.evaluate(k=>__deepwell.enterActivity(k),key),true);await p.waitForTimeout(60);assert.equal(await p.evaluate(()=>__deepwell.getState().scene),key);assert.doesNotMatch(await p.locator('#activeTool').innerText(),/undefined/);
   const bonus=await p.evaluate(()=>__deepwell.spawnSkillBonus());assert.ok(bonus);await p.locator('[data-skill-bonus] img').first().evaluate(i=>i.decode());assert.equal(await p.evaluate(id=>__deepwell.claimSkillBonus(id),bonus),true);assert.equal(await p.evaluate(id=>__deepwell.claimSkillBonus(id),bonus),false);
  }passed.push('All ten Zone 2 activities render their themed scene and visible tool without browser errors');
  await p.click('#quickSkills');await p.click('[data-workshop-group="blacksmithing"]');await p.click('[data-workshop-tier="2"]');await p.locator('[data-idle-skill="coal"]').first().click();assert.ok((await p.evaluate(()=>__deepwell.getState().data.idleJobs)).includes('coal'));
  await p.click('[data-workshop-view="equipment"]');for(const group of ['blacksmithing','woodworking','warding']){await p.click('[data-workshop-group="'+group+'"]');assert.equal(await p.locator('.armor-set-card').count(),2);}
  await p.setViewportSize({width:320,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.ok(await p.locator('.armor-set-card').evaluateAll(cs=>cs.every(c=>c.getBoundingClientRect().right<=innerWidth+1)));
  await p.screenshot({path:path.join(runtime.resultsDir,'tiers-mobile-armor.png')});passed.push('Zone 2 skills expose working Idle buttons and exactly two armor recipes per class, including at 320px');
  const save=await p.evaluate(()=>__tierTest.persist());await p.reload();assert.deepEqual(await p.evaluate(()=>({armor:__deepwell.getState().data.equippedArmor,tier:__deepwell.getState().data.styles.melee.tier,weapon:__deepwell.getState().weaponType})),save);
  const migration=await p.evaluate(()=>__tierTest.migrate());assert.equal(migration.rank,10);assert.equal(migration.armor,'melee_1');assert.ok(migration.owned.every(k=>k.endsWith('_1')));assert.ok(migration.archive.includes('melee_4'));assert.equal(migration.raw,500);passed.push('Tier promotions and independent armor survive reload; older excess ranks / future armor are archived while playable power follows current limits');
  await p.evaluate(()=>__tierTest.allKnown());const images=p.locator('.codex-icon img');await images.evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));const icons=await images.evaluateAll(imgs=>imgs.map(i=>i.src));assert.equal(new Set(icons).size,icons.length);assert.deepEqual(errors,[]);passed.push('Every Codex icon is unique and loaded, including all new materials, activities and the Steel unlock');
  report.passed=passed;report.errors=errors;fs.writeFileSync(path.join(runtime.resultsDir,'tier-progression.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
