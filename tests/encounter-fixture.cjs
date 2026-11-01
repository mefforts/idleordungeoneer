// This fixture is injected into browser responses only, never the shipped game.
function encounterFixture(){
 function fresh(kind=0,stage=1){
  closeDrawer();hideOverlay();data=defaults();data.floor=kind*3+stage;data.cleared=data.floor-1;
  data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=data.skillsNudgeSeen=true;data.zone2SkillsAnnounced=true;
  normalizeProgression();normalizeZone();resetRun();game.scene='combat';game.status='running';game.menuPaused=true;game.manualPaused=false;game.keys={};game.mouseMove.active=false;game.joystick.pointer=null;
  game.phase=1;game.phaseTarget=40;game.attackTimer=1e6;game.transition=0;game.devSpeed=game.skillSpeed=1;game.holdSkill=null;game.lastJobsAt=Date.now();game.activeClockMs=0;
  game.player.hp=game.player.maxHp=1000;game.player.y=35;game.camX=game.camY=0;
  setScene('combat',false);game.menuPaused=true;$('toastStack').replaceChildren();refreshUI();
 }
 function owner(index=0,elite=false){
  const e=spawnEnemy(true,index);e.boss=!elite;e.elite=elite;e.name=biome().boss[index]+(elite?' Echo':'');e.x=0;e.y=-150;e.hp=e.maxHp=1000;e.speed=0;e.contact=1e6;e.castCooldown=1e6;
  if(!elite)game.boss=e;return e;
 }
 function cast(e,type){e.mechanicIndex=bossPlan(e).indexOf(type);if(e.mechanicIndex<0)throw Error('Unavailable pattern: '+type);if(!beginBossCast(e))throw Error('Cast deferred: '+type);return e.cast;}
 function intercept(t){const a=encounterFoot(t),b=encounterFoot(t.owner);game.player.x=(a.x+b.x)/2;game.player.y=(a.y+b.y)/2-13;}
 function node(type='mend',kind=0){fresh(kind,3);const e=owner(2);const c=cast(e,type);tickBossSpecial(e,c.total+.01);return game.totems[0];}
 window.__encounterTest={
  fresh,owner,cast,intercept,node,
  reflect(position,lethal=false){
   fresh();const e=owner(0),c=cast(e,'reflect'),p=game.player;
   if(lethal)e.hp=80;
   p.x=c.point.x+(position==='ring'?(c.point.r+c.point.inner)/2:position==='outside'?c.point.r+30:0);p.y=c.point.y-13;
   const before={hp:p.hp,enemy:e.hp,kills:game.runKills,points:masteryFor().points};
   tickBossSpecial(e,c.total-.05);const during={hp:p.hp,enemy:e.hp};tickBossSpecial(e,.06);
   const after={hp:p.hp,enemy:e.hp,stagger:e.stagger,kills:game.runKills,points:masteryFor().points,alive:game.enemies.includes(e),burn:e.burn||0};
   resolveBossCast(e,c);return {before,during,after,repeated:e.hp,point:c.point};
  },
  streams(type){
   const t=node(type),e=t.owner,p=game.player;e.hp=500;p.hp=500;p.x=500;p.y=500;
   const base=bossAttackDamage(e);tickEncounterObjects(1);const unblocked={hp:e.hp,player:p.hp,damage:bossAttackDamage(e),rally:p.rallyTime};
   intercept(t);tickEncounterObjects(1);const blocked={hp:e.hp,player:p.hp,damage:bossAttackDamage(e),rally:p.rallyTime,blocked:t.blocked};
   p.x=500;p.y=500;tickEncounterObjects(1);const resumed={hp:e.hp,player:p.hp,damage:bossAttackDamage(e)};
   onKill(e);tickEncounterObjects(5.01);
   return {base,unblocked,blocked,resumed,expired:{rally:p.rallyTime,nodes:game.totems.length,damage:bossAttackDamage(e)},kills:game.runKills};
  },
  healingEdges(){
   const t=node(),p=game.player;intercept(t);p.hp=999;tickEncounterObjects(1);
   const capped=p.hp;const t2={...t};game.totems=[t2,{...t2}];p.hp=500;tickEncounterObjects(.5);
   const double=p.hp;game.totems=[{...t2}];p.hp=500;tickEncounterObjects(1);return {capped,double,single:p.hp};
  },
  hitTotem(weapon){
   const t=node('fury'),e=t.owner,p=game.player;data.weaponType=weapon;data.arrows=data.runes=100;data.unlockedWeapons=Object.keys(WEAPON_TYPES);projectCombatStyle();
   e.x=t.x+60;e.y=t.y;e.hp=e.maxHp=1000;p.x=t.x+30;p.y=t.y;p.aimTarget=t;tickEncounterObjects(.02);
   const before={kills:game.runKills,gold:data.gold,xp:data.dungeoneeringXp,seals:zoneShopFor().currency,points:masteryFor().points},enemyBefore=e.hp;
   updateCombatAim();const attacked=attack();for(let i=0;i<100&&e.hp===enemyBefore;i++)tickCombat(.02);const direct=damageTotem(t,1e9);
   return {attacked,remaining:game.totems.length,targetable:combatTargets().includes(t),direct,enemy:e.hp,enemyBefore,phase:game.phase,before,after:{kills:game.runKills,gold:data.gold,xp:data.dungeoneeringXp,seals:zoneShopFor().currency,points:masteryFor().points}};
  },
  rally(weapon){
   fresh();const e=owner(0),p=game.player;data.weaponType=weapon;data.arrows=data.runes=100;projectCombatStyle();p.rallyTime=5;p.x=e.x-35;p.y=e.y;e.hp=e.maxHp=100000;
   const base=attackDamage(),profile=zoneCombatProfile().damage,random=Math.random;Math.random=()=>.99;
   try{attack();return {base,profile,damage:isRanged()?game.shots[0].damage:100000-e.hp};}finally{Math.random=random;}
  },
  elites(stage,known=[true,true,true]){
   fresh(0,stage);game.phase=0;game.phaseTarget=100;data.seenElites[0]=known;prepareEliteWave();const spawned=[];
   for(let count=0;count<100;count++){game.phaseSpawned=count;const e=spawnEnemy();if(e.elite)spawned.push(e);}
   const before={kills:game.runKills,points:masteryFor().points,essence:data.essence};if(spawned.length)onKill(spawned[0]);
   game.phaseSpawned=100;const extra=spawnEnemy();return {quota:eliteQuota(),count:spawned.length,types:spawned.map(e=>e.bossIndex),extra:!!extra.elite,active:game.enemies.filter(e=>e.elite).length,before,after:{kills:game.runKills,points:masteryFor().points,essence:data.essence}};
  },
  scheduling(){
   fresh(0,3);const a=owner(2,true),b=owner(2,true),c=owner(2,true);a.x=-80;b.x=80;c.y=-230;
   const ca=cast(a,'beam'),cb=cast(b,'beam');c.mechanicIndex=0;const third=beginBossCast(c);c.mechanicIndex=2;const counterWait=beginBossCast(c),reserved=game.counterRequest===c;
   a.cast=b.cast=null;a.mechanicIndex=0;const offenseWait=beginBossCast(a);game.hazards=[{life:1}];const hazardWait=beginBossCast(c);game.hazards=[];
   const reflection=beginBossCast(c),point=c.cast?.point;const noOverlap=beginBossCast(a),absorbed=reflectAbsorbsShot(point),notAbsorbed=reflectAbsorbsShot({x:point.x+80,y:point.y});
   return {third,counterWait,reserved,offenseWait,hazardWait,reflection,noOverlap,absorbed,notAbsorbed,active:game.enemies.filter(e=>e.cast).length};
  },
  nodeBudget(){
   const t=node('mend'),a=owner(1,true),b=owner(1,true);a.x=-90;b.x=90;a.mechanicIndex=b.mechanicIndex=1;
   const first=beginBossCast(a),second=beginBossCast(b),secondType=b.cast?.type;tickBossSpecial(a,1.5);tickBossSpecial(b,1.5);const count=game.totems.length;
   tickEncounterObjects(60);const remaining=game.totems.length,targets=combatTargets().filter(e=>e.totem).length;damageTotem(game.totems[0],1e9);const afterDamage=game.totems.length;onKill(game.totems.find(node=>node.owner.elite).owner);return {first,second,secondType,count,remaining,targets,afterDamage,afterCasterDeath:game.totems.length};
  },
  dual(){fresh(0,3);const e=owner(2);const a=cast(e,'fury');tickBossSpecial(e,a.total+.01);const b=cast(e,'mend');tickBossSpecial(e,b.total+.01);const types=game.totems.map(t=>t.type);e.mechanicIndex=bossPlan(e).indexOf('fury');const next=beginBossCast(e);return {types,next,attack:e.cast?.type,count:game.totems.length};},
  assets(){return {count:Object.keys(ENCOUNTER_ART).length,unique:new Set(Object.values(ENCOUNTER_ART).map(a=>a.src)).size,loaded:[...encounterImages.values()].every(image=>image.complete&&image.naturalWidth>200&&image.naturalHeight>300)};},
  cleanup(which){
   const t=node('fury');game.player.rallyTime=5;game.counterRequest=t.owner;
   if(which==='owner')onKill(t.owner);else if(which==='reset')resetRun();else if(which==='phase')finishPhase();else if(which==='death')die();else nextPhase();
   return {nodes:game.totems.length,rally:game.player.rallyTime,request:!!game.counterRequest,casts:game.enemies.filter(e=>e.cast).length};
  },
  timing(speed,context='combat'){
   const t=node('mend');game.player.x=500;game.player.y=500;game.player.invuln=1e8;t.owner.castCooldown=1e6;game.devSpeed=speed;game.skillSpeed=1;game.menuPaused=context==='pause';game.scene=context==='skill'?'mine':'combat';
   for(let i=0;i<10;i++)update(.02);game.menuPaused=true;return {age:t.age,exists:game.totems.includes(t),combat:game.runSeconds,skill:game.activeClockMs};
  },
  placement(kind,stage,offset=0,side='right',type='reflect',gap=150){fresh(kind,stage);data.hudLayout.side=side;applyHudLayout();game.player.x=game.camX=offset;game.player.y=game.camY=offset;const e=owner(type==='reflect'?0:2);e.x=offset;e.y=offset-gap;const c=cast(e,type),foot=encounterFoot(e),p=encounterFoot(game.player);return {point:c.point,distance:Math.hypot(c.point.x-foot.x,c.point.y-foot.y),travel:Math.hypot(c.point.x-p.x,c.point.y-p.y),clear:encounterClear(c.point.x,c.point.y,type==='reflect'?36:25),camX:game.camX,camY:game.camY,w:game.viewWidth,h:game.viewHeight};},
  async ready(){await Promise.all(Object.keys(ENCOUNTER_ART).map(k=>encounterImage(['overgrowth','embervault','crypt','rift'].indexOf(k.split('-')[0]),k.split('-')[1]).decode()));},
  show(kind,type='reflect',multi=false){
   fresh(kind,multi?3:1);data.idleNoticeSlots=2;data.idleFirstAssigned=true;game.frame=3;game.player.hp=game.player.maxHp=138;game.player.hp=102;
   if(multi){
    const points=[[-110,-110],[110,-90],[90,165]];
    game.phase=4;game.phaseTarget=zoneBalance().targets[4];
    for(let i=0;i<3;i++){const e=owner(i,true);[e.x,e.y]=points[i];}
    cast(game.enemies[0],'reflect');
    const e=game.enemies[1],point=encounterPoint(e,'mend');if(point)game.totems.push({totem:true,type:'mend',biome:kind,owner:e,x:point.x,y:point.y-18,rad:16,age:2,blocked:false});game.boss=null;
   }else{
    const e=owner(type==='mend'?2:0);e.x=-65;e.y=-140;e.hp=740;
    const c=cast(e,type);
    if(type==='reflect'){c.windup=c.total*.55;game.player.x=c.point.x;game.player.y=c.point.y-13;}
    else{tickBossSpecial(e,c.total+.01);const t=game.totems[0];intercept(t);tickEncounterObjects(.05);}
   }
   refreshUI();render();
  }
 };
}
module.exports={encounterFixture};
