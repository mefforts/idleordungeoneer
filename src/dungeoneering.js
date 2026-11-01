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
    }else if(cast.type==='volley'){paintWarningCircle(cast.origin.x,cast.origin.y,e.rad+27,progress,theme);const count=e.bossIndex===2?(e.boss&&zoneStage()===3?18:14):10,offset=(e.mechanicIndex||0)*.39;for(let i=0;i<count;i++){if(i%5===0)continue;const a=i*Math.PI*2/count+offset;line(cast.origin.x+Math.cos(a)*40,cast.origin.y+Math.sin(a)*40,cast.origin.x+Math.cos(a)*135,cast.origin.y+Math.sin(a)*135,1.2,theme.color+'88');}}
    if(cast.type==='mend'||cast.type==='fury'){const point=cast.point;paintWarningCircle(point.x,point.y,25,progress,theme);encounterLabel(cast.type==='mend'?'+':'ϟ',point.x,point.y+5,theme.hot,20);}
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
  const elapsed=Math.min(dt,e.burn),damage=(e.burnDps||attackDamage()*.02*waveRank('fire'))*elapsed;
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
  if(e.elite){drawBoss(e,b);return;}
  if(!paintEnvironmentMob(e)){drawFallbackMob(e,b);return;}
  if(e.hp<e.maxHp){const y=e.y+e.rad*.85-environmentMobSize(e).height-8;quad(e.x-15,y,30,4,'#102934');quad(e.x-15,y,30*clamp(e.hp/e.maxHp,0,1),4,'#d8c594');}
}
function tickCombat(dt){const p=game.player;game.frame+=dt;game.phaseTime+=dt;game.runSeconds+=dt;p.invuln=Math.max(0,p.invuln-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);
 p.attackPose=Math.max(0,p.attackPose-dt);p.hitPose=Math.max(0,p.hitPose-dt);let dx=(game.keys.KeyD||game.keys.ArrowRight?1:0)-(game.keys.KeyA||game.keys.ArrowLeft?1:0),dy=(game.keys.KeyS||game.keys.ArrowDown?1:0)-(game.keys.KeyW||game.keys.ArrowUp?1:0);
 if(game.joystick.pointer!==null){dx=game.joystick.x;dy=game.joystick.y;}else if(game.mouseMove.active){dx=game.mouseMove.x;dy=game.mouseMove.y}
 const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;p.vx=dx;p.vy=dy;if(Math.abs(dx)>.15)p.facing=dx<0?-1:1;const spd=175*(1+trinketBonus('speed'))*(1+styleStats().movePercent/100)*waveSwiftFactor();if(p.dashTime>0){p.x+=p.dashDX*650*dt;p.y+=p.dashDY*650*dt;p.dashTime-=dt;burst(p.x,p.y,1,'#a4e2b2')}else{p.x+=dx*spd*dt;p.y+=dy*spd*dt}
 resolveWorldCollisions(p);tickEncounterObjects(dt);updateCombatAim();
 if(game.upgrades.regen)p.hp=Math.min(p.maxHp,p.hp+(waveRank('regen')*.08)*dt);
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
   if(!game.enemies.includes(e)||game.status!=='running')continue;
   const walk=e.cast||e.stagger>0?0:(game.totems||[]).some(t=>t.owner===e)?.35:1;e.x+=vx/dist*e.speed*dt*walk*(e.frozen>0?1-(.05+(e.frostRank||1)*.02):1);e.y+=vy/dist*e.speed*dt*walk*(e.frozen>0?1-(.05+(e.frostRank||1)*.02):1);
   if(!(e.stagger>0)&&dist<e.rad+17&&e.contact<=0){hurt((e.boss?24+data.floor*2:e.elite?17+data.floor*1.5:10+data.floor*1.5)*(e.furyLinked?1.12:1));e.contact=e.boss?.7:.60}
 }
 tickDungeonHazards(dt);
 for(let i=game.shots.length-1;i>=0;i--){
  const s=game.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  if(Math.random()<.32&&game.particles.length<180)game.particles.push({x:s.x,y:s.y,vx:-s.vx*.06+rand(-22,22),vy:-s.vy*.06+rand(-22,22),life:.18,max:.18,color:s.magic?'#9ae9ff':'#f9d5a0',rad:rand(1,2.5)});
  let remove=s.life<=0;
  if(!remove)for(const e of combatTargets()){
   if(!s.hits.has(e)&&Math.hypot(s.x-e.x,s.y-e.y)<e.rad+6){s.hits.add(e);dealDamage(e,s.damage,s.x,s.y,s.combatStyle);
    if(s.pierce>0){s.pierce--;s.damage*=.84}else{remove=true;break}
   }
  }
  if(remove)game.shots.splice(i,1);
 }
 for(let i=game.swings.length-1;i>=0;i--){game.swings[i].life-=dt;if(game.swings[i].life<=0)game.swings.splice(i,1)}
 for(let i=game.hostileShots.length-1;i>=0;i--){const s=game.hostileShots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(reflectAbsorbsShot(s)){game.hostileShots.splice(i,1);continue;}if(Math.hypot(s.x-p.x,s.y-p.y)<s.rad+12){hurt(s.damage||11+data.floor);game.hostileShots.splice(i,1)}else if(s.life<0)game.hostileShots.splice(i,1)}
 for(let i=game.gems.length-1;i>=0;i--){const g=game.gems[i],d=Math.hypot(g.x-p.x,g.y-p.y),magnet=68+waveRank('magnet')*12+trinketBonus('pickup');if(d<magnet*2){const speed=d<magnet?500:165;g.x+=(p.x-g.x)/Math.max(1,d)*speed*dt;g.y+=(p.y-g.y)/Math.max(1,d)*speed*dt}if(d<20){game.gems.splice(i,1);gainXp(g.value);if(game.status==='upgrade')break}}
 if(game.transition>0){game.transition-=dt;if(game.transition<=0&&game.status==='running')nextPhase()}
 game.camX+=(p.x-game.camX)*Math.min(1,dt*6);game.camY+=(p.y-game.camY)*Math.min(1,dt*6);
 game.shake=Math.max(0,game.shake-dt*19);
}

