/* Dungeon-wide purchases. Zone Shop names remain as internal save/API adapters. */
const DUNGEONS=BALANCE_CONFIG.dungeons;
const DUNGEON_PERKS=BALANCE_CONFIG.rewards.perks;
const LEGACY_ZONE_PERKS=[
 [{id:'fire',max:8,base:8},{id:'frost',max:5,base:8},{id:'cleave',max:3,base:18},{id:'ward',max:5,base:8}],
 [{id:'fire',max:8,base:8},{id:'nova',max:5,base:8},{id:'pierce',max:3,base:18},{id:'ward',max:5,base:8}],
 [{id:'storm',max:5,base:10},{id:'frost',max:5,base:8},{id:'nova',max:5,base:8},{id:'ward',max:5,base:8}],
 [{id:'storm',max:5,base:10},{id:'multishot',max:3,base:24},{id:'cleave',max:3,base:18},{id:'ward',max:5,base:8}]
];
const ZONE_ABILITY_REWARDS=BALANCE_CONFIG.rewards.sigils;
function dungeonForZone(index=zoneNumber()){return balanceDungeon(index);}
function dungeonPerk(id,index=zoneNumber()){const p=DUNGEON_PERKS.find(p=>p.id===id);return p?{...p,...balanceDungeon(index).perkOverrides?.[id]}:null;}
function dungeonPerkCost(id,rank=0,index=zoneNumber()){const p=dungeonPerk(id,index);return !p||rank>=p.max?null:Math.ceil(p.base*Math.pow(balanceDungeon(index).perkCostGrowth||BALANCE_CONFIG.rewards.perkCostGrowth,rank));}
function legacyZoneUpgradeCost(id,index,rank){
 const p=LEGACY_ZONE_PERKS[index%4]?.find(a=>a.id===id);
 if(p)return Math.ceil(p.base*(1+.15*Math.min(index,10))*( ['cleave','pierce','multishot'].includes(id)?Math.pow(6,rank):Math.pow(1.65,Math.min(rank,4))*Math.pow(2.35,Math.max(0,rank-4))));
 if(!Object.hasOwn(UPGRADE_CAPS,id)||rank>=UPGRADE_CAPS[id])return 0;
 const scale=1+.15*Math.min(index,10);if(id==='might')return Math.ceil((rank<SHOP_MIGHT_COSTS.length?SHOP_MIGHT_COSTS[rank]:480*Math.pow(2.1,rank-9))*scale);
 return Math.ceil(SHOP_BASE_COST[id]*Math.pow(1.65,Math.min(rank,4))*Math.pow(2.35,Math.max(0,rank-4))*scale);
}
function normalizeDungeonShopProgression(){
 if(data.dungeonShopVersion!==1){
  const legacy=JSON.parse(JSON.stringify(data.zoneShops||{})),credits={};
  for(const [key,bucket]of Object.entries(legacy)){const zone=Math.max(0,Number(key)||0),id=BALANCE_CONFIG.mastery.legacyPerkDungeon;let seals=Math.max(0,Number(bucket.currency)||0);
   for(const [perk,value]of Object.entries(bucket.ranks||{})){const rank=Math.min(UPGRADE_CAPS[perk]||0,Math.max(0,Math.floor(Number(value)||0)));for(let n=0;n<rank;n++)seals+=legacyZoneUpgradeCost(perk,zone,n);}
   credits[id]=(credits[id]||0)+seals;
  }
  data.legacyZoneShops=legacy;data.dungeonShops=Object.fromEntries(Object.entries(credits).map(([id,seals])=>[id,{currency:Math.min(1e12,seals/25),earned:Math.min(1e12,seals/25),ranks:{}}]));
  data.dungeonShopMigration={seals:Object.values(credits).reduce((a,b)=>a+b,0),rate:25};data.dungeonShopVersion=1;
  data.zoneShops={};data.zoneAbilityVersion=2;
 }
 const source={...(data.archivedDungeonShops||{}),...(data.dungeonShops&&typeof data.dungeonShops==='object'&&!Array.isArray(data.dungeonShops)?data.dungeonShops:{})};data.archivedDungeonShops=Object.fromEntries(Object.entries(source).filter(([id])=>!DUNGEONS.some(d=>d.id===id)));data.dungeonShops={};
 for(const dungeon of DUNGEONS){const old=source[dungeon.id]||{},currency=Math.max(0,Math.min(1e12,Number(old.currency)||0));const ranks={};
  for(const base of DUNGEON_PERKS){const p=dungeonPerk(base.id,dungeon.firstZone),rank=Math.max(0,Math.min(p.max,Math.floor(Number(old.ranks?.[p.id])||0)));if(rank)ranks[p.id]=rank;}
  data.dungeonShops[dungeon.id]={currency,earned:Math.max(currency,Math.min(1e12,Number(old.earned)||0)),ranks};
 }
}
function dungeonShopFor(index=zoneNumber()){const id=dungeonForZone(index).id;if(!data.dungeonShops?.[id])normalizeDungeonShopProgression();return data.dungeonShops[id];}
function dungeonRank(id,ranks=dungeonShopFor().ranks){const p=dungeonPerk(id);return dungeonPerkUnlocked(p)?Math.min(p.max,Math.max(0,Math.floor(Number(ranks[id])||0))):0;}
function effectiveDungeonRank(id,style=combatStyle(),ranks=dungeonShopFor().ranks){
 if(id==='cleave')return style==='melee'?dungeonRank('technique',ranks):0;
 if(id==='pierce')return style==='ranged'?dungeonRank('technique',ranks):0;
 if(id==='multishot')return style==='ranged'?dungeonRank('echo',ranks):0;
 return dungeonRank(id,ranks);
}
function zoneAbilities(index=zoneNumber()){
 return DUNGEON_PERKS.map(base=>{const p=dungeonPerk(base.id,index);return {...p,art:'zone-ability-'+p.icon,codex:'dungeon_perk_'+p.id,...dungeonStylePerk(p.id,combatStyle())};});
}
function zoneAbility(id,index=zoneNumber()){return zoneAbilities(index).find(p=>p.id===id);}
function zoneAbilityCap(id){return dungeonPerk(id)?.max||0;}
function zoneUpgradeRank(id,index=zoneNumber(),ranks){return effectiveDungeonRank(id,combatStyle(),ranks||dungeonShopFor(index).ranks);}
function shopUpgradeCost(id,index=zoneNumber(),rank=dungeonShopFor(index).ranks[id]||0){return dungeonPerkCost(id,rank,index);}
function normalizeZoneAbilities(){normalizeDungeonShopProgression();}
function currencyDropChance(){return Math.min(.03,ZONE_ABILITY_REWARDS.monsterChance*(1+.1*masteryFor().fortune));}
function dungeonCurrencyReward(enemy){
 if(enemy.summoned||enemy.totem)return 0;const multiplier=zoneTuning().sigilMultiplier;
 const scale=amount=>{const value=amount*multiplier;return Math.floor(value)+(value%1>0&&Math.random()<value%1?1:0);};
 if(enemy.boss)return scale(ZONE_ABILITY_REWARDS.guardians[enemy.bossIndex]+(enemy.bossIndex===2&&isZoneFinal()?ZONE_ABILITY_REWARDS.zoneFinalBonus:0));
 return Math.random()<(enemy.elite?ZONE_ABILITY_REWARDS.eliteChance:currencyDropChance())?scale(1):0;
}
function dungeonStylePerk(id,style){
 const names={technique:{melee:['Wide Sweep','Each rank adds one sweep target and 12% melee reach.'],magic:['Guided Hex','Projectiles seek targets, prioritizing elites and bosses. Each rank improves steering.'],ranged:['Piercing Flight','Projectiles pierce one more target per rank, keeping 84% damage after each.']},echo:{melee:['Echoing Cut','A hit can send a weak blade into another nearby target.'],magic:['Rebounding Spell','Projectiles ricochet to another enemy per rank, keeping 70% damage.'],ranged:['Many Arrows','Fire one extra arrow per rank, each dealing 15% damage.']},return:{melee:['Returning Slash','Occasional hits throw a blade that returns to you.'],magic:['Returning Orb','Occasional spells release an orb that returns to you.'],ranged:['Returning Shaft','Occasional shots release an arrow that returns to you.']}};
 const entry=names[id]?.[style];return entry?{name:entry[0],description:entry[1]}:{};
}
function zoneAbilityDetails(id,index=zoneNumber()){const p=zoneAbility(id,index);return p?.description||'';}
function installZoneAbilityCodex(){
 for(let i=CODEX_ITEMS.length-1;i>=0;i--)if(CODEX_ITEMS[i].id.startsWith('upgrade_')||CODEX_ITEMS[i].id.startsWith('zone_ability_')||CODEX_ITEMS[i].id.startsWith('zone_currency_'))CODEX_ITEMS.splice(i,1);
 for(const p of zoneAbilities()){SVG_FILES['codex-'+p.codex+'.svg']=iconAsset(p.art);if(!CODEX_ITEMS.some(e=>e.id===p.codex))CODEX_ITEMS.push({id:p.codex,cat:'Dungeon Abilities',name:dungeonPerk(p.id).name,desc:p.description||'Effects change with your combat style.'});}
}
function zoneAbilityCodexHtml(entry){
 const id=entry.id.replace('dungeon_perk_',''),p=dungeonPerk(id);if(!p)return codexParagraph(entry.desc);
 return codexParagraph(p.adaptive?'This purchase changes its effect with your equipped style. Its ranks are shared across Melee, Mage and Ranged.':p.description)+codexRuleList([['Unlock',perkUnlockLabel(p)],['Ranks',p.max],['Rank 1',powerSummary(id,1)],['Scope','All Zones in this Dungeon']])+(p.adaptive?codexHeading('By style',codexRuleList([['Melee',dungeonStylePerk(id,'melee').description],['Mage',dungeonStylePerk(id,'magic').description],['Ranged',dungeonStylePerk(id,'ranged').description]])):'')+codexParagraph('Dungeon Sigils come from guardians, rare creatures and occasional other kills. Reaching later Zones unlocks more choices. Dungeoneering points buy game time separately from Sigils. '+masteryMilestonesText()+'.');
}
function shopCard(upgrade){
 const id=upgrade.id,b=dungeonShopFor(shopZone),rank=b.ranks[id]||0,cost=dungeonPerkCost(id,rank,shopZone),locked=!dungeonPerkUnlocked(upgrade,shopZone),max=cost===null;
 return '<article class="zone-upgrade" tabindex="-1" data-focus-key="zone-card-'+id+'"><span class="zone-upgrade-art">'+artHTML(upgrade.art)+'</span><div class="zone-upgrade-copy"><div class="recipe-title"><h4>'+upgrade.name+'</h4>'+codexLink(upgrade.codex,upgrade.name+' details')+'</div><small class="shop-rank">Rank '+rank+' / '+upgrade.max+(upgrade.adaptive?' · Changes by style':'')+'</small><div class="shop-effect"><span>'+zoneAbilityDetails(id)+'</span><small>'+(locked?perkUnlockLabel(upgrade,shopZone):powerSummary(id,rank)+(max?'':' → '+powerSummary(id,rank+1)))+'</small></div></div><button type="button" class="shop-buy" data-buy-zone="'+id+'" data-focus-key="zone-buy-'+id+'" aria-label="'+escapeHTML(locked?perkUnlockLabel(upgrade,shopZone):max?upgrade.name+' maxed':'Buy '+upgrade.name+' rank '+(rank+1)+' for '+cost+' Dungeon Sigils')+'" '+(max||locked||b.currency<cost?'disabled':'')+'>'+(locked?uiIcon('lock')+'<span>Z'+(balanceDungeon(shopZone).firstZone+perkUnlockZone(upgrade,shopZone))+'</span>':max?uiIcon('check')+'<span>Max</span>':artHTML(zoneCurrency().art)+'<span>'+cost+'</span>'+uiIcon('plus'))+'</button></article>';
}
