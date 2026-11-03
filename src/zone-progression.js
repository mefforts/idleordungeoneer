/* Three authored equipment tiers. Combat power is finite; skill dedication adds
   a small, explicit bonus rather than another unbounded damage multiplier. */
const TIER_LIMITS={1:{name:'Iron',dps:100,weapon:10,armor:5,speed:5,reach:5,enchant:2},2:{name:'Steel',dps:200,weapon:20,armor:10,speed:10,reach:10,enchant:4},3:{name:'Mithril',dps:300,weapon:30,armor:15,speed:15,reach:15,enchant:6}};
const TIER_RESOURCES=['coal','steelBars','willowLogs','ancientSalvage','ancientFragments','garnets','cutGarnets','runicCloth','mithrilOre','mithrilBars','yewLogs','verdantCloth','enchantedSalvage','enchantedFragments','sapphires','cutSapphires'];
const TIER_PROMOTION_COSTS={melee:{steelBars:12,willowLogs:6,ancientFragments:4,cutGarnets:1,gold:100,zoneMaterials:1},ranged:{steelBars:6,willowLogs:18,runicCloth:6,cutGarnets:1,gold:100,zoneMaterials:1},magic:{steelBars:4,runicCloth:18,ancientFragments:6,cutGarnets:2,gold:100,zoneMaterials:1}};
const WEAPON_RIGS={sword:{height:57,grip:[.49,.85]},shield:{height:33,grip:[.5,.5]},polearm:{height:104,grip:[.19,.79]},greatsword:{height:76,grip:[.5,.84]},bow:{height:54,grip:[.16,.5],flip:true},staff:{height:80,grip:[.5,.78]}};
let workshopTier=1,tierProgressionInstalled=false,zone2CampImage=null;
function tier2Unlocked(){return data.cleared>=zoneEnd(0)||data.floor>=zoneStart(1);}
function styleTier(id=combatStyle()){return Math.max(1,...[2,3].filter(tier=>tier<=Number(data.styles?.[id]?.tier)&&equipmentTierUnlocked(tier))); }
function styleUpgradeCap(id,kind){
 const tier=kind==='armor'?ownedArmorTier(id):styleTier(id);
 return TIER_LIMITS[tier][kind]||0;
}
function normalizeTierProgression(){
 for(const key of TIER_RESOURCES)data[key]=Math.max(0,Math.min(1e12,Number(data[key])||0));
 const legacy=data.tierProgressionVersion!==1;
 if(legacy){
  data.legacyProgressionArchive={styles:JSON.parse(JSON.stringify(data.styles)),armor:[...(data.archivedArmor||[]),...(data.ownedArmor||[])]};
 }
 for(const [id,s]of Object.entries(data.styles)){
  s.tier=legacy?(tier2Unlocked()&&s.weapon>=10?2:1):styleTier(id);
  for(const kind of ['weapon','armor','speed','reach','enchant'])s[kind]=Math.min(styleUpgradeCap(id,kind),finiteRank(s[kind]));
 }
 data.tierProgressionVersion=1;
 if(legacy)data.zone2SkillsAnnounced=tier2Unlocked();
 if(SKILLS[data.lastSkill]?.tier>1&&!canUseSkill(data.lastSkill))data.lastSkill='mine';
}
function weaponDamageBase(id=data.weaponType,rank=data.styles[styleForWeapon(id)].weapon){
 const w=WEAPON_TYPES[id],r=Math.max(0,Math.min(TIER_LIMITS[styleTier(styleForWeapon(id))].weapon,rank));
 const starter=14*w.power/w.cooldown*1.05;
 const first=80/1.1,second=160/1.2;
 const third=240/1.3,budget=r<=10?starter+(first-starter)*r/10:r<=20?first+(second-first)*(r-10)/10:second+(third-second)*(r-20)/10;
 const robeAllowance=styleForWeapon(id)==='magic'?Math.min(1,r/10)*.04+Math.max(0,r-10)/10*.04:0;
 return budget*w.cooldown/w.power/1.05/(1+robeAllowance);
}
function styleStats(id=combatStyle()){
 const s=data.styles[id],level=Math.min(50,1+Math.floor(Math.sqrt(s.xp/80))),armor=armorStats(),skillLevel=levelRange(data[DISCIPLINES[STYLE_DEFS[id].group].xp]||0).lvl;
 const proficiencyPercent=(level-1)*3/49,craftsmanshipPercent=Math.min(5,Math.max(0,skillLevel-10)*.1),weapon=id===combatStyle()?data.weaponType:s.lastWeapon;
 return {id,name:STYLE_DEFS[id].name,level,skillLevel,tier:styleTier(id),baseDamage:weaponDamageBase(WEAPON_TYPES[weapon]?weapon:STYLE_DEFS[id].weapon),
  damagePercent:proficiencyPercent+craftsmanshipPercent+(id==='magic'?armor.magic:0),proficiencyPercent,craftsmanshipPercent,
  speedPercent:s.speed*2,reachPercent:s.reach*3,armorHealth:armor.health,guardPercent:armor.guard,movePercent:armor.move};
}
function earnStyleXp(amount,id=combatStyle()){
 const before=styleStats(id).level;data.styles[id].xp+=amount;
 if(styleStats(id).level>before)toast(STYLE_DEFS[id].name+' proficiency '+styleStats(id).level,'Combat proficiency adds up to 3% damage. Dedicated skilling adds up to another 5%.');
}
function armorStats(){
 const set=armorLoadout(),rank=set?Math.min(TIER_LIMITS[set.tier].armor,data.styles[set.style].armor):0;
 return {set,rank,health:set?set.health+rank*8:0,guard:set?.style==='melee'?set.perk+rank*.25:0,move:set?.style==='ranged'?set.perk:0,magic:set?.style==='magic'?set.perk:0};
}
function weaponArtTier(id=data.weaponType){return styleTier(styleForWeapon(id));}
function describeEquipment(d){
 const a=ARMOR_SETS[d.equippedArmor],s=d.styles?.[styleForWeapon(d.weaponType)]||{};
 return {armor:a||null,style:a?.style||'travel',tier:a?.tier||0,weaponTier:Math.max(1,Math.min(3,Number(s.tier)||1))};
}





