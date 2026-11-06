/* Shared combat ink. These painters read state only; geometry and clocks belong
 * to the ability. Keep material art below actors and this signal above it. */
const MECHANIC_INK=Object.freeze({keyline:'#10151de6',rim:2.2,activeRim:3,backing:5.5,warningFill:'13',activeFill:'22'});
function traceAbilityFootprint(s){
 ctx.beginPath();
 if(s.shape==='rect'){const r=s.rect;ctx.rect(r.left,r.top,r.right-r.left,r.bottom-r.top);}
 else if(s.shape==='cone'){ctx.moveTo(s.origin.x,s.origin.y);ctx.arc(s.origin.x,s.origin.y,s.reach,s.angle-s.halfAngle,s.angle+s.halfAngle);ctx.closePath();}
 else if(s.shape==='segment'){
  const a=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x),r=s.width/2;
  ctx.arc(s.b.x,s.b.y,r,a-Math.PI/2,a+Math.PI/2);ctx.arc(s.a.x,s.a.y,r,a+Math.PI/2,a+Math.PI*1.5);ctx.closePath();
 }else if(s.shape==='triangle'){s.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
 else{ctx.arc(s.x,s.y,s.r,0,Math.PI*2);if(s.inner)ctx.arc(s.x,s.y,s.inner,0,Math.PI*2,true);}
}
function strokeAbilityEdge(theme,active=false,pending=false){
 ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(pending?[3,7]:[]);
 ctx.strokeStyle=MECHANIC_INK.keyline;ctx.lineWidth=MECHANIC_INK.backing;ctx.stroke();
 ctx.strokeStyle=theme.color;ctx.lineWidth=active?MECHANIC_INK.activeRim:MECHANIC_INK.rim;ctx.stroke();ctx.setLineDash([]);
}
function paintAbilityClock(x,y,r,progress,theme){
 const p=clamp(progress,0,1);if(p<=0)return;
 ctx.save();ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*p);ctx.strokeStyle=MECHANIC_INK.keyline;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=theme.hot;ctx.lineWidth=2;ctx.stroke();
 const a=-Math.PI/2+Math.PI*2*p;disc(x+Math.cos(a)*r,y+Math.sin(a)*r,2.8,theme.color);ctx.restore();
}
function paintAbilityFootprint(s,theme,progress=1,active=false,pending=false){
 const p=clamp(progress,0,1);ctx.save();traceAbilityFootprint(s);
 ctx.fillStyle='#11151c'+(active?'2b':'22');ctx.fill();ctx.fillStyle=theme.color+(active?MECHANIC_INK.activeFill:MECHANIC_INK.warningFill);ctx.fill();strokeAbilityEdge(theme,active,pending);
 if(!active&&!pending){
  ctx.save();traceAbilityFootprint(s);ctx.clip();ctx.strokeStyle=theme.color+'55';ctx.lineWidth=1;
  if(s.shape==='circle'){
   ctx.beginPath();ctx.arc(s.x,s.y,s.r*(.15+.85*p),0,Math.PI*2);ctx.stroke();
   for(let i=0;i<4;i++){const a=i*Math.PI/2,r=s.r-7;line(s.x+Math.cos(a)*(r-5),s.y+Math.sin(a)*(r-5),s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,2,theme.hot);}
  }else if(s.shape==='rect'||s.shape==='segment'){
   const r=s.rect||{left:Math.min(s.a.x,s.b.x)-s.width,top:Math.min(s.a.y,s.b.y)-s.width,right:Math.max(s.a.x,s.b.x)+s.width,bottom:Math.max(s.a.y,s.b.y)+s.width},v=mechanicView(0),left=Math.max(r.left,v.left),right=Math.min(r.right,v.right),top=Math.max(r.top,v.top),bottom=Math.min(r.bottom,v.bottom);
   for(let x=Math.floor((left-(bottom-top))/36)*36;x<right;x+=36)line(x,top,x+bottom-top,bottom,1,theme.color+'3d');
  }
  ctx.restore();
 }
 if(s.shape==='circle'&&!active)paintAbilityClock(s.x,s.y,s.r+5,p,theme);
 if(s.shape==='cone'){
  const start=s.angle-s.halfAngle;ctx.beginPath();ctx.arc(s.origin.x,s.origin.y,s.reach-5,start,start+s.halfAngle*2*(active?1:p));ctx.strokeStyle=theme.hot;ctx.lineWidth=1.5;ctx.stroke();
 }
 ctx.restore();
}
function paintAbilityLane(origin,angle,length,width,theme,progress=1,active=false){
 const p=clamp(progress,0,1),end={x:origin.x+Math.cos(angle)*length,y:origin.y+Math.sin(angle)*length};ctx.save();traceAbilityFootprint({shape:'segment',a:origin,b:end,width});ctx.fillStyle=theme.color+(active?'25':'17');ctx.fill();strokeAbilityEdge(theme,active);
 ctx.save();ctx.clip();ctx.translate(origin.x,origin.y);ctx.rotate(angle);
 if(!active){
  const tip=length*p;line(0,0,tip,0,3,theme.color+'80');line(0,0,tip,0,1,theme.hot);
  for(let x=38;x<length-12;x+=68){const size=Math.min(8,width*.22);themedArrow(x,0,0,theme.hot+'bb',size);}
  line(tip,-width/2,tip,width/2,2,theme.hot);
 }else{line(0,-width/2+4,length,-width/2+4,1,theme.hot+'90');line(0,width/2-4,length,width/2-4,1,theme.hot+'90');}
 ctx.restore();ctx.restore();
}
function paintAbilityScars(x,y,r,kind,theme,progress,active){
 const p=clamp(progress,0,1),m=abilityMaterial(kind),rise=active?1:.2+.55*p;ctx.save();
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7+.19,reach=r*(.55+(i%3)*.12),bx=x+Math.cos(a+.15)*reach*.55,by=y+Math.sin(a+.15)*reach*.55,ex=x+Math.cos(a)*reach,ey=y+Math.sin(a)*reach;
  ctx.beginPath();ctx.moveTo(x+Math.cos(a)*8,y+Math.sin(a)*8);ctx.lineTo(bx,by);ctx.lineTo(ex,ey);ctx.strokeStyle=m.dark+'c0';ctx.lineWidth=active?4:2.5;ctx.stroke();ctx.strokeStyle=theme.color+(active?'b0':'75');ctx.lineWidth=active?1.4:.9;ctx.stroke();
  if(active){const f=reducedMotion()?.55:(abilityEffectTime()*.55+i*.37)%1,px=bx+(ex-bx)*f,py=by+(ey-by)*f;poly([px,py-3*rise,px+2,py,px,py+2,px-2,py],i%2?theme.hot:m.light);}
 }
 ctx.restore();
}
function paintProjectileSignal(x,y,r,theme,preview=false){
 // A compact broken rim remains legible against every floor and does not
 // enlarge the projectile's collision radius. Purple has opposed chevrons.
 ctx.save();ctx.globalAlpha*=preview?.6:1;const purple=theme.color===combatTheme('friendly').color;
 for(let i=0;i<(purple?2:3);i++){
  const a=i*Math.PI*2/(purple?2:3)+(purple?0:.3);ctx.beginPath();ctx.arc(x,y,r+1,a+.15,a+(purple?1.15:.9));ctx.strokeStyle=MECHANIC_INK.keyline;ctx.lineWidth=4.5;ctx.stroke();ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.stroke();
 }
 if(purple)for(const side of [-1,1])themedArrow(x+side*(r+2),y,side>0?0:Math.PI,theme.hot,3);
 ctx.restore();
}
function themedFieldCue(e,f,warning=false){
 const total=e.warningTotal||THEMED_MECHANICS[e.type].seconds,age=e.age,start=f.start||0,lead=f.reveal===undefined?total+start:Math.max(.2,start-Math.max(-total,f.reveal)),progress=clamp(1-(start-age)/Math.max(.2,lead),0,1),active=!warning&&age>=start&&age<=f.end;
 return {active,progress,pending:!active&&start-age>1.5,alpha:active?1:.38+.52*progress};
}
function paintChargeWake(enemy){
 const c=enemy.charge,theme=combatTheme('friendly'),half=enemyChargeHalfWidth(enemy),length=c.attack?Math.min(65,Math.max(0,enemyChargeLength(c.attack)-c.remaining)):0,m=abilityMaterial(enemy.biome);
 ctx.save();ctx.translate(enemy.x,enemy.y);ctx.rotate(c.angle);ctx.lineJoin='round';ctx.lineCap='round';
 if(length>0){const gradient=ctx.createLinearGradient(-length,0,12,0);gradient.addColorStop(0,theme.color+'00');gradient.addColorStop(1,theme.color+'48');poly([-length,-half*.7,12,-half,24,0,12,half,-length,half*.7],gradient);}
 for(const side of [-1,1]){
  ctx.beginPath();ctx.moveTo(-length,side*half*.68);ctx.quadraticCurveTo(6,side*half,23,side*half*.3);ctx.strokeStyle=MECHANIC_INK.keyline;ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle=theme.color;ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(5,side*half*.67);ctx.quadraticCurveTo(16,side*half*.5,23,side*half*.3);ctx.strokeStyle=m.edge;ctx.lineWidth=1;ctx.stroke();
 }ctx.restore();
}
function paintReflectReturn(fx){
 const gold=combatTheme('reflect'),teal=combatTheme('safe'),p=1-fx.life/fx.total,angle=Math.atan2(fx.ty-fx.y,fx.tx-fx.x),bend=Math.min(35,Math.hypot(fx.tx-fx.x,fx.ty-fx.y)*.12),mx=(fx.x+fx.tx)/2-Math.sin(angle)*bend,my=(fx.y+fx.ty)/2+Math.cos(angle)*bend;
 ctx.save();ctx.globalAlpha*=fx.life/fx.total;ctx.beginPath();ctx.moveTo(fx.x,fx.y);ctx.quadraticCurveTo(mx,my,fx.tx,fx.ty);ctx.strokeStyle=gold.color+'55';ctx.lineWidth=8;ctx.stroke();ctx.strokeStyle=gold.hot;ctx.lineWidth=2;ctx.stroke();
 const spread=reducedMotion()?14:8+p*25;for(let i=0;i<6;i++){const a=i*Math.PI/3;line(fx.tx+Math.cos(a)*spread,fx.ty+Math.sin(a)*spread,fx.tx+Math.cos(a)*(spread+7),fx.ty+Math.sin(a)*(spread+7),2,teal.color);}
 poly([fx.tx,fx.ty-8,fx.tx+5,fx.ty,fx.tx,fx.ty+8,fx.tx-5,fx.ty],teal.color,teal.hot,1.2);ctx.restore();
}
