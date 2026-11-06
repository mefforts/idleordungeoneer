/* Touch movement, full-sized navigation art and material inventory. */
let arenaTouch=null,mobileInstalled=false,touchNavigationClick=null,arenaDashTaps=new Map(),lastArenaDashTap=null;
let materialInventoryQuery='',materialInventoryOwner=null;
function installGameplaySelectionGuard(){
 const stage=$('stageWrap');
 // Menus and native editing/copy controls keep their browser behavior. New
 // copyable controls inside the stage can opt out with data-native-selection.
 const native='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-native-selection],#overlay,#tourPanel,#resourcePicker,#skillQuickPicker,#settingsExport,#settingsImport,#settingsImportFile';
 for(const type of ['selectstart','contextmenu','dragstart'])stage.addEventListener(type,e=>{
  const target=e.target instanceof Element?e.target:e.target.parentElement;
  if(target&&!target.closest(native))e.preventDefault();
 });
}
function bindTouchNavigation(button){
 if(!button||button.dataset.touchNavigation)return;button.dataset.touchNavigation='1';let press=null;
 button.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){press=null;return;}press={pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false};});
 button.addEventListener('pointermove',e=>{if(press?.pointer===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>9)press.moved=true;});
 button.addEventListener('pointercancel',()=>{press=null;});
 button.addEventListener('pointerup',e=>{
  const p=press;press=null;if(!p||p.pointer!==e.pointerId||p.moved||button.disabled||!button.isConnected)return;
  const r=button.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  e.preventDefault();touchNavigationClick={x:e.clientX,y:e.clientY,time:performance.now()};button.focus({preventScroll:true});button.click();
 });
}
function resetArenaTouch(clearTaps=false){
 if(clearTaps)game.movementTap=null;
 arenaDashTaps.clear();lastArenaDashTap=null;
 const previous=arenaTouch;arenaTouch=null;
 if(previous){game.joystick.pointer=null;game.joystick.x=game.joystick.y=0;try{if(canvas.hasPointerCapture(previous.pointer))canvas.releasePointerCapture(previous.pointer);}catch(_){}}
 $('arenaTouchGuide')?.classList.add('hidden');
}
function moveArenaTouch(e){
 const extra=arenaDashTaps.get(e.pointerId);if(extra){if(Math.hypot(e.clientX-extra.x,e.clientY-extra.y)>12)extra.moved=true;e.preventDefault();e.stopImmediatePropagation();return;}
 if(!arenaTouch||arenaTouch.pointer!==e.pointerId)return;
 if(!movementDashAllowed()){resetArenaTouch(true);return;}
 e.preventDefault();e.stopImmediatePropagation();
 let dx=e.clientX-arenaTouch.x,dy=e.clientY-arenaTouch.y,distance=Math.hypot(dx,dy);
 if(distance>48){arenaTouch.x=e.clientX-dx/distance*48;arenaTouch.y=e.clientY-dy/distance*48;dx=e.clientX-arenaTouch.x;dy=e.clientY-arenaTouch.y;distance=48;}
 const moving=distance>8;game.joystick.x=moving?dx/distance:0;game.joystick.y=moving?dy/distance:0;
 if(moving&&!arenaTouch.noted){arenaTouch.noted=true;noteMovementTap(game.joystick.x,game.joystick.y,'arena-touch');}
 const guide=$('arenaTouchGuide'),bounds=$('stageWrap').getBoundingClientRect();
 guide.classList.toggle('hidden',!moving);guide.style.left=(arenaTouch.x-bounds.left)+'px';guide.style.top=(arenaTouch.y-bounds.top)+'px';
 guide.firstElementChild.style.transform='translate('+dx*.55+'px,'+dy*.55+'px)';
}
function endArenaTouch(e){
 const tap=arenaDashTaps.get(e.pointerId);
 if(tap){
  arenaDashTaps.delete(e.pointerId);e.preventDefault();e.stopImmediatePropagation();
  const now=performance.now(),moving=arenaTouch&&Math.hypot(game.joystick.x,game.joystick.y)>.18;
  if(e.type!=='pointerup'||tap.moved||now-tap.time>230||!moving||!movementDashAllowed()){lastArenaDashTap=null;return;}
  const previous=lastArenaDashTap;
  if(previous&&now-previous.time>=25&&now-previous.time<=320&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<80){
   lastArenaDashTap=null;if(game.player.dashCooldown<=0){game.player.vx=game.joystick.x;game.player.vy=game.joystick.y;dash();}
  }else lastArenaDashTap={time:now,x:e.clientX,y:e.clientY};
  return;
 }
 if(arenaTouch?.pointer===e.pointerId)resetArenaTouch(e.type!=='pointerup');
}
function navigationIcon(id,art,label){
 const button=$(id);if(!button)return;
 let image=button.querySelector('img');if(!image){image=document.createElement('img');image.alt='';button.prepend(image);}
 image.src=iconAsset(art);image.draggable=false;image.classList.add('navigation-art');button.dataset.navArt=art;
 if(label){button.setAttribute('aria-label',label);button.dataset.tooltip=label;const text=button.querySelector('.nav-label');if(text)text.textContent=label;}
}
function refreshNavigationArcs(){
 const labels={delveNav:'Delve',quickGear:'Inventory',quickSkills:'Skills',quickShop:'Shop',quickSettings:'Settings',quickPause:game.scene==='combat'&&game.status==='running'&&game.manualPaused?'Play':'Pause',speedToggle:'Speed'};
 for(const [id,label]of Object.entries(labels)){
  const button=$(id);if(!button)continue;let arc=button.querySelector('.nav-arc');
  if(!arc){const path='nav-arc-'+id;button.insertAdjacentHTML('beforeend','<svg class="nav-arc" viewBox="0 0 72 78" aria-hidden="true" focusable="false"><defs><path id="'+path+'" d="M8 35 A29 29 0 0 1 64 35"/></defs><text><textPath href="#'+path+'" startOffset="50%" text-anchor="middle"></textPath></text></svg>');arc=button.querySelector('.nav-arc');}
  const text=arc.querySelector('textPath');if(text.textContent!==label)text.textContent=label;
 }
}
function installMobileUI(){
 if(mobileInstalled)return;mobileInstalled=true;
 installGameplaySelectionGuard();
 $('stageWrap').insertAdjacentHTML('beforeend','<div id="arenaTouchGuide" class="arena-touch-guide hidden" aria-hidden="true"><i></i></div>');
 $('idleWarning').insertAdjacentHTML('afterend','<button type="button" id="firstWeaponHint" class="first-weapon-hint hidden">Craft and refine in <span>Skills ›</span></button>');
 $('stageWrap').insertAdjacentHTML('beforeend','<button type="button" id="trackedNextStep" class="tracked-next-step hidden"></button>');
 $('hudEssence').onclick=()=>openZoneShop();
 $('firstWeaponHint').onclick=()=>{const style=combatStyle();openWorkshop(STYLE_DEFS[style].group,'equipment');document.querySelector('[data-style-upgrade="'+style+':weapon"]')?.closest('article')?.scrollIntoView({block:'center'});};
 canvas.setAttribute('aria-label','Game arena. Drag anywhere to move; release to stop. Use WASD or arrow keys with a keyboard.');
 canvas.addEventListener('pointerdown',e=>{
  if(game.scene!=='combat'||e.pointerType==='mouse')return;
  if(!movementDashAllowed())return;
  e.preventDefault();e.stopImmediatePropagation();if(arenaTouch){if(Math.hypot(game.joystick.x,game.joystick.y)>.18)arenaDashTaps.set(e.pointerId,{x:e.clientX,y:e.clientY,time:performance.now(),moved:false});return;}
  arenaTouch={pointer:e.pointerId,x:e.clientX,y:e.clientY,noted:false};game.joystick.pointer=e.pointerId;game.joystick.x=game.joystick.y=0;game.mouseMove.active=false;
  try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 },true);
 canvas.addEventListener('pointermove',moveArenaTouch,true);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,endArenaTouch,true);
 window.addEventListener('blur',()=>resetArenaTouch(true));window.addEventListener('resize',()=>resetArenaTouch(true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetArenaTouch(true);});
 document.addEventListener('pointerdown',e=>{touchNavigationClick=null;if(arenaTouch&&e.target!==canvas&&!e.target.closest('#dashButton'))resetArenaTouch();},true);
 // A compatibility click can be retargeted into a newly opened menu. Consume it
 // before it reaches that menu; new physical presses and keyboard clicks still work.
 document.addEventListener('click',e=>{const previous=touchNavigationClick;if(previous&&e.isTrusted&&e.detail>0&&performance.now()-previous.time<650&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<12){touchNavigationClick=null;e.preventDefault();e.stopImmediatePropagation();}},true);
 navigationIcon('delveNav','nav-delve','Delve');navigationIcon('quickGear','nav-inventory','Inventory');navigationIcon('quickShop','zone-shop','Dungeon Shop');
 navigationIcon('speedToggle','nav-speed');$('speedToggle').querySelector('svg')?.remove();
 for(const id of ['firstWeaponHint','delveNav','quickGear','quickSkills','quickShop','quickCodex','quickSettings','quickPause','speedToggle','dashButton','drawerClose','activeIdleButton'])bindTouchNavigation($(id));
 $('speedOptions').querySelectorAll('button').forEach(bindTouchNavigation);
 refreshMobileUI();
}
function refreshMobileUI(){
 if(!mobileInstalled)return;
 refreshNavigationArcs();
 if(arenaTouch&&!movementDashAllowed())resetArenaTouch();
 if(drawerKind==='gear')$('drawerTitle').textContent='Inventory';
 normalizeFirstWeaponHint();$('firstWeaponHint').classList.toggle('hidden',game.scene!=='combat'||data.firstWeaponCrafted);$('skillsNudge')?.classList.add('hidden');
 $('combatWeaponSelector')?.querySelectorAll('button').forEach(bindTouchNavigation);$('armorEquipment')?.querySelectorAll('button').forEach(bindTouchNavigation);
 renderMaterialInventory();
}
function normalizeFirstWeaponHint(){data.firstWeaponCrafted=!!data.firstWeaponCrafted||Object.values(data.styles||{}).some(style=>style.weapon>0)||(data.unlockedWeapons||[]).some(id=>id!=='sword');}
function inventoryRows(){
 const known=Object.keys(RESOURCE_LABEL).filter(key=>!['gold','essence','zoneMaterials'].includes(key)&&((data[key]||0)>0||data.discovered?.['resource_'+key]));
 return known.map(key=>({key,name:RESOURCE_LABEL[key],count:Math.floor(Math.max(0,Math.min(1e12,Number(data[key])||0))),art:RESOURCE_ART[key],source:key})).concat(Object.entries(data.biomeLoot||{}).filter(([kind,count])=>/^[0-3]$/.test(kind)&&Number(count)>0).map(([kind,count])=>({key:'loot_'+kind,name:['Verdant Seeds','Ember Cores','Grave Dust','Rift Shards'][Number(kind)],count:Math.floor(Math.min(1e12,Number(count))),art:'codex-loot_'+kind,codex:'loot_'+kind}))).concat(Object.entries(data.specificVouchers||{}).filter(([,n])=>n>0).map(([key,count])=>({key:'voucher_'+key,name:voucherLootName('voucher_'+key),count,art:'codex-upgrade_vouchers',codex:'upgrade_vouchers'})));
}
function renderMaterialInventory(){
 const host=$('loadoutMaterials');if(!host)return;
 if(materialInventoryOwner!==data){materialInventoryOwner=data;materialInventoryQuery='';host.dataset.state='';host.dataset.structure='';const input=$('materialSearch');if(input)input.value='';}
 const rows=inventoryRows(),signature=JSON.stringify([rows,data.gold,data.essence,data.lootHistory]);if(host.dataset.state===signature)return;host.dataset.state=signature;
 if(!$('materialSearch')){
  host.innerHTML='<div class="inventory-currencies">'+[['gold','coins'],['essence','essence']].map(([key,art])=>'<span data-inventory-currency="'+key+'">'+artHTML(art)+'<b></b></span>').join('')+'</div><div class="inventory-search" role="search" aria-label="Inventory materials">'+uiIcon('search')+'<label for="materialSearch" class="sr-only">Search materials and vouchers</label><input id="materialSearch" type="search" placeholder="Search materials & vouchers" autocomplete="off" spellcheck="false" data-focus-key="material-search"><button type="button" id="materialSearchClear" class="hidden" aria-label="Clear material search">Clear</button></div><p id="materialSearchStatus" class="inventory-search-status" role="status" aria-live="polite" aria-atomic="true"></p><div id="materialInventoryRows"></div><p id="materialSearchEmpty" class="inventory-search-empty hidden">No matching materials or vouchers. Try another name or clear your search.</p><div id="materialLootHistory"></div>';
  $('materialSearch').addEventListener('input',e=>{materialInventoryQuery=e.target.value;applyMaterialInventorySearch();});
  $('materialSearch').addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.value){e.preventDefault();e.stopPropagation();clearMaterialInventorySearch(true);}});
  $('materialSearchClear').onclick=()=>clearMaterialInventorySearch(true);bindTouchNavigation($('materialSearchClear'));
 }
 const body=$('materialInventoryRows'),structure=JSON.stringify(rows.map(({count,...row})=>row)),focus=document.activeElement?.closest('[data-inventory-key]')?.dataset.inventoryKey;
 if(host.dataset.structure!==structure){
  body.innerHTML=rows.length?'<div class="inventory-materials">'+rows.map(row=>'<button type="button" class="inventory-material" data-inventory-key="'+row.key+'" data-focus-key="inventory-'+row.key+'" '+(row.key.startsWith('voucher_')?'data-open-voucher="'+row.key.slice(8)+'"':row.source?'data-source="'+row.source+'"':'data-codex-entry="'+row.codex+'"')+'>'+artHTML(row.art)+'<span><b>'+escapeHTML(row.name)+'</b><small></small></span>'+uiIcon(row.source?'chevron':'book')+'</button>').join('')+'</div>':'<div class="empty-loadout">'+uiIcon('bag')+'<p>No materials</p><button type="button" class="inventory-skills">Skills '+uiIcon('arrow')+'</button></div>';
  host.dataset.structure=structure;
  body.querySelectorAll('[data-source]').forEach(button=>button.onclick=()=>goToSource(button.dataset.source));
  body.querySelectorAll('[data-open-voucher]').forEach(button=>button.onclick=()=>openVoucherGuide(button.dataset.openVoucher));
  body.querySelector('.inventory-skills')?.addEventListener('click',()=>openDrawer('skills'));body.querySelectorAll('button').forEach(bindTouchNavigation);
 }
 for(const row of rows){const button=body.querySelector('[data-inventory-key="'+row.key+'"]');button.querySelector('small').textContent=format(row.count);button.setAttribute('aria-label',row.name+' · '+format(row.count)+(row.key.startsWith('voucher_')?' · View voucher':row.source?' · View source':' · Read in Codex'));}
 for(const key of ['gold','essence']){const el=host.querySelector('[data-inventory-currency="'+key+'"]');el.querySelector('b').textContent=uiCompact(data[key]);el.setAttribute('aria-label',format(data[key])+' '+RESOURCE_LABEL[key]);}
 const history=$('materialLootHistory'),historyState=JSON.stringify(data.lootHistory||[]);
 if(history.dataset.state!==historyState){const open=history.querySelector('details')?.open;history.innerHTML=lootHistoryHtml();if(open&&history.querySelector('details'))history.querySelector('details').open=true;history.dataset.state=historyState;}
 applyMaterialInventorySearch();
 if(focus&&document.activeElement===document.body){const target=body.querySelector('[data-inventory-key="'+focus+'"]');(target&&!target.classList.contains('hidden')?target:$('materialSearch')).focus({preventScroll:true});}
}
function applyMaterialInventorySearch(){
 const input=$('materialSearch');if(!input)return;
 const tokens=materialInventoryQuery.trim().toLowerCase().split(/\s+/).filter(Boolean),cards=[...$('materialInventoryRows').querySelectorAll('[data-inventory-key]')];let shown=0;
 for(const card of cards){const name=card.querySelector('b').textContent.toLowerCase(),visible=tokens.every(token=>name.includes(token));card.classList.toggle('hidden',!visible);if(visible)shown++;}
 $('materialSearchClear').classList.toggle('hidden',!materialInventoryQuery);$('materialSearchEmpty').classList.toggle('hidden',!tokens.length||shown>0);$('materialLootHistory').classList.toggle('hidden',!!tokens.length);
 $('materialInventoryRows').querySelector('.empty-loadout')?.classList.toggle('hidden',!!tokens.length);
 const message=tokens.length?shown+' of '+cards.length+' items':cards.length+' '+(cards.length===1?'item':'items'),status=$('materialSearchStatus');if(status.textContent!==message)status.textContent=message;
}
function clearMaterialInventorySearch(focus=false){
 materialInventoryQuery='';if($('materialSearch'))$('materialSearch').value='';applyMaterialInventorySearch();if(focus)$('materialSearch')?.focus({preventScroll:true});
}
function revealInventoryItem(key){
 renderMaterialInventory();const row=$('loadoutMaterials')?.querySelector('[data-inventory-key="'+key+'"]');if(!row)return false;
 if(row.classList.contains('hidden'))clearMaterialInventorySearch();row.scrollIntoView({block:'center'});row.focus({preventScroll:true});return true;
}
function updatePauseHud(){
 const running=game.scene==='combat'&&game.status==='running',manuallyPaused=running&&!!game.manualPaused;
 const button=$('quickPause'),banner=$('pauseStatus');if(!button||!banner)return;
 button.classList.toggle('paused',manuallyPaused);button.setAttribute('aria-pressed',String(manuallyPaused));button.setAttribute('aria-label',manuallyPaused?'Resume delve':'Pause delve');button.title=manuallyPaused?'Resume delve':'Pause delve';
 const glyph=$('pauseGlyph'),art=manuallyPaused?'nav-play':'nav-pause';if(glyph.dataset.art!==art){glyph.innerHTML=artHTML(art);glyph.dataset.art=art;}
 $('pauseCaption').textContent=manuallyPaused?'RESUME':'PAUSE';
 banner.classList.toggle('hidden',!manuallyPaused||$('app').classList.contains('drawer-open')||!$('overlay').classList.contains('hidden')||tourIndex>=0);
 $('stageWrap').classList.toggle('delve-is-paused',manuallyPaused);if(manuallyPaused)resetArenaTouch(true);
 refreshNavigationArcs();
}

