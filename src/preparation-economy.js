/* Lower repeated preparation costs while retaining the material and tier gates. */
function preparationUpgradeGold(tier,kind,rank,legacy=false){
 const local=tier>1?Math.max(0,rank-(kind==='weapon'?10:5)*(tier-1)):rank;
 if(tier===1)return kind==='weapon'?(legacy?30+local*18:18+local*9):(legacy?35+local*20:20+local*10);
 return tier===3?90+local*32:legacy?75+local*35:45+local*22;
}
function normalizePreparationEconomy(){
 if(data.preparationEconomyVersion===1)return;
 let credit=0;
 for(const [id,style]of Object.entries(data.styles)){
  for(const kind of ['weapon','speed'])for(let rank=0;rank<(kind==='weapon'?Math.min((data.refinementRankArchive?.[id]?.tier||styleTier(id))*10,data.refinementRankArchive?.[id]?.weapon??style[kind]):style[kind]);rank++){
   const tier=rank<(kind==='weapon'?10:5)?1:2;credit+=preparationUpgradeGold(tier,kind,rank,true)-preparationUpgradeGold(tier,kind,rank);
  }
  if(styleTier(id)===2)credit+=50;
 }
 data.gold+=credit;data.preparationEconomyCredit=credit;data.preparationEconomyVersion=1;
 if(credit){const history=data.noticeHistory||(data.noticeHistory=[]);history.push({title:'Upgrade prices reduced',description:'+'+credit+' gold credited for owned refinements, speed ranks and Steel promotions. Equipment and materials kept.',time:Date.now()});data.noticeHistory=history.slice(-40);}
}
function equipmentWorkXp(style,kind,tier=styleTier(style)){
 if(kind==='craft')tier=1;
 const amount=kind==='craft'?60:kind==='promotion'?100:kind==='weapon'?60*tier:kind==='speed'?20*tier:0;
 return amount?awardDisciplineXp(STYLE_DEFS[style].group,amount,tier):0;
}