function paintEquipmentWeapon(c,d,type,pose={x:0,y:0,angle:0}){
 const actual=type||d.weaponType,a=equipmentRegion(d,'weapons',actual),rig=WEAPON_RIGS[actual];if(!a||!rig)return false;
 const [x,y,w,h]=a.region,height=rig.height,width=height*w/h;
 c.save();c.translate(pose.x,pose.y);c.rotate(pose.angle||0);if(rig.flip)c.scale(-1,1);
 if(actual==='bow'){
  const left=-rig.grip[0]*width,top=-rig.grip[1]*height;
  c.beginPath();c.moveTo(left,top);c.lineTo(left+width,top);c.lineTo(left+width*.84,top+height*.1);c.lineTo(left+width*.84,top+height*.9);c.lineTo(left+width,top+height);c.lineTo(left,top+height);c.closePath();c.clip();
 }
 c.drawImage(a.image,x,y,w,h,-rig.grip[0]*width,-rig.grip[1]*height,width,height);c.restore();return true;
}
function promoteStyle(id,voucher){
 if(!STYLE_DEFS[id]||styleTier(id)>=3)return false;const p=promotionDetails(id);
 if(!equipmentTierUnlocked(p.tier)){toast(p.name+' locked',equipmentTierGate(p.tier));return false;}
 if(data.styles[id].weapon<p.rank||weaponCraftLevel(STYLE_DEFS[id].weapon)<p.level){toast('Finish your '+TIER_LIMITS[p.tier-1].name+' training','Refinement '+p.rank+' and '+DISCIPLINES[STYLE_DEFS[id].group].name+' level '+p.level+'.');return false;}
 if(!(voucher===undefined?spendAtStation(p.cost,STYLE_DEFS[id].group):spendUpgradeVoucher('promotion:'+id,voucher)))return false;
 data.styles[id].tier=p.tier;equipmentWorkXp(id,'promotion');if(data.craftGoal==='promotion:'+id)data.craftGoal='';projectCombatStyle();codexDiscover(p.tier===3?'unlock_mithril':'unlock_steel');
 toast(STYLE_DEFS[id].name+' upgraded to '+p.name,'Refinement '+(p.rank+1)+'–'+(p.rank+10)+' unlocked');save();refreshUI();renderDisciplineDrawer();return true;
}
function styleUpgradeBase(id,kind,rank=data.styles[id][kind]||0){
 const tier=kind==='armor'?ownedArmorTier(id):styleTier(id);
 return {...styleUpgradeMaterials(id,kind,rank),...(upgradeZoneMaterialCost(tier,kind,rank)?{zoneMaterials:1}:{})};
}
function styleUpgradeMaterials(id,kind,rank=data.styles[id][kind]||0){
 const s=data.styles[id],r=rank,tier=kind==='armor'?ownedArmorTier(id):styleTier(id),cap=TIER_LIMITS[tier][kind],local=tier>1?Math.max(0,r-TIER_LIMITS[tier-1][kind]):r;
 if(tier===1){
  if(kind==='weapon')return {bars:8+local*5,...(id==='ranged'?{logs:4+local*2}:id==='magic'?{cloth:6+local*2}:{}),gold:preparationUpgradeGold(1,kind,r)};
  if(kind==='armor')return id==='melee'?{bars:6+local*5,gold:25+local*20}:id==='ranged'?{bars:3+local*2,cloth:6+local*4,gold:25+local*20}:{bars:2+local,cloth:12+local*6,gold:25+local*20};
  if(kind==='enchant')return {bars:4+local*3,essence:2+local*2,cutOpals:1};
  return {bars:5+local*3,...(id==='ranged'?{logs:8+local*4}:id==='magic'?{cloth:8+local*4}:{}),gold:kind==='speed'?preparationUpgradeGold(1,kind,r):35+local*20};
 }
 const material=tier===3?'mithrilBars':'steelBars',wood=tier===3?'yewLogs':'willowLogs',cloth=tier===3?'verdantCloth':'runicCloth',fragments=tier===3?'enchantedFragments':'ancientFragments',gem=tier===3?'cutSapphires':'cutGarnets';
 const cost={[material]:(kind==='armor'&&id!=='melee'?4:8)+local*3,gold:['weapon','speed'].includes(kind)?preparationUpgradeGold(tier,kind,r):75+local*35};
 if(id==='ranged')cost[wood]=8+local*3;
 if(id==='magic'||kind==='armor'&&id==='ranged')cost[cloth]=(id==='magic'?12:6)+local*3;
 if(kind==='weapon')cost[fragments]=3+local;
 if(kind==='enchant'){cost.essence=4+local*2;cost[gem]=1+local;}
 return cost;
}
function craftStyleUpgrade(id,kind,voucher){
 if(!STYLE_DEFS[id]||!['weapon','armor','enchant','speed','reach'].includes(kind))return false;
 const s=data.styles[id],cap=styleUpgradeCap(id,kind);if(s[kind]>=cap){toast(TIER_LIMITS[styleTier(id)].name+' limit reached',styleTier(id)===1?'Clear Zone 1 and upgrade this style to Steel for the next tier.':styleTier(id)===2?'Complete Zone 4 and promote this style to Mithril for the next tier.':'This is the current Mithril upgrade limit.');return false;}
 if(kind==='armor'&&!data.ownedArmor.some(key=>ARMOR_SETS[key]?.style===id)){toast('Craft an armor set first','Choose a '+ARMOR_STYLES[id].label+' set above.');return false;}
 if(!(voucher===undefined?spendAtStation(styleUpgradeBase(id,kind),upgradeGroup(id,kind)):spendUpgradeVoucher('upgrade:'+id+':'+kind,voucher)))return false;
 const oldMax=game.player.maxHp;s[kind]++;equipmentWorkXp(id,kind);if(kind==='weapon'){data.firstWeaponCrafted=true;announceWeaponUpgradeTip();}projectCombatStyle();game.player.maxHp=maxHp()+waveVitality();
 if(kind==='armor'&&armorLoadout()?.style===id)game.player.hp=Math.min(game.player.maxHp,game.player.hp+Math.max(0,game.player.maxHp-oldMax));
 if(kind==='enchant')codexDiscover('permanent_enchant');
 toast(STYLE_DEFS[id].name+' '+{weapon:'refinement',armor:'reinforcement',enchant:'enchantment',speed:'attack speed',reach:'reach'}[kind]+' '+s[kind]+' / '+cap,'Permanent '+STYLE_DEFS[id].name+' progression · '+TIER_LIMITS[styleTier(id)].name+' tier');
 save();refreshUI();renderDisciplineDrawer();return true;
}
function canUseSkill(key){const s=SKILLS[key];if(!s)return false;const tier=s.tier||1;return equipmentTierUnlocked(tier)&&(!(tier>1||['silverMine','silverSmelt'].includes(key))||disciplineLevel(disciplineFor(key))>=(tier>1?(tier-1)*10:10));}
function skillLockReason(key){if(canUseSkill(key))return 'Available';const s=SKILLS[key],tier=s?.tier||1,group=DISCIPLINES[disciplineFor(key)],level=tier>1?(tier-1)*10:10;return [!equipmentTierUnlocked(tier)?equipmentTierGate(tier):'',disciplineLevel(disciplineFor(key))<level?group.name+' level '+level:''].filter(Boolean).join(' · ');}

