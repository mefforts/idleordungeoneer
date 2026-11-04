const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRuntime}=require('./runtime.cjs'),{encounterFixture}=require('./encounter-fixture.cjs');
(async()=>{
 const runtime=await createRuntime(),passed=[],errors=[];
 try{
  const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8').replace('resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);','('+encounterFixture.toString()+')();resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);');
  const p=await runtime.browser.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto(runtime.baseURL);await p.evaluate(()=>__encounterTest.ready());
  assert.deepEqual(await p.evaluate(()=>__encounterTest.assets()),{count:12,unique:12,loaded:true});
  for(const position of ['center','ring','outside']){
   const r=await p.evaluate(position=>__encounterTest.reflect(position),position);assert.equal(r.warning,3);assert.equal(r.during.enemy,position==='center'?880:1000);
   if(position==='center'){assert.equal(r.after.enemy,880);assert.equal(r.after.hp,r.before.hp);assert.equal(r.after.stagger,1.6);assert.equal(r.after.burn,0);}else{assert.equal(r.after.enemy,1000);assert.ok(r.after.hp<r.before.hp);}
   assert.equal(r.repeated,r.after.enemy,'A resolved counter cannot deal damage twice');
  }
  const lethal=await p.evaluate(()=>__encounterTest.reflect('center',true));assert.equal(lethal.after.alive,false);assert.equal(lethal.after.kills,1);assert.equal(lethal.after.points,lethal.before.points);
  passed.push('Reflect centers return exactly 12% HP immediately and stagger, closed jaws hurt, ignoring the timer hurts at any distance, and a lethal counter rewards once');
  for(const type of ['mend','fury']){
   const r=await p.evaluate(type=>__encounterTest.streams(type),type);
   if(type==='mend'){assert.equal(r.unblocked.hp,504);assert.equal(r.blocked.hp,504);assert.equal(r.blocked.player,503.5);assert.equal(r.resumed.hp,508);assert.equal(r.resumed.player,503.5);}
   else{assert.ok(Math.abs(r.unblocked.damage-r.base*1.12)<1e-8);assert.equal(r.blocked.damage,r.base);assert.equal(r.blocked.rally,5);assert.ok(Math.abs(r.resumed.damage-r.base*1.12)<1e-8);}
   assert.equal(r.blocked.blocked,true);assert.deepEqual(r.expired,{rally:0,nodes:0,damage:r.base});assert.equal(r.kills,1);
  }
  const edges=await p.evaluate(()=>__encounterTest.healingEdges());assert.deepEqual(edges,{capped:1000,double:501.75,single:503.5});
  for(let kind=0;kind<4;kind++){const r=await p.evaluate(kind=>__encounterTest.proximity(kind),kind);assert.equal(r.inside.linked,true,'Off-axis proximity must link');assert.equal(r.near.linked,true);assert.equal(r.outside.linked,false);assert.ok(r.inside.distance<r.casterDistance&&r.outside.distance>r.casterDistance);}
  passed.push('Totems choose an off-axis player when closer than their caster, return to the caster outside that radius, never stack healing, and end their streams with the caster');
  for(const weapon of ['sword','shield','polearm','greatsword','bow','staff']){
   const r=await p.evaluate(weapon=>__encounterTest.hitTotem(weapon),weapon);assert.equal(r.attacked,true,weapon);assert.equal(r.remaining,1,weapon);assert.equal(r.targetable,false);assert.equal(r.direct,false);assert.ok(r.enemy<r.enemyBefore,weapon+' attacks the caster while intercepting');assert.equal(r.phase,1);assert.deepEqual(r.after,r.before,weapon+' node must not produce loot, XP, Mastery or wave kills');
   const boost=await p.evaluate(weapon=>__encounterTest.rally(weapon),weapon);assert.ok(Math.abs(boost.damage-boost.base*1.1)<1e-7,weapon+' gets only 10% conditional damage');assert.equal(boost.base,boost.profile);
  }
  passed.push('All six weapons ignore untargetable totems and hit their caster while intercepting; direct totem damage has no effect and interception adds only 10% conditional hit damage');
  for(const stage of [1,2,3]){
   const r=await p.evaluate(stage=>__encounterTest.elites(stage),stage);assert.equal(r.count,stage);assert.equal(new Set(r.types).size,stage);assert.equal(r.extra,false);assert.equal(r.active,stage-1);assert.equal(r.after.kills,r.before.kills+1);assert.equal(r.after.points,r.before.points);assert.equal(r.after.essence,r.before.essence);
  }
  const unseen=await p.evaluate(()=>__encounterTest.elites(3,[false,false,false]));assert.equal(unseen.count,0);
  const known=await p.evaluate(()=>__encounterTest.elites(3,[false,true,false]));assert.deepEqual(known.types,[1,1,1]);
  passed.push('Later floors substitute two or three simultaneous known elites, favor different guardians, keep wave totals and rewards intact, and never introduce an unseen boss');
  const schedule=await p.evaluate(()=>__encounterTest.scheduling());assert.deepEqual(schedule,{third:false,counterWait:false,reserved:true,offenseWait:false,hazardWait:false,reflection:true,noOverlap:false,unarmedAbsorbed:false,absorbed:true,notAbsorbed:false,active:1});
  const budget=await p.evaluate(()=>__encounterTest.nodeBudget());assert.deepEqual(budget,{first:true,second:true,secondType:'shield',count:2,remaining:2,targets:0,afterDamage:2,afterCasterDeath:1});
  assert.deepEqual(await p.evaluate(()=>__encounterTest.dual()),{types:['fury','mend'],next:true,attack:'sunder',count:2});
  passed.push('Permanent untargetable totems remain after a minute, leave with their caster, support both stream types, and advance duplicate/full slots to another attack without freezing the boss');
  for(const which of ['owner','reset','phase','death','next']){const r=await p.evaluate(which=>__encounterTest.cleanup(which),which);assert.equal(r.nodes,0);assert.equal(r.request,false);assert.equal(r.casts,0);if(which!=='owner')assert.equal(r.rally,0);}
  for(const context of ['pause','skill']){const r=await p.evaluate(context=>__encounterTest.timing(2,context),context);assert.equal(r.age,0);assert.equal(r.exists,true);assert.equal(r.combat,0);}
  const normal=await p.evaluate(()=>__encounterTest.timing(1)),fast=await p.evaluate(()=>__encounterTest.timing(2));assert.ok(Math.abs(normal.age-.2)<1e-8);assert.ok(Math.abs(fast.age-.4)<1e-8);assert.equal(normal.exists,true);assert.equal(fast.exists,true);assert.equal(normal.skill,fast.skill);
  passed.push('Owner death, phase change, retry and defeat clean encounter objects; menus and skilling pause them while Delve speed scales only their combat clock');
  for(const width of [320,390,844,1440]){
   await p.setViewportSize({width,height:width===844?390:844});
   for(const side of ['left','right'])for(let kind=0;kind<4;kind++)for(const offset of [0,400,900])for(const type of ['reflect','mend','fury']){const r=await p.evaluate(({kind,offset,side,type})=>__encounterTest.placement(kind,3,offset,side,type),{kind,offset,side,type});assert.ok(r.clear);assert.ok(r.distance>=(width<600?(type==='reflect'?200:190):(type==='reflect'?230:220)));if(type==='reflect')assert.ok(r.travel<=300);assert.ok(r.point.x-r.point.r>=r.camX-r.w/2+(side==='left'?52:0));assert.ok(r.point.x+r.point.r<=r.camX+r.w/2-(side==='right'?52:0));assert.ok(r.point.y-r.point.r>=r.camY-r.h/2);assert.ok(r.point.y+r.point.r<=r.camY+r.h/2);}
  }
  passed.push('Reflect centers and totems keep their larger caster gaps, remain on screen and clear of scenery in every area at 320, 390, 844 and 1440 pixels, including landscape and distant world coordinates');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
