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

function shopBudget(index=zoneNumber()){return index===0?100:200;}
function zoneCurrency(index=zoneNumber()){const currency=ZONE_CURRENCIES[index%ZONE_CURRENCIES.length];return index<4?currency:{...currency,name:currency.name+' · Zone '+(index+1)};}
function zoneShopUnlocked(index){return Number.isInteger(index)&&index>=0&&index<=9999&&(data.devTravelUnlocked||data.cleared>=zoneStart(index)-1||zoneNumber()===index);}
function zoneShopFor(index=zoneNumber()){
 if(!data.zoneShops||typeof data.zoneShops!=='object'||Array.isArray(data.zoneShops))data.zoneShops={};
 const key=String(Math.max(0,Math.min(9999,Math.floor(Number(index)||0))));
 if(!data.zoneShops[key])data.zoneShops[key]={currency:0,earned:0,ranks:{}};
 return data.zoneShops[key];
}
function dungeonProgress(total=data.dungeoneeringXp||0){
 total=Math.max(0,Number(total)||0);const level=1+Math.floor(Math.sqrt(total/DUNGEONEERING_XP_STEP));
 const previous=DUNGEONEERING_XP_STEP*(level-1)**2,next=DUNGEONEERING_XP_STEP*level**2;
 return {level,total,xp:total-previous,required:next-previous};
}
function masterySpent(m){return Object.entries(TALENTS).reduce((sum,[key,t])=>sum+t.cost.slice(0,Math.max(0,Math.min(t.max,Math.floor(Number(m?.[key])||0)))).reduce((a,b)=>a+b,0),0);}
function normalizeGlobalMastery(){
 const source=data.dungeonMastery&&typeof data.dungeonMastery==='object'?data.dungeonMastery:{};
 const m={points:Math.max(0,Math.min(1e12,Math.floor(Number(source.points)||0))),earned:Math.max(0,Math.min(1e12,Math.floor(Number(source.earned)||0))),intensity:0};
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
   const index=Number.isInteger(legacy.index)&&legacy.index>=0?legacy.index:zoneNumber(),bucket=zoneShopFor(index);
   bucket.ranks=bucket.ranks&&typeof bucket.ranks==='object'?bucket.ranks:{};
   for(const [id,value]of Object.entries(legacy.upgrades||{}))if(Object.hasOwn(UPGRADE_CAPS,id))bucket.ranks[id]=Math.max(bucket.ranks[id]||0,Math.min(UPGRADE_CAPS[id],Math.max(0,Math.floor(Number(value)||0))));
   const level=Math.max(1,Math.min(500,Math.floor(Number(legacy.level)||1)));
   for(let n=1;n<level;n++)xp+=n===1?23:20+12*n+3*n*n;
   xp+=Math.max(0,Number(legacy.xp)||0);
   const credit=Math.max(0,Math.floor(Number(legacy.pending)||0))*3;bucket.currency=(Number(bucket.currency)||0)+credit;bucket.earned=Math.max(Number(bucket.earned)||0,bucket.currency);
  }
  data.dungeoneeringXp=xp;const levels=dungeonProgress(xp).level-1;m.points+=levels;m.earned+=levels;data.zoneShopVersion=1;
 }
 data.dungeoneeringXp=Math.max(0,Math.min(1e12,Number(data.dungeoneeringXp)||0));
 const source=data.zoneShops&&typeof data.zoneShops==='object'&&!Array.isArray(data.zoneShops)?data.zoneShops:{};data.zoneShops={};
 for(const [key,value]of Object.entries(source)){
  if(!/^\d+$/.test(key)||Number(key)>9999||!value||typeof value!=='object')continue;
  const currency=Math.max(0,Math.min(1e12,Math.floor(Number(value.currency)||0))),ranks={};
  for(const [id,rank]of Object.entries(value.ranks||{}))if(Object.hasOwn(UPGRADE_CAPS,id))ranks[id]=Math.max(0,Math.min(UPGRADE_CAPS[id],Math.floor(Number(rank)||0)));
  data.zoneShops[key]={currency,earned:Math.max(currency,Math.min(1e12,Math.floor(Number(value.earned)||0))),ranks};
 }
 normalizeGlobalMastery();normalizeZoneAbilities();
}
function masteryFor(){return data.dungeonMastery||normalizeGlobalMastery();}
function masteryUnlocked(){return masteryFor().earned>0;}
function masteryNewDraft(){return {biome:-1,...masteryFor()};}

