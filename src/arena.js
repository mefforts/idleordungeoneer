/* Open Arena: unobtrusive HUD, persistent experience and measured zone pacing. */
const ARENA_PINS = [
  {id:'delve',element:'delveNav',name:'Delve'},
  {id:'gear',element:'quickGear',name:'Inventory'},
  {id:'skills',element:'quickSkills',name:'Skills'},
  {id:'shop',element:'quickShop',name:'Dungeon Shop'},
  {id:'settings',element:'quickSettings',name:'Settings'},
  {id:'pause',element:'quickPause',name:'Pause / resume'},
  {id:'speed',element:'speedControl',name:'Speed'}
];
const ZONE_BALANCE_CACHE = new Map();
let arenaInstalled=false, noticeSequence=0, pinDrag=null;

function normalizeArenaData(){
  const layout=data.hudLayout&&typeof data.hudLayout==='object'?data.hudLayout:{};
  const order=Array.isArray(layout.order)?layout.order.filter(id=>ARENA_PINS.some(p=>p.id===id)):[];
  if(!order.includes('shop')&&order.length)order.splice(Math.max(0,order.indexOf('skills')+1),0,'shop');
  data.hudLayout={side:layout.side==='left'?'left':'right',order:[...new Set([...order,...ARENA_PINS.map(p=>p.id)])]};
  data.noticeHistory=(Array.isArray(data.noticeHistory)?data.noticeHistory:[]).filter(n=>n&&typeof n.title==='string').slice(-40).map(n=>({title:n.title.slice(0,160),description:String(n.description||'').slice(0,350),time:Math.max(0,Number(n.time)||0)}));
  if(!data.xpCaches||typeof data.xpCaches!=='object'||Array.isArray(data.xpCaches))data.xpCaches={};
  for(const key of Object.keys(data.xpCaches)){
    if(!/^\d+$/.test(key)||!Array.isArray(data.xpCaches[key])){delete data.xpCaches[key];continue;}
    const valid=data.xpCaches[key].filter(g=>g&&Number.isFinite(g.x)&&Number.isFinite(g.y)&&Number.isFinite(g.value)&&g.value>0).map(g=>({x:g.x,y:g.y,value:g.value}));
    // Merge excess imported orbs instead of discarding any of their experience.
    if(valid.length>250){const overflow=valid.splice(249);valid.push({x:overflow[0].x,y:overflow[0].y,value:overflow.reduce((sum,g)=>sum+g.value,0)});}
    data.xpCaches[key]=valid;
  }
}
function checkpointGroundXp(){
  if(typeof game==='undefined'||game.xpOwner!==data||game.xpZoneIndex===undefined)return;
  if(!data.xpCaches)data.xpCaches={};
  data.xpCaches[game.xpZoneIndex]=game.gems.map(g=>({x:g.x,y:g.y,value:g.value}));
}
function announce(msg,seconds=2){
  // Encounter text joins the reading column instead of obscuring the arena.
  $('announcement').classList.add('hidden');game.announcementTime=0;rememberNotice(msg);
}

function zoneEnemyHp(boss=false,bossIndex=0,variance=1,enemy={boss}){
  const model=zoneBalance(),base=boss?[160,230,360][bossIndex]*(bossIndex===2?(isZoneFinal()?3.2:1.75):1):30+game.phase*4;
  return base*Math.pow(1.14,combatDepth()-zoneNumber()*3-1)*model.hpScale*(boss?1.12*ENCOUNTER_HEALTH.boss:variance)*regionalEncounterHealthMultiplier(enemy);
}

function bonusPosition(){
  const r=canvas.getBoundingClientRect(),bar=$('skillActionBar').getBoundingClientRect(),header=document.querySelector('.hud-center').getBoundingClientRect();
  const blocked=['#trackedRecipe','#trackedNextStep','#noticeColumn','#temporaryBuffs','#skillWorkBuff','.hud-actions','.hud-resources'].map(selector=>document.querySelector(selector)).filter(e=>e&&e.getClientRects().length).map(e=>e.getBoundingClientRect());
  const minY=Math.max(95,header.bottom-r.top+32),maxY=bar.top-r.top-34;
  if(maxY<minY)return null;
  for(let attempt=0;attempt<30;attempt++){
    const x=32+Math.random()*Math.max(1,r.width-64),y=minY+Math.random()*(maxY-minY);
    if(!blocked.some(b=>b.width&&b.height&&x+r.left>b.left-33&&x+r.left<b.right+33&&y+r.top>b.top-33&&y+r.top<b.bottom+33))return {x,y};
  }
  return null;
}

