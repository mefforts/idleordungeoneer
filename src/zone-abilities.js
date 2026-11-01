/* Small, biome-specific abilities. Ordinary statistics come from equipment. */
const ZONE_ABILITIES=[
 [{id:'fire',name:'Briar Venom',max:8,base:8},{id:'frost',name:'Grasping Roots',max:5,base:8},{id:'cleave',name:'Bramble Sweep',max:3,base:18,melee:true},{id:'ward',name:'Barkskin',max:5,base:8}],
 [{id:'fire',name:'Cinderbrand',max:8,base:8},{id:'nova',name:'Slagburst',max:5,base:8},{id:'pierce',name:'Searing Shot',max:3,base:18,ranged:true},{id:'ward',name:'Basalt Guard',max:5,base:8}],
 [{id:'storm',name:'Soul Chain',max:5,base:10},{id:'frost',name:'Grave Chill',max:5,base:8},{id:'nova',name:'Soulburst',max:5,base:8},{id:'ward',name:'Bone Ward',max:5,base:8}],
 [{id:'storm',name:'Arc Rift',max:5,base:10},{id:'multishot',name:'Mirrorcast',max:3,base:24,ranged:true},{id:'cleave',name:'Phase Sweep',max:3,base:18,melee:true},{id:'ward',name:'Astral Ward',max:5,base:8}]
];
const ZONE_ABILITY_REWARDS={monsterChance:.04,elite:6,guardians:[12,20,35]};
function zoneAbilities(index=zoneNumber()){
 const kind=Math.max(0,Math.floor(Number(index)||0))%4;
 return ZONE_ABILITIES[kind].map(a=>({...a,art:'zone-ability-'+kind+'-'+a.id,codex:'zone_ability_'+kind+'_'+a.id}));
}
function zoneAbility(id,index=zoneNumber()){return zoneAbilities(index).find(a=>a.id===id);}
function zoneAbilityCap(id,index=zoneNumber()){return zoneAbility(id,index)?.max||0;}
function legacyZoneUpgradeCost(id,index,rank){
 if(!Object.hasOwn(UPGRADE_CAPS,id)||rank>=UPGRADE_CAPS[id])return 0;
 const scale=1+.15*Math.min(index,10);let cost;
 if(id==='might')cost=rank<SHOP_MIGHT_COSTS.length?SHOP_MIGHT_COSTS[rank]:480*Math.pow(2.1,rank-9);
 else if(['multishot','cleave','pierce'].includes(id))cost=SHOP_BASE_COST[id]*Math.pow(6,rank);
 else cost=SHOP_BASE_COST[id]*Math.pow(1.65,Math.min(rank,4))*Math.pow(2.35,Math.max(0,rank-4));
 return Math.ceil(cost*scale);
}
function normalizeZoneAbilities(){
 const migrating=data.zoneAbilityVersion!==1;
 if(!data.zoneAbilityRefunds||typeof data.zoneAbilityRefunds!=='object')data.zoneAbilityRefunds={};
 if(!data.discovered||typeof data.discovered!=='object')data.discovered={};
 for(const [key,bucket]of Object.entries(data.zoneShops||{})){
  const index=Number(key),ranks={};let refund=0;const retired={};
  for(const [id,value]of Object.entries(bucket.ranks||{})){
   const rank=Math.max(0,Math.min(UPGRADE_CAPS[id]||0,Math.floor(Number(value)||0))),keep=Math.min(rank,zoneAbilityCap(id,index));
   if(keep){ranks[id]=keep;data.discovered['zone_ability_'+index%4+'_'+id]=1;}
   if(migrating&&keep<rank){for(let n=keep;n<rank;n++)refund+=legacyZoneUpgradeCost(id,index,n);retired[id]=rank-keep;}
  }
  bucket.ranks=ranks;
  if(migrating&&refund){bucket.currency=Math.min(1e12,bucket.currency+refund);bucket.earned=Math.max(bucket.earned,bucket.currency);data.zoneAbilityRefunds[key]={ranks:retired,currency:refund};}
 }
 data.zoneAbilityVersion=1;
}
function installZoneAbilityCodex(){
 for(let i=CODEX_ITEMS.length-1;i>=0;i--)if(CODEX_ITEMS[i].id.startsWith('upgrade_'))CODEX_ITEMS.splice(i,1);
 for(let kind=0;kind<4;kind++)for(const a of zoneAbilities(kind))if(!CODEX_ITEMS.some(e=>e.id===a.codex))CODEX_ITEMS.push({id:a.codex,cat:'Zone Abilities',name:a.name,desc:BIOMES[kind].name+' · '+a.name});
}
function shopUpgradeCost(id,index=zoneNumber(),rank=zoneUpgradeRank(id,index)){
 const ability=zoneAbility(id,index);if(!ability||rank>=ability.max)return null;
 const scale=1+.15*Math.min(index,10),growth=['cleave','pierce','multishot'].includes(id)?Math.pow(6,rank):Math.pow(1.65,Math.min(rank,4))*Math.pow(2.35,Math.max(0,rank-4));
 return Math.ceil(ability.base*growth*scale);
}
function currencyDropChance(){return Math.min(.20,ZONE_ABILITY_REWARDS.monsterChance*(1+.1*masteryFor().fortune));}
function zoneUpgradeRank(id,index=zoneNumber(),ranks){const source=ranks||zoneShopFor(index).ranks;return Math.min(zoneAbilityCap(id,index),Math.max(0,Math.floor(Number(source[id])||0)));}
function zoneAbilityDetails(id,index=zoneNumber()){
 const a=zoneAbility(id,index);if(!a)return '';
 const descriptions={fire:index%4===0?'Weapon hits poison their target.':'Weapon hits burn their target.',frost:'Weapon hits slow their target.',cleave:'Melee swings reach additional targets.',pierce:'Bow and staff projectiles pass through additional targets, retaining 84% damage after each.',multishot:'Bow and staff attacks release additional projectiles. Each extra projectile deals 15% damage.',storm:'Weapon hits can arc to another nearby enemy.',nova:'Critical hits splash nearby enemies.',ward:'Take less damage while in this Zone.'};
 return descriptions[id]||'';
}
function zoneAbilityCodexHtml(entry){
 const [, ,kindText,...idParts]=entry.id.split('_'),index=Number(kindText),id=idParts.join('_'),a=zoneAbility(id,index);
 if(!a)return codexParagraph(entry.desc);
 return codexParagraph(zoneAbilityDetails(id,index))+codexRuleList([['Zone',BIOMES[index].name],['Ranks',a.max],['Rank 1',powerSummary(id,1,index)],['Maximum',powerSummary(id,a.max,index)]])+codexParagraph('Purchased ranks remain in their Zone through defeat, travel and replay. Later Zones that repeat this environment have separate purchases.')+codexHeading('Seals',codexRuleList([['Ordinary monsters','4% chance of 1 seal'],['Elite echoes','6 seals'],['Guardians','12 / 20 / 35 seals']]))+codexParagraph('Weapon damage and speed come from equipment. Jewelry provides bonuses such as gold, experience and life steal.');
}
function shopCard(upgrade){
 const id=upgrade.id,b=zoneShopFor(shopZone),rank=zoneUpgradeRank(id,shopZone),cost=shopUpgradeCost(id,shopZone),locked=!zoneShopUnlocked(shopZone),max=cost===null;
 const effect='<span>'+powerSummary(id,rank,shopZone)+'</span>'+(max?'':'<small>'+uiIcon('arrow')+powerSummary(id,rank+1,shopZone)+'</small>');
 return '<article class="zone-upgrade" tabindex="-1" data-focus-key="zone-card-'+id+'"><span class="zone-upgrade-art">'+artHTML(upgrade.art)+'</span><div class="zone-upgrade-copy"><div class="recipe-title"><h4>'+upgrade.name+'</h4>'+codexLink(upgrade.codex,upgrade.name+' details')+'</div><small class="shop-rank">Rank '+rank+' / '+upgrade.max+'</small><div class="shop-effect">'+effect+(upgrade.melee?'<small>Melee</small>':upgrade.ranged?'<small>Bow / Staff</small>':'')+'</div></div><button type="button" class="shop-buy" data-buy-zone="'+id+'" data-focus-key="zone-buy-'+id+'" aria-label="'+escapeHTML(max?upgrade.name+' maxed':'Buy '+upgrade.name+' rank '+(rank+1)+' for '+cost+' '+zoneCurrency(shopZone).name)+'" '+(max||locked||b.currency<cost?'disabled':'')+'>'+(max?uiIcon('check')+'<span>Max</span>':artHTML(zoneCurrency(shopZone).art)+'<span>'+uiCompact(cost)+'</span>'+uiIcon('plus'))+'</button></article>';
}
