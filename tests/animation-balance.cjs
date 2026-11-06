const fs=require('node:fs'),assert=require('node:assert/strict');
const {createRuntime}=require('./runtime.cjs');
const {workshopFixture}=require('./workshop-fixture.cjs');

// Only isolated browser responses receive these controls.
function animationBalanceFixture(){
 update=()=>{};
 function freshCombat(weapon='bow'){
  if(codexSession)closeCodex();closeDrawer(false);hideOverlay(true);
  data=defaults();data.onboardingDone=data.tutorialSeen=data.firstMasteryTipSeen=data.essenceEnchantTipSeen=data.skillsNudgeSeen=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();tourIndex=-1;
  game.status='running';game.scene='combat';game.manualPaused=game.menuPaused=true;
  worldScenery=()=>[];game.enemies=[];game.keys={};game.attackTimer=game.spawnTimer=1e9;
  game.phase=0;game.phaseTarget=game.phaseSpawned=1e9;game.player.invuln=1e9;
  data.weaponType=weapon;data.unlockedWeapons=Object.keys(WEAPON_TYPES);projectCombatStyle();
  refreshUI();
 }
 function mob(x,y){const e=spawnEnemy();Object.assign(e,{x,y,hp:100000,maxHp:100000,speed:0,contact:1e9,castCooldown:1e9});return e;}
 function rigGap(a,b){return Math.max(...['main','back','toolTip','head'].filter(k=>a[k]&&b[k]).map(k=>Math.hypot(a[k].x-b[k].x,a[k].y-b[k].y)));}
 function workFrame(working,dt=0,rate=1){
  game.holdSkill=working?game.scene:null;
  game.workVisualClock+=dt*workAnimationSpeed(rate);
  game.workPresentation.at=performance.now()+(dt===0?1000:-dt*1000);
  return workshopAnimation(game.scene,working,working);
 }
 window.__animationBalanceTest={
  transitions(){
   let samples=0,maxReleaseGap=0,maxRestartGap=0,maxStep=0;
   const failures=[];
   for(const key of Object.keys(SKILLS)){
    __workshopTest.fresh(key,'');const pose=workshopAnimation(key,true,true).pose;
    for(const rate of [1,2,4,24])for(let phase=0;phase<12;phase++){
     game.workVisualClock=(phase/12+2)/DeepwellAvatar.workRate(pose);
     game.workPresentation={key,at:performance.now(),blend:1};
     const before=workFrame(true),a=DeepwellAvatar.poseRig(before),released=workFrame(false),b=DeepwellAvatar.poseRig(released);
     const releaseGap=rigGap(a,b);maxReleaseGap=Math.max(maxReleaseGap,releaseGap);
     if(Math.abs(before.workPhase-released.workPhase)>1e-8||releaseGap>.1)failures.push({key,rate,phase,releaseGap});
     let last=b;
     // Release, resume before settling, then release all the way to rest.
     for(let frame=0;frame<36;frame++){
      const working=frame>=5&&frame<14,next=DeepwellAvatar.poseRig(workFrame(working,1/120,rate));
      maxStep=Math.max(maxStep,rigGap(last,next));last=next;
      if(frame===4){const at=workFrame(false),restart=workFrame(true);maxRestartGap=Math.max(maxRestartGap,rigGap(DeepwellAvatar.poseRig(at),DeepwellAvatar.poseRig(restart)));}
     }
     samples++;
    }
   }
   return {activities:Object.keys(SKILLS).length,samples,maxReleaseGap,maxRestartGap,maxStep,failures};
  },
  input(key='mine'){
   __workshopTest.fresh(key,'');data.idleJobs=['',''];game.workVisualClock=.2/DeepwellAvatar.workRate(SKILLS[key].workPose||key);
   game.workPresentation={key,at:performance.now(),blend:1};refreshUI();
  },
  inputPose(){const f=workshopAnimation(game.scene,!!game.holdSkill,!!game.holdSkill);return {hold:game.holdSkill,phase:f.workPhase,rig:DeepwellAvatar.poseRig(f)};},
  empty(weapon){
   freshCombat(weapon);data.arrows=data.runes=0;data.ammoCharges={arrows:0,runes:0};mob(100,0);game.player.attackPose=0;game.attackTimer=0;
   for(let i=0;i<30;i++)tickCombat(.02);
   const empty={pose:game.player.attackPose,shots:game.shots.length,arrows:data.arrows,runes:data.runes};
   data[ammunitionResource()]=1;tickCombat(.02);
   return {empty,resupplied:{pose:game.player.attackPose,shots:game.shots.length,charge:ammunitionCharge(ammunitionResource())}};
  },
  enchant(weapon,sourceRank,switchedRank,roll=.1){
   freshCombat(weapon);const sourceStyle=combatStyle();
   if(Math.max(sourceRank,switchedRank)>2){
    data.cleared=zoneEnd(2);data.floor=zoneStart(3);
    for(const group of Object.values(DISCIPLINES))data[group.xp]=skillXpThreshold(20);
   }
   data.styles[sourceStyle].tier=Math.max(1,Math.ceil(sourceRank/2));data.styles.melee.tier=Math.max(1,Math.ceil(switchedRank/2));
   data.styles[sourceStyle].enchant=sourceRank;data.styles.melee.enchant=switchedRank;projectCombatStyle();
   data.arrows=data.runes=1;data.ammoCharges={arrows:0,runes:0};
   const primary=mob(135,0),other=mob(210,100),before=other.hp,random=Math.random;Math.random=()=>roll;
   try{
    const fired=attack(),source=game.shots[0]?.combatStyle;data.weaponType='sword';projectCombatStyle();
    for(let i=0;i<75;i++)tickCombat(.02);
    return {fired,source,primary:100000-primary.hp,secondary:before-other.hp};
   }finally{Math.random=random;}
  },
  enchantMenu(){
   freshCombat();data.cleared=zoneEnd(2);data.floor=zoneStart(3);data.styles.ranged.tier=3;data.styles.ranged.enchant=5;
   for(const key of Object.keys(RESOURCE_LABEL))if(key!=='zoneMaterials')data[key]=10000;
   data.biomeLoot[0]=10000;data.wardingDisciplineXp=skillXpThreshold(20);projectCombatStyle();
   const cost=styleUpgradeCost('ranged','enchant'),stock=Object.fromEntries(Object.keys(cost).map(key=>[key,data[key]]));
   styleBench='ranged';openWorkshop('warding','equipment');
   return {cost,stock,chance:enchantmentChance(5)};
  },
  enchantState(){return {rank:data.styles.ranged.enchant,chance:enchantmentChance(data.styles.ranged.enchant),stock:Object.fromEntries(Object.keys(styleUpgradeBase('ranged','enchant',5)).map(key=>[key,data[key]])),guide:codexDetailHtml(codexEntry('permanent_enchant'))};},
  reduced(){
   __workshopTest.fresh('rune','');data.reducedMotion=true;game.workPresentation={key:'rune',at:performance.now(),blend:1};
   const first=DeepwellAvatar.poseRig(workFrame(true));game.workVisualClock+=100;
   const second=DeepwellAvatar.poseRig(workFrame(true));return {stable:JSON.stringify(first)===JSON.stringify(second)};
  },
  glyph(){
   __workshopTest.fresh('rune','');const frame=workshopAnimation('rune',true,true),rig=DeepwellAvatar.poseRig(frame);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const c=canvas.getContext('2d');
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,32,32);
   const arenaBefore=ctx.getImageData(0,0,32,32).data;
   c.translate(30,120);c.scale(2,2);paintWorkshopWorkpiece(frame,rig,c);
   const untouched=ctx.getImageData(0,0,32,32).data.every((v,i)=>v===arenaBefore[i]);ctx.restore();
   let bright=0;const pixels=c.getImageData(0,0,160,160).data;
   for(let i=0;i<pixels.length;i+=4)if(pixels[i]>150&&pixels[i+1]>150&&pixels[i+2]>150&&pixels[i+3]>0)bright++;
   return {untouched,bright};
  }
 };
}

