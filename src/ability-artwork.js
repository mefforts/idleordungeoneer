/* Artwork motion is presentation only. All positions, footprints and deadlines
 * still come from the owning mechanic. No random stream or effect state lives here. */
const THEMED_ART_PROFILES=Object.freeze({
 root:{sway:.018,breath:.016,rate:1.1},sapling:{sway:.025,breath:.012,rate:.9},
 pod:{sway:.012,breath:.035,rate:1.4},mushroom:{sway:.018,breath:.024,rate:1.2},
 ghost:{center:true,float:3,sway:.028,rate:1.2},wisp:{center:true,float:2,sway:.04,rate:1.5},
 lantern:{center:true,float:2,sway:.025,rate:1.05},lens:{center:true,float:0,rate:1},
 prism:{center:true,float:1.8,sway:.018,rate:1},portal:{breath:.012,rate:.8}
});
function themedArtworkPose(art,x,y,centered=false){
 const style=THEMED_ART_PROFILES[art]||{},still=centered||reducedMotion(),phase=still?0:abilityEffectTime()*(style.rate||1)+Math.sin(x*.031+y*.017)*2;
 return {center:!!style.center,bob:still?0:Math.sin(phase)*(style.float||0),sway:still?0:Math.sin(phase*.8)*(style.sway||0),sx:still?1:1+Math.sin(phase)*(style.breath||0),sy:still?1:1-Math.sin(phase)*(style.breath||0)*.65};
}
function paintThemedImpact(e,f,theme){
 const age=e.age-f.start;if(age<0||age>.42)return;const u=reducedMotion()?.55:clamp(age/.42,0,1),material=abilityMaterial(e.kind),radius=f.r*(.16+.72*u);
 ctx.save();traceAbilityFootprint(f);ctx.clip();ctx.globalAlpha*=1-u*.65;
 ctx.beginPath();ctx.ellipse(f.x,f.y,radius,radius*.55,0,0,Math.PI*2);ctx.strokeStyle=theme.color+'95';ctx.lineWidth=3-u*2;ctx.stroke();
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3+.2,dx=Math.cos(a),dy=Math.sin(a),r=f.r*(.25+.58*u),x=f.x+dx*r,y=f.y+dy*r-(reducedMotion()?0:Math.sin(u*Math.PI)*11),size=(i%2?3.5:2.5)*(1-u*.3);
  poly([x-size,y+size*.4,x-size*.4,y-size,x+size,y-size*.3,x+size*.5,y+size],material.base,material.light,.8);
 }
 ctx.restore();
}
function paintThemedSporeCloud(e,f,theme,active){
 const time=abilityEffectTime();ctx.save();traceAbilityFootprint(f);ctx.clip();
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5,r=f.r*.33,cx=f.x+Math.cos(a)*r,cy=f.y+Math.sin(a)*r,size=f.r*(.38+(i%2)*.07),shift=reducedMotion()?0:Math.sin(time*.9+i)*3;
  const mist=ctx.createRadialGradient(cx,cy+shift,1,cx,cy+shift,size);mist.addColorStop(0,active?'#c4ce9470':'#c4ce9425');mist.addColorStop(1,'#7b927700');ctx.fillStyle=mist;ctx.fillRect(cx-size,cy+shift-size,size*2,size*2);
 }
 for(let i=0;i<7;i++){
  const a=i*2.399,drift=reducedMotion()?.5:(time*.15+i*.17)%1,r=f.r*(.18+.65*drift),x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r;
  ellipse(x,y,2+i%2,1.5,theme.hot+'b0');line(x,y+2,x-2,y+6,1,'#a8bc8490');
 }ctx.restore();
}
function paintThemedRiftSeam(e,f,active){
 const angle=Math.atan2(f.b.y-f.a.y,f.b.x-f.a.x),length=Math.hypot(f.b.x-f.a.x,f.b.y-f.a.y),count=Math.min(14,Math.max(2,Math.ceil(length/35)));
 ctx.save();traceAbilityFootprint(f);ctx.clip();themedLine(f.a,f.b,13,'#101221');themedLine(f.a,f.b,5,active?'#e1cef2':'#907bad');
 for(let i=0;i<count;i++){const u=(i+.5)/count,x=f.a.x+(f.b.x-f.a.x)*u,y=f.a.y+(f.b.y-f.a.y)*u;themedSprite('rift',e.kind,x,y,38,angle+Math.PI/2,active?1:.55,true);}
 ctx.restore();
}
