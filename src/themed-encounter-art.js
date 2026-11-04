/* Illustrated props, motion and collision share the same event geometry. */
function themedSprite(art,kind,x,y,width=44,angle=0,alpha=1,centered=false){
 const image=themedEffectImages.get(art+'-'+kind);if(!image?.complete||!image.naturalWidth)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=alpha;ctx.drawImage(image,-width/2,-width*(centered?136/256:116/128),width,width*136/128);ctx.restore();
}
function themedArc(x,y,r,progress,color='#f2e7d4',width=2){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(progress,0,1));ctx.stroke();ctx.restore();}
function themedArrow(x,y,angle,color,size=8){ctx.save();ctx.translate(x,y);ctx.rotate(angle);line(-size,-size*.6,0,0,2,color);line(0,0,-size,size*.6,2,color);ctx.restore();}
function themedLine(a,b,width,color){line(a.x,a.y,b.x,b.y,width,color);}
function themedProjectileShapes(e,age=e.age){
 const result=[],t=e.target,a=e.arena,add=(point,r,key,art,factor=.5)=>result.push({...point,r,key,art,factor});
 switch(e.type){
 case 'sporeFan':for(let fan=0;fan<3;fan++)for(let i=0;i<4;i++){const local=age-fan*.6,angle=e.angle+(i-1.5)*.42+(fan-1)*.22;if(local>=0&&local<2.2)add({x:e.origin.x+(fan-1)*42+Math.cos(angle)*local*118,y:e.origin.y+Math.sin(angle)*local*118},9,'spore'+fan+'-'+i,'pod',.4);}break;
 case 'pollenTide':for(let i=0;i<6;i++){const local=age-i*.4;if(local<0||local>=2.3)continue;const side=(i%3-1)*65;add({x:e.origin.x+Math.cos(e.angle)*local*155-Math.sin(e.angle)*side,y:e.origin.y+Math.sin(e.angle)*local*155+Math.cos(e.angle)*side},11,'debris'+i,'seed',.4);}break;
 case 'clingingSeeds':if(e.state.attachedAt===null&&age<1){const u=clamp(age/.85,0,1);add({x:e.origin.x+(t.x-e.origin.x)*u,y:e.origin.y+(t.y-e.origin.y)*u},12,'clinging','seed',.3);}break;
 case 'rollingFurnace':{const q=themedBoulder(e,Math.max(0,age));if(q&&age>=0&&age<4.4)add(q,24,'boulder','boulder',.9);break;}
 case 'cinderStitch':if(age>=0&&age<2.2)add({x:e.origin.x+Math.cos(e.angle)*age*170,y:e.origin.y+Math.sin(e.angle)*age*170},9,'needle','needle',.5);break;
 case 'hollowChorus':for(let i=0;i<3;i++){const local=age-i*1.25,angle=e.angle+(i-1)*1.9,q={x:t.x+Math.cos(angle)*145,y:t.y+Math.sin(angle)*145};if(local>=0&&local<2.6)for(let j=0;j<5;j++){const direction=Math.atan2(t.y-q.y,t.x-q.x)+(j-2)*.22;add({x:q.x+Math.cos(direction)*local*120,y:q.y+Math.sin(direction)*local*120},10,'chorus'+i+'-'+j,'wisp',.45);}}break;
 case 'astralSlingshot':for(let i=0;i<5;i++){const local=age-i*.3;if(local>=0&&local<3.5)add(themedSlingshot(e,local,i),9,'slingshot'+i,'star');}break;
 case 'orbitTransfer':if(e.partner&&age>=0)add(themedOrbit(e,age),18,'blade','blade',.75);break;
 case 'stargateVolley':for(let i=0;i<4;i++){const local=age-i*.6;if(local>=0&&local<2.3)add(themedPortalShot(e,local),10,'portal'+i,'star',.6);}break;
 }
 return result;
}
function paintThemedField(e,f,warning=false){
 const active=!warning&&e.age>=f.start&&e.age<=f.end;if(!active&&e.age>f.end||f.reveal!==undefined&&e.age<f.reveal)return;
 const language=THEMED_MECHANICS[e.type].language,theme=combatTheme(language),color=theme.color,time=abilityEffectTime(),age=warning?-1:e.age,progress=active?1:clamp(1-(f.start-age)/(THEMED_MECHANICS[e.type].seconds+f.start),0,1),alpha=active?1:.5;
 ctx.save();ctx.globalAlpha*=alpha;ctx.lineCap='round';ctx.lineJoin='round';
 if(f.shape==='circle'){
  ctx.fillStyle=color+(active?'14':'0a');ctx.strokeStyle=color;ctx.lineWidth=active?2.5:1.4;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.stroke();
  themedArc(f.x,f.y,f.r+4,progress,theme.hot,1.5);
  const until=f.start-e.age,fall=active?0:clamp(until/.8,0,1)*65,scale=active?1.06:.8;
  if(['hammer','branch','droplet','comet'].includes(f.art)){ellipse(f.x,f.y,f.r*.6,f.r*.18,'#11131b60');themedSprite(f.art,e.kind,f.x,f.y-fall,f.r*1.55*scale,f.art==='branch'?.2:0);}
  else if(f.art==='vent'){themedSprite('vent',e.kind,f.x,f.y+13,f.r*1.65);if(active)for(let i=0;i<3;i++)paintEmberFlame(f.x+(i-1)*13,f.y,23+(i%2)*10,i);}
  else if(f.art==='sporeCloud'){glow(f.x,f.y,f.r,theme.color+'28');for(let i=0;i<5;i++)disc(f.x+Math.sin(time+i)*16,f.y+Math.cos(time*1.3+i)*13,5,'#c7d1a755');}
  else if(f.art==='lens'){themedSprite('lens',e.kind,f.x,f.y+25,70,time*.25);if(active){themedSprite('prism',e.kind,f.x,f.y,74);for(let i=0;i<8;i++){const a=i*Math.PI/4;themedSprite('star',e.kind,f.x+Math.cos(a)*f.r*.6,f.y+Math.sin(a)*f.r*.6,21,a);}}}
  else if(f.art==='ghost')themedSprite('ghost',e.kind,f.x,f.y+20,60,0,.75);
  else if(f.art==='pod'){themedSprite('pod',e.kind,f.x,f.y+18,45+progress*18);if(active)for(let i=0;i<6;i++){const a=i*Math.PI/3;themedSprite('seed',e.kind,f.x+Math.cos(a)*f.r*.65,f.y+Math.sin(a)*f.r*.6,16,a);}}
  else if(f.art!=='clock')themedSprite(f.art||THEMED_MECHANICS[e.type].art,e.kind,f.x,f.y+15,active?65:43);
 }else if(f.shape==='segment'){
  const angle=Math.atan2(f.b.y-f.a.y,f.b.x-f.a.x),length=Math.hypot(f.b.x-f.a.x,f.b.y-f.a.y),count=Math.min(14,Math.max(1,Math.ceil(length/32)));
  themedLine(f.a,f.b,f.width,color+(active?'30':'18'));themedLine(f.a,f.b,1.4,color);themedArrow(f.b.x,f.b.y,angle,theme.hot,7);
  if(f.art==='prism'){themedLine(f.a,f.b,active?7:1,theme.hot);if(active)themedLine(f.a,f.b,2,'#fff9ed');}
  else if(f.art==='clock'){themedLine(f.a,f.b,11,'#393440');themedLine(f.a,f.b,7,'#e3d8b8');for(let i=0;i<3;i++){const t=(i+.5)/3;disc(f.a.x+(f.b.x-f.a.x)*t,f.a.y+(f.b.y-f.a.y)*t,4,'#f4ead5');}}
  else if(f.art!=='rift')for(let i=0;i<count;i++){const u=(i+.5)/count,x=f.a.x+(f.b.x-f.a.x)*u,y=f.a.y+(f.b.y-f.a.y)*u;if(f.art==='flame'){if(active)paintEmberFlame(x,y,22,i);else {disc(x,y,4,'#ffb878');line(x-7,y,x+7,y,1,color);}}else themedSprite(f.art,e.kind,x,y-(active?0:25*(1-progress)),f.art==='branch'?65:36,angle+(f.art==='branch'?0:Math.PI/2));}
  if(f.art==='rift'){themedLine(f.a,f.b,13,'#1b1c30');themedLine(f.a,f.b,4,'#d1b1ec');}
 }else if(f.shape==='gate'){
  const lo=f.horizontal?f.arena.left:f.arena.top,hi=f.horizontal?f.arena.right:f.arena.bottom,coordinate=n=>f.horizontal?{x:n,y:f.at}:{x:f.at,y:n};
  for(const [left,right]of [[lo,f.gap-f.gapWidth/2],[f.gap+f.gapWidth/2,hi]]){themedLine(coordinate(left),coordinate(right),f.width,color+'30');themedLine(coordinate(left),coordinate(right),2,color);for(let n=left+14;n<right-10;n+=28){const q=coordinate(n);themedSprite(f.art,e.kind,q.x,q.y+9,42,f.horizontal?0:Math.PI/2);}}
  const q=coordinate(f.gap);themedArrow(q.x,q.y,f.horizontal?-Math.PI/2:0,combatTheme('safe').hot,10);themedArc(q.x,q.y,15,.75,combatTheme('safe').color,2);
 }else if(f.shape==='rect'){
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(f.rect.left,f.rect.top,f.rect.right-f.rect.left,f.rect.bottom-f.rect.top);themedSprite('coffin',e.kind,(f.rect.left+f.rect.right)/2,f.rect.bottom,100,e.serial%2?.1:-.1);
  for(const y of [f.rect.top-16,f.rect.bottom+16])themedArrow((f.rect.left+f.rect.right)/2,y,y<f.rect.top?-Math.PI/2:Math.PI/2,combatTheme('safe').color,8);
 }else if(f.shape==='arc'){
  ctx.strokeStyle=color;ctx.lineWidth=f.width;ctx.beginPath();ctx.arc(f.x,f.y,f.r,f.gap+f.gapHalf,f.gap+Math.PI*2-f.gapHalf);ctx.stroke();
  for(let i=0;i<14;i++){const angle=f.gap+f.gapHalf+(Math.PI*2-f.gapHalf*2)*(i+.5)/14;themedSprite('rib',e.kind,f.x+Math.cos(angle)*f.r,f.y+Math.sin(angle)*f.r,34,angle+Math.PI/2);}
  themedArrow(f.x+Math.cos(f.gap)*(f.r+12),f.y+Math.sin(f.gap)*(f.r+12),f.gap,combatTheme('safe').hot,10);
 }else if(f.shape==='triangle'){
  const [a,b,c]=f.points;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle=color+(active?'24':'0c');ctx.strokeStyle=color;ctx.lineWidth=active?5:1.5;ctx.fill();ctx.stroke();
  for(const q of f.points){themedSprite('star',e.kind,q.x,q.y+14,48,active?time*.3:0);themedArc(q.x,q.y,23,progress,theme.hot);}
  if(active)for(let i=0;i<8;i++){const u=(i%4+.5)/4,v=(Math.floor(i/4)+.5)/3;if(u+v<1)themedSprite('star',e.kind,a.x+(b.x-a.x)*u+(c.x-a.x)*v,a.y+(b.y-a.y)*u+(c.y-a.y)*v,18,time*.2);}
 }else if(f.shape==='flood'){
  ctx.save();for(const q of f.refuges){ctx.beginPath();ctx.rect(f.arena.left,f.arena.top,f.arena.right-f.arena.left,f.arena.bottom-f.arena.top);ctx.moveTo(q.x+f.r,q.y);ctx.arc(q.x,q.y,f.r,0,Math.PI*2);ctx.clip('evenodd');}ctx.fillStyle='#b94c2525';ctx.fillRect(f.arena.left,f.arena.top,f.arena.right-f.arena.left,f.arena.bottom-f.arena.top);ctx.restore();
  for(let row=0,y=f.arena.top+20;y<f.arena.bottom;y+=47,row++)for(let col=0,x=f.arena.left+20;x<f.arena.right;x+=45,col++){const jitter=Math.sin(row*13+col*17)*8,px=x+jitter,py=y+Math.cos(col*7+row)*7;if(f.refuges.some(q=>Math.hypot(px-q.x,py-q.y)<f.r+20))continue;line(px-18,py+8,px-4,py-3,3,'#412d2c');line(px-4,py-3,px+15,py+3,3,'#412d2c');line(px-18,py+8,px-4,py-3,1.2,'#ef8c4c99');line(px-4,py-3,px+15,py+3,1.2,'#ffc27666');if((row+col*2)%4===0)paintEmberFlame(px,py,13+(row%3)*4,col+row);}
  for(let i=0;i<e.points.length;i++){const q=e.points[i],cold=f.refuges.includes(q);themedSprite('stone',e.kind,q.x,q.y+24,88);themedArc(q.x,q.y,f.r,1,cold?combatTheme('safe').color:color,3);if(cold)themedArc(q.x,q.y,f.r+4,1-(Math.max(0,e.age)%2.1)/2.1,combatTheme('safe').hot,2);}
 }
 if(f.order){const q=f.shape==='circle'?f:f.a;for(let i=0;i<f.order;i++)disc(q.x+(i-(f.order-1)/2)*8,q.y+18,2.3,theme.hot);}
 ctx.restore();
}
function paintThemedSpecial(e,warning=false){
 const t=e.target,a=e.arena,s=e.state,age=warning?0:e.age,time=abilityEffectTime(),def=THEMED_MECHANICS[e.type],theme=combatTheme(def.language),gold=combatTheme('reflect'),teal=combatTheme('safe');
 const timer=(q,r,p,color)=>themedArc(q.x,q.y,r,p,color,2.2),prop=(art,q,size=45,angle=0,alpha=1)=>themedSprite(art,e.kind,q.x,q.y,size,angle,alpha);
 if(e.relocation&&(warning||age<.5)){const alpha=warning?.65:Math.max(0,1-age/.5);for(const q of [e.relocation.from,e.relocation.to]){prop('portal',q,58,0,alpha);themedArc(q.x,q.y,25,1,theme.color,2);}}
 if(e.path.length>1&&['backdraft','hauntedFootsteps'].includes(e.type)){for(let i=0;i<e.path.length-1;i++){const q=e.path[i];themedLine(q,e.path[i+1],2,theme.color+'99');themedArrow(q.x,q.y,Math.atan2(e.path[i+1].y-q.y,e.path[i+1].x-q.x),theme.hot,5);}if(e.type==='hauntedFootsteps'&&warning)for(const u of [.15,.65])prop('ghost',themedPathPoint(e.path,u),46,0,.35);}
 switch(e.type){
 case 'burrowingBriar':for(let i=0;i<9;i++){const u=i/8,q={x:e.origin.x+(t.x-e.origin.x)*u,y:e.origin.y+(t.y-e.origin.y)*u};prop('root',q,20+i*2,Math.sin(i)*.15,.4+.6*u);}break;
 case 'briarLeash':case 'rallyThread':{
  const end=themedLinkEnd(e);if(!end)break;const start=e.owner,signal=e.type==='rallyThread'?TOTEM_SIGNALS.fury:theme;
  for(let i=0;i<16;i++){const u=i/15,x=start.x+(end.x-start.x)*u,y=start.y+(end.y-start.y)*u;prop(e.kind===0?'root':e.kind===2?'rib':'blade',{x,y},18,Math.atan2(end.y-start.y,end.x-start.x)+Math.PI/2);}
  themedLine(start,end,2,signal.color);for(const q of [start,end]){prop(e.type==='rallyThread'?'banner':'sapling',q,48);paintAbilityEmblem(e.type==='rallyThread'?'damage':'portal',q.x,q.y-30,9,signal);}
  const mid={x:(start.x+end.x)/2,y:(start.y+end.y)/2};themedArrow(mid.x,mid.y,Math.atan2(end.y-start.y,end.x-start.x)+Math.PI/2,teal.hot,10);timer(mid,16,1-age/e.total,teal.color);break;}
 case 'clingingSeeds':if(warning){themedLine(e.origin,t,1.4,theme.color+'80');prop('seed',t,28);}break;
 case 'graftedSwap':{
  const old=s.previous||e.origin,q=e.points[0];for(const point of [old,q]){prop('portal',point,62);timer(point,29,warning?.5:1-age/e.total,teal.color);}prop('sapling',s.swapped?old:q,64);themedLine(old,q,1,teal.color+'77');themedArrow((old.x+q.x)/2,(old.y+q.y)/2,e.angle,teal.hot,9);break;}
 case 'sporeFan':for(let i=0;i<3;i++)prop('mushroom',{x:e.origin.x+(i-1)*42,y:e.origin.y},46);break;
 case 'pollenTide':ctx.save();ctx.translate(t.x,t.y);ctx.rotate(e.angle);for(let i=0;i<6;i++){const y=(i-2.5)*37,x=reducedMotion()?0:((time*40+i*17)%100)-50;ctx.strokeStyle='#dbc68b70';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-35,y);ctx.quadraticCurveTo(x,y-12,x+45,y+3);ctx.stroke();themedArrow(x+45,y+3,0,theme.hot+'99',5);}ctx.restore();break;
 case 'rollingFurnace':{const rect=e.arena;ctx.save();ctx.strokeStyle=theme.color+'66';ctx.setLineDash([7,7]);ctx.strokeRect(rect.left,rect.top,rect.right-rect.left,rect.bottom-rect.top);ctx.restore();const q=themedBoulder(e,.3);if(warning&&q){const start=themedBoulder(e,0);themedLine(start,q,2,theme.color);themedArrow(q.x,q.y,q.angle,theme.hot,12);prop('boulder',start,58);}break;}
 case 'cinderStitch':for(let i=0;i<12;i++){if(i%4===3)continue;const q={x:e.origin.x+Math.cos(e.angle)*(i+1)*28,y:e.origin.y+Math.sin(e.angle)*(i+1)*28};if(age>i*.13+1&&age<i*.13+3)paintEmberFlame(q.x,q.y,22,i);else if(age<i*.13+1){disc(q.x,q.y,3,'#ffba78');themedArc(q.x,q.y,17,.7,theme.color+'88',1);}}break;
 case 'slagAnchors':for(let i=0;i<2;i++)if(!s['anchor'+i]){const q=e.points[i];prop('anchor',q,62);timer(q,29,1-age/e.total,teal.color);themedArrow(q.x,q.y-14,-Math.PI/2,teal.hot,9);}break;
 case 'emberCatch':{const q=e.points[0];prop('droplet',{x:q.x,y:q.y-6-(reducedMotion()?0:Math.sin(time*2)*3)},48);paintAbilityEmblem('mirror',q.x,q.y-22,11,gold);timer(q,31,1-age/e.total,gold.hot);themedArc(q.x,q.y,26,1,gold.color);break;}
 case 'soulLantern':{const q=e.points[0];prop('lantern',q,65);themedArc(q.x,q.y,28,1,'#62df88');break;}
 case 'graveClock':{prop('clock',{x:t.x,y:t.y+20},58);const phase=age<1.5?age/1.5:age<2.2?1:1-(age-2.2)/1.8,angle=e.angle-1+phase*2;themedArrow(t.x+Math.cos(angle)*110,t.y+Math.sin(angle)*110,angle,teal.hot,10);break;}
 case 'returningSigil':for(let i=0;i<e.points.length;i++){const q=e.points[i],active=i===(s.stage||0);prop('lantern',q,active?45:32,0,active?1:.35);paintAbilityEmblem('mirror',q.x,q.y,15,gold);timer(q,29,active?1-(age-(s.stageAt||0)-(i?.6:0))/3.6:1,active?gold.hot:gold.color+'66');for(let j=0;j<=i;j++)disc(q.x+(j-i/2)*8,q.y+37,2.5,gold.hot);}break;
 case 'hollowChorus':for(let i=0;i<3;i++){const angle=e.angle+(i-1)*1.9,q={x:t.x+Math.cos(angle)*145,y:t.y+Math.sin(angle)*145},local=age-i*1.25;prop('ghost',q,57,0,.65);prop('lantern',{x:q.x+18,y:q.y-35-(local<0?12:0)},27);timer(q,26,clamp(1+local,0,1),theme.hot);}break;
 case 'borrowedBreath':{
  const p=game.player;prop('wisp',{x:p.x,y:p.y-36},25,0,.6);timer(p,32,1-age/e.total,theme.color);
  for(const q of e.points){prop('stone',q,48);paintAbilityEmblem('heal',q.x,q.y-12,10,teal);timer(q,27,1-age/e.total,teal.color);}break;}
 case 'astralSlingshot':{const lens={x:t.x-55,y:t.y-40};prop('lens',lens,76,time*.1);for(let i=0;i<14;i++){const q=themedSlingshot(e,i*.18,0);disc(q.x,q.y,1.8,theme.color+'88');}break;}
 case 'gravityWell':{prop('lens',{x:t.x,y:t.y+23},86,time*.2);themedArc(t.x,t.y,170,1,theme.color+'77');for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=80+(reducedMotion()?0:(1-(time*.5)%1)*80);themedArrow(t.x+Math.cos(a)*rad,t.y+Math.sin(a)*rad,a+Math.PI,theme.hot,7);}timer(t,38,1-age/2.7,theme.hot);break;}
 case 'orbitTransfer':if(e.partner){const start=themedOrbit(e,1.5),end=themedOrbit(e,2.3);themedLine(start,end,2,theme.color+'99');for(const q of [e.owner,e.partner])themedArc(q.x,q.y,70,1,theme.color+'55',1);themedArrow(end.x,end.y,Math.atan2(end.y-start.y,end.x-start.x),theme.hot,11);}break;
 case 'stargateVolley':{const first={x:a.left+45,y:t.y-70},second={x:a.right-45,y:t.y+55};for(const q of [first,second])prop('portal',q,68);ctx.save();ctx.setLineDash([3,7]);themedLine(first,second,1,theme.color+'60');ctx.restore();const exit={x:second.x+Math.cos(e.angle)*100,y:second.y+Math.sin(e.angle)*100};themedLine(second,exit,2,theme.color);themedArrow(exit.x,exit.y,e.angle,theme.hot,11);break;}
 case 'riftScissors':{const u=clamp(age/e.total,0,1);for(const side of [-1,1]){prop('rift',{x:t.x+side*135*(1-u),y:t.y+35},65,side<0?0:Math.PI);themedArrow(t.x,t.y+side*145,side<0?-Math.PI/2:Math.PI/2,teal.hot,10);}break;}
 case 'collapsingNova':{const q=e.points[0],radius=age<2.5?Math.max(30,180-age*62):30;paintAbilityEmblem('mirror',q.x,q.y,18,gold);timer(q,29,age<2.5?1-age/2.5:1-(age-2.5)/3.5,gold.hot);if(age<2.5){themedArc(q.x,q.y,radius,1,theme.color,3);for(let i=0;i<8;i++){const a=i*Math.PI/4;prop('star',{x:q.x+Math.cos(a)*radius,y:q.y+Math.sin(a)*radius},23,a);}}else if(!s.launched)for(let i=0;i<4;i++){const a=i*Math.PI/2;themedArrow(q.x+Math.cos(a)*50,q.y+Math.sin(a)*50,a,theme.hot,9);}break;}
 case 'prismRelay':prop('prism',{x:a.left+(a.right-a.left)*.25,y:t.y-85},70);prop('prism',{x:a.left+(a.right-a.left)*.75,y:t.y+35},70);break;
 case 'turningBulwark':{const q=e.owner,angle=e.angle+age*.5;themedArc(q.x,q.y,q.rad+31,1,combatTheme('shield').color+'55',1);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(angle);ctx.strokeStyle=combatTheme('shield').color;ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,q.rad+23,-1.05,1.05);ctx.stroke();ctx.restore();prop('shield',{x:q.x+Math.cos(angle)*(q.rad+28),y:q.y+Math.sin(angle)*(q.rad+28)+12},49,angle+Math.PI/2);break;}
 }
}
function paintThemedAir(){for(const e of game.themedEvents||[]){if(e.done)continue;if(e.type==='clingingSeeds'&&e.state.attachedAt!==null){const p=game.player;for(let i=0;i<3;i++)themedSprite('seed',e.kind,p.x+(i-1)*19,p.y-28+(reducedMotion()?0:Math.sin(abilityEffectTime()*2+i)*3),20,i*.6,1,true);themedArc(p.x,p.y-12,32,1-(e.age-e.state.attachedAt)/3.5,combatTheme('danger').hot,2);}
 if(e.type==='soulLantern'){const q=e.points[0];for(let i=0;i<=Math.floor(e.age/1.15);i++){const u=(e.age-i*1.15)/1.5;if(u>=0&&u<=1&&!e.state['soul'+i])themedSprite('wisp',e.kind,q.x+(e.owner.x-q.x)*u,q.y+(e.owner.y-q.y)*u,23,0,.85,true);}}
 const theme=combatTheme(THEMED_MECHANICS[e.type].language),previousShots=new Map(themedProjectileShapes(e,Math.max(0,e.age-.10)).map(q=>[q.key,q]));for(const q of themedProjectileShapes(e)){const previous=previousShots.get(q.key);if(previous&&previous.portal===q.portal){line(previous.x,previous.y,q.x,q.y,q.r*.9,theme.color+'55');line(previous.x,previous.y,q.x,q.y,1.3,theme.hot+'99');}glow(q.x,q.y,q.r*2.4,theme.color+'30');themedSprite(q.art,e.kind,q.x,q.y,q.r*2.7,(q.angle||e.angle)+(reducedMotion()?0:e.age*(q.art==='boulder'?2:1)),1,true);}}}
function paintThemedEvent(e,warning=false){ctx.save();for(const field of themedFields(e,warning?0:e.age))paintThemedField(e,field,warning);paintThemedSpecial(e,warning);ctx.restore();}
function paintThemedWarning(owner,cast){if(!cast.themed)return false;paintThemedEvent({...cast.themed,age:-cast.windup},true);return true;}
function paintThemedGround(){for(const event of game.themedEvents||[])if(!event.done)paintThemedEvent(event);}