function escapeNotice(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function applyHudLayout(){
  const nav=document.querySelector('.hud-actions');if(!nav)return;
  const side=data.hudLayout.side;$('stageWrap').dataset.hudSide=side;document.body.dataset.hudSide=side;
  for(const id of data.hudLayout.order){const pin=ARENA_PINS.find(p=>p.id===id),element=$(pin.element);if(element&&element.parentElement!==nav)nav.append(element);else if(element)nav.append(element);}
  nav.dataset.order=data.hudLayout.order.join(',');nav.setAttribute('aria-label','Quick controls · '+side+' side');
}
function moveHudPin(id,direction){
  const order=data.hudLayout.order,index=order.indexOf(id),next=index+direction;if(index<0||next<0||next>=order.length)return;
  const wasOpen=$('hudSettings').querySelector('details').open;[order[index],order[next]]=[order[next],order[index]];applyHudLayout();save();renderHudSettings();$('hudSettings').querySelector('details').open=wasOpen;
  $('hudPinOrder').querySelector('[data-pin-move="'+id+'"][data-direction="'+direction+'"]')?.focus({preventScroll:true});
}

function setArenaSpeed(value){
 if(data.devSpeedUnlocked){if(![1,2,5,10,25,50,100,500].includes(value))return;settleIdleTime();if(game.scene==='combat')game.devSpeed=value;else game.skillSpeed=value;}
 else if(!setTimeRate(game.scene==='combat'?'delve':'skilling',value))return;
 closeSpeedChoices(true);refreshArenaUI();
}
function closeSpeedChoices(restoreFocus=false){
 $('speedOptions').classList.add('hidden');$('speedToggle').setAttribute('aria-expanded','false');if(restoreFocus)$('speedToggle').focus({preventScroll:true});
}
function positionSpeedChoices(){
 const host=$('speedOptions');if(host.classList.contains('hidden'))return;
 const button=$('speedToggle').getBoundingClientRect(),parent=$('speedControl').getBoundingClientRect(),stage=$('stageWrap').getBoundingClientRect(),box=host.getBoundingClientRect();
 const left=clamp(data.hudLayout.side==='left'?button.right+12:button.left-box.width-12,Math.max(8,stage.left+8),Math.max(8,Math.min(innerWidth,stage.right)-box.width-8));
 const top=clamp(button.top,Math.max(8,stage.top+8),Math.max(8,Math.min(innerHeight,stage.bottom)-box.height-8));
 host.style.left=(left-parent.left)+'px';host.style.right='auto';host.style.top=(top-parent.top)+'px';host.style.bottom='auto';
}

function installArenaUI(){installZoneShopPin();
  $('quickCodex').classList.add('hidden');$('quickCodex').setAttribute('aria-hidden','true');$('quickCodex').tabIndex=-1;
  const nav=document.querySelector('.hud-actions');nav.classList.add('icon-rail');document.querySelector('.hud-center').append($('phaseBadge'));
  $('quickPause').classList.add('hud-icon');$('quickPause').removeAttribute('title');
  $('speedToggle').classList.add('hud-icon');$('speedToggle').innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m5 7 11 9L5 25V7Zm12 0 11 9-11 9V7Z" fill="currentColor"/></svg><span class="speed-badge">1×</span>';
  $('speedToggle').setAttribute('aria-expanded','false');$('speedToggle').setAttribute('aria-controls','speedOptions');
  $('speedToggle').onclick=()=>{const host=$('speedOptions'),expanded=host.classList.toggle('hidden')===false;$('speedToggle').setAttribute('aria-expanded',String(expanded));if(expanded){refreshSpeedChoices();positionSpeedChoices();host.querySelector('.active')?.focus({preventScroll:true});}};
  $('speedOptions').querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>setArenaSpeed(Number(b.dataset.speed)));
  for(const pin of ARENA_PINS){const button=pin.id==='speed'?$('speedToggle'):$(pin.element);button.dataset.tooltip=pin.name;if(pin.id!=='pause')button.removeAttribute('title');}
  $('stageWrap').insertAdjacentHTML('beforeend','<aside class="notice-column" id="noticeColumn" aria-label="Warnings and recent notifications"></aside>');
  $('noticeColumn').append($('idleWarning'),$('toastStack'),$('idleUnlockNudge'),$('skillsNudge'));
  $('toastStack').classList.add('arena-notices');
  $('damageStat').closest('.panel-section').insertAdjacentHTML('afterend','<section class="panel-section combat-readiness" id="combatReadiness"></section>');
  $('stageWrap').dataset.hudSide=data.hudLayout.side;arenaInstalled=true;applyHudLayout();refreshArenaUI();
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#speedControl'))closeSpeedChoices();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('speedOptions').classList.contains('hidden')){e.preventDefault();e.stopImmediatePropagation();closeSpeedChoices(true);}},true);
  window.addEventListener('resize',positionSpeedChoices);
}
function resetRun(){
 checkpointGroundLoot();
 game.healthDrops=[];game.lootDrops=[];game.rareEliteSpawned=false;game.rareEliteCount=0;game.workBonusReaction=null;
 resetArenaTouch();
 if(!data.styles){normalizeProgression();styleBench=combatStyle();inspectedStyle=combatStyle();game.lastActiveAt={};game.pendingIdleSkill='';clearSkillBonuses();}
 normalizeZone();checkpointGroundXp();const p=game.player;
 p.x=p.y=0;p.hp=maxHp()+waveVitality();p.maxHp=p.hp;
 p.invuln=p.dashCooldown=p.dashTime=0;p.vx=p.vy=0;p.attackPose=p.hitPose=0;p.aimTarget=null;p.aimAngle=0;p.aimFacing=p.facing=1;
 game.phase=-1;game.phaseKills=0;game.phaseSpawned=0;game.runLevel=data.zone.level;game.runXp=data.zone.xp;
 game.requiredXp=data.zone.required;game.pendingLevels=Math.max(0,Math.floor(Number(data.zone.pending)||0));game.upgrades={...data.zone.upgrades};
 game.enemies=[];game.shots=[];game.swings=[];game.hostileShots=[];game.xpOwner=data;game.xpZoneIndex=zoneNumber();game.gems=(data.xpCaches?.[game.xpZoneIndex]||[]).map(g=>({...g}));
 game.hazards=[];clearEncounterState();game.eliteCount=0;game.eliteSchedule=[];game.eliteKinds=[];game.movementTap=null;game.waveEliteSpawned=false;game.arcs=[];game.particles=[];game.floaters=[];game.runKills=0;game.spawnTimer=0;
 game.attackTimer=0;game.phaseTime=0;game.runSeconds=0;game.transition=0;
 game.camX=game.camY=0;game.boss=null;loadFloorLoot();
}

