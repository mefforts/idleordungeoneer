const fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
// Report collection runs only in an isolated browser response.
function fixture(){
 window.__tierBalance=()=>{
  const original=data;try{
   data=defaults();data.floor=4;data.cleared=3;normalizeProgression();const weapons=[];
   for(const [id,w]of Object.entries(WEAPON_TYPES)){
    const style=styleForWeapon(id),s=data.styles[style],tiers=[];data.weaponType=id;
    for(const tier of [1,2]){s.tier=tier;s.weapon=TIER_LIMITS[tier].weapon;s.speed=TIER_LIMITS[tier].speed;s.xp=0;data[DISCIPLINES[STYLE_DEFS[style].group].xp]=0;data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;
     const stats=styleStats(style);tiers.push({tier,rank:s.weapon,speedRank:s.speed,damage:weaponDamageBase(id)*w.power*(1+stats.damagePercent/100),cooldown:w.cooldown/(1+stats.speedPercent/100),normal:weaponDps(id,{equipmentOnly:true}),dedicated:weaponDps(id,{ceiling:true,dedicated:true})});}
    weapons.push({id,name:w.name,tiers});
   }
   data=defaults();normalizeProgression();
   return {version:'9.3.1',economy:[0,1].map(i=>({zone:i+1,...zoneGoldBudget(i)})),currencies:[0,1,2,3].map(i=>({zone:i+1,...zoneCurrency(i),monsterChance:.04,masteredChance:.056,elite:6,guardians:[12,20,35],firstClearElites:17,expectedFirstClearSeals:(zoneBalance(i).swarmCount-17)*.04+17*6+201})),retiredStats:['might','haste','reach','vitality','crit','swift','magnet','regen','wisdom','forage'],dungeoneeringLevels:Array.from({length:8},(_,i)=>({level:i+1,totalXp:DUNGEONEERING_XP_STEP*i*i})),limits:TIER_LIMITS,promotionCosts:TIER_PROMOTION_COSTS,zones:[0,1,2,3].map(i=>zoneBalance(i)),weapons,armorSets:Object.values(ARMOR_SETS),resources:TIER_RESOURCES.map(key=>({key,name:RESOURCE_LABEL[key],source:RESOURCE_SOURCE[key]})),activities:Object.entries(SKILLS).filter(([,s])=>s.tier===2).map(([id,s])=>({id,...s,activeSeconds:ACTIVE_INTERVAL[id],group:disciplineFor(id)})),zoneAbilities:[0,1,2,3].map(index=>({zone:index+1,name:BIOMES[index].name,abilities:zoneAbilities(index).map(a=>({...a,ranks:Array.from({length:a.max},(_,i)=>({rank:i+1,price:shopUpgradeCost(a.id,index,i),effect:powerSummary(a.id,i+1,index)}))}))}))};
  }finally{data=original;}
 };
}
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..');
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+fixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage();await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);const r=await p.evaluate(()=>__tierBalance());
  const pacing=path.join(runtime.resultsDir,'zone-pacing.json');r.simulated=fs.existsSync(pacing)?JSON.parse(fs.readFileSync(pacing,'utf8')).simulated:[];
  const f=n=>n.toFixed(1),md=[
   '# Zone progression and balance','',
   'Build 9.3.1 gives each Zone four themed abilities. Core weapon statistics come from equipment, proficiency and existing jewelry. Each exact Zone retains its own seals and ranks; global Dungeoneering and Mastery remain separate.','',
   '## Equipment ceilings','',
   '| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |','| --- | ---: | ---: | ---: | ---: |',
   ...r.weapons.map(w=>'| '+w.name+' | '+f(w.tiers[0].normal)+' | '+f(w.tiers[0].dedicated)+' | '+f(w.tiers[1].normal)+' | '+f(w.tiers[1].dedicated)+' |'),'',
   'Figures use maximum refinement and speed, 5% base critical chance and matching robes for Magic. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. One weapon and one independent armor set are equipped at a time.','',
   'Above 100 DPS in Zone 1 or 200 DPS in later Zones, each additional calculated point of single-target DPS contributes 0.25 actual DPS. Actual attack damage uses the same adjustment. Cleaves, elemental chains, damage over time and conditional bonuses are separate. Mirrorcast contributes 15% damage per additional projectile, and its direct projectile damage is included in the displayed figure.','',
   'Clear Zone 1, reach refinement 10 and matching crafting level 10, then pay a Steel promotion recipe to unlock refinement 11–20. Recipes, jewelry and material costs remain unchanged.','',
   '## Zone abilities','',
   '| Zone | Abilities |','| --- | --- |',...r.zoneAbilities.map(z=>'| '+z.name+' | '+z.abilities.map(a=>a.name+' ('+a.max+')').join(' · ')+' |'),'',
   'Each number is the maximum rank. Effects use existing combat mechanics: venom/burn on hit, slowing, melee cleaves, projectile piercing, extra projectiles, chains, critical splashes and damage reduction. Themed artwork, names, DoT colors and effect colors match the area. Each ability has its own illustrated Codex entry.','',
   'First ranks cost 8–24 seals before Zone scaling. Ordinary ranks grow by 1.65× through rank five, then 2.35×; cleave, piercing and additional projectiles cost 6× more each rank. The exact prices and effects are included for all sixteen abilities in balance-report.json. The shop contains no ordinary weapon damage, attack speed, health, critical chance, gold, XP, movement, pickup or regeneration purchases. Existing jewelry remains the source of its established stat bonuses.','',
   '## Seals and gold','',
   '| Zone | Currency | Expected seals / first clear |','| --- | --- | ---: |',...r.currencies.map(c=>'| '+c.zone+' | '+c.name+' | '+c.expectedFirstClearSeals.toFixed(2)+' |'),'',
   'Ordinary monsters have a 4% chance of one seal. Elites guarantee 6 seals; guardians guarantee 12 / 20 / 35. A first clear permits 17 elite substitutions across the three floors; replaying with all guardians already known permits 18. The table includes the first-clear substitutions at baseline Fortune. More than 95% of expected first-clear seals come from elites and guardians. Fortune rank 4 changes ordinary-monster chance to 5.6%, while guardian and elite chunks remain fixed.','',
   '| Zone | Guardian gold | Floor caches | Baseline gold without elites |','| --- | ---: | ---: | ---: |',...r.economy.map(c=>'| '+c.zone+' | '+c.guardians+' | '+c.clears+' | '+c.total+' |'),'',
   'Ordinary monsters drop no gold. Elites give 2 / 2.8 gold in Zones 1 / 2. Existing gold jewelry modifies combat income; whole gold is paid using a saved fractional remainder. Scavenging and skilling remain additional sources. Retired shop gold/XP ranks no longer apply.','',
   '## Pacing','',
   '| Zone | Target at 1× | Reference DPS | Refinement | Speed |','| --- | --- | ---: | ---: | ---: |',...r.zones.map(z=>'| '+(z.index+1)+' | ~'+z.minutes+' min | '+f(z.dps)+' | '+z.weaponRank+' | '+z.speedRank+' |'),'',
   'References now use completed Iron / Steel equipment at base proficiency, with no required Zone abilities. Health forecasts retain the 10 / 20 / 30-minute targets and the later 35–40-minute plateau. Movement, deaths, preparation and menus extend play time; abilities and successful counters can shorten it. Future equipment tiers remain unauthored.','',
   ...r.simulated.map(s=>'- Live Zone '+s.zone+' simulation: **'+f(s.seconds/60)+' min**, '+s.kills+' defeats, '+f(s.referenceDps)+' reference DPS.'),'',
   'Live tests use actual spawning, damage, approach, guardian mechanics and transitions at 40 ms steps. Only incoming damage and XP progression are suppressed in the isolated fixture. They keep the player stationary and do not deliberately seek reflect marks or intercept streams. Attack-cadence rounding contributes to the difference from the forecast.','',
   '## Guardian counterplay','',
   'Floor overlords use four patterns and final Zone overlords six. Known elite substitutions are capped at one / two / three per wave on Floors 1 / 2 / 3. Reflecting returns 12% maximum caster HP and staggers for 1.6 seconds. A healing stream restores 0.8% guardian HP per second for six seconds, or 2% player HP when intercepted. Power streams add 12% guardian attack damage, or 10% conditional player hit damage for five seconds when intercepted. Stream bonuses do not stack. Totems take about 1.4 seconds of reference DPS to destroy (0.9 for elites), grant no loot/XP and never count as wave defeats.','',
   '## Global Dungeoneering and Mastery','',
   '| Dungeoneering level | Total XP |','| --- | ---: |',...r.dungeoneeringLevels.map(l=>'| '+l.level+' | '+l.totalXp+' |'),'',
   'Level is 1 + floor(sqrt(total XP / 1600)). XP persists across Zones; each level grants one Mastery point and guardians grant 1 / 1 / 2 points. Ground XP positions and values persist until collected or banked after an encounter. No combat power cards or automatic shopping modals appear.','',
   'Mastery is shared and refundable. Onslaught controls spawn settings up to 60×, Fortune raises ordinary seal-drop chance by 10% relative per rank, and Discovery raises rare-material chance by 25% relative per rank. Mastery gives no damage/protection. The first guardian unlocks 2× Delve speed, which never speeds up skilling. Offline earnings and collection windows keep real-time timing.','',
   '## Zone 2 resource chain','',
   '| Discipline | Gathering / refining | Uses |','| --- | --- | --- |',
   '| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Equipment, promotions and upgrades |',
   '| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, ammunition and Runic Cloth |',
   '| Scavenging | Ancient Salvage; 2 salvage → 2 fragments | Refinement, robes and runes |',
   '| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Armor and ammunition |',
   '| Artisan | Rough Garnet → Cut Garnet | Promotions, robes and enchantments |','',
   'All ten advanced activities require clearing Zone 1, including idle and offline work. Source links, tracked recipes and Inventory material links connect gathering back to equipment.','',
   '## Migration and verification','',
   'Retired statistics, abilities absent from a Zone and ranks above its revised maximum refund their original purchase prices to that exact Zone. Retained abilities keep their ranks. A versioned receipt prevents repeated credits. Older power-card saves first pass through the existing global-XP/Mastery migration, then receive any applicable refunds. Equipment, materials, gold, ground XP and Mastery are preserved.','',
   'Sixteen browser suites cover migration and exact refunds, real damage/cadence for all six weapons, both equipment tiers, every skill, first-weapon guidance, real touch gestures, full-card equipment selection, the four-ability shops, all 106 distinct painted Codex entries, boss mechanics and live Zone pacing. Startup checks pause the HTML download to verify first paint, then cover asset readiness, reduced motion and retry. Run npm run report:balance to regenerate this file and balance-report.json.',''
  ].join('\n');
  fs.writeFileSync(path.join(root,'BALANCE.md'),md);fs.writeFileSync(path.join(root,'balance-report.json'),JSON.stringify(r,null,2)+'\n');console.log('Generated themed-ability economy, equipment ceilings, global XP and live Zone pacing.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
