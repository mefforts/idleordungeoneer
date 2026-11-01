const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime,balanceHashes}=require('./runtime.cjs');
function instrumentation(){
 function fresh(kind=0,stage=1){
  if(codexSession)closeCodex();closeDrawer();hideOverlay();data=defaults();data.floor=kind*3+stage;data.cleared=data.floor-1;data.onboardingDone=data.tutorialSeen=data.masteryIntroSeen=data.zone2SkillsAnnounced=true;
  normalizeProgression();normalizeZone();ensureJobs();resetRun();game.scene='combat';game.status='running';game.menuPaused=game.manualPaused=true;game.phase=0;game.phaseTarget=1e9;game.eliteAt=1e9;game.player.x=game.player.y=0;game.enemies=[];game.frame=2;setScene('combat',false);refreshUI();
 }
 function stats(e){return {x:e.x,y:e.y,rad:e.rad,hp:e.hp,maxHp:e.maxHp,speed:e.speed,contact:e.contact,boss:e.boss,bossIndex:e.bossIndex};}
 window.__environmentTest={fresh,
  async assets(){await Promise.all(Object.keys(ENVIRONMENT_ART).map(key=>environmentImage(key).decode()));await Promise.all([creatureImage.decode(),propImage.decode(),groundImage.decode()]);return Object.entries(ENVIRONMENT_ART).map(([key,art])=>({key,width:art.width,height:art.height,src:art.src}));},
  layout(kind,stage){fresh(kind,stage);const objects=worldScenery(kind,0,0,6500,6500);return {props:[...new Set(objects.filter(o=>!o.decal).map(o=>o.index))].sort((a,b)=>a-b),decals:[...new Set(objects.filter(o=>o.decal).map(o=>o.index))].sort(),sample:worldScenery(kind,240,-200,1100,800),cache:environmentCells.size,wrongKind:objects.some(o=>o.kind!==kind)};},
  repeat(){const a=JSON.stringify(worldScenery(biomeIndex(),240,-200,1100,800));environmentCells.clear();return a===JSON.stringify(worldScenery(biomeIndex(),240,-200,1100,800));},
  spawnMix(kind,stage){fresh(kind,stage);const counts=[0,0,0,0,0,0];for(let i=0;i<1200;i++){game.phaseSpawned=i;const e=spawnEnemy();counts[e.visualType]++;game.enemies=[];}return counts;},
  statsAndPoses(kind){
   fresh(kind);const random=Math.random;Math.random=()=>.37;let base,e;try{base=spawnBaseEnemy();game.enemies=[];e=spawnEnemy();}finally{Math.random=random;}
   const original=stats(e),sizes=[],poses=[];e.x=0;e.y=30;e.rad=15;e.hp=e.maxHp=100;e.lastHitAt=-10;e.frozen=0;e.wobble=0;game.player.x=-300;game.enemies=[e];
   for(let variant=0;variant<6;variant++){e.visualType=variant;const before=JSON.stringify(stats(e));sizes.push(environmentMobSize(e));for(const reduced of [true,false]){data.reducedMotion=reduced;const sums=[];for(const time of [1,1.47]){game.frame=time;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(100,100);drawMob(e,biome());ctx.restore();const pixels=ctx.getImageData(0,0,200,200).data;let hash=2166136261;for(let i=0;i<pixels.length;i+=4)hash=Math.imul(hash^(pixels[i]+pixels[i+1]*3+pixels[i+2]*5),16777619);sums.push(hash);}
    poses.push({variant,reduced,same:sums[0]===sums[1]});}if(JSON.stringify(stats(e))!==before)throw Error('Painting modified enemy combat values');}
   return {base:stats(base),spawn:original,sizes,poses};
  },
  collision(){fresh();const o=worldScenery(0,0,0,3000,3000).find(o=>!o.decal&&environmentProp(0,o.index).rx>0),def=environmentProp(0,o.index);game.player.x=o.x;game.player.y=o.y-4*o.s-13;resolveWorldCollisions(game.player);return {distance:Math.hypot((game.player.x-o.x)/(def.rx*o.s+9),(game.player.y+13-(o.y-4*o.s))/(def.ry*o.s+7)),finite:[game.player.x,game.player.y].every(Number.isFinite)};},
  fade(){
   fresh();const o={x:0,y:0,index:4,s:.8,kind:0},height=environmentProp(0,4).height*.8;
   const draw=(playerY,enemies)=>{game.player.x=0;game.player.y=playerY;game.enemies=enemies;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(200,230);scenerySprite(o,0);ctx.restore();const pixels=ctx.getImageData(0,0,400,300).data;let light=0;for(let i=0;i<pixels.length;i+=4)light+=pixels[i]+pixels[i+1]+pixels[i+2];return light;};
   return {normal:draw(500,[]),player:draw(-height*.5,[]),enemy:draw(500,[{x:0,y:-height*.5}]),nearEnemy:draw(500,[{x:0,y:-11,rad:15}])};
  },
  screenshot(kind,stage){fresh(kind,stage);game.manualPaused=false;game.phaseTarget=24;game.frame=3.1;const positions=[[-140,-60],[140,-60],[-210,80],[210,80],[-80,180],[85,-175]];for(let i=0;i<6;i++){const e=spawnEnemy();e.visualType=i;e.x=positions[i][0];e.y=positions[i][1];e.rad=15;e.hp=e.maxHp=100;}refreshUI();render();return {floor:data.floor,kind,stage,canvas:canvas.toDataURL('image/webp',.5)};}
 };
}
(async()=>{
 const runtime=await createRuntime(),{browser,baseURL,resultsDir}=runtime,errors=[],passed=[];
 const raw=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8'),baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'environment-baseline.json')));assert.deepEqual(balanceHashes(raw,Object.keys(baseline)),baseline,'Existing creatures, terrain, gear and loot remain unchanged');
 const html=raw.replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+instrumentation.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));await p.route(baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 try{
  await p.goto(baseURL);const assets=await p.evaluate(()=>__environmentTest.assets());assert.equal(assets.length,72);assert.equal(new Set(assets.map(a=>a.src)).size,72);
  const bounds=await p.evaluate(async assets=>{const c=document.createElement('canvas'),out=[];for(const a of assets){const im=new Image();im.src=a.src;await im.decode();c.width=im.width;c.height=im.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let solid=0,edge=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const alpha=d[(y*c.width+x)*4+3];if(alpha>80)solid++;if((x===0||y===0||x===c.width-1||y===c.height-1)&&alpha>0)edge++;}out.push({key:a.key,solid,edge,width:c.width,height:c.height});}return out;},assets);
  assert.ok(bounds.every(a=>a.solid>1500&&a.width>60&&a.height>60));assert.ok(bounds.filter(a=>!a.key.includes('-floor-')).every(a=>a.edge===0),'Every sprite has a transparent gutter; no atlas neighbors or cropped edges');
  passed.push('72 unique embedded images decode offline: 32 scenery, 20 monsters, 12 ground details and 8 floor textures; all sprites have clean transparent borders');
  const layouts=[],mixes=[],renders=[];for(let kind=0;kind<4;kind++)for(let stage=1;stage<=3;stage++){
   const layout=await p.evaluate(({kind,stage})=>__environmentTest.layout(kind,stage),{kind,stage});assert.deepEqual(layout.props,Array.from({length:12},(_,i)=>i));assert.deepEqual(layout.decals,[0,1,2]);assert.equal(layout.wrongKind,false);assert.ok(layout.cache<=4096);assert.equal(await p.evaluate(()=>__environmentTest.repeat()),true);layouts.push(JSON.stringify(layout.sample));
   const counts=await p.evaluate(({kind,stage})=>__environmentTest.spawnMix(kind,stage),{kind,stage});assert.ok(counts.every(n=>n>0));mixes.push({kind,stage,counts});
   const frame=await p.evaluate(({kind,stage})=>__environmentTest.screenshot(kind,stage),{kind,stage});renders.push(frame.canvas);await p.screenshot({path:path.join(resultsDir,'environment-check-'+kind+'-'+stage+'.png')});
  }
  assert.equal(new Set(layouts).size,12);assert.equal(new Set(renders).size,12);
  for(let kind=0;kind<4;kind++){const first=mixes.find(m=>m.kind===kind&&m.stage===1),last=mixes.find(m=>m.kind===kind&&m.stage===3);assert.ok(first.counts[0]>last.counts[0]*2);assert.ok(last.counts[4]+last.counts[5]>first.counts[4]+first.counts[5]);}
  passed.push('All twelve zone/floor scenes render distinct terrain and seeded layouts; every themed prop/detail appears; deeper floors gradually change the monster mix');
  for(let kind=0;kind<4;kind++){const checks=await p.evaluate(kind=>__environmentTest.statsAndPoses(kind),kind);assert.deepEqual(checks.spawn,checks.base,'Visual variants must preserve spawn physics, health and damage pacing');assert.ok(checks.sizes.every(s=>Number.isFinite(s.width)&&s.width>20&&s.width<=100&&s.height>20&&s.height<=75));assert.ok(checks.poses.filter(p=>p.reduced).every(p=>p.same),'Reduced motion must stop new idle animation');assert.ok(checks.poses.filter(p=>!p.reduced).every(p=>!p.same),'Every visual family animates');}
  const collision=await p.evaluate(()=>__environmentTest.collision());assert.equal(collision.finite,true);assert.ok(collision.distance>=1-1e-8);const fade=await p.evaluate(()=>__environmentTest.fade());assert.ok(fade.normal>0&&fade.player<fade.normal*.5&&fade.enemy<fade.normal*.7&&fade.enemy>fade.player&&fade.nearEnemy<fade.normal*.7);
  passed.push('Twenty-four regular-monster looks retain combat values, animate distinctly and honor reduced motion; scenery uses foot collisions and fades around the player or enemies');
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__environmentTest.screenshot(2,3));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  passed.push('New art renders on phone layouts; equipment, loot, existing bosses and encounter definitions retain their baseline hashes');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,newAssets:assets.length,totalZoneAssets:108,mixes,fade,errors},null,2));
 }finally{await p.close();await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
