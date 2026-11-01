/* Dungeoneering: themed threats, deliberate growth and responsive movement. */
const UPGRADE_CAPS={might:6,haste:6,cleave:4,reach:4,ward:4,vitality:5,crit:5,multishot:4,pierce:4,storm:4,fire:4,frost:4,nova:4,swift:4,magnet:5,regen:4,wisdom:5,forage:5};
const DUNGEON_THEMES=[
 {color:'#a6d97a',hot:'#e6f8b4',dark:'#294528',motif:'leaf',volley:'Thorn Volley',ground:'Entangling Roots',beam:'Heartwood Cleave'},
 {color:'#ed9c4e',hot:'#fff1ae',dark:'#5b2921',motif:'ember',volley:'Cinder Volley',ground:'Magma Eruption',beam:'Furnace Breath'},
 {color:'#bca2ef',hot:'#f0e3ff',dark:'#39294d',motif:'soul',volley:'Soul Barrage',ground:'Grave Awakening',beam:'Reaper’s Gaze'},
 {color:'#79dbe0',hot:'#e0ffff',dark:'#1f414d',motif:'star',volley:'Starfall Volley',ground:'Rift Collapse',beam:'Astral Severance'}
];
let dungeoneeringInstalled=false;
function waveRank(id,source=game.upgrades){return Math.min(UPGRADE_CAPS[id]||0,Math.max(0,Number(source[id])||0));}
function waveDamageFactor(){return 1+.10*waveRank('might');}
function waveHasteFactor(){return 1+.08*waveRank('haste');}
function waveReachFactor(){return 1+.12*waveRank('reach');}
function waveSwiftFactor(){return 1+.12*waveRank('swift');}
function waveCritChance(){return .05+.08*waveRank('crit');}
function waveVitality(){return 18*waveRank('vitality');}
function normalizeDungeoneering(){
  const source=data.seenElites&&typeof data.seenElites==='object'?data.seenElites:{};
  data.seenElites=Object.fromEntries(BIOMES.map((b,i)=>[i,Array.from({length:3},(_,j)=>!!source[i]?.[j]||!!data.discovered?.['boss_'+i+'_'+j])]));
}
function powerSummary(id,rank){
  const r=Math.max(0,Math.min(UPGRADE_CAPS[id],rank));
  if(id==='might')return '+'+(r*10)+'% weapon damage';
  if(id==='haste')return '+'+(r*8)+'% attack speed';
  if(id==='cleave')return '+'+r+' nearby targets per swing';
  if(id==='reach')return '+'+(r*12)+'% melee reach';
  if(id==='ward')return (r*10)+'% less incoming damage';
  if(id==='vitality')return '+'+(r*18)+' maximum HP';
  if(id==='crit')return (5+r*8)+'% critical chance';
  if(id==='multishot')return (1+r)+' projectiles; each extra bolt deals 35% damage';
  if(id==='pierce')return r+' extra pierces; 84% damage retained per pierce';
  if(id==='storm')return (r*13)+'% chain chance; '+(r*35)+'% hit damage to a nearby foe';
  if(id==='fire')return r?(r*10)+'% hit damage / second for '+(2+r*.7).toFixed(1)+'s':'No burn applied';
  if(id==='frost')return r?(14+r*8)+'% slow for '+(1.3+r*.35).toFixed(2)+'s':'No slow applied';
  if(id==='nova')return r?Math.min(8,r*2)+' nearby targets at '+(20+r*5)+'% critical-hit damage':'No critical nova';
  if(id==='swift')return '+'+(r*12)+'% movement speed';
  if(id==='magnet')return '+'+(r*55)+' XP pickup radius';
  if(id==='regen')return (r*.7).toFixed(1)+' HP regenerated / second';
  if(id==='wisdom')return '+'+(r*15)+'% delve XP';
  if(id==='forage')return '+'+(r*10)+'% gold from monsters';
  return '';
}
function powerIncrement(id,rank=0){
  if(!rank&&id==='fire')return 'Apply 10% hit damage per second for 2.7 seconds';
  if(!rank&&id==='frost')return 'Apply a 22% slow for 1.65 seconds';
  if(!rank&&id==='nova')return 'Critical hits splash 25% damage onto two nearby foes';
  return {might:'+10 percentage points of weapon damage',haste:'+8 percentage points of attack speed',cleave:'+1 target per swing',reach:'+12 percentage points of melee reach',ward:'+10 percentage points of damage reduction',vitality:'+18 maximum HP and heal 18',crit:'+8 percentage points of critical chance',multishot:'+1 extra projectile at 35% weapon damage',pierce:'+1 enemy pierced per projectile',storm:'+13 percentage points of chain chance and +35% chain damage',fire:'+10% hit damage per second and +0.7s duration',frost:'+8 percentage points of slowing and +0.35s duration',nova:'+2 targets and +5 percentage points of critical-hit splash',swift:'+12 percentage points of movement speed',magnet:'+55 pickup radius',regen:'+0.7 HP regenerated per second',wisdom:'+15 percentage points of XP earned',forage:'+10 percentage points of monster gold'}[id];
}
function refreshDungeoneeringUI(){
  if(!dungeoneeringInstalled)return;
  const points=masteryFor().points,button=$('hudEssence');$('quickEssence').textContent=formatCompact(points);
  button.title=format(points)+' unspent Dungeoneering Mastery points · '+biome().name;
  button.setAttribute('aria-label',format(points)+' Dungeoneering Mastery points; open mastery for '+biome().name);
  const img=button.querySelector('img'),uri=iconAsset('mastery-points');if(img.getAttribute('src')!==uri)img.src=uri;
  const boss=game.boss,theme=DUNGEON_THEMES[biomeIndex()],hint=$('bossMechanicHint');
  if(hint){hint.textContent=boss?(boss.cast?boss.cast.label+' · move out of the marked area':(boss.bossIndex===2?(zoneStage()===3?'ZONE OVERLORD · 3 mechanics':'FLOOR OVERLORD · 2 mechanics'):'GUARDIAN')):'';hint.style.color=theme.hot;}
  $('speedControl').classList.toggle('hidden',game.scene!=='combat'||!data.devSpeedUnlocked&&!masteryUnlocked());
  document.querySelectorAll('.mastery-bank-primary img,.rank-price img').forEach(i=>{if(i.getAttribute('src')!==uri)i.src=uri;});
}
function movementDashAllowed(){return game.scene==='combat'&&game.status==='running'&&!game.menuPaused&&!game.manualPaused&&!game.customizing&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0;}
function noteMovementTap(x,y,source,time=performance.now()){
  if(!movementDashAllowed()){game.movementTap=null;return false;}
  const length=Math.hypot(x,y);if(length<.18)return false;x/=length;y/=length;
  const previous=game.movementTap;game.movementTap={x,y,source,time};
  if(previous&&previous.source===source&&time-previous.time>=25&&time-previous.time<=285&&x*previous.x+y*previous.y>.7&&game.player.dashCooldown<=0){
    game.player.vx=x;game.player.vy=y;dash();game.movementTap=null;return true;
  }
  return false;
}
function installDungeoneeringUI(){
  dungeoneeringInstalled=true;
  $('bossHud').insertAdjacentHTML('beforeend','<small id="bossMechanicHint"></small>');
  $('dashButton').setAttribute('aria-label','Dash: Space, this button, or double tap a movement direction');$('dashButton').title='Double tap a movement direction or press Space to dash';
  document.addEventListener('keydown',e=>{
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    const directions={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
    if(directions[e.code])noteMovementTap(...directions[e.code],'keyboard');
  },true);
  $('joystickZone').addEventListener('pointerdown',e=>{
    const r=$('joystickZone').getBoundingClientRect();noteMovementTap((e.clientX-r.left-r.width/2)/(r.width*.34),(e.clientY-r.top-r.height/2)/(r.height*.34),'joystick');
  },true);
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'){const r=canvas.getBoundingClientRect();noteMovementTap(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,'mouse');}
  },true);
  window.addEventListener('blur',()=>{game.movementTap=null;});refreshDungeoneeringUI();
}
function bossPlan(e){
  if(e.bossIndex===2)return e.boss&&zoneStage()===3?['volley','ground','beam']:['volley','ground'];
  return [e.bossIndex===1?'ground':'volley'];
}
function beginBossCast(e){
  const plan=bossPlan(e),type=plan[(e.mechanicIndex||0)%plan.length],theme=DUNGEON_THEMES[e.biome??biomeIndex()];
  e.mechanicIndex=(e.mechanicIndex||0)+1;
  const duration=type==='volley'?1.15:type==='ground'?1.5:1.7,origin={x:e.x,y:e.y};
  const cast={type,label:theme[type],windup:duration,total:duration,origin,angle:Math.atan2(game.player.y-e.y,game.player.x-e.x),targets:[]};
  if(type==='ground'){
    const count=e.elite?1:e.bossIndex===2?(zoneStage()===3?4:2):2;
    cast.targets.push({x:game.player.x,y:game.player.y,r:e.boss&&zoneStage()===3?54:44});
    for(let i=1;i<count;i++){const a=i*Math.PI*2/count+(e.mechanicIndex||0)*.75;cast.targets.push({x:game.player.x+Math.cos(a)*105,y:game.player.y+Math.sin(a)*105,r:44});}
  }
  e.cast=cast;e.mechanicsUsed=e.mechanicsUsed||[];if(!e.mechanicsUsed.includes(type))e.mechanicsUsed.push(type);
}
function bossAttackDamage(e){return e.elite?14+zoneNumber()*2:e.bossIndex===2?(zoneStage()===3?36+data.floor*1.4:27+data.floor*1.2):19+data.floor;}
function resolveBossCast(e,cast){
  const theme=e.biome??biomeIndex(),damage=bossAttackDamage(e);
  if(cast.type==='volley'){
    const count=e.bossIndex===2?(e.boss&&zoneStage()===3?18:14):10,offset=(e.mechanicIndex||0)*.39;
    for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset,speed=e.elite?145:e.bossIndex===2?182:158;game.hostileShots.push({x:cast.origin.x,y:cast.origin.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,rad:e.bossIndex===2?8:6,life:5,biome:theme,damage});}
  }else if(cast.type==='ground'){
    for(const target of cast.targets)(game.hazards||(game.hazards=[])).push({...target,type:'ground',biome:theme,life:1.6,total:1.6,damage,age:0});
  }else (game.hazards||(game.hazards=[])).push({type:'beam',x:cast.origin.x,y:cast.origin.y,angle:cast.angle,width:48,length:540,life:.55,total:.55,biome:theme,damage:damage*1.3,age:0});
}
function tickBossSpecial(e,dt){
  if(e.cast){e.cast.windup-=dt;if(e.cast.windup<=0){resolveBossCast(e,e.cast);e.cast=null;e.castCooldown=e.bossIndex===2&&e.hp<e.maxHp*.4?2.1:3.1;}return;}
  e.castCooldown=(e.castCooldown??2)-dt;if(e.castCooldown<=0)beginBossCast(e);
}
function segmentDistance(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/Math.max(.001,dx*dx+dy*dy),0,1);return Math.hypot(px-ax-dx*t,py-ay-dy*t);
}
function tickDungeonHazards(dt){
  const p=game.player;game.hazards=(game.hazards||[]).filter(h=>{
    h.life-=dt;h.age+=dt;if(h.life<=0)return false;
    const hit=h.type==='ground'?Math.hypot(p.x-h.x,p.y-h.y)<h.r+10:segmentDistance(p.x,p.y,h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length)<h.width/2+10;
    if(hit)hurt(h.damage);return true;
  });
}
function paintWarningCircle(x,y,r,progress,theme,active=false){
  ctx.save();ctx.fillStyle=theme.color+(active?'37':'18');ctx.strokeStyle=theme.color;ctx.lineWidth=active?3:2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle=theme.hot;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+5,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line(x+Math.cos(a)*(r-7),y+Math.sin(a)*(r-7),x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2),1.5,theme.hot);}
  ctx.restore();
}
function paintThreatTelegraphs(){
  for(const e of game.enemies){const cast=e.cast;if(!cast)continue;const theme=DUNGEON_THEMES[e.biome??biomeIndex()],progress=clamp(1-cast.windup/cast.total,0,1);
    if(cast.type==='ground')for(const t of cast.targets)paintWarningCircle(t.x,t.y,t.r,progress,theme);
    else if(cast.type==='beam'){
      const {x,y}=cast.origin,dx=Math.cos(cast.angle),dy=Math.sin(cast.angle),half=29;
      ctx.save();ctx.fillStyle=theme.color+'20';ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-dy*half,y+dx*half);ctx.lineTo(x+dx*540-dy*half,y+dy*540+dx*half);ctx.lineTo(x+dx*540+dy*half,y+dy*540-dx*half);ctx.lineTo(x+dy*half,y-dx*half);ctx.closePath();ctx.fill();ctx.stroke();line(x,y,x+dx*540*progress,y+dy*540*progress,2.5,theme.hot);ctx.restore();
    }else{paintWarningCircle(cast.origin.x,cast.origin.y,e.rad+27,progress,theme);const count=e.bossIndex===2?(e.boss&&zoneStage()===3?18:14):10,offset=(e.mechanicIndex||0)*.39;for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset;line(cast.origin.x+Math.cos(a)*40,cast.origin.y+Math.sin(a)*40,cast.origin.x+Math.cos(a)*135,cast.origin.y+Math.sin(a)*135,1.2,theme.color+'88');}}
    ctx.save();ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#11120c';ctx.strokeText(cast.label,e.x,e.y-e.rad-15);ctx.fillStyle=theme.hot;ctx.fillText(cast.label,e.x,e.y-e.rad-15);ctx.restore();
  }
  for(const h of game.hazards||[]){const theme=DUNGEON_THEMES[h.biome];
    if(h.type==='ground'){paintWarningCircle(h.x,h.y,h.r,h.life/h.total,theme,true);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(h.x+Math.cos(a)*h.r*.35,h.y+Math.sin(a)*h.r*.35,h.x+Math.cos(a)*h.r*.75,h.y+Math.sin(a)*h.r*.75,3,theme.color+'c9');}}
    else {line(h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length,h.width,theme.color+'60');line(h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length,8,theme.hot);}
  }
}
function paintDungeonProjectile(s){
  const theme=DUNGEON_THEMES[s.biome??biomeIndex()],a=Math.atan2(s.vy,s.vx);glow(s.x,s.y,22,theme.color+'55');ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);
  if(theme.motif==='leaf'){poly([12,0,-5,-7,-11,0,-5,7],theme.color,theme.dark,1);line(-7,0,8,0,1.4,theme.hot);}
  else if(theme.motif==='ember'){poly([11,0,-9,-8,-5,0,-11,7],theme.color,theme.dark,1);disc(2,0,3,theme.hot);}
  else if(theme.motif==='star'){poly([12,0,3,3,0,11,-3,3,-12,0,-3,-3,0,-11,3,-3],theme.color,theme.hot,1);}
  else {disc(0,0,s.rad+2,theme.dark);disc(0,0,s.rad,theme.color);disc(2,-1,s.rad*.4,theme.hot);line(-5,-3,-13,-6,1.5,theme.color);line(-5,3,-13,6,1.5,theme.color);}
  ctx.restore();
}
function drawBoss(e,b){
  const height=e.elite?(e.bossIndex===2?118:94):e.bossIndex===2?185:e.bossIndex===1?140:124;
  if(!paintCreature(e,e.bossIndex+1,height))drawFallbackBoss(e,b);
  if(e.elite){const y=e.y-height+6;quad(e.x-22,y,44,4,'#151c17');quad(e.x-22,y,44*clamp(e.hp/e.maxHp,0,1),4,DUNGEON_THEMES[e.biome??biomeIndex()].color);textAt('ELITE',e.x,y-5,'600 8px system-ui','#e4d2a5');}
}
function flushBurnDamage(e){
  if((e.burnVisualDamage||0)<=0)return;
  const amount=e.burnVisualDamage;e.burnVisualDamage=0;e.burnVisualTimer=0;
  if(game.floaters.length<110)floater(e.x,e.y-29,Number(amount.toFixed(1))+' Burn','#ffc273');
}
function tickBurn(e,dt){
  if(!(e.burn>0))return false;
  const elapsed=Math.min(dt,e.burn),damage=(e.burnDps||attackDamage()*.1*waveRank('fire'))*elapsed;
  e.burn-=elapsed;e.hp-=damage;e.burnVisualDamage=(e.burnVisualDamage||0)+damage;e.burnVisualTimer=(e.burnVisualTimer||0)+elapsed;
  if(e.burnVisualTimer>=.6||e.burn<=0||e.hp<=0)flushBurnDamage(e);
  if(e.hp<=0){e.lastDamageStyle=e.burnStyle||e.lastDamageStyle;onKill(e);return true;}return false;
}
function paintBurningEnemy(e){
  if(!(e.burn>0))return;
  glow(e.x,e.y,Math.max(20,e.rad*1.5),'#e3973e35');
  for(let i=0;i<3;i++){const a=i*2.1,offset=reducedMotion()?0:Math.sin(game.frame*8+i)*3,x=e.x+Math.cos(a)*e.rad*.7,y=e.y-8+offset;poly([x-4,y+6,x-5,y-2,x,y-14,x+2,y-5,x+5,y-9,x+4,y+6],'#e98b46aa');line(x,y+3,x,y-5,1.6,'#ffe0a4');}
}
function spawnEnemy(boss=false,bossIndex=0){
  const e=spawnBaseEnemy(boss,bossIndex);e.biome=biomeIndex();e.mechanicIndex=0;e.mechanicsUsed=[];e.castCooldown=boss?1.8:0;
  if(!boss&&game.phase%2===0&&game.phaseSpawned>=(game.eliteAt??Infinity)&&!game.waveEliteSpawned){
    const known=(data.seenElites[biomeIndex()]||[]).map((seen,i)=>seen?i:-1).filter(i=>i>=0);
    if(known.length){e.elite=true;e.bossIndex=known[Math.floor(Math.random()*known.length)];e.name=biome().boss[e.bossIndex]+' Echo';e.rad=23;e.hp=e.maxHp=zoneEnemyHp(false,0)*2.8;e.speed*=.82;e.castCooldown=.7;game.waveEliteSpawned=true;}
  }
  return e;
}
function drawMob(e,b){
  if(e.elite){drawBoss(e,b);return;}
  if(!paintCreature(e,0,Math.max(46,e.rad*3.8))){drawFallbackMob(e,b);return;}
  if(e.hp<e.maxHp){const y=e.y-e.rad*3;quad(e.x-15,y,30,4,'#102934');quad(e.x-15,y,30*clamp(e.hp/e.maxHp,0,1),4,'#d8c594');}
}
function tickCombat(dt){const p=game.player;game.frame+=dt;game.phaseTime+=dt;game.runSeconds+=dt;p.invuln=Math.max(0,p.invuln-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);
 p.attackPose=Math.max(0,p.attackPose-dt);p.hitPose=Math.max(0,p.hitPose-dt);let dx=(game.keys.KeyD||game.keys.ArrowRight?1:0)-(game.keys.KeyA||game.keys.ArrowLeft?1:0),dy=(game.keys.KeyS||game.keys.ArrowDown?1:0)-(game.keys.KeyW||game.keys.ArrowUp?1:0);
 if(game.joystick.pointer!==null){dx=game.joystick.x;dy=game.joystick.y;}else if(game.mouseMove.active){dx=game.mouseMove.x;dy=game.mouseMove.y}
 const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;p.vx=dx;p.vy=dy;if(Math.abs(dx)>.15)p.facing=dx<0?-1:1;const spd=175*(1+trinketBonus('speed'))*(1+styleStats().movePercent/100)*waveSwiftFactor();if(p.dashTime>0){p.x+=p.dashDX*650*dt;p.y+=p.dashDY*650*dt;p.dashTime-=dt;burst(p.x,p.y,1,'#a4e2b2')}else{p.x+=dx*spd*dt;p.y+=dy*spd*dt}
 resolveWorldCollisions(p);updateCombatAim();
 if(game.upgrades.regen)p.hp=Math.min(p.maxHp,p.hp+(waveRank('regen')*.7)*dt);
 game.attackTimer-=dt;if(game.attackTimer<=0&&attack()){game.attackTimer=attackCooldown()}
 if(game.phase%2===0&&game.phase<6){
  game.spawnTimer-=dt;
  const cap=activeMobCap(),interval=spawnInterval();
  // Debt-based clock: at 60x multiple mobs can spawn in a single frame.
  // Every mob is still created and must be defeated for the encounter to clear.
  let spawned=0;
  while(game.spawnTimer<=0&&game.phaseSpawned<game.phaseTarget&&game.enemies.length<cap&&spawned<12){
   spawnEnemy();game.phaseSpawned++;game.spawnTimer+=interval;spawned++;
  }
  if(game.enemies.length>=cap)game.spawnTimer=Math.max(game.spawnTimer,-.5);
  if(game.phaseSpawned>=game.phaseTarget)game.spawnTimer=999;
 }
 for(const e of [...game.enemies]){
   if(!game.enemies.includes(e))continue;
   if(tickBurn(e,dt))continue;
   e.frozen=Math.max(0,(e.frozen||0)-dt);
   e.wobble+=dt*3;e.contact-=dt;
   const vx=p.x-e.x,vy=p.y-e.y,dist=Math.hypot(vx,vy)||1;
   if(e.boss||e.elite)tickBossSpecial(e,dt);
   const walk=e.cast?0:1;e.x+=vx/dist*e.speed*dt*walk*(e.frozen>0?1-(.14+(e.frostRank||1)*.08):1);e.y+=vy/dist*e.speed*dt*walk*(e.frozen>0?1-(.14+(e.frostRank||1)*.08):1);
   if(dist<e.rad+17&&e.contact<=0){hurt(e.boss?24+data.floor*2:e.elite?17+data.floor*1.5:10+data.floor*1.5);e.contact=e.boss?.7:.60}
 }
 tickDungeonHazards(dt);
 for(let i=game.shots.length-1;i>=0;i--){
  const s=game.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  if(Math.random()<.32&&game.particles.length<180)game.particles.push({x:s.x,y:s.y,vx:-s.vx*.06+rand(-22,22),vy:-s.vy*.06+rand(-22,22),life:.18,max:.18,color:s.magic?'#9ae9ff':'#f9d5a0',rad:rand(1,2.5)});
  let remove=s.life<=0;
  if(!remove)for(const e of [...game.enemies]){
   if(!s.hits.has(e)&&Math.hypot(s.x-e.x,s.y-e.y)<e.rad+6){s.hits.add(e);dealDamage(e,s.damage,s.x,s.y,s.combatStyle);
    if(s.pierce>0){s.pierce--;s.damage*=.84}else{remove=true;break}
   }
  }
  if(remove)game.shots.splice(i,1);
 }
 for(let i=game.swings.length-1;i>=0;i--){game.swings[i].life-=dt;if(game.swings[i].life<=0)game.swings.splice(i,1)}
 for(let i=game.hostileShots.length-1;i>=0;i--){const s=game.hostileShots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<s.rad+12){hurt(s.damage||11+data.floor);game.hostileShots.splice(i,1)}else if(s.life<0)game.hostileShots.splice(i,1)}
 for(let i=game.gems.length-1;i>=0;i--){const g=game.gems[i],d=Math.hypot(g.x-p.x,g.y-p.y),magnet=68+(game.upgrades.magnet||0)*55+trinketBonus('pickup');if(d<magnet*2){const speed=d<magnet?500:165;g.x+=(p.x-g.x)/Math.max(1,d)*speed*dt;g.y+=(p.y-g.y)/Math.max(1,d)*speed*dt}if(d<20){game.gems.splice(i,1);gainXp(g.value);if(game.status==='upgrade')break}}
 if(game.transition>0){game.transition-=dt;if(game.transition<=0&&game.status==='running')nextPhase()}
 game.camX+=(p.x-game.camX)*Math.min(1,dt*6);game.camY+=(p.y-game.camY)*Math.min(1,dt*6);
 game.shake=Math.max(0,game.shake-dt*19);
}

