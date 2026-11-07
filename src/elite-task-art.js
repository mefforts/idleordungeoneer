/* Purpose props, channel arcs and teal dash cues keep intentions readable. */
function eliteTaskSymbol(kind){return kind==='ascend'?'damage':kind==='empower'?'mirror':kind==='siege'?'cross':'portal';}
function paintEliteTaskGround(){
 const gold=combatTheme('interrupt');
 for(const owner of game.enemies){const task=owner.eliteTask;if(!task)continue;const kind=owner.biome??biomeIndex(),q=task.phase==='travel'?task.point:owner;
  ctx.save();const cycle=task.kind==='siege'?ELITE_TASKS.siege:ELITE_TASKS.conduit,progress=task.phase==='travel'?1:task.total?1-task.age/task.total:task.pending?task.warn/cycle.warning:task.spawnClock/cycle.interval;
  ellipse(q.x,q.y+14,43,15,'#10191e66');themedArc(q.x,q.y+12,39,clamp(progress,0,1),gold.color,2.5);paintAbilityEmblem(eliteTaskSymbol(task.kind),q.x,q.y+13,13,gold);
  paintEliteTaskInstrument(owner,task,q);
  for(const side of [-1,1])themedArrow(owner.x+side*51,owner.y+12,side<0?0:Math.PI,gold.hot,9);
  if(task.phase==='travel'){ctx.setLineDash([4,7]);themedLine(owner,task.point,1.5,gold.color+'88');ctx.setLineDash([]);}
  else{
   if(task.pending&&task.kind==='siege'){
    const red=combatTheme('danger'),point=task.pending;
    if(task.variant==='marks'){paintWarningCircle(point.x,point.y,52,1-task.warn/cycle.warning,red);themedSprite(['root','vent','rib','prism'][kind],kind,point.x,point.y+12,48,0,.5);}
    else for(const offset of [-.2,0,.2]){const angle=point.angle+offset;themedLine({x:owner.x,y:owner.y-22},{x:owner.x+Math.cos(angle)*210,y:owner.y-22+Math.sin(angle)*210},2,red.color+'b0');themedArrow(owner.x+Math.cos(angle)*90,owner.y-22+Math.sin(angle)*90,angle,red.hot,8);}
   }else if(task.pending){themedSprite('portal',kind,task.pending.x,task.pending.y+15,56);themedArc(task.pending.x,task.pending.y,26,1-task.warn/cycle.warning,gold.color,2);themedSprite('wisp',kind,task.pending.x,task.pending.y-12,28,0,.6);}
  }
  if(task.target){const target=task.target;themedArc(task.recruit.x,task.recruit.y+12,25,1,gold.color+'88',1.5);if(!paintCombatFxSprite('crown',kind,target.x,target.y-25,25,0,.8))themedSprite('star',kind,target.x,target.y-25,32,0,.65);}
  ctx.restore();
 }
}
function paintEliteTaskAir(owner){
 const task=owner.eliteTask,kind=owner.biome??biomeIndex(),gold=combatTheme('interrupt'),teal=combatTheme('safe'),time=abilityEffectTime();
 if(task){
  const body=enemyBody(owner),y=body.top-23;paintInterruptMark(owner.x,owner.y+12,37,task.total?1-task.age/task.total:1);encounterLabel(ELITE_TASK_NAMES[task.kind],owner.x,y,gold.hot,10);
  for(let i=0;i<ELITE_TASKS.interruptHits;i++)disc(owner.x+(i-1)*10,y+11,3,i<task.hits?'#47534e':gold.hot);
  if(task.phase==='channel'){
   if(task.kind==='empower'&&task.target){const a={x:owner.x,y:owner.y-28},b={x:task.target.x,y:task.target.y-20};themedLine(a,b,6,gold.color+'30');themedLine(a,b,2,gold.color);for(let i=0;i<3;i++){const u=reducedMotion()?(i+.5)/3:(time*.6+i/3)%1,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;if(!paintCombatFxSprite('crown',kind,x,y,13,0,.8))themedSprite('star',kind,x,y,13,0,.8);}paintAbilityEmblem('damage',b.x,b.y-18,11,gold);}
   else if(task.kind==='ascend'){const color='#9cdda4';for(let i=0;i<3;i++){const u=reducedMotion()?(i+.5)/3:(time*.6+i/3)%1;paintAbilityEmblem('heal',owner.x+(i-1)*15,owner.y-16-u*45,6,{color,hot:'#d9f4b2',dark:'#20382a'});}}
  }
 }
 if(owner.ascendance>0){const body=enemyBody(owner),signal=TOTEM_SIGNALS.fury;paintAbilityEmblem('damage',owner.x,body.top-17,12,signal);themedArc(owner.x,body.top-17,17,owner.ascendance/ELITE_TASKS.ascend.duration,signal.color,2);}
}