function goToSource(resource){
 if(resource==='gold'||resource==='essence'){closeDrawer();setScene('combat',true);toast(resource==='gold'?'Gold comes from delving or scavenging':'Defeat a guardian for essence');return;}
 const key=RESOURCE_SOURCE[resource];if(!key)return;workshopTier=SKILLS[key].tier||1;
 if(!canUseSkill(key)){openWorkshop(disciplineFor(key),SKILLS[key].cost?'refine':'gather');toast('Resource locked',skillLockReason(key));return;}
 enterActivity(key);
}
function produce(key,active=false){
 const skill=SKILLS[key];if(!skill||!canUseSkill(key)||!spendAtStation(skill.cost||{},disciplineFor(key)))return false;
 const amount=skillYield(key);data[skill.resource]=(data[skill.resource]||0)+amount;
 if(skill.goldGain){data.gold+=skill.goldGain+(data.skillBoosts?.scavenging?1:0)+skill.goldGain*trinketBonus('gold');data.scavengeDry=(data.scavengeDry||0)+1;
  if(Math.random()<.07+trinketBonus('find')||data.scavengeDry>=20){data.scavengeDry=0;const gem=skill.tier===3?'sapphires':skill.tier===2?'garnets':'opals';data[gem]++;codexDiscover('resource_'+gem);if(active)toast(gem==='sapphires'?'Sapphire found!':gem==='garnets'?'Garnet found!':'Opal found!','A rough gem for Artisan');}}
 awardDisciplineXp(disciplineFor(key),active?Math.max(5,Math.floor(skill.gain*.65)):skill.gain,skill.tier||1,skill.xp);
 codexDiscover('discipline_'+disciplineFor(key));codexDiscover('resource_'+skill.resource);codexDiscover('skill_'+key);return amount;
}

