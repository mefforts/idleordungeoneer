/* Direct work partners keep source preparation one touch from the work scene. */
const WORK_PARTNERS={mine:'forge',forge:'mine',silverMine:'silverSmelt',silverSmelt:'silverMine',coal:'steelSmelt',steelSmelt:'coal',mithrilMine:'mithrilSmelt',mithrilSmelt:'mithrilMine',wood:'fletch',fletch:'wood',willow:'steelFletch',steelFletch:'willow',yew:'mithrilFletch',mithrilFletch:'yew',ward:'rune',rune:'ward',aetherWeave:'ward',greaterRune:'aetherWeave',verdantWeave:'aetherWeave',verdantRune:'verdantWeave',scavenge:'relicClean',relicClean:'scavenge',ancientScavenge:'cleanAncient',cleanAncient:'ancientScavenge',deepScavenge:'restoreEnchanted',restoreEnchanted:'deepScavenge',polish:'relicClean',garnetSearch:'garnetCut',garnetCut:'garnetSearch',sapphireSearch:'sapphireCut',sapphireCut:'sapphireSearch'};
function relatedWorkKey(key=game.scene){const previous=game.workSwapFrom;if(!SKILLS[key]?.cost&&SKILLS[previous]&&WORK_PARTNERS[previous]===key&&canUseSkill(previous))return previous;return WORK_PARTNERS[key]||'';}
function swapWorkActivity(){
 const from=game.scene,next=relatedWorkKey(from);if(!SKILLS[next]||!canUseSkill(next))return false;
 resetSkillHold();resetArenaTouch(true);if(!enterActivity(next))return false;game.workSwapFrom=from;refreshWorkNavigation();$('skillCraft').focus({preventScroll:true});return true;
}
function refreshWorkNavigation(){
 const skill=SKILLS[game.scene],hub=$('skillGather'),swap=$('skillCraft');if(!skill||!hub||!swap)return;
 const hubHtml=uiIcon('grid')+'<span>Skills</span>';if(hub.innerHTML!==hubHtml)hub.innerHTML=hubHtml;hub.setAttribute('aria-label','Skills: open '+DISCIPLINES[disciplineFor(game.scene)].name);hub.dataset.hint='Skills';hub.disabled=false;hub.onclick=()=>openWorkshop(disciplineFor(game.scene),skill.cost?'refine':'gather');
 const next=relatedWorkKey(),target=SKILLS[next],label=skill.cost?(target?.cost?'Source':'Gather'):'Refine';const swapHtml=uiIcon(skill.cost?'arrow':'craft')+'<span>'+label+'</span>';if(swap.innerHTML!==swapHtml)swap.innerHTML=swapHtml;swap.disabled=!target||!canUseSkill(next);swap.setAttribute('aria-label',target?'Switch directly to '+target.name:'No related work');swap.dataset.hint=target?(swap.disabled?skillLockReason(next):target.name):'No related work';swap.onclick=swapWorkActivity;
}
