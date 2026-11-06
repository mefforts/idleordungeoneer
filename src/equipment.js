/* Crafted armor sets and illustrated, independent equipment. */
const ARMOR_STYLES=BALANCE_CONFIG.equipment.armorStyles;
const ARMOR_SETS=Object.fromEntries(Object.entries(ARMOR_STYLES).flatMap(([style,d])=>d.names.map((name,i)=>[style+'_'+(i+1),{id:style+'_'+(i+1),name,style,group:d.group,tier:i+1,level:BALANCE_CONFIG.equipment.tiers[i+1].skillLevel,health:d.health[i],perk:d.perk[i],cost:d.costs[i],art:'armor-set-'+style+'_'+(i+1)}])));
const WEAPON_LEVELS={sword:1,shield:2,polearm:6,greatsword:10,bow:2,staff:2};
const WEAPON_PREFIXES=['Iron','Steel','Mithril'];
const WEAPON_BASE_NAMES={sword:'Arming Sword',shield:'Sword & Shield',polearm:'Halberd',greatsword:'Greatsword',bow:'Hunting Bow',staff:'Focus Staff'};
let equipmentInstalled=false,equipmentImages=null;
function normalizeEquipment(){
  if(data.equipmentVersion!==1){
    const owned=[];
    for(const [style,s] of Object.entries(data.styles)){
      if(s.armor>0){const tier=s.armor>=4&&tier2Unlocked()?2:1;for(let i=1;i<=tier;i++)owned.push(style+'_'+i);}
    }
    data.ownedArmor=owned;const style=styleForWeapon(data.weaponType);
    data.equippedArmor=owned.filter(id=>ARMOR_SETS[id].style===style).at(-1)||'';
  }
  const old=Array.isArray(data.ownedArmor)?data.ownedArmor:[],future=old.filter(id=>!ARMOR_SETS[id]||!equipmentTierUnlocked(ARMOR_SETS[id].tier));
  data.archivedArmor=[...new Set([...(data.archivedArmor||[]),...future])];
  data.ownedArmor=[...new Set(old.map(id=>{const style=id.split('_')[0];return ARMOR_STYLES[style]?style+'_'+Math.max(1,...equipmentTiers().filter(tier=>tier<=Number(id.split('_')[1])&&equipmentTierUnlocked(tier))):'';}).filter(id=>Object.hasOwn(ARMOR_SETS,id)))];
  if(data.equippedArmor&&!data.ownedArmor.includes(data.equippedArmor)){const style=data.equippedArmor.split('_')[0];data.equippedArmor=data.ownedArmor.includes(style+'_2')?style+'_2':style+'_1';}
  if(!data.ownedArmor.includes(data.equippedArmor))data.equippedArmor='';
  data.equipmentVersion=1;
  if(!data.discovered||typeof data.discovered!=='object')data.discovered={};
  for(const id of data.ownedArmor)data.discovered['armor_set_'+id]=1;
}
function armorLoadout(){return ARMOR_SETS[data.equippedArmor]||null;}

function projectCombatStyle(){
  const s=data.styles?.[combatStyle()];if(!s)return;
  data.weapon=s.weapon;data.enchant=s.enchant;data.armor=armorLoadout()?data.styles[armorLoadout().style].armor:0;s.lastWeapon=data.weaponType;
}

