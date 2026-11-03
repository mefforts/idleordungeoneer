// Capture the shipped work renderer and collect real bonus buttons in isolation.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {createRuntime}=require('../tests/runtime.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs'),{skillingBonusesFixture}=require('../tests/skilling-bonuses-fixture.cjs');
const root=path.resolve(__dirname,'..');
function skillingReviewFixture(){
 const work=[['mine','Mining','',0],['forge','Smithing','melee_2',1],['wood','Woodcutting','ranged_1',0],['fletch','Fletching','ranged_2',1],['ward','Weaving','magic_1',0],['rune','Rune engraving','magic_2',2],['polish','Gem work','ranged_1',1],['scavenge','Scavenging','ranged_2',0]];
 window.__skillingReview={
  work,
  async ready(){await Promise.allSettled([...document.images,...DeepwellAvatar.images(),...workshopArtImages.values(),...campArt,zone2CampImage].filter(Boolean).map(i=>i.decode()));render();},
  scene(index){const [key,,armor,zone]=work[index];__skillBonusTest.fresh(key,armor,zone);game.workBonusSerial=index%2;},
  place(){const nodes=bonusState().nodes,rect=canvas.getBoundingClientRect();nodes.forEach((node,i)=>{node.x=rect.width*(i?.72:.24);node.y=rect.height*(i?.40:.29);node.el.style.left=node.x+'px';node.el.style.top=node.y+'px';});},
  sheet(){
   const canvas=document.createElement('canvas');canvas.id='skillingReviewSheet';canvas.width=1760;canvas.height=990;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d');c.fillStyle='#28271f';c.fillRect(0,0,1760,990);c.textAlign='center';
   for(let row=0;row<3;row++)work.forEach(([key,label,armor],col)=>{const pose={forge:'smith'}[key]||key,x=col*220,y=row*330;c.fillStyle='#e5d6b7';c.font='17px Georgia';c.fillText(label,x+110,y+27);c.font='12px system-ui';c.fillStyle='#c6b58c';c.fillText(row?'Collection '+(row===1?'A':'B'):'Working',x+110,y+48);DeepwellAvatar.render(c,{x:x+68,y:y+310,scale:1.55,pose,time:1.4,workCycle:2,workPhase:.65,working:true,workBlend:1,bonusReaction:row?{progress:.5,variant:row-1}:null,data:{...data,equippedArmor:armor,enchant:0}});});
  }
 };
}
(async()=>{
 const runtime=await createRuntime(),before=fs.readFileSync(path.join(root,'index.html')),errors=[],files=[];
 try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+workshopFixture.toString()+')();('+skillingBonusesFixture.toString()+')();('+skillingReviewFixture.toString()+')();'+seam);assert.notEqual(html,before.toString());
  if(!process.argv.includes('--stills')){
  const context=await runtime.browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,recordVideo:{dir:path.join(runtime.resultsDir,'skilling-video'),size:{width:390,height:844}}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__skillingReview&&!document.documentElement.classList.contains('game-loading'));
  for(let index=0;index<8;index++){
   await page.evaluate(index=>__skillingReview.scene(index),index);await page.evaluate(()=>__skillingReview.ready());await page.evaluate(()=>__skillBonusTest.play());await page.waitForTimeout(1400);
   const id=await page.evaluate(rarity=>__skillBonusTest.spawn(rarity),['common','very-rare','uncommon','rare','very-rare','rare','uncommon','common'][index]);assert.ok(id);await page.waitForTimeout(260);
   const target=page.locator('[data-skill-bonus="'+id+'"]'),box=await target.boundingBox();assert.ok(box);await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);assert.equal(await target.count(),0);await page.waitForTimeout(1550);
   if(index===1)for(const [rarity,amount]of [['common',3],['rare',5]]){const gift=await page.evaluate(({rarity,amount})=>__skillBonusTest.spawn(rarity,amount),{rarity,amount});assert.ok(gift);await page.waitForTimeout(260);const node=page.locator('[data-skill-bonus="'+gift+'"]'),r=await node.boundingBox();assert.equal(await node.getAttribute('data-reward'),'resource');await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);assert.equal(await node.count(),0);await page.waitForTimeout(1200);}
   await page.locator('#skillHold').dispatchEvent('pointercancel');await page.evaluate(()=>__skillBonusTest.tick(0,false));await page.waitForTimeout(500);console.log('Recorded activity '+(index+1)+'/8, bonus capture and release.');
  }
  const video=page.video();await page.close();await context.close();const input=await video.path(),file='preview-skilling-upgrade.mp4';
  const encoded=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-an','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',path.join(root,file)],{encoding:'utf8',timeout:60000});if(encoded.error)throw encoded.error;assert.equal(encoded.status,0,encoded.stderr);files.push(file);
  }
  const p=await runtime.browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__skillingReview&&!document.documentElement.classList.contains('game-loading'));
  for(const [index,file]of [[1,'preview-skilling-bonuses-mobile.png'],[0,'preview-skilling-gathering-mobile.png']]){await p.evaluate(index=>{__skillingReview.scene(index);__skillBonusTest.collect('very-rare');__skillBonusTest.tick(.38);__skillBonusTest.spawn('common',3);__skillBonusTest.spawn('rare',5);__skillingReview.place();},index);await p.evaluate(()=>__skillingReview.ready());await p.waitForTimeout(220);await p.screenshot({path:path.join(root,file)});files.push(file);}
  await p.evaluate(()=>{__skillingReview.scene(1);__skillBonusTest.collect('very-rare');__skillBonusTest.tick(.4);});await p.evaluate(()=>__skillingReview.ready());await p.waitForTimeout(1400);await p.evaluate(()=>{const id=__skillBonusTest.spawn('common',3);__skillingReview.place();__deepwell.claimSkillBonus(id);__skillBonusTest.reaction(.35);__skillBonusTest.spawn('uncommon',5);__skillingReview.place();});await p.waitForTimeout(180);await p.screenshot({path:path.join(root,'preview-skilling-windfall-mobile.png')});files.push('preview-skilling-windfall-mobile.png');
  for(const viewport of [{width:320,height:568},{width:844,height:390},{width:1280,height:800}]){
   await p.setViewportSize(viewport);await p.evaluate(()=>{__skillingReview.scene(1);__skillBonusTest.collect('very-rare');__skillBonusTest.tick(.5);});await p.evaluate(()=>__skillingReview.ready());await p.waitForTimeout(200);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const fitting=await p.locator('#skillWorkBuff').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});assert.ok(fitting,'Buff must fit '+viewport.width+'px');
   await p.screenshot({path:path.join(runtime.resultsDir,'skilling-buff-'+viewport.width+'.png')});
  }
  await p.setViewportSize({width:1760,height:990});await p.evaluate(()=>__skillingReview.sheet());await p.screenshot({path:path.join(root,'preview-skilling-flourishes.png')});files.push('preview-skilling-flourishes.png');
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);console.log(JSON.stringify({files:files.map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1)});
