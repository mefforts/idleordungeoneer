/* Zone 2's finale and the first steps into the Hollow Crypt. */
const ZONE_THREE_DAMAGE=1.6;
const GRAVE_PULSE={speed:320,runningFactor:1.25,width:32,dashReadyLead:.4};
function rareEliteQuota(index=zoneNumber(),stage=zoneStage()){return index===1&&stage===zoneFloorCount(index)?3:1;}
function rareEliteSpawnChance(index=zoneNumber(),stage=zoneStage()){return index===1&&stage===zoneFloorCount(index)?.10:RARE_ELITE_CHANCE;}
function expectedRareCount(trials,chance,cap=1){let probability=Math.pow(1-chance,trials),sum=0;for(let n=0;n<=trials;n++){sum+=Math.min(n,cap)*probability;probability*=((trials-n)/(n+1))*(chance/(1-chance));}return sum;}
function enlargedAttackArena(rect){const x=(rect.left+rect.right)/2,y=(rect.top+rect.bottom)/2,w=(rect.right-rect.left)*.75,h=(rect.bottom-rect.top)*.75;return {left:x-w,right:x+w,top:y-h,bottom:y+h};}
function spawnGraveEcho(enemy){
 if(zoneNumber()!==2||enemy.summoned||enemy.totem||enemy.boss)return;
 const echoes=game.graveEchoes||(game.graveEchoes=[]);if(echoes.length>=5)return;
 echoes.push({x:enemy.x,y:enemy.y,age:0,life:4.2,power:enemy.elite?22:16,vx:0,vy:0,biome:2});
}
function tickGraveEchoes(dt){
 game.graveEchoes=(game.graveEchoes||[]).filter(e=>{
  if(game.status!=='running')return false;
  e.age+=dt;e.life-=dt;if(e.life<=0)return false;if(e.age<.85)return true;
  if(e.age<3.3){const p=game.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,blend=Math.min(1,dt*2.2);e.vx+=(dx/d*110-e.vx)*blend;e.vy+=(dy/d*110-e.vy)*blend;e.x+=e.vx*dt;e.y+=e.vy*dt;if(Math.hypot(p.x-e.x,p.y-e.y)<18){hurt(e.power);burst(e.x,e.y,8,'#d4c3f3');return false;}}
  else if(e.life<=dt+.05){if(Math.hypot(game.player.x-e.x,game.player.y-e.y)<48)hurt(e.power);burst(e.x,e.y,10,'#c7b1ef');return false;}
  return true;
 });
}
function paintGraveEchoes(){
 for(const e of game.graveEchoes||[]){const charging=e.age<.85,ending=e.age>=3.3,theme=combatTheme('danger'),time=reducedMotion()?0:game.frame;
  ctx.save();ctx.translate(e.x,e.y);const radius=charging?18+e.age*12:ending?48:18;glow(0,0,radius+9,'#c3a2ef38');ctx.strokeStyle=charging||ending?theme.color:'#bba1e8';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,6,radius,radius*.45,0,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.translate(0,charging?-5:-17+Math.sin(time*3)*2);poly([-11,8,-12,-3,-8,-12,0,-16,8,-12,12,-3,11,8,5,5,0,10,-5,5],'#c8bdded9','#5e4b80',1.3);ellipse(-4,-4,2,3,'#39234f');ellipse(4,-4,2,3,'#39234f');line(-3,3,3,3,1,'#78618f');ctx.restore();ctx.restore();
  if(charging)encounterTip('SOUL AWAKENING',e.x,e.y-34,'#e0c7f3',9,e,'awakening','echo');
 }
}
function addEmberCleave(enemy,cast,damage){
 if(zoneNumber()!==1)return;
 game.hazards.push({type:'expanded',shape:'cone',abilityType:'emberCleave',origin:{...cast.origin},angle:cast.angle,reach:cast.reach,halfAngle:cast.halfAngle,owner:null,biome:1,language:'danger',damage:damage*.25,life:3.2,total:3.2,age:0,lingering:true,enemyHits:new Set()});
}
function addGravePulses(enemy,cast,damage){
 game.hazards.push({type:'expanded',shape:'ring',abilityType:'gravePulse',x:cast.origin.x,y:cast.origin.y,inner:0,r:GRAVE_PULSE.width,wave:true,waveSpeed:Math.max(GRAVE_PULSE.speed,playerMoveSpeed()*GRAVE_PULSE.runningFactor),owner:enemy,biome:enemy.biome,language:'friendly',damage:damage*.85,life:1,total:1,age:0,delay:0,enemyHits:cast.enemyHits});
}
function gravePulseCanCast(){
 return game.player.dashCooldown<=EXPANDED_ABILITIES.gravePulse.seconds-GRAVE_PULSE.dashReadyLead+1e-9&&
  !game.enemies.some(e=>e.cast?.type==='gravePulse')&&!(game.hazards||[]).some(h=>h.abilityType==='gravePulse');
}
function gravePulseFinished(h){
 // Retire the moving rim only after it has passed every actor and the screen.
 const visible=Math.hypot(h.x-game.camX,h.y-game.camY)+Math.hypot(game.viewWidth,game.viewHeight)/2+48;
 return h.inner>visible&&h.inner>Math.hypot(h.x-game.player.x,h.y-game.player.y)+32&&
  game.enemies.every(e=>h.inner>Math.hypot(h.x-e.x,h.y-e.y)+(e.rad||18)+32);
}
function expandingWaveContains(actor,h,previous,from=actor){
 const radius=actor===game.player?9:Math.min(18,actor.rad||10),dx=actor.x-from.x,dy=actor.y-from.y,ux=from.x-h.x,uy=from.y-h.y,travel=Math.hypot(dx,dy),growth=h.r-previous.r;
 // Distance from the expanding rim is convex along a movement segment.
 // Test its minimum and endpoint maximum so fast dashes cannot tunnel through.
 let t=1;
 if(travel>growth+1e-9){const along=(ux*dx+uy*dy)/travel,across=Math.sqrt(Math.max(0,ux*ux+uy*uy-along*along));t=clamp((growth*across/Math.sqrt(travel*travel-growth*growth)-along)/travel,0,1);}
 const offset=at=>Math.hypot(ux+dx*at,uy+dy*at)-growth*at,a=offset(0),b=offset(1);
 return Math.min(a,b,offset(t))<previous.r+radius&&Math.max(a,b)>previous.inner-radius;
}