function save(){if(game.restoringSave)return;checkpointGroundXp();checkpointGroundLoot();try{data.goldHighWater=Math.max(data.goldHighWater||0,data.gold);data.savedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(data))}catch(err){if(!saveWarningShown&&$('toastStack')){saveWarningShown=true;toast('Progress could not be saved','Allow browser storage, or back up your save in Settings.')}}}

function finishPhase(){if(remainingSummonThreats()){if(!game.phaseCleanupPending)announce('BREAK THE SPIRES · CLEAR THEIR SUMMONS',2);game.phaseCleanupPending=true;game.transition=0;game.spawnTimer=999;return false;}clearEncounterState();game.hazards=[];game.transition=.72;game.spawnTimer=999;const banked=game.gems.splice(0);for(const gem of banked){gainXp(gem.value)}checkpointGroundXp();for(const e of game.enemies)if(!e.boss)burst(e.x,e.y,5,'#bedfa2');game.enemies=[];game.hostileShots=[];announce(game.phase===5?'THE FLOOR IS YOURS':'ENCOUNTER CLEARED',1.2);}

function nextPhase(){
  clearEncounterState();game.phase++;game.enemies=[];game.shots=[];game.hostileShots=[];game.boss=null;game.phaseKills=0;game.phaseSpawned=0;game.phaseTime=0;game.spawnTimer=.25;game.transition=0;
  if(game.phase>=6){clearFloor();return;}
  game.phaseTarget=zoneBalance().targets[game.phase];prepareEliteWave();game.hazards=[];
  const phase=game.phase;
  if(phase%2===1){const b=biome();const bossIndex=Math.floor(phase/2);let hp=zoneEnemyHp(true,bossIndex);const enemy=spawnEnemy(true,bossIndex);enemy.hp=enemy.maxHp=hp;enemy.name=b.boss[bossIndex];game.boss=enemy;if(bossIndex<2)spawnInterludePack(enemy);data.seenElites[biomeIndex()][bossIndex]=true;codexDiscover('boss_'+biomeIndex()+'_'+bossIndex);announce(bossIndex===2?'OVERLORD APPROACHES':b.boss[bossIndex],2.1)}
  else announce(PHASES[phase],1.7);
  refreshUI();
}

function message(msg){rememberNotice(msg);}

