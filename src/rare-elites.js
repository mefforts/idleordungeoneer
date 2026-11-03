/* Rare creature families and stackable timed blessings. */
const RARE_ELITE_CHANCE=.03;
const RARE_ELITE_NAMES=[
 ['Thorncrown Mossling','Elder Moss Beetle','Antlered Sapling','Crowncap','Briar Alpha','Ancient Root Crawler'],
 ['Cinderheart Emberling','Ashhorn Imp','Molten Slag Beetle','Soot Revenant','Furnace Alpha','Obsidian Ravager'],
 ['Pale Shade','Crowned Thrall','Mourning Moth','Ossuary Scarab','Stitched Shroudling','Grave Haunter'],
 ['Prismatic Riftling','Astral Shardstalker','Crown Jelly','Eclipse Moth','Void Alpha','Unbound Wisp']
];
const ELITE_BOONS={
 fervor:{name:'Battle Fervor',seconds:45,damage:1.18,description:'+18% hit damage',color:'#e8b07c'},
 windstep:{name:'Windstep',seconds:40,attackSpeed:1.15,movement:1.12,description:'+15% attack speed · +12% movement',color:'#a8ded7'},
 stoneguard:{name:'Stonebreaker',seconds:60,eliteDamage:1.25,description:'+25% damage to elites and bosses',color:'#c7d6a6'},
 silence:{name:'Totem Silence',seconds:45,disableTotems:1,description:'Disable every enemy totem while this blessing lasts',color:'#c3abf4'},
 quagmire:{name:'Stillworld',seconds:40,enemyMovement:.5,description:'All enemy movement is halved, including charges',color:'#a8dcf2'},
 bounty:{name:'Golden Hunt',seconds:50,goldPerKill:1,description:'Each non-summoned kill grants 1 extra gold',color:'#f2d282'},
 harvest:{name:'Plentiful Hunt',seconds:50,resourceLuck:1,description:'+50% material drop chance; drops remain rare',color:'#aeda93'},
 cascade:{name:'Chain Reaction',seconds:45,chainChance:.22,description:'Hits have a 22% chance to arc to another enemy',color:'#a9c3f3'},
 momentum:{name:'Momentum',seconds:45,damage:1.10,attackSpeed:1.08,description:'+10% hit damage · +8% attack speed',color:'#e9a985'},
 longarm:{name:'Long Reach',seconds:50,range:1.25,description:'+25% attack reach for Melee, Mage and Ranged',color:'#d1dca9'}
};
const rareEliteImages=new Map();
let rareEliteInstalled=false,eliteRewardId=0,eliteRewardPause=false,eliteRewardOpenedAt=0;
function normalizeRareEliteProgression(){
 const seen=new Set();data.eliteSpoils=(Array.isArray(data.eliteSpoils)?data.eliteSpoils:[]).filter(d=>d&&Number.isSafeInteger(d.id)&&d.id>0&&!seen.has(d.id)&&seen.add(d.id)&&Number.isInteger(d.zone)&&d.zone>=0&&d.zone<=9999&&Number.isFinite(d.x)&&Number.isFinite(d.y)).slice(-256).map(d=>{const drop={id:d.id,zone:d.zone,x:Math.max(-1e7,Math.min(1e7,d.x)),y:Math.max(-1e7,Math.min(1e7,d.y))};drop.choices=Array.isArray(d.choices)&&d.choices.length===3&&new Set(d.choices).size===3&&d.choices.every(id=>ELITE_BOONS[id])?[...d.choices]:blessingChoices(drop);return drop;});
 data.eliteSpoilsSequence=Math.max(0,...data.eliteSpoils.map(d=>d.id),Math.min(1e12,Math.floor(Number(data.eliteSpoilsSequence)||0)));
 const source=Array.isArray(data.eliteBoons)?data.eliteBoons:data.eliteBoon?[data.eliteBoon]:[];
 data.eliteBoons=source.filter(b=>ELITE_BOONS[b?.id]&&Number.isFinite(b.remaining)&&b.remaining>0&&(b.dungeon||dungeonForZone(b.zone??zoneNumber()).id)===dungeonForZone().id).slice(-128).map((b,i)=>({id:b.id,dungeon:b.dungeon||dungeonForZone(b.zone??zoneNumber()).id,remaining:Math.min(ELITE_BOONS[b.id].seconds*(b.source==='shop'?5:1),b.remaining),...(b.source==='shop'?{source:'shop'}:{}),uid:Number.isSafeInteger(b.uid)?b.uid:i+1}));
 data.eliteBoonSequence=Math.max(0,...data.eliteBoons.map(b=>b.uid),Number(data.eliteBoonSequence)||0);data.eliteBoon=data.eliteBoons[0]||null;
}
function eliteBoonValue(key,fallback=1){return activeEliteBoons().reduce((value,b)=>value*(ELITE_BOONS[b.id]?.[key]??1),fallback);}
function tickEliteBoon(dt){
 if(eliteRewardOpen())return;data.eliteBoons=activeEliteBoons().map(b=>({...b,remaining:Math.max(0,b.remaining-dt)})).filter(b=>b.remaining>0);data.eliteBoon=data.eliteBoons[0]||null;
}
function rareEliteImage(kind,variant){
 const key=ENVIRONMENT_ZONES[kind].key+'-'+variant,art=RARE_ELITE_ART[key];if(!art)return null;
 if(!rareEliteImages.has(key)){const image=new Image();image.decoding='async';image.src=art.src;rareEliteImages.set(key,image);}return rareEliteImages.get(key);
}
function primeRareElites(kind){for(let variant=0;variant<ENVIRONMENT_ZONES[kind].monsters.length;variant++)rareEliteImage(kind,variant);}
function promoteRareElite(enemy,roll=Math.random()){
 if(!enemy||enemy.summoned||enemy.boss||enemy.elite||game.phase%2!==0||game.phase>=6||game.phaseSpawned<3||game.rareEliteSpawned||(game.rareEliteCount||0)>=rareEliteQuota()||game.enemies.filter(other=>other.champion).length>=rareEliteQuota()||roll>=rareEliteSpawnChance())return false;
 enemy.champion=enemy.elite=true;enemy.baseRadius=enemy.rad;enemy.rad=Math.min(22,enemy.rad*1.2);enemy.hp=enemy.maxHp=enemy.maxHp*3.5;enemy.speed*=.90;enemy.castCooldown=1.4;
 enemy.name=RARE_ELITE_NAMES[enemy.biome??biomeIndex()][enemy.visualType||0];game.rareEliteCount=(game.rareEliteCount||0)+1;game.rareEliteSpawned=game.rareEliteCount>=rareEliteQuota();codexDiscover('rare_elites');return true;
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
 if(enemy.summoned||!enemy.elite||Math.random()>=.35)return null;
 const drop={id:++data.eliteSpoilsSequence,zone:zoneNumber(),x:enemy.x,y:enemy.y};drop.choices=blessingChoices(drop);data.eliteSpoils.push(drop);if(data.eliteSpoils.length>256)data.eliteSpoils.shift();codexDiscover('rare_elites');save();return drop;
}
function paintEliteSpoils(){
 const image=rareEliteImages.get('spoils');for(const drop of data.eliteSpoils||[]){if(drop.zone!==zoneNumber())continue;const bob=reducedMotion()?0:Math.sin(game.frame*2+drop.id)*2;
  glow(drop.x,drop.y,22,'#e7c67b2a');ellipse(drop.x,drop.y+8,13,4,'#100f0a70');if(image?.complete&&image.naturalWidth)ctx.drawImage(image,drop.x-16,drop.y-17+bob,32,32);
  if(Math.hypot(drop.x-game.player.x,drop.y-game.player.y)<120)encounterTip('WALK OVER · BLESSING',drop.x,drop.y-24,'#f2dca3',9,drop);
 }
}
function installRareEliteUI(){
 if(rareEliteInstalled)return;rareEliteInstalled=true;installBestiaryExpansion();
 for(const entry of [{id:'temporary_buffs',cat:'Guide',name:'Active temporary buffs',desc:'Every temporary effect and its independent remaining combat time.'},{id:'upgrade_vouchers',cat:'Guide',name:'Upgrade vouchers',desc:'Rare guardian drops. Each voucher names a specific rank upgrade for owned gear, jewelry, a tool or a station. Crafting and Steel promotions require their normal materials.'},{id:'combat_language',cat:'Guide',name:'Combat warning colors',desc:'Red danger, violet friendly fire, gold reflects, teal safety, blue shields.'},{id:'rare_elites',cat:'Guide',name:'Rare creatures and blessings',desc:'Walk over spoils to choose a stackable timed blessing.'},...Object.entries(ELITE_BOONS).map(([id,b])=>({id:'elite_boon_'+id,cat:'Dungeon Abilities',name:b.name,desc:b.description}))])if(!CODEX_ITEMS.some(item=>item.id===entry.id))CODEX_ITEMS.push(entry);
 const claim=document.createElement('button');claim.id='eliteSpoilsButton';claim.className='hidden';claim.setAttribute('aria-hidden','true');claim.tabIndex=-1;$('stageWrap').append(claim);
 $('stageWrap').insertAdjacentHTML('beforeend','<aside id="temporaryBuffs" class="temporary-buffs hidden" aria-label="Active temporary buffs"><span class="temporary-buff-count"></span><div class="temporary-buff-strip"></div></aside>');
 const image=new Image();image.src=iconAsset('codex-rare_elites');rareEliteImages.set('spoils',image);primeRareElites(biomeIndex());
 document.addEventListener('keydown',event=>{
  if(!eliteRewardOpen()||codexSession||event.ctrlKey||event.metaKey||event.altKey)return;
  const index=['Digit1','Digit2','Digit3','Numpad1','Numpad2','Numpad3'].indexOf(event.code),focused=event.target.closest('[data-elite-choice],#eliteRewardLater');
  if(index>=0){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat&&performance.now()-eliteRewardOpenedAt>180){const drop=data.eliteSpoils.find(d=>d.id===eliteRewardId);if(drop)chooseEliteBoon(drop.choices[index%3]);}return;}
  if(event.key==='Tab'||(event.key==='Enter'||event.code==='Space')&&focused&&!event.repeat)return;
  event.preventDefault();event.stopImmediatePropagation();
 },true);
}
function refreshRareEliteUI(){if(rareEliteInstalled){$('eliteSpoilsButton').classList.add('hidden');refreshTemporaryBuffs();}}
function openEliteReward(id){
 const drop=data.eliteSpoils.find(item=>item.zone===zoneNumber()&&(!id||item.id===id));if(!drop||game.status!=='running'||game.scene!=='combat'||drawerKind||!$('overlay').classList.contains('hidden'))return false;
 if(!drop.choices)drop.choices=blessingChoices(drop);eliteRewardId=drop.id;eliteRewardPause=game.menuPaused;eliteRewardOpenedAt=performance.now();game.menuPaused=true;game.keys={};game.mouseMove.active=false;resetArenaTouch(true);
 showOverlay('<div class="elite-reward-choices" aria-label="Choose a blessing">'+drop.choices.map((id,index)=>{const b=ELITE_BOONS[id];return '<button type="button" class="elite-boon-choice" data-elite-choice="'+id+'"><span class="elite-choice-key">'+String.fromCharCode(65+index)+'</span>'+artHTML('codex-elite_boon_'+id)+'<span class="elite-choice-copy"><b>'+b.name+'</b><span>'+b.description+'</span><small>'+((activeEliteBoons().filter(v=>v.id===id).length)?'Add stack '+(activeEliteBoons().filter(v=>v.id===id).length+1)+' · '+blessingStackEffect(id,activeEliteBoons().filter(v=>v.id===id).length+1)+' · ':'')+b.seconds+'s · key '+(index+1)+'</small></span></button>';}).join('')+'</div><button type="button" class="elite-reward-later" id="eliteRewardLater">Skip blessing</button>','elite-reward-overlay');
 document.body.classList.add('blessing-choices-open');$('overlay').removeAttribute('aria-labelledby');$('overlay').setAttribute('aria-label','Choose a blessing');
 $('overlayCard').querySelectorAll('[data-elite-choice]').forEach(button=>button.onclick=()=>chooseEliteBoon(button.dataset.eliteChoice));$('eliteRewardLater').onclick=()=>closeEliteReward(true);$('overlayCard').querySelectorAll('button').forEach(bindTouchNavigation);$('overlayCard').focus({preventScroll:true});updatePauseHud();return true;
}
function closeEliteReward(skip=false){
 if(skip)data.eliteSpoils=data.eliteSpoils.filter(d=>d.id!==eliteRewardId);eliteRewardId=0;hideOverlay(true);game.menuPaused=eliteRewardPause||!!game.manualPaused;game.keys={};resetArenaTouch(true);save();refreshRareEliteUI();updatePauseHud();
}
function chooseEliteBoon(id){
 const index=data.eliteSpoils.findIndex(d=>d.id===eliteRewardId&&d.zone===zoneNumber()),drop=data.eliteSpoils[index];if(!eliteRewardOpen()||!ELITE_BOONS[id]||!drop?.choices.includes(id)||codexSession)return false;
 data.eliteSpoils.splice(index,1);(data.eliteBoons||(data.eliteBoons=[])).push({id,dungeon:dungeonForZone().id,remaining:ELITE_BOONS[id].seconds,uid:++data.eliteBoonSequence});data.eliteBoon=data.eliteBoons[0]||null;codexDiscover('elite_boon_'+id);closeEliteReward();save();refreshUI();return true;
}
function eliteBoonHud(){
 const groups=new Map();for(const b of activeEliteBoons()){if(!groups.has(b.id))groups.set(b.id,[]);groups.get(b.id).push(b);}
 return [...groups].map(([id,boons])=>{const b=ELITE_BOONS[id],time=Math.ceil(Math.min(...boons.map(b=>b.remaining)));return '<button type="button" class="buff-icon elite-boon-icon" data-codex-entry="elite_boon_'+id+'" aria-label="'+b.name+' · '+boons.length+' stack'+(boons.length>1?'s':'')+' · next expiry '+time+' seconds" data-hint="'+b.name+' · '+b.description+' · next expiry '+time+'s">'+artHTML('codex-elite_boon_'+id)+'<b>'+(boons.length>1?boons.length+'× · ':'')+time+'s</b></button>';}).join('');
}
function paintEliteBoonAura(player){
 const boons=activeEliteBoons();if(!boons.length)return;ctx.save();ctx.strokeStyle=ELITE_BOONS[boons[0].id].color+'80';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(player.x,player.y+14,21,7,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function rareEliteCodexHtml(){return codexParagraph('Rare and other elite creatures each leave spoils 35% of the time. Walk over a drop to pause the delve and choose A, B or C. Select with a touch/click or keys 1/2/3; movement keys cannot choose or dismiss it. Skip blessing discards that drop.')+codexRuleList([['Blessings','40–60 seconds of combat time. Multiple different or repeated blessings can stack.'],['Pause','Menus, skilling and the choice screen preserve all remaining time.'],['Travel','Blessings remain within this Dungeon; unclaimed spoils remain in their Zone.'],['Summons','Summoned creatures grant no loot or wave progress. Destroy their summoning totem to stop replacements.'],['Violet attacks','Hurt you and other monsters. Bait enemies into a cleave, charge or marked eruption.'],['Red attacks','Hurt you only.']]);}
function eliteBoonCodexHtml(id){const b=ELITE_BOONS[id];return codexParagraph(b.description+'.')+codexRuleList([['Duration',b.seconds+' seconds of combat time'],['Source','35% of rare and other elite defeats, or Long blessings in the Dungeon Shop for five times the duration'],['Stacking','All blessings stack, including repeated copies, with independent expiry times.'],['Combined active effect',blessingStackEffect(id,activeEliteBoons().filter(v=>v.id===id).length)||'None active'],['Timing','Pause, menus and skilling preserve time. Delve speed advances combat time.'],['Scope','This Dungeon']])+codexHeading('Active stacks',codexRuleList(activeEliteBoons().filter(b=>b.id===id).sort((a,b)=>a.remaining-b.remaining).map((b,i)=>['Stack '+(i+1),Math.ceil(b.remaining)+' seconds of combat time remaining'])))+codexParagraph('The HUD shows the next stack to expire. Pause, menus and skilling freeze the countdown; Delving speed advances it.');}

/* Enemy area attacks hit each ordinary monster once, without player hit procs. */
function cleaveContains(actor,cast){
 const dx=actor.x-cast.origin.x,dy=actor.y-cast.origin.y,distance=Math.hypot(dx,dy);if(distance>cast.reach+(actor.rad||12))return false;
 const angle=Math.atan2(dy,dx)-cast.angle;return Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=cast.halfAngle;
}
function damageMonstersInAttack(owner,shape,contains){
 if(!owner||!game.enemies.includes(owner)||game.status!=='running')return;const hits=shape.enemyHits||(shape.enemyHits=new Set());
 for(const enemy of [...game.enemies]){
  if(!game.enemies.includes(owner)||game.status!=='running')break;if(enemy===owner||hits.has(enemy)||!contains(enemy))continue;
  hits.add(enemy);const damage=enemy.maxHp*(enemy.boss?.025:enemy.elite?.12:.35)*enemyShieldMultiplier(enemy);enemy.hp-=damage;enemy.lastHitAt=game.frame;enemy.lastDamageStyle=combatStyle();
  if(game.floaters.length<90)floater(enemy.x,enemy.y-25,Number(damage.toFixed(1)),combatTheme('friendly').hot);burst(enemy.x,enemy.y,3,combatTheme('friendly').color);if(enemy.hp<=0)onKill(enemy);
 }
}
function paintEnemyCleave(cast,theme,progress=1,active=false){
 ctx.save();ctx.translate(cast.origin.x,cast.origin.y);ctx.rotate(cast.angle);ctx.fillStyle=theme.color+(active?'45':'19');ctx.strokeStyle=theme.color;ctx.lineWidth=active?3:2;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,cast.reach,-cast.halfAngle,cast.halfAngle);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=theme.hot;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,cast.reach+4,-cast.halfAngle,-cast.halfAngle+cast.halfAngle*2*progress);ctx.stroke();ctx.restore();
}

