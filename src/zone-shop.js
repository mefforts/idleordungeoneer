/* Persistent local training, a global Dungeoneering record, and bounded combat. */
const UPGRADE_CAPS={might:20,haste:20,cleave:3,reach:10,ward:10,vitality:20,crit:20,multishot:3,pierce:3,storm:10,fire:10,frost:10,nova:10,swift:10,magnet:10,regen:15,wisdom:10,forage:5};
const ZONE_CURRENCIES=[
 {name:'Verdant Seals',art:'currency-overgrowth'},
 {name:'Ember Seals',art:'currency-embervault'},
 {name:'Soul Seals',art:'currency-crypt'},
 {name:'Rift Seals',art:'currency-rift'}
];
const SHOP_BASE_COST={might:3,haste:8,cleave:24,reach:5,ward:6,vitality:5,crit:12,multishot:30,pierce:24,storm:18,fire:16,frost:10,nova:24,swift:6,magnet:4,regen:8,wisdom:6,forage:12};
const SHOP_MIGHT_COSTS=[3,5,8,13,21,34,55,120,240,480];
const SHOP_TRAINING=[0,.25,.43,.58,.72,.84,.93,1,1.035,1.08,1.14,1.22,1.32,1.45,1.6,1.8,2.05,2.35,2.7,3.1,3.6];
const DUNGEONEERING_XP_STEP=1600;
let shopZone=0,shopCategory='offense',shopSignature='',shopUiInstalled=false;

function shopBudget(index=zoneNumber()){return index>=4?300:index===0?100:200;}
function zoneCurrency(){return {name:'Dungeon Sigils',art:'currency-rift'};}
function zoneShopUnlocked(index=zoneNumber()){return Number.isInteger(index)&&index>=0&&index<=9999;}
function zoneShopFor(index=zoneNumber()){return dungeonShopFor(index);}
function dungeonProgress(total=data.dungeoneeringXp||0){return {...dungeoneeringJourney(),total:Math.max(0,Number(total)||0)};}

