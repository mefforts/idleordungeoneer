// Review/test hooks are injected into isolated responses, never the game build.
function progressionUpdateFixture(){
 function fresh(zone=1){__journey.fresh(zone);data.idleNoticeSlots=2;data.skillsNudgeSeen=true;game.manualPaused=game.menuPaused=false;game.spawnTimer=1e9;tourIndex=-1;refreshUI();return state();}
 function state(){return {guide:progressionGuide(),essence:data.essence,points:masteryFor().points,cleared:data.cleared,seen:{mastery:!!data.firstMasteryTipSeen,enchant:!!data.essenceEnchantTipSeen},pool:data.zoneMaterials,banks:{...data.biomeLoot}};}
 function inputs(){return JSON.stringify([Object.fromEntries(Object.keys(RESOURCE_LABEL).map(k=>[k,data[k]||0])),data.stationCredits,data.stationSaved,data.biomeLoot]);}
 function richTraining(){for(const d of Object.values(DISCIPLINES))data[d.xp]=100000;}
 window.__progressionUpdate={fresh,state,
  paintWeave(c,rig){paintWorkshopWorkpiece({pose:'ward',key:'ward',working:true,theme:WORKSHOP_THEMES[0]},rig,c);},
  patch(patch){Object.assign(data,patch);refreshUI();return state();},
  firstFloor(){fresh();data.idleNoticeSlots=0;clearFloor();return {html:$('overlayCard').textContent,...state()};},
  continue(){startFloor();game.enemies=[];game.boss=null;game.attackTimer=game.spawnTimer=1e9;refreshUI();return state();},
  hidden(reason){if(reason==='boss')game.boss={};if(reason==='pause')game.manualPaused=true;if(reason==='hold')game.holdSkill='mine';refreshUI();},
  enchantAll(){for(const s of Object.values(data.styles))s.enchant=1;refreshUI();return state();},
  save(){save();},
  upgradeMatrix(){const rows=[];for(const tier of [1,2])for(const style of Object.keys(STYLE_DEFS))for(const kind of ['weapon','armor','speed','reach','enchant']){
   fresh(tier);data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.ownedArmor=[style+'_'+tier];data.equippedArmor=style+'_'+tier;data.styles[style].tier=tier;data.styles[style][kind]=tier===1?0:TIER_LIMITS[1][kind];projectCombatStyle();game.player.maxHp=maxHp()+waveVitality();game.player.hp=game.player.maxHp-15;const hp=game.player.hp;
   const bank=tier===1?'iron':'steel';data.specificVouchers[bank+'_'+kind]=1;const before=inputs(),rank=data.styles[style][kind],xp=data[DISCIPLINES[STYLE_DEFS[style].group].xp],result=redeemUpgradeVoucher(style,kind);
   rows.push({tier,style,kind,result,rank:data.styles[style][kind]-rank,left:data.specificVouchers[bank+'_'+kind],unchanged:before===inputs(),xp:data[DISCIPLINES[STYLE_DEFS[style].group].xp]-xp,heal:game.player.hp-hp});
  }return rows;},
  recipeMatrix(){const rows=[];const attempt=(action,tier)=>{const [type,id]=action.split(':'),kind=type==='station'?'station-'+id:type==='armor'?'armor':type==='tool'?'tool-'+id:type==='trinket'?'jewelry':'weapon';data.specificVouchers[tier+'_'+kind]=1;const before=inputs(),result=redeemWorkshopVoucher(action,tier);rows.push({action,tier,result,left:data.specificVouchers[tier+'_'+kind],unchanged:before===inputs()});};
   for(const id of Object.keys(WEAPON_TYPES).filter(w=>w!=='sword')){fresh();richTraining();attempt('weapon:'+id,'iron');}
   for(const a of Object.values(ARMOR_SETS)){fresh(a.tier);richTraining();attempt('armor:'+a.id,a.tier===1?'iron':'steel');}
   for(const id of Object.keys(TOOL_DEFS)){fresh();attempt('tool:'+id,'iron');}
   for(const id of Object.keys(TRINKETS)){fresh();attempt('trinket:'+id,'iron');}
   for(const group of Object.keys(DISCIPLINES))for(const tier of ['iron','steel'])for(let rank=0;rank<5;rank++){fresh();data.stationLevels[group]=rank;attempt('station:'+group,tier);}
   for(const style of Object.keys(STYLE_DEFS)){fresh(2);richTraining();data.unlockedWeapons.push(STYLE_DEFS[style].weapon);data.styles[style].weapon=10;attempt('promotion:'+style,'steel');}
   return rows;
  },
  blockedVouchers(){fresh();for(const tier of ['iron','steel'])for(const kind of voucherKinds(tier))data.specificVouchers[tier+'_'+kind]=30;const rows=[];const reject=(action,tier)=>{const before=JSON.stringify(data),result=redeemWorkshopVoucher(action,tier);rows.push({action,tier,result,unchanged:before===JSON.stringify(data)});};
   reject('weapon:greatsword','iron');reject('armor:melee_2','steel');reject('promotion:melee','steel');reject('upgrade:ranged:weapon','iron');reject('upgrade:melee:armor','iron');reject('upgrade:melee:weapon','steel');reject('tool:pickaxe','steel');reject('station:unknown','iron');reject('shop:fire','iron');reject('time:delve','iron');reject('upgrade:melee:unknown','iron');reject('upgrade:melee:weapon:extra','iron');
   data.styles.melee.weapon=10;reject('upgrade:melee:weapon','iron');data.stationLevels.warding=5;reject('station:warding','steel');data.tools.hatchet=true;reject('tool:hatchet','iron');reject('weapon:sword','iron');return rows;
  },
  armorTier(){fresh(2);data.ownedArmor=['melee_2'];data.styles.melee.armor=5;data.specificVouchers.steel_armor=1;return {tier:voucherTier('melee','armor'),result:redeemUpgradeVoucher('melee','armor'),rank:data.styles.melee.armor};},
  voucherView(group='blacksmithing',view='equipment'){fresh(2);richTraining();data.specificVouchers.iron_speed=data.specificVouchers['iron_station-blacksmithing']=data.specificVouchers['steel_station-blacksmithing']=3;data.ownedArmor=['melee_1'];openWorkshop(group,view);},
  materialChecks(){fresh();data.biomeLoot={0:2,1:1,2:1,3:1};const total=data.zoneMaterials,saved=JSON.parse(JSON.stringify(data));data.styles.melee.weapon=1;Object.assign(data,{bars:100,gold:1000});const cost=styleUpgradeCost('melee','weapon');const done=craftStyleUpgrade('melee','weapon');const banks={...data.biomeLoot};data.zoneMaterials-=3;const combined={...data.biomeLoot};data.biomeLoot={0:0,1:0,2:0,3:0};data.styles.melee.weapon=3;const before=inputs(),blocked=craftStyleUpgrade('melee','weapon');data.craftGoal='upgrade:melee:weapon';const plan=preparationPlan();return {total,saved,banks,combined,cost,done,blocked,unchanged:before===inputs(),plan:plan.steps,stationCosts:[0,1,2,3,4].map(r=>{data.stationLevels.warding=r;return stationUpgradeCost('warding').zoneMaterials||0;})};},
  wardGeometry(){
   const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);},cross=(a,b,c,d)=>{const orient=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return orient(a,b,c)*orient(a,b,d)<-1e-6&&orient(c,d,a)*orient(c,d,b)<-1e-6;};
   let samples=0,minGap=1e9,minWrist=1e9,maxLengthError=0,crossings=0;
   for(const pose of ['ward','cast'])for(const armor of ['',...Object.keys(ARMOR_SETS)])for(const facing of [-1,1])for(const reducedMotion of [false,true])for(const variant of [null,0,1])for(const blend of [0,.25,.5,.75,1])for(let i=0;i<60;i++){
    const r=DeepwellAvatar.poseRig({pose,time:1,working:true,workBlend:blend,workPhase:i/60,facing,reducedMotion,data:{...data,equippedArmor:armor},bonusReaction:variant===null?null:{variant,progress:i/60}});samples++;
    const arms=[r.frontArm,r.backArm];for(const a of arms)maxLengthError=Math.max(maxLengthError,Math.abs(Math.hypot(a.elbow.x-a.shoulder.x,a.elbow.y-a.shoulder.y)-20),Math.abs(Math.hypot(a.hand.x-a.elbow.x,a.hand.y-a.elbow.y)-19.5));
    minWrist=Math.min(minWrist,Math.hypot(r.main.x-r.back.x,r.main.y-r.back.y));for(const a of [[r.frontArm.shoulder,r.frontArm.elbow],[r.frontArm.elbow,r.main]])for(const b of [[r.backArm.shoulder,r.backArm.elbow],[r.backArm.elbow,r.back]])if(cross(...a,...b))crossings++;
    if(blend===1){minGap=Math.min(minGap,distance(r.back,r.frontArm.shoulder,r.frontArm.elbow),distance(r.back,r.frontArm.elbow,r.main));}
   }return {samples,minGap,minWrist,maxLengthError,crossings};
  }
 };
}
module.exports={progressionUpdateFixture};
