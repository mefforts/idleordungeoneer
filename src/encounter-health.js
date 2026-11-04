/* Separate multipliers deliberately leave ordinary health calibration intact. */
const ENCOUNTER_HEALTH={elite:1.75,rare:1.5,boss:1.5,bossElite:1.5};
const EARLY_ZONE_HEALTH={elite:1.75,boss:1.25,bossElite:1.25};
const ZONE_THREE_HEALTH={minion:4,special:6};
function encounterHealthMultiplier(enemy){return enemy.boss?ENCOUNTER_HEALTH.boss:enemy.bossElite?ENCOUNTER_HEALTH.bossElite:enemy.champion?ENCOUNTER_HEALTH.rare:enemy.elite?ENCOUNTER_HEALTH.elite:1;}
function regionalEncounterHealthMultiplier(enemy={},index=zoneNumber()){
 if(enemy.totem)return 1;
 if(index<2)return enemy.boss?EARLY_ZONE_HEALTH.boss:enemy.bossElite?EARLY_ZONE_HEALTH.bossElite:enemy.champion||enemy.uncommon?1:enemy.elite?EARLY_ZONE_HEALTH.elite:1;
 return enemy.boss||enemy.bossElite||enemy.champion||enemy.elite?ZONE_THREE_HEALTH.special:ZONE_THREE_HEALTH.minion;
}