function refinementForTarget(id,target=zoneBalance().dps){
 const cap=styleUpgradeCap(styleForWeapon(id),'weapon'),stats=styleStats(styleForWeapon(id)),w=WEAPON_TYPES[id];
 for(let r=0;r<=cap;r++)if(weaponDamageBase(id,r)*w.power*(1+stats.damagePercent/100)*(1+stats.speedPercent/100)/w.cooldown*1.05>=target)return r;
 return null;
}

function skillMenuState(){return JSON.stringify([workshopTier,workshopGroup,workshopView,styleBench,recipeCategory,data.floor,data.cleared,data.weaponType,data.equipmentVersion,data.ownedArmor,data.equippedArmor,data.styles,data.tools,data.toolRefinements,data.trinketRefinements,data.specificVouchers,data.stationLevels,data.stationCredits,data.stationSaved,data.craftGoal,data.idleJobs,data.idleNoticeSlots,game.pendingIdleSkill,...Object.keys(RESOURCE_LABEL).map(k=>data[k]),...Object.values(DISCIPLINES).map(d=>data[d.xp])]);}

function enterActivity(key){
 if(!SKILLS[key])return false;if(!canUseSkill(key)){toast('Activity locked',skillLockReason(key));return false;}
 workshopTier=SKILLS[key].tier||1;closeDrawer();hideOverlay();setScene(key,false);game.menuPaused=!!game.manualPaused;updatePauseHud();save();return true;
}
function goalDetails(action){
 const [type,id,quantity]=String(action||'').split(':');
 if(type==='ammo'&&['arrows','runes'].includes(id)){
  const target=Math.max(1,Math.min(100000,Math.floor(Number(quantity)||30)));
  return {name:(id==='arrows'?'Arrows':'Runes')+' · '+(target*AMMUNITION_SECONDS)+'s supply',art:RESOURCE_ART[id],cost:{[id]:target},target,group:id==='arrows'?'woodworking':'warding',view:'refine',done:(data[id]||0)>=target};
 }
 if(type==='promotion'&&STYLE_DEFS[id]){const p=promotionDetails(id);return {name:STYLE_DEFS[id].name+' '+p.name+' promotion',art:'codex-'+(p.tier===3?'unlock_mithril':'unlock_steel'),cost:stationCost(p.cost||{},STYLE_DEFS[id].group),baseCost:p.cost||{},group:STYLE_DEFS[id].group,view:'equipment',done:styleTier(id)>=3};}
 if(type==='armor'&&ARMOR_SETS[id]){const a=ARMOR_SETS[id];return {name:a.name,art:a.art,cost:armorRecipeCost(id),baseCost:a.cost,group:a.group,view:'equipment',done:data.ownedArmor.includes(id)};}
 return legacyGoalDetails(action);
}
function installTierProgressionUI(){
 if(tierProgressionInstalled)return;tierProgressionInstalled=true;
 for(const [key,sk]of Object.entries(SKILLS).filter(([,s])=>s.tier>=2||s.workPose==='clean')){
  if($(key+'Panel'))continue;const panel=document.createElement('section');panel.className='panel';panel.id=key+'Panel';panel.setAttribute('aria-label',sk.name);$('gameDrawer').append(panel);
  BONUS_DEFS[key]={name:sk.name+' bonus',art:key==='relicClean'?'rough-opal':'action-'+key};
 }
 TOOL_DEFS.pickaxe.skills.push('coal','mithrilMine');TOOL_DEFS.hatchet.skills.push('willow','yew');TOOL_DEFS.mattock.skills.push('ancientScavenge','cleanAncient','garnetSearch','relicClean','deepScavenge','restoreEnchanted','sapphireSearch');
 for(const key of TIER_RESOURCES)if(!CODEX_ITEMS.some(a=>a.id==='resource_'+key))CODEX_ITEMS.push({id:'resource_'+key,cat:'Materials',name:RESOURCE_LABEL[key],desc:equipmentTierGate(SKILLS[RESOURCE_SOURCE[key]].tier)+' material · '+SKILLS[RESOURCE_SOURCE[key]].name+' · '+(SKILLS[RESOURCE_SOURCE[key]].cost?Object.entries(SKILLS[RESOURCE_SOURCE[key]].cost).map(([k,n])=>n+' '+RESOURCE_LABEL[k]).join(' + '):'Gather directly')});
 for(const [id,sk]of Object.entries(SKILLS).filter(([,s])=>s.tier>=2))CODEX_ITEMS.push({id:'skill_'+id,cat:'Skills',name:sk.name,desc:equipmentTierGate(sk.tier)+' and '+DISCIPLINES[disciplineFor(id)].name+' level '+((sk.tier-1)*10)+' · '+sk.item});
 CODEX_ITEMS.push({id:'unlock_mithril',cat:'Weapons',name:'Mithril tier',desc:'Complete Zone 4 and train the matching discipline to level 20. Promote a Steel style at refinement 20; craft the blue ranged, green Mage or Mithril melee set separately.'});
 CODEX_ITEMS.push({id:'unlock_steel',cat:'Weapons',name:'Steel tier',desc:'Clear Zone 1, finish Iron refinement 10, train crafting to level 10 and promote a combat style. Refinement 11–20.'});
 zone2CampImage=new Image();zone2CampImage.src=iconAsset('zone2-gathering');
 $('consolidatedSkills').addEventListener('click',e=>{const promote=e.target.closest('[data-promote-style]'),tier=e.target.closest('[data-workshop-tier]');if(promote&&!promote.disabled)promoteStyle(promote.dataset.promoteStyle);if(tier){workshopTier=Number(tier.dataset.workshopTier);renderDisciplineDrawer();}});
}
function refreshTierProgressionUI(){
 if(!tierProgressionInstalled)return;
 if(equipmentTierUnlocked(3)&&!data.mithrilSkillsAnnounced){data.mithrilSkillsAnnounced=true;toast('Tier 3 equipment available','Mithril melee, blue ranged and green Mage gear. Matching discipline level 20 is required.');}
 if(zoneNumber()===2&&!data.cryptWarningSeen&&game.scene==='combat'&&game.status==='running'&&!game.menuPaused&&!game.manualPaused&&!game.boss&&$('overlay').classList.contains('hidden')){data.cryptWarningSeen=true;toast('The Hollow Crypt','Fallen foes awaken as pursuing souls. Keep moving, and dash across expanding bone rings.');save();}
 if(tier2Unlocked()&&!data.zone2SkillsAnnounced){data.zone2SkillsAnnounced=true;toast('Zone 2 skilling unlocked','Tier 2 recipes are visible in Skills. Each needs level 10 in its matching discipline as well as Zone 2 access.');}
 const key=game.scene;if(SKILLS[key]?.tier>=2){
  $('activeTool').textContent=({mithrilSmelt:'Smithing hammer',mithrilFletch:'Fletching knife',verdantWeave:'Weaving shuttle',verdantRune:'Engraving burin',sapphireCut:'Jeweler’s chisel',steelSmelt:'Smithing hammer',steelFletch:'Fletching knife',aetherWeave:'Weaving shuttle',greaterRune:'Engraving burin',garnetCut:'Jeweler’s chisel'})[key]||TOOL_DEFS[toolForSkill(key)]?.name||'Prospecting mattock';
 }
 if(SKILLS[game.scene]?.workPose==='clean')$('activeTool').textContent='Restoration brush';
}

