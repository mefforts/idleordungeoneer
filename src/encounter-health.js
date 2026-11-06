/* Separate multipliers deliberately leave ordinary health calibration intact. */
const ENCOUNTER_HEALTH=BALANCE_CONFIG.combat.health;
const EARLY_ZONE_HEALTH=BALANCE_CONFIG.dungeons[0].zones[0].health;
const ZONE_THREE_HEALTH={minion:zoneTuning(2).health.normal,special:zoneTuning(2).health.elite};
function encounterHealthMultiplier(enemy){return enemy.boss?ENCOUNTER_HEALTH.boss:enemy.bossElite?ENCOUNTER_HEALTH.bossElite:enemy.champion?ENCOUNTER_HEALTH.rare:enemy.elite?ENCOUNTER_HEALTH.elite:1;}
function regionalEncounterHealthMultiplier(enemy={},index=zoneNumber()){
 if(enemy.totem)return 1;const h=zoneTuning(index).health;
 return enemy.boss?h.boss:enemy.bossElite?h.bossElite:enemy.champion?h.rare:enemy.elite?h.elite:h.normal;
}
