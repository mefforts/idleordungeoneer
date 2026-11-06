// Synthetic review controls. Inject into an isolated browser response only.
function abilityConveyanceFixture(){
 function raster(draw){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);draw();ctx.restore();
  const bytes=ctx.getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261,count=0;for(let i=0;i<bytes.length;i+=4){hash=Math.imul(hash^bytes[i],16777619);hash=Math.imul(hash^bytes[i+1],16777619);hash=Math.imul(hash^bytes[i+2],16777619);if(bytes[i]+bytes[i+1]+bytes[i+2]>35)count++;}return {hash:hash>>>0,count};
 }
 function snapshot(){return __abilityEffectsTest.mechanics()+JSON.stringify(game.themedEvents);}
 window.__communication={
  async ready(){await __encounterTest.ready();await __themedTest.ready();await Promise.allSettled([...travellingArtImages.values()].map(i=>i.decode()));},
  show(type='ground',kind=1,stage='early',reduced=false){
   if(THEMED_MECHANICS[type]){
    const z=__themedTest.visualState(type,stage==='active'?.3:0);if(stage!=='active'){game.themedEvents=[];z.cast.windup=z.cast.total*(stage==='early'?.85:.08);z.event.owner.cast=z.cast;}
   }else{__abilityEffectsTest.show(type,kind,stage==='active'?'impact':'warning');if(stage!=='active')for(const e of game.enemies)if(e.cast)e.cast.windup=e.cast.total*(stage==='early'?.85:.08);}
   if(type==='charge'&&stage==='active')tickCombat(.12);
   data.reducedMotion=reduced;game.menuPaused=true;$('toastStack').replaceChildren();refreshUI();render();
  },
  pure(){const before=snapshot(),original=Math.random;let calls=0;Math.random=()=>{calls++;return .5;};try{for(let i=0;i<3;i++){paintAbilityGroundArt();paintThreatTelegraphs();paintThemedGround();paintThemedAir();}}finally{Math.random=original;}return {same:before===snapshot(),calls};},
  timing(){const e={type:'forgeHammers',age:-3,warningTotal:4},f={start:0,end:.65};return {early:themedFieldCue(e,f,true),late:themedFieldCue({...e,age:-.2},f,true),next:themedFieldCue(e,{...f,start:1.65},true),active:themedFieldCue({...e,age:.2},f),ended:themedFieldCue({...e,age:1},f)};},
  footprint(shape,active=false,reduced=false){data.reducedMotion=reduced;return raster(()=>paintAbilityFootprint(shape,combatTheme('danger'),.8,active));},
  signal(language='danger'){return raster(()=>paintProjectileSignal(100,100,9,combatTheme(language)));},
  reflect(progress,reduced=false){data.reducedMotion=reduced;return raster(()=>paintReflectWardArt({x:140,y:180,r:60,inner:26,armed:true,variant:'rune'},progress,1));},
  frame(value){game.frame=value;},
  start(type,kind=1){this.show(type,kind,'early');game.attackTimer=1e9;for(const e of game.enemies){e.hp=e.maxHp;e.contact=e.castCooldown=1e9;if(e.cast)e.cast.windup=e.cast.total;}render();},
  step(dt){game.player.invuln=1e9;__abilityEffectsTest.advance(dt);},
  draw(){render();},
  pixels(){return raster(()=>{ctx.translate(canvas.width/2,canvas.height/2);paintAbilityGroundArt();paintThreatTelegraphs();paintThemedGround();paintThemedAir();});},
  boundary(){
   const shape={shape:'segment',a:{x:100,y:140},b:{x:240,y:140},width:40};raster(()=>paintAbilityFootprint(shape,combatTheme('danger'),.6,true));
   const at=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3).reduce((a,b)=>a+b,0),result={inside:at(170,140),roundEnd:at(252,140),outside:at(170,108),beyondEnd:at(266,140)};raster(()=>paintAbilityLane(shape.a,0,140,40,combatTheme('friendly'),.6,true));return {...result,laneEnd:at(252,140),laneBeyond:at(266,140)};
  }
 };
}
module.exports={abilityConveyanceFixture};
