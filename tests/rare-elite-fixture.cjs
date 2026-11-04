// Response-only state for checking new elites without exposing test controls.
function rareEliteFixture(){
 function fresh(kind=0){
  if(codexSession)closeCodex();closeDrawer(false);hideOverlay();data=defaults();data.floor=zoneStart(kind);data.cleared=Math.max(0,data.floor-1);data.onboardingDone=data.tutorialSeen=data.skillsNudgeSeen=data.zone2SkillsAnnounced=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=true;game.phase=0;game.phaseTarget=1e9;game.phaseSpawned=3;game.attackTimer=1e9;game.spawnTimer=1e9;game.player.hp=game.player.maxHp=1000;game.player.invuln=1e9;game.keys={};game.enemies=[];game.holdSkill=null;game.devSpeed=game.skillSpeed=1;game.player.x=game.player.y=0;game.camX=game.camY=0;game.frame=2;tourIndex=-1;setScene('combat',false);$('toastStack').replaceChildren();refreshUI();
 }
 function elite(variant=0,kind=0){fresh(kind);const e=spawnEnemy();e.visualType=variant;e.x=0;e.y=-120;const before={hp:e.hp,radius:e.rad,speed:e.speed};const promoted=promoteRareElite(e,0);e.speed=0;e.contact=1e9;return {e,before,promoted};}
 function spoils(kind=0){const {e}=elite(0,kind),random=Math.random;Math.random=()=>0;try{onKill(e);}finally{Math.random=random;}refreshUI();return state();}
 function state(){return {drops:data.eliteSpoils.map(drop=>({...drop})),boon:data.eliteBoon&&{...data.eliteBoon},kills:game.runKills,points:masteryFor().points,essence:data.essence,gold:data.gold,health:game.healthDrops.length,status:game.status,scene:game.scene,styles:JSON.stringify(data.styles),shop:JSON.stringify(data.zoneShops),hp:game.player.hp,permanent:weaponDps(data.weaponType,{equipmentOnly:true}),live:weaponDps(data.weaponType,{run:true}),cooldown:attackCooldown()};}
 window.__rareTest={
  fresh,spoils,state,
  rewardRates(){const rows=[],random=Math.random;try{for(const [kind,flags]of [['ordinary',{}],['elite',{elite:true}],['rare',{elite:true,champion:true}],['echo',{elite:true,bossElite:true}],['summon',{elite:true,summoned:true}],['boss',{boss:true}]]){fresh();let health=0,blessings=0;for(let i=0;i<100;i++){Math.random=()=>(i+.5)/100;const enemy={x:200,y:200,...flags};health+=!!dropHealth(enemy);blessings+=!!dropEliteSpoils(enemy);game.healthDrops=[];data.eliteSpoils=[];}rows.push({kind,health,blessings});}}finally{Math.random=random;}return rows;},
  rewardPair(healthRoll,blessingRoll){fresh();const random=Math.random,enemy={elite:true,x:200,y:200};try{Math.random=()=>healthRoll;const health=!!dropHealth(enemy);Math.random=()=>blessingRoll;const blessing=!!dropEliteSpoils(enemy);return {health,blessing};}finally{Math.random=random;}},
  guides(){return {rare:rareEliteCodexHtml(),boon:eliteBoonCodexHtml('fervor')};},
  async assets(){await Promise.all(Object.keys(RARE_ELITE_ART).map(key=>{const [zone,variant]=key.split('-');return rareEliteImage(ENVIRONMENT_ZONES.findIndex(item=>item.key===zone),Number(variant)).decode();}));return Object.entries(RARE_ELITE_ART).map(([key,art])=>({key,...art}));},
  variant(variant,kind){const {e,before,promoted}=elite(variant,kind);drawBoss(e,biome());return {name:e.name,promoted,hp:e.hp,base:before.hp,radius:e.rad,visual:e.visualType,champion:e.champion,patterns:bossPlan(e),points:masteryFor().points};},
  rarity(){fresh();let count=0;for(let i=0;i<1000;i++){game.enemies=[];game.rareEliteSpawned=false;game.rareEliteCount=0;const e=spawnEnemy();if(promoteRareElite(e,(i+.5)/1000))count++;}game.enemies=[];game.rareEliteSpawned=false;game.rareEliteCount=0;game.spawnTimer=0;const random=Math.random;try{Math.random=()=>.001;tickCombat(.02);}finally{Math.random=random;}const actual=game.enemies.filter(e=>e.champion).length;const extra=spawnEnemy(),capped=promoteRareElite(extra,0);game.enemies=[];prepareEliteWave();const next=spawnEnemy(),nextWave=promoteRareElite(next,0);return {count,actual,capped,nextWave};},
  hit(weapon='sword',overkill=false){data.weaponType=weapon;data.unlockedWeapons=Object.keys(WEAPON_TYPES);projectCombatStyle();game.enemies=[];const e=spawnEnemy();e.hp=e.maxHp=100;e.x=0;e.y=40;game.player.hp=100;game.player.invuln=0;const before=state(),random=Math.random;try{Math.random=()=>.99;dealDamage(e,overkill?1000:50,e.x,e.y);}finally{Math.random=random;}return {before,damage:100-e.hp,heal:game.player.hp-100,after:state()};},
  ring(){fresh();data.trinkets=['leech'];data.equippedRings=['leech'];return this.hit('sword',true);},
  time(seconds,context='combat',speed=1){game.devSpeed=speed;game.manualPaused=context==='pause';game.menuPaused=context==='menu'||context==='pause';game.scene=context==='skill'?'mine':'combat';game.phase=1;game.enemies=[];game.attackTimer=1e9;game.player.invuln=1e9;game.player.hp=100;for(let left=seconds;left>1e-9;left-=.05)update(Math.min(.05,left));game.manualPaused=game.menuPaused=true;refreshUI();return state();},
  protection(){game.player.invuln=0;game.player.hp=500;const boon=data.eliteBoon;data.eliteBoon=null;hurt(10);const normal=500-game.player.hp;game.player.invuln=0;game.player.hp=500;data.eliteBoon=boon;hurt(10);const guarded=500-game.player.hp;game.player.hp=100;tickEliteBoon(1);return {normal,guarded,regen:game.player.hp-100};},
  another(){const e=spawnEnemy();e.champion=e.elite=true;e.name='Thorncrown Mossling';onKill(e);refreshUI();},
  save(){save();},
  zone(kind){closeDrawer(false);hideOverlay();data.floor=zoneStart(kind);normalizeProgression();normalizeZone();resetRun();game.scene='combat';game.status='running';game.manualPaused=game.menuPaused=true;game.phase=1;game.attackTimer=1e9;refreshUI();return state();},
  carry(){nextPhase();const wave=state().drops.length;resetRun();return {wave,floor:state().drops.length};},
  friendly(type='cleave',lethal=false){
   fresh();game.phase=4;const owner=spawnEnemy(true,0);owner.x=0;owner.y=-120;owner.hp=owner.maxHp=1000;owner.contact=1e9;owner.speed=0;game.player.x=0;game.player.y=0;
   const normal=spawnEnemy();normal.x=0;normal.y=-40;normal.hp=lethal?30:100;normal.maxHp=100;normal.speed=0;normal.contact=1e9;
   const outside=spawnEnemy();outside.x=350;outside.y=-40;outside.hp=outside.maxHp=100;outside.speed=0;outside.contact=1e9;
   const other=spawnEnemy();other.elite=true;other.x=0;other.y=-50;other.hp=other.maxHp=100;
   data.trinkets=['leech'];data.equippedRings=['leech'];data.enchant=4;game.player.hp=500;game.player.invuln=1e9;
   const cast={type,resolved:false,origin:{x:0,y:-120},angle:Math.PI/2,reach:170,halfAngle:Math.PI/3,targets:[{x:0,y:-40,r:44},{x:0,y:-40,r:44}],enemyHits:new Set()};
   const before=state();resolveBossCast(owner,cast);if(type!=='cleave')for(let i=0;i<8;i++)tickDungeonHazards(.02);const afterFirst=normal.hp;
   resolveBossCast(owner,cast);if(type!=='cleave')tickDungeonHazards(.02);return {afterFirst,afterRepeated:normal.hp,outside:outside.hp,elite:other.hp,owner:owner.hp,hp:game.player.hp,kills:game.runKills-before.kills,arcs:game.arcs.length,burn:normal.burn||0,alive:game.enemies.includes(normal),points:masteryFor().points};
  },
  cleaveWindup(){const {e}=elite();game.player.x=0;game.player.y=0;e.mechanicIndex=bossPlan(e).indexOf('cleave');e.castCooldown=0;tickBossSpecial(e,.01);const cast=e.cast,total=cast.total,angle=cast.angle;game.player.x=300;game.player.y=-120;tickBossSpecial(e,total-.05);const before=game.player.hp;tickBossSpecial(e,.06);render();return {total,angleLocked:cast.angle===angle,before,after:game.player.hp,used:e.mechanicsUsed};},
  async show(kind=0){fresh(kind);await this.assets();game.player.maxHp=maxHp();game.player.hp=Math.round(game.player.maxHp*.76);game.phaseTarget=zoneBalance().targets[0];game.manualPaused=false;game.player.x=0;game.player.y=320;
   const count=RARE_ELITE_NAMES[kind].length,columns=4,rows=Math.ceil(count/columns),actors=[];game.enemies=[];
   for(let variant=0;variant<count;variant++){game.rareEliteSpawned=false;game.rareEliteCount=0;const enemy=spawnEnemy();enemy.visualType=variant;game.enemies=[];promoteRareElite(enemy,0);enemy.x=(variant%columns-(columns-1)/2)*230;enemy.y=(Math.floor(variant/columns)-(rows-1)/2)*230;enemy.cast=null;enemy.contact=1e9;actors.push(enemy);}
   game.enemies=actors;const nearest=[...actors].sort((a,b)=>Math.hypot(a.x-game.player.x,a.y-game.player.y)-Math.hypot(b.x-game.player.x,b.y-game.player.y))[0];nearest.mechanicIndex=bossPlan(nearest).indexOf('cleave');if(beginBossCast(nearest))nearest.cast.windup=nearest.cast.total*.5;refreshUI();render();}

 };
}
module.exports={rareEliteFixture};
