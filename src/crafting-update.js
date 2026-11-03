/* Fine jewelry/tool work, visible material gates and an expensive essence sink. */
const JEWELRY_REFINEMENT={maximum:50,relativeStep:.0025,xp:80};
const TOOL_REFINEMENT={maximum:10,speedStep:.005};
// Save-load offline production runs before the later levelRange const exists.
function disciplineLevel(group){const xp=Number(data[DISCIPLINES[group].xp])||0;let level=1;while(level<99&&xp>=20*level*level+10*level)level++;return level;}
function masteryMilestoneLabel(rank){return rank===2?'Complete Zone 2':'Reach Zone '+dungeoneeringMilestone(rank);}
function remainingSummonThreats(){return (game.totems||[]).some(t=>t.destructible&&t.hp>0)||game.enemies.some(e=>e.summoned&&e.summonTotem&&e.hp>0);}
function completeSummonCleanup(){if(game.phaseCleanupPending&&!remainingSummonThreats()&&game.status==='running')finishPhase();}
function normalizeArtisanProgression(){
 if(data.artisanProgressionVersion!==1){for(const key of ['artisanXp','artisanDisciplineXp'])data[key]=Math.min(1e10,Math.max(0,Number(data[key])||0)*8);data.artisanProgressionVersion=1;}
 data.trinketRefinements=Object.fromEntries(['leech','coin','scholar','reach','vigor','guard','haste','fortune'].map(id=>[id,Math.max(0,Math.min(50,Math.floor(Number(data.trinketRefinements?.[id])||0)))]));
 data.toolRefinements=Object.fromEntries(['pickaxe','hatchet','mattock'].map(id=>[id,Math.max(0,Math.min(10,Math.floor(Number(data.toolRefinements?.[id])||0)))]));
}
function jewelryRank(id){return data.trinketRefinements?.[id]||0;}
function refinedTrinketValue(id){return (TRINKETS[id]?.value||0)*(1+jewelryRank(id)*JEWELRY_REFINEMENT.relativeStep);}
function refinedTrinketBonus(key){return [...(data.equippedRings||[]),data.equippedAmulet].reduce((sum,id)=>sum+(TRINKETS[id]?.bonus===key?refinedTrinketValue(id):0),0);}
function jewelryValueText(id,value=refinedTrinketValue(id)){
 const item=TRINKETS[id];if(!item)return '';const number=n=>Number(n.toFixed(5));
 return ['hp','pickup'].includes(item.bonus)?'+'+number(value)+' '+(item.bonus==='hp'?'maximum HP':'pickup radius'):number(value*100)+'% '+({leech:'lifesteal',gold:'gold',xp:'material chance',guard:'damage reduction',speed:'movement speed',find:'rare finds'}[item.bonus]);
}
function jewelryRefinementBase(id){const rank=jewelryRank(id);return {silverBars:1+Math.floor(rank/10),gold:10+rank*3,...(rank%5===4?{cutOpals:1}:{})};}
function refineJewelry(id,voucher){
 if(!TRINKETS[id]||!data.trinkets.includes(id)||jewelryRank(id)>=JEWELRY_REFINEMENT.maximum)return false;
 if(!(voucher===undefined?spendAtStation(jewelryRefinementBase(id),'artisan'):spendUpgradeVoucher('jewelry:'+id,voucher)))return false;
 data.trinketRefinements[id]++;data.artisanXp+=JEWELRY_REFINEMENT.xp;data.artisanDisciplineXp+=JEWELRY_REFINEMENT.xp;syncTrinketHealth();
 toast(TRINKETS[id].name+' · refinement '+jewelryRank(id),jewelryValueText(id));save();refreshUI();renderDisciplineDrawer();return true;
}
function toolRank(id){return data.toolRefinements?.[id]||0;}
function toolRefinementBase(id){const rank=toolRank(id),t=TOOL_DEFS[id];return {...Object.fromEntries(Object.entries(t.cost).filter(([k])=>k!=='gold').map(([k,n])=>[k,Math.max(1,Math.ceil(n*.25))+rank])),gold:10+rank*5};}
function toolRefinementCost(id){return stationCost(toolRefinementBase(id),TOOL_DEFS[id].group);}
function refineTool(id,voucher){
 const t=TOOL_DEFS[id];if(!t||!data.tools[id]||toolRank(id)>=TOOL_REFINEMENT.maximum)return false;
 if(voucher===undefined){if(!spendAtStation(toolRefinementBase(id),t.group))return false;}else if(!spendUpgradeVoucher('tool-upgrade:'+id,voucher))return false;
 data.toolRefinements[id]++;data[DISCIPLINES[t.group].xp]=(data[DISCIPLINES[t.group].xp]||0)+20;toast(t.name+' · refinement '+toolRank(id),'+'+Number((8+toolRank(id)*.5).toFixed(1))+'% active work speed');save();refreshUI();renderDisciplineDrawer();return true;
}
function transmutationResources(){return ['ore','logs','cloth','scraps','silverOre','opals','coal','willowLogs','ancientSalvage','garnets'];}
function canTransmuteResource(key){return transmutationResources().includes(key)&&canUseSkill(RESOURCE_SOURCE[key]);}
function transmuteEssence(key){
 if(!canTransmuteResource(key)||data.essence<100)return false;const amount=1+Math.floor(Math.random()*10);spendIngredients({essence:100});data[key]=(data[key]||0)+amount;
 data.wardingSkillXp=(data.wardingSkillXp||0)+25;data.wardXp=(data.wardXp||0)+25;codexDiscover('resource_'+key);toast('Essence transmuted','100 essence → '+amount+' '+RESOURCE_LABEL[key]);save();refreshUI();renderDisciplineDrawer();return amount;
}
function transmutationHtml(){
 const key=transmutationResources().includes(data.transmuteResource)?data.transmuteResource:'ore';
 return uiSection('Essence transmutation','<article class="craft-tile compact-recipe"><div class="craft-tile-icon">'+artHTML(RESOURCE_ART[key])+'</div><div class="craft-tile-body"><strong>Transmute essence</strong><small>100 essence → 1–10 raw resources</small><select id="transmuteResource" data-focus-key="transmute-choice" aria-label="Transmutation resource">'+transmutationResources().map(id=>'<option value="'+id+'" '+(id===key?'selected':'')+' '+(canTransmuteResource(id)?'':'disabled')+'>'+RESOURCE_LABEL[id]+(canTransmuteResource(id)?'':' · '+skillLockReason(RESOURCE_SOURCE[id]))+'</option>').join('')+'</select>'+materialCosts({essence:100})+'</div><div class="recipe-actions"><button type="button" data-transmute-resource="'+key+'" data-focus-key="transmute-'+key+'" '+(data.essence<100||!canTransmuteResource(key)?'disabled':'')+'>Transmute</button></div></article><p class="recipe-hint">Each conversion spends the full essence cost. Material unlocks still apply.</p>');
}

