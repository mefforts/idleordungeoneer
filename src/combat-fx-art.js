/* Shared cached combat materials; painters never advance the encounter. */
const combatFxImages=new Map();
function installCombatFxArt(){for(const [key,src]of Object.entries(COMBAT_FX_ART)){const image=new Image();image.src=src;combatFxImages.set(key,image);}}
function paintCombatFxSprite(family,kind,x,y,width,angle=0,alpha=1,squash=1){
 const image=combatFxImages.get(family+'-'+(kind??biomeIndex())),frame=COMBAT_FX_FRAMES[family];if(!image?.complete||!image.naturalWidth||!frame)return false;
 const height=width*frame.height/frame.width;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(1,squash);ctx.globalAlpha*=alpha;ctx.drawImage(image,-width/2,-height*frame.anchorY,width,height);ctx.restore();return true;
}
function paintMaterialSpire(t,foot,disabled,surging){
 const kind=t.biome??biomeIndex(),theme=combatTheme(disabled?'shield':surging?'danger':'safe'),time=abilityEffectTime(),size=69;
 ctx.save();if(disabled)ctx.globalAlpha*=.48;
 if(!paintCombatFxSprite('spire',kind,t.x,foot.y,size))poly([t.x-17,foot.y,t.x-21,foot.y-56,t.x,foot.y-79,t.x+21,foot.y-56,t.x+17,foot.y],theme.dark,theme.color,2);
 if(t.eliteSummon)paintCombatFxSprite('crown',kind,t.x,foot.y-82,30,0,1);
 if(t.hp<t.maxHp){line(t.x+4,foot.y-58,t.x-5,foot.y-45,3,'#1a1827');line(t.x-5,foot.y-45,t.x+3,foot.y-33,3,'#1a1827');line(t.x+4,foot.y-58,t.x-5,foot.y-45,1,'#f6d7a5');line(t.x-5,foot.y-45,t.x+3,foot.y-33,1,'#f6d7a5');}
 ctx.restore();
 if(surging){const lift=reducedMotion()?.5:(time*.8)%1;for(const side of [-1,1]){line(t.x+side*28,foot.y-10,t.x+side*24,foot.y-52,3,theme.color+'70');themedArrow(t.x+side*(27-lift*2),foot.y-15-lift*31,-Math.PI/2,theme.hot,5);}}
 if(!disabled)for(let i=0;i<3;i++){const a=i*Math.PI*2/3+time*.9,x=t.x+Math.cos(a)*20,y=foot.y-42+Math.sin(a)*9;poly([x,y-3,x+2,y,x,y+3,x-2,y],theme.hot,theme.dark,1);}
}
