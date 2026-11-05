/* One item supplies ten seconds of combat firing time, independently per weapon. */
const AMMUNITION_SECONDS=10;
function normalizeAmmunition(){
 const old=data.ammoCharges||{};data.ammoCharges=Object.fromEntries(['arrows','runes'].map(key=>[key,Math.max(0,Math.min(AMMUNITION_SECONDS,Number(old[key])||0))]));
}
function ammunitionResource(){return data.weaponType==='bow'?'arrows':data.weaponType==='staff'?'runes':'';}
function ammunitionCharge(key=ammunitionResource()){return Math.max(0,Number(data.ammoCharges?.[key])||0);}
function loadAmmunition(key){
 if(ammunitionCharge(key)>1e-8)return true;if((data[key]||0)<1)return false;
 data[key]--;data.ammoCharges[key]=AMMUNITION_SECONDS;return true;
}
function tickAmmunition(dt){
 const key=ammunitionResource();if(!key||ammunitionCharge(key)<=0)return;
 const p=game.player,reach=attackReach();
 if(combatTargets().some(enemy=>bodyDistance(enemy,p.x,p.y)<reach))data.ammoCharges[key]=Math.max(0,ammunitionCharge(key)-dt);
}
function renderAmmunitionHud(){
 const host=$('ammoNotice'),key=ammunitionResource(),visible=game.scene==='combat'&&!!key;if(!host)return;host.classList.toggle('hidden',!visible);if(!visible)return;
 const charge=ammunitionCharge(key),reserve=Math.floor(data[key]||0),seconds=charge>0?Math.ceil(charge*10)/10:0,total=Math.ceil(reserve*AMMUNITION_SECONDS+charge),label=RESOURCE_LABEL[key]+' · '+format(reserve)+' in reserve · '+seconds.toFixed(1)+'s loaded · '+total+'s total firing time';
 const html=artHTML(RESOURCE_ART[key])+'<span>'+uiCompact(reserve)+'</span><small>'+uiCompact(total)+'s</small>';
 if(host.dataset.html!==html){host.innerHTML=html;host.dataset.html=html;}
 host.classList.toggle('is-empty',reserve<1&&charge<=0);host.classList.toggle('is-low',total>0&&total<60);host.setAttribute('aria-label',label);host.dataset.hint=label+' · Each supplies 10s of firing time';host.onclick=()=>trackAmmunition(key);
}
