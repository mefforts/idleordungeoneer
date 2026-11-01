const fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
// The fixture is injected into the report page only; index.html stays playable.
function fixture(){
 window.__tierBalance=()=>{
  const original=data;try{
   data=defaults();data.floor=4;data.cleared=3;normalizeProgression();const weapons=[];
   for(const [id,w]of Object.entries(WEAPON_TYPES)){
    const style=styleForWeapon(id),s=data.styles[style],tiers=[];data.weaponType=id;
    for(const tier of [1,2]){s.tier=tier;s.weapon=TIER_LIMITS[tier].weapon;s.speed=TIER_LIMITS[tier].speed;s.xp=0;data[DISCIPLINES[STYLE_DEFS[style].group].xp]=0;data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;
     tiers.push({tier,rank:s.weapon,speedRank:s.speed,damage:styleStats(style).baseDamage*w.power*(1+styleStats(style).damagePercent/100),cooldown:attackCooldown(),normal:weaponDps(id),dedicated:weaponDps(id,{ceiling:true,dedicated:true})});}
    weapons.push({id,name:w.name,tiers});
   }
   return {version:8,economy:[0,1].map(i=>({zone:i+1,...zoneGoldBudget(i)})),refinementHasFiniteCap:true,limits:TIER_LIMITS,promotionCosts:TIER_PROMOTION_COSTS,zones:[0,1].map(i=>zoneBalance(i)),weapons,armorSets:Object.values(ARMOR_SETS),resources:TIER_RESOURCES.map(key=>({key,name:RESOURCE_LABEL[key],source:RESOURCE_SOURCE[key]})),activities:Object.entries(SKILLS).filter(([,s])=>s.tier===2).map(([id,s])=>({id,...s,activeSeconds:ACTIVE_INTERVAL[id],group:disciplineFor(id)})),powerRanks:Object.entries(UPGRADE_CAPS).map(([id,max])=>({id,max,first:powerSummary(id,1),last:powerSummary(id,max)}))};
  }finally{data=original;}
 };
}
(async()=>{
 const runtime=await createRuntime(),root=path.resolve(__dirname,'..');
 try{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+fixture.toString()+')();\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage();await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);const r=await p.evaluate(()=>__tierBalance());
  const pacing=path.join(runtime.resultsDir,'zone-pacing.json');r.simulated=fs.existsSync(pacing)?JSON.parse(fs.readFileSync(pacing,'utf8')).simulated.filter(s=>s.zone<=2):[];
  const f=n=>n.toFixed(1);
  const md=[
   '# Zone 1–2 progression and DPS','',
   'Only two equipment tiers are currently available: Iron / starter equipment and Steel / advanced equipment. Six independently equipped armor sets cover Warrior, Ranger and Mage. Black, Mithril and later tiers are reserved for a future pass.','',
   '## Permanent tier limits','',
   '| Tier | Intended DPS ceiling | Refinement | Speed | Reach | Reinforcement | Enchantment |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
   ...Object.values(r.limits).map(l=>'| '+l.name+' | '+l.dps+' | '+l.weapon+' | '+l.speed+' | '+l.reach+' | '+l.armor+' | '+l.enchant+' |'),'',
   'Iron refinement stops at 10. Clear all three floors of Zone 1, train the matching crafting discipline to level 10, and pay for a **Steel promotion** to open refinement 11–20 for that combat style. Promotion retains rank 10, and each style promotes independently. Capped upgrades refuse the purchase without spending ingredients.','',
   'Speed adds 2% per rank; reach adds 3%. Reinforcement adds 8 health per rank, limited by the worn set’s tier. Warrior armor provides 4% / 7% damage reduction, Ranger armor 4% / 6% movement, and Mage robes 4% / 8% magic damage.','',
   'Combat proficiency gradually adds up to **3%** damage at level 50. Matching crafting-skill levels 11–60 add up to **5%** more. Dedicated permanent training therefore tops out near **108 / 216 DPS**. Magic’s total is slightly lower because the robe bonus shares its damage multiplier. Temporary zone powers can exceed those figures during a run.','',
   '## Actual weapon ceilings','',
   'Permanent single-target DPS uses 1× combat, base 5% critical chance, capped refinement / speed and matching robes for magic. Temporary powers, splash, cleave, enchantment arcs and conditional berserk are excluded. These numbers agree with actual hit damage divided by attack cooldown, multiplied by 1.05.','',
   '| Weapon | Iron | Dedicated Iron | Steel | Dedicated Steel |','| --- | ---: | ---: | ---: | ---: |',
   ...r.weapons.map(w=>'| '+w.name+' | '+f(w.tiers[0].normal)+' | '+f(w.tiers[0].dedicated)+' | '+f(w.tiers[1].normal)+' | '+f(w.tiers[1].dedicated)+' |'),'',
   'Refinement interpolates each weapon’s starter output to the same tier budget. Cooldown, hit damage, reach and utility stay distinct. The Iron weapon-only budget at rank 10 is 100 / 1.10 DPS; Steel at rank 20 is 200 / 1.20. Speed supplies the remaining factor. Magic hit scaling allows for its matching robe bonus. Readiness uses your actual build rather than assuming all these upgrades.','',
   '## Zone references','',
   '| Zone | Full-zone target at 1× | Intended permanent DPS | Reference refinement | Speed | Tier |','| --- | --- | ---: | ---: | ---: | --- |',
   ...r.zones.map(z=>'| '+(z.index+1)+' | ~'+z.minutes+' min | '+f(z.dps)+' | '+z.weaponRank+' | '+z.speedRank+' | '+r.limits[z.gearTier].name+' |'),'',
   'References sit below the full tier ceilings, at about **80 DPS for Zone 1** and **160 DPS for Zone 2**, with a sword, base proficiency and no temporary powers. Continuous single-target combat determines the health budget. Movement, missed shots, deaths, menus and preparation add time; cleaves, splash and wave powers can shorten it. Delve speed affects combat only.','',
   ...r.simulated.map(s=>'- Latest full-zone simulation: Zone '+s.zone+' cleared in **'+f(s.seconds/60)+' minutes**, with '+s.kills+' defeats.'),'',
   'Later zones remain playable against the current Steel reference and retain their previous 30–40-minute pacing targets. Further equipment and zone-specific progression are not authored in this pass.','',
   '## Delve gold','',
   'Baseline rewards exclude elite echoes, Gold Find and jewelry bonuses. Whole coins are paid from a saved fractional remainder, so smaller monster drops survive reload. Existing balances are preserved; Scavenging and crafting costs are unchanged.','',
   '| Zone | Monsters | Guardians | Floor clears | Full zone | Gold / target minute |','| --- | ---: | ---: | ---: | ---: | ---: |',
   ...r.economy.map(e=>'| '+e.zone+' | '+f(e.monsters)+' | '+e.guardians+' | '+e.clears+' | '+f(e.total)+' | '+f(e.perMinute)+' |'),'',
   'Zone 1 pays 346 gold across a normal clear; Zone 2 pays 586, down from roughly 1,600 / 2,900. Gold Find and gold jewelry still multiply enemy rewards. An elite pays three regular monster shares; fully capped power choices pay 2 gold per surplus level.','',
   '## Zone 2 resource chain','',
   'All ten second-tier activities require clearing Zone 1 / entering Zone 2. The requirement applies to active gathering, refining, idle assignment, offline production, armor crafting and style promotion.','',
   '| Discipline | New gathering / refining | Uses |','| --- | --- | --- |',
   '| Blacksmithing | Coal; 2 Iron Ore + 1 Coal → 1 Steel Bar | Steel weapons, armor and upgrades |',
   '| Woodworking | Willow Logs; 2 Willow + 1 Steel Bar → 12 arrows | Ranger gear, promotion, ammo and Runic Cloth |',
   '| Scavenging | Ancient Salvage; 2 salvage → 2 Ancient Fragments | Refinement, robes and greater runes |',
   '| Warding | 2 Warded Cloth + 1 Willow → 2 Runic Cloth; 2 Runic Cloth + 2 Ancient Fragments → 10 runes | Mage / Ranger armor, promotion and ammo |',
   '| Artisan | Rough Garnet → Cut Garnet | Promotion in every style, Mage robes and enchantments |','',
   'Each activity supports active bonuses and a direct Idle button. Newly illustrated environments cover coal, willow, ancient salvage and garnets. Material-source links and tracked armor / promotion recipes connect gathering back to equipment. Existing opal jewelry remains available.','',
   '## Steel promotion costs','',
   '| Style | Base recipe |','| --- | --- |',...Object.entries(r.promotionCosts).map(([id,c])=>'| '+id+' | '+Object.entries(c).map(([k,n])=>n+' '+(r.resources.find(v=>v.key===k)?.name||k)).join(' + ')+' |'),'',
   'Armor tiers require crafting levels 1 / 10. Steel-tier sets also require Zone 2 and their new ingredients. Station conservation can reduce whole-ingredient costs; fractional savings carry to a later craft. The JSON report contains every armor recipe and activity timing.','',
   '## Saves and verification','',
   'Older excess ranks and unavailable outfits are retained in legacyProgressionArchive / archivedArmor. Playable ranks follow the new tier limits; future outfits map to the available corresponding class set. Promotions, selected outfits and resource ownership survive reload.','',
   'tests/tiers.cjs checks the real Zone 1 clear, new recipe costs, all six ceilings against live hit damage / cooldowns, bounded training, promotion, thirty rig poses, all ten activities, 320px layouts, distinct loaded Codex art, saves and migration. tests/arena.cjs runs full zones through the actual spawn / attack / boss / transition code; incoming damage and XP changes are suppressed only in its isolated response fixture.','',
   'Run npm run report:balance to regenerate this file and balance-report.json from the embedded game.',''
  ].join('\n');
  fs.writeFileSync(path.join(root,'BALANCE.md'),md);fs.writeFileSync(path.join(root,'balance-report.json'),JSON.stringify(r,null,2)+'\n');console.log('Generated two-tier balance, resource chains and exact live weapon ceilings.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
