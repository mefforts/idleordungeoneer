/* Decorative instruments read mechanics; they never create targets or collisions. */
const supportArtImages=new Map();
function installSupportArt(){for(const [key,src]of Object.entries(SUPPORT_ART)){const image=new Image();image.src=src;supportArtImages.set(key,image);}}
function supportTotemVariant(t){const count=SUPPORT_ART_META[t.type]?.variants.length||1;return Math.floor(Math.abs((t.x||0)*.173+(t.y||0)*.317))%count;}
function paintSupportSprite(family,kind,variant,x,y,width,alpha=1){
 const image=supportArtImages.get(family+'-'+kind+'-'+variant),frame=SUPPORT_ART_FRAME;if(!image?.complete||!image.naturalWidth)return false;
 const height=width*frame.height/frame.width;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(image,x-width/2,y-height*frame.anchorY,width,height);ctx.restore();return true;
}
function paintSupportTotemArt(t,foot){
 const kind=t.biome??biomeIndex(),variant=supportTotemVariant(t),signal=totemSignal(t),disabled=!!t.disabled,depleted=t.type==='mend'&&t.blocked&&t.healReserve<=0,width=70,coreY=foot.y+(SUPPORT_ART_META[t.type]?.variants[variant]?.coreY??-62)*width/SUPPORT_ART_FRAME.width;
 if(!paintSupportSprite(t.type,kind,variant,t.x,foot.y,width,disabled?.4:1))return false;
 const color=disabled?'#87979e':t.blocked?combatTheme('safe').color:signal.color;
 ctx.save();ctx.strokeStyle=color+'b0';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(t.x,foot.y-2,24,8,0,0,Math.PI*2);ctx.stroke();
 if(!disabled&&!depleted){const time=abilityEffectTime(),breath=reducedMotion()?1:.86+Math.sin(time*1.7)*.14;glow(t.x,coreY,19,signal.color+'30');for(const side of [-1,1]){const u=reducedMotion()?.5:(time*.32+(side+1)*.25)%1;disc(t.x+side*(14-u*4),coreY+13-u*29,1.3,signal.hot+Math.round((1-u)*160*breath).toString(16).padStart(2,'0'));}}
 ctx.restore();return true;
}
function paintEliteTaskInstrument(owner,task,point){
 const kind=owner.biome??biomeIndex(),side=(owner.visualType||0)%2?-1:1,x=point.x+side*48,y=point.y+22,channel=task.phase==='channel',theme=combatTheme('interrupt');
 ctx.save();themedLine({x:point.x+side*22,y:point.y+13},{x,y:y-5},1.5,theme.color+(channel?'80':'35'));
 ellipse(x,y,18,5,'#10151c55');
 if(!paintSupportSprite(task.kind,kind,0,x,y,channel?49:43,channel?.95:.32))paintAbilityEmblem(eliteTaskSymbol(task.kind),x,y-21,13,theme);
 if(channel){const time=abilityEffectTime(),u=reducedMotion()?.5:(time*.4)%1;line(x-10,y-35-u*20,x+10,y-35-u*20,1,theme.hot+'70');disc(x,y-39,2.5,theme.hot);}
 ctx.restore();
}
