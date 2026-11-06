const fs=require('node:fs');
const path=require('node:path');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const walk=(n,fn)=>{if(!n||typeof n!=='object')return;fn(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn)}};
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<!-- BEGIN LOADING SCREEN -->[\s\S]*?<!-- END LOADING SCREEN -->\n?/,'').replace(/<style id="loadingStyles">[\s\S]*?<\/style>\n?/,'');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)],main=scripts.at(-1);
let source=main[1].replace(/\/\* BEGIN LIVING SKILLS \*\/[\s\S]*?\/\* END LIVING SKILLS \*\/\n?/,'');
const ast=parse(source,{ecmaVersion:'latest'}),functions=new Map();walk(ast,n=>{if(n.type==='FunctionDeclaration')functions.set(n.id.name,n)});
const gameData=JSON.parse(fs.readFileSync(path.join(root,'src/game-data.json'),'utf8'));
const balanceConfig=JSON.parse(fs.readFileSync(path.join(root,'src/balance-config.json'),'utf8'));
require('./validate-balance.cjs').validateBalance(balanceConfig,JSON.parse(fs.readFileSync(path.join(root,'src/game-data.json'),'utf8')));
const incoming=['balance','mechanic-contracts','player-art','zone-layout','systems','arena','equipment-regions','equipment','economy','dungeoneering','zone-progression','testing','presentation','codex','zone-shop','zone-shop-ui','environment-art','environments','encounter-art','encounters','mobile','zone-abilities','loading','ammunition','workshop-art','workshop','restoration','delve-travel','rare-elite-art','bestiary-art','rare-elites','deep-encounters','combat-expansion','ability-effects','time-progression','preparation','preparation-economy','loot','temporary-buffs','skilling-bonuses','progression-guidance','zone-materials','ground-loot','delve-update','reflect-wards','crafting-update','specific-vouchers','blessing-shop','zone-challenge','skill-progression','work-navigation','encounter-health','tier-three','refinement-economy','themed-effect-assets','themed-encounters','themed-encounter-art','encounter-damage','uncommon-enemies','siphon-tethers','dash-counters','elite-behaviors','elite-task-art','travelling-mechanics','travelling-art-assets','mechanic-presentation','player-hitbox','enemy-positioning','released-attacks','offscreen-threats','guide-rules'].map(name=>fs.readFileSync(path.join(root,'src/'+name+'.js'),'utf8')).join('\n'),incomingAst=parse(incoming,{ecmaVersion:'latest'}),patches=[],helpers=['const BALANCE_CONFIG='+JSON.stringify(balanceConfig)+';','const BALANCE_CATALOG='+JSON.stringify({resourceKeys:[...Object.keys(gameData.RESOURCE_SOURCE),'gold','essence','sigils'],tierResourceKeys:Object.entries(gameData.RESOURCE_SOURCE).filter(([,key])=>(gameData.SKILLS[key]?.tier||1)>1).map(([key])=>key),themeCount:gameData.BIOMES.length})+';'],overrides=new Map();
for(const n of incomingAst.body){const code=incoming.slice(n.start,n.end);if(n.type==='FunctionDeclaration'){if(overrides.has(n.id.name))throw Error('Duplicate source function: '+n.id.name);overrides.set(n.id.name,{node:n,code});}else helpers.push(code)}
for(const [name,{code}] of overrides){if(functions.has(name)){const old=functions.get(name);patches.push({start:old.start,end:old.end,code});}else helpers.push(code)}
const artFile=path.join(root,'src/equipment-art.json');
const icons={...JSON.parse(fs.readFileSync(path.join(root,'src/systems-icons.json'),'utf8')),...(fs.existsSync(artFile)?JSON.parse(fs.readFileSync(artFile,'utf8')):{}),...JSON.parse(fs.readFileSync(path.join(root,'src/zone2-art.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/painted-icons.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/navigation-icons.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/zone-ability-icons.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/restoration-art.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/elite-boon-icons.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/player-icons.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(root,'src/tier-three-icons.json'),'utf8'))};
const skillingBackground=name=>'data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/skilling/'+name+'.webp')).toString('base64');
const campSheets=['outdoor','workshops'].map(skillingBackground);
icons['zone2-gathering.svg']=skillingBackground('advanced');
walk(ast,n=>{if(n.type==='VariableDeclarator'&&n.id.name==='CAMP_SHEETS')patches.push({start:n.init.start,end:n.init.end,code:JSON.stringify(campSheets)});});
icons['action-relicClean.svg']=icons['rough-opal.svg'];
let originalIcons={};walk(ast,n=>{if(n.type==='VariableDeclarator'&&n.id.name==='SVG_FILES')originalIcons=JSON.parse(source.slice(n.init.start,n.init.end));});
const retiredArmorRenderers=['paintEquipmentBody','paintEquipmentArm','paintEquipmentLeg','paintEquipmentHead','paintEquipmentWorkLeg','paintRigSegment','paintEquipmentLegStrip'];
for(const name of retiredArmorRenderers){const node=functions.get(name);if(node)patches.push({start:node.start,end:node.end,code:''});}
for(const [key,skill]of Object.entries(gameData.SKILLS)){Object.assign(skill,balanceConfig.production.activityOverrides[key]||{});skill.seconds=gameData.ACTIVE_INTERVAL[key]/balanceConfig.production.idleRate;}
const progressionInitializers={minLvl:'xp=>skillLevelAtXp(xp)',levelRange:'xp=>skillLevelRange(xp)',trinketBonus:'key=>refinedTrinketBonus(key)',attackReach:'()=>weaponReach()',attackDamage:'()=>zoneCombatProfile(data.weaponType).damage',emptyZone:'()=>zoneSnapshot()',idleSlotsUnlocked:'()=>data.cleared>=zoneEnd(0)?2:data.cleared>=1?1:0',zoneNumber:'()=>zoneForFloor(data.floor)',zoneStage:'()=>floorStage(data.floor)',maximumZone:'()=>zoneForFloor((data.cleared||0)+1)+1',biomeIndex:'()=>zoneTuning().theme',maxHp:'()=>BALANCE_CONFIG.equipment.baseHealth+armorStats().health+trinketBonus(\'hp\')'};
walk(ast,n=>{if(n.type==='VariableDeclarator'&&Object.hasOwn(progressionInitializers,n.id.name))patches.push({start:n.init.start,end:n.init.end,code:progressionInitializers[n.id.name]});});
walk(ast,n=>{if(n.type==='VariableDeclarator'&&Object.hasOwn(gameData,n.id.name))patches.push({start:n.init.start,end:n.init.end,code:JSON.stringify(gameData[n.id.name])})});
walk(ast,n=>{if(n.type==='VariableDeclarator'&&n.id.name==='SVG_FILES')patches.push({start:n.init.start,end:n.init.end,code:JSON.stringify(Object.fromEntries(Object.entries({...JSON.parse(source.slice(n.init.start,n.init.end)),...icons}).filter(([key])=>key!=='equipment-armor-atlas.svg')))})});
for(const p of patches.sort((a,b)=>b.start-a.start))source=source.slice(0,p.start)+p.code+source.slice(p.end);
source=source.replaceAll('Math.floor((data.floor-1)/3)%4','biomeIndex()').replaceAll('Math.min(8*3600,','Math.min(BALANCE_CONFIG.production.offlineHours*3600,');
source=source.replace(/data=\{\.\.\.defaults\(\),\.\.\.saved[^;]*\};/,'data={...defaults(),...saved,zoneLayoutVersion:Number(saved.zoneLayoutVersion)||0,timeProgressionVersion:Number(saved.timeProgressionVersion)||0,lootPresentationVersion:Number(saved.lootPresentationVersion)||0,preparationEconomyVersion:Number(saved.preparationEconomyVersion)||0};');
source=source.replace('const ACTIVE_INTERVAL=', '/* BEGIN LIVING SKILLS */\n'+helpers.join('\n\n')+'\n/* END LIVING SKILLS */\nconst ACTIVE_INTERVAL=');
source=source.replace(/installDungeoneeringUI\(\);(?:installPresentationUI\(\);)?/,'installDungeoneeringUI();installPresentationUI();');
source=source.replace(/\/\* BEGIN TIER API \*\/[\s\S]*?\/\* END TIER API \*\/\n?/,'');
source=source.replace(/\nfinishGameLoading\(\);/g,'');
source=source.replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','/* BEGIN TIER API */\nObject.assign(window.__deepwell,{openZoneShop,buyZoneUpgrade,zoneShopFor,zoneCombatProfile,dungeonProgress,currencyDropChance,rareDropChance,shopUpgradeCost,tier2Unlocked,promoteStyle,styleTier,styleUpgradeCap,canUseSkill,skillLockReason,progressionCaps:()=>TIER_LIMITS,resourceInfo:()=>Object.fromEntries(Object.keys(RESOURCE_LABEL).map(k=>[k,{name:RESOURCE_LABEL[k],source:RESOURCE_SOURCE[k]}])),skillKeys:()=>[...SKILL_KEYS]});\n/* END TIER API */\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
source=source.replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);\nfinishGameLoading();');
parse(source,{ecmaVersion:'latest'});
html=html.slice(0,main.index)+'<script>'+source+'</script>'+html.slice(main.index+main[0].length);
html=html.replace(/<script>[\s\S]*?<\/script>/,'<script>'+fs.readFileSync(path.join(root,'src/avatar-rig.js'),'utf8')+'</script>');
const embedded=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const creator=embedded[1];html=html.slice(0,creator.index)+'<script>'+fs.readFileSync(path.join(root,'src/character-creator.js'),'utf8')+'</script>'+html.slice(creator.index+creator[0].length);
// Initial DOM icons use the same art as dynamically rendered menus.
const firstScript=html.indexOf('<script>');let markup=html.slice(0,firstScript);
for(const [key,uri]of Object.entries(icons))if(originalIcons[key]&&uri!==originalIcons[key])markup=markup.replaceAll('src="'+originalIcons[key]+'"','src="'+uri+'"');
html=markup+html.slice(firstScript);
html=html.replace(/\/\* BEGIN LIVING SKILLS CSS \*\/[\s\S]*?\/\* END LIVING SKILLS CSS \*\/\n?/,'');
const styles=['systems','arena','equipment','runestones','zone-progression','presentation','zone-shop','mobile','workshop','delve-travel','rare-elites','preparation','workshop-update'].map(name=>{
  const filename=path.join(root,'src/'+name+'.css');
  return fs.readFileSync(filename,'utf8').replace(/url\((["']?)(\.\.\/assets\/[^)"']+)\1\)/g,(_,quote,asset)=>{
    const assetPath=path.resolve(path.dirname(filename),asset),mime=path.extname(assetPath)==='.svg'?'image/svg+xml':'image/webp';
    return 'url("data:'+mime+';base64,'+fs.readFileSync(assetPath).toString('base64')+'")';
  });
}).join('\n');
// Put the tiny first-paint screen before the large embedded game styles and art.
const gameStyle=html.match(/<style(?: id="gameStyles")?>([\s\S]*?)<\/style>/);
if(!gameStyle)throw Error('Game stylesheet missing');
html=html.replace(gameStyle[0],'');
const gameCss=gameStyle[1].trimEnd()+'\n/* BEGIN LIVING SKILLS CSS */\n@layer presentation;\n'+styles+'\n/* END LIVING SKILLS CSS */\n';
html=html.replace(/<html([^>]*)>/,(_,attrs)=>'<html'+attrs.replace(/ class="game-loading"/g,'')+' class="game-loading">');
html=html.replace(/<head>\s*/,'<head>\n<style id="loadingStyles">'+fs.readFileSync(path.join(root,'src/loading.css'),'utf8')+'</style>\n').replace(/\s*<\/head>/,'\n</head>');
const loading=fs.readFileSync(path.join(root,'src/loading.html'),'utf8')+'\n<script id="loadingRuntime">'+fs.readFileSync(path.join(root,'src/loading-runtime.js'),'utf8')+'</script>';
html=html.replace(/<body>\s*/,'<body>\n<!-- BEGIN LOADING SCREEN -->\n'+loading+'\n<!-- END LOADING SCREEN -->\n<style id="gameStyles">'+gameCss+'</style>\n');
html=html.replace('<div class="app" id="app">','<div class="app" id="app" inert aria-hidden="true">');
fs.writeFileSync(path.join(root,'index.html'),html);console.log('Synced Living Skills:',patches.length,'replacements; standalone HTML',Buffer.byteLength(html),'bytes');
