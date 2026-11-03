/* Long combat-time blessings spend the shared pool of surplus Zone materials. */
let dungeonShopView='abilities';
function blessingShopCost(id){return ['silence','quagmire'].includes(id)?100:['bounty','harvest'].includes(id)?80:60;}
function buyLongBlessing(id){
 if(!ELITE_BOONS[id]||activeEliteBoons().length>=128)return false;const cost=blessingShopCost(id);if(!hasIngredients({zoneMaterials:cost}))return false;
 spendIngredients({zoneMaterials:cost});data.eliteBoons.push({id,dungeon:dungeonForZone().id,remaining:ELITE_BOONS[id].seconds*5,uid:++data.eliteBoonSequence,source:'shop'});data.eliteBoon=data.eliteBoons[0];codexDiscover('elite_boon_'+id);
 toast(ELITE_BOONS[id].name+' activated',ELITE_BOONS[id].seconds*5+' combat seconds · stacks with other blessings');save();shopSignature='';refreshUI();return true;
}
function blessingShopHtml(){return '<section class="blessing-shop"><div class="zone-wallet">'+artHTML('codex-loot_0')+'<strong>'+uiCompact(data.zoneMaterials)+'</strong><span>Zone materials</span></div><p class="recipe-hint">Spend surplus seeds, cores, dust or shards in any combination. Activate a blessing for five times its normal duration. Timers use Delving combat time, pause in menus and stack independently.</p><div class="blessing-shop-list">'+Object.entries(ELITE_BOONS).map(([id,b])=>{
 const cost=blessingShopCost(id),locked=data.zoneMaterials<cost||activeEliteBoons().length>=128;
 return '<article class="craft-tile compact-recipe blessing-shop-card">'+artHTML('codex-elite_boon_'+id)+'<div class="craft-tile-body"><strong>'+b.name+'</strong><small>'+b.description+'</small><span>'+b.seconds*5+'s · combat time</span>'+materialCosts({zoneMaterials:cost})+'</div><div class="recipe-actions"><button type="button" data-buy-blessing="'+id+'" data-focus-key="buy-blessing-'+id+'" '+(locked?'disabled':'')+'>Activate</button></div></article>';
 }).join('')+'</div></section>';}
