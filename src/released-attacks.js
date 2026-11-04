/* Released threats belong to the encounter; killing a caster stops its next cast. */
const CASTER_BOUND_MECHANICS=new Set(['briarLeash','rallyThread','orbitTransfer','graftedSwap','turningBulwark']);
function encounterSourceActive(owner){return !!owner&&(owner.defeated||owner.hp>0&&game.enemies.includes(owner));}
function independentThemedMechanic(event){return !CASTER_BOUND_MECHANICS.has(event.type);}
function supportTotemRecipient(t){
 const living=e=>e&&e.hp>0&&!e.defeated&&game.enemies.includes(e);
 if(living(t.owner))return t.owner;
 const candidates=game.enemies.filter(living);candidates.sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y));return candidates[0]||null;
}
function remainingReleasedThreats(){
 return (game.releasedWards||[]).some(w=>!w.cast.resolved)||(game.hostileShots||[]).some(s=>s.life>0)||(game.hazards||[]).some(h=>h.wave||h.life>0)||(game.bossBursts||[]).length>0||(game.themedEvents||[]).some(e=>!e.done&&(e.persistent||e.age<e.total))||(game.graveEchoes||[]).some(e=>e.life>0);
}
function tickReleasedWards(dt,from){game.releasedWards=(game.releasedWards||[]).filter(w=>{tickReflectWard(w.owner,w.cast,dt,from);return !w.cast.resolved&&game.status==='running';});}
function paintReleasedWards(){for(const w of game.releasedWards||[])paintReflectWard(w.cast.point,clamp(1-w.cast.windup/w.cast.total,0,1),w.owner.biome);}
