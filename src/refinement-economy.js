/* Short Iron preparation, long Steel goals and tier-local weapon refinements. */
const REFINEMENT_ECONOMY=BALANCE_CONFIG.refinement;
// Calibrated against the all-style 80% material ledger; npm run report:skills.
const SKILL_TRAINING_RATES=BALANCE_CONFIG.skills.trainingRates;
function trainingXpMultiplier(group,tier=1){return tier>=2?(BALANCE_CONFIG.skills.ratesByTier?.[tier]?.[group]??SKILL_TRAINING_RATES[group]??1):1;}
function normalizeRefinementRanks(){
 if(data.refinementRanksVersion===1)return;
 const archive=data.refinementRankArchive={};
 for(const [id,s]of Object.entries(data.styles)){
  const rank=finiteRank(s.weapon),tier=data.tierProgressionVersion===1?Math.max(1,Math.min(maximumEquipmentTier(),s.tier||1)):tier2Unlocked()&&rank>=10?2:1;
  archive[id]={weapon:rank,tier};
  const fraction=Math.max(0,Math.min(1,(rank-(tier-1)*10)/10));
  s.weapon=Math.min(TIER_LIMITS[tier].weapon,Math.ceil(fraction*TIER_LIMITS[tier].weapon-1e-9));s.tier=tier;
 }
 data.refinementRanksVersion=1;
}
function weaponPowerRank(id=data.weaponType,rank=data.styles[styleForWeapon(id)].weapon){
 const tier=styleTier(styleForWeapon(id)),cap=TIER_LIMITS[tier].weapon;
 return (tier-1)*10+Math.max(0,Math.min(cap,rank))/cap*10;
}
function weaponDamageBase(id=data.weaponType,rank=data.styles[styleForWeapon(id)].weapon){
 const w=WEAPON_TYPES[id],tier=styleTier(styleForWeapon(id)),t=TIER_LIMITS[tier],previous=TIER_LIMITS[tier-1],speed=BALANCE_CONFIG.equipment.speedPerRank,crit=BALANCE_CONFIG.equipment.baseCriticalChance;
 const starter=BALANCE_CONFIG.equipment.baseWeaponDamage*w.power/w.cooldown*(1+crit),start=tier===1?starter:(t.floor||previous.power)/(1+previous.speed*speed),end=t.power/(1+t.speed*speed),progress=Math.max(0,Math.min(1,rank/t.weapon));
 const budget=start+(end-start)*progress,robes=BALANCE_CONFIG.equipment.armorStyles.magic.perk,robeAllowance=styleForWeapon(id)==='magic'?((robes[tier-2]||0)+((robes[tier-1]||0)-(robes[tier-2]||0))*progress)/100:0;
 return budget*w.cooldown/w.power/(1+crit)/(1+robeAllowance);
}
function promotionDetails(style){const tier=styleTier(style)+1;return {tier,rank:tier===2?TIER_LIMITS[1].weapon:0,level:equipmentTierSkillLevel(tier),cost:BALANCE_CONFIG.equipment.promotionCosts[tier]?.[style]||{},name:TIER_LIMITS[tier]?.name||'Next tier'};}
function styleUpgradeMaterials(id,kind,rank=data.styles[id][kind]||0){
 const tier=kind==='armor'?ownedArmorTier(id):styleTier(id),local=kind==='weapon'?rank:tier>1?Math.max(0,rank-TIER_LIMITS[tier-1][kind]):rank;
 if(tier===1){
  if(kind==='weapon'){const q=Math.pow(2,local);return {bars:Math.ceil(8*q),...(id==='ranged'?{logs:Math.ceil(4*q)}:id==='magic'?{cloth:Math.ceil(6*q)}:{}),gold:18+local*9};}
  if(kind==='armor')return id==='melee'?{bars:6+local*5,gold:25+local*20}:id==='ranged'?{bars:3+local*2,cloth:6+local*4,gold:25+local*20}:{bars:2+local,cloth:12+local*6,gold:25+local*20};
  if(kind==='enchant')return {bars:4+local*3,essence:2+local*2,cutOpals:1};
  return {bars:5+local*3,...(id==='ranged'?{logs:8+local*4}:id==='magic'?{cloth:8+local*4}:{}),gold:kind==='speed'?preparationUpgradeGold(1,kind,rank):35+local*20};
 }
 const resources=BALANCE_CONFIG.equipment.resources[tier],material=resources.metal,wood=resources.wood,cloth=resources.cloth,fragments=resources.fragments,gem=resources.gem;
 const growth=kind==='weapon'?(tier===3?REFINEMENT_ECONOMY.mithrilGrowth:REFINEMENT_ECONOMY.steelGrowth):REFINEMENT_ECONOMY.otherGrowth,q=Math.pow(growth,local);
 const cost={[material]:Math.ceil((kind==='armor'&&id!=='melee'?4:8)*q),gold:kind==='weapon'?45+local*(tier===3?32:22):kind==='speed'?45+local*22:75+local*35};
 if(id==='ranged')cost[wood]=Math.ceil(8*q*(REFINEMENT_ECONOMY.styleMaterialScale[id]||1));
 if(id==='magic'||kind==='armor'&&id==='ranged')cost[cloth]=Math.ceil((id==='magic'?12:6)*q*(REFINEMENT_ECONOMY.styleMaterialScale[id]||1));
 if(kind==='weapon'){cost[fragments]=Math.ceil(3*q);cost[gem]=Math.ceil(4*q);}
 if(kind==='enchant'){cost.essence=4+local*2;cost[gem]=1+local;}
 return cost;
}
