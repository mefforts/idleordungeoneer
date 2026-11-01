// Isolated review and test state; never embedded in the downloadable game.
function workshopFixture(){
 let frozen=null;const animate=workshopAnimation;
 workshopAnimation=(...args)=>{const frame=animate(...args);if(frozen!==null){frame.phase=frame.workPhase=frozen;frame.time=frozen*6;}return frame;};
 function fresh(key='scavenge',armor='ranged_1',zone=0){
  resetArenaTouch();if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=zoneStart(zone);data.cleared=Math.max(zoneEnd(0),zoneStart(zone)-1);data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=data.skillsNudgeSeen=data.zone2SkillsAnnounced=true;
  data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.ownedArmor=Object.keys(ARMOR_SETS);data.equippedArmor=armor;data.equipmentVersion=data.tierProgressionVersion=1;
  for(const key of Object.keys(RESOURCE_LABEL))data[key]=200;data.gold=45;normalizeProgression();normalizeZone();ensureJobs();resetRun();tourIndex=-1;
  game.status='ready';game.menuPaused=game.manualPaused=true;game.keys={};game.enemies=[];game.activeClockMs=10000;game.lastActiveAt={};game.activeHits=0;game.lastActiveSkill='';game.holdSkill=null;game.workReward=null;game.devSpeed=game.skillSpeed=1;frozen=null;
  enterActivity(key);$('toastStack').replaceChildren();refreshUI();
 }
 window.__workshopTest={
  fresh,
  ready(){return Promise.allSettled([...campArt,zone2CampImage,...workshopArtImages.values()].filter(Boolean).map(image=>image.decode()));},
  hub(){openWorkshop('scavenging','gather');},
  snapshot(){return {gold:data.gold,material:data[SKILLS[game.scene]?.resource],reward:game.workReward,scene:game.scene,hold:game.holdSkill,goal:data.craftGoal};},
  cycle(active=true){return produce(game.scene,active);},
  review(key,armor='magic_1',zone=0,phase=.25){fresh(key,armor,zone);frozen=phase;game.holdSkill=key;game.lastActiveAt[key]=game.activeClockMs-phase*skillInterval(key)*1000;refreshUI();render();},
  reward(){game.workReward=null;delete game.lastActiveAt[game.scene];activeSkill(game.scene);refreshUI();render();},
  hud(weapon,side,large=false){fresh('scavenge');data.weaponType=weapon;data.hudLayout.side=side;if(large){data.runes=data.arrows=1e12;zoneShopFor().currency=1e12;}data.ammoCharges={arrows:7.5,runes:7.5};projectCombatStyle();applyHudLayout();setScene('combat',false);game.status='running';game.manualPaused=game.menuPaused=true;refreshUI();render();},
  async healing(){fresh('scavenge','melee_1');setScene('combat',false);game.status='running';game.manualPaused=game.menuPaused=true;data.idleNoticeSlots=2;data.idleFirstAssigned=true;game.player.hp=game.player.maxHp*.55;game.player.invuln=0;game.healthDrops=[{x:-55,y:60,fraction:.05,elite:false},{x:65,y:90,fraction:.25,elite:true}];await healthDropImage.decode();refreshUI();render();},
  pose(pose,phase=0){return DeepwellAvatar.poseRig({pose,working:true,workPhase:phase,time:1,data});},
  contacts(){
   const canvas=document.createElement('canvas');canvas.id='workshopPoseReview';canvas.width=1710;canvas.height=1070;canvas.style='position:fixed;inset:0;z-index:999999;background:#28261e';document.body.append(canvas);const c=canvas.getContext('2d'),base={...data},sets=Object.keys(ARMOR_SETS),poses=['idle','mine','smith','wood','fletch','ward','rune','polish','scavenge'];c.fillStyle='#28261e';c.fillRect(0,0,canvas.width,canvas.height);c.font='13px system-ui';c.fillStyle='#e7d5af';poses.forEach((pose,i)=>c.fillText(pose,i*190+70,20));sets.forEach((id,row)=>{c.fillStyle='#b7a583';c.fillText(id,8,row*170+48);poses.forEach((pose,col)=>DeepwellAvatar.render(c,{x:col*190+80,y:row*170+165,scale:1.45,time:1,pose,working:true,workPhase:.92,data:{...base,equippedArmor:id,ownedArmor:sets}}));});
  }
 };
}
module.exports={workshopFixture};
