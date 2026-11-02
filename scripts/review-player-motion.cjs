// Record the shipped renderer and real work scenes in an isolated browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {createRuntime}=require('../tests/runtime.cjs'),{workshopFixture}=require('../tests/workshop-fixture.cjs'),{playerFixture}=require('../tests/player-fixture.cjs');
const root=path.resolve(__dirname,'..');
function motionReviewFixture(){
 let raf=0,recorder=null,chunks=[],captureCanvas=null;
 const rates={mine:1.05,smith:1.2,wood:.92,fletch:.85,ward:.62,rune:.7,polish:1.15,scavenge:.72};
 const work=[['mine','Mining','melee_1'],['smith','Smithing','melee_2'],['wood','Woodcutting','ranged_1'],['fletch','Fletching','ranged_2'],['ward','Warding','magic_1'],['rune','Runecrafting','magic_2'],['polish','Artisan','ranged_1'],['scavenge','Scavenging','ranged_2']];
 const weapons=[['sword','Arming sword','melee_1'],['shield','Sword and shield','melee_2'],['polearm','Halberd','melee_1'],['greatsword','Greatsword','melee_2'],['bow','Bow','ranged_2'],['staff','Staff','magic_2']];
 function title(c,heading,detail){c.fillStyle='#191f21';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.fillStyle='#f1dfb7';c.font='24px Georgia';c.textAlign='left';c.fillText(heading,26,37);c.font='14px system-ui';c.fillStyle='#adbbb5';c.fillText(detail,26,63);}
 function panel(c,index,columns,name,detail){
  const width=1200/columns,height=348,x=(index%columns)*width,y=84+Math.floor(index/columns)*height;
  c.fillStyle=index%2?'#2b3334':'#26302f';c.fillRect(x+7,y+7,width-14,height-14);c.fillStyle='#e6d4b1';c.font='18px Georgia';c.textAlign='center';c.fillText(name,x+width/2,y+35);c.fillStyle='#9faeaa';c.font='12px system-ui';c.fillText(detail,x+width/2,y+56);c.strokeStyle='#596157';c.lineWidth=1;c.beginPath();c.moveTo(x+20,y+height-25);c.lineTo(x+width-20,y+height-25);c.stroke();return {x,y,width,feet:y+height-29};
 }
 function person(c,panel,options,armor,weapon='sword',facing=1){
  const style=styleForWeapon(weapon),reviewData={...data,custom:{...DeepwellAvatar.BASE},equippedArmor:armor,weaponType:weapon,enchant:0,arrows:100,runes:100,ammoCharges:{arrows:10,runes:10},styles:{...data.styles,[style]:{...data.styles[style],tier:2}}};
  DeepwellAvatar.render(c,{x:panel.x+panel.width*(facing>0?.40:.60),y:panel.feet,scale:1.9,facing,data:reviewData,...options});
 }
 function overview(c,elapsed){
  const chapter=Math.min(2,Math.floor(elapsed/8)),t=elapsed%8,facing=t<4?1:-1;
  if(chapter===0){
   title(c,'Player motion · current game renderer','1× speed · movement shown in place · facing changes after four seconds');
   const modes=[['Idle','Relaxed hands','',{}],['Walk','Forward stride','melee_1',{pose:'combat',vx:80*facing}],['Backpedal','Backward stride','ranged_1',{pose:'combat',vx:-80*facing}],['Dodge','Dash lean','melee_2',{pose:'combat',vx:80*facing,dash:t%1<.22}],['Hit reaction','Recoil and recovery','magic_1',{pose:'combat',hit:Math.max(0,1-(t%1)/.26)}],['Two-handed walk','Grip during movement','melee_1',{pose:'combat',vx:80*facing}]];
   modes.forEach(([name,detail,armor,options],i)=>person(c,panel(c,i,3,name,detail),{pose:'idle',time:t,...options},armor,i===5?'polearm':'sword',facing));
  }else if(chapter===1){
   title(c,'Combat · six weapon families','1× animation speed · attacks repeated once per second · 0.38s pose decay · facing changes at four seconds');
   // The live game resets attackPose to .38 on each attack, then decays it.
   const cycle=t%1,attack=cycle<.38?1-cycle/.38:0;
   weapons.forEach(([weapon,name,armor],i)=>person(c,panel(c,i,3,name,'Attack → recovery → ready'),{pose:'combat',time:t,attack,charge:cycle,aimAngle:Math.sin(t*1.2)*.35},armor,weapon,facing));
  }else{
   title(c,'Skilling · eight work families','1× work clocks · steady loops · facing changes after four seconds · start/stop transitions in the scene reel');
   work.forEach(([pose,name,armor],i)=>person(c,panel(c,i,4,name,'Live rig · '+(facing>0?'facing right':'facing left')),{pose,time:t,working:true,workBlend:1,workPhase:(t*rates[pose])%1},armor,'sword',facing));
  }
 }
 function begin(kind){
  if(recorder)throw Error('Recording already active');
  captureCanvas=document.createElement('canvas');captureCanvas.width=kind==='overview'?1200:600;captureCanvas.height=kind==='overview'?800:1000;
  const c=captureCanvas.getContext('2d'),started=performance.now(),source=document.querySelector('canvas');chunks=[];
  function draw(now){
   if(kind==='overview')overview(c,(now-started)/1000);
   else{c.fillStyle='#161e20';c.fillRect(0,0,600,1000);c.drawImage(source,0,0,600,1000);c.fillStyle='#121b20eb';c.fillRect(0,0,600,90);c.fillStyle='#f1dfb7';c.textAlign='center';c.font='24px Georgia';c.fillText(window.__motionReview.sceneLabel,300,37);c.fillStyle='#bfcbc3';c.font='15px system-ui';c.fillText('Actual work scene · 1× speed · '+window.__motionReview.stage,300,65);}
   raf=requestAnimationFrame(draw);
  }
  draw(started);const type='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(type))throw Error('VP9 recording is unavailable');
  recorder=new MediaRecorder(captureCanvas.captureStream(30),{mimeType:type,videoBitsPerSecond:3000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();
 }
 function stop(){return new Promise(resolve=>{const active=recorder;active.onstop=async()=>{cancelAnimationFrame(raf);active.stream.getTracks().forEach(track=>track.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));recorder=null;resolve(btoa(binary));};active.stop();});}
 window.__motionReview={begin,stop,sceneLabel:'',stage:'working',release(){game.holdSkill=null;refreshUI();},overviewFrame(seconds){const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=800;overview(canvas.getContext('2d'),seconds);return canvas.toDataURL('image/png');}};
}
function ffmpeg(args){const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{cwd:root,encoding:'utf8',timeout:120000});if(result.error)throw result.error;if(result.status!==0)throw Error(result.stderr||'Video conversion failed');}
(async()=>{
 const runtime=await createRuntime(),errors=[],before=fs.readFileSync(path.join(root,'index.html'));try{
  const seam='resize();resetRun();refreshUI();intro();requestAnimationFrame(frame);';assert.ok(before.toString().includes(seam));
  const html=before.toString().replace(seam,'('+workshopFixture.toString()+')();('+playerFixture.toString()+')();('+motionReviewFixture.toString()+')();'+seam);
  const p=await runtime.browser.newPage({viewport:{width:600,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.route(runtime.baseURL+'/**',route=>route.fulfill({contentType:'text/html',body:html}));await p.goto(runtime.baseURL);await p.waitForFunction(()=>!document.documentElement.classList.contains('game-loading'));await p.evaluate(()=>Promise.all([__playerTest.ready(),__workshopTest.ready()]));
  await p.evaluate(()=>__motionReview.begin('overview'));await p.waitForTimeout(24000);let recording=await p.evaluate(()=>__motionReview.stop());const overviewWebm=path.join(runtime.resultsDir,'player-motion-overview.webm');fs.writeFileSync(overviewWebm,Buffer.from(recording,'base64'));
  console.log('Captured movement, six weapons and eight work loops.');
  await p.evaluate(()=>{__workshopTest.fresh('mine','melee_1',0);__motionReview.sceneLabel='Mining';__motionReview.stage='starting / working';});await p.waitForTimeout(60);
  await p.evaluate(()=>__motionReview.begin('scenes'));
  for(const [key,label,armor,zone]of [['mine','Mining','melee_1',0],['forge','Smithing','melee_2',1],['wood','Woodcutting','ranged_1',0],['fletch','Fletching','ranged_2',1],['ward','Warding','magic_1',0],['rune','Runecrafting','magic_2',2],['polish','Artisan','ranged_1',1],['scavenge','Scavenging','ranged_2',0]]){
   await p.evaluate(({key,label,armor,zone})=>{__motionReview.sceneLabel=label;__motionReview.stage='starting / working';__workshopTest.motion(key,armor,zone);},{key,label,armor,zone});await p.waitForTimeout(3000);
   await p.evaluate(()=>{__motionReview.stage='release / rest';__motionReview.release();});await p.waitForTimeout(600);
  }
  recording=await p.evaluate(()=>__motionReview.stop());const scenesWebm=path.join(runtime.resultsDir,'player-live-skills.webm');fs.writeFileSync(scenesWebm,Buffer.from(recording,'base64'));assert.deepEqual(errors,[]);
  const encode=['-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-r','30','-movflags','+faststart','-map_metadata','-1'];
  ffmpeg(['-i',overviewWebm,...encode,'preview-player-motion-overview.mp4']);ffmpeg(['-i',scenesWebm,...encode,'preview-player-live-skills.mp4']);
  ffmpeg(['-ss','16','-t','8','-i',overviewWebm,'-filter_complex','fps=12,scale=900:600:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0','-map_metadata','-1','preview-player-work-loops.gif']);
  assert.deepEqual(fs.readFileSync(path.join(root,'index.html')),before,'Recording must leave the shipped game untouched');
  console.log(JSON.stringify({files:['preview-player-motion-overview.mp4','preview-player-live-skills.mp4','preview-player-work-loops.gif'].map(file=>({file,bytes:fs.statSync(path.join(root,file)).size})),errors},null,2));
 }finally{await runtime.close();}
})().catch(error=>{console.error(error);process.exit(1);});
