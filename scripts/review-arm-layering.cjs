// Crossing close-ups use the actual game rig, with no persistent review state.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRuntime}=require('../tests/runtime.cjs');
(async()=>{const runtime=await createRuntime(),root=path.resolve(__dirname,'..'),before=fs.readFileSync(path.join(root,'index.html')),errors=[];try{
 const page=await runtime.browser.newPage({viewport:{width:1760,height:1440}});page.on('pageerror',e=>errors.push(e.message));await page.goto(runtime.baseURL);await page.waitForFunction(()=>window.__deepwell&&!document.documentElement.classList.contains('game-loading'));await page.evaluate(()=>Promise.all(DeepwellAvatar.images().map(i=>i.decode())));
 await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=1760;canvas.height=1440;canvas.style='position:fixed;inset:0;z-index:999999;background:#28271f';document.body.append(canvas);const c=canvas.getContext('2d'),data={...__deepwell.getState().data,enchant:0,weaponType:'sword'},poses=[['mine','Mining'],['smith','Smithing'],['fletch','Fletching'],['ward','Weaving']],rows=[['Working · right','',1,null],['Working · left','melee_2',-1,null],['Bonus A · right','ranged_2',1,0],['Bonus B · left','magic_2',-1,1]];
  c.fillStyle='#28271f';c.fillRect(0,0,1760,1440);c.textAlign='center';c.fillStyle='#e5d6b7';c.font='24px Georgia';c.fillText('Arm crossings · supporting palm behind the nearer forearm',880,31);
  const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
  for(const [row,[detail,armor,facing,variant]]of rows.entries())for(const [col,[pose,label]]of poses.entries()){
   let best=null;for(let i=0;i<120;i++){const options={pose,time:1.5,working:true,workBlend:1,facing,workPhase:variant===null?i/120:.65,bonusReaction:variant===null?null:{variant,progress:i/120},data:{...data,equippedArmor:armor}},rig=DeepwellAvatar.poseRig(options),gap=distance(rig.back,rig.frontArm.elbow,rig.frontArm.hand);if(!best||gap<best.gap)best={gap,options};}
   const x=col*440,y=44+row*349;c.fillStyle='#e5d6b7';c.font='19px Georgia';c.fillText(label,x+220,y+25);c.fillStyle='#c6b58c';c.font='13px system-ui';c.fillText(detail,x+220,y+46);
   c.save();c.beginPath();c.rect(x+8,y+59,424,275);c.clip();DeepwellAvatar.render(c,{...best.options,x:x+(facing>0?125:315),y:y+423,scale:3.7,showWeapon:false});c.restore();c.strokeStyle='#685c43';c.beginPath();c.moveTo(x+24,y+338);c.lineTo(x+416,y+338);c.stroke();
  }
 });await page.screenshot({path:path.join(root,'preview-arm-crossings.png')});assert.deepEqual(errors,[]);assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before);console.log(JSON.stringify({file:'preview-arm-crossings.png',errors},null,2));
}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
