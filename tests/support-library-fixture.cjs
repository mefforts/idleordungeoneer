// Synthetic art states, injected only into isolated browser responses.
function supportLibraryFixture(){
 let current=null;
 function snapshot(){return JSON.stringify({frame:game.frame,player:{x:game.player.x,y:game.player.y,hp:game.player.hp},totems:game.totems.map(t=>({x:t.x,y:t.y,age:t.age,blocked:t.blocked,disabled:t.disabled,healReserve:t.healReserve})),enemies:game.enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,stagger:e.stagger,task:e.eliteTask&&{kind:e.eliteTask.kind,phase:e.eliteTask.phase,age:e.eliteTask.age,total:e.eliteTask.total,hits:e.eliteTask.hits,pending:e.eliteTask.pending,warn:e.eliteTask.warn,spawnClock:e.eliteTask.spawnClock}}))});}
 function pixels(){const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261,count=0,brightness=0,green=0,red=0;for(let i=0;i<d.length;i+=4){for(let j=0;j<3;j++){hash=Math.imul(hash^d[i+j],16777619);brightness+=d[i+j];}if(d[i]+d[i+1]+d[i+2]>35)count++;if(d[i+1]>d[i]*1.2&&d[i+1]>d[i+2]*1.08&&d[i+1]>75)green++;if(d[i]>d[i+1]*1.2&&d[i]>d[i+2]*1.08&&d[i]>75)red++;}return {hash:hash>>>0,count,brightness,green,red};}
 function raster(draw){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);draw();ctx.restore();return pixels();}
 function pure(draw){const before=snapshot(),random=Math.random;let randomCalls=0;Math.random=()=>{randomCalls++;return .5;};let ink;try{ink=raster(draw);}finally{Math.random=random;}return {...ink,unchanged:before===snapshot(),randomCalls};}
 function support(role='mend',kind=0,variant=0,state='active'){
  __abilityEffectsTest.show(role,kind,'impact');const t=game.totems.find(t=>!t.destructible);t.x=-58;t.y=90;while(supportTotemVariant(t)!==variant)t.x+=1;
  t.disabled=state==='disabled';t.blocked=state==='blocked'||state==='depleted';t.healReserve=state==='depleted'?0:150;t.owner.x=30;t.owner.y=-95;game.player.x=t.blocked?-20:85;game.player.y=t.blocked?-2:175;game.frame=4;data.reducedMotion=false;game.menuPaused=true;current={type:'support',t};refreshUI();render();return {variant:supportTotemVariant(t),x:t.x,y:t.y};
 }
 function task(family='ascend',kind=0,phase='channel'){
  __encounterTest.fresh(kind,1);data.idleNoticeSlots=2;data.idleFirstAssigned=true;data.combatLanguageTipSeen=true;data.firstWeaponCrafted=true;game.enemies=[];game.boss=null;game.phase=0;game.phaseTarget=999;game.frame=4;game.player.x=-80;game.player.y=110;data.reducedMotion=false;
  const e=spawnEnemy();Object.assign(e,{elite:true,boss:false,bossElite:true,champion:false,biome:kind,bossIndex:0,visualType:0,x:-20,y:-20,rad:23,hp:4000,maxHp:5000,speed:0,contact:1e6,castCooldown:1e6,eliteTask:null,ascendance:0});
  const target=family==='empower'?spawnEnemy():null;if(target)Object.assign(target,{x:90,y:5,hp:400,maxHp:500,elite:false,boss:false,speed:0,contact:1e6,castCooldown:1e6});
  e.eliteTask={kind:family,phase:phase==='travel'?'travel':'channel',point:{x:phase==='travel'?70:e.x,y:phase==='travel'?-60:e.y},target,recruit:target&&{x:target.x,y:target.y},age:3,total:ELITE_TASKS[family].seconds||0,hits:1,spawnClock:3,warn:.8,variant:phase==='marks'?'marks':'volley',pending:phase==='pending'||phase==='marks'?{x:85,y:90,angle:.8}:null};
  current={type:'task',e};game.menuPaused=true;refreshUI();$('toastStack').replaceChildren();render();return {kind:family,phase:e.eliteTask.phase};
 }
 window.__supportLibrary={
  async ready(){await __encounterTest.ready();await Promise.all([...supportArtImages.values()].map(i=>i.decode()));},
  assets(){return {loaded:[...supportArtImages.values()].filter(i=>i.complete&&i.naturalWidth).length,keys:[...supportArtImages.keys()]};},
  stamp(key){const [family,kind,variant]=key.split('-'),image=ctx.drawImage;let calls=0,anchor;const ink=raster(()=>{ctx.drawImage=function(im,x,y,w,h){calls++;const p=ctx.getTransform().transformPoint({x:x+w/2,y:y+h*SUPPORT_ART_FRAME.anchorY});anchor={x:p.x,y:p.y};return image.call(this,im,x,y,w,h);};try{paintSupportSprite(family,+kind,+variant,160,180,100);}finally{ctx.drawImage=image;}});return {...ink,calls,anchor};},
  support,task,
  ink(time=4,reduced=false,missing=false){game.frame=time;data.reducedMotion=reduced;const key=current.type==='support'?current.t.type+'-'+current.t.biome+'-'+supportTotemVariant(current.t):current.e.eliteTask.kind+'-'+current.e.biome+'-0',image=supportArtImages.get(key);if(missing)supportArtImages.delete(key);try{return pure(()=>{ctx.translate(150,160);if(current.type==='support')paintTotem(current.t);else{paintEliteTaskGround();paintEliteTaskAir(current.e);}});}finally{if(missing)supportArtImages.set(key,image);}},
  clearTask(){current.e.eliteTask=null;return pure(()=>{paintEliteTaskGround();paintEliteTaskAir(current.e);});},
  variantView(){const t=current.t,before=supportTotemVariant(t),cam=game.camX;game.camX+=700;const after=supportTotemVariant(t);game.camX=cam;return {before,after};},
  advance(dt){game.frame+=dt;refreshUI();render();},
  crop(){const c=document.createElement('canvas');c.width=340;c.height=300;c.getContext('2d').drawImage(canvas,canvas.width/2-150,canvas.height/2-155,340,300,0,0,340,300);return c.toDataURL();},
  atlas(){const c=document.createElement('canvas');c.width=1280;c.height=1520;const g=c.getContext('2d');g.fillStyle='#172029';g.fillRect(0,0,c.width,c.height);g.textAlign='center';g.fillStyle='#f1e1bc';g.font='27px Georgia';g.fillText('Support library · shrines, lanterns and elite instruments',640,36);g.font='15px system-ui';g.fillStyle='#becbd0';g.fillText('Three silhouettes per support role · four material traditions · fixed ground anchors',640,63);const themes=['Overgrowth','Embervault','Hollow Crypt','Astral Rift'];for(let k=0;k<4;k++){g.fillStyle='#e0d4b5';g.font='18px Georgia';g.fillText(themes[k],k*320+160,96);}const rows=[['mend',0],['mend',1],['mend',2],['fury',0],['fury',1],['fury',2],['ascend',0],['empower',0],['conduit',0],['siege',0]];for(const [row,[family,variant]]of rows.entries())for(let k=0;k<4;k++){const x=k*320,y=row*140+110,w=family==='mend'||family==='fury'?94:98,h=w*124/112;g.fillStyle='#22303a';g.fillRect(x+7,y,306,134);g.drawImage(supportArtImages.get(family+'-'+k+'-'+variant),x+160-w/2,y+7,w,h);g.fillStyle='#e2d7bd';g.font='14px system-ui';g.fillText(family+(row<6?' · '+['shrine','lantern','altar'][variant]:''),x+160,y+126);}return c.toDataURL();}
 };
}
module.exports={supportLibraryFixture};
