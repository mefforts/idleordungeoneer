// Injected into isolated browser responses only.
function mobileFixture(){
 window.__mobileTest={
  fresh(gear=false){
   resetArenaTouch();if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();
   if(gear){data.floor=4;data.cleared=3;data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.ownedArmor=Object.keys(ARMOR_SETS);data.equippedArmor='melee_1';data.equipmentVersion=data.tierProgressionVersion=1;}
   data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=true;normalizeProgression();normalizeZone();ensureJobs();seedCodex();resetRun();
   game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=false;game.keys={};game.mouseMove.active=false;game.player.invuln=1e9;game.phase=1;game.phaseTarget=1e9;game.transition=0;game.attackTimer=1e9;game.enemies=[];game.boss=null;game.devSpeed=game.skillSpeed=1;equipmentTab='weapons';tourIndex=-1;
   setScene('combat',false);$('toastStack').replaceChildren();refreshUI();
  },
  motion(){return {x:game.player.x,y:game.player.y,pointer:game.joystick.pointer,dx:game.joystick.x,dy:game.joystick.y,touch:!!arenaTouch,guide:!$('arenaTouchGuide').classList.contains('hidden'),dash:game.player.dashCooldown};},
  menu(){openDrawer('gear');},pause(){toggleManualPause();},
  resources(){data.ore=0;data.logs=7;data.biomeLoot={0:2,2:5};data.discovered={resource_ore:1};refreshUI();},
  addLog(){data.logs++;refreshUI();},
  hint(kind){
   if(kind==='gold'){data.gold=150;refreshUI();}
   if(kind==='fail'){data.gold=data.bars=0;const result=craftStyleUpgrade('melee','weapon');refreshUI();return result;}
   if(kind==='refine'){data.gold=1000;data.bars=100;return craftStyleUpgrade('melee','weapon');}
   if(kind==='craft'){data.gold=data.bars=data.logs=1000;data.woodworkingXp=3000;return chooseWeapon('bow');}
   if(kind==='save')save();
   return {crafted:data.firstWeaponCrafted,rank:data.styles.melee.weapon,visible:!$('firstWeaponHint').classList.contains('hidden')};
  },
  pins(side){data.devSpeedUnlocked=true;data.hudLayout.side=side;applyHudLayout();refreshUI();},
  async iconMetrics(){
   return Promise.all([...document.querySelectorAll('.icon-rail>.hud-icon,#speedToggle')].filter(button=>button.getClientRects().length).map(async button=>{
    const image=button.querySelector('img');await image.decode();const surface=document.createElement('canvas');surface.width=image.naturalWidth;surface.height=image.naturalHeight;const c=surface.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,surface.width,surface.height).data;let left=surface.width,right=0,top=surface.height,bottom=0;
    for(let y=0;y<surface.height;y++)for(let x=0;x<surface.width;x++)if(pixels[(y*surface.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    const b=button.getBoundingClientRect(),i=image.getBoundingClientRect();return {id:button.id,fill:Math.min((right-left+1)/surface.width*i.width/b.width,(bottom-top+1)/surface.height*i.height/b.height),x:b.x,y:b.y,right:b.right,bottom:b.bottom};
   }));
  }
 };
}
module.exports={mobileFixture};
