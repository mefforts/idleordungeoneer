/* Damage follows the lower body; movement and beneficial interactions use the ground anchor. */
const PLAYER_HURTBOX=Object.freeze({radius:12,top:-42,bottom:15});
function playerHurtbox(at=game.player){return {x:at.x,top:at.y+PLAYER_HURTBOX.top+PLAYER_HURTBOX.radius,bottom:at.y+PLAYER_HURTBOX.bottom-PLAYER_HURTBOX.radius,r:PLAYER_HURTBOX.radius};}
function playerCircleContains(x,y,r,at=game.player){const b=playerHurtbox(at);return segmentDistance(x,y,b.x,b.top,b.x,b.bottom)<r+b.r;}
function playerSegmentContains(a,z,width=0,at=game.player){const b=playerHurtbox(at);return segmentsDistance(a.x,a.y,z.x,z.y,b.x,b.top,b.x,b.bottom)<width+b.r;}
function playerProjectileContains(a,z,r,from=game.player,to=game.player){return playerSegmentContains({x:a.x-from.x,y:a.y-from.y},{x:z.x-to.x,y:z.y-to.y},r,{x:0,y:0});}
function playerRectContains(rect,at=game.player){const b=playerHurtbox(at),dx=Math.max(rect.left-b.x,0,b.x-rect.right),dy=Math.max(rect.top-b.bottom,0,b.top-rect.bottom);return rect.left<=rect.right&&rect.top<=rect.bottom&&dx*dx+dy*dy<b.r*b.r;}
function playerRadialRange(origin,at=game.player){const b=playerHurtbox(at);return {min:Math.max(0,segmentDistance(origin.x,origin.y,b.x,b.top,b.x,b.bottom)-b.r),max:Math.max(Math.hypot(b.x-origin.x,b.top-origin.y),Math.hypot(b.x-origin.x,b.bottom-origin.y))+b.r};}
function hitboxAngleContains(angle,center,half){return Math.abs(Math.atan2(Math.sin(angle-center),Math.cos(angle-center)))<=half+1e-9;}
function playerArcDistance(origin,r,angle,half,at=game.player){
 const b=playerHurtbox(at),ends=[angle-half,angle+half].map(a=>({x:origin.x+Math.cos(a)*r,y:origin.y+Math.sin(a)*r}));
 let distance=Math.min(...ends.map(q=>segmentDistance(q.x,q.y,b.x,b.top,b.x,b.bottom)));
 for(const y of [b.top,b.bottom]){const dx=b.x-origin.x,dy=y-origin.y;if(hitboxAngleContains(Math.atan2(dy,dx),angle,half))distance=Math.min(distance,Math.abs(Math.hypot(dx,dy)-r));}
 if(origin.y>=b.top&&origin.y<=b.bottom)for(const a of [0,Math.PI])if(hitboxAngleContains(a,angle,half))distance=Math.min(distance,Math.abs(b.x-origin.x-Math.cos(a)*r));
 const dx=b.x-origin.x;if(Math.abs(dx)<=r)for(const sign of [-1,1]){const dy=Math.sqrt(Math.max(0,r*r-dx*dx))*sign,y=origin.y+dy;if(y>=b.top&&y<=b.bottom&&hitboxAngleContains(Math.atan2(dy,dx),angle,half))return 0;}
 return distance;
}
function playerSectorContains(origin,inner,outer,angle,half,at=game.player){
 const b=playerHurtbox(at);inner=Math.max(0,inner);
 for(const y of [b.top,b.bottom]){const dx=b.x-origin.x,dy=y-origin.y,d=Math.hypot(dx,dy);if(d>=inner&&d<=outer&&hitboxAngleContains(Math.atan2(dy,dx),angle,half))return true;}
 if(playerArcDistance(origin,outer,angle,half,at)<b.r||inner>0&&playerArcDistance(origin,inner,angle,half,at)<b.r)return true;
 return half<Math.PI&&[angle-half,angle+half].some(a=>playerSegmentContains({x:origin.x+Math.cos(a)*inner,y:origin.y+Math.sin(a)*inner},{x:origin.x+Math.cos(a)*outer,y:origin.y+Math.sin(a)*outer},0,at));
}
function playerTriangleContains(points,at=game.player){
 const b=playerHurtbox(at),inside=q=>{const signs=points.map((p,i)=>{const z=points[(i+1)%3];return (z.x-p.x)*(q.y-p.y)-(z.y-p.y)*(q.x-p.x);});return !(signs.some(n=>n<0)&&signs.some(n=>n>0));};
 return inside({x:b.x,y:b.top})||inside({x:b.x,y:b.bottom})||points.some((p,i)=>playerSegmentContains(p,points[(i+1)%3],0,at));
}
function playerShapeContains(f,at=game.player){
 if(f.groundRefuge){const q=f.groundRefuge,d=Math.hypot(at.x-q.x,at.y-q.y);if(d>=q.inner&&d<=q.r)return false;}
 if(f.shape==='circle')return playerCircleContains(f.x,f.y,f.r,at);
 if(f.shape==='segment')return playerSegmentContains(f.a,f.b,f.width/2,at);
 if(f.shape==='rect')return playerRectContains(f.rect,at);
 if(f.shape==='quarters')return !insideRect(at,f.safe,-9)&&playerRectContains(f.rect,at);
 if(f.shape==='cone')return playerSectorContains(f.origin,0,f.reach,f.angle,f.halfAngle,at);
 if(f.shape==='ring'){if(f.refuge&&Math.hypot(at.x-f.x,at.y-f.y)<=f.inner-9)return false;const d=playerRadialRange(f,at);return d.min<f.r&&d.max>f.inner;}
 if(f.shape==='arc'){const a=Math.atan2(at.y-f.y,at.x-f.x);if(f.r>=20&&hitboxAngleContains(a,f.gap,f.gapHalf))return false;return playerSectorContains(f,Math.max(0,f.r-f.width/2),f.r+f.width/2,f.gap+Math.PI,f.r<20?Math.PI:Math.PI-f.gapHalf,at);}
 if(f.shape==='gate')return playerMovingGateContains(at,at,f,f);
 if(f.shape==='flood')return !f.refuges.some(q=>Math.hypot(at.x-q.x,at.y-q.y)<=f.r-9)&&playerRectContains(f.arena,at);
 if(f.shape==='triangle')return playerTriangleContains(f.points,at);
 return false;
}
function hitboxSegmentRect(a,b,r,rect){
 if(rect.left>rect.right||rect.top>rect.bottom)return false;
 if(insideRect(a,rect)||insideRect(b,rect))return true;
 const points=[{x:rect.left,y:rect.top},{x:rect.right,y:rect.top},{x:rect.right,y:rect.bottom},{x:rect.left,y:rect.bottom}];
 return points.some((q,i)=>{const z=points[(i+1)%4];return segmentsDistance(a.x,a.y,b.x,b.y,q.x,q.y,z.x,z.y)<r;});
}
function playerMovingGateContains(at,from,old,f){
 const horizontal=f.horizontal,gap=f.gapWidth/2,across=q=>horizontal?q.x:q.y,normal=q=>horizontal?q.y:q.x,lo=f.infinite?-1e7:horizontal?f.arena.left:f.arena.top,hi=f.infinite?1e7:horizontal?f.arena.right:f.arena.bottom;
 const a=horizontal?{x:from.x,y:normal(from)-old.at}:{x:normal(from)-old.at,y:from.y},b=horizontal?{x:at.x,y:normal(at)-f.at}:{x:normal(at)-f.at,y:at.y};
 for(const side of [-1,1]){
  // The ground anchor keeps the original nine-unit clearance inside teal openings.
  const u=(across(from)-f.gap)*side-(gap-9),v=(across(at)-f.gap)*side-(gap-9);if(u<=0&&v<=0)continue;
  let start=0,end=1;if(u<=0)start=-u/(v-u);else if(v<=0)end=-u/(v-u);
  const low=side<0?lo:f.gap+gap,high=side<0?f.gap-gap:hi;
  const rect=horizontal?{left:low,right:high,top:-f.width/2,bottom:f.width/2}:{left:-f.width/2,right:f.width/2,top:low,bottom:high};
  rect.top-=PLAYER_HURTBOX.bottom-PLAYER_HURTBOX.radius;rect.bottom-=PLAYER_HURTBOX.top+PLAYER_HURTBOX.radius;
  const point=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});if(hitboxSegmentRect(point(start),point(end),PLAYER_HURTBOX.radius,rect))return true;
 }
 return false;
}
function playerExpandingWaveContains(h,previous,from,to=game.player){
 const body=playerHurtbox({x:0,y:0}),dx=to.x-from.x,dy=to.y-from.y,growth=h.r-previous.r,travel=Math.hypot(dx,dy),times=[0,1];
 if(Math.abs(dy)>1e-9)for(const y of [body.top,body.bottom])times.push(clamp((h.y-from.y-y)/dy,0,1));
 if(Math.abs(dx)>1e-9)times.push(clamp((h.x-from.x)/dx,0,1));
 if(travel>growth+1e-9)for(const offset of [body.top,body.bottom]){const x=from.x-h.x,y=from.y+offset-h.y,along=(x*dx+y*dy)/travel,across=Math.sqrt(Math.max(0,x*x+y*y-along*along));times.push(clamp((growth*across/Math.sqrt(travel*travel-growth*growth)-along)/travel,0,1));}
 const range=u=>{const at={x:from.x+dx*u,y:from.y+dy*u},b=playerHurtbox(at);return {near:segmentDistance(h.x,h.y,b.x,b.top,b.x,b.bottom)-growth*u,far:Math.max(Math.hypot(b.x-h.x,b.top-h.y),Math.hypot(b.x-h.x,b.bottom-h.y))-growth*u};};
 return Math.min(...times.map(u=>range(u).near))<previous.r+body.r&&Math.max(range(0).far,range(1).far)>previous.inner-body.r;
}
