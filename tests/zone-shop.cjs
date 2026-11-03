const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
function instrumentation(){
 function fresh(zone=0){
  resetArenaTouch();if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=zoneStart(zone);data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.status='running';game.scene='combat';game.menuPaused=game.manualPaused=true;game.keys={};game.holdSkill=null;game.enemies=[];game.phase=0;game.phaseTarget=1e9;game.phaseSpawned=1e9;game.spawnTimer=1e9;game.attackTimer=1e9;game.transition=0;game.player.invuln=1e9;setScene('combat',false);refreshUI();
 }
 function enemy(extra={}){const e={x:0,y:30,rad:12,hp:1e7,maxHp:1e7,speed:0,wobble:0,contact:99,frozen:0,biome:biomeIndex(),...extra};game.enemies.push(e);return e;}
 function state(){return {data:JSON.parse(JSON.stringify(data)),dps:weaponDps(),hp:game.player.hp,maxHp:game.player.maxHp,level:dungeonProgress(),status:game.status,pending:game.pendingLevels};}
 function travel(zone){checkpointGroundXp();data.floor=zoneStart(zone);data.cleared=Math.max(data.cleared,data.floor-1);normalizeZone();resetRun();game.status='running';game.phase=0;game.phaseTarget=1e9;game.menuPaused=game.manualPaused=true;hideOverlay();refreshUI();}
 window.__shopTest={fresh,state,travel,
  equip(id){data.weaponType=id;data.unlockedWeapons=Object.keys(WEAPON_TYPES);projectCombatStyle();refreshUI();},
  zoneFinal(){fresh();data.floor=zoneEnd(0);return this.kill(.9,{boss:true,bossIndex:2,name:"Final Guardian"});},
  fund(zone=0,amount=100000){grantZoneCurrency(amount,zone);refreshUI();},
  kill(random=.1,extra={}){const old=Math.random;Math.random=()=>random;try{onKill(enemy(extra));}finally{Math.random=old;}return state();},
  hundred(){fresh();for(let i=0;i<1000;i++)this.kill((i+.5)/1000);return state();},
  xp(amount){gainXp(amount);refreshUI();return state();},
  migration(){
   fresh();data=defaults();data.timeProgressionVersion=0;data.lootPresentationVersion=0;data.zoneShopVersion=1;data.gold=321;data.logs=17;data.dungeoneeringXp=1900;data.dungeonMastery={points:7,earned:7,onslaught:0,fortune:0,adaptation:0,intensity:0};data.xpCaches={0:[{x:100,y:100,value:77}]};
   data.zoneShops={0:{currency:7,earned:100,ranks:{might:3,ward:1,fire:2}},1:{currency:11,earned:100,ranks:{fire:3}}};
   normalizeProgression();normalizeZone();resetRun();game.manualPaused=game.menuPaused=true;save();return state();
  },
  legacy(){fresh();data=defaults();data.floor=2;data.cleared=1;data.timeProgressionVersion=0;data.lootPresentationVersion=0;data.gold=321;data.logs=17;data.zone={index:0,level:3,xp:9,required:83,pending:2,upgrades:{might:3,fire:2}};data.mastery={0:{points:7,earned:9,onslaught:1,fortune:1,adaptation:0,intensity:1},1:{points:5,earned:7,onslaught:1,fortune:0,adaptation:1,intensity:1}};data.xpCaches={0:[{x:100,y:100,value:77}]};normalizeProgression();normalizeZone();resetRun();game.menuPaused=game.manualPaused=true;save();return state();},
  normalize(){normalizeProgression();normalizeZone();return state();},
  actual(id,zone=0,tier=1){
   fresh(zone);data.weaponType=id;data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.arrows=data.runes=100;const style=data.styles[styleForWeapon(id)];style.tier=tier;style.weapon=tier===1?10:20;style.speed=tier===1?5:10;data.ownedArmor=[styleForWeapon(id)+'_'+tier];data.equippedArmor=styleForWeapon(id)+'_'+tier;
   zoneShopFor().ranks=zone===3?{storm:1,echo:1,ward:1}:{fire:2,ward:1};syncZone();projectCombatStyle();const e=enemy(),before=e.hp,old=Math.random;Math.random=()=>.99;
   try{attack();}finally{Math.random=old;}const profile=zoneCombatProfile(),damage=isRanged()?game.shots.reduce((n,s)=>n+s.damage,0):before-e.hp;
   return {reported:profile.dps,actual:damage/profile.cooldown*(1+profile.crit),pure:weaponDps(id,{equipmentOnly:true}),damage,profile};
  },
  passiveStats(){fresh();const before={dps:weaponDps(),cooldown:attackCooldown(),reach:attackReach(),hp:maxHp()+waveVitality(),crit:waveCritChance()};zoneShopFor().ranks={might:20,haste:20,crit:20,reach:10,vitality:20,swift:10,magnet:10,regen:15,wisdom:10,forage:5};syncZone();return {before,after:{dps:weaponDps(),cooldown:attackCooldown(),reach:attackReach(),hp:maxHp()+waveVitality(),crit:waveCritChance()}};},
  ward(){fresh();game.player.hp=500;game.player.invuln=0;hurt(10);const normal=500-game.player.hp;game.player.hp=500;game.player.invuln=0;zoneShopFor().ranks={ward:1};syncZone();hurt(10);return {normal,ward:500-game.player.hp};},
  masteryOnly(){fresh();const before=weaponDps(),hp=game.player.hp;game.player.invuln=0;hurt(10);const damage=hp-game.player.hp;const m=masteryFor();m.points=m.earned=100;m.fortune=4;m.adaptation=3;m.onslaught=5;game.player.hp=hp;game.player.invuln=0;hurt(10);return {before,after:weaponDps(),damage,masteryDamage:hp-game.player.hp,currency:currencyDropChance(),rare:rareDropChance()};},
  sandbox(){fillTestingResources();return state();},
  focusBuy(){openZoneShop();document.querySelector('[data-buy-zone="fire"]').focus();},
  bankXp(){fresh();game.gems=[{x:900,y:900,value:100}];checkpointGroundXp();travel(1);const elsewhere=game.gems.length;travel(0);return {elsewhere,gems:game.gems.map(g=>g.value),xp:data.dungeoneeringXp};}
 };
}
(async()=>{
 const runtime=await createRuntime(),errors=[],passed=[],actual=[];
 const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 try{
  await p.goto(runtime.baseURL);let s=await p.evaluate(()=>__shopTest.hundred());assert.equal(s.data.dungeonShops.deepwell.currency,3);assert.equal(s.data.gold,45);
  await p.evaluate(()=>__shopTest.fresh());s=await p.evaluate(()=>__shopTest.kill(.9,{elite:true,bossIndex:0}));assert.equal(s.data.dungeonShops.deepwell.currency,0);s=await p.evaluate(()=>__shopTest.kill(.2,{elite:true,bossIndex:0}));assert.equal(s.data.dungeonShops.deepwell.currency,1);s=await p.evaluate(()=>__shopTest.kill(.9,{elite:true,champion:true,bossIndex:0}));assert.equal(s.data.dungeonShops.deepwell.currency,2);assert.equal(s.data.dungeonMastery.points,0);
  for(const [index,reward]of [1,1,2].entries()){await p.evaluate(()=>__shopTest.fresh());s=await p.evaluate(index=>__shopTest.kill(.9,{boss:true,bossIndex:index,name:'Guardian'}),index);assert.equal(s.data.dungeonShops.deepwell.currency,reward);}
  s=await p.evaluate(()=>__shopTest.zoneFinal());assert.equal(s.data.dungeonShops.deepwell.currency,5);
  passed.push('Ordinary kills yield Sigils on 0.3% of deterministic trials, elites on 35%, rares guarantee one, guardians grant 1 / 1 / 2; ordinary kills grant no gold');
  await p.evaluate(()=>{__shopTest.fresh();__shopTest.fund(0,23);__shopTest.focusBuy();});assert.equal(await p.locator('.zone-upgrade').count(),12);assert.equal(await p.locator('.dungeon-locked-list .zone-upgrade').count(),4);assert.match(await p.locator('.dungeon-style-notice').innerText(),/Melee, Mage and Ranged/);
  await p.keyboard.press('Enter');s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.dungeonShops.deepwell.ranks.fire,1);assert.equal(s.data.dungeonShops.deepwell.currency,17);assert.equal(await p.evaluate(()=>document.activeElement.dataset.buyZone),'fire');
  await p.keyboard.press('Enter');s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.dungeonShops.deepwell.ranks.fire,2);assert.equal(s.data.dungeonShops.deepwell.currency,0);assert.equal(await p.evaluate(()=>document.activeElement.tagName),'ARTICLE');assert.equal(await p.evaluate(()=>__deepwell.buyZoneUpgrade('fire')),false);assert.equal(await p.evaluate(()=>__deepwell.buyZoneUpgrade('shatter')),false);
  await p.locator('#zoneShopView [data-codex-entry="dungeon_perk_fire"]').click();assert.match(await p.locator('#codexReading').innerText(),/All Zones in this Dungeon/);await p.click('#codexClose');assert.ok(await p.locator('#zoneShopView').isVisible());await p.click('#drawerClose');
  s=await p.evaluate(()=>__shopTest.xp(6400));assert.equal(s.level.level,0);assert.equal(s.pending,0);assert.equal(s.data.dungeonMastery.points,0);await p.evaluate(()=>__shopTest.travel(1));s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.dungeonShops.deepwell.ranks.fire,2);assert.equal(s.level.total,6400);await p.evaluate(()=>{__shopTest.travel(9);__shopTest.fund(0,100);__deepwell.buyZoneUpgrade('shatter');__deepwell.save();});await p.reload();s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.dungeonShops.deepwell.ranks.shatter,1);await p.evaluate(()=>__shopTest.travel(4));s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.dungeonShops.deepwell.ranks.fire,2);assert.equal(s.data.dungeonShops.deepwell.ranks.shatter,1);
  passed.push('Eight starter perks plus four level locks, exact escalating purchases, overspending guards, focus, Codex, shared cross-Zone ranks and save/reload work; milestones unlock perks while XP cannot grant points');
  s=await p.evaluate(()=>__shopTest.migration());assert.ok(Math.abs(s.data.dungeonShops.deepwell.currency-4.64)<1e-9);assert.deepEqual(s.data.dungeonShops.deepwell.ranks,{});assert.equal(s.data.dungeonShopMigration.seals,116);assert.equal(s.data.gold,321);assert.equal(s.data.logs,17);assert.equal(s.level.total,1977);assert.equal(s.data.dungeonMastery.points,7);assert.equal(Object.values(s.data.xpCaches).flat().length,0);assert.equal(s.data.legacyZoneShops[0].ranks.fire,2);
  await p.evaluate(()=>__shopTest.normalize());await p.evaluate(()=>__deepwell.save());await p.reload();s=await p.evaluate(()=>__shopTest.state());assert.ok(Math.abs(s.data.dungeonShops.deepwell.currency-4.64)<1e-9);
  const legacy=await p.evaluate(()=>__shopTest.legacy());assert.ok(Math.abs(legacy.data.dungeonShops.deepwell.currency-1.76)<1e-9);assert.deepEqual(legacy.data.dungeonShops.deepwell.ranks,{});assert.equal(legacy.level.total,165);assert.equal(legacy.data.dungeonMastery.points,13);assert.equal(Object.values(legacy.data.xpCaches).flat().length,0);
  passed.push('Old wallets plus full historical purchase prices convert once at 25:1 with fractional credit retained; pre-shop saves, inventory, Mastery and ground XP also survive');
  const stats=await p.evaluate(()=>__shopTest.passiveStats());assert.deepEqual(stats.after,stats.before);
  for(const id of ['might','haste','crit','reach','vitality','swift','magnet','regen','wisdom','forage','toString'])assert.equal(await p.evaluate(id=>__deepwell.buyZoneUpgrade(id),id),false);
  const ward=await p.evaluate(()=>__shopTest.ward());assert.ok(Math.abs(ward.ward-ward.normal*.98)<1e-8);
  for(const id of ['sword','shield','polearm','greatsword','bow','staff'])for(const [zone,tier]of [[0,1],[1,2],[3,2]]){const r=await p.evaluate(({id,zone,tier})=>__shopTest.actual(id,zone,tier),{id,zone,tier});assert.ok(Math.abs(r.reported-r.actual)<1e-6,id+' displayed base DPS matches real primary attacks');assert.ok(Math.abs(r.pure-tier*80)<1e-6);actual.push({id,zone:zone+1,dps:r.reported});}
  const mastery=await p.evaluate(()=>__shopTest.masteryOnly());assert.equal(mastery.before,mastery.after);assert.equal(mastery.damage,mastery.masteryDamage);assert.ok(Math.abs(mastery.currency-.0042)<1e-9);assert.ok(Math.abs(mastery.rare-.02625)<1e-9);
  assert.deepEqual(await p.evaluate(()=>__shopTest.bankXp()),{elsewhere:0,gems:[100],xp:0});
  passed.push('All six weapon families retain their 80 / 160 gear ceilings; obsolete flat stats have no effect, wards work, base hit DPS agrees with the UI and Mastery affects reward settings only');
  await p.evaluate(()=>__shopTest.fresh());for(const weapon of ['sword','staff','bow']){await p.evaluate(weapon=>{__shopTest.equip(weapon);__deepwell.openZoneShop();},weapon);const notice=await p.locator('.dungeon-style-notice b').innerText();assert.match(notice,weapon==='sword'?/Melee/:weapon==='staff'?/Mage/:/Ranged/);assert.match(await p.locator('[data-focus-key="zone-card-technique"] h4').innerText(),weapon==='sword'?/Wide Sweep/:weapon==='staff'?/Guided Hex/:/Piercing Flight/);}
  const icons=await p.locator('.zone-upgrade-art img').evaluateAll(images=>images.map(i=>i.src));assert.equal(new Set(icons).size,12);
  for(const size of [{width:1440,height:1000},{width:390,height:844},{width:320,height:844},{width:844,height:390}]){await p.setViewportSize(size);await p.locator('#zoneShopView img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:path.join(runtime.resultsDir,'dungeon-shop-'+size.width+'.png')});}
  passed.push('Style-adaptive perk names change with Melee, Mage and Ranged; all twelve illustrations are distinct and compact shop cards fit phones and desktop');assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,actual,mastery,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
