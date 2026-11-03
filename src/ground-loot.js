/* Rewards land before collection. Each floor retains its unclaimed spoils. */
const GROUND_LOOT_RESOURCES=new Set(['gold','essence','ore','bars','logs','arrows','cloth','runes','scraps','silverOre','silverBars','opals','cutOpals','coal','steelBars','willowLogs','ancientSalvage','ancientFragments','garnets','cutGarnets','runicCloth','sigils','mithrilOre','mithrilBars','yewLogs','verdantCloth','enchantedSalvage','enchantedFragments','sapphires','cutSapphires']);
function validGroundLootItem(item){return item&&typeof item.key==='string'&&Number.isSafeInteger(item.amount)&&item.amount>0&&(GROUND_LOOT_RESOURCES.has(item.key)||validVoucherLootKey(item.key)||/^loot_[0-3]$/.test(item.key));}
function normalizeGroundLoot(){
 data.groundLootCaches=Object.fromEntries(Object.entries(data.groundLootCaches||{}).filter(([floor,drops])=>/^\d+$/.test(floor)&&Number(floor)>0&&Number(floor)<=zoneEnd(999)&&Array.isArray(drops)).map(([floor,drops])=>[floor,drops.filter(d=>d&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&Array.isArray(d.items)).map(d=>({x:Math.max(-10000,Math.min(10000,d.x)),y:Math.max(-10000,Math.min(10000,d.y)),age:.4,items:normalizeVoucherLootItems(d.items.filter(validGroundLootItem).map(i=>({key:i.key,amount:Math.min(1e12,i.amount)})))})).filter(d=>d.items.length)]));
}
function checkpointGroundLoot(){
 if(typeof game==='undefined'||game.lootOwner!==data||!game.lootFloor)return;
 const drops=(game.groundLoot||[]).map(d=>({x:d.x,y:d.y,age:.4,items:d.items.map(i=>({key:i.key,amount:i.amount}))}));
 if(drops.length)data.groundLootCaches[game.lootFloor]=drops;else delete data.groundLootCaches[game.lootFloor];
}
function loadFloorLoot(){
 game.lootOwner=data;game.lootFloor=data.floor;game.groundLoot=(data.groundLootCaches?.[data.floor]||[]).map(d=>({...d,items:d.items.map(i=>({...i}))}));
}
function dropMonsterLoot(enemy,rewards){
 const combined=new Map();for(const item of rewards)if(validGroundLootItem(item))combined.set(item.key,(combined.get(item.key)||0)+item.amount);
 if(!combined.size)return null;
 const drop={x:enemy.x,y:enemy.y+(enemy.rad||0)*.35,age:0,items:[...combined].map(([key,amount])=>({key,amount}))};
 (game.groundLoot||(game.groundLoot=[])).push(drop);return drop;
}
function collectGroundLoot(drop){
 const index=game.groundLoot?.indexOf(drop)??-1;if(index<0||game.lootOwner!==data||game.lootFloor!==data.floor)return false;
 game.groundLoot.splice(index,1);for(const item of drop.items){
  if(item.key==='sigils')grantZoneCurrency(item.amount);
  else if(item.key.startsWith('voucher_')){grantSpecificVoucherLoot(item.key,item.amount);codexDiscover('upgrade_vouchers');toast(voucherLootName(item.key),'One matching upgrade on an owned item or its named station.');}
  else if(item.key.startsWith('loot_')){const kind=Number(item.key.slice(5));data.biomeLoot[kind]=(data.biomeLoot[kind]||0)+item.amount;codexDiscover(item.key);}
  else{data[item.key]=(data[item.key]||0)+item.amount;codexDiscover(item.key==='essence'?'permanent_essence':'resource_'+item.key);}
 }
 recordMonsterLoot({x:drop.x,y:drop.y,rad:0},drop.items);return true;
}
function lootPickupRadius(){return 68+waveRank('vortex')*8+trinketBonus('pickup');}
function tickGroundLoot(dt){
 if(game.menuPaused||game.scene!=='combat'||game.status!=='running'||!$('overlay').classList.contains('hidden'))return;
 const p=game.player,radius=lootPickupRadius();for(const drop of [...game.groundLoot||[]]){
  drop.age+=dt;if(drop.age<.35)continue;const distance=Math.hypot(drop.x-p.x,drop.y-p.y);
  if(distance>radius)continue;const step=Math.min(distance,360*dt);if(distance){drop.x+=(p.x-drop.x)/distance*step;drop.y+=(p.y-drop.y)/distance*step;}
  if(Math.hypot(drop.x-p.x,drop.y-p.y)<=19)collectGroundLoot(drop);
 }
}
function collectAllGroundLoot(){for(const drop of [...game.groundLoot||[]])collectGroundLoot(drop);checkpointGroundLoot();}
function paintGroundLoot(){
 for(const drop of game.groundLoot||[]){
  const voucher=drop.items.some(i=>i.key.startsWith('voucher_')),size=voucher?24:20,lift=reducedMotion()?0:Math.sin(Math.min(1,drop.age/.35)*Math.PI)*16;
  glow(drop.x,drop.y-3,voucher?31:20,voucher?'#f4d18635':'#dbc28d20');ellipse(drop.x,drop.y+5,13,4,'#151b1aa0');
  const items=drop.items.slice(0,3);items.forEach((item,i)=>{const details=lootDetails(item.key);let image=lootImages.get(details.art);if(!image){image=new Image();image.src=iconAsset(details.art);lootImages.set(details.art,image);}const x=drop.x+(i-(items.length-1)/2)*13,y=drop.y-(i%2)*5-lift;if(image.complete&&image.naturalWidth)ctx.drawImage(image,x-size/2,y-size/2-3,size,size);});
  if(voucher){line(drop.x,drop.y-16-lift,drop.x,drop.y-31-lift,1.5,'#ffe7a2b0');disc(drop.x,drop.y-33-lift,2,'#fff0bd');}
 }
}
