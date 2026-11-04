/* Resource and frontier reminders, with explicit actions and saved dismissal. */
function enchantmentGuideStyle(){
 const owned=[combatStyle(),...Object.keys(STYLE_DEFS)].filter((id,i,all)=>all.indexOf(id)===i&&data.unlockedWeapons.some(w=>styleForWeapon(w)===id));
 return owned.find(id=>data.styles[id].enchant===0&&(data.essence||0)>=(styleUpgradeCost(id,'enchant').essence||0));
}
function progressionGuide(){
 const voucher=(data.voucherGuideQueue||[]).find(key=>data.specificVouchers?.[key]>0)||(!data.voucherIntroSeen?Object.keys(data.specificVouchers||{}).find(key=>data.specificVouchers[key]>0):null);
 if(voucher)return {id:'voucher',key:voucher,title:data.voucherIntroSeen?'Upgrade voucher received':'Your first upgrade voucher',body:voucherLootName('voucher_'+voucher)+'. '+(data.voucherIntroSeen?'View your voucher and matching upgrades.':'Pays for one matching rank on gear you own, a tool or a station. Open it, choose an upgrade, then press Use voucher in Skills.'),action:'View voucher',art:'codex-upgrade_vouchers'};
 if(data.cleared>=1&&dungeoneeringJourney().level===0&&!data.firstMasteryTipSeen)return {id:'mastery',title:'Your first Mastery point',body:'Clear all five Zone 1 floors to reach Zone 2. Choose faster Delving or faster Skilling, including idle.',action:'View delve route',art:'mastery-points'};
 const style=enchantmentGuideStyle();
 if(style&&!data.essenceEnchantTipSeen)return {id:'enchant',style,title:'Put your essence to work',body:'You have enough essence for your first '+STYLE_DEFS[style].name+' enchantment. Warding → Equipment shows the bars and cut gem needed too.',action:'View enchantment',art:'essence'};
 return null;
}
function dismissProgressionGuide(guide){
 if(!guide)return;if(guide.id==='voucher'){data.voucherIntroSeen=true;data.voucherGuideQueue=(data.voucherGuideQueue||[]).filter(key=>key!==guide.key);}else if(guide.id==='mastery')data.firstMasteryTipSeen=true;else data.essenceEnchantTipSeen=true;save();refreshProgressionGuide();
}
function refreshProgressionGuide(){
 const host=$('progressionGuide');if(!host)return;const guide=progressionGuide(),visible=!!guide&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0&&!(game.boss?.hp>0)&&(guide.id==='voucher'||!game.manualPaused)&&!game.holdSkill&&$('idleUnlockNudge').classList.contains('hidden')&&(guide.id==='voucher'||$('temporaryBuffs').classList.contains('hidden'));
 host.classList.toggle('hidden',!visible);if(!visible)return;
 if(host.dataset.guide!==guide.id+':'+(guide.key||guide.style||'')){
  host.dataset.guide=guide.id+':'+(guide.key||guide.style||'');host.querySelector('strong').textContent=guide.title;host.querySelector('p').textContent=guide.body;$('progressionGuideOpen').textContent=guide.action+' ›';
 }
 $('skillsNudge').classList.add('hidden');$('quickSkills').classList.remove('skills-suggested');
}
function installProgressionGuidance(){
 if($('progressionGuide'))return;
 $('noticeColumn').insertAdjacentHTML('afterbegin','<aside id="progressionGuide" class="skills-nudge progression-guide hidden" aria-label="Progression tip"><div><strong></strong><p></p><button type="button" id="progressionGuideOpen"></button></div><button type="button" id="progressionGuideDismiss" aria-label="Dismiss progression tip">×</button></aside>');
 $('progressionGuideDismiss').onclick=()=>dismissProgressionGuide(progressionGuide());
 $('progressionGuideOpen').onclick=()=>{const guide=progressionGuide();if(!guide)return;dismissProgressionGuide(guide);if(guide.id==='voucher'){openVoucherGuide(guide.key);return;}if(guide.id==='mastery'){openDelveTravel();return;}styleBench=guide.style;openWorkshop('warding','equipment');const card=$('consolidatedSkills').querySelector('[data-style-upgrade="'+guide.style+':enchant"]')?.closest('article');card?.scrollIntoView({block:'center',behavior:'instant'});card?.querySelector('.codex-link')?.focus({preventScroll:true});};
 $('progressionGuide').querySelectorAll('button').forEach(bindTouchNavigation);
}
function voucherUpgradeActions(key){
 const [tier,kind]=String(key).split('_'),actions=[...Object.keys(STYLE_DEFS).map(style=>'upgrade:'+style+':'+kind),...Object.keys(TRINKETS).map(id=>'jewelry:'+id),...Object.keys(TOOL_DEFS).map(id=>'tool-upgrade:'+id),...Object.keys(DISCIPLINES).map(id=>'station:'+id)];
 return actions.filter(action=>workshopVoucherOffer(action)?.kind===kind&&canRedeemWorkshopVoucher(action,tier));
}
function openVoucherGuide(key){
 if(!(data.specificVouchers?.[key]>0))return false;equipmentTab='materials';if(drawerKind)closeDrawer();
 const name=voucherLootName('voucher_'+key),actions=voucherUpgradeActions(key);
 showOverlay('<div class="voucher-guide-art">'+artHTML('codex-upgrade_vouchers')+'</div><h2>'+escapeHTML(name)+'</h2><p>'+uiCompact(data.specificVouchers[key])+' owned · Pays for one matching upgrade rank, including its material and gold costs.</p><p>Choose an owned item or named station, then use its voucher button in Skills. Crafting new gear and tier promotions still require materials.</p><div class="voucher-guide-actions">'+(actions.length?actions.map(action=>'<button type="button" data-voucher-action="'+action+'">'+escapeHTML(workshopVoucherOffer(action).name)+' '+uiIcon('arrow')+'</button>').join(''):'<p>Keep this voucher until you own a matching item with an available upgrade. It stays in Inventory → Materials.</p>')+'</div><button type="button" class="voucher-guide-back">Back to vouchers</button>','voucher-guide');
 $('overlayCard').querySelectorAll('[data-voucher-action]').forEach(button=>{button.onclick=()=>openVoucherRecipe(button.dataset.voucherAction,key);bindTouchNavigation(button);});
 const back=$('overlayCard').querySelector('.voucher-guide-back');back.onclick=()=>{hideOverlay();openDrawer('gear');renderEquipmentTab();const row=$('loadoutMaterials').querySelector('[data-inventory-key="voucher_'+key+'"]');row?.scrollIntoView({block:'center'});row?.focus({preventScroll:true});};bindTouchNavigation(back);return true;
}
function openVoucherRecipe(action,key){
 const [type,id,kind]=action.split(':'),group=type==='upgrade'?(kind==='enchant'?'warding':STYLE_DEFS[id].group):type==='station'?id:type==='jewelry'?'artisan':TOOL_DEFS[id].group||'blacksmithing';
 if(type==='upgrade')styleBench=id;hideOverlay();openWorkshop(group,'equipment');const button=document.querySelector('[data-redeem-voucher="'+action+'"][data-voucher-tier="'+key.split('_')[0]+'"]');button?.scrollIntoView({block:'center',behavior:'instant'});button?.focus({preventScroll:true});
}
