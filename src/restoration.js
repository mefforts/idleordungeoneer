/* Mastery milestones and small, physical healing drops. */
const RESTORATION={chance:.02,ordinary:.03,elite:.12,eliteChance:.5,rare:.12,rareChance:.5,lifetime:12,fadeSeconds:3};
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
 const mote={x:enemy.x,y:enemy.y,fraction:enemy.elite?RESTORATION.elite:RESTORATION.ordinary,elite:!!enemy.elite,age:0};
 (game.healthDrops||(game.healthDrops=[])).push(mote);codexDiscover('health_pickup');return mote;
}
function tickHealthDrops(dt=0){
 const p=game.player,drops=game.healthDrops||[];
 for(let index=drops.length-1;index>=0;index--){const mote=drops[index];mote.age=(mote.age||0)+dt;if(mote.age+1e-9>=RESTORATION.lifetime)drops.splice(index,1);}
 if(p.hp>=p.maxHp)return;
 for(let index=drops.length-1;index>=0;index--){const mote=drops[index],distance=Math.hypot(mote.x-p.x,mote.y-p.y);if(distance<70&&distance>1){const move=Math.min(distance,95*dt);mote.x+=(p.x-mote.x)/distance*move;mote.y+=(p.y-mote.y)/distance*move;}if(Math.hypot(mote.x-p.x,mote.y-p.y)>23)continue;
  const amount=Math.min(p.maxHp-p.hp,Math.max(1,p.maxHp*mote.fraction));if(amount<=0)break;
  p.hp+=amount;drops.splice(index,1);floater(p.x,p.y-39,'+'+Number(amount.toFixed(1))+' HP','#bde6a4');
  if(p.hp>=p.maxHp)break;
 }
}
function paintHealthDrops(){
 for(const mote of game.healthDrops||[]){const size=mote.elite?22:17,hover=reducedMotion()?0:Math.sin(game.frame*2.8+mote.x*.02)*1.4;
  ctx.save();ctx.globalAlpha*=clamp((RESTORATION.lifetime-(mote.age||0))/RESTORATION.fadeSeconds,0,1);
  glow(mote.x,mote.y-3,size*.85,'#eabe8220');disc(mote.x,mote.y+5,size*.28,'#18201865');
  if(healthDropImage?.complete&&healthDropImage.naturalWidth)ctx.drawImage(healthDropImage,mote.x-size/2,mote.y-size/2-3+hover,size,size);
  ctx.restore();
 }
}
function healthCodexHtml(){return codexParagraph('Walk over a heart mote while hurt to recover health before it fades. Its lifetime continues at full health.')+codexRuleList([['Ordinary monsters',Math.round(RESTORATION.chance*100)+'% chance · restores '+Math.round(RESTORATION.ordinary*100)+'% of maximum health'],['Elites',Math.round(RESTORATION.eliteChance*100)+'% chance · restores '+Math.round(RESTORATION.elite*100)+'% of maximum health'],['Rare creatures',Math.round(RESTORATION.rareChance*100)+'% chance · restores '+Math.round(RESTORATION.rare*100)+'% of maximum health'],['Timing',RESTORATION.lifetime+' combat seconds · fades during the last '+RESTORATION.fadeSeconds+' · pauses with combat'],['Collection','Nearby motes draw toward you while hurt; healing stops at full health']])+codexParagraph('New waves do not refresh a mote. Starting, retrying or reloading clears health motes. Gold, materials and other loot keep their persistent ground-loot rules.');}
