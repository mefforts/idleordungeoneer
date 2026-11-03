/* Separate multipliers deliberately leave ordinary health calibration intact. */
const ENCOUNTER_HEALTH={elite:1.75,rare:1.5,boss:1.5,bossElite:1.5};
function encounterHealthMultiplier(enemy){return enemy.boss?ENCOUNTER_HEALTH.boss:enemy.bossElite?ENCOUNTER_HEALTH.bossElite:enemy.champion?ENCOUNTER_HEALTH.rare:enemy.elite?ENCOUNTER_HEALTH.elite:1;}