function defaults(){return {skillXpCurveVersion:0,preparationEconomyVersion:1,preparationEconomyCredit:0,lootPresentationVersion:1,upgradeVouchers:{iron:0,steel:0},voucherRolls:{},lootHistory:[],timeProgressionVersion:1,timeMilestones:0,timeRates:null,legacyDungeoneeringLevel:0,zoneLayoutVersion:1,tierProgressionVersion:0,coal:0,steelBars:0,willowLogs:0,ancientSalvage:0,ancientFragments:0,garnets:0,cutGarnets:0,runicCloth:0,progressionVersion:3,firstWeaponCrafted:false,eliteSpoils:[],eliteSpoilsSequence:0,eliteBoon:null,eliteBoons:null,eliteBoonSequence:0,weaponUpgradeTipSeen:false,firstMasteryTipSeen:false,essenceEnchantTipSeen:false,combatLanguageTipSeen:false,zone2TravelTipSeen:false,masteryRewardVersion:0,earlyMasteryClaimed:false,zoneAbilityVersion:0,styles:null,tools:{},stationLevels:{},stationCredits:{},stationSaved:{},goldHighWater:45,skillsNudgeSeen:false,idleNoticeSlots:0,idleFirstAssigned:false,floor:1,cleared:0,mastery:{},biomeLoot:{},gold:45,essence:0,ore:0,bars:0,weapon:0,armor:0,enchant:0,weaponType:'sword',unlockedWeapons:['sword'],zone:null,zoneShopVersion:0,zoneShops:{},dungeonShopVersion:0,dungeonShops:{},dungeoneeringXp:0,dungeonMastery:null,miningXp:0,smithingXp:0,miningTimer:0,forgeTimer:0,logs:0,arrows:0,ammoCharges:{arrows:0,runes:0},cloth:0,runes:0,scraps:0,scavengeXp:0,scavengingXp:0,scavengeDry:0,silverOre:0,silverBars:0,opals:0,cutOpals:0,artisanXp:0,artisanDisciplineXp:0,trinkets:[],equippedRing:'',equippedRings:[],equippedAmulet:'',devSpeedUnlocked:false,devTravelUnlocked:false,delveGoldRemainder:0,woodXp:0,fletchXp:0,wardXp:0,runeXp:0,idleJobs:[],jobTimers:{},skillBoosts:{},discovered:{},tutorialSeen:false,onboardingDone:false,masteryIntroSeen:false,blacksmithXp:0,woodworkingXp:0,wardingSkillXp:0,lastSkill:'mine',skillAutoReturn:false,custom:DeepwellAvatar.normalizeCustom(),savedAt:Date.now()};}

