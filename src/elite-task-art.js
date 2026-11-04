/* Purpose props, channel arcs and teal dash cues keep intentions readable. */
function eliteTaskSymbol(kind){return kind==='ascend'?'damage':kind==='empower'?'mirror':'portal';}
function paintEliteTaskGround(){
 const gold=combatTheme('reflect'),teal=combatTheme('safe'),time=abilityEffectTime();
 for(const owner of game.enemies){const task=owner.eliteTask;if(!task)continue;const kind=owner.biome??biomeIndex(),q=task.phase==='travel'?task.point:owner;
  ctx.save();const progress=task.phase==='travel'?1:task.total?1-task.age/task.total:task.pending?task.warn/ELITE_TASKS.conduit.warning:task.spawnClock/ELITE_TASKS.conduit.interval;
  ellipse(q.x,q.y+14,43,15,'#10191e66');themedArc(q.x,q.y+12,39,clamp(progress,0,1),gold.color,2.5);paintAbilityEmblem(eliteTaskSymbol(task.kind),q.x,q.y+13,13,gold);
  for(const side of [-1,1])themedArrow(owner.x+side*51,owner.y+12,side<0?0:Math.PI,teal.hot,9);
  if(task.phase==='travel'){ctx.setLineDash([4,7]);themedLine(owner,task.point,1.5,gold.color+'88');ctx.setLineDash([]);}
  else{
   const prop=task.kind==='conduit'?['root','vent','rib','prism'][kind]:task.kind==='ascend'?['sapling','droplet','lantern','star'][kind]:'prism';
   for(let i=0;i<3;i++){const angle=i*Math.PI*2/3+(reducedMotion()?0:time*.35),x=owner.x+Math.cos(angle)*34,y=owner.y+15+Math.sin(angle)*12;themedSprite(prop,kind,x,y,task.kind==='conduit'?42:28,0,.85);}
   if(task.pending){themedSprite('portal',kind,task.pending.x,task.pending.y+15,56);themedArc(task.pending.x,task.pending.y,26,1-task.warn/ELITE_TASKS.conduit.warning,gold.color,2);themedSprite('wisp',kind,task.pending.x,task.pending.y-12,28,0,.6);}
  }
  if(task.target){const target=task.target;themedArc(task.recruit.x,task.recruit.y+12,25,1,gold.color+'88',1.5);themedSprite('star',kind,target.x,target.y-25,32,0,.65);}
  ctx.restore();
 }
}
function paintEliteTaskAir(owner){
 const task=owner.eliteTask,kind=owner.biome??biomeIndex(),gold=combatTheme('reflect'),teal=combatTheme('safe'),time=abilityEffectTime();
 if(task){
  const body=enemyBody(owner),y=body.top-23;encounterLabel(ELITE_TASK_NAMES[task.kind],owner.x,y,gold.hot,10);
  for(let i=0;i<ELITE_TASKS.interruptHits;i++)disc(owner.x+(i-1)*10,y+11,3,i<task.hits?'#47534e':gold.hot);
  if(task.phase==='channel'){
   if(task.kind==='empower'&&task.target){const a={x:owner.x,y:owner.y-28},b={x:task.target.x,y:task.target.y-20};themedLine(a,b,6,gold.color+'30');themedLine(a,b,2,gold.color);for(let i=0;i<3;i++){const u=reducedMotion()?(i+.5)/3:(time*.6+i/3)%1;themedSprite('star',kind,a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,13,0,.8);}paintAbilityEmblem('damage',b.x,b.y-18,11,gold);}
   else if(task.kind==='ascend'){const color='#9cdda4';for(let i=0;i<3;i++){const u=reducedMotion()?(i+.5)/3:(time*.6+i/3)%1;paintAbilityEmblem('heal',owner.x+(i-1)*15,owner.y-16-u*45,6,{color,hot:'#d9f4b2',dark:'#20382a'});}}
   else{for(let i=0;i<4;i++){const a=i*Math.PI/2;themedSprite('portal',kind,owner.x+Math.cos(a)*23,owner.y-25+Math.sin(a)*13,30,0,.5);}}
  }
 }
 if(owner.ascendance>0){const body=enemyBody(owner),signal=TOTEM_SIGNALS.fury;paintAbilityEmblem('damage',owner.x,body.top-17,12,signal);themedArc(owner.x,body.top-17,17,owner.ascendance/ELITE_TASKS.ascend.duration,signal.color,2);}
}
