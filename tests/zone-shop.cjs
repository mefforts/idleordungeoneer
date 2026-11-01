const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
function instrumentation(){
 function fresh(zone=0){
  resetArenaTouch();if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=zone*3+1;data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.status='running';game.scene='combat';game.menuPaused=game.manualPaused=true;game.keys={};game.holdSkill=null;game.enemies=[];game.phase=0;game.phaseTarget=1e9;game.phaseSpawned=1e9;game.spawnTimer=1e9;game.attackTimer=1e9;game.transition=0;game.player.invuln=1e9;setScene('combat',false);refreshUI();
 }
 function enemy(extra={}){const e={x:0,y:30,rad:12,hp:1e7,maxHp:1e7,speed:0,wobble:0,contact:99,frozen:0,biome:biomeIndex(),...extra};game.enemies.push(e);return e;}
 function state(){return {data:JSON.parse(JSON.stringify(data)),dps:weaponDps(),hp:game.player.hp,maxHp:game.player.maxHp,level:dungeonProgress(),status:game.status,pending:game.pendingLevels};}
 function travel(zone){checkpointGroundXp();data.floor=zone*3+1;data.cleared=Math.max(data.cleared,data.floor-1);normalizeZone();resetRun();game.status='running';game.phase=0;game.phaseTarget=1e9;game.menuPaused=game.manualPaused=true;hideOverlay();refreshUI();}
 window.__shopTest={fresh,state,travel,
  fund(zone=0,amount=100000){grantZoneCurrency(amount,zone);refreshUI();},
  kill(random=.1,extra={}){const old=Math.random;Math.random=()=>random;try{onKill(enemy(extra));}finally{Math.random=old;}return state();},
  hundred(){fresh();for(let i=0;i<100;i++)this.kill((i+.5)/100);return state();},
  xp(amount){gainXp(amount);refreshUI();return state();},
  migration(){
   fresh();data=defaults();data.zoneShopVersion=1;data.gold=321;data.logs=17;data.dungeoneeringXp=1900;data.dungeonMastery={points:7,earned:7,onslaught:0,fortune:0,adaptation:0,intensity:0};data.xpCaches={0:[{x:100,y:100,value:77}]};
   data.zoneShops={0:{currency:7,earned:30000,ranks:{might:3,crit:2,ward:8,fire:10,multishot:1}},1:{currency:11,earned:5000,ranks:{fire:3,frost:2,ward:6,pierce:2}},4:{currency:13,earned:500,ranks:{might:1,fire:2}}};
   normalizeProgression();normalizeZone();resetRun();game.manualPaused=game.menuPaused=true;save();return state();
  },
  legacy(){fresh();data=defaults();data.floor=2;data.cleared=1;data.gold=321;data.logs=17;data.zone={index:0,level:3,xp:9,required:83,pending:2,upgrades:{might:3,fire:2}};data.mastery={0:{points:7,earned:9,onslaught:1,fortune:1,adaptation:0,intensity:1},1:{points:5,earned:7,onslaught:1,fortune:0,adaptation:1,intensity:1}};data.xpCaches={0:[{x:100,y:100,value:77}]};normalizeProgression();normalizeZone();resetRun();game.menuPaused=game.manualPaused=true;save();return state();},
  normalize(){normalizeProgression();normalizeZone();return state();},
  actual(id,zone=0,tier=1){
   fresh(zone);data.weaponType=id;data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.arrows=data.runes=100;const style=data.styles[styleForWeapon(id)];style.tier=tier;style.weapon=tier===1?10:20;style.speed=tier===1?5:10;data.ownedArmor=[styleForWeapon(id)+'_'+tier];data.equippedArmor=styleForWeapon(id)+'_'+tier;
   zoneShopFor().ranks=zone===3?{storm:1,multishot:1,ward:1}:{fire:2,ward:1};syncZone();projectCombatStyle();const e=enemy(),before=e.hp,old=Math.random;Math.random=()=>.99;
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
  await p.goto(runtime.baseURL);let s=await p.evaluate(()=>__shopTest.hundred());assert.equal(s.data.zoneShops[0].currency,4);assert.equal(s.data.gold,45);
  await p.evaluate(()=>__shopTest.fresh());s=await p.evaluate(()=>__shopTest.kill(.9,{elite:true,bossIndex:0}));assert.equal(s.data.zoneShops[0].currency,6);assert.equal(s.data.gold,47);assert.equal(s.data.dungeonMastery.points,0);
  for(const [index,reward]of [12,20,35].entries()){await p.evaluate(()=>__shopTest.fresh());s=await p.evaluate(index=>__shopTest.kill(.9,{boss:true,bossIndex:index,name:'Guardian fixture'}),index);assert.equal(s.data.zoneShops[0].currency,reward);assert.equal(await p.locator('#overlay').isHidden(),true);}
  passed.push('Regular monsters yield one seal on exactly 4% of deterministic trials; elites guarantee 6 and guardians 12 / 20 / 35, without ordinary-monster gold or duplicate elite Mastery');
  await p.evaluate(()=>{__shopTest.fresh();__shopTest.fund(0,22);__shopTest.focusBuy();});await p.keyboard.press('Enter');s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.zoneShops[0].ranks.fire,1);assert.equal(s.data.zoneShops[0].currency,14);assert.equal(await p.evaluate(()=>document.activeElement.dataset.buyZone),'fire');
  await p.keyboard.press('Enter');s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.zoneShops[0].ranks.fire,2);assert.equal(s.data.zoneShops[0].currency,0);assert.equal(await p.evaluate(()=>document.activeElement.tagName),'ARTICLE');assert.equal(await p.evaluate(()=>__deepwell.buyZoneUpgrade('fire',0)),false);
  await p.locator('#zoneShopView [data-codex-entry="zone_ability_0_fire"]').click();assert.match(await p.locator('#codexReading').innerText(),/poison|Venom/);await p.click('#codexClose');assert.ok(await p.locator('#zoneShopView').isVisible());await p.click('#drawerClose');
  s=await p.evaluate(()=>__shopTest.xp(1600));assert.equal(s.level.level,2);assert.equal(s.pending,0);assert.equal(s.status,'running');assert.equal(await p.locator('[data-pick]').count(),0);assert.equal(s.data.dungeonMastery.points,0);
  await p.evaluate(()=>__shopTest.travel(1));s=await p.evaluate(()=>__shopTest.state());assert.deepEqual(s.data.zoneShops[1].ranks,{});assert.equal(s.level.total,1600);await p.evaluate(()=>{__shopTest.fund(0);__deepwell.buyZoneUpgrade('ward',0);__shopTest.travel(0);__deepwell.save();});await p.reload();s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.zoneShops[0].ranks.fire,2);assert.equal(s.data.zoneShops[0].ranks.ward,1);assert.equal(s.level.total,1600);
  await p.evaluate(()=>__shopTest.travel(4));s=await p.evaluate(()=>__shopTest.state());assert.deepEqual(s.data.zoneShops[4].ranks,{});assert.equal(s.data.zoneShops[4].currency,0);
  passed.push('Real keyboard purchases use exact prices, keep focus, reject overspending and restore after Codex; ranks, currencies and global XP persist without leaking to a repeated biome');
  s=await p.evaluate(()=>__shopTest.migration());assert.equal(s.data.zoneShops[0].currency,13131);assert.deepEqual(s.data.zoneShops[0].ranks,{ward:5,fire:8});assert.equal(s.data.zoneShops[1].currency,163);assert.deepEqual(s.data.zoneShops[1].ranks,{fire:3,ward:5,pierce:2});assert.equal(s.data.zoneShops[4].currency,18);assert.deepEqual(s.data.zoneShops[4].ranks,{fire:2});assert.equal(s.data.zoneAbilityRefunds[0].currency,13124);assert.equal(s.data.gold,321);assert.equal(s.data.logs,17);assert.equal(s.level.total,1900);assert.equal(s.data.dungeonMastery.points,7);assert.equal(s.data.xpCaches[0][0].value,77);
  await p.evaluate(()=>__shopTest.normalize());await p.evaluate(()=>__deepwell.save());await p.reload();s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.zoneShops[0].currency,13131);assert.equal(s.data.zoneShops[1].currency,163);assert.equal(s.data.zoneShops[4].currency,18);
  const legacy=await p.evaluate(()=>__shopTest.legacy());assert.equal(legacy.data.zoneShops[0].currency,22);assert.deepEqual(legacy.data.zoneShops[0].ranks,{fire:2});assert.equal(legacy.level.total,88);assert.equal(legacy.data.dungeonMastery.points,13);assert.equal(legacy.data.xpCaches[0][0].value,77);
  passed.push('Retired statistics, biome-inappropriate ranks and excess ranks refund their exact historical prices once; active abilities, inventory, XP, ground XP and Mastery survive both older migrations');
  const stats=await p.evaluate(()=>__shopTest.passiveStats());assert.deepEqual(stats.after,stats.before);
  for(const id of ['might','haste','crit','reach','vitality','swift','magnet','regen','wisdom','forage','toString'])assert.equal(await p.evaluate(id=>__deepwell.buyZoneUpgrade(id,0),id),false);
  const ward=await p.evaluate(()=>__shopTest.ward());assert.ok(Math.abs(ward.ward-ward.normal*.98)<1e-8);
  for(const id of ['sword','shield','polearm','greatsword','bow','staff'])for(const [zone,tier]of [[0,1],[1,2],[3,2]]){const r=await p.evaluate(({id,zone,tier})=>__shopTest.actual(id,zone,tier),{id,zone,tier});assert.ok(Math.abs(r.reported-r.actual)<1e-6,id+' displayed DPS matches hits');assert.ok(Math.abs(r.pure-tier*80)<1e-6);actual.push({id,zone:zone+1,dps:r.reported});}
  const mastery=await p.evaluate(()=>__shopTest.masteryOnly());assert.equal(mastery.before,mastery.after);assert.equal(mastery.damage,mastery.masteryDamage);assert.ok(Math.abs(mastery.currency-.056)<1e-9);assert.ok(Math.abs(mastery.rare-.02625)<1e-9);
  passed.push('Retired stat ranks cannot affect combat or be purchased; themed wards reduce damage, all six weapons keep 80 / 160 gear DPS, projectile abilities match real DPS and Mastery stays separate');
  const bank=await p.evaluate(()=>__shopTest.bankXp());assert.deepEqual(bank,{elsewhere:0,gems:[100],xp:0});
  await p.evaluate(()=>__shopTest.fresh());for(const index of [1,-1,NaN])assert.equal(await p.evaluate(index=>__deepwell.buyZoneUpgrade('fire',index),index),false);
  s=await p.evaluate(()=>__shopTest.sandbox());assert.equal(s.data.devTravelUnlocked,true);assert.equal(s.data.devSpeedUnlocked,true);for(let i=0;i<4;i++)assert.ok(s.data.zoneShops[i].currency>9000000);
  const images=[],names=[];for(let zone=0;zone<4;zone++){await p.evaluate(zone=>__deepwell.openZoneShop(zone),zone);assert.equal(await p.locator('.zone-upgrade').count(),4);assert.equal(await p.locator('[data-shop-category]').count(),0);names.push(...await p.locator('.zone-upgrade h4').allTextContents());images.push(...await p.locator('.zone-upgrade-art img').evaluateAll(images=>images.map(i=>i.src)));}
  assert.equal(new Set(names).size,16);assert.equal(new Set(images).size,16);
  await p.evaluate(()=>__deepwell.openZoneShop(1));await p.click('[data-buy-zone="fire"]');s=await p.evaluate(()=>__shopTest.state());assert.equal(s.data.zoneShops[1].ranks.fire,1);assert.equal(s.data.zoneShops[0].ranks.fire,undefined);
  for(const size of [{width:1440,height:1000},{width:390,height:844},{width:320,height:844},{width:844,height:390}]){await p.setViewportSize(size);await p.locator('#zoneShopView img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:path.join(runtime.resultsDir,'zone-abilities-'+size.width+'.png')});}
  passed.push('Every shop has four distinct themed abilities and unique artwork; locked routes stay locked, sandbox mode funds shops without ranks, and compact cards fit phone portrait/landscape and desktop');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,actual,mastery,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
