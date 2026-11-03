/* Living Skills: save-compatible permanent styles, linked recipes and active work. */
const STYLE_DEFS = {
  melee: {name:'Melee',group:'blacksmithing',weapon:'sword',color:'#e1b58c',armor:'Plate Armor',perk:'Melee sets provide health and damage reduction. Craft and equip a set separately.'},
  ranged: {name:'Ranged',group:'woodworking',weapon:'bow',color:'#add2a1',armor:'Ranged Armor',perk:'Ranged sets provide health and mobility. Craft and equip a set separately.'},
  magic: {name:'Mage',group:'warding',weapon:'staff',color:'#b9b7e9',armor:'Warded Robes',perk:'Mage robes improve Mage damage when worn. Craft and equip a set separately.'}
};
const TOOL_DEFS = {
  pickaxe: {name:'Iron Pickaxe',group:'blacksmithing',skills:['mine','silverMine'],cost:{bars:4,logs:6,gold:15},art:'tool-pickaxe'},
  hatchet: {name:'Iron Hatchet',group:'woodworking',skills:['wood'],cost:{bars:3,logs:8,gold:15},art:'tool-hatchet'},
  mattock: {name:'Iron Mattock',group:'scavenging',skills:['scavenge'],cost:{bars:5,logs:6,gold:20},art:'tool-mattock'}
};
const BONUS_DEFS = {
  mine:{name:'Iron outcrop',art:'ore'},silverMine:{name:'Silver outcrop',art:'silver-ore'},
  wood:{name:'Oak offcut',art:'wood-logs'},scavenge:{name:'Loose salvage rubble',art:'relic'},
  forge:{name:'Forge spark',art:'bonus-spark'},silverSmelt:{name:'Silver spark',art:'bonus-silver'},
  fletch:{name:'Useful twig',art:'bonus-twig'},ward:{name:'Aether glisten',art:'bonus-glisten'},
  rune:{name:'Rune mote',art:'bonus-rune'},polish:{name:'Opal glint',art:'bonus-opal'}
};
let inspectedStyle = 'melee';
let styleBench = 'melee', skillMenuSignature = '', activeBonusState = null;
const styleForWeapon = id => id==='bow'?'ranged':id==='staff'?'magic':'melee';
const combatStyle = () => styleForWeapon(data.weaponType);
const finiteRank = n => Math.max(0, Math.min(100000, Math.floor(Number(n)||0)));
function normalizeProgression(){
  normalizeZoneLayout();normalizeZoneMaterials();
  const legacy={weapon:finiteRank(data.weapon),armor:finiteRank(data.armor),enchant:finiteRank(data.enchant)};
  const old=data.styles&&typeof data.styles==='object'?data.styles:{};
  data.styles=Object.fromEntries(Object.keys(STYLE_DEFS).map(id=>{
    const s=old[id]&&typeof old[id]==='object'?old[id]:legacy;
    return [id,{weapon:finiteRank(s.weapon),armor:finiteRank(s.armor),enchant:finiteRank(s.enchant),speed:Math.min(20,finiteRank(s.speed)),reach:Math.min(20,finiteRank(s.reach)),xp:Math.max(0,Math.min(1e10,Number(s.xp)||0)),tier:s.tier===2?2:1,lastWeapon:s.lastWeapon||STYLE_DEFS[id].weapon}];
  }));
  data.tools=Object.fromEntries(Object.keys(TOOL_DEFS).map(id=>[id,!!data.tools?.[id]]));
  data.stationLevels=Object.fromEntries(Object.keys(DISCIPLINES).map(id=>[id,Math.min(5,finiteRank(data.stationLevels?.[id]??(data.skillBoosts?.[id]?1:0)))]));
  if(!data.stationCredits||typeof data.stationCredits!=='object')data.stationCredits={};
  for(const group of Object.keys(DISCIPLINES)){
    const credits=data.stationCredits[group];
    data.stationCredits[group]=credits&&typeof credits==='object'?Object.fromEntries(Object.entries(credits).filter(([k])=>Object.hasOwn(data,k)).map(([k,n])=>[k,Math.max(0,Math.min(.999999,Number(n)||0))])):{};
  }
  data.stationSaved=Object.fromEntries(Object.keys(DISCIPLINES).map(g=>[g,finiteRank(data.stationSaved?.[g])]));
  data.goldHighWater=Math.max(Number(data.goldHighWater)||0,Number(data.gold)||0);
  data.skillsNudgeSeen=!!data.skillsNudgeSeen||data.unlockedWeapons?.length>1;
  data.idleNoticeSlots=Math.min(2,finiteRank(data.idleNoticeSlots));data.idleFirstAssigned=!!data.idleFirstAssigned||data.idleJobs?.some(Boolean)||false;
  if(data.idleJobs?.filter(Boolean).length>=idleSlotsUnlocked()&&idleSlotsUnlocked()>0)data.idleNoticeSlots=idleSlotsUnlocked();
  data.progressionVersion=5;normalizeArtisanProgression();normalizeSkillingBuffs();normalizeArenaData();normalizeMonsterLoot();normalizeEquipment();normalizeTierProgression();normalizePreparationEconomy();normalizeDungeoneering();normalizeZoneShopProgression();normalizeFirstWeaponHint();normalizeAmmunition();normalizeMasteryMilestones();normalizeRareEliteProgression();projectCombatStyle();
}

