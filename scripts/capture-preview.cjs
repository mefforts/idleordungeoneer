const path=require('node:path');
const fs=require('node:fs');
const {createRuntime}=require('../tests/runtime.cjs');
function bossFixture(){
  window.__previewBoss=()=>{
    data.floor=3;data.cleared=2;data.mastery={0:{points:8,earned:8,onslaught:0,fortune:0,adaptation:0,intensity:0}};data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;data.ownedArmor=['melee_1'];data.equippedArmor='melee_1';data.equipmentVersion=1;
    data.styles.melee={weapon:8,armor:2,speed:6,reach:0,enchant:0,xp:720,lastWeapon:'sword'};projectCombatStyle();resetRun();game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=false;hideOverlay();setScene('combat',false);game.phase=4;nextPhase();
    game.player.x=0;game.player.y=165;game.player.hp=game.player.maxHp=maxHp();game.camX=0;game.camY=80;game.boss.x=0;game.boss.y=-60;game.boss.mechanicIndex=1;beginBossCast(game.boss);tickBossSpecial(game.boss,.65);game.menuPaused=true;refreshUI();
  };
}
(async()=>{
  const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
  try{
    const initial=await runtime.browser.newPage();await initial.goto(runtime.baseURL);
    const seed=await initial.evaluate(()=>__deepwell.getState().data);await initial.close();
    const context=await runtime.browser.newContext({viewport:{width:1680,height:945}});
    await context.addInitScript(d=>{
      d.floor=2;d.cleared=1;d.gold=2376;d.essence=21;d.ore=70;d.bars=137;d.blacksmithXp=4650;
      d.tools={pickaxe:true,hatchet:true,mattock:true};d.stationLevels.blacksmithing=2;
      d.styles.melee={weapon:4,armor:2,enchant:0,speed:3,reach:2,xp:450,lastWeapon:'sword'};d.ownedArmor=['melee_1','melee_2','ranged_1','magic_1'];d.equippedArmor='melee_1';d.equipmentVersion=1;
      d.unlockedWeapons=['sword','shield','polearm','greatsword','bow','staff'];d.idleJobs=['forge'];d.idleNoticeSlots=1;d.idleFirstAssigned=true;
      d.lastSkill='forge';d.onboardingDone=d.tutorialSeen=d.skillsNudgeSeen=true;
      d.mastery={'0':{points:3,earned:3,onslaught:0,fortune:0,adaptation:0,intensity:0}};d.savedAt=Date.now();
      localStorage.setItem('deepwell-prototype-v1',JSON.stringify(d));
    },seed);
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(runtime.baseURL);await p.click('#introSkills');await p.waitForTimeout(10200);
    const hold=await p.locator('#skillHold').boundingBox();await p.mouse.move(hold.x+hold.width/2,hold.y+hold.height/2);await p.mouse.down();await p.waitForTimeout(1750);
    await p.screenshot({path:path.join(root,'preview.png')});await p.mouse.up();
    await p.click('#quickSkills');await p.click('[data-workshop-group="blacksmithing"]');await p.click('[data-workshop-view="equipment"]');
    await p.locator('.armor-set-card').first().scrollIntoViewIfNeeded();await p.screenshot({path:path.join(root,'preview-menu.png')});
    await p.click('#drawerClose');await p.click('#quickGear');await p.locator('#combatReadiness').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(runtime.resultsDir,'arena-readiness.png')});
    await p.setViewportSize({width:1440,height:1000});
    await p.evaluate(()=>{
      const sets=Object.values(__deepwell.armorSets),baseline=__deepwell.getState().data;
      const sheet=document.createElement('section');sheet.style.cssText='position:fixed;inset:0;z-index:9999;background:#211c15;color:#ead8b2;padding:20px;font-family:Georgia';
      sheet.innerHTML='<div style="height:72px;text-align:center"><h1 style="font-size:27px;margin:0 0 9px">Plain equipment · two crafted tiers</h1><p style="font:12px system-ui;color:#bfae90;margin:0">Warrior · Ranger · Mage — actual game character renders</p></div><div id="equipmentReviewGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;height:calc(100% - 72px)"></div>';
      document.body.append(sheet);const grid=sheet.querySelector('#equipmentReviewGrid');
      for(const set of sets){
        const d=JSON.parse(JSON.stringify(baseline));d.equippedArmor=set.id;d.weaponType=set.style==='magic'?'staff':set.style==='ranged'?'bow':'sword';d.styles[set.style].tier=set.tier;d.styles[set.style].weapon=[0,10][set.tier-1];d.weapon=d.styles[set.style].weapon;
        const tile=document.createElement('article');tile.style.cssText='border:1px solid #665338;background:radial-gradient(ellipse at center,#57463144,#2a2218);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0';
        const canvas=document.createElement('canvas');canvas.width=300;canvas.height=220;canvas.style.cssText='height:calc(100% - 46px);max-width:100%;object-fit:contain';tile.append(canvas);
        const context=canvas.getContext('2d');DeepwellAvatar.render(context,{x:150,y:210,scale:2.15,time:0,pose:'idle',data:d});
        const name=document.createElement('b');name.textContent=set.name;name.style.cssText='font:500 17px Georgia;margin:3px 0';tile.append(name);
        const detail=document.createElement('small');detail.textContent=({melee:'Warrior',ranged:'Ranger',magic:'Mage'})[set.style]+' · Tier '+set.tier;detail.style.cssText='font:10px system-ui;color:#b8a17b;margin-bottom:6px';tile.append(detail);grid.append(tile);
      }
    });
    await p.screenshot({path:path.join(root,'preview-equipment.png')});
    await context.close();
    const combat=await runtime.browser.newContext({viewport:{width:1680,height:945}});
    await combat.addInitScript(d=>{
      d.onboardingDone=d.tutorialSeen=d.skillsNudgeSeen=true;d.weaponType='sword';
      d.styles.melee={weapon:4,armor:0,enchant:0,speed:2,reach:0,xp:320,lastWeapon:'sword'};d.ownedArmor=['melee_1'];d.equippedArmor='melee_1';d.equipmentVersion=1;
      d.masteryIntroSeen=true;d.mastery={'0':{points:1,earned:1,onslaught:0,fortune:0,adaptation:0,intensity:0}};d.savedAt=Date.now();
      localStorage.setItem('deepwell-prototype-v1',JSON.stringify(d));
    },seed);
    const cp=await combat.newPage();cp.on('pageerror',e=>errors.push(e.message));await cp.goto(runtime.baseURL);await cp.click('#introDelve');await cp.keyboard.down('w');
    for(let i=0;i<22;i++){await cp.waitForTimeout(400);if((await cp.evaluate(()=>__deepwell.getState().status))==='upgrade'){await cp.keyboard.up('w');await cp.click('[data-pick="2"]');await cp.keyboard.down('w');}}
    await cp.keyboard.up('w');await cp.waitForTimeout(450);await cp.screenshot({path:path.join(root,'preview-combat.png')});
    await cp.setViewportSize({width:390,height:844});await cp.waitForTimeout(150);await cp.screenshot({path:path.join(runtime.resultsDir,'arena-combat-mobile-final.png')});
    await combat.close();if(errors.length)throw Error(errors.join('; '));console.log('Captured gameplay, menu, readiness and mobile previews.');
    const boss=await runtime.browser.newPage({viewport:{width:1440,height:1000}});boss.on('pageerror',e=>errors.push(e.message));
    const bossHtml=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+bossFixture.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
    await boss.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:bossHtml}));await boss.goto(runtime.baseURL);await boss.evaluate(()=>__previewBoss());await boss.waitForTimeout(200);await boss.screenshot({path:path.join(root,'preview-boss.png')});await boss.close();
    if(errors.length)throw Error(errors.join('; '));
  }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1);});
