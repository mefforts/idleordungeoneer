// Test/review hooks are injected only into isolated browser responses.
function delveUpdateFixture(){
 const engineUpdate=update;let live=false;update=dt=>{if(live)engineUpdate(dt);};let owner=null,ward=null,source=null;
 function fresh(zone=0){__dungeonTest.fresh(zone);game.menuPaused=game.manualPaused=false;data.firstWeaponCrafted=true;data.idleNoticeSlots=2;data.firstMasteryTipSeen=data.essenceEnchantTipSeen=true;game.player.invuln=0;game.phase=1;game.phaseTarget=game.phaseSpawned=1e9;game.spawnTimer=game.attackTimer=1e9;owner=ward=source=null;refreshUI();}
 function actor(boss=true,index=0){const e=spawnEnemy(boss,index);Object.assign(e,{x:-140,y:-150,hp:1000,maxHp:1000,speed:45,contact:1e9,castCooldown:1e9,boss,elite:!boss});if(boss)game.boss=e;return e;}
 function state(){return {status:game.status,scene:game.scene,paused:game.menuPaused,hp:game.player.hp,maxHp:game.player.maxHp,clock:game.frame,hold:game.holdSkill,radius:lootPickupRadius(),rates:{delve:selectedTimeRate('delve'),skilling:selectedTimeRate('skilling')},choices:{delve:timeRateChoices('delve'),skilling:timeRateChoices('skilling')},points:masteryFor().points,boons:structuredClone(data.eliteBoons),damage:eliteBoonValue('damage'),attackSpeed:eliteBoonValue('attackSpeed'),movement:enemyMovementFactor(),dashes:game.player.dashSerial||0,ward:ward&&{type:ward.type,point:{...ward.point},left:ward.windup,total:ward.total,resolved:!!ward.resolved,reflected:!!ward.reflected,expired:!!ward.expired},owner:owner&&{x:owner.x,y:owner.y,hp:owner.hp,cast:owner.cast?.type||null,stagger:owner.stagger||0},spire:source&&{hp:source.hp,maxHp:source.maxHp,exists:game.totems.includes(source),shield:enemyShieldMultiplier(source),bumps:summonBumpsLeft(source)}};}
 function reflection(variant='jaw',zone=0,type='reflect'){
  fresh(zone);owner=actor();const choose=reflectVariantFor;reflectVariantFor=()=>variant;owner.phaseQueue=[type];try{if(!beginBossCast(owner))throw Error('Reflect did not start');}finally{reflectVariantFor=choose;}ward=owner.cast;game.boss=owner;refreshUI();render();return state();
 }
 function footAt(x,y){game.player.x=x;game.player.y=y-13;}
 function shielded(royal=true){fresh(1);owner=actor(true,2);source=createSummonTotem(owner,{x:120,y:60},royal);source.spawnClock=1000;const caster=actor(false,1);caster.x=90;caster.y=-70;caster.phaseQueue=['shield'];if(!beginBossCast(caster))throw Error('Shield did not start');const c=caster.cast;caster.cast=null;resolveBossCast(caster,c);game.player.invuln=0;return {caster,target:c.shieldTarget};}
 window.__delveUpdate={fresh,state,reflection,
  tick(seconds){game.lastJobsAt=Date.now();engineUpdate(seconds);refreshUI();render();return state();},
  play(){live=true;},freeze(){live=false;},
  rate(kind,value){const result=setTimeRate(kind,value);refreshUI();return {result,...state()};},
  purchaseSlow(){data.timeRates.delve=.5;masteryFor().points=1;masteryFor().earned=1;buyTimeUpgrade('delve');return state();},
  layout(){data.hudLayout={side:'left',order:['codex','gear','speed','delve','skills','shop','pause','settings']};normalizeArenaData();applyHudLayout();return structuredClone(data.hudLayout);},
  save(){save();},
  death(){fresh();data.lastSkill='forge';data.ore=8;game.player.hp=0;data.eliteBoons=[{id:'fervor',remaining:20,dungeon:dungeonForZone().id,uid:1}];die();return state();},
  stock(){return {ore:data.ore,bars:data.bars};},
  offer(id){const drop={id:++data.eliteSpoilsSequence,zone:zoneNumber(),x:game.player.x,y:game.player.y,choices:[id,...Object.keys(ELITE_BOONS).filter(k=>k!==id).slice(0,2)]};data.eliteSpoils.push(drop);openEliteReward(drop.id);return state();},
  ageBlessings(seconds){tickEliteBoon(seconds);refreshUI();return state();},
  choose(id){return chooseEliteBoon(id);},
  blessingMatrix(){const rows=[];for(const id of Object.keys(ELITE_BOONS)){fresh();this.offer(id);chooseEliteBoon(id);tickEliteBoon(7);this.offer(id);chooseEliteBoon(id);const before=state(),text=blessingStackEffect(id,2);normalizeRareEliteProgression();const restored=state();tickEliteBoon(ELITE_BOONS[id].seconds-7+.01);rows.push({id,text,before,restored,after:state()});}return rows;},
  stepWard(from,to,seconds=.02){footAt(to.x,to.y);tickBossSpecial(owner,seconds,from);refreshUI();render();return state();},
  inside(){const p=ward.point;return this.stepWard({x:p.x+p.r+40,y:p.y},{x:p.x,y:p.y},.09);},
  expiry(){footAt(ward.point.x+500,ward.point.y+100);tickBossSpecial(owner,ward.total+.01);refreshUI();return state();},
  moving(){const before={x:owner.x,y:owner.y};tickCombat(.1);return {before,...state()};},
  late(){ward.windup=.04;const p=ward.point;return this.stepWard({x:p.x+100,y:p.y},{x:p.x,y:p.y},.09);},
  overlap(){const p=ward.point;footAt(p.x,p.y);ward.point.armed=false;ward.point.requireExit=true;ward.point.variant='rebound';tickBossSpecial(owner,.1);const first=state();this.stepWard({x:p.x,y:p.y},{x:p.x+60,y:p.y},.1);const armed=state();this.stepWard({x:p.x+60,y:p.y},{x:p.x,y:p.y},.1);return {first,armed,after:state()};},
  path(gap=true){const p=ward.point,a=p.gapAngle+(gap?0:Math.PI),from={x:p.x+Math.cos(a)*(p.r+30),y:p.y+Math.sin(a)*(p.r+30)},to={x:p.x,y:p.y};return this.stepWard(from,to,.09);},
  pauseWard(kind){if(kind==='menu')openDrawer('gear');if(kind==='skill')setScene('mine',false);if(kind==='pause')game.menuPaused=game.manualPaused=true;return this.tick(2);},
  killOwner(){onKill(owner);return state();},
  rules(){return {wards:REFLECT_WARDS,bumps:SUMMON_BUMPS};},
  shielded(){const {caster,target}=shielded();const chosen=target===source,hp=source.hp;damageTotem(source,10);const weaponDamage=hp-source.hp;tickEliteLinks(.1);return {chosen,weaponDamage,linked:caster.shieldLink?.target===source,...state()};},
  shieldDash(royal=true,latched=false){shielded(royal);source.bumpContact=latched;source.spawnPoint={x:170,y:60};source.spawnWarn=1.3;const f=encounterFoot(source);game.player.dashSerial=(game.player.dashSerial||0)+1;footAt(f.x+70,f.y);const result=bumpSummonTotem(source,{x:f.x-70,y:f.y},true),first=state(),again=bumpSummonTotem(source,{x:f.x-70,y:f.y},true);return {result,first,again,after:state()};},
  actualDash(){shielded(true);source.bumpContact=true;source.spawnClock=1000;const f=encounterFoot(source),p=game.player;footAt(f.x-35,f.y);p.vx=1;p.vy=0;p.dashCooldown=0;dash();const serial=p.dashSerial;dash();for(let i=0;i<11;i++)tickCombat(.02);return {serial,after:state()};},
  dashAngles(){const rows=[];for(const latched of [false,true])for(const royal of [false,true])for(let i=0;i<24;i++){shielded(royal);const p=encounterFoot(source),a=i*Math.PI/12;source.bumpContact=latched;game.player.dashSerial=(game.player.dashSerial||0)+1;footAt(p.x+Math.cos(a)*90,p.y+Math.sin(a)*90);const from={x:p.x-Math.cos(a)*90,y:p.y-Math.sin(a)*90},before=source.hp,hit=bumpSummonTotem(source,from,true),damage=before-source.hp,again=bumpSummonTotem(source,from,true);rows.push({latched,royal,a,hit,damage,expected:summonBumpDamage(source),again});}return rows;},
  dashGrazes(){const rows=[];for(const y of [-50,-38,-28,0,28,38]){shielded();const p=encounterFoot(source);footAt(p.x+100,p.y+y);game.player.dashSerial=(game.player.dashSerial||0)+1;rows.push({y,hit:bumpSummonTotem(source,{x:p.x-100,y:p.y+y},true)});}return rows;},
  breakShieldTarget(){const {caster}=shielded();damageTotem(source,1e9,true);return {linked:!!caster.shieldLink,...state()};},
  shieldSourceDeath(){const {caster}=shielded();onKill(caster);return state();},
  stars(zone=1){fresh(zone);owner=actor();const plan=bossPlan(owner);owner.phaseQueue=['bloom'];beginBossCast(owner);const c=owner.cast;owner.cast=null;resolveBossCast(owner,c);tickBossBursts(.01);const shot=game.hostileShots[0],first={radius:shot.rad,growing:shot.growing,boomerang:shot.boomerang};for(let i=0;i<130;i++)advanceExpandedShot(shot,.02);const grown={radius:shot.rad,returning:!!shot.returning};owner.x+=40;advanceExpandedShot(shot,.05);const aim=(shot.vx*(owner.x-shot.x)+shot.vy*(owner.y-shot.y))>0;return {first,grown,aim,plan,hint:c.hint,shots:game.hostileShots.length};},
  damageScale(zone=0){fresh(zone);game.player.invuln=0;const before=game.player.hp;hurt(20);return {lost:before-game.player.hp,scale:incomingDamageScale()};},
  touchWard(){reflection('rune');owner.speed=0;ward.point.x=game.player.x+85;ward.point.y=encounterFoot(game.player).y;ward.point.armed=true;return state();},
  visualWard(variant='jaw',zone=0){reflection(variant,zone);const point=ward.point;point.x=game.camX-35;point.y=game.camY+60;if(variant==='jaw'){point.gapAngle=Math.PI*.65;point.r=96;}owner.x=90;owner.y=-55;game.player.x=-110;game.player.y=170;ward.windup=ward.total*.55;data.combatLanguageTipSeen=true;data.ownedArmor=['ranged_1'];data.equippedArmor='ranged_1';projectCombatStyle();game.enemies=[owner];$('toastStack').replaceChildren();refreshUI();render();},
  visualShield(){shielded(true);game.player.x=-30;game.player.y=110;source.spawnPoint={x:175,y:140};source.spawnWarn=.9;game.boss=owner;game.camX=40;game.camY=25;$('toastStack').replaceChildren();refreshUI();render();},
  visualStars(){this.stars();owner.x=0;owner.y=-70;game.player.x=40;game.player.y=185;for(const s of game.hostileShots)advanceExpandedShot(s,.7);game.camX=game.camY=0;refreshUI();render();}
 };
}
module.exports={delveUpdateFixture};
