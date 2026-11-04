const fs=require('node:fs'),assert=require('node:assert/strict');
const {createRuntime}=require('./runtime.cjs'),{encounterFixture}=require('./encounter-fixture.cjs');
// Controlled lanes isolate wave timing; the combat-cues suite also uses real terrain.
function gravePulseFixture(){
 function fresh(distance=300,stacks=0){
  __encounterTest.fresh(2,1);const e=__encounterTest.owner(0);e.x=e.y=0;e.hp=e.maxHp=1e9;e.contact=e.castCooldown=1e9;
  const p=game.player;p.x=distance;p.y=0;p.invuln=p.dashCooldown=0;data.eliteBoons=Array.from({length:stacks},()=>({id:'windstep',remaining:40,dungeon:dungeonForZone().id}));
  e.phaseQueue=['gravePulse'];if(!beginBossCast(e))throw Error('Pulse deferred');const cast=e.cast;e.cast=null;resolveBossCast(e,cast);return {e,p,h:game.hazards[0],cast};
 }
 function openLane(fn){const original=worldScenery;worldScenery=()=>[];try{return fn();}finally{worldScenery=original;}}
 window.__gravePulse={
  trial(mode='wait',stacks=0,dt=.02){return openLane(()=>{
   const {p,h,cast}=fresh(mode==='far'?2400:mode==='center'?0:300,stacks),before=p.hp,count=game.hazards.length,samples=[];let dashed=false,crossed=false,monotonic=true,last=h.r,hitAt=null;
   for(let t=0;t<12&&game.hazards.includes(h);t+=dt){
    game.joystick.pointer=-1;game.joystick.x=mode==='run'?1:mode==='walkIn'?-1:0;game.joystick.y=0;
    const gap=Math.hypot(p.x-h.x,p.y-h.y)-h.r;
    if(!dashed&&(mode==='early'||mode==='outward'||mode==='dash'&&gap<55)){p.vx=mode==='outward'?1:-1;p.vy=0;dash();dashed=true;}
    tickCombat(dt);monotonic&&=h.r>last;last=h.r;crossed||=!!h.playerHit;
    if(p.hp<before&&hitAt===null)hitAt=t+dt;
    if(t<dt||t>=2.98&&t<3.02||t>=5.98&&t<6.02)samples.push({seconds:t+dt,r:h.r,alive:game.hazards.includes(h)});
    if(mode!=='dash'&&p.hp<before)break;
   }
   game.joystick.pointer=null;return {mode,stacks,dt,count,before,after:p.hp,dashed,crossed,monotonic,hitAt,samples,remaining:game.hazards.length,speed:h.waveSpeed,walkSpeed:playerMoveSpeed(),warning:cast.total,hint:cast.hint};
  });},
  scheduling(){return openLane(()=>{
   const {e,p,h}=fresh(),other=__encounterTest.owner(0,true);other.x=150;other.y=0;other.castCooldown=1e9;other.phaseQueue=['gravePulse'];
   const active=beginBossCast(other);game.hazards=[];e.phaseQueue=['gravePulse'];beginBossCast(e);const warning=beginBossCast(other);e.cast=null;
   const cooldown=[];for(const value of [3.2,1.31,1.3]){p.dashCooldown=value;other.cast=null;other.phaseQueue=['gravePulse'];cooldown.push({value,allowed:beginBossCast(other)});}
   const cast=other.cast;for(let elapsed=0;elapsed<cast.total-.02;elapsed+=.02){p.dashCooldown=Math.max(0,p.dashCooldown-.02);tickBossSpecial(other,.02);}
   return {active,warning,cooldown,readyBeforeImpact:p.dashCooldown===0,pending:!!other.cast,firstWaveSpeed:h.waveSpeed};
  });},
  boosted(){const {p,h}=fresh();const base=h.waveSpeed;data.eliteBoons=Array.from({length:12},()=>({id:'windstep',remaining:40,dungeon:dungeonForZone().id}));p.x=10000;tickDungeonHazards(.02);const accelerated=h.waveSpeed;data.eliteBoons=[];tickDungeonHazards(.02);return {base,accelerated,after:h.waveSpeed};},
  pauseAndCleanup(){const {e,h}=fresh();const snapshot=()=>JSON.stringify({inner:h.inner,r:h.r,age:h.age,hazards:game.hazards.length});const before=snapshot();game.menuPaused=true;update(.5);const paused=snapshot();clearOwnerMechanics(e);const owner=game.hazards.length;fresh();resetRun();return {before,paused,owner,reset:game.hazards.length};},
  friendly(){const {e,h}=fresh(1500),other=spawnEnemy();Object.assign(other,{x:120,y:0,hp:1000,maxHp:1000,rad:10,contact:1e9,speed:0});const ownerHp=e.hp;for(let i=0;i<40;i++)tickDungeonHazards(.02);const once=other.hp;for(let i=0;i<40;i++)tickDungeonHazards(.02);return {ownerHp,ownerAfter:e.hp,before:1000,once,after:other.hp,hits:h.enemyHits.size};},
  sweep(from,to){const p=game.player;Object.assign(p,to);return expandingWaveContains(p,{x:0,y:0,inner:132,r:164},{inner:100,r:132},from);}
 };
}
(async()=>{const runtime=await createRuntime(),errors=[],passed=[];try{
 const original=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=original.replace(seam,'('+encounterFixture.toString()+')();('+gravePulseFixture.toString()+')();'+seam),p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__gravePulse&&!document.documentElement.classList.contains('game-loading'));const call=(name,...args)=>p.evaluate(({name,args})=>__gravePulse[name](...args),{name,args});
 const far=await call('trial','far');assert.equal(far.count,1);assert.ok(far.samples.some(s=>s.seconds>3&&s.alive&&s.r>950));assert.ok(far.hitAt>6&&far.after<far.before&&far.monotonic);passed.push('One ring continues beyond the former lifetime and travel distance, reaches a stationary player 2,400 units away, and never stalls');
 const trials=[];for(const mode of ['wait','center','walkIn','run','early','outward','dash'])for(const dt of [.01,.04,.08]){const r=await call('trial',mode,0,dt);assert.equal(r.after<r.before,mode!=='dash',JSON.stringify(r));assert.ok(r.monotonic);if(mode==='dash')assert.ok(r.dashed&&r.crossed&&r.remaining===0);trials.push(r);}for(const stacks of [6,12]){const r=await call('trial','run',stacks);assert.ok(r.walkSpeed>320&&r.speed>r.walkSpeed&&r.after<r.before);trials.push(r);}passed.push('Actual combat punishes waiting, camping the origin, walking inward, running away and mistimed dashes; a timed inward dash crosses unharmed at 10/40/80 ms steps, including stacked movement buffs');
 const schedule=await call('scheduling');assert.equal(schedule.active,false);assert.equal(schedule.warning,false);assert.deepEqual(schedule.cooldown.map(r=>r.allowed),[false,false,true]);assert.equal(schedule.readyBeforeImpact,true);assert.equal(schedule.pending,true);const boost=await call('boosted');assert.ok(boost.accelerated>boost.base);assert.equal(boost.after,boost.accelerated);passed.push('Pulse warnings and live rings cannot overlap across casters; the next warning allows dash recharge before impact, and new movement boosts cannot outrun or slow the wave');
 for(const [from,to,expected]of [[{x:300,y:0},{x:40,y:0},true],[{x:40,y:0},{x:300,y:0},true],[{x:-300,y:50},{x:300,y:50},true],[{x:30,y:0},{x:50,y:0},false],[{x:300,y:200},{x:400,y:200},false]])assert.equal(await call('sweep',from,to),expected);
 const friendly=await call('friendly');assert.equal(friendly.ownerHp,friendly.ownerAfter);assert.ok(friendly.once<friendly.before);assert.equal(friendly.once,friendly.after);assert.equal(friendly.hits,1);const cleanup=await call('pauseAndCleanup');assert.equal(cleanup.before,cleanup.paused);assert.equal(cleanup.owner,1);assert.equal(cleanup.reset,0);passed.push('Swept collision catches complete crossings without harming actors behind the wave; friendly fire hits other monsters once, preserves caster immunity, pauses with combat and outlives its source and clears on retry');
 assert.deepEqual(errors,[]);assert.equal(fs.readFileSync('index.html','utf8'),original);console.log(JSON.stringify({passed,far,schedule,boost,trials,errors},null,2));
 }finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
