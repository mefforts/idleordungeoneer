const fs=require('node:fs');
const path=require('node:path');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const walk=(n,fn)=>{if(!n||typeof n!=='object')return;fn(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn)}};
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)],main=scripts.at(-1);
let source=main[1].replace(/\/\* BEGIN LIVING SKILLS \*\/[\s\S]*?\/\* END LIVING SKILLS \*\/\n?/,'');
const ast=parse(source,{ecmaVersion:'latest'}),functions=new Map();walk(ast,n=>{if(n.type==='FunctionDeclaration')functions.set(n.id.name,n)});
const incoming=['systems','arena','equipment-regions','equipment','dungeoneering','zone-progression','presentation','codex'].map(name=>fs.readFileSync(path.join(root,'src/'+name+'.js'),'utf8')).join('\n'),incomingAst=parse(incoming,{ecmaVersion:'latest'}),patches=[],helpers=[],overrides=new Map();
for(const n of incomingAst.body){const code=incoming.slice(n.start,n.end);if(n.type==='FunctionDeclaration')overrides.set(n.id.name,{node:n,code});else helpers.push(code)}
for(const [name,{code}] of overrides){if(functions.has(name)){const old=functions.get(name);patches.push({start:old.start,end:old.end,code});}else helpers.push(code)}
const artFile=path.join(root,'src/equipment-art.json');
const icons={...JSON.parse(fs.readFileSync(path.join(root,'src/systems-icons.json'),'utf8')),...(fs.existsSync(artFile)?JSON.parse(fs.readFileSync(artFile,'utf8')):{}),...JSON.parse(fs.readFileSync(path.join(root,'src/zone2-art.json'),'utf8'))};
const gameData=JSON.parse(fs.readFileSync(path.join(root,'src/game-data.json'),'utf8'));
walk(ast,n=>{if(n.type==='VariableDeclarator'&&Object.hasOwn(gameData,n.id.name))patches.push({start:n.init.start,end:n.init.end,code:JSON.stringify(gameData[n.id.name])})});
walk(ast,n=>{if(n.type==='VariableDeclarator'&&n.id.name==='SVG_FILES')patches.push({start:n.init.start,end:n.init.end,code:JSON.stringify({...JSON.parse(source.slice(n.init.start,n.init.end)),...icons})})});
for(const p of patches.sort((a,b)=>b.start-a.start))source=source.slice(0,p.start)+p.code+source.slice(p.end);
source=source.replace('const ACTIVE_INTERVAL=', '/* BEGIN LIVING SKILLS */\n'+helpers.join('\n\n')+'\n/* END LIVING SKILLS */\nconst ACTIVE_INTERVAL=');
source=source.replace(/installDungeoneeringUI\(\);(?:installPresentationUI\(\);)?/,'installDungeoneeringUI();installPresentationUI();');
source=source.replace(/\/\* BEGIN TIER API \*\/[\s\S]*?\/\* END TIER API \*\/\n?/,'');
source=source.replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','/* BEGIN TIER API */\nObject.assign(window.__deepwell,{tier2Unlocked,promoteStyle,styleTier,styleUpgradeCap,canUseSkill,skillLockReason,progressionCaps:()=>TIER_LIMITS,resourceInfo:()=>Object.fromEntries(Object.keys(RESOURCE_LABEL).map(k=>[k,{name:RESOURCE_LABEL[k],source:RESOURCE_SOURCE[k]}])),skillKeys:()=>[...SKILL_KEYS]});\n/* END TIER API */\nresize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
parse(source,{ecmaVersion:'latest'});
html=html.slice(0,main.index)+'<script>'+source+'</script>'+html.slice(main.index+main[0].length);
html=html.replace(/<script>[\s\S]*?<\/script>/,'<script>'+fs.readFileSync(path.join(root,'src/avatar-rig.js'),'utf8')+'</script>');
const embedded=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const creator=embedded[1];html=html.slice(0,creator.index)+'<script>'+fs.readFileSync(path.join(root,'src/character-creator.js'),'utf8')+'</script>'+html.slice(creator.index+creator[0].length);
html=html.replace(/\/\* BEGIN LIVING SKILLS CSS \*\/[\s\S]*?\/\* END LIVING SKILLS CSS \*\/\n?/,'');
html=html.replace(/\n+<\/style><\/head>/,'\n</style></head>');
const styles=['systems','arena','equipment','runestones','zone-progression','presentation'].map(name=>{
  const filename=path.join(root,'src/'+name+'.css');
  return fs.readFileSync(filename,'utf8').replace(/url\((["']?)(\.\.\/assets\/[^)"']+)\1\)/g,(_,quote,asset)=>{
    const assetPath=path.resolve(path.dirname(filename),asset),mime=path.extname(assetPath)==='.svg'?'image/svg+xml':'image/webp';
    return 'url("data:'+mime+';base64,'+fs.readFileSync(assetPath).toString('base64')+'")';
  });
}).join('\n');
html=html.replace('</style></head>','/* BEGIN LIVING SKILLS CSS */\n@layer presentation;\n'+styles+'\n/* END LIVING SKILLS CSS */\n</style></head>');
fs.writeFileSync(path.join(root,'index.html'),html);console.log('Synced Living Skills:',patches.length,'replacements; standalone HTML',Buffer.byteLength(html),'bytes');