function stationRank(group){return data.stationLevels?.[group]||0;}
function toolForSkill(key){return Object.keys(TOOL_DEFS).find(id=>TOOL_DEFS[id].skills.includes(key));}
function skillInterval(key,active=true){
  const rank=stationRank(disciplineFor(key)),tool=toolForSkill(key);
  return (active?ACTIVE_INTERVAL[key]:SKILLS[key].seconds)/(1+rank*.03+(active&&tool&&data.tools?.[tool]? .08+toolRank(tool)*TOOL_REFINEMENT.speedStep:0));
}
// Whole ingredients stay whole. Fractional conservation carries between batches;
// it is spent only when a craft succeeds, never by looking at a recipe.
function stationCost(base,group){
  const rate=stationRank(group)*.02,credits=data.stationCredits?.[group]||{};
  return Object.fromEntries(Object.entries(base||{}).filter(([,n])=>n>0).map(([key,n])=>[key,key==='gold'?n:n-Math.min(n,Math.floor((credits[key]||0)+n*rate+1e-8))]));
}
function spendAtStation(base,group){
  const cost=stationCost(base,group);if(!hasIngredients(cost))return false;
  spendIngredients(cost);const credits=data.stationCredits[group],rate=stationRank(group)*.02;
  for(const [key,n]of Object.entries(base||{}))if(key!=='gold'&&n>0){const saved=n-(cost[key]||0);credits[key]=Math.max(0,Number(((credits[key]||0)+n*rate-saved).toFixed(8)));data.stationSaved[group]+=saved;}
  return true;
}
function skillCost(key){return stationCost(SKILLS[key].cost||{},disciplineFor(key));}
function stationUpgradeCost(group){const rank=stationRank(group);return {...Object.fromEntries(Object.entries(GROUP_COSTS[group]).map(([k,n])=>[k,Math.ceil(n*Math.pow(1.6,rank))])),...([2,4].includes(rank)?{zoneMaterials:1}:{})};}

function upgradeGroup(id,kind){return kind==='enchant'?'warding':STYLE_DEFS[id].group;}
function styleUpgradeCost(id,kind){return stationCost(styleUpgradeBase(id,kind),upgradeGroup(id,kind));}

function craft(kind){return craftStyleUpgrade(combatStyle(),kind);}

function makeTool(id,voucher){
  const t=TOOL_DEFS[id];if(!t||data.tools[id]||!(voucher===undefined?spendAtStation(t.cost,t.group):spendUpgradeVoucher('tool:'+id,voucher)))return false;
  data.tools[id]=true;codexDiscover('tool_'+id);toast(t.name+' crafted','Equipped automatically · 8% faster active gathering · larger gathering bonuses');
  save();refreshUI();renderDisciplineDrawer();return true;
}
function upgradeSkill(key,voucher){
  const group=DISCIPLINES[key]?key:disciplineFor(key);if(!DISCIPLINES[group]||stationRank(group)>=5)return false;
  if(voucher===undefined){if(!hasIngredients(stationUpgradeCost(group)))return false;spendIngredients(stationUpgradeCost(group));}else if(!spendUpgradeVoucher('station:'+group,voucher))return false;
  data.stationLevels[group]++;
  toast(DISCIPLINES[group].name+' station '+stationRank(group),stationRank(group)*2+'% ingredient conservation · '+stationRank(group)*3+'% faster active and idle work');
  save();refreshUI();renderDisciplineDrawer();return true;
}

