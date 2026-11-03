/* Active discoveries reward attention without changing idle/offline clocks. */
const SKILL_BONUS_RARITIES=Object.freeze([
 {id:'common',name:'Common',chance:.65,speed:.35,seconds:6,color:'#d5d8b0',mark:'Ⅰ'},
 {id:'uncommon',name:'Uncommon',chance:.24,speed:.50,seconds:8,color:'#91d9ae',mark:'Ⅱ'},
 {id:'rare',name:'Rare',chance:.09,speed:.75,seconds:10,color:'#9bc9f0',mark:'Ⅲ'},
 {id:'very-rare',name:'Very rare',chance:.02,speed:1,seconds:15,color:'#dfb1ed',mark:'Ⅳ'}
]);
function rollSkillBonusRarity(){let roll=Math.random();for(const rarity of SKILL_BONUS_RARITIES){roll-=rarity.chance;if(roll<0)return rarity;}return SKILL_BONUS_RARITIES.at(-1);}
function normalizeSkillingBuffs(){
 const valid=new Map();for(const item of Array.isArray(data.skillingBuffs)?data.skillingBuffs:[]){
  const rarity=SKILL_BONUS_RARITIES.find(r=>r.id===item?.rarity),left=Number(item?.left);
  if(!rarity||!SKILLS[item.key]||!Number.isFinite(left)||left<=0)continue;
  const id=item.key+':'+rarity.id;valid.set(id,{key:item.key,rarity:rarity.id,left:Math.min(rarity.seconds,Math.max(valid.get(id)?.left||0,left))});
 }data.skillingBuffs=[...valid.values()];
}
function skillBuffs(key){return (data.skillingBuffs||[]).filter(b=>b.key===key&&b.left>1e-8).map(b=>({...b,definition:SKILL_BONUS_RARITIES.find(r=>r.id===b.rarity)})).filter(b=>b.definition).sort((a,b)=>b.definition.speed-a.definition.speed);}
function skillBuffMultiplier(key){return 1+(skillBuffs(key)[0]?.definition.speed||0);}
function grantSkillBuff(key,rarity){
 if(!data.skillingBuffs)data.skillingBuffs=[];
 const existing=data.skillingBuffs.find(b=>b.key===key&&b.rarity===rarity.id);
 if(existing)existing.left=rarity.seconds;else data.skillingBuffs.push({key,rarity:rarity.id,left:rarity.seconds});
}
function activeSkillCanAdvance(key){return key===game.scene&&bonusEligible()&&canUseSkill(key)&&hasIngredients(skillCost(key));}
function advanceSkillWork(seconds,speed=skillingTimeMultiplier()){
 let left=Math.max(0,seconds);
 // Split at expiries: a bonus never accelerates time after its own deadline.
 while(left>1e-9){
  const key=game.holdSkill,working=!!key&&activeSkillCanAdvance(key),buffs=working?skillBuffs(key):[],step=Math.min(left,.1,...buffs.map(b=>b.left)),multiplier=buffs[0]?1+buffs[0].definition.speed:1;
  advanceActiveWork(step*speed*multiplier);left-=step;
  if(working)for(const buff of data.skillingBuffs||[])if(buff.key===key)buff.left=Math.max(0,buff.left-step);
  data.skillingBuffs=(data.skillingBuffs||[]).filter(b=>b.left>1e-8);
 }
}
function beginSkillBonusReaction(key,rarity,origin){
 game.workBonusSerial=(game.workBonusSerial||0)+1;
 game.workBonusReaction={key,age:0,duration:rarity.speed>=.75?1.25:1.05,variant:game.workBonusSerial%2,rarity:rarity.id,color:rarity.color,origin:origin?{x:origin.x,y:origin.y}:null};
}
function tickSkillBonusReaction(dt){
 const reaction=game.workBonusReaction;if(!reaction)return;
 reaction.age+=dt;if(reaction.age>=reaction.duration||reaction.key!==game.scene)game.workBonusReaction=null;
}
function skillBuffLabel(buff){return buff.definition.name+' · +'+Math.round(buff.definition.speed*100)+'% work speed · '+buff.left.toFixed(1)+'s of active work remaining';}
function refreshSkillBuffUI(){
 const host=$('skillWorkBuff');if(!host)return;const key=game.scene,buffs=SKILLS[key]?skillBuffs(key):[],buff=buffs[0];
 host.classList.toggle('hidden',!buff);if(!buff){if(document.activeElement===host)$('skillHold').focus({preventScroll:true});return;}
 const rarity=buff.definition,working=game.holdSkill===key&&activeSkillCanAdvance(key);
 host.style.setProperty('--skill-rarity',rarity.color);host.dataset.rarity=rarity.id;
 host.querySelector('b').textContent='+'+Math.round(rarity.speed*100)+'% '+(SKILLS[key].cost||key==='ward'?'crafting':'gathering')+' speed';
 host.querySelector('small').textContent=rarity.name+' · '+buff.left.toFixed(1)+'s'+(working?'':' · ready');
 host.querySelector('i').style.width=Math.min(100,buff.left/rarity.seconds*100)+'%';
 host.setAttribute('aria-label',skillBuffLabel(buff)+(working?'':'. Paused until you work.'));
}
function showSkillBuffDetails(){
 const key=game.scene,buffs=skillBuffs(key);if(!buffs.length)return;
 showOverlay('<p class="overlay-kicker">ACTIVE SKILLING BONUS</p><h2>'+SKILLS[key].name+'</h2>'+codexRuleList(buffs.map(b=>[b.definition.name,'+'+Math.round(b.definition.speed*100)+'% speed · '+b.left.toFixed(1)+'s remaining']))+'<p>The strongest bonus applies. Timers count real seconds of active work in this activity. Recollecting a rarity refreshes its duration. Ingredients are still required for every craft. Idling and offline work keep their normal rate.</p><button type="button" class="primary-button" id="skillBuffReturn">Return to work</button>','skill-buff');
 $('skillBuffReturn').onclick=()=>{hideOverlay();$('skillHold').focus({preventScroll:true});};
}
