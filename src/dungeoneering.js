/* Dungeoneering: themed threats, deliberate growth and responsive movement. */
const DUNGEON_THEMES=[
 {color:'#a6d97a',hot:'#e6f8b4',dark:'#294528',motif:'leaf',volley:'Thorn Volley',ground:'Entangling Roots',beam:'Heartwood Cleave',reflect:'Briar Mirror',mend:'Springheart',fury:'Briar Effigy'},
 {color:'#ed9c4e',hot:'#fff1ae',dark:'#5b2921',motif:'ember',volley:'Cinder Volley',ground:'Magma Eruption',beam:'Furnace Breath',reflect:'Caldera Mirror',mend:'Rekindling Vessel',fury:'Furnace Standard'},
 {color:'#bca2ef',hot:'#f0e3ff',dark:'#39294d',motif:'soul',volley:'Soul Barrage',ground:'Grave Awakening',beam:'Reaper’s Gaze',reflect:'Soul Mirror',mend:'Soul Font',fury:'Grave Idol'},
 {color:'#79dbe0',hot:'#e0ffff',dark:'#1f414d',motif:'star',volley:'Starfall Volley',ground:'Rift Collapse',beam:'Astral Severance',reflect:'Prismatic Return',mend:'Starwell',fury:'Prism Beacon'}
];
let dungeoneeringInstalled=false;

function normalizeDungeoneering(){
  const source=data.seenElites&&typeof data.seenElites==='object'?data.seenElites:{};
  data.seenElites=Object.fromEntries(BIOMES.map((b,i)=>[i,Array.from({length:3},(_,j)=>!!source[i]?.[j]||!!data.discovered?.['boss_'+i+'_'+j])]));
}

