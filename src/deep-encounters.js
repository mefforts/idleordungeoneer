/* New families join their area's roster gradually as its floors deepen. */
const BESTIARY_FAMILIES=[
 [{key:'shellback',name:'Shellback Turtle',elite:'Ancient Shellback',motion:'crawl',size:.9,role:'shield'},{key:'leaf-viper',name:'Leaf Viper',elite:'Thorncrest Viper',motion:'sway',size:.95,role:'ricochet'}],
 [{key:'coal-drake',name:'Coal Drake',elite:'Cindercrest Drake',motion:'prowl',size:.86,role:'charge'},{key:'foundry-construct',name:'Foundry Construct',elite:'Ironbound Construct',motion:'shamble',size:1,role:'shield'},{key:'ember-moth',name:'Ember Moth',elite:'Blazewing Moth',motion:'flutter',size:.85,role:'ricochet'},{key:'slag-wyrm',name:'Slag Wyrm',elite:'Molten Wyrm',motion:'sway',size:.9,role:'charge'}],
 [{key:'tomb-jackal',name:'Tomb Jackal',elite:'Ossuary Jackal',motion:'prowl',size:.85,role:'charge'},{key:'bone-knight',name:'Bone Knight',elite:'Crowned Bone Knight',motion:'shamble',size:1,role:'shield'},{key:'grave-ooze',name:'Grave Ooze',elite:'Sepulchral Ooze',motion:'hover',size:.88,role:'ricochet'},{key:'candle-wraith',name:'Candle Wraith',elite:'Candle Regent',motion:'hover',size:.98,role:'shield'},{key:'grave-fungus',name:'Grave Fungus',elite:'Mourning Crown',motion:'hop',size:.9,role:'ricochet'},{key:'soul-bat',name:'Soul Bat',elite:'Dreadwing',motion:'flutter',size:.85,role:'charge'}],
 [{key:'void-ray',name:'Void Ray',elite:'Crowned Void Ray',motion:'hover',size:.78,role:'charge'},{key:'star-golem',name:'Star Golem',elite:'Prismatic Colossus',motion:'shamble',size:1.05,role:'shield'},{key:'astral-urchin',name:'Astral Urchin',elite:'Starspine Urchin',motion:'hover',size:.85,role:'ricochet'},{key:'astral-serpent',name:'Astral Serpent',elite:'Crescent Serpent',motion:'sway',size:.95,role:'charge'},{key:'rift-strider',name:'Rift Strider',elite:'Rift Harrier',motion:'scuttle',size:1,role:'charge'},{key:'watcher',name:'Watcher',elite:'Starbound Watcher',motion:'hover',size:.9,role:'shield'}]
];
const BASE_ELITE_ROLES=[['charge','charge','shield','ricochet','charge','shield'],['charge','ricochet','shield','ricochet','charge','shield'],['ricochet','shield','ricochet','charge','shield','charge'],['charge','shield','ricochet','ricochet','charge','shield']];
let bestiaryInstalled=false;
function installBestiaryExpansion(){
 if(bestiaryInstalled)return;bestiaryInstalled=true;Object.assign(ENVIRONMENT_ART,BESTIARY_ART);
 BESTIARY_FAMILIES.forEach((families,kind)=>{const zone=ENVIRONMENT_ZONES[kind];for(const family of families){zone.monsters.push(family.name);zone.creatures.push(family.key);zone.motions.push(family.motion);zone.sizes.push(family.size);RARE_ELITE_NAMES[kind].push(family.elite);}});
}
function creatureWeights(kind){
 const weights=[...ENVIRONMENT_MOB_WEIGHTS[zoneVisualBand()-1]],families=BESTIARY_FAMILIES[kind],count=zoneFloorCount(),stage=zoneStage();
 families.forEach((family,index)=>{const unlock=2+Math.floor(index*Math.max(1,count-2)/families.length);weights.push(stage>=unlock?10+Math.round(10*(stage-1)/Math.max(1,count-1)):0);});return weights;
}
function rareEliteRole(enemy){const kind=enemy.biome??biomeIndex(),variant=enemy.visualType||0;return variant<6?BASE_ELITE_ROLES[kind][variant]:BESTIARY_FAMILIES[kind][variant-6].role;}
function specialAttackName(type,kind){return {charge:['Briar Charge','Cinder Rush','Grave Rush','Phase Rush'],ricochet:['Seed Ricochet','Cinder Ricochet','Bone Ricochet','Star Ricochet'],shield:['Rootguard','Ironbound','Soulguard','Prismguard']}[type]?.[kind]||'';}
function shieldRecipient(enemy){return game.enemies.some(source=>source!==enemy&&(source.shieldLink?.target===enemy&&source.shieldLink.life>0||source.cast?.type==='shield'&&source.cast.shieldTarget===enemy));}
function shieldTargetAlive(target){return !!target&&target.hp>0&&(game.enemies.includes(target)||target.destructible&&(game.totems||[]).includes(target));}
function shieldingTarget(source){
 if(source.shieldLink||shieldRecipient(source))return null;
 const candidates=[...(game.totems||[]).filter(t=>t.destructible),...game.enemies.filter(e=>e.elite&&!e.boss)];
 return candidates.filter(other=>other!==source&&shieldTargetAlive(other)&&!other.shieldLink&&other.cast?.type!=='shield'&&!shieldRecipient(other)&&Math.hypot(other.x-source.x,other.y-source.y)<340).sort((a,b)=>Number(!!b.destructible)-Number(!!a.destructible)||Math.hypot(a.x-source.x,a.y-source.y)-Math.hypot(b.x-source.x,b.y-source.y))[0]||null;
}
function clearDeadShieldLinks(){
 for(const source of game.enemies){if(source.shieldLink&&!shieldTargetAlive(source.shieldLink.target))source.shieldLink=null;if(source.cast?.type==='shield'&&!shieldTargetAlive(source.cast.shieldTarget)){source.cast=null;source.castCooldown=1;}}
}
function linkedShieldMultiplier(enemy){
 if(enemy.guardIds?.some(g=>game.enemies.includes(g)&&g.hp>0))return .30;
 if(enemy.shieldLink||enemy.cast?.type==='shield')return 1;
 return game.enemies.some(source=>source.hp>0&&source.shieldLink?.target===enemy&&source.shieldLink.life>0&&!shieldRecipient(source))?.65:1;
}
function tickEliteLinks(dt){
 for(const source of game.enemies){const link=source.shieldLink;if(!link)continue;link.life-=dt;if(link.life<=0||!shieldTargetAlive(link.target)||link.target.hp<=0||link.target.shieldLink||link.target.cast?.type==='shield'||Math.hypot(link.target.x-source.x,link.target.y-source.y)>450)source.shieldLink=null;}
}
function ricochetPoints(owner){
 const p=game.player,axis=Math.atan2(p.y-owner.y,p.x-owner.x),radius=Math.min(112,Math.max(70,game.viewWidth*.23)),points=[];
 const left=game.camX-game.viewWidth/2+30+(data.hudLayout.side==='left'?52:0),right=game.camX+game.viewWidth/2-30-(data.hudLayout.side==='right'?52:0),top=game.camY-game.viewHeight/2+120,bottom=game.camY+game.viewHeight/2-85;
 for(const offset of [-Math.PI/2,Math.PI/2,0]){
  let best=null;for(let attempt=0;attempt<12;attempt++){const a=axis+offset+(attempt%2?1:-1)*Math.floor(attempt/2)*.12,x=clamp(p.x+Math.cos(a)*radius,left,Math.max(left,right)),y=clamp(p.y+Math.sin(a)*radius,top,Math.max(top,bottom));if(encounterClear(x,y,18)&&points.every(point=>Math.hypot(point.x-x,point.y-y)>45)){best={x,y};break;}}
  if(best)points.push(best);
 }
 return points.length>=2?[...points,{x:p.x,y:p.y}]:null;
}
function resolveEliteSpecial(enemy,cast,damage){
 if(cast.type==='charge'){
  const distance=Math.min(340,Math.max(100,Math.hypot(cast.target.x-cast.origin.x,cast.target.y-cast.origin.y)+65));enemy.charge={angle:cast.angle,remaining:distance,hitPlayer:false,enemyHits:new Set()};return true;
 }
 if(cast.type==='shield'){
  const target=cast.shieldTarget;if(target&&shieldTargetAlive(target)&&!target.shieldLink&&target.cast?.type!=='shield'&&!shieldRecipient(enemy)&&!shieldRecipient(target))enemy.shieldLink={target,life:8};return true;
 }
 if(cast.type==='ricochet'){
  const points=cast.ricochetPoints;if(!points?.length)return true;const angle=Math.atan2(points[0].y-enemy.y,points[0].x-enemy.x),speed=185;
  game.hostileShots.push({x:enemy.x,y:enemy.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,rad:7,life:6,biome:enemy.biome,damage:damage*.85,owner:enemy,ricochet:true,waypoints:points.map(point=>({...point})),waypoint:0,speed});
  game.counterEffects.push({type:'ricochet',points:points.slice(0,-1),biome:enemy.biome,life:6,total:6});return true;
 }
 return false;
}
function tickEnemyCharge(enemy,dt){
 const charge=enemy.charge;if(!charge)return false;const distance=Math.min(charge.remaining,460*dt*enemyMovementFactor()),x=enemy.x+Math.cos(charge.angle)*distance,y=enemy.y+Math.sin(charge.angle)*distance;
 if(!encounterClear(x,y+enemy.rad*.65,Math.max(10,enemy.rad*.7))){enemy.charge=null;burst(enemy.x,enemy.y,7,combatTheme('friendly').color);return true;}
 const oldX=enemy.x,oldY=enemy.y;enemy.x=x;enemy.y=y;charge.remaining-=distance;
 if(!charge.hitPlayer&&segmentDistance(game.player.x,game.player.y,oldX,oldY,x,y)<enemy.rad+17){charge.hitPlayer=true;hurt(bossAttackDamage(enemy,'charge'));enemy.contact=.8;}
 damageMonstersInAttack(enemy,charge,other=>segmentDistance(other.x,other.y,oldX,oldY,x,y)<enemy.rad+other.rad+9);
 if(charge.trail){charge.trailClock-=dt;if(charge.trailClock<=0){charge.trailClock=.18;game.hazards.push({type:'ground',language:'friendly',lingering:true,x:oldX,y:oldY,r:28,life:1.3,total:1.3,age:0,owner:enemy,enemyHits:charge.enemyHits,damage:bossAttackDamage(enemy,'charge')*.7,biome:enemy.biome});}}
 if(charge.remaining<=0)enemy.charge=null;return true;
}
function advanceRicochet(shot,dt){
 if(!shot.ricochet)return false;
 const point=shot.waypoints[shot.waypoint];if(!point)return false;
 const dx=point.x-shot.x,dy=point.y-shot.y,distance=Math.hypot(dx,dy),move=shot.speed*dt;
 if(distance<=move+1){shot.x=point.x;shot.y=point.y;shot.waypoint++;burst(shot.x,shot.y,4,DUNGEON_THEMES[shot.biome].color);const next=shot.waypoints[shot.waypoint];if(!next){shot.life=0;return true;}const angle=Math.atan2(next.y-shot.y,next.x-shot.x);shot.vx=Math.cos(angle)*shot.speed;shot.vy=Math.sin(angle)*shot.speed;}
 else{shot.vx=dx/distance*shot.speed;shot.vy=dy/distance*shot.speed;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}return true;
}
function paintRicochetBank(point,theme,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(point.x,point.y);ctx.rotate(Math.PI/4);quad(-7,-7,14,14,theme.dark,theme.color,1.5);line(-4,0,4,0,1.5,theme.hot);line(0,-4,0,4,1.5,theme.hot);ctx.restore();
}
function paintEliteSpecialWarning(enemy,cast,theme,progress){
 if(cast.type==='charge'){
  const x=cast.origin.x,y=cast.origin.y,length=Math.min(340,Math.hypot(cast.target.x-x,cast.target.y-y)+65),dx=Math.cos(cast.angle),dy=Math.sin(cast.angle),half=enemy.rad+8;
  ctx.save();ctx.fillStyle=theme.color+'1c';ctx.strokeStyle=theme.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-dy*half,y+dx*half);ctx.lineTo(x+dx*length-dy*half,y+dy*length+dx*half);ctx.lineTo(x+dx*length+dy*half,y+dy*length-dx*half);ctx.lineTo(x+dy*half,y-dx*half);ctx.closePath();ctx.fill();ctx.stroke();line(x,y,x+dx*length*progress,y+dy*length*progress,2.5,theme.hot);ctx.restore();paintWarningCircle(cast.target.x,cast.target.y,18,progress,theme);return true;
 }
 if(cast.type==='ricochet'){
  let previous=cast.origin;for(const point of cast.ricochetPoints||[]){line(previous.x,previous.y,point.x,point.y,1,theme.color+'80');paintRicochetBank(point,theme,.65);previous=point;}return true;
 }
 if(cast.type==='shield'){
  const target=cast.shieldTarget;if(target){line(enemy.x,enemy.y-18,target.x,target.y-18,2,theme.color+'a0');paintWarningCircle(target.x,target.y,25,progress,theme);}return true;
 }
 return false;
}
function paintEliteLinks(){
 for(const source of game.enemies){const target=source.shieldLink?.target;if(!target||!shieldTargetAlive(target))continue;const theme=combatTheme('shield');line(source.x,source.y-22,target.x,target.y-22,3,theme.dark+'a0');line(source.x,source.y-22,target.x,target.y-22,1.3,theme.hot+'b0');ctx.save();ctx.strokeStyle=theme.color+'c0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(target.x,target.y-17,Math.max(22,target.rad+8),35,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 for(const source of game.enemies){const target=source.shieldLink?.target;if(target&&shieldTargetAlive(target))paintAbilityShield(target.x,target.y-25,17,combatTheme('shield'));}
 for(const boss of game.enemies){const guards=boss.guardIds?.filter(g=>game.enemies.includes(g)&&g.hp>0)||[];if(!guards.length)continue;const theme=combatTheme('shield');for(const guard of guards)line(guard.x,guard.y-20,boss.x,boss.y-55,2,theme.color+'90');ctx.save();ctx.strokeStyle=theme.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(boss.x,boss.y-57,65,87,0,0,Math.PI*2);ctx.stroke();ctx.restore();paintAbilityShield(boss.x,boss.y-60,25,theme);encounterLabel('BLUE SHIELD · '+guards.length+' GUARDS',boss.x,boss.y-150,theme.hot,10);}
}
