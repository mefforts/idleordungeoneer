/* Quiet, player-invoked shopping; combat never opens this drawer itself. */
function installZoneShopPin(){
 if(shopUiInstalled)return;shopUiInstalled=true;
 const button=document.createElement('button');button.type='button';button.id='quickShop';button.className='hud-icon';button.setAttribute('aria-label','Dungeon Shop');button.dataset.tooltip='Dungeon Shop';button.innerHTML=artHTML('zone-shop')+'<span class="nav-label">Dungeon Shop</span>';document.querySelector('.hud-actions').append(button);button.onclick=()=>drawerKind==='shop'?closeDrawer():openZoneShop();
 const view=document.createElement('section');view.id='zoneShopView';view.className='drawer-custom zone-shop-view hidden';$('gameDrawer').append(view);
 const currency=document.createElement('button');currency.id='zoneCurrencyHud';currency.className='hud-chip zone-currency-chip hidden';currency.type='button';currency.onclick=()=>openZoneShop();$('stageWrap').append(currency);
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='b'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!drawerKind&&$('overlay').classList.contains('hidden')&&!e.target.matches('input,textarea,select,[contenteditable="true"]')){e.preventDefault();openZoneShop();}});
 installZoneAbilityCodex();for(const entry of CODEX_ITEMS)if(entry.cat==='Powers')entry.cat='Dungeon Abilities';
 const adaptation=CODEX_ITEMS.find(e=>e.id==='permanent_talent_adaptation');if(adaptation){adaptation.name='Discovery';adaptation.desc='Mastery · more rare finds while delving.';}
}
function openZoneShop(index=zoneNumber()){
 if(eliteRewardOpen())return false;shopZone=Math.max(0,Math.min(9999,Math.floor(Number(index)||0)));shopSignature='';for(const p of zoneAbilities(shopZone))if(dungeonPerkUnlocked(p))codexDiscover(p.codex);openDrawer('shop');
 const migration=data.dungeonShopMigration;if(migration?.seals>0&&!migration.announced){migration.announced=true;toast('Dungeon Shop updated','Previous Zone wallets and purchases were refunded into shared Dungeon Sigils.');save();}return true;
}
function openDrawer(kind){
 if(eliteRewardOpen())return false;
 resetArenaTouch(true);clearSkillBonuses();if(!$('skillQuickPicker').classList.contains('hidden'))closeSkillPicker();closeResourcePicker();drawerFocus=drawerKind?drawerFocus:document.activeElement;hideOverlay();drawerKind=kind;
 game.menuPaused=true;game.holdSkill=null;game.keys={};game.mouseMove.active=false;game.joystick.x=game.joystick.y=0;
 $('app').classList.add('drawer-open');$('gameDrawer').setAttribute('aria-hidden','false');updatePauseHud();
 $('drawerTitle').textContent={skills:'Skills',gear:'Inventory',settings:'Settings',shop:'Dungeon Shop',delve:'Delve'}[kind]||'Menu';$('drawerKicker').textContent='';
 $('consolidatedSkills').classList.toggle('hidden',kind!=='skills');$('settingsView').classList.toggle('hidden',kind!=='settings');$('zoneShopView')?.classList.toggle('hidden',kind!=='shop');$('delveTravelView')?.classList.toggle('hidden',kind!=='delve');$('combatPanel').classList.toggle('panel-active',kind==='gear');
 for(const key of SKILL_KEYS)$(key+'Panel').classList.remove('panel-active');$('idleManager').classList.toggle('hidden',kind!=='skills');
 if(kind==='skills')renderDisciplineDrawer();else if(kind==='gear')renderArmory();else if(kind==='settings')renderSettingsDrawer();else if(kind==='shop')renderZoneShop();else if(kind==='delve')renderDelveTravel();
 $('drawerClose').focus({preventScroll:true});refreshPolishUI();
}
function closeDrawer(resumeSkill=true){
 game.pendingIdleSkill='';const old=drawerKind,open=!!old;$('app').classList.remove('drawer-open');$('gameDrawer').setAttribute('aria-hidden','true');drawerKind='';game.menuPaused=!!game.manualPaused;game.holdSkill=null;game.keys={};updatePauseHud();save();
 if(open&&resumeSkill&&data.skillAutoReturn&&SKILLS[data.lastSkill])setScene(data.lastSkill,false);
 if(open&&drawerFocus?.isConnected)drawerFocus.focus({preventScroll:true});
 if(open&&game.scene==='combat'&&game.status==='ready')intro();else if(old==='shop'&&game.scene==='combat'&&game.status==='clear')showClearAgain();
}
function shopCategoryFor(id){return ['might','haste','crit','cleave','reach','multishot','pierce','storm','fire','frost','nova'].includes(id)?'offense':['ward','vitality','regen'].includes(id)?'defense':'utility';}

