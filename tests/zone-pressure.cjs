const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{createRuntime}=require('./runtime.cjs'),{dungeonCombatFixture}=require('./dungeon-combat-fixture.cjs'),{delveUpdateFixture}=require('./delve-update-fixture.cjs');
// Short deterministic pressure comparisons use real damage, health and ammunition.
// They illustrate counterplay, rather than claim to reproduce a human playthrough.
function pressureFixture(){
 window.__zonePressure=(seed,careful,scale)=>{
  __delveUpdate.fresh(1);data.weaponType='bow';data.unlockedWeapons.push('bow');data.ownedArmor=['ranged_1'];data.equippedArmor='ranged_1';data.arrows=10000;
  const s=data.styles.ranged;s.tier=1;let closest=Infinity,chosen={weapon:0,speed:0};
  for(let w=0;w<=10;w++)for(let a=0;a<=5;a++){s.weapon=w;s.speed=a;projectCombatStyle();const error=Math.abs(weaponDps('bow')-55);if(error<closest){closest=error;chosen={weapon:w,speed:a};}}
  Object.assign(s,chosen);projectCombatStyle();game.player.hp=game.player.maxHp=maxHp();game.player.invuln=0;game.player.x=0;game.player.y=140;game.attackTimer=0;game.phase=1;
  const oldRandom=Math.random,oldScale=incomingDamageScale;let value=seed;Math.random=()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);incomingDamageScale=()=>scale;
  let hits=0,lost=0,seconds=0,reflections=0;const oldHurt=hurt,oldResolve=resolveReflectWard;hurt=amount=>{const before=game.player.hp;oldHurt(amount);if(game.player.hp<before){hits++;lost+=before-game.player.hp;}};resolveReflectWard=(e,c)=>{oldResolve(e,c);if(c.reflected)reflections++;};
  try{
   const e=spawnEnemy(true,0);e.hp=e.maxHp=zoneEnemyHp(true,0);e.x=0;e.y=-100;game.boss=e;e.castCooldown=.2;const hp=game.player.hp,dps=weaponDps('bow');
   for(;seconds<90&&game.status==='running'&&game.enemies.includes(e);seconds+=.02){
    const p=game.player;let target=null;
    if(careful){
     const c=e.cast;
     if(isReflectCast(c)){
      const q=c.point,foot=encounterFoot(p),dx=foot.x-q.x,dy=foot.y-q.y,distance=Math.hypot(dx,dy);
      if(!q.armed){const angle=Math.atan2(dy,dx);target={x:q.x+Math.cos(angle)*70,y:q.y+Math.sin(angle)*70-13};}
      else if(q.variant==='jaw'&&distance>q.inner+8){const angle=Math.atan2(dy,dx),difference=Math.atan2(Math.sin(q.gapAngle-angle),Math.cos(q.gapAngle-angle));target=Math.abs(difference)>.18?{x:q.x+Math.cos(angle+Math.sign(difference)*.25)*(q.r+35),y:q.y+Math.sin(angle+Math.sign(difference)*.25)*(q.r+35)-13}:{x:q.x,y:q.y-13};}
      else target={x:q.x,y:q.y-13};
     }else{const angle=Math.atan2(p.y-e.y,p.x-e.x)+.14;target={x:e.x+Math.cos(angle)*175,y:e.y+Math.sin(angle)*175};}
     // A deliberate dash away from an imminent projectile uses the real cooldown.
     if(game.hostileShots.some(h=>Math.hypot(h.x-p.x,h.y-p.y)<55)&&p.dashCooldown<=0)dash();
    }
    game.joystick.pointer=careful?-1:null;game.joystick.x=target?target.x-p.x:0;game.joystick.y=target?target.y-p.y:0;
    tickCombat(.02);
   }
   return {seed,careful,scale,dps,gear:chosen,maxHp:hp,seconds:Number(seconds.toFixed(2)),status:game.status,bossDefeated:!game.enemies.includes(e),remainingHp:Number(game.player.hp.toFixed(1)),hits,damageTaken:Number(lost.toFixed(1)),reflections};
  }finally{Math.random=oldRandom;incomingDamageScale=oldScale;hurt=oldHurt;resolveReflectWard=oldResolve;game.joystick.pointer=null;game.joystick.x=game.joystick.y=0;}
 };
}
(async()=>{const runtime=await createRuntime(),errors=[];try{
 const source=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=source.replace(seam,'('+dungeonCombatFixture.toString()+')();('+delveUpdateFixture.toString()+')();('+pressureFixture.toString()+')();'+seam),p=await runtime.browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__zonePressure&&!document.documentElement.classList.contains('game-loading'));
 const rows=[];for(const seed of [19,107,523])for(const careful of [false,true])for(const scale of [1,1.25])rows.push(await p.evaluate(({seed,careful,scale})=>__zonePressure(seed,careful,scale),{seed,careful,scale}));
 assert.deepEqual(errors,[]);assert.ok(rows.every(r=>Math.abs(r.dps-55)<3&&r.maxHp<200));assert.ok(rows.every(r=>r.bossDefeated||r.status==='dead'),'Runs must finish by defeating the guardian or dying');
 const summary={scenario:'First Zone 2 guardian, basic Iron ranged armor, approximately 55 DPS, no perks/blessings, real health/ammo/damage; deterministic stationary and counterplay bots',rows,errors};fs.writeFileSync(path.join(runtime.resultsDir,'zone-pressure.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
