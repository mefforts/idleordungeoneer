// Isolated browser review states; no fixture is embedded in the game build.
function abilityEffectsFixture(){
 const types=['volley','ground','beam','reflect','mend','fury','cleave','charge','ricochet','shield',...Object.keys(EXPANDED_ABILITIES)];
 function show(type,kind=0,stage='warning',elite=false){
  __encounterTest.fresh(kind,3);data.idleNoticeSlots=2;data.idleFirstAssigned=true;data.combatLanguageTipSeen=true;game.manualPaused=false;game.menuPaused=true;game.frame=4;
  const e=__encounterTest.owner(2,elite);e.hp=780;e.castCooldown=1e6;game.player.invuln=1e9;game.player.hp=game.player.maxHp=1000;game.player.x=30;game.player.y=25;
  if(type==='shield'){const other=spawnEnemy();Object.assign(other,{x:105,y:-90,hp:1000,maxHp:1000,speed:0,contact:1e6,elite:true,boss:false,bossIndex:0});}
  const c=__encounterTest.cast(e,type);if(c.type!==type)throw Error(type+' fell back to '+c.type);c.windup=c.total*.35;
  if(stage==='impact'){
   e.cast=null;resolveBossCast(e,c);tickBossBursts(.01);tickEncounterObjects(.01);
   for(const s of game.hostileShots)advanceExpandedShot(s,.65);
   for(const h of game.hazards){h.life=h.total*.64;h.age=h.total*.36;}
   for(const fx of game.counterEffects)fx.life=fx.total*.64;
   for(const t of game.totems){t.age=1;if(t.destructible){t.spawnPoint=summonPoint(e,t.x+65,t.y+65);t.spawnWarn=.7;}}
  }
  $('toastStack').replaceChildren();refreshUI();render();return {type:c.type,warning:c.total,hazards:game.hazards.length,shots:game.hostileShots.length};
 }
 function readPixels(){
  // The production canvas is opaque: clearRect leaves black, not transparent pixels.
  const p=ctx.getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261,count=0;for(let i=0;i<p.length;i+=4)if(p[i]||p[i+1]||p[i+2]){count++;hash=Math.imul(hash^i,16777619);for(let k=0;k<4;k++)hash=Math.imul(hash^p[i+k],16777619);}return {hash:hash>>>0,count};
 }
 function art(){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2-game.camX,canvas.height/2-game.camY);
  paintEncounterGround();for(const t of game.totems)paintTotem(t);paintEncounterLinks();paintEliteLinks();for(const s of game.hostileShots)paintDungeonProjectile(s);ctx.restore();return readPixels();
 }
 function mechanics(){return JSON.stringify({data,frame:game.frame,runSeconds:game.runSeconds,player:{hp:game.player.hp,x:game.player.x,y:game.player.y,rally:game.player.rallyTime,invuln:game.player.invuln},enemies:game.enemies.map(e=>({hp:e.hp,x:e.x,y:e.y,cast:e.cast&&{type:e.cast.type,windup:e.cast.windup,angle:e.cast.angle,shapes:e.cast.shapes},cooldown:e.castCooldown,charge:e.charge})),totems:game.totems.map(t=>({hp:t.hp,age:t.age,blocked:t.blocked,healReserve:t.healReserve})),hazards:game.hazards.map(h=>({life:h.life,delay:h.delay,damage:h.damage,age:h.age})),shots:game.hostileShots.map(s=>({x:s.x,y:s.y,vx:s.vx,vy:s.vy,life:s.life,rad:s.rad}))});}
 window.__abilityEffectsTest={types:()=>types,show,art,mechanics,
  frame(value){game.frame=value;},reduced(value){data.reducedMotion=value;},
  advance(dt){game.manualPaused=game.menuPaused=false;tickCombat(dt);game.manualPaused=false;game.menuPaused=true;refreshUI();render();},
  reset(){resetRun();},
  draw(){refreshUI();render();},
  start(){const e=game.enemies.find(e=>e.cast);if(e)e.cast.windup=e.cast.total;},
  stream(type,blocked=false,disabled=false,frame=4,reduced=false){
   data.reducedMotion=reduced;game.frame=frame;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.translate(70,180);
   paintAbilityStream({type,blocked,disabled},{x:0,y:0},{x:180,y:0},{x:220,y:80});ctx.restore();const sample=[...ctx.getImageData(150,181,1,1).data];return {...readPixels(),sample,theme:totemSignal({type})};
  },
  field(shape,active=true){
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);paintAbilityField(shape,'sunder',0,combatTheme('danger'),.65,active);ctx.restore();
   const p=ctx.getImageData(0,0,canvas.width,canvas.height).data;let errors=0,painted=0;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(!p[i]&&!p[i+1]&&!p[i+2])continue;painted++;if(shape.shape==='quarters'?x>=181&&x<=329&&y>=31&&y<=179:Math.hypot(x-180,y-180)<73)errors++;}return {errors,painted};
  },
  recipient(blocked){const t=game.totems.find(t=>!t.destructible);if(!t)return;t.x=-110;t.y=120;t.owner.x=25;t.owner.y=-70;game.player.x=blocked?-40:140;game.player.y=blocked?20:145;tickEncounterObjects(.001);refreshUI();render();},
  dualStreams(){
   show('mend',0,'impact');const owner=game.totems[0].owner,c=__encounterTest.cast(owner,'fury');owner.cast=null;resolveBossCast(owner,c);owner.x=0;owner.y=-75;
   for(const t of game.totems){t.x=t.type==='mend'?-115:115;t.y=100;}game.player.x=0;game.player.y=285;tickEncounterObjects(.01);refreshUI();render();return game.totems.map(t=>({type:t.type,blocked:t.blocked}));
  },
  dodge(){game.player.x=-125;game.player.y=110;refreshUI();render();},
  cleanup(){for(const e of [...game.enemies])onKill(e);return art();},
  performance(){
   const shape={shape:'rect',rect:{left:0,top:0,right:390,bottom:844}},start=performance.now();for(let i=0;i<30;i++)paintAbilityField(shape,'sunder',i%4,combatTheme('danger'),.6,true);return (performance.now()-start)/30;
  }
 };
}
module.exports={abilityEffectsFixture};
