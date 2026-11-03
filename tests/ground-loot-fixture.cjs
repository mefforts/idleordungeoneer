// Isolated ground-loot scenarios, never embedded in the delivered build.
function groundLootFixture(){
 function fresh(){__journey.fresh();data.skillsNudgeSeen=true;data.idleNoticeSlots=2;data.firstMasteryTipSeen=data.essenceEnchantTipSeen=true;game.manualPaused=game.menuPaused=false;game.player.invuln=1e9;game.player.x=game.player.y=0;game.spawnTimer=game.attackTimer=1e9;game.enemies=[];refreshUI();return state();}
 function state(){return {gold:data.gold,sigils:zoneShopFor().currency,essence:data.essence,ore:data.ore,vouchers:Object.fromEntries(['iron','steel'].map(tier=>[tier,Object.entries(data.specificVouchers).filter(([key])=>key.startsWith(tier+'_')).reduce((sum,[,n])=>sum+n,0)])),banks:{...data.biomeLoot},ground:JSON.parse(JSON.stringify(game.groundLoot)),receipts:game.lootDrops.length,history:data.lootHistory.length,caches:JSON.parse(JSON.stringify(data.groundLootCaches)),radius:lootPickupRadius()};}
 function drop(x=100,y=0){return dropMonsterLoot({x,y,rad:0},[{key:'gold',amount:7},{key:'sigils',amount:2},{key:'essence',amount:1},{key:'ore',amount:3},{key:'loot_0',amount:1},{key:'voucher_iron_weapon',amount:1}]);}
 window.__groundLootTest={fresh,state,drop(x=100,y=0){drop(x,y);refreshUI();render();return state();},
  tick(dt){tickGroundLoot(dt);refreshUI();render();return state();},
  collect(){collectAllGroundLoot();return state();},
  duplicate(){const d=drop(0,0);const first=collectGroundLoot(d),second=collectGroundLoot(d);return {first,second,...state()};},
  mode(mode){game.menuPaused=mode==='menu'||mode==='pause';game.scene=mode==='skill'?'mine':'combat';if(mode==='overlay')showOverlay('<h2>Paused</h2>');else hideOverlay(true);return state();},
  amulet(){const id=Object.keys(TRINKETS).find(k=>TRINKETS[k].bonus==='pickup');data.trinkets.push(id);data.equippedAmulet=id;refreshUI();return state();},
  move(x,y=0){game.player.x=x;game.player.y=y;tickGroundLoot(.1);refreshUI();render();return state();},
  save(){save();return JSON.parse(localStorage.getItem(KEY));},
  retry(){startFloor();game.spawnTimer=game.attackTimer=1e9;return state();},
  die(){die();return state();},
  travel(floor){data.floor=floor;resetRun();game.status='running';hideOverlay(true);game.menuPaused=game.manualPaused=false;return state();},
  clear(){clearFloor();return state();},
  kill(kind='boss'){const e=spawnEnemy(kind==='boss',0);Object.assign(e,{x:200,y:50,elite:kind==='elite',summoned:kind==='summon',hp:1});const r=Math.random;Math.random=()=>0;try{onKill(e);}finally{Math.random=r;}return state();},
  malformed(){data.groundLootCaches={1:[{x:1,y:2,items:[{key:'gold',amount:3},{key:'gold',amount:-1},{key:'zoneMaterials',amount:99},{key:'not-a-resource',amount:1}]}],invalid:[{}],2:[{x:Infinity,y:0,items:[]}]};normalizeGroundLoot();return JSON.parse(JSON.stringify(data.groundLootCaches));},
  preview(){fresh();data.cleared=1;data.floor=2;normalizeZone();resetRun();game.status='running';data.firstWeaponCrafted=true;data.gold=45;game.phase=1;$('toastStack').replaceChildren();for(const [i,key]of ['gold','sigils','essence','ore','loot_0','voucher_iron_weapon'].entries())dropMonsterLoot({x:-125+i*47,y:110+(i%2)*35,rad:0},[{key,amount:key==='gold'?8:1}]);for(const d of game.groundLoot)d.age=.5;__journey.buffs();game.player.x=0;game.player.y=-15;game.camY=35;refreshUI();render();},
  allBuffs(){data.eliteBoons=Object.keys(ELITE_BOONS).map((id,i)=>({id,remaining:40+i,dungeon:dungeonForZone().id,uid:i+1}));game.player.rallyTime=5;refreshUI();},
  keyTick(seconds){for(let t=0;t<seconds;t+=.02)tickCombat(.02);refreshUI();render();return state();}
 };
}
module.exports={groundLootFixture};
