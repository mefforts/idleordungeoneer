/* Touch movement, full-sized navigation art and material inventory. */
let arenaTouch=null,mobileInstalled=false,touchNavigationClick=null;
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
function resetArenaTouch(){
 const previous=arenaTouch;arenaTouch=null;
 if(previous){game.joystick.pointer=null;game.joystick.x=game.joystick.y=0;try{if(canvas.hasPointerCapture(previous.pointer))canvas.releasePointerCapture(previous.pointer);}catch(_){}}
 $('arenaTouchGuide')?.classList.add('hidden');
}
function moveArenaTouch(e){
 if(!arenaTouch||arenaTouch.pointer!==e.pointerId)return;
 if(!movementDashAllowed()){resetArenaTouch();return;}
 e.preventDefault();e.stopImmediatePropagation();
 let dx=e.clientX-arenaTouch.x,dy=e.clientY-arenaTouch.y,distance=Math.hypot(dx,dy);
 if(distance>48){arenaTouch.x=e.clientX-dx/distance*48;arenaTouch.y=e.clientY-dy/distance*48;dx=e.clientX-arenaTouch.x;dy=e.clientY-arenaTouch.y;distance=48;}
 const moving=distance>8;game.joystick.x=moving?dx/distance:0;game.joystick.y=moving?dy/distance:0;
 if(moving&&!arenaTouch.noted){arenaTouch.noted=true;noteMovementTap(game.joystick.x,game.joystick.y,'arena-touch');}
 const guide=$('arenaTouchGuide'),bounds=$('stageWrap').getBoundingClientRect();
 guide.classList.toggle('hidden',!moving);guide.style.left=(arenaTouch.x-bounds.left)+'px';guide.style.top=(arenaTouch.y-bounds.top)+'px';
 guide.firstElementChild.style.transform='translate('+dx*.55+'px,'+dy*.55+'px)';
}
function navigationIcon(id,art,label){
 const button=$(id);if(!button)return;
 let image=button.querySelector('img');if(!image){image=document.createElement('img');image.alt='';button.prepend(image);}
 image.src=iconAsset(art);image.draggable=false;image.classList.add('navigation-art');button.dataset.navArt=art;
 if(label){button.setAttribute('aria-label',label);button.dataset.tooltip=label;const text=button.querySelector('.nav-label');if(text)text.textContent=label;}
}
function installMobileUI(){
 if(mobileInstalled)return;mobileInstalled=true;
 $('stageWrap').insertAdjacentHTML('beforeend','<div id="arenaTouchGuide" class="arena-touch-guide hidden" aria-hidden="true"><i></i></div>');
 $('idleWarning').insertAdjacentHTML('afterend','<button type="button" id="firstWeaponHint" class="first-weapon-hint hidden">Craft a stronger weapon in <span>Skills ›</span></button>');
 $('firstWeaponHint').onclick=()=>{const style=combatStyle();openWorkshop(STYLE_DEFS[style].group,'equipment');document.querySelector('[data-style-upgrade="'+style+':weapon"]')?.closest('article')?.scrollIntoView({block:'center'});};
 canvas.setAttribute('aria-label','Game arena. Drag anywhere to move; release to stop. Use WASD or arrow keys with a keyboard.');
 canvas.addEventListener('pointerdown',e=>{
  if(game.scene!=='combat'||e.pointerType==='mouse')return;
  if(!movementDashAllowed())return;
  e.preventDefault();e.stopImmediatePropagation();if(arenaTouch)return;
  arenaTouch={pointer:e.pointerId,x:e.clientX,y:e.clientY,noted:false};game.joystick.pointer=e.pointerId;game.joystick.x=game.joystick.y=0;game.mouseMove.active=false;
  try{canvas.setPointerCapture(e.pointerId);}catch(_){}
 },true);
 canvas.addEventListener('pointermove',moveArenaTouch,true);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,e=>{if(arenaTouch?.pointer===e.pointerId)resetArenaTouch();},true);
 window.addEventListener('blur',resetArenaTouch);window.addEventListener('resize',resetArenaTouch);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetArenaTouch();});
 document.addEventListener('pointerdown',e=>{touchNavigationClick=null;if(arenaTouch&&e.target!==canvas&&!e.target.closest('#dashButton'))resetArenaTouch();},true);
 // A compatibility click can be retargeted into a newly opened menu. Consume it
 // before it reaches that menu; new physical presses and keyboard clicks still work.
 document.addEventListener('click',e=>{const previous=touchNavigationClick;if(previous&&e.isTrusted&&e.detail>0&&performance.now()-previous.time<650&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<12){touchNavigationClick=null;e.preventDefault();e.stopImmediatePropagation();}},true);
 navigationIcon('delveNav','nav-delve','Delve');navigationIcon('quickGear','nav-inventory','Inventory');navigationIcon('quickShop','zone-shop','Zone Shop');
 navigationIcon('speedToggle','nav-speed');$('speedToggle').querySelector('svg')?.remove();
 for(const id of ['firstWeaponHint','delveNav','quickGear','quickSkills','quickShop','quickCodex','quickSettings','quickPause','speedToggle','dashButton','drawerClose'])bindTouchNavigation($(id));
 $('speedOptions').querySelectorAll('button').forEach(bindTouchNavigation);
 refreshMobileUI();
}
function refreshMobileUI(){
 if(!mobileInstalled)return;
 if(arenaTouch&&!movementDashAllowed())resetArenaTouch();
 if(drawerKind==='gear')$('drawerTitle').textContent='Inventory';
 normalizeFirstWeaponHint();$('firstWeaponHint').classList.toggle('hidden',game.scene!=='combat'||data.firstWeaponCrafted);$('skillsNudge')?.classList.add('hidden');
 $('combatWeaponSelector')?.querySelectorAll('button').forEach(bindTouchNavigation);$('armorEquipment')?.querySelectorAll('button').forEach(bindTouchNavigation);
 renderMaterialInventory();
}
function normalizeFirstWeaponHint(){data.firstWeaponCrafted=!!data.firstWeaponCrafted||Object.values(data.styles||{}).some(style=>style.weapon>0)||(data.unlockedWeapons||[]).some(id=>id!=='sword');}
function inventoryRows(){
 const known=Object.keys(RESOURCE_LABEL).filter(key=>!['gold','essence'].includes(key)&&((data[key]||0)>0||data.discovered?.['resource_'+key]));
 return known.map(key=>({key,name:RESOURCE_LABEL[key],count:Math.floor(Math.max(0,Math.min(1e12,Number(data[key])||0))),art:RESOURCE_ART[key],source:key})).concat(Object.entries(data.biomeLoot||{}).filter(([kind,count])=>/^[0-3]$/.test(kind)&&Number(count)>0).map(([kind,count])=>({key:'loot_'+kind,name:['Verdant Seeds','Ember Cores','Grave Dust','Rift Shards'][Number(kind)],count:Math.floor(Math.min(1e12,Number(count))),art:'codex-loot_'+kind,codex:'loot_'+kind})));
}
function renderMaterialInventory(){
 const host=$('loadoutMaterials');if(!host)return;
 const rows=inventoryRows(),signature=JSON.stringify([rows,data.gold,data.essence]);if(host.dataset.state===signature)return;host.dataset.state=signature;
 const structure=JSON.stringify(rows.map(({count,...row})=>row));
 if(host.dataset.structure===structure){
  for(const row of rows){const button=host.querySelector('[data-inventory-key="'+row.key+'"]');button.querySelector('small').textContent=format(row.count);button.setAttribute('aria-label',row.name+' · '+format(row.count)+(row.source?' · View source':' · Read in Codex'));}
  for(const key of ['gold','essence']){const el=host.querySelector('[data-inventory-currency="'+key+'"]');el.querySelector('b').textContent=uiCompact(data[key]);el.setAttribute('aria-label',format(data[key])+' '+RESOURCE_LABEL[key]);}
  return;
 }
 host.dataset.structure=structure;
 host.innerHTML='<div class="inventory-currencies">'+[['gold','coins'],['essence','essence']].map(([key,art])=>'<span data-inventory-currency="'+key+'" aria-label="'+format(data[key])+' '+RESOURCE_LABEL[key]+'">'+artHTML(art)+'<b>'+uiCompact(data[key])+'</b></span>').join('')+'</div>'+(rows.length?'<div class="inventory-materials">'+rows.map(row=>'<button type="button" class="inventory-material" data-inventory-key="'+row.key+'" '+(row.source?'data-source="'+row.source+'"':'data-codex-entry="'+row.codex+'"')+' aria-label="'+escapeHTML(row.name+' · '+format(row.count)+(row.source?' · View source':' · Read in Codex'))+'">'+artHTML(row.art)+'<span><b>'+row.name+'</b><small>'+format(row.count)+'</small></span>'+uiIcon(row.source?'chevron':'book')+'</button>').join('')+'</div>':'<div class="empty-loadout">'+uiIcon('bag')+'<p>No materials</p><button type="button" class="inventory-skills">Skills '+uiIcon('arrow')+'</button></div>');
 host.querySelectorAll('[data-source]').forEach(button=>button.onclick=()=>goToSource(button.dataset.source));
 host.querySelector('.inventory-skills')?.addEventListener('click',()=>openDrawer('skills'));
 host.querySelectorAll('button').forEach(bindTouchNavigation);
}
function updatePauseHud(){
 const running=game.scene==='combat'&&game.status==='running',manuallyPaused=running&&!!game.manualPaused;
 const button=$('quickPause'),banner=$('pauseStatus');if(!button||!banner)return;
 button.classList.toggle('paused',manuallyPaused);button.setAttribute('aria-pressed',String(manuallyPaused));button.setAttribute('aria-label',manuallyPaused?'Resume delve':'Pause delve');button.title=manuallyPaused?'Resume delve':'Pause delve';
 const glyph=$('pauseGlyph'),art=manuallyPaused?'nav-play':'nav-pause';if(glyph.dataset.art!==art){glyph.innerHTML=artHTML(art);glyph.dataset.art=art;}
 $('pauseCaption').textContent=manuallyPaused?'RESUME':'PAUSE';
 banner.classList.toggle('hidden',!manuallyPaused||$('app').classList.contains('drawer-open')||!$('overlay').classList.contains('hidden')||tourIndex>=0);
 $('stageWrap').classList.toggle('delve-is-paused',manuallyPaused);if(manuallyPaused)resetArenaTouch();
}

function showOverlay(markup,kind=''){
 resetArenaTouch();
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