function renderLegacySettingsDrawer(){
 $('settingsView').innerHTML=`<div class="settings-item"><div><strong>Quick-resume last skill</strong><small>Return to your last skill after closing menus.</small></div><button type="button" id="settingLastSkill" class="setting-toggle ${data.skillAutoReturn?'is-on':''}">${data.skillAutoReturn?'ON':'OFF'}</button></div><div class="settings-item"><div><strong>Character</strong><small>Appearance and cosmetics</small></div><button id="settingsCustomize" type="button" class="setting-action">✦ EDIT</button></div><button class="drawer-wide" id="settingsMastery" type="button" ${masteryUnlocked()?'':'disabled'}>◆ DUNGEONEERING MASTERY ${masteryUnlocked()?'· TRAIN':'· REACH ZONE 2'}</button><button class="drawer-wide codes-entry" id="settingsCodes" type="button">⌘ CODES ${data.devSpeedUnlocked?'· TEST MODE UNLOCKED':''}</button><div id="codeEntry" class="code-entry hidden"><label for="codeInput">REDEEM CODE</label><div><input type="text" id="codeInput" autocapitalize="off" spellcheck="false" placeholder="Enter code" maxlength="32"><button id="codeRedeem" type="button">REDEEM</button></div><small id="codeFeedback" role="status"></small></div><button class="drawer-wide" id="settingsTour" type="button">✧ REPLAY SHORTCUT TOUR</button><button class="drawer-wide" id="settingsHelp" type="button">? HOW TO PLAY</button><button class="drawer-wide" id="settingsExport" type="button">↓ BACK UP SAVE</button><button class="drawer-wide" id="settingsImport" type="button">↑ RESTORE SAVE</button><input type="file" accept=".json,application/json" id="settingsImportFile" class="hidden"><button class="drawer-wide" id="settingsReset" type="button">↺ RESET PROGRESS</button><div class="settings-tips">⚔ DELVE · ✋ ACTIVE · ◷ IDLE<br>Idle slots: Floor 2 / Zone 2.<br>Double tap while moving on touch; triple tap a movement key to dash.<br>Dungeon Shop game time: Delving or Skilling, including idle.</div>`;
 $('settingsView').insertAdjacentHTML('afterbegin',`<div class="settings-item"><div><strong>Reduced motion</strong><small>Reduce camera shake and decorative animation. Your device preference also applies.</small></div><button type="button" id="settingReducedMotion" class="setting-toggle ${data.reducedMotion?'is-on':''}" aria-pressed="${!!data.reducedMotion}">${data.reducedMotion?'ON':'OFF'}</button></div>`);$('settingReducedMotion').onclick=()=>{data.reducedMotion=!data.reducedMotion;save();renderSettingsDrawer()};
 $('settingsCodes').onclick=()=>{$('codeEntry').classList.toggle('hidden');if(!$('codeEntry').classList.contains('hidden'))$('codeInput').focus()};
 $('codeRedeem').onclick=async()=>{
  const input=$('codeInput'),button=$('codeRedeem'),feedback=$('codeFeedback'),value=input.value;feedback.classList.remove('code-success');input.value='';button.disabled=true;
  let action='';try{action=await redeemCodeAction(value);}catch(_){}finally{button.disabled=false;}
  if(!feedback.isConnected)return;
  if(action==='speed'){
   if(!data.devSpeedUnlocked)game.skillSpeed=1;data.devSpeedUnlocked=true;save();feedback.textContent='✓ Delve & skilling speeds unlocked';feedback.classList.add('code-success');$('speedControl').classList.remove('hidden');toast('Testing speeds unlocked','Delve & skilling · 1×–500×');
  }else if(action==='sandbox'){
   fillTestingResources();feedback.textContent='✓ Resources, travel and speed unlocked';feedback.classList.add('code-success');toast('Testing unlocked','Travel · game speed · resources');
  }else feedback.textContent='Code not found';
 };$('codeInput').onkeydown=e=>{if(e.key==='Enter')$('codeRedeem').click()};
 $('settingLastSkill').onclick=()=>{data.skillAutoReturn=!data.skillAutoReturn;save();renderSettingsDrawer()};
 $('settingsCustomize').onclick=()=>{closeDrawer();creator.open()};
 $('settingsHelp').onclick=()=>{closeDrawer();$('helpButton').click()};$('settingsTour').onclick=()=>{closeDrawer();startTour()};$('settingsMastery').onclick=()=>{if(masteryUnlocked()){closeDrawer();showMastery()}};
 $('settingsReset').onclick=()=>$('resetButton').click();
 $('settingsExport').onclick=()=>{save();const blob=new Blob([JSON.stringify({game:'IDLE OR DUNGEONEER',version:16,data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Idle_or_Dungeoneer_Save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)};
 $('settingsImport').onclick=()=>$('settingsImportFile').click();
 $('settingsImportFile').onchange=async(e)=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());const saved=(['DEEPWELL','DUNGEONEER','IDLE OR DUNGEONEER'].includes(obj.game))?obj.data:obj;if(!saved||!Number.isFinite(Number(saved.floor))||!Array.isArray(saved.unlockedWeapons))throw Error('Invalid backup');localStorage.setItem(KEY,JSON.stringify({...saved,savedAt:Date.now()}));game.restoringSave=true;location.reload()}catch(err){toast('Save not imported','Invalid or incompatible backup')}};
}

