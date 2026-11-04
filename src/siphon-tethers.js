/* The two channels share a light drain; their yellow counter cues differ. */
const SIPHON_TETHER={seconds:4,grace:.8,drain:.02,healPerTick:.002,healCap:.02,awayDistance:24,cutRadius:28};
function canBeginSiphonCast(){return !(game.themedEvents||[]).some(e=>!e.done)&&!(game.hazards||[]).some(h=>h.wave||h.type==='expanded'&&!h.lingering)&&!(game.bossBursts||[]).length;}
function setupSiphonTether(owner,cast){
 const p=game.player,variant=((owner.siphonSerial||0)+(owner.bossIndex||0))%2?'knot':'escape',arena=expandedArena();let cut=null;
 if(variant==='knot')for(const [dx,dy]of [[80,70],[-80,70],[80,-70],[-80,-70],[0,120],[0,-120]]){const q=themedPoint(arena,p.x+dx,p.y+dy,24,true);if(q&&Math.hypot(q.x-p.x,q.y-p.y)>=75){cut=q;break;}}
 if(variant==='knot'&&!cut)return false;
 const travel=cut?Math.hypot(cut.x-p.x,cut.y-p.y)/175:0;cast.total=cast.windup=Math.max(SIPHON_TETHER.seconds,p.dashCooldown+.65,travel+1.5);cast.shapes=[];
 cast.siphon={variant,cut,age:0,healed:0,dashSerial:p.dashSerial,dashStart:Math.hypot(p.x-owner.x,p.y-owner.y)};cast.label=variant==='knot'?'Knotted Siphon':'Hungry Siphon';cast.hint='';owner.siphonSerial=(owner.siphonSerial||0)+1;codexDiscover('siphon_tethers');return true;
}
function finishSiphonTether(owner,cast,solved){
 if(cast.resolved)return;
 cast.siphon.solved=solved;owner.cast=null;resolveBossCast(owner,cast);owner.castCooldown=owner.boss?2.5:3.1;
 if(solved){refundCounterDash();const q=cast.siphon.cut||game.player;burst(q.x,q.y,14,combatTheme('safe').color);}
}
function tickSiphonTether(owner,cast,dt,playerFrom,dashing){
 const s=cast.siphon,p=game.player,from={x:playerFrom.x,y:playerFrom.y-13},fraction=dt>0?Math.min(1,cast.windup/dt):1,to={x:from.x+(p.x-from.x)*fraction,y:from.y+(p.y-from.y)*fraction};s.age=Math.min(cast.total,s.age+dt);cast.windup=Math.max(0,cast.windup-dt);
 if(dashing){
  if(s.variant==='knot'&&segmentDistance(s.cut.x,s.cut.y,from.x,from.y,to.x,to.y)<=SIPHON_TETHER.cutRadius){finishSiphonTether(owner,cast,true);return;}
  if(s.variant==='escape'){
   if(s.dashSerial!==p.dashSerial){s.dashSerial=p.dashSerial;s.dashStart=Math.hypot(from.x-owner.x,from.y-owner.y);}
   if(Math.hypot(to.x-owner.x,to.y-owner.y)-s.dashStart>=SIPHON_TETHER.awayDistance){finishSiphonTether(owner,cast,true);return;}
  }
 }
 if(s.age>=SIPHON_TETHER.grace){const before=p.hp;tickCombatDot(cast,'siphon',()=>true,SIPHON_TETHER.drain);if(game.status!=='running')return;if(p.hp<before){const healed=Math.max(0,Math.min(owner.maxHp-owner.hp,owner.maxHp*SIPHON_TETHER.healPerTick,owner.maxHp*SIPHON_TETHER.healCap-s.healed));owner.hp+=healed;s.healed+=healed;}}
 if(cast.windup<=0)finishSiphonTether(owner,cast,false);
}
