/* Training tiers slow old work without changing its material output. */
function skillXpThreshold(level){
 level=Math.max(1,Math.min(100,Math.floor(Number(level)||1)));
 return level<=10?20*(level-1)*(level-1)+10*(level-1):Math.ceil(1710+10000*(Math.pow(1.15,level-10)-1));
}
function skillLevelAtXp(xp){
 xp=Math.max(0,Number(xp)||0);let low=1,high=99;
 while(low<high){const mid=Math.ceil((low+high)/2);if(xp>=skillXpThreshold(mid))low=mid;else high=mid-1;}return low;
}
function skillLevelRange(xp){
 xp=Math.max(0,Number(xp)||0);const level=skillLevelAtXp(xp),before=skillXpThreshold(level),end=skillXpThreshold(level+1);
 return {lvl:level,cur:xp-before,needed:end-before,pct:level===99?100:Math.max(0,Math.min(100,(xp-before)/(end-before)*100))};
}
function normalizeSkillXpCurve(){
 if(data.skillXpCurveVersion===1)return;let retained=false;
 const fields=new Set([...Object.values(DISCIPLINES).map(d=>d.xp),...Object.values(SKILLS).map(s=>s.xp)]);
 for(const field of fields){const xp=Math.max(0,Math.min(1e10,Number(data[field])||0));let level=1;while(level<99&&xp>=20*level*level+10*level)level++;
  const before=level===1?0:20*(level-1)*(level-1)+10*(level-1),after=20*level*level+10*level,progress=Math.max(0,Math.min(1,(xp-before)/(after-before)));
  data[field]=level<10?xp:Math.round((skillXpThreshold(level)+(skillXpThreshold(level+1)-skillXpThreshold(level))*progress)*1e6)/1e6;retained||=level>=10;
 }
 data.skillXpCurveVersion=1;
 if(retained){const history=data.noticeHistory=Array.isArray(data.noticeHistory)?data.noticeHistory:[];history.push({title:'Skill training updated',description:'Your earned skill levels and level progress are retained. Tier 1 trains to 10; tier 2 trains toward 20. Older work gives 10% XP but keeps its full material yield.',time:Date.now()});data.noticeHistory=history.slice(-40);}
}
function scaledTrainingXp(amount,tier,xp){
 if(!Number.isFinite(amount)||amount<=0)return 0;const boundary=skillXpThreshold(tier*10),full=Math.min(amount,Math.max(0,boundary-xp));
 return Math.round((full+(amount-full)*.1)*1e6)/1e6;
}
function awardDisciplineXp(group,amount,tier=1,activityField){
 const field=DISCIPLINES[group]?.xp;if(!field)return 0;const gain=scaledTrainingXp(amount,tier,data[field]||0);
 data[field]=(data[field]||0)+gain;if(activityField&&activityField!==field)data[activityField]=(data[activityField]||0)+gain;return gain;
}
function workTrainingXp(key,active=true){const s=SKILLS[key];return s?scaledTrainingXp(active?Math.max(5,Math.floor(s.gain*.65)):s.gain,s.tier||1,data[DISCIPLINES[disciplineFor(key)].xp]||0):0;}
function trainingBandText(group){const level=disciplineLevel(group),tier=level>=20?3:level>=10?2:1;return tier===1?'Tier 1 trains toward level 10':tier===2?'Train tier 2 toward 20 · tier 1 gives 10% XP':'Train tier 3 beyond 20 · earlier tiers give 10% XP';}
