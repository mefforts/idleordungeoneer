/* Actual reward receipts replace XP diamonds; skilling remains the supply source. */
const MONSTER_LOOT=BALANCE_CONFIG.rewards.loot;
const lootImages=new Map();
function normalizeMonsterLoot(){
 normalizeSpecificVouchers();
 data.voucherRolls=Object.fromEntries(Object.entries(data.voucherRolls||{}).filter(([key,value])=>/^\d+:[012]$/.test(key)&&value===true));
 if(data.lootPresentationVersion!==1){
  // Bank old ground XP once so no saved progression is discarded.
  data.dungeoneeringXp=(Number(data.dungeoneeringXp)||0)+Object.values(data.xpCaches||{}).flat().reduce((sum,g)=>sum+(Number(g.value)||0),0);data.xpCaches={};data.lootPresentationVersion=1;
 }
 data.lootHistory=(Array.isArray(data.lootHistory)?data.lootHistory:[]).filter(r=>r&&typeof r.name==='string'&&Number.isFinite(r.amount)&&r.amount>0).slice(-40);
 normalizeGroundLoot();
}
function monsterMaterialChance(enemy){
 const rule=MONSTER_LOOT[enemy.boss?'boss':enemy.elite?'elite':'normal'];
 return Math.min(rule.cap,rule.chance*(1+.25*masteryFor().adaptation+.5*eliteBoonSum('resourceLuck'))*(1+trinketBonus('xp'))+trinketBonus('find')*.1);
}
function monsterMaterialDrops(enemy){
 if(enemy.summoned||enemy.totem)return [];const drops=[],rule=MONSTER_LOOT[enemy.boss?'boss':enemy.elite?'elite':'normal'];
 if(Math.random()<monsterMaterialChance(enemy)){
  const pool=zoneNumber()>=4?['ore','coal','cloth','mithrilOre','yewLogs','enchantedSalvage']:zoneNumber()===0?['ore','logs','cloth','scraps']:['ore','coal','willowLogs','ancientSalvage','cloth'],available=pool.filter(key=>!SKILLS[RESOURCE_SOURCE[key]]?.tier||canUseSkill(RESOURCE_SOURCE[key])),key=available[Math.floor(Math.random()*available.length)],amount=rule.amount;
  drops.push({key,amount});
 }
 const rollKey=data.floor+':'+enemy.bossIndex;
 if(enemy.boss&&data.floor>data.cleared&&!data.voucherRolls[rollKey]){
  data.voucherRolls[rollKey]=true;
  if(Math.random()<(enemy.bossIndex===2&&isZoneFinal()?MONSTER_LOOT.finalVoucher:MONSTER_LOOT.voucher)){
   const option=voucherDropOption();if(option)drops.push({key:'voucher_'+option.tier+'_'+option.kind,amount:1});
  }
 }
 return drops;
}
function lootDetails(key){
 if(key==='sigils')return {name:'Dungeon Sigils',art:zoneCurrency().art};
 if(key.startsWith('voucher_'))return {name:voucherLootName(key),art:'codex-upgrade_vouchers',voucher:true};
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
function lootReceiptName(item){
 if(item.voucher){const kind=item.key.split('_')[2]||'';return {weapon:'Refine',speed:'Atk speed',reach:'Reach',armor:'Armor',enchant:'Enchant',jewelry:'Jewelry'}[kind]||voucherKindName(kind).replace(/ refinement| upgrade/g,'').slice(0,10);}
 return {gold:'Gold',sigils:'Sigil',essence:'Ess.',ore:'Ore',coal:'Coal',logs:'Oak',cloth:'Cloth',scraps:'Frag.',willowLogs:'Willow',ancientSalvage:'Salvage',mithrilOre:'Mithril',yewLogs:'Yew',enchantedSalvage:'Ench. salv.',loot_0:'Seeds',loot_1:'Cores',loot_2:'Dust',loot_3:'Shards'}[item.key]||(RESOURCE_LABEL[item.key]||item.name||'Loot').slice(0,10);
}
function paintLootReceipts(){
 for(const drop of game.lootDrops||[]){
  const fade=drop.age<4.5?1:Math.max(0,5.5-drop.age),rise=reducedMotion()?0:Math.min(18,drop.age*10);ctx.save();ctx.globalAlpha=fade;
  drop.items.forEach((item,i)=>{
   const centerX=clamp(drop.x,game.camX-game.viewWidth/2+90,game.camX+game.viewWidth/2-90),centerY=clamp(drop.y,game.camY-game.viewHeight/2+200,game.camY+game.viewHeight/2-90),x=centerX+(i%2-.5)*91,y=centerY-24-Math.floor(i/2)*27-rise;let image=lootImages.get(item.art);if(!image){image=new Image();image.src=iconAsset(item.art);lootImages.set(item.art,image);}
   ctx.fillStyle=item.voucher?'#4b3b20ed':'#15282be8';ctx.strokeStyle=item.voucher?'#f3d38e':'#b1c6ab8c';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-41,y-13,85,25,5);ctx.fill();ctx.stroke();
   if(image.complete&&image.naturalWidth)ctx.drawImage(image,x-38,y-11,22,22);
   const name=lootReceiptName(item);
   ctx.font='700 '+(item.voucher?8:10)+'px system-ui';ctx.textAlign='left';ctx.fillStyle=item.voucher?'#ffe2a5':'#f6ead1';ctx.fillText('+'+uiCompact(item.amount)+' '+name,x-12,y+4);
  });ctx.restore();
 }
}
function voucherTier(style,kind='weapon'){return equipmentVoucherBank(kind==='armor'?ownedArmorTier(style):styleTier(style));}
function workshopVoucherOffer(action){
 const [type,id,kind,...extra]=String(action).split(':');if(extra.length)return null;
 const ownedStyle=style=>data.unlockedWeapons.some(w=>styleForWeapon(w)===style);
 if(type==='upgrade'&&STYLE_DEFS[id]&&['weapon','armor','enchant','speed','reach'].includes(kind))return {name:STYLE_DEFS[id].name+' '+voucherKindName(kind),kind,tiers:[voucherTier(id,kind)],eligible:data.styles[id][kind]<styleUpgradeCap(id,kind)&&(kind==='armor'?data.ownedArmor.some(k=>ARMOR_SETS[k]?.style===id):ownedStyle(id))};
 if(kind!==undefined)return null;
 if(type==='jewelry'&&TRINKETS[id])return {name:TRINKETS[id].name+' refinement',kind:'jewelry',tiers:['iron'],eligible:data.trinkets.includes(id)&&jewelryRank(id)<JEWELRY_REFINEMENT.maximum};
 if(type==='tool-upgrade'&&TOOL_DEFS[id])return {name:TOOL_DEFS[id].name+' refinement',kind:'tool-'+id,tiers:['iron'],eligible:!!data.tools[id]&&toolRank(id)<TOOL_REFINEMENT.maximum};
 if(type==='station'&&DISCIPLINES[id])return {name:DISCIPLINES[id].name+' station upgrade',kind:'station-'+id,tiers:equipmentTiers().map(equipmentVoucherBank),eligible:stationRank(id)<BALANCE_CONFIG.production.station.maximum};
 return null;
}
function canRedeemWorkshopVoucher(action,tier){const offer=workshopVoucherOffer(action);return !!offer?.eligible&&offer.tiers.includes(tier)&&(data.specificVouchers?.[tier+'_'+offer.kind]||0)>0;}
function spendUpgradeVoucher(action,tier){if(!canRedeemWorkshopVoucher(action,tier))return false;data.specificVouchers[tier+'_'+workshopVoucherOffer(action).kind]--;return true;}
function redeemWorkshopVoucher(action,tier){
 if(!canRedeemWorkshopVoucher(action,tier))return false;const offer=workshopVoucherOffer(action),[type,id,kind]=action.split(':');
 const result=type==='upgrade'?craftStyleUpgrade(id,kind,tier):type==='jewelry'?refineJewelry(id,tier):type==='tool-upgrade'?refineTool(id,tier):upgradeSkill(id,tier);
 if(!result)return false;if(goalDetails(data.craftGoal)?.done)data.craftGoal='';toast('Voucher redeemed',offer.name+' · one rank paid.');save();refreshUI();renderDisciplineDrawer();return true;
}
function canRedeemVoucher(style,kind='weapon'){return !!STYLE_DEFS[style]&&canRedeemWorkshopVoucher('upgrade:'+style+':'+kind,voucherTier(style,kind));}
function redeemUpgradeVoucher(style,kind='weapon'){return !!STYLE_DEFS[style]&&redeemWorkshopVoucher('upgrade:'+style+':'+kind,voucherTier(style,kind));}
function workshopVoucherButtonHtml(action){
 const offer=workshopVoucherOffer(action);if(!offer)return '';
 return offer.tiers.filter(tier=>(data.specificVouchers?.[tier+'_'+offer.kind]||0)>0).map(tier=>{const name=(tierVoucherName(tier))+' '+voucherKindName(offer.kind).toLowerCase();return '<button type="button" class="voucher-redeem" data-redeem-voucher="'+action+'" data-voucher-tier="'+tier+'" data-focus-key="voucher-'+action+'-'+tier+'" aria-label="Use '+escapeHTML(name)+' voucher for '+escapeHTML(offer.name)+'" '+(offer.eligible?'':'disabled')+'>Use '+escapeHTML(name)+' voucher · '+data.specificVouchers[tier+'_'+offer.kind]+' owned</button>';}).join('');
}
function voucherButtonHtml(style,kind='weapon'){return workshopVoucherButtonHtml('upgrade:'+style+':'+kind);}

function lootHistoryHtml(){const entries=[...(data.lootHistory||[])].reverse();return entries.length?'<details class="loot-history"><summary>Recent monster loot</summary><ol>'+entries.map(r=>'<li><b>+'+uiCompact(r.amount)+'</b> '+escapeHTML(r.name)+'<small>Zone '+r.zone+'</small></li>').join('')+'</ol></details>':'';}