function workCard(key){
 const sk=SKILLS[key],locked=!canUseSkill(key),cost=skillCost(key),held=data[sk.resource]||0,cycle=skillInterval(key),name=key==='relicClean'?'Prospect relics':skillShortName(key),hint=locked?skillLockReason(key):sk.name+' · +'+skillYield(key)+' '+RESOURCE_LABEL[sk.resource]+' every '+cycle.toFixed(1)+'s';
 const recipe=Object.entries(cost).filter(([,n])=>n>0).map(([k,n])=>'<span>'+artHTML(RESOURCE_ART[k])+'<b>'+n+'</b></span>').join('');
 return '<article class="work-card compact-work-card '+(locked?'locked':'')+'" data-work-tier="'+(sk.tier||1)+'"><button type="button" class="work-open" data-enter-activity="'+key+'" data-focus-key="work-'+key+'" aria-label="'+escapeHTML(hint)+'" data-hint="'+escapeHTML(hint)+'" '+(locked?'disabled':'')+'>'+artHTML(key==='relicClean'?'rough-opal':'action-'+key)+'<span class="work-copy"><strong>'+name+'</strong><span class="work-metrics">'+(recipe?'<span class="work-inputs">'+recipe+'</span>'+uiIcon('arrow'):'')+workshopYieldHtml(key)+'<span>'+cycle.toFixed(1)+'s</span></span></span><span class="work-stock" aria-label="'+format(held)+' in stock">'+uiIcon('bag')+'<b>'+uiCompact(held)+'</b></span>'+uiIcon(locked?'lock':'chevron')+'</button><div class="work-card-buttons">'+idleButtonHtml(key)+'</div>'+(locked?'<span class="work-lock">'+uiIcon('lock')+escapeHTML(skillLockReason(key))+'</span>':sk.tier===2?'<span class="work-tier-tag">Tier 2</span>':'')+'</article>';
}
function renderDisciplineDrawer(){
 if(drawerKind!=='skills')return;if(workshopView==='tools')workshopView='equipment';
 const host=$('consolidatedSkills'),scroll=$('gameDrawer').scrollTop,focus=document.activeElement?.closest('[data-focus-key]')?.dataset.focusKey,planWasOpen=$('preparationRoute')?.open||false,d=DISCIPLINES[workshopGroup],xp=levelRange(data[d.xp]||0),simple=workshopView!=='equipment';
 const actions=d.actions.filter(k=>workshopView==='gather'?!SKILLS[k].cost:!!SKILLS[k].cost),idleKey=d.actions.includes(game.scene)?game.scene:d.actions.includes(data.lastSkill)?data.lastSkill:actions[0]||d.actions[0];
 let content=simple?'<div class="work-grid">'+actions.map(workCard).join('')+'</div>':recipeHtml(workshopGroup)+stationToolsHtml(workshopGroup);
 if(workshopGroup==='artisan'&&workshopView==='gather')content='<div class="source-pair">'+[['opals','Rough opal'],['silverBars','Silver bars']].map(([k,name])=>'<button type="button" data-source="'+k+'" data-hint="Get '+name+'">'+artHTML(RESOURCE_ART[k])+'<span>'+name+'</span><b>'+uiCompact(data[k])+'</b>'+uiIcon('chevron')+'</button>').join('')+'</div>'+content;
 if(workshopGroup==='warding'&&workshopView==='refine')content+=transmutationHtml();
 host.innerHTML='<nav class="workshop-tabs" aria-label="Skill discipline">'+Object.entries(DISCIPLINES).map(([id,v])=>'<button type="button" data-workshop-group="'+id+'" data-focus-key="group-'+id+'" class="workshop-tab '+(workshopGroup===id?'active':'')+'" aria-pressed="'+(workshopGroup===id)+'" data-hint="'+v.name+' · Level '+levelRange(data[v.xp]||0).lvl+'">'+artHTML('codex-discipline_'+id)+'<span>'+({blacksmithing:'Smithing',woodworking:'Woodwork',scavenging:'Scavenge'}[id]||v.name)+'</span></button>').join('')+'</nav><div class="discipline-hero"><div class="discipline-heading"><h3>'+d.name+'</h3><span class="discipline-level">'+xp.lvl+'</span></div>'+codexLink('discipline_'+workshopGroup,d.name+' guide')+'</div><div class="discipline-xp" role="progressbar" aria-label="'+d.name+' experience" aria-valuenow="'+Math.round(xp.pct)+'" aria-valuemin="0" aria-valuemax="100" data-hint="'+format(xp.cur)+' / '+format(xp.needed)+' XP"><i style="width:'+xp.pct+'%"></i></div><nav class="workflow-tabs systems-workflow" aria-label="Production step">'+[['gather','Gather'],['refine','Refine'],['equipment','Equipment']].map(([id,name])=>'<button type="button" data-workshop-view="'+id+'" data-focus-key="view-'+id+'" class="'+(workshopView===id?'active':'')+'" aria-pressed="'+(workshopView===id)+'">'+name+'</button>').join('')+'</nav>'+idlePickerHtml()+preparationHtml()+content+(!simple?'<div class="discipline-idle-toolbar"><span>'+skillShortName(idleKey)+'</span>'+idleButtonHtml(idleKey)+'</div>':'');
 bindWorkshop(host);if($('preparationRoute'))$('preparationRoute').open=planWasOpen;skillMenuSignature=skillMenuState();$('gameDrawer').scrollTop=scroll;
 if(focus){const next=host.querySelector('[data-focus-key="'+focus+'"]');(next?.disabled?next.closest('article')?.querySelector('.codex-link'):next)?.focus({preventScroll:true});}
}
function tierPromotionHtml(style){
 if(styleTier(style)===2)return '';const cost=stationCost(TIER_PROMOTION_COSTS[style],STYLE_DEFS[style].group),reason=goalRequirement('promotion:'+style),ready=!reason&&hasIngredients(cost),weapon=STYLE_DEFS[style].weapon;
 return '<article class="craft-tile compact-recipe tier-promotion"><div class="craft-tile-icon">'+artHTML('weapon-art-'+weapon+'_2')+'</div><div class="craft-tile-body"><div class="recipe-title"><strong>Upgrade to Steel</strong>'+codexLink('unlock_steel','Steel requirements')+'</div><small>'+(reason||'Unlock the next ranks for this weapon style')+'</small>'+materialCosts(cost,'promotion:'+style)+'</div><div class="recipe-actions"><button type="button" data-promote-style="'+style+'" data-focus-key="promote-'+style+'" '+(ready?'':'disabled')+'>Promote</button>'+trackRecipeButton('promotion:'+style,'Steel promotion')+'</div></article>';
}
function stationToolsHtml(group){
 const rank=stationRank(group),cost=stationUpgradeCost(group),tools=Object.entries(TOOL_DEFS).filter(([,t])=>t.group===group);
 const station='<article class="craft-tile compact-recipe" data-station-card="'+group+'"><div class="craft-tile-icon">'+artHTML('station-'+group)+'</div><div class="craft-tile-body"><div class="recipe-title"><strong>Station</strong><span class="recipe-rank">'+rank+' / 5</span>'+codexLink('discipline_'+group,'Station upgrades')+'</div><div class="recipe-effects"><span>'+uiIcon('speed')+' +'+rank*3+'%</span><span>'+uiIcon('bag')+' '+rank*2+'% saved</span></div>'+(rank<5?materialCosts(cost,'station:'+group)+workshopVoucherButtonHtml('station:'+group):'')+'</div><div class="recipe-actions"><button type="button" data-unified-upgrade="'+group+'" data-focus-key="upgrade-station-'+group+'" '+(rank>=5||!hasIngredients(cost)?'disabled':'')+'>'+(rank>=5?'Max':'Upgrade')+'</button></div></article>';
 return uiSection('Workshop upgrades','<div class="craft-tile-list">'+station+tools.map(([id,t])=>{
  const owned=data.tools[id],rank=toolRank(id),maxed=rank>=TOOL_REFINEMENT.maximum,cost=owned?toolRefinementCost(id):stationCost(t.cost,group),action=owned?'data-refine-tool="'+id+'"':'data-craft-tool="'+id+'"';
  return '<article class="craft-tile compact-recipe"><div class="craft-tile-icon">'+artHTML(t.art)+'</div><div class="craft-tile-body"><strong>'+t.name+'</strong><small>'+(owned?'Refinement '+rank+' / '+TOOL_REFINEMENT.maximum+' · +'+Number((8+rank*.5).toFixed(1))+'% active speed':'Craft to equip · +8% active speed')+'</small>'+(!maxed?materialCosts(cost,(owned?'tool-upgrade:':'tool:')+id)+(owned?workshopVoucherButtonHtml('tool-upgrade:'+id):''):'')+'</div><div class="recipe-actions"><button type="button" '+action+' data-focus-key="'+(owned?'refine-tool-':'craft-tool-')+id+'" '+(maxed||!hasIngredients(cost)?'disabled':'')+'>'+(maxed?'Max':owned?'Refine':'Craft')+'</button></div></article>';
 }).join('')+'</div>');
}
function jewelryRefinementHtml(id){
 const rank=jewelryRank(id),cost=stationCost(jewelryRefinementBase(id),'artisan'),maxed=rank>=JEWELRY_REFINEMENT.maximum,step=TRINKETS[id].value*JEWELRY_REFINEMENT.relativeStep;
 return '<article class="craft-tile compact-recipe jewelry-refinement"><div class="craft-tile-icon">'+artHTML(TRINKETS[id].icon)+'</div><div class="craft-tile-body"><strong>Refine '+TRINKETS[id].name+'</strong><span class="recipe-rank">'+rank+' / '+JEWELRY_REFINEMENT.maximum+'</span><small>'+jewelryValueText(id)+' · next +'+jewelryValueText(id,step).replace(/^\+/,'')+'</small>'+(!maxed?materialCosts(cost,'jewelry:'+id)+workshopVoucherButtonHtml('jewelry:'+id):'')+'</div><div class="recipe-actions"><button type="button" data-refine-jewelry="'+id+'" data-focus-key="refine-jewelry-'+id+'" '+(maxed||!hasIngredients(cost)?'disabled':'')+'>'+(maxed?'Max':'Refine')+'</button></div></article>';
}
function recipeHtml(group){
 if(['blacksmithing','woodworking','warding'].includes(group))return classEquipmentHtml(group);
 if(group!=='artisan')return '';
 return '<div class="recipe-filter" role="group" aria-label="Jewelry type">'+[['all','All jewelry'],['ring','Rings'],['amulet','Amulets']].map(([id,name])=>'<button type="button" data-recipe-cat="'+id+'" class="'+(recipeCategory===id?'active':'')+'" aria-pressed="'+(recipeCategory===id)+'">'+name+'</button>').join('')+'</div><div class="craft-tile-list">'+Object.entries(TRINKETS).filter(([,t])=>recipeCategory==='all'||t.type===recipeCategory).map(([id,t])=>recipeCard('',t.name,jewelryValueText(id),trinketCost(id),'data-craft-trinket="'+id+'"','MAKE',data.trinkets.includes(id),t.type==='ring'?data.equippedRings.includes(id):data.equippedAmulet===id,t.icon)+(data.trinkets.includes(id)?jewelryRefinementHtml(id):'')).join('')+'</div><p class="recipe-hint">Four ring slots and one amulet. Each refinement adds only 0.25% of the item’s base effect; crafting new jewelry still requires its materials.</p>';
}
