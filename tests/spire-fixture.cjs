// Synthetic encounter state, injected into test/review responses only.
function spireFixture(){
 let source=null,owner=null;
 function ledger(){return {gold:data.gold,xp:data.dungeoneeringXp,currency:dungeonShopFor().currency,points:masteryFor().points,kills:game.runKills,phaseKills:game.phaseKills,spoils:data.eliteSpoils.length,healthDrops:game.healthDrops.length,styles:JSON.stringify(data.styles)};}
 function state(){return {hp:game.player.hp,maxHp:game.player.maxHp,status:game.status,scene:game.scene,paused:game.menuPaused,player:{x:game.player.x,y:game.player.y},source:source?{exists:game.totems.includes(source),hp:source.hp,maxHp:source.maxHp,bumps:summonBumpsLeft(source),latched:!!source.bumpContact,disabled:!!source.disabled,pending:!!source.spawnPoint,foot:encounterFoot(source)}:null,nodes:game.totems.length,summons:game.enemies.filter(e=>e.summoned).length,owner:game.enemies.includes(owner),shots:game.shots.length,ledger:ledger()};}
 function setup({royal=false,mode='safe',zone=0,weapon='sword',preview=false}={}){
  __dungeonTest.fresh(zone,weapon);resetArenaTouch(true);game.keys={};game.mouseMove.active=false;
  let point=null;for(let y=0;y<=300&&!point;y+=50)for(let x=0;x<=300&&!point;x+=50)if([-80,-60,-40,-20,0,20,40,60,80].every(dx=>encounterClear(x+dx,y,22)))point={x,y};
  if(!point)throw Error('No clear spire approach in test area');
  owner=spawnEnemy(true,2);Object.assign(owner,{x:point.x-220,y:point.y-180,speed:0,contact:1e9,castCooldown:1e9});if(!preview)owner.hp=owner.maxHp=1e6;
  game.boss=owner;source=createSummonTotem(owner,point,royal);source.spawnClock=1000;
  if(mode==='surging'||mode==='disabled'||mode==='silenced'){source.spawnClock=0;source.spawnPoint={x:point.x+65,y:point.y};source.spawnWarn=1.3;}
  if(mode==='disabled')source.disabledUntil=game.frame+30;
  if(mode==='silenced')data.eliteBoons.push({id:'silence',remaining:45,dungeon:dungeonForZone().id,uid:++data.eliteBoonSequence});
  const p=game.player;p.x=point.x-72;p.y=point.y-13;p.invuln=p.dashTime=p.dashCooldown=0;p.hp=p.maxHp=preview?maxHp():1000;
  game.camX=point.x-20;game.camY=p.y;game.attackTimer=1e9;game.phase=5;game.phaseTarget=game.phaseSpawned=0;game.manualPaused=false;game.menuPaused=true;
  data.combatLanguageTipSeen=true;data.idleNoticeSlots=2;data.idleFirstAssigned=true;$('toastStack').replaceChildren();refreshUI();render();return state();
 }
 function at(x=0,y=0){const foot=encounterFoot(source);game.player.x=foot.x+x;game.player.y=foot.y+y-13;game.keys={};game.mouseMove.active=false;resetArenaTouch(true);}
 function step(dt=.02){tickCombat(dt);render();return state();}
 function advance(seconds){for(let left=seconds;left>1e-8;left-=.02)tickCombat(Math.min(.02,left));render();return state();}
 window.__spireTest={setup,state,at,step,advance,
  resume(){game.manualPaused=game.menuPaused=false;},
  lowHealth(){game.player.hp=1;},
  disable(){source.disabledUntil=game.frame+30;},
  boost(){for(let i=0;i<4;i++)data.eliteBoons.push({id:'fervor',remaining:45,dungeon:dungeonForZone().id,uid:++data.eliteBoonSequence});dungeonShopFor().ranks.disrupt=3;},
  dashSweep(){at(-29);game.player.dashTime=.01;game.player.dashDX=1;game.player.dashDY=0;game.player.invuln=0;return step(.09);},
  dashPass(){at(-50);game.player.dashTime=.22;game.player.dashDX=1;game.player.dashDY=0;game.player.invuln=0;const first=step(.09);return {first,after:step(.09)};},
  pendingArrival(){source.spawnWarn=.001;source.spawnClock=0;source.spawnPoint={x:source.x+65,y:source.y+18};},
  overlap(){const t=createSummonTotem(owner,encounterFoot(source),false);t.spawnClock=1000;},
  support(type){source={totem:true,type,biome:owner.biome,owner,x:source.x,y:source.y,rad:16,age:0,healReserve:150};game.totems=[source];return state();},
  spawned(){spawnSummonedEnemy(owner,{x:source.x+160,y:source.y+100},false,false,source);},
  killOwner(){onKill(owner);return state();},
  freeze(kind){
   game.manualPaused=game.menuPaused=false;
   if(kind==='pause')game.manualPaused=game.menuPaused=true;
   else if(kind==='menu')openDrawer('gear');
   else if(kind==='overlay')showOverlay('<h2>Paused encounter</h2>');
   else if(kind==='skill')setScene('mine',false);
   for(let i=0;i<30;i++)update(.02);return state();
  },
  weaponHit(){
   owner.x=source.x-1000;owner.y=source.y-1000;at(-60);source.hp=source.maxHp/2+1;
   const hp=source.hp,random=Math.random;Math.random=()=>.99;let attacked;
   try{updateCombatAim();attacked=attack();for(let i=0;i<120&&source.hp===hp;i++)tickCombat(.02);}finally{Math.random=random;}
   return {attacked,before:hp,...state()};
  },
  texts(){const original=CanvasRenderingContext2D.prototype.fillText,labels=[];CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(this.canvas===canvas)labels.push(String(text));return original.call(this,text,...args);};try{render();}finally{CanvasRenderingContext2D.prototype.fillText=original;}return labels;},
  ready(){return encounterImage(owner.biome,'fury').decode();}
 };
}
module.exports={spireFixture};
