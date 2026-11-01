/* Rare members of the existing creature families and optional, timed spoils. */
const RARE_ELITE_CHANCE=.015;
const RARE_ELITE_NAMES=[
 ['Thorncrown Mossling','Elder Moss Beetle','Antlered Sapling','Crowncap','Briar Alpha','Ancient Root Crawler'],
 ['Cinderheart Emberling','Ashhorn Imp','Molten Slag Beetle','Soot Revenant','Furnace Alpha','Obsidian Ravager'],
 ['Pale Shade','Crowned Thrall','Mourning Moth','Ossuary Scarab','Stitched Shroudling','Grave Haunter'],
 ['Prismatic Riftling','Astral Shardstalker','Crown Jelly','Eclipse Moth','Void Alpha','Unbound Wisp']
];
const ELITE_BOONS={
 fervor:{name:'Battle Fervor',seconds:45,damage:1.18,description:'+18% hit damage',color:'#e8b07c'},
 windstep:{name:'Windstep',seconds:40,attackSpeed:1.15,movement:1.12,description:'+15% attack speed · +12% movement',color:'#a8ded7'},
 stoneguard:{name:'Stoneguard',seconds:60,protection:.8,regen:.003,description:'20% less damage · 0.3% HP / s',color:'#c7d6a6'}
};
const rareEliteImages=new Map();
let rareEliteInstalled=false,eliteRewardId=0;
function normalizeRareEliteProgression(){
 const seen=new Set();data.eliteSpoils=(Array.isArray(data.eliteSpoils)?data.eliteSpoils:[]).filter(drop=>drop&&Number.isSafeInteger(drop.id)&&drop.id>0&&!seen.has(drop.id)&&seen.add(drop.id)&&Number.isInteger(drop.zone)&&drop.zone>=0&&drop.zone<=9999&&Number.isFinite(drop.x)&&Number.isFinite(drop.y)).slice(-64).map(drop=>({id:drop.id,zone:drop.zone,x:Math.max(-1e7,Math.min(1e7,drop.x)),y:Math.max(-1e7,Math.min(1e7,drop.y))}));
 data.eliteSpoilsSequence=Math.max(0,...data.eliteSpoils.map(drop=>drop.id),Math.min(1e12,Math.floor(Number(data.eliteSpoilsSequence)||0)));
 const boon=data.eliteBoon,definition=ELITE_BOONS[boon?.id];
 data.eliteBoon=definition&&boon.zone===zoneNumber()&&Number.isFinite(boon.remaining)&&boon.remaining>0?{id:boon.id,zone:boon.zone,remaining:Math.min(definition.seconds,boon.remaining)}:null;
}
function eliteBoonValue(key,fallback=1){const boon=data.eliteBoon;return boon&&boon.remaining>0&&boon.zone===zoneNumber()?(ELITE_BOONS[boon.id]?.[key]??fallback):fallback;}
function tickEliteBoon(dt){
 const boon=data.eliteBoon;if(!boon)return;if(boon.zone!==zoneNumber()){data.eliteBoon=null;return;}
 const elapsed=Math.min(dt,boon.remaining),regen=eliteBoonValue('regen',0);if(regen)game.player.hp=Math.min(game.player.maxHp,game.player.hp+game.player.maxHp*regen*elapsed);
 boon.remaining=Math.max(0,boon.remaining-dt);if(boon.remaining<=0)data.eliteBoon=null;
}
function rareEliteImage(kind,variant){
 const key=ENVIRONMENT_ZONES[kind].key+'-'+variant,art=RARE_ELITE_ART[key];if(!art)return null;
 if(!rareEliteImages.has(key)){const image=new Image();image.decoding='async';image.src=art.src;rareEliteImages.set(key,image);}return rareEliteImages.get(key);
}
function primeRareElites(kind){for(let variant=0;variant<ENVIRONMENT_ZONES[kind].monsters.length;variant++)rareEliteImage(kind,variant);}
function promoteRareElite(enemy,roll=Math.random()){
 if(!enemy||enemy.boss||enemy.elite||game.phase%2!==0||game.phase>=6||game.phaseSpawned<3||game.rareEliteSpawned||game.enemies.some(other=>other.champion)||roll>=RARE_ELITE_CHANCE)return false;
 enemy.champion=enemy.elite=true;enemy.baseRadius=enemy.rad;enemy.rad=Math.min(22,enemy.rad*1.2);enemy.hp=enemy.maxHp=enemy.maxHp*3.5;enemy.speed*=.90;enemy.castCooldown=1.4;
 enemy.name=RARE_ELITE_NAMES[enemy.biome??biomeIndex()][enemy.visualType||0];game.rareEliteSpawned=true;codexDiscover('rare_elites');return true;
}
function paintRareElite(enemy){
 const kind=enemy.biome??biomeIndex(),variant=enemy.visualType||0,image=rareEliteImage(kind,variant),art=RARE_ELITE_ART[ENVIRONMENT_ZONES[kind].key+'-'+variant];
 if(!image?.complete||!image.naturalWidth){paintEnvironmentMob(enemy);return;}
 const ratio=art.width/art.height,normal=environmentMobSize({...enemy,rad:enemy.baseRadius||15}),height=Math.min(88,normal.height*1.45,106/ratio),width=height*ratio,feet=enemy.y+enemy.rad*.85,t=game.frame+(enemy.wobble||0),floating=[2,3].includes(kind)&&[2,5].includes(variant)||kind===1&&variant===3;
 const bob=reducedMotion()?0:floating?Math.sin(t*2.6)*2.6:Math.sin(t*6)*.8;
 ctx.save();ellipse(enemy.x,feet+1,width*.33,6,'#0a1212a0');ctx.strokeStyle='#d2b56b';ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(enemy.x,feet+1,Math.max(18,width*.33),6,0,0,Math.PI*2);ctx.stroke();
 ctx.translate(enemy.x,feet-bob);if(enemy.charge?Math.cos(enemy.charge.angle)<0:enemy.x>game.player.x)ctx.scale(-1,1);if(!reducedMotion())ctx.rotate(Math.sin(t*4)*.018);
 if(game.frame-enemy.lastHitAt<.1)ctx.filter='brightness(1.3)';ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
 const y=feet-height-8;quad(enemy.x-25,y,50,4,'#17160f');quad(enemy.x-25,y,50*clamp(enemy.hp/enemy.maxHp,0,1),4,'#d8bf80');
 ctx.save();ctx.font='600 9px system-ui';ctx.textAlign='center';ctx.strokeStyle='#13140d';ctx.lineWidth=3;ctx.strokeText(enemy.name,enemy.x,y-6);ctx.fillStyle='#ead8ac';ctx.fillText(enemy.name,enemy.x,y-6);ctx.restore();
}
function dropEliteSpoils(enemy){
 if(!enemy.champion)return;const drop={id:++data.eliteSpoilsSequence,zone:zoneNumber(),x:enemy.x,y:enemy.y};data.eliteSpoils.push(drop);if(data.eliteSpoils.length>64)data.eliteSpoils.shift();
 toast('Elite spoils','Choose a blessing when ready.');save();
}
function paintEliteSpoils(){
 const image=rareEliteImages.get('spoils');for(const drop of data.eliteSpoils||[]){if(drop.zone!==zoneNumber())continue;
  const bob=reducedMotion()?0:Math.sin(game.frame*2+drop.id)*2;glow(drop.x,drop.y,22,'#e7c67b2a');ellipse(drop.x,drop.y+8,13,4,'#100f0a70');if(image?.complete&&image.naturalWidth)ctx.drawImage(image,drop.x-16,drop.y-17+bob,32,32);
 }
}
function installRareEliteUI(){
 if(rareEliteInstalled)return;rareEliteInstalled=true;installBestiaryExpansion();
 for(const entry of [{id:'rare_elites',cat:'Guide',name:'Rare elites',desc:'Rare creatures leave a choice of timed blessings.'},...Object.entries(ELITE_BOONS).map(([id,boon])=>({id:'elite_boon_'+id,cat:'Powers',name:boon.name,desc:boon.description}))])if(!CODEX_ITEMS.some(item=>item.id===entry.id))CODEX_ITEMS.push(entry);
 const claim=document.createElement('button');claim.id='eliteSpoilsButton';claim.type='button';claim.className='elite-spoils-button hidden';claim.innerHTML=artHTML('codex-rare_elites')+'<span>Elite spoils</span>'+uiIcon('chevron');claim.onclick=()=>openEliteReward();$('stageWrap').append(claim);bindTouchNavigation(claim);
 const image=new Image();image.src=iconAsset('codex-rare_elites');rareEliteImages.set('spoils',image);primeRareElites(biomeIndex());
 document.addEventListener('keydown',event=>{
  if(!$('overlayCard').classList.contains('elite-reward-overlay')||$('overlay').classList.contains('hidden')||codexSession||event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
  const index=['KeyA','KeyB','KeyC'].indexOf(event.code);if(index>=0){event.preventDefault();event.stopImmediatePropagation();chooseEliteBoon(Object.keys(ELITE_BOONS)[index]);}
  else if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeEliteReward();}
 },true);
}
function refreshRareEliteUI(){
 if(!rareEliteInstalled)return;const count=(data.eliteSpoils||[]).filter(drop=>drop.zone===zoneNumber()).length,button=$('eliteSpoilsButton'),visible=count>0&&game.scene==='combat'&&game.status==='running'&&!drawerKind&&$('overlay').classList.contains('hidden')&&tourIndex<0;
 button.classList.toggle('hidden',!visible);button.setAttribute('aria-label','Choose a blessing · '+count+' elite spoils');button.dataset.hint='A / B / C blessing · '+count+' unclaimed';
}
function openEliteReward(){
 const drop=data.eliteSpoils.find(item=>item.zone===zoneNumber());if(!drop||game.status!=='running'||game.scene!=='combat'||drawerKind||!$('overlay').classList.contains('hidden'))return false;
 eliteRewardId=drop.id;const active=data.eliteBoon&&ELITE_BOONS[data.eliteBoon.id];
 showOverlay('<div class="elite-reward-heading">'+artHTML('codex-rare_elites')+'<h2>Elite spoils</h2></div><div class="elite-reward-choices">'+Object.entries(ELITE_BOONS).map(([id,boon],index)=>'<button type="button" class="elite-boon-choice" data-elite-choice="'+id+'"><span class="elite-choice-key">'+String.fromCharCode(65+index)+'</span>'+artHTML('codex-elite_boon_'+id)+'<span class="elite-choice-copy"><b>'+boon.name+'</b><span>'+boon.description+'</span><small>'+boon.seconds+'s</small></span></button>').join('')+'</div><p class="elite-reward-note">'+(active?'Replaces '+active.name:'One blessing at a time')+'</p><button type="button" class="elite-reward-later" id="eliteRewardLater">Later</button>','elite-reward-overlay');
 $('overlayCard').querySelectorAll('[data-elite-choice]').forEach(button=>button.onclick=()=>chooseEliteBoon(button.dataset.eliteChoice));$('eliteRewardLater').onclick=closeEliteReward;$('overlayCard').querySelectorAll('button').forEach(bindTouchNavigation);refreshRareEliteUI();return true;
}
function closeEliteReward(){eliteRewardId=0;hideOverlay();refreshRareEliteUI();}
function chooseEliteBoon(id){
 const definition=ELITE_BOONS[id],index=data.eliteSpoils.findIndex(drop=>drop.id===eliteRewardId&&drop.zone===zoneNumber());if(!definition||index<0||!$('overlayCard').classList.contains('elite-reward-overlay')||$('overlay').classList.contains('hidden')||codexSession)return false;
 data.eliteSpoils.splice(index,1);data.eliteBoon={id,zone:zoneNumber(),remaining:definition.seconds};codexDiscover('elite_boon_'+id);closeEliteReward();save();refreshUI();return true;
}
function eliteBoonHud(){
 const active=data.eliteBoon,boon=active?.zone===zoneNumber()&&active.remaining>0?ELITE_BOONS[active.id]:null;if(!boon)return '';
 return '<button type="button" class="buff-icon elite-boon-icon" data-codex-entry="elite_boon_'+active.id+'" aria-label="'+boon.name+' · '+Math.ceil(active.remaining)+' seconds remaining" data-hint="'+boon.name+' · '+boon.description+' · '+Math.ceil(active.remaining)+'s">'+artHTML('codex-elite_boon_'+active.id)+'<b>'+Math.ceil(active.remaining)+'s</b></button>';
}
function paintEliteBoonAura(player){
 const active=data.eliteBoon,boon=active?.zone===zoneNumber()&&active.remaining>0?ELITE_BOONS[active.id]:null;if(!boon)return;
 ctx.save();ctx.strokeStyle=boon.color+'80';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(player.x,player.y+14,21,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function rareEliteCodexHtml(){
 return codexParagraph('Rare elites are stronger forms of each small creature. Their sweeps and charges lock their direction before striking. Lure ordinary monsters into the marked area, then step aside. Ricochets rebound at visible markers. Shielders protect another elite for eight seconds and remain unprotected themselves; approach the shielder to focus it.')+codexRuleList([['Rarity','1.5% per eligible wave spawn · at most one per wave'],['Spoils','Open Elite spoils when ready. Combat waits while you choose A, B or C.'],['Blessings','40–60 seconds of combat time · one active at a time'],['Persistence','Pause and skilling preserve time. Blessings stay in their exact Zone. Unclaimed spoils survive travel and reload.'],['Enemy area damage','35% of each ordinary monster’s maximum HP, once per attack. Bosses, elites and totems are immune.']])+RARE_ELITE_NAMES.map((names,kind)=>codexHeading(BIOMES[kind].name,'<div class="elite-bestiary">'+names.map((name,variant)=>'<div><img src="'+RARE_ELITE_ART[ENVIRONMENT_ZONES[kind].key+'-'+variant].src+'" alt=""><span>'+name+'</span></div>').join('')+'</div>')).join('');
}
function eliteBoonCodexHtml(id){const boon=ELITE_BOONS[id];return codexParagraph(boon.description+'.')+codexRuleList([['Duration',boon.seconds+' seconds of combat time'],['Source','Rare elite spoils'],['Choice','Choose one of three blessings. A new blessing replaces the current one.'],['Timing','Pause, menus and skilling preserve remaining time. Delve speed advances the combat clock.'],['Zone','Applies in the Zone where chosen; leaving that Zone ends it.']]);}

/* Enemy area attacks hit each ordinary monster once, without player hit procs. */
function cleaveContains(actor,cast){
 const dx=actor.x-cast.origin.x,dy=actor.y-cast.origin.y,distance=Math.hypot(dx,dy);if(distance>cast.reach+(actor.rad||12))return false;
 const angle=Math.atan2(dy,dx)-cast.angle;return Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=cast.halfAngle;
}
function damageMonstersInAttack(owner,shape,contains){
 if(!owner||!game.enemies.includes(owner)||game.status!=='running')return;
 const hits=shape.enemyHits||(shape.enemyHits=new Set());
 for(const enemy of [...game.enemies]){if(!game.enemies.includes(owner)||game.status!=='running')break;if(enemy===owner||enemy.boss||enemy.elite||hits.has(enemy)||!contains(enemy))continue;
  hits.add(enemy);const damage=enemy.maxHp*.35;enemy.hp-=damage;enemy.lastHitAt=game.frame;enemy.lastDamageStyle=combatStyle();floater(enemy.x,enemy.y-25,Number(damage.toFixed(1)),DUNGEON_THEMES[owner.biome??biomeIndex()].hot);burst(enemy.x,enemy.y,3,DUNGEON_THEMES[owner.biome??biomeIndex()].color);if(enemy.hp<=0)onKill(enemy);
 }
}
function paintEnemyCleave(cast,theme,progress=1,active=false){
 ctx.save();ctx.translate(cast.origin.x,cast.origin.y);ctx.rotate(cast.angle);ctx.fillStyle=theme.color+(active?'45':'19');ctx.strokeStyle=theme.color;ctx.lineWidth=active?3:2;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,cast.reach,-cast.halfAngle,cast.halfAngle);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=theme.hot;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,cast.reach+4,-cast.halfAngle,-cast.halfAngle+cast.halfAngle*2*progress);ctx.stroke();ctx.restore();
}
