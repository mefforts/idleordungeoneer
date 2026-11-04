const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{createRuntime}=require('../tests/runtime.cjs'),{encounterFixture}=require('../tests/encounter-fixture.cjs'),{themedEncounterFixture}=require('../tests/themed-encounter-fixture.cjs'),{encounterPressureFixture}=require('../tests/encounter-pressure-fixture.cjs');
(async()=>{const runtime=await createRuntime(),errors=[],shots=[];try{
 const source=fs.readFileSync('index.html','utf8'),seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=source.replace(seam,'('+encounterFixture.toString()+')();('+themedEncounterFixture.toString()+')();('+encounterPressureFixture.toString()+')();'+seam),p=await runtime.browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>window.__themedTest&&!document.documentElement.classList.contains('game-loading'));await p.evaluate(()=>__themedTest.ready());const catalog=await p.evaluate(()=>__themedTest.catalog()),dir=path.join(runtime.resultsDir,'themed-review');fs.mkdirSync(dir,{recursive:true});
 const ages={burrowingBriar:.2,rootGates:.7,walkingHedge:2,seedChain:1.4,fallingCanopy:1.2,forgeHammers:.3,furnaceVents:1.7,coolingIslands:1.7,moltenDroplets:1.65,backdraft:.8,boneLoom:2,coffinPress:1.8,graveClock:1.2,ribcageRise:.5,gravityWell:2.8,constellationCage:.4,riftScissors:2.5,prismRelay:1.4,cometLadder:1.5};
 for(const d of catalog){await p.evaluate(({id,age})=>__themedTest.visualState(id,age),{id:d.id,age:ages[d.id]??.8});const file=path.join(dir,d.id+'.png');await p.screenshot({path:file});shots.push({...d,file});}
 for(const id of ['rootGates','forgeHammers','soulLantern','stargateVolley'])fs.copyFileSync(path.join(dir,id+'.png'),'preview-'+id.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'-mobile.png');
 await p.evaluate(()=>__encounterPressure.previewUncommon());await p.screenshot({path:'preview-uncommon-mobile.png'});await p.evaluate(()=>__encounterPressure.previewPack());await p.screenshot({path:'preview-guardian-pack-mobile.png'});await p.evaluate(()=>__encounterPressure.cleanup());
 fs.writeFileSync(path.join(dir,'cards.json'),JSON.stringify(shots));
 execFileSync('python3',['-c',`import json,math
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
cards=json.loads(Path(${JSON.stringify(path.join(dir,'cards.json'))}).read_text())
w,h,cols=300,397,5
out=Image.new('RGB',(cols*w,math.ceil(len(cards)/cols)*h+64),'#171d22')
d=ImageDraw.Draw(out)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
large=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',23)
d.text((18,12),'39 themed mechanics · warning objects, trajectories and counterplay',font=large,fill='#e7dfc7')
for i,c in enumerate(cards):
 x,y=i%cols*w,i//cols*h+64
 im=Image.open(c['file']).convert('RGB').crop((0,170,390,650));im.thumbnail((288,354))
 out.paste(im,(x+(w-im.width)//2,y+30))
 d.text((x+10,y+6),str(c['proposal'])+' · '+c['name'],font=font,fill='#e7dfc7')
out.save('preview-themed-mechanics.png',optimize=True)
`]);
 await p.evaluate(()=>__themedTest.cleanup());assert.deepEqual(errors,[]);assert.equal(fs.readFileSync('index.html','utf8'),source);console.log(JSON.stringify({gallery:'preview-themed-mechanics.png',mechanics:shots.length,errors},null,2));
 if(process.argv.includes('--motion')){
  const context=await runtime.browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,recordVideo:{dir:runtime.resultsDir+'/themed-video',size:{width:390,height:844}}}),movie=await context.newPage();
  movie.on('pageerror',e=>errors.push(e.message));await movie.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html',body:html}));await movie.goto(runtime.baseURL);await movie.waitForFunction(()=>window.__themedTest&&!document.documentElement.classList.contains('game-loading'));await movie.evaluate(()=>__themedTest.ready());
  for(const id of ['rootGates','sporeFan','forgeHammers','coolingIslands','graveClock','orbitTransfer','stargateVolley','riftScissors']){await movie.evaluate(id=>{__themedTest.visualState(id,0);window.__previewClock=setInterval(()=>__themedTest.animate(.04),40);},id);await movie.waitForTimeout(5200);await movie.evaluate(()=>clearInterval(window.__previewClock));}
  await context.close();const video=await movie.video().path();execFileSync('ffmpeg',['-y','-i',video,'-map_metadata','-1','-an','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart','preview-themed-mechanics.mp4'],{stdio:'pipe'});assert.deepEqual(errors,[]);console.log('Recorded preview-themed-mechanics.mp4');
 }
 }finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