function movementDashAllowed(){return game.scene==='combat'&&game.status==='running'&&!game.menuPaused&&!game.manualPaused&&!game.customizing&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0;}
function noteMovementTap(x,y,source,time=performance.now()){
  if(!movementDashAllowed()){game.movementTap=null;return false;}
  const length=Math.hypot(x,y);if(length<.18)return false;x/=length;y/=length;
  const previous=game.movementTap,same=previous&&previous.source===source&&time-previous.time>=25&&time-previous.time<=285&&x*previous.x+y*previous.y>.7;
  const count=same?(previous.count||1)+1:1;game.movementTap={x:same?previous.x:x,y:same?previous.y:y,source,time,count};
  if(count>=(source==='arena-touch'?2:3)){
    game.movementTap=null;if(game.player.dashCooldown>0)return false;
    game.player.vx=x;game.player.vy=y;dash();return true;
  }
  return false;
}
function installDungeoneeringUI(){
  dungeoneeringInstalled=true;installThemedEncounters();
  $('bossHud').insertAdjacentHTML('beforeend','<small id="bossMechanicHint"></small>');
  $('dashButton').setAttribute('aria-label','Dash: double tap while moving on touch, Space, or this button');$('dashButton').title='Double tap while moving on touch · Space to dash';
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

function segmentDistance(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/Math.max(.001,dx*dx+dy*dy),0,1);return Math.hypot(px-ax-dx*t,py-ay-dy*t);
}
function tickDungeonHazards(dt,playerFrom=game.player){
 const p=game.player;game.hazards=(game.hazards||[]).filter(h=>{
  if(game.status!=='running'||h.owner&&!game.enemies.includes(h.owner))return false;
  let step=dt,from=playerFrom;if(h.delay>0){const wait=Math.min(dt,h.delay);h.delay-=wait;step-=wait;if(step<=1e-9)return true;const u=wait/dt;from={x:playerFrom.x+(p.x-playerFrom.x)*u,y:playerFrom.y+(p.y-playerFrom.y)*u};}const previous=h.wave?{inner:h.inner,r:h.r}:null,pulse=h.abilityType==='gravePulse';h.age+=step;
  if(pulse)h.waveSpeed=Math.max(h.waveSpeed,playerMoveSpeed()*GRAVE_PULSE.runningFactor);else h.life-=step;
  if(h.wave){h.inner+=h.waveSpeed*step;h.r+=h.waveSpeed*step;}if(h.life<=0)return false;
  const contains=actor=>h.wave?expandingWaveContains(actor,h,previous,actor===p?from:actor):h.type==='expanded'?expandedContains(actor,h):h.type==='ground'?Math.hypot(actor.x-h.x,actor.y-h.y)<h.r+(actor.rad||10):segmentDistance(actor.x,actor.y,h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length)<h.width/2+(actor.rad||10);
  if(pulse)pulseDashCounter(h,previous,from,contains(p));
  if(h.lingering)tickCombatDot(h,'fire',contains);else if(contains(p)&&!((h.type==='expanded'||h.singleHit)&&h.playerHit)){hurt(h.damage);if(h.type==='expanded'||h.singleHit)h.playerHit=true;}if(h.language==='friendly'||['ground','beam'].includes(h.type))damageMonstersInAttack(h.owner,h,contains);return game.status==='running'&&game.transition<=0&&(!pulse||!gravePulseFinished(h));
 });
}
function paintWarningCircle(x,y,r,progress,theme,active=false){
  ctx.save();ctx.fillStyle=theme.color+(active?'16':'18');ctx.strokeStyle=theme.color;ctx.lineWidth=active?3:2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle=theme.hot;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+5,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line(x+Math.cos(a)*(r-7),y+Math.sin(a)*(r-7),x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2),1.5,theme.hot);}
  ctx.restore();
}
function paintThreatTelegraphs(){
 paintCombatBanks();
 for(const e of game.enemies){const cast=e.cast;if(!cast)continue;const theme=combatTheme(castLanguage(cast.type)),progress=clamp(1-cast.windup/cast.total,0,1);
  if(paintUncommonWarning(e,cast,progress)){}
  else if(paintExpandedWarning(e,cast,progress)){}
  else if(paintEliteSpecialWarning(e,cast,theme,progress)){}
  else if(cast.type==='cleave')paintEnemyCleave(cast,theme,progress);
  else if(cast.type==='ground')for(const t of cast.targets)paintWarningCircle(t.x,t.y,t.r,progress,theme);
  else if(cast.type==='beam'){
   const dx=Math.cos(cast.angle),dy=Math.sin(cast.angle),x=cast.origin.x,y=cast.origin.y,half=cast.beamWidth/2;ctx.save();ctx.fillStyle=theme.color+'25';ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-dy*half,y+dx*half);ctx.lineTo(x+dx*540-dy*half,y+dy*540+dx*half);ctx.lineTo(x+dx*540+dy*half,y+dy*540-dx*half);ctx.lineTo(x+dy*half,y-dx*half);ctx.closePath();ctx.fill();ctx.stroke();line(x,y,x+dx*540*progress,y+dy*540*progress,2.5,theme.hot);ctx.restore();
  }else if(cast.type==='volley'){
   paintWarningCircle(cast.origin.x,cast.origin.y,e.rad+27,progress,theme);const count=e.bossIndex===2?18:10,offset=(e.mechanicIndex||0)*.39;for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset;line(cast.origin.x+Math.cos(a)*40,cast.origin.y+Math.sin(a)*40,cast.origin.x+Math.cos(a)*135,cast.origin.y+Math.sin(a)*135,1.2,theme.color+'88');}
  }
  if(cast.type==='mend'||cast.type==='fury'){const point=cast.point;paintWarningCircle(point.x,point.y,25,progress,theme);encounterLabel(cast.type==='mend'?'+':'ϟ',point.x,point.y+5,theme.hot,20);}
  encounterLabel(cast.label||cast.type,e.x,e.y-e.rad-15,theme.hot,10);
 }
 for(const h of game.hazards||[]){const theme=combatTheme(h.language||'friendly');
  if(h.type==='expanded'){paintExpandedShape(h,theme,h.delay>0?.3:h.life/h.total,h.delay<=0);continue;}
  if(h.type==='ground')paintWarningCircle(h.x,h.y,h.r,h.life/h.total,theme,true);
  else{line(h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length,h.width,theme.color+'25');line(h.x,h.y,h.x+Math.cos(h.angle)*h.length,h.y+Math.sin(h.angle)*h.length,1.5,theme.hot+'90');}
 }
}
function paintDungeonProjectile(s){
 paintAbilityProjectile(s);
}
function drawBoss(e,b){
  if(e.champion){paintRareElite(e);return;}
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
  const elapsed=Math.min(dt,e.burn),damage=(e.burnDps||attackDamage()*.02*waveRank('fire'))*elapsed*enemyShieldMultiplier(e);
  e.burn-=elapsed;e.hp-=damage;e.burnVisualDamage=(e.burnVisualDamage||0)+damage;e.burnVisualTimer=(e.burnVisualTimer||0)+elapsed;
  if(e.burnVisualTimer>=.6||e.burn<=0||e.hp<=0)flushBurnDamage(e);
  if(e.hp<=0){e.lastDamageStyle=e.burnStyle||e.lastDamageStyle;onKill(e);return true;}return false;
}
function paintBurningEnemy(e){
  if(!(e.burn>0))return;

  glow(e.x,e.y,Math.max(20,e.rad*1.5),'#e3973e35');
  for(let i=0;i<3;i++){const a=i*2.1,offset=reducedMotion()?0:Math.sin(game.frame*8+i)*3,x=e.x+Math.cos(a)*e.rad*.7,y=e.y-8+offset;poly([x-4,y+6,x-5,y-2,x,y-14,x+2,y-5,x+5,y-9,x+4,y+6],'#e98b46aa');line(x,y+3,x,y-5,1.6,'#ffe0a4');}
}