function drawCombat(w,h){const b=biome();drawTiles(b,w,h);ctx.save();const jitter=game.shake>0&&!reducedMotion()?rand(-game.shake,game.shake):0;ctx.translate(w/2-game.camX+jitter,h/2-game.camY+jitter);
 const kind=Math.floor((data.floor-1)/3)%4;
 const worldObjects=worldScenery(kind,game.camX,game.camY,w,h);
 const entries=game.enemies.map(e=>({y:e.y+e.rad*.65,enemy:e}));
 entries.push({y:game.player.y+15,player:true});
 for(const o of worldObjects)entries.push({y:o.y,scenery:o});
 entries.sort((a,b)=>a.y-b.y);
 for(const item of entries){if(item.player)drawPlayer(game.player);else if(item.scenery)scenerySprite(item.scenery,kind);else if(item.enemy.boss||item.enemy.elite)drawBoss(item.enemy,b);else drawMob(item.enemy,b)}
 paintThreatTelegraphs();for(const enemy of game.enemies)paintBurningEnemy(enemy);
 for(const sw of game.swings){
  ctx.save();const fade=sw.life/sw.max;ctx.translate(sw.x,sw.y);ctx.rotate(sw.angle);
  ctx.globalAlpha=fade*.85;ctx.strokeStyle=sw.style==='greatsword'?'#ffaf63':sw.style==='polearm'?'#d7f9ed':'#ffe3a5';
  ctx.lineWidth=sw.style==='greatsword'?12:6;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=17;
  ctx.beginPath();ctx.arc(0,0,sw.reach,-sw.cone*.78,sw.cone*.78);ctx.stroke();
  ctx.strokeStyle='#fff6df';ctx.lineWidth=1.8;ctx.stroke();ctx.restore();
 }
 for(const gem of game.gems){glow(gem.x,gem.y,14,'#8bbce14a');poly([gem.x,gem.y-9,gem.x+6,gem.y-1,gem.x+4,gem.y+9,gem.x-5,gem.y+7,gem.x-7,gem.y-1],'#80d2dd','#33586a',1);poly([gem.x,gem.y-9,gem.x+6,gem.y-1,gem.x,gem.y+1],'#defff2')}
 for(const s of game.shots){
  const a=Math.atan2(s.vy,s.vx);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);
  if(s.magic){
   glow(0,0,27,'#77dafa9b');ctx.shadowColor='#6aeaff';ctx.shadowBlur=13;
   disc(0,0,8,'#62ccef');disc(-2,-2,4,'#e8ffff');
   for(let z=0;z<3;z++){const theta=game.frame*8+z*2.09;disc(Math.cos(theta)*11,Math.sin(theta)*11,2,'#a8edff')}
  }else{
   line(-15,0,13,0,3,'#c69c61');poly([22,0,10,-5,10,5],'#dde6db','#4a625f',1);
   poly([-15,0,-20,-6,-17,-1,-20,6],'#efcf91');
  }
  ctx.restore();
 }
 for(const arc of game.arcs){
 const x0=arc.x,y0=arc.y,x1=arc.tx,y1=arc.ty,n=7;ctx.save();ctx.shadowColor='#8dceff';ctx.shadowBlur=18;
 for(let layer=0;layer<2;layer++){ctx.beginPath();ctx.moveTo(x0,y0);for(let j=1;j<n;j++){const u=j/n;const nx=x0+(x1-x0)*u+Math.sin(j*13+game.frame*53)*8,ny=y0+(y1-y0)*u+Math.cos(j*19+game.frame*42)*8;ctx.lineTo(nx,ny)}ctx.lineTo(x1,y1);ctx.strokeStyle=layer?'#f0ffff':'#64b5f2';ctx.lineWidth=layer?1.7:6;ctx.stroke()}ctx.restore();
 }
 for(const shot of game.hostileShots)paintDungeonProjectile(shot);
 for(const o of game.particles){ctx.globalAlpha=clamp(o.life/o.max,0,1);disc(o.x,o.y,o.rad,o.color)}ctx.globalAlpha=1;
 // Ambient spores / cinders / soul motes drift through all biomes.
 ctx.save();const motecolor=['#d4f5a7','#ffae75','#d4c9ff','#b2f8ff'][kind];
 for(let i=0;i<(reducedMotion()?0:15);i++){const ox=rng(i,31,kind)*w,oy=rng(i,56,kind)*h,px=(ox+Math.sin(game.frame*.6+i)*19),py=((oy-game.frame*(8+i%5*3))%h+h)%h;
   ctx.globalAlpha=.22+Math.sin(game.frame+i)*.16;disc(px+game.camX-w/2,py+game.camY-h/2,1+i%3*.5,motecolor)}ctx.restore();
 for(const o of game.floaters){ctx.globalAlpha=clamp(o.life/.8,0,1);ctx.shadowColor='#060b15';ctx.shadowBlur=5;textAt(o.text,o.x,o.y,'bold 17px Georgia',o.color);ctx.shadowBlur=0}ctx.globalAlpha=1;ctx.restore();}

