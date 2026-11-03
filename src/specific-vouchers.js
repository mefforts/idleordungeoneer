/* Every voucher pays one named upgrade. Existing wildcard balances split once. */
function voucherKinds(tier){return ['weapon','speed','reach','armor','enchant',...(tier==='iron'?['jewelry','tool-pickaxe','tool-hatchet','tool-mattock']:[]),'station-blacksmithing','station-woodworking','station-warding','station-scavenging','station-artisan'];}
function voucherKindName(kind){
 if(kind.startsWith('tool-'))return (TOOL_DEFS[kind.slice(5)]?.name||'Tool').replace(/^Iron /,'')+' refinement';
 if(kind.startsWith('station-'))return (DISCIPLINES[kind.slice(8)]?.name||'Station')+' station upgrade';
 return {weapon:'Weapon refinement',speed:'Attack speed',reach:'Weapon reach',armor:'Armor reinforcement',enchant:'Enchantment',jewelry:'Jewelry refinement'}[kind]||'Upgrade';
}
function validVoucherLootKey(key){const parts=String(key).split('_');return parts[0]==='voucher'&&['iron','steel'].includes(parts[1])&&(parts.length===2||parts.length===3&&voucherKinds(parts[1]).includes(parts[2]));}
function voucherLootName(key){const [,tier,kind]=key.split('_');return (tier==='iron'?'Iron':'Steel')+' '+(kind?voucherKindName(kind).toLowerCase():'legacy upgrade')+' voucher';}
function splitLegacyVouchers(tier,amount){
 const kinds=voucherKinds(tier),count=Math.max(0,Math.min(1e12,Math.floor(Number(amount)||0))),whole=Math.floor(count/kinds.length),extra=count%kinds.length;
 return kinds.map((kind,index)=>({key:'voucher_'+tier+'_'+kind,amount:whole+(index<extra?1:0)})).filter(item=>item.amount>0);
}
function normalizeSpecificVouchers(){
 const old=data.specificVouchers||{};data.specificVouchers=Object.fromEntries(['iron','steel'].flatMap(tier=>voucherKinds(tier).map(kind=>{const key=tier+'_'+kind;return [key,Math.max(0,Math.min(1e12,Math.floor(Number(old[key])||0)))];})));
 for(const tier of ['iron','steel'])for(const item of splitLegacyVouchers(tier,data.upgradeVouchers?.[tier]))data.specificVouchers[item.key.slice(8)]+=item.amount;
 data.upgradeVouchers={iron:0,steel:0};
}
function normalizeVoucherLootItems(items){return items.flatMap(item=>/^voucher_(iron|steel)$/.test(item.key)?splitLegacyVouchers(item.key.slice(8),item.amount):[item]);}
function grantSpecificVoucherLoot(key,amount){for(const item of normalizeVoucherLootItems([{key,amount}]))if(validVoucherLootKey(item.key))data.specificVouchers[item.key.slice(8)]=(data.specificVouchers[item.key.slice(8)]||0)+item.amount;}
function dropVoucherKinds(tier){
 const limit=TIER_LIMITS[tier==='iron'?1:2],styles=Object.keys(STYLE_DEFS).filter(style=>data.unlockedWeapons.some(id=>styleForWeapon(id)===style));
 const kinds=voucherKinds(tier).filter(kind=>{
  if(kind==='jewelry')return data.trinkets.some(id=>jewelryRank(id)<JEWELRY_REFINEMENT.maximum);
  if(kind.startsWith('tool-')){const id=kind.slice(5);return data.tools[id]&&toolRank(id)<TOOL_REFINEMENT.maximum;}
  if(kind.startsWith('station-'))return stationRank(kind.slice(8))<5;
  return styles.some(style=>data.styles[style][kind]<limit[kind]&&(kind!=='armor'||data.ownedArmor.some(id=>ARMOR_SETS[id]?.style===style)));
 });return kinds.length?kinds:['weapon'];
}
function voucherInventoryHtml(){
 const entries=Object.entries(data.specificVouchers||{}).filter(([,n])=>n>0);return entries.length?'<div class="specific-voucher-inventory">'+entries.map(([key,amount])=>'<div>'+artHTML('codex-upgrade_vouchers')+'<span>'+escapeHTML(voucherLootName('voucher_'+key))+'</span><b>'+uiCompact(amount)+'</b></div>').join('')+'</div>':'';
}
