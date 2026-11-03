const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs'),{dungeonCombatFixture}=require('./dungeon-combat-fixture.cjs'),{spireFixture}=require('./spire-fixture.cjs');
(async()=>{const runtime=await createRuntime(),passed=[],errors=[];try{
 const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+dungeonCombatFixture.toString()+')();('+spireFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
 const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));
 const setup=options=>p.evaluate(options=>__spireTest.setup(options),options),state=()=>p.evaluate(()=>__spireTest.state()),at=(x=0,y=0)=>p.evaluate(({x,y})=>__spireTest.at(x,y),{x,y}),step=(dt=.02)=>p.evaluate(dt=>__spireTest.step(dt),dt);
 for(const zone of [0,1,3,8])for(const weapon of ['sword','shield','polearm','greatsword','staff','bow']){
  const before=await setup({zone,weapon});await at();const after=await step();assert.equal(after.source.exists,false);assert.equal(after.hp,before.hp);assert.deepEqual(after.ledger,before.ledger);assert.equal(after.owner,true);
 }
 passed.push('Ordinary spires break in one safe collision in early and later Zones with all six weapons, without rewards or damage to their caster');
 for(const zone of [0,3,8]){
  const before=await setup({royal:true,zone});await p.evaluate(()=>__spireTest.boost());await at();let s=await step();assert.equal(s.source.hp,before.source.maxHp/2,'Offensive perks cannot turn two physical impacts into one');assert.equal(s.source.bumps,1);
  assert.ok((await p.evaluate(()=>__spireTest.texts())).includes('STEP CLEAR OR DASH AGAIN'),'A surviving spire explains how to land the next impact');
  s=await p.evaluate(()=>__spireTest.advance(1));assert.equal(s.source.hp,before.source.maxHp/2,'Standing in the base cannot spend another bump');
  for(const x of [30,27,32,26]){await at(x);s=await step();assert.equal(s.source.bumps,1,'Boundary jitter does not re-arm a collision');}
  await at(42);await step();await at();s=await step();assert.equal(s.source.exists,false);assert.equal(s.hp,before.hp);
 }
 passed.push('Crowned spires require two separate impacts; camping and boundary jitter never count as repeated hits, even with damage perks');
 await setup({royal:true});const pass=await p.evaluate(()=>__spireTest.dashPass());assert.equal(pass.first.source.bumps,1);assert.equal(pass.after.source.bumps,1);assert.equal(pass.after.source.exists,true,'A fast exit is not a second collision in the same dash');await p.evaluate(()=>__spireTest.advance(.10));await at();assert.equal((await step()).source.exists,false);
 for(const [royal,fraction]of [[false,.08],[true,.12]]){
  const before=await setup({royal,mode:'surging'});await at();const s=await step();assert.ok(Math.abs((before.hp-s.hp)/before.maxHp-fraction)<1e-8);assert.equal(s.source.exists,royal);
 }
 const shield=await setup({mode:'surging',weapon:'shield'});await at();assert.ok(Math.abs((shield.hp-(await step()).hp)/shield.maxHp-.08*.72)<1e-8);
 for(const mode of ['disabled','silenced']){const before=await setup({royal:true,mode});await at();const s=await step();assert.equal(s.source.bumps,1);assert.equal(s.hp,before.hp);assert.equal(s.source.disabled,true);assert.equal(s.summons,0);}
 for(const royal of [false,true]){const before=await setup({royal,mode:'surging'});const s=await p.evaluate(()=>__spireTest.dashSweep());assert.equal(s.source.exists,royal);assert.equal(s.hp,before.hp,'A swept dash remains safe even on its final frame with no other invulnerability');}
 passed.push('Red summoning windows retaliate once for 8% / 12% health before defenses; shields, disabled/silenced spires and fast or ending dashes behave correctly');
 await setup();await at(0,-60);assert.equal((await step()).source.exists,true,'Overlapping the illustrated upper spire is not a ground-level impact');
 await setup();await p.evaluate(()=>__spireTest.overlap());await at();assert.equal((await step()).nodes,0,'Destroying one overlapping spire cannot skip the next in the collection');
 await setup();await p.evaluate(()=>__spireTest.pendingArrival());await at();let s=await step();assert.equal(s.source.exists,false);assert.equal(s.summons,0,'Destroying a spire cancels even an imminent queued arrival');
 await setup();await p.evaluate(()=>__spireTest.spawned());await at();s=await step();assert.equal(s.summons,1,'Existing reinforcements still need to be fought');s=await p.evaluate(()=>__spireTest.killOwner());assert.equal(s.summons,0);assert.equal(s.nodes,0);
 await setup({royal:true,mode:'surging'});await p.evaluate(()=>__spireTest.lowHealth());await at();s=await step();assert.equal(s.status,'dead');assert.equal(s.hp,0);assert.equal(s.nodes,0);assert.equal(s.shots,0,'Fatal retaliation cannot continue attacks or leave encounter objects behind');
 passed.push('Collision follows feet, processes adjacent spires, cancels queued arrivals, preserves existing minions, and cleans up correctly on caster/player death');
 for(const weapon of ['sword','staff','bow']){await setup({royal:true,weapon});const hit=await p.evaluate(()=>__spireTest.weaponHit());assert.equal(hit.attacked,true);assert.ok(hit.source.hp<hit.before);assert.equal(hit.source.exists,true);assert.equal(hit.source.bumps,1);await at();assert.equal((await step()).source.exists,false,'Weapons and physical impacts can finish the same spire');}
 for(const type of ['mend','fury']){await setup();await p.evaluate(type=>__spireTest.support(type),type);await at();assert.equal((await step()).nodes,1,'Healing and power streams remain interceptable, not breakable');}
 for(const kind of ['pause','menu','overlay','skill']){const before=await setup({royal:true,mode:'surging'});await at();const s=await p.evaluate(kind=>__spireTest.freeze(kind),kind);assert.equal(s.source.hp,before.source.hp);assert.equal(s.hp,before.hp);}
 passed.push('Weapon damage combines with bumps; healing/power totems survive contact; pause, menus, overlays and skilling cannot advance collisions');
 await setup();await p.evaluate(()=>__spireTest.resume());await p.keyboard.down('ArrowRight');await p.waitForFunction(()=>!__spireTest.state().source.exists,null,{timeout:3000});await p.keyboard.up('ArrowRight');assert.equal((await state()).hp,1000);
 await setup({royal:true});await p.evaluate(()=>__spireTest.resume());const cdp=await p.context().newCDPSession(p),touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints}),anchor={x:100,y:600,id:1};
 await touch('touchStart',[anchor]);await touch('touchMove',[{...anchor,x:150}]);await p.waitForFunction(()=>__spireTest.state().source.bumps===1,null,{timeout:3000});await p.waitForTimeout(600);assert.equal((await state()).source.exists,true);await touch('touchEnd',[]);
 await touch('touchStart',[anchor]);await touch('touchMove',[{...anchor,x:50}]);await p.waitForFunction(()=>!__spireTest.state().source.exists,null,{timeout:3000});await touch('touchEnd',[]);
 passed.push('Real keyboard movement breaks an ordinary spire; real touch movement crosses a crowned spire and returns for its second impact');
 for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
  await p.setViewportSize(viewport);for(const mode of ['safe','surging','disabled']){await setup({royal:true,mode,preview:true});await p.evaluate(()=>__spireTest.ready());const labels=await p.evaluate(()=>__spireTest.texts());assert.ok(labels.includes('2 BUMPS TO BREAK'));assert.ok(labels.includes(mode==='surging'?'SURGING · DASH OR WAIT':mode==='disabled'?'DISABLED':'BUMP TO BREAK'),JSON.stringify({viewport,mode,labels}));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:path.join(runtime.resultsDir,'spire-'+mode+'-'+viewport.width+'.png')});}
 }
 assert.deepEqual(errors,[]);passed.push('Bump counts and safe/surging/disabled labels render on small phones, landscape and desktop');console.log(JSON.stringify({passed,errors},null,2));
}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
