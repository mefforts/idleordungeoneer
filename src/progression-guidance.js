/* Resource and frontier reminders, with explicit actions and saved dismissal. */
function enchantmentGuideStyle(){
 const owned=[combatStyle(),...Object.keys(STYLE_DEFS)].filter((id,i,all)=>all.indexOf(id)===i&&data.unlockedWeapons.some(w=>styleForWeapon(w)===id));
 return owned.find(id=>data.styles[id].enchant===0&&(data.essence||0)>=(styleUpgradeCost(id,'enchant').essence||0));
}
function progressionGuide(){
 if(data.cleared>=1&&dungeoneeringJourney().level===0&&!data.firstMasteryTipSeen)return {id:'mastery',title:'Your first Mastery point',body:'Clear all five Zone 1 floors to reach Zone 2. Choose faster Delving or faster Skilling, including idle.',action:'View delve route',art:'mastery-points'};
 const style=enchantmentGuideStyle();
 if(style&&!data.essenceEnchantTipSeen)return {id:'enchant',style,title:'Put your essence to work',body:'You have enough essence for your first '+STYLE_DEFS[style].name+' enchantment. Warding → Equipment shows the bars and cut gem needed too.',action:'View enchantment',art:'essence'};
 return null;
}
function dismissProgressionGuide(guide){
 if(!guide)return;if(guide.id==='mastery')data.firstMasteryTipSeen=true;else data.essenceEnchantTipSeen=true;save();refreshProgressionGuide();
}
function refreshProgressionGuide(){
 const host=$('progressionGuide');if(!host)return;const guide=progressionGuide(),visible=!!guide&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0&&!game.boss&&!game.manualPaused&&!game.holdSkill&&$('idleUnlockNudge').classList.contains('hidden')&&$('temporaryBuffs').classList.contains('hidden');
 host.classList.toggle('hidden',!visible);if(!visible)return;
 if(host.dataset.guide!==guide.id+':'+(guide.style||'')){
  host.dataset.guide=guide.id+':'+(guide.style||'');host.querySelector('strong').textContent=guide.title;host.querySelector('p').textContent=guide.body;$('progressionGuideOpen').textContent=guide.action+' ›';
 }
 $('skillsNudge').classList.add('hidden');$('quickSkills').classList.remove('skills-suggested');
}
function installProgressionGuidance(){
 if($('progressionGuide'))return;
 $('noticeColumn').insertAdjacentHTML('afterbegin','<aside id="progressionGuide" class="skills-nudge progression-guide hidden" aria-label="Progression tip"><div><strong></strong><p></p><button type="button" id="progressionGuideOpen"></button></div><button type="button" id="progressionGuideDismiss" aria-label="Dismiss progression tip">×</button></aside>');
 $('progressionGuideDismiss').onclick=()=>dismissProgressionGuide(progressionGuide());
 $('progressionGuideOpen').onclick=()=>{const guide=progressionGuide();if(!guide)return;dismissProgressionGuide(guide);if(guide.id==='mastery'){openDelveTravel();return;}styleBench=guide.style;openWorkshop('warding','equipment');const card=$('consolidatedSkills').querySelector('[data-style-upgrade="'+guide.style+':enchant"]')?.closest('article');card?.scrollIntoView({block:'center',behavior:'instant'});card?.querySelector('.codex-link')?.focus({preventScroll:true});};
 $('progressionGuide').querySelectorAll('button').forEach(bindTouchNavigation);
}