function onKill(e){flushBurnDamage(e);const i=game.enemies.indexOf(e);if(i>=0)game.enemies.splice(i,1);earnStyleXp(e.boss?10:e.elite?4:1,e.lastDamageStyle||combatStyle());game.runKills++;game.phaseKills++;const b=biome();burst(e.x,e.y,e.boss?18:(game.enemies.length>65?2:8),b.accent);game.shake=e.boss?7:1.5;if(e.boss){const bidx=e.bossIndex;const m=masteryFor();const reward=bidx===2?2:1;m.points+=reward;m.earned+=reward;grantDelveGold(delveGoldReward('guardian',data.floor,bidx)*(1+trinketBonus('gold'))*(1+.10*waveRank('forage')));data.essence+=bidx===2?2:1;for(let i=0;i<7;i++)game.gems.push({x:e.x+rand(-35,35),y:e.y+rand(-35,35),value:14*(1+.15*waveRank('wisdom'))*(1+trinketBonus('xp'))});toast(e.name+' defeated',`+${bidx===2?2:1} essence · +${reward} mastery`);save();game.boss=null;if(game.status==='running'){finishPhase();if(!data.masteryIntroSeen)showMasteryIntroduction()}else game.transition=.85;}
  else{
 const m=masteryFor(),chance=Math.min(.30,.015+m.fortune*.018);
 if(Math.random()<chance+trinketBonus('find')){const id=biomeIndex();data.biomeLoot[id]=(data.biomeLoot[id]||0)+1;codexDiscover('loot_'+id);if(game.enemies.length<40)floater(e.x,e.y-26,'◆ '+biomeLootName(),'#d5f4ab');}
 grantDelveGold(delveGoldReward(e.elite?'elite':'mob')*(1+waveRank('forage')*.10)*(1+trinketBonus('gold')));
 const value=(e.elite?2:1)*(8+Math.floor(data.floor/3))*(1+waveRank('wisdom')*.15)*(1+trinketBonus('xp'));
 if(game.gems.length>240)gainXp(value);else game.gems.push({x:e.x+rand(-7,7),y:e.y+rand(-7,7),value});
 if(game.phaseKills>=game.phaseTarget){finishPhase()}
}
}