function activeSkill(key,batch=false){
  if(!SKILLS[key]||!canUseSkill(key))return false;noteSkillEngagement(key);
  const now=game.activeClockMs;if(!game.lastActiveAt)game.lastActiveAt={};
  if(game.lastActiveAt[key]!==undefined&&now-game.lastActiveAt[key]<skillInterval(key)*1000-1e-6)return false;
  const result=produce(key,true);if(!result)return false;
  game.lastActiveAt[key]=now;game.workAction=.48;game.workPulse=(game.workPulse||0)+1;game.activeHits=(game.activeHits||0)+1;game.lastActiveSkill=key;
  if(!batch){refreshUI();if(game.activeHits%9===1)save();}return result;
}
function advanceProduction(seconds,multiplier=selectedTimeRate('skilling')){
  ensureJobs();const jobs=data.idleJobs.filter(Boolean);if(!jobs.length)return {mined:0,smelted:0};
  const beforeOre=data.ore,beforeBars=data.bars;let left=Math.min(28800,Math.max(0,seconds))*Math.max(1,multiplier);
  while(left>.00001){
    const step=Math.min(left,...jobs.map(k=>Math.max(.00001,skillInterval(k,false)-(data.jobTimers[k]||0))));
    jobs.forEach(k=>data.jobTimers[k]=(data.jobTimers[k]||0)+step);left-=step;
    for(const key of [...jobs.filter(k=>!SKILLS[k].cost),...jobs.filter(k=>SKILLS[k].cost)])if(data.jobTimers[key]>=skillInterval(key,false)-.00001){data.jobTimers[key]=0;produce(key);}
  }
  data.miningTimer=data.jobTimers.mine||0;data.forgeTimer=data.jobTimers.forge||0;return {mined:data.ore-beforeOre,smelted:data.bars-beforeBars};
}
function bonusState(){
  if(!activeBonusState)activeBonusState={clock:0,next:1.2,lastInput:-100,scene:'',serial:0,nodes:[],pointers:new Map()};return activeBonusState;
}
function noteSkillEngagement(key){
  if(!SKILLS[key])return;const s=bonusState();
  if(s.scene!==key){clearSkillBonuses();s.scene=key;}if(s.clock-s.lastInput>6)s.next=s.clock+1.2;s.lastInput=s.clock;
}
function clearSkillBonuses(){
  const s=bonusState();s.nodes=[];s.lastInput=-100;s.pointers.clear();$('skillBonusLayer')?.replaceChildren();
}
function resetSkillHold(){
  game.holdSkill=null;game.workPointerId=null;$('skillHold')?.classList.remove('is-holding');
}
function bonusEligible(){return !!SKILLS[game.scene]&&!drawerKind&&$('overlay').classList.contains('hidden')&&$('resourcePicker').classList.contains('hidden')&&!game.customizing&&!document.hidden;}

