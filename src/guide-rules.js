/* Player guidance reads the same current rules as progression and combat. */
function guidePercent(value){return Number((value*100).toFixed(3))+'%';}
function masteryMilestonesText(){return 'Reach Zone '+dungeoneeringMilestone(1)+', complete Zone 2, then reach Zones '+[3,4,5].map(dungeoneeringMilestone).join(', ')+'…';}
function skillUnlockText(key){
 const skill=SKILLS[key];if(!skill)return '';
 const tier=skill.tier||1,level=tier>1?(tier-1)*10:['silverMine','silverSmelt'].includes(key)?10:1,group=DISCIPLINES[disciplineFor(key)];
 return [tier>1?equipmentTierGate(tier):'',level>1?group.name+' level '+level:''].filter(Boolean).join(' · ')||'Available at camp';
}
function summoningSpireGuideText(){return 'Walk into an ordinary spire '+SUMMON_BUMPS.normal+' time, or a crowned spire '+SUMMON_BUMPS.royal+' times. Step clear before another walking bump, or use a fresh dash. Each dash through the base counts once, including when already touching it. A teal spire can be bumped without retaliation; a red summoning surge deals '+guidePercent(SUMMON_BUMPS.normalBacklash)+' / '+guidePercent(SUMMON_BUMPS.royalBacklash)+' maximum-health base damage before defenses and regional scaling. Dash through or wait for teal to avoid retaliation. Weapons cannot target or damage spires. They keep summoning after their caster dies; clear the spires and their surviving summons to finish the encounter.';}
function releasedAttackGuideText(){return 'Released projectiles, planted wards and independent hazards continue after their caster falls. Unfinished casts, living channels and effects tied to a living pair stop with their source. Healing and power totems can remain and support another living enemy. Finish remaining danger before advancing; defeat, retry and a new floor clear transient encounter effects.';}
function jewelryRefinementRule(id){return id==='leech'?Number((jewelryRefinementStep(id)*100).toFixed(5))+' percentage points of lifesteal':guidePercent(JEWELRY_REFINEMENT.relativeStep)+' of its base effect';}
function guideAttackName(type,zone){return themedAbility(type)?.name||EXPANDED_ABILITIES[type]?.name||(type==='cleave'?['Briar Sweep','Slag Sweep','Grave Sweep','Rift Sweep'][zone]:specialAttackName(type,zone)||DUNGEON_THEMES[zone]?.[type])||type;}
function gettingStartedGuideHtml(){
 return codexParagraph('Delve for gold, Dungeon Sigils, essence and occasional materials. Gather and refine in Skills to craft equipment, then return to the same floor. Your weapon selects the combat style; armor is a separate choice.')+
 codexHeading('Your route',codexRuleList([
  ['Zone 1','Iron weapons have '+TIER_LIMITS[1].weapon+' refinements. Idle starts at Zone 1, Floor 2.'],
  ['Zone 2','Earn the first Mastery point on entry. Matching skill level 10 unlocks tier-2 work; promote a fully refined Iron style to Steel.'],
  ['Zones 2–4','Steel has '+TIER_LIMITS[2].weapon+' refinements. Complete Zone 2 for the second Mastery point.'],
  ['Mithril','Complete Zone 3 and reach matching skill level 20. Promote an owned Steel style; full Steel refinement is optional. Mithril is intended around Zones 4–5.']]))+
 codexHeading('Currencies',codexRuleList([
  ['Mastery points',masteryMilestonesText()+'. Buy permanent Delving or Skilling speeds in the Dungeon Shop.'],
  ['Dungeon Sigils','Buy permanent combat perks shared by all three styles in this Dungeon.'],
  ['Essence','Enchant an owned combat style in Warding → Equipment.'],
  ['Zone materials','Seeds, cores, dust and shards share upgrade costs and buy Long blessings.'],
  ['Upgrade vouchers','Pay for one named rank on owned equipment, a tool or a station. New gear and promotions still require materials.']]))+
 codexHeading('Time and controls',codexParagraph('Speed is available from the start. Delving offers 0.25×, 0.50×, 0.75× and 1×; Mastery adds faster choices. Skilling starts at 1×, includes active work and idling, and has its own speed selection. Idle produces at 25% of the base active rate, with up to eight real hours of offline work.'))+
 codexParagraph('Hold a work scene, its work button or Space. Skills opens the current discipline; Gather, Refine or Source swaps directly to related work. Recipe ingredients link to their source, and bookmarks track a preparation route.')+
 codexHeading('Combat',codexParagraph('Red hurts you; purple also hurts monsters; teal marks a protected opening or benefit; gold marks a reflect; yellow brackets mark an interruptible target. Move with a drag or WASD/arrows. Dash with Space, Dash or a double tap while moving. Dash-throughs briefly stun special enemies; successful mechanic counters reset dash.'))+
 codexParagraph(releasedAttackGuideText())+
 codexHeading('Your save',codexParagraph('Progress saves on this device. Settings → Backup/Export downloads your progress; Restore loads that backup. Use it when moving between browsers, downloads and the online game.'));
}
function gettingStartedGuideIcon(){return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><title>Getting started guide</title><defs><radialGradient id="guide-stone"><stop stop-color="#5b5040"/><stop offset="1" stop-color="#23251f"/></radialGradient><linearGradient id="guide-pages" x2="0" y2="1"><stop stop-color="#f0dfb5"/><stop offset="1" stop-color="#bbaa80"/></linearGradient></defs><circle cx="64" cy="64" r="60" fill="url(#guide-stone)" stroke="#b8a574" stroke-width="3"/><circle cx="64" cy="64" r="54" fill="none" stroke="#6f6043" stroke-width="1.5"/><path d="M23 36Q44 29 64 40Q84 29 105 36V91Q84 84 64 96Q44 84 23 91Z" fill="#263b35" stroke="#d0b77e" stroke-width="3"/><path d="M29 32Q46 30 64 40Q82 30 99 32V83Q80 81 64 92Q48 81 29 83Z" fill="url(#guide-pages)" stroke="#7e6a45" stroke-width="2"/><path d="M64 41V91" fill="none" stroke="#7e6a45" stroke-width="2"/><g stroke="#8c7a54" stroke-width="2" stroke-linecap="round"><path d="M36 47L53 52M36 58L53 63M36 69L53 74M75 55L91 50M75 67L91 62M75 78L91 73"/></g><path d="M79 33L88 31V52L83 48L79 53Z" fill="#7cc8b4" stroke="#355f51" stroke-width="1.5"/></svg>');}
function installCurrentGuides(){SVG_FILES['codex-game_guide.svg']=gettingStartedGuideIcon();if(!CODEX_ITEMS.some(entry=>entry.id==='game_guide'))CODEX_ITEMS.unshift({id:'game_guide',cat:'Guide',name:'Getting started',desc:'The current route through delving, skills, equipment, currencies and game time.'});}
