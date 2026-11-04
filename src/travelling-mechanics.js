/* Moving attacks retire after passing the encounter, never on a lifetime timer. */
const WALKING_HEDGE={speed:245,runningFactor:1.3,width:26,gap:100,lead:220,interval:1.5,maximum:3};
const ROLLING_FURNACE={speed:230,radius:24,interval:.95,maximum:3,splitAngle:.48};
function travellingWaveCount(owner){return Math.min(3,Math.max(zoneVisualBand(),1+(owner.combatPhase||0)));}
function setupWalkingHedge(e){
 const p=game.player,horizontal=e.serial%2===0,normal=q=>horizontal?q.y:q.x,across=q=>horizontal?q.x:q.y,speed=Math.max(WALKING_HEDGE.speed,playerMoveSpeed()*WALKING_HEDGE.runningFactor),count=Math.max(2,travellingWaveCount(e.owner)),waves=[];
 const point=(n,t)=>horizontal?{x:t,y:n}:{x:n,y:t},center=across(p),a=e.arena,low=horizontal?a.left:a.top,high=horizontal?a.right:a.bottom;
 for(let i=0;i<count;i++){
  const prefer=center+[0,66,-36][i];let gap=null;
  for(const offset of [0,-24,24,-48,48,-72,72,-96,96]){
   const candidate=clamp(prefer+offset,low+WALKING_HEDGE.gap/2+8,high-WALKING_HEDGE.gap/2-8);
   if(i&&Math.abs(candidate-waves[i-1].gap)>100)continue;
   if([-48,-24,0,24,48].some(n=>{const q=point(normal(p)+n,candidate);return !encounterClear(q.x,q.y+13,20);}))continue;
   const q=point(normal(p),candidate),steps=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/18));
   if(Array.from({length:steps},(_,j)=>(j+1)/steps).some(u=>!encounterClear(p.x+(q.x-p.x)*u,p.y+(q.y-p.y)*u+13,12)))continue;
   gap=candidate;break;
  }
  if(gap===null)return false;
  waves.push({index:i,start:normal(p)-WALKING_HEDGE.lead-i*speed*WALKING_HEDGE.interval,speed,gap,retired:false});
 }
 e.hedge={horizontal,waves};e.persistent=true;e.opening=point(normal(p),waves[0].gap);return true;
}
function walkingHedgeFields(e,age=e.age){
 if(!e.hedge)return [];
 return e.hedge.waves.filter(w=>!w.retired).map(w=>themedGate(e.arena,e.hedge.horizontal,w.start+Math.max(0,age)*w.speed,w.gap,WALKING_HEDGE.gap,{end:Infinity,key:'hedge'+w.index,art:'hedge',width:WALKING_HEDGE.width,infinite:true,waveIndex:w.index}));
}
function movingGateContains(actor,from,old,field){
 const radius=actor===game.player?9:Math.min(18,actor.rad||10),n=q=>field.horizontal?q.y:q.x,t=q=>field.horizontal?q.x:q.y,a=n(from)-old.at,b=n(actor)-field.at,half=field.width/2+radius;
 let lo=0,hi=1;if(Math.abs(b-a)<1e-9){if(Math.abs(a)>=half)return false;}
 else{const x=(-half-a)/(b-a),y=(half-a)/(b-a);lo=Math.max(0,Math.min(x,y));hi=Math.min(1,Math.max(x,y));if(lo>hi)return false;}
 const at=u=>t(from)+(t(actor)-t(from))*u;
 return Math.max(Math.abs(at(lo)-field.gap),Math.abs(at(hi)-field.gap))>field.gapWidth/2-radius;
}
function movingFrontPassed(at,horizontal,radius=60){
 const normal=q=>horizontal?q.y:q.x,view=horizontal?game.viewHeight:game.viewWidth,edge=normal({x:game.camX,y:game.camY})+view/2+radius;
 return at>edge&&at>normal(game.player)+radius&&game.enemies.every(e=>e.hp<=0||at>normal(e)+(e.rad||18)+radius);
}
function tickWalkingHedge(e,dt,from){
 const oldAge=e.age-dt,nextSpeed=Math.max(WALKING_HEDGE.speed,playerMoveSpeed()*WALKING_HEDGE.runningFactor);
 for(const wave of e.hedge.waves){if(wave.retired)continue;if(nextSpeed>wave.speed){wave.start+=(wave.speed-nextSpeed)*oldAge;wave.speed=nextSpeed;}}
 for(const f of walkingHedgeFields(e)){
  const wave=e.hedge.waves[f.waveIndex],old={...f,at:wave.start+oldAge*wave.speed};
  themedHit(e,f.key,actor=>movingGateContains(actor,actor===game.player?from:actor,old,f),.8);
  if(movingFrontPassed(f.at,f.horizontal))wave.retired=true;
 }
 if(e.hedge.waves.every(w=>w.retired))e.done=true;
}
function setupRollingFurnace(e){
 const r=ROLLING_FURNACE.radius,a=e.arena,start={x:clamp(e.origin.x,a.left+r,a.right-r),y:clamp(e.origin.y,a.top+r,a.bottom-r)},band=zoneVisualBand(),variant=band===1?'train':['train','split','cross'][e.serial%Math.min(3,band)],count=variant==='split'?1:Math.min(3,Math.max(2,travellingWaveCount(e.owner)));
 e.furnace={variant,rollers:Array.from({length:count},(_,i)=>({index:i,start:{...start},delay:i*ROLLING_FURNACE.interval,angle:e.angle+(variant==='cross'?(i%2?.32:-.32):(i-(count-1)/2)*.12),retired:false,hits:new Set()}))};e.persistent=true;return true;
}
function furnacePath(e,roller){
 const a=e.arena,r=ROLLING_FURNACE.radius,start=roller.start,vx=Math.cos(roller.angle)*ROLLING_FURNACE.speed,vy=Math.sin(roller.angle)*ROLLING_FURNACE.speed,tx=vx>0?(a.right-r-start.x)/vx:vx<0?(a.left+r-start.x)/vx:Infinity,ty=vy>0?(a.bottom-r-start.y)/vy:vy<0?(a.top+r-start.y)/vy:Infinity,bounce=Math.max(.06,Math.min(tx,ty)),point={x:start.x+vx*bounce,y:start.y+vy*bounce};
 return {start,vx,vy,bounce,point,nextX:tx<=ty?-vx:vx,nextY:ty<=tx?-vy:vy};
}
function furnacePart(e,roller,age,branch=0){
 const path=furnacePath(e,roller),local=age-roller.delay;if(local<0)return null;const splitting=e.furnace.variant==='split';
 if(local<path.bounce){if(branch)return null;return {x:path.start.x+path.vx*local,y:path.start.y+path.vy*local,angle:roller.angle,r:ROLLING_FURNACE.radius,bounce:path.bounce,key:'roller'+roller.index,roller:roller.index,branch:0,born:roller.delay,factor:.9};}
 if(splitting&&!branch||!splitting&&branch)return null;
 const angle=Math.atan2(path.nextY,path.nextX)+(splitting?branch*ROLLING_FURNACE.splitAngle:0),speed=ROLLING_FURNACE.speed*(splitting?1.12:1);
 return {x:path.point.x+Math.cos(angle)*speed*(local-path.bounce),y:path.point.y+Math.sin(angle)*speed*(local-path.bounce),angle,r:splitting?16:ROLLING_FURNACE.radius,bounce:path.bounce,key:'roller'+roller.index+(splitting?'split'+branch:''),roller:roller.index,branch,born:roller.delay+(splitting?path.bounce:0),factor:splitting?.6:.9};
}
function rollingFurnaceShapes(e,age=e.age){
 if(!e.furnace)return [];
 return e.furnace.rollers.flatMap(roller=>roller.retired?[]:[0,-1,1].map(branch=>furnacePart(e,roller,age,branch)).filter(Boolean));
}
function furnaceSweptContains(e,roller,shot,actor,from,oldAge,age){
 const path=furnacePath(e,roller),born=shot.born,start=Math.max(oldAge,born),end=shot.lastAt??age;if(start>end)return false;
 const turns=[start,roller.delay+path.bounce,end].filter((t,i,list)=>t>=start&&t<=end&&list.indexOf(t)===i).sort((a,b)=>a-b),duration=age-oldAge,actorAt=t=>({x:from.x+(actor.x-from.x)*clamp((t-oldAge)/Math.max(1e-9,duration),0,1),y:from.y+(actor.y-from.y)*clamp((t-oldAge)/Math.max(1e-9,duration),0,1)});
 if(turns.length===1)turns.push(end);
 for(let i=1;i<turns.length;i++){
  const t0=turns[i-1],t1=turns[i],a=furnacePart(e,roller,t0,shot.branch)||{...path.point},b=furnacePart(e,roller,t1,shot.branch)||{...path.point},p=actorAt(t0),q=actorAt(t1),radius=shot.r+(actor===game.player?9:Math.min(18,actor.rad||10));
  if(segmentDistance(0,0,a.x-p.x,a.y-p.y,b.x-q.x,b.y-q.y)<radius)return true;
 }
 return false;
}
function furnacePartPassed(shot){
 const dx=Math.cos(shot.angle),dy=Math.sin(shot.angle),ahead=q=>(q.x-shot.x)*dx+(q.y-shot.y)*dy,view=Math.abs(dx)*game.viewWidth/2+Math.abs(dy)*game.viewHeight/2+80;
 return ahead({x:game.camX,y:game.camY})<-view&&ahead(game.player)<-80&&game.enemies.every(e=>e.hp<=0||ahead(e)<-(e.rad||18)-80);
}
function tickRollingFurnace(e,dt,from){
 const oldAge=e.age-dt;
 for(const roller of e.furnace.rollers){if(roller.retired||e.age<roller.delay)continue;const shapes=[0,-1,1].flatMap(branch=>{const q=furnacePart(e,roller,e.age,branch);return q?[q]:[];});
  // A parent still collides up to the split instant, even on a coarse frame.
  const path=furnacePath(e,roller),splitAt=roller.delay+path.bounce;
  if(e.furnace.variant==='split'&&oldAge<splitAt&&e.age>=splitAt)shapes.push({...furnacePart(e,roller,splitAt-1e-8,0),lastAt:splitAt});
  for(const shot of shapes){const contains=actor=>furnaceSweptContains(e,roller,shot,actor,actor===game.player?from:actor,oldAge,e.age);
   if(contains(game.player)&&!e.playerHits.has(shot.key)){hurtEncounter(e.owner,shot,e.damage*shot.factor);e.playerHits.set(shot.key,Infinity);}
   const attack={enemyHits:roller.hits};damageMonstersInAttack(e.owner,attack,contains);
  }
  if(e.age>=splitAt&&shapes.filter(q=>q.lastAt===undefined).every(furnacePartPassed))roller.retired=true;
 }
 if(e.furnace.rollers.every(r=>r.retired))e.done=true;
}
function pulseDashCounter(h,previous,from,contact){
 const serial=currentCounterDash();if(h.dashCountered||serial===null)return;
 const side=(q,ring)=>{const d=Math.hypot(q.x-ring.x,q.y-ring.y);return d<ring.inner-9?-1:d>ring.r+9?1:0;},before={...previous,x:h.x,y:h.y};
 if(h.counterAttempt?.serial!==serial)h.counterAttempt={serial,side:side(from,before),contact:false};
 const attempt=h.counterAttempt;attempt.contact||=contact;const after=side(game.player,h);
 if(attempt.contact&&after&&(!attempt.side||after!==attempt.side)){h.dashCountered=true;refundCounterDash();}
}