function spawnSkillBonus(){
  if(!bonusEligible()||!canUseSkill(game.scene)||!hasIngredients(skillCost(game.scene)))return false;
  const s=bonusState();if(s.nodes.length>=3)return false;
  const key=game.scene,def=BONUS_DEFS[key],craft=!!SKILLS[key].cost||key==='ward',tool=toolForSkill(key),amount=1+(data.tools[tool]?1:0),rarity=rollSkillBonusRarity();
  let p=null;for(let attempt=0;attempt<16;attempt++){const candidate=bonusPosition();if(candidate&&s.nodes.every(n=>Math.hypot(n.x-candidate.x,n.y-candidate.y)>=62)){p=candidate;break;}}
  if(!p)return false;
  const id=++s.serial,el=document.createElement('button');el.type='button';el.className='skill-bonus '+(craft?'craft-bonus':'gather-bonus');el.dataset.skillBonus=id;
  el.dataset.rarity=rarity.id;el.style.setProperty('--skill-rarity',rarity.color);
  el.style.left=p.x+'px';el.style.top=p.y+'px';el.innerHTML=artHTML(def.art)+'<span></span>';
  el.onclick=e=>{if(claimSkillBonus(id)&&e.detail===0)$('skillHold').focus({preventScroll:true});};
  const node={id,key,craft,amount,windfall:1+Math.floor(Math.random()*5),rarity:rarity.id,...p,left:6,el};s.nodes.push(node);$('skillBonusLayer').append(el);refreshSkillBonusOffer(node);return id;
}
function claimSkillBonus(id){
  const s=bonusState(),node=s.nodes.find(n=>n.id===Number(id));if(!node||node.left<=0||node.key!==game.scene||!bonusEligible())return false;
  const key=node.key,result=skillBonusReward(node),{rarity,instant}=result;let amount=result.amount;if(!canUseSkill(key)||!instant&&!hasIngredients(skillCost(key)))return false;
  s.nodes=s.nodes.filter(n=>n!==node);node.el.remove();
  if(instant&&node.craft)amount=instantlyRefineSkill(key,result.batches);
  if(!instant)grantSkillBuff(key,rarity);if(!instant||amount>0)beginSkillBonusReaction(key,rarity,node);
  let reward=instant?'+'+amount+' '+SKILLS[key].item+' instantly':'+'+Math.round(rarity.speed*100)+'% work speed for '+rarity.seconds+'s';
  if(!node.craft){data[SKILLS[key].resource]+=amount;codexDiscover('resource_'+SKILLS[key].resource);if(instant)recordWorkshopReward(key,amount,0,'');}
  if(!node.craft){
    data[SKILLS[key].xp]=(data[SKILLS[key].xp]||0)+1;
    const xp=DISCIPLINES[disciplineFor(key)].xp;data[xp]=(data[xp]||0)+1;codexDiscover('resource_'+SKILLS[key].resource);
    if(!instant)reward+=' · +'+amount+' '+SKILLS[key].item;
  }
  game.workAction=.48;game.lastActiveSkill=key;
  const feedback=instant?(amount?'+'+amount+' '+SKILLS[key].item:'Need ingredients'):'+'+Math.round(rarity.speed*100)+'% speed · '+rarity.seconds+'s';
  const pop=document.createElement('span');pop.className='skill-bonus-pop';pop.style.left=node.x+'px';pop.style.top=node.y+'px';pop.style.setProperty('--skill-rarity',rarity.color);pop.setAttribute('aria-hidden','true');pop.innerHTML=(instant?artHTML(RESOURCE_ART[SKILLS[key].resource]):uiIcon('speed'))+'<strong>'+feedback+'</strong>';$('skillBonusLayer').append(pop);setTimeout(()=>pop.remove(),1350);
  $('skillBonusStatus').textContent=rarity.name+' '+BONUS_DEFS[key].name+' collected. '+(instant&&node.craft?(amount?reward+' · ingredients consumed':'No craft completed: ingredients needed.'):reward);refreshUI();save();return true;
}
function tickSkillBonuses(dt){
  const s=bonusState();s.clock+=dt;
  if(!bonusEligible()){if(s.nodes.length||s.lastInput>-100)clearSkillBonuses();return;}
  if(game.holdSkill===game.scene)noteSkillEngagement(game.scene);
  const canWork=hasIngredients(skillCost(game.scene));
  for(const n of [...s.nodes]){n.left-=dt;if(n.key!==game.scene||n.left<=0||!canWork&&!skillBonusReward(n).instant){n.el.remove();s.nodes=s.nodes.filter(o=>o!==n);}else{refreshSkillBonusOffer(n);n.el.style.setProperty('--bonus-life',Math.ceil(n.left/6*100)+'%');n.el.classList.toggle('expiring',n.left<1.4);}}
  if(canWork&&s.clock-s.lastInput<=6&&s.clock>=s.next){spawnSkillBonus();s.next=s.clock+4.2;}
}
function claimBonusesAlongPointer(e){
  const s=bonusState(),previous=s.pointers.get(e.pointerId);if(!previous)return;
  s.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!bonusEligible())return;
  const r=canvas.getBoundingClientRect(),ax=previous.x-r.left,ay=previous.y-r.top,bx=e.clientX-r.left,by=e.clientY-r.top,dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
  for(const n of [...s.nodes]){const t=length?Math.max(0,Math.min(1,((n.x-ax)*dx+(n.y-ay)*dy)/length)):0;if(Math.hypot(n.x-ax-t*dx,n.y-ay-t*dy)<=27)claimSkillBonus(n.id);}
}
function styleRecipeName(id,kind){return STYLE_DEFS[id].name+' '+({weapon:'Weapon Refinement',armor:'Armor',speed:'Attack Speed',reach:'Attack Range',enchant:'Weapon Enchantment'})[kind];}

function trinketBase(id){return {silverBars:TRINKETS[id].type==='ring'?6:9,cutOpals:1,gold:TRINKETS[id].type==='ring'?15:25};}