function showOverlay(markup,kind=''){
 if(eliteRewardOpen()&&kind!=='elite-reward-overlay')return false;
 resetArenaTouch(true);
 const o=$('overlay');if(o.classList.contains('hidden'))modalFocus=document.activeElement;game.holdSkill=null;game.keys={};game.mouseMove.active=false;
 document.body.classList.toggle('mastery-modal-open',kind==='mastery-overlay');document.body.classList.toggle('codex-modal-open',kind==='codex-overlay');o.classList.toggle('mastery-modal',kind==='mastery-overlay');o.classList.toggle('codex-modal',kind==='codex-overlay');o.classList.remove('hidden');o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
 const card=$('overlayCard');card.className='overlay-card '+kind;card.innerHTML=markup;card.tabIndex=-1;const heading=card.querySelector('h2');if(heading){if(!heading.id)heading.id='modalTitle';o.setAttribute('aria-labelledby',heading.id)}
 // All upgrade offers and unlock cards use the same icon identities as the Codex.
 card.querySelectorAll('.upgrade-symbol').forEach((el,i)=>{if(game.levelChoices[i])el.innerHTML=artHTML('codex-upgrade_'+game.levelChoices[i].id)});
 card.querySelectorAll('.overlay-sigil').forEach(el=>{el.innerHTML=artHTML(heading?.textContent.includes('Mastery')?'mastery-unlock':kind==='intro-overlay'?'sword':game.status==='dead'?'skull':'essence')});
 card.querySelectorAll('.intro-icon').forEach((el,i)=>{el.innerHTML=artHTML(i===0?'nav-delve':i===1?'skills-menu':'bag')});
 if(kind==='intro-overlay')card.querySelectorAll('button').forEach(bindTouchNavigation);
 const nodes=card.querySelectorAll('.talent-icon');nodes.forEach((el,i)=>{const key=Object.keys(TALENTS)[i];if(key)el.innerHTML=artHTML('codex-permanent_talent_'+key)});
 requestAnimationFrame(()=>{if(!o.classList.contains('hidden')&&!card.contains(document.activeElement))card.focus({preventScroll:true})});
}
