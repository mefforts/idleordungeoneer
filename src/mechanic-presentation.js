/* Physical silhouettes carry the theme; rims and symbols carry the rule. */
const travellingArtImages=new Map();
function installTravellingArt(){for(const [key,src]of Object.entries(TRAVELLING_EFFECT_ART)){const image=new Image();image.src=src;travellingArtImages.set(key,image);}}
function mechanicSprite(name,x,y,size,angle=0,alpha=1){
 const image=travellingArtImages.get(name);if(!image?.complete||!image.naturalWidth)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=alpha;ctx.drawImage(image,-size/2,-size/2,size,size);ctx.restore();
}
function mechanicView(margin=60){return {left:game.camX-game.viewWidth/2-margin,right:game.camX+game.viewWidth/2+margin,top:game.camY-game.viewHeight/2-margin,bottom:game.camY+game.viewHeight/2+margin};}
function paintSequencePips(owner,count,progress=0,color=combatTheme('danger').color){
 if(count<2)return;const body=enemyBody(owner),x=owner.x,y=body.top-39;
 for(let i=0;i<count;i++){const px=x+(i-(count-1)/2)*13;poly([px,y-4,px+4,y,px,y+4,px-4,y],i<=progress?color:color+'38',color,1);}
}
function paintInterruptMark(x,y,r=22,progress=1){
 const theme=combatTheme('interrupt');ctx.save();ctx.lineCap='round';
 for(const side of [-1,1]){ctx.strokeStyle=theme.dark;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+side*(r-7),y-r*.42);ctx.lineTo(x+side*r,y-r*.42);ctx.lineTo(x+side*r,y+r*.42);ctx.lineTo(x+side*(r-7),y+r*.42);ctx.stroke();ctx.strokeStyle=theme.color;ctx.lineWidth=2.5;ctx.stroke();}
 mechanicSprite('interrupt',x,y,19);if(progress<1)paintAbilityClock(x,y,r+6,progress,theme);ctx.restore();
}
function paintWalkingHedge(e,f,warning){
 const view=mechanicView(),lo=f.horizontal?view.left:view.top,hi=f.horizontal?view.right:view.bottom,normalLo=f.horizontal?view.top:view.left,normalHi=f.horizontal?view.bottom:view.right,theme=combatTheme('danger'),teal=combatTheme('safe'),q=n=>f.horizontal?{x:n,y:f.at}:{x:f.at,y:n};
 if(f.at<normalLo-40||f.at>normalHi+40)return;
 ctx.save();ctx.globalAlpha*=warning?.5:1;ctx.lineCap='round';
 for(const [start,end]of [[lo,Math.min(hi,f.gap-f.gapWidth/2)],[Math.max(lo,f.gap+f.gapWidth/2),hi]]){
  if(end<=start)continue;const a=q(start),b=q(end);themedLine(a,b,15,'#17251b77');themedLine(a,b,5,theme.color+'48');
  ctx.save();ctx.beginPath();if(f.horizontal)ctx.rect(start,f.at-70,end-start,96);else ctx.rect(f.at-26,start,96,end-start);ctx.clip();
  for(let t=Math.floor(start/38)*38;t<end+38;t+=38){const p=q(t),shift=reducedMotion()?0:Math.sin(game.frame*3+t)*1.2;ctx.save();ctx.translate(p.x,p.y);ctx.rotate((f.horizontal?0:Math.PI/2)+Math.sin(t*.73)*.1);const variation=(Math.sin(t*.73)+1)/2;ctx.scale(variation>.5?1:-1,1.45+variation*.55);mechanicSprite('hedge',0,-7+shift,64+variation*12,0);ctx.restore();}
  ctx.restore();
  const edge=f.horizontal?{x:0,y:f.width/2}:{x:f.width/2,y:0};for(const side of [-1,1]){line(a.x+edge.x*side,a.y+edge.y*side,b.x+edge.x*side,b.y+edge.y*side,5,MECHANIC_INK.keyline);line(a.x+edge.x*side,a.y+edge.y*side,b.x+edge.x*side,b.y+edge.y*side,side===1?2.5:1.5,theme.color);}
  for(let t=start+35;t<end;t+=100){const p=q(t);themedArrow(p.x,p.y,f.horizontal?Math.PI/2:0,theme.hot,5);}
 }
 const center=q(f.gap),ends=[q(f.gap-f.gapWidth/2),q(f.gap+f.gapWidth/2)],normal=f.horizontal?{x:0,y:1}:{x:1,y:0};
 for(const p of ends){line(p.x-normal.x*18,p.y-normal.y*18,p.x+normal.x*18,p.y+normal.y*18,6,MECHANIC_INK.keyline);line(p.x-normal.x*18,p.y-normal.y*18,p.x+normal.x*18,p.y+normal.y*18,3,teal.color);disc(p.x,p.y,3,teal.hot);}
 for(const d of [-12,7])themedArrow(center.x-normal.x*d,center.y-normal.y*d,f.horizontal?-Math.PI/2:Math.PI,teal.hot,8);
 for(let i=0;i<=f.waveIndex;i++)disc(center.x+(f.horizontal?(i-f.waveIndex/2)*7:16),center.y+(f.horizontal?-21:(i-f.waveIndex/2)*7),2,teal.color);
 ctx.restore();
}
function paintRollingFurnaceWarning(e,warning){
 if(!e.furnace)return;const theme=combatTheme('friendly'),view=mechanicView();ctx.save();ctx.lineCap='round';
 for(const roller of e.furnace.rollers){if(roller.retired)continue;const path=furnacePath(e,roller),local=e.age-roller.delay,waiting=warning||local<0;
  const split=e.furnace.variant==='split',angle=Math.atan2(path.nextY,path.nextX),remaining=Math.max(0,1-local/Math.max(.1,path.bounce));
  if(waiting||local<path.bounce){ctx.save();ctx.setLineDash([5,8]);themedLine(path.start,path.point,1.4,theme.color+(waiting?'aa':'60'));ctx.restore();
   for(const delta of split?[-ROLLING_FURNACE.splitAngle,ROLLING_FURNACE.splitAngle]:[0]){const end={x:path.point.x+Math.cos(angle+delta)*105,y:path.point.y+Math.sin(angle+delta)*105};themedLine(path.point,end,1.5,theme.color+'b0');themedArrow(end.x,end.y,angle+delta,theme.hot,8);}
   if(insideRect(path.point,view)){ellipse(path.point.x,path.point.y+5,23,9,'#15162480');mechanicSprite('bank',path.point.x,path.point.y,36,angle+Math.PI);themedArc(path.point.x,path.point.y,24,remaining,theme.color,2);}
  }
  if(waiting){ellipse(path.start.x,path.start.y+7,25,9,'#18151e66');mechanicSprite('furnace',path.start.x,path.start.y,57,roller.angle,.55);themedArc(path.start.x,path.start.y,27,warning?.5:1-clamp((roller.delay-e.age)/ROLLING_FURNACE.interval,0,1),theme.color,2);}
 }
 if(warning)paintSequencePips(e.owner,e.furnace.rollers.length,0,theme.color);ctx.restore();
}
function paintRollingFurnaceAir(e){
 const theme=combatTheme('friendly'),view=mechanicView(90),time=abilityEffectTime();
 for(const shot of rollingFurnaceShapes(e)){if(!insideRect(shot,view))continue;const roller=e.furnace.rollers[shot.roller],previous=furnacePart(e,roller,Math.max(shot.born,e.age-.14),shot.branch)||shot;
  ctx.save();ellipse(shot.x,shot.y+shot.r*.66,shot.r*.92,shot.r*.3,'#14132080');themedLine(previous,shot,shot.r*1.45,theme.color+'25');themedLine(previous,shot,2,theme.color+'a0');
  glow(shot.x,shot.y,shot.r*1.6,'#ff9b3c55');mechanicSprite(shot.branch?'furnace-shard':'furnace',shot.x,shot.y,shot.r*2.5,shot.angle+(reducedMotion()?0:time*2.2));
  themedArc(shot.x,shot.y,shot.r,1,theme.color,2);for(let i=0;i<3&&!reducedMotion();i++){const u=(time*2+i/3)%1,a=shot.angle+Math.PI+(i-1)*.35;disc(shot.x+Math.cos(a)*(shot.r+u*24),shot.y+Math.sin(a)*(shot.r+u*24),2*(1-u),i===1?theme.hot:'#ffd58d');}
  ctx.restore();
 }
}
function paintPulseCrest(shape,theme,progress,active){
 const view=mechanicView(45),radius=(shape.r+(shape.inner||0))/2,inner=shape.inner||0,time=abilityEffectTime();ctx.save();
 if(!active){
  ctx.globalAlpha*=.55;for(let i=0;i<4;i++){const a=i*Math.PI/2;for(let j=0;j<2;j++)themedArrow(shape.x+Math.cos(a)*(shape.r+19+j*18),shape.y+Math.sin(a)*(shape.r+19+j*18),a,theme.hot,7);}
  for(let i=0;i<(shape.sequenceCount||1);i++)themedArc(shape.x,shape.y,shape.r+7+i*7,progress,theme.color,i?1:2);
  mechanicSprite('skull-wave',shape.x,shape.y,32,0,.75);ctx.restore();return;
 }
 // Clip all bone crests and spirit fire to the exact damaging annulus.
 ctx.beginPath();ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2);if(inner)ctx.arc(shape.x,shape.y,inner,0,Math.PI*2,true);ctx.clip();
 ctx.strokeStyle=theme.dark+'80';ctx.lineWidth=Math.max(3,shape.r-inner);ctx.beginPath();ctx.arc(shape.x,shape.y,radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=theme.color+'55';ctx.lineWidth=Math.max(2,shape.r-inner-6);ctx.stroke();
 const count=Math.min(220,Math.max(10,Math.ceil(Math.PI*2*radius/40)));
 for(let i=0;i<count;i++){const a=i*Math.PI*2/count,p={x:shape.x+Math.cos(a)*radius,y:shape.y+Math.sin(a)*radius};if(!insideRect(p,view))continue;
  const size=Math.min(54,shape.r-inner+22);mechanicSprite(i%5===0?'skull-wave':'rib-wave',p.x,p.y,size*(.92+(i%3)*.05),a+Math.PI/2+Math.sin(i*2.3)*.18,.96);const b=a+Math.PI*2/count;ctx.strokeStyle=theme.hot+'70';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(shape.x+Math.cos((a+b)/2)*(radius+5),shape.y+Math.sin((a+b)/2)*(radius+5),shape.x+Math.cos(b)*radius,shape.y+Math.sin(b)*radius);ctx.stroke();
  if(!reducedMotion()&&i%3===0){const f=(time*1.5+i*.31)%1;disc(p.x-Math.cos(a)*f*14,p.y-Math.sin(a)*f*14,2*(1-f),theme.hot+'b0');}
 }
 ctx.restore();ctx.save();ctx.strokeStyle=theme.color;ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2);ctx.stroke();if(inner){ctx.strokeStyle=theme.hot+'c0';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(shape.x,shape.y,inner,0,Math.PI*2);ctx.stroke();}ctx.restore();
}
function paintCounterReadiness(){
 for(const owner of game.enemies){if(resolveEnemy(owner)&&(owner.charge||owner.cast?.siphon||['charge','eruptionTrail'].includes(owner.cast?.type)))paintInterruptMark(owner.x,owner.y+12,32,owner.cast?owner.cast.windup/owner.cast.total:1);}
 const p=game.player,remaining=(p.refundFlashUntil||0)-game.frame;if(remaining<=0)return;
 const theme=combatTheme('safe'),r=12;ctx.save();ctx.globalAlpha=Math.min(1,remaining/.2);ctx.strokeStyle=theme.hot;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y-64,r,.3,Math.PI*1.8);ctx.stroke();themedArrow(p.x+Math.cos(.3)*r,p.y-64+Math.sin(.3)*r,.3-Math.PI/2,theme.color,6);ctx.restore();
}
