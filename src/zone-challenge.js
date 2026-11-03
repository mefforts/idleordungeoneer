/* Zone 2's finale and the first steps into the Hollow Crypt. */
const ZONE_THREE_DAMAGE=1.6;
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
 for(const delay of [0,.9])game.hazards.push({type:'expanded',shape:'ring',abilityType:'gravePulse',x:cast.origin.x,y:cast.origin.y,inner:25,r:47,wave:true,waveSpeed:145,owner:enemy,biome:enemy.biome,language:'friendly',damage:damage*.85,life:2.4,total:2.4,age:0,delay,enemyHits:cast.enemyHits});
}