function masterySpent(m){return Object.entries(TALENTS).reduce((sum,[key,t])=>sum+t.cost.slice(0,Math.max(0,Math.min(t.max,Math.floor(Number(m?.[key])||0)))).reduce((a,b)=>a+b,0),0)+(Number(m?.delveSpeed)||0)+(Number(m?.skillingSpeed)||0);}
function normalizeGlobalMastery(){
 const source=data.dungeonMastery&&typeof data.dungeonMastery==='object'?data.dungeonMastery:{};
 const m={points:Math.max(0,Math.min(1e12,Math.floor(Number(source.points)||0))),earned:Math.max(0,Math.min(1e12,Math.floor(Number(source.earned)||0))),intensity:0};
 for(const key of ['delveSpeed','skillingSpeed'])m[key]=Math.max(0,Math.min(1000,Math.floor(Number(source[key])||0)));
 for(const [key,t]of Object.entries(TALENTS))m[key]=Math.max(0,Math.min(t.max,Math.floor(Number(source[key])||0)));
 m.intensity=Math.max(0,Math.min(m.onslaught,Math.floor(Number(source.intensity)||0)));m.earned=Math.max(m.earned,m.points+masterySpent(m));data.dungeonMastery=m;return m;
}
function normalizeZoneShopProgression(){
 const migrating=data.zoneShopVersion!==1;
 if(migrating){
  const legacy=data.zone&&typeof data.zone==='object'?JSON.parse(JSON.stringify(data.zone)):null;
  data.legacyZoneProgression={zone:legacy,mastery:JSON.parse(JSON.stringify(data.mastery||{}))};
  const old=Object.values(data.mastery||{}).filter(m=>m&&typeof m==='object');
  const total=old.reduce((n,m)=>n+Math.max(0,Number(m.points)||0)+masterySpent(m),0);
  const m={points:0,earned:total,intensity:0};for(const key of Object.keys(TALENTS))m[key]=Math.max(0,...old.map(v=>Math.min(TALENTS[key].max,Math.floor(Number(v[key])||0))));
  m.intensity=Math.min(m.onslaught,Math.max(0,...old.map(v=>Math.floor(Number(v.intensity)||0))));m.points=Math.max(0,total-masterySpent(m));data.dungeonMastery=m;
  let xp=Math.max(0,Number(data.dungeoneeringXp)||0);
  if(legacy){
   const index=Number.isInteger(legacy.index)&&legacy.index>=0?legacy.index:zoneNumber(),bucket=(data.zoneShops||(data.zoneShops={}))[index]||((data.zoneShops[index])={currency:0,earned:0,ranks:{}});
   bucket.ranks=bucket.ranks&&typeof bucket.ranks==='object'?bucket.ranks:{};
   for(const [id,value]of Object.entries(legacy.upgrades||{}))if(Object.hasOwn(UPGRADE_CAPS,id))bucket.ranks[id]=Math.max(bucket.ranks[id]||0,Math.min(UPGRADE_CAPS[id],Math.max(0,Math.floor(Number(value)||0))));
   const level=Math.max(1,Math.min(500,Math.floor(Number(legacy.level)||1)));
   for(let n=1;n<level;n++)xp+=n===1?23:20+12*n+3*n*n;
   xp+=Math.max(0,Number(legacy.xp)||0);
   const credit=Math.max(0,Math.floor(Number(legacy.pending)||0))*3;bucket.currency=(Number(bucket.currency)||0)+credit;bucket.earned=Math.max(Number(bucket.earned)||0,bucket.currency);
  }
  data.dungeoneeringXp=xp;const levels=Math.max(0,Math.floor(Math.sqrt(xp/DUNGEONEERING_XP_STEP)));m.points+=levels;m.earned+=levels;data.zoneShopVersion=1;
 }
 data.dungeoneeringXp=Math.max(0,Math.min(1e12,Number(data.dungeoneeringXp)||0));
 const source=data.zoneShops&&typeof data.zoneShops==='object'&&!Array.isArray(data.zoneShops)?data.zoneShops:{};data.zoneShops={};
 for(const [key,value]of Object.entries(source)){
  if(!/^\d+$/.test(key)||Number(key)>9999||!value||typeof value!=='object')continue;
  const currency=Math.max(0,Math.min(1e12,Math.floor(Number(value.currency)||0))),ranks={};
  for(const [id,rank]of Object.entries(value.ranks||{}))if(Object.hasOwn(UPGRADE_CAPS,id))ranks[id]=Math.max(0,Math.min(UPGRADE_CAPS[id],Math.floor(Number(rank)||0)));
  data.zoneShops[key]={currency,earned:Math.max(currency,Math.min(1e12,Math.floor(Number(value.earned)||0))),ranks};
 }
 normalizeGlobalMastery();normalizeDungeonShopProgression();normalizeTimeProgression();
}
function masteryFor(){return data.dungeonMastery||normalizeGlobalMastery();}
function masteryUnlocked(){return masteryFor().earned>0;}
function masteryNewDraft(){return {biome:-1,...masteryFor()};}

function rareDropChance(){return Math.min(.30,.015*(1+.25*masteryFor().adaptation)+trinketBonus('find'));}

function waveRank(id,source){return effectiveDungeonRank(id,combatStyle(),source||dungeonShopFor().ranks);}
function waveDamageFactor(){return 1;}
function waveHasteFactor(){return 1+.015*waveRank('haste');}
function waveReachFactor(){return 1+.12*(combatStyle()==='melee'?dungeonRank('technique'):0);}
function waveSwiftFactor(){return 1+.02*waveRank('swift');}
function waveCritChance(){return .05+.015*waveRank('crit');}
function waveVitality(){return 5*waveRank('vitality');}
function zoneCombatProfile(id=data.weaponType,options={}){
 const index=options.zone??zoneNumber(),ranks=options.ranks||dungeonShopFor(index).ranks,style=styleForWeapon(id),w=WEAPON_TYPES[id],s=data.styles[style],stats=styleStats(style),rank=options.rank??s.weapon,speed=options.speed??stats.speedPercent,percent=options.percent??stats.damagePercent;
 const gearDamage=weaponDamageBase(id,rank)*w.power*(1+percent/100),gearCooldown=w.cooldown/(1+speed/100),gear=gearDamage/gearCooldown*1.05,crit=.05,extra=effectiveDungeonRank('multishot',style,ranks),raw=gear*(1+.15*extra),budget=Math.max(shopBudget(index),TIER_LIMITS[styleTier(style)].dps),dps=raw<=budget?raw:budget+(raw-budget)*.25,factor=raw?dps/raw:1;
 return {dps,raw,core:gear,gear,training:0,budget,crit,extra,cooldown:gearCooldown,damage:gearDamage*factor,softFactor:factor};
}
function weaponDps(id=data.weaponType,options={}){
 const style=styleForWeapon(id),w=WEAPON_TYPES[id],stats=styleStats(style);
 if(options.ceiling||options.equipmentOnly){
  const rank=options.ceiling?styleUpgradeCap(style,'weapon'):data.styles[style].weapon+(options.next?1:0),speed=options.ceiling?styleUpgradeCap(style,'speed')*2:stats.speedPercent;
  const percent=options.ceiling?(style==='magic'?(styleTier(style)*4):0)+(options.dedicated?8:0):stats.damagePercent;
  return weaponDamageBase(id,rank)*w.power*(1+percent/100)*(1+speed/100)/w.cooldown*1.05;
 }
 return zoneCombatProfile(id,{rank:data.styles[style].weapon+(options.next?1:0)}).dps*(options.run?eliteBoonValue('damage')*eliteBoonValue('attackSpeed'):1);
}
function attackCooldown(){return zoneCombatProfile().cooldown/eliteBoonValue('attackSpeed');}

