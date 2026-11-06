/* Mithril equipment opens after the Hollow Crypt, at matching skill level 20. */
const MITHRIL_PROMOTION_COSTS=BALANCE_CONFIG.equipment.promotionCosts[3];
function equipmentTierUnlocked(tier){const t=TIER_LIMITS[tier];return !!t&&(t.unlockAfterZone===0||data.cleared>=zoneEnd(t.unlockAfterZone-1)||data.floor>=zoneStart(t.unlockAfterZone));}
function equipmentTierGate(tier){const t=TIER_LIMITS[tier];return !t?'Not available':t.unlockAfterZone?'Complete Zone '+t.unlockAfterZone:'Camp';}
function ownedArmorTier(style){return Math.max(1,...(data.ownedArmor||[]).filter(id=>ARMOR_SETS[id]?.style===style&&equipmentTierUnlocked(ARMOR_SETS[id].tier)).map(id=>ARMOR_SETS[id].tier));}

function trainingActivity(group){
 const actions=DISCIPLINES[group].actions.filter(key=>canUseSkill(key)),tier=Math.max(1,...actions.map(key=>SKILLS[key].tier||1));
 return actions.find(key=>(SKILLS[key].tier||1)===tier&&!SKILLS[key].cost)||actions.find(key=>(SKILLS[key].tier||1)===tier)||DISCIPLINES[group].actions[0];
}
function tierVoucherName(bank){const tier=equipmentTiers().find(t=>equipmentVoucherBank(t)===bank);return TIER_LIMITS[tier]?.name||'Upgrade';}
function equipmentVoucherBank(tier){const t=TIER_LIMITS[tier];return t?.voucherBank||t?.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'iron';}
