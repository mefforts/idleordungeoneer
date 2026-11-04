/* A shared, non-interactive corner haze points toward living enemies outside the view. */
const OFFSCREEN_THREATS={radius:.34,maximumRadius:180,minimumRadius:80,opacity:.18,pulsesPerSecond:.8};
function offscreenEnemyBounds(e){
 const kind=e.biome??biomeIndex(),size=environmentMobSize(e),art=RARE_ELITE_ART[ENVIRONMENT_ZONES[kind].key+'-'+(e.visualType||0)];let height=size.height,width=size.width;
 if((e.champion||e.uncommon)&&art){const ratio=art.width/art.height,normal=environmentMobSize({...e,rad:e.baseRadius||15});height=e.uncommon?Math.min(78,size.height*1.12):Math.min(88,normal.height*1.45,106/ratio);width=height*ratio;}
 else if(e.boss||e.elite){height=e.elite?(e.bossIndex===2?118:94):e.bossIndex===2?185:e.bossIndex===1?140:124;const r=CREATURE_REGIONS[kind][(e.bossIndex||0)+1];width=height*r[2]/r[3];}
 const foot=e.y+(e.rad||12)*(e.uncommon?.7:.85);
 return {left:e.x-width/2-8,right:e.x+width/2+8,top:foot-height-12,bottom:foot+12};
}
function offscreenThreatCorners(w=game.viewWidth,h=game.viewHeight){
 const corners=[0,0,0,0];if(game.scene!=='combat'||game.status!=='running')return corners;
 const left=game.camX-w/2,right=game.camX+w/2,top=game.camY-h/2,bottom=game.camY+h/2,signs=[[-1,-1],[1,-1],[-1,1],[1,1]];
 for(const e of game.enemies){
  if(e.hp<=0||e.defeated||e.totem)continue;const b=offscreenEnemyBounds(e);
  if(b.right>=left&&b.left<=right&&b.bottom>=top&&b.top<=bottom)continue;
  const dx=(e.x-game.camX)/(w/2),dy=(e.y-game.camY)/(h/2),d=Math.hypot(dx,dy)||1;
  for(let i=0;i<4;i++){const [x,y]=signs[i],weight=clamp(((dx*x+dy*y)/d/Math.SQRT2-.35)/.65,0,1);corners[i]=Math.max(corners[i],weight);}
 }
 return corners;
}
function paintOffscreenThreats(w,h){
 const corners=offscreenThreatCorners(w,h);if(!corners.some(Boolean))return;
 const radius=clamp(Math.min(w,h)*OFFSCREEN_THREATS.radius,OFFSCREEN_THREATS.minimumRadius,OFFSCREEN_THREATS.maximumRadius);
 if(!game.menuPaused&&!game.manualPaused||!Number.isFinite(game.offscreenThreatPulse))game.offscreenThreatPulse=.55+.45*Math.sin((game.tipClock||0)*Math.PI*2*OFFSCREEN_THREATS.pulsesPerSecond);
 const pulse=reducedMotion()?.7:game.offscreenThreatPulse;
 ctx.save();ctx.globalAlpha=1;
 for(let i=0;i<4;i++){
  if(!corners[i])continue;const x=i%2?w:0,y=i<2?0:h,alpha=OFFSCREEN_THREATS.opacity*pulse*corners[i],gradient=ctx.createRadialGradient(x,y,0,x,y,radius);
  gradient.addColorStop(0,'rgba(226,45,39,'+alpha+')');gradient.addColorStop(.55,'rgba(204,35,32,'+(alpha*.38)+')');gradient.addColorStop(1,'rgba(190,30,28,0)');ctx.fillStyle=gradient;
  ctx.fillRect(i%2?w-radius:0,i<2?0:h-radius,radius,radius);
 }
 ctx.restore();
}