function grantZoneCurrency(amount,index=zoneNumber()){
 amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return 0;const b=dungeonShopFor(index);b.currency=Math.min(1e12,b.currency+amount);b.earned=Math.min(1e12,b.earned+amount);if(!data.zoneShopIntroduced){data.zoneShopIntroduced=true;toast('Dungeon Shop','Spend Dungeon Sigils on abilities for every Zone in this Dungeon.');}codexDiscover('zone_shop');
 const node=$('zoneCurrencyHud');if(node){node.classList.remove('currency-gain');requestAnimationFrame(()=>node.classList.add('currency-gain'));}return amount;
}
function buyZoneUpgrade(id,index=shopZone){
 const p=dungeonPerk(id),b=dungeonShopFor(index),cost=dungeonPerkCost(id,b.ranks[id]||0);if(!p||!dungeonPerkUnlocked(p)||cost===null||b.currency<cost)return false;
 const previous=b.ranks[id]||0;b.currency-=cost;b.ranks[id]=previous+1;if(id==='fire'&&previous&&dungeonForZone(index).id===dungeonForZone().id)for(const enemy of game.enemies)if(enemy.burn>0){enemy.burnDps*=b.ranks[id]/previous;enemy.burn+=.1;}codexDiscover('dungeon_perk_'+id);game.upgrades={...dungeonShopFor().ranks};shopSignature='';save();refreshUI();return true;
}
function zoneSnapshot(){const p=dungeonProgress();return {index:zoneNumber(),upgrades:{...zoneShopFor().ranks},level:p.level,xp:p.xp,required:p.required,pending:0};}
function normalizeZone(){normalizeZoneShopProgression();data.zone=zoneSnapshot();}
function syncZone(){data.zone=zoneSnapshot();game.upgrades={...zoneShopFor().ranks};const p=dungeonProgress();game.runLevel=p.level;game.runXp=p.xp;game.requiredXp=p.required;game.pendingLevels=0;checkpointGroundXp();}
function gainXp(amount){if(!Number.isFinite(amount)||amount<=0)return;data.dungeoneeringXp+=amount;syncZone();}

