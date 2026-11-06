/* Only an accepted mechanic counter refunds a dash; body stuns do not. */
const DASH_COUNTERS={stun:.65,guard:.35};
function currentCounterDash(){
 const p=game.player,sweep=game.dashSweep;
 return p.dashTime>0?p.dashSerial||0:sweep?.active&&sweep.frame===game.frame?sweep.serial:null;
}
function refundCounterDash(){
 const p=game.player,serial=currentCounterDash();if(serial===null||game.status!=='running'||p.refundedDashSerial===serial)return false;
 p.refundedDashSerial=serial;p.dashCooldown=0;counterRecovery();burst(p.x,p.y-12,9,combatTheme('safe').color);p.refundFlashUntil=game.frame+.5;return true;
}
function tickDashStuns(from,dashing){
 if(!dashing)return;const p=game.player,serial=p.dashSerial||0;
 for(const enemy of [...game.enemies]){
  if(!resolveEnemy(enemy)||enemy.stunnedByDash===serial)continue;
  const body=enemyBody(enemy);if(segmentsDistance(from.x,from.y-13,p.x,p.y,body.x,body.top,body.x,body.bottom)>body.r+9)continue;
  enemy.stunnedByDash=serial;enemy.stagger=Math.max(enemy.stagger||0,DASH_COUNTERS.stun);
  enemy.resolveDisabledUntil=Math.max(enemy.resolveDisabledUntil||0,game.frame+ENEMY_RESOLVE.dashLockout);
  if(enemy.eliteTask)interruptEliteTask(enemy,'dash');
  if(enemy.charge){enemy.charge=null;refundCounterDash();}
  if(['charge','eruptionTrail'].includes(enemy.cast?.type)){enemy.cast=null;enemy.castCooldown=mechanicRecovery(enemy);refundCounterDash();}
  if(enemy.cast?.siphon)finishSiphonTether(enemy,enemy.cast,true);
  burst(enemy.x,enemy.y-25,7,combatTheme('safe').color);
 }
}
