// Capture the shipped backgrounds and cloth grips using isolated review state.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRuntime}=require('../tests/runtime.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs');
const root=path.resolve(__dirname,'..');
function skillingArtReviewFixture(){window.__skillingArtReview={ready:()=>Promise.all([...campArt,zone2CampImage,...DeepwellAvatar.images(),...workshopArtImages.values()].map(i=>i.decode())),scenes:()=>{
   const choices=[['wood','Oak woodland'],['mine','Iron mine'],['forge','Forge'],['scavenge','Overgrown ruins'],['fletch','Fletching'],['ward','Weaving'],['rune','Rune engraving'],['polish','Jeweling'],['coal','Coal mine'],['willow','Willow grove'],['ancientScavenge','Ancient dig'],['garnetSearch','Garnet cave']];
   return choices.map(([key,label])=>{__workshopTest.review(key,'',0,.35);render();return {label,src:canvas.toDataURL('image/png')};});
  },layout:()=>{
    for(const key of SKILL_KEYS){__workshopTest.review(key,'',0,.35);render();}
    return {width:innerWidth,activities:SKILL_KEYS.length,overflow:document.documentElement.scrollWidth>innerWidth};
   },hands:()=>{
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=820;sheet.style='position:fixed;inset:0;z-index:999999;background:#252820';document.body.append(sheet);const c=sheet.getContext('2d');c.fillStyle='#252820';c.fillRect(0,0,1440,820);
   const states=[...[.1,.35,.6,.85].map(workPhase=>({workPhase})),...[0,1].flatMap(variant=>[1,-1].map(facing=>({facing,bonusReaction:{variant,progress:.5}})))];
   states.forEach((state,i)=>{
    const x=i%4*360,y=Math.floor(i/4)*410,frame={pose:'ward',key:'ward',working:true,workBlend:1,workPhase:.35,theme:WORKSHOP_THEMES[0],time:1.2,data:{...data,equippedArmor:'',enchant:0},...state};
    c.fillStyle='#ece0c3';c.textAlign='center';c.font='18px Georgia';c.fillText(state.bonusReaction?'Cloth '+(state.bonusReaction.variant?'stretch':'lift')+' · '+(state.facing>0?'right':'left'):'Weave · '+Math.round(state.workPhase*100)+'%',x+180,y+28);
    DeepwellAvatar.render(c,{...frame,x:x+(state.facing<0?242:104),y:y+388,scale:3.05,paintWorkpiece:(context,rig)=>paintWorkshopWorkpiece(frame,rig,context)});
   });
  }};}
(async()=>{
 const before=fs.readFileSync(path.join(root,'index.html')),runtime=await createRuntime(),errors=[];
 try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);',html=before.toString().replace(seam,'('+workshopFixture.toString()+')();('+skillingArtReviewFixture.toString()+')();'+seam);
  const page=await runtime.browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>errors.push(e.message));
  await page.route(runtime.baseURL+'/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__workshopTest&&!document.documentElement.classList.contains('game-loading'));
  await page.evaluate(()=>__skillingArtReview.ready());
  const scenes=await page.evaluate(()=>__skillingArtReview.scenes());
  await page.setViewportSize({width:1440,height:804});
  await page.evaluate(async scenes=>{
   const sheet=document.createElement('canvas');sheet.id='skillingArtReview';sheet.width=1440;sheet.height=804;sheet.style='position:fixed;inset:0;z-index:999999;background:#22251f';document.body.append(sheet);const c=sheet.getContext('2d');
   c.fillStyle='#22251f';c.fillRect(0,0,1440,804);
   for(const [i,scene]of scenes.entries()){const image=new Image();image.src=scene.src;await image.decode();const x=i%4*360,y=Math.floor(i/4)*268;c.drawImage(image,x,y,360,240);c.fillStyle='#ece0c3';c.font='16px Georgia';c.textAlign='center';c.fillText(scene.label,x+180,y+260);}
  },scenes);
  await page.screenshot({path:path.join(root,'preview-skilling-backgrounds.png')});await page.locator('#skillingArtReview').evaluate(el=>el.remove());
  for(const [key,file]of [['fletch','preview-fletching-clean-mobile.png'],['ward','preview-warding-grip-mobile.png']]){
   await page.setViewportSize({width:390,height:844});await page.evaluate(key=>__workshopTest.review(key,'',0,.35),key);await page.evaluate(()=>__workshopTest.ready());await page.screenshot({path:path.join(root,file)});
  }
  // Check every activity's real cropped scene at small phone, landscape and desktop sizes.
  const layouts=[];
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:960}]){
   await page.setViewportSize(viewport);
   layouts.push(await page.evaluate(()=>__skillingArtReview.layout()));
  }
  assert.ok(layouts.every(v=>!v.overflow&&v.activities===31),JSON.stringify(layouts));
  await page.setViewportSize({width:1440,height:820});
  await page.evaluate(()=>__skillingArtReview.hands());
  await page.screenshot({path:path.join(root,'preview-warding-grips.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);
  console.log(JSON.stringify({backgrounds:12,layouts,files:['preview-skilling-backgrounds.png','preview-fletching-clean-mobile.png','preview-warding-grip-mobile.png','preview-warding-grips.png'],errors},null,2));
 }finally{await runtime.close();}
})().catch(e=>{console.error(e);process.exit(1);});