function rareDropChance(){return Math.min(.30,.015*(1+.25*masteryFor().adaptation)+trinketBonus('find'));}

function waveRank(id,source){return zoneUpgradeRank(id,zoneNumber(),source);}
function waveDamageFactor(){return 1;}
function waveHasteFactor(){return 1+.015*waveRank('haste');}
function waveReachFactor(){return 1+.03*waveRank('reach');}
function waveSwiftFactor(){return 1+.02*waveRank('swift');}
function waveCritChance(){return .05+.015*waveRank('crit');}
function waveVitality(){return 5*waveRank('vitality');}
function zoneCombatProfile(id=data.weaponType,options={}){
 const index=options.zone??zoneNumber(),ranks=options.ranks||zoneShopFor(index).ranks,style=styleForWeapon(id),w=WEAPON_TYPES[id],s=data.styles[style],stats=styleStats(style);
 const rank=options.rank??s.weapon,speed=options.speed??stats.speedPercent,percent=options.percent??stats.damagePercent;
 const base=14*w.power/w.cooldown*1.05,gearDamage=weaponDamageBase(id,rank)*w.power*(1+percent/100),gearCooldown=w.cooldown/(1+speed/100),gear=gearDamage/gearCooldown*1.05;
 const training=base+(.8*shopBudget(index)-base)*SHOP_TRAINING[zoneUpgradeRank('might',index,ranks)];
 const equipmentGain=Math.max(0,gear-base),trainingGain=Math.max(0,training-base),core=base+Math.max(equipmentGain,trainingGain)+.15*Math.min(equipmentGain,trainingGain);
 const haste=1+.015*zoneUpgradeRank('haste',index,ranks),crit=.05+.015*zoneUpgradeRank('crit',index,ranks),extra=['bow','staff'].includes(id)?zoneUpgradeRank('multishot',index,ranks):0;
 const raw=core*haste*(1+crit)/1.05*(1+.15*extra),budget=shopBudget(index),dps=raw<=budget?raw:budget+(raw-budget)*.25,factor=raw?dps/raw:1;
 return {dps,raw,core,gear,training,budget,crit,extra,cooldown:gearCooldown/haste,damage:core*gearCooldown/1.05*factor,softFactor:factor};
}
function weaponDps(id=data.weaponType,options={}){
 const style=styleForWeapon(id),w=WEAPON_TYPES[id],stats=styleStats(style);
 if(options.ceiling||options.equipmentOnly){
  const rank=options.ceiling?styleUpgradeCap(style,'weapon'):data.styles[style].weapon+(options.next?1:0),speed=options.ceiling?styleUpgradeCap(style,'speed')*2:stats.speedPercent;
  const percent=options.ceiling?(style==='magic'?(styleTier(style)===2?8:4):0)+(options.dedicated?8:0):stats.damagePercent;
  return weaponDamageBase(id,rank)*w.power*(1+percent/100)*(1+speed/100)/w.cooldown*1.05;
 }
 return zoneCombatProfile(id,{rank:data.styles[style].weapon+(options.next?1:0)}).dps*(options.run?eliteBoonValue('damage')*eliteBoonValue('attackSpeed'):1);
}
function attackCooldown(){return zoneCombatProfile().cooldown/eliteBoonValue('attackSpeed');}