function drawMob(e,b){
  if(e.uncommon){paintUncommonEnemy(e);return;}
  if(e.elite){drawBoss(e,b);return;}
  if(!paintEnvironmentMob(e)){drawFallbackMob(e,b);return;}
  if(e.hp<e.maxHp){const y=e.y+e.rad*.85-environmentMobSize(e).height-8;quad(e.x-15,y,30,4,'#102934');quad(e.x-15,y,30*clamp(e.hp/e.maxHp,0,1),4,'#d8c594');}
}
function playerMoveSpeed(){return 175*(1+trinketBonus('speed'))*(1+styleStats().movePercent/100)*waveSwiftFactor()*eliteBoonValue('movement');}
function tickCombat(dt){if(eliteRewardOpen())return;const p=game.player,playerFrom=encounterFoot(p),dashing=p.dashTime>0;game.frame+=dt;game.phaseTime+=dt;game.runSeconds+=dt;p.invuln=Math.max(0,p.invuln-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.dashGuard=Math.max(0,(p.dashGuard||0)-dt);
 tickEliteBoon(dt);tickEliteLinks(dt);p.attackPose=Math.max(0,p.attackPose-dt);p.hitPose=Math.max(0,p.hitPose-dt);let dx=(game.keys.KeyD||game.keys.ArrowRight?1:0)-(game.keys.KeyA||game.keys.ArrowLeft?1:0),dy=(game.keys.KeyS||game.keys.ArrowDown?1:0)-(game.keys.KeyW||game.keys.ArrowUp?1:0);
 if(game.joystick.pointer!==null){dx=game.joystick.x;dy=game.joystick.y;}else if(game.mouseMove.active){dx=game.mouseMove.x;dy=game.mouseMove.y}
 const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;p.vx=dx;p.vy=dy;if(Math.abs(dx)>.15)p.facing=dx<0?-1:1;const spd=playerMoveSpeed();if(p.dashTime>0){p.x+=p.dashDX*650*dt;p.y+=p.dashDY*650*dt;p.dashTime-=dt;burst(p.x,p.y,1,'#a4e2b2')}else{p.x+=dx*spd*dt;p.y+=dy*spd*dt}
 resolveWorldCollisions(p);game.dashSweep={frame:game.frame,active:dashing,serial:p.dashSerial||0};if(tickEliteSpoils())return;tickEncounterObjects(dt,playerFrom,dashing);tickThemedMechanics(dt,{x:playerFrom.x,y:playerFrom.y-13},dashing);if(game.status!=='running')return;tickDashStuns(playerFrom,dashing);tickEliteTasks(dt);updateCombatAim();
 if(game.upgrades.regen)p.hp=Math.min(p.maxHp,p.hp+(waveRank('regen')*.08)*dt);
 tickAmmunition(dt);game.attackTimer-=dt;if(game.attackTimer<=0&&attack()){game.attackTimer=attackCooldown()}
 if(game.phase%2===0&&game.phase<6){
  game.spawnTimer-=dt;
  const cap=activeMobCap(),interval=spawnInterval();
  // Debt-based clock: at 60x multiple mobs can spawn in a single frame.
  // Every mob is still created and must be defeated for the encounter to clear.
  let spawned=0;
  while(game.spawnTimer<=0&&game.phaseSpawned<game.phaseTarget&&game.enemies.length<cap&&spawned<12){
   const enemy=spawnEnemy();promoteRareElite(enemy);promoteUncommon(enemy);game.phaseSpawned++;game.spawnTimer+=interval;spawned++;
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
   if(e.boss||e.elite||e.uncommon)tickBossSpecial(e,dt,playerFrom,dashing);
   if(!game.enemies.includes(e)||game.status!=='running')continue;
   const walk=e.cast&&!isReflectCast(e.cast)||e.charge||e.stagger>0?0:e.uncommon&&dist<175?-.5:e.uncommon&&dist<280?0:(game.totems||[]).some(t=>t.owner===e)?.20:1,step=e.speed*dt*walk*enemyMovementFactor()*(e.frozen>0?1-(.05+(e.frostRank||1)*.02):1),intent=eliteBehaviorStep(e,vx/dist*step,vy/dist*step,step),move=themedLinkStep(e,intent.x,intent.y);e.x+=move.x;e.y+=move.y;
   if(!(e.stagger>0)&&dist<e.rad+17&&e.contact<=0){hurt(e.boss||e.elite?hostileDamage(e,ENCOUNTER_DAMAGE.contact):(10+combatDepth()*1.5)*(e.furyLinked?1.12:1));e.contact=e.boss?.7:.60}
 }
 tickDungeonHazards(dt,{x:playerFrom.x,y:playerFrom.y-13});tickHealthDrops(dt);tickGroundLoot(dt);
 for(let i=game.shots.length-1;i>=0;i--){
  const s=game.shots[i],oldX=s.x,oldY=s.y;steerPlayerShot(s,dt);s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;let remove=s.life<=0;
  if(!remove)for(const e of combatTargets()){
   if(!s.hits.has(e)&&shotHitsBody(s,e,oldX,oldY)){s.hits.add(e);if(s.secondary)secondaryDamage(e,s.damage,s.combatStyle);else dealDamage(e,s.damage,s.x,s.y,s.combatStyle);
    if(redirectPlayerShot(s,e))break;
    if(s.pierce>0){s.pierce--;s.damage*=.84;}else if(s.returnPower&&!s.returning){s.returning=true;s.hits=new Set();break;}else{remove=true;break;}
   }
  }
  if(remove)game.shots.splice(i,1);
 }
 for(let i=game.swings.length-1;i>=0;i--){game.swings[i].life-=dt;if(game.swings[i].life<=0)game.swings.splice(i,1)}
 for(let i=game.hostileShots.length-1;i>=0;i--){
  const s=game.hostileShots[i];if(!s)continue;s.oldX=s.x;s.oldY=s.y;advanceExpandedShot(s,dt);s.life-=dt;
  if(s.life<=0||reflectAbsorbsShot(s)){const at=game.hostileShots.indexOf(s);if(at>=0)game.hostileShots.splice(at,1);continue;}
  if(s.language==='friendly')damageMonstersInAttack(s.owner,s,e=>shotHitsBody(s,e,s.oldX,s.oldY));
  if(segmentDistance(p.x,p.y,s.oldX,s.oldY,s.x,s.y)<s.rad+12){hurt(s.damage||11+combatDepth());const at=game.hostileShots.indexOf(s);if(at>=0)game.hostileShots.splice(at,1);}
 }
 for(let i=game.gems.length-1;i>=0;i--){const g=game.gems[i],d=Math.hypot(g.x-p.x,g.y-p.y),magnet=68+waveRank('vortex')*8+trinketBonus('pickup');if(d<magnet*2){const speed=d<magnet?500:165;g.x+=(p.x-g.x)/Math.max(1,d)*speed*dt;g.y+=(p.y-g.y)/Math.max(1,d)*speed*dt}if(d<20){game.gems.splice(i,1);gainXp(g.value);if(game.status==='upgrade')break}}
 if(game.transition>0){game.transition-=dt;if(game.transition<=0&&game.status==='running')nextPhase()}
 game.camX+=(p.x-game.camX)*Math.min(1,dt*6);game.camY+=(p.y-game.camY)*Math.min(1,dt*6);
 game.shake=Math.max(0,game.shake-dt*19);
}

function drawCombat(w,h){const b=biome();drawTiles(b,w,h);ctx.save();const jitter=game.shake>0&&!reducedMotion()?rand(-game.shake,game.shake):0;ctx.translate(w/2-game.camX+jitter,h/2-game.camY+jitter);
 const kind=biomeIndex();
 const worldObjects=worldScenery(kind,game.camX,game.camY,w,h);drawEnvironmentDecals(worldObjects);paintEncounterGround();paintGraveEchoes();
 const entries=game.enemies.map(e=>({y:e.y+e.rad*.65,enemy:e}));
 entries.push({y:game.player.y+15,player:true});
 for(const t of game.totems||[])entries.push({y:t.y+18,totem:t});
 for(const o of worldObjects)if(!o.decal)entries.push({y:o.y,scenery:o});
 entries.sort((a,b)=>a.y-b.y);
 for(const item of entries){if(item.player){paintEliteBoonAura(game.player);drawPlayer(game.player);}else if(item.totem)paintTotem(item.totem);else if(item.scenery)scenerySprite(item.scenery,kind);else if(item.enemy.boss||item.enemy.elite)drawBoss(item.enemy,b);else drawMob(item.enemy,b)}
 paintThreatTelegraphs();paintThemedAir();paintEncounterLinks();paintEliteLinks();for(const enemy of game.enemies)paintBurningEnemy(enemy);
 for(const sw of game.swings){
  ctx.save();const fade=sw.life/sw.max;ctx.translate(sw.x,sw.y);ctx.rotate(sw.angle);
  ctx.globalAlpha=fade*.85;ctx.strokeStyle=sw.style==='greatsword'?'#ffaf63':sw.style==='polearm'?'#d7f9ed':'#ffe3a5';
  ctx.lineWidth=sw.style==='greatsword'?12:6;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=17;
  ctx.beginPath();ctx.arc(0,0,sw.reach,-sw.cone*.78,sw.cone*.78);ctx.stroke();
  ctx.strokeStyle='#fff6df';ctx.lineWidth=1.8;ctx.stroke();ctx.restore();
 }
 paintGroundLoot();paintLootReceipts();
 paintHealthDrops();paintEliteSpoils();
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
 const x0=arc.x,y0=arc.y,x1=arc.tx,y1=arc.ty,n=7;ctx.save();ctx.shadowColor=arc.color||'#8dceff';ctx.shadowBlur=18;
 for(let layer=0;layer<2;layer++){ctx.beginPath();ctx.moveTo(x0,y0);for(let j=1;j<n;j++){const u=j/n;const nx=x0+(x1-x0)*u+Math.sin(j*13+game.frame*53)*8,ny=y0+(y1-y0)*u+Math.cos(j*19+game.frame*42)*8;ctx.lineTo(nx,ny)}ctx.lineTo(x1,y1);ctx.strokeStyle=layer?'#f0ffff':arc.color||'#64b5f2';ctx.lineWidth=layer?1.7:6;ctx.stroke()}ctx.restore();
 }
 for(const shot of game.hostileShots)paintDungeonProjectile(shot);
 for(const o of game.particles){ctx.globalAlpha=clamp(o.life/o.max,0,1);disc(o.x,o.y,o.rad,o.color)}ctx.globalAlpha=1;
 // Ambient spores / cinders / soul motes drift through all biomes.
 ctx.save();const motecolor=['#d4f5a7','#ffae75','#d4c9ff','#b2f8ff'][kind];
 for(let i=0;i<(reducedMotion()?0:15);i++){const ox=rng(i,31,kind)*w,oy=rng(i,56,kind)*h,px=(ox+Math.sin(game.frame*.6+i)*19),py=((oy-game.frame*(8+i%5*3))%h+h)%h;
   ctx.globalAlpha=.22+Math.sin(game.frame+i)*.16;disc(px+game.camX-w/2,py+game.camY-h/2,1+i%3*.5,motecolor)}ctx.restore();
 for(const o of game.floaters){ctx.globalAlpha=clamp(o.life/.8,0,1);ctx.shadowColor='#060b15';ctx.shadowBlur=5;textAt(o.text,o.x,o.y,'bold 17px Georgia',o.color);ctx.shadowBlur=0}ctx.globalAlpha=1;ctx.restore();}

function dealDamage(enemy,base,fromX,fromY,sourceStyle=combatStyle()){
 if(enemy.totem){damageTotem(enemy,base);return;}if(!game.enemies.includes(enemy))return;
 const healthBefore=Math.max(0,enemy.hp),critical=Math.random()<waveCritChance(),rawDamage=base*eliteBoonValue('damage')*(enemy.elite||enemy.boss?eliteBoonValue('eliteDamage'):1)*(critical?2:1),damage=rawDamage*enemyShieldMultiplier(enemy,{x:fromX,y:fromY});
 enemy.lastHitAt=game.frame;enemy.lastDamageStyle=sourceStyle;enemy.hp-=damage;
 noteEliteTaskHit(enemy,damage);
 if(trinketBonus('leech')>0)game.player.hp=Math.min(game.player.maxHp,game.player.hp+Math.min(damage,healthBefore)*trinketBonus('leech'));
 if(game.floaters.length<75)floater(enemy.x,enemy.y-15,Math.round(damage),critical?'#ffe68e':'#e8f5de');if(game.enemies.length<110)burst(enemy.x,enemy.y,3,'#ffdfad');
 if(enemy.hp>0){
  if(waveRank('fire')){enemy.burn=2.5+waveRank('fire')*.1;enemy.burnDps=rawDamage*.02*waveRank('fire');enemy.burnStyle=sourceStyle;}
  if(waveRank('frost')){enemy.frozen=Math.max(enemy.frozen||0,1+waveRank('frost')*.1);enemy.frostRank=waveRank('frost');}
 }
 const nearby=(radius)=>combatTargets().filter(e=>e!==enemy&&e.hp>0&&Math.hypot(e.x-enemy.x,e.y-enemy.y)<radius).sort((a,b)=>Math.hypot(a.x-enemy.x,a.y-enemy.y)-Math.hypot(b.x-enemy.x,b.y-enemy.y));
 if(waveRank('storm')&&Math.random()<waveRank('storm')*.04)secondaryDamage(nearby(145)[0],damage*(.20+.03*waveRank('storm')),sourceStyle,enemy);
 if(waveRank('nova')&&critical){for(const t of nearby(65).slice(0,1+waveRank('nova')))secondaryDamage(t,damage*(.06+.02*waveRank('nova')),sourceStyle,enemy);burst(enemy.x,enemy.y,11,DUNGEON_THEMES[biomeIndex()].color);}
 if(waveRank('disrupt')&&game.frame>=(game.disruptReadyAt||0)&&Math.random()<.06*waveRank('disrupt')){game.disruptReadyAt=game.frame+8;for(const t of game.totems||[])t.disabledUntil=game.frame+1+waveRank('disrupt')*.5;floater(enemy.x,enemy.y-35,'TOTEMS DISRUPTED','#a7e4ff');}
 if(data.enchant>0&&Math.random()<Math.min(.6,.14*data.enchant))secondaryDamage(nearby(200)[0],damage*.5,sourceStyle,enemy);
 if(sourceStyle==='magic')for(const t of nearby(70).slice(0,2))secondaryDamage(t,damage*.25,sourceStyle,enemy);
 if(sourceStyle==='melee'&&waveRank('echo')&&Math.random()<.12*waveRank('echo'))secondaryDamage(nearby(150)[0],damage*.22,sourceStyle,enemy);
 if(eliteBoonSum('chainChance')&&Math.random()<Math.min(.85,eliteBoonSum('chainChance')))secondaryDamage(nearby(210)[0],damage*.35,sourceStyle,enemy);
 if(waveRank('return')&&Math.random()<.08*waveRank('return')){
  const angle=Math.atan2(enemy.y-fromY,enemy.x-fromX);game.shots.push({x:fromX,y:fromY,vx:Math.cos(angle)*300,vy:Math.sin(angle)*300,damage:damage*.2,combatStyle:sourceStyle,life:2.5,hits:new Set(),pierce:2,magic:sourceStyle==='magic',secondary:true,returnPower:true,age:0});
 }
 if(enemy.hp<=0&&game.enemies.includes(enemy))onKill(enemy);
}

function update(dt){
 const simDt=dt*delvingTimeMultiplier(),skillSpeed=skillingTimeMultiplier();
 game.tipClock=(game.tipClock||0)+dt;tickLootReceipts(dt);
 const visualBoost=game.holdSkill===game.scene&&SKILLS[game.scene]?skillBuffMultiplier(game.scene):1;
 game.workVisualClock=(game.workVisualClock||0)+dt*workAnimationSpeed(skillSpeed*visualBoost);
 if(SKILLS[game.scene]&&(game.holdSkill===game.scene||data.idleJobs.includes(game.scene))&&activeSkillCanAdvance(game.scene))game.workEffectsClock=(game.workEffectsClock||0)+dt;
 tickSkillBonusReaction(dt);
 game.mineAction=Math.max(0,game.mineAction-dt);game.forgeAction=Math.max(0,game.forgeAction-dt);game.workAction=Math.max(0,game.workAction-dt);
 advanceSkillWork(dt,skillSpeed);
 game.frame+=game.status==='running'?0:dt;
 const realNow=Date.now(),jobsDelta=Math.min(8*3600,Math.max(0,(realNow-game.lastJobsAt)/1000));game.lastJobsAt=realNow;
 if(jobsDelta>0)advanceProduction(jobsDelta,skillSpeed);
 if(!game.customizing&&!game.menuPaused&&$('overlay').classList.contains('hidden')&&game.scene==='combat'&&game.status==='running'){
  let left=simDt,steps=0;
  while(left>0&&steps<175&&game.status==='running'&&!game.menuPaused&&$('overlay').classList.contains('hidden')){
   const step=Math.min(.09,left);tickCombat(step);animateEffects(step);left-=step;steps++;
  }
 }else animateEffects(dt);
 game.saveTimer+=dt;game.uiTimer+=dt;
 if(game.uiTimer>.14){refreshUI();game.uiTimer=0;}
 if(game.saveTimer>=4){save();game.saveTimer=0;}
 // Bonus targets and interface timing remain readable at testing speeds.
 tickSkillBonuses(dt);
}

function spawnBaseEnemy(boss=false,bossIndex=0){const a=rand(0,Math.PI*2),r=rand(205,320),d=zoneEnemyHp(false,0,rand(.9,1.1))/Math.max(1,30+game.phase*4);const e={x:game.player.x+Math.cos(a)*r,y:game.player.y+Math.sin(a)*r,rad:boss?(bossIndex===2?36:29):rand(12,17),hp:boss?100:((30+game.phase*4)*d),maxHp:boss?100:((30+game.phase*4)*d),speed:(boss?(bossIndex===2?77:86):rand(77,108)*(1+Math.min(1,combatDepth()*.05)))*(zoneVisualBand()===2?1.12:1),boss,bossIndex,contact:0,attack:boss?2.5:0,telegraph:0,wobble:rand(0,7),name:''};game.enemies.push(e);return e;}
