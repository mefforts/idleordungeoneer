const fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('../tests/runtime.cjs');
/* This collector is injected only into an isolated browser response. */
function fixture(){
 window.__tierBalance=()=>{
  const original=data;
  const echoesExpected=index=>Array.from({length:zoneFloorCount(index)},(_,floor)=>floor===0?2:zoneVisualBand(index,floor+1)*3).reduce((sum,n)=>sum+n,0);
  const rareExpected=index=>Array.from({length:zoneFloorCount(index)},(_,floor)=>[0,2,4].reduce((sum,phase)=>{const echoes=floor===0?(phase===0?0:1):zoneVisualBand(index,floor+1),eligible=Math.max(0,zoneBalance(index).targets[phase]-3-echoes);return sum+1-Math.pow(1-RARE_ELITE_CHANCE,eligible);},0)).reduce((sum,n)=>sum+n,0);
  try{
   data=defaults();data.floor=zoneStart(1);data.cleared=zoneEnd(0);normalizeProgression();const weapons=[];
   for(const [id,w]of Object.entries(WEAPON_TYPES)){
    const style=styleForWeapon(id),s=data.styles[style],tiers=[];data.weaponType=id;
    for(const tier of [1,2]){
     s.tier=tier;s.weapon=TIER_LIMITS[tier].weapon;s.speed=TIER_LIMITS[tier].speed;s.xp=0;data[DISCIPLINES[STYLE_DEFS[style].group].xp]=0;data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;
     const stats=styleStats(style);tiers.push({tier,rank:s.weapon,speedRank:s.speed,damage:weaponDamageBase(id)*w.power*(1+stats.damagePercent/100),cooldown:w.cooldown/(1+stats.speedPercent/100),normal:weaponDps(id,{equipmentOnly:true}),dedicated:weaponDps(id,{ceiling:true,dedicated:true})});
    }weapons.push({id,name:w.name,style:STYLE_DEFS[style].name,tiers});
   }
   data=defaults();normalizeProgression();
   return {
    version:'10.0.0',dungeons:DUNGEONS,economy:[0,1].map(i=>({zone:i+1,...zoneGoldBudget(i)})),
    currencies:[0,1,2,3].map(i=>({zone:i+1,...zoneCurrency(),...ZONE_ABILITY_REWARDS,masteredMonsterChance:.0042,firstClearGuardianEchoes:echoesExpected(i),expectedRareElites:rareExpected(i),expectedFirstClearSigils:(zoneBalance(i).swarmCount-echoesExpected(i)-rareExpected(i))*.003+echoesExpected(i)*.35+rareExpected(i)+4*zoneFloorCount(i)+3})),
    dungeonPerks:DUNGEON_PERKS.map(p=>({...p,styles:p.adaptive?Object.fromEntries(Object.keys(STYLE_DEFS).map(style=>[STYLE_DEFS[style].name,dungeonStylePerk(p.id,style)])):null,ranks:Array.from({length:p.max},(_,i)=>({rank:i+1,price:dungeonPerkCost(p.id,i)}))})),
    migration:{legacySealsPerSigil:25,refund:'Unspent seals plus the full historical price of all purchased ranks',fractionalCredit:true},
    dungeoneeringLevels:Array.from({length:12},(_,i)=>({level:i+1,totalXp:DUNGEONEERING_XP_STEP*i*i})),limits:TIER_LIMITS,promotionCosts:TIER_PROMOTION_COSTS,zones:[0,1,2,3].map(i=>zoneBalance(i)),
    zoneDepths:[0,1,2,3].map(index=>({zone:index+1,floors:zoneFloorCount(index),start:zoneStart(index),end:zoneEnd(index),names:Array.from({length:zoneFloorCount(index)},(_,i)=>zoneFloorName(index,i+1)),ordinaryForms:ENVIRONMENT_ZONES[index].monsters.length,eliteForms:RARE_ELITE_NAMES[index].length})),
    rareElites:{chance:RARE_ELITE_CHANCE,healthMultiplier:3.5,maximumPerWave:1,blessingChance:1,otherEliteBlessingChance:.35,stacking:true,lifesteal:TRINKETS.leech.value,boons:ELITE_BOONS,forms:RARE_ELITE_NAMES},
    encounters:{patterns:28,expanded:EXPANDED_ABILITIES,colors:COMBAT_LANGUAGE,bossHealthMultiplier:1.12,phases:[.75,.4],friendlyFire:{ordinary:.35,elite:.12,boss:.025},summons:{maximum:8,maximumElites:3,maximumSpires:2,rewards:false},healing:RESTORATION,healingStream:{playerPerSecond:.0035,playerLifetimeReserve:.15,ownerPerSecond:.004}},
    weapons,armorSets:Object.values(ARMOR_SETS),resources:TIER_RESOURCES.map(key=>({key,name:RESOURCE_LABEL[key],source:RESOURCE_SOURCE[key]})),activities:Object.entries(SKILLS).filter(([,s])=>s.tier===2).map(([id,s])=>({id,...s,activeSeconds:ACTIVE_INTERVAL[id],group:disciplineFor(id)}))
   };
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
   '# Dungeon progression and balance','',
   'Build 10.0 replaces individual Zone Shops with a permanent Dungeon Shop. All current Zones belong to The First Descent. The data model can assign future Zones to a new Dungeon with a separate wallet and purchases. Equipment, global Dungeoneering and Mastery retain their own roles.','',
   '## Equipment ceilings','',
   '| Weapon | Style | Iron | Dedicated Iron | Steel | Dedicated Steel |','| --- | --- | ---: | ---: | ---: | ---: |',
   ...r.weapons.map(w=>'| '+w.name+' | '+w.style+' | '+f(w.tiers[0].normal)+' | '+f(w.tiers[0].dedicated)+' | '+f(w.tiers[1].normal)+' | '+f(w.tiers[1].dedicated)+' |'),'',
   'These figures use maximum refinement and speed, 5% base critical chance and matching robes for Mage. Proficiency adds up to 3% damage and matching crafting levels up to 5%. Iron refinement ends at 10, speed/reach at 5, reinforcement at 5 and enchantment at 2. Steel ends at 20 / 10 / 10 / 4. Equipment recipes, jewelry and material costs remain unchanged.','',
   'Above 100 single-target DPS in Zone 1 or 200 in later Zones, each additional calculated DPS contributes 0.25 actual DPS. Live primary damage uses the same adjustment. Ranged extra arrows contribute 15% each and are included in that figure. Conditional effects, burns, chains, ricochets, secondary targets and temporary blessings are additional.','',
   '## Dungeon Shop','',
   '| Perk | Dungeoneering | Maximum rank | First price |','| --- | ---: | ---: | ---: |',...r.dungeonPerks.map(p=>'| '+p.name+(p.adaptive?' · changes by style':'')+' | '+p.level+' | '+p.max+' | '+p.base+' |'),'',
   'Eight perks are available at level 1. More unlock at levels 3, 5, 8 and 12. Costs grow by 2.8× per rank, rounded upward; every exact rank price is in balance-report.json. Purchased ranks apply across all Zones in the same Dungeon. Traditional flat damage, speed, health, critical chance, gold, XP and regeneration are reserved for other systems.','',
   '| Shared purchase | Melee | Mage | Ranged |','| --- | --- | --- | --- |',...r.dungeonPerks.filter(p=>p.styles).map(p=>'| '+p.name+' | '+p.styles.Melee.description+' | '+p.styles.Mage.description+' | '+p.styles.Ranged.description+' |'),'',
   'The shop displays the equipped style and explains that these effects change when switching weapon. Every purchase has an effect for all three styles.','',
   '## Dungeon Sigils and gold','',
   '| Zone | Expected Sigils / first clear |','| --- | ---: |',...r.currencies.map(c=>'| '+c.zone+' | '+c.expectedFirstClearSigils.toFixed(2)+' |'),'',
   'Ordinary enemies have a 0.3% chance of one Sigil, rising to 0.42% at Fortune 4. Other elites have a 35% chance of one. Rare creatures guarantee one. Guardians grant 1 / 1 / 2, with another 3 from the final overlord of each Zone. Summoned enemies and totems grant no rewards or wave progress. The estimate includes first-clear known-elite substitutions and expected rare spawns, without requiring an ability purchase.','',
   '| Zone | Guardian gold | Floor caches | Baseline gold without elites |','| --- | ---: | ---: | ---: |',...r.economy.map(c=>'| '+c.zone+' | '+c.guardians+' | '+c.clears+' | '+c.total+' |'),'',
   'Ordinary kills grant no gold unless Golden Hunt is active. Existing gold jewelry modifies normal combat income. Fractional gold persists. Scavenging remains a separate source.','',
   '## Pacing and counterplay','',
   '| Zone | Forecast at 1× | Reference DPS |','| --- | --- | ---: |',...r.zones.map(z=>'| '+(z.index+1)+' | ~'+z.minutes+' min | '+f(z.dps)+' |'),'',
   ...r.simulated.map(s=>'- Live Zone '+s.zone+': **'+f(s.seconds/60)+' min**, '+s.kills+' rewarded defeats, '+f(s.referenceDps)+' reference DPS.'),'',
   'The live fixture uses actual spawning, attacks, movement, shield guards, summoning spires, reflection and phase transitions at 40 ms steps. It suppresses incoming damage and XP advancement, skips blessing choices and uses no purchased Dungeon perks. It moves to reflect centers, destroys spires, defeats guards and intercepts healing streams. These are combat-time benchmarks, not a promise of wall-clock play time. Menus, mistakes and preparation can extend them.','',
   'Bosses have 12% more health than the previous baseline and change tactics at 75% / 40% HP. Melee uses a capsule matching the visible body of large creatures; player projectiles use swept collision against that same body. Healing and power totems remain interceptable and untargetable. Summoning spires have a health bar and remain until destroyed or their caster falls. They replenish ordinary monsters every 5.5s or elites every 9s, following a visible arrival warning. At most two spires, eight summoned enemies and three summoned elites are active.','',
   '## Warning language and ability library','',
   '| Color | Meaning |','| --- | --- |','| Red | Dangerous to the player only |','| Violet | Dangerous to player and other monsters |','| Gold / white center | Stand in the center to reflect |','| Teal | Safe area or an intercepted benefit |','| Blue | Shield; remove its source / Royal Guards |','',
   'Colors are reinforced by outlines, shapes and labels. Violet attacks deal 35% ordinary, 12% elite or 2.5% boss maximum HP before shields, once per cast; the caster is immune. These hits cannot trigger player lifesteal, enchantment or weapon procs.','',
   'The encounter library now has 28 patterns: the ten existing attacks plus the following eighteen. Final guardians use a broad rotation and forced phase attacks.','',
   ...Object.values(r.encounters.expanded).map(a=>'- **'+a.name+'**: '+a.hint+'.'),'',
   'Rebounding Barrage fires three spaced rings that bounce off the marked arena bounds. Growing Stars expand from radius 6 to at most 23. Homeward Blades turn back toward their caster after 1.25s. A successful reflect returns 12% maximum HP and staggers for 1.6s; a missed Hungry Mirror restores 5% boss HP. Royal Guards reduce boss damage taken by 70% until both are defeated. Major arena attacks and reflect warnings do not overlap other casts; projectile rings remain visible and their center can be protected by a reflect ward.','',
   '## Stackable blessings and healing','',
   'Rare creatures always leave a blessing choice. Other non-summoned elites leave one 35% of the time. Walk over spoils to pause combat and choose A/B/C by click, touch or keys 1/2/3. Movement and Escape cannot select or dismiss it; Skip explicitly discards it. Choice contents are fixed when dropped and persist through reload.','',
   '| Blessing | Duration | Effect |','| --- | ---: | --- |',...Object.values(r.rareElites.boons).map(b=>'| '+b.name+' | '+b.seconds+'s | '+b.description+' |'),'',
   'Different blessings and repeated copies stack with independent combat timers. Damage, attack speed, reach and movement multipliers multiply; extra gold/material rewards add. Menus, pause and skilling freeze timers. Blessings carry across Zones in the same Dungeon. Secondary proc attacks do not recursively trigger more procs. No new blessing heals.','',
   'Ordinary monsters have a 2% chance of a 3% maximum-HP heal. Other elites have a 55% chance of 12%; rares have a 70% chance of 15%. Intercepted healing restores 0.35% player maximum HP per second, with a finite 15% lifetime reserve per healing totem. Once depleted it still blocks the caster’s healing. An uninterrupted stream restores 0.4% caster maximum HP per second. Healing streams do not stack. The lifesteal ring remains at 0.5% of actual health removed.','',
   '## Persistent progression and migration','',
   'Dungeoneering XP is shared across Zones. Level 2 needs 1,600 total XP; level 3 needs 6,400. Levels unlock shop choices and grant no Mastery points. Only Zone-final overlords grant 2 Mastery, except the first victory over Zone 1 Floor 1’s overlord, which also grants 2 once and opens 2× Delve speed. Mastery never accelerates skilling; its own future speed perk remains separate. Ammunition still supplies ten seconds of firing per arrow or rune.','',
   'The first idle-slot tip explains that the next slot unlocks at Zone 2. Crafting the first upgraded weapon gives a refinement / Warding enchantment tip. Floor travel, equipment, 55 authored floors and 42 ordinary / 42 rare creature forms are preserved.','',
   'Old Zone wallets and the full historical price of every purchased rank are refunded at 25 seals per Sigil. Fractional credit is retained and a versioned receipt prevents a second refund. Original Zone ledgers are archived in the save. Earlier progression first passes through the existing XP / Mastery migration. Gold, materials, equipment, cached XP and Mastery are preserved. A legacy active blessing becomes one entry in the stacking collection.','',
   'Run npm test for the browser suites, including 72 new-pattern / environment combinations, mobile picker safety, reward isolation, exact migration, style-adaptive perks, base equipment ceilings and full Zone simulations. Run npm run report:balance to regenerate this document and balance-report.json.',''
  ].join('\n');
  fs.writeFileSync(path.join(root,'BALANCE.md'),md);fs.writeFileSync(path.join(root,'balance-report.json'),JSON.stringify(r,null,2)+'\n');console.log('Generated Dungeon Shop costs, reward rates, combat mechanics and live pacing.');
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