function drawWorkstationScene(w,h,key){
 const base=SKILLS[key].scene||key,advanced={coal:[0,0],willow:[1,0],ancientScavenge:[0,1],cleanAncient:[0,1],garnetSearch:[1,1],garnetCut:[1,1]}[key];
 const [sheet,oldCol,oldRow]=CAMP_PANELS[base]||[0,0,0],useAdvanced=advanced&&zone2CampImage?.complete&&zone2CampImage.naturalWidth,col=useAdvanced?advanced[0]:oldCol,row=useAdvanced?advanced[1]:oldRow,im=useAdvanced?zone2CampImage:campArt[sheet];
 if(!im?.complete||!im.naturalWidth){drawProceduralWorkstation(w,h,key);return}
 const sw=im.naturalWidth/2,sh=im.naturalHeight/2,sx=col*sw,sy=row*sh,portrait=w/h<.94,t=reducedMotion()?0:game.activeClockMs/1000;
 const focus={wood:.665,mine:.625,silverMine:.625,forge:.68,silverSmelt:.68,fletch:.675,ward:.65,rune:.65,polish:.66,scavenge:.695}[base]||.62;
 const dw=Math.max(w,h*sw/sh),dh=dw*sh/sw,dx=portrait?w*.5-dw*focus:(w-dw)/2,dy=(h-dh)/2;
 ctx.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);
 const activeWorking=game.holdSkill===key&&!$('skillHold').disabled,working=activeWorking||(data.idleJobs.includes(key)&&hasIngredients(skillCost(key)));
 const heroPosition={wood:.60,mine:.53,silverMine:.53,forge:.61,silverSmelt:.61,fletch:.60,ward:.57,rune:.57,polish:.57,scavenge:.59};
 const heroFraction=useAdvanced?(base==='wood'?.64:.62):heroPosition[base];
 const feet=Math.min(dy+dh*.81,game.workAreaBottom??h-(innerWidth<=760?304:230)),bounds=workshopBounds(key),leftMargin=16+(data.hudLayout.side==='left'?52:0),rightMargin=16+(data.hudLayout.side==='right'?52:0);
 const scale=Math.min(clamp(dw/sw*1.15,1.05,2.65),Math.max(.85,(feet-96*(w/innerWidth))/100),(w-leftMargin-rightMargin)/(bounds.right-bounds.left));
 const heroX=clamp(dx+dw*heroFraction,leftMargin-bounds.left*scale,Math.max(leftMargin-bounds.left*scale,w-rightMargin-bounds.right*scale));
 const frame=workshopAnimation(key,activeWorking,working),anchor={x:heroX,y:feet,scale,height:scale*100};
 paintWorkshopSceneEffects(frame,anchor,'back');DeepwellAvatar.render(ctx,{...frame,x:heroX,y:feet,scale});paintWorkshopSceneEffects(frame,anchor,'front');paintWorkshopReward(anchor);

 if(!reducedMotion()){
  const warm=['forge','silverSmelt'].includes(base),points=warm?8:6;
  for(let i=0;i<points;i++){const a=i*2.39+t*.25,px=warm?dx+dw*.25+Math.sin(a)*dw*.035:w*rng(i,83,key.length),py=warm?dy+dh*.48-((t*9+i*22)%(dh*.19)):dy+dh*(.15+rng(i,84)*.5)+Math.sin(t*.3+i)*8;
   ctx.globalAlpha=warm?.30:.18;disc(px,py,warm?1.3:.9,warm?'#ffe0a3':'#fff0c9');}ctx.globalAlpha=1;
 }
}