function drawCombat(w,h){const b=biome();drawTiles(b,w,h);ctx.save();const jitter=game.shake>0&&!reducedMotion()?rand(-game.shake,game.shake):0;ctx.translate(w/2-game.camX+jitter,h/2-game.camY+jitter);
 const kind=Math.floor((data.floor-1)/3)%4;
 const worldObjects=worldScenery(kind,game.camX,game.camY,w,h);drawEnvironmentDecals(worldObjects);paintEncounterGround();
 const entries=game.enemies.map(e=>({y:e.y+e.rad*.65,enemy:e}));
 entries.push({y:game.player.y+15,player:true});
 for(const t of game.totems||[])entries.push({y:t.y+18,totem:t});
 for(const o of worldObjects)if(!o.decal)entries.push({y:o.y,scenery:o});
 entries.sort((a,b)=>a.y-b.y);
 for(const item of entries){if(item.player)drawPlayer(game.player);else if(item.totem)paintTotem(item.totem);else if(item.scenery)scenerySprite(item.scenery,kind);else if(item.enemy.boss||item.enemy.elite)drawBoss(item.enemy,b);else drawMob(item.enemy,b)}
 paintThreatTelegraphs();paintEncounterLinks();for(const enemy of game.enemies)paintBurningEnemy(enemy);
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

function dealDamage(enemy,base,fromX,fromY,sourceStyle=combatStyle()){
 if(enemy.totem){damageTotem(enemy,base);return;}
 if(!game.enemies.includes(enemy))return;
 const damage=base*(Math.random()<waveCritChance()?2:1);
 enemy.lastHitAt=game.frame;enemy.lastDamageStyle=sourceStyle;enemy.hp-=damage;if(trinketBonus('leech')>0)game.player.hp=Math.min(game.player.maxHp,game.player.hp+damage*trinketBonus('leech'));
 if(game.floaters.length<75)floater(enemy.x,enemy.y-15,Math.round(damage),damage>attackDamage()*1.8?'#ffe68e':'#e8f5de');
 if(game.enemies.length<110)burst(enemy.x,enemy.y,3,'#ffdfad');
 if(enemy.hp>0){
  if(waveRank('fire')){enemy.burn=2.5+waveRank('fire')*.1;enemy.burnDps=damage*.02*waveRank('fire');enemy.burnStyle=sourceStyle;}
  if(waveRank('frost')){enemy.frozen=Math.max(enemy.frozen||0,1+waveRank('frost')*.1);enemy.frostRank=waveRank('frost');}
  if(waveRank('storm')&&Math.random()<waveRank('storm')*.04){
   const t=game.enemies.find(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<145);
   if(t){game.arcs.push({x:enemy.x,y:enemy.y,tx:t.x,ty:t.y,life:.23});t.lastDamageStyle=sourceStyle;t.hp-=damage*(.20+.03*waveRank('storm'));if(t.hp<=0)onKill(t)}
  }
  if(waveRank('nova')&&damage>attackDamage()*1.8){
   for(const t of game.enemies.filter(o=>o!==enemy&&Math.hypot(o.x-enemy.x,o.y-enemy.y)<65).slice(0,Math.min(5,1+Math.floor(waveRank('nova')/3)))){t.hp-=damage*(.06+.02*waveRank('nova'));if(t.hp<=0)onKill(t)}
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

function update(dt){
 const simDt=dt*(game.devSpeed||1),skillSpeed=skillingTimeMultiplier();
 game.mineAction=Math.max(0,game.mineAction-dt);game.forgeAction=Math.max(0,game.forgeAction-dt);game.workAction=Math.max(0,game.workAction-dt);
 advanceActiveWork(dt*skillSpeed);
 game.frame+=game.status==='running'?0:dt;
 const realNow=Date.now(),jobsDelta=Math.min(8*3600,Math.max(0,(realNow-game.lastJobsAt)/1000));game.lastJobsAt=realNow;
 if(jobsDelta>0)advanceProduction(jobsDelta*skillSpeed);
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

function spawnBaseEnemy(boss=false,bossIndex=0){const a=rand(0,Math.PI*2),r=rand(205,320),d=zoneEnemyHp(false,0,rand(.9,1.1))/Math.max(1,30+game.phase*4);const e={x:game.player.x+Math.cos(a)*r,y:game.player.y+Math.sin(a)*r,rad:boss?(bossIndex===2?36:29):rand(12,17),hp:boss?100:((30+game.phase*4)*d),maxHp:boss?100:((30+game.phase*4)*d),speed:(boss?(bossIndex===2?77:86):rand(77,108)*(1+Math.min(1,data.floor*.05)))*((data.floor-1)%3===1?1.12:1),boss,bossIndex,contact:0,attack:boss?2.5:0,telegraph:0,wobble:rand(0,7),name:''};game.enemies.push(e);return e;}
