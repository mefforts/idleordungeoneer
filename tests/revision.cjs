const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs');
const {testingCodes,withTestingCodes}=require('./code-fixture.cjs');
function instrumentation(){
 function fresh(floor=1){
  if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=floor;data.cleared=floor-1;
  data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;normalizeProgression();normalizeZone();ensureJobs();resetRun();
  game.status='running';game.scene='combat';game.manualPaused=game.menuPaused=false;game.keys={};game.enemies=[];game.phase=0;game.phaseTarget=1e9;game.phaseSpawned=1e9;game.spawnTimer=1e9;game.transition=0;game.player.invuln=1e9;game.attackTimer=1e9;setScene('combat',false);refreshUI();
 }
 window.__revision={
  fresh,
  bow(direction,vertical=0){
   fresh();data.weaponType='bow';data.unlockedWeapons.push('bow');data.arrows=1000;projectCombatStyle();
   const e={x:direction*180,y:vertical,rad:15,hp:1e6,maxHp:1e6,speed:0,wobble:0,contact:999,frozen:0};game.enemies=[e];game.keys[direction>0?'KeyA':'KeyD']=true;
   tickCombat(.01);attack();const facing=game.player.facing;
   const rows=[];for(let i=0;i<8;i++){tickCombat(.025);rows.push({facing:game.player.facing,move:game.player.vx,angle:game.player.aimAngle});}
   const shot=game.shots[0];game.keys={};game.manualPaused=game.menuPaused=true;return {facing,rows,shot:{vx:shot.vx,vy:shot.vy},playerX:game.player.x};
  },
  rewardRun(zone){
   fresh(zone*3+1);game.upgrades={};const start=data.gold,model=zoneBalance(zone);
   for(let stage=0;stage<3;stage++){
    data.floor=zone*3+stage+1;normalizeZone();game.status='test';game.phaseTarget=1e9;
    for(let phase=0;phase<6;phase++){
     game.phase=phase;game.phaseKills=0;
     const count=phase%2?1:model.targets[phase];
     for(let n=0;n<count;n++){
      const e={x:0,y:0,rad:12,hp:0,boss:phase%2===1,bossIndex:Math.floor(phase/2),name:'Reward fixture'};
      game.enemies=[e];onKill(e);
     }
    }
    clearFloor();
   }
   hideOverlay();game.manualPaused=game.menuPaused=true;return {earned:data.gold-start,budget:zoneGoldBudget(zone),remainder:data.delveGoldRemainder};
  },
  carry(){fresh();grantDelveGold(.25);grantDelveGold(.25);grantDelveGold(.25);save();return {gold:data.gold,remainder:data.delveGoldRemainder};},
  fourth(){return {paid:grantDelveGold(.25),gold:data.gold,remainder:data.delveGoldRemainder};},
  badTravel(){fresh();return testTravelTo(4,3);},
  allIcons(){data.discovered=Object.fromEntries(CODEX_ITEMS.map(e=>[e.id,1]));showCodex();return CODEX_ITEMS.map(e=>({id:e.id,uri:iconAsset('codex-'+e.id)}));},
  prepareRig(){data.cleared=12;data.equipmentVersion=data.tierProgressionVersion=1;data.ownedArmor=Object.keys(ARMOR_SETS);},
  renderRig(){
   const base={...data,weaponType:'bow',arrows:1000},rows=[];const c=document.createElement('canvas');c.width=180;c.height=220;const ctx=c.getContext('2d',{willReadFrequently:true});
   for(const armor of Object.keys(ARMOR_SETS))for(const time of [0,.35,.7]){
    ctx.clearRect(0,0,c.width,c.height);DeepwellAvatar.render(ctx,{x:90,y:200,scale:2,time,pose:'combat',vx:-1,facing:1,charge:.9,data:{...base,equippedArmor:armor}});
    const pixels=ctx.getImageData(82,92,16,22).data;let emptyRows=0;
    for(let y=0;y<22;y++){let ink=0;for(let x=0;x<16;x++)ink+=pixels[(y*16+x)*4+3];if(ink===0)emptyRows++;}
    const rig=DeepwellAvatar.poseRig({pose:'combat',vx:-1,facing:1,time,charge:.9,aimAngle:-.4,data:base});
    rows.push({armor,time,emptyRows,backpedal:rig.backpedal,angle:rig.angle,nockError:Math.abs((rig.back.x-rig.main.x)*Math.sin(rig.angle)-(rig.back.y-rig.main.y)*Math.cos(rig.angle))});
   }return rows;
  }
 };
}
(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 const html=withTestingCodes(fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8')).replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 try{
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);
  for(const direction of [-1,1])for(const vertical of [-65,0,65]){
   const result=await p.evaluate(({direction,vertical})=>__revision.bow(direction,vertical),{direction,vertical});
   assert.equal(result.facing,direction);assert.ok(result.rows.every(r=>r.facing===direction&&r.move===-direction),'Facing must stay aimed for the entire draw cycle while retreating');assert.equal(Math.sign(result.shot.vx),direction);assert.equal(Math.sign(result.playerX),-direction);
  }passed.push('Bow aiming stays on the target through a moving draw cycle, both retreat directions and diagonal shots');
  await p.evaluate(()=>__revision.prepareRig());await p.waitForTimeout(100);const rig=await p.evaluate(()=>__revision.renderRig());
  assert.equal(rig.length,18);assert.ok(rig.every(r=>r.emptyRows===0),'Every outfit must have a visible neck/collar bridge');assert.ok(rig.every(r=>r.backpedal&&r.nockError<1e-7));passed.push('All six armor sets keep the head joined through moving poses; the bowstring and nocked arrow share the aim axis');
  const rewards=[];for(const zone of [0,1])rewards.push(await p.evaluate(z=>__revision.rewardRun(z),zone));
  assert.deepEqual(rewards.map(r=>r.earned),[191,293]);assert.ok(rewards.every(r=>Math.abs(r.earned-r.budget.total)<1e-7));passed.push('Real kills, all nine guardians and floor clears produce 191 / 293 baseline gold per zone');
  assert.deepEqual(await p.evaluate(()=>__revision.carry()),{gold:45,remainder:.75});await p.reload();assert.deepEqual(await p.evaluate(()=>__revision.fourth()),{paid:1,gold:46,remainder:0});passed.push('Fractional reward gold carries across saves and reloads without losing or duplicating coins');
  assert.equal(await p.evaluate(()=>__revision.badTravel()),false);await p.evaluate(()=>__deepwell.openDrawer('settings'));assert.equal(await p.locator('#testTravel').count(),0);
  await p.click('#settingsCodes');await p.fill('#codeInput',testingCodes.sandbox);await p.click('#codeRedeem');
  let d=await p.evaluate(()=>__deepwell.getState().data);assert.equal(d.devSpeedUnlocked,true);assert.equal(d.devTravelUnlocked,true);assert.ok(d.cleared>=12);assert.ok(await p.locator('#testTravel').isVisible());assert.equal(await p.locator('#testZone option').count(),4);
  for(const [zone,stage]of [[2,2],[4,3],[1,1]]){
   await p.selectOption('#testZone',String(zone));await p.selectOption('#testFloor',String(stage));const gold=await p.evaluate(()=>__deepwell.getState().data.gold);await p.click('#testTravelGo');const state=await p.evaluate(()=>__deepwell.getState());assert.equal(state.data.floor,(zone-1)*3+stage);assert.equal(state.status,'running');assert.equal(state.data.gold,gold,'Travel cannot award clear rewards');
   await p.click('#quickSettings');
  }
  await p.click('#drawerClose');assert.ok(await p.locator('#speedControl').isVisible());await p.click('#speedToggle');assert.ok(await p.locator('#speedOptions [data-speed="500"]').isVisible());
  await p.evaluate(()=>__deepwell.save());await p.reload();d=await p.evaluate(()=>__deepwell.getState().data);assert.equal(d.devTravelUnlocked,true);assert.equal(d.devSpeedUnlocked,true);assert.ok(d.cleared>=12);await p.click('#introSkills');await p.click('#quickSettings');assert.ok(await p.locator('#testTravel').isVisible());
  await p.setViewportSize({width:320,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.ok((await p.locator('#testTravelGo').boundingBox()).x<320);await p.screenshot({path:path.join(runtime.resultsDir,'revision-test-travel.png')});passed.push('Sandbox redemption clears all four authored dungeons, unlocks all speed choices and persistent Zone / Floor travel; ordinary saves cannot use it');
  await p.click('#drawerClose');const icons=await p.evaluate(()=>__revision.allIcons());assert.equal(icons.length,106);assert.equal(new Set(icons.map(i=>i.uri)).size,106);assert.ok(icons.every(i=>i.uri.startsWith('data:image/webp;base64,')),'No content entry may fall back to flat vector art');
  const alignment=await p.evaluate(async icons=>{
   const c=document.createElement('canvas');c.width=c.height=192;const ctx=c.getContext('2d',{willReadFrequently:true}),rows=[];
   for(const icon of icons){const image=new Image();image.src=icon.uri;await image.decode();ctx.clearRect(0,0,192,192);ctx.drawImage(image,0,0,192,192);const d=ctx.getImageData(0,0,192,192).data;let l=192,t=192,r=0,b=0;
    for(let y=0;y<192;y++)for(let x=0;x<192;x++)if(d[(y*192+x)*4+3]>128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const seen=new Uint8Array(192*192),queue=[96*192+96];seen[queue[0]]=1;let connected=0,total=0;for(let j=3;j<d.length;j+=4)if(d[j]>128)total++;for(let q=0;q<queue.length;q++){const pos=queue[q];if(d[pos*4+3]<=128)continue;connected++;for(const next of [pos-192,pos+192,...(pos%192?[pos-1]:[]),...(pos%192<191?[pos+1]:[])])if(next>=0&&next<seen.length&&!seen[next]){seen[next]=1;queue.push(next);}}rows.push({id:icon.id,dx:Math.abs((l+r)/2-95.5),dy:Math.abs((t+b)/2-95.5),width:r-l+1,height:b-t+1,detached:total-connected});
   }return rows;
  },icons);assert.ok(alignment.every(i=>i.dx<=2&&i.dy<=2&&i.width>=170&&i.height>=170&&i.detached<=10),JSON.stringify(alignment.filter(i=>i.dx>2||i.dy>2||i.width<170||i.height<170)));passed.push('All 106 Codex entries have distinct painted, loaded, uniformly centered medallions');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(runtime.resultsDir,'revision-results.json'),JSON.stringify({passed,rewards,errors},null,2)+'\n');console.log(JSON.stringify({passed,rewards,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
