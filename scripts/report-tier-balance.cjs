const fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
// This collection hook exists only in the report's isolated browser response.
function fixture(){
 window.__tierBalance=()=>{
  const original=data;try{
   data=defaults();data.floor=4;data.cleared=3;normalizeProgression();const weapons=[];
   for(const [id,w]of Object.entries(WEAPON_TYPES)){
    const style=styleForWeapon(id),s=data.styles[style],tiers=[];data.weaponType=id;
    for(const tier of [1,2]){s.tier=tier;s.weapon=TIER_LIMITS[tier].weapon;s.speed=TIER_LIMITS[tier].speed;s.xp=0;data[DISCIPLINES[STYLE_DEFS[style].group].xp]=0;data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;const stats=styleStats(style);
     tiers.push({tier,rank:s.weapon,speedRank:s.speed,damage:weaponDamageBase(id)*w.power*(1+stats.damagePercent/100),cooldown:w.cooldown/(1+stats.speedPercent/100),normal:weaponDps(id,{equipmentOnly:true}),dedicated:weaponDps(id,{ceiling:true,dedicated:true})});}
    weapons.push({id,name:w.name,tiers});
   }
   const builds=[];
   for(const zone of [0,1])for(const kind of ['gear','shop','combined']){
    data=defaults();data.floor=zone*3+1;data.cleared=zone*3;normalizeProgression();const s=data.styles.melee;s.tier=zone?2:1;s.weapon=kind==='shop'?0:zone?20:10;s.speed=kind==='shop'?0:zone?10:5;
    zoneShopFor().ranks=kind==='gear'?{}:{might:7,haste:3,crit:3};projectCombatStyle();builds.push({zone:zone+1,kind,dps:weaponDps(),budget:shopBudget(),ranks:{...zoneShopFor().ranks}});
   }
   data=defaults();normalizeProgression();
   return {version:9,economy:[0,1].map(i=>({zone:i+1,...zoneGoldBudget(i)})),currencies:[0,1].map(i=>({zone:i+1,...zoneCurrency(i),monsterChance:.4,masteredChance:.56,elite:3,guardians:[8,12,20],baselinePerClear:zoneBalance(i).swarmCount*.4+120})),dungeoneeringLevels:Array.from({length:8},(_,i)=>({level:i+1,totalXp:DUNGEONEERING_XP_STEP*i*i})),builds,limits:TIER_LIMITS,promotionCosts:TIER_PROMOTION_COSTS,zones:[0,1,2,3].map(i=>zoneBalance(i)),weapons,armorSets:Object.values(ARMOR_SETS),resources:TIER_RESOURCES.map(key=>({key,name:RESOURCE_LABEL[key],source:RESOURCE_SOURCE[key]})),activities:Object.entries(SKILLS).filter(([,s])=>s.tier===2).map(([id,s])=>({id,...s,activeSeconds:ACTIVE_INTERVAL[id],group:disciplineFor(id)})),shopUpgrades:Object.entries(UPGRADE_CAPS).map(([id,max])=>({id,max,ranks:Array.from({length:max},(_,i)=>({rank:i+1,price:shopUpgradeCost(id,0,i),effect:powerSummary(id,i+1)}))}))};
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
   'Version 9 replaces combat power selections with persistent purchases in each exact Zone. Equipment works everywhere; Zone training is active only in its owner Zone. Dungeoneering XP and Mastery are shared across all Zones.','',
   '## Build budgets','',
   '| Path | Zone 1 / Iron | Zone 2 / Steel |','| --- | ---: | ---: |',
   ...['gear','shop','combined'].map(kind=>'| '+{gear:'Equipment only',shop:'Shop only',combined:'Combined'}[kind]+' | '+[1,2].map(z=>f(r.builds.find(b=>b.zone===z&&b.kind===kind).dps)+' DPS').join(' | ')+' |'),'',
   'Gear-only uses maximum refinement and speed, with base proficiency. Shop-only uses an unrefined weapon and Heavy Strikes 7, Quick Hands 3 and Keen Edge 3. Combined uses both. This shop build costs 248 seals in Zone 1 and 291 in Zone 2. Equipment can remain a slower, optional alternative: its finite upgrades require materials, crafting levels and gold rather than seals.','',
   'Heavy Strikes and equipment supply alternative core damage. The stronger increase applies fully, plus 15% of the weaker increase. Zone attack speed, critical chance and extra projectiles then apply. Above the recommended 100 / 200 single-target DPS budget, only 25% of each additional calculated DPS applies. Actual hit damage is reduced by that same ratio; HUD and shop previews show the final amount. Conditional damage, cleaves and additional targets are excluded from this single-target figure.','',
   'Three initial offensive purchases (one rank each of Heavy Strikes, Quick Hands and Keen Edge) cost 23 seals in Zone 1. A starter sword rises from 16.7 to 33.5 DPS; adding the same purchases to full Iron gear has a much smaller effect. Heavy Strikes ranks 1–7 cost 3, 5, 8, 13, 21, 34 and 55 seals. Ranks 8–10 cost 120, 240 and 480. Later ranks grow by 2.1× per rank. Other branches also escalate, especially extra targets and projectiles. Higher DPS remains possible through repeat clears and costly ranks.','',
   '## Equipment ceilings','',
   '| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |','| --- | ---: | ---: | ---: | ---: |',
   ...r.weapons.map(w=>'| '+w.name+' | '+f(w.tiers[0].normal)+' | '+f(w.tiers[0].dedicated)+' | '+f(w.tiers[1].normal)+' | '+f(w.tiers[1].dedicated)+' |'),'',
   'These are equipment-only figures, at 1× combat and 5% base critical chance, with the matching robe tier for magic. Dedicated training adds the capped 3% proficiency and 5% crafting bonuses; magic is slightly lower because robe damage shares its multiplier. Damage / cooldown × 1.05 agrees with the equipment number. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. One weapon and one independently chosen armor set are equipped at a time.','',
   'Clear Zone 1, reach refinement 10 and the matching crafting level 10, then pay a Steel promotion recipe to unlock refinement 11–20 for that style. Armor has two available sets per class. Proficiency and crafting training remain style-specific; elemental Zone upgrades work with every style. Recipes and material costs are unchanged in this pass.','',
   '## Pacing','',
   '| Zone | Target at 1× | Reference DPS | Refinement | Speed | Shop ranks: damage / speed / crit |','| --- | --- | ---: | ---: | ---: | --- |',
   ...r.zones.map(z=>'| '+(z.index+1)+' | ~'+z.minutes+' min | '+f(z.dps)+' | '+z.weaponRank+' | '+z.speedRank+' | 5 / 2 / 2 |'),'',
   'References use a sword and base proficiency. Forecasts budget enemy health against sustained single-target attacking and spawn timing. Movement, incoming damage, menus, preparation and missed attacks change the result. Cleave, elemental effects, spawn pressure and Delve speed can shorten a run. Future equipment progression remains unauthored; later Zones use the existing Steel reference and approach a 30–40-minute target.','',
   ...r.simulated.map(s=>'- Live Zone '+s.zone+' simulation: **'+f(s.seconds/60)+' min**, '+s.kills+' defeats, '+f(s.referenceDps)+' reference DPS.'),'',
   'The live tests run actual spawn, hit, critical, movement, boss and transition code at 40 ms steps; incoming damage and XP progression are suppressed only in the isolated fixture. Timing includes that step size’s attack-cadence rounding.','',
   '## Seals and gold','',
   '| Zone | Currency | Expected seals / clear | Guardian gold | Floor caches | Baseline gold / clear |','| --- | --- | ---: | ---: | ---: | ---: |',
   ...r.currencies.map((c,i)=>'| '+c.zone+' | '+c.name+' | '+c.baselinePerClear+' | '+r.economy[i].guardians+' | '+r.economy[i].clears+' | '+r.economy[i].total+' |'),'',
   'Ordinary monsters have a 40% chance to award one seal and drop no gold. Elites guarantee three seals and 2 / 2.8 gold in Zones 1 / 2. The three guardians per floor guarantee 8 / 12 / 20 seals. Elite substitutions and jewelry bonuses are excluded from the table. Guardian’s Bounty adds 4% elite/guardian gold per rank. Whole gold is paid using a saved fractional remainder. Scavenging income, existing gold balances and crafting costs stay intact.','',
   'Each exact Zone keeps its own wallet and purchased ranks, including later Zones that repeat a biome. Defeat, travel, replay and reload never reset them. Locked Zone shops can be previewed but cannot be purchased from.','',
   '## Global Dungeoneering and Mastery','',
   '| Dungeoneering level | Total XP |','| --- | ---: |',...r.dungeoneeringLevels.map(l=>'| '+l.level+' | '+l.totalXp+' |'),'',
   'The level is 1 + floor(sqrt(total XP / 1600)). It never resets on a new Zone. Each gained level grants one Mastery point, while guardians grant 1 / 1 / 2 points. Leveling never pauses combat or queues a power card. Uncollected XP positions and values remain saved per Zone; encounter completion banks them exactly once.','',
   'Mastery is one shared, refundable bank. Onslaught unlocks spawn settings up to 60×. Fortune adds 10% relative seal-drop chance per rank: 40% → 56% at rank 4. Discovery adds 25% relative rare-material chance per rank: 1.5% → 2.625% at rank 3, before jewelry. Mastery grants no attack damage or protection. The first guardian unlocks 2× Delve speed. Mastery speed never changes skilling. The mefforts/max testing unlock unlocks a separate Skilling speed for active gathering, crafting and online idle production. Delve speed never changes that value, even in testing mode. Offline earnings and bonus collection windows keep real-time timing.','',
   '## Zone 2 resource chain','',
   '| Discipline | Gathering / refining | Uses |','| --- | --- | --- |',
   '| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Weapons, armor, promotions, upgrades |',
   '| Woodworking | Willow; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, ammunition, Runic Cloth |',
   '| Scavenging | Ancient Salvage; 2 salvage → 2 fragments | Refinement, robes, runes |',
   '| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Mage/Ranger armor and ammunition |',
   '| Artisan | Rough Garnet → Cut Garnet | Promotions, robes, enchantments |','',
   'All ten advanced activities require clearing Zone 1, including idle/offline work. Armor, promotion and crafting recipes retain their material gates. Source links and recipe bookmarks connect gathering back to equipment.','',
   '## Migration and verification','',
   'Existing earned power ranks transfer into the saved exact Zone. Pending selections convert to three seals each. Earned legacy XP becomes global XP; ground XP stays separate until collected. Legacy biome Mastery balances and spent allocations are pooled, the highest rank in each branch is retained and duplicated allocations are refunded. The original Zone/Mastery data is archived in the save. Migration runs once, preserving equipment, materials, gold and XP caches.','',
   'The thirteen browser suites cover actual damage across six weapons, both tiers, shop costs/caps, exact-Zone isolation, migration/reload, no automatic upgrade modals, Mastery configuration, rewards, all 20 activities, touch controls, direct Idle navigation, boss mechanics and 108 unique painted collection icons. Run npm run report:balance to regenerate this file and balance-report.json. The JSON includes every shop price/effect, resource chain, armor recipe and live weapon ceiling.',''
  ].join('\n');
  fs.writeFileSync(path.join(root,'BALANCE.md'),md);fs.writeFileSync(path.join(root,'balance-report.json'),JSON.stringify(r,null,2)+'\n');console.log('Generated Zone Shop budgets, global XP, currency/gold economy and live equipment ceilings.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
