/* A few persistent ranged threats replace ordinary monsters; loot stays ordinary. */
const UNCOMMON_ENEMIES={chance:.07,health:2,caps:[1,2,3,4],projectile:.06,ground:.08,charge:.10};
function uncommonCap(index=zoneNumber()){return UNCOMMON_ENEMIES.caps[Math.min(3,Math.max(0,index))];}
function uncommonPattern(enemy){return ['volley','ground','charge'][(enemy.visualType||0)%3];}
function promoteUncommon(enemy,roll=Math.random()){
 if(!enemy||enemy.boss||enemy.elite||enemy.summoned||enemy.uncommon||game.phase%2!==0||game.phaseSpawned<4||game.enemies.filter(e=>e.uncommon&&e.hp>0).length>=uncommonCap()||roll>=UNCOMMON_ENEMIES.chance)return false;
 enemy.uncommon=true;enemy.hp=enemy.maxHp=enemy.maxHp*UNCOMMON_ENEMIES.health;enemy.speed*=.72;enemy.castCooldown=1.4+(game.phaseSpawned%4)*.45;enemy.uncommonAttack=uncommonPattern(enemy);codexDiscover('uncommon_creatures');return true;
}
function resolveUncommonAttack(enemy,cast){
 const damage=hostileDamage(enemy,cast.type==='ground'?UNCOMMON_ENEMIES.ground:cast.type==='charge'?UNCOMMON_ENEMIES.charge:UNCOMMON_ENEMIES.projectile);
 if(cast.type==='charge')resolveEliteSpecial(enemy,cast,damage);
 else if(cast.type==='ground')game.hazards.push({x:cast.target.x,y:cast.target.y,r:cast.targets[0].r,type:'ground',singleHit:true,language:'friendly',owner:enemy,enemyHits:new Set(),biome:enemy.biome,life:.6,total:.6,damage,age:0});
 else{const angle=cast.angle;game.hostileShots.push({x:enemy.x,y:enemy.y,vx:Math.cos(angle)*155,vy:Math.sin(angle)*155,rad:6,life:4,biome:enemy.biome,damage,owner:enemy,attack:cast,language:'danger'});}
}
function paintUncommonWarning(enemy,cast,progress){
 if(!enemy.uncommon||cast.type!=='volley')return false;
 const theme=combatTheme('danger'),start=cast.origin,end={x:start.x+Math.cos(cast.angle)*220,y:start.y+Math.sin(cast.angle)*220};
 line(start.x,start.y,end.x,end.y,1.4,theme.color+'88');themedArrow(end.x,end.y,cast.angle,theme.hot,8);paintWarningCircle(start.x,start.y,enemy.rad+12,progress,theme);return true;
}
function paintUncommonEnemy(enemy){
 const kind=enemy.biome??biomeIndex(),image=rareEliteImage(kind,enemy.visualType||0),height=Math.min(78,environmentMobSize(enemy).height*1.12),width=height*image.naturalWidth/Math.max(1,image.naturalHeight),foot=enemy.y+enemy.rad*.7;
 if(image.complete&&image.naturalWidth){ctx.save();ctx.translate(enemy.x,foot);if(enemy.x>game.player.x)ctx.scale(-1,1);ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();}else paintEnvironmentMob(enemy);
 ctx.save();ctx.strokeStyle='#baaa7d';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(enemy.x,foot,Math.max(14,width*.32),5,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const y=foot-height-5;quad(enemy.x-18,y,36,3,'#161921');quad(enemy.x-18,y,36*clamp(enemy.hp/enemy.maxHp,0,1),3,'#c4b183');
 paintAbilityEmblem(enemy.uncommonAttack==='charge'?'damage':enemy.uncommonAttack==='ground'?'portal':'star',enemy.x,y-10,6,{color:'#c5b388',hot:'#f2e2be',dark:'#3e3933'});
}
