// A short deterministic controller comparison, with ordinary health and damage.
function challengePressureFixture(){
 window.__challengePressure=(zone,final,careful,seed)=>{
  __workshopUpdate.fresh(zone);data.floor=final?zoneEnd(zone):zoneStart(zone);data.cleared=data.floor-1;normalizeZone();data.weaponType='bow';data.unlockedWeapons=['sword','bow'];data.arrows=10000;
  data.ownedArmor=['ranged_2'];data.equippedArmor='ranged_2';__workshopUpdate.level('woodworking',10);const gear=data.styles.ranged;gear.tier=2;gear.armor=3;let best=Infinity,chosen={};
  for(let weapon=0;weapon<=TIER_LIMITS[2].weapon;weapon++)for(let speed=0;speed<=10;speed++){gear.weapon=weapon;gear.speed=speed;const error=Math.abs(weaponDps('bow')-150);if(error<best){best=error;chosen={weapon,speed};}}
  Object.assign(gear,chosen);projectCombatStyle();data.seenElites[biomeIndex()]=[true,true,true];
  const original={random:Math.random,hurt,spawnGraveEcho};let value=seed,damage=0,hits=0,echoes=0,seconds=0;const casts=new Set();
  Math.random=()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);
  hurt=amount=>{const before=game.player.hp;original.hurt(amount);if(game.player.hp<before){hits++;damage+=before-game.player.hp;}};
  spawnGraveEcho=e=>{const before=(game.graveEchoes||[]).length;original.spawnGraveEcho(e);echoes+=Math.max(0,(game.graveEchoes||[]).length-before);};
  try{
   startFloor();game.menuPaused=game.manualPaused=false;game.devSpeed=game.skillSpeed=1;const hp=game.player.hp,dps=weaponDps('bow'),dt=.02;
   for(;seconds<150&&game.status==='running'&&game.phase<2;seconds+=dt){
    if(eliteRewardOpen()){const drop=data.eliteSpoils.find(d=>d.id===eliteRewardId),order=['fervor','stoneguard','quagmire','windstep','momentum'];chooseEliteBoon(order.find(id=>drop.choices.includes(id))||drop.choices[0]);}
    const p=game.player;for(const e of game.enemies)if(e.cast)casts.add(e.cast.type);let target=null;
    if(careful){
     const mirror=game.enemies.find(e=>isReflectCast(e.cast)),spire=(game.totems||[]).find(t=>t.destructible),nearest=combatTargets().sort((a,b)=>bodyDistance(a,p.x,p.y)-bodyDistance(b,p.x,p.y))[0],major=game.enemies.find(e=>e.cast?.type==='sunder');
     if(mirror){const q=mirror.cast.point,dx=p.x-q.x,dy=p.y+13-q.y,d=Math.hypot(dx,dy)||1;if(!q.armed)target={x:q.x+dx/d*70,y:q.y+dy/d*70-13};else{const angle=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(q.gapAngle-angle),Math.cos(q.gapAngle-angle));target=q.variant==='jaw'&&d>q.inner+8&&Math.abs(diff)>.18?{x:q.x+Math.cos(angle+Math.sign(diff)*.3)*(q.r+35),y:q.y+Math.sin(angle+Math.sign(diff)*.3)*(q.r+35)-13}:{x:q.x,y:q.y-13};}}
     else if(spire){const q=encounterFoot(spire),dx=p.x-q.x,dy=p.y+13-q.y,d=Math.hypot(dx,dy)||1;target=spire.bumpContact&&p.dashCooldown>0?{x:q.x+dx/d*58,y:q.y+dy/d*58-13}:{x:q.x,y:q.y-13};if(d<115&&p.dashCooldown<=0){p.vx=-dx/d;p.vy=-dy/d;dash();}}
     else if(major){const q=major.cast.safe;target={x:(q.left+q.right)/2,y:(q.top+q.bottom)/2};}
     else if(nearest){const angle=Math.atan2(p.y-nearest.y,p.x-nearest.x)+.15;target={x:nearest.x+Math.cos(angle)*210,y:nearest.y+Math.sin(angle)*210};}
     const wave=game.hazards.find(h=>h.wave&&!(h.delay>0)&&Math.abs(Math.hypot(p.x-h.x,p.y-h.y)-h.r)<80);
     if(wave&&!mirror&&!spire&&!wave.playerHit){const dx=p.x-wave.x,dy=p.y-wave.y,d=Math.hypot(dx,dy)||1;target={x:p.x-dx/d*120,y:p.y-dy/d*120};if(p.dashCooldown<=0){p.vx=-dx/d;p.vy=-dy/d;dash();}}
     const shot=game.hostileShots.find(s=>Math.hypot(s.x-p.x,s.y-p.y)<65),ghost=(game.graveEchoes||[]).find(e=>e.age>.6&&Math.hypot(e.x-p.x,e.y-p.y)<65);
     if((shot||ghost)&&p.dashCooldown<=0){const threat=shot||ghost,dx=p.x-threat.x,dy=p.y-threat.y,d=Math.hypot(dx,dy)||1;p.vx=dx/d;p.vy=dy/d;dash();}
    }
    game.joystick.pointer=careful?-1:null;game.joystick.x=target?target.x-p.x:0;game.joystick.y=target?target.y-p.y:0;tickCombat(dt);
   }
   return {zone:zone+1,stage:final?'Final floor':'Opening floor',careful,seed,dps:Number(dps.toFixed(2)),gear:chosen,maxHp:hp,remainingHp:Number(game.player.hp.toFixed(1)),seconds:Number(seconds.toFixed(2)),status:game.status,phase:game.phase,clearedOpeningGuardian:game.phase>=2,hits,damage:Number(damage.toFixed(1)),echoes,casts:[...casts]};
  }finally{Math.random=original.random;hurt=original.hurt;spawnGraveEcho=original.spawnGraveEcho;game.joystick.pointer=null;game.joystick.x=game.joystick.y=0;}
 };
}
module.exports={challengePressureFixture};