function weaponArt(id=data.weaponType){return 'weapon-art-'+id+'_'+weaponArtTier(id);}
function weaponDisplayName(id=data.weaponType){return TIER_LIMITS[weaponArtTier(id)].name+(['bow','staff'].includes(id)?'-bound ':' ')+WEAPON_BASE_NAMES[id];}
function weaponCraftLevel(id){return levelRange(data[DISCIPLINES[STYLE_DEFS[styleForWeapon(id)].group].xp]||0).lvl;}
function armorRecipeCost(id){const a=ARMOR_SETS[id];return stationCost(a.cost,a.group);}
function syncTrinketHealth(grantIncrease=false){
 if(typeof game==='undefined'||!game.player)return;
 const p=game.player,previous=p.maxHp;p.maxHp=maxHp()+waveVitality();
 p.hp=Math.min(p.maxHp,p.hp+(grantIncrease?Math.max(0,p.maxHp-previous):0));
}
function equipArmor(id,crafted=false){
  if(id&&!data.ownedArmor.includes(id))return false;const old=game.player.maxHp;data.equippedArmor=id;projectCombatStyle();
  game.player.maxHp=maxHp()+waveVitality();game.player.hp=Math.min(game.player.maxHp,game.player.hp+(crafted?Math.max(0,game.player.maxHp-old):0));
  save();refreshUI();return true;
}
function makeArmor(id,voucher){
  const a=ARMOR_SETS[id];if(!a||data.ownedArmor.includes(id))return false;
  if(!equipmentTierUnlocked(a.tier)){toast(TIER_LIMITS[a.tier].name+' armor locked',equipmentTierGate(a.tier)+' and '+DISCIPLINES[a.group].name+' level '+a.level+'.');return false;}
  if(levelRange(data[DISCIPLINES[a.group].xp]||0).lvl<a.level){toast('Training needed',DISCIPLINES[a.group].name+' level '+a.level+' unlocks '+a.name+'.');return false;}
  if(!(voucher===undefined?spendAtStation(a.cost,a.group):spendUpgradeVoucher('armor:'+id,voucher))){toast('Materials needed','Track this armor recipe to gather its ingredients.');return false;}
  data.ownedArmor.push(id);awardDisciplineXp(a.group,40*a.tier,a.tier);codexDiscover('armor_set_'+id);equipArmor(id,true);
  toast(a.name+' crafted & equipped',ARMOR_STYLES[a.style].label+' set · armor and weapons equip independently.');renderDisciplineDrawer();return true;
}
function chooseWeapon(id,voucher){
  if(!Object.hasOwn(WEAPON_TYPES,id))return false;const w=WEAPON_TYPES[id];
  if(!data.unlockedWeapons.includes(id)){
    if(weaponCraftLevel(id)<WEAPON_LEVELS[id]){toast('Training needed',DISCIPLINES[STYLE_DEFS[styleForWeapon(id)].group].name+' level '+WEAPON_LEVELS[id]+' unlocks this weapon.');return false;}
    if(!(voucher===undefined?spendAtStation({bars:w.cost[0],gold:w.cost[1],...(w.extras||{})},STYLE_DEFS[styleForWeapon(id)].group):spendUpgradeVoucher('weapon:'+id,voucher)))return false;
    data.unlockedWeapons.push(id);equipmentWorkXp(styleForWeapon(id),'craft');data.firstWeaponCrafted=true;announceWeaponUpgradeTip();codexDiscover('weapon_'+id);toast(weaponDisplayName(id)+' crafted!','One weapon equipped. Your worn armor stays equipped.');
  }
  data.weaponType=id;projectCombatStyle();inspectedStyle=combatStyle();styleBench=combatStyle();
  game.player.maxHp=maxHp()+waveVitality();game.player.hp=Math.min(game.player.hp,game.player.maxHp);game.attackTimer=Math.max(game.attackTimer,.45);save();refreshUI();return true;
}

function armorPerkText(a){return a.style==='melee'?a.perk+'% damage reduction':a.style==='ranged'?'+'+a.perk+'% movement speed':'+'+a.perk+'% Mage damage';}

function refreshEquipmentUI(){
  if(!equipmentInstalled)return;const focusKey=document.activeElement?.closest('[data-focus-key]')?.dataset.focusKey;
  const worn=armorLoadout(),armor=armorStats();$('armorName').textContent=worn?worn.name:'Travel clothes';$('armorEffect').textContent=maxHp()+' maximum health · '+(worn?ARMOR_STYLES[worn.style].label+' set · '+armorPerkText(worn):'Craft an armor set in Skills');
  $('armorRank').textContent=worn?'T'+worn.tier+' · +'+armor.rank:'—';$('avatarArmorText').textContent=worn?worn.name:'Your chosen travel clothes';
  $('weaponName').textContent=weaponDisplayName()+' +'+data.weapon;$('avatarWeaponText').textContent=weaponDisplayName()+' +'+data.weapon;
  const weaponImg=$('hudWeapon').querySelector('img'),uri=iconAsset(weaponArt());if(weaponImg.getAttribute('src')!==uri)weaponImg.src=uri;
  for(const [id,art] of [['weaponName',weaponArt()],['armorName',worn?.art]]){
    const frame=$(id).closest('.equipment-row')?.querySelector('.equipment-icon');
    if(frame&&frame.dataset.art!==(art||'empty')){frame.innerHTML=art?artHTML(art):'<span aria-hidden="true">◇</span>';frame.dataset.art=art||'empty';}
  }
  const host=$('armorEquipment');if(host){const signature=JSON.stringify([data.equippedArmor,data.ownedArmor,data.styles]);if(host.dataset.signature!==signature){host.innerHTML=armorEquipmentHtml();host.querySelectorAll('button').forEach(bindTouchNavigation);host.dataset.signature=signature;if(focusKey)host.querySelector('[data-focus-key="'+focusKey+'"]')?.focus({preventScroll:true});}}
}
function installEquipmentUI(){
  equipmentInstalled=true;
  $('combatStyles').closest('.panel-section').insertAdjacentHTML('afterend','<section class="panel-section" id="armorEquipment"></section><div class="divider"></div>');
  for(const id of ['consolidatedSkills','armorEquipment'])$(id).addEventListener('click',e=>{
    const craft=e.target.closest('[data-make-armor]'),equip=e.target.closest('[data-equip-armor]'),bench=e.target.closest('[data-armor-bench]');
    if(craft&&!craft.disabled)makeArmor(craft.dataset.makeArmor);
    if(equip&&!equip.disabled){equipArmor(equip.dataset.equipArmor);renderDisciplineDrawer();}
    if(bench)openWorkshop(bench.dataset.armorBench,'equipment');
  });
  DeepwellAvatar.setAssets(PLAYER_ART);const weaponImage=new Image();weaponImage.src=iconAsset('equipment-weapons-atlas');equipmentImages={weapons:weaponImage};
  window.DeepwellEquipmentArt={describe:describeEquipment,paintWeapon:paintEquipmentWeapon};
  installTierProgressionUI();refreshEquipmentUI();
}

