/* Read-only recipe planning. All work and spending still use normal controls. */
function preparationActivity(resource){
 if(resource==='gold'&&canUseSkill('deepScavenge'))return 'deepScavenge';
 if(resource==='arrows'&&canUseSkill('mithrilFletch'))return 'mithrilFletch';
 if(resource==='runes'&&canUseSkill('verdantRune'))return 'verdantRune';
 if(resource==='gold')return canUseSkill('ancientScavenge')?'ancientScavenge':'scavenge';
 if(resource==='arrows'&&canUseSkill('steelFletch'))return 'steelFletch';
 if(resource==='runes'&&canUseSkill('greaterRune'))return 'greaterRune';
 return RESOURCE_SOURCE[resource];
}
function preparationRequirements(action){
 const [type,id]=String(action||'').split(':'),requirements=[];
 if(type==='promotion'&&STYLE_DEFS[id]){
  const p=promotionDetails(id);requirements.push({label:equipmentTierGate(p.tier),ready:equipmentTierUnlocked(p.tier),action:'delve',tier:p.tier});
  if(p.rank)requirements.push({label:TIER_LIMITS[p.tier-1].name+' refinement '+data.styles[id].weapon+' / '+p.rank,ready:data.styles[id].weapon>=p.rank,group:STYLE_DEFS[id].group,action:'refine'});
  requirements.push({label:DISCIPLINES[STYLE_DEFS[id].group].name+' '+weaponCraftLevel(STYLE_DEFS[id].weapon)+' / '+p.level,ready:weaponCraftLevel(STYLE_DEFS[id].weapon)>=p.level,group:STYLE_DEFS[id].group,action:'train'});
 }else if(type==='weapon'&&WEAPON_TYPES[id])requirements.push({label:DISCIPLINES[STYLE_DEFS[styleForWeapon(id)].group].name+' '+weaponCraftLevel(id)+' / '+WEAPON_LEVELS[id],ready:weaponCraftLevel(id)>=WEAPON_LEVELS[id],group:STYLE_DEFS[styleForWeapon(id)].group,action:'train'});
 else if(type==='armor'&&ARMOR_SETS[id]){const a=ARMOR_SETS[id];if(a.tier>1)requirements.push({label:equipmentTierGate(a.tier),ready:equipmentTierUnlocked(a.tier),action:'delve',tier:a.tier});requirements.push({label:DISCIPLINES[a.group].name+' '+levelRange(data[DISCIPLINES[a.group].xp]||0).lvl+' / '+a.level,ready:levelRange(data[DISCIPLINES[a.group].xp]||0).lvl>=a.level,group:a.group,action:'train'});}
 return requirements;
}
function preparationPlan(action=data.craftGoal){
 const goal=goalDetails(action);if(!goal||goal.done)return null;
 const stock=Object.fromEntries(Object.keys(RESOURCE_LABEL).map(key=>[key,Math.max(0,Number(data[key])||0)])),credits=JSON.parse(JSON.stringify(data.stationCredits||{})),steps=[],byActivity=new Map();let cycles=0;
 function costAt(base,group){const rate=stationRank(group)*.02,credit=credits[group]||{};return Object.fromEntries(Object.entries(base||{}).filter(([,n])=>n>0).map(([key,n])=>[key,key==='gold'?n:n-Math.min(n,Math.floor((credit[key]||0)+n*rate+1e-8))]));}
 function recipe(base,group,depth){
  if(depth>12)throw Error('Recipe dependency cycle');let cost;
  // A later ingredient can consume an earlier one (e.g. willow → cloth).
  // Recheck the whole recipe before reserving anything for this craft.
  for(let pass=0;pass<20;pass++){
   cost=costAt(base,group);for(const [key,n]of Object.entries(cost).sort(([a],[b])=>(a==='gold'?-1:b==='gold'?1:0)))ensure(key,n,depth+1);
   cost=costAt(base,group);if(Object.entries(cost).every(([key,n])=>(stock[key]||0)>=n))break;
  }
  const credit=credits[group]||(credits[group]={}),rate=stationRank(group)*.02;
  for(const [key,n]of Object.entries(cost)){stock[key]-=n;if(key!=='gold')credit[key]=Math.max(0,Number(((credit[key]||0)+(base[key]||0)*rate-((base[key]||0)-n)).toFixed(8)));}
 }
 function ensure(resource,amount,depth){
  if((stock[resource]||0)>=amount)return;
  const activity=preparationActivity(resource),skill=SKILLS[activity];
  if(!skill&&activity!=='prospect'){if(!byActivity.has(resource)){const step={activity:null,resource,amount:amount-(stock[resource]||0),blocked:true};steps.push(step);byActivity.set(resource,step);}stock[resource]=amount;return;}
  const outputResource=activity==='prospect'?'opals':skill.resource,yieldAmount=activity==='prospect'?1:skillYield(activity),perGold=activity==='prospect'?0:skillGoldYield(activity);
  while((stock[resource]||0)<amount){
   if(++cycles>10000)throw Error('Recipe plan is too large');
   recipe(activity==='prospect'?{scraps:12}:skill.cost||{},activity==='prospect'?'scavenging':disciplineFor(activity),depth);
   stock[outputResource]=(stock[outputResource]||0)+yieldAmount;if(perGold)stock.gold=(stock.gold||0)+perGold;
   let step=byActivity.get(activity);if(!step){step={activity,resource:outputResource,batches:0,amount:0,gold:0,blocked:activity!=='prospect'&&!canUseSkill(activity)};steps.push(step);byActivity.set(activity,step);}
   step.batches++;step.amount+=yieldAmount;step.gold+=perGold;
  }
 }
 try{
  const [type,id]=String(action).split(':');
  if(type==='promotion'&&STYLE_DEFS[id]){
   for(let rank=data.styles[id].weapon;rank<promotionDetails(id).rank;rank++)recipe(styleUpgradeBase(id,'weapon',rank),STYLE_DEFS[id].group,0);
   recipe(promotionDetails(id).cost,STYLE_DEFS[id].group,0);
  }else if(type==='ammo')ensure(id,goal.target,0);
  else recipe(goal.baseCost||goal.cost,goal.group,0);
 }catch(_){return {goal,steps:[],requirements:preparationRequirements(action),tooLarge:true};}
 return {goal,steps,requirements:preparationRequirements(action)};
}
function preparationNext(plan){
 if(!plan)return null;const missing=plan.requirements.find(r=>!r.ready);
 if(missing?.action==='delve')return {kind:'delve',label:missing.tier===3?'Complete Zone 3':'Reach Zone 2',...missing};
 if(missing?.action==='train'){
  const step=plan.steps.find(s=>s.activity&&s.activity!=='prospect'&&disciplineFor(s.activity)===missing.group&&!s.blocked),activity=step?.activity||trainingActivity(missing.group);
  return {kind:'activity',activity,label:'Train '+DISCIPLINES[missing.group].name};
 }
 const blocked=plan.steps.find(s=>s.blocked&&s.activity&&SKILLS[s.activity]);if(blocked){const tier=SKILLS[blocked.activity].tier||1;if(!equipmentTierUnlocked(tier))return {kind:'delve',label:tier===3?'Complete Zone 3':'Reach Zone 2'};const group=disciplineFor(blocked.activity),activity=trainingActivity(group);return {kind:'activity',activity,label:'Train '+DISCIPLINES[group].name+' to '+((tier-1)*10)};}
 if(plan.steps[0]){const step=plan.steps[0];return {kind:step.activity==='prospect'?'prospect':step.activity?'activity':'resource',activity:step.activity,resource:step.resource,label:step.activity==='prospect'?'Prospect opals':step.activity?SKILLS[step.activity].name:'Earn '+RESOURCE_LABEL[step.resource]};}
 if(missing?.action==='refine')return {kind:'bench',group:missing.group,label:'Refine weapon'};
 return {kind:'bench',group:plan.goal.group,view:plan.goal.view,label:'Return to '+plan.goal.name};
}
function openPreparationStep(action=data.craftGoal){
 const plan=preparationPlan(action),next=preparationNext(plan);if(!next)return false;
 if(next.kind==='activity'){if(canUseSkill(next.activity))enterActivity(next.activity);else{openWorkshop(disciplineFor(next.activity),'gather');toast('Activity locked',skillLockReason(next.activity));}}
 else if(next.kind==='prospect')openWorkshop('scavenging','refine');
 else if(next.kind==='delve'){closeDrawer();setScene('combat',true);}
 else if(next.kind==='resource')goToSource(next.resource);
 else openWorkshop(next.group,next.view||'equipment');return true;
}
function preparationHtml(){
 const plan=preparationPlan();if(!plan)return '';const next=preparationNext(plan),[type,id]=String(data.craftGoal).split(':');
 return '<section class="preparation-plan" aria-label="Tracked preparation"><div class="preparation-title"><b>'+escapeHTML(plan.goal.name)+'</b>'+trackRecipeButton(data.craftGoal,plan.goal.name)+'</div>'+(plan.requirements.length?'<ul class="preparation-requirements">'+plan.requirements.map(r=>'<li class="'+(r.ready?'ready':'')+'">'+uiIcon(r.ready?'check':'lock')+escapeHTML(r.label)+'</li>').join('')+'</ul>':'')+(type==='promotion'?'<p>Route includes any required refinements and promotion. Armor is crafted separately.</p>':'')+'<button type="button" class="preparation-next" data-preparation-next data-focus-key="preparation-next">'+uiIcon('arrow')+'Next: '+escapeHTML(next.label)+'</button>'+(plan.tooLarge?'<p>Open the source to prepare this large batch.</p>':plan.steps.length?'<details id="preparationRoute"><summary>'+plan.steps.length+' preparation steps</summary><ol>'+plan.steps.map(step=>'<li><span>'+escapeHTML(step.activity==='prospect'?'Prospect opals':step.activity?SKILLS[step.activity].name:step.resource==='zoneMaterials'?'Find Zone materials':'Defeat guardians')+'</span><small>'+(step.batches?step.batches+' '+(step.batches===1?'batch':'batches')+' · ':'')+'+'+uiCompact(step.amount)+' '+escapeHTML(RESOURCE_LABEL[step.resource])+(step.gold?' · +'+uiCompact(step.gold)+' Gold':'')+(step.blocked?' · '+escapeHTML(step.activity?skillLockReason(step.activity):'Delve to earn'):'')+'</small></li>').join('')+'</ol></details>':'<p>Materials ready.</p>')+'</section>';
}
function trackAmmunition(resource=ammunitionResource(),seconds=300){
 if(!['arrows','runes'].includes(resource))return false;data.craftGoal='ammo:'+resource+':'+Math.max(1,Math.ceil(seconds/AMMUNITION_SECONDS));save();openWorkshop(resource==='arrows'?'woodworking':'warding','refine');$('gameDrawer').scrollTop=0;return true;
}
function trackNextRefinement(style){
 if(!STYLE_DEFS[style]||data.styles[style].weapon>=styleUpgradeCap(style,'weapon'))return false;
 data.craftGoal='upgrade:'+style+':weapon';save();openPreparationStep();if(drawerKind)$('gameDrawer').scrollTop=0;return true;
}
function ammunitionSupplyHtml(resource=ammunitionResource()){
 if(!resource)return '';const total=(data[resource]||0)*AMMUNITION_SECONDS+ammunitionCharge(resource),style=resource==='arrows'?'ranged':'magic';
 return '<aside class="ammunition-supply"><b>'+uiCompact(total)+'s firing time ready</b><span>Each '+(resource==='arrows'?'arrow':'rune')+' supplies 10 seconds. Loaded time stays while paused or skilling.</span><button type="button" data-prepare-ammo="'+resource+'">Prepare 5 minutes of '+(resource==='arrows'?'arrows':'runes')+uiIcon('arrow')+'</button>'+(data.unlockedWeapons.some(id=>styleForWeapon(id)===style)&&data.styles[style].weapon<styleUpgradeCap(style,'weapon')?'<button type="button" data-prepare-refinement="'+style+'">Prepare next refinement'+uiIcon('arrow')+'</button>':'')+'</aside>';
}
function weaponRole(id){return {bow:'Long range · arrows supply 10s each · refine for damage',staff:'Ranged splash · runes supply 10s each · refine for damage',polearm:'Long melee reach · 3 base sweep targets',greatsword:'Wide cleave · 4 base sweep targets',shield:'Close range · 28% damage reduction',sword:'Close-range single target'}[id]||'';}
function combatTipAlpha(owner,key,slot='default'){
 const now=game.tipClock||0,reminders=owner.tipReminders||(owner.tipReminders={});if(!reminders[slot]||reminders[slot].key!==key)reminders[slot]={key,start:now};
 const phase=(now-reminders[slot].start)%9;
 if(reducedMotion())return phase<3.2?1:0;
 return phase<.35?phase/.35:phase<2.5?1:phase<3.3?(3.3-phase)/.8:0;
}
function encounterTip(label,x,y,color,size,owner,key=label,slot='default'){ctx.save();ctx.globalAlpha*=combatTipAlpha(owner,key,slot);encounterLabel(label,x,y,color,size);ctx.restore();}