function grantZoneCurrency(amount,index=zoneNumber()){
 amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return 0;const b=zoneShopFor(index);b.currency+=amount;b.earned+=amount;if(!data.zoneShopIntroduced){data.zoneShopIntroduced=true;toast('Zone Shop','Unlock abilities with '+zoneCurrency(index).name);}codexDiscover('zone_currency_'+(index%4));
 const node=$('zoneCurrencyHud');if(node){node.classList.remove('currency-gain');requestAnimationFrame(()=>node.classList.add('currency-gain'));}return amount;
}
function buyZoneUpgrade(id,index=shopZone){
 if(!zoneShopUnlocked(index))return false;const b=zoneShopFor(index),cost=shopUpgradeCost(id,index);if(cost===null||b.currency<cost)return false;
 const old=game.player.maxHp,previous=b.ranks[id]||0;b.currency-=cost;b.ranks[id]=(b.ranks[id]||0)+1;codexDiscover(zoneAbility(id,index).codex);
 if(index===zoneNumber()){
  game.upgrades={...b.ranks};if(id==='fire'&&previous)for(const enemy of game.enemies)if(enemy.burn>0){enemy.burnDps*=b.ranks.fire/previous;enemy.burn+=.1;}game.player.maxHp=maxHp()+waveVitality();game.player.hp=Math.min(game.player.maxHp,game.player.hp+Math.max(0,game.player.maxHp-old));
 }
 shopSignature='';save();refreshUI();return true;
}
function zoneSnapshot(){const p=dungeonProgress();return {index:zoneNumber(),upgrades:{...zoneShopFor().ranks},level:p.level,xp:p.xp,required:p.required,pending:0};}
function normalizeZone(){normalizeZoneShopProgression();data.zone=zoneSnapshot();}
function syncZone(){data.zone=zoneSnapshot();game.upgrades={...zoneShopFor().ranks};const p=dungeonProgress();game.runLevel=p.level;game.runXp=p.xp;game.requiredXp=p.required;game.pendingLevels=0;checkpointGroundXp();}
function gainXp(amount){
 if(!Number.isFinite(amount)||amount<=0)return;const before=dungeonProgress().level;data.dungeoneeringXp+=amount;const after=dungeonProgress().level;
 if(after>before)toast('Dungeoneering '+after);
 syncZone();
}
function showUpgrade(){game.pendingLevels=0;if(game.status==='upgrade')game.status='running';return false;}
function selectUpgrade(){return false;}
function showMasteryIntroduction(){if(data.masteryIntroSeen||!masteryUnlocked())return;data.masteryIntroSeen=true;save();toast('Mastery unlocked','2× Delve speed');}
function startFloor(){game.scene='combat';game.manualPaused=game.menuPaused=false;resetRun();game.status='running';hideOverlay();setScene('combat',false);nextPhase();updatePauseHud();refreshUI();announceZone2TravelTip();}
function applyMastery(){
 if(!masteryDraft||!masteryChanged()){masteryClose(true);return;}
 const m=masteryFor(),v=masteryDraft,total=m.points+masterySpent(m),cost=masterySpent(v);if(cost>total)return;
 for(const key of Object.keys(TALENTS)){m[key]=Math.max(0,Math.min(TALENTS[key].max,v[key]));if(m[key])codexDiscover('permanent_talent_'+key);}
 m.points=total-cost;m.intensity=Math.min(v.intensity,m.onslaught);masteryDraft=null;
 const live=game.status==='running';if(live){syncZone();resetRun();game.status='running';game.manualPaused=game.menuPaused=true;nextPhase();}
 save();refreshUI();masteryClose(true);updatePauseHud();toast('Mastery applied',live?'Floor restarted · paused':'');
}
function hurt(amount){const p=game.player;p.hitPose=.26;if(game.status!=='running'||p.invuln>0)return;const damage=amount*(1-styleStats().guardPercent/100)*(1-trinketBonus('guard'))*(1-.02*waveRank('ward'))*(data.weaponType==='shield'?.72:1)*eliteBoonValue('protection');p.hp-=damage;p.invuln=.47;game.shake=6;floater(p.x,p.y-31,'-'+Math.ceil(damage),'#ffb5a5');burst(p.x,p.y,5,'#fa8b87');if(p.hp<=0){p.hp=0;die();}}
function powerSummary(id,rank,index=zoneNumber()){
 const r=Math.max(0,Math.min(zoneAbilityCap(id,index),rank));
 const flat={haste:'+'+(r*1.5).toFixed(1)+'% attack speed',cleave:r?'+'+r+' melee target'+(r===1?'':'s'):'No cleave',reach:'+'+r*3+'% melee reach',ward:r*2+'% protection',vitality:'+'+r*5+' HP',crit:(5+r*1.5).toFixed(1)+'% critical chance',multishot:r?'+'+r+' projectile'+(r===1?'':'s')+' · 15% damage':'No echoes',pierce:r?'+'+r+' pierce'+(r===1?'':'s')+' · 84% damage':'No pierce',storm:r?r*4+'% chain chance · '+(20+r*3)+'% damage':'No chain',fire:r?(r*2)+'% hit damage / s · '+(2.5+r*.1).toFixed(1)+'s':index%4===0?'No venom':'No burn',frost:r?(5+r*2)+'% slow · '+(1+r*.1).toFixed(1)+'s':'No slow',nova:r?Math.min(5,1+Math.floor(r/3))+' targets · '+(6+r*2)+'% critical splash':'No nova',swift:'+'+r*2+'% movement',magnet:'+'+r*12+' pickup range',regen:(r*.08).toFixed(2)+' HP / s',wisdom:'+'+r*3+'% Dungeoneering XP',forage:'+'+r*4+'% guardian / elite gold'};
 if(id==='might')return Math.round((14*WEAPON_TYPES[data.weaponType].power/WEAPON_TYPES[data.weaponType].cooldown*1.05)+(.8*shopBudget(index)-14*WEAPON_TYPES[data.weaponType].power/WEAPON_TYPES[data.weaponType].cooldown*1.05)*SHOP_TRAINING[r])+' training DPS';return flat[id]||'';
}
function powerCompact(id,rank){return powerSummary(id,rank);}
function powerIncrement(id,rank=0){return powerSummary(id,Math.min(UPGRADE_CAPS[id],rank+1));}
function powerGain(id){return powerIncrement(id,zoneUpgradeRank(id));}

