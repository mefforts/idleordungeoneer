/* Delve rewards follow the resource-bound pace of equipment crafting. */
const DELVE_GOLD={mob:0,guardian:[8,12,22],floor:[15,20,30],overflow:2};
function delveGoldReward(kind,floor=data.floor,index=0){
 const zone=Math.min(20,zoneForFloor(floor)),count=zoneFloorCount(zone),stage=floorStage(floor),band=zoneVisualBand(zone,stage)-1;
 if(kind==='guardian')return Math.round(DELVE_GOLD.guardian[index]*(1+zone*.5))*3/count;
 if(kind==='floor'){const rewards=DELVE_GOLD.floor.map(amount=>Math.round(amount*(1+zone*.6))),budget=rewards.reduce((sum,n)=>sum+n,0),weight=Array.from({length:count},(_,i)=>rewards[zoneVisualBand(zone,i+1)-1]).reduce((sum,n)=>sum+n,0);return rewards[band]*budget/weight;}
 if(kind==='overflow')return DELVE_GOLD.overflow;return kind==='elite'?2*(1+zone*.4):0;
}

function grantDelveGold(amount){
 const coins=delveGoldCoins(amount);data.gold+=coins;return coins;
}
function delveGoldCoins(amount){
 if(!Number.isFinite(amount)||amount<=0)return 0;
 const old=Number(data.delveGoldRemainder)||0,total=amount+Math.max(0,Math.min(.999999999,old)),coins=Math.floor(total+1e-9);
 data.delveGoldRemainder=Math.max(0,total-coins);return coins;
}
function zoneGoldBudget(index=zoneNumber()){
 const model=zoneBalance(index),count=zoneFloorCount(index),floor=zoneStart(index),monsters=model.swarmCount*delveGoldReward('mob',floor),guardians=count*[0,1,2].reduce((sum,n)=>sum+delveGoldReward('guardian',floor,n),0),clears=Array.from({length:count},(_,n)=>delveGoldReward('floor',floor+n)).reduce((sum,n)=>sum+n,0);
 const round=value=>Math.round(value*1e9)/1e9;return {monsters:round(monsters),guardians:round(guardians),clears:round(clears),total:round(monsters+guardians+clears),perMinute:round((monsters+guardians+clears)/model.minutes)};
}
