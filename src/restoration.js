/* Mastery milestones and small, physical healing drops. */
const RESTORATION={chance:.02,ordinary:.03,elite:.12,eliteChance:.55,rare:.12,rareChance:.55};
let restorationInstalled=false,healthDropImage=null;
function normalizeMasteryMilestones(){
 if(data.masteryRewardVersion!==1){data.earlyMasteryClaimed=!!data.earlyMasteryClaimed||data.cleared>=1;data.masteryRewardVersion=1;}
 data.earlyMasteryClaimed=!!data.earlyMasteryClaimed;
}
function guardianMasteryReward(enemy){return 0;}

function installRestorationUI(){
 if(restorationInstalled)return;restorationInstalled=true;healthDropImage=new Image();healthDropImage.decoding='async';healthDropImage.src=iconAsset('health-drop');
 if(!CODEX_ITEMS.some(entry=>entry.id==='health_pickup'))CODEX_ITEMS.push({id:'health_pickup',cat:'Guide',name:'Healing motes',desc:'Walk over a heart mote to recover health.'});
}
function dropHealth(enemy){
 if(enemy.boss||enemy.summoned||Math.random()>=(enemy.elite?RESTORATION.eliteChance:RESTORATION.chance))return null;
 const mote={x:enemy.x,y:enemy.y,fraction:enemy.elite?RESTORATION.elite:RESTORATION.ordinary,elite:!!enemy.elite};
 (game.healthDrops||(game.healthDrops=[])).push(mote);codexDiscover('health_pickup');return mote;
}
function tickHealthDrops(dt=0){
 const p=game.player;if(p.hp>=p.maxHp)return;
 const drops=game.healthDrops||[];
 for(let index=drops.length-1;index>=0;index--){const mote=drops[index],distance=Math.hypot(mote.x-p.x,mote.y-p.y);if(distance<70&&distance>1){const move=Math.min(distance,95*dt);mote.x+=(p.x-mote.x)/distance*move;mote.y+=(p.y-mote.y)/distance*move;}if(Math.hypot(mote.x-p.x,mote.y-p.y)>23)continue;
  const amount=Math.min(p.maxHp-p.hp,Math.max(1,p.maxHp*mote.fraction));if(amount<=0)break;
  p.hp+=amount;drops.splice(index,1);floater(p.x,p.y-39,'+'+Number(amount.toFixed(1))+' HP','#bde6a4');
  if(p.hp>=p.maxHp)break;
 }
}
function paintHealthDrops(){
 for(const mote of game.healthDrops||[]){const size=mote.elite?22:17,hover=reducedMotion()?0:Math.sin(game.frame*2.8+mote.x*.02)*1.4;
  glow(mote.x,mote.y-3,size*.85,'#eabe8220');disc(mote.x,mote.y+5,size*.28,'#18201865');
  if(healthDropImage?.complete&&healthDropImage.naturalWidth)ctx.drawImage(healthDropImage,mote.x-size/2,mote.y-size/2-3+hover,size,size);
 }
}
function healthCodexHtml(){return codexParagraph('Walk over a heart mote while hurt to recover health. Motes remain on the floor when you are at full health.')+codexRuleList([['Ordinary monsters','2% chance · restores 3% of maximum health'],['Elite echoes','55% chance · restores 12% of maximum health'],['Rare creatures','70% chance · restores 15% of maximum health'],['Timing','No expiry during the floor; menus and skilling keep them'],['Collection','Nearby motes draw toward you; healing stops at full health']])+codexParagraph('Unused motes stay through waves on the same floor. Starting or retrying a floor clears them.');}