function onKill(e){
 if(!game.enemies.includes(e))return;clearOwnerMechanics(e);flushBurnDamage(e);game.enemies.splice(game.enemies.indexOf(e),1);earnStyleXp(e.boss?10:e.elite?4:1,e.lastDamageStyle||combatStyle());game.runKills++;game.phaseKills++;
 const b=biome();burst(e.x,e.y,e.boss?18:game.enemies.length>65?2:8,b.accent);game.shake=e.boss?7:1.5;
 const seals=e.boss?ZONE_ABILITY_REWARDS.guardians[e.bossIndex]:e.elite?ZONE_ABILITY_REWARDS.elite:Math.random()<currencyDropChance()?1:0;grantZoneCurrency(seals);
 if(e.boss){
  const index=e.bossIndex,m=masteryFor(),reward=guardianMasteryReward(e);m.points+=reward;m.earned+=reward;
  grantDelveGold(delveGoldReward('guardian',data.floor,index)*(1+trinketBonus('gold'))*(1+.04*waveRank('forage')));data.essence+=index===2?2:1;
  for(let n=0;n<7;n++)game.gems.push({x:e.x+rand(-35,35),y:e.y+rand(-35,35),value:14*3/zoneFloorCount()*(1+.03*waveRank('wisdom'))*(1+trinketBonus('xp'))});
  toast(e.name+' defeated','+'+seals+' '+zoneCurrency().name+(reward?' · +'+reward+' Mastery':''));save();game.boss=null;
  if(game.status==='running'){finishPhase();if(reward)showMasteryIntroduction();}else game.transition=.85;
 }else{
  dropHealth(e);dropEliteSpoils(e);
  if(Math.random()<rareDropChance()){const index=biomeIndex();data.biomeLoot[index]=(data.biomeLoot[index]||0)+1;codexDiscover('loot_'+index);if(game.enemies.length<40)floater(e.x,e.y-26,'◆ '+biomeLootName(),'#d5f4ab');}
  if(e.elite)grantDelveGold(delveGoldReward('elite')*(1+trinketBonus('gold'))*(1+.04*waveRank('forage')));
  const xp=(e.elite?2:1)*(8+Math.floor(combatDepth()/3))*(1+.03*waveRank('wisdom'))*(1+trinketBonus('xp'));
  if(game.gems.length>240)gainXp(xp);else game.gems.push({x:e.x+rand(-7,7),y:e.y+rand(-7,7),value:xp});
  if(game.phaseKills>=game.phaseTarget)finishPhase();
 }
}
function clearFloor(){
 game.status='clear';game.phase=6;const floor=data.floor,clearedZone=zoneNumber(),clearedStage=zoneStage(),clearedName=biome().name,award=grantDelveGold(delveGoldReward('floor',floor)),essence=2+Math.floor(floor/2);
 game.lastClearedZone=clearedZone;game.lastClearedFloor=floor;data.essence+=essence;codexDiscover('permanent_essence');data.cleared=Math.max(data.cleared,floor);syncZone();
 const frontier=Math.max(1,data.cleared+1),replay=floor<frontier-1,ending=isZoneFinal();
 data.floor=replay&&ending?zoneStart(clearedZone):floor+1;data.zone=zoneSnapshot();game.upgrades={...zoneShopFor().ranks};ensureJobs();if(ending)codexDiscover('biome_'+biomeIndex());save();
 const idle=floor===1&&data.cleared===1||ending&&clearedZone===0&&data.cleared===zoneEnd(0);
 showOverlay('<div class="floor-result"><h2>'+(ending?'Zone cleared':'Floor cleared')+'</h2><p>'+clearedName+' · Floor '+clearedStage+'</p><div class="floor-rewards"><span>'+artHTML('coins')+'+'+award+'</span><span>'+artHTML('essence')+'+'+essence+'</span></div>'+(idle?'<button type="button" class="secondary-cta idle-unlock-cta" id="selectIdleTask">'+uiIcon('idle')+'Select idle task</button>':'')+'<button type="button" class="secondary-cta" id="clearZoneShop">'+artHTML('zone-shop')+'Zone Shop</button><button type="button" class="primary-cta" id="nextFloor">Continue'+uiIcon('arrow')+'</button></div>','floor-clear-overlay');
 $('nextFloor').onclick=startFloor;$('clearZoneShop').onclick=()=>openZoneShop(clearedZone);if($('selectIdleTask'))$('selectIdleTask').onclick=openIdleHub;refreshUI();
 if(idle)toast('Idle unlocked','Select an idle task');
}
function expectedAttacks(hp,damage,crit=.05){const n=Math.max(1,Math.ceil(hp/damage-1e-9));let previous=0,current=1;for(let i=2;i<=n;i++){const next=1+(1-crit)*current+crit*previous;previous=current;current=next;}return current;}
function zoneBalance(index=zoneNumber()){
 index=Math.max(0,Math.floor(Number(index)||0));if(ZONE_BALANCE_CACHE.has(index))return ZONE_BALANCE_CACHE.get(index);
 const minutes=index===0?10:index===1?20:index===2?30:Math.min(40,35+index-3),floors=zoneFloorCount(index),gearTier=index===0?1:2,weaponRank=index===0?10:20,speedRank=index===0?5:10;
 const base=14/.88*1.05,first=80/1.1,second=160/1.2,gear=(weaponRank<=10?base+(first-base)*weaponRank/10:first+(second-first)*(weaponRank-10)/10)*(1+speedRank*.02);
 const core=gear,crit=.05,cooldown=.88/(1+speedRank*.02),raw=core*(1+crit)/1.05,dps=raw<=shopBudget(index)?raw:shopBudget(index)+(raw-shopBudget(index))*.25,hit=dps*cooldown/(1+crit);
 const counts=[SWARM_TARGETS[0],SWARM_TARGETS[2],SWARM_TARGETS[4]].map(n=>Math.max(7,Math.round(n*.4*Math.min(2.5,1+index*.5)*3/floors))),targets=[counts[0],0,counts[1],0,counts[2],0],swarmCount=counts.reduce((a,b)=>a+b,0)*floors;
 const model={index,minutes,seconds:minutes*60,floors,weaponRank,speedRank,proficiency:1,gearTier,shopRanks:{},crit,hit,cooldown,dps,targets,swarmCount,spawnSeconds:minutes*60*.55/swarmCount,hpScale:1};
 const forecast=scale=>{let seconds=floors*6*.72;for(let floor=0;floor<floors;floor++)for(let phase=0;phase<6;phase++){
  const boss=phase%2===1,progress=2*floor/Math.max(1,floors-1),baseHp=boss?[160,230,360][Math.floor(phase/2)]*(phase===5?(floor===floors-1?3.2:1.75):1):30+phase*4,hp=baseHp*Math.pow(1.14,progress)*scale;
  if(boss)seconds+=expectedAttacks(hp,hit,crit)*cooldown+1.5;
  else{const echoes=floor===0?(phase===0?0:1):zoneVisualBand(index,floor+1),eligible=Math.max(0,targets[phase]-3-echoes),rare=1-Math.pow(1-RARE_ELITE_CHANCE,eligible),regular=Math.max(0,targets[phase]-echoes-rare);let attacks=0;
   for(let sample=0;sample<21;sample++)attacks+=(regular*expectedAttacks(hp*(.9+sample*.01),hit,crit)+echoes*expectedAttacks(hp*(.9+sample*.01)*2.8,hit,crit)+rare*expectedAttacks(hp*(.9+sample*.01)*3.5,hit,crit))/21;
   seconds+=Math.max(attacks*cooldown,(targets[phase]-1)*model.spawnSeconds+1.5);
  }
 }return seconds;};
 let lo=.001,hi=1;while(forecast(hi)<model.seconds)hi*=2;for(let n=0;n<38;n++){const mid=(lo+hi)/2;if(forecast(mid)<model.seconds)lo=mid;else hi=mid;}
 model.hpScale=(lo+hi)/2;model.forecastSeconds=forecast(model.hpScale);ZONE_BALANCE_CACHE.set(index,model);return model;
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
