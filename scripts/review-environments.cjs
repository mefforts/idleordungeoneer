const fs=require('node:fs'),path=require('node:path'),{createRuntime}=require('../tests/runtime.cjs');
function fixture(){
 window.__environmentReview={
  async ready(){await Promise.all(Object.keys(ENVIRONMENT_ART).map(key=>environmentImage(key).decode()));await Promise.all([creatureImage.decode(),propImage.decode(),groundImage.decode()]);},
  show(kind,stage){
   closeDrawer();hideOverlay();data=defaults();data.floor=floorAtZone(kind,sampleFloorStage(kind,stage));data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;data.zone2SkillsAnnounced=data.skillsNudgeSeen=true;data.idleNoticeSlots=2;data.idleFirstAssigned=true;data.equipmentVersion=data.tierProgressionVersion=1;data.ownedArmor=['melee_1'];data.equippedArmor='melee_1';
   normalizeProgression();normalizeZone();resetRun();game.scene='combat';game.status='running';game.menuPaused=true;game.manualPaused=false;game.phase=stage===3?4:0;game.phaseTarget=zoneBalance().targets[game.phase];game.frame=4.7;game.camX=game.camY=0;game.player.x=0;game.player.y=35;game.enemies=[];
   const points=[[-135,-85],[150,-40],[-210,78],[225,120],[-90,180],[95,-180],[-280,-180],[290,-140],[300,245]];
   for(let i=0;i<points.length;i++){const e=spawnEnemy();e.elite=e.boss=false;e.rad=15;e.x=points[i][0];e.y=points[i][1];e.visualType=i%6;e.hp=e.maxHp=100;e.lastHitAt=-20;}
   setScene('combat',false);$('toastStack').replaceChildren();$('idleUnlockNudge').classList.add('hidden');refreshUI();render();
  },
  gallery(){
   const surface=document.createElement('main');surface.id='environmentGallery';surface.style.cssText='position:fixed;inset:0;z-index:9999;background:#1e211e;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:7px;padding:9px';document.body.append(surface);
   for(let kind=0;kind<4;kind++)for(let stage=1;stage<=3;stage++){
    this.show(kind,stage);const card=document.createElement('section');card.style.cssText='position:relative;overflow:hidden';const copy=document.createElement('canvas');copy.width=game.viewWidth;copy.height=game.viewHeight;copy.getContext('2d').drawImage(canvas,0,0,copy.width,copy.height);copy.style.cssText='width:100%;height:100%;object-fit:cover';card.append(copy);
    const label=document.createElement('strong');label.textContent=BIOMES[kind].name+' · Floor '+zoneStage()+'/'+zoneFloorCount();label.style.cssText='position:absolute;left:12px;top:10px;color:#f7e8c6;font:500 16px Georgia;text-shadow:0 2px 4px #000';card.append(label);surface.append(card);
   }
  }
 };
}
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),errors=[];
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+fixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.evaluate(()=>__environmentReview.ready());
  for(let kind=0;kind<4;kind++)for(let stage=1;stage<=3;stage++){await p.evaluate(({kind,stage})=>__environmentReview.show(kind,stage),{kind,stage});await p.screenshot({path:path.join(runtime.resultsDir,'environment-'+kind+'-'+stage+'.png')});}
  await p.evaluate(()=>__environmentReview.show(0,2));await p.screenshot({path:path.join(root,'preview-environments.png')});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__environmentReview.show(2,3));await p.screenshot({path:path.join(root,'preview-environments-mobile.png')});
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>__environmentReview.gallery());await p.screenshot({path:path.join(root,'preview-floor-progression.png')});
  if(errors.length)throw Error(errors.join('; '));console.log('Reviewed all 12 zone/floor scenes; captured desktop, phone and floor-progression previews.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