function equipmentRegion(d,kind,type){
  const details=describeEquipment(d),key=kind==='armor'?d.equippedArmor:(type||d.weaponType)+'_'+details.weaponTier;
  const image=equipmentImages?.[kind],region=EQUIPMENT_REGIONS[kind][key];
  return image?.complete&&image.naturalWidth&&region?{image,region,details}:null;
}



function legacyGoalDetails(action){
  const [type,id,kind]=String(action||'').split(':');
  if(type==='weapon'&&WEAPON_TYPES[id]){const w=WEAPON_TYPES[id],group=STYLE_DEFS[styleForWeapon(id)].group;return {name:w.name,art:WEAPON_ART[id],cost:stationCost({bars:w.cost[0],gold:w.cost[1],...(w.extras||{})},group),baseCost:{bars:w.cost[0],gold:w.cost[1],...(w.extras||{})},group,done:data.unlockedWeapons.includes(id)};}
  if(type==='upgrade'){
    const style=STYLE_DEFS[id]?id:combatStyle(),k=kind||id;if(!['weapon','armor','enchant','speed','reach'].includes(k))return null;
    return {name:styleRecipeName(style,k)+' +'+(data.styles[style][k]+1),art:'style-'+style+'-'+k,cost:styleUpgradeCost(style,k),baseCost:styleUpgradeBase(style,k),group:upgradeGroup(style,k)};
  }
  if(type==='tool'&&TOOL_DEFS[id]){const t=TOOL_DEFS[id];return {name:t.name,art:t.art,cost:stationCost(t.cost,t.group),baseCost:t.cost,group:t.group,view:'tools',done:data.tools[id]};}
  if(type==='trinket'&&TRINKETS[id])return {name:TRINKETS[id].name,art:TRINKETS[id].icon,cost:stationCost(trinketBase(id),'artisan'),baseCost:trinketBase(id),group:'artisan',done:data.trinkets.includes(id)};
  if(type==='prospect')return {name:'Prospect Opal',art:'rough-opal',cost:stationCost({scraps:12},'scavenging'),baseCost:{scraps:12},group:'scavenging'};
  return null;
}

function legacyRecipeHtml(group){
  if(group==='artisan')return `<div class="recipe-filter" role="group" aria-label="Jewelry type">${[['all','All jewelry'],['ring','Rings'],['amulet','Amulets']].map(([id,name])=>`<button type="button" data-recipe-cat="${id}" class="${recipeCategory===id?'active':''}" aria-pressed="${recipeCategory===id}">${name}</button>`).join('')}</div><div class="craft-tile-list">${Object.entries(TRINKETS).filter(([id,v])=>recipeCategory==='all'||v.type===recipeCategory).map(([id,t])=>recipeCard('',t.name,t.effect,trinketCost(id),`data-craft-trinket="${id}"`,'MAKE',data.trinkets.includes(id),t.type==='ring'?data.equippedRings.includes(id):data.equippedAmulet===id,t.icon)).join('')}</div><p class="recipe-hint">Four ring slots and one amulet slot. Jewelry bonuses remain shared across combat styles.</p>`;
  if(group==='scavenging')return `<div class="craft-tile-list">${recipeCard('','Prospect Opal','Recover a rough opal. Fragments are also used with cloth to inscribe runes.',stationCost({scraps:12},group),'data-prospect-opal','PROSPECT',false,false,'rough-opal')}</div><p class="recipe-hint">Choose Tools to build a mattock, or take fragments to Warding for runes.</p>`;
  return '';
}