function openWorkshop(group=workshopGroup,view=workshopView){workshopGroup=DISCIPLINES[group]?group:'blacksmithing';workshopView=view==='tools'?'equipment':['gather','refine','equipment'].includes(view)?view:'gather';openDrawer('skills');}
function bindWorkshop(host){
  const transmute=host.querySelector('#transmuteResource');if(transmute)transmute.onchange=()=>{data.transmuteResource=transmute.value;save();renderDisciplineDrawer();};
  host.querySelectorAll('[data-refine-tool]').forEach(b=>b.onclick=()=>refineTool(b.dataset.refineTool));
  host.querySelectorAll('[data-refine-jewelry]').forEach(b=>b.onclick=()=>refineJewelry(b.dataset.refineJewelry));
  host.querySelectorAll('[data-transmute-resource]').forEach(b=>b.onclick=()=>transmuteEssence(b.dataset.transmuteResource));
  host.querySelectorAll('[data-redeem-voucher]').forEach(b=>b.onclick=()=>redeemWorkshopVoucher(b.dataset.redeemVoucher,b.dataset.voucherTier));
  host.querySelectorAll('[data-preparation-next]').forEach(b=>b.onclick=()=>openPreparationStep());
  host.querySelectorAll('[data-prepare-ammo]').forEach(b=>b.onclick=()=>trackAmmunition(b.dataset.prepareAmmo));
  host.querySelectorAll('[data-prepare-refinement]').forEach(b=>b.onclick=()=>trackNextRefinement(b.dataset.prepareRefinement));
  host.querySelectorAll('[data-idle-skill]').forEach(b=>b.onclick=()=>assignIdleSkill(b.dataset.idleSkill));
  host.querySelectorAll('[data-replace-idle]').forEach(b=>b.onclick=()=>{setIdleJob(Number(b.dataset.replaceIdle),game.pendingIdleSkill);renderDisciplineDrawer();});
  host.querySelectorAll('[data-cancel-idle]').forEach(b=>b.onclick=()=>{game.pendingIdleSkill='';renderDisciplineDrawer();});
  host.querySelectorAll('[data-workshop-group]').forEach(b=>b.onclick=()=>{workshopGroup=b.dataset.workshopGroup;renderDisciplineDrawer();});
  host.querySelectorAll('[data-workshop-view]').forEach(b=>b.onclick=()=>{workshopView=b.dataset.workshopView==='tools'?'equipment':b.dataset.workshopView;renderDisciplineDrawer();});
  host.querySelectorAll('[data-enchant-style]').forEach(b=>b.onclick=()=>{styleBench=b.dataset.enchantStyle;renderDisciplineDrawer();});
  host.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>goToSource(b.dataset.source));
  host.querySelectorAll('[data-enter-activity]').forEach(b=>b.onclick=()=>enterActivity(b.dataset.enterActivity));
  host.querySelectorAll('[data-recipe-cat]').forEach(b=>b.onclick=()=>{recipeCategory=b.dataset.recipeCat;renderDisciplineDrawer();});
  host.querySelectorAll('[data-prospect-opal]').forEach(b=>b.onclick=prospectOpal);
  host.querySelectorAll('[data-craft-tool]').forEach(b=>b.onclick=()=>{makeTool(b.dataset.craftTool);if(goalDetails(data.craftGoal)?.done)data.craftGoal='';renderDisciplineDrawer();});
  host.querySelectorAll('[data-craft-trinket]').forEach(b=>b.onclick=()=>{const id=b.dataset.craftTrinket;if(data.trinkets.includes(id))equipTrinket(id);else makeTrinket(id);if(goalDetails(data.craftGoal)?.done)data.craftGoal='';renderDisciplineDrawer();});
  host.querySelectorAll('[data-recipe-weapon]').forEach(b=>b.onclick=()=>{chooseWeapon(b.dataset.recipeWeapon);if(goalDetails(data.craftGoal)?.done)data.craftGoal='';renderDisciplineDrawer();});
  host.querySelectorAll('[data-style-upgrade]').forEach(b=>b.onclick=()=>{const [id,kind]=b.dataset.styleUpgrade.split(':');if(craftStyleUpgrade(id,kind)&&data.craftGoal==='upgrade:'+id+':'+kind)data.craftGoal='';renderDisciplineDrawer();});
  host.querySelectorAll('[data-unified-upgrade]').forEach(b=>b.onclick=()=>upgradeSkill(b.dataset.unifiedUpgrade));
  host.querySelectorAll('[data-track-goal]').forEach(b=>b.onclick=()=>trackGoal(b.dataset.trackGoal));
  host.querySelectorAll('button').forEach(bindTouchNavigation);
}
function prospectOpal(){return enterActivity('relicClean');}
function makeTrinket(id,voucher){
  const item=TRINKETS[id];if(!item||data.trinkets.includes(id)||!(voucher===undefined?spendAtStation(trinketBase(id),'artisan'):spendUpgradeVoucher('trinket:'+id,voucher)))return false;
  data.trinkets.push(id);if(item.type==='ring'){if(data.equippedRings.length<4)data.equippedRings.push(id);data.equippedRing=data.equippedRings[0]||'';}else data.equippedAmulet=id;
  data.artisanDisciplineXp=(data.artisanDisciplineXp||0)+400;data.artisanXp=(data.artisanXp||0)+400;codexDiscover('trinket_'+id);
  toast(item.name+' crafted!',(item.type==='ring'&&!data.equippedRings.includes(id)?'Saved to Equipment · ':'Equipped · ')+item.effect);syncTrinketHealth();save();refreshUI();renderDisciplineDrawer();return true;
}

