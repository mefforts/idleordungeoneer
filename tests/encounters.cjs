const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs'),{encounterFixture}=require('./encounter-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 try{
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+encounterFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.evaluate(()=>__encounterTest.ready());
  assert.deepEqual(await p.evaluate(()=>__encounterTest.assets()),{count:12,unique:12,loaded:true});
  for(const position of ['center','ring','outside']){
   const r=await p.evaluate(position=>__encounterTest.reflect(position),position);assert.deepEqual(r.during,{hp:r.before.hp,enemy:r.before.enemy});
   if(position==='center'){assert.equal(r.after.enemy,880);assert.equal(r.after.hp,r.before.hp);assert.equal(r.after.stagger,1.6);assert.equal(r.after.burn,0);}else{assert.equal(r.after.enemy,1000);assert.equal(r.after.hp<r.before.hp,position==='ring');}
   assert.equal(r.repeated,r.after.enemy,'A resolved counter cannot deal damage twice');
  }
  const lethal=await p.evaluate(()=>__encounterTest.reflect('center',true));assert.equal(lethal.after.alive,false);assert.equal(lethal.after.kills,1);assert.equal(lethal.after.points,lethal.before.points+1);
  passed.push('Reflect warnings do no early damage; the center returns exactly 12% HP and staggers, the annulus hits, escape avoids damage, and a lethal counter rewards once');
  for(const type of ['mend','fury']){
   const r=await p.evaluate(type=>__encounterTest.streams(type),type);
   if(type==='mend'){assert.equal(r.unblocked.hp,508);assert.equal(r.blocked.hp,508);assert.equal(r.blocked.player,520);assert.equal(r.resumed.hp,516);assert.equal(r.resumed.player,520);}
   else{assert.ok(Math.abs(r.unblocked.damage-r.base*1.12)<1e-8);assert.equal(r.blocked.damage,r.base);assert.equal(r.blocked.rally,5);assert.equal(r.resumed.damage,r.base*1.12);}
   assert.equal(r.blocked.blocked,true);assert.deepEqual(r.expired,{rally:0,nodes:0,damage:r.base});assert.equal(r.kills,0);
  }
  const edges=await p.evaluate(()=>__encounterTest.healingEdges());assert.deepEqual(edges,{capped:1000,double:510,partial:502});
  passed.push('Healing and power streams divert to the player only on interception; healing clamps and never stacks, partial ticks stay proportional, buffs expire and broken nodes stop boosting');
  for(const weapon of ['sword','shield','polearm','greatsword','bow','staff']){
   const r=await p.evaluate(weapon=>__encounterTest.hitTotem(weapon),weapon);assert.equal(r.attacked,true,weapon);assert.equal(r.remaining,0,weapon);assert.equal(r.phase,1);assert.deepEqual(r.after,r.before,weapon+' node must not produce loot, XP, Mastery or wave kills');
   const boost=await p.evaluate(weapon=>__encounterTest.rally(weapon),weapon);assert.ok(Math.abs(boost.damage-boost.base*1.1)<1e-7,weapon+' gets only 10% conditional damage');assert.equal(boost.base,boost.profile);
  }
  passed.push('All six weapons can break totems through real attacks/projectiles without loot or progression; intercepted power adds 10% hits without changing permanent DPS');
  for(const stage of [1,2,3]){
   const r=await p.evaluate(stage=>__encounterTest.elites(stage),stage);assert.equal(r.count,stage);assert.equal(new Set(r.types).size,stage);assert.equal(r.extra,false);assert.equal(r.active,stage-1);assert.equal(r.after.kills,r.before.kills+1);assert.equal(r.after.points,r.before.points);assert.equal(r.after.essence,r.before.essence);
  }
  const unseen=await p.evaluate(()=>__encounterTest.elites(3,[false,false,false]));assert.equal(unseen.count,0);
  const known=await p.evaluate(()=>__encounterTest.elites(3,[false,true,false]));assert.deepEqual(known.types,[1,1,1]);
  passed.push('Later floors substitute two or three simultaneous known elites, favor different guardians, keep wave totals and rewards intact, and never introduce an unseen boss');
  const schedule=await p.evaluate(()=>__encounterTest.scheduling());assert.deepEqual(schedule,{third:false,counterWait:false,reserved:true,offenseWait:false,hazardWait:false,reflection:true,noOverlap:false,absorbed:true,notAbsorbed:false,active:1});
  const budget=await p.evaluate(()=>__encounterTest.nodeBudget());assert.deepEqual(budget,{first:true,second:false,count:2,expired:0,targets:0});
  passed.push('At most two attacks wind up together; reflect waits for hazards, reserves one clear counter window, and absorbs hostile projectiles in its core');
  for(const which of ['owner','reset','phase','death','next']){const r=await p.evaluate(which=>__encounterTest.cleanup(which),which);assert.equal(r.nodes,0);assert.equal(r.request,false);assert.equal(r.casts,0);if(which!=='owner')assert.equal(r.rally,0);}
  for(const context of ['pause','skill']){const r=await p.evaluate(context=>__encounterTest.timing(2,context),context);assert.equal(r.life,6);assert.equal(r.combat,0);}
  const normal=await p.evaluate(()=>__encounterTest.timing(1)),fast=await p.evaluate(()=>__encounterTest.timing(2));assert.ok(Math.abs(normal.life-5.8)<1e-8);assert.ok(Math.abs(fast.life-5.6)<1e-8);assert.equal(normal.skill,fast.skill);
  passed.push('Owner death, phase change, retry and defeat clean encounter objects; menus and skilling pause them while Delve speed scales only their combat clock');
  for(const width of [320,390,844,1440]){
   await p.setViewportSize({width,height:width===844?390:844});
   for(const side of ['left','right'])for(let kind=0;kind<4;kind++)for(const offset of [0,400,900]){const r=await p.evaluate(({kind,offset,side})=>__encounterTest.placement(kind,3,offset,side),{kind,offset,side});assert.ok(r.clear);assert.ok(r.point.x-r.point.r>=r.camX-r.w/2+(side==='left'?52:0));assert.ok(r.point.x+r.point.r<=r.camX+r.w/2-(side==='right'?52:0));assert.ok(r.point.y-r.point.r>=r.camY-r.h/2);assert.ok(r.point.y+r.point.r<=r.camY+r.h/2);}
  }
  passed.push('Reachable reflect centers avoid scenery in every area at 320, 390, 844 and 1440 pixels, including landscape and distant world coordinates');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
