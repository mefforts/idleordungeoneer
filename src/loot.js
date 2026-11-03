/* Actual reward receipts replace XP diamonds; skilling remains the supply source. */
const MONSTER_LOOT={normal:{chance:.015,amount:1,cap:.06},elite:{chance:.08,amount:3,cap:.16},boss:{chance:.18,amount:6,cap:.28},voucher:.06,finalVoucher:.15};
const lootImages=new Map();
function normalizeMonsterLoot(){
 const vouchers=data.upgradeVouchers||{};data.upgradeVouchers=Object.fromEntries(['iron','steel'].map(tier=>[tier,Math.max(0,Math.min(100000,Math.floor(Number(vouchers[tier])||0)))]));
 data.voucherRolls=Object.fromEntries(Object.entries(data.voucherRolls||{}).filter(([key,value])=>/^\d+:[012]$/.test(key)&&value===true));
 if(data.lootPresentationVersion!==1){
  // Bank old ground XP once so no saved progression is discarded.
  data.dungeoneeringXp=(Number(data.dungeoneeringXp)||0)+Object.values(data.xpCaches||{}).flat().reduce((sum,g)=>sum+(Number(g.value)||0),0);data.xpCaches={};data.lootPresentationVersion=1;
 }
 data.lootHistory=(Array.isArray(data.lootHistory)?data.lootHistory:[]).filter(r=>r&&typeof r.name==='string'&&Number.isFinite(r.amount)&&r.amount>0).slice(-40);
}
function monsterMaterialChance(enemy){
 const rule=MONSTER_LOOT[enemy.boss?'boss':enemy.elite?'elite':'normal'];
 return Math.min(rule.cap,rule.chance*(1+.25*masteryFor().adaptation+.5*eliteBoonSum('resourceLuck'))*(1+trinketBonus('xp'))+trinketBonus('find')*.1);
}
function monsterMaterialDrops(enemy){
 if(enemy.summoned||enemy.totem)return [];const drops=[],rule=MONSTER_LOOT[enemy.boss?'boss':enemy.elite?'elite':'normal'];
 if(Math.random()<monsterMaterialChance(enemy)){
  const pool=zoneNumber()===0?['ore','logs','cloth','scraps']:['ore','coal','willowLogs','ancientSalvage','cloth'],key=pool[Math.floor(Math.random()*pool.length)],amount=rule.amount;
  data[key]=(data[key]||0)+amount;codexDiscover('resource_'+key);drops.push({key,amount});
 }
 const rollKey=data.floor+':'+enemy.bossIndex;
 if(enemy.boss&&data.floor>data.cleared&&!data.voucherRolls[rollKey]){
  data.voucherRolls[rollKey]=true;
  if(Math.random()<(enemy.bossIndex===2&&isZoneFinal()?MONSTER_LOOT.finalVoucher:MONSTER_LOOT.voucher)){
   const tier=zoneNumber()===0?'iron':'steel';data.upgradeVouchers[tier]++;drops.push({key:'voucher_'+tier,amount:1});codexDiscover('upgrade_vouchers');
   toast((tier==='iron'?'Iron':'Steel')+' upgrade voucher','Redeem in Skills → Equipment for one weapon refinement.');
  }
 }
 return drops;
}
function lootDetails(key){
 if(key==='sigils')return {name:'Dungeon Sigils',art:zoneCurrency().art};
 if(key.startsWith('voucher_'))return {name:(key.endsWith('iron')?'Iron':'Steel')+' upgrade voucher',art:'codex-upgrade_vouchers',voucher:true};
 if(key.startsWith('loot_'))return {name:['Verdant Seeds','Ember Cores','Grave Dust','Rift Shards'][Number(key.slice(5))],art:'codex-loot_'+key.slice(5)};
 return {name:RESOURCE_LABEL[key]||key,art:RESOURCE_ART[key]||'coins'};
}
function recordMonsterLoot(enemy,rewards){
 const combined=new Map();for(const r of rewards)if(r.amount>0)combined.set(r.key,(combined.get(r.key)||0)+r.amount);
 if(!combined.size)return;const items=[...combined].map(([key,amount])=>({key,amount,...lootDetails(key)}));
 const drop={x:enemy.x,y:enemy.y+enemy.rad*.65,age:0,items};(game.lootDrops||(game.lootDrops=[])).push(drop);if(game.lootDrops.length>128)game.lootDrops.shift();
 for(const item of items)data.lootHistory.push({name:item.name,amount:item.amount,zone:zoneNumber()+1});data.lootHistory=data.lootHistory.slice(-40);
}
function tickLootReceipts(dt){if(game.menuPaused||game.scene!=='combat'||!$('overlay').classList.contains('hidden'))return;game.lootDrops=(game.lootDrops||[]).filter(drop=>(drop.age+=dt)<5.5);}
function paintLootReceipts(){
 for(const drop of game.lootDrops||[]){
  const fade=drop.age<4.5?1:Math.max(0,5.5-drop.age),rise=reducedMotion()?0:Math.min(18,drop.age*10);ctx.save();ctx.globalAlpha=fade;
  drop.items.forEach((item,i)=>{
   const centerX=clamp(drop.x,game.camX-game.viewWidth/2+90,game.camX+game.viewWidth/2-90),centerY=clamp(drop.y,game.camY-game.viewHeight/2+200,game.camY+game.viewHeight/2-90),x=centerX+(i%2-.5)*91,y=centerY-24-Math.floor(i/2)*27-rise;let image=lootImages.get(item.art);if(!image){image=new Image();image.src=iconAsset(item.art);lootImages.set(item.art,image);}
   ctx.fillStyle=item.voucher?'#4b3b20ed':'#15282be8';ctx.strokeStyle=item.voucher?'#f3d38e':'#b1c6ab8c';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-41,y-13,85,25,5);ctx.fill();ctx.stroke();
   if(image.complete&&image.naturalWidth)ctx.drawImage(image,x-38,y-11,22,22);
   const name={gold:'Gold',sigils:'Sigil',essence:'Ess.',ore:'Ore',coal:'Coal',logs:'Oak',cloth:'Cloth',scraps:'Frag.',willowLogs:'Willow',ancientSalvage:'Salvage',loot_0:'Seeds',loot_1:'Cores',loot_2:'Dust',loot_3:'Shards'}[item.key]||'VOUCHER';
   ctx.font='700 '+(item.voucher?8:10)+'px system-ui';ctx.textAlign='left';ctx.fillStyle=item.voucher?'#ffe2a5':'#f6ead1';ctx.fillText('+'+uiCompact(item.amount)+' '+name,x-12,y+4);
  });ctx.restore();
 }
}
function voucherTier(style){return styleTier(style)===2?'steel':'iron';}
function canRedeemVoucher(style){return !!STYLE_DEFS[style]&&data.unlockedWeapons.some(id=>styleForWeapon(id)===style)&&data.styles[style].weapon<styleUpgradeCap(style,'weapon')&&(data.upgradeVouchers[voucherTier(style)]||0)>0;}
function redeemUpgradeVoucher(style){
 if(!canRedeemVoucher(style))return false;const tier=voucherTier(style);data.upgradeVouchers[tier]--;data.styles[style].weapon++;equipmentWorkXp(style,'weapon');data.firstWeaponCrafted=true;projectCombatStyle();announceWeaponUpgradeTip();
 toast('Voucher redeemed',STYLE_DEFS[style].name+' refinement '+data.styles[style].weapon+' · no materials or gold spent.');save();refreshUI();renderDisciplineDrawer();return true;
}
function voucherButtonHtml(style){const tier=voucherTier(style),count=data.upgradeVouchers?.[tier]||0;return count?'<button type="button" class="voucher-redeem" data-redeem-voucher="'+style+'" data-focus-key="voucher-'+style+'" '+(canRedeemVoucher(style)?'':'disabled')+'>Use '+(tier==='iron'?'Iron':'Steel')+' voucher · '+count+' owned</button>':'';}
function lootHistoryHtml(){const entries=[...(data.lootHistory||[])].reverse();return entries.length?'<details class="loot-history"><summary>Recent monster loot</summary><ol>'+entries.map(r=>'<li><b>+'+uiCompact(r.amount)+'</b> '+escapeHTML(r.name)+'<small>Zone '+r.zone+'</small></li>').join('')+'</ol></details>':'';}
