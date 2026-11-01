/* Quiet, player-invoked shopping; combat never opens this drawer itself. */
function installZoneShopPin(){
 if(shopUiInstalled)return;shopUiInstalled=true;
 const rail=document.querySelector('.hud-actions'),button=document.createElement('button');button.type='button';button.id='quickShop';button.className='hud-icon';button.setAttribute('aria-label','Zone Shop');button.dataset.tooltip='Zone Shop';button.innerHTML=artHTML('zone-shop')+'<span class="nav-label">Zone Shop</span>';rail.append(button);
 button.onclick=()=>drawerKind==='shop'?closeDrawer():openZoneShop();
 const view=document.createElement('section');view.id='zoneShopView';view.className='drawer-custom zone-shop-view hidden';$('gameDrawer').append(view);
 const currency=document.createElement('button');currency.id='zoneCurrencyHud';currency.className='hud-chip zone-currency-chip hidden';currency.type='button';currency.onclick=()=>openZoneShop();$('stageWrap').append(currency);
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='b'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!drawerKind&&$('overlay').classList.contains('hidden')&&!e.target.matches('input,textarea,select,[contenteditable="true"]')){e.preventDefault();openZoneShop();}});
 for(let i=0;i<ZONE_CURRENCIES.length;i++)if(!CODEX_ITEMS.some(e=>e.id==='zone_currency_'+i))CODEX_ITEMS.push({id:'zone_currency_'+i,cat:'Materials',name:ZONE_CURRENCIES[i].name,desc:'Currency found in Zone '+(i+1)+'. Spent in its Zone Shop.'});
 for(const entry of CODEX_ITEMS)if(entry.cat==='Powers')entry.cat='Zone Upgrades';
 for(const id of ['permanent_talent_adaptation']){const e=CODEX_ITEMS.find(e=>e.id===id);if(e){e.name='Discovery';e.desc='Mastery · more rare finds while delving.';}}
}
function openZoneShop(index=zoneNumber()){shopZone=Math.max(0,Math.min(9999,Math.floor(Number(index)||0)));shopSignature='';openDrawer('shop');}
function openDrawer(kind){
 clearSkillBonuses();if(!$('skillQuickPicker').classList.contains('hidden'))closeSkillPicker();closeResourcePicker();drawerFocus=drawerKind?drawerFocus:document.activeElement;hideOverlay();drawerKind=kind;
 game.menuPaused=true;game.holdSkill=null;game.keys={};game.mouseMove.active=false;game.joystick.x=game.joystick.y=0;
 $('app').classList.add('drawer-open');$('gameDrawer').setAttribute('aria-hidden','false');updatePauseHud();
 $('drawerTitle').textContent={skills:'Skills',gear:'Equipment',settings:'Settings',shop:'Zone Shop'}[kind]||'Menu';$('drawerKicker').textContent='';
 $('consolidatedSkills').classList.toggle('hidden',kind!=='skills');$('settingsView').classList.toggle('hidden',kind!=='settings');$('zoneShopView')?.classList.toggle('hidden',kind!=='shop');$('combatPanel').classList.toggle('panel-active',kind==='gear');
 for(const key of SKILL_KEYS)$(key+'Panel').classList.remove('panel-active');$('idleManager').classList.toggle('hidden',kind!=='skills');
 if(kind==='skills')renderDisciplineDrawer();else if(kind==='gear')renderArmory();else if(kind==='settings')renderSettingsDrawer();else if(kind==='shop')renderZoneShop();
 $('drawerClose').focus({preventScroll:true});refreshPolishUI();
}
function closeDrawer(){
 game.pendingIdleSkill='';const old=drawerKind,open=!!old;$('app').classList.remove('drawer-open');$('gameDrawer').setAttribute('aria-hidden','true');drawerKind='';game.menuPaused=!!game.manualPaused;game.holdSkill=null;game.keys={};updatePauseHud();save();
 if(open&&data.skillAutoReturn&&SKILLS[data.lastSkill])setScene(data.lastSkill,false);
 if(open&&drawerFocus?.isConnected)drawerFocus.focus({preventScroll:true});
 if(open&&game.scene==='combat'&&game.status==='ready')intro();else if(old==='shop'&&game.scene==='combat'&&game.status==='clear')showClearAgain();
}
function shopCategoryFor(id){return ['might','haste','crit','cleave','reach','multishot','pierce','storm','fire','frost','nova'].includes(id)?'offense':['ward','vitality','regen'].includes(id)?'defense':'utility';}
function shopCard(upgrade){
 const id=upgrade.id,b=zoneShopFor(shopZone),rank=zoneUpgradeRank(id,shopZone),cost=shopUpgradeCost(id,shopZone),locked=!zoneShopUnlocked(shopZone),max=cost===null,next={...b.ranks,[id]:rank+1};
 const before=zoneCombatProfile(data.weaponType,{zone:shopZone}).dps,after=max?before:zoneCombatProfile(data.weaponType,{zone:shopZone,ranks:next}).dps;
 const supports=!upgrade.ranged||isRanged();
 const effect=(['might','haste','crit'].includes(id)||id==='multishot'&&supports)?'<span>'+before.toFixed(1)+uiIcon('arrow')+'<b>'+after.toFixed(1)+' DPS</b></span>':'<span>'+powerSummary(id,rank,shopZone)+'</span>'+(max?'':'<small>'+uiIcon('arrow')+powerSummary(id,rank+1,shopZone)+'</small>');
 return '<article class="zone-upgrade" tabindex="-1" data-focus-key="zone-card-'+id+'"><span class="zone-upgrade-art">'+artHTML('codex-upgrade_'+id)+'</span><div class="zone-upgrade-copy"><div class="recipe-title"><h4>'+upgrade.name+'</h4>'+codexLink('upgrade_'+id,upgrade.name+' details')+'</div><small class="shop-rank">Rank '+rank+' / '+UPGRADE_CAPS[id]+'</small><div class="shop-effect">'+effect+(upgrade.melee?'<small class="shop-weapon-hint">Melee</small>':upgrade.ranged?'<small class="shop-weapon-hint">Bow / Staff</small>':'')+'</div></div><button type="button" class="shop-buy" data-buy-zone="'+id+'" data-focus-key="zone-buy-'+id+'" aria-label="'+escapeHTML(max?upgrade.name+' maxed':'Buy '+upgrade.name+' rank '+(rank+1)+' for '+cost+' '+zoneCurrency(shopZone).name)+'" '+(max||locked||b.currency<cost?'disabled':'')+'>'+(max?uiIcon('check')+'<span>Max</span>':artHTML(zoneCurrency(shopZone).art)+'<span>'+uiCompact(cost)+'</span>'+uiIcon('plus'))+'</button></article>';
}
function renderZoneShop(){
 if(drawerKind!=='shop')return;const host=$('zoneShopView'),scroll=$('gameDrawer').scrollTop,focus=document.activeElement?.closest('[data-focus-key]')?.dataset.focusKey,tabScroll=host.querySelector('.zone-shop-tabs')?.scrollLeft||0;
 const count=Math.min(1000,Math.max(BIOMES.length,Math.ceil(data.cleared/3),zoneNumber()+1)),bucket=zoneShopFor(shopZone),currency=zoneCurrency(shopZone),unlocked=zoneShopUnlocked(shopZone);
 host.innerHTML='<nav class="zone-shop-tabs" aria-label="Shop Zone">'+Array.from({length:count},(_,i)=>'<button type="button" data-shop-zone="'+i+'" data-focus-key="shop-zone-'+i+'" aria-pressed="'+(i===shopZone)+'" class="'+(i===shopZone?'active':'')+'">'+(zoneShopUnlocked(i)?artHTML(zoneCurrency(i).art):uiIcon('lock'))+'<span>Zone '+(i+1)+'</span></button>').join('')+'</nav><header class="zone-shop-heading"><div><h3>'+(unlocked?BIOMES[shopZone%BIOMES.length].name:'Zone '+(shopZone+1))+'</h3><small>Zone '+(shopZone+1)+'</small></div>'+codexLink('zone_shop','Zone Shop guide')+'</header><div class="zone-wallet" aria-label="'+escapeHTML(currency.name+' in Zone '+(shopZone+1))+'">'+artHTML(currency.art)+'<strong>'+uiCompact(bucket.currency)+'</strong><span>'+currency.name+'</span></div>'+(unlocked?'':'<div class="compact-lock-note">'+uiIcon('lock')+'Clear Zone '+shopZone+'</div>')+'<nav class="shop-categories" aria-label="Upgrade category">'+[['offense','Offense'],['defense','Defense'],['utility','Utility']].map(([key,label])=>'<button type="button" data-shop-category="'+key+'" data-focus-key="shop-category-'+key+'" class="'+(shopCategory===key?'active':'')+'" aria-pressed="'+(shopCategory===key)+'">'+label+'</button>').join('')+'</nav><div class="zone-upgrade-list">'+UPGRADES.filter(u=>shopCategoryFor(u.id)===shopCategory).map(shopCard).join('')+'</div>';
 host.querySelectorAll('[data-shop-zone]').forEach(button=>button.onclick=()=>{shopZone=Number(button.dataset.shopZone);shopSignature='';renderZoneShop();});
 host.querySelectorAll('[data-shop-category]').forEach(button=>button.onclick=()=>{shopCategory=button.dataset.shopCategory;shopSignature='';renderZoneShop();});
 host.querySelectorAll('[data-buy-zone]').forEach(button=>button.onclick=()=>buyZoneUpgrade(button.dataset.buyZone,shopZone));
 $('gameDrawer').scrollTop=scroll;host.querySelector('.zone-shop-tabs').scrollLeft=tabScroll;if(focus){const next=host.querySelector('[data-focus-key="'+focus+'"]'),target=next?.disabled?next.closest('article'):next;if(target){if(target!==next)target.tabIndex=-1;target.focus({preventScroll:true});}}
 shopSignature=zoneShopSignature();
}
function zoneShopSignature(){return JSON.stringify([shopZone,shopCategory,data.cleared,data.floor,zoneShopFor(shopZone),equipmentUIState()]);}
function refreshProgressionHud(){
 if(!shopUiInstalled)return;const currency=zoneCurrency(),b=zoneShopFor(),node=$('zoneCurrencyHud'),html=artHTML(currency.art)+'<b>'+uiCompact(b.currency)+'</b>';
 node.classList.toggle('hidden',game.scene!=='combat');if(node.dataset.html!==html){node.innerHTML=html;node.dataset.html=html;}node.setAttribute('aria-label',format(b.currency)+' '+currency.name+' · Zone '+(zoneNumber()+1)+' Shop');node.dataset.hint='Zone '+(zoneNumber()+1)+' · '+currency.name;
 $('quickShop').classList.toggle('active',drawerKind==='shop');
 const labels=[...document.querySelectorAll('.meter-label span')].filter(el=>/ZONE LV\.|DUNGEONEERING|Dungeoneering/.test(el.textContent));
 for(const label of labels){const text=artHTML('dungeoneering-level')+'<span>'+dungeonProgress().level+'</span>';if(label.innerHTML!==text)label.innerHTML=text;label.classList.add('dungeon-level');label.setAttribute('aria-label','Dungeoneering level '+dungeonProgress().level);label.dataset.hint='Dungeoneering '+dungeonProgress().level+' · '+format(game.runXp)+' / '+format(game.requiredXp)+' XP';}
 if(drawerKind==='shop'&&shopSignature!==zoneShopSignature())renderZoneShop();
}
function refreshDungeoneeringUI(){
 if(!dungeoneeringInstalled)return;const points=masteryFor().points,button=$('hudEssence');$('quickEssence').textContent=formatCompact(points);button.setAttribute('aria-label',format(points)+' Dungeoneering Mastery points');button.dataset.hint='Dungeoneering Mastery · '+format(points);button.removeAttribute('title');
 const image=button.querySelector('img'),uri=iconAsset('mastery-points');if(image.getAttribute('src')!==uri)image.src=uri;
 const hint=$('bossMechanicHint');if(hint){hint.textContent=game.boss?.cast?.label||'';hint.style.color=DUNGEON_THEMES[biomeIndex()].hot;}
 $('speedControl').classList.toggle('hidden',!speedControlVisible());refreshProgressionHud();
}
