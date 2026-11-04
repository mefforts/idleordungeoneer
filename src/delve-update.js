/* Delve preparation, readable blessing stacks and regional incoming damage. */
const ZONE_TWO_DAMAGE=1.25;
function incomingDamageScale(){return zoneNumber()>=2?ZONE_THREE_DAMAGE:zoneNumber()===1?ZONE_TWO_DAMAGE:1;}
function hurt(amount,options={}){
 const p=game.player;const dashProtected=p.dashTime>0||p.dashCooldown>2.85&&p.invuln>0;if(game.status!=='running'||p.invuln>0&&(!options.dot||dashProtected))return;
 const damage=amount*incomingDamageScale()*(1-styleStats().guardPercent/100)*(1-trinketBonus('guard'))*(1-.02*waveRank('ward'))*(data.weaponType==='shield'?.72:1)*eliteBoonValue('protection');
 p.hp-=damage;if(!options.dot){p.hitPose=.26;p.invuln=.47;game.shake=6;floater(p.x,p.y-31,'-'+Math.ceil(damage),'#ffb5a5');burst(p.x,p.y,5,'#fa8b87');}else{p.dotDamage=(p.dotDamage||0)+damage;if(game.frame>=(p.dotDisplayAt||0)){floater(p.x,p.y-31,'-'+Math.ceil(p.dotDamage),'#ffc184');p.dotDamage=0;p.dotDisplayAt=game.frame+.6;burst(p.x,p.y,2,'#e79762');}}if(p.hp<=0){p.hp=0;die();}
}
function dash(){
 const p=game.player;if(game.status!=='running'||p.dashCooldown>0)return;let x=p.vx,y=p.vy;if(!x&&!y){x=1;y=0;}
 p.dashSerial=(p.dashSerial||0)+1;p.dashTime=.22;p.dashCooldown=3.2;p.invuln=Math.max(p.invuln,.35);p.dashDX=x;p.dashDY=y;burst(p.x,p.y,12,'#a6dfbf');
}
function skillAfterDefeat(){
 if(game.status!=='dead')return false;hideOverlay(true);game.manualPaused=game.menuPaused=true;
 const key=SKILLS[data.lastSkill]&&canUseSkill(data.lastSkill)?data.lastSkill:'mine';setScene(key,false);openWorkshop(disciplineFor(key),SKILLS[key].cost?'refine':'gather');return true;
}
function blessingStackEffect(id,count){
 const b=ELITE_BOONS[id];if(!b||!count)return '';const percent=value=>Number(((value-1)*100).toFixed(1)),effects=[];
 for(const [key,label]of [['damage','hit damage'],['attackSpeed','attack speed'],['movement','movement'],['eliteDamage','elite/guardian damage'],['range','reach']])if(b[key])effects.push('+'+percent(b[key]**count)+'% '+label);
 if(b.enemyMovement)effects.push(Number((b.enemyMovement**count*100).toFixed(1))+'% enemy movement');
 if(b.goldPerKill)effects.push('+'+b.goldPerKill*count+' gold per kill');
 if(b.resourceLuck)effects.push('+'+b.resourceLuck*count*50+'% material chance · caps apply');
 if(b.chainChance)effects.push(Number((Math.min(.85,b.chainChance*count)*100).toFixed(1))+'% chain chance');
 if(b.disableTotems)effects.push('Totems disabled while any stack remains');return effects.join(' · ');
}
