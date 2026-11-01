const fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const initial=await runtime.browser.newPage();await initial.goto(runtime.baseURL);const seed=await initial.evaluate(()=>__deepwell.getState().data);await initial.close();
  const context=await runtime.browser.newContext({viewport:{width:1560,height:1240}});
  await context.addInitScript(d=>{
   d.floor=4;d.cleared=3;d.onboardingDone=d.tutorialSeen=d.masteryIntroSeen=d.skillsNudgeSeen=true;
   for(const k of ['blacksmithXp','woodworkingXp','wardingSkillXp'])d[k]=8000;
   for(const k of ['ore','bars','logs','cloth','scraps','coal','steelBars','willowLogs','ancientSalvage','ancientFragments','garnets','cutGarnets','runicCloth'])d[k]=120;
   d.gold=391;d.arrows=d.runes=240;d.ownedArmor=['melee_1','melee_2','ranged_1','ranged_2','magic_1','magic_2'];d.equippedArmor='melee_2';d.equipmentVersion=1;d.tierProgressionVersion=1;
   d.unlockedWeapons=['sword','shield','polearm','greatsword','bow','staff'];d.styles.melee.tier=2;d.styles.melee.weapon=14;d.styles.melee.speed=7;d.savedAt=Date.now();
   localStorage.setItem('deepwell-prototype-v1',JSON.stringify(d));
  },seed);
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(runtime.baseURL);await p.waitForTimeout(350);
  await p.evaluate(()=>{
   const baseline=__deepwell.getState().data,ids=['sword','shield','polearm','greatsword','bow','staff'];
   const host=document.createElement('section');host.id='rigReview';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:18px 24px;background:#241f18;color:#ecd8b1;font-family:Georgia';
   host.innerHTML='<h1 style="margin:0;text-align:center;font-size:27px">Equipment in motion · two crafted tiers</h1><p style="text-align:center;font:12px system-ui;color:#baa98a;margin:9px 0 20px">Actual game rig · correct shaft / grip anchors · articulated arms · separate robe hems and boots</p><div id="rigReviewGrid" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;height:calc(100% - 87px)"></div>';
   document.body.append(host);const grid=host.querySelector('#rigReviewGrid'),renders=[];
   const rows=[{armor:'melee_1',name:'Iron Warrior · ready',pose:'idle',attack:0},{armor:'ranged_1',name:'Plain Ranger · retreat left',pose:'combat',vx:-1,facing:1,attack:0},{armor:'magic_1',name:'Plain Mage · attack',pose:'combat',vx:1,facing:-1,attack:.6},{armor:'melee_2',name:'Steel Warrior · attack',pose:'combat',attack:.4},{armor:'ranged_2',name:'Cured Ranger · retreat right',pose:'combat',vx:1,facing:-1,attack:0},{armor:'magic_2',name:'Blue Wool Mage · walk',pose:'walk',attack:0}];
   for(const row of rows)for(const id of ids){
    const d=JSON.parse(JSON.stringify(baseline));d.equippedArmor=row.armor;d.weaponType=id;const style=id==='bow'?'ranged':id==='staff'?'magic':'melee';d.styles[style].tier=row.armor.endsWith('_2')?2:1;
    const tile=document.createElement('article');tile.style.cssText='border:1px solid #665338;background:radial-gradient(ellipse at center,#65523925,#2a2218);display:flex;align-items:center;justify-content:center;flex-direction:column;min-height:0';
    const canvas=document.createElement('canvas');canvas.width=300;canvas.height=235;canvas.style.cssText='height:calc(100% - 48px);width:100%;object-fit:contain';tile.append(canvas);
    tile.insertAdjacentHTML('beforeend','<b style="font:500 15px Georgia;margin:4px 0">'+({sword:'Sword',shield:'Sword & shield',polearm:'Halberd',greatsword:'Greatsword',bow:'Bow',staff:'Staff'})[id]+'</b><small style="font:9px system-ui;color:#baa17b;margin-bottom:6px">'+row.name+'</small>');grid.append(tile);renders.push({canvas,d,row});
   }
   window.__paintRigReview=(time=0)=>{for(const {canvas,d,row}of renders){const c=canvas.getContext('2d');c.clearRect(0,0,300,235);DeepwellAvatar.render(c,{x:150,y:221,scale:1.8,time,pose:row.pose,vx:row.vx||(row.pose==='walk'?1:0),facing:row.facing||1,attack:row.attack,charge:.9,data:d});}};
   __paintRigReview(.6);
  });
  await p.screenshot({path:path.join(root,'preview-rig.png')});
  await p.evaluate(()=>{document.getElementById('rigReview').remove();});await p.setViewportSize({width:1440,height:1000});await p.click('#introSkills');
  await p.evaluate(()=>__deepwell.enterActivity('willow'));await p.waitForTimeout(200);await p.screenshot({path:path.join(root,'preview-zone2.png')});
  await p.click('#quickSkills');await p.click('[data-workshop-group="blacksmithing"]');await p.click('[data-workshop-tier="2"]');await p.screenshot({path:path.join(root,'preview-tier-menu.png')});
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(runtime.resultsDir,'tier-menu-mobile.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Captured actual rig poses, Zone 2 environment and tiered mobile/desktop Skills.');await context.close();
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
