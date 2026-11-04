// Isolated synthetic encounters; never embedded in the delivered HTML.
function themedEncounterFixture(){
 let clearTerrain=false,baseScenery=worldScenery;
 function fresh(type,terrain=false){
  const def=THEMED_MECHANICS[type];__encounterTest.fresh(Math.max(0,def.biome),3);clearTerrain=!terrain;worldScenery=clearTerrain?()=>[]:baseScenery;
  const p=game.player;p.hp=p.maxHp=1000;p.invuln=0;data.equippedArmor='';data.equippedRings=[];data.equippedAmulet='';game.attackTimer=1e9;game.phaseTarget=999;game.themedEvents=[];
  const owner=__encounterTest.owner(2);owner.hp=owner.maxHp=1e6;owner.speed=0;owner.contact=owner.castCooldown=1e9;
  const partner=spawnEnemy();Object.assign(partner,{x:110,y:20,speed:0,hp:1000,maxHp:1000,contact:1e9,castCooldown:1e9});
  owner.phaseQueue=[type];const started=beginBossCast(owner);if(!started)return {started:false,owner,partner,p};const cast=owner.cast;owner.cast=null;resolveBossCast(owner,cast);return {started,owner,partner,p,cast,event:game.themedEvents[0]};
 }
 function at(p){game.player.x=p.x;game.player.y=p.y;game.player.invuln=0;}
 function run(seconds,controller){const dt=.02;for(let elapsed=0;elapsed<seconds-1e-8&&game.status==='running';elapsed+=dt){controller?.(elapsed);tickCombat(Math.min(dt,seconds-elapsed));}}
 function waitTo(e,seconds){at({x:5000,y:5000});run(Math.max(0,seconds-e.age));game.player.hp=1000;game.player.invuln=0;}
 function fieldPoint(f,gap=false){
  if(f.shape==='circle')return {x:f.x,y:f.y};
  if(f.shape==='segment')return {x:(f.a.x+f.b.x)/2,y:(f.a.y+f.b.y)/2};
  if(f.shape==='gate')return f.horizontal?{x:gap?f.gap:f.arena.left+12,y:f.at}:{x:f.at,y:gap?f.gap:f.arena.top+12};
  if(f.shape==='rect')return {x:(f.rect.left+f.rect.right)/2,y:(f.rect.top+f.rect.bottom)/2};
  if(f.shape==='triangle')return {x:f.points.reduce((n,p)=>n+p.x,0)/3,y:f.points.reduce((n,p)=>n+p.y,0)/3};
  if(f.shape==='arc'){const a=f.gap+(gap?0:Math.PI);return {x:f.x+Math.cos(a)*f.r,y:f.y+Math.sin(a)*f.r};}
  if(f.shape==='flood'){if(gap)return f.refuges[0];for(let y=f.arena.top+10;y<f.arena.bottom;y+=20)for(let x=f.arena.left+10;x<f.arena.right;x+=20)if(themedContains({x,y},f))return {x,y};}
  throw Error('No test point: '+f.shape);
 }
 window.__themedTest={
  catalog(){return Object.values(THEMED_MECHANICS);},
  async ready(){await Promise.allSettled([...themedEffectImages.values(),...DeepwellAvatar.images()].map(i=>i.decode()));},
  planners(){
   const seen=new Set(),rows=[];worldScenery=()=>[];
   for(let kind=0;kind<4;kind++)for(let stage=1;stage<=zoneFloorCount(kind);stage++){__encounterTest.fresh(kind,1);data.floor=floorAtZone(kind,stage);data.cleared=data.floor-1;const partner=spawnEnemy();partner.x=100;partner.y=0;for(let family=0;family<3;family++){const e={biome:kind,bossIndex:family,boss:true,visualType:0,x:0,y:-150},plan=bossPlan(e);for(const id of plan)if(themedAbility(id)){const d=themedAbility(id);if(d.biome>=0&&d.biome!==kind)throw Error('Wrong theme: '+id);seen.add(id);}rows.push({kind,stage,family,plan});}}
   return {seen:[...seen],rows};
  },
  impact(type){
   const z=fresh(type),e=z.event;if(!z.started)return {started:false};const times={burrowingBriar:.1,rootGates:.1,walkingHedge:1,seedChain:.1,fallingCanopy:.1,forgeHammers:.1,furnaceVents:.2,coolingIslands:.1,moltenDroplets:.5,slagAnchors:.1,backdraft:.1,boneLoom:2.3,coffinPress:3.1,hauntedFootsteps:1,graveClock:.7,ribcageRise:.4,gravityWell:2.8,constellationCage:.3,riftScissors:3.6,prismRelay:.2,cometLadder:.2,sporeFan:2.4};
   waitTo(e,times[type]??.6);const f=themedFields(e).find(f=>e.age>=f.start&&e.age<=f.end);if(!f)return {started:true,missingField:true};const point=fieldPoint(f);at(point);const before=game.player.hp;run(f.dot?.85:.12);return {started:true,before,after:game.player.hp,point,field:f.shape,dot:!!f.dot,kind:e.kind};
  },
  projectile(type){const z=fresh(type),e=z.event;waitTo(e,type==='stargateVolley'?1.05:type==='orbitTransfer'?1.8:.6);const q=themedProjectileShapes(e)[0];if(!q)return {missing:true};at(q);const before=game.player.hp;run(.04);return {before,after:game.player.hp,point:q};},
  gap(type){const z=fresh(type),e=z.event;waitTo(e,type==='boneLoom'?2.3:type==='ribcageRise'?.4:.1);const f=themedFields(e)[0],point=fieldPoint(f,true);at(point);const before=game.player.hp;run(.08);return {before,after:game.player.hp,point};},
  burrowLock(){const {owner,cast}=fresh('burrowingBriar');game.themedEvents=[];owner.cast=cast;cast.windup=1.7;at({x:80,y:65});tickBossSpecial(owner,.1);const tracking={...cast.themed.target};cast.windup=.5;at({x:-80,y:90});tickBossSpecial(owner,.1);return {tracking,locked:cast.themed.target};},
  hedgeMotion(){const {event:e}=fresh('walkingHedge');return [.1,2,4].map(age=>themedFields(e,age)[0].at);},
  seedOrder(){const {event:e}=fresh('seedChain');return themedFields(e).map(f=>({start:f.start,end:f.end,reveal:f.reveal}));},
  shakeSeeds(shake){const {event:e,p}=fresh('clingingSeeds');run(1.1);const attached=e.state.attachedAt!==null,afterHit=p.hp;if(shake){p.vx=1;p.vy=0;dash();}run(4);return {attached,afterHit,after:p.hp,remaining:game.themedEvents.length,solved:e.solved||false};},
  seedDashFinal(){const {event:e,p}=fresh('clingingSeeds');e.age=.83;at({x:e.target.x-8,y:e.target.y});p.vx=1;p.vy=0;dash();p.dashTime=.01;run(.02);return {hp:p.hp,done:e.done,solved:e.solved};},
  swap(){const {owner,event:e}=fresh('graftedSwap'),before={x:owner.x,y:owner.y},destination={...e.points[0]};at({x:5000,y:5000});run(.8);return {before,destination,after:{x:owner.x,y:owner.y},swapped:e.state.swapped};},
  wind(){const {event:e,p}=fresh('pollenTide');at({x:e.target.x+30,y:e.target.y});const before={x:p.x,y:p.y};run(.1);return {before,after:{x:p.x,y:p.y}};},
  boulder(){const {event:e}=fresh('rollingFurnace');const first=themedBoulder(e,0),before=themedBoulder(e,first.bounce-.02),after=themedBoulder(e,first.bounce+.02);return {first,before,after};},
  anchors(){const {event:e,p}=fresh('slagAnchors'),q=e.points[0];at({x:q.x+65,y:q.y});p.vx=-1;p.vy=0;dash();const before=p.hp;run(.2);return {before,after:p.hp,broken:!!e.state.anchor0,remaining:themedFields(e).length};},
  counter(type,solve=true){const {event:e,owner,p,partner}=fresh(type),before=owner.hp;if(solve){at(e.points[0]);if(type==='emberCatch'){partner.x=e.points[0].x+55;partner.y=e.points[0].y;}run(.04);}else{at({x:5000,y:5000});run(type==='collapsingNova'?2.7:e.total+.1);}return {before,after:owner.hp,player:p.hp,partner:partner.hp,solved:!!e.solved,done:!!e.done,events:game.themedEvents.length};},
  sigils(){const {event:e,owner}=fresh('returningSigil'),before=owner.hp;at(e.points[0]);run(.04);const first=owner.hp,stage=e.state.stage;at(e.points[1]);run(.8);return {before,first,after:owner.hp,stage,done:e.done,solved:e.solved};},
  nova(){const {event:e,p}=fresh('collapsingNova');at({x:5000,y:5000});run(6.1);const wave=game.hazards.find(h=>h.wave),before=p.hp;if(wave){at({x:wave.x+wave.r,y:wave.y});run(.04);}return {launched:!!wave,delay:e.age,before,after:p.hp,missed:e.state.missed};},
  lantern(mode){const {event:e,owner,p}=fresh('soulLantern'),q=e.points[0];owner.hp=500000;if(mode==='dash'){at({x:q.x+65,y:q.y});p.vx=-1;p.vy=0;dash();run(.2);}else if(mode==='intercept'){p.hp=500;at(q);run(1.2);}else{at({x:5000,y:5000});run(2.2);}return {owner:owner.hp,player:p.hp,done:!!e.done,solved:!!e.solved};},
  clock(){const {event:e}=fresh('graveClock');return [1.3,1.7,2.1,2.5,3.2].map(age=>{const f=themedFields(e,age)[0];return Math.atan2(f.b.y-f.a.y,f.b.x-f.a.x);});},
  clockGap(){const {event:e,p}=fresh('graveClock');waitTo(e,.7);const f=themedFields(e)[0],angle=Math.atan2(f.b.y-f.a.y,f.b.x-f.a.x);at({x:e.target.x+Math.cos(angle)*110,y:e.target.y+Math.sin(angle)*110});const before=p.hp;run(.2);return {before,after:p.hp};},
  gravity(escape){const {event:e,p}=fresh('gravityWell');at({x:e.target.x+115,y:e.target.y});const start=p.x;run(.8);const pulled=p.x;if(escape){game.joystick.pointer=-1;game.joystick.x=1;game.joystick.y=0;}run(2.5);game.joystick.pointer=null;return {start,pulled,after:p.hp};},
  orbit(){const {event:e,partner}=fresh('orbitTransfer');return {early:themedOrbit(e,.4),middle:themedOrbit(e,1.9),late:themedOrbit(e,3),bridgeA:themedOrbit(e,1.5),bridgeB:themedOrbit(e,2.3),joins:[1.5,2.3].map(age=>{const a=themedOrbit(e,age-.005),b=themedOrbit(e,age+.005);return Math.hypot(a.x-b.x,a.y-b.y);}),partner:{x:partner.x,y:partner.y},owner:{x:e.owner.x,y:e.owner.y}};},
  portalGap(){const {event:e,p}=fresh('stargateVolley');waitTo(e,.76);const a=themedPortalShot(e,.78),b=themedPortalShot(e,.82);at({x:(a.x+b.x)/2,y:(a.y+b.y)/2});const before=p.hp;run(.1);return {before,after:p.hp,a,b};},
  bulwark(){const {event:e,owner}=fresh('turningBulwark'),a=e.angle,front={x:owner.x+Math.cos(a)*90,y:owner.y+Math.sin(a)*90},back={x:owner.x-Math.cos(a)*90,y:owner.y-Math.sin(a)*90},original=Math.random;Math.random=()=>.99;try{let hp=owner.hp;dealDamage(owner,100,front.x,front.y);const first=hp-owner.hp;hp=owner.hp;dealDamage(owner,100,back.x,back.y);return {front:first,back:hp-owner.hp};}finally{Math.random=original;}},
  rally(){const {event:e,owner,partner,p}=fresh('rallyThread'),before=bossAttackDamage(owner,'volley'),dx=partner.x-owner.x,dy=partner.y-owner.y,d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d,mid={x:(partner.x+owner.x)/2,y:(partner.y+owner.y)/2};at({x:mid.x+nx*60,y:mid.y+ny*60});p.vx=-nx;p.vy=-ny;dash();run(.2);return {before,after:bossAttackDamage(owner,'volley'),done:e.done,solved:e.solved};},
  paused(type){const {event:e}=fresh(type),snapshot=()=>JSON.stringify({age:e.age,state:e.state,points:e.points,owner:{x:e.owner.x,y:e.owner.y}}),before=snapshot();game.menuPaused=true;update(.6);const after=snapshot();clearOwnerMechanics(e.owner);const ownerCount=game.themedEvents.length;fresh(type);resetRun();return {before,after,ownerCount,resetCount:game.themedEvents.length};},
  visuals(type,reduced=false,active=true){
   const z=fresh(type);data.reducedMotion=reduced;game.player.invuln=1e9;if(!active){game.themedEvents=[];z.owner.cast=z.cast;}else z.event.age=['forgeHammers','moltenDroplets'].includes(type)?.4:type==='riftScissors'?2.5:type==='graveClock'?1.2:.8;
   const labels=[],fill=ctx.fillText;ctx.fillText=function(text,...args){labels.push(String(text));return fill.call(this,text,...args);};try{refreshUI();render();}finally{ctx.fillText=fill;}
   return {labels,assets:[...themedEffectImages.values()].filter(i=>i.complete&&i.naturalWidth>0).length};
  },
  visualState(type,age=.8){const z=fresh(type);game.player.hp=game.player.maxHp=180;game.player.invuln=1e9;z.event.age=age;game.menuPaused=true;$('toastStack').replaceChildren();refreshUI();render();return {event:z.event,cast:z.cast};},
  animate(dt){game.player.invuln=1e9;tickCombat(dt);refreshUI();render();},
  leash(solve=true){const {event:e,p}=fresh('briarLeash'),end={x:e.arena.left+(e.arena.right-e.arena.left)*.8,y:e.target.y+70},start=e.owner,dx=end.x-start.x,dy=end.y-start.y,d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d,m={x:(start.x+end.x)/2,y:(start.y+end.y)/2};if(solve){at({x:m.x+nx*60,y:m.y+ny*60});p.vx=-nx;p.vy=-ny;dash();run(.2);}else{at({x:5000,y:5000});run(e.total+.1);}return {solved:!!e.solved,hp:p.hp,done:e.done};},
  deadline(type,late=false){const {event:e,owner,p}=fresh(type),q=e.points[0],end=type==='collapsingNova'?2.5:type==='returningSigil'?3.6:e.total;e.age=end-.02;p.x=q.x+100;p.y=q.y;const from={x:p.x,y:p.y};p.x=q.x+(late?0:-300);tickThemedMechanics(.08,from,false);return {solved:!!e.solved,owner:owner.hp,hp:p.hp};},
  cleanupEvent(type,mode){const {owner,partner}=fresh(type);if(mode==='death')die();else if(mode==='phase')finishPhase();else if(mode==='next')nextPhase();else if(mode==='partner')clearOwnerMechanics(partner);else onKill(owner);return {remaining:game.themedEvents.length,status:game.status};},
  terrain(type,side='right',offset=0){const z=fresh(type,true);game.themedEvents=[];z.owner.cast=null;data.hudLayout.side=side;game.camX=game.camY=offset;at({x:offset,y:offset+35});z.owner.x=offset;z.owner.y=offset-150;z.partner.x=offset+110;z.partner.y=offset+20;z.owner.phaseQueue=[type];const started=beginBossCast(z.owner);if(!started)return {started};const c=z.owner.cast,e=c.themed,benefit=['coolingIslands','borrowedBreath','returningSigil','emberCatch','collapsingNova'].includes(type);return {started,clear:e.points.every(q=>encounterClear(q.x,q.y,type==='coolingIslands'?43:24)),onScreen:e.points.every(q=>insideRect(q,e.arena,-18)),separated:!benefit||e.points.every(q=>game.enemies.every(enemy=>Math.hypot(enemy.x-q.x,enemy.y-q.y)>enemy.rad+40)),gates:type!=='rootGates'||themedFields(e).every(f=>[-34,0,34].every(d=>encounterClear(f.gap,f.at+d,18))),warning:c.total};},
  cleanup(){worldScenery=baseScenery;}
 };
}
module.exports={themedEncounterFixture};