(async()=>{
 const runtime=await createRuntime(),errors=[],passed=[];
 try{
  const original=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);';
  const html=original.replace(seam,[workshopFixture,animationBalanceFixture].map(f=>'('+f.toString()+')();').join('')+seam);
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));
  await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__animationBalanceTest&&!document.documentElement.classList.contains('game-loading'));
  const call=(name,...args)=>p.evaluate(({name,args})=>__animationBalanceTest[name](...args),{name,args});
  const transitions=await call('transitions');
  assert.equal(transitions.activities,31);assert.equal(transitions.samples,1488);assert.deepEqual(transitions.failures,[]);
  assert.ok(transitions.maxRestartGap<.1,JSON.stringify(transitions));assert.ok(transitions.maxStep<15,JSON.stringify(transitions));
  passed.push('All 31 work activities retain their clip on release and immediate resume at 1x/2x/4x/24x; 1,488 sampled transitions settle continuously');

  // Real keyboard and touch cancellation pass through the shipped input handlers.
  for(const key of ['mine','ward','rune','polish']){
   await call('input',key);await p.keyboard.down('Space');const held=await call('inputPose');assert.equal(held.hold,key);
   await p.keyboard.up('Space');const released=await call('inputPose');assert.equal(released.hold,null);assert.equal(released.phase,held.phase);
  }
  const touch=await p.context().newCDPSession(p);await call('input','wood');
  const box=await p.locator('#skillHold').boundingBox(),point={x:box.x+box.width/2,y:box.y+box.height/2,id:1};
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});const held=await call('inputPose');assert.equal(held.hold,'wood');
  await touch.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});const cancelled=await call('inputPose');assert.equal(cancelled.hold,null);assert.equal(cancelled.phase,held.phase);
  await touch.detach();assert.deepEqual(await call('reduced'),{stable:true});
  passed.push('Real Space release and mobile touch cancellation stop work without a pose reset; reduced-motion work remains stable');

  for(const weapon of ['bow','staff']){
   const row=await call('empty',weapon);assert.deepEqual(row.empty,{pose:0,shots:0,arrows:0,runes:0});
   assert.ok(row.resupplied.pose>0&&row.resupplied.shots===1&&row.resupplied.charge===10,JSON.stringify(row));
   for(const sourceRank of [0,2])for(const switchedRank of [0,2]){
    const hit=await call('enchant',weapon,sourceRank,switchedRank);assert.ok(hit.fired&&hit.primary>0,JSON.stringify(hit));
    assert.equal(hit.source,weapon==='bow'?'ranged':'magic');
    assert.ok(sourceRank?Math.abs(hit.secondary-hit.primary*.5)<1e-6:hit.secondary===0,JSON.stringify({weapon,sourceRank,switchedRank,...hit}));
   }
  }
  passed.push('Empty ranged weapons do not animate a failed attack; resupply resumes real firing, and airborne arrows/spells retain their source style enchantment');

  const chances=[0,.14,.28,.42,.56,.58,.60];
  for(let rank=1;rank<chances.length;rank++)for(const delta of [-.001,.001]){
   const hit=await call('enchant','bow',rank,0,chances[rank]+delta);assert.equal(hit.secondary>0,delta<0,JSON.stringify({rank,delta,...hit}));
  }
  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
   await p.setViewportSize(viewport);const menu=await call('enchantMenu');assert.equal(menu.chance,.58);
   const row=p.locator('.craft-tile').filter({has:p.locator('[data-style-upgrade="ranged:enchant"]')});
   assert.match(await row.innerText(),/58% → 60% arc chance/);
   const upgrade=row.locator('[data-style-upgrade="ranged:enchant"]');await upgrade.scrollIntoViewIfNeeded();
   await p.screenshot({path:runtime.resultsDir+'/enchantment-'+viewport.width+'.png'});
   await upgrade.focus();await p.keyboard.press('Enter');
   const after=await call('enchantState');assert.equal(after.rank,6);assert.equal(after.chance,.60);
   for(const [key,n]of Object.entries(menu.cost))assert.equal(menu.stock[key]-after.stock[key],n,key);
   assert.match(await row.innerText(),/60% arc chance/);assert.match(after.guide,/14% \/ 28% \/ 42% \/ 56% \/ 58% \/ 60%/);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  passed.push('Every paid enchantment rank improves actual proc chance; the final Mithril upgrade spends its normal recipe and shows its 58% to 60% gain');

  const glyph=await call('glyph');assert.ok(glyph.untouched&&glyph.bright>0,JSON.stringify(glyph));
  passed.push('Rune engraving draws its glyph into the requested canvas without leaking into the arena');
  assert.deepEqual(errors,[]);assert.equal(fs.readFileSync('index.html','utf8'),original);
  const report={passed,transitions,glyph,errors};fs.writeFileSync(runtime.resultsDir+'/animation-balance.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