function showUpgrade(){game.pendingLevels=0;if(game.status==='upgrade')game.status='running';return false;}
function selectUpgrade(){return false;}
function showMasteryIntroduction(){if(data.masteryIntroSeen||!masteryUnlocked())return;data.masteryIntroSeen=true;save();toast('Dungeoneering point earned','Choose Delving or Skilling game time in the Dungeon Shop.');}
function startFloor(){if(eliteRewardOpen())return false;game.scene='combat';game.manualPaused=game.menuPaused=false;resetRun();game.status='running';hideOverlay();setScene('combat',false);nextPhase();updatePauseHud();refreshUI();announceZone2TravelTip();}
function applyMastery(){
 if(!masteryDraft||!masteryChanged()){masteryClose(true);return;}
 const m=masteryFor(),v={...masteryDraft,delveSpeed:m.delveSpeed,skillingSpeed:m.skillingSpeed},total=m.points+masterySpent(m),cost=masterySpent(v);if(cost>total)return;
 for(const key of Object.keys(TALENTS)){m[key]=Math.max(0,Math.min(TALENTS[key].max,v[key]));if(m[key])codexDiscover('permanent_talent_'+key);}
 m.points=total-cost;m.intensity=Math.min(v.intensity,m.onslaught);masteryDraft=null;
 const live=game.status==='running';if(live){syncZone();resetRun();game.status='running';game.manualPaused=game.menuPaused=true;nextPhase();}
 save();refreshUI();masteryClose(true);updatePauseHud();toast('Mastery applied',live?'Floor restarted · paused':'');
}
function hurt(amount){const p=game.player;p.hitPose=.26;if(game.status!=='running'||p.invuln>0)return;const damage=amount*(1-styleStats().guardPercent/100)*(1-trinketBonus('guard'))*(1-.02*waveRank('ward'))*(data.weaponType==='shield'?.72:1)*eliteBoonValue('protection');p.hp-=damage;p.invuln=.47;game.shake=6;floater(p.x,p.y-31,'-'+Math.ceil(damage),'#ffb5a5');burst(p.x,p.y,5,'#fa8b87');if(p.hp<=0){p.hp=0;die();}}
function powerSummary(id,rank){
 const r=Math.max(0,Math.min(dungeonPerk(id)?.max||0,Number(rank)||0)),style=combatStyle();
 const common={fire:r*2+'% hit damage / s',frost:r?(5+r*2)+'% chill':'No chill',storm:r*4+'% chain chance',nova:(r?6+r*2:0)+'% critical splash',ward:r*2+'% damage reduction',disrupt:r*6+'% disruption chance',shatter:r*8+'% chill-burst damage',vortex:r*12+' pull distance',prism:(r*1.5)+'% extra reflected maximum HP'};
 if(id==='technique')return style==='melee'?'+'+r+' sweep targets · +'+r*12+'% reach':style==='magic'?r?'Homing '+r+' · elite priority':'No homing':'+'+r+' pierce';
 if(id==='echo')return style==='melee'?r*12+'% echo blade':style==='magic'?'+'+r+' ricochet':'+'+r+' arrow · 15% damage each';
 if(id==='return')return r*8+'% returning attack chance';return common[id]||'';
}
function powerCompact(id,rank){return powerSummary(id,rank);}
function powerIncrement(id,rank=0){return powerSummary(id,Math.min(zoneAbilityCap(id),rank+1));}
function powerGain(id){return powerIncrement(id,zoneUpgradeRank(id));}

function onKill(e){
 if(!game.enemies.includes(e))return;spawnGraveEcho(e);clearOwnerMechanics(e);flushBurnDamage(e);game.enemies.splice(game.enemies.indexOf(e),1);if(e.summoned){burst(e.x,e.y,6,combatTheme('shield').color);completeSummonCleanup();return;}
 const drops=[],effects=dungeonKillEffects(e);if(effects.gold)drops.push({key:'gold',amount:effects.gold});drops.push(...monsterMaterialDrops(e));
 earnStyleXp(e.boss?10:e.elite?4:1,e.lastDamageStyle||combatStyle());game.runKills++;game.phaseKills++;
 const b=biome();burst(e.x,e.y,e.boss?18:game.enemies.length>65?2:8,b.accent);game.shake=e.boss?7:1.5;
 const seals=dungeonCurrencyReward(e);if(seals)drops.push({key:'sigils',amount:seals});
 if(e.boss){
  const index=e.bossIndex,coins=delveGoldCoins(delveGoldReward('guardian',data.floor,index)*(1+trinketBonus('gold'))*(1+.04*waveRank('forage'))),essence=index===2?2:1;
  if(coins)drops.push({key:'gold',amount:coins});drops.push({key:'essence',amount:essence});
  gainXp(98*3/zoneFloorCount()*(1+.03*waveRank('wisdom'))*(1+trinketBonus('xp')));dropMonsterLoot(e,drops);
  toast(e.name+' defeated','Walk near the fallen loot to collect it.');save();game.boss=null;
  if(game.phaseKills>=game.phaseTarget){if(game.status==='running')finishPhase();else game.transition=.85;}
 }else{
  dropHealth(e);dropEliteSpoils(e);
  if(Math.random()<rareDropChance()){const index=biomeIndex(),amount=e.elite?2:1;drops.push({key:'loot_'+index,amount});}
  if(e.elite){const coins=delveGoldCoins(delveGoldReward('elite')*(1+trinketBonus('gold'))*(1+.04*waveRank('forage')));if(coins)drops.push({key:'gold',amount:coins});}
  gainXp((e.elite?2:1)*(8+Math.floor(combatDepth()/3))*(1+.03*waveRank('wisdom'))*(1+trinketBonus('xp')));dropMonsterLoot(e,drops);
  if(game.phaseKills>=game.phaseTarget)finishPhase();
 }
}

