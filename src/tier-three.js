/* Mithril equipment opens after the Astral Rift, at matching skill level 20. */
const MITHRIL_PROMOTION_COSTS={melee:{mithrilBars:12,yewLogs:6,enchantedFragments:4,cutSapphires:1,gold:250,zoneMaterials:2},ranged:{mithrilBars:6,yewLogs:18,verdantCloth:6,cutSapphires:1,gold:250,zoneMaterials:2},magic:{mithrilBars:4,verdantCloth:18,enchantedFragments:6,cutSapphires:2,gold:250,zoneMaterials:2}};
function equipmentTierUnlocked(tier){return tier<=1||tier===2&&tier2Unlocked()||tier===3&&(data.cleared>=zoneEnd(3)||data.floor>=zoneStart(4));}
function equipmentTierGate(tier){return tier===3?'Complete Zone 4':tier===2?'Zone 2':'Camp';}
function ownedArmorTier(style){return Math.max(1,...(data.ownedArmor||[]).filter(id=>ARMOR_SETS[id]?.style===style&&equipmentTierUnlocked(ARMOR_SETS[id].tier)).map(id=>ARMOR_SETS[id].tier));}
function promotionDetails(style){const tier=styleTier(style)+1;return {tier,rank:(tier-1)*10,level:(tier-1)*10,cost:tier===3?MITHRIL_PROMOTION_COSTS[style]:TIER_PROMOTION_COSTS[style],name:TIER_LIMITS[tier]?.name||'Mithril'};}
function trainingActivity(group){const tier=disciplineLevel(group)>=10?2:1;return DISCIPLINES[group].actions.find(key=>(SKILLS[key].tier||1)===tier&&!SKILLS[key].cost)||DISCIPLINES[group].actions.find(key=>(SKILLS[key].tier||1)===tier)||DISCIPLINES[group].actions[0];}
function tierVoucherName(tier){return {iron:'Iron',steel:'Steel',mithril:'Mithril'}[tier]||'Upgrade';}
function equipmentVoucherBank(tier){return ['iron','steel','mithril'][tier-1]||'iron';}
