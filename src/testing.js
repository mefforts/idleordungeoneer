/* Independent testing speed for online skilling; Mastery remains combat-only. */
// Fingerprints avoid publishing redemption phrases in the client source.
const REDEEM_CODE_ACTIONS=Object.freeze({"b57595b70c1554f2114cbce213c6d7896a574012b270f9cc848743f630a65efc":"speed","9baf3a40312f39849f46dad1040f2f039f1cffa1238c41e9db675315cfad39b6":"sandbox"});
async function redeemCodeAction(value){
 if(!globalThis.crypto?.subtle)return '';
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value.trim().toLowerCase()));
 const fingerprint=Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
 return REDEEM_CODE_ACTIONS[fingerprint]||'';
}
function skillingTimeMultiplier(){return data.devSpeedUnlocked?(game.skillSpeed||1):1;}
function speedControlVisible(){return !!data.devSpeedUnlocked||game.scene==='combat'&&masteryUnlocked();}
function speedControlName(){return game.scene==='combat'?'Delve speed':'Skilling speed';}
function selectedSceneSpeed(){return game.scene==='combat'?(game.devSpeed||1):(game.skillSpeed||1);}
function advanceActiveWork(seconds){
 if(!game.holdSkill){game.activeClockMs+=seconds*1000;return;}
 const before=game.activeHits||0;let left=seconds;
 // Step the work clock so fast cycles still consume every recipe's ingredients.
 while(left>1e-9){
  const step=Math.min(.1-(game.holdAccum||0),left);left-=step;game.activeClockMs+=step*1000;
  game.holdAccum=(game.holdAccum||0)+step;
  if(game.holdAccum>=.1-1e-9){
   game.holdAccum=Math.max(0,game.holdAccum-.1);
   if(!$('app').classList.contains('drawer-open')&&$('overlay').classList.contains('hidden')&&$('resourcePicker').classList.contains('hidden'))activeSkill(game.holdSkill,true);
  }
 }
 if((game.activeHits||0)>before){refreshUI();if(Math.ceil(game.activeHits/9)>Math.ceil(before/9))save();}
}

/* Explicitly unlocked test travel; normal progression retains its gates. */
function fillTestingResources(){
 const keys=new Set(['gold','essence','ore','bars','logs','arrows','cloth','runes','scraps','silverOre','silverBars','opals','cutOpals']);
 for(const skill of Object.values(SKILLS))keys.add(skill.resource);
 for(const key of keys)data[key]=Math.max(SANDBOX_RESOURCE_CAP,Number(data[key])||0);
 if(!data.devSpeedUnlocked)game.skillSpeed=1;data.devSpeedUnlocked=true;data.devTravelUnlocked=true;
 data.cleared=Math.max(data.cleared,zoneEnd(BIOMES.length-1));
 if(!data.biomeLoot||typeof data.biomeLoot!=='object')data.biomeLoot={};
 for(let i=0;i<BIOMES.length;i++){
  data.biomeLoot[i]=Math.max(SANDBOX_RESOURCE_CAP,Number(data.biomeLoot[i])||0);
  const b=zoneShopFor(i);b.currency=Math.max(b.currency,SANDBOX_RESOURCE_CAP);b.earned=Math.max(b.earned,b.currency);codexDiscover('zone_shop');
  const m=masteryFor();m.points=Math.max(m.points,9999);m.earned=Math.max(m.earned,9999);
  if(!data.seenElites)data.seenElites={};data.seenElites[i]=[true,true,true];
  codexDiscover('biome_'+i);codexDiscover('loot_'+i);
  for(let b=0;b<3;b++)codexDiscover('boss_'+i+'_'+b);
 }
 for(const key of new Set([...Object.keys(data.legacyZoneShops||{}),String(zoneNumber())])){const b=zoneShopFor(Number(key));b.currency=Math.max(b.currency,SANDBOX_RESOURCE_CAP);b.earned=Math.max(b.earned,b.currency);}
 data.masteryIntroSeen=true;data.zone2SkillsAnnounced=true;
 for(const key of keys)if(CODEX_ITEMS.some(v=>v.id==='resource_'+key))codexDiscover('resource_'+key);
 save();refreshUI();refreshTestTravel();
}
function refreshTestTravel(){
 const root=$('settingsView');if(!root||drawerKind!=='settings')return;
 let host=$('testTravel');if(!data.devTravelUnlocked){host?.remove();return;}
 if(!host){host=document.createElement('section');host.id='testTravel';host.className='test-travel';root.querySelector('.settings-save')?.before(host);if(!host.isConnected)root.append(host);}
 const count=Math.min(1000,Math.max(BIOMES.length,zoneForFloor(Math.max(1,data.cleared))+1,zoneNumber()+1));
 host.innerHTML='<div class="compact-section-title"><h3>Test travel</h3></div><div class="test-route"><label for="testZone">Zone<select id="testZone">'+Array.from({length:count},(_,i)=>'<option value="'+(i+1)+'" '+(i===zoneNumber()?'selected':'')+'>'+(i+1)+' · '+BIOMES[i%BIOMES.length].name+'</option>').join('')+'</select></label><label for="testFloor">Floor<select id="testFloor">'+Array.from({length:zoneFloorCount()},(_,i)=>i+1).map(n=>'<option '+(n===zoneStage()?'selected':'')+'>'+n+'</option>').join('')+'</select></label><button type="button" id="testTravelGo" aria-label="Restart selected zone and floor" data-hint="Restart selected floor">'+uiIcon('arrow')+'</button></div>';
 $('testZone').onchange=()=>{const count=zoneFloorCount(Number($('testZone').value)-1);$('testFloor').innerHTML=Array.from({length:count},(_,i)=>'<option>'+(i+1)+'</option>').join('');};
 $('testTravelGo').onclick=()=>testTravelTo(Number($('testZone').value),Number($('testFloor').value));
}
function testTravelTo(zone,stage){
 if(!data.devTravelUnlocked||!Number.isInteger(zone)||zone<1||zone>1000||!Number.isInteger(stage)||stage<1||stage>zoneFloorCount(zone-1))return false;
 const floor=floorAtZone(zone-1,stage);checkpointGroundXp();closeDrawer();hideOverlay();
 data.cleared=Math.max(data.cleared,floor);data.floor=floor;data.zone=emptyZone();masteryDraft=null;
 resetRun();game.manualPaused=game.menuPaused=false;setScene('combat',false);startFloor();save();
 toast('Zone '+zone+' · Floor '+stage);return true;
}
