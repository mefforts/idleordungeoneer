/* Illustrated encounter effects. Rendering reads combat state; it never advances it. */
const ABILITY_MATERIALS=[
 {base:'#896640',light:'#c4a96e',dark:'#29332b',edge:'#eddfad',accent:'#7da65b'},
 {base:'#6d5141',light:'#b68a59',dark:'#30282c',edge:'#fff0b8',accent:'#ffae52'},
 {base:'#b6ad9c',light:'#eee6ca',dark:'#393447',edge:'#fff9e6',accent:'#ac9cdb'},
 {base:'#6385a6',light:'#abdae5',dark:'#29374c',edge:'#efffff',accent:'#70d5db'}
];
const TOTEM_SIGNALS=Object.freeze({
 mend:{color:'#62df88',hot:'#e0ffe7',dark:'#183d2b',label:'HEALING',symbol:'heal'},
 fury:{color:'#f3756b',hot:'#ffebe2',dark:'#542b31',label:'DAMAGE',symbol:'damage'},
 haste:{color:'#72baff',hot:'#e7f5ff',dark:'#253d61',label:'ATTACK SPEED',symbol:'speed'},
 summon:{color:'#c493ff',hot:'#f3e5ff',dark:'#3d2c56',label:'SUMMONING',symbol:'portal'}
});
function abilityEffectTime(){return reducedMotion()?0:game.frame;}
function abilityMaterial(kind){return ABILITY_MATERIALS[kind??biomeIndex()]||ABILITY_MATERIALS[0];}
function totemSignal(t){return TOTEM_SIGNALS[t.type]||TOTEM_SIGNALS.summon;}
function paintAbilityEmblem(symbol,x,y,size,theme){
 ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.lineJoin='round';
 disc(0,0,1,theme.dark);ctx.strokeStyle=theme.color;ctx.lineWidth=.12;ctx.beginPath();ctx.arc(0,0,.94,0,Math.PI*2);ctx.stroke();
 if(symbol==='heal'){
  poly([-.18,-.65,.18,-.65,.18,-.18,.65,-.18,.65,.18,.18,.18,.18,.65,-.18,.65,-.18,.18,-.65,.18,-.65,-.18,-.18,-.18],theme.hot);
  poly([-.55,.5,-.84,.35,-.77,.7,-.55,.76],theme.color);poly([.55,.5,.84,.35,.77,.7,.55,.76],theme.color);
 }else if(symbol==='damage'){
  ctx.rotate(.55);poly([0,-.8,.22,-.43,.13,.3,-.13,.3,-.22,-.43],theme.hot);line(0,-.61,0,.23,.08,theme.color);line(-.37,.31,.37,.31,.14,'#dcba78');line(0,.36,0,.7,.17,'#ac7b50');
 }else if(symbol==='speed'){
  for(let i=0;i<3;i++){const y=(i-1)*.4;poly([-.52,y+.12,0,y-.16,.52,y+.12,0,y+.02],theme.hot);}
 }else if(symbol==='shield'){
  poly([-.57,-.56,0,-.76,.57,-.56,.47,.25,0,.74,-.47,.25],theme.color,theme.hot,.08);poly([0,-.58,.4,-.43,.32,.18,0,.51],theme.hot);line(0,-.55,0,.5,.07,theme.dark);
 }else if(symbol==='mirror'){
  poly([0,-.76,.58,-.36,.58,.36,0,.76,-.58,.36,-.58,-.36],theme.color,theme.hot,.1);poly([-.33,-.25,.25,-.45,.35,-.05,-.2,.42],theme.hot);
 }else if(symbol==='portal'){
  ctx.strokeStyle=theme.hot;ctx.lineWidth=.18;ctx.beginPath();ctx.moveTo(-.5,.6);ctx.lineTo(-.5,-.15);ctx.arc(0,-.15,.5,Math.PI,Math.PI*2);ctx.lineTo(.5,.6);ctx.stroke();disc(0,.05,.19,theme.color);line(-.62,.65,.62,.65,.13,theme.color);
 }else{
  poly([0,-.78,.22,-.22,.78,0,.22,.22,0,.78,-.22,.22,-.78,0,-.22,-.22],theme.hot);disc(0,0,.17,theme.color);
 }
 ctx.restore();
}
function paintAbilityCrystal(x,y,size,material,lean=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(lean);ctx.scale(size/20,size/20);
 poly([-8,0,-10,-23,0,-39,10,-22,8,0],material.base,material.dark,1.8);
 poly([0,-37,8,-22,6,-2,0,-8],material.light);poly([-8,-22,0,-37,0,-8,-6,-2],material.accent);line(0,-33,0,-10,1.2,material.edge);ctx.restore();
}
function paintAbilityEruption(x,y,size,kind,rise,theme){
 const m=abilityMaterial(kind);ctx.save();ctx.translate(x,y);ctx.scale(size/20,size/20);ellipse(0,0,19,6,m.dark+'a0');
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.3;line(Math.cos(a)*5,Math.sin(a)*3,Math.cos(a)*23,Math.sin(a)*10,1.5,theme.color+'b0');}
 ctx.scale(1,.2+.8*clamp(rise,0,1));ctx.lineJoin='round';
 if(kind===0){
  for(let i=0;i<3;i++){const d=(i-1)*11;ctx.beginPath();ctx.moveTo(d*.6,0);ctx.bezierCurveTo(d-10,-10,d+10,-17,d,-35+i*5);ctx.lineTo(d+3,-21+i*3);ctx.strokeStyle=m.dark;ctx.lineWidth=8;ctx.stroke();ctx.strokeStyle=m.base;ctx.lineWidth=5;ctx.stroke();line(d,-21+i*3,d+3,-29+i*3,1.2,m.light);poly([d,-24+i*3,d+12,-29+i*3,d+8,-19+i*3],m.accent,m.dark,.8);}
 }else if(kind===1){
  poly([-17,0,-20,-12,-9,-27,5,-20,16,-8,13,1],m.base,m.dark,2);poly([-9,-25,-4,-9,13,-6,5,-18],m.light);
  poly([-9,-4,-12,-18,-6,-31,-2,-20,4,-45,7,-25,14,-32,12,-12,6,-4],m.accent,m.dark,1.2);poly([-4,-6,-5,-19,2,-32,2,-19,7,-22,5,-7],m.edge);
 }else if(kind===2){
  poly([-12,0,-13,-15,-8,-22,7,-21,13,-13,10,0],m.base,m.dark,1.8);
  for(let i=0;i<4;i++){const x=(i-1.5)*6,top=-29-Math.sin(i)*8;line(x,-11,x-2,top,6,m.dark);line(x,-11,x-2,top,3.5,m.light);disc(x-1,top+8,2.2,m.base);}
  line(-10,-7,-19,-17,6,m.dark);line(-10,-7,-19,-17,3.5,m.light);line(-7,-8,7,-8,1,m.dark);
 }else{
  paintAbilityCrystal(-10,0,12,m,-.32);paintAbilityCrystal(8,1,13,m,.25);paintAbilityCrystal(0,0,19,m,0);
 }
 ctx.restore();
}
function paintAbilityBlade(x,y,size,angle,theme,kind=0){
 const m=abilityMaterial(kind);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size/12,size/12);ctx.lineJoin='round';
 poly([14,0,5,-6,-5,-5,-9,-1,-3,0,-9,1,-5,5,5,6],m.light,m.dark,1.4);poly([13,0,-4,0,-7,3,4,4],m.base);line(-3,-2,7,-2,.9,m.edge);line(-5,-6,-5,6,1.8,'#c3a36c');disc(-6,0,2,theme.color);ctx.restore();
}
function paintAbilityPortal(point,progress,theme,royal=false){
 const time=abilityEffectTime(),r=25;ctx.save();ctx.translate(point.x,point.y);ctx.globalAlpha*=.55+.45*progress;
 ellipse(0,0,r,9,theme.dark+'d0');ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r,9,0,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<3;i++){const a=i*2.09+time*.9;paintAbilityCrystal(Math.cos(a)*22,Math.sin(a)*7,9,{...ABILITY_MATERIALS[3],accent:theme.color},Math.cos(a)*.3);}
 paintAbilityEmblem('portal',0,-15,13,theme);
 if(royal)poly([-10,-32,-12,-43,-4,-39,0,-47,5,-39,12,-43,10,-32],'#dab77b','#493b39',1.2);ctx.restore();
}
function paintAbilityMine(x,y,kind,theme,progress){
 const m=abilityMaterial(kind);ctx.save();ctx.translate(x,y);ellipse(0,1,16,5,m.dark+'c0');ctx.translate(0,-4-Math.sin(abilityEffectTime()*2)*2);ctx.scale(.65+.35*progress,.65+.35*progress);
 poly([-12,-4,-7,-16,6,-18,14,-7,10,5,-3,9,-13,3],m.base,m.dark,2);poly([-7,-14,6,-16,11,-7,-2,-5],m.light);poly([-6,-4,0,-11,7,-5,1,3],theme.color,m.dark,1);line(-4,-3,1,-8,1.3,theme.hot);ctx.restore();
}
function paintAbilityField(shape,type,kind,theme,progress=1,active=false){
 if(shape.shape==='quarters'){
  for(let i=0;i<4;i++){const rect=arenaQuarter(shape.rect,i);if(rect.left!==shape.safe.left||rect.top!==shape.safe.top)paintRuinQuarter(rect,kind,theme,progress,active);}return;
 }
 ctx.save();ctx.beginPath();
 if(shape.shape==='rect'){const r=shape.rect;ctx.rect(r.left,r.top,r.right-r.left,r.bottom-r.top);}
 else if(shape.shape==='cone'){ctx.moveTo(shape.origin.x,shape.origin.y);ctx.arc(shape.origin.x,shape.origin.y,shape.reach,shape.angle-shape.halfAngle,shape.angle+shape.halfAngle);ctx.closePath();}
 else{ctx.arc(shape.x,shape.y,shape.r,0,Math.PI*2);if(shape.inner)ctx.arc(shape.x,shape.y,shape.inner,0,Math.PI*2,true);}
 ctx.clip();ctx.globalAlpha*=active?.92:.64;const rise=active?.42+.58*Math.sin(clamp(progress,0,1)*Math.PI):.12+progress*.18;
 if(shape.shape==='rect'){
  const r=shape.rect,cols=Math.min(6,Math.max(1,Math.ceil((r.right-r.left)/90))),rows=Math.min(5,Math.max(1,Math.ceil((r.bottom-r.top)/90)));
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=r.left+(col+.5)*(r.right-r.left)/cols,y=r.top+(row+.58)*(r.bottom-r.top)/rows;paintAbilityEruption(x,y,active?23:16,kind,rise,theme);}
 }else if(shape.shape==='cone'){
  const s=shape,o=s.origin,r=s.reach*.72,a=s.angle+(active?(1-progress)*2-1:progress*2-1)*s.halfAngle*.65,m=abilityMaterial(kind);
  ctx.strokeStyle=m.dark;ctx.lineWidth=18;ctx.beginPath();ctx.arc(o.x,o.y,r,a-.2,a+.2);ctx.stroke();ctx.strokeStyle=m.light;ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle=m.edge;ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,r+5,a-.2,a+.2);ctx.stroke();
  for(let i=0;i<5;i++){const angle=s.angle-s.halfAngle+(i+.5)*s.halfAngle*2/5;paintAbilityCrystal(o.x+Math.cos(angle)*r,o.y+Math.sin(angle)*r,active?12:6,m,angle+Math.PI/2);}
 }else if(shape.shape==='ring'){
  const count=Math.min(24,Math.max(12,Math.ceil(shape.r/12))),inner=shape.inner||0,radius=inner+(shape.r-inner)*.58;
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count;paintAbilityEruption(shape.x+Math.cos(a)*radius,shape.y+Math.sin(a)*radius,active?23:13,kind,rise,theme);}
 }else if(type==='minefield'&&!active)paintAbilityMine(shape.x,shape.y,kind,theme,progress);
 else{
  paintAbilityEruption(shape.x,shape.y+15,active?32:17,kind,rise,theme);
  for(const side of [-1,1])paintAbilityEruption(shape.x+side*shape.r*.55,shape.y+4,active?18:10,kind,rise,theme);
 }
 ctx.restore();
}
function paintRuinBramble(x,y,size,rise,seed){
 const m=ABILITY_MATERIALS[0];ctx.save();ctx.translate(x,y);ctx.scale(size/20,size/20);
 ellipse(0,2,18,5,'#292b20c0');for(const side of [-1,1])ellipse(side*12,side+2,5,3,'#5a4a2d');ctx.scale(1,rise);
 for(let i=0;i<3;i++){
  const base=(i-1)*10,tip=base+(i===1?5:-8)+seed*3,height=39+i*5+seed*4;
  ctx.beginPath();ctx.moveTo(base-4,3);ctx.bezierCurveTo(base-12,-11,tip+7,-22,tip,-height);ctx.quadraticCurveTo(tip+7,-height+7,tip+6,-height+16);ctx.bezierCurveTo(tip+5,-20,base+2,-12,base+4,2);ctx.closePath();ctx.fillStyle=m.base;ctx.fill();ctx.strokeStyle=m.dark;ctx.lineWidth=1.4;ctx.stroke();
  ctx.beginPath();ctx.moveTo(base-1,-2);ctx.bezierCurveTo(base-7,-13,tip+5,-26,tip+2,-height+7);ctx.strokeStyle=m.light;ctx.lineWidth=1;ctx.stroke();
  const side=i%2?1:-1,bx=tip+side*15,by=-height*.65;
  ctx.beginPath();ctx.moveTo(base,-14);ctx.quadraticCurveTo(bx-side*3,by+13,bx,by);ctx.strokeStyle=m.dark;ctx.lineWidth=4.5;ctx.stroke();ctx.strokeStyle=m.base;ctx.lineWidth=2.7;ctx.stroke();
  poly([bx-side*3,by+8,bx+side*6,by+1,bx,by+13],m.light,m.dark,.7);
  ctx.beginPath();ctx.moveTo(bx,by+1);ctx.quadraticCurveTo(bx+side*12,by-10,bx+side*13,by-2);ctx.quadraticCurveTo(bx+side*10,by+5,bx,by+1);ctx.fillStyle=m.accent;ctx.fill();ctx.strokeStyle=m.dark;ctx.lineWidth=.7;ctx.stroke();
 }
 ctx.restore();
}
function paintRuinQuarter(rect,kind,theme,progress,active){
 const m=abilityMaterial(kind),p=clamp(progress,0,1),time=abilityEffectTime(),rise=active?.65+.35*Math.sin(p*Math.PI):.45+.5*p;
 ctx.save();ctx.beginPath();ctx.rect(rect.left+3,rect.top+3,rect.right-rect.left-6,rect.bottom-rect.top-6);ctx.clip();
 // Ground fissures connect full-height roots, flames, hands or crystals. The
 // lattice is fixed in world space, so camera movement cannot shuffle threats.
 const gap=kind===0?104:88,left=Math.max(rect.left,game.camX-game.viewWidth/2-60),right=Math.min(rect.right,game.camX+game.viewWidth/2+60),top=Math.max(rect.top,game.camY-game.viewHeight/2-60),bottom=Math.min(rect.bottom,game.camY+game.viewHeight/2+70);
 ctx.globalAlpha*=active?.96:.78;
 for(let row=Math.floor(top/gap);row<=Math.ceil(bottom/gap);row++)for(let col=Math.floor(left/gap);col<=Math.ceil(right/gap);col++){
  const x=col*gap+(row%2?gap/2:0),y=row*gap,seed=Math.sin(row*13+col*7),pulse=reducedMotion()?0:Math.sin(time*3+row+col)*.05;
  glow(x,y-6,active?35:27,theme.color+'25');
  ctx.beginPath();ctx.moveTo(x-40,y+20);ctx.lineTo(x-17,y+8);ctx.lineTo(x-5,y+14);ctx.lineTo(x+11,y-4);ctx.lineTo(x+40,y-15);ctx.strokeStyle=m.dark;ctx.lineWidth=kind===0?8:7;ctx.stroke();ctx.strokeStyle=kind===0?theme.color:kind===1?m.accent:m.light;ctx.lineWidth=kind===0?1.6:2.5;ctx.stroke();
  if(kind===1){ctx.strokeStyle=m.edge;ctx.lineWidth=1;ctx.stroke();}
  if(kind===0)paintRuinBramble(x+seed*9,y+12,active?32:28,rise+pulse,seed);else paintAbilityEruption(x+seed*9,y+12,active?38:32,kind,rise+pulse,theme);
  if(kind===3)paintAbilityCrystal(x-23,y+24,18,m,-.32);
 }
 ctx.restore();
}
function paintAbilityBeam(origin,angle,length,width,kind,theme,progress,active=false){
 const m=abilityMaterial(kind),time=abilityEffectTime();ctx.save();ctx.translate(origin.x,origin.y);ctx.rotate(angle);ctx.beginPath();ctx.rect(0,-width/2,length,width);ctx.clip();ctx.lineJoin='round';ctx.lineCap='round';
 ctx.globalAlpha*=active?.95:.5;const end=active?length:length*progress;
 for(let strand=-1;strand<=1;strand++){
  ctx.beginPath();ctx.moveTo(0,strand*width*.17);for(let x=10;x<=end;x+=10)ctx.lineTo(x,strand*width*.17+Math.sin(x*.055-time*7+strand)*width*.09);
  ctx.strokeStyle=m.dark;ctx.lineWidth=active?(kind===1?16:11):4;ctx.stroke();ctx.strokeStyle=kind===1?(strand===0?m.edge:m.accent):strand===0?m.light:m.accent;ctx.lineWidth=active?(kind===1?11:6):2;ctx.stroke();
 }
 for(let x=28;x<end;x+=48){const y=Math.sin(x*.08-time*4)*width*.23;if(kind===0)poly([x-8,y,x+3,y-7,x+11,y,x+3,y+4],m.accent,m.dark,1);else if(kind===1)poly([x-9,y+5,x-2,y-10,x+3,y-1,x+14,y-7,x+6,y+7],m.accent,m.dark,1);else if(kind===2){disc(x,y,6,m.light);ellipse(x+2,y-1,1.2,1.8,m.dark);line(x-6,y,x-18,y+4,2,m.accent);}else paintAbilityCrystal(x,y,8,m,Math.PI/2);}
 ctx.restore();
}
function paintAbilityGroundArt(){
 for(const enemy of game.enemies){
  if(enemy.charge){const theme=combatTheme('friendly'),m=abilityMaterial(enemy.biome);ctx.save();ctx.translate(enemy.x,enemy.y);ctx.rotate(enemy.charge.angle);glow(0,0,enemy.rad*1.5,theme.color+'30');for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-45,side*10);ctx.quadraticCurveTo(-15,side*(enemy.rad+8),12,side*enemy.rad*.6);ctx.strokeStyle=m.accent+'c0';ctx.lineWidth=3;ctx.stroke();}ctx.restore();}
  const c=enemy.cast;if(!c)continue;const kind=enemy.biome??biomeIndex(),theme=combatTheme(castLanguage(c.type)),p=clamp(1-c.windup/c.total,0,1);
  for(const shape of c.shapes||[])if(c.type!=='tether')paintAbilityField(shape,c.type,kind,theme,p);
  if(c.type==='ground')for(const target of c.targets)paintAbilityField({...target,shape:'circle'},'ground',kind,theme,p);
  if(c.type==='cleave')paintAbilityField({...c,shape:'cone'},'cleave',kind,theme,p);
  if(c.type==='beam')paintAbilityBeam(c.origin,c.angle,540,48,kind,theme,p);
  if(c.type==='shield'&&c.shieldTarget)paintAbilityShield(c.shieldTarget.x,c.shieldTarget.y-25,17,combatTheme('shield'));
  if(c.type==='ricochet')for(const point of c.ricochetPoints||[])paintAbilityEmblem('mirror',point.x,point.y,12,theme);
  if(c.type==='mend'||c.type==='fury'){const signal=totemSignal(c);paintAbilityEmblem(signal.symbol,c.point.x,c.point.y-7,13,signal);}
  if(c.type==='summon'||c.type==='eliteSummon')paintAbilityPortal(c.point,p,TOTEM_SIGNALS.summon,c.type==='eliteSummon');
  if(c.type==='bastion')for(const point of c.guards||[])paintAbilityEmblem('shield',point.x,point.y-8,18,combatTheme('shield'));
  if(['volley','ringchain','spiral','bloom','return','orbit'].includes(c.type)){
   const count=c.type==='volley'?(enemy.bossIndex===2?18:10):['spiral','orbit'].includes(c.type)?8:16,offset=(enemy.mechanicIndex||0)*(c.type==='volley'?.39:.28),radius=enemy.rad+35;
   for(let i=0;i<count;i++){if(c.type!=='orbit'&&i%(c.type==='volley'?5:4)===0)continue;const a=i*Math.PI*2/count+offset;paintAbilityProjectile({x:enemy.x+Math.cos(a)*radius,y:enemy.y+Math.sin(a)*radius,vx:Math.cos(a),vy:Math.sin(a),rad:5,biome:kind,language:castLanguage(c.type),abilityType:c.type,preview:true});}
  }
  if(c.type==='charge'||c.type==='eruptionTrail'){
   const length=Math.min(340,Math.hypot(c.target.x-c.origin.x,c.target.y-c.origin.y)+65);ctx.save();ctx.translate(c.origin.x,c.origin.y);ctx.rotate(c.angle);for(let x=45;x<length;x+=55)paintAbilityBlade(x,0,12,0,theme,kind);ctx.restore();
  }
 }
 for(const h of game.hazards||[]){const theme=combatTheme(h.language||'friendly'),p=clamp(h.life/h.total,0,1),active=!(h.delay>0),kind=h.biome??biomeIndex();
  if(h.type==='expanded')paintAbilityField(h,h.abilityType||'ground',kind,theme,p,active);
  else if(h.type==='ground')paintAbilityField({...h,shape:'circle'},'ground',kind,theme,p,true);
  else if(h.type==='beam')paintAbilityBeam(h,h.angle,h.length,h.width,kind,theme,p,true);
 }
 for(const fx of game.counterEffects||[])if(fx.type==='cleave')paintAbilityField({...fx.cast,shape:'cone'},'cleave',fx.biome,combatTheme('friendly'),fx.life/fx.total,true);
}
function paintAbilityProjectile(s){
 const kind=s.biome??biomeIndex(),m=abilityMaterial(kind),theme=combatTheme(s.language||'danger'),angle=Math.atan2(s.vy,s.vx),r=s.rad||6,time=abilityEffectTime(),blade=!s.growing&&(s.boomerang||s.orbit||['return','orbit'].includes(s.abilityType));
 glow(s.x,s.y,Math.max(15,r*2.5),theme.color+'55');ctx.save();ctx.translate(s.x,s.y);ctx.rotate(angle);ctx.lineJoin='round';
 if(!s.preview){line(-r*2.7,0,-r*.6,0,Math.max(2,r*.5),theme.color+'80');line(-r*1.7,0,-r*.6,0,1.2,theme.hot+'b0');}
 if(blade)paintAbilityBlade(0,0,r*1.1,s.preview?0:time*(s.returning?-4:4),theme,kind);
 else if(s.growing||s.abilityType==='bloom'){
  ctx.rotate(time*.65);const points=[];for(let i=0;i<12;i++){const a=i*Math.PI/6,d=i%2?r*.52:r*1.23;points.push(Math.cos(a)*d,Math.sin(a)*d);}poly(points,m.light,m.dark,1.1);for(let i=0;i<6;i++){const a=i*Math.PI/3;poly([0,0,Math.cos(a)*r*1.2,Math.sin(a)*r*1.2,Math.cos(a+.52)*r*.5,Math.sin(a+.52)*r*.5],i%2?m.base:m.accent);}disc(0,0,r*.2,theme.hot);
 }else if(s.abilityType==='ringchain'||s.bounce>0){
  ctx.rotate(time*1.6);ctx.strokeStyle=m.dark;ctx.lineWidth=r*.65;ctx.beginPath();ctx.arc(0,0,r*.8,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=m.light;ctx.lineWidth=r*.37;ctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;poly([Math.cos(a)*r*.7,Math.sin(a)*r*.7,Math.cos(a+.24)*r*1.3,Math.sin(a+.24)*r*1.3,Math.cos(a+.5)*r*.75,Math.sin(a+.5)*r*.75],m.accent,m.dark,.6);}
 }else if(kind===0){
  ctx.scale(r/6,r/6);poly([9,0,0,-4,-7,-3,-4,0,-7,3,0,4],m.base,m.dark,1);poly([8,0,-1,-2,-3,0],m.light);poly([-2,-1,-5,-7,2,-3],m.accent,m.dark,.6);
 }else if(kind===1){
  ctx.scale(r/6,r/6);poly([8,0,3,-6,-4,-5,-7,1,-2,6,5,4],m.base,m.dark,1.3);poly([-2,-4,3,-4,5,0,0,3,-4,1],m.accent);line(-1,-2,3,0,1.3,m.edge);
 }else if(kind===2){
  ctx.scale(r/6,r/6);ellipse(0,-1,6,5,m.light);quad(-4,1,7,5,m.base);disc(2,-2,1.6,m.dark);disc(-2,-2,1.6,m.dark);line(-2,3,-2,5,.8,m.dark);line(1,3,1,5,.8,m.dark);poly([-6,0,-11,-4,-8,1,-12,5,-6,3],m.accent);
 }else paintAbilityCrystal(0,r*.8,r*.85,m,Math.PI/2);
 ctx.restore();
}
function paintAbilityTotemCrest(t){
 const theme=totemSignal(t),foot=encounterFoot(t);ctx.save();if(t.disabled)ctx.globalAlpha*=.4;
 glow(t.x,foot.y-49,25,theme.color+'45');paintAbilityEmblem(theme.symbol,t.x,foot.y-46,12,theme);
 ctx.strokeStyle=theme.color+'b0';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(t.x,foot.y-2,24,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function paintAbilityStream(t,a,end,caster){
 const signal=totemSignal(t),theme=t.disabled?{color:'#8b999e',hot:'#d2dbde',dark:'#303a41'}:signal,time=abilityEffectTime();ctx.save();ctx.lineCap='round';
 if(t.blocked){ctx.setLineDash([3,7]);line(end.x,end.y,caster.x,caster.y,1.2,signal.color+'40');ctx.setLineDash([]);}
 if(t.disabled)ctx.setLineDash([5,8]);line(a.x,a.y,end.x,end.y,8,theme.dark+'c0');line(a.x,a.y,end.x,end.y,3.5,theme.color);line(a.x,a.y,end.x,end.y,1,theme.hot);ctx.setLineDash([]);
 if(!t.disabled){const steps=reducedMotion()?1:3;for(let i=0;i<steps;i++){const u=reducedMotion()?.5:(time*.55+i/steps)%1,x=a.x+(end.x-a.x)*u,y=a.y+(end.y-a.y)*u;paintAbilityEmblem(signal.symbol,x,y,5.5,signal);}}
 if(t.blocked&&!t.disabled){ctx.strokeStyle=combatTheme('safe').color;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(end.x,end.y,15,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
function paintAbilityTether(enemy,cast){
 const a={x:enemy.x,y:enemy.y-20},b={x:game.player.x,y:game.player.y-18},distance=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x),theme=combatTheme('danger'),time=abilityEffectTime(),count=Math.min(25,Math.floor(distance/12));
 ctx.save();for(let i=1;i<count;i++){const u=i/count,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=i%2?'#bcaaa0':theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,6,i%2?2:4,0,0,Math.PI*2);ctx.stroke();ctx.restore();}paintAbilityEmblem('mirror',a.x,a.y,12,theme);const u=reducedMotion()?.5:(time*.8)%1;disc(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,3.5,theme.hot);ctx.restore();
}
function paintAbilityShield(x,y,size,theme){
 ctx.save();ctx.globalAlpha*=.9;glow(x,y,size*1.7,theme.color+'35');paintAbilityEmblem('shield',x,y,size,theme);ctx.restore();
}
