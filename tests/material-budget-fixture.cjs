// Independent material accounting; injected into isolated test/report responses.
function materialBudgetFixture(){
 function budget(fraction=REFINEMENT_ECONOMY.targetFraction,options={}){
  const saved=data;
  try{
   data=defaults();data.floor=zoneStart(3);data.cleared=zoneEnd(2);normalizeProgression();
   const ledger={},costs=[],stock={gold:BALANCE_CONFIG.skills.reference.delveGoldCredit},work={},external={},xp={},seconds={};
   const add=(cost,label)=>{costs.push({label,cost:{...cost}});for(const [key,n]of Object.entries(cost))ledger[key]=(ledger[key]||0)+n;};
   for(const tier of [1,2]){
    data.ownedArmor=Object.keys(ARMOR_SETS).filter(id=>ARMOR_SETS[id].tier<=tier);
    for(const style of Object.keys(STYLE_DEFS)){
     data.styles[style].tier=tier;
     if(tier===1){const weapon=STYLE_DEFS[style].weapon,w=WEAPON_TYPES[weapon];if(weapon!=='sword')add({bars:w.cost[0],gold:w.cost[1],...(w.extras||{})},weapon);}
     add(ARMOR_SETS[style+'_'+tier].cost,style+' armor '+tier);
     if(tier===2)add(TIER_PROMOTION_COSTS[style],style+' Steel promotion');
     for(const kind of ['weapon','armor','speed','reach','enchant']){
      const start=kind==='weapon'?0:tier===1?0:TIER_LIMITS[1][kind],end=tier===1?TIER_LIMITS[1][kind]:Math.max(start,Math.round(TIER_LIMITS[2][kind]*fraction));
      for(let rank=start;rank<end;rank++)add(styleUpgradeBase(style,kind,rank),style+' '+tier+' '+kind+' '+(rank+1));
     }
    }
   }
   for(const [id,t]of Object.entries(TOOL_DEFS)){add(t.cost,id);for(let rank=0;rank<Math.round(TOOL_REFINEMENT.maximum*(fraction>=1?1:BALANCE_CONFIG.skills.reference.toolFraction));rank++){data.toolRefinements[id]=rank;add(toolRefinementBase(id),id+' '+(rank+1));}}
   for(const group of Object.keys(DISCIPLINES))for(let rank=0;rank<Math.round(BALANCE_CONFIG.production.station.maximum*(fraction>=1?1:BALANCE_CONFIG.skills.reference.stationFraction));rank++){data.stationLevels[group]=rank;add(stationUpgradeCost(group),group+' station '+(rank+1));}data.stationLevels=Object.fromEntries(Object.keys(DISCIPLINES).map(id=>[id,0]));
   for(const id of Object.keys(TRINKETS)){add(trinketCost(id),id);for(let rank=0;rank<(fraction>=1?JEWELRY_REFINEMENT.maximum:BALANCE_CONFIG.skills.reference.jewelryRanks);rank++){data.trinketRefinements[id]=rank;add(jewelryRefinementBase(id),id+' '+(rank+1));}}
   function ensure(resource,needed,depth=0){
    if(depth>12)throw Error('Material dependency cycle');
    if((stock[resource]||0)>=needed)return;
    const key=resource==='gold'?'ancientScavenge':RESOURCE_SOURCE[resource],skill=SKILLS[key];
    if(!skill){external[resource]=(external[resource]||0)+needed-(stock[resource]||0);stock[resource]=needed;return;}
    const yieldAmount=resource==='gold'?skill.goldGain:skill.amount;let batches=Math.ceil((needed-(stock[resource]||0))/yieldAmount);
    for(const [input,n]of Object.entries(skill.cost||{})){ensure(input,batches*n,depth+1);}
    batches=Math.max(0,Math.ceil((needed-(stock[resource]||0))/yieldAmount));
    for(const [input,n]of Object.entries(skill.cost||{}))stock[input]-=batches*n;
    stock[skill.resource]=(stock[skill.resource]||0)+batches*skill.amount;if(skill.goldGain){stock.gold=(stock.gold||0)+batches*skill.goldGain;const gem=skill.tier===3?'sapphires':skill.tier===2?'garnets':'opals';stock[gem]=(stock[gem]||0)+batches*(.07/(1-Math.pow(.93,20)));}
    work[key]=(work[key]||0)+batches;
   }
   // Gold searches supply salvage and their expected rough-gem finds first.
   const inputs=Object.entries(ledger).sort(([a],[b])=>a==='gold'?-1:b==='gold'?1:0);
   for(const [key,n]of inputs){ensure(key,n);stock[key]-=n;}
   for(const [key,batches]of Object.entries(work)){
    const group=disciplineFor(key),skill=SKILLS[key],tier=skill.tier||1,nominal=skill.gain*batches;
    const row=xp[group]||(xp[group]={tier1:0,tier2:0});row[tier===1?'tier1':'tier2']+=nominal;
    seconds[group]=(seconds[group]||0)+(options.idle?skill.seconds:ACTIVE_INTERVAL[key])*batches;
   }
   const training=Object.fromEntries(Object.keys(DISCIPLINES).map(group=>{const raw=xp[group]||{tier1:0,tier2:0},base=skillXpThreshold(10)+Math.max(0,raw.tier1-skillXpThreshold(10))*.1,unreduced=base+raw.tier2*trainingXpMultiplier(group,2),effective=unreduced<=skillXpThreshold(20)?unreduced:skillXpThreshold(20)+(unreduced-skillXpThreshold(20))*.01;return [group,{...raw,base,xp:effective,level:skillLevelAtXp(effective),percentOfLevel20:effective/skillXpThreshold(20),activeHours:(seconds[group]||0)/3600,calibratedRate:(skillXpThreshold(20)-base)/raw.tier2}];}));
   return {fraction,scope:'All three combat styles; complete Iron, Steel targets, eight jewelry pieces at the configured support rank, three tools and five stations',ledger,work,external,training,targets:{weapon:Math.round(TIER_LIMITS[2].weapon*fraction),speed:Math.round(TIER_LIMITS[2].speed*fraction),reach:Math.round(TIER_LIMITS[2].reach*fraction),armor:Math.round(TIER_LIMITS[2].armor*fraction),enchant:Math.round(TIER_LIMITS[2].enchant*fraction),jewelry:(fraction>=1?JEWELRY_REFINEMENT.maximum:BALANCE_CONFIG.skills.reference.jewelryRanks),tool:Math.round(TOOL_REFINEMENT.maximum*(fraction>=1?1:BALANCE_CONFIG.skills.reference.toolFraction)),station:Math.round(BALANCE_CONFIG.production.station.maximum*(fraction>=1?1:BALANCE_CONFIG.skills.reference.stationFraction))},costs};
  }finally{data=saved;}
 }
 window.__materialBudget={budget};
}
module.exports={materialBudgetFixture};
