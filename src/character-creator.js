
/* DEEPWELL / CHARACTER CREATOR v0.8
   UI is a front-end to the same saved modular rig the game uses.
   Provides no new gameplay progression; live choices persist via host callbacks.
*/
(function(global){
'use strict';
const $=id=>document.getElementById(id);
const A=global.DeepwellAvatar;
const LOOK_KEYS=['hair','eyes','chest','legs','boots','skin'];
const DEFINITIONS={
 hair:{name:'Hair',style:'hair',color:'hairColor',styles:['Adventurer','Side swept','Cropped','Windswept','Tousled','Topknot']},
 eyes:{name:'Eyes',style:'eyes',color:'eyeColor',styles:['Bright','Focused','Wide-eyed','Determined']},
 chest:{name:'Tunic',style:'chest',color:'chestColor',styles:['Classic tunic','Long vest','Traveler straps','Layered jacket']},
 legs:{name:'Trousers',style:'legs',color:'legsColor',styles:['Traveler','Bound','Reinforced']},
 boots:{name:'Boots',style:'boots',color:'bootsColor',styles:['Plain leather','High boots','Strapped','Explorer']},
 skin:{name:'Skin',style:null,color:'skinColor',styles:[]}
};
const PRESETS=[
 {name:'Original',desc:'The familiar adventurer',custom:A.BASE},
 {name:'Woodland',desc:'Forest scout',custom:{hair:3,eyes:1,chest:3,legs:1,boots:1,hairColor:'#a75f41',eyeColor:'#3f9d6e',chestColor:'#3f8c83',legsColor:'#4f765c',bootsColor:'#4e4243',skinColor:'#dba07e'}},
 {name:'Ember',desc:'Rugged wanderer',custom:{hair:4,eyes:3,chest:2,legs:2,boots:2,hairColor:'#3f3332',eyeColor:'#b78b42',chestColor:'#8d5b65',legsColor:'#484c57',bootsColor:'#65534c',skinColor:'#bc8068'}},
 {name:'Stargazer',desc:'Young spellblade',custom:{hair:1,eyes:2,chest:1,legs:0,boots:3,hairColor:'#d8d2b9',eyeColor:'#8564c1',chestColor:'#655a8f',legsColor:'#607c84',bootsColor:'#70718a',skinColor:'#f1cba9'}}
];
let api=null,active='hair',pose='idle',baseOnly=true,show=false,raf=0,previousFocus=null,previews=[];
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
function build(){
 const host=mk('div','wardrobe-backdrop');host.id='wardrobe';host.hidden=true;
 host.innerHTML=`<section class="wardrobe-dialog" role="dialog" aria-modal="true" aria-labelledby="wardrobeTitle" tabindex="-1">
  <header class="wardrobe-heading"><div><h2 id="wardrobeTitle">Appearance</h2></div><button type="button" class="wardrobe-close" id="wardrobeClose" aria-label="Close character creator">✕</button></header>
  <div class="wardrobe-body">
   <aside class="wardrobe-display"><div class="wardrobe-stage"><canvas id="wardrobeCanvas" aria-label="Live customized adventurer preview"></canvas><div class="wardrobe-stage-footer"><span id="wardrobeGearLabel">BASE OUTFIT</span></div></div><div class="wardrobe-view-controls"><label class="wardrobe-toggle"><input id="wardrobeBase" type="checkbox" checked> Show base outfit</label><div class="wardrobe-pose-group" role="group" aria-label="Character preview action"><button data-pose="idle" class="active">Idle</button><button data-pose="walk">Walk</button><button data-pose="attack">Attack</button><button data-pose="mine">Mine</button><button data-pose="smith">Smith</button></div></div></aside>
   <div class="wardrobe-options"><div class="wardrobe-block"><div class="wardrobe-block-head"><h3>Presets</h3></div><div class="wardrobe-presets" id="wardrobePresets"></div></div><div class="wardrobe-block"><div class="wardrobe-block-head"><h3>Details</h3><small id="wardrobeSelected">Hair</small></div><div class="wardrobe-tabs" id="wardrobeTabs" role="tablist" aria-label="Appearance category"></div><div class="wardrobe-choice-area"><div id="wardrobeStyleBlock"><div class="wardrobe-line"><strong id="wardrobeStyleTitle">Hair style</strong><span id="wardrobeStyleCount">1 of 6</span></div><div id="wardrobeStyles" class="wardrobe-styles"></div></div><div class="wardrobe-line color-heading"><strong id="wardrobeColorTitle">Hair color</strong></div><div class="wardrobe-swatches" id="wardrobeSwatches" aria-label="Color choices"></div></div></div><div class="wardrobe-actions"><button class="wardrobe-secondary" id="wardrobeRandom" type="button">✧ Randomize</button><button class="wardrobe-secondary" id="wardrobeReset" type="button">Reset look</button><button class="wardrobe-primary" id="wardrobeDone" type="button">Done ✓</button></div><div class="wardrobe-status" role="status" id="wardrobeStatus">Saved automatically</div></div>
  </div></section>`;
 document.body.append(host);
 $('wardrobeClose').onclick=close;$('wardrobeDone').onclick=close;
 host.addEventListener('pointerdown',e=>{if(e.target===host)close()});
 $('wardrobeBase').onchange=()=>{baseOnly=$('wardrobeBase').checked;updateGearLabel()};
 document.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{pose=b.dataset.pose;document.querySelectorAll('[data-pose]').forEach(x=>x.classList.toggle('active',x===b))});
 $('wardrobeRandom').onclick=()=>{const c={};for(const [k,v] of Object.entries(A.STYLE_COUNTS))c[k]=Math.floor(Math.random()*v);for(const [k,v] of Object.entries(A.COLOR_SETS))c[k]=v[Math.floor(Math.random()*v.length)];change(c);};
 $('wardrobeReset').onclick=()=>change({...A.BASE});
 const tabs=$('wardrobeTabs');for(const id of LOOK_KEYS){const b=mk('button','wardrobe-tab',DEFINITIONS[id].name);b.dataset.category=id;b.type='button';b.setAttribute('role','tab');b.onclick=()=>{active=id;updateControls()};tabs.append(b)}
 const presets=$('wardrobePresets');for(const [i,p] of PRESETS.entries()){const b=mk('button','wardrobe-preset');b.type='button';b.dataset.preset=i;b.innerHTML=`<span class="preset-thumbnail"><canvas width="62" height="72" aria-hidden="true"></canvas></span><span class="preset-name"></span>`;b.querySelector('.preset-name').textContent=p.name;b.setAttribute('aria-label',p.name+' preset — '+p.desc);b.onclick=()=>change({...A.BASE,...p.custom});presets.append(b)}
 updateControls();
}
function updateGearLabel(){$('wardrobeGearLabel').textContent=baseOnly?'Base outfit':'Equipped gear'}
function change(patch){if(!api)return;api.setAppearance(A.normalizeCustom({...api.getAppearance(),...patch}));updateControls();$('wardrobeStatus').textContent='✓ Saved';}
function updateControls(){if(!api)return;
 const look=api.getAppearance(),def=DEFINITIONS[active];
 $('wardrobeSelected').textContent=def.name;
 document.querySelectorAll('.wardrobe-tab').forEach(b=>{const ok=b.dataset.category===active;b.classList.toggle('active',ok);b.setAttribute('aria-selected',ok?'true':'false')});
 $('wardrobeStyleBlock').hidden=!def.style;
 const styles=$('wardrobeStyles');styles.replaceChildren();
 if(def.style){$('wardrobeStyleTitle').textContent=def.name+' style';$('wardrobeStyleCount').textContent=(look[def.style]+1)+' of '+def.styles.length;for(let i=0;i<def.styles.length;i++){const b=mk('button','wardrobe-style-option',def.styles[i]);b.type='button';b.classList.toggle('active',i===look[def.style]);b.setAttribute('aria-pressed',String(i===look[def.style]));b.onclick=()=>change({[def.style]:i});styles.append(b)}}
 $('wardrobeColorTitle').textContent=def.name+' color';const swatches=$('wardrobeSwatches');swatches.replaceChildren();
 A.COLOR_SETS[def.color].forEach((color,i)=>{const b=mk('button','wardrobe-swatch');b.type='button';b.style.setProperty('--swatch',color);b.classList.toggle('active',color===look[def.color]);b.setAttribute('aria-label',def.name+' color '+(i+1));b.setAttribute('aria-pressed',String(color===look[def.color]));b.onclick=()=>change({[def.color]:color});swatches.append(b)});
 document.querySelectorAll('.wardrobe-preset').forEach((el,i)=>{const test=A.normalizeCustom({...A.BASE,...PRESETS[i].custom});el.classList.toggle('active',Object.entries(test).every(([k,v])=>look[k]===v))});
}
function draw(t){if(!show)return;const canvas=$('wardrobeCanvas'),rect=canvas.getBoundingClientRect();if(rect.width<10){raf=requestAnimationFrame(draw);return}
 const pixelRatio=Math.min(2,window.devicePixelRatio||1),w=rect.width,h=rect.height;
 const pxW=Math.round(w*pixelRatio),pxH=Math.round(h*pixelRatio);
 if(canvas.width!==pxW||canvas.height!==pxH){canvas.width=pxW;canvas.height=pxH}
 const c=canvas.getContext('2d');c.setTransform(pxW/w,0,0,pxH/h,0,0);c.clearRect(0,0,w,h);
 // Subtle plinth and decorative lighting anchor the character without hiding gear.
 const glow=c.createRadialGradient(w*.5,h*.56,10,w*.5,h*.6,w*.7);glow.addColorStop(0,'#a5c0aa27');glow.addColorStop(1,'#15251a00');c.fillStyle=glow;c.fillRect(0,0,w,h);
 const anchorX=w*.5,anchorY=h*.88,scale=Math.min(w/110,h/105)*.89;
 c.fillStyle='#0b1119a0';c.beginPath();c.ellipse(anchorX,anchorY+6,w*.24,9,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#d9b97944';c.lineWidth=2;c.beginPath();c.ellipse(anchorX,anchorY+6,w*.29,13,0,0,Math.PI*2);c.stroke();
 const d=api.getGear(),gameData=baseOnly?{...d,weapon:0,armor:0,enchant:0}:d;
 A.render(c,{x:anchorX,y:anchorY,scale,time:t/1000,pose,attack:pose==='attack'?.38:0,action:(pose==='mine'||pose==='smith')?.45:0,vx:pose==='walk'?1:0,data:gameData});
 // Preset thumbnails use the same renderer and equipment-independent appearance.
 document.querySelectorAll('.wardrobe-preset').forEach((el,i)=>{const pc=el.querySelector('canvas'),q=pc.getContext('2d');q.clearRect(0,0,62,72);A.render(q,{x:31,y:70,scale:.72,time:t/1000,pose:'idle',data:{armor:0,weapon:0,enchant:0,custom:A.normalizeCustom(PRESETS[i].custom)}})});
 raf=requestAnimationFrame(draw);
}
function open(){if(!api)return;if(!$('wardrobe'))build();previousFocus=document.activeElement;show=true;active='hair';pose='idle';$('wardrobe').hidden=false;document.body.classList.add('wardrobe-open');$('wardrobeBase').checked=baseOnly;api.setEditing(true);updateControls();updateGearLabel();$('wardrobeStatus').textContent='Saved automatically';document.querySelector('[data-pose="idle"]').click();$('wardrobeClose').focus();cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
function close(){if(!show)return;show=false;$('wardrobe').hidden=true;document.body.classList.remove('wardrobe-open');cancelAnimationFrame(raf);api.setEditing(false);if(previousFocus?.focus)previousFocus.focus()}
window.addEventListener('keydown',e=>{if(!show)return;if(e.key==='Escape'){e.preventDefault();close();return}if(e.key==='Tab'){const focusable=[...$('wardrobe').querySelectorAll('button:not([disabled]),input:not([disabled])')];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}}},true);
function init(hostApi){api=hostApi;build();return {open,close,isOpen:()=>show}}
global.DeepwellCreator=Object.freeze({init,PRESETS});
})(window);