function eliteRewardOpen(){return !!eliteRewardId&&!$('overlay').classList.contains('hidden')&&$('overlayCard').classList.contains('elite-reward-overlay');}

function blessingChoices(drop){
 const pool=Object.keys(ELITE_BOONS),chosen=[];let state=((drop.id*2654435761)^(drop.zone*1013904223)^0x6d2b79f5)>>>0;
 for(let i=0;i<3;i++){state^=state<<13;state^=state>>>17;state^=state<<5;chosen.push(pool.splice((state>>>0)%pool.length,1)[0]);}return chosen;
}

function activeEliteBoons(){return (data.eliteBoons||[]).filter(b=>b.remaining>0&&b.dungeon===dungeonForZone().id);}

function eliteBoonSum(key){return activeEliteBoons().reduce((value,b)=>value+(ELITE_BOONS[b.id]?.[key]||0),0);}

function eliteBoonActive(id){return activeEliteBoons().some(b=>b.id===id);}

function tickEliteSpoils(){
 if(game.scene!=='combat'||game.status!=='running'||game.menuPaused||game.manualPaused||drawerKind||!$('overlay').classList.contains('hidden'))return false;
 const drop=(data.eliteSpoils||[]).filter(d=>d.zone===zoneNumber()).sort((a,b)=>Math.hypot(a.x-game.player.x,a.y-game.player.y)-Math.hypot(b.x-game.player.x,b.y-game.player.y))[0];
 return !!drop&&Math.hypot(drop.x-game.player.x,drop.y-game.player.y)<30?openEliteReward(drop.id):false;
}
