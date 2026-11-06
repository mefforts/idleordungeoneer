/* Authored depths share one coordinate system for travel, rewards and saves. */
const ZONE_FLOORS=balanceLayout().counts;
const ZONE_FLOOR_NAMES=[
 ['Woodland Edge','Rooted Ruins','Thornwood Crossing','The Sunken Courtyard','The Elder Grove'],
 ['Ashen Approach','Coalroad','The Cinder Gates','Broken Bellows','The Old Foundry','The Slagworks','Furnace Walk','Obsidian Descent','The Crucible','The Molten Heart'],
 ['Forgotten Graves','The Mourning Path','Hollow Steps','The Candle Gallery','The Ossuary','The Silent Court','The Burial Vaults','The Bone Orchard','The Shrouded Hall','The Reliquary','The Unlit Chapel','The Wailing Passage','The Pale Cloister','The Sunken Tombs','The Crowned Dead','The Last Procession','The Royal Crypt','The Soul Gate','The Sovereign’s Antechamber','The Sovereign’s Sanctum'],
 ['The Fractured Approach','The Shardway','Falling Stars','The Hollow Orbit','The Prism Steps','The Silver Crossing','Starlit Ruins','The Broken Observatory','The Moonless Court','The Celestial Vault','The Turning Sky','The Still Constellation','The Astral Causeway','The Dark Meridian','The Unbound Spire','The Shattered Horizon','The Last Star','The Eventide Gate','The Unmade Approach','The Unmade Threshold']
];
function zoneFloorCount(index=zoneNumber()){return zoneTuning(index).floors;}
function zoneStart(index=zoneNumber()){return layoutZoneStart(Math.max(0,Math.floor(Number(index)||0)),balanceLayout());}
function zoneEnd(index=zoneNumber()){return zoneStart(index)+zoneFloorCount(index)-1;}
function zoneForFloor(floor){return layoutZoneForFloor(Math.max(1,Math.floor(Number(floor)||1)),balanceLayout());}
function floorStage(floor){return Math.max(1,Math.floor(Number(floor)||1))-zoneStart(zoneForFloor(floor))+1;}
function floorAtZone(index,stage=1){return zoneStart(index)+Math.max(0,Math.min(zoneFloorCount(index)-1,Math.floor(Number(stage)||1)-1));}
function zoneVisualBand(index=zoneNumber(),stage=zoneStage()){return Math.min(3,1+Math.floor((stage-1)*3/zoneFloorCount(index)));}
function sampleFloorStage(index,band){return band===1?1:band===3?zoneFloorCount(index):Math.ceil(zoneFloorCount(index)/2);}
function zoneFloorName(index=zoneNumber(),stage=zoneStage()){
 const names=zoneTuning(index).floorNames||ZONE_FLOOR_NAMES[zoneTuning(index).theme];
 return names?.[Math.min(names.length-1,Math.floor((stage-1)*names.length/zoneFloorCount(index)))]||'Floor '+stage;
}
function isZoneFinal(){return zoneStage()===zoneFloorCount();}
function biome(){return BIOMES[biomeIndex()];}
function floorModifier(){return ['Quiet Ruins','Restless Swarm','Enraged Guardians'][zoneVisualBand()-1];}
function biomeDetail(){return zoneFloorName();}
function travelToBiome(index){
 if(game.status==='running'||game.status==='upgrade')return;
 const floor=zoneStart(index);if(floor>data.cleared+1)return;masteryDraft=null;data.floor=floor;data.zone=emptyZone();resetRun();save();setScene('combat',false);intro();refreshUI();
}
function combatDepth(floor=data.floor){const index=zoneForFloor(floor);return index*3+1+2*(floorStage(floor)-1)/Math.max(1,zoneFloorCount(index)-1);}
function normalizeZoneLayout(){
 currentBalanceLayout=null;
 if(data.zoneLayoutVersion!==1){
  const oldFloor=Math.max(1,Math.floor(Number(data.floor)||1)),oldClear=Math.max(0,Math.floor(Number(data.cleared)||0));
  const completed=floor=>{if(floor<=0)return 0;const index=Math.floor((floor-1)/3),stage=(floor-1)%3+1;return floorAtZone(index,stage===1?1:stage===2?zoneFloorCount(index)-1:zoneFloorCount(index));};
  data.cleared=completed(oldClear);data.floor=oldFloor===oldClear+1?data.cleared+1:completed(oldFloor);data.zoneLayoutVersion=1;data.zoneLayoutSnapshot=balanceLayout();
 }
 const next=balanceLayout(),old=data.zoneLayoutSnapshot||{counts:BALANCE_CONFIG.layout.legacyCounts,tail:BALANCE_CONFIG.layout.legacyTail};
 if(JSON.stringify(old)!==JSON.stringify(next)){
  const remap=(floor,cleared=false)=>{if(floor<=0)return 0;const zone=layoutZoneForFloor(floor,old),stage=floor-layoutZoneStart(zone,old)+1,count=old.counts[zone]||old.tail;const mapped=old.ids?.[zone]?next.ids.indexOf(old.ids[zone]):-1,target=mapped<0?zone:mapped;return cleared&&stage===count?zoneEnd(target):floorAtZone(target,stage);};
  const frontier=data.floor===data.cleared+1,clear=remap(data.cleared,true);data.floor=frontier?clear+1:remap(data.floor);data.cleared=clear;
 }
 data.zoneLayoutSnapshot=next;
}
