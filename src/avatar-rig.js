
/* DEEPWELL / ZONE GAUNTLET v0.9
 * Stateless, modular Canvas2D character renderer. The same rig powers combat,
 * mining, smithing, preview, and eventually casting, defending and other skills.
 * The customizable vector base shares an articulated rig with isolated armor textures.
 * Coordinate system: local foot anchor (0,0), ~82 units tall, forward is right.
 * Equipment slots: head/chest/legs/boots/cape/mainHand/offHand/tool/aura.
 * Permanent equipment appearance comes exclusively from saved progression.
 */
(function(global){
'use strict';
let SKIN='#e3b18a', SKIN_L='#ffdab1',SKIN_D='#9b6c55';const INK='#28303b';
const palette={cloth:'#72937c',clothDark:'#3c594b',clothLight:'#adbc8e',pants:'#705b48',pantsLight:'#a08a66',leather:'#57443a',leatherLight:'#9d7750',iron:'#75858a',ironHi:'#d6d6c2',ironDark:'#39494e',steel:'#849da5',steelHi:'#e8e6d0',steelDark:'#3d5c67',gold:'#d4b170',goldHi:'#ffdd8b',arcane:'#70e4ed'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
let HAIR='#564035',HAIR_LIGHT='#c28d59',HAIR_SHADOW='#302a30',EYE='#2387aa',EYE_DARK='#143c64';
let RIG_STYLE='melee';let LOOK={hair:0,eyes:0,chest:0,legs:0,boots:0}, BASE=Object.freeze({hair:0,eyes:0,chest:0,legs:0,boots:0,hairColor:'#74513b',eyeColor:'#2387aa',chestColor:'#72937c',legsColor:'#705b48',bootsColor:'#93704f',skinColor:'#e3b18a'});
const STYLE_COUNTS=Object.freeze({hair:6,eyes:4,chest:4,legs:3,boots:4});
const COLOR_SETS=Object.freeze({hairColor:['#74513b','#3f3332','#c59650','#dcb76e','#a75f41','#853f40','#655374','#d8d2b9','#6c7c77','#f1d7ac'],eyeColor:['#2387aa','#3f9d6e','#8564c1','#b78b42','#546b9b','#d76b6b','#4aaeb2','#7f674f','#b1cae0','#d6ae64'],chestColor:['#72937c','#577da0','#8d5b65','#aa8952','#655a8f','#3f8c83','#9a6b44','#b0afa1','#464b55','#c17c6d'],legsColor:['#705b48','#484c57','#4f765c','#8e705b','#5f5380','#978c77','#333f48','#8f5861','#a28d64','#607c84'],bootsColor:['#93704f','#4e4243','#65534c','#6a7779','#8e5f53','#a18d69','#4a5c52','#70718a','#b07a43','#414a56'],skinColor:['#e3b18a','#f1cba9','#dba07e','#bc8068','#a86952','#80513f','#f1d6bc','#ce9876','#9c6854','#684737']});
function normalizeCustom(src){const a={...BASE};if(!src||typeof src!=='object')return a;for(const k of Object.keys(STYLE_COUNTS)){const n=Number(src[k]);a[k]=Number.isInteger(n)?Math.max(0,Math.min(STYLE_COUNTS[k]-1,n)):0}for(const k of Object.keys(COLOR_SETS)){if(COLOR_SETS[k].includes(src[k]))a[k]=src[k]}return a;}
function shade(hex,mul){const v=hex.replace('#','');let out='#';for(let i=0;i<6;i+=2){out+=Math.max(0,Math.min(255,Math.round(parseInt(v.slice(i,i+2),16)*mul))).toString(16).padStart(2,'0')}return out;}
function applyLook(src){const a=normalizeCustom(src);LOOK=a;HAIR=a.hairColor;HAIR_LIGHT=shade(HAIR,1.48);HAIR_SHADOW=shade(HAIR,.59);EYE=a.eyeColor;EYE_DARK=shade(EYE,.50);SKIN=a.skinColor;SKIN_L=shade(SKIN,1.22);SKIN_D=shade(SKIN,.69);palette.cloth=a.chestColor;palette.clothDark=shade(a.chestColor,.63);palette.clothLight=shade(a.chestColor,1.29);palette.pants=a.legsColor;palette.pantsLight=shade(a.legsColor,1.32);palette.leather=a.bootsColor;palette.leatherLight=shade(a.bootsColor,1.25);return a;}

function path(c,pts,fill,stroke=INK,sw=1.45){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=sw;c.lineJoin='round';c.strokeStyle=stroke;c.stroke()}}
function ellipse(c,x,y,rx,ry,fill,stroke='',sw=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.stroke()}}
function line(c,x,y,xx,yy,stroke,sw=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.lineWidth=sw;c.lineCap='round';c.strokeStyle=stroke;c.stroke()}
function tier(n){return n<=0?0:n<3?1:n<6?2:3}
function appearance(data={}){
 const weapon=Math.max(0,Number(data.weapon)||0),armor=Math.max(0,Number(data.armor)||0),enchant=Math.max(0,Number(data.enchant)||0),set=global.DeepwellEquipmentArt?.describe(data).armor;
 return {weapon,armor,enchant,armorSet:set?.id||'',armorTier:set?.tier||0,head:set?set.style==='melee'?'helmet':set.style==='magic'||set.tier>=2?'hood':'hair':'hair',chest:set?set.style==='magic'?'robes':set.style==='ranged'?'ranger':'armor':'tunic',legs:set?.style==='magic'?'robe':'trousers',boots:set?'reinforced':'leather',cape:'none',mainHand:data.weaponType||'sword',offHand:data.weaponType==='shield'?'buckler':'none',aura:enchant>0?'lightning':'none'};
}
function gearPalette(t){if(RIG_STYLE==='ranged')return {mid:'#7c8362',light:'#c0c79a',dark:'#405b4b',trim:'#d6be86'};if(RIG_STYLE==='magic')return {mid:'#7a82a8',light:'#c4cbe0',dark:'#414d79',trim:'#cdd9bc'};return t>=3?{mid:'#718ca3',light:'#d9d7ca',dark:'#345366',trim:'#e7b86d'}:t===2?{mid:'#768b91',light:'#c5d0cd',dark:'#415d63',trim:'#bea475'}:{mid:'#747978',light:'#b7b9ac',dark:'#434e4b',trim:'#b99b61'}}
function drawBoot(c,alt,level){
 const t=tier(level),g=gearPalette(t);
 path(c,[-6,10,5,10,6,18,-8,19,-8,15],t?g.dark:shade(LOOK.bootsColor,.76),INK,1.1);
 path(c,[-8,16,3,16,10,20,9,22,-10,22,-11,19],t?g.mid:LOOK.bootsColor,INK,1.1);
 path(c,[-9,20,7,20,9,22,-10,22],t?'#34444e':'#433d38','',0);
 line(c,-6,15,3,15,t?g.light:shade(LOOK.bootsColor,1.35),1.35);
 if(!t){if(LOOK.boots===1){path(c,[-8,9,5,8,7,17,-9,18],shade(LOOK.bootsColor,.85),INK,.8);line(c,-7,12,5,11,'#d6bc92',1)}if(LOOK.boots===2){path(c,[-7,11,5,11,6,16,-8,17],shade(LOOK.bootsColor,.62),INK,1);line(c,-6,12,4,12,'#d7bb8d',1.6);line(c,-5,15,4,15,'#d7bb8d',1.6)}if(LOOK.boots===3){path(c,[-7,6,5,7,7,17,-8,17],shade(LOOK.bootsColor,.81),INK,.9);path(c,[-6,7,2,6,5,10,-7,12],shade(LOOK.bootsColor,1.43),'',0)}}
 if(t){line(c,-4,18,6,18,g.trim,1);line(c,-3,11,4,13,g.light,1)}
}
function drawLeg(c,side,theta,armor,time){
 const t=tier(armor);c.save();c.translate(side*6,-23.5);c.rotate(theta);
 path(c,[-5.5,-1,5,-1,5,14,-5,15],t>=2?'#53636c':palette.pants,INK,1.2);
 if(t<2&&LOOK.legs===1){line(c,-4,5,4,5,'#c4aa85',1.3);line(c,-4,10,4,10,'#c4aa85',1)}if(t<2&&LOOK.legs===2){path(c,[-5,1,4,2,5,14,-5,13],shade(LOOK.legsColor,.7),'',0);line(c,-4,9,5,9,'#baaf8e',1.7)}
 path(c,[-4,-.1,.4,0,1.3,12,-4,13],t>=2?'#a7b8b8':palette.pantsLight,'',0);
 if(t>=2){const g=gearPalette(t);path(c,[-5,7,4,7,6,13,-5,13],g.mid,INK,.8);line(c,-4,9.5,5,9,g.light,1.8);line(c,-4,12,4,12,g.trim,.75)}
 else{line(c,-3,13,4,13,'#c1a182',1)}
 drawBoot(c,0,armor);c.restore();
}
function drawCape(c,grade,time,walk){if(grade<3)return;
 const sway=Math.sin(time*4)*1.7 + walk*1.4;
 path(c,[-11,-42,-16+sway,-25,-20+sway,-5,-10+sway,-8,1+sway,-3,15+sway,-23,12,-43], '#5e3946',INK,1.3);
 path(c,[-13,-37,-17+sway,-16,-10+sway,-12,-4+sway,-17], '#ac665d','',0);
 line(c,-15+sway,-10,1+sway,-7,palette.gold,1.5);
}
function shoulder(c,x,y,angle,armor,hideHand=false){
 const t=tier(armor),g=gearPalette(t);c.save();c.translate(x,y);c.rotate(angle);
 path(c,[-4,-1,5,-1,5,12,-3,16],t?'#586970':palette.clothDark,INK,1.1);
 path(c,[-2,1,1,1,1,12,-3,12],t?'#c1cbc3':palette.clothLight,'',0);
 if(t){
  path(c,[-7,-4,8,-3,8,6,-6,8],g.mid,INK,1.1);
  path(c,[-6,-3,5,-3,4,1,-5,2],g.light,'',0);
  line(c,-6,6,7,6,g.trim,1.1);
  path(c,[-3,9,5,9,6,15,-4,15],g.dark,INK,.85);
  line(c,-2,10,4,10,g.light,.9);
 }else{
  path(c,[-6,-2,6,-2,6,5,-6,6],palette.cloth,INK,.8);
  line(c,-4,5,4,6,palette.clothLight,1.4);
  path(c,[-3,11,5,11,6,15,-4,16], '#7c5a43',INK,.8);
 }
 if(!hideHand){ellipse(c,1,18,4.1,4.5,SKIN,SKIN_D,.9);ellipse(c,-.8,16,1.3,1.6,SKIN_L)}
 c.restore();
}
function drawSword(c,level,ench){
 const t=tier(level),g=gearPalette(t);c.save();c.translate(0,18);c.rotate(.7);if(t===0)c.scale(.86,.86);
 // Slight asymmetry and beveled edge convey a real weapon instead of a thin spear.
 path(c,[-3,-1,-4,-25,-2,-35,0,-45,3,-34,5,-25,3,-1],t===0?'#9fa6a2':g.light,INK,1.4);
 path(c,[-3,-2,-4,-25,-2,-35,0,-45,0,-3],t===0?'#e4e1cc':g.mid,'',0);
 path(c,[0,-43,3,-34,4,-25,2,-3,0,-3],t===0?'#687a80':g.dark,'',0);
 line(c,-9,-2,9,-2,t===0?'#a3845e':g.trim,4.2);
 line(c,-10,-3,10,-3,'#f0d4a0',1.0);
 line(c,0,1,0,12,'#5b4031',4.3);
 line(c,-1,2,-1,10,'#c49a5b',.9);
 ellipse(c,0,13,3.2,3.0,t===0?'#c5a06b':g.trim,INK,.7);
 if(t>=2){line(c,-1,-22,0,-37,'#fffef2',1.2);ellipse(c,0,-4,2.3,2.6,t>=3?'#6bd3df':g.trim)}
 if(ench>0){c.save();c.globalCompositeOperation='screen';c.strokeStyle='#77edff';c.shadowColor='#4bd9f9';c.shadowBlur=6;c.lineWidth=ench>=3?2.7:1.6;c.beginPath();c.moveTo(-3,-5);c.lineTo(2,-13);c.lineTo(-1,-19);c.lineTo(3,-31);c.lineTo(0,-39);c.stroke();c.restore()}
 c.restore();
}
function drawPolearm(c,level,ench){
 c.save();c.translate(0,18);c.rotate(.34);
 line(c,0,17,0,-67,'#51412f',5);line(c,-1,9,-1,-63,'#b49368',1.4);
 path(c,[-5,-65,0,-83,6,-65,3,-51,-3,-51],level>=3?'#c7dee9':'#d7ddd4',INK,1.5);
 path(c,[0,-69,16,-57,12,-49,3,-54],'#8fa5aa',INK,1);
 line(c,-7,-44,7,-44,'#c5a068',2);
 if(ench)line(c,0,-82,2,-51,'#72eaff',2);
 c.restore();
}
function drawGreatsword(c,level,ench){
 c.save();c.translate(0,18);c.rotate(.44);
 path(c,[-7,-5,-10,-47,-6,-61,0,-78,7,-61,10,-47,7,-5],level>=3?'#d6e7e5':'#aebdc0',INK,2);
 path(c,[-7,-9,-10,-47,-6,-61,0,-78,0,-7],'#e1e8e1','',0);
 path(c,[0,-77,7,-61,10,-47,7,-8,0,-8],'#50656a','',0);
 line(c,-17,-4,17,-4,'#bb9656',5);line(c,0,0,0,21,'#624a37',6);ellipse(c,0,23,4,4,'#c5a877');
 if(ench)line(c,0,-67,0,-14,'#78eaff',2.2);
 c.restore();
}
function drawBow(c){
 c.save();c.translate(0,18);c.rotate(.1);
 c.strokeStyle='#936d4a';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,-55);c.quadraticCurveTo(22,-21,0,17);c.stroke();
 line(c,0,-55,0,17,'#e1cfab',1.4);line(c,0,-21,21,-21,'#dcb57b',2);path(c,[25,-21,14,-26,14,-16],'#e1e6dc',INK,.8);
 c.restore();
}
function drawStaff(c,level,ench){
 c.save();c.translate(0,18);c.rotate(.18);
 line(c,0,19,0,-55,'#564034',6);line(c,-1,14,-1,-49,'#b18c5f',1.2);
 path(c,[-9,-58,0,-74,10,-57,0,-45],ench?'#80f7fb':'#9f8ddd',INK,1.3);
 ellipse(c,0,-60,4.2,7,'#e4faff');
 c.save();c.shadowColor='#6eeaff';c.shadowBlur=12;ellipse(c,0,-59,3,5,'#8ceaff');c.restore();
 c.restore();
}
function drawPickaxe(c){
 c.save();c.translate(0,18);c.rotate(.64);
 line(c,0,12,0,-28,'#4e362c',6);line(c,-1,11,-1,-28,'#aa7951',3);line(c,-2,4,-2,-23,'#d5a26a',.9);
 path(c,[-15,-31,-11,-37,-1,-39,11,-36,25,-28,12,-31,0,-33,-10,-31], '#788b95',INK,1.4);
 path(c,[-15,-31,-11,-37,-1,-39,-2,-33], '#d9e1df','',0);
 path(c,[1,-39,11,-36,25,-28,12,-31], '#465967','',0);
 line(c,-10,-35,12,-34,'#eef4e5',.9);c.restore();
}
function drawHammer(c){
 c.save();c.translate(0,18);c.rotate(.56);
 line(c,0,12,0,-28,'#563a2d',6);line(c,-1,11,-1,-27,'#bc8556',2.9);
 path(c,[-17,-41,16,-41,19,-37,18,-28,-18,-28], '#74868e',INK,1.5);
 path(c,[-17,-41,14,-41,12,-35,-17,-35], '#d4ded9','',0);
 path(c,[12,-40,18,-37,18,-29,11,-29], '#425563','',0);
 line(c,-16,-30,16,-30,'#b6c7bf',1.2);c.restore();
}
// Activity-specific hand tools share the same shoulder pivot and gear layers.
function drawHatchet(c){c.save();c.translate(0,18);c.rotate(.49);line(c,0,13,0,-39,'#775139',6);line(c,-1,13,-1,-37,'#d3a36e',1.7);path(c,[-2,-39,-16,-46,-26,-38,-19,-24,-3,-27], '#aebfc1',INK,1.5);path(c,[-17,-43,-26,-38,-19,-27,-14,-34],'#e9f0e7','',0);c.restore()}
function drawFletchingTool(c){c.save();c.translate(0,18);line(c,-5,4,2,-3,'#806044',3.5);path(c,[0,-5,4,-9,10,-5,2,-1],'#cbd7d4',INK,.7);line(c,3,-6,8,-5,'#f0eee0',.8);c.restore()}
function drawWardTool(c,time){c.save();c.translate(0,18);path(c,[-8,-3,-4,-6,7,-2,4,3,-6,2],'#96724e',INK,.9);line(c,-4,-3,3,0,'#e2d0b4',2.5);line(c,-2,-3,5,-1,'#b8b4d1',1);c.restore()}
function drawRuneTool(c,time){c.save();c.translate(0,18);line(c,-3,3,7,-9,'#7c6754',2.8);path(c,[5,-9,9,-12,8,-6],'#d1e1df',INK,.5);c.restore()}
function drawGemTool(c){c.save();c.translate(0,18);line(c,-4,4,6,-8,'#816747',3);path(c,[4,-8,8,-12,9,-6,6,-4],'#c3d2d3',INK,.6);c.restore()}
function drawMattock(c){c.save();c.translate(0,18);c.rotate(.45);line(c,0,15,0,-38,'#8d6645',5);line(c,-1,13,-1,-37,'#d2ac72',1.2);path(c,[-24,-41,-8,-46,10,-43,22,-34,13,-33,4,-37,-12,-35,-22,-29], '#9ab4bd',INK,1.7);path(c,[-23,-41,-24,-29,-17,-24,-11,-35], '#c2ceca',INK,1.4);c.restore()}
function drawStyleClothes(c,armor){const g=gearPalette(tier(armor));if(RIG_STYLE==='magic'){path(c,[-11,-43,-4,-39,4,-39,11,-43,15,-30,12,-20,19,-5,9,-2,1,-6,-7,-2,-19,-5,-13,-21,-15,-30],g.mid,INK,1.5);path(c,[-10,-39,-2,-35,-4,-10,-13,-6],g.light,'',0);path(c,[6,-39,12,-31,9,-21,15,-7,6,-7,1,-12,3,-29],g.dark,'',0);line(c,-13,-22,12,-22,g.trim,2.3);path(c,[-3,-31,1,-35,5,-31,1,-25],'#a5e4dd',g.trim,.7);line(c,-14,-7,-8,-5,g.trim,1.3);line(c,7,-5,14,-7,g.trim,1.3);}else{path(c,[-12,-42,-5,-39,4,-39,12,-42,15,-29,11,-20,13,-14,2,-17,-9,-14,-14,-21,-15,-32],g.mid,INK,1.5);path(c,[-11,-40,-3,-36,-5,-22,-12,-19],g.light,'',0);path(c,[6,-39,11,-37,12,-23,6,-21,2,-25],g.dark,'',0);line(c,-10,-37,9,-23,'#d3b886',3);line(c,-13,-22,12,-22,'#71573e',3);path(c,[-2,-25,3,-25,4,-20,-3,-20],g.trim,INK,.8);}}
function drawBuckler(c,armor){const g=gearPalette(tier(armor));path(c,[-9,-3,1,-8,10,-3,9,12,0,17,-9,10],g.dark,INK,1.7);path(c,[-6,-2,1,-5,7,-2,6,9,0,13,-6,9],g.mid,g.trim,1.2);line(c,0,-2,0,10,g.light,2);ellipse(c,0,3,3,3,g.trim)}
function drawHead(c,armor,time=0,walk=0,hideHair=false){
 const t=tier(armor),sway=Math.sin(time*4.8)*.65+walk*.65,blink=Math.sin(time*1.91+.9)>.998;
 // Keep jaw, eye line, ears, and proportions invariant through all tiers.
 // Back hair appears under helmets as well; hairline is intentionally asymmetric.
 if(!hideHair){
 if(t<2){
  path(c,[-14,-65,-19,-65,-18,-70,-12,-75,-10,-79,-3,-77,3,-80,10,-75,16,-76,20,-70,18,-61,17,-52,-13,-51],HAIR_SHADOW,INK,1.4);
  path(c,[-15,-65,-15,-71,-8,-77,4,-77,16,-72,15,-62],HAIR,INK,1);
 } else { path(c,[-14,-59,-15,-54,-12,-50,-9,-52,12,-52,15,-54,15,-59],HAIR_SHADOW,INK,.9); }
 }
 // Ears and softer, tapered anime jaw rather than a rectangle.
 ellipse(c,-14,-57,3.4,4.7,SKIN,SKIN_D,1);ellipse(c,14,-57,3.4,4.7,SKIN,SKIN_D,1);
 path(c,[-13,-64,-8,-69,6,-69,13,-64,14,-57,12,-50,7,-46,2,-44,-4,-46,-11,-51,-14,-57],SKIN,SKIN_D,1.2);
 path(c,[-11,-64,-7,-67,5,-67,10,-64,10,-57,6,-50,1,-47,-7,-50,-10,-57],SKIN_L,'',0);
 path(c,[9,-67,13,-64,14,-56,11,-50,3,-45,7,-53], '#bc856d','',0);
 path(c,[-11,-52,-9,-50,-6,-50,-7,-52], '#e9a18b','',0);
 path(c,[8,-51,11,-52,10,-49,7,-49], '#d99583','',0);
 // Shaded crown is built in overlapping clumps that can sway without shifting face anchors.
 if(t<2){
  if(!hideHair&&LOOK.hair===0){
  path(c,[-18,-63,-19,-69,-13,-71,-11,-77,-5,-74,3,-79,9,-75,16,-75,20,-70,18,-64,14,-65,11,-59,7,-65,0,-61,-2,-67,-8,-61,-12,-64], HAIR,INK,1.35);
  path(c,[-16,-70,-11,-76,-4,-74,0,-77,5,-74,-2,-70,-8,-67],HAIR_LIGHT,'',0);
  path(c,[2,-75,10,-76,17,-72,17,-66,12,-67,10,-62,8,-67], '#93613d','',0);
  path(c,[-12,-75,-7,-82,-3,-76],HAIR_SHADOW,INK,1.15);
  path(c,[4,-78,10,-86,11,-77,17,-79,14,-73],HAIR,INK,1.1);
  path(c,[8,-81,11,-83,12,-78],'#d19a62','',0);
  path(c,[-15,-66,-18-sway,-57,-14,-59], HAIR_SHADOW,INK,1);
  path(c,[15,-65,18+sway,-56,13,-59], HAIR_SHADOW,INK,1);
  line(c,-9,-70,-4,-72,'#d6a46b',1.3);
  }
 }else{
  const g=gearPalette(t);
  // Visor stays above brows and doesn't hide character identity.
  path(c,[-17,-59,-18,-67,-12,-74,-3,-77,9,-75,17,-68,18,-59,13,-62,-12,-62],g.dark,INK,1.6);
  path(c,[-15,-67,-11,-72,-3,-74,-2,-62,-14,-62],g.light,'',0);
  path(c,[0,-74,9,-73,14,-68,11,-62,1,-62],g.mid,'',0);
  path(c,[-18,-63,18,-63,17,-58,4,-59,-12,-58],g.mid,INK,1);
  line(c,-13,-60,12,-60,g.trim,1.4);
  path(c,[-3,-73,2,-74,3,-62,-3,-62],g.light,'',0);
  path(c,[-18,-60,-15,-58,-15,-52,-12,-51,-12,-60],g.dark,INK,.7);
  path(c,[17,-60,14,-58,14,-52,11,-51,12,-60],g.dark,INK,.7);
  if(t>=3)ellipse(c,0,-67,2.2,2.5,'#72d5e0',g.trim,.8);
 }
 // Variant hair geometry shares the same helmet-safe anchors and skin contour.
 if(t<2&&!hideHair){
  const h=LOOK.hair;
  if(h===1){ // swept fringe
   path(c,[-17,-69,-12,-79,2,-81,15,-75,19,-67,11,-68,3,-63,-7,-61,-14,-57],HAIR,INK,1);
   path(c,[-13,-75,1,-79,13,-74,2,-69,-10,-63],HAIR_LIGHT,'',0);
  }else if(h===2){ // cropped
   path(c,[-16,-67,-14,-73,-5,-76,6,-76,16,-72,17,-65,9,-66,3,-63,-7,-65],HAIR,INK,1.3);
   line(c,-9,-73,8,-72,HAIR_LIGHT,1.8);
  }else if(h===3){ // long windswept
   path(c,[-18,-70,-12,-80,-2,-82,12,-78,21,-69,17,-61,19,-52,14,-45,10,-54,12,-66,-2,-61,-16,-57,-19,-49,-23,-55],HAIR,INK,1.5);
   path(c,[-14,-77,-4,-82,15,-74,6,-71,-7,-70],HAIR_LIGHT,'',0);
  }else if(h===4){ // fluffy curls
   for(const [xx,yy,rr] of [[-15,-72,7],[-7,-79,7],[3,-81,7],[13,-78,7],[18,-70,6],[-19,-63,5],[15,-62,5]]){
     ellipse(c,xx,yy,rr,rr*.83,HAIR,INK,1);ellipse(c,xx-2,yy-2,rr*.38,rr*.29,HAIR_LIGHT);
   }
  }else if(h===5){ // topknot
   path(c,[-16,-68,-10,-75,6,-76,16,-72,18,-64,-9,-64],HAIR,INK,1);
   ellipse(c,0,-82,8,6,HAIR,INK,1.1);
   path(c,[-4,-84,-1,-91,7,-88,7,-82],HAIR,INK,.9);
   line(c,-12,-70,12,-70,HAIR_LIGHT,2);
  }
 }
 // Eye whites remain slightly angled; eyelids, iris and pinpoint reflection are
 // separate shapes so they survive scaling in both combat and equipment preview.
 for(const side of [-1,1]){
  c.save();c.translate(side*6.5,-56);c.scale(side,1);
  // Individual eyes look slightly toward the action instead of straight ahead.
  const eyeStyle=LOOK.eyes;
  if(eyeStyle===0)path(c,[-3.5,-1.4,2.5,-2.2,3.8,0,2.8,2.0,-2.8,2.1], '#fff8e8','',0);
  else if(eyeStyle===1)path(c,[-3.5,-.4,3.3,-2.2,3.8,-.7,1.7,1,-3,1], '#fff8e8','',0);
  else if(eyeStyle===2)ellipse(c,0,0,3.6,3.2,'#fff8e8');
  else path(c,[-3.8,-1.4,2.7,-2.2,3.6,-.2,1.2,2.2,-3,2.3], '#fff8e8','',0);
  if(blink){line(c,-3.3,-.2,3.1,.1,INK,1.4)}else{
   ellipse(c,.35,-.25,eyeStyle===2?2.5:eyeStyle===1?2:2.15,eyeStyle===1?1.9:2.65,EYE_DARK);
   ellipse(c,.65,-.35,1.32,eyeStyle===1?1.5:2.05,EYE);
   ellipse(c,.05,-1.44,.74,.85,'#fafffb');
   ellipse(c,1.5,.8,.4,.5,'#7fe7f0');
  }
  if(eyeStyle===3)line(c,-3.6,-2.7,3.2,-3.4,INK,1.9);else if(eyeStyle===1)line(c,-3.6,-1.4,3.1,-2.4,INK,1.8);else line(c,-3.6,-2.3,3,-2.9,INK,1.55);
  // warm brown eyebrows separate from top hair.
  line(c,-2.8,-5.6,2.2,-6.05,HAIR_SHADOW,1.25);
  c.restore();
 }
 line(c,.3,-53,1.5,-51.6,'#b27762',.85);
 line(c,-1.5,-48.7,2,-48.4,'#985e53',1.1);
 ellipse(c,-7.5,-63,2.3,.7,'#fff3ca70');
}
function drawBody(c,armor){if(armor>0&&RIG_STYLE!=='melee'){drawStyleClothes(c,armor);return;}
 const t=tier(armor),g=gearPalette(t);
 // Under-tunic and flared hem remain visible beneath metal armor.
 path(c,[-12,-43,11,-43,14,-27,12,-20,7,-17,2,-19,-4,-17,-14,-20,-14,-30],t?g.mid:palette.cloth,INK,1.45);
 path(c,[-11,-41,-3,-43,-2,-26,-10,-22],t?g.light:palette.clothLight,'',0);
 path(c,[5,-41,10,-39,12,-27,8,-23,3,-26],t?g.dark:palette.clothDark,'',0);
 path(c,[-5,-43,0,-39,5,-43],SKIN_L,'',0);
 if(!t){
  path(c,[-6,-43,1,-39,6,-43,7,-40,1,-36,-4,-39],'#355e4a',INK,.8);
  line(c,-10,-37,7,-24,'#9e704c',2.5);
  line(c,-9,-37,7,-24,'#d3a879',.65);
  ellipse(c,4,-25,2.4,2.2,'#d6b578',INK,.5);
  path(c,[-12,-20,-7,-17,-2,-19,5,-17,11,-19], '#6d856a',INK,.8);
  path(c,[-10,-22,-7,-18,-5,-21], '#b4c09b','',0);
  if(LOOK.chest===1){path(c,[-13,-36,-9,-40,10,-39,14,-33,11,-25,-11,-25],shade(LOOK.chestColor,.80),INK,.75);line(c,-10,-29,11,-28,shade(LOOK.chestColor,1.6),1.4)}
  if(LOOK.chest===2){line(c,-11,-38,10,-25,'#d1ae75',3.8);line(c,9,-37,-9,-25,'#9e8255',2);ellipse(c,1,-31,3,3,'#d3b474',INK,.6)}
  if(LOOK.chest===3){path(c,[-11,-42,-9,-33,7,-34,10,-42],shade(LOOK.chestColor,.59),INK,.9);line(c,-9,-31,10,-31,shade(LOOK.chestColor,1.45),1.3);path(c,[-13,-20,-6,-16,-3,-18,8,-15,14,-20],shade(LOOK.chestColor,.80),INK,.9)}
  // A small utility pouch makes the level-one look practical rather than royal.
  path(c,[7,-24,14,-22,13,-16,7,-17], shade(LOOK.bootsColor,.73),INK,.9);
  line(c,8,-22,13,-21,'#c79d60',1);
 }else{
  path(c,[-11,-41,8,-41,10,-26,-11,-26],g.mid,INK,.9);
  path(c,[-9,-39,-1,-40,-2,-29,-9,-29],g.light,'',0);
  path(c,[4,-40,8,-39,8,-28,4,-29],g.dark,'',0);
  line(c,-11,-39,10,-35,g.trim,1.5);
  path(c,[-7,-33,6,-34,10,-28,0,-24,-9,-28],g.light,g.dark,1);
  path(c,[-5,-32,2,-29,-5,-28], '#f3f0db88','',0);
  if(t>=2){path(c,[-12,-21,-6,-16,0,-18,7,-16,13,-21],g.mid,INK,.9);line(c,-9,-20,10,-20,g.trim,1.5)}
  if(t>=3){path(c,[-12,-40,-15,-30,-11,-22,-8,-23],g.trim,'',0);ellipse(c,0,-30,2.1,2.1,'#74d7e3',g.trim,.7)}
 }
 line(c,-13,-24,13,-24,t?g.trim:palette.leather,3);
 path(c,[-2,-27,3,-27,4,-21,-3,-21],t?g.trim:'#c5a577',INK,.9);
 line(c,-1,-25,1,-25,t?g.dark:'#574333',1.1);
}
function drawAura(c,level,time){if(level<1)return;const intensity=Math.min(3,level),pulse=.5+.5*Math.sin(time*3.4);
 c.save();c.globalCompositeOperation='screen';c.strokeStyle=intensity>1?'#70dff9':'#67b9cf';c.lineWidth=1.2+intensity*.45;c.globalAlpha=.29+pulse*.21;
 for(let i=0;i<3+intensity;i++){const phi=i*Math.PI*2/(3+intensity)+time*.8;const px=Math.cos(phi)*21,py=-32+Math.sin(phi*1.8+time)*22;c.beginPath();c.moveTo(px-3,py-7);c.lineTo(px+2,py-3);c.lineTo(px-1,py+3);c.lineTo(px+4,py+7);c.stroke()}c.restore();}

