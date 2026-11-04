// Isolated combat and guidance states; never included in the delivered game.
function engagementFixture(){
 const scenery=worldScenery;
 function fresh(zone=0){__encounterTest.fresh(zone,1);worldScenery=()=>[];game.enemies=[];game.boss=null;game.phase=0;game.phaseTarget=zoneBalance().targets[0];game.phaseSpawned=10;game.attackTimer=game.spawnTimer=1e9;game.transition=0;game.player.hp=game.player.maxHp=1000;game.player.invuln=game.player.hitInvuln=game.player.dashGuard=game.player.dashTime=game.player.dashCooldown=0;game.player.x=0;game.player.y=90;data.equippedArmor='';data.equippedRings=[];data.equippedAmulet='';data.idleNoticeSlots=2;return game.player;}
 function enemy(x=0,y=-150){const e=spawnEnemy();Object.assign(e,{elite:true,bossElite:true,bossIndex:0,uncommon:false,champion:false,x,y,hp:10000,maxHp:10000,speed:0,contact:1e9,castCooldown:1e9,phaseQueue:[]});return e;}
 function run(seconds){for(let t=0;t<seconds-1e-8&&game.status==='running';t+=.02){game.attackTimer=game.spawnTimer=1e9;for(const e of game.enemies)e.castCooldown=1e9;tickCombat(Math.min(.02,seconds-t));}}
 function channel(kind='siege',variant='volley'){fresh();const e=enemy(-70,-60);e.speed=75;e.bossIndex=variant==='marks'?1:0;initializeEliteBehavior(e);e.eliteBehavior.nextTaskAt=Infinity;if(!startEliteTask(e,kind))throw Error('Channel placement failed');Object.assign(e,e.eliteTask.point);e.eliteTask.phase='channel';game.player.invuln=1e9;return e;}
 window.__engagement={
  ready:()=>__themedTest.ready(),
  overlap(mode='distinct',zone=0,health=1000){const p=fresh(zone),a=enemy(),b=enemy(200,-150);p.hp=p.maxHp=health;const attack={};if(mode==='shield')data.weaponType='shield';if(mode==='dash'){p.vx=1;p.vy=0;dash();p.invuln=0;}if(mode==='spawn')p.invuln=2;if(mode==='ordinaryFirst')hurt(health*.03/incomingDamageScale());for(let i=0;i<2;i++)game.hostileShots.push({x:p.x,y:p.y,vx:0,vy:0,rad:8,life:1,owner:mode==='sameCaster'?a:i?b:a,attack:mode==='spread'?attack:{},damage:1});tickCombat(.01);return {fraction:(health-p.hp)/health,hp:p.hp,status:game.status};},
  chunkFloor(){const p=fresh(),e=enemy(),hits=[];for(const amount of [1,100,125,250,500]){p.hp=1000;p.invuln=p.hitInvuln=0;hurtEncounter(e,{},amount);hits.push(1000-p.hp);}return hits;},
  siphonConcurrency(){fresh();const a=enemy(),b=enemy(100,-80);a.phaseQueue=['tether'];const channel=beginBossCast(a),duration=a.cast?.total;b.phaseQueue=['volley'];const minor=beginBossCast(b);b.cast=null;b.phaseQueue=['sunder'];const major=beginBossCast(b);return {channel,duration,minor,major};},
  reflectOverlap(){const p=fresh(),e=__encounterTest.owner(0),cast=__encounterTest.cast(e,'reflect');hurtEncounter(e,cast,125);cast.expired=true;e.cast=null;resolveReflectWard(e,cast);return 1000-p.hp;},
  lingering(kind='ascend'){const e=channel(kind);run(10);return {task:!!e.eliteTask,age:e.eliteTask?.age,hp:e.hp,boost:e.ascendance||0};},
  siege(variant='volley',interrupt=true){const e=channel('siege',variant),q={x:e.x,y:e.y};let shots=0,fields=0;for(let i=0;i<1000;i++){run(.02);shots=Math.max(shots,game.hostileShots.length);fields=Math.max(fields,game.hazards.length);}const active=!!e.eliteTask,before=e.hp,age=e.eliteTask?.age;game.player.invuln=0;if(interrupt){const body=enemyBody(e);game.player.x=body.x-60;game.player.y=(body.top+body.bottom)/2;game.player.vx=1;game.player.vy=0;dash();run(.2);}return {active,age,shots,fields,stationary:Math.hypot(e.x-q.x,e.y-q.y)<1,task:!!e.eliteTask,before,after:e.hp,cooldown:game.player.dashCooldown};},
  receive(key='iron_speed',reset=true){if(reset)fresh();game.manualPaused=false;game.menuPaused=true;const p=game.player,drop=dropMonsterLoot({x:p.x,y:p.y,rad:0},[{key:'voucher_'+key,amount:1}]);collectGroundLoot(drop);refreshUI();render();return this.state();},
  bossVoucher(){fresh();const boss=__encounterTest.owner(0),random=Math.random;try{Math.random=()=>0;boss.hp=0;onKill(boss);collectAllGroundLoot();}finally{Math.random=random;}game.manualPaused=true;refreshUI();render();return this.state();},
  ownedVoucher(key){fresh();data.tools.pickaxe=true;data.trinkets=['leech'];return this.receive(key,false);},
  state(){return {guide:progressionGuide(),intro:!!data.voucherIntroSeen,queue:data.voucherGuideQueue,vouchers:data.specificVouchers,speed:data.styles.melee.speed,gold:data.gold,ore:data.ore,bars:data.bars,tab:equipmentTab,group:workshopGroup,scene:game.scene};},
  reopen(){closeDrawer();hideOverlay();game.manualPaused=false;game.menuPaused=true;refreshUI();},
  save:()=>save(),
  eligible(key){return voucherUpgradeActions(key);},
  preview(mode='navigation',variant='volley'){fresh();data.firstWeaponCrafted=true;data.voucherIntroSeen=true;game.phaseTarget=zoneBalance().targets[0];if(mode==='channel'){const e=channel('siege',variant);game.player.x=e.x+90;game.player.y=e.y+65;game.camX=e.x;game.camY=e.y;e.eliteTask.age=10;e.eliteTask.pending={x:game.player.x,y:game.player.y,angle:Math.atan2(65+22,90)};e.eliteTask.warn=.65;}else{enemy(-90,-110);enemy(120,-165);game.player.hp=760;}game.menuPaused=true;refreshUI();$('toastStack').replaceChildren();render();},
  cleanup(){worldScenery=scenery;}
 };
}
module.exports={engagementFixture};