function refreshSystemsUI(){
  if(!data.styles)return;document.body.classList.toggle('reduce-motion',reducedMotion());
  const locked=idleSlotsUnlocked()===0;$('stageWrap').classList.toggle('idle-locked',locked);
  $('idleWarning').classList.toggle('hidden',!locked);const warning='Idle unlocks at Zone 1 · Floor 2';if($('idleWarning').textContent!==warning)$('idleWarning').textContent=warning;
  $('idleWarning').title='Clear Floor 1 to reach Zone 1, Floor 2 and unlock your first idle task.';
  const style=combatStyle(),stats=styleStats();$('weaponEffect').textContent=Math.round(attackDamage())+' '+STYLE_DEFS[style].name+' damage · '+Math.round(attackReach())+' reach';
  $('armorName').textContent=STYLE_DEFS[style].armor+' +'+data.armor;$('armorEffect').textContent=maxHp()+' health · '+style+' armor';$('avatarArmorText').textContent=data.armor?STYLE_DEFS[style].armor+' +'+data.armor:'Your chosen tunic';
  $('fireStat').textContent=(1/attackCooldown()).toFixed(2)+'/s';$('speedStat').textContent=Math.round((1+trinketBonus('speed'))*(1+stats.movePercent/100)*waveSwiftFactor()*100)+'%';
  const host=$('combatStyles');if(host){const signature=JSON.stringify([data.styles,data.weaponType,data.equippedArmor,data.unlockedWeapons,inspectedStyle,...Object.values(STYLE_DEFS).map(d=>levelRange(data[DISCIPLINES[d.group].xp]||0).lvl)]);if(host.dataset.signature!==signature){host.innerHTML=styleCardsHtml();host.dataset.signature=signature;host.querySelectorAll('[data-inspect-style]').forEach(b=>b.onclick=()=>{inspectedStyle=b.dataset.inspectStyle;host.dataset.signature='';refreshSystemsUI();host.querySelector('[data-inspect-style="'+inspectedStyle+'"]')?.focus({preventScroll:true});});host.querySelectorAll('[data-train-style]').forEach(b=>b.onclick=()=>openWorkshop(STYLE_DEFS[b.dataset.trainStyle].group,'equipment'));host.querySelectorAll('[data-equip-style]').forEach(b=>b.onclick=()=>{const id=b.dataset.equipStyle,s=data.styles[id],weapon=data.unlockedWeapons.find(w=>w===s.lastWeapon)||data.unlockedWeapons.find(w=>styleForWeapon(w)===id);if(weapon)chooseWeapon(weapon);else openWorkshop(STYLE_DEFS[id].group,'equipment');});}}
  if(drawerKind==='skills'&&skillMenuSignature!==skillMenuState())renderDisciplineDrawer();
  if(SKILLS[game.scene]){
    const key=game.scene,last=game.lastActiveAt?.[key],idling=data.idleJobs.includes(key)&&game.holdSkill!==key,ready=hasIngredients(skillCost(key));
    const pct=idling?(data.jobTimers[key]||0)/skillInterval(key,false)*100:last===undefined?0:(game.activeClockMs-last)/(skillInterval(key)*1000)*100;
    $('activeProgress').style.width=Math.min(100,Math.max(0,pct))+'%';$('skillHold').classList.toggle('has-idle-job',idling);

  }
  refreshSkillBuffUI();refreshTierProgressionUI();const toolEl=$('activeTool');if(toolEl&&SKILLS[game.scene]){
    const tool=toolForSkill(game.scene),t=TOOL_DEFS[tool],label=t?(data.tools[tool]?t.name:'Improvised '+tool):({forge:'Smithing hammer',silverSmelt:'Smithing hammer',fletch:'Fletching knife',ward:'Weaving shuttle',rune:'Engraving burin',polish:'Jeweler’s chisel'})[SKILLS[game.scene].scene||game.scene];
    toolEl.textContent=label+(t&&data.tools[tool]?' · equipped':'');
  }
  if(data.gold>data.goldHighWater)data.goldHighWater=data.gold;
  if(data.unlockedWeapons.length>1)data.skillsNudgeSeen=true;
  const idleNotice=idleSlotsUnlocked()>data.idleNoticeSlots&&data.idleJobs.filter(Boolean).length<idleSlotsUnlocked();
  const idleNudge=$('idleUnlockNudge'),noticeVisible=idleNotice&&game.scene==='combat'&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0&&!game.boss&&!game.manualPaused;
  idleNudge?.classList.toggle('hidden',!noticeVisible);
  const idleBar=$('activeIdleButton');if(idleBar&&SKILLS[game.scene]){const assigned=data.idleJobs.includes(game.scene),html=uiIcon(assigned?'stop':'idle')+'<span>Idle</span>';if(idleBar.innerHTML!==html)idleBar.innerHTML=html;idleBar.disabled=!idleSlotsUnlocked()||!assigned&&!canUseSkill(game.scene);idleBar.setAttribute('aria-pressed',String(assigned));idleBar.setAttribute('aria-label',!idleSlotsUnlocked()?'Idle unlocks at Zone 1 · Floor 2':(assigned?'Stop idling: ':'Idle: ')+SKILLS[game.scene].name);}
  const nudge=$('skillsNudge'),show=!idleNotice&&!data.skillsNudgeSeen&&data.goldHighWater>=150&&!drawerKind&&game.scene==='combat'&&$('overlay').classList.contains('hidden')&&tourIndex<0&&!game.boss&&!game.manualPaused;
  if(nudge)nudge.classList.toggle('hidden',!show);$('quickSkills').classList.toggle('skills-suggested',show);refreshArenaUI();refreshProgressionGuide();
}
function installSystemsUI(){inspectedStyle=combatStyle();styleBench=combatStyle();
  $('quickSkills').querySelector('.nav-label').textContent='Skills';$('quickSkills').setAttribute('aria-label','Skills: gather, refine, craft tools and equipment');$('quickSkills').title='Skills (G)';
  $('stageWrap').insertAdjacentHTML('beforeend','<div class="skill-bonus-layer" id="skillBonusLayer" aria-label="Active skill bonuses"></div><div class="sr-only" id="skillBonusStatus" aria-live="polite"></div><aside id="skillsNudge" class="skills-nudge hidden" aria-label="Skilling suggestion"><span class="nudge-icon">'+artHTML('skills-menu')+'</span><div><strong>Your first 150 gold</strong><p>Build lasting strength in Skills. Try gathering materials and forging your first weapon.</p><button type="button" id="skillsNudgeOpen">Explore Skills ›</button></div><button type="button" id="skillsNudgeDismiss" aria-label="Dismiss skilling suggestion">×</button></aside>');
  $('skillActionBar').insertAdjacentHTML('beforeend','<button type="button" class="skill-work-buff hidden" id="skillWorkBuff">'+uiIcon('speed')+'<span><b></b><small></small><span class="skill-buff-meter"><i></i></span></span></button>');
  $('skillWorkBuff').onclick=showSkillBuffDetails;
  $('stageWrap').insertAdjacentHTML('beforeend','<aside class="skills-nudge hidden" id="idleUnlockNudge" aria-label="Idle task unlocked"><span class="nudge-icon">'+artHTML('idle-task')+'</span><div><strong>Idle tasks unlocked</strong><p>Your adventurer can now work while you delve. Choose an activity in Skills and press Idle. Your second idle slot unlocks when you reach Zone 2.</p><button type="button" id="idleNudgeOpen">Select an idle task ›</button></div><button type="button" id="idleNudgeDismiss" aria-label="Dismiss idle notice">×</button></aside>');
  $('idleNudgeOpen').onclick=openIdleHub;$('idleNudgeDismiss').onclick=()=>{data.idleNoticeSlots=idleSlotsUnlocked();save();refreshSystemsUI();};
  const idleBar=document.createElement('button');idleBar.id='activeIdleButton';idleBar.className='skill-mode active-idle-button';idleBar.type='button';idleBar.onclick=()=>assignIdleSkill(game.scene);document.querySelector('.skill-mode-choices').append(idleBar);
  $('activeSkillLevel').insertAdjacentHTML('afterend','<small class="active-tool" id="activeTool"></small>');
  $('combatWeaponSelector').closest('.panel-section').insertAdjacentHTML('beforebegin','<section class="panel-section"><div class="eyebrow">PERMANENT COMBAT STYLES</div><div id="combatStyles"></div></section><div class="divider"></div>');
  $('gearCraftLink').onclick=()=>openWorkshop(STYLE_DEFS[combatStyle()].group,'equipment');
  $('skillsNudgeOpen').onclick=()=>{data.skillsNudgeSeen=true;save();openWorkshop('blacksmithing','equipment');};$('skillsNudgeDismiss').onclick=()=>{data.skillsNudgeSeen=true;save();refreshSystemsUI();};
  window.addEventListener('pointerdown',e=>{if(!bonusEligible())return;const node=e.target.closest('[data-skill-bonus]'),work=e.target===canvas||e.target.closest('#skillHold');if(!node&&!work)return;if(work)noteSkillEngagement(game.scene);const s=bonusState();s.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(work)game.workPointerId=e.pointerId;if(node){e.preventDefault();claimSkillBonus(node.dataset.skillBonus);}},true);
  window.addEventListener('pointermove',claimBonusesAlongPointer,true);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,e=>{bonusState().pointers.delete(e.pointerId);if(game.workPointerId===e.pointerId)resetSkillHold();},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetSkillHold();clearSkillBonuses();}});
  for(const type of ['blur','resize','pagehide'])window.addEventListener(type,()=>{resetSkillHold();clearSkillBonuses();});refreshSystemsUI();
}

