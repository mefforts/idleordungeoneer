/* The four old Zone drops retain their saved banks and share recipe value. */
function normalizeZoneMaterials(){
 const old=data.biomeLoot||{};data.biomeLoot=Object.fromEntries([0,1,2,3].map(i=>[i,Math.max(0,Math.min(1e12,Math.floor(Number(old[i])||0)))]));
 // A non-serialized facade lets ordinary recipes, planning and conservation use
 // the existing banks. It never creates a second saved balance or conversion.
 Object.defineProperty(data,'zoneMaterials',{configurable:true,get(){return Object.values(this.biomeLoot).reduce((a,b)=>a+b,0);},set(value){
  let difference=this.zoneMaterials-Math.max(0,Number(value)||0);
  if(difference<0){this.biomeLoot[0]-=difference;return;}
  for(let i=0;i<4&&difference>0;i++){const used=Math.min(this.biomeLoot[i],difference);this.biomeLoot[i]-=used;difference-=used;}
 }});
}
function upgradeZoneMaterialCost(tier,kind,rank){
 const cap=TIER_LIMITS[tier][kind];return kind==='weapon'?(rank+1)%2===0:rank+1===cap;
}