function setScene(scene,force=true){if(eliteRewardOpen())return false;resetArenaTouch(true);clearSkillBonuses();if(!$('skillQuickPicker').classList.contains('hidden'))closeSkillPicker();
 if(scene==='codex'){showCodex();return}if(!['combat',...SKILL_KEYS].includes(scene))return;if(SKILLS[scene]&&!canUseSkill(scene)){toast('Activity locked',skillLockReason(scene));return;}
 game.holdSkill=null;closeResourcePicker();game.scene=scene;if(SKILLS[scene])codexDiscover('skill_'+scene);
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===scene));
 for(const key of ['combat',...SKILL_KEYS])$(key+'Panel').classList.toggle('panel-active',!drawerKind&&key===scene||drawerKind==='gear'&&key==='combat');
 $('stageWrap').dataset.scene=scene;$('campStrip').classList.toggle('hidden',scene!=='combat');$('announcement').classList.toggle('hidden',scene!=='combat'||game.announcementTime<=0);$('combatTopHUD').classList.toggle('hidden',scene!=='combat');$('bossHud').classList.toggle('hidden',scene!=='combat'||!game.boss);$('joystickZone').classList.toggle('hidden',scene!=='combat');$('dashButton').classList.toggle('hidden',scene!=='combat');
 const sk=SKILLS[scene];$('ambientCaption').textContent=scene==='combat'?'DEFEAT · DISCOVER · DESCEND':DISCIPLINES[disciplineFor(scene)].name.toUpperCase()+' · HOLD TO PRODUCE';
 $('skillActionBar').classList.toggle('hidden',scene==='combat');$('arenaBottomActions').classList.toggle('hidden',scene!=='combat');$('quickPause').classList.toggle('hidden',scene!=='combat');updatePauseHud();
 if(sk){data.lastSkill=scene;codexDiscover('discipline_'+disciplineFor(scene));}
 $('sceneEyebrow').textContent=scene==='combat'?biomeLabel():'THE LIVING CAMP';$('sceneTitle').textContent=scene==='combat'?biome().name:DISCIPLINES[disciplineFor(scene)].name;
 $('sceneSubtitle').textContent=scene==='combat'?'Zone '+(zoneNumber()+1)+' · stage '+zoneStage()+'/'+zoneFloorCount()+' · '+biomeDetail()+' · '+floorModifier():'✋ Hold scene to work · ◷ Idle unlocks on Floor 2';$('floorPill').classList.toggle('hidden',scene!=='combat');
 $('stageStatus').textContent=scene==='combat'?'ACTIVE DELVE':data.idleJobs?.includes(scene)?'◷ BACKGROUND JOB ACTIVE':'✋ ACTIVE ONLY';$('controlsText').textContent=scene==='combat'?'WASD TO MOVE · SPACE TO DASH':'HOLD THE SCENE TO WORK';
 if(force){if(scene==='combat'){if(game.status==='ready')intro();else if(game.status==='upgrade')showUpgrade();else if(game.status==='clear')showClearAgain();else if(game.status==='dead')showDeathAgain();else hideOverlay();}else hideOverlay()}
 resize();refreshUI();
}

