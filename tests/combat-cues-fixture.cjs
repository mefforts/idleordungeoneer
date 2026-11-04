// Synthetic encounters injected into browser responses, never into the build.
function combatCuesFixture(){
 function prepare(type='donut',kind=2,offset=0,side='right',elite=false,stage=3){
  resize();__encounterTest.fresh(kind,stage);data.hudLayout.side=side;applyHudLayout();data.combatLanguageTipSeen=true;
  game.camX=game.camY=offset;game.player.x=offset;game.player.y=offset+35;game.player.invuln=0;
  const enemy=__encounterTest.owner(0,elite);enemy.x=offset;enemy.y=offset-150;enemy.phaseQueue=[type];
  return enemy;
 }
 function placement(enemy,result){
  const cast=enemy.cast,shape=cast?.shapes[0];return {result,shape,arena:cast?.arena,total:cast?.total,enemy:{x:enemy.x,y:enemy.y,rad:enemy.rad},player:{x:game.player.x,y:game.player.y},clear:shape?encounterClear(shape.x,shape.y,shape.inner+9):false};
 }
 window.__combatCues={
  place(kind=2,offset=0,side='right',elite=false){const e=prepare('donut',kind,offset,side,elite);return placement(e,beginBossCast(e));},
  blocked(){const e=prepare(),clear=encounterClear;encounterClear=()=>false;let blocked;try{blocked={result:beginBossCast(e),cast:!!e.cast,queue:[...e.phaseQueue],hazards:game.hazards.length};}finally{encounterClear=clear;}return {blocked,retry:placement(e,beginBossCast(e))};},
  occupied(){const e=prepare(),first=beginBossCast(e),initial=e.cast.shapes[0];e.cast=null;e.phaseQueue=['donut'];const other=spawnEnemy();Object.assign(other,{x:initial.x,y:initial.y,hp:1000,maxHp:1000,speed:0});return {initial,other:{x:other.x,y:other.y,rad:other.rad},next:placement(e,beginBossCast(e))};},
  refugeHit(inside=true){const e=prepare();if(!beginBossCast(e))throw Error('No refuge');const c=e.cast,s=c.shapes[0];e.cast=null;resolveBossCast(e,c);game.player.x=s.x+(inside?0:s.inner+35);game.player.y=s.y;game.player.invuln=0;const before=game.player.hp;tickDungeonHazards(.02);const h=game.hazards[0];return {before,after:game.player.hp,warning:s,impact:{x:h.x,y:h.y,inner:h.inner,refuge:h.refuge}};},
  pulse(dashing=false,center=false){
   const e=prepare('gravePulse');e.x=e.y=0;game.player.x=1000;game.player.y=0;if(!beginBossCast(e))throw Error('No pulse');const c=e.cast;e.cast=null;resolveBossCast(e,c);
   if(!center)for(let i=0;i<90;i++)tickDungeonHazards(.01);
   let angle=null;for(let i=0;i<24;i++){const a=i*Math.PI/12;if(Array.from({length:20},(_,n)=>185+n*9).every(r=>encounterClear(Math.cos(a)*r,Math.sin(a)*r+13,12))){angle=a;break;}}
   if(angle===null)throw Error('No open dash lane');const p=game.player,r=center?0:game.hazards[0].r+18;p.x=Math.cos(angle)*r;p.y=Math.sin(angle)*r;p.invuln=0;game.keys={};game.mouseMove.active=false;game.joystick.pointer=null;
   e.contact=1e6;const before=p.hp;
   if(dashing){p.vx=-Math.cos(angle);p.vy=-Math.sin(angle);p.dashCooldown=0;dash();}
   for(let i=0;i<60;i++)tickCombat(.01);
   return {before,after:p.hp,waves:game.hazards.filter(h=>h.wave).map(h=>({inner:h.inner,r:h.r,hit:!!h.playerHit,delay:h.delay,countered:!!h.dashCountered})),distance:Math.hypot(p.x-e.x,p.y-e.y),dashCooldown:p.dashCooldown,warning:c.shapes[0],hint:c.hint};
  },
  pixels(type='gravePulse',active=false,reduced=false){
   data.reducedMotion=reduced;const shape=type==='gravePulse'?{shape:'ring',x:180,y:180,inner:active?100:25,r:active?122:47,wave:true}:{shape:'ring',x:180,y:180,inner:82,r:160,refuge:true};
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);paintExpandedShape(shape,combatTheme(type==='gravePulse'?'friendly':'danger'),.6,active);ctx.restore();
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let teal=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+1]>pixels[i]+30&&pixels[i+1]>pixels[i+2]+10)teal++;return {teal};
  },
  labels(type,kind=0,stage='warning',elite=false){const labels=[],fill=ctx.fillText;ctx.fillText=function(text,...args){labels.push(String(text));return fill.call(this,text,...args);};try{__abilityEffectsTest.show(type,kind,stage,elite);paintThreatTelegraphs();return labels;}finally{ctx.fillText=fill;}},
  guide(){return combatGuideHtml();},
  pause(){const e=prepare('gravePulse');beginBossCast(e);const c=e.cast;e.cast=null;resolveBossCast(e,c);const before=JSON.stringify(game.hazards.map(h=>({r:h.r,inner:h.inner,delay:h.delay,life:h.life})));game.menuPaused=true;update(.5);return {before,after:JSON.stringify(game.hazards.map(h=>({r:h.r,inner:h.inner,delay:h.delay,life:h.life})))};},
  async ready(){await __encounterTest.ready();await Promise.allSettled([...document.images,...DeepwellAvatar.images()].map(i=>i.decode()));},
  visual(type='gravePulse',active=false){
   const e=prepare(type,2,0,'right',true,1);data.idleNoticeSlots=2;data.idleFirstAssigned=data.firstWeaponCrafted=true;game.phase=4;game.phaseTarget=zoneBalance().targets[4];game.phaseSpawned=game.phaseTarget;game.player.hp=game.player.maxHp=180;game.attackTimer=1e8;
   if(!beginBossCast(e))throw Error('Visual cast deferred');const c=e.cast;game.frame=4;game.menuPaused=true;
   if(active){e.cast=null;resolveBossCast(e,c);game.player.x=type==='donut'?c.shapes[0].x:350;game.player.y=type==='donut'?c.shapes[0].y:250;for(let i=0;i<(type==='gravePulse'?60:18);i++)tickDungeonHazards(.01);if(type==='gravePulse'){game.player.x=70;game.player.y=85;}}
   else c.windup=c.total*.5;
   $('toastStack').replaceChildren();refreshUI();render();return {cast:c,enemy:{x:e.x,y:e.y},player:{x:game.player.x,y:game.player.y}};
  }
 };
}
module.exports={combatCuesFixture};