function clearFloor(){
 collectAllGroundLoot();
 game.status='clear';game.phase=6;const floor=data.floor,clearedZone=zoneNumber(),clearedStage=zoneStage(),clearedName=biome().name,award=grantDelveGold(delveGoldReward('floor',floor)),essence=2+Math.floor(floor/2);
 game.lastClearedZone=clearedZone;game.lastClearedFloor=floor;data.essence+=essence;codexDiscover('permanent_essence');data.cleared=Math.max(data.cleared,floor);const beforeLevel=data.timeMilestones;normalizeTimeProgression();syncZone();if(data.timeMilestones>beforeLevel)toast('Dungeoneering '+dungeonProgress().level,'1 point earned · choose Delving or Skilling in the Dungeon Shop.');
 const frontier=Math.max(1,data.cleared+1),replay=floor<frontier-1,ending=isZoneFinal();
 data.floor=replay&&ending?zoneStart(clearedZone):floor+1;data.zone=zoneSnapshot();game.upgrades={...zoneShopFor().ranks};ensureJobs();if(ending)codexDiscover('biome_'+biomeIndex());save();
 const idle=floor===1&&data.cleared===1||ending&&clearedZone===0&&data.cleared===zoneEnd(0);
 showOverlay('<div class="floor-result"><h2>'+(ending?'Zone cleared':'Floor cleared')+'</h2><p>'+clearedName+' · Floor '+clearedStage+'</p>'+(floor===1&&data.cleared===1?'<p class="progression-tip">Your first idle slot is ready. Clear all five Zone 1 floors to reach Zone 2 and earn your first Mastery point: choose faster Delving or faster Skilling, including idle. Your second idle slot unlocks there too.</p>':'')+'<div class="floor-rewards"><span>'+artHTML('coins')+'+'+award+'</span><span>'+artHTML('essence')+'+'+essence+'</span>'+(data.timeMilestones>beforeLevel?'<span>'+artHTML('mastery-points')+'+1 point</span>':'')+'</div>'+(idle?'<button type="button" class="secondary-cta idle-unlock-cta" id="selectIdleTask">'+uiIcon('idle')+'Select idle task</button>':'')+'<button type="button" class="secondary-cta" id="clearZoneShop">'+artHTML('zone-shop')+(masteryFor().points?'Choose game time · '+masteryFor().points+' point'+(masteryFor().points===1?'':'s'):'Dungeon Shop')+'</button><button type="button" class="primary-cta" id="nextFloor">Continue'+uiIcon('arrow')+'</button></div>','floor-clear-overlay');
 $('nextFloor').onclick=startFloor;$('clearZoneShop').onclick=()=>openZoneShop(clearedZone);if($('selectIdleTask'))$('selectIdleTask').onclick=openIdleHub;refreshUI();
 if(idle)toast('Idle unlocked',clearedZone===0&&floor===1?'Your second idle slot unlocks when you reach Zone 2.':'Two tasks can now run together.');
}
function expectedAttacks(hp,damage,crit=.05){const n=Math.max(1,Math.ceil(hp/damage-1e-9));let previous=0,current=1;for(let i=2;i<=n;i++){const next=1+(1-crit)*current+crit*previous;previous=current;current=next;}return current;}
function zoneBalance(index=zoneNumber()){
 index=Math.max(0,Math.floor(Number(index)||0));if(ZONE_BALANCE_CACHE.has(index))return ZONE_BALANCE_CACHE.get(index);
 const minutes=index===0?10:index===1?20:index===2?30:Math.min(40,35+index-3),floors=zoneFloorCount(index),gearTier=index>=4?3:index===0?1:2,weaponRank=TIER_LIMITS[gearTier].weapon,powerRank=gearTier*10,speedRank=gearTier*5;
 const base=14/.88*1.05,first=80/1.1,second=160/1.2,third=240/1.3,gear=(powerRank<=10?base+(first-base)*powerRank/10:powerRank<=20?first+(second-first)*(powerRank-10)/10:second+(third-second)*(powerRank-20)/10)*(1+speedRank*.02);
 const core=gear,crit=.05,cooldown=.88/(1+speedRank*.02),raw=core*(1+crit)/1.05,dps=raw<=shopBudget(index)?raw:shopBudget(index)+(raw-shopBudget(index))*.25,hit=dps*cooldown/(1+crit);
 const counts=[SWARM_TARGETS[0],SWARM_TARGETS[2],SWARM_TARGETS[4]].map(n=>Math.max(7,Math.round(n*.4*Math.min(2.5,1+index*.5)*3/floors))),targets=[counts[0],0,counts[1],0,counts[2],0],swarmCount=counts.reduce((a,b)=>a+b,0)*floors;
 const model={index,minutes,seconds:minutes*60,floors,weaponRank,speedRank,proficiency:1,gearTier,shopRanks:{},crit,hit,cooldown,dps,targets,swarmCount,escortCount:interludeEscortCount(index),spawnSeconds:minutes*60*.55/swarmCount,hpScale:1};
 // Keep the previous health calibration; stronger equipment shortens fights.
 const forecast=(scale,health=false,referenceHit=hit,packs=false)=>{let seconds=floors*6*.72;for(let floor=0;floor<floors;floor++)for(let phase=0;phase<6;phase++){
  const boss=phase%2===1,progress=2*floor/Math.max(1,floors-1),baseHp=boss?[160,230,360][Math.floor(phase/2)]*(phase===5?(floor===floors-1?3.2:1.75):1):30+phase*4,hp=baseHp*Math.pow(1.14,progress)*scale;
  if(boss){seconds+=expectedAttacks(hp*(health?ENCOUNTER_HEALTH.boss*regionalEncounterHealthMultiplier({boss:true},index):1),referenceHit,crit)*cooldown+1.5;if(packs&&phase<5){const extra=(30+phase*4)*Math.pow(1.14,progress)*scale*2.8*(health?ENCOUNTER_HEALTH.bossElite*regionalEncounterHealthMultiplier({bossElite:true},index):1);seconds+=(interludePackSize(index,floor+1)-1)*expectedAttacks(extra,referenceHit,crit)*cooldown;}}
  else{const echoes=index===1&&floor===floors-1?6:floor===0?(phase===0?0:1):zoneVisualBand(index,floor+1),eligible=Math.max(0,targets[phase]-3-echoes),rare=expectedRareCount(eligible,rareEliteSpawnChance(index,floor+1),rareEliteQuota(index,floor+1)),regular=Math.max(0,targets[phase]-echoes-rare),uncommon=packs?Math.min(regular,Math.max(0,targets[phase]-4-echoes-rare)*UNCOMMON_ENEMIES.chance):0;let attacks=0;
   for(let sample=0;sample<21;sample++)attacks+=((regular-uncommon)*expectedAttacks(hp*(.9+sample*.01)*(health?regionalEncounterHealthMultiplier({},index):1),referenceHit,crit)+uncommon*expectedAttacks(hp*(.9+sample*.01)*UNCOMMON_ENEMIES.health*(health?regionalEncounterHealthMultiplier({},index):1),referenceHit,crit)+echoes*expectedAttacks(hp*(.9+sample*.01)*2.8*(health?ENCOUNTER_HEALTH.bossElite*regionalEncounterHealthMultiplier({bossElite:true},index):1),referenceHit,crit)+rare*expectedAttacks(hp*(.9+sample*.01)*3.5*(health?ENCOUNTER_HEALTH.rare*regionalEncounterHealthMultiplier({champion:true},index):1),referenceHit,crit))/21;
   seconds+=Math.max(attacks*cooldown,(targets[phase]-1)*model.spawnSeconds+1.5);
  }
 }return seconds;};
 let lo=.001,hi=1;while(forecast(hi)<model.seconds)hi*=2;for(let n=0;n<38;n++){const mid=(lo+hi)/2;if(forecast(mid)<model.seconds)lo=mid;else hi=mid;}
 model.hpScale=Math.max((lo+hi)/2,index>=2?zoneBalance(1).hpScale*Math.pow(1.14,2)*1.25:0);model.previousTargetSeconds=model.seconds;model.dps=TIER_LIMITS[gearTier].power;model.hit=model.dps*cooldown/(1+crit);model.baseForecastSeconds=forecast(model.hpScale,false,model.hit,true);model.forecastSeconds=forecast(model.hpScale,true,model.hit,true);model.seconds=Math.ceil(model.forecastSeconds);model.minutes=Math.ceil(model.seconds/60);ZONE_BALANCE_CACHE.set(index,model);return model;
}

function investMastery(branch){
 if(!TALENTS[branch])return;
 if(!masteryDraft)masteryDraft=masteryNewDraft();
 const cost=masteryCost(branch,masteryDraft);
 if(cost===null||masteryDraft.points<cost)return;
 masteryDraft.points-=cost;masteryDraft[branch]++;
 if(branch==='onslaught'&&masteryDraft.intensity<masteryDraft.onslaught)masteryDraft.intensity=masteryDraft.onslaught;
 showMastery();
}
