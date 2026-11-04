/* Selected encounter ideas. Numbers match ABILITY_IDEAS.md. */
const THEMED_MECHANICS=Object.fromEntries([
 ['burrowingBriar',1,0,'Burrowing Briar',1.8,1.2,'root','Move after the root stops tracking',1],
 ['rootGates',2,0,'Root Gates',2.1,4.4,'root','Cross the two offset openings',2],
 ['walkingHedge',3,0,'Walking Hedge',2,4.4,'thorns','Follow the opening in the moving hedge',3],
 ['seedChain',4,0,'Seed Chain',1.8,3.8,'pod','Read the next swelling seed',1],
 ['briarLeash',5,0,'Briar Leash',2,4.2,'root','Dash across the tether to cut it',2],
 ['sporeFan',6,0,'Spore Fan',1.8,5.4,'mushroom','Step between spores and their clouds',1],
 ['pollenTide',7,0,'Pollen Tide',1.8,4.2,'seed','Move sideways through the debris',2],
 ['clingingSeeds',8,0,'Clinging Seeds',1.8,5.6,'seed','A dash shakes off attached seeds',2],
 ['graftedSwap',9,0,'Grafted Swap',2.1,1.8,'sapling','Both root portals preview the swap',3],
 ['fallingCanopy',10,0,'Falling Canopy',2,3.8,'branch','Leave each falling branch shadow',3],
 ['rollingFurnace',11,1,'Rolling Furnace',1.9,4.6,'boulder','The cracked boulder rebounds once',1],
 ['forgeHammers',12,1,'Forge Hammers',2,3.8,'hammer','The raised hammer strikes next',1],
 ['furnaceVents',13,1,'Furnace Vents',1.9,4.2,'vent','Follow the grates lighting in order',1],
 ['coolingIslands',14,1,'Cooling Islands',2.4,6.6,'stone','Move to the next cooling island',3],
 ['cinderStitch',16,1,'Cinder Stitch',1.8,5.8,'needle','Cross before the stitched trail ignites',2],
 ['moltenDroplets',17,1,'Molten Droplets',2,4.4,'droplet','Splash marks include the smaller bursts',2],
 ['slagAnchors',18,1,'Slag Anchors',2.1,5.4,'anchor','Dash through an anchor to tear the fire curtain',2],
 ['backdraft',19,1,'Backdraft',1.9,4.4,'vent','Your older footprints ignite first',3],
 ['emberCatch',20,1,'Ember Catch',2.1,4.2,'droplet','Touch the gold ember to return a violet blast',2],
 ['boneLoom',21,2,'Bone Loom',2.1,4.6,'rib','Thread the wide corridor between the ribs',1],
 ['soulLantern',22,2,'Soul Lantern',2,6.4,'lantern','Intercept healing souls or dash through the lantern',1],
 ['coffinPress',23,2,'Coffin Press',2.1,3.8,'coffin','Leave through the open ends',1],
 ['hauntedFootsteps',24,2,'Haunted Footsteps',1.9,3.6,'ghost','The ghost repeats the marked route',1],
 ['graveClock',25,2,'Grave Clock',2.1,4.2,'clock','Use the broken hand; it reverses after a pause',2],
 ['returningSigil',27,2,'Returning Sigil',2,7.8,'lantern','Touch each gold rune before its arc runs out',2],
 ['ribcageRise',28,2,'Ribcage Rise',2.2,3.8,'rib','Leave through the opening before the ribs collapse',3],
 ['hollowChorus',29,2,'Hollow Chorus',2.1,5.4,'ghost','Raised lanterns show the order of the waves',2],
 ['borrowedBreath',30,2,'Borrowed Breath',2.2,4.6,'wisp','Visit a teal stone before the curse closes',3],
 ['astralSlingshot',31,3,'Astral Slingshot',2,5.2,'lens','Shots curve around the lens',1],
 ['gravityWell',32,3,'Gravity Well',2,4.2,'lens','Escape the pull before its burst',1],
 ['orbitTransfer',33,3,'Orbit Transfer',2,5.4,'blade','Watch the bridge and the blade’s next owner',2],
 ['stargateVolley',34,3,'Stargate Volley',2,4.6,'portal','The second portal previews the exit direction',1],
 ['constellationCage',35,3,'Constellation Cage',2,1.6,'star','Leave the outlined triangle before it connects',1],
 ['riftScissors',36,3,'Rift Scissors',2.1,3.8,'rift','Use the openings beyond the crescent tips',2],
 ['collapsingNova',37,3,'Collapsing Nova',2.3,9.8,'star','Counter the gold rune or cross the delayed pulse',3],
 ['prismRelay',39,3,'Prism Relay',2.1,4.2,'prism','Read the beam’s route through both crystals',2],
 ['cometLadder',40,3,'Comet Ladder',2,4.2,'comet','Zigzag between alternating comet lanes',3],
 ['turningBulwark',41,-1,'Turning Bulwark',1.8,5.8,'shield','Circle behind the rotating front shield',1],
 ['rallyThread',46,-1,'Rally Thread',1.8,5.4,'banner','Dash across the enemy buff thread',2]
].map(([id,proposal,biome,name,seconds,duration,art,guide,band])=>[id,{id,proposal,biome,name,seconds,duration,art,guide,band,language:id==='turningBulwark'?'shield':['seedChain','fallingCanopy','rollingFurnace','moltenDroplets','backdraft','emberCatch','hauntedFootsteps','hollowChorus','gravityWell','prismRelay'].includes(id)?'friendly':'danger',dash:['briarLeash','clingingSeeds','slagAnchors','soulLantern','rallyThread','collapsingNova'].includes(id)}]));
const THEMED_GROUPS=[
 [['burrowingBriar','seedChain','sporeFan','clingingSeeds'],['rootGates','briarLeash','pollenTide','graftedSwap'],['walkingHedge','fallingCanopy','rootGates','seedChain']],
 [['rollingFurnace','cinderStitch','emberCatch'],['forgeHammers','furnaceVents','slagAnchors'],['coolingIslands','moltenDroplets','backdraft','emberCatch']],
 [['boneLoom','hauntedFootsteps','returningSigil'],['soulLantern','coffinPress','borrowedBreath'],['graveClock','ribcageRise','hollowChorus','returningSigil']],
 [['astralSlingshot','gravityWell','stargateVolley'],['orbitTransfer','constellationCage','collapsingNova'],['riftScissors','prismRelay','cometLadder','gravityWell']]
];
const themedEffectImages=new Map();
const THEMED_LINK={minimum:220,preferred:260,crossing:70,landing:70};
function themedAbility(type){return THEMED_MECHANICS[type];}
function themedKind(owner,type){return THEMED_MECHANICS[type].biome<0?(owner.biome??biomeIndex()):THEMED_MECHANICS[type].biome;}
function themedPartner(owner){return game.enemies.filter(e=>e!==owner&&e.hp>0&&!e.totem&&!e.charge&&!e.cast&&Math.hypot(e.x-owner.x,e.y-owner.y)<360).sort((a,b)=>Number(!!b.elite)-Number(!!a.elite))[0]||null;}
function themedLinkEnd(e){return e.partner||e.anchor;}
function themedLinkCrossing(start,end,arena){
 const dx=end.x-start.x,dy=end.y-start.y,d=Math.hypot(dx,dy);if(d<THEMED_LINK.minimum-1e-7)return null;
 const mid={x:(start.x+end.x)/2,y:(start.y+end.y)/2},normal={x:-dy/d,y:dx/d};
 for(const u of [.25,.5,.75])if(!encounterClear(start.x+dx*u,start.y+dy*u,18))return null;
 for(let offset=-THEMED_LINK.crossing;offset<=THEMED_LINK.crossing;offset+=20){const q={x:mid.x+normal.x*offset,y:mid.y+normal.y*offset};if(!insideRect(q,arena,-16)||!encounterClear(q.x,q.y,14)||!encounterClear(q.x,q.y+13,12))return null;}
 return {mid,normal};
}
function themedLinkDestination(owner,partner,arena){
 const p=game.player,r=partner?.rad||24,margin=r+10,preferred=Math.atan2(p.y-owner.y,p.x-owner.x);let best=null,score=Infinity;
 const accepts=q=>insideRect(q,arena,-margin)&&encounterClear(q.x,q.y,r)&&Math.hypot(q.x-p.x,q.y-p.y)>=Math.max(THEMED_LINK.landing,r+35)&&game.enemies.every(e=>e===owner||e===partner||e.hp<=0||Math.hypot(e.x-q.x,e.y-q.y)>=r+e.rad+24)&&(game.totems||[]).every(t=>Math.hypot(t.x-q.x,t.y+18-q.y)>=r+40)&&themedLinkCrossing(owner,q,arena);
 if(!insideRect(owner,arena,-Math.min(40,(owner.rad||20)+8)))return null;
 if(partner&&accepts(partner))return {x:partner.x,y:partner.y};
 for(const distance of [THEMED_LINK.preferred,300,THEMED_LINK.minimum])for(let i=0;i<32;i++){
  const angle=preferred+i*Math.PI/16,q={x:owner.x+Math.cos(angle)*distance,y:owner.y+Math.sin(angle)*distance};if(!accepts(q))continue;
  const candidate=Math.abs(distance-THEMED_LINK.preferred)+Math.hypot((q.x+owner.x)/2-p.x,(q.y+owner.y)/2-p.y)*.2+(partner?Math.hypot(q.x-partner.x,q.y-partner.y)*.06:0);
  if(candidate<score){score=candidate;best=q;}
 }
 return best;
}
function liveThemedLink(e){return !e.done&&e.owner.hp>0&&game.enemies.includes(e.owner)&&themedLinkEnd(e)&&(!e.partner||e.partner.hp>0&&game.enemies.includes(e.partner));}
function themedLinkStep(enemy,dx,dy){
 if(!dx&&!dy)return {x:0,y:0};
 let link=(game.themedEvents||[]).find(e=>liveThemedLink(e)&&(e.owner===enemy||e.partner===enemy));
 if(!link)for(const owner of game.enemies){const e=owner.cast?.themed;if(e&&liveThemedLink(e)&&(e.owner===enemy||e.partner===enemy)){link=e;break;}}
 if(!link)return {x:dx,y:dy};
 const point={x:enemy.x+dx,y:enemy.y+dy},start=link.owner===enemy?point:link.owner,end=link.partner===enemy?point:themedLinkEnd(link);
 if(!insideRect(point,link.arena,-Math.min(40,(enemy.rad||20)+8))||!encounterClear(point.x,point.y,enemy.rad||20)||!themedLinkCrossing(start,end,link.arena))return {x:0,y:0};
 return {x:dx,y:dy};
}
function snapThemedLink(e,from,dashing){
 if(!dashing||!['briarLeash','rallyThread'].includes(e.type)||!liveThemedLink(e))return false;
 const end=themedLinkEnd(e),p=game.player;if(segmentsDistance(from.x,from.y,p.x,p.y,e.owner.x,e.owner.y,end.x,end.y)>=17)return false;
 e.solved=e.done=true;burst(p.x,p.y,12,combatTheme('safe').color);return true;
}
function bossPlan(e){
 if(e.uncommon)return [e.uncommonAttack||uncommonPattern(e)];
 const base=standardBossPlan(e),kind=e.biome??biomeIndex(),groups=THEMED_GROUPS[kind],band=zoneVisualBand(),family=e.champion?(e.visualType||0)%3:(e.bossIndex||0);
 let extras=groups[family].filter(id=>THEMED_MECHANICS[id].band<=band);
 if(e.champion&&rareEliteRole(e)==='shield'||!e.champion&&family===1)extras.push('turningBulwark');
 if(band>=2&&themedPartner(e))extras.push('rallyThread');
 extras=extras.filter(id=>id!=='orbitTransfer'||themedPartner(e));
 if(extras.length){const shift=(zoneStage()-1+(e.visualType||0))%extras.length;extras=[...extras.slice(shift),...extras.slice(0,shift)];}
 if(e.elite)extras=extras.filter((id,i)=>i<2||id==='turningBulwark'||id==='rallyThread');
 if(!extras.length)return base;const result=[];for(let i=0;i<Math.max(base.length,extras.length);i++){result.push(base[i%base.length],extras[i%extras.length]);}
 if(e.boss&&!e.elite&&e.bossIndex===2&&zoneNumber()===0&&isZoneFinal())return result.filter(type=>type!=='walkingHedge').flatMap(type=>['walkingHedge',type]);
 return result;
}
function canBeginThemedCast(owner,type){
 const def=themedAbility(type);if(!def)return true;
 if((game.themedEvents||[]).some(e=>!e.done&&game.enemies.includes(e.owner)))return false;
 if(game.enemies.some(e=>e.cast&&e!==owner))return false;
 if((game.hazards||[]).some(h=>h.wave||h.type==='expanded'&&!h.lingering)||game.counterRequest||(game.bossBursts||[]).length||(game.hostileShots||[]).some(s=>s.bounds||s.orbit||s.abilityType&&!['volley','ricochet'].includes(s.abilityType)))return false;
 if((type==='orbitTransfer'||type==='rallyThread')&&!themedPartner(owner))return false;
 return !def.dash||game.player.dashCooldown<=def.seconds-.4+1e-9;
}
function themedPoint(arena,x,y,r=18,beneficial=false){
 const p=game.player;
 for(let i=0;i<64;i++){
  const a=i*2.4,d=i?18+Math.floor(i/10)*16:0,point={x:clamp(x+Math.cos(a)*d,arena.left+r+3,arena.right-r-3),y:clamp(y+Math.sin(a)*d,arena.top+r+3,arena.bottom-r-3)};
  if(!encounterClear(point.x,point.y,r))continue;
  if(beneficial&&Math.hypot(point.x-p.x,point.y-p.y)<50)continue;
  if(beneficial&&(game.totems||[]).some(t=>t.destructible&&Math.hypot(point.x-t.x,point.y-(t.y+18))<r+40))continue;
  if(beneficial&&game.enemies.some(e=>e.hp>0&&Math.hypot(point.x-e.x,point.y-e.y)<r+e.rad+28))continue;
  if(beneficial){const distance=Math.hypot(point.x-p.x,point.y-p.y),steps=Math.max(1,Math.ceil(distance/24));if(Array.from({length:steps},(_,n)=>(n+1)/steps).some(t=>!encounterClear(p.x+(point.x-p.x)*t,p.y+(point.y-p.y)*t,12)))continue;}
  return point;
 }
 return null;
}
function themedPath(){const history=game.themedHistory||[],points=history.filter(p=>p.time>=game.frame-2.2);return points.length>2?points.filter((_,i)=>i%2===0).map(({x,y})=>({x,y})):[{x:game.player.x-120,y:game.player.y},{x:game.player.x,y:game.player.y}];}
function setupThemedCast(owner,cast){
 const def=themedAbility(cast.type),a=expandedArena(),p=game.player,w=a.right-a.left,h=a.bottom-a.top,cx=clamp(p.x,a.left+45,a.right-45),cy=clamp(p.y,a.top+60,a.bottom-60),kind=themedKind(owner,cast.type),serial=(owner.mechanicIndex||0)+(owner.visualType||0);
 const event={type:cast.type,owner,kind,arena:a,origin:{...cast.origin},target:{x:cx,y:cy},age:0,total:def.duration,damage:bossAttackDamage(owner,cast.type),enemyHits:new Set(),playerHits:new Map(),state:{},points:[],path:themedPath(),angle:cast.angle,serial};
 const point=(x,y,r=18,benefit=false)=>themedPoint(a,x,y,r,benefit),count=cast.type==='borrowedBreath'?3:cast.type==='returningSigil'?2:0;
 if(['coolingIslands','borrowedBreath','returningSigil','emberCatch','collapsingNova'].includes(cast.type)){
  const offsets=count===3?[[-65,0],[45,-65],[55,65]]:count===2?[[-70,-70],[70,70]]:[[-55,40],[55,-40],[0,95]];
  for(const [dx,dy]of offsets){const q=point(cx+dx,cy+dy,cast.type==='coolingIslands'?43:24,true);if(q&&event.points.every(other=>Math.hypot(q.x-other.x,q.y-other.y)>48))event.points.push(q);}
  if(event.points.length<(cast.type==='coolingIslands'?3:count||1))return false;
  const travel=Math.max(...event.points.map(q=>Math.hypot(q.x-p.x,q.y-p.y)))/175;cast.total=cast.windup=Math.max(def.seconds,travel+.8);
 }
 if(['rootGates','walkingHedge','boneLoom','ribcageRise'].includes(cast.type)){
  const q=point(cx+(cast.type==='walkingHedge'?(serial%3-1)*80:0),cy,32,true)||point(cx,cy,22);if(!q)return false;event.opening=q;
 }
 if(cast.type==='rootGates'){
  const clearOpening=x=>[0,1].every(i=>{const gx=clamp(x+(i?48:-48),a.left+48,a.right-48),gy=cy+(i-.5)*110;return [-34,0,34].every(dy=>encounterClear(gx,gy+dy,18));});
  if(!clearOpening(event.opening.x)){let found=false;for(let x=a.left+60;x<=a.right-60;x+=18)if(clearOpening(x)){event.opening.x=x;found=true;break;}if(!found)return false;}
 }
 if(cast.type==='soulLantern'){const q=point(cx-65,cy+40,25);if(!q)return false;event.points=[q];}
 if(cast.type==='slagAnchors'){for(const x of [a.left+32,a.right-32]){const q=point(x,cy,26);if(q)event.points.push(q);}if(event.points.length<2)return false;}
 if(cast.type==='ribcageRise'){
  let exit=null;for(const offset of [0,.5,-.5,1,-1,1.5,-1.5,2,-2]){const angle=cast.angle+offset,q={x:cx+Math.cos(angle)*145,y:cy+Math.sin(angle)*145};if(!insideRect(q,a,-16)||!encounterClear(q.x,q.y,16)||game.enemies.some(e=>Math.hypot(e.x-q.x,e.y-q.y)<e.rad+42))continue;const route=Array.from({length:8},(_,i)=>(i+1)/8);if(route.some(v=>!encounterClear(p.x+(q.x-p.x)*v,p.y+(q.y-p.y)*v,12)))continue;exit=angle;break;}if(exit===null)return false;event.exitAngle=exit;
 }
 if(cast.type==='graftedSwap'){const q=point(cx+(serial%2?80:-80),cy-100,24,true);if(!q)return false;event.points=[q];}
 if(['orbitTransfer','rallyThread','briarLeash'].includes(cast.type)){
  const partner=cast.type==='briarLeash'?null:themedPartner(owner);if(cast.type!=='briarLeash'&&!partner)return false;
  const destination=themedLinkDestination(owner,partner,a);if(!destination)return false;
  if(partner){event.partner=partner;if(Math.hypot(destination.x-partner.x,destination.y-partner.y)>1){event.relocation={from:{x:partner.x,y:partner.y},to:{...destination}};partner.x=destination.x;partner.y=destination.y;burst(partner.x,partner.y,12,abilityMaterial(kind).accent);}}
  else event.anchor=destination;
 }
 if(cast.type==='burrowingBriar')event.target={x:p.x,y:p.y};
 if(cast.type==='clingingSeeds')event.state.attachedAt=null;
 cast.total=cast.windup=cast.total===undefined?def.seconds:Math.max(cast.total,def.seconds);cast.label=def.name;cast.hint='';cast.shapes=[];cast.arena=a;cast.themed=event;return true;
}
function resolveThemedCast(owner,cast){
 const event=cast.themed;if(!event)return false;if(event.done||event.partner&&(!game.enemies.includes(event.partner)||event.partner.hp<=0))return true;event.age=0;event.damage=bossAttackDamage(owner,cast.type);(game.themedEvents||(game.themedEvents=[])).push(event);return true;
}
function tickThemedWindup(owner,cast,dt){
 if(cast.type==='burrowingBriar'&&cast.windup>.65)cast.themed.target={x:game.player.x,y:game.player.y};
 cast.windup-=dt;if(cast.windup<=0){owner.cast=null;resolveBossCast(owner,cast);owner.castCooldown=owner.boss?2.5:3.1;}
}
function themedField(shape,extra={}){return {...shape,start:0,end:1,key:'impact',factor:.8,...extra};}
function themedCircle(x,y,r,extra={}){return themedField({shape:'circle',x,y,r},extra);}
function themedSegment(a,b,width,extra={}){return themedField({shape:'segment',a,b,width},extra);}
function themedGate(arena,horizontal,at,gap,gapWidth,extra={}){return themedField({shape:'gate',arena,horizontal,at,gap,gapWidth,width:22},extra);}
function themedFields(e,age=e.age){
 const a=e.arena,t=e.target,w=a.right-a.left,h=a.bottom-a.top,s=e.state,u=clamp(age/e.total,0,1),fields=[],circle=(x,y,r,opts)=>fields.push(themedCircle(x,y,r,opts)),segment=(x,y,width,opts)=>fields.push(themedSegment(x,y,width,opts));
 switch(e.type){
 case 'sporeFan':for(let fan=0;fan<3;fan++)for(let i=0;i<4;i++){const angle=e.angle+(i-1.5)*.42+(fan-1)*.22;circle(e.origin.x+(fan-1)*42+Math.cos(angle)*2.2*118,e.origin.y+Math.sin(angle)*2.2*118,30,{start:fan*.6+2.2,end:fan*.6+3.4,key:'cloud'+fan+'-'+i,dot:.015,art:'sporeCloud',reveal:fan*.6+1.3});}break;
 case 'burrowingBriar':circle(t.x,t.y,57,{start:.08,end:.65,art:'root'});break;
 case 'rootGates':for(let i=0;i<2;i++)fields.push(themedGate(a,true,t.y+(i-.5)*110,clamp(e.opening.x+(i?48:-48),a.left+48,a.right-48),96,{start:i*1.7,end:i*1.7+2,key:'gate'+i,art:'root'}));break;
 case 'walkingHedge':fields.push(themedGate(a,true,a.top+30+(h-60)*u,e.opening.x,110,{end:e.total,key:'hedge',art:'thorns'}));break;
 case 'seedChain':for(let i=0;i<3;i++)circle(clamp(t.x+(i-1)*65,a.left+35,a.right-35),t.y+(i%2?65:-35),49,{start:i*1.15,end:i*1.15+.55,key:'seed'+i,factor:.6,art:'pod',reveal:i?i*1.15-.85:-10});break;
 case 'fallingCanopy':for(let i=0;i<3;i++)segment({x:t.x-70,y:t.y+(i-1)*80},{x:t.x+70,y:t.y+(i-1)*80},32,{start:i*1.1,end:i*1.1+.55,key:'branch'+i,factor:1,art:'branch'});break;
 case 'forgeHammers':for(let i=0;i<2;i++)circle(clamp(t.x+(i?62:-62),a.left+38,a.right-38),t.y,54,{start:i*1.65,end:i*1.65+.65,key:'hammer'+i,factor:1,art:'hammer'});break;
 case 'furnaceVents':for(let i=0;i<3;i++)circle(a.left+w*(i+.5)/3,t.y+(i%2?45:-45),40,{start:i*1.2,end:i*1.2+.9,key:'vent'+i,dot:.035,art:'vent',order:i+1});break;
 case 'coolingIslands':{
  const phase=Math.floor(Math.max(0,age)/2.1)%e.points.length,change=age%2.1>1.35;const refuges=[e.points[phase%e.points.length]];if(change)refuges.push(e.points[(phase+1)%e.points.length]);fields.push(themedField({shape:'flood',arena:a,refuges,r:49},{end:e.total,key:'lava'+phase,dot:.025,art:'stone'}));break;}
 case 'moltenDroplets':for(let i=0;i<3;i++){const x=clamp(t.x+(i-1)*62,a.left+45,a.right-45),y=t.y+(i%2?65:-35);circle(x,y,43,{start:.45+i*.75,end:.75+i*.75,key:'drop'+i,factor:.55,art:'droplet'});for(let j=0;j<3;j++){const angle=j*Math.PI*2/3;circle(x+Math.cos(angle)*57,y+Math.sin(angle)*57,25,{start:1.5+i*.75,end:1.9+i*.75,key:'splash'+i+'-'+j,factor:.4,art:'droplet'});}}break;
 case 'slagAnchors':for(let i=0;i<2;i++)if(!s['anchor'+i])segment({x:(e.points[0].x+e.points[1].x)/2,y:(e.points[0].y+e.points[1].y)/2},e.points[i],30,{end:e.total,key:'curtain'+i,dot:.03,art:'flame'});break;
 case 'backdraft':for(let i=0;i<e.path.length-1;i++)segment(e.path[i],e.path[i+1],27,{start:i*.12,end:i*.12+1.8,key:'track'+i,dot:.025,art:'flame'});break;
 case 'boneLoom':for(let i=0;i<2;i++)fields.push(themedGate(a,false,t.x+(i?1:-1)*(100-180*u),e.opening.y+Math.sin(age*1.2+i*Math.PI)*45,104,{end:e.total,key:'ribs'+i,art:'rib'}));break;
 case 'coffinPress':for(let i=0;i<2;i++){const x=t.x+(i?1:-1)*(120-120*u);fields.push(themedField({shape:'rect',rect:{left:x-30,right:x+30,top:t.y-78,bottom:t.y+78}},{start:.12,end:e.total,key:'coffin'+i,art:'coffin'}));}break;
 case 'hauntedFootsteps':{const f=themedPathPoint(e.path,u);circle(f.x,f.y,22,{end:e.total,key:'ghost',factor:.85,art:'ghost'});break;}
 case 'graveClock':{const phase=age<1.5?age/1.5:age<2.2?1:1-(age-2.2)/1.8,angle=e.angle-1+phase*2;for(const [lo,hi]of [[24,74],[146,190]])segment({x:t.x+Math.cos(angle)*lo,y:t.y+Math.sin(angle)*lo},{x:t.x+Math.cos(angle)*hi,y:t.y+Math.sin(angle)*hi},22,{end:e.total,key:'hand',factor:.75,art:'clock'});circle(t.x,t.y,22,{end:e.total,key:'hub',factor:.5,art:'clock'});break;}
 case 'ribcageRise':fields.push(themedField({shape:'arc',x:t.x,y:t.y,r:Math.max(0,125*(1-u)),width:23,gap:e.exitAngle??e.angle,gapHalf:.64},{end:e.total,key:'cage',art:'rib'}));break;
 case 'gravityWell':circle(t.x,t.y,145,{start:2.7,end:3.25,key:'collapse',factor:1,art:'lens'});break;
 case 'constellationCage':fields.push(themedField({shape:'triangle',points:Array.from({length:3},(_,i)=>({x:t.x+Math.cos(e.angle+i*Math.PI*2/3)*120,y:t.y+Math.sin(e.angle+i*Math.PI*2/3)*120}))},{start:.15,end:.95,key:'triangle',factor:2,art:'star'}));break;
 case 'riftScissors':for(let side=-1;side<=1;side+=2)for(let i=0;i<8;i++){const y0=-110+i*27.5,y1=y0+27.5,x=y=>side*(135*(1-u)+.004*y*y);segment({x:t.x+x(y0),y:t.y+y0},{x:t.x+x(y1),y:t.y+y1},21,{end:e.total,key:'rift'+side,art:'rift'});}break;
 case 'prismRelay':{const points=[e.origin,{x:a.left+w*.25,y:t.y-85},{x:a.left+w*.75,y:t.y+35},{x:a.left+30,y:t.y+100}];for(let i=0;i<3;i++)segment(points[i],points[i+1],29,{start:i*1.15,end:i*1.15+.7,key:'beam'+i,factor:1,art:'prism',order:i+1});break;}
 case 'cometLadder':for(let i=0;i<3;i++){const shift=i%2?32:-32;segment({x:t.x-95+shift,y:t.y-110},{x:t.x+95+shift,y:t.y+110},35,{start:i*1.2,end:i*1.2+.65,key:'comet'+i,factor:1,art:'comet'});}break;
 }
 return fields;
}
function themedPathPoint(path,u){const index=clamp(u,0,.9999)*(path.length-1),i=Math.floor(index),f=index-i;return {x:path[i].x+(path[i+1].x-path[i].x)*f,y:path[i].y+(path[i+1].y-path[i].y)*f};}
function themedContains(actor,f){
 const radius=actor===game.player?9:Math.min(18,actor.rad||10);
 if(f.shape==='circle')return Math.hypot(actor.x-f.x,actor.y-f.y)<f.r+radius;
 if(f.shape==='segment')return segmentDistance(actor.x,actor.y,f.a.x,f.a.y,f.b.x,f.b.y)<f.width/2+radius;
 if(f.shape==='rect')return insideRect(actor,f.rect,radius);
 if(f.shape==='gate'){const coordinate=f.horizontal?actor.y:actor.x,across=f.horizontal?actor.x:actor.y,lo=f.horizontal?f.arena.left:f.arena.top,hi=f.horizontal?f.arena.right:f.arena.bottom;return Math.abs(coordinate-f.at)<f.width/2+radius&&across>=lo-radius&&across<=hi+radius&&Math.abs(across-f.gap)>f.gapWidth/2-radius;}
 if(f.shape==='arc'){const d=Math.hypot(actor.x-f.x,actor.y-f.y),angle=Math.atan2(actor.y-f.y,actor.x-f.x)-f.gap;return Math.abs(d-f.r)<f.width/2+radius&&(f.r<20||Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))>f.gapHalf);}
 if(f.shape==='flood')return insideRect(actor,f.arena,radius)&&!f.refuges.some(p=>Math.hypot(actor.x-p.x,actor.y-p.y)<=f.r-radius);
 if(f.shape==='triangle'){const [a,b,c]=f.points,sign=(p,q)=>(actor.x-q.x)*(p.y-q.y)-(p.x-q.x)*(actor.y-q.y),d=[sign(a,b),sign(b,c),sign(c,a)];return ! (d.some(n=>n<0)&&d.some(n=>n>0))||[0,1,2].some(i=>segmentDistance(actor.x,actor.y,f.points[i].x,f.points[i].y,f.points[(i+1)%3].x,f.points[(i+1)%3].y)<radius);}
 return false;
}
function themedHit(e,key,contains,factor=.8,cooldown=0){
 if(contains(game.player)&&(e.playerHits.get(key)??-Infinity)<=e.age){hurt(Math.min(e.damage*factor,game.player.maxHp*.5/incomingDamageScale()));e.playerHits.set(key,cooldown?e.age+cooldown:Infinity);}
 if(THEMED_MECHANICS[e.type].language==='friendly')damageMonstersInAttack(e.owner,e,contains);
}
function themedCounter(e,point,fraction=.12){
 if(e.done)return;e.solved=true;e.done=true;const owner=e.owner,amount=owner.maxHp*fraction;owner.hp-=amount;owner.stagger=Math.max(owner.stagger||0,1.2);owner.lastDamageStyle=combatStyle();burst(point.x,point.y,16,combatTheme('reflect').color);game.counterEffects.push({...point,inner:26,r:42,tx:owner.x,ty:owner.y-22,reflected:true,life:.75,total:.75,biome:e.kind});if(owner.hp<=0)onKill(owner);
}
function themedCounterContact(e,point,from,dt,start=0,end=e.total){
 const old=e.age-dt;if(e.age<start||old>=end)return false;
 const begin=dt>0?clamp((start-old)/dt,0,1):0,finish=dt>0?clamp((end-old)/dt,0,1):1,p=game.player;
 const a={x:from.x+(p.x-from.x)*begin,y:from.y+(p.y-from.y)*begin},b={x:from.x+(p.x-from.x)*finish,y:from.y+(p.y-from.y)*finish};
 return segmentDistance(point.x,point.y,a.x,a.y,b.x,b.y)<=27;
}
function themedReturnHalf(e,point){
 const owner=e.owner;owner.hp-=owner.maxHp*.06;owner.stagger=Math.max(owner.stagger||0,.6);owner.lastDamageStyle=combatStyle();burst(point.x,point.y,9,combatTheme('reflect').color);game.counterEffects.push({...point,inner:26,r:42,tx:owner.x,ty:owner.y-22,reflected:true,life:.75,total:.75,biome:e.kind});if(owner.hp<=0){e.done=true;onKill(owner);}
}
function themedToken(e,point,r,key,factor=.6){let old=e.state.tokens?.[key]||point;if(old.portal!==point.portal)old=point;(e.state.tokens||(e.state.tokens={}))[key]=point;themedHit(e,key,actor=>segmentsDistance(old.x,old.y,point.x,point.y,actor.x,actor.y,actor.x,actor.y)<=r+(actor===game.player?9:Math.min(18,actor.rad||10)),Math.max(.4,factor));}
function tickThemedEvent(e,dt,from,dashing){
 const p=game.player,s=e.state,t=e.target,a=e.arena,age=e.age,oldAge=age-dt;
 for(const f of themedFields(e))if(age>=f.start&&oldAge<=f.end){const contains=actor=>themedContains(actor,f);if(f.dot){tickCombatDot(e,f.key,contains,f.dot);if(THEMED_MECHANICS[e.type].language==='friendly')damageMonstersInAttack(e.owner,e,contains);}else themedHit(e,f.key,contains,f.factor);}
 for(const shot of themedProjectileShapes(e))if(e.type!=='clingingSeeds')themedToken(e,shot,shot.r,shot.key,shot.factor);
 switch(e.type){
 case 'briarLeash':case 'rallyThread':{
  const end=themedLinkEnd(e);
  if(!liveThemedLink(e)){e.done=true;break;}
  if(snapThemedLink(e,from,dashing))break;
  else if(e.type==='briarLeash'&&age>=e.total-.05&&!s.pulled){s.pulled=true;themedPull(end,65);hurt(e.damage*.6);}
  break;}
 case 'clingingSeeds':{
  if(s.attachedAt===null){const position=v=>({x:e.origin.x+(t.x-e.origin.x)*clamp(v/.85,0,1),y:e.origin.y+(t.y-e.origin.y)*clamp(v/.85,0,1)}),q=position(age),old=position(oldAge);if(segmentsDistance(old.x,old.y,q.x,q.y,from.x,from.y,p.x,p.y)<26){if(dashing){e.done=e.solved=true;burst(p.x,p.y,9,abilityMaterial(0).accent);}else{s.attachedAt=age;hurt(e.damage*.4);}}if(age>1&&s.attachedAt===null)e.done=true;}
  else if(dashing){e.done=e.solved=true;burst(p.x,p.y,9,abilityMaterial(0).accent);}else if(age-s.attachedAt>3.5){hurt(e.damage);e.done=true;}
  break;}
 case 'graftedSwap':if(!s.swapped&&age>=.6){s.swapped=true;s.previous={x:e.owner.x,y:e.owner.y};e.owner.x=e.points[0].x;e.owner.y=e.points[0].y;burst(e.owner.x,e.owner.y,10,'#8ebc67');}break;
 case 'pollenTide':{
  const angle=e.angle,dx=Math.cos(angle),dy=Math.sin(angle);if(insideRect(p,a)&&Math.abs((p.x-e.origin.x)*dy-(p.y-e.origin.y)*dx)<135){p.x+=dx*22*dt;p.y+=dy*22*dt;resolveWorldCollisions(p);}
  break;}
 case 'cinderStitch':{
  for(let i=0;i<12;i++){if(i%4===3)continue;const q={x:e.origin.x+Math.cos(e.angle)*(i+1)*28,y:e.origin.y+Math.sin(e.angle)*(i+1)*28};if(age>=i*.13+1&&age<i*.13+3)tickCombatDot(e,'stitch'+i,actor=>Math.hypot(actor.x-q.x,actor.y-q.y)<18,.02);}
  break;}
 case 'slagAnchors':for(let i=0;i<2;i++){const q=e.points[i];if(!s['anchor'+i]&&dashing&&segmentDistance(q.x,q.y,from.x,from.y,p.x,p.y)<36){s['anchor'+i]=true;e.solved=true;burst(q.x,q.y,16,'#ffb471');}}break;
 case 'emberCatch':{const q=e.points[0];if(themedCounterContact(e,q,from,dt)){damageMonstersInAttack(e.owner,e,actor=>Math.hypot(actor.x-q.x,actor.y-q.y)<145);themedCounter(e,q,.10);}else if(age>=e.total-.05){hurt(p.maxHp*ENCOUNTER_DAMAGE.reflect/incomingDamageScale());e.done=true;}break;}
 case 'soulLantern':{
  const q=e.points[0];if(dashing&&segmentDistance(q.x,q.y,from.x,from.y,p.x,p.y)<37){e.solved=e.done=true;burst(q.x,q.y,12,'#70e4a2');break;}
  const launched=Math.floor(age/1.15);for(let i=0;i<=launched;i++){const progress=(age-i*1.15)/1.5;if(progress<0||progress>1.1||s['soul'+i])continue;const soul={x:q.x+(e.owner.x-q.x)*Math.min(1,progress),y:q.y+(e.owner.y-q.y)*Math.min(1,progress)};if(Math.hypot(p.x-soul.x,p.y-soul.y)<24){s['soul'+i]=true;e.solved=true;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.0035);}else if(progress>=1){s['soul'+i]=true;e.owner.hp=Math.min(e.owner.maxHp,e.owner.hp+e.owner.maxHp*.004);}}
  break;}
 case 'returningSigil':{const index=s.stage||0,q=e.points[index],start=index?(s.stageAt||0)+.6:0;if(themedCounterContact(e,q,from,dt,start,start+3.6)){if(index===0){s.stage=1;s.stageAt=age;e.solved=true;themedReturnHalf(e,q);}else themedCounter(e,q,.06);}else if(age>=start+3.6){hurt(p.maxHp*ENCOUNTER_DAMAGE.reflect/incomingDamageScale());e.done=true;}break;}
 case 'borrowedBreath':if(e.points.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<30)){e.done=e.solved=true;burst(p.x,p.y,10,combatTheme('safe').color);}else if(age>=e.total-.05){hurt(p.maxHp*.15/incomingDamageScale());e.done=true;}break;
 case 'gravityWell':if(age<2.7)themedPull(t,(25+age*18)*dt,170);break;
 case 'orbitTransfer':{if(!game.enemies.includes(e.partner)){e.done=true;break;}break;}
 case 'collapsingNova':{
  const q=e.points[0],radius=Math.max(30,180-age*62);
  if(oldAge<2.5){if(themedCounterContact(e,q,from,dt,0,2.5)){themedCounter(e,q,.12);break;}themedHit(e,'inward',actor=>Math.abs(Math.hypot(actor.x-q.x,actor.y-q.y)-radius)<23,.65);}
  if(age>=2.5&&!s.missed){s.missed=true;hurt(p.maxHp*ENCOUNTER_DAMAGE.reflect/incomingDamageScale());}
  if(age>=6&&!s.launched){s.launched=true;addGravePulses(e.owner,{origin:q,enemyHits:e.enemyHits},e.damage/.85);}
  break;}
 }
}
function themedBoulder(e,age){
 const a=e.arena,r=24,start={x:clamp(e.origin.x,a.left+r,a.right-r),y:clamp(e.origin.y,a.top+r,a.bottom-r)},vx=Math.cos(e.angle)*230,vy=Math.sin(e.angle)*230;
 const tx=vx>0?(a.right-r-start.x)/vx:vx<0?(a.left+r-start.x)/vx:Infinity,ty=vy>0?(a.bottom-r-start.y)/vy:vy<0?(a.top+r-start.y)/vy:Infinity,bounce=Math.max(.12,Math.min(tx,ty));
 if(age<=bounce)return {x:start.x+vx*age,y:start.y+vy*age,bounce,angle:e.angle};const hit={x:start.x+vx*bounce,y:start.y+vy*bounce},nextX=tx<=ty?-vx:vx,nextY=ty<=tx?-vy:vy;
 const q={x:hit.x+nextX*(age-bounce),y:hit.y+nextY*(age-bounce),bounce,angle:Math.atan2(nextY,nextX)};return insideRect(q,a,r)?q:null;
}
function themedSlingshot(e,age,index){const lens={x:e.target.x-55,y:e.target.y-40},a=e.angle+age*2.6+index*.16;if(age<1.3)return {x:lens.x+Math.cos(a)*76,y:lens.y+Math.sin(a)*76};const end=e.angle+1.3*2.6+index*.16;return {x:lens.x+Math.cos(end)*76-Math.sin(end)*(age-1.3)*180,y:lens.y+Math.sin(end)*76+Math.cos(end)*(age-1.3)*180};}
function themedOrbit(e,age){const a=e.angle+age*2.6,around=(owner,angle)=>({x:owner.x+Math.cos(angle)*70,y:owner.y+Math.sin(angle)*70});if(age<1.5)return around(e.owner,a);if(age<2.3){const t=(age-1.5)/.8,start=around(e.owner,e.angle+1.5*2.6),end=around(e.partner,e.angle+2.3*2.6);return {x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t};}return around(e.partner,a);}
function themedPortalShot(e,age){const first={x:e.arena.left+45,y:e.target.y-70},second={x:e.arena.right-45,y:e.target.y+55};if(age<.8)return {x:e.origin.x+(first.x-e.origin.x)*age/.8,y:e.origin.y+(first.y-e.origin.y)*age/.8,portal:0};return {x:second.x+Math.cos(e.angle)*(age-.8)*185,y:second.y+Math.sin(e.angle)*(age-.8)*185,portal:1};}
function themedPull(point,amount,radius=Infinity){const p=game.player,dx=point.x-p.x,dy=point.y-p.y,d=Math.hypot(dx,dy);if(d>radius||d<1)return;p.x+=dx/d*Math.min(amount,d);p.y+=dy/d*Math.min(amount,d);resolveWorldCollisions(p);}
function tickThemedMechanics(dt,from=game.player,dashing=false){
 const p=game.player,history=game.themedHistory||(game.themedHistory=[]);if(!history.length||game.frame-history[history.length-1].time>=.09){history.push({x:p.x,y:p.y,time:game.frame});if(history.length>32)history.shift();}
 for(const owner of game.enemies){const e=owner.cast?.themed;if(e&&snapThemedLink(e,from,dashing)){owner.cast=null;owner.castCooldown=owner.boss?2.5:3.1;}}
 game.themedEvents=(game.themedEvents||[]).filter(e=>{if(e.done||!game.enemies.includes(e.owner)||e.owner.hp<=0||game.status!=='running')return false;e.age+=dt;tickThemedEvent(e,dt,from,dashing);return !e.done&&e.age<e.total&&game.status==='running'&&game.transition<=0;});
}
function themedShieldMultiplier(enemy,from=game.player){const e=(game.themedEvents||[]).find(e=>e.type==='turningBulwark'&&e.owner===enemy&&!e.done);if(!e)return 1;const angle=e.angle+e.age*.5,delta=Math.atan2(from.y-enemy.y,from.x-enemy.x)-angle;return Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))<1.05?.3:1;}
function themedRallyMultiplier(enemy){return (game.themedEvents||[]).some(e=>e.type==='rallyThread'&&!e.done&&(e.owner===enemy||e.partner===enemy))?1.18:1;}
function installThemedEncounters(){
 SVG_FILES['codex-siphon_tethers.svg']=encounterBoonIcon('siphon');CODEX_ITEMS.push({id:'siphon_tethers',cat:'Enemies',name:'Siphon Tethers',desc:'A red chain drains small rapid health ticks. Hungry Siphon breaks when you dash away from its caster; Knotted Siphon breaks when you dash through its teal knot. Walking alone does not sever either channel.'});
 SVG_FILES['codex-warband_resolve.svg']=encounterBoonIcon('resolve');CODEX_ITEMS.push({id:'warband_resolve',cat:'Enemies',name:'Warband Resolve',desc:'Each other elite, rare, boss or guardian Echo grants 10% damage reduction, up to 50%. Stunned enemies lose this protection and stop granting it to allies until they recover.'});
 SVG_FILES['codex-uncommon_creatures.svg']=THEMED_EFFECT_ART['icon-uncommon'];
 CODEX_ITEMS.push({id:'uncommon_creatures',cat:'Enemies',name:'Uncommon creatures',desc:'Twice ordinary health, one ranged attack and a small active cap that grows by Zone. Ordinary loot.'});
 for(const [id,d]of Object.entries(THEMED_MECHANICS)){CODEX_ITEMS.push({id:'mechanic_'+id,cat:'Enemies',name:d.name,desc:d.guide});SVG_FILES['codex-mechanic_'+id+'.svg']=THEMED_EFFECT_ART['icon-'+id];}
 for(const [key,src]of Object.entries(THEMED_EFFECT_ART)){const image=new Image();image.src=src;themedEffectImages.set(key,image);}
}