function renderZoneShop(){
 if(drawerKind!=='shop')return;const host=$('zoneShopView'),scroll=$('gameDrawer').scrollTop,focus=document.activeElement?.closest('[data-focus-key]')?.dataset.focusKey,b=dungeonShopFor(shopZone),dungeon=dungeonForZone(shopZone),progress=dungeonProgress(),style=STYLE_DEFS[combatStyle()].name;
 const perks=zoneAbilities(shopZone),available=perks.filter(dungeonPerkUnlocked),locked=perks.filter(p=>!dungeonPerkUnlocked(p));
 host.innerHTML='<nav class="dungeon-shop-tabs" aria-label="Dungeon Shop section">'+[['abilities','Abilities'],['blessings','Long blessings']].map(([id,name])=>'<button type="button" data-dungeon-shop-view="'+id+'" aria-pressed="'+(dungeonShopView===id)+'">'+name+'</button>').join('')+'</nav>'+ (dungeonShopView==='blessings'?blessingShopHtml():'<header class="zone-shop-heading"><div><h3>Dungeon Shop</h3><small>'+dungeon.name+' · all Zones</small></div>'+codexLink('zone_shop','Dungeon Shop guide')+'</header>'+gameTimeShopHtml()+'<div class="zone-wallet" aria-label="'+escapeHTML(formatDungeonCurrency(b.currency)+' Dungeon Sigils')+'">'+artHTML(zoneCurrency().art)+'<strong>'+formatDungeonCurrency(b.currency)+'</strong><span>Dungeon Sigils</span></div><div class="dungeon-style-notice"><b>'+style+' equipped</b><span>Some perks change their effect when you switch between Melee, Mage and Ranged. Purchased ranks stay with you.</span></div><div class="zone-upgrade-list">'+available.map(shopCard).join('')+'</div>'+(locked.length?'<h4 class="dungeon-unlocks-title">More abilities through Dungeoneering</h4><div class="zone-upgrade-list dungeon-locked-list">'+locked.map(shopCard).join('')+'</div>':''));
 host.querySelectorAll('[data-dungeon-shop-view]').forEach(b=>b.onclick=()=>{dungeonShopView=b.dataset.dungeonShopView;renderZoneShop();});host.querySelectorAll('[data-buy-blessing]').forEach(b=>b.onclick=()=>buyLongBlessing(b.dataset.buyBlessing));
 host.querySelectorAll('[data-buy-time]').forEach(button=>button.onclick=()=>buyTimeUpgrade(button.dataset.buyTime));
 host.querySelectorAll('[data-buy-zone]').forEach(button=>button.onclick=()=>buyZoneUpgrade(button.dataset.buyZone,shopZone));$('gameDrawer').scrollTop=scroll;
 if(focus){const next=host.querySelector('[data-focus-key="'+focus+'"]'),target=next?.disabled?next.closest('article'):next;if(target){if(target!==next)target.tabIndex=-1;target.focus({preventScroll:true});}}
 shopSignature=zoneShopSignature();
}
function zoneShopSignature(){return JSON.stringify([dungeonShopView,data.zoneMaterials,(data.eliteBoons||[]).length,shopZone,dungeonShopFor(shopZone),dungeonProgress().level,data.weaponType,masteryFor(),data.timeRates]);}
function refreshProgressionHud(){
 if(!shopUiInstalled)return;const b=dungeonShopFor(),node=$('zoneCurrencyHud'),html=artHTML(zoneCurrency().art)+'<b>'+formatDungeonCurrency(b.currency)+'</b>';
 node.classList.toggle('hidden',game.scene!=='combat');if(node.dataset.html!==html){node.innerHTML=html;node.dataset.html=html;}node.setAttribute('aria-label',formatDungeonCurrency(b.currency)+' Dungeon Sigils · Dungeon Shop');node.dataset.hint=dungeonForZone().name+' · shared across all its Zones';$('quickShop').classList.toggle('active',drawerKind==='shop');
 for(const label of [...document.querySelectorAll('.meter-label span')].filter(el=>/ZONE LV\.|DUNGEONEERING|Dungeoneering/.test(el.textContent))){const text=artHTML('dungeoneering-level')+'<span>'+dungeonProgress().level+'</span>';if(label.innerHTML!==text)label.innerHTML=text;label.classList.add('dungeon-level');label.setAttribute('aria-label','Dungeoneering level '+dungeonProgress().level);label.dataset.hint='Dungeoneering '+dungeonProgress().level+' · Next point: '+dungeoneeringJourney().nextLabel;}
 if(drawerKind==='shop'&&shopSignature!==zoneShopSignature())renderZoneShop();
}
function refreshDungeoneeringUI(){
 if(!dungeoneeringInstalled)return;const points=masteryFor().points,button=$('hudEssence');$('quickEssence').textContent=formatCompact(points);button.setAttribute('aria-label',format(points)+' Dungeoneering points');button.dataset.hint='Dungeoneering points · '+format(points);button.removeAttribute('title');
 const image=button.querySelector('img'),uri=iconAsset('mastery-points');if(image.getAttribute('src')!==uri)image.src=uri;
 const hint=$('bossMechanicHint');if(hint){hint.textContent=bossMechanicHint();hint.style.opacity=String(game.boss?combatTipAlpha(game.boss,hint.textContent,'boss'):1);hint.classList.add('boss-tip-fade');hint.style.color=game.boss?.cast?combatTheme(castLanguage(game.boss.cast.type)).hot:DUNGEON_THEMES[biomeIndex()].hot;}
 $('speedControl').classList.toggle('hidden',!speedControlVisible());refreshProgressionHud();
}

function formatDungeonCurrency(value){return value>=10000?uiCompact(value):Number(value.toFixed(2)).toLocaleString('en-US');}