function dealDamage(enemy,base,fromX,fromY,sourceStyle=combatStyle()){
 if(!game.enemies.includes(enemy))return;
 const damage=base*(Math.random()<waveCritChance()?2:1);
 enemy.lastHitAt=game.frame;enemy.lastDamageStyle=sourceStyle;enemy.hp-=damage;if(trinketBonus('leech')>0)game.player.hp=Math.min(game.player.maxHp,game.player.hp+damage*trinketBonus('leech'));
 if(game.floaters.length<75)floater(enemy.x,enemy.y-15,Math.round(damage),damage>attackDamage()*1.8?'#ffe68e':'#e8f5de');
 if(game.enemies.length<110)burst(enemy.x,enemy.y,3,'#ffdfad');
 if(enemy.hp>0){
  if(waveRank('fire')){enemy.burn=2+waveRank('fire')*.7;enemy.burnDps=damage*.10*waveRank('fire');enemy.burnStyle=sourceStyle;}
  if(waveRank('frost')){enemy.frozen=Math.max(enemy.frozen||0,1.3+waveRank('frost')*.35);enemy.frostRank=waveRank('frost');}
  if(game.upgrades.storm&&Math.random()<Math.min(.65,game.upgrades.storm*.13)){
   const t=game.enemies.find(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<145);
   if(t){game.arcs.push({x:enemy.x,y:enemy.y,tx:t.x,ty:t.y,life:.23});t.lastDamageStyle=sourceStyle;t.hp-=damage*.35*game.upgrades.storm;if(t.hp<=0)onKill(t)}
  }
  if(game.upgrades.nova&&damage>attackDamage()*1.8){
   for(const t of game.enemies.filter(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<65).slice(0,Math.min(8,waveRank('nova')*2))){t.hp-=damage*(.20+.05*waveRank('nova'));if(t.hp<=0)onKill(t)}
   burst(enemy.x,enemy.y,11,'#ffbd69');
  }
 }
 if(enemy.hp<=0&&game.enemies.includes(enemy))onKill(enemy);
 if(data.enchant>0&&Math.random()<Math.min(.6,.14*data.enchant)){
  const others=game.enemies.filter(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<200);
  if(others.length){others.sort((a,b)=>Math.hypot(a.x-enemy.x,a.y-enemy.y)-Math.hypot(b.x-enemy.x,b.y-enemy.y));
   const t=others[0];t.hp-=damage*.5;game.arcs.push({x:enemy.x,y:enemy.y,tx:t.x,ty:t.y,life:.2});
   floater(t.x,t.y-15,Math.round(damage*.5),'#aeedff');if(t.hp<=0)onKill(t);
  }
 }
 if(data.weaponType==='staff'&&game.enemies.length){
  const nearby=game.enemies.filter(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<70).slice(0,2);
  for(const t of nearby){t.hp-=damage*.25;game.arcs.push({x:enemy.x,y:enemy.y,tx:t.x,ty:t.y,life:.14});if(t.hp<=0)onKill(t)}
 }
}