function attack(){
 const p=game.player,style=weaponInfo(),reach=attackReach(),targets=combatTargets().map(e=>({e,d:bodyDistance(e,p.x,p.y),point:bodyPoint(e,p.x,p.y)})).filter(o=>o.d<reach).sort((a,b)=>a.d-b.d);
 if(!targets.length)return false;
 if(enemyShieldMultiplier(targets[0].e)<1){const protectedEnemy=targets[0].e,index=targets.findIndex(t=>protectedEnemy.guardIds?.includes(t.e)||t.e.shieldLink?.target===protectedEnemy);if(index>0)targets.unshift(targets.splice(index,1)[0]);}
 if(isRanged()&&p.aimTarget){const index=targets.findIndex(o=>o.e===p.aimTarget);if(index>0)targets.unshift(targets.splice(index,1)[0]);}
 const first=targets[0],angle=Math.atan2(first.point.y-p.y,first.point.x-p.x);
 p.facing=Math.cos(angle)<0?-1:1;p.aimFacing=p.facing;p.aimAngle=angle;p.aimTarget=first.e;p.attackPose=.38;
 let damage=attackDamage()*(p.rallyTime>0?1.1:1);if(data.weaponType==='greatsword'&&p.hp<p.maxHp*.5)damage*=1.65;
 if(isRanged()){
  const ammo=ammunitionResource();if(!loadAmmunition(ammo)){if(game.frame-(game.lastAmmoMessage||0)>2){game.lastAmmoMessage=game.frame;floater(p.x,p.y-39,'NEED '+ammo.toUpperCase(),'#e8bba1');}return false;}
  const socket=DeepwellAvatar.poseRig({pose:'combat',attack:1,aimAngle:localAimAngle(p.aimAngle),data}),hand=data.weaponType==='bow'?socket.main:socket.back,origin={x:p.x+hand.x*p.facing*.98,y:p.y+18+hand.y*.98},speed=data.weaponType==='bow'?360:295;
  for(let i=0;i<1+waveRank('multishot');i++){
   const target=targets[Math.min(i,targets.length-1)].e,point=bodyPoint(target,origin.x,origin.y),a=Math.atan2(point.y-origin.y,point.x-origin.x);
   game.shots.push({x:origin.x,y:origin.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,damage:damage*(i===0?1:.15),combatStyle:combatStyle(),life:Math.max(1.4,(reach+90)/speed),pierce:waveRank('pierce'),ricochet:data.weaponType==='staff'?waveRank('echo'):0,homing:data.weaponType==='staff'?waveRank('technique'):0,hits:new Set(),magic:data.weaponType==='staff'});
  }
 }else{
  const maxHits=(data.weaponType==='greatsword'?4:data.weaponType==='polearm'?3:1)+waveRank('cleave'),cone=data.weaponType==='greatsword'?1.65:data.weaponType==='polearm'?.68:1.05;let hits=0;
  for(const t of targets){if(hits>=maxHits)break;const a=Math.atan2(t.point.y-p.y,t.point.x-p.x),delta=Math.atan2(Math.sin(a-angle),Math.cos(a-angle));if(Math.abs(delta)>cone)continue;dealDamage(t.e,damage*(hits?.84:1),p.x,p.y);hits++;}
  game.swings.push({x:p.x,y:p.y,angle,reach:reach*.94,cone,life:.22,max:.22,style:data.weaponType});burst(p.x+Math.cos(angle)*reach*.48,p.y+Math.sin(angle)*reach*.48,3,'#f8d7a0');
 }
 return true;
}
function drawPlayer(p){
 if(p.invuln>0&&!game.menuPaused&&!game.manualPaused&&!reducedMotion()&&Math.sin(game.frame*38)>0)return;
 if(p.dashTime>0){glow(p.x,p.y-3,64,'#86efdd9a');for(let i=1;i<=3;i++){ctx.save();ctx.globalAlpha=.2/i;ellipse(p.x-p.dashDX*i*21,p.y-p.dashDY*i*21,22,14,'#affff2');ctx.restore()}}
 DeepwellAvatar.render(ctx,{x:p.x,y:p.y+18,scale:.98,time:game.frame,pose:'combat',dash:p.dashTime>0,vx:p.vx,vy:p.vy,facing:p.facing,aimAngle:localAimAngle(p.aimAngle),attack:p.attackPose/.38,charge:data.weaponType==='bow'?clamp(1-game.attackTimer/attackCooldown(),0,1):0,hit:p.hitPose/.26,data});
}

function localAimAngle(angle=0){return Math.max(-.8,Math.min(.8,Math.atan2(Math.sin(angle),Math.abs(Math.cos(angle)))));}
function updateCombatAim(){
 const p=game.player;if(!isRanged()){p.aimTarget=null;return;}
 const reach=attackReach(),available=combatTargets(),inRange=e=>available.includes(e)&&e.hp>0&&bodyDistance(e,p.x,p.y)<reach;
 const ranked=available.filter(inRange).sort((a,b)=>(data.weaponType==='staff'&&waveRank('technique')?Number(!!(b.elite||b.boss))-Number(!!(a.elite||a.boss)):0)||bodyDistance(a,p.x,p.y)-bodyDistance(b,p.x,p.y));
 let target=data.weaponType==='staff'&&waveRank('technique')?ranked[0]:p.aimTarget&&inRange(p.aimTarget)?p.aimTarget:ranked[0];
 if(target&&enemyShieldMultiplier(target)<1){const source=available.find(enemy=>enemy.shieldLink?.target===target&&inRange(enemy)||target.guardIds?.includes(enemy)&&inRange(enemy));if(source)target=source;}
 if(target){const point=bodyPoint(target,p.x,p.y);p.aimTarget=target;p.aimAngle=Math.atan2(point.y-p.y,point.x-p.x);if(Math.abs(point.x-p.x)>3)p.aimFacing=point.x<p.x?-1:1;p.facing=p.aimFacing||p.facing;}
 else{p.aimTarget=null;p.aimAngle=p.facing<0?Math.PI:0;}
}