function assignIdleSkill(key){
  if(!SKILLS[key]||!canUseSkill(key)&&!data.idleJobs?.includes(key))return false;
  const limit=idleSlotsUnlocked();if(!limit){toast('Idle unlocks at Zone 1 · Floor 2','Clear Floor 1. You can always gather and craft actively.');return false;}
  ensureJobs();const existing=data.idleJobs.indexOf(key);if(existing>=0){setIdleJob(existing,'');renderDisciplineDrawer();return true;}
  const empty=data.idleJobs.findIndex(k=>!k);if(empty>=0){setIdleJob(empty,key);renderDisciplineDrawer();return true;}
  if(limit===1){setIdleJob(0,key);renderDisciplineDrawer();return true;}
  game.pendingIdleSkill=key;openWorkshop(disciplineFor(key),SKILLS[key].cost?'refine':'gather');renderDisciplineDrawer();$('consolidatedSkills').querySelector('[data-replace-idle]')?.focus({preventScroll:true});return false;
}
function setIdleJob(slot,key){
  ensureJobs();if(!Number.isInteger(slot)||slot<0||slot>=idleSlotsUnlocked()||key&&(!SKILLS[key]||!canUseSkill(key)))return false;
  if(key&&data.idleJobs.some((v,i)=>i!==slot&&v===key))return false;
  const previous=data.idleJobs[slot];data.idleJobs[slot]=key;game.pendingIdleSkill='';
  if(key){codexDiscover('discipline_'+disciplineFor(key));data.idleFirstAssigned=true;data.idleNoticeSlots=idleSlotsUnlocked();toast(SKILLS[key].name+' is now idle',SKILLS[key].cost?'Runs while you delve · pauses when ingredients run out':'Runs while you delve · up to 8 hours offline');}
  else if(previous)toast(SKILLS[previous].name+' idle task stopped','Work progress is kept for when you resume it.');
  idleSnapshot='';save();renderIdleJobs();refreshUI();return true;
}
function openIdleHub(){
  data.idleNoticeSlots=idleSlotsUnlocked();save();openWorkshop('blacksmithing','gather');
  $('consolidatedSkills').querySelector('[data-idle-skill]:not(:disabled)')?.focus({preventScroll:true});
}

function toast(title,description=''){rememberNotice(title,description);}