function update(dt){const simDt=dt*(game.devSpeed||1);game.activeClockMs+=dt*1000;game.mineAction=Math.max(0,game.mineAction-dt);game.forgeAction=Math.max(0,game.forgeAction-dt);game.workAction=Math.max(0,game.workAction-dt);if(game.holdSkill){game.holdAccum=(game.holdAccum||0)+dt;while(game.holdAccum>=.1){game.holdAccum-=.1;if(!$('app').classList.contains('drawer-open')&&$('overlay').classList.contains('hidden')&&$('resourcePicker').classList.contains('hidden'))activeSkill(game.holdSkill);}}game.frame+=game.status==='running'?0:dt;const realNow=Date.now(),jobsDelta=Math.min(8*3600,(realNow-game.lastJobsAt)/1000);game.lastJobsAt=realNow;if(jobsDelta>0&&jobsDelta<=8*3600)advanceProduction(jobsDelta);if(!game.customizing&&!game.menuPaused&&$('overlay').classList.contains('hidden')&&game.scene==='combat'&&game.status==='running'){let left=simDt,steps=0;while(left>0&&steps<175&&game.status==='running'&&!game.menuPaused&&$('overlay').classList.contains('hidden')){const step=Math.min(.09,left);tickCombat(step);animateEffects(step);left-=step;steps++;}}else animateEffects(dt);game.saveTimer+=dt;game.uiTimer+=dt;if(game.uiTimer>.14){refreshUI();game.uiTimer=0}if(game.saveTimer>=4){save();game.saveTimer=0}tickSkillBonuses(dt);}