function armJoints(shoulder,hand,bend=1,length=14){
 const dx=hand.x-shoulder.x,dy=hand.y-shoulder.y,d=Math.max(.01,Math.hypot(dx,dy)),half=d/2,h=Math.sqrt(Math.max(0,length*length-half*half));
 return {shoulder,hand,elbow:{x:shoulder.x+dx/2-dy/d*h*bend,y:shoulder.y+dy/2+dx/d*h*bend}};
}
function workPose(pose,phase,working){
 const t=phase*Math.PI*2,w=working?1:0,s=working?(phase<.18?1-phase/.18:phase<.64?0:Math.pow((phase-.64)/.36,2)):0;
 const body={x:0,y:-23.5,angle:0},result={body,main:{x:21,y:-28},back:{x:-15,y:-27},angle:.25,headAngle:0,kneeling:false,phase};
 if(pose==='mine'){body.angle=.07+s*.13;result.main={x:15+s*17,y:-56+s*30};result.angle=-1.15+s*2.15;result.back={x:-10,y:-30};result.headAngle=.05+s*.08;}
 else if(pose==='smith'){body.angle=.04+s*.12;result.main={x:20+s*6,y:-49+s*24};result.back={x:12,y:-30};result.angle=-.55+s*1.25;result.headAngle=.12;}
 else if(pose==='wood'){body.angle=.05+s*.18;result.main={x:13+s*18,y:-55+s*25};result.back={x:-11,y:-30};result.angle=-.95+s*2.0;result.headAngle=.06;}
 else if(pose==='fletch'){body.angle=.09;result.main={x:23+Math.sin(t)*6*w,y:-30+Math.sin(t*2)*w};result.back={x:12,y:-30};result.angle=.12+Math.sin(t)*.1*w;result.headAngle=.15;}
 else if(pose==='ward'||pose==='cast'){body.angle=.035*Math.sin(t)*w;result.main={x:33+Math.sin(t)*2*w,y:-33+Math.cos(t)*2*w};result.back={x:13-Math.sin(t)*2*w,y:-42-Math.cos(t)*w};result.angle=-.2;result.headAngle=.04;}
 else if(pose==='rune'){body.angle=.10;result.main={x:28+Math.sin(t)*4*w,y:-31+Math.cos(t)*3*w};result.back={x:12,y:-30};result.angle=.1+Math.sin(t)*.16*w;result.headAngle=.18;}
 else if(pose==='polish'){body.angle=.13;result.main={x:28+Math.sin(t)*3*w,y:-32+s*5};result.back={x:13,y:-29};result.angle=-.22+s*.4;result.headAngle=.2;}
 else if(pose==='scavenge'){body.x=-8;body.y=-12;body.angle=.91+Math.sin(t)*.045*w;result.main={x:34+Math.sin(t)*4*w,y:-3-Math.max(0,Math.sin(t))*6*w};result.back={x:7,y:-5};result.angle=0;result.headAngle=.48+Math.sin(t)*.04*w;result.kneeling=true;}
 if(!working&&['mine','smith','wood'].includes(pose)){result.main={x:22,y:-27};result.angle=.22;}
 return result;
}
function torsoPoint(body,p){const x=p.x,y=p.y+23.5,c=Math.cos(body.angle),s=Math.sin(body.angle);return {x:body.x+x*c-y*s,y:body.y+x*s+y*c};}
function poseRig(options={}){
 const {pose='idle',time=0,attack=0,action=0,vx=0,vy=0,data={}}=options,weapon=data.weaponType||'sword';
 const walking=pose==='walk'||pose==='combat'&&Math.hypot(vx,vy)>.1,backpedal=pose==='combat'&&vx*(options.facing||1)<-.1,walk=walking?Math.sin(time*10)*(backpedal?-1:1):0;
 const activity=['mine','smith','wood','fletch','ward','rune','scavenge','polish','cast'].includes(pose),a=(pose==='attack'&&attack===0?.65:Math.max(0,Math.min(1,attack))),stroke=a>0?Math.sin(a*Math.PI*.5):0;
 let main={x:19,y:-25},back={x:-17,y:-27},angle=.48;
 if(weapon==='polearm'){main={x:15+stroke*2,y:-24-stroke*4};angle=.28+stroke*.42;back={x:main.x+Math.sin(angle)*13,y:main.y-Math.cos(angle)*13};}
 else if(weapon==='greatsword'){main={x:16+stroke*5,y:-25-stroke*4};angle=.42+stroke*1.12;back={x:main.x-Math.sin(angle)*7,y:main.y+Math.cos(angle)*7};}
 else if(weapon==='bow'){const draw=Math.max(0,Math.min(1,((options.charge||0)-.45)/.55)),aim=Math.max(-.8,Math.min(.8,options.aimAngle||0));main={x:8+(24+stroke)*Math.cos(aim),y:-40+(24+stroke)*Math.sin(aim)};angle=aim;back={x:main.x-(12+draw*14)*Math.cos(aim),y:main.y-(12+draw*14)*Math.sin(aim)};}
 else if(weapon==='staff'){main={x:20+stroke*3,y:-25-stroke*3};angle=.24+stroke*.18;back={x:-14+stroke*7,y:-31-stroke*8};}
 else{main={x:19+stroke*10,y:-25-stroke*7};angle=.48+stroke*1.18;}
 const phase=((options.workPhase??time*.22)%1+1)%1,work=workPose(pose,phase,options.working!==false),body=activity?work.body:{x:0,y:-23.5,angle:0};
 if(activity){main=work.main;back=work.back;angle=work.angle;}
 if(walking&&!a&&!activity){if(weapon==='bow'){main.y+=walk*.6;back.y+=walk*.6;}else{main.y+=walk*1.2;back.y-=walk*1.2;}}
 const bowPoint=(x,y)=>({x:main.x+x*Math.cos(angle)-y*Math.sin(angle),y:main.y+x*Math.sin(angle)+y*Math.cos(angle)});
 const head={...torsoPoint(body,{x:0,y:-63}),angle:activity?work.headAngle:0};
 return {weapon,activity,walking,backpedal,walk,stroke,angle,main,back,body,head,kneeling:activity&&work.kneeling,phase,bowUpper:bowPoint(-12,-25),bowLower:bowPoint(-12,25),arrowTip:bowPoint(27,0),frontArm:armJoints(torsoPoint(body,{x:12,y:-45}),main,-1,14),backArm:armJoints(torsoPoint(body,{x:-10,y:-45}),back,1,['polearm','greatsword'].includes(weapon)&&!activity?17:weapon==='bow'&&!activity?16:14)};
}
function drawWorkLeg(c,rig,side,data){
 const hip={x:rig.body.x+side*5,y:rig.body.y},knee={x:side<0?-3:7,y:-2},ankle={x:side<0?-22:-10,y:-2};
 if(global.DeepwellEquipmentArt?.paintWorkLeg(c,data,side,{hip,knee,ankle}))return;
 line(c,hip.x,hip.y,knee.x,knee.y,palette.pants,10);line(c,knee.x,knee.y,ankle.x,ankle.y,palette.pants,8);line(c,hip.x-1,hip.y,knee.x-1,knee.y,palette.pantsLight,3);ellipse(c,ankle.x-2,ankle.y,6,3.4,palette.leather,INK,.8);
}
function drawRigArm(c,joints,side,data){
 if(global.DeepwellEquipmentArt?.paintArm(c,data,side,0,joints))return;
 const {shoulder:s,elbow:e,hand:h}=joints;
 line(c,s.x,s.y,e.x,e.y,palette.clothDark,10);line(c,s.x-1,s.y,e.x-1,e.y,palette.cloth,7);
 line(c,e.x,e.y,h.x,h.y,SKIN_D,6.8);line(c,e.x-1,e.y,h.x-1,h.y,SKIN,5);
}
function drawRigHand(c,p,angle=0){c.save();c.translate(p.x,p.y);c.rotate(angle);ellipse(c,0,0,3.3,3.7,SKIN,SKIN_D,.7);line(c,-1.8,-.7,1.4,-.7,SKIN_L,.8);c.restore();}
function render(c,options={}){
 const {x=0,y=0,scale=1,time=0,pose='idle',facing=1,hit=0,data={}}=options;
 applyLook(data.custom);const kit=appearance(data),rig=poseRig(options),art=global.DeepwellEquipmentArt,armor=kit.armor;RIG_STYLE=art?.describe(data).armor?.style||'melee';
 c.save();c.translate(x,y);c.scale(scale*(facing<0?-1:1),scale);ellipse(c,2,1,16,4,'#09101466');c.translate(0,-(rig.walking?Math.abs(rig.walk)*1.15:Math.sin(time*2.8)*.35));
 if(hit>0)c.translate(Math.sin(time*57)*hit*1.4,0);
 if(kit.enchant)drawAura(c,kit.enchant,time);
 if(!kit.armorSet)drawCape(c,tier(armor),time,rig.walk);
 for(const side of [-1,1]){const stride=rig.walking?side*rig.walk*.24:0;if(rig.kneeling)drawWorkLeg(c,rig,side,data);else if(!art?.paintLeg(c,data,side,stride))drawLeg(c,side,stride,0,time);}
 drawRigArm(c,rig.backArm,-1,data);
 // The neck overlaps both the jaw and the collar, including textured outfits.
 const collar=torsoPoint(rig.body,{x:0,y:-47}),jaw={x:rig.head.x-Math.sin(rig.head.angle)*15,y:rig.head.y+Math.cos(rig.head.angle)*15};line(c,collar.x,collar.y,jaw.x,jaw.y,SKIN_D,9);line(c,collar.x-1,collar.y,jaw.x-1,jaw.y,SKIN,6);
 c.save();c.translate(rig.body.x,rig.body.y);c.rotate(rig.body.angle);c.translate(0,23.5);if(!art?.paintBody(c,data,{time,walking:rig.walking,walk:rig.walk}))drawBody(c,0);c.restore();
 c.save();c.translate(rig.head.x,rig.head.y);c.rotate(rig.head.angle);c.translate(0,63);
 if(kit.armorSet){const bare=kit.armorSet==='ranged_1';c.save();c.translate(0,3);c.save();c.translate(0,-63);c.scale(bare?.84:.76,bare?.84:.76);c.translate(0,58);drawHead(c,0,time,rig.walk,!bare);c.restore();art?.paintHead(c,data);c.restore();}else drawHead(c,0,time,rig.walk);c.restore();
 drawRigArm(c,rig.frontArm,1,data);
 if(rig.activity){
  if(pose==='scavenge'){c.save();c.translate(-16,-1);c.scale(.55,.55);c.rotate(-Math.PI/2-.45);c.translate(0,-18);drawMattock(c);c.restore();}
  else{
  c.save();c.translate(rig.main.x,rig.main.y);c.rotate(rig.angle);c.translate(0,-18);
  if(pose==='mine')drawPickaxe(c);else if(pose==='smith')drawHammer(c);else if(pose==='wood')drawHatchet(c);else if(pose==='fletch')drawFletchingTool(c);else if(pose==='ward')drawWardTool(c,time);else if(pose==='rune')drawRuneTool(c,time);else if(pose==='polish')drawGemTool(c);else ellipse(c,0,18,5,5,'#8ad9ef');c.restore();
  }
 }else{
  const type=rig.weapon==='shield'?'sword':rig.weapon;
  if(!art?.paintWeapon(c,data,type,{x:rig.main.x,y:rig.main.y,angle:rig.angle})){c.save();c.translate(rig.main.x,rig.main.y-18);drawSword(c,kit.weapon,kit.enchant);c.restore();}
  if(rig.weapon==='shield')art?.paintWeapon(c,data,'shield',{x:rig.back.x-1,y:rig.back.y-2,angle:-.12});
  if(rig.weapon==='bow'){
   c.strokeStyle='#d5c7a6';c.lineWidth=.65;c.beginPath();c.moveTo(rig.bowUpper.x,rig.bowUpper.y);c.lineTo(rig.back.x,rig.back.y);c.lineTo(rig.bowLower.x,rig.bowLower.y);c.stroke();
   if(options.charge>.45&&((data.arrows||0)>0||(data.ammoCharges?.arrows||0)>0)){line(c,rig.back.x,rig.back.y,rig.arrowTip.x,rig.arrowTip.y,'#b7a077',1);c.save();c.translate(rig.arrowTip.x,rig.arrowTip.y);c.rotate(rig.angle);path(c,[0,0,-6,-2,-6,2],'#c9d4d1','',0);c.restore();}
  }
  if(rig.weapon==='staff'&&options.attack>0){c.save();c.globalAlpha=options.attack*.65;ellipse(c,rig.back.x,rig.back.y,5+rig.stroke*2,5+rig.stroke*2,'#a4cee2');c.restore();}
 }
 if(rig.activity||rig.weapon!=='shield')drawRigHand(c,rig.back,-rig.angle*.3);drawRigHand(c,rig.main,rig.angle*.3);
 c.restore();return kit;
}
global.DeepwellAvatar=Object.freeze({render,appearance,poseRig,tier,normalizeCustom,STYLE_COUNTS,COLOR_SETS,BASE,slots:Object.freeze(['head','chest','legs','boots','cape','mainHand','offHand','tool','aura'])});
})(window);

