/* Shared tuning selectors. The build embeds balance-config.json before modules.
   Authored content and experimental continuation are separate; saves use stable IDs. */
let currentBalanceLayout=null;
function balanceDungeon(index=zoneNumber(),config=BALANCE_CONFIG){
 index=Math.max(0,Math.floor(Number(index)||0));let low=0,high=config.dungeons.length-1;
 while(low<high){const mid=Math.ceil((low+high)/2);if(config.dungeons[mid].firstZone<=index)low=mid;else high=mid-1;}return config.dungeons[low];
}
function scaleBalanceValue(value,growth,steps){return Math.exp(Math.min(Math.log(Number.MAX_SAFE_INTEGER),Math.log(value)+Math.log(growth)*Math.max(0,steps)));}
function zoneTuning(index=zoneNumber(),config=BALANCE_CONFIG){
 index=Math.max(0,Math.floor(Number(index)||0));const dungeon=balanceDungeon(index,config),local=index-dungeon.firstZone,authored=dungeon.zones[local];
 if(authored)return authored;
 const last=dungeon.zones.at(-1),tail=dungeon.continuation,steps=local-dungeon.zones.length+1,cycle=dungeon.themeCycle||dungeon.zones.map(z=>z.theme);
 return {...last,id:dungeon.id+'-continuation-'+local,theme:cycle[((local%cycle.length)+cycle.length)%cycle.length],floors:tail.floors,referenceTier:tail.referenceTier,experimental:true,calibrationMinutes:tail.calibrationMinutes,
  health:Object.fromEntries(Object.entries(last.health).map(([k,n])=>[k,scaleBalanceValue(n,tail.healthGrowth,steps)])),goldMultiplier:scaleBalanceValue(last.goldMultiplier,tail.rewardGrowth,steps),sigilMultiplier:scaleBalanceValue(last.sigilMultiplier,tail.rewardGrowth,steps)};
}
function balanceLayout(config=BALANCE_CONFIG){
 if(config===BALANCE_CONFIG&&currentBalanceLayout)return currentBalanceLayout;
 const last=config.dungeons.at(-1),count=last.firstZone+last.zones.length;
 const layout={counts:Array.from({length:count},(_,i)=>zoneTuning(i,config).floors),ids:Array.from({length:count},(_,i)=>balanceDungeon(i,config).id+'/'+zoneTuning(i,config).id),tail:last.continuation.floors};
 layout.starts=[1];for(const count of layout.counts)layout.starts.push(layout.starts.at(-1)+count);
 if(config===BALANCE_CONFIG)currentBalanceLayout=layout;return layout;
}
function layoutZoneStart(index,layout){const starts=layout.starts||[1];if(!layout.starts)for(const count of layout.counts)starts.push(starts.at(-1)+count);return starts[Math.min(index,layout.counts.length)]+Math.max(0,index-layout.counts.length)*layout.tail;}
function layoutZoneForFloor(floor,layout){const starts=layout.starts||[1];if(!layout.starts)for(const count of layout.counts)starts.push(starts.at(-1)+count);const end=starts.at(-1);if(floor>=end)return layout.counts.length+Math.floor((floor-end)/layout.tail);let low=0,high=layout.counts.length-1;while(low<high){const mid=Math.ceil((low+high)/2);if(floor>=starts[mid])low=mid;else high=mid-1;}return low;}
function equipmentTiers(){return Object.keys(TIER_LIMITS).map(Number).sort((a,b)=>a-b);}
function maximumEquipmentTier(){return equipmentTiers().at(-1);}
function equipmentTierSkillLevel(tier){return TIER_LIMITS[tier]?.skillLevel??Infinity;}
function perkUnlockZone(perk,index=zoneNumber()){return balanceDungeon(index).perkUnlockZones[perk.id]||1;}
function perkUnlockLabel(perk,index=zoneNumber()){const local=perkUnlockZone(perk,index);return local<=1?'Available from the start':'Reach Zone '+(balanceDungeon(index).firstZone+local);}
function vigorDamageReduction(){return trinketBonus('hp')*BALANCE_CONFIG.equipment.reinforcement.vigorGuardPerHp;}
