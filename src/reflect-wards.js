/* Moving casters leave readable counter windows with an immediate trigger. */
const REFLECT_WARDS={variants:['jaw','rebound','rune'],seconds:3,reboundSeconds:3.4,inner:34,gapHalf:.70,failure:.15,wallDamage:.04};
function isReflectCast(cast){return !!cast&&['reflect','reversal'].includes(cast.type);}
function reflectVariantFor(owner){return REFLECT_WARDS.variants[((owner.reflectSerial||0)+(owner.bossIndex||0)+data.floor-1)%REFLECT_WARDS.variants.length];}
function configureReflectWard(owner,cast){
 const variant=reflectVariantFor(owner),player=encounterFoot(game.player),point=cast.point;owner.reflectSerial=(owner.reflectSerial||0)+1;
 if(variant==='rebound'){point.x=player.x;point.y=player.y;}
 point.variant=variant;point.inner=REFLECT_WARDS.inner;point.r=variant==='jaw'?point.r:point.inner+20;point.gapAngle=Math.atan2(player.y-point.y,player.x-point.x);point.gapHalf=REFLECT_WARDS.gapHalf;
 point.requireExit=variant==='rebound'||Math.hypot(player.x-point.x,player.y-point.y)<=point.inner+14;point.armed=!point.requireExit;
 const travel=Math.max(0,Math.hypot(player.x-point.x,player.y-point.y)-point.inner)/175;
 cast.total=cast.windup=Math.max(variant==='rebound'?REFLECT_WARDS.reboundSeconds:REFLECT_WARDS.seconds,travel+1);
 cast.hint=point.requireExit?'Step out · return to the gold rune':variant==='jaw'?'Enter through the teal jaw opening · touch the gold center':'Touch the gold rune before its timer expires';
}
function reflectEntryFraction(from,to,point){
 const dx=to.x-from.x,dy=to.y-from.y,ox=from.x-point.x,oy=from.y-point.y,c=ox*ox+oy*oy-point.inner*point.inner;if(c<=0)return 0;
 const a=dx*dx+dy*dy;if(a<1e-9)return null;const b=2*(ox*dx+oy*dy),disc=b*b-4*a*c;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;
}
function reflectJawContact(point,from,to){
 if(point.variant!=='jaw')return false;const distance=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(distance/5));
 for(let i=0;i<=steps;i++){const t=i/steps,x=from.x+(to.x-from.x)*t-point.x,y=from.y+(to.y-from.y)*t-point.y,r=Math.hypot(x,y);if(r<point.inner+10||r>point.r+9)continue;const a=Math.atan2(y,x)-point.gapAngle,angle=Math.abs(Math.atan2(Math.sin(a),Math.cos(a))),margin=Math.asin(Math.min(.9,9/Math.max(10,r)));if(angle>point.gapHalf-margin)return true;}return false;
}
function tickReflectWard(owner,cast,dt,from=encounterFoot(game.player)){
 if(cast.resolved||!game.enemies.includes(owner)||owner.hp<=0)return;
 const point=cast.point,to=encounterFoot(game.player),left=cast.windup,fraction=dt>0?Math.min(1,Math.max(0,left/dt)):1,end={x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction};
 cast.windup=Math.max(0,left-dt);
 const entry=point.armed?reflectEntryFraction(from,end,point):null;
 if(reflectJawContact(point,from,entry===null?end:{x:from.x+(end.x-from.x)*entry,y:from.y+(end.y-from.y)*entry})&&game.frame>=(cast.wallReadyAt||0)){cast.wallReadyAt=game.frame+.65;hurt(game.player.maxHp*REFLECT_WARDS.wallDamage/incomingDamageScale());if(game.status!=='running')return;}
 if(entry!==null){cast.reflected=true;owner.cast=null;resolveBossCast(owner,cast);owner.castCooldown=owner.boss?(owner.combatPhase>=2?1.8:2.5):3.1;return;}
 if(!point.armed&&Math.hypot(end.x-point.x,end.y-point.y)>point.inner+14){point.armed=true;cast.hint='Return to the gold rune · touch it before time runs out';}
 if(cast.windup<=0){cast.expired=true;owner.cast=null;resolveBossCast(owner,cast);owner.castCooldown=owner.boss?(owner.combatPhase>=2?1.8:2.5):3.1;}
}
function resolveReflectWard(owner,cast){
 const point=cast.point,p=encounterFoot(game.player),reflected=cast.reflected===true||!cast.expired&&point.armed&&Math.hypot(p.x-point.x,p.y-point.y)<=point.inner,kind=owner.biome??biomeIndex();
 game.counterEffects.push({...point,tx:owner.x,ty:owner.y-22,biome:kind,reflected,expired:!reflected,life:.75,total:.75});game.reflectCooldown=6;
 if(reflected){
  refundCounterDash();
  const amount=owner.maxHp*(.12+.015*waveRank('prism'));owner.hp-=amount;owner.stagger=1.6+.15*waveRank('prism');for(const t of game.totems||[])if(t.owner===owner)t.disabledUntil=game.frame+waveRank('prism');owner.lastDamageStyle=combatStyle();floater(owner.x,owner.y-42,'Reflected · '+Math.round(amount),combatTheme('reflect').hot);burst(owner.x,owner.y,10,combatTheme('reflect').color);if(owner.hp<=0)onKill(owner);
 }else{
  if(cast.type==='reversal'){const healed=Math.min(owner.maxHp-owner.hp,owner.maxHp*.05);owner.hp+=healed;floater(owner.x,owner.y-48,'MISSED MIRROR · +'+Math.round(healed)+' HP',combatTheme('danger').hot);}
  hurt(game.player.maxHp*REFLECT_WARDS.failure/incomingDamageScale());floater(p.x,p.y-36,'WARD MISSED',combatTheme('danger').hot);
 }
}
function paintReflectWardArt(point,progress,kind,active=false){
 const theme=combatTheme(active&&point.expired?'danger':'reflect'),safe=combatTheme('safe'),danger=combatTheme('danger'),m=abilityMaterial(kind),inner=point.inner,r=point.r,jaw=point.variant==='jaw',armed=point.armed!==false,time=abilityEffectTime(),image=encounterImage(kind,'reflect');
 ctx.save();ctx.translate(point.x,point.y);glow(0,0,r+12,theme.color+'24');
 if(active){const age=reducedMotion()?.5:1-(point.life||0)/(point.total||.75),radius=inner+(r-inner+20)*age;ctx.strokeStyle=theme.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();paintAbilityEmblem(point.expired?'portal':'mirror',0,0,inner*.65,theme);ctx.restore();return;}
 if(jaw){
  const gap=point.gapAngle||0,half=point.gapHalf||REFLECT_WARDS.gapHalf;
  ctx.beginPath();ctx.arc(0,0,r,gap+half,gap+Math.PI*2-half);ctx.arc(0,0,inner+10,gap+Math.PI*2-half,gap+half,true);ctx.closePath();ctx.fillStyle=danger.color+'24';ctx.fill();ctx.strokeStyle=danger.color;ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<22;i++){const a=i*Math.PI/11,delta=Math.abs(Math.atan2(Math.sin(a-gap),Math.cos(a-gap)));if(delta<half+.08)continue;ctx.save();ctx.rotate(a);poly([r-3,-7,r+8,0,r-3,7,inner+17,4,inner+10,0,inner+17,-4],m.light,m.dark,1.3);line(r-2,0,inner+16,0,1,m.base);ctx.restore();}
  for(const side of [-1,1]){const a=gap+side*half;line(Math.cos(a)*(inner+10),Math.sin(a)*(inner+10),Math.cos(a)*(r+5),Math.sin(a)*(r+5),3,safe.color);}
  const x=Math.cos(gap)*(r-10),y=Math.sin(gap)*(r-10);ctx.save();ctx.translate(x,y);ctx.rotate(gap);line(7,-6,0,0,2,safe.hot);line(0,0,7,6,2,safe.hot);ctx.restore();
 }else{
  ctx.strokeStyle=armed?theme.color:safe.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+(reducedMotion()?0:time*.16);paintAbilityCrystal(Math.cos(a)*(r-5),Math.sin(a)*(r-5),8,m,a);}
 }
 if(image.complete&&image.naturalWidth){ctx.globalAlpha=armed?.9:.45;ctx.drawImage(image,-inner,-inner,inner*2,inner*2);ctx.globalAlpha=1;}
 ctx.strokeStyle=armed?theme.hot:safe.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,inner+3,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=theme.hot;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+5,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
 if(!armed)for(const side of [-1,1]){line(side*(inner-8),0,side*(inner+9),0,2,safe.hot);line(side*(inner+9),0,side*(inner+3),-5,2,safe.hot);line(side*(inner+9),0,side*(inner+3),5,2,safe.hot);}
 ctx.restore();
}
