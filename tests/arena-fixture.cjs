function arenaFixture(){
  window.__arenaTest={
    placeXp(orbs){game.gems=orbs.map(g=>({...g}));checkpointGroundXp();},
    quietCombat(){game.phase=1;game.enemies=[];game.boss=null;game.transition=0;game.player.invuln=1e8;},
    tick(seconds){for(let n=0;n<seconds;n+=.04)tickCombat(Math.min(.04,seconds-n));},
    finish(){finishPhase();save();},
    notify(title,description){toast(title,description);},
    death(){die();},
    roundTripXp(){game.status='ready';data.cleared=Math.max(6,data.cleared);travelToBiome(1);travelToBiome(0);},
    firstGuardian(){data.masteryIntroSeen=false;game.status='running';game.phase=1;game.runXp=0;game.runLevel=1;game.requiredXp=23;game.pendingLevels=0;game.enemies=[];game.gems=[];const boss=spawnEnemy(true,0);boss.name=biome().boss[0];game.boss=boss;onKill(boss);},
    bank(){return {xp:data.dungeoneeringXp,level:game.runLevel,pending:game.pendingLevels,gems:game.gems.map(g=>({...g}))};},
    simulate(index,weapon='sword',options={}){
      const original={gainXp,earnStyleXp,burst,floater,random:Math.random};let rng=options.seed||20261106;Math.random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
      gainXp=()=>{};earnStyleXp=()=>{};burst=()=>{};floater=()=>{};
      try{
        const model={...zoneBalance(index),...(options.profile||{})};data=defaults();data.floor=zoneStart(index);data.cleared=zoneStart(index)-1;
        data.weaponType=weapon;data.unlockedWeapons=Object.keys(WEAPON_TYPES);data.onboardingDone=data.masteryIntroSeen=true;normalizeProgression();
        const style=combatStyle();data.styles[style].tier=model.gearTier;data.styles[style].weapon=model.weaponRank;data.styles[style].speed=model.speedRank;data.styles[style].xp=80*(model.proficiency-1)**2;
        zoneShopFor(index).ranks={...(options.perks||model.shopRanks)};if(options.armor){data.ownedArmor=[style+'_'+model.gearTier];data.equippedArmor=style+'_'+model.gearTier;data.styles[style].armor=Math.min(8,TIER_LIMITS[model.gearTier].armor);}data.styles[style].reach=options.reach||0;data.styles[style].enchant=options.enchant||0;data.arrows=data.runes=100000;projectCombatStyle();const actualDps=weaponDps(weapon,{equipmentOnly:true}),perkSpend=Object.entries(options.perks||{}).reduce((sum,[id,rank])=>sum+Array.from({length:rank},(_,i)=>dungeonPerkCost(id,i,index)).reduce((a,b)=>a+b,0),0);let total=0,kills=0;
        for(let floor=0;floor<Math.min(model.floors,options.floors||model.floors);floor++){
          startFloor();game.player.hp=game.player.maxHp=1e9;game.player.invuln=1e8;let steps=0;
          while(game.status==='running'&&steps++<600000){
            // Use counterplay at base equipment with no purchased or timed perks.
            // Reflections, spires and shield guards require deliberate movement.
            if(eliteRewardOpen())closeEliteReward(true);
            const p=game.player,mirror=game.enemies.find(e=>['reflect','reversal'].includes(e.cast?.type))||(game.releasedWards||[]).map(w=>({cast:w.cast}))[0],spire=(game.totems||[]).find(t=>t.destructible),guard=game.enemies.find(e=>e.bastionGuard),channel=game.enemies.find(e=>e.eliteTask),stream=(game.totems||[]).find(t=>!t.destructible&&['mend','fury'].includes(t.type)),nearest=combatTargets().sort((a,b)=>bodyDistance(a,p.x,p.y)-bodyDistance(b,p.x,p.y))[0];let target=null;
            if(mirror){const q=mirror.cast.point,dx=p.x-q.x,dy=p.y+13-q.y,d=Math.hypot(dx,dy);if(!q.armed)target={x:q.x+(d?dx/d:1)*65,y:q.y+(d?dy/d:0)*65-13};else target={x:q.x,y:q.y-13};}
            else if(spire){const base=encounterFoot(spire),dx=p.x-base.x,dy=p.y+13-base.y,distance=Math.hypot(dx,dy),retreat=SUMMON_BUMPS.releaseRadius+8;target=spire.bumpContact?{x:base.x+(distance?dx/distance:1)*retreat,y:base.y+(distance?dy/distance:0)*retreat-13}:{x:base.x,y:base.y-13};}
            else if(channel){target=bodyPoint(channel,p.x,p.y);const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;if(d<110&&p.dashCooldown<=0){p.vx=dx/d;p.vy=dy/d;dash();}}
            else if(options.solveResolve&&game.enemies.some(e=>enemyResolveReduction(e)>0)&&p.dashCooldown<=0){const e=game.enemies.filter(e=>enemyResolveReduction(e)>0).sort((a,b)=>bodyDistance(a,p.x,p.y)-bodyDistance(b,p.x,p.y))[0];target=bodyPoint(e,p.x,p.y);const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;if(d<110){p.vx=dx/d;p.vy=dy/d;dash();}}else if(guard)target=bodyPoint(guard,p.x,p.y);
            else if(stream){const q=encounterFoot(stream),dx=q.x-p.x,dy=q.y-p.y-13,d=Math.hypot(dx,dy)||1;target={x:q.x,y:q.y-13};if(d<110&&p.dashCooldown<=0){p.vx=dx/d;p.vy=dy/d;dash();}}
            else if(nearest&&bodyDistance(nearest,p.x,p.y)>attackReach()*.65)target=bodyPoint(nearest,p.x,p.y);
            const dx=target?target.x-p.x:0,dy=target?target.y-p.y:0;game.joystick.pointer=-1;game.joystick.x=Math.hypot(dx,dy)>6?dx:0;game.joystick.y=Math.hypot(dx,dy)>6?dy:0;
            // This is a pacing benchmark. DoTs intentionally bypass ordinary
            // immunity, so replenish HP as well; survival is tested separately.
            p.hp=p.maxHp;tickCombat(.04);
          }
          if(game.status!=='clear')throw Error('Simulation did not clear: '+JSON.stringify({status:game.status,zone:index+1,floor,phase:game.phase,kills:game.phaseKills,target:game.phaseTarget,pending:game.phaseCleanupPending,player:{x:game.player.x,y:game.player.y},enemies:game.enemies.map(e=>({hp:e.hp,max:e.maxHp,x:e.x,y:e.y,task:e.eliteTask?.kind,overlap:enemyTerrainOverlap(e)})),totems:game.totems.map(t=>({type:t.type,blocked:t.blocked,deadOwner:!!t.owner.defeated,recipient:supportTotemRecipient(t)?.name})),hazards:game.hazards.map(h=>({type:h.abilityType,life:h.life,age:h.age})),events:game.themedEvents.map(e=>({type:e.type,age:e.age,total:e.total,done:e.done})),shots:game.hostileShots.length}));
          total+=game.runSeconds;kills+=game.runKills;
        }
        return {zone:index+1,weapon,seconds:total,kills,referenceDps:model.dps,targetSeconds:model.seconds,actualDps,perkSpend,gearTier:model.gearTier,weaponRank:model.weaponRank,speedRank:model.speedRank,floors:Math.min(model.floors,options.floors||model.floors),sigils:data.dungeonShops[dungeonForZone(index).id].currency,goldEarned:data.gold-45,essence:data.essence,arrowsUsed:100000-data.arrows,runesUsed:100000-data.runes};
      }finally{Math.random=original.random;gainXp=original.gainXp;earnStyleXp=original.earnStyleXp;burst=original.burst;floater=original.floater;game.status='ready';}
    }
  };
}
module.exports={arenaFixture};
