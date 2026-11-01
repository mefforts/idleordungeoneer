/* Delve rewards follow the resource-bound pace of equipment crafting. */
const DELVE_GOLD={mob:.25,guardian:[8,12,22],floor:[30,40,60],overflow:2};
function delveGoldReward(kind,floor=data.floor,index=0){
 const zone=Math.min(20,Math.max(0,Math.floor((floor-1)/3))),stage=Math.max(0,(floor-1)%3);
 if(kind==='guardian')return Math.round(DELVE_GOLD.guardian[index]*(1+zone*.5));
 if(kind==='floor')return Math.round(DELVE_GOLD.floor[stage]*(1+zone*.6));
 if(kind==='overflow')return DELVE_GOLD.overflow;
 return DELVE_GOLD.mob*(1+zone*.4)*(kind==='elite'?3:1);
}
function grantDelveGold(amount){
 if(!Number.isFinite(amount)||amount<=0)return 0;
 const old=Number(data.delveGoldRemainder)||0,total=amount+Math.max(0,Math.min(.999999999,old)),coins=Math.floor(total+1e-9);
 data.delveGoldRemainder=Math.max(0,total-coins);data.gold+=coins;return coins;
}
function zoneGoldBudget(index=zoneNumber()){
 const model=zoneBalance(index),floor=index*3+1;
 const monsters=model.swarmCount*delveGoldReward('mob',floor),guardians=3*[0,1,2].reduce((sum,n)=>sum+delveGoldReward('guardian',floor,n),0),clears=[0,1,2].reduce((sum,n)=>sum+delveGoldReward('floor',floor+n),0);
 return {monsters,guardians,clears,total:monsters+guardians+clears,perMinute:(monsters+guardians+clears)/model.minutes};
}
