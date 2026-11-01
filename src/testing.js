/* Explicitly unlocked test travel; normal progression retains its gates. */
function fillTestingResources(){
 const keys=new Set(['gold','essence','ore','bars','logs','arrows','cloth','runes','scraps','silverOre','silverBars','opals','cutOpals']);
 for(const skill of Object.values(SKILLS))keys.add(skill.resource);
 for(const key of keys)data[key]=Math.max(SANDBOX_RESOURCE_CAP,Number(data[key])||0);
 data.devSpeedUnlocked=true;data.devTravelUnlocked=true;
 data.cleared=Math.max(data.cleared,BIOMES.length*3);
 if(!data.biomeLoot||typeof data.biomeLoot!=='object')data.biomeLoot={};
 for(let i=0;i<BIOMES.length;i++){
  data.biomeLoot[i]=Math.max(SANDBOX_RESOURCE_CAP,Number(data.biomeLoot[i])||0);
  const m=masteryFor(i);m.points=Math.max(m.points,9999);m.earned=Math.max(m.earned,9999);
  if(!data.seenElites)data.seenElites={};data.seenElites[i]=[true,true,true];
  codexDiscover('biome_'+i);codexDiscover('loot_'+i);
  for(let b=0;b<3;b++)codexDiscover('boss_'+i+'_'+b);
 }
 data.masteryIntroSeen=true;data.zone2SkillsAnnounced=true;
 for(const key of keys)if(CODEX_ITEMS.some(v=>v.id==='resource_'+key))codexDiscover('resource_'+key);
 save();refreshUI();refreshTestTravel();
}
function refreshTestTravel(){
 const root=$('settingsView');if(!root||drawerKind!=='settings')return;
 let host=$('testTravel');if(!data.devTravelUnlocked){host?.remove();return;}
 if(!host){host=document.createElement('section');host.id='testTravel';host.className='test-travel';root.querySelector('.settings-save')?.before(host);if(!host.isConnected)root.append(host);}
 const count=Math.min(1000,Math.max(BIOMES.length,Math.ceil(data.cleared/3),zoneNumber()+1));
 host.innerHTML='<div class="compact-section-title"><h3>Test travel</h3></div><div class="test-route"><label for="testZone">Zone<select id="testZone">'+Array.from({length:count},(_,i)=>'<option value="'+(i+1)+'" '+(i===zoneNumber()?'selected':'')+'>'+(i+1)+' · '+BIOMES[i%BIOMES.length].name+'</option>').join('')+'</select></label><label for="testFloor">Floor<select id="testFloor">'+[1,2,3].map(n=>'<option '+(n===zoneStage()?'selected':'')+'>'+n+'</option>').join('')+'</select></label><button type="button" id="testTravelGo" aria-label="Restart selected zone and floor" data-hint="Restart selected floor · zone powers reset">'+uiIcon('arrow')+'</button></div>';
 $('testTravelGo').onclick=()=>testTravelTo(Number($('testZone').value),Number($('testFloor').value));
}
function testTravelTo(zone,stage){
 if(!data.devTravelUnlocked||!Number.isInteger(zone)||zone<1||zone>1000||![1,2,3].includes(stage))return false;
 const floor=(zone-1)*3+stage;checkpointGroundXp();closeDrawer();hideOverlay();
 data.cleared=Math.max(data.cleared,floor);data.floor=floor;data.zone=emptyZone();masteryDraft=null;
 resetRun();game.manualPaused=game.menuPaused=false;setScene('combat',false);startFloor();save();
 toast('Zone '+zone+' · Floor '+stage);return true;
}