function selectUpgrade(index){
 const u=game.levelChoices[index];if(!u||game.status!=='upgrade')return;
 const before=game.upgrades[u.id]||0;if(before>=UPGRADE_CAPS[u.id]){showUpgrade();return;}
 game.upgrades[u.id]=before+1;codexDiscover('upgrade_'+u.id);
 const p=game.player;if(u.id==='vitality'){p.maxHp=maxHp()+waveVitality();p.hp=Math.min(p.maxHp,p.hp+18);}
 if(u.id==='fire'&&before)for(const enemy of game.enemies)if(enemy.burn>0){enemy.burnDps=(enemy.burnDps||attackDamage()*.1*before)*(before+1)/before;enemy.burn+=.7;}
 if(u.id==='frost')for(const enemy of game.enemies)if(enemy.frozen>0){enemy.frostRank=before+1;enemy.frozen+=.35;}
 game.pendingLevels--;syncZone();save();if(game.pendingLevels>0){showUpgrade();return;}game.status='running';hideOverlay();refreshUI();
}

function gainXp(v){if(game.status==='dead'||game.status==='clear')return;game.runXp+=v;while(game.runXp>=game.requiredXp){game.runXp-=game.requiredXp;game.runLevel++;game.requiredXp=Math.round(20+12*game.runLevel+3*game.runLevel**2);game.pendingLevels++;}syncZone();if(game.pendingLevels>0&&game.status==='running'){game.status='upgrade';showUpgrade()}}

function spawnBaseEnemy(boss=false,bossIndex=0){const a=rand(0,Math.PI*2),r=rand(205,320),d=zoneEnemyHp(false,0,rand(.9,1.1))/Math.max(1,30+game.phase*4);const e={x:game.player.x+Math.cos(a)*r,y:game.player.y+Math.sin(a)*r,rad:boss?(bossIndex===2?36:29):rand(12,17),hp:boss?100:((30+game.phase*4)*d),maxHp:boss?100:((30+game.phase*4)*d),speed:(boss?(bossIndex===2?77:86):rand(77,108)*(1+Math.min(1,data.floor*.05)))*((data.floor-1)%3===1?1.12:1),boss,bossIndex,contact:0,attack:boss?2.5:0,telegraph:0,wobble:rand(0,7),name:''};game.enemies.push(e);return e;}
