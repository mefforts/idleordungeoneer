/* Normal replay travel stays within the player's completed frontier. */
let delveTravelZone=0,delveTravelInstalled=false;
function installDelveTravelUI(){
 if(delveTravelInstalled)return;delveTravelInstalled=true;
 const pane=document.createElement('section');pane.id='delveTravelView';pane.className='drawer-custom delve-travel-view hidden';$('gameDrawer').append(pane);
 $('delveNav').onclick=()=>{
  if(drawerKind==='delve'){closeDrawer();return;}
  if(game.scene==='combat'&&!drawerKind&&game.status==='running'&&$('overlay').classList.contains('hidden')){openDelveTravel();return;}
  closeDrawer(false);setScene('combat',true);
 };
}
function delveFrontier(){return Math.max(1,Math.min(zoneEnd(999),Math.floor(data.cleared||0)+1));}
function openDelveTravel(){delveTravelZone=zoneNumber();openDrawer('delve');}
function renderDelveTravel(){
 const host=$('delveTravelView');if(!host||drawerKind!=='delve')return;
 const frontier=delveFrontier(),lastZone=zoneForFloor(frontier),count=Math.min(1000,Math.max(BIOMES.length,lastZone+1)),kind=delveTravelZone%BIOMES.length,b=BIOMES[kind];
 host.innerHTML='<nav class="delve-zone-tabs" aria-label="Choose a Zone">'+Array.from({length:count},(_,index)=>'<button type="button" data-delve-zone="'+index+'" aria-pressed="'+(index===delveTravelZone)+'" '+(index>lastZone?'disabled':'')+'>'+artHTML('codex-biome_'+index%BIOMES.length)+'<span>Zone '+(index+1)+'</span>'+(index>lastZone?uiIcon('lock'):'')+'</button>').join('')+'</nav><header class="delve-zone-heading"><div><h3>'+b.name+'</h3><small>Zone '+(delveTravelZone+1)+'</small></div><span class="delve-target" data-hint="Recommended damage">'+uiIcon('sword')+Math.round(zoneBalance(delveTravelZone).dps)+' DPS</span></header><div class="delve-floor-list '+(zoneFloorCount(delveTravelZone)>5?'delve-floor-grid':'')+'">'+Array.from({length:zoneFloorCount(delveTravelZone)},(_,i)=>i+1).map(stage=>{
  const floor=floorAtZone(delveTravelZone,stage),complete=floor<=data.cleared,locked=floor>frontier,current=floor===data.floor,action=locked?'Locked':current?'Restart':complete?'Replay':'Delve';
  return '<button type="button" class="delve-floor" data-delve-floor="'+floor+'" aria-label="'+action+' Zone '+(delveTravelZone+1)+' Floor '+stage+' · '+escapeHTML(zoneFloorName(delveTravelZone,stage))+'" data-hint="'+escapeHTML(zoneFloorName(delveTravelZone,stage))+'" '+(locked?'disabled':'')+'><span class="delve-floor-mark">'+uiIcon(locked?'lock':complete?'check':'arrow')+'</span><span class="delve-floor-copy"><b>'+(zoneFloorCount(delveTravelZone)>5?stage:'Floor '+stage)+'</b><small>'+zoneFloorName(delveTravelZone,stage)+'</small></span><span class="delve-floor-action">'+action+uiIcon('chevron')+'</span></button>';
 }).join('')+'</div>'+((data.floor!==frontier||delveTravelZone!==lastZone)?'<button type="button" class="delve-frontier" data-delve-floor="'+frontier+'">Frontier · Zone '+(lastZone+1)+' · Floor '+floorStage(frontier)+uiIcon('arrow')+'</button>':'')+(idleSlotsUnlocked()===2&&data.idleJobs.filter(Boolean).length<2?'<button type="button" class="delve-idle-link" id="delveIdleHub">'+uiIcon('idle')+'2 idle slots'+uiIcon('chevron')+'</button>':'');
 host.querySelectorAll('[data-delve-zone]').forEach(button=>button.onclick=()=>{delveTravelZone=Number(button.dataset.delveZone);renderDelveTravel();host.querySelector('[data-delve-zone="'+delveTravelZone+'"]').focus({preventScroll:true});});
 host.querySelectorAll('[data-delve-floor]').forEach(button=>button.onclick=()=>startDelveFloor(Number(button.dataset.delveFloor)));
 $('delveIdleHub')?.addEventListener('click',openIdleHub);host.querySelectorAll('button').forEach(bindTouchNavigation);
}
function startDelveFloor(floor){
 if(!Number.isInteger(floor)||floor<1||floor>delveFrontier())return false;
 checkpointGroundXp();closeDrawer(false);hideOverlay();data.floor=floor;data.zone=emptyZone();masteryDraft=null;startFloor();save();return true;
}
function announceZone2TravelTip(){
 if(data.floor!==zoneStart(1)||data.cleared<zoneEnd(0)||data.zone2TravelTipSeen)return;
 data.zone2TravelTipSeen=true;toast('Zone 2','Replay cleared floors with Delve. Your second idle slot is ready in Skills.');save();
}
